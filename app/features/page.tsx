"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const features = [
  {
    icon: "⚡",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    title: "Instant Task Sorting",
    desc: "Type or paste everything that's stressing you out — messy, random, unformatted. AI reads it in seconds and turns it into a clear, ordered list of things to do.",
  },
  {
    icon: "🧠",
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    title: "Head Start Notes",
    desc: "Before you even start a task, AI prepares ideas, outlines, and research notes so you're never staring at a blank page wondering where to begin.",
  },
  {
    icon: "📅",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "Auto-Built Daily Schedule",
    desc: "Once your tasks are in, AI figures out the best order to tackle them based on deadlines and how urgent they are — then builds your whole day automatically.",
  },
  {
    icon: "⏱️",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
    title: "Smart Time Tracking",
    desc: "If a task is taking longer than expected, the app notices and quietly rearranges the rest of your day so nothing falls behind.",
  },
  {
    icon: "✉️",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
    title: "Delay Message Writer",
    desc: "Running late? AI writes a polite, professional message to your client, manager, or professor — in whatever tone you choose. One click to save and send.",
  },
  {
    icon: "🎯",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-600 dark:text-sky-400",
    title: "Focus Timer",
    desc: "Lock into one task at a time with a built-in timer. Get encouragement as you check off steps. When you're done, move to the next task automatically.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <Header />

      <main className="max-w-5xl mx-auto w-full px-6 py-16 flex-1 space-y-16">

        {/* Hero */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] text-primary font-bold tracking-widest uppercase">
            Everything It Can Do
          </span>
          <h1 className="text-3xl font-bold tracking-tight uppercase text-foreground">
            All the Ways We Help You
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            The Last-Minute Life Saver is built for the moments when everything feels like too much. Here's exactly how it helps — in plain English.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="border border-border bg-card rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className={`w-11 h-11 rounded-2xl ${f.iconBg} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200`}>
                {f.icon}
              </div>
              <h3 className={`text-sm font-bold tracking-tight text-foreground`}>
                {f.title}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* How it works — plain English */}
        <section className="bg-muted/30 border border-border rounded-[2rem] p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">How the Smart Scheduling Works</h2>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
              You don't need to understand the math. But if you're curious, here's what's happening behind the scenes when AI sorts your tasks.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">1</div>
                <span className="font-bold text-foreground text-sm">How AI decides what's most urgent</span>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-9">
                Every task gets a score based on two things: <strong>how important it is</strong> (does it matter a lot?) and <strong>how urgent it is</strong> (does it need to happen soon?). Tasks that are both important AND urgent go to the top. Tasks with upcoming deadlines also get boosted. If a task is blocking other tasks, it scores even higher.
              </p>
              <div className="bg-card border border-border p-4 rounded-xl font-mono text-[10px] text-primary shadow-inner ml-9">
                Priority Score = Importance + Urgency + Deadline Closeness + (Tasks waiting on this × 12)
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm shrink-0">2</div>
                <span className="font-bold text-foreground text-sm">How it detects when you're falling behind</span>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-9">
                While you work in Focus Mode, the app watches how quickly you're completing steps compared to your original estimate. If it looks like you'll need more time than planned, it alerts you and offers to rearrange the rest of your schedule — and write a delay message for you.
              </p>
              <div className="bg-card border border-border p-4 rounded-xl font-mono text-[10px] text-primary shadow-inner ml-9">
                If actual speed &gt; 15% slower than expected → alert + reschedule automatically
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Ready to try it?</p>
          <a
            href="/signup"
            className="inline-block bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98] text-sm"
          >
            Start for Free — No Credit Card
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}
