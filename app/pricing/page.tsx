"use client";

import React from "react";

export default function PricingPage() {
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
          <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Tiers & Limits</span>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Choose Your Level of Safety</h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Select the tier that matches your frequency of crisis. Get access to state-of-the-art LLM pipelines.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto pt-6">
          
          {/* Free Tier */}
          <div className="border border-slate-900 bg-slate-900/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Free Triage</span>
              <h3 className="text-lg font-semibold text-slate-200">Flash Starter</h3>
              <div className="text-2xl font-semibold text-white">$0 <span className="text-xs text-slate-600 font-normal">/ forever</span></div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Perfect for basic personal task triaging and automated calendar blocks allocation.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 list-inside list-disc">
                <li>Under-the-hood routing to Gemini 1.5 Flash</li>
                <li>Panic brain-dump parsing (Max 3/day)</li>
                <li>Daily timeline auto-scheduling</li>
                <li>Offline/LocalStorage fallback sandbox</li>
              </ul>
            </div>
            <a 
              href="/signup" 
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-center font-semibold text-xs py-2.5 rounded-xl transition-all"
            >
              Sign Up Free
            </a>
          </div>

          {/* Premium Pro Tier */}
          <div className="border border-indigo-500/30 bg-indigo-950/10 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl shadow-indigo-950/20 relative">
            <div className="absolute -top-3 left-6 px-2 py-0.5 bg-indigo-600 text-white rounded text-[8px] font-semibold uppercase tracking-widest animate-pulse">
              recommended
            </div>
            
            <div className="space-y-3">
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Enterprise Grade</span>
              <h3 className="text-lg font-semibold text-slate-100">Pro Shield</h3>
              <div className="text-2xl font-semibold text-white">$12 <span className="text-xs text-slate-600 font-normal">/ month</span></div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our flagship productivity armor. Routes heavy cognitive scaffolding pipelines to Gemini Pro.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 list-inside list-disc">
                <li><strong>All Flash Starter features</strong></li>
                <li><strong>Gemini 1.5 Pro</strong> Pre-Research Assets</li>
                <li><strong>Stakeholder Shield</strong> Crisis Communication generator</li>
                <li>Unlimited Panic brain dump triage sessions</li>
                <li>Real-time calendar shifting & auto-negotiations</li>
              </ul>
            </div>
            
            <a 
              href="/signup" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-center font-semibold text-xs py-2.5 rounded-xl shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.02]"
            >
              Upgrade to Pro Shield
            </a>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} The Last-Minute Life Saver. All rights reserved.
      </footer>
    </div>
  );
}
