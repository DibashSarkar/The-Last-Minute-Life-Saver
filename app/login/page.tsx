"use client";

import React, { useState } from "react";
import { authLogin, authLoginWithGoogle } from "@/lib/firebase";
import Header from "@/components/Header";
import { IconEye, IconEyeOff, IconBrandGoogle, IconArrowRight, IconBolt } from "@tabler/icons-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg("");
    try {
      const user = await authLogin(email, password);
      if (user.onboarded) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMsg("");
    try {
      const user = await authLoginWithGoogle();
      if (user.onboarded) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Google Sign-In failed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left decorative illustration panel (Hidden on small screens) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/10 via-background to-secondary/15 dark:from-primary/5 dark:via-background dark:to-secondary/10 items-center justify-center p-12 overflow-hidden border-r border-border">
          
          {/* Glow effects */}
          <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] bg-primary/15 rounded-full blur-[130px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[480px] h-[480px] bg-secondary/20 rounded-full blur-[130px] animate-pulse"></div>

          {/* Decorative background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

          <div className="relative z-10 max-w-lg space-y-8 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-500 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                <IconBolt className="h-3.5 w-3.5 animate-bounce" /> Focus protection suite
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight leading-tight text-foreground">
                Stop panicking, <br />start finishing.
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Log in to access your dashboard. Dump your thoughts, get a schedule, lock in with our focus assistant, and let the app protect you from late delivery stress.
              </p>
            </div>

            {/* Interactive Card Preview Simulators */}
            <div className="space-y-4 pt-4">
              
              {/* Task Card 1 */}
              <div className="bg-card border border-border p-4 rounded-2xl shadow-xl flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-xl flex items-center justify-center">😰</div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Submit Sprint Documentation</h4>
                    <p className="text-[10px] text-muted-foreground">Urgent & Important · Overdue</p>
                  </div>
                </div>
                <span className="text-[9px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded-full border border-rose-500/20">🔥 High Priority</span>
              </div>

              {/* Downward transition indicator */}
              <div className="flex justify-center text-muted-foreground h-2">
                <span className="text-xs font-bold">⬇</span>
              </div>

              {/* Task Card 2 (After Triage) */}
              <div className="bg-card border border-indigo-500/30 p-4 rounded-2xl shadow-xl flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-xl flex items-center justify-center">🎯</div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Focus Session Active</h4>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400">25:00 Time Block Secured</p>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">🌿 Balanced</span>
              </div>

            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
          <div className="max-w-md w-full space-y-8 bg-card border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-2xl backdrop-blur-md relative z-10 text-left">
            
            {/* Header */}
            <div className="space-y-2 text-center">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-4">
                <IconBolt className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Welcome Back</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">Please sign in to resume your task protection stream.</p>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs p-3.5 rounded-2xl text-center font-semibold animate-pulse">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-medium text-sm"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Password</label>
                  <a href="/forgot-password" className="text-[11px] text-primary hover:text-primary/80 font-bold">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-2xl pl-4 pr-12 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-medium text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-bold py-3.5 rounded-2xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <IconArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Sign-In */}
            <div className="space-y-4 pt-2">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Or Continue With</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-background border border-border hover:bg-muted text-foreground font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer text-sm"
              >
                {isGoogleLoading ? (
                  <svg className="animate-spin h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <IconBrandGoogle className="h-5 w-5 text-indigo-500" />
                )}
                <span>Sign In with Google</span>
              </button>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-2 font-bold">
              New to Life Saver?{" "}
              <a href="/signup" className="text-primary hover:text-primary/80">
                Create an Account
              </a>
            </div>

            {/* Connection Status Badge */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] py-2.5 px-3 rounded-xl text-center font-bold uppercase tracking-wider">
              🟢 Firebase Connected · You may signup using your own email id!
            </div>

            {/* Quick Demo Accounts Helper */}
            <div className="border-t border-border pt-4 mt-4 space-y-3 text-xs">
              <div className="text-center space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block">Quick Access Accounts</span>
                <span className="text-[9px] text-amber-500 font-medium block">⚠️ Temporary credentials for • Vibe2Ship Hackathon (will be removed in production)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("dibash6396@gmail.com");
                    setPassword("admin123");
                  }}
                  className="bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/30 p-2.5 rounded-xl text-left cursor-pointer transition-all active:scale-[0.97]"
                >
                  <div className="font-bold text-primary text-[10px] uppercase tracking-wider">Admin Role</div>
                  <div className="text-[10px] text-muted-foreground truncate">dibash6396@gmail.com</div>
                  <div className="text-[9px] text-muted-foreground/60 font-mono">pw: admin123</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("demo@lifesaver.ai");
                    setPassword("demo123");
                  }}
                  className="bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 hover:border-secondary/30 p-2.5 rounded-xl text-left cursor-pointer transition-all active:scale-[0.97]"
                >
                  <div className="font-bold text-secondary text-[10px] uppercase tracking-wider">Demo User</div>
                  <div className="text-[10px] text-muted-foreground truncate">demo@lifesaver.ai</div>
                  <div className="text-[9px] text-muted-foreground/60 font-mono">pw: demo123</div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
