"use client";

import React, { useState } from "react";
import { authRegister, authLoginWithGoogle } from "@/lib/firebase";
import Header from "@/components/Header";
import { IconEye, IconEyeOff, IconBrandGoogle, IconArrowRight, IconBolt } from "@tabler/icons-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-muted", width: "w-0" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        return { label: "Weak", color: "bg-rose-500", width: "w-1/4" };
      case 2:
        return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
      case 3:
        return { label: "Good", color: "bg-indigo-500", width: "w-3/4" };
      case 4:
      default:
        return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) return;

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      await authRegister(email, name, password);
      window.location.href = "/onboarding";
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Registration failed. Please try again.");
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

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left form panel */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
          <div className="max-w-md w-full space-y-7 bg-card border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-2xl backdrop-blur-md relative z-10 text-left">
            
            {/* Logo / Header */}
            <div className="space-y-2 text-center">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-3">
                <IconBolt className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Create Account</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">Sign up to shield your schedule against work anxiety.</p>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs p-3.5 rounded-2xl text-center font-semibold animate-pulse">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-medium text-sm"
                  placeholder="Alice Doe"
                />
              </div>

              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-2xl pl-4 pr-12 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-medium text-sm"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase">
                      <span>Password Strength:</span>
                      <span className={strength.color.replace("bg-", "text-")}>{strength.label}</span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-medium text-sm"
                  placeholder="••••••••"
                />
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <IconArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Sign-In */}
            <div className="space-y-4 pt-2">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Or Register With</span>
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
                <span>Register with Google</span>
              </button>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-2 font-bold">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:text-primary/80">
                Sign In
              </a>
            </div>

          </div>
        </div>

        {/* Right decorative panel (Mirrored for Signup, hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-950/20 via-slate-900/10 to-emerald-950/20 dark:from-indigo-950 dark:via-slate-900 dark:to-emerald-950 items-center justify-center p-12 overflow-hidden border-l border-border">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>

          <div className="relative z-10 max-w-lg space-y-8 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <IconBolt className="h-3.5 w-3.5 animate-bounce" /> Fully secure environment
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight leading-tight text-foreground">
                Clear your mind, <br />protect your day.
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Once you configure your daily hours, you'll gain access to the Task Scaffolder, Stakeholder Shield apology system, and custom Pomodoro ambient focus blocks.
              </p>
            </div>

            <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-xl">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">What happens next?</h4>
              <ul className="space-y-3.5 text-xs text-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <span className="font-semibold">Calibrate your daily work schedule window</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <span className="font-semibold">Select your default focus session duration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <span className="font-semibold">Paste any messy list of ideas to auto-arrange!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
