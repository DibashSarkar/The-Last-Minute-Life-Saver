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
      if (!user) { window.location.href = "/login"; return; }
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
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-sans">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
          <span className="text-sm font-medium">Loading your history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-16 transition-colors duration-300">

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1 transition-colors">
          ← Back to My Tasks
        </a>
        <h1 className="text-xs font-semibold tracking-wider text-primary uppercase flex items-center gap-2">
          🏆 My Wins & History
        </h1>
      </header>

      <main className="max-w-5xl mx-auto w-full px-6 mt-8 space-y-8 flex-1 text-left">

        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-border bg-card rounded-2xl p-6 space-y-2 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-lg shrink-0">✅</div>
              <span className="text-xs font-bold text-foreground">Tasks I Finished</span>
            </div>
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{completedTasks.length}</div>
            <p className="text-[10px] text-muted-foreground">Tasks you completed using the Focus Timer. Great job! 🎉</p>
          </div>

          <div className="border border-border bg-card rounded-2xl p-6 space-y-2 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-lg shrink-0">✉️</div>
              <span className="text-xs font-bold text-foreground">Delay Messages Sent</span>
            </div>
            <div className="text-4xl font-black text-rose-600 dark:text-rose-400 tabular-nums">{commLogs.length}</div>
            <p className="text-[10px] text-muted-foreground">Times AI wrote a professional delay message to someone on your behalf.</p>
          </div>
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Completed Tasks */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-base">🏆</span>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wide">Completed Tasks</h2>
            </div>

            {completedTasks.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl py-14 text-center text-muted-foreground/60 text-sm bg-card space-y-2">
                <div className="text-3xl">🌟</div>
                <p>No finished tasks yet. Complete your first task in Focus Mode!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <div key={task.id} className="border border-border bg-card rounded-2xl p-5 space-y-1.5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{task.title}</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                        ✓ {task.actualDuration || task.estimatedDuration} min
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{task.description}</p>
                    )}
                    <div className="text-[9px] text-muted-foreground/50">
                      Finished: {new Date(task.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Delay Messages Sent */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-base">✉️</span>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wide">Delay Messages I Sent</h2>
            </div>

            {commLogs.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl py-14 text-center text-muted-foreground/60 text-sm bg-card space-y-2">
                <div className="text-3xl">📭</div>
                <p>No messages yet. If you ever fall behind, use "Need to Apologize for a Delay?" in Focus Mode.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {commLogs
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map(log => (
                    <div key={log.id} className="border border-border bg-card rounded-2xl p-5 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-primary">📤 To: {log.stakeholder}</span>
                        <span className="text-[9px] text-muted-foreground">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">About: "{log.taskTitle}"</p>
                      <div className="p-3 bg-muted/40 border border-border rounded-xl font-sans text-[10px] text-foreground leading-normal max-h-[140px] overflow-y-auto whitespace-pre-wrap">
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
