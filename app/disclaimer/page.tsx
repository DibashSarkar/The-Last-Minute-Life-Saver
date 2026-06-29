"use client";

import React from "react";
import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1">
          ← Back to Homepage
        </Link>
        <h1 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">
          AI Accountability Disclaimer
        </h1>
      </header>

      <main className="max-w-3xl mx-auto w-full px-6 mt-12 space-y-6 flex-1 text-xs text-slate-400 leading-relaxed">
        <h2 className="text-lg font-semibold text-white">AI Accountability Statement</h2>
        <p className="text-[10px] text-slate-500 font-mono">Last modified: June 27, 2026</p>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">1. Nature of Generated Outputs</h3>
          <p>
            The Last-Minute Life Saver platform utilizes machine learning language models (specifically Gemini 1.5 Flash and Gemini 1.5 Pro) to analyze user-inputted descriptions and propose schedules, checklists, and extension requests.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">2. Ultimate Human Responsibility</h3>
          <p>
            While our companion is designed to maximize task completion efficiency and reduce cognitive friction, the final responsibility for real-world commitments, actual delivery of work, and meeting external deadlines lies entirely with the human user.
          </p>
          <ul className="list-disc pl-4 space-y-1.5 list-inside text-slate-400">
            <li><strong>Timeline calibration shifts:</strong> Shifting timeblocks in the digital timeline does not guarantee external acceptance of delays.</li>
            <li><strong>Stakeholder messages:</strong> Drafts provided by the Stakeholder Shield are tools to save writing time. You must check the language, tone, and accuracy of every draft before sending.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">3. Failsafe Operation</h3>
          <p>
            In the event of network interruptions, system downtime, or API quota exhaustions, the Service implements local fallback algorithms to continue offline schedule calculations. The host assumes no liability for discrepancies between offline estimations and subsequent online updates.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-[10px] text-slate-600">
        &copy; {new Date().getFullYear()} The Last-Minute Life Saver. All rights reserved.
      </footer>
    </div>
  );
}
