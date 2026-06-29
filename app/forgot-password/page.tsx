"use client";

import React, { useState } from "react";
import { authSendPasswordReset } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg("");
    try {
      await authSendPasswordReset(email);
      setIsSent(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to send recovery email. Please check the email address.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 font-sans transition-colors duration-300">
      <div className="max-w-sm w-full bg-card border border-border rounded-[2rem] p-8 shadow-xl space-y-6 text-left">
        
        {/* Header */}
        <div className="space-y-1.5 text-center">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 shadow-md shadow-primary/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-foreground uppercase tracking-tight">Reset Password</h1>
          <p className="text-[10px] text-muted-foreground leading-relaxed">We will email you a link to reset your password.</p>
        </div>

        {errorMsg && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[10px] p-2.5 rounded-lg text-center font-semibold">
            {errorMsg}
          </div>
        )}

        {isSent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10px] p-3 rounded-lg text-center font-semibold animate-pulse">
            ✓ Reset link sent! Please check your inbox.
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-medium"
                placeholder="name@company.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-medium py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending email...</span>
                </>
              ) : (
                <span>Request Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-[10px] text-muted-foreground pt-1.5 font-medium">
          Remembered your password?{" "}
          <a href="/login" className="text-primary hover:text-primary/85 font-semibold">
            Login
          </a>
        </div>

      </div>
    </div>
  );
}
