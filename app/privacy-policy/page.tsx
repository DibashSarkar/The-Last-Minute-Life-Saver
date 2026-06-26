"use client";

import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/" className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1">
          ← Back to Homepage
        </a>
        <h1 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">
          Privacy Policy
        </h1>
      </header>

      <main className="max-w-3xl mx-auto w-full px-6 mt-12 space-y-6 flex-1 text-xs text-slate-400 leading-relaxed">
        <h2 className="text-lg font-semibold text-white">Data Governance Statement</h2>
        <p className="text-[10px] text-slate-500 font-mono">Last modified: June 27, 2026</p>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">1. Information Collection</h3>
          <p>
            We collect information you provide directly to us when using the Service. This includes task names, descriptions, working hours, and unstructured text brain dumps typed into the cockpit panel.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">2. Processing & LLM Integration (Google AI Studio)</h3>
          <p>
            To facilitate triage parsing, pre-research brainstorming, and drafting, your typed dumps and task items are transmitted to Google AI Studio APIs. We adhere to the following privacy rules:
          </p>
          <ul className="list-disc pl-4 space-y-1.5 list-inside">
            <li>Data transmitted to Google AI Studio APIs is governed by the Google APIs Terms of Service.</li>
            <li>We do not sell, rent, or lease your private task details or calendar items to third parties.</li>
            <li>In Sandbox mode, data is processed locally inside your browser's localStorage, maintaining complete privacy.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">3. Storage & Real-Time Syncing</h3>
          <p>
            When Firebase credentials are connected, your settings, profiles, tasks, and scheduled calendar blocks are stored securely in Firebase Firestore. We implement strict security rules to prevent unauthorized read/write actions.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">4. User Controls</h3>
          <p>
            You have the right to inspect, edit, or delete any task, timeblock, or settings entry at any time directly through the dashboard. Deleting a task immediately purges it from the database.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-[10px] text-slate-600">
        &copy; {new Date().getFullYear()} The Last-Minute Life Saver. All rights reserved.
      </footer>
    </div>
  );
}
