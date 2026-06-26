"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, getTasks, Task } from "@/lib/firebase";

export default function AnalyticsPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setLoadingUser(false);

      const ts = await getTasks();
      setTasks(ts);
    }
    checkAuthAndLoad();
  }, []);

  const completed = tasks.filter(t => t.status === "completed");
  const pending = tasks.filter(t => t.status !== "completed");

  // Calculate Average Velocity
  // Velocity ratio = Actual / Estimated. If Actual = 0 or not set, default to 1.
  const completedWithVelocity = completed.filter(t => t.actualDuration > 0);
  const totalActual = completedWithVelocity.reduce((sum, t) => sum + t.actualDuration, 0);
  const totalEstimated = completedWithVelocity.reduce((sum, t) => sum + t.estimatedDuration, 0);
  const avgVelocityRatio = totalEstimated > 0 ? (totalActual / totalEstimated) : 1;

  // Group by energy required
  const highEnergy = tasks.filter(t => t.energyRequired === "high").length;
  const mediumEnergy = tasks.filter(t => t.energyRequired === "medium").length;
  const lowEnergy = tasks.filter(t => t.energyRequired === "low").length;

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span>Compiling velocity calculations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1">
          ← Back to Cockpit
        </a>
        <h1 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">
          Personal Velocity Analytics
        </h1>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full px-6 mt-8 space-y-8 flex-1">
        
        {/* Core Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Ratio */}
          <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-6 flex flex-col justify-between space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Velocity Ratio</span>
            <div className="text-3xl font-semibold text-indigo-400">
              {avgVelocityRatio.toFixed(2)}x
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              {avgVelocityRatio > 1.15 
                ? "Taking longer than estimated. Auto-recalibrator will shift timeline." 
                : "Completion speeds are aligned with original estimates."}
            </p>
          </div>

          {/* Efficiency Bar */}
          <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-6 flex flex-col justify-between space-y-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Completion Ratio</span>
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-white">
                {tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0}%
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              {completed.length} completed vs {pending.length} pending tasks.
            </p>
          </div>

          {/* Energy Distribution */}
          <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-6 flex flex-col justify-between space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Task Energy Needs</span>
            <div className="flex gap-2 items-center text-[10px]">
              <div className="flex-1 text-center bg-slate-950 p-2 border border-slate-900 rounded">
                <div className="text-sm font-semibold text-indigo-300">{highEnergy}</div>
                <div className="text-[8px] text-slate-500">High</div>
              </div>
              <div className="flex-1 text-center bg-slate-950 p-2 border border-slate-900 rounded">
                <div className="text-sm font-semibold text-slate-300">{mediumEnergy}</div>
                <div className="text-[8px] text-slate-500">Medium</div>
              </div>
              <div className="flex-1 text-center bg-slate-950 p-2 border border-slate-900 rounded">
                <div className="text-sm font-semibold text-emerald-300">{lowEnergy}</div>
                <div className="text-[8px] text-slate-500">Low</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Allows friction adaptive filtering when overwhelmed.</p>
          </div>

        </section>

        {/* Detailed Velocity logs graph */}
        <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            ⚡ Task Completion Speeds (Estimates vs Actuals)
          </h2>

          {completedWithVelocity.length === 0 ? (
            <div className="py-12 text-center text-slate-600 text-xs">
              No stopwatch data logged yet. Complete tasks in Focus Mode with the timer running to log velocity metrics.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 text-[10px]">
                      <th className="py-2">Task Title</th>
                      <th className="py-2">Estimated</th>
                      <th className="py-2">Actual Time</th>
                      <th className="py-2">Deviation ratio</th>
                      <th className="py-2">Recalibrated?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedWithVelocity.map(t => {
                      const ratio = t.actualDuration / t.estimatedDuration;
                      const devPercent = Math.round((ratio - 1) * 100);
                      return (
                        <tr key={t.id} className="border-b border-slate-900/60 text-slate-300">
                          <td className="py-3 font-semibold">{t.title}</td>
                          <td className="py-3 text-slate-400">{t.estimatedDuration}m</td>
                          <td className="py-3 font-semibold text-slate-200">{t.actualDuration}m</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              ratio > 1.15 
                                ? "bg-rose-950/40 text-rose-400 border border-rose-900/50" 
                                : ratio < 0.85
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                                : "bg-slate-900 text-slate-500"
                            }`}>
                              {devPercent > 0 ? `+${devPercent}% Late` : `${devPercent}% Early`}
                            </span>
                          </td>
                          <td className="py-3">
                            {t.recalibrated ? "🧠 Shield Activated (+2h)" : "No Shift"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} The Last-Minute Life Saver. All rights reserved.
      </footer>
    </div>
  );
}
