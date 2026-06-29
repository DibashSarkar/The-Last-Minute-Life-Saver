"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  getTasks, 
  saveTask, 
  getTimeBlocks, 
  saveTimeBlocks, 
  clearAllTimeBlocks, 
  getSettings,
  getCurrentUser,
  saveCommunicationLog,
  Task, 
  TimeBlock 
} from "@/lib/firebase";

// ─── Encouragement messages ──────────────────────────────────────────────────
const ENCOURAGE = [
  "🌟 Amazing! Keep that momentum!",
  "🔥 You're on fire! One step closer!",
  "💪 That's the spirit! You've got this!",
  "✨ Brilliant! Progress feels good, right?",
  "🚀 You're flying! Almost there!",
  "🎯 Bull's-eye! Stay focused!",
  "🌈 Wonderful! Keep going!",
];

// ─── Ambient Sound Engine (Web Audio API) ────────────────────────────────────
type SoundType = "none" | "rain" | "cafe" | "forest";

function createAmbientSound(ctx: AudioContext, type: SoundType): AudioNode | null {
  if (type === "none") return null;

  const bufferSize = 4096;
  const noise = ctx.createScriptProcessor(bufferSize, 1, 1);
  noise.onaudioprocess = (e) => {
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  };

  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  gain.gain.value = 0.06;

  if (type === "rain") {
    filter.type = "bandpass";
    filter.frequency.value = 600;
    filter.Q.value = 0.4;
  } else if (type === "cafe") {
    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.Q.value = 0.8;
    gain.gain.value = 0.04;
  } else if (type === "forest") {
    filter.type = "bandpass";
    filter.frequency.value = 300;
    filter.Q.value = 0.5;
    gain.gain.value = 0.035;
  }

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  return gain;
}

export default function FocusMode() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Timer states
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sub-steps & tracking
  const [subSteps, setSubSteps] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);
  
  const [runningBehind, setRunningBehind] = useState<{ shiftMinutes: number } | null>(null);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const encourageTimer = useRef<NodeJS.Timeout | null>(null);

  // Ambient Sound
  const [soundType, setSoundType] = useState<SoundType>("none");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<AudioNode | null>(null);

  // Crisis Communication
  const [stakeholder, setStakeholder] = useState("Client");
  const [disposition, setDisposition] = useState("Critical & Strict");
  const [communicationDraft, setCommunicationDraft] = useState<string | null>(null);
  const [isGeneratingComm, setIsGeneratingComm] = useState(false);
  const [isCommSent, setIsCommSent] = useState(false);
  const [commModel, setCommModel] = useState("");
  
  // Stuck helper
  const [stepSuggestions, setStepSuggestions] = useState<Record<string, { text: string; loading: boolean }>>({});

  // Check-in toast
  const [showCheckin, setShowCheckin] = useState(false);
  const checkinRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) { window.location.href = "/login"; return; }
      setCurrentUser(user);
      setLoadingUser(false);

      const ts = await getTasks();
      const bs = await getTimeBlocks();
      const settings = await getSettings();
      setTasks(ts);
      setTimeBlocks(bs);
      
      const sortedPending = ts
        .filter(t => t.status !== "completed")
        .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

      if (sortedPending.length > 0) {
        const currentTask = sortedPending[0];
        setActiveTask(currentTask);
        setTimerMinutes(settings.pomodoroConfig?.focusDuration || 25);
        
        setSubSteps([
          { id: "step_1", text: "Set your goal — what does 'done' look like?", completed: false },
          { id: "step_2", text: "Do the first small thing to get started", completed: false },
          { id: "step_3", text: "Review and improve your work", completed: false },
          { id: "step_4", text: "Final check — is it ready?", completed: false }
        ]);
      }
    }
    checkAuthAndLoad();
  }, []);

  // Toggle between focus and break modes
  const toggleTimerMode = async () => {
    const settings = await getSettings();
    if (timerMode === "focus") {
      setTimerMode("break");
      setTimerMinutes(settings.pomodoroConfig?.breakDuration || 5);
    } else {
      setTimerMode("focus");
      setTimerMinutes(settings.pomodoroConfig?.focusDuration || 25);
    }
    setTimerSeconds(0);
  };

  // Timer loop
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(prev => prev - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(prev => prev - 1);
          setTimerSeconds(59);
        } else {
          clearInterval(timerRef.current!);
          setIsTimerRunning(false);
          alert(timerMode === "focus" ? "Time's up! Great focus session. Take a short break." : "Break over! Ready to dive back in?");
          toggleTimerMode();
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning, timerMinutes, timerSeconds, timerMode]);

  // Elapsed seconds counter
  useEffect(() => {
    if (isTimerRunning && timerMode === "focus") {
      if (!startTime) setStartTime(Date.now());
      elapsedRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    } else {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    }
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [isTimerRunning, timerMode, startTime]);

  // 10-minute check-in
  useEffect(() => {
    if (isTimerRunning && timerMode === "focus") {
      checkinRef.current = setInterval(() => setShowCheckin(true), 10 * 60 * 1000);
    } else {
      if (checkinRef.current) clearInterval(checkinRef.current);
    }
    return () => { if (checkinRef.current) clearInterval(checkinRef.current); };
  }, [isTimerRunning, timerMode]);

  // Ambient sound control
  useEffect(() => {
    // Stop existing sound
    if (soundNodeRef.current && audioCtxRef.current) {
      try { (soundNodeRef.current as GainNode).gain.setValueAtTime(0, audioCtxRef.current.currentTime); } catch {}
      soundNodeRef.current = null;
    }

    if (soundType !== "none") {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      soundNodeRef.current = createAmbientSound(ctx, soundType);
    }

    return () => {
      if (soundNodeRef.current && audioCtxRef.current) {
        try { (soundNodeRef.current as GainNode).gain.setValueAtTime(0, audioCtxRef.current.currentTime); } catch {}
      }
    };
  }, [soundType]);


  const handleStartPause = () => setIsTimerRunning(!isTimerRunning);

  const handleReset = async () => {
    setIsTimerRunning(false);
    const settings = await getSettings();
    setTimerMinutes(settings.pomodoroConfig?.focusDuration || 25);
    setTimerSeconds(0);
    setElapsedSeconds(0);
    setStartTime(null);
    setRunningBehind(null);
  };

  const handleToggleSubStep = (stepId: string) => {
    const updated = subSteps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
    setSubSteps(updated);

    const justCompleted = updated.find(s => s.id === stepId)?.completed;
    if (justCompleted) {
      // Show encouragement
      const msg = ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)];
      setEncouragement(msg);
      if (encourageTimer.current) clearTimeout(encourageTimer.current);
      encourageTimer.current = setTimeout(() => setEncouragement(null), 3000);

      // Velocity check
      if (activeTask) {
        const completedCount = updated.filter(s => s.completed).length;
        if (completedCount > 0 && elapsedSeconds > 30) {
          const expectedProgress = completedCount / updated.length;
          const totalEstimatedDuration = activeTask.estimatedDuration || 60;
          const actualElapsedMinutes = elapsedSeconds / 60;
          const velocity = actualElapsedMinutes / (expectedProgress * totalEstimatedDuration);
          
          if (velocity > 1.15) {
            const expectedDuration = totalEstimatedDuration * velocity;
            const shiftMinutes = Math.ceil(expectedDuration - totalEstimatedDuration);
            setRunningBehind({ shiftMinutes });
          } else {
            setRunningBehind(null);
          }
        }
      }
    }
  };

  const handleCompleteActiveTask = async () => {
    if (!activeTask) return;
    activeTask.status = "completed";
    activeTask.actualDuration = Math.ceil(elapsedSeconds / 60) || 5;
    activeTask.updatedAt = new Date().toISOString();
    await saveTask(activeTask);
    const updatedBlocks = timeBlocks.filter(b => b.taskId !== activeTask.id);
    await clearAllTimeBlocks();
    await saveTimeBlocks(updatedBlocks);
    alert(`🎉 Amazing work! "${activeTask.title}" is done! Going back to your task list.`);
    window.location.href = "/dashboard";
  };

  const handleGenerateCrisisCommunication = async () => {
    if (!activeTask) return;
    setIsGeneratingComm(true);
    setCommunicationDraft(null);
    setIsCommSent(false);
    try {
      const response = await fetch("/api/crisis-communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: activeTask.id, stakeholderType: stakeholder, disposition }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setCommunicationDraft(data.draft);
      setCommModel(data.modelUsed);
    } catch (err) {
      console.error(err);
      alert("Couldn't write the message. Please try again.");
    } finally {
      setIsGeneratingComm(false);
    }
  };

  const handleStuckClick = async (stepId: string, stepText: string) => {
    if (!activeTask) return;
    setStepSuggestions(prev => ({ ...prev, [stepId]: { text: "", loading: true } }));
    try {
      const response = await fetch("/api/stuck-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle: activeTask.title, taskDescription: activeTask.description, stepText })
      });
      const data = await response.json();
      setStepSuggestions(prev => ({ ...prev, [stepId]: { text: data.suggestion || "Start by writing 3 bullet points about what you know.", loading: false } }));
    } catch {
      setStepSuggestions(prev => ({ ...prev, [stepId]: { text: "Take a deep breath, then write down the very first thing you need to do.", loading: false } }));
    }
  };

  const handleApproveAndSendComm = async () => {
    if (!activeTask || !communicationDraft) return;
    const currentDeadline = new Date(activeTask.deadline);
    currentDeadline.setHours(currentDeadline.getHours() + 2);
    activeTask.deadline = currentDeadline.toISOString();
    activeTask.recalibrated = true;
    activeTask.updatedAt = new Date().toISOString();
    await saveTask(activeTask);
    await saveCommunicationLog(activeTask.id, activeTask.title, stakeholder, communicationDraft);
    const bs = await getTimeBlocks();
    const activeBlock = bs.find(b => b.taskId === activeTask.id);
    if (activeBlock) {
      const currentEnd = new Date(activeBlock.endTime);
      currentEnd.setHours(currentEnd.getHours() + 2);
      activeBlock.endTime = currentEnd.toISOString();
      await saveTimeBlocks(bs);
    }
    setIsCommSent(true);
    setTimeout(() => { setCommunicationDraft(null); setIsCommSent(false); setRunningBehind(null); }, 2500);
  };

  const formattedSeconds = timerSeconds.toString().padStart(2, "0");
  const formattedMinutes = timerMinutes.toString().padStart(2, "0");
  const completedSteps = subSteps.filter(s => s.completed).length;
  const progressPct = subSteps.length > 0 ? Math.round((completedSteps / subSteps.length) * 100) : 0;

  if (loadingUser) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center text-muted-foreground font-sans">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!activeTask) {
    return (
      <div className="flex-1 bg-background text-foreground flex flex-col items-center justify-center p-8 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">🎯</div>
          <h2 className="text-xl font-bold tracking-tight">Nothing to Focus On Yet</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You don't have any tasks to focus on. Go back to your dashboard and either type out everything that's on your mind, or add a task manually.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            ← Back to My Tasks
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      
      {/* Encouragement Toast */}
      {encouragement && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-xl animate-bounce pointer-events-none">
          {encouragement}
        </div>
      )}

      {/* Check-in Toast */}
      {showCheckin && (
        <div className="fixed top-6 right-6 z-50 bg-card border border-border rounded-2xl p-5 shadow-2xl max-w-xs animate-fade-in">
          <p className="text-sm font-bold text-foreground mb-1">💬 How's it going?</p>
          <p className="text-xs text-muted-foreground mb-3">Still on track with your task?</p>
          <div className="flex gap-2">
            <button onClick={() => setShowCheckin(false)} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold py-2 rounded-xl transition-all">
              ✅ Yes, going well!
            </button>
            <button onClick={() => { setShowCheckin(false); handleGenerateCrisisCommunication(); }} className="flex-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-xs font-bold py-2 rounded-xl transition-all">
              😅 I need help
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1 transition-colors">
          ← Back to My Tasks
        </a>
        <div className="flex items-center gap-3">
          {/* Ambient Sound Selector */}
          <div className="hidden sm:flex items-center gap-2 bg-muted/40 border border-border px-3 py-1.5 rounded-xl">
            <span className="text-[10px] text-muted-foreground font-semibold">🎵 Sound:</span>
            {(["none", "rain", "cafe", "forest"] as SoundType[]).map(s => (
              <button
                key={s}
                onClick={() => setSoundType(s)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${soundType === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {s === "none" ? "Off" : s === "rain" ? "🌧️ Rain" : s === "cafe" ? "☕ Café" : "🌿 Forest"}
              </button>
            ))}
          </div>
          <div className="text-[10px] font-semibold bg-primary/10 border border-primary/25 text-primary px-3 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            Focus Mode — You're Doing Great!
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8 flex-1 pb-16 text-left">
        
        {/* Left: Timer + Steps */}
        <div className="lg:col-span-3 space-y-8 flex flex-col">
          
          {/* Focus Timer Card */}
          <section className="bg-card border border-border rounded-[2rem] p-8 shadow-xl flex flex-col items-center justify-center space-y-6">
            <span className="text-[10px] text-primary font-bold tracking-widest uppercase">
              Right Now, Focus On:
            </span>
            <h2 className="text-2xl font-bold text-foreground text-center max-w-xl tracking-tight">
              {activeTask.title}
            </h2>
            {activeTask.description && (
              <p className="text-xs text-muted-foreground text-center max-w-lg leading-relaxed">
                {activeTask.description}
              </p>
            )}

            {/* Timer Ring */}
            <div className="relative w-52 h-52">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke="currentColor" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - (timerMinutes * 60 + timerSeconds) / ((timerMode === "focus" ? 25 : 5) * 60))}`}
                  className={timerMode === "focus" ? "text-primary transition-all duration-1000" : "text-emerald-500 transition-all duration-1000"}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                  {timerMode === "focus" ? "🎯 Focus Time" : "☕ Break Time"}
                </span>
                <span className="text-4xl font-black tracking-tight tabular-nums text-foreground mt-1">
                  {formattedMinutes}:{formattedSeconds}
                </span>
                <span className="text-[9px] text-muted-foreground/60 mt-1">
                  {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s spent
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-center items-center gap-3">
              <button
                onClick={handleStartPause}
                className={`text-sm font-bold px-7 py-3 rounded-xl transition-all shadow-md active:scale-95 ${
                  isTimerRunning
                    ? "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20"
                    : "bg-primary hover:bg-primary/95 text-primary-foreground shadow-primary/20"
                }`}
              >
                {isTimerRunning ? "⏸️ Pause" : "▶️ Start Focusing"}
              </button>
              <button
                onClick={handleReset}
                className="bg-muted hover:bg-muted-foreground/15 border border-border text-foreground text-xs font-semibold px-4 py-3 rounded-xl transition-all active:scale-95"
              >
                🔄 Reset
              </button>
              <button
                onClick={handleCompleteActiveTask}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-600/10"
              >
                ✓ I'm Done!
              </button>
            </div>

            {/* Progress bar */}
            {progressPct > 0 && (
              <div className="w-full space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Task Progress</span>
                  <span>{progressPct}% done</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-secondary transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Steps Checklist */}
          <section className="bg-card border border-border rounded-[2rem] p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-base shrink-0">✅</div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Steps to Get It Done</h3>
                <p className="text-[10px] text-muted-foreground">{completedSteps} of {subSteps.length} completed</p>
              </div>
            </div>

            {/* Running behind alert */}
            {runningBehind && (
              <div className="bg-amber-500/10 border border-amber-500/35 text-amber-600 dark:text-amber-400 text-xs rounded-xl p-4 flex flex-col gap-2.5">
                <span className="font-bold text-sm">⏱️ You Might Be Running a Bit Behind</span>
                <p className="text-amber-700 dark:text-amber-300 leading-normal">
                  Based on your pace, this task might take about <strong>{runningBehind.shiftMinutes} extra minutes</strong>. It happens! You can write a quick delay message below.
                </p>
                <button 
                  onClick={() => handleGenerateCrisisCommunication()} 
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 text-[10px] font-bold px-3 py-1.5 rounded-lg w-fit cursor-pointer"
                >
                  ✍️ Write a Delay Message for Me
                </button>
              </div>
            )}

            <div className="space-y-3">
              {subSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex flex-col gap-2 p-3.5 rounded-xl border bg-muted/10 border-border hover:border-border/80 transition-all"
                >
                  <div
                    onClick={() => handleToggleSubStep(step.id)}
                    className="flex items-center gap-3 cursor-pointer select-none w-full"
                  >
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                      step.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-border bg-background hover:border-emerald-500/50"
                    }`}>
                      {step.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm flex-1 ${step.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                      {step.text}
                    </span>
                    {!step.completed && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStuckClick(step.id, step.text); }}
                        className="ml-auto text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-lg hover:bg-indigo-500/20 transition-all cursor-pointer shrink-0"
                      >
                        {stepSuggestions[step.id]?.loading ? "Thinking..." : "🤔 Help Me With This"}
                      </button>
                    )}
                  </div>
                  {stepSuggestions[step.id]?.text && (
                    <div className="text-[11px] bg-indigo-500/5 border border-indigo-500/10 text-indigo-600 dark:text-indigo-300 p-3 rounded-xl ml-8">
                      💡 <strong>AI Coach says:</strong> {stepSuggestions[step.id].text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Research Notes + Delay Message */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          
          {/* AI Research Notes */}
          <section className="bg-card border border-border rounded-[2rem] p-8 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center gap-3 border-b border-border pb-3.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-base shrink-0">🧠</div>
              <div>
                <h3 className="text-sm font-bold text-foreground">AI Research Notes</h3>
                <p className="text-[9px] text-muted-foreground">Pre-prepared to help you get started faster</p>
              </div>
            </div>

            {activeTask.scaffolding?.status === "completed" ? (
              <div className="space-y-5 text-xs text-left">
                <div className="space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">👥 Who this is for:</span>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed pl-2">
                    {activeTask.scaffolding.targetAudiences.map((aud, i) => (
                      <li key={i} className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>{aud}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">💡 Ideas to get started:</span>
                  <div className="space-y-1.5">
                    {activeTask.scaffolding.headlineAngles.map((ang, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 font-medium text-foreground">
                        {ang}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">📋 A starting structure:</span>
                  <ol className="space-y-1 text-muted-foreground pl-2">
                    {activeTask.scaffolding.structuralTemplates.map((temp, i) => (
                      <li key={i} className="flex items-start gap-1.5"><span className="text-primary font-bold shrink-0">{i+1}.</span>{temp}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-3">
                <span className="text-4xl">🔍</span>
                <p className="text-muted-foreground text-sm max-w-[200px] leading-relaxed font-medium">
                  No research notes yet.
                </p>
                <p className="text-xs text-muted-foreground/70 max-w-[200px] leading-relaxed">
                  Go back and click "Get a Head Start" on this task to have AI prepare notes for you.
                </p>
                <a href="/dashboard" className="text-xs text-primary font-semibold hover:underline">← Get Notes for This Task</a>
              </div>
            )}
          </section>

          {/* Delay Message Writer */}
          <section className="bg-card border border-border rounded-[2rem] p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-base shrink-0">🛡️</div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Need to Apologize for a Delay?</h3>
                <p className="text-[10px] text-muted-foreground">AI will write a professional message for you in seconds</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={stakeholder}
                  onChange={(e) => setStakeholder(e.target.value)}
                  className="bg-background border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary flex-1 font-semibold cursor-pointer"
                >
                  <option>Client</option>
                  <option>Project Manager</option>
                  <option>Professor</option>
                  <option>Teammate</option>
                </select>

                <select
                  value={disposition}
                  onChange={(e) => setDisposition(e.target.value)}
                  className="bg-background border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary flex-1 font-semibold cursor-pointer"
                >
                  <option value="Critical & Strict">Formal & Professional</option>
                  <option value="Chill & Collaborative">Casual & Friendly</option>
                  <option value="Busy Executive">Short & Direct</option>
                </select>
                
                <button
                  onClick={handleGenerateCrisisCommunication}
                  disabled={isGeneratingComm}
                  className="bg-rose-600 hover:bg-rose-500 disabled:bg-rose-500/50 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-[0.97] transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer shrink-0"
                >
                  {isGeneratingComm ? "Writing..." : "✍️ Write it"}
                </button>
              </div>

              {communicationDraft && (
                <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-3 animate-fade-in text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✅ AI wrote this for you:</span>
                    <button onClick={() => setCommunicationDraft(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                  </div>
                  <pre className="font-sans text-[11px] text-foreground leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[180px] overflow-y-auto">
                    {communicationDraft}
                  </pre>
                  
                  {isCommSent ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs py-2 px-3 rounded-lg text-center font-bold">
                      ✅ Saved! Your deadline was extended by 2 hours.
                    </div>
                  ) : (
                    <button
                      onClick={handleApproveAndSendComm}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      ✓ Looks Good — Save & Extend My Deadline
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
