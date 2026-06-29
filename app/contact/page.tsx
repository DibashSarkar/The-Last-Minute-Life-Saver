"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { IconMail, IconClock, IconMapPin, IconHelp } from "@tabler/icons-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: "Support Request", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setForm({ name: "", email: "", topic: "Support Request", message: "" });
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <Header />

      <main className="max-w-5xl mx-auto w-full px-6 py-16 flex-1 space-y-12 text-left">
        
        {/* Hero */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] text-primary font-bold tracking-widest uppercase">
            Get in Touch
          </span>
          <h1 className="text-3xl font-bold tracking-tight uppercase text-foreground">
            We are Here to Help
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Have questions about your workspace? Need help setting up templates? Reach out anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Details Cards */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Email Support */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <IconMail className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold uppercase text-foreground">Email Support</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                For general troubleshooting, account issues, or feature requests.
              </p>
              <p className="text-xs font-bold text-primary">support@lifesaver.ai</p>
            </div>

            {/* Operating Hours */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <IconClock className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold uppercase text-foreground">Response Window</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                We monitor support requests Monday through Friday.
              </p>
              <p className="text-xs font-bold text-foreground">9:00 AM – 6:00 PM EST</p>
            </div>

            {/* Headquarters Location */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IconMapPin className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold uppercase text-foreground">HQ Office</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Our main collaborative work office.
              </p>
              <p className="text-xs font-bold text-foreground">100 Pine Street, San Francisco, CA 94111</p>
            </div>

          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">Send a Message</h2>
              <p className="text-[11px] text-muted-foreground">Fill out the form below and we will get back to you within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-semibold"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-semibold"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Topic</label>
                <select
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary transition-colors font-semibold cursor-pointer"
                >
                  <option>Support Request</option>
                  <option>Enterprise Inquiry</option>
                  <option>General Feedback</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary font-sans resize-none transition-colors font-semibold"
                  placeholder="Tell us what you need help with..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-bold text-sm py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending message...</span>
                  </>
                ) : isSubmitted ? (
                  "✓ Message Sent Successfully!"
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
