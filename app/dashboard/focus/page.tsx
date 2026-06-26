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

export default function FocusMode() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Pomodoro states
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sub-steps & Velocity Recalibration states
  const [subSteps, setSubSteps] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);
  
  const [recalibrationAlert, setRecalibrationAlert] = useState<{ message: string; shiftMinutes: number } | null>(null);

  // Crisis Communication state
  const [stakeholder, setStakeholder] = useState("Client");
  const [communicationDraft, setCommunicationDraft] = useState<string | null>(null);
  const [isGeneratingComm, setIsGeneratingComm] = useState(false);
  const [isCommSent, setIsCommSent] = useState(false);
  const [commModel, setCommModel] = useState("");

  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
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
        
        const steps = [
          { id: "step_1", text: "Establish core goals and outline structure", completed: false },
          { id: "step_2", text: "Draft initial rough content / prototype layout", completed: false },
          { id: "step_3", text: "Integrate review feedback and polish assets", completed: false },
          { id: "step_4", text: "Run final verification and package delivery", completed: false }
        ];
        setSubSteps(steps);
      }
    }
    checkAuthAndLoad();
  }, []);

  // Pomodoro Timer Logic
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
          alert(timerMode === "focus" ? "Great focus! Take a break." : "Break over! Ready to focus?");
          toggleTimerMode();
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerMinutes, timerSeconds, timerMode]);

  // Elapsed stopwatch tracking (for Velocity calculation)
  useEffect(() => {
    if (isTimerRunning && timerMode === "focus") {
      if (!startTime) setStartTime(Date.now());
      elapsedRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    }

    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, [isTimerRunning, timerMode, startTime]);

  const toggleTimerMode = () => {
    const isNextBreak = timerMode === "focus";
    setTimerMode(isNextBreak ? "break" : "focus");
    setTimerMinutes(isNextBreak ? 5 : 25);
    setTimerSeconds(0);
  };

  const handleStartPause = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleReset = () => {
    setIsTimerRunning(false);
    setTimerMinutes(25);
    setTimerSeconds(0);
    setElapsedSeconds(0);
    setStartTime(null);
    setRecalibrationAlert(null);
  };

  // Check off a sub-step and perform Velocity-Aware Live Recalibration
  const handleToggleSubStep = async (stepId: string) => {
    if (!activeTask) return;

    const updatedSteps = subSteps.map(s => 
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    setSubSteps(updatedSteps);

    const completedCount = updatedSteps.filter(s => s.completed).length;
    const totalCount = updatedSteps.length;
    if (completedCount === 0) return;

    const taskEstMin = activeTask.estimatedDuration || 30;
    const elapsedMin = elapsedSeconds / 60;
    const progressFraction = completedCount / totalCount;
    const expectedTimeForProgress = progressFraction * taskEstMin;

    const velocityRatio = elapsedMin / expectedTimeForProgress;

    if (velocityRatio > 1.15) {
      const newTotalEst = taskEstMin * velocityRatio;
      const shiftMinutes = Math.ceil(newTotalEst - taskEstMin);

      if (shiftMinutes > 0) {
        setRecalibrationAlert({
          message: `⚠️ Real-Time Calibration: Velocity check indicates you are taking longer. Downstream blocks pushed forward by +${shiftMinutes}m.`,
          shiftMinutes
        });

        const bs = await getTimeBlocks();
        const updatedBlocks = bs.map(b => {
          const activeBlock = bs.find(ab => ab.taskId === activeTask.id);
          if (!activeBlock) return b;

          const blockStart = new Date(b.startTime).getTime();
          const activeStart = new Date(activeBlock.startTime).getTime();

          if (b.taskId === activeTask.id) {
            const currentEnd = new Date(b.endTime);
            currentEnd.setMinutes(currentEnd.getMinutes() + shiftMinutes);
            return { ...b, endTime: currentEnd.toISOString() };
          } else if (blockStart > activeStart) {
            const currentStart = new Date(b.startTime);
            const currentEnd = new Date(b.endTime);
            currentStart.setMinutes(currentStart.getMinutes() + shiftMinutes);
            currentEnd.setMinutes(currentEnd.getMinutes() + shiftMinutes);
            return { ...b, startTime: currentStart.toISOString(), endTime: currentEnd.toISOString() };
          }
          return b;
        });

        await clearAllTimeBlocks();
        await saveTimeBlocks(updatedBlocks);
        setTimeBlocks(updatedBlocks);
      }
    }
  };

  // Complete Active Task
  const handleCompleteActiveTask = async () => {
    if (!activeTask) return;

    activeTask.status = "completed";
    activeTask.actualDuration = Math.round(elapsedSeconds / 60);
    activeTask.updatedAt = new Date().toISOString();
    await saveTask(activeTask);

    alert(`Task "${activeTask.title}" marked completed! Actual time spent: ${activeTask.actualDuration}m.`);
    window.location.href = "/dashboard";
  };

  // Generate Crisis Stakeholder Shield communication
  const handleGenerateCrisisCommunication = async () => {
    if (!activeTask) return;

    setIsGeneratingComm(true);
    setCommunicationDraft(null);
    setIsCommSent(false);

    try {
      const response = await fetch("/api/crisis-communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          taskId: activeTask.id, 
          stakeholderType: stakeholder 
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setCommunicationDraft(data.draft);
      setCommModel(data.modelUsed);
    } catch (e) {
      console.error(e);
      alert("Failed to draft crisis message");
    } finally {
      setIsGeneratingComm(false);
    }
  };

  // Approve and Send Extension
  const handleApproveAndSendComm = async () => {
    if (!activeTask || !communicationDraft) return;

    // Extend the deadline by 2 hours in the database
    const currentDeadline = new Date(activeTask.deadline);
    currentDeadline.setHours(currentDeadline.getHours() + 2);
    activeTask.deadline = currentDeadline.toISOString();
    activeTask.recalibrated = true;
    activeTask.updatedAt = new Date().toISOString();
    await saveTask(activeTask);

    // Save message to log list
    await saveCommunicationLog(activeTask.id, activeTask.title, stakeholder, communicationDraft);

    // Also adjust its current timeblock
    const bs = await getTimeBlocks();
    const activeBlock = bs.find(b => b.taskId === activeTask.id);
    if (activeBlock) {
      const currentEnd = new Date(activeBlock.endTime);
      currentEnd.setHours(currentEnd.getHours() + 2);
      activeBlock.endTime = currentEnd.toISOString();
      await saveTimeBlocks(bs);
    }

    setIsCommSent(true);
    setTimeout(() => {
      setCommunicationDraft(null);
      setIsCommSent(false);
      setRecalibrationAlert(null);
    }, 2500);
  };

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

  if (!activeTask) {
    return (
      <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">No Active Task Available</h2>
          <p className="text-sm text-slate-400">
            Before entering Focus Mode, go to the dashboard and ensure you have triaged tasks scheduled for today.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const formattedSeconds = timerSeconds.toString().padStart(2, "0");
  const formattedMinutes = timerMinutes.toString().padStart(2, "0");

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1">
          ← Back to Dashboard
        </a>
        <div className="text-xs font-semibold bg-indigo-950 border border-indigo-900/60 text-indigo-400 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
          🎯 FOCUS MODE ENABLED
        </div>
      </header>

      {/* Focus Panel Grid */}
      <main className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8 flex-1 pb-16">
        
        {/* Left Column (3/5): Pomodoro, Substeps, and Scaffolding */}
        <div className="lg:col-span-3 space-y-8 flex flex-col">
          
          {/* Main Focus Card with Pomodoro */}
          <section className="bg-slate-900/40 border border-slate-900 rounded-3xl p-8 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center space-y-6">
            <span className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">
              Current Micro-Task
            </span>
            <h2 className="text-2xl font-semibold text-slate-100 text-center max-w-xl">
              {activeTask.title}
            </h2>
            <p className="text-xs text-slate-400 text-center max-w-lg leading-relaxed">
              {activeTask.description}
            </p>

            {/* Pomodoro Clock UI */}
            <div className="relative w-48 h-48 rounded-full border border-slate-800 flex flex-col items-center justify-center bg-slate-950 shadow-2xl relative overflow-hidden">
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider mb-1">
                {timerMode.toUpperCase()}
              </span>
              <span className="text-4xl font-semibold tracking-tight tabular-nums text-white">
                {formattedMinutes}:{formattedSeconds}
              </span>
              <span className="text-[9px] text-slate-600 mt-1">
                Spent: {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartPause}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-95"
              >
                {isTimerRunning ? "⏸️ Pause" : "▶️ Start Focus"}
              </button>
              <button
                onClick={handleReset}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
              >
                🔄 Reset
              </button>
              <button
                onClick={handleCompleteActiveTask}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-600/10"
              >
                ✓ Complete Task
              </button>
            </div>
          </section>

          {/* Sub-steps Checklist with Velocity Calibration */}
          <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Estimated Sub-steps checklist
            </h3>

            {/* Velocity calibration warning alert banner */}
            {recalibrationAlert && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs rounded-xl p-4 animate-pulse flex flex-col gap-2">
                <span className="font-semibold">⚡ Live Recalibration Active</span>
                <p className="text-yellow-300/80 leading-normal">{recalibrationAlert.message}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleGenerateCrisisCommunication()} 
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-[10px] font-semibold px-3 py-1 rounded"
                  >
                    Generate Extension Draft (Stakeholder Shield)
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {subSteps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => handleToggleSubStep(step.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    step.completed
                      ? "bg-slate-950/30 border-slate-950 opacity-55"
                      : "bg-slate-900/30 border-slate-900 hover:border-slate-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    step.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-700 bg-slate-950"
                  }`}>
                    {step.completed && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs ${step.completed ? "line-through text-slate-500 font-normal" : "text-slate-300"}`}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column (2/5): Head Start Pre-Research Scaffold & Stakeholder Shield */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          
          {/* Head Start Scaffold Assets Panel */}
          <section className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <h3 className="text-xs font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Autonomous Scaffolding Assets
              </h3>
              <span className="text-[9px] bg-indigo-950 border border-indigo-900/60 text-indigo-400 font-semibold px-2 py-0.5 rounded">
                🧠 Gemini 1.5 Pro
              </span>
            </div>

            {activeTask.scaffolding?.status === "completed" ? (
              <div className="space-y-5 text-xs">
                <div className="space-y-2">
                  <span className="font-semibold text-indigo-300">Target Audiences:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px] leading-relaxed">
                    {activeTask.scaffolding.targetAudiences.map((aud, i) => (
                      <li key={i}>{aud}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-indigo-300">Brainstorm Hooks & Angles:</span>
                  <div className="space-y-1.5">
                    {activeTask.scaffolding.headlineAngles.map((ang, i) => (
                      <div key={i} className="p-2 rounded bg-slate-950 border border-slate-900/80 font-mono text-[10px] text-indigo-200">
                        {ang}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-indigo-300">Starting Outline Template:</span>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
                    {activeTask.scaffolding.structuralTemplates.map((temp, i) => (
                      <li key={i}>{temp}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-3">
                <span className="text-2xl">🧠</span>
                <p className="text-slate-500 text-xs max-w-[200px]">
                  Scaffolding brainstorm assets have not been generated yet. Go back to the dashboard and trigger "Auto Pre-Research".
                </p>
              </div>
            )}
          </section>

          {/* Stakeholder Shield (Crisis Communication Drawer) */}
          <section className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-xs font-semibold tracking-wider text-rose-400 uppercase mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Stakeholder Shield Protocol
            </h3>
            
            <div className="space-y-4">
              <p className="text-[10px] text-slate-500 leading-normal">
                If velocity recalibration indicates you will miss a deadline, the AI will draft a highly professional, contextual message to shield you from stakeholder anxiety.
              </p>

              <div className="flex gap-2">
                <select
                  value={stakeholder}
                  onChange={(e) => setStakeholder(e.target.value)}
                  className="bg-slate-950 border border-slate-800/80 rounded-lg p-2 text-xs text-slate-300 focus:outline-none flex-1"
                >
                  <option>Client</option>
                  <option>Project Manager</option>
                  <option>Professor</option>
                  <option>Teammate</option>
                </select>
                
                <button
                  onClick={handleGenerateCrisisCommunication}
                  disabled={isGeneratingComm}
                  className="bg-rose-950/70 hover:bg-rose-900/70 border border-rose-800 text-rose-300 text-xs font-semibold px-4 py-2 rounded-lg active:scale-95 transition-all flex items-center gap-1"
                >
                  {isGeneratingComm ? "Generating..." : "Generate Draft"}
                </button>
              </div>

              {/* Draft Output Modal/Viewer */}
              {communicationDraft && (
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 mt-3 space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-[9px] text-slate-500">
                    <span>Draft generated via {commModel}</span>
                    <button 
                      onClick={() => setCommunicationDraft(null)} 
                      className="text-slate-600 hover:text-slate-400"
                    >
                      ✕
                    </button>
                  </div>
                  <pre className="font-sans text-[10px] text-slate-400 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[180px] overflow-y-auto">
                    {communicationDraft}
                  </pre>
                  
                  {isCommSent ? (
                    <div className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs py-2 px-3 rounded-lg text-center font-semibold animate-pulse">
                      ✓ Message Transmitted! Calendar Shifted +2h in DB.
                    </div>
                  ) : (
                    <button
                      onClick={handleApproveAndSendComm}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-lg active:scale-95 transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1"
                    >
                      <span>Approve and Send Extension Request via API</span>
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
