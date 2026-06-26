"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, setOnboardingCompleted, saveSettings, UserSettings } from "@/lib/firebase";

export default function OnboardingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [step, setStep] = useState(1);

  // Form States
  const [calendarLinked, setCalendarLinked] = useState<string | null>(null);
  const [workingStart, setWorkingStart] = useState("09:00");
  const [workingEnd, setWorkingEnd] = useState("17:00");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setCurrentUser(user);
      setLoadingUser(false);
    }
    checkAuth();
  }, []);

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleCompleteOnboarding = async () => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      // 1. Save onboarding settings
      await saveSettings({
        workingHours: { start: workingStart, end: workingEnd },
        currentEnergyState: "high",
        pomodoroConfig: { focusDuration: 25, breakDuration: 5 }
      });

      // 2. Set onboarded = true in auth state
      await setOnboardingCompleted(currentUser.uid);
      
      // 3. Go to cockpit
      window.location.href = "/dashboard";
    } catch (e) {
      console.error(e);
      alert("Failed to save configuration settings.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span>Loading onboarding details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900/40 border border-slate-900 rounded-2xl p-8 backdrop-blur-sm shadow-xl space-y-6">
        
        {/* Progress indicators */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>STEP {step} OF 3</span>
          <div className="flex gap-1.5">
            <div className={`w-6 h-1 rounded ${step >= 1 ? "bg-indigo-500" : "bg-slate-800"}`}></div>
            <div className={`w-6 h-1 rounded ${step >= 2 ? "bg-indigo-500" : "bg-slate-800"}`}></div>
            <div className={`w-6 h-1 rounded ${step >= 3 ? "bg-indigo-500" : "bg-slate-800"}`}></div>
          </div>
        </div>

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="space-y-2 text-center">
              <h1 className="text-xl font-semibold text-white">Setup Triage Assistant</h1>
              <p className="text-slate-400 leading-relaxed">
                Welcome, <strong>{currentUser?.displayName || currentUser?.email}</strong>. The Last-Minute Life Saver is ready to actively protect your day. Let's calibrate your default scheduling parameters.
              </p>
            </div>
            <button
              onClick={handleNextStep}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] text-center block"
            >
              Begin Configuration →
            </button>
          </div>
        )}

        {/* STEP 2: Link Calendar API */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="space-y-2 text-center">
              <h1 className="text-xl font-semibold text-white">Link Calendar</h1>
              <p className="text-slate-400">Connect your calendar platform to synchronize daily timeblocks.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setCalendarLinked("google")}
                className={`w-full border p-4 rounded-xl flex items-center justify-between text-left transition-all ${
                  calendarLinked === "google"
                    ? "bg-indigo-950/20 border-indigo-500 text-indigo-200"
                    : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                <span className="font-semibold">Google Calendar API</span>
                {calendarLinked === "google" ? "✓ Connected" : "Link Account"}
              </button>

              <button
                onClick={() => setCalendarLinked("outlook")}
                className={`w-full border p-4 rounded-xl flex items-center justify-between text-left transition-all ${
                  calendarLinked === "outlook"
                    ? "bg-indigo-950/20 border-indigo-500 text-indigo-200"
                    : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                <span className="font-semibold">Microsoft Outlook API</span>
                {calendarLinked === "outlook" ? "✓ Connected" : "Link Account"}
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrevStep}
                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold py-2.5 rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={!calendarLinked}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl disabled:opacity-40 transition-all"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Working Hours Calibration */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="space-y-2 text-center">
              <h1 className="text-xl font-semibold text-white">Working Hours</h1>
              <p className="text-slate-400">Configure your daily active hours block. Tasks will be allocated only in this range.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Start Hour</label>
                <input
                  type="time"
                  value={workingStart}
                  onChange={(e) => setWorkingStart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">End Hour</label>
                <input
                  type="time"
                  value={workingEnd}
                  onChange={(e) => setWorkingEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-center"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrevStep}
                disabled={isLoading}
                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold py-2.5 rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={handleCompleteOnboarding}
                disabled={isLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? "Saving..." : "Launch Cockpit"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
