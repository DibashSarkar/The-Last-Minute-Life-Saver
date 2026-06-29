"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  getTasks, 
  saveTask, 
  deleteTask, 
  getSettings, 
  saveSettings, 
  getTimeBlocks, 
  saveTimeBlocks,
  clearAllTimeBlocks,
  isSandboxMode,
  getCurrentUser,
  authLogout,
  getTokenConsumption,
  Task, 
  TimeBlock, 
  UserSettings 
} from "@/lib/firebase";
import { autoScheduleTasks, calculatePriorityScore } from "@/lib/priority";

// ─── Energy helpers ──────────────────────────────────────────────────────────
const ENERGY_CONFIG = {
  high:        { label: "⚡ I'm Energized",   color: "emerald", emoji: "⚡", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30", headerHue: "from-emerald-500/5" },
  medium:      { label: "😊 Feeling Okay",    color: "amber",   emoji: "😊", bg: "bg-amber-500/10",   text: "text-amber-600 dark:text-amber-400",   border: "border-amber-500/30",   headerHue: "from-amber-500/5"   },
  low:         { label: "😴 Low Energy",      color: "sky",     emoji: "😴", bg: "bg-sky-500/10",     text: "text-sky-600 dark:text-sky-400",       border: "border-sky-500/30",     headerHue: "from-sky-500/5"     },
  overwhelmed: { label: "😰 Overwhelmed",     color: "rose",    emoji: "😰", bg: "bg-rose-500/10",    text: "text-rose-600 dark:text-rose-400",     border: "border-rose-500/30",    headerHue: "from-rose-500/5"    },
} as const;

// ─── Priority badge helpers ───────────────────────────────────────────────────
function getPriorityLabel(score: number) {
  if (score > 120) return { label: "🔥 Do This First", bg: "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400" };
  if (score > 80)  return { label: "⚡ Do Soon",        bg: "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400" };
  return              { label: "📋 In Queue",           bg: "bg-muted border-border text-muted-foreground" };
}

function getEnergyBadge(energy: string) {
  if (energy === "high")   return { icon: "🔥", label: "High Energy",   cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
  if (energy === "medium") return { icon: "⚡", label: "Medium Energy", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
  return                          { icon: "🌿", label: "Easy Task",     cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
}

function humanDeadline(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "⚠️ Overdue";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `📅 in ${Math.floor(h / 24)} days`;
  if (h > 0)  return `⏳ in ${h}h ${m}m`;
  return `🚨 in ${m} minutes`;
}

// ─── Confetti burst (pure CSS/JS) ─────────────────────────────────────────────
function spawnConfetti(container: HTMLElement) {
  const colors = ["#f43f5e","#f59e0b","#10b981","#6366f1","#ec4899","#3b82f6"];
  for (let i = 0; i < 36; i++) {
    const dot = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 5;
    const x = Math.random() * 300 - 150;
    const y = Math.random() * -220 - 60;
    dot.style.cssText = `
      position:absolute;left:50%;top:50%;
      width:${size}px;height:${size}px;border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
      background:${color};pointer-events:none;z-index:9999;
      animation:confettiFly 1.2s ease-out forwards;
      --tx:${x}px;--ty:${y}px;--rot:${Math.random()*720}deg;
      animation-delay:${Math.random() * 0.15}s;
    `;
    container.appendChild(dot);
    setTimeout(() => dot.remove(), 1500);
  }
}

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Breathing states
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold (Full)" | "Exhale" | "Hold (Empty)">("Inhale");
  const [breathingSecs, setBreathingSecs] = useState(4);
  const [activityCount, setActivityCount] = useState(0);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    workingHours: { start: "09:00", end: "17:00" },
    currentEnergyState: "high",
    pomodoroConfig: { focusDuration: 25, breakDuration: 5 }
  });
  
  const [panicInput, setPanicInput] = useState("");
  const [isTriageLoading, setIsTriageLoading] = useState(false);
  const [scaffoldingLoadingId, setScaffoldingLoadingId] = useState<string | null>(null);
  const [isNegotiateLoading, setIsNegotiateLoading] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState<{ explanation: string; dropped: string[]; model: string } | null>(null);
  
  // Quick Manual Task States
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualDuration, setManualDuration] = useState(30);
  const [manualImportance, setManualImportance] = useState(true);
  const [manualUrgency, setManualUrgency] = useState(true);
  const [manualEnergy, setManualEnergy] = useState<"high" | "medium" | "low">("medium");
  const [manualDeadline, setManualDeadline] = useState("");
  const [manualDependencies, setManualDependencies] = useState<string[]>([]);
  const [isManualSaving, setIsManualSaving] = useState(false);

  const [sandbox, setSandbox] = useState(true);
  const [activityLogs, setActivityLogs] = useState<Array<{ time: string; label: string; icon: string }>>([]);
  const [activeMobileTab, setActiveMobileTab] = useState<"tasks" | "schedule">("tasks");
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Auth check & initial load
  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      if (!user.onboarded) {
        window.location.href = "/onboarding";
        return;
      }
      setCurrentUser(user);
      setLoadingUser(false);

      const ts = await getTasks();
      const bs = await getTimeBlocks();
      const st = await getSettings();
      setTasks(ts);
      setTimeBlocks(bs);
      setSettings(st);
      setSandbox(isSandboxMode());

      // Restore activity count from localStorage
      const stored = parseInt(localStorage.getItem("ls_activity_count") || "0");
      setActivityCount(stored);
    }
    checkAuthAndLoad();
  }, []);

  // Zen Breathing loop
  useEffect(() => {
    if (!showBreathing) return;
    const timer = setInterval(() => {
      setBreathingSecs(prev => {
        if (prev <= 1) {
          setBreathingPhase(current => {
            if (current === "Inhale") return "Hold (Full)";
            if (current === "Hold (Full)") return "Exhale";
            if (current === "Exhale") return "Hold (Empty)";
            return "Inhale";
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showBreathing]);

  const handleLogout = async () => {
    await authLogout();
    window.location.href = "/login";
  };

  const addActivity = (label: string, icon: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setActivityLogs(prev => [{ time, label, icon }, ...prev].slice(0, 8));
    const next = activityCount + 1;
    setActivityCount(next);
    localStorage.setItem("ls_activity_count", String(next));
  };

  // Run Panic Dump → AI Sort
  const handlePanicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panicInput.trim()) return;

    setIsTriageLoading(true);
    try {
      const response = await fetch("/api/panic-dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: panicInput }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
      setPanicInput("");
      
      const newBlocks = autoScheduleTasks(updatedTasks, settings);
      await clearAllTimeBlocks();
      await saveTimeBlocks(newBlocks);
      setTimeBlocks(newBlocks);

      addActivity("Sorted your tasks from your dump", "🧠");
    } catch (error) {
      console.error(error);
      alert("Something went wrong: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsTriageLoading(false);
    }
  };

  // Toggle Task Complete
  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === "completed" ? "pending" : "completed";
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
    await saveTask(task);

    if (newStatus === "completed") {
      setJustCompletedId(taskId);
      if (confettiRef.current) spawnConfetti(confettiRef.current);
      addActivity(`Completed "${task.title}"`, "🎉");
      setTimeout(() => setJustCompletedId(null), 2000);
    }

    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
    const newBlocks = autoScheduleTasks(updatedTasks, settings);
    await clearAllTimeBlocks();
    await saveTimeBlocks(newBlocks);
    setTimeBlocks(newBlocks);
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    const currentBlocks = await getTimeBlocks();
    const updatedBlocks = currentBlocks.filter(b => b.taskId !== taskId);
    await clearAllTimeBlocks();
    await saveTimeBlocks(updatedBlocks);
    setTasks(await getTasks());
    setTimeBlocks(updatedBlocks);
  };

  // Handle Energy State Change
  const handleEnergyChange = async (energy: UserSettings["currentEnergyState"]) => {
    const updatedSettings = await saveSettings({ currentEnergyState: energy });
    setSettings(updatedSettings);

    const ts = await getTasks();
    const newBlocks = autoScheduleTasks(ts, updatedSettings);
    await clearAllTimeBlocks();
    await saveTimeBlocks(newBlocks);
    setTimeBlocks(newBlocks);
    
    addActivity("Updated your energy level", ENERGY_CONFIG[energy].emoji);
  };

  // Head Start Pre-Research
  const handlePreResearch = async (taskId: string) => {
    setScaffoldingLoadingId(taskId);
    try {
      const response = await fetch("/api/pre-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setTasks(await getTasks());
      addActivity("Got you a head start on a task", "🚀");
    } catch (error) {
      console.error(error);
      alert("Couldn't get your head start. Try again!");
    } finally {
      setScaffoldingLoadingId(null);
    }
  };

  // Auto-Reschedule
  const handleAutoNegotiate = async (blockId: string) => {
    setIsNegotiateLoading(true);
    setNegotiationResult(null);
    try {
      const response = await fetch("/api/auto-negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missedBlockId: blockId }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setTimeBlocks(await getTimeBlocks());
      setNegotiationResult({
        explanation: data.explanation,
        dropped: data.droppedTitles || [],
        model: data.modelUsed
      });
      addActivity("Rescheduled your missed slot", "🔁");
    } catch (error) {
      console.error(error);
      alert("Couldn't reschedule. Please try again.");
    } finally {
      setIsNegotiateLoading(false);
    }
  };

  // Set default deadline
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setManualDeadline(tomorrow.toISOString().split("T")[0]);
  }, []);

  const handleManualTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    setIsManualSaving(true);
    try {
      const deadlineISO = manualDeadline 
        ? new Date(manualDeadline).toISOString() 
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const newTask: Task = {
        id: `task_${Date.now()}`,
        title: manualTitle,
        description: manualDesc,
        importance: manualImportance,
        urgency: manualUrgency,
        priorityScore: 0,
        status: "pending",
        estimatedDuration: Number(manualDuration) || 30,
        actualDuration: 0,
        deadline: deadlineISO,
        energyRequired: manualEnergy,
        dependencies: manualDependencies,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveTask(newTask);
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
      const newBlocks = autoScheduleTasks(updatedTasks, settings);
      await clearAllTimeBlocks();
      await saveTimeBlocks(newBlocks);
      setTimeBlocks(newBlocks);

      setManualTitle("");
      setManualDesc("");
      setManualDuration(30);
      setManualImportance(true);
      setManualUrgency(true);
      setManualEnergy("medium");
      setManualDependencies([]);
      setShowManualForm(false);

      addActivity(`Added "${newTask.title}" manually`, "➕");
    } catch (error) {
      console.error(error);
      alert("Failed to save task. Please try again.");
    } finally {
      setIsManualSaving(false);
    }
  };

  const isBlockMissed = (block: TimeBlock) => {
    if (block.isCompleted) return false;
    return new Date(block.startTime).getTime() < Date.now();
  };

  const missedBlock = timeBlocks.find(b => isBlockMissed(b));

  // Derived: top priority task for "Do This Now" CTA
  const topTask = tasks
    .filter(t => t.status !== "completed")
    .map(t => ({ ...t, score: calculatePriorityScore(t, tasks) }))
    .sort((a, b) => b.score - a.score)[0];

  // Panic-o-Meter score (0–100)
  const panicScore = Math.min(100, Math.round(
    tasks.filter(t => t.status !== "completed").length * 8 +
    (missedBlock ? 30 : 0) +
    (settings.currentEnergyState === "overwhelmed" ? 20 : 0)
  ));
  const panicColor = panicScore > 70 ? "text-rose-500" : panicScore > 40 ? "text-amber-500" : "text-emerald-500";
  const panicBg    = panicScore > 70 ? "bg-rose-500"   : panicScore > 40 ? "bg-amber-500"   : "bg-emerald-500";

  const energyCfg = ENERGY_CONFIG[settings.currentEnergyState];

  if (loadingUser) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center text-muted-foreground font-sans">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
          <span className="text-sm font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white pb-12 transition-colors duration-300">
      {/* Confetti container */}
      <div ref={confettiRef} className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" />

      {/* Sandbox Banner */}
      {sandbox && (
        <div className="bg-card border-b border-primary/20 text-primary text-[10px] py-2 px-4 text-center backdrop-blur-md flex items-center justify-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span>🧪 <strong>Demo Mode:</strong> Everything is saved locally in your browser. No account needed to test.</span>
        </div>
      )}

      {/* ── Header (Mood Ring) ── */}
      <header className="border-b border-border bg-background backdrop-blur-md sticky top-0 z-40 p-3 flex items-center justify-between transition-all duration-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 text-lg">
            🚨
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              Your Rescue HQ
              <span className="text-[10px] font-normal px-2 py-0.5 bg-muted border border-border text-muted-foreground rounded-md">
                {currentUser?.displayName || currentUser?.email}
              </span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium">Let's tackle your day, one step at a time</p>
          </div>
        </div>



        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3 font-medium">
          {/* Feeling toggle in words in one line */}
          <div className="flex items-center gap-1.5 bg-muted border border-border px-2.5 py-1.5 rounded-md text-[10px]">
            <span className="font-bold text-muted-foreground uppercase mr-1 hidden sm:inline-block">Energy:</span>
            {[
              { state: "overwhelmed" as const, label: "😰 Overwhelmed" },
              { state: "low" as const, label: "😴 Low" },
              { state: "medium" as const, label: "😊 Medium" },
              { state: "high" as const, label: "⚡ High" }
            ].map((cfg) => (
              <button
                key={cfg.state}
                onClick={() => {
                  if (cfg.state === "overwhelmed") setShowBreathing(true);
                  handleEnergyChange(cfg.state);
                }}
                className={`px-2 py-0.5 rounded-sm font-bold transition-all cursor-pointer ${
                  settings.currentEnergyState === cfg.state
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cfg.label.split(" ")[1]}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowBreathing(true)}
            className="bg-card hover:bg-card border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-2 rounded-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
            title="Take a calming breath"
          >
            🌿 <span className="hidden sm:inline">Take a Breath</span>
          </button>

          <a
            href="/dashboard/focus"
            className="hidden sm:flex bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-md shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            Focus Mode
          </a>


        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden border-b border-border bg-background sticky top-[73px] z-30 px-6 py-1">
        <button
          onClick={() => setActiveMobileTab("tasks")}
          className={`flex-1 text-center py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeMobileTab === "tasks" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
          }`}
        >
          📋 My Tasks
        </button>
        <button
          onClick={() => setActiveMobileTab("schedule")}
          className={`flex-1 text-center py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeMobileTab === "schedule" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
          }`}
        >
          📅 Today's Plan
        </button>
      </div>

      {/* ── "Do This NOW" top banner ── */}
      {topTask && (
        <div className="max-w-full mx-auto w-full px-0 md:px-6 mt-0 md:mt-6">
          <a
            href="/dashboard/focus"
            className="w-full flex items-center justify-between gap-4 bg-card border-y md:border border-border rounded-none md:rounded-md p-3 hover:bg-muted transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Start with this right now →</p>
                <p className="text-sm font-bold text-foreground">{topTask.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">{humanDeadline(topTask.deadline)}</span>
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-md group-hover:bg-primary/90 transition-colors">
                Enter Focus Mode ▶
              </span>
            </div>
          </a>
        </div>
      )}

      {/* ── Main Layout ── */}
      <main className="max-w-full mx-auto w-full px-0 md:px-6 grid grid-cols-1 lg:grid-cols-5 gap-0 md:gap-4 mt-0 md:mt-6">
        
        {/* Left Column: Tasks */}
        <div className={`lg:col-span-3 space-y-8 ${activeMobileTab === "tasks" ? "block" : "hidden md:block"}`}>

          {/* ── PANIC-O-METER ── */}
          <section className="bg-card border border-border rounded-md p-3 shadow-sm flex items-center gap-5">
            <div className="flex flex-col items-center shrink-0">
              <span className="text-3xl font-black tabular-nums leading-none" style={{ color: panicScore > 70 ? "#f43f5e" : panicScore > 40 ? "#f59e0b" : "#10b981" }}>
                {panicScore}
              </span>
              <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider mt-0.5">Stress Level</span>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {panicScore > 70 ? "🚨 High Stress — AI is ready to help!" : panicScore > 40 ? "⚡ Moderate — Keep pushing!" : "✅ Looking Good — Great work!"}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">{tasks.filter(t => t.status !== "completed").length} tasks left</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${panicBg}`}
                  style={{ width: `${panicScore}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {panicScore > 70 ? "Dump everything below — let the AI sort it out for you." : panicScore > 40 ? "You're managing well. Focus on the top task." : "All clear! Add new tasks or jump into Focus Mode."}
              </p>
            </div>
          </section>

          {/* ── Panic Dump Box ── */}
          <section className="bg-card border border-border rounded-md p-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-md bg-card flex items-center justify-center text-lg shrink-0">😤</div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Dump Everything Here</h2>
                <p className="text-[10px] text-muted-foreground">Write everything that's stressing you out. AI will sort it into tasks automatically.</p>
              </div>
            </div>

            <form onSubmit={handlePanicSubmit} className="space-y-4">
              <textarea
                value={panicInput}
                onChange={(e) => setPanicInput(e.target.value)}
                placeholder="Example: 'I have a presentation due tomorrow at 10am, haven't started the slides yet, and I also need to reply to 3 client emails and book flights for next week...'"
                rows={4}
                className="w-full bg-background border border-border rounded-md p-4 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-all font-sans resize-none"
              />
              
              {/* Quick scenario starters */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block">Try a scenario:</span>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "📅 Big Meeting Tomorrow", text: "I have a big presentation to the executive board tomorrow at 10 AM. I need to design 15 slides, compile the monthly marketing stats, and dry run my speech at least twice. I haven't started slide design yet." },
                    { label: "🚀 Launch Going Wrong",   text: "The web application deployment is scheduled for tonight at 11 PM. However, the database migrations are failing, I need to rewrite the production seed script, write a status message to the DevOps slack group, and double check env credentials." },
                    { label: "📝 Essay Due Tonight",   text: "My final research paper is due in exactly 8 hours. I need to outline 4 key sections, find 3 peer-reviewed citations on Google Scholar, write 2,500 words, and verify formatting." }
                  ].map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPanicInput(tmpl.text)}
                      className="text-[9px] font-semibold bg-muted hover:bg-muted-foreground/10 border border-border text-muted-foreground px-2 py-1 rounded-md transition-all active:scale-[0.98] cursor-pointer"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isTriageLoading || !panicInput.trim()}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm py-3.5 rounded-md shadow-lg shadow-primary/10 disabled:opacity-40 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
              >
                {isTriageLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>AI is sorting your tasks... hold on</span>
                  </>
                ) : (
                  <>
                    <span>🧠</span>
                    <span>Let AI Sort My Chaos</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* ── Manual Task Adder ── */}
          <section className="bg-card border border-border rounded-md p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-card flex items-center justify-center text-lg shrink-0">➕</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Add a Task Manually</h2>
                  <p className="text-[10px] text-muted-foreground">Know exactly what you need to do? Add it directly.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
              >
                {showManualForm ? "Hide ▲" : "Add Task ▼"}
              </button>
            </div>

            {showManualForm && (
              <form onSubmit={handleManualTaskSubmit} className="space-y-4 mt-6 text-xs animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-muted-foreground font-semibold">What do you need to do? *</label>
                    <input
                      type="text"
                      required
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-medium"
                      placeholder="e.g. Write slide outline for Monday meeting"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-muted-foreground font-semibold">Any extra details? (optional)</label>
                    <textarea
                      value={manualDesc}
                      onChange={(e) => setManualDesc(e.target.value)}
                      className="w-full bg-background border border-border rounded-md p-3.5 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-medium font-sans resize-none"
                      placeholder="Add notes, links, or context here..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted-foreground font-semibold">How long will it take? (minutes)</label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="480"
                      value={manualDuration}
                      onChange={(e) => setManualDuration(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground font-medium text-center focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted-foreground font-semibold">When is it due?</label>
                    <input
                      type="date"
                      required
                      value={manualDeadline}
                      onChange={(e) => setManualDeadline(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground font-medium text-center focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted-foreground font-semibold">How much effort does it need?</label>
                    <select
                      value={manualEnergy}
                      onChange={(e) => setManualEnergy(e.target.value as any)}
                      className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                      <option value="high">🔥 A lot — needs full brain power</option>
                      <option value="medium">⚡ Some — normal focus needed</option>
                      <option value="low">🌿 Easy — can do half-asleep</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <label className="flex items-center gap-2 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={manualImportance}
                        onChange={(e) => setManualImportance(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                      <span>⭐ Matters a lot</span>
                    </label>
                    <label className="flex items-center gap-2 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={manualUrgency}
                        onChange={(e) => setManualUrgency(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                      <span>⏰ Time-sensitive</span>
                    </label>
                  </div>
                </div>

                {/* Prerequisite Tasks */}
                {tasks.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-muted-foreground font-semibold">Does this depend on finishing another task first? (optional)</label>
                    <div className="flex gap-2 flex-wrap max-h-[100px] overflow-y-auto border border-border rounded-md p-3 bg-background">
                      {tasks.map(t => {
                        const isSelected = manualDependencies.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setManualDependencies(manualDependencies.filter(id => id !== t.id));
                              } else {
                                setManualDependencies([...manualDependencies, t.id]);
                              }
                            }}
                            className={`text-[9px] font-semibold px-2 py-1 rounded-md border transition-all active:scale-[0.97] cursor-pointer ${
                              isSelected 
                                ? "bg-card border-primary text-primary" 
                                : "bg-muted border-border text-muted-foreground"
                            }`}
                          >
                            {t.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isManualSaving || !manualTitle.trim()}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 rounded-md transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  {isManualSaving ? "Saving..." : "➕ Add to My Task List"}
                </button>
              </form>
            )}
          </section>

          {/* ── Task List ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-violet-500/15 flex items-center justify-center text-base">📋</div>
                <h2 className="text-sm font-bold text-foreground">
                  Your Tasks
                  <span className="ml-2 text-xs text-muted-foreground font-medium">({tasks.length} total, AI-ranked by urgency)</span>
                </h2>
              </div>
              {settings.currentEnergyState === "overwhelmed" && (
                <span className="text-[10px] bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 font-medium px-2.5 py-0.5 rounded-md animate-pulse">
                  Showing only easy tasks
                </span>
              )}
            </div>

            {tasks.length === 0 ? (
              <div className="border border-dashed border-border rounded-md py-16 px-6 text-center text-muted-foreground/60 text-sm bg-card space-y-3">
                <div className="text-4xl">🌟</div>
                <p className="font-medium">No tasks yet! Dump your overwhelmed thoughts above and let AI sort them out.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {tasks
                  .map(t => ({ ...t, score: calculatePriorityScore(t, tasks) }))
                  .sort((a, b) => b.score - a.score)
                  .map((task) => {
                    const priorityBadge = getPriorityLabel(task.score);
                    const energyBadge = getEnergyBadge(task.energyRequired);
                    const isJustCompleted = justCompletedId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`border bg-card rounded-md p-5 transition-all duration-300 flex items-start justify-between gap-4 shadow-sm relative overflow-hidden ${
                          isJustCompleted
                            ? "border-emerald-500/60 bg-emerald-500/5 scale-[1.01]"
                            : task.status === "completed"
                            ? "border-border/40 opacity-55 shadow-none"
                            : "border-border hover:border-border/80 hover:shadow-md"
                        }`}
                      >
                        {isJustCompleted && (
                          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none animate-pulse rounded-md" />
                        )}
                        <div className="flex items-start gap-4 flex-1">
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 transition-all shrink-0 ${
                              task.status === "completed"
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-border hover:border-emerald-500/60 bg-background hover:bg-emerald-500/5"
                            }`}
                            title={task.status === "completed" ? "Mark as not done" : "Mark as done ✓"}
                          >
                            {task.status === "completed" && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`text-sm font-semibold ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {task.title}
                              </h3>
                              
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${priorityBadge.bg}`}>
                                {priorityBadge.label}
                              </span>

                              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${energyBadge.cls}`}>
                                {energyBadge.icon} {energyBadge.label}
                              </span>

                              {task.scaffolding?.status === "completed" && (
                                <span className="text-[9px] bg-card border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  🚀 Head Start Ready
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                              {task.description}
                            </p>

                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60 flex-wrap">
                              <span className="flex items-center gap-1 font-medium">
                                ⏱️ ~{task.estimatedDuration} mins
                              </span>
                              <span className={`flex items-center gap-1 font-semibold ${task.status !== "completed" ? "text-muted-foreground" : ""}`}>
                                {humanDeadline(task.deadline)}
                              </span>
                              {task.dependencies.length > 0 && (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  🔗 Waiting on {task.dependencies.length} other task(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {task.status !== "completed" && !task.scaffolding && (
                            <button
                              onClick={() => handlePreResearch(task.id)}
                              disabled={scaffoldingLoadingId !== null}
                              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 border-0 text-white text-[10px] font-bold px-3 py-2 rounded-md active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
                              title="Get a head start with AI research"
                            >
                              {scaffoldingLoadingId === task.id ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                                  Working...
                                </>
                              ) : (
                                <>🚀 Head Start</>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 transition-all active:scale-95 cursor-pointer"
                            title="Remove task"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Schedule & Activity */}
        <div className={`lg:col-span-2 space-y-8 ${activeMobileTab === "schedule" ? "block" : "hidden md:block"}`}>
          
          {/* Today's Plan (Timeline) */}
          <section className="bg-card border border-border rounded-md p-4 shadow-xl flex flex-col min-h-[400px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-md bg-emerald-500/15 flex items-center justify-center text-lg shrink-0">📅</div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Today's Plan</h2>
                <p className="text-[10px] text-muted-foreground">AI built your schedule automatically</p>
              </div>
            </div>

            {/* Missed Slot Alert */}
            {missedBlock && (
              <div className="bg-rose-500/10 border border-rose-500/25 rounded-md p-5 text-xs space-y-3 mb-4 shadow-lg shadow-rose-500/5 text-left">
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-bold">
                  <span className="flex items-center gap-2">⏰ You Missed a Time Slot</span>
                  <span className="text-[9px] bg-card px-2 py-0.5 rounded-full border border-rose-500/30">OVERDUE</span>
                </div>
                <p className="text-rose-600/80 dark:text-rose-300 leading-relaxed">
                  Your slot for <strong>"{missedBlock.title}"</strong> has passed. Want me to rearrange your whole day to fix this?
                </p>
                <button
                  onClick={() => handleAutoNegotiate(missedBlock.id)}
                  disabled={isNegotiateLoading}
                  className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-rose-500/50 text-white font-bold py-2.5 rounded-md text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isNegotiateLoading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Figuring out your new plan...</span>
                    </>
                  ) : (
                    <span>🔁 Reschedule Everything for Me</span>
                  )}
                </button>
              </div>
            )}

            {/* Negotiation Result */}
            {negotiationResult && (
              <div className="bg-card border border-border rounded-md p-4 text-xs space-y-2 mb-4 animate-fade-in relative text-left">
                <button 
                  onClick={() => setNegotiationResult(null)} 
                  className="absolute top-2.5 right-3 text-muted-foreground hover:text-foreground text-[10px] font-semibold"
                >✕</button>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  ✅ All Done! Your day is rescheduled.
                </div>
                <p className="text-muted-foreground leading-relaxed">{negotiationResult.explanation}</p>
                {negotiationResult.dropped.length > 0 && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    📤 Moved to another day: {negotiationResult.dropped.join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* Time Blocks */}
            <div className="flex-1 space-y-3">
              {timeBlocks.length === 0 ? (
                <div className="h-full border border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground/60 text-xs py-12 text-center bg-card shadow-inner space-y-2">
                  <span className="text-3xl">🗓️</span>
                  <p>No schedule yet. Add tasks above and AI will build your day!</p>
                </div>
              ) : (
                timeBlocks
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.endTime).getTime())
                  .map((block) => {
                    const isLate = isBlockMissed(block);
                    return (
                      <div
                        key={block.id}
                        className={`border rounded-md p-4 flex flex-col gap-1.5 transition-all text-left shadow-sm ${
                          block.isCompleted
                            ? "bg-muted border-border/40 opacity-45 shadow-none"
                            : isLate
                            ? "bg-rose-500/10 border-rose-500/30"
                            : "bg-card border-border hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-muted-foreground/80 tracking-wider">
                            🕐 {new Date(block.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(block.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {block.isCompleted ? (
                            <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">✓ Done</span>
                          ) : isLate ? (
                            <span className="text-[9px] bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded animate-pulse">⏰ Overdue</span>
                          ) : (
                            <span className="text-[9px] bg-card border border-primary/20 text-primary font-medium px-2 py-0.5 rounded">Scheduled</span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${block.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {block.title}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </section>

          {/* ── App Activity Panel ── */}
          <section className="bg-card border border-border rounded-md p-4 shadow-xl text-left space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-violet-500/15 flex items-center justify-center text-base shrink-0">⚙️</div>
                <div>
                  <h2 className="text-xs font-bold text-foreground">App Activity</h2>
                  <p className="text-[9px] text-muted-foreground">What your AI has done for you</p>
                </div>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/15 p-3.5 rounded-md space-y-1 text-center">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{activityCount}</div>
                <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">AI Actions Today</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 p-3.5 rounded-md space-y-1 text-center">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {tasks.filter(t => t.status === "completed").length}
                </div>
                <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">Tasks Completed</div>
              </div>
            </div>

            {/* Activity log */}
            <div className="space-y-2">
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Recent actions:</div>
              {activityLogs.length === 0 ? (
                <div className="text-[10px] text-muted-foreground/60 italic py-2">
                  Nothing yet — use the features above and they'll appear here!
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {activityLogs.map((log, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[11px] border-b border-border/40 pb-2">
                      <span className="text-base shrink-0">{log.icon}</span>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">{log.label}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground/60 shrink-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ── Breathing Modal ── */}
      {showBreathing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-card border border-border rounded-[2.5rem] p-4 max-w-md w-full shadow-2xl space-y-6 text-center relative overflow-hidden">
            <button
              onClick={() => setShowBreathing(false)}
              className="absolute top-4 right-5 text-muted-foreground hover:text-foreground text-xs font-semibold hover:bg-muted p-1.5 rounded-full transition-all cursor-pointer"
            >✕</button>
            
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest font-semibold uppercase text-indigo-500 bg-card px-3 py-1 rounded-full">
                🌿 Take a Moment for Yourself
              </span>
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground mt-2">Take a Breath</h2>
              <p className="text-[10px] text-muted-foreground leading-normal">A 16-second calm-down exercise. Follow the circle.</p>
            </div>

            {/* Breathing circle */}
            <div className="h-44 w-44 rounded-full border border-indigo-500/25 bg-background flex flex-col items-center justify-center mx-auto shadow-inner relative overflow-hidden">
              <div 
                className={`absolute rounded-full transition-all duration-[4000ms] ease-in-out ${
                  breathingPhase === "Inhale"
                    ? "h-36 w-36 border-border scale-125 shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                    : breathingPhase === "Hold (Full)"
                    ? "h-36 w-36 bg-indigo-500/50 scale-125 shadow-[0_0_40px_rgba(99,102,241,0.6)]"
                    : breathingPhase === "Exhale"
                    ? "h-24 w-24 bg-card scale-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "h-24 w-24 bg-emerald-500/5 scale-100"
                }`}
              />
              <div className="z-10 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  {breathingPhase === "Inhale" ? "Breathe In" : breathingPhase === "Hold (Full)" ? "Hold" : breathingPhase === "Exhale" ? "Breathe Out" : "Hold"}
                </span>
                <span className="text-4xl font-extrabold tracking-tight tabular-nums text-foreground mt-1">{breathingSecs}s</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[8px] font-bold uppercase tracking-wider text-center">
              <div className={`p-2 rounded-lg border ${breathingPhase === "Inhale" ? "bg-card border-indigo-500 text-indigo-500" : "bg-muted border-transparent text-muted-foreground"}`}>In</div>
              <div className={`p-2 rounded-lg border ${breathingPhase === "Hold (Full)" ? "bg-card border-indigo-500 text-indigo-500" : "bg-muted border-transparent text-muted-foreground"}`}>Hold</div>
              <div className={`p-2 rounded-lg border ${breathingPhase === "Exhale" ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-muted border-transparent text-muted-foreground"}`}>Out</div>
              <div className={`p-2 rounded-lg border ${breathingPhase === "Hold (Empty)" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600" : "bg-muted border-transparent text-muted-foreground"}`}>Hold</div>
            </div>

            <button
              onClick={() => setShowBreathing(false)}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-bold py-3.5 rounded-md shadow-lg shadow-primary/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              ✅ I'm Ready to Tackle My Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
