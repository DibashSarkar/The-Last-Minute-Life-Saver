"use client";

import React, { useState, useEffect } from "react";
import { IconSun, IconMoon, IconChevronDown, IconMenu2, IconX } from "@tabler/icons-react";

export default function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  interface NavItem {
    label: string;
    href: string;
    dropdown?: { label: string; href: string }[];
  }

  const navItems: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Support", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-base tracking-tight text-foreground transition-colors">
            Life Saver
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative group py-2"
              onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <a
                href={item.href}
                className="flex items-center gap-1 hover:text-foreground transition-colors duration-200"
              >
                {item.label}
                {item.dropdown && (
                  <IconChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                )}
              </a>

              {/* Dropdown Menu */}
              {item.dropdown && activeDropdown === item.label && (
                <div className="absolute left-0 top-full mt-1 w-48 rounded-xl border border-border bg-card p-2.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {item.dropdown.map((subItem) => (
                    <a
                      key={subItem.label}
                      href={subItem.href}
                      className="block rounded-lg px-3.5 py-2 text-xs hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <IconMoon className="h-4 w-4" /> : <IconSun className="h-4 w-4" />}
          </button>

          <a
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground px-3.5 py-2 transition-colors"
          >
            Login
          </a>
          <a
            href="/signup"
            className="bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Organizing Free
          </a>
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <IconMoon className="h-4 w-4" /> : <IconSun className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-6 py-4 shadow-inner animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4 text-sm font-medium text-muted-foreground">
            {navItems.map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <a
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                  onClick={() => !item.dropdown && setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
                {item.dropdown && (
                  <div className="pl-4 flex flex-col gap-2 border-l border-border mt-1">
                    {item.dropdown.map((subItem) => (
                      <a
                        key={subItem.label}
                        href={subItem.href}
                        className="text-xs hover:text-foreground transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {subItem.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <hr className="border-border my-2" />
            <div className="flex flex-col gap-3">
              <a
                href="/login"
                className="text-center text-sm font-medium py-2.5 rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </a>
              <a
                href="/signup"
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-center text-sm font-medium py-2.5 rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Start Organizing Free
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
