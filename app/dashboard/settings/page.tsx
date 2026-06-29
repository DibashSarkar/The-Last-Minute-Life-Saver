"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, getSettings, saveSettings, UserSettings, UserProfile, setOnboardingCompleted, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function SettingsPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  
  // Profile settings
  const [displayName, setDisplayName] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("pixel");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  // Working preferences
  const [workingStart, setWorkingStart] = useState("09:00");
  const [workingEnd, setWorkingEnd] = useState("17:00");
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [energyState, setEnergyState] = useState<"high" | "medium" | "low" | "overwhelmed">("high");

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Avatar presets
  const presets = ["pixel", "baker", "rocket", "spark", "pulse", "echo"];

  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setActiveUser(user);
      setDisplayName(user.displayName || "");
      
      // Parse custom seeds if saved previously
      if (user.displayName) {
        setAvatarSeed(user.displayName.toLowerCase().replace(/\s+/g, "_"));
      }

      const st = await getSettings();
      setWorkingStart(st.workingHours?.start || "09:00");
      setWorkingEnd(st.workingHours?.end || "17:00");
      setFocusDuration(st.pomodoroConfig?.focusDuration || 25);
      setBreakDuration(st.pomodoroConfig?.breakDuration || 5);
      setEnergyState(st.currentEnergyState || "high");

      setLoadingUser(false);
    }
    checkAuthAndLoad();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    try {
      // 1. Save general user settings
      await saveSettings({
        workingHours: { start: workingStart, end: workingEnd },
        currentEnergyState: energyState,
        pomodoroConfig: { focusDuration, breakDuration }
      });

      // 2. Update user profile document in Firestore (or local sandbox)
      if (activeUser) {
        const { isSandboxMode } = await import("@/lib/firebase");
        if (!isSandboxMode() && db) {
          const userRef = doc(db, "users", activeUser.uid);
          await setDoc(userRef, {
            displayName,
          }, { merge: true });
        } else {
          // Sandbox local storage fallback
          const users = JSON.parse(localStorage.getItem("lifesaver_sandbox_users") || "{}");
          if (users[activeUser.uid]) {
            users[activeUser.uid].displayName = displayName;
            localStorage.setItem("lifesaver_sandbox_users", JSON.stringify(users));
          }
          const cur = JSON.parse(localStorage.getItem("lifesaver_sandbox_currentUser") || "null");
          if (cur && cur.uid === activeUser.uid) {
            cur.displayName = displayName;
            localStorage.setItem("lifesaver_sandbox_currentUser", JSON.stringify(cur));
          }
        }
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Couldn't save your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getComputedAvatarUrl = () => {
    if (customAvatarUrl) return customAvatarUrl;
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-sans">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
          <span className="text-sm font-medium">Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-16 transition-colors duration-300">

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1 transition-colors">
          ← Back to My Tasks
        </a>
        <h1 className="text-xs font-semibold tracking-wider text-primary uppercase flex items-center gap-2">
          ⚙️ Workspace Settings
        </h1>
      </header>

      <main className="max-w-full mx-auto w-full px-0 md:px-6 mt-0 md:mt-8 flex-1 flex flex-col">
        <div className="bg-card border-none md:border border-border rounded-none md:rounded-md p-4 md:p-4 shadow-none md:shadow-xl space-y-8 text-left">
          
          <div className="flex items-center gap-3 border-b border-border/60 pb-5">
            <div className="w-10 h-10 rounded-md bg-primary/15 flex items-center justify-center text-xl shrink-0">⚙️</div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Workspace Settings</h2>
              <p className="text-[10px] text-muted-foreground">Calibrate your profile, working hours window, and focus modes.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6 text-xs">

            {/* Profile & Avatar Editing */}
            <div className="space-y-4 border-b border-border/60 pb-6">
              <div className="flex items-center gap-2">
                <span className="text-base">👤</span>
                <span className="font-bold text-foreground">My Profile details</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0 shadow-inner">
                  <img
                    src={getComputedAvatarUrl()}
                    alt="Active Profile Robot Avatar"
                    className="w-12 h-12 object-contain"
                  />
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Display Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors font-semibold"
                      placeholder="Alice Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Bottts Avatar Selector Presets */}
              <div className="space-y-2">
                <label className="text-muted-foreground font-semibold block">Select Robot Avatar Preset</label>
                <div className="flex flex-wrap gap-2.5">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setAvatarSeed(p);
                        setCustomAvatarUrl("");
                      }}
                      className={`h-9 w-9 rounded-md border flex items-center justify-center bg-background hover:border-primary transition-all p-1.5 ${
                        avatarSeed === p && !customAvatarUrl
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${p}`}
                        alt="Preset Option"
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Or enter Custom Image Link (URL)</label>
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors font-semibold"
                  placeholder="https://example.com/avatar.png"
                />
              </div>
            </div>

            {/* Working Hours Calibration */}
            <div className="space-y-3 border-b border-border/60 pb-6">
              <div className="flex items-center gap-2">
                <span className="text-base">🕐</span>
                <span className="font-bold text-foreground">Active Work Hours Block</span>
              </div>
              <p className="text-[10px] text-muted-foreground -mt-1">
                Your tasks are scheduled within this interval.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold">Start Hour:</label>
                  <input
                    type="time"
                    value={workingStart}
                    onChange={(e) => setWorkingStart(e.target.value)}
                    className="w-full bg-background border border-border rounded-md p-2.5 text-foreground text-center focus:outline-none focus:border-primary transition-colors font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold">End Hour:</label>
                  <input
                    type="time"
                    value={workingEnd}
                    onChange={(e) => setWorkingEnd(e.target.value)}
                    className="w-full bg-background border border-border rounded-md p-2.5 text-foreground text-center focus:outline-none focus:border-primary transition-colors font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Focus Timer Durations */}
            <div className="space-y-3 border-b border-border/60 pb-6">
              <div className="flex items-center gap-2">
                <span className="text-base">⏱️</span>
                <span className="font-bold text-foreground">Default Focus Session</span>
              </div>
              <p className="text-[10px] text-muted-foreground -mt-1">
                Calibrate duration for your Pomodoro style blocks.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold">🎯 Focus for (minutes):</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={focusDuration}
                    onChange={(e) => setFocusDuration(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-md p-2.5 text-foreground text-center font-semibold focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold">☕ Break for (minutes):</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-md p-2.5 text-foreground text-center font-semibold focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Energy Level settings */}
            <div className="space-y-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🔋</span>
                <span className="font-bold text-foreground">Current Energy Level</span>
              </div>
              <select
                value={energyState}
                onChange={(e) => setEnergyState(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md p-2.5 text-foreground font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="high">⚡ High Energy — Show Hard Tasks</option>
                <option value="medium">😊 Okay Energy — Show Normal Tasks</option>
                <option value="low">😴 Low Energy — Show Easy Tasks Only</option>
                <option value="overwhelmed">😰 Overwhelmed — Filter Down to Single Task</option>
              </select>
            </div>

            {/* Save Button */}
            {isSaved ? (
              <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-md text-center font-bold text-sm animate-pulse">
                ✅ Saved! Your settings have been updated.
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-bold py-3.5 rounded-md transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isSaving ? "Saving changes..." : "💾 Save My Preferences"}
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
