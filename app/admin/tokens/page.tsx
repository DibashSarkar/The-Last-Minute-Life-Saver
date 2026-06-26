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
          LLM Consumption Diagnostics
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
          <a href="/admin/tokens" className="block p-3 rounded-lg bg-indigo-950/20 text-indigo-300 border border-indigo-900/40">
            Token Expenditures
          </a>
          <a href="/admin/logs" className="block p-3 rounded-lg bg-slate-900/35 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800">
            System Cron Logs
          </a>
        </aside>

        {/* Content Node */}
        <main className="md:col-span-3 space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">LLM Consumption Diagnostics</h2>
            <p className="text-[10px] text-slate-500">Comparative token metrics for routing flows (Gemini Flash vs Pro).</p>
          </div>

          {/* Cards distribution details */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-5 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-semibold text-yellow-400">
                <span>⚡ GEMINI 1.5 FLASH</span>
                <span>{flashPercentage.toFixed(0)}%</span>
              </div>
              <div className="text-2xl font-semibold text-white">{stats.flashCount.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">tokens</span></div>
              <p className="text-[10px] text-slate-500 leading-normal">Used in raw text parsing triages, velocity re-schedulers, and timeline negotiators.</p>
            </div>

            <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-5 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-semibold text-indigo-300">
                <span>🧠 GEMINI 1.5 PRO</span>
                <span>{proPercentage.toFixed(0)}%</span>
              </div>
              <div className="text-2xl font-semibold text-white">{stats.proCount.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">tokens</span></div>
              <p className="text-[10px] text-slate-500 leading-normal">Used in deep pre-research scaffold generation and Stakeholder Shield delay copy messages.</p>
            </div>

          </section>

          {/* Graphical token expenditure progress bar */}
          <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4 text-xs">
            <span className="font-semibold text-slate-300">Token Allocation Ratio</span>
            <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden flex">
              <div 
                className="bg-yellow-500 h-full transition-all duration-500"
                style={{ width: `${flashPercentage}%` }}
                title={`Flash: ${flashPercentage.toFixed(1)}%`}
              ></div>
              <div 
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{ width: `${proPercentage}%` }}
                title={`Pro: ${proPercentage.toFixed(1)}%`}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-yellow-500"></span> Gemini 1.5 Flash ({stats.flashCount})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Gemini 1.5 Pro ({stats.proCount})</span>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}
