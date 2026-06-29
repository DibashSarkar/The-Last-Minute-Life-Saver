"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  IconStar, 
  IconChevronRight, 
  IconChevronDown, 
  IconCheck, 
  IconUser, 
  IconShield, 
  IconCalendar,
  IconCoins,
  IconRefresh,
  IconUsers,
  IconBolt,
  IconHourglassLow,
  IconLoader
} from "@tabler/icons-react";

export default function Home() {
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Live Simulator States
  const [simInput, setSimInput] = useState("Need to send the quarterly financial update to Sarah by Friday, also fix the login page redirection bug before tomorrow noon, and review the team sprint objectives tonight.");
  const [simStatus, setSimStatus] = useState<"idle" | "organizing" | "completed">("idle");
  const [simTasks, setSimTasks] = useState<Array<{ title: string; priority: string; urgency: string; duration: number }>>([]);

  const specialties = [
    { name: "😰 Too Much on Your Mind", desc: "Just type out everything that's stressing you — messy, jumbled, random. AI will read it and turn it into a clear, ordered list of tasks for you." },
    { name: "⏰ Missed Deadlines", desc: "Missed a deadline? No panic. AI automatically detects the overdue task and rearranges your whole day so you can still recover." },
    { name: "📧 Slack & Email Overload", desc: "Paste in a messy Slack thread or email chain. AI picks out the real tasks buried in the noise and adds them to your list." },
    { name: "📅 Meeting Clashes", desc: "Have two things at the same time? AI figures out which one matters more right now and moves the other to a better slot." },
    { name: "📋 Too Much New Work", desc: "Someone just added more work last-minute? AI slots it into your schedule based on how urgent it is, without breaking everything else." },
    { name: "🎯 Can't Stop Task-Switching", desc: "Use the built-in Focus Timer to lock onto one task at a time. Notifications can wait — your most important work can't." },
    { name: "🛡️ Need to Apologize for a Delay", desc: "Running late? AI writes a professional, kind message to your client, manager, or teammate — in the tone you choose." },
    { name: "🚀 Blank Page Syndrome", desc: "Can't figure out where to start? AI prepares notes, ideas, and an outline so you can jump straight into the work." },
    { name: "🔋 Feeling Burnt Out", desc: "Tell the app how you're feeling. It will automatically hide hard tasks and only show you easy, manageable things to work on today." }
  ];

  const companies = [
    { name: "OdeaoLabs", icon: "🌐" },
    { name: "Kintsugi", icon: "☀️" },
    { name: "Stack&d Lab", icon: "📂" },
    { name: "Magnolia", icon: "🌸" },
    { name: "Warpspeed", icon: "⚡" },
    { name: "Sisyphus", icon: "🗻" }
  ];

  const reviews = [
    {
      name: "David Johnson",
      role: "Lead Engineer",
      rating: 5,
      text: "The panic dump organizer got it right on the very first try. My messy brain dump was instantly sequenced into a daily timeline. Absolutely life-saving."
    },
    {
      name: "Sarah Miller",
      role: "Product Manager",
      rating: 5,
      text: "Having the timeline auto-shift when my afternoon meetings run late has completely eliminated my calendar anxiety. The stakeholder apology drafts are perfect."
    },
    {
      name: "Michael Chen",
      role: "Freelance Designer",
      rating: 5,
      text: "I was skeptical about AI task management, but the priority calculations are extremely precise. It knows exactly which task is my downstream blocker."
    }
  ];

  const faqs = [
    {
      q: "Does it work with Google Calendar or Slack?",
      a: "Right now, you can build and manage your full schedule inside the app without needing any other tools. Google Calendar, Outlook, and Slack connections are coming soon — they'll sync everything automatically."
    },
    {
      q: "How does the app move my deadlines around?",
      a: "When a task runs late or a slot gets missed, the AI looks at what's left in your day and rebuilds your schedule from scratch. It also writes a message you can send to whoever is waiting on you, so you don't have to stress about the conversation."
    },
    {
      q: "How much does it cost?",
      a: "The free version is completely free — forever. You get everything you need to manage your tasks, build a daily schedule, and use the focus timer. The premium plan is $12/month (or $9.60/month if you pay yearly) and unlocks deeper AI features for heavy users."
    },
    {
      q: "Is my data safe and private?",
      a: "Absolutely. Everything you type stays private — it's never used to train any AI. In the free version, your data only exists in your own browser and is never sent anywhere unless you log in."
    }
  ];

  const runSimulation = () => {
    if (!simInput.trim()) return;
    setSimStatus("organizing");
    
    // Simulate smart parsing delay
    setTimeout(() => {
      setSimTasks([
        { title: "Fix login page redirection bug", priority: "High", urgency: "Urgent", duration: 45 },
        { title: "Review team sprint objectives", priority: "Medium", urgency: "Today", duration: 30 },
        { title: "Send quarterly financial update to Sarah", priority: "Medium", urgency: "By Friday", duration: 60 }
      ]);
      setSimStatus("completed");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <Header />

      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-16">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white p-8 md:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 shadow-2xl border border-slate-900">
            
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Left Content */}
            <div className="flex-1 space-y-6 z-10 text-left">
              <span className="inline-flex items-center gap-1.5 text-[10px] tracking-widest font-semibold uppercase text-indigo-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <IconBolt className="h-3.5 w-3.5 text-indigo-450 animate-pulse" /> Production Ready System
              </span>
              
              <h1 className="text-3xl md:text-5xl lg:text-[3.25rem] font-black uppercase leading-[1.05] max-w-xl text-white">
                Dump Your Stress.<br />Get a Plan.<br />Get Back on Track.
              </h1>
              
              <p className="text-sm md:text-base text-indigo-100/90 max-w-md leading-relaxed font-medium">
                Our scheduler helps you drop your anxiety, sorts your tasks by urgency, builds your calendar, and drafts apologies when tasks run late.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="/signup"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start for Free with Google
                </a>
                <a
                  href="/login"
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  ⚡ Launch Workspace Dashboard
                </a>
              </div>

              {/* Live Saving Ticker */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-850 rounded-2xl p-4 flex items-center gap-4 mt-8 w-fit shadow-md">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-slate-950 bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold">DS</div>
                  <div className="h-8 w-8 rounded-full border-2 border-slate-950 bg-purple-500/20 flex items-center justify-center text-[10px] text-purple-400 font-bold">MK</div>
                  <div className="h-8 w-8 rounded-full border-2 border-slate-950 bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold">AL</div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-black tracking-tight leading-none text-emerald-400">14,842+</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-none font-bold">Deadlines Saved Today</div>
                </div>
              </div>
            </div>

            {/* Right Photo Area */}
            <div className="flex-1 relative z-10 w-full max-w-md lg:max-w-none flex justify-center items-center">
              <div className="relative rounded-[2rem] overflow-hidden border border-slate-850 shadow-2xl h-[320px] w-[320px] md:h-[380px] md:w-[380px] object-cover bg-slate-900/40 backdrop-blur-sm">
                <img
                  src="/hero_man.png"
                  alt="Productive Developer Workspace Persona"
                  className="h-full w-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Awards Laurel Badge */}
              <div className="absolute -bottom-4 right-4 md:right-10 bg-slate-900 text-slate-200 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 max-w-[200px]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <IconStar className="h-5 w-5 fill-amber-400" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Security Standard</div>
                  <div className="text-[10px] font-bold text-slate-200 mt-1 leading-tight">Firebase Firestore Isolation</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* INTERACTIVE ORGANIZING SIMULATOR SANDBOX */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-card border border-border rounded-[2rem] p-6 sm:p-8 shadow-xl text-left space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Interactive Sandbox</span>
                <h3 className="text-base font-black uppercase text-foreground mt-0.5">Try the Organizing System Instantly</h3>
              </div>
              <p className="text-[11px] text-muted-foreground max-w-sm leading-relaxed font-semibold">
                Type any messy thoughts or stress-points below and see how the app automatically converts it into structured task timelines.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                rows={3}
                placeholder="Type your unstructured mental stress load..."
                className="w-full bg-background border border-border rounded-2xl p-4 text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-medium leading-relaxed"
              />

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground font-bold">Characters: {simInput.length}</span>
                <button
                  onClick={runSimulation}
                  disabled={simStatus === "organizing"}
                  className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-bold px-5 py-2.5 rounded-xl transition-all shadow active:scale-[0.98] text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {simStatus === "organizing" ? (
                    <>
                      <IconLoader className="h-4.5 w-4.5 animate-spin" />
                      <span>Sorting with AI...</span>
                    </>
                  ) : (
                    <>
                      <span>Simulate Organizing</span>
                      <IconChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simulated Output Results */}
            {simStatus !== "idle" && (
              <div className="pt-4 border-t border-border space-y-3.5 animate-fade-in">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Organized Timeline Result:</h4>
                
                {simStatus === "organizing" ? (
                  <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground text-xs font-semibold animate-pulse">
                    <IconHourglassLow className="h-4 w-4 animate-spin text-primary" />
                    <span>Analyzing dependency structure and calculating weights...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {simTasks.map((t, idx) => (
                      <div key={idx} className="bg-background border border-border p-4 rounded-xl space-y-2.5 relative overflow-hidden group hover:border-border/80 transition-colors">
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500"></div>
                        <div className="flex justify-between items-start">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            t.priority === "High" 
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-450" 
                              : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-450"
                          }`}>{t.priority}</span>
                          <span className="text-[9px] text-muted-foreground font-bold">{t.duration}m duration</span>
                        </div>
                        <p className="text-xs font-bold text-foreground leading-snug">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">⏰ Deadline: {t.urgency}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SYSTEM WORKFLOW DIAGRAM */}
        <section className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="space-y-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Workspace Architecture</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-foreground">How Your Tasks Get Organized</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed font-semibold">
              We sync and isolate your task pipelines, keeping you focused and stakeholder relationships healthy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-12 max-w-5xl mx-auto relative">
            
            {/* Step 1 */}
            <div className="bg-card border border-border p-5 rounded-2xl space-y-3 text-left hover:-translate-y-1 transition-transform duration-300 shadow-sm">
              <span className="text-xl">😰</span>
              <h4 className="text-xs font-bold uppercase text-foreground">1. Unload Panic</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">Dump messy work logs, emails, or thoughts in any structure.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-card border border-border p-5 rounded-2xl space-y-3 text-left hover:-translate-y-1 transition-transform duration-300 shadow-sm">
              <span className="text-xl">⚡</span>
              <h4 className="text-xs font-bold uppercase text-foreground">2. AI Organizes</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">System instantly extracts concrete tasks and calculates deadlines.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-card border border-border p-5 rounded-2xl space-y-3 text-left hover:-translate-y-1 transition-transform duration-300 shadow-sm">
              <span className="text-xl">📅</span>
              <h4 className="text-xs font-bold uppercase text-foreground">3. Lock Calendar</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">Builds your daily timeline blocks inside Firestore.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-card border border-border p-5 rounded-2xl space-y-3 text-left hover:-translate-y-1 transition-transform duration-300 shadow-sm">
              <span className="text-xl">🎯</span>
              <h4 className="text-xs font-bold uppercase text-foreground">4. Ambient Focus</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">Work using customizable focus blocks with timers.</p>
            </div>

            {/* Step 5 */}
            <div className="bg-card border border-border p-5 rounded-2xl space-y-3 text-left hover:-translate-y-1 transition-transform duration-300 shadow-sm">
              <span className="text-xl">✉️</span>
              <h4 className="text-xs font-bold uppercase text-foreground">5. Shield Trigger</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold font-semibold">If tasks run late, AI writes extension requests automatically.</p>
            </div>

          </div>
        </section>

        {/* SOCIAL PROOF ROW */}
        <section className="max-w-7xl mx-auto px-6 py-10 border-b border-border">
          <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted by professionals globally
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 mt-6">
            {companies.map((company) => (
              <div 
                key={company.name} 
                className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground font-semibold text-sm cursor-default transition-colors duration-200"
              >
                <span className="text-base">{company.icon}</span>
                <span className="tracking-tight">{company.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SPECIALTIES SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black uppercase text-foreground">
              What Situation Are You In?
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Tap on your current blocker and see exactly how the workspace assists you.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3.5 mt-10 max-w-4xl mx-auto">
            {specialties.map((spec) => (
              <button
                key={spec.name}
                onClick={() => setActiveSpecialty(activeSpecialty === spec.name ? null : spec.name)}
                className={`px-4 py-2 border text-xs rounded-full transition-all duration-300 font-bold ${
                  activeSpecialty === spec.name
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {spec.name}
              </button>
            ))}
          </div>

          {activeSpecialty && (
            <div className="mt-8 p-6 rounded-2xl border border-border bg-card max-w-xl mx-auto text-left shadow-lg animate-in fade-in duration-300">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                How we protect you:
              </h4>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-semibold">
                {specialties.find(s => s.name === activeSpecialty)?.desc}
              </p>
            </div>
          )}
        </section>

        {/* DATA ISOLATION SECTION */}
        <section className="bg-muted/40 py-20 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
            
            <div className="flex-1 space-y-6 text-left">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Safe & Private
              </span>
              <h2 className="text-2xl md:text-3xl font-black uppercase text-foreground">
                Your Tasks Are Only Yours
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md font-medium">
                Only you can see and edit your tasks. When you log in with your email or Google, we lock your tasks securely to your account so they are safe and private.
              </p>
              
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <a
                  href="/signup"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-5.5 py-3 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Create Secure Workspace
                </a>
                <a
                  href="/features"
                  className="flex items-center gap-1 text-xs font-bold text-foreground hover:text-primary transition-colors"
                >
                  See all features <IconChevronRight className="h-4.5 w-4.5" />
                </a>
              </div>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-primary font-bold text-xs">CM</div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Clara Mendez</h4>
                    <p className="text-[10px] text-muted-foreground">Product Lead</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                  "I help teams keep their plans on track when one task runs late and everything else starts to slip."
                </p>
                <div className="flex items-center gap-1 text-[9px] text-amber-500 font-semibold">
                  <IconStar className="h-3 w-3 fill-amber-500" /> 4.9 (120 saves)
                </div>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">JM</div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">James Morrison</h4>
                    <p className="text-[10px] text-muted-foreground font-semibold">Software Architect</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                  "I help developers stay focused by removing the anxiety of constant task-switching and missed messages."
                </p>
                <div className="flex items-center gap-1 text-[9px] text-amber-500 font-semibold">
                  <IconStar className="h-3 w-3 fill-amber-500" /> 4.8 (95 saves)
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 3 STEPS GET STARTED */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black uppercase text-foreground">
              How to Get Started in 3 Steps
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              No setup needed, no learning curve. You can be using the app in under a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 max-w-5xl mx-auto">
            
            {/* Step 1 */}
            <div className="space-y-4 p-6 bg-card border border-border rounded-2xl shadow-sm text-left relative flex flex-col justify-between">
              <span className="absolute top-4 right-4 text-3xl font-black text-muted-foreground/20 select-none">01</span>
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-rose-500/15 text-2xl flex items-center justify-center">
                  😰
                </div>
                <h3 className="text-sm font-bold tracking-tight uppercase text-foreground">
                  Dump Everything Out
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Write everything that's on your mind — no formatting, no structure needed. Just type it all out like you're texting a friend.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 p-6 bg-card border border-border rounded-2xl shadow-sm text-left relative flex flex-col justify-between">
              <span className="absolute top-4 right-4 text-3xl font-black text-muted-foreground/20 select-none">02</span>
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-indigo-500/15 text-2xl flex items-center justify-center">
                  🧠
                </div>
                <h3 className="text-sm font-bold tracking-tight uppercase text-foreground">
                  AI Builds Your Plan
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AI reads what you wrote and instantly creates a sorted task list with a full schedule for your day — so you know exactly what to do first.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 p-6 bg-card border border-border rounded-2xl shadow-sm text-left relative flex flex-col justify-between">
              <span className="absolute top-4 right-4 text-3xl font-black text-muted-foreground/20 select-none">03</span>
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 text-2xl flex items-center justify-center">
                  🎯
                </div>
                <h3 className="text-sm font-bold tracking-tight uppercase text-foreground">
                  Focus and Get Things Done
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Work through your tasks one at a time using the built-in focus timer. If you fall behind, AI rewrites your schedule and sends delay messages for you.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-12">
            <a
              href="/signup"
              className="bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-102 transition-all"
            >
              Get Started Now
            </a>
          </div>
        </section>

        {/* WHY PEOPLE LOVE LIFE SAVER */}
        <section className="bg-slate-900/10 dark:bg-slate-950 text-foreground dark:text-white py-20 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-black uppercase">
                Why People Love Life Saver
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed font-semibold">
                Built specifically for the moments when everything feels like too much. Here's what makes us different.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              
              <div className="bg-card border border-border hover:border-primary/30 transition-all duration-300 rounded-2xl p-6 space-y-3 text-left">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-2xl flex items-center justify-center">
                  📅
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Your Day is Built for You
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                  Add your tasks and AI creates your full daily schedule automatically — no dragging, no manual planning.
                </p>
              </div>

              <div className="bg-card border border-border hover:border-primary/30 transition-all duration-300 rounded-2xl p-6 space-y-3 text-left">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 text-2xl flex items-center justify-center">
                  🚀
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Beat Blank Page Syndrome
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                  AI prepares notes, ideas, and a starting outline before you even open the task — so you always have something to work with.
                </p>
              </div>

              <div className="bg-card border border-border hover:border-primary/30 transition-all duration-300 rounded-2xl p-6 space-y-3 text-left">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-2xl flex items-center justify-center">
                  ⏰
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Runs Late? It Adapts.
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                  If a task takes longer than expected, the rest of your day shifts forward automatically. No manual rescheduling needed.
                </p>
              </div>

              <div className="bg-card border border-border hover:border-primary/30 transition-all duration-300 rounded-2xl p-6 space-y-3 text-left">
                <div className="h-10 w-10 rounded-2xl bg-rose-500/20 text-2xl flex items-center justify-center">
                  ✉️
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Delay Messages, Written Instantly
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                  When you're running late, AI writes a professional apology message to whoever is waiting — in the tone you choose.
                </p>
              </div>

              <div className="bg-card border border-border hover:border-primary/30 transition-all duration-300 rounded-2xl p-6 space-y-3 text-left">
                <div className="h-10 w-10 rounded-2xl bg-violet-500/20 text-2xl flex items-center justify-center">
                  🆓
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Start Free, Stay Free
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                  The free plan is genuinely free — forever. Upgrade to Pro only if you need unlimited AI actions and deeper features.
                </p>
              </div>

              <div className="bg-card border border-border hover:border-primary/30 transition-all duration-300 rounded-2xl p-6 space-y-3 text-left">
                <div className="h-10 w-10 rounded-2xl bg-sky-500/20 text-2xl flex items-center justify-center">
                  🧘
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Less Stress, More Done
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                  Specifically designed to reduce work anxiety — even just dumping your tasks into the app makes you feel calmer immediately.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CLIENT REVIEWS SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black uppercase text-foreground">
              Real People, Real Results
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed font-semibold">
              Here's what people say after using The Last-Minute Life Saver.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 max-w-5xl mx-auto">
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-card border border-border p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <IconStar key={i} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic font-semibold">
                    "{rev.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/25">
                    {rev.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-tight">{rev.name}</h4>
                    <p className="text-[9px] text-muted-foreground font-bold">{rev.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
          <div className="flex flex-col lg:flex-row items-start gap-12">
            
            <div className="flex-1 w-full space-y-6">
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Questions & Answers
                </span>
                <h2 className="text-2xl md:text-3xl font-black uppercase text-foreground">
                  Common Questions
                </h2>
              </div>

              <div className="space-y-3 pt-4">
                {faqs.map((faq, idx) => (
                  <div 
                    key={idx}
                    className="border border-border bg-card rounded-2xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-xs font-bold text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <IconChevronDown 
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          openFaqIndex === idx ? "rotate-180 text-primary" : "text-slate-500"
                        }`} 
                      />
                    </button>
                    
                    {openFaqIndex === idx && (
                      <div className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3.5 bg-muted/10 animate-in fade-in duration-200 font-medium">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full lg:max-w-md shrink-0 self-stretch flex items-center justify-center">
              <div className="h-[480px] w-full rounded-3xl overflow-hidden border border-border shadow-2xl relative bg-[#E2E8F0]/30 backdrop-blur-sm">
                <img
                  src="/faq_therapist.png"
                  alt="Professional Workspace Setup"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
