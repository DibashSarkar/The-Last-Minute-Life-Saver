"use client";

import React from "react";
import Link from "next/link";

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1">
          ← Back to Homepage
        </Link>
        <h1 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">
          Cookie Disclosure
        </h1>
      </header>

      <main className="max-w-3xl mx-auto w-full px-6 mt-12 space-y-6 flex-1 text-xs text-slate-400 leading-relaxed">
        <h2 className="text-lg font-semibold text-white">Tracking & Storage Policy</h2>
        <p className="text-[10px] text-slate-500 font-mono">Last modified: June 27, 2026</p>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">1. Usage of Session Storage</h3>
          <p>
            The Last-Minute Life Saver uses localStorage and cookies to maintain active session configurations and local Sandbox database entries:
          </p>
          <ul className="list-disc pl-4 space-y-1.5 list-inside text-slate-400">
            <li><strong>Authentication Sessions:</strong> Store virtual logins and user profile references so you stay authenticated.</li>
            <li><strong>Sandbox Mode Databases:</strong> Stored under the `life_saver_` namespaces inside your browser's LocalStorage to allow offline mock database functionality.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">2. Third-Party Tracking</h3>
          <p>
            The platform does not deploy analytics cookies, advertising beacons, or third-party marketing tracking scripts. All data interactions are kept clean and focused strictly on productivity.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-[10px] text-slate-600">
        &copy; {new Date().getFullYear()} The Last-Minute Life Saver. All rights reserved.
      </footer>
    </div>
  );
}
