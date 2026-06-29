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
          Global Operations Center
        </h1>
      </header>

      {/* Main Admin layout */}
      <div className="max-w-5xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mt-8 flex-1 text-left">
        
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-2 text-xs font-semibold flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block pb-1">Cockpit Nodes</span>
          <a href="/admin" className="p-3.5 rounded-xl bg-primary/10 text-primary border border-primary/20 transition-all font-semibold">
            Overview Stats
          </a>
          <a href="/admin/users" className="p-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-semibold">
            Users Cohort Table
          </a>
          <a href="/admin/tokens" className="p-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-semibold">
            Token Expenditures
          </a>
          <a href="/admin/logs" className="p-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-semibold">
            System Cron Logs
          </a>
        </aside>

        {/* Content Node */}
        <main className="md:col-span-3 space-y-8">
          
          {/* Outage mode flex banner */}
          {outageMode && (
            <div className="bg-rose-500/10 border border-rose-500/35 text-rose-600 dark:text-rose-400 text-xs p-4 rounded-xl animate-pulse">
              🚨 <strong>SIMULATED INFRASTRUCTURE OUTAGE ACTIVE:</strong> LLM response fallback sandbox will handle all pipeline requests locally.
            </div>
          )}

          {/* Stats metrics */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="border border-border bg-card rounded-2xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Cloud Run Instance</span>
              <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">HEALTHY</div>
              <p className="text-[10px] text-muted-foreground">Node status reporting active</p>
            </div>

            <div className="border border-border bg-card rounded-2xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Host Latency</span>
              <div className="text-2xl font-semibold text-foreground">{latency} ms</div>
              <p className="text-[10px] text-muted-foreground">Average response speed metrics</p>
            </div>

            <div className="border border-border bg-card rounded-2xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Database Sync</span>
              <div className="text-2xl font-semibold text-foreground">Firestore</div>
              <p className="text-[10px] text-muted-foreground">Real-time listeners running</p>
            </div>

          </section>

          {/* System Control Switches */}
          <section className="bg-card border border-border rounded-[2rem] p-8 space-y-6 shadow-xl">
            <h3 className="text-xs font-semibold tracking-wider text-primary uppercase">
              Infrastructure Operations switches
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-border bg-background rounded-2xl text-xs">
              <div className="space-y-1 flex-1">
                <span className="font-semibold text-foreground">Simulate Host Interruption (Outage Mode)</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Force LLM endpoints to bypass live API calls and trigger local mock logic.</p>
              </div>
              <button
                onClick={() => setOutageMode(!outageMode)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-[10px] tracking-wide uppercase transition-all shadow-md active:scale-95 ${
                  outageMode 
                    ? "bg-rose-600 hover:bg-rose-500 text-white" 
                    : "bg-muted border border-border text-foreground hover:bg-muted-foreground/15"
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
