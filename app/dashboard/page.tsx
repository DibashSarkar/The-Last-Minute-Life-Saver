"use client";

import React, { useState, useEffect } from "react";
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
  Task, 
  TimeBlock, 
  UserSettings 
} from "@/lib/firebase";
import { autoScheduleTasks, calculatePriorityScore } from "@/lib/priority";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

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
  
  const [sandbox, setSandbox] = useState(true);
  const [modelLogs, setModelLogs] = useState<Array<{ time: string; model: string; feature: string }>>([]);
  const [activeMobileTab, setActiveMobileTab] = useState<"tasks" | "schedule">("tasks");

  // Auth check & initial load
  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      
      // If onboarded is false, redirect to onboarding!
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
    }
    checkAuthAndLoad();
  }, []);

  const handleLogout = async () => {
    await authLogout();
    window.location.href = "/login";
  };

  // Log model executions to display in the UI "Visual Flex" execution panel
  const addModelLog = (feature: string, model: string) => {
    const time = new Date().toLocaleTimeString();
    setModelLogs(prev => [{ time, model, feature }, ...prev].slice(0, 10));
  };

  // Run Triage / Panic Dump
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

      // Refresh tasks
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
      setPanicInput("");
      
      // Auto-schedule immediately
      const newBlocks = autoScheduleTasks(updatedTasks, settings);
      await clearAllTimeBlocks();
      await saveTimeBlocks(newBlocks);
      setTimeBlocks(newBlocks);

      addModelLog("Panic Triage", data.modelUsed);
    } catch (error) {
      console.error(error);
      alert("Triage failed: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsTriageLoading(false);
    }
  };

  // Toggle Task Status (Complete / Pending)
  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === "completed" ? "pending" : "completed";
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
    await saveTask(task);

    // Re-schedule
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
    
    addModelLog("Energy Adaptive Recalibration", "⚡ Gemini 1.5 Flash");
  };

  // Run Pre-Research (Head Start) for a Task
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
      addModelLog("Pre-Research Scaffolding", data.task.scaffolding.modelUsed);
    } catch (error) {
      console.error(error);
      alert("Generation failed");
    } finally {
      setScaffoldingLoadingId(null);
    }
  };

  // Run Schedule Auto-Negotiation
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
      
      addModelLog("Crisis Auto-Negotiation", data.modelUsed);
    } catch (error) {
      console.error(error);
      alert("Negotiation failed");
    } finally {
      setIsNegotiateLoading(false);
    }
  };

  // Check if a block is currently expired/missed
  const isBlockMissed = (block: TimeBlock) => {
    if (block.isCompleted) return false;
    const nowTime = new Date().getTime();
    const startTime = new Date(block.startTime).getTime();
    return startTime < nowTime;
  };

  const missedBlock = timeBlocks.find(b => isBlockMissed(b));

  if (loadingUser) {
    return (
      <div className="flex-1 bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span>Authenticating Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-12">
      {/* Sandbox Warning Banner */}
      {sandbox && (
        <div className="bg-indigo-950/80 border-b border-indigo-500/30 text-indigo-200 text-[10px] py-2 px-4 text-center backdrop-blur-md flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
          <span>⚡ <strong>Sandbox Mode:</strong> Running locally on localStorage mock DB. Connect Firebase environment variables to sync real-time.</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
              Cockpit Dashboard
              <span className="text-[10px] font-normal px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md">
                {currentUser?.displayName || currentUser?.email}
              </span>
            </h1>
            <p className="text-[10px] text-slate-500">Execution console for task shifting & scaffolding</p>
          </div>
        </div>

        {/* Navigation sub-routes (hidden on mobile, shown in bottom nav instead) */}
        <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
          <a href="/dashboard/history" className="text-slate-400 hover:text-slate-200">History</a>
          <a href="/dashboard/analytics" className="text-slate-400 hover:text-slate-200">Analytics</a>
          <a href="/dashboard/settings" className="text-slate-400 hover:text-slate-200">Settings</a>
          <a href="/admin" className="text-slate-500 hover:text-indigo-400">Admin Area</a>
        </div>

        {/* Energy Adaptive State Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center bg-slate-900/60 border border-slate-800 p-0.5 sm:p-1 rounded-xl">
            <button
              onClick={() => handleEnergyChange("high")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                settings.currentEnergyState === "high"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="High Energy Mode"
            >
              🟢<span className="hidden sm:inline ml-1">High</span>
            </button>
            <button
              onClick={() => handleEnergyChange("low")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                settings.currentEnergyState === "low"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Low Energy Mode"
            >
              🟡<span className="hidden sm:inline ml-1">Low</span>
            </button>
            <button
              onClick={() => handleEnergyChange("overwhelmed")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                settings.currentEnergyState === "overwhelmed"
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-950/30 animate-pulse"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Overwhelmed Mode"
            >
              🚨<span className="hidden sm:inline ml-1">Overwhelmed</span>
            </button>
          </div>

          <a
            href="/dashboard/focus"
            className="hidden sm:flex bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            Focus Mode
          </a>

          <button 
            onClick={handleLogout}
            className="hidden sm:block text-slate-400 hover:text-rose-400 text-xs font-semibold px-2 py-1.5 border border-transparent hover:border-rose-900/30 rounded-lg hover:bg-rose-950/10 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden border-b border-slate-900 bg-slate-950 sticky top-[73px] z-30 px-6 py-1">
        <button
          onClick={() => setActiveMobileTab("tasks")}
          className={`flex-1 text-center py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeMobileTab === "tasks"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-500"
          }`}
        >
          Tasks Queue
        </button>
        <button
          onClick={() => setActiveMobileTab("schedule")}
          className={`flex-1 text-center py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeMobileTab === "schedule"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-500"
          }`}
        >
          Daily Timeline
        </button>
      </div>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
        
        {/* Left Column (3/5 width): Task Manager & Brain Dump */}
        <div className={`lg:col-span-3 space-y-8 ${activeMobileTab === "tasks" ? "block" : "hidden md:block"}`}>
          
          {/* Panic Dump Text Box */}
          <section className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <h2 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Unstructured Panic Brain Dump
            </h2>
            <form onSubmit={handlePanicSubmit} className="space-y-4">
              <textarea
                value={panicInput}
                onChange={(e) => setPanicInput(e.target.value)}
                placeholder="Describe everything on your mind in raw text... (e.g. 'I'm drowning, I have an ad campaign due Monday at 2 PM but haven't even written the copy or designed creatives')"
                rows={4}
                className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans resize-none"
              />
              <button
                type="submit"
                disabled={isTriageLoading || !panicInput.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs py-3 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isTriageLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Triaging Panic Dump... (using Gemini 1.5 Flash)</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span>Trigger AI Triage Pipeline</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Prioritized Task List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Mathematical Priority Queue ({tasks.length} tasks)
              </h2>
              {settings.currentEnergyState === "overwhelmed" && (
                <span className="text-[10px] bg-rose-950/70 border border-rose-800 text-rose-300 font-medium px-2 py-0.5 rounded-md animate-pulse">
                  High energy projects suppressed
                </span>
              )}
            </div>

            {tasks.length === 0 ? (
              <div className="border border-dashed border-slate-900 rounded-2xl py-12 px-6 text-center text-slate-600 text-sm">
                No tasks parsed yet. Dump your messy schedule above to let Gemini structure it.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {tasks
                  .map(t => ({
                    ...t,
                    score: calculatePriorityScore(t, tasks)
                  }))
                  .sort((a, b) => b.score - a.score)
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`border bg-slate-900/25 backdrop-blur-sm rounded-xl p-5 transition-all duration-300 flex items-start justify-between gap-4 ${
                        task.status === "completed"
                          ? "border-slate-900 opacity-55"
                          : "border-slate-800 hover:border-slate-700/80 hover:shadow-lg hover:shadow-indigo-500/[0.02]"
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <button
                          onClick={() => handleToggleComplete(task.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-1 transition-all ${
                            task.status === "completed"
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-700 hover:border-slate-500 bg-slate-950/50"
                          }`}
                        >
                          {task.status === "completed" && (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-sm font-semibold ${task.status === "completed" ? "line-through text-slate-500" : "text-slate-100"}`}>
                              {task.title}
                            </h3>
                            
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              task.status === "completed"
                                ? "bg-slate-900 text-slate-600"
                                : task.score > 120
                                ? "bg-rose-950/65 text-rose-400 border border-rose-900/50"
                                : task.score > 80
                                ? "bg-amber-950/65 text-amber-400 border border-amber-900/50"
                                : "bg-slate-900 text-slate-400 border border-slate-800"
                            }`}>
                              Score: {task.score}
                            </span>

                            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-md ${
                              task.energyRequired === "high"
                                ? "bg-indigo-950/60 text-indigo-300 border border-indigo-900/50"
                                : task.energyRequired === "medium"
                                ? "bg-slate-900 text-slate-300"
                                : "bg-emerald-950/50 text-emerald-300 border border-emerald-900/50"
                            }`}>
                              {task.energyRequired.toUpperCase()} ENERGY
                            </span>

                            {task.scaffolding?.status === "completed" && (
                              <span className="text-[9px] bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm animate-pulse">
                                🧠 Head Start Scaffolding Loaded
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                            {task.description}
                          </p>

                          <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              ⏱️ Estimate: {task.estimatedDuration} mins
                            </span>
                            <span className="flex items-center gap-1">
                              📅 Target: {new Date(task.deadline).toLocaleDateString()}
                            </span>
                            {task.dependencies.length > 0 && (
                              <span className="text-purple-400">
                                🔗 Blocked by: {task.dependencies.length} task(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.status !== "completed" && !task.scaffolding && (
                          <button
                            onClick={() => handlePreResearch(task.id)}
                            disabled={scaffoldingLoadingId !== null}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1"
                          >
                            {scaffoldingLoadingId === task.id ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                                Generating...
                              </>
                            ) : (
                              <>
                                🧠 Auto Pre-Research
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-all active:scale-95"
                          title="Delete task"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (2/5 width): Calendar Scheduler & Execution Drawer */}
        <div className={`lg:col-span-2 space-y-8 ${activeMobileTab === "schedule" ? "block" : "hidden md:block"}`}>
          
          {/* Visual Timeline (The Auto-Scheduler) */}
          <section className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col min-h-[400px]">
            <h2 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Auto-Scheduled Daily Timeline
            </h2>

            {/* Crisis Alert Trigger Banner */}
            {missedBlock && (
              <div className="bg-rose-950/60 border border-rose-500/35 rounded-xl p-4 text-xs space-y-2 mb-4 shadow-lg shadow-rose-950/40 animate-pulse">
                <div className="flex items-center justify-between text-rose-300 font-semibold">
                  <span className="flex items-center gap-1">🚨 Slot Expired: Crisis Detected!</span>
                  <span className="text-[10px] bg-rose-900 px-2 py-0.5 rounded text-white">LATE</span>
                </div>
                <p className="text-rose-400">
                  The scheduled slot for <strong>"{missedBlock.title}"</strong> has passed. Click the shift resolver below to auto-negotiate your remaining timeline.
                </p>
                <button
                  onClick={() => handleAutoNegotiate(missedBlock.id)}
                  disabled={isNegotiateLoading}
                  className="w-full bg-rose-700 hover:bg-rose-600 text-white font-semibold py-2 rounded-lg text-[10px] shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isNegotiateLoading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Negotiating Crisis Schedule...</span>
                    </>
                  ) : (
                    <>
                      <span>Resolve & Shift Timeline (Gemini Flash)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Negotiation explanation toast display */}
            {negotiationResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2 mb-4 animate-fade-in relative">
                <button 
                  onClick={() => setNegotiationResult(null)} 
                  className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 text-[10px]"
                >
                  ✕
                </button>
                <div className="text-slate-300 font-semibold flex items-center gap-1 text-indigo-400">
                  🧠 Crisis Shifts Complete
                </div>
                <p className="text-slate-400">{negotiationResult.explanation}</p>
                {negotiationResult.dropped.length > 0 && (
                  <div className="text-[10px] text-rose-400">
                    Deferred tasks: {negotiationResult.dropped.join(", ")}
                  </div>
                )}
                <div className="text-[9px] text-slate-600 italic">
                  Processed via {negotiationResult.model}
                </div>
              </div>
            )}

            {/* Time Blocks Loop */}
            <div className="flex-1 space-y-3">
              {timeBlocks.length === 0 ? (
                <div className="h-full border border-dashed border-slate-900 rounded-2xl flex items-center justify-center text-slate-600 text-xs py-12 text-center">
                  Timeline empty. Generate tasks first.
                </div>
              ) : (
                timeBlocks
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.endTime).getTime())
                  .map((block) => {
                    const isLate = isBlockMissed(block);
                    return (
                      <div
                        key={block.id}
                        className={`border rounded-xl p-4 flex flex-col gap-1 transition-all ${
                          block.isCompleted
                            ? "bg-slate-950/20 border-slate-950/40 opacity-45"
                            : isLate
                            ? "bg-rose-950/20 border-rose-900/60 shadow-lg shadow-rose-950/10"
                            : "bg-slate-900/30 border-slate-900 hover:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-500 tracking-wider">
                            ⏱️ {new Date(block.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(block.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {block.isCompleted ? (
                            <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 font-medium px-2 py-0.5 rounded">
                              COMPLETED
                            </span>
                          ) : isLate ? (
                            <span className="text-[9px] bg-rose-950/70 border border-rose-800 text-rose-300 font-medium px-2 py-0.5 rounded animate-pulse">
                              LATE
                            </span>
                          ) : (
                            <span className="text-[9px] bg-indigo-950/50 border border-indigo-900/40 text-indigo-400 font-medium px-2 py-0.5 rounded">
                              SCHEDULED
                            </span>
                          )}
                        </div>

                        <span className={`text-xs font-semibold ${block.isCompleted ? "line-through text-slate-500" : "text-slate-100"}`}>
                          {block.title}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </section>

          {/* Visual Flex: Under-the-hood Execution Logs */}
          <section className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <h2 className="text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-4 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Google Technology Matrix execution
            </h2>

            <div className="space-y-3">
              <div className="text-[10px] text-slate-500 mb-2">
                This panel displays the exact Google AI Studio endpoints utilized in the background:
              </div>
              
              {modelLogs.length === 0 ? (
                <div className="text-[10px] text-slate-700 italic py-2">
                  No execution logs recorded yet. Trigger triage or scaffolding to view.
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {modelLogs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-900/60 pb-2 text-[10px]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-300">{log.feature}</span>
                        <span className="text-[9px] text-slate-600">{log.time}</span>
                      </div>
                      <span className={`font-semibold px-2 py-0.5 rounded-full ${
                        log.model.includes("Flash")
                          ? "bg-slate-900 border border-yellow-500/20 text-yellow-400"
                          : "bg-indigo-950/60 border border-indigo-500/30 text-indigo-300"
                      }`}>
                        {log.model.includes("Flash") ? "⚡ " + log.model : "🧠 " + log.model}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
