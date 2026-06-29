"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconBrandFacebook, IconBrandTwitter, IconBrandInstagram, IconBrandLinkedin } from "@tabler/icons-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="relative w-full overflow-hidden bg-[#0A1128] text-[#F3F4F6] transition-colors duration-300">
      


      <div className="relative mx-auto max-w-7xl px-6 py-16 z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 border-b border-slate-800 pb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-base tracking-tight text-white">
                Life Saver
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Shielding your schedule against delays and anxiety. Unpack unstructured brain dumps, shift calendars on the fly, and auto-negotiate with stakeholders using Gemini.
            </p>
          </div>

          {/* Links Column 1: Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Features</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/features" className="hover:text-white transition-colors">Dump Thoughts</a></li>
              <li><a href="/features" className="hover:text-white transition-colors">Focus Room</a></li>
              <li><a href="/features" className="hover:text-white transition-colors">Priority List</a></li>
              <li><a href="/about" className="hover:text-white transition-colors font-bold text-slate-350">About Us</a></li>
            </ul>
          </div>

          {/* Links Column 2: Useful Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Useful Tools</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/features" className="hover:text-white transition-colors">Apology Generator</a></li>
              <li><a href="/features" className="hover:text-white transition-colors">Calendar Rescue</a></li>
              <li><a href="/features" className="hover:text-white transition-colors">Stuck Helper</a></li>
              <li><a href="/features" className="hover:text-white transition-colors">Task Organizer</a></li>
            </ul>
          </div>

          {/* Links Column 3: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/features" className="hover:text-white transition-colors">Documentation / FAQ</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms-and-conditions" className="hover:text-white transition-colors">Terms of Use</a></li>
              <li><a href="/disclaimer" className="hover:text-white transition-colors">Accountability Disclaimer</a></li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-3 md:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Join Our Newsletter</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stay updated on productivity hacks, prioritization algorithms, and feature releases.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 pt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full bg-[#111B35] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs py-2 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-500 font-medium">
          <div>
            &copy; {new Date().getFullYear()} The Last-Minute Life Saver. All rights reserved.
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
              <IconBrandFacebook className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
              <IconBrandTwitter className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <IconBrandInstagram className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
              <IconBrandLinkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Giant footer brand wordmark */}
        <div className="mt-12 flex justify-center select-none overflow-hidden">
          <span className="text-[10vw] font-black tracking-[0.15em] text-slate-700/30 dark:text-slate-800/35 uppercase leading-none">
            LIFESAVER
          </span>
        </div>

      </div>
    </footer>
  );
}
