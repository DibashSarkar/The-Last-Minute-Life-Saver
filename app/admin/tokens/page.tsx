"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, getTokenConsumption } from "@/lib/firebase";

export default function AdminTokensPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ flashCount: 0, proCount: 0 });

  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setLoading(false);

      const tStats = getTokenConsumption();
      setStats(tStats);
    }
    checkAuthAndLoad();
  }, []);

  const totalTokens = stats.flashCount + stats.proCount;
  const flashPercentage = totalTokens > 0 ? (stats.flashCount / totalTokens) * 100 : 0;
  const proPercentage = totalTokens > 0 ? (stats.proCount / totalTokens) * 100 : 0;

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
          LLM Consumption Diagnostics
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
          <a href="/admin/tokens" className="p-3.5 rounded-xl bg-primary/10 text-primary border border-primary/20 transition-all font-semibold">
            Token Expenditures
          </a>
          <a href="/admin/logs" className="p-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-semibold">
            System Cron Logs
          </a>
        </aside>

        {/* Content Node */}
        <main className="md:col-span-3 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xs font-semibold tracking-widest text-primary uppercase">LLM Consumption Diagnostics</h2>
            <p className="text-[10px] text-muted-foreground">Comparative token metrics for routing flows (Gemini Flash vs Pro).</p>
          </div>

          {/* Cards distribution details */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="border border-border bg-card rounded-2xl p-6 space-y-1.5 shadow-sm">
              <div className="flex justify-between items-center text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                <span>⚡ GEMINI 1.5 FLASH</span>
                <span>{flashPercentage.toFixed(0)}%</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">{stats.flashCount.toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">tokens</span></div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Used in raw text parsing triages, velocity re-schedulers, and timeline negotiators.</p>
            </div>

            <div className="border border-border bg-card rounded-2xl p-6 space-y-1.5 shadow-sm">
              <div className="flex justify-between items-center text-[10px] font-semibold text-primary">
                <span>🧠 GEMINI 1.5 PRO</span>
                <span>{proPercentage.toFixed(0)}%</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">{stats.proCount.toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">tokens</span></div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Used in deep pre-research scaffold generation and Stakeholder Shield delay copy messages.</p>
            </div>

          </section>

          {/* Graphical token expenditure progress bar */}
          <section className="bg-card border border-border rounded-[2rem] p-8 space-y-4 text-xs shadow-xl">
            <span className="font-semibold text-foreground">Token Allocation Ratio</span>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden flex">
              <div 
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${flashPercentage}%` }}
                title={`Flash: ${flashPercentage.toFixed(1)}%`}
              ></div>
              <div 
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${proPercentage}%` }}
                title={`Pro: ${proPercentage.toFixed(1)}%`}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium pt-1.5">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Gemini 1.5 Flash ({stats.flashCount})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-primary"></span> Gemini 1.5 Pro ({stats.proCount})</span>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}
