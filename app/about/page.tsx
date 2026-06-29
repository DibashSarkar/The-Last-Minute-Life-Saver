"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { IconBolt, IconLock, IconActivity, IconHeart } from "@tabler/icons-react";

export default function AboutPage() {
  const values = [
    {
      icon: <IconHeart className="h-5 w-5 text-rose-500" />,
      title: "Human-First Design",
      desc: "We avoid technical jargon like 'Triage Engine' or 'Prioritization Weights'. We use words you actually use, keeping the experience simple and stress-free."
    },
    {
      icon: <IconLock className="h-5 w-5 text-indigo-500" />,
      title: "Total Data Privacy",
      desc: "What you type in your brain dumps is private. We only pass data to secure APIs and never use your tasks to train models."
    },
    {
      icon: <IconBolt className="h-5 w-5 text-amber-500" />,
      title: "Actionable Simplification",
      desc: "Instead of overwhelming you with charts, we focus on what to do next. We give you a timer and notes to get you started immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <Header />

      <main className="max-w-5xl mx-auto w-full px-6 py-16 flex-1 space-y-16 text-left">
        
        {/* Hero */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] text-primary font-bold tracking-widest uppercase">
            Our Story
          </span>
          <h1 className="text-3xl font-bold tracking-tight uppercase text-foreground">
            Lowering Scheduling Anxiety
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            The Last-Minute Life Saver was built to help people who feel overwhelmed by traditional, complex calendar setups.
          </p>
        </div>

        {/* Mission Statement section */}
        <section className="bg-card border border-border rounded-[2rem] p-8 sm:p-12 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Our Mission</span>
            <h2 className="text-xl font-bold text-foreground">We believe productivity should not cause panic.</h2>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              Most calendar apps make you drag boxes, estimate minutes, and manage dependencies. When things run late, they flash red warnings that make you feel guilty.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              We took a different path. You dump your thoughts, we build the plan, and when things shift, we quietly reschedule everything. No stress, no shame.
            </p>
          </div>
          <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How we do it:</h4>
            <ul className="space-y-3 text-xs text-muted-foreground font-semibold">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500">✓</span>
                <span>Simple text input brain dumps</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500">✓</span>
                <span>Automatic schedule rescheduling</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500">✓</span>
                <span>Pre-drafted apology templates</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Core Values */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Core Values</span>
            <h2 className="text-xl font-bold text-foreground">What We Stand For</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  {v.icon}
                </div>
                <h3 className="text-xs font-bold uppercase text-foreground">{v.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center space-y-4 pt-6">
          <p className="text-xs text-muted-foreground font-semibold">Ready to start clearing your mind?</p>
          <a
            href="/signup"
            className="inline-block bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-all text-sm active:scale-[0.98]"
          >
            Create My Free Account
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}
