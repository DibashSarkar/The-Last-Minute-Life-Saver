"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { IconCheck, IconX } from "@tabler/icons-react";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free Forever",
      tagline: "Perfect to get started",
      description: "Everything you need to sort your tasks, build a daily plan, and use the focus timer — completely free, forever.",
      price: 0,
      period: "forever",
      features: [
        "🧠 Let AI sort your messy to-do list (up to 3 times/day)",
        "📅 Auto-built daily schedule",
        "🎯 Focus timer with step tracker",
        "🔒 Works offline — no internet needed",
      ],
      buttonText: "Get Started for Free",
      buttonHref: "/signup",
      popular: false
    },
    {
      name: "Pro Plan",
      tagline: "For heavy users & pros",
      description: "Everything in the free plan, plus unlimited AI actions, deeper task research, and the full delay message writer.",
      price: isAnnual ? 9.60 : 12.00,
      period: "month",
      features: [
        "Everything in the Free plan",
        "🚀 Unlimited AI task sorting",
        "🧠 AI research notes before every task",
        "✉️ Delay message writer (unlimited)",
        "🔁 Instant schedule rebuild when you fall behind",
      ],
      buttonText: "Upgrade to Pro",
      buttonHref: "/signup",
      popular: true
    }
  ];

  const comparison = [
    { name: "Daily AI Task sorting limit", free: "3 times per day", pro: "Unlimited" },
    { name: "Auto-built daily schedule", free: "Yes", pro: "Yes" },
    { name: "Focus timer + steps tracker", free: "Yes", pro: "Yes" },
    { name: "Offline calendar sandbox", free: "Yes", pro: "Yes" },
    { name: "Pre-task AI research outlines", free: "No (Static template)", pro: "Yes (Gemini Pro AI outlines)" },
    { name: "Stakeholder Shield apology message writer", free: "No", pro: "Yes (Unlimited)" },
    { name: "Instant schedule shift on delay", free: "No", pro: "Yes" },
    { name: "Calm soundscapes in focus room", free: "White Noise only", pro: "6 Ambient Tracks (Rain, Ocean, Brown Noise, etc.)" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <Header />

      <main className="max-w-5xl mx-auto w-full px-6 py-16 flex-1 space-y-16">

        {/* Header */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] text-primary font-bold tracking-widest uppercase">
            Simple Pricing
          </span>
          <h1 className="text-3xl font-bold tracking-tight uppercase text-foreground">
            Pick What Works for You
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Start free and upgrade only if you need more. No hidden fees, no confusing tiers.
          </p>
        </div>

        {/* Annual toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-semibold ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted hover:bg-muted-foreground/20 transition-colors duration-200 focus:outline-none"
            role="switch"
            aria-checked={isAnnual}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-secondary shadow-lg ring-0 transition-transform duration-200 ${isAnnual ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm font-semibold flex items-center gap-1.5 ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Yearly
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/15 dark:text-emerald-400">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-[2rem] p-8 flex flex-col justify-between space-y-8 relative transition-all duration-300 ${
                plan.popular
                  ? "border-secondary bg-card shadow-xl shadow-secondary/5 dark:bg-indigo-950/20"
                  : "border-border bg-card shadow-sm hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 bg-secondary text-secondary-foreground rounded-full text-[8px] font-black uppercase tracking-widest leading-none shadow-md">
                  ⭐ Most Popular
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">{plan.tagline}</span>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                </div>

                <div className="text-left py-3 border-y border-border/60">
                  <div className="flex items-baseline text-foreground">
                    <span className="text-4xl font-black tracking-tight tabular-nums">${plan.price.toFixed(2)}</span>
                    <span className="ml-2 text-xs text-muted-foreground font-medium">/ {plan.period}</span>
                  </div>
                  {isAnnual && plan.price > 0 && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                      Billed as ${(plan.price * 12).toFixed(2)}/year — saving you ${(2.40 * 12).toFixed(0)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed text-left">{plan.description}</p>

                <ul className="space-y-2.5 text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground font-semibold">
                      <IconCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={plan.buttonHref}
                className={`w-full text-center font-bold text-sm py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] ${
                  plan.popular
                    ? "bg-secondary hover:bg-secondary/95 text-secondary-foreground"
                    : "bg-muted hover:bg-muted-foreground/15 text-foreground border border-border"
                }`}
              >
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>

        {/* Detailed Feature Comparison */}
        <section className="space-y-6 text-left">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">Detailed Feature Comparison</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">See exactly what you get in our Free and Pro tiers.</p>
          </div>

          <div className="w-full overflow-x-auto border border-border rounded-2xl bg-card shadow-xl">
            <table className="w-full text-xs text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-4 font-bold text-foreground w-[45%]">Feature</th>
                  <th className="p-4 font-bold text-muted-foreground text-center w-[27.5%]">Free Forever</th>
                  <th className="p-4 font-bold text-secondary text-center w-[27.5%] bg-secondary/5">Pro Plan</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, idx) => (
                  <tr key={idx} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-foreground block">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground leading-normal mt-0.5 block max-w-lg">
                        {item.name === "Daily AI Task sorting limit" && "How many times you can dump your messy thoughts and have AI sequence them."}
                        {item.name === "Auto-built daily schedule" && "Generates chronological task blocks automatically for the day."}
                        {item.name === "Focus timer + steps tracker" && "Custom focus blocks, break alerts, and step tracker for physical well-being."}
                        {item.name === "Offline calendar sandbox" && "All core schedule features run locally in-browser without sending data online."}
                        {item.name === "Pre-task AI research outlines" && "AI outlines notes, research briefs, and templates before you begin working."}
                        {item.name === "Stakeholder Shield apology message writer" && "Drafts apology letters and extension request messages instantly when a task is delayed."}
                        {item.name === "Instant schedule shift on delay" && "Automatically shifts all subsequent tasks when a current task runs over time."}
                        {item.name === "Calm soundscapes in focus room" && "Multiple ambient audio tracks (rain, white noise, etc.) to enhance deep focus."}
                      </span>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {item.free === "Yes" ? (
                        <IconCheck className="h-4.5 w-4.5 text-emerald-500 mx-auto" />
                      ) : item.free === "No" ? (
                        <IconX className="h-4.5 w-4.5 text-rose-500 mx-auto" />
                      ) : (
                        <span className="font-bold text-[10px]">{item.free}</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-secondary bg-secondary/5">
                      {item.pro === "Yes" ? (
                        <IconCheck className="h-4.5 w-4.5 text-secondary mx-auto" />
                      ) : (
                        <span className="font-extrabold text-[10px]">{item.pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Trust note */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-xs text-muted-foreground font-semibold">
            🔒 No credit card required to start · Cancel anytime · Your data stays private
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
