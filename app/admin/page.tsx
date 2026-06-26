"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/firebase";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [outageMode, setOutageMode] = useState(false);
  const [latency, setLatency] = useState(42);

  useEffect(() => {
    async function checkAdminAuth() {
      const user = await getCurrentUser();
      // Since it's a sandbox/demo, let any guest email enter, but check session first
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setLoading(false);
    }
    checkAdminAuth();
  }, []);

  // Update mock latency dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = prev + delta;
        return next > 20 && next < 120 ? next : prev;
      });
    }, 3000);
    return () => clearInterval(interval);
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
          Global Operations Center
        </h1>
      </header>

      {/* Main Admin layout */}
      <div className="max-w-5xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mt-8 flex-1">
        
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-2 text-xs font-semibold">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block pb-1">Cockpit Nodes</span>
          <a href="/admin" className="block p-3 rounded-lg bg-indigo-950/20 text-indigo-300 border border-indigo-900/40">
            Overview Stats
          </a>
          <a href="/admin/users" className="block p-3 rounded-lg bg-slate-900/35 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800">
            Users Cohort Table
          </a>
          <a href="/admin/tokens" className="block p-3 rounded-lg bg-slate-900/35 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800">
            Token Expenditures
          </a>
          <a href="/admin/logs" className="block p-3 rounded-lg bg-slate-900/35 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800">
            System Cron Logs
          </a>
        </aside>

        {/* Content Node */}
        <main className="md:col-span-3 space-y-8">
          
          {/* Outage mode flex banner */}
          {outageMode && (
            <div className="bg-rose-950/50 border border-rose-800 text-rose-300 text-xs p-4 rounded-xl animate-pulse">
              🚨 <strong>SIMULATED INFRASTRUCTURE OUTAGE ACTIVE:</strong> LLM response fallback sandbox will handle all pipeline requests locally.
            </div>
          )}

          {/* Stats metrics */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Cloud Run Instance</span>
              <div className="text-2xl font-semibold text-emerald-400">HEALTHY</div>
              <p className="text-[10px] text-slate-500">Node status reporting active</p>
            </div>

            <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Host Latency</span>
              <div className="text-2xl font-semibold text-white">{latency} ms</div>
              <p className="text-[10px] text-slate-500">Average response speed metrics</p>
            </div>

            <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Database Sync</span>
              <div className="text-2xl font-semibold text-white">Firestore</div>
              <p className="text-[10px] text-slate-500">Real-time listeners running</p>
            </div>

          </section>

          {/* System Control Switches */}
          <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Infrastructure Operations switches
            </h3>

            <div className="flex items-center justify-between p-4 border border-slate-900 bg-slate-950/40 rounded-xl text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-300">Simulate Host Interruption (Outage Mode)</span>
                <p className="text-[10px] text-slate-500">Force LLM endpoints to bypass live API calls and trigger local mock logic.</p>
              </div>
              <button
                onClick={() => setOutageMode(!outageMode)}
                className={`px-4 py-2 rounded-lg font-semibold text-[10px] tracking-wide uppercase transition-all ${
                  outageMode 
                    ? "bg-rose-600 hover:bg-rose-500 text-white" 
                    : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400"
                }`}
              >
                {outageMode ? "Deactivate" : "Activate"}
              </button>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}
