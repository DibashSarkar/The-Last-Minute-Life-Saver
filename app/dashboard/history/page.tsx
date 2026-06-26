"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, getTasks, getCommunicationHistory, Task, CommunicationLog } from "@/lib/firebase";

export default function HistoryPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);

  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setLoadingUser(false);

      const ts = await getTasks();
      setCompletedTasks(ts.filter(t => t.status === "completed"));

      const logs = await getCommunicationHistory();
      setCommLogs(logs);
    }
    checkAuthAndLoad();
  }, []);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span>Loading historical archive...</span>
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
          Deadlines Saved Archive
        </h1>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-5xl mx-auto w-full px-6 mt-8 space-y-8 flex-1">
        
        {/* Summary metrics header */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-5 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Completed Missions</span>
            <div className="text-3xl font-semibold text-emerald-400">{completedTasks.length}</div>
            <p className="text-[10px] text-slate-500">Atomic micro-tasks checked off in Focus Mode.</p>
          </div>

          <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-5 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Stakeholder Shields Triggered</span>
            <div className="text-3xl font-semibold text-rose-400">{commLogs.length}</div>
            <p className="text-[10px] text-slate-500">Extension drafts generated to delay deadlines safely.</p>
          </div>
        </section>

        {/* Grid: Completed Tasks vs Communication Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Completed Tasks Queue */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
              🏆 Completed Tasks Feed
            </h2>
            
            {completedTasks.length === 0 ? (
              <div className="border border-dashed border-slate-900 rounded-xl py-12 text-center text-slate-600 text-xs">
                No items completed yet. Check off items in Focus Mode.
              </div>
            ) : (
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <div key={task.id} className="border border-slate-900/80 bg-slate-900/15 rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-200">{task.title}</span>
                      <span className="text-[9px] bg-emerald-950 text-emerald-300 font-medium px-2 py-0.5 rounded">
                        +{task.actualDuration || task.estimatedDuration}m checked
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{task.description}</p>
                    <div className="text-[9px] text-slate-600">
                      Finished at: {new Date(task.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Stakeholder Communications Log Ledger */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
              🛡️ Stakeholder Shield Logs
            </h2>

            {commLogs.length === 0 ? (
              <div className="border border-dashed border-slate-900 rounded-xl py-12 text-center text-slate-600 text-xs">
                No communications drafted yet. Request time extension in Focus Mode to view.
              </div>
            ) : (
              <div className="space-y-3">
                {commLogs
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map(log => (
                    <div key={log.id} className="border border-slate-900/80 bg-slate-900/15 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-indigo-400">To: {log.stakeholder}</span>
                        <span className="text-[9px] text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-mono italic">Regarding: "{log.taskTitle}"</p>
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded font-sans text-[10px] text-slate-400 leading-normal max-h-[140px] overflow-y-auto whitespace-pre-wrap">
                        {log.draft}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>

        </div>

      </main>
    </div>
  );
}
