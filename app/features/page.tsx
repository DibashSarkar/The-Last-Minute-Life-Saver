"use client";

import React from "react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-900/60 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">The Last-Minute Life Saver</span>
        </a>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors">
            Login
          </a>
          <a href="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">
            Get Started
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-6 py-16 flex-1 space-y-12">
        <div className="space-y-4 text-center">
          <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Under The Hood</span>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Engine Specifications</h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            The Last-Minute Life Saver is built around a dynamic scheduling scheduler combined with Google's state-of-the-art Gemini LLM endpoints.
          </p>
        </div>

        {/* Core Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          
          <div className="border border-slate-900 bg-slate-900/10 rounded-2xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
              ⚡
            </div>
            <h3 className="text-sm font-semibold text-white">Gemini 1.5 Flash Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Processes unstructured, panicked text and breaks it into atomic items in sub-second timelines. Recalculates logs and shifted schedules in real-time.
            </p>
          </div>

          <div className="border border-slate-900 bg-slate-900/10 rounded-2xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              🧠
            </div>
            <h3 className="text-sm font-semibold text-white">Gemini 1.5 Pro Scaffolding</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes task contexts to pre-generate copywriting headlines, target audiences, and structured skeletons. Eliminates cold-start blank page syndrome.
            </p>
          </div>

          <div className="border border-slate-900 bg-slate-900/10 rounded-2xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              ⚖️
            </div>
            <h3 className="text-sm font-semibold text-white">Prioritization Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically sequences tasks mathematically using an Eisenhower Matrix coordinate model weighted by deadline proximity and downstream dependency counts.
            </p>
          </div>

        </div>

        {/* Mathematical Formulas Detail Panel */}
        <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-8 space-y-6">
          <h3 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">Core Algorithms</h3>
          
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <span className="font-semibold text-slate-300">1. Eisenhower Priority Score</span>
              <p className="text-slate-400 leading-relaxed">
                Each task is assigned a priority value based on matrix weightings, deadline time, and dependency trees:
              </p>
              <div className="bg-slate-950 p-3.5 rounded border border-slate-900/80 font-mono text-[10px] text-indigo-300">
                Score = BaseScore(Importance, Urgency) + DeadlineProximityBonus + (DownstreamBlockedTasks * 12)
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-300">2. Velocity-Aware Recalibration</span>
              <p className="text-slate-400 leading-relaxed">
                As checkmarks are recorded during Focus mode, the scheduler compares actual time spent against the initial estimate:
              </p>
              <div className="bg-slate-950 p-3.5 rounded border border-slate-900/80 font-mono text-[10px] text-indigo-300">
                ExpectedProgressRate = CheckedSteps / TotalSteps<br />
                Velocity = ActualElapsedMinutes / (ExpectedProgressRate * EstimatedDuration)<br />
                ShiftMinutes = Math.ceil((EstimatedDuration * Velocity) - EstimatedDuration) [If Velocity &gt; 1.15]
              </div>
              <p className="text-[10px] text-slate-500">
                Downstream timeline slots are shifted forward by ShiftMinutes automatically in the database when threshold limits are breached.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} The Last-Minute Life Saver. All rights reserved.
      </footer>
    </div>
  );
}
