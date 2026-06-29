"use client";

import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1">
          ← Back to Homepage
        </Link>
        <h1 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">
          Terms & Conditions
        </h1>
      </header>

      <main className="max-w-3xl mx-auto w-full px-6 mt-12 space-y-6 flex-1 text-xs text-slate-400 leading-relaxed">
        <h2 className="text-lg font-semibold text-white">User License Agreement</h2>
        <p className="text-[10px] text-slate-500 font-mono">Last modified: June 27, 2026</p>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">1. Acceptance of Terms</h3>
          <p>
            By accessing or using The Last-Minute Life Saver platform ("Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">2. Description of Service</h3>
          <p>
            The Service provides AI-assisted calendar scheduling, task triaging via natural language parsing, and communication draft assistance ("Stakeholder Shield"). The Service routes requests under-the-hood to Gemini LLMs via Google AI Studio APIs to facilitate these features.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">3. User Responsibilities & Autonomous Shifting</h3>
          <p>
            The Service utilizes automated algorithms to shift calendar blocks when deadlines are missed. You acknowledge that:
          </p>
          <ul className="list-disc pl-4 space-y-1.5 list-inside">
            <li>Autonomous scheduling shifts are suggestions and final commitments are your sole responsibility.</li>
            <li>You are responsible for reviewing and approving all drafted stakeholder extension messages before sending them. We are not liable for communication mishaps resulting from unscreened text.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">4. Limitation of Liability</h3>
          <p>
            In no event shall The Last-Minute Life Saver, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-[10px] text-slate-600">
        &copy; {new Date().getFullYear()} The Last-Minute Life Saver. All rights reserved.
      </footer>
    </div>
  );
}
