"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, getSystemLogs } from "@/lib/firebase";

export default function AdminLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string }>>([]);

  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      if (user.role !== "admin") {
        window.location.href = "/dashboard";
        return;
      }
      setLoading(false);

      const sysLogs = getSystemLogs();
      setLogs(sysLogs);
    }
    checkAuthAndLoad();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span>Accessing Administration Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-16 transition-colors duration-300">
      
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1 transition-colors">
          ← Exit Admin Area
        </a>
        <h1 className="text-xs font-semibold tracking-wider text-primary uppercase">
          System Infrastructure Monitor
        </h1>
      </header>

      {/* Main Layout */}
      <div className="max-w-5xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mt-8 flex-1 text-left">
        
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-2 text-xs font-semibold flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block pb-1">Cockpit Nodes</span>
          <a href="/admin" className="p-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-semibold">
            Overview Stats
          </a>
          <a href="/admin/users" className="p-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-semibold">
            Users Cohort Table
          </a>
          <a href="/admin/tokens" className="p-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-semibold">
            Token Expenditures
          </a>
          <a href="/admin/logs" className="p-3.5 rounded-xl bg-primary/10 text-primary border border-primary/20 transition-all font-semibold">
            System Cron Logs
          </a>
        </aside>

        {/* Content Node */}
        <main className="md:col-span-3 space-y-6 flex flex-col h-full">
          <div className="space-y-1.5">
            <h2 className="text-xs font-semibold tracking-widest text-primary uppercase">System Infrastructure Monitor</h2>
            <p className="text-[10px] text-muted-foreground">Live scrolling terminal printing cron recalibration events, API endpoints, and DB writes.</p>
          </div>

          {/* Terminal Console */}
          <section className="bg-[#0A0F1D] border border-border rounded-2xl p-6 font-mono text-[10px] text-emerald-400 flex-1 min-h-[400px] max-h-[500px] overflow-y-auto space-y-2.5 shadow-2xl relative">
            <div className="absolute top-2.5 right-4 text-[8px] text-slate-700 uppercase tracking-widest font-sans select-none font-semibold">
              life-saver-core-v1.log
            </div>
            
            {logs.length === 0 ? (
              <div className="text-slate-600 italic select-none">
                No logger entries registered.
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="leading-relaxed hover:bg-white/[0.02] py-0.5 transition-colors">
                  <span className="text-slate-500 select-none">[{log.timestamp}]</span>{" "}
                  <span className="text-slate-400 font-semibold select-none">[INFO]</span>{" "}
                  <span className="text-emerald-300">{log.message}</span>
                </div>
              ))
            )}
          </section>

        </main>

      </div>
    </div>
  );
}
