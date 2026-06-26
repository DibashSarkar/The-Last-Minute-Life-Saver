"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, getSettings, saveSettings, UserSettings } from "@/lib/firebase";

export default function SettingsPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [workingStart, setWorkingStart] = useState("09:00");
  const [workingEnd, setWorkingEnd] = useState("17:00");
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setLoadingUser(false);

      const st = await getSettings();
      setWorkingStart(st.workingHours?.start || "09:00");
      setWorkingEnd(st.workingHours?.end || "17:00");
      setFocusDuration(st.pomodoroConfig?.focusDuration || 25);
      setBreakDuration(st.pomodoroConfig?.breakDuration || 5);
    }
    checkAuthAndLoad();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    try {
      await saveSettings({
        workingHours: { start: workingStart, end: workingEnd },
        pomodoroConfig: { focusDuration, breakDuration }
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span>Loading settings dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1">
          ← Back to Cockpit
        </a>
        <h1 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">
          Profile Settings & Tokens
        </h1>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-md mx-auto w-full px-6 mt-8 flex-1 flex flex-col justify-center">
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase">Parameters Configuration</h2>
            <p className="text-[10px] text-slate-500">Edit scheduler constraints and Pomodoro parameters.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Working Hours */}
            <div className="space-y-2 border-b border-slate-900 pb-4">
              <span className="font-semibold text-slate-300">Active Office Block Hours</span>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-slate-500">Start Time</label>
                  <input
                    type="time"
                    value={workingStart}
                    onChange={(e) => setWorkingStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">End Time</label>
                  <input
                    type="time"
                    value={workingEnd}
                    onChange={(e) => setWorkingEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Pomodoro settings */}
            <div className="space-y-2 border-b border-slate-900 pb-4">
              <span className="font-semibold text-slate-300">Focus Session Durations</span>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-slate-500">Focus (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={focusDuration}
                    onChange={(e) => setFocusDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-center font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Break (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-center font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Mock Credentials Display */}
            <div className="space-y-2 pb-2">
              <span className="font-semibold text-slate-300">Linked Calendar APIs</span>
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Google Calendar OAuth Link</span>
                  <span className="text-emerald-400 font-semibold">✓ ENABLED</span>
                </div>
                <div className="text-[9px] text-slate-600 font-mono">
                  Token: ya29.a0AfH6SM...
                </div>
              </div>
            </div>

            {isSaved ? (
              <div className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-lg text-center font-semibold animate-pulse">
                ✓ Parameters Synced!
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </button>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} The Last-Minute Life Saver. All rights reserved.
      </footer>
    </div>
  );
}
