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
      setLoading(false);

      const sysLogs = getSystemLogs();
      setLogs(sysLogs);
    }
    checkAuthAndLoad();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span>Accessing Administration Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1">
          ← Exit Admin Area
        </a>
        <h1 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">
          System Infrastructure Monitor
        </h1>
      </header>

      {/* Main Layout */}
      <div className="max-w-5xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mt-8 flex-1">
        
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-2 text-xs font-semibold">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block pb-1">Cockpit Nodes</span>
          <a href="/admin" className="block p-3 rounded-lg bg-slate-900/35 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800">
            Overview Stats
          </a>
          <a href="/admin/users" className="block p-3 rounded-lg bg-slate-900/35 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800">
            Users Cohort Table
          </a>
          <a href="/admin/tokens" className="block p-3 rounded-lg bg-slate-900/35 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800">
            Token Expenditures
          </a>
          <a href="/admin/logs" className="block p-3 rounded-lg bg-indigo-950/20 text-indigo-300 border border-indigo-900/40">
            System Cron Logs
          </a>
        </aside>

        {/* Content Node */}
        <main className="md:col-span-3 space-y-6 flex flex-col h-full">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">System Infrastructure Monitor</h2>
            <p className="text-[10px] text-slate-500">Live scrolling terminal printing cron recalibration events, API endpoints, and DB writes.</p>
          </div>

          {/* Terminal Console */}
          <section className="bg-black border border-slate-900 rounded-2xl p-6 font-mono text-[10px] text-emerald-400 flex-1 min-h-[400px] max-h-[500px] overflow-y-auto space-y-2.5 shadow-2xl relative">
            <div className="absolute top-2 right-4 text-[8px] text-slate-800 uppercase tracking-wider font-sans select-none">
              life-saver-core-v1.log
            </div>
            
            {logs.length === 0 ? (
              <div className="text-slate-700 italic select-none">
                No logger entries registered.
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="leading-relaxed hover:bg-slate-950/50 py-0.5 transition-colors">
                  <span className="text-slate-600 select-none">[{log.timestamp}]</span>{" "}
                  <span className="text-slate-500 font-bold select-none">[INFO]</span>{" "}
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
