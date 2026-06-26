"use client";

import React, { useState, useEffect } from "react";

export default function MarketingHome() {
  const [deadlinesSaved, setDeadlinesSaved] = useState(14842);
  const [activeShiftIndex, setActiveShiftIndex] = useState(0);

  // Increment social proof counter
  useEffect(() => {
    const interval = setInterval(() => {
      setDeadlinesSaved(prev => prev + Math.floor(Math.random() * 2) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Shifting calendar loop simulation
  const shiftScenarios = [
    {
      time: "14:00 PM",
      status: "EXPIRED (LATE)",
      title: "Write Landing Page Ad Copy",
      action: "⚡ Auto-Negotiating timeline...",
      color: "border-rose-500/40 bg-rose-950/10 text-rose-300"
    },
    {
      time: "14:15 PM",
      status: "SHIFTED",
      title: "Write Landing Page Ad Copy",
      action: "✓ Postponed 'Check Slack' to tomorrow. Space allocated.",
      color: "border-indigo-500/40 bg-indigo-950/10 text-indigo-300"
    },
    {
      time: "15:30 PM",
      status: "SAFE",
      title: "Draft Manager Weekly Report",
      action: "🟢 Scheduled in next available slot",
      color: "border-slate-800 bg-slate-900/30 text-slate-400"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveShiftIndex(prev => (prev + 1) % shiftScenarios.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-900/60 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight">The Last-Minute Life Saver</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-semibold">
          <a href="/features" className="hover:text-slate-200 transition-colors">Features</a>
          <a href="/pricing" className="hover:text-slate-200 transition-colors">Pricing</a>
          <a href="/contact" className="hover:text-slate-200 transition-colors">Support</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors">
            Login
          </a>
          <a href="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Start Triaging Free
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/50 border border-indigo-500/20 rounded-full text-[10px] text-indigo-400 font-semibold uppercase tracking-wider animate-pulse">
          ⚡ Powered by Gemini 1.5 Pro & Flash
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white leading-tight max-w-4xl">
          Triage your panic. <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Auto-negotiate your calendar.</span>
        </h1>

        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Traditional to-do apps just turn your missed deadlines red and induce anxiety. The Last-Minute Life Saver is an agentic productivity tool that proactively structures messy brain dumps, shifts calendars on the fly, and drafts stakeholder communication messages when delays happen.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a href="/signup" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Unpack Your Panic Now
          </a>
          <a href="/features" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-8 py-3.5 rounded-xl transition-all">
            See How it Works
          </a>
        </div>

        {/* Live deadlines saved social proof */}
        <div className="text-xs text-slate-500 flex items-center justify-center gap-2 pt-6">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span><strong>{deadlinesSaved.toLocaleString()}</strong> deadlines saved worldwide today.</span>
        </div>

        {/* Interactive Calendar Shifting Preview */}
        <div className="max-w-2xl w-full border border-slate-900 bg-slate-900/10 rounded-2xl p-6 text-left relative overflow-hidden backdrop-blur-sm mt-12 shadow-2xl">
          <div className="absolute top-2 right-4 text-[9px] text-slate-700 uppercase tracking-wider font-mono">
            live simulator loop
          </div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Dynamic "Crisis Shift" Simulation
          </h3>

          <div className="space-y-3">
            {shiftScenarios.map((scen, idx) => (
              <div
                key={idx}
                className={`border rounded-xl p-4 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  idx === activeShiftIndex
                    ? `${scen.color} border-indigo-500/50 scale-[1.01] shadow-lg`
                    : "opacity-40 border-slate-900 bg-slate-950/20 text-slate-600"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold tracking-wider font-mono opacity-80">{scen.time} — {scen.status}</span>
                  <span className="text-xs font-semibold pt-0.5">{scen.title}</span>
                </div>
                <div className="text-[10px] font-mono italic opacity-95 md:text-right font-semibold">
                  {scen.action}
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Footer Compliance Links */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} The Last-Minute Life Saver. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <a href="/terms-and-conditions" className="hover:text-slate-300">Terms of Use</a>
            <a href="/privacy-policy" className="hover:text-slate-300">Privacy Policy</a>
            <a href="/cookie-policy" className="hover:text-slate-300">Cookie Disclosure</a>
            <a href="/disclaimer" className="hover:text-slate-300">Accountability Disclaimer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
