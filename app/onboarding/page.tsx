"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, setOnboardingCompleted, saveSettings } from "@/lib/firebase";
import { IconBolt, IconClock, IconActivity, IconSun, IconMoon, IconLock, IconCheck, IconUser } from "@tabler/icons-react";

export default function OnboardingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Form States
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Prefer not to say");
  const [workingStart, setWorkingStart] = useState("09:00");
  const [workingEnd, setWorkingEnd] = useState("17:00");
  const [energyState, setEnergyState] = useState<"high" | "medium" | "low" | "overwhelmed">("high");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize theme and auth
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Auth setup
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setCurrentUser(user);
      setName(user.displayName || user.email.split("@")[0] || "");
      setLoadingUser(false);
    }
    checkAuth();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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
        currentEnergyState: energyState,
        pomodoroConfig: { focusDuration: 25, breakDuration: 5 }
      });

      // 2. Set onboarded = true and save Name, Age, Gender in profile
      await setOnboardingCompleted(currentUser.uid, {
        displayName: name || currentUser.email.split("@")[0],
        age: age ? parseInt(age) : undefined,
        gender: gender
      });
      
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
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-sans">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
          <span className="text-sm font-medium">Setting up your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 sm:p-6 font-sans transition-colors duration-300 relative">
      
      {/* Mini Top Header with Theme Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? <IconMoon className="h-4 w-4" /> : <IconSun className="h-4 w-4" />}
        </button>
      </div>

      <div className="max-w-md w-full bg-card border border-border rounded-[var(--radius)] p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-6 text-left">
        
        {/* Progress indicators */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono font-bold">
          <span>STEP {step} OF 3</span>
          <div className="flex gap-1.5">
            <div className={`w-6 h-1 rounded transition-all duration-300 ${step >= 1 ? "bg-primary" : "bg-muted"}`}></div>
            <div className={`w-6 h-1 rounded transition-all duration-300 ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
            <div className={`w-6 h-1 rounded transition-all duration-300 ${step >= 3 ? "bg-primary" : "bg-muted"}`}></div>
          </div>
        </div>

        {/* STEP 1: Welcome & Personalization */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in text-xs">
            <div className="space-y-3 text-center">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-1">
                <IconUser className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-foreground">Welcome to Life Saver</h1>
              <p className="text-muted-foreground leading-relaxed">
                Let's customize your profile so we can tailor the companion experience to you.
              </p>
            </div>

            {/* Profile Inputs */}
            <div className="space-y-3.5 p-4 rounded-[var(--radius)] bg-muted/40 border border-border/60">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2.5 text-foreground text-xs focus:outline-none focus:border-primary transition-colors font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2.5 text-foreground text-xs focus:outline-none focus:border-primary transition-colors font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2.5 text-foreground text-xs focus:outline-none focus:border-primary transition-colors font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3.5 rounded-[var(--radius)] transition-all shadow-lg active:scale-[0.98] text-center block text-sm cursor-pointer"
            >
              Get Started →
            </button>
          </div>
        )}

        {/* STEP 2: Working Hours Calibration */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="space-y-2 text-center">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1">
                <IconClock className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-foreground">Active Work Hours</h1>
              <p className="text-muted-foreground leading-relaxed">
                When are you usually working? We will schedule your tasks inside this window.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-bold uppercase tracking-wider text-[9px]">Start Time</label>
                <input
                  type="time"
                  value={workingStart}
                  onChange={(e) => setWorkingStart(e.target.value)}
                  className="w-full bg-background border border-border rounded-[var(--radius)] p-3 text-foreground text-center font-bold text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-bold uppercase tracking-wider text-[9px]">End Time</label>
                <input
                  type="time"
                  value={workingEnd}
                  onChange={(e) => setWorkingEnd(e.target.value)}
                  className="w-full bg-background border border-border rounded-[var(--radius)] p-3 text-foreground text-center font-bold text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Quick Templates */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Quick Templates:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setWorkingStart("09:00"); setWorkingEnd("17:00"); }}
                  className="flex-1 bg-background hover:bg-muted border border-border py-1.5 px-3 rounded-[var(--radius)] text-[10.5px] font-semibold text-foreground transition-all cursor-pointer text-center"
                >
                  🏢 Standard (9-5)
                </button>
                <button
                  type="button"
                  onClick={() => { setWorkingStart("13:00"); setWorkingEnd("21:00"); }}
                  className="flex-1 bg-background hover:bg-muted border border-border py-1.5 px-3 rounded-[var(--radius)] text-[10.5px] font-semibold text-foreground transition-all cursor-pointer text-center"
                >
                  🦉 Night Owl (1-9)
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrevStep}
                className="flex-1 bg-background hover:bg-muted border border-border text-foreground font-bold py-3 rounded-[var(--radius)] transition-all active:scale-[0.98] cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 rounded-[var(--radius)] transition-all active:scale-[0.98] cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Initial Energy Level */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="space-y-2 text-center">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                <IconActivity className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-foreground">Current Energy</h1>
              <p className="text-muted-foreground leading-relaxed">How are you feeling right now? We will calibrate tasks to match your state.</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {(["high", "medium", "low", "overwhelmed"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergyState(lvl)}
                  className={`border p-4 rounded-[var(--radius)] flex flex-col items-center justify-center text-center capitalize transition-all duration-200 cursor-pointer ${
                    energyState === lvl
                      ? "bg-primary/10 border-primary text-primary font-bold shadow-lg shadow-primary/5"
                      : "bg-background border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <span className="text-lg mb-1">
                    {lvl === "high" ? "⚡" : lvl === "medium" ? "🔋" : lvl === "low" ? "🌿" : "😰"}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase">{lvl}</span>
                  <span className="text-[8px] text-muted-foreground font-medium mt-1 select-none leading-tight">
                    {lvl === "high" ? "Show hard work" : lvl === "medium" ? "Normal work" : lvl === "low" ? "Easy work only" : "One task focus"}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrevStep}
                disabled={isLoading}
                className="flex-1 bg-background hover:bg-muted border border-border text-foreground font-bold py-3 rounded-[var(--radius)] transition-all active:scale-[0.98] cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleCompleteOnboarding}
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 rounded-[var(--radius)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? "Saving..." : "Go to Dashboard"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
