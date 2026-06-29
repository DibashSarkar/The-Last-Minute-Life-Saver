"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { IconBolt, IconSun, IconMoon, IconBell, IconCheck } from "@tabler/icons-react";
import { getCurrentUser } from "@/lib/firebase";
import { getNotifications, markAllAsRead, NotificationItem, playNotificationSound } from "@/lib/notifications";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userName, setUserName] = useState("Companion");
  const [currentTime, setCurrentTime] = useState("");
  const [quote, setQuote] = useState("");
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [activePopup, setActivePopup] = useState<NotificationItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize theme, auth and stats
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Load User
    async function loadUser() {
      const u = await getCurrentUser();
      if (u) {
        setUserName(u.displayName || u.email.split("@")[0]);
      }
    }
    loadUser();

    // Quotes calibration
    const quotes = [
      "Take it one breath at a time.",
      "Focus on what you can control today.",
      "Progress is better than perfection.",
      "Your mental well-being is your power.",
      "Slow down to speed up.",
      "You are capable of amazing things.",
      "Keep a calm mind, the rest will follow."
    ];
    const todayIndex = new Date().getDate() % quotes.length;
    setQuote(quotes[todayIndex]);

    // Timer logic
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true
      }));
    }, 1000);

    // Load Notifications
    setIsMuted(localStorage.getItem("lifesaver_mute_sound") === "true");

    const updateList = () => {
      const list = getNotifications();
      setNotifications(list);
      
      // Auto trigger popup overlay if notification was created in last 4 seconds
      if (list.length > 0) {
        const newest = list[0];
        const ageMs = Date.now() - new Date(newest.timestamp).getTime();
        if (!newest.read && ageMs < 4000) {
          setActivePopup(newest);
        }
      }
    };
    updateList();
    window.addEventListener("lifesaver_notification_update", updateList);

    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowBellDropdown(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);

    return () => {
      clearInterval(interval);
      window.removeEventListener("lifesaver_notification_update", updateList);
      document.removeEventListener("mousedown", clickOutside);
    };
  }, []);

  // Continuous notification alert loop when popup is active
  useEffect(() => {
    if (!activePopup || isMuted) return;

    // Play sound immediately
    playNotificationSound();

    // Play continuously every 2.5 seconds
    const soundInterval = setInterval(() => {
      playNotificationSound();
    }, 2500);

    return () => clearInterval(soundInterval);
  }, [activePopup, isMuted]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(0, 3);

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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-muted/30 dark:bg-muted/10 text-foreground transition-colors duration-300 font-sans">

        {/* Floating Sidebar */}
        <Suspense fallback={<div className="w-64 h-screen bg-card" />}>
          <AppSidebar />
        </Suspense>

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 min-w-0 md:my-2 md:mr-2 md:ml-0 md:rounded-xl md:border md:border-border md:shadow-sm overflow-hidden bg-background">

          {/* Header Bar */}
          <header className="flex h-12 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 md:px-5 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="h-7 w-7 rounded-[var(--radius)] border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0" />
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold tracking-tight min-w-0 max-w-lg lg:max-w-4xl select-none truncate">
                {/* Workspace Dashboard Pill */}
                <span className="bg-primary/10 text-foreground border border-primary/30 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 font-extrabold">
                  Workspace Dashboard
                </span>
                
                <span className="text-border shrink-0">|</span>

                {/* Hello User Highlight */}
                <span className="text-foreground shrink-0">
                  Hello <span className="text-primary font-black">{userName}</span>
                </span>

                <span className="text-border shrink-0">|</span>

                {/* Quote of the Day */}
                <span className="text-muted-foreground/80 italic font-medium truncate max-w-[200px] lg:max-w-[400px]">
                  "{quote}"
                </span>

                <span className="text-border shrink-0">|</span>

                {/* Dynamic Timer Badge */}
                <span className="bg-muted text-muted-foreground/90 border border-border px-2 py-0.5 rounded-full font-bold tabular-nums shrink-0">
                  {currentTime}
                </span>
              </div>
            </div>

            {/* Mobile brand indicator */}
            <div className="flex items-center gap-2 lg:hidden shrink-0">
              <div className="h-7 w-7 rounded-[var(--radius)] bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <IconBolt className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-xs tracking-tight text-foreground">
                Life Saver
              </span>
            </div>

            {/* Theme toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowBellDropdown(!showBellDropdown)}
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer relative"
                  aria-label="Notifications"
                >
                  <IconBell className="h-3.5 w-3.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                  )}
                </button>

                {showBellDropdown && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-3 shadow-2xl z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2">
                      <span className="font-bold text-xs text-foreground">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-[9px] font-bold text-primary hover:underline flex items-center gap-0.5"
                        >
                          <IconCheck className="h-3 w-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      {recentNotifications.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground text-center py-4">No recent notifications.</p>
                      ) : (
                        recentNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-2 rounded-lg border text-[10px] space-y-1 transition-colors ${
                              notif.read ? "bg-background border-border/40 text-muted-foreground" : "bg-primary/5 border-primary/20 text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className={`h-1.5 w-1.5 rounded-full ${notif.read ? "bg-muted-foreground/30" : "bg-primary"}`}></span>
                              <span className="truncate">{notif.title}</span>
                            </div>
                            <p className="text-[9px] leading-relaxed text-muted-foreground/90 font-medium">{notif.message}</p>
                            <span className="text-[8px] text-muted-foreground/60 block pt-0.5">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-border pt-2 mt-2">
                      <button
                        onClick={() => {
                          setShowBellDropdown(false);
                          window.location.href = "/dashboard?tab=notifications";
                        }}
                        className="w-full text-center text-[10px] font-bold text-primary hover:underline block cursor-pointer"
                      >
                        View all alerts
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === "light" ? (
                  <IconMoon className="h-3.5 w-3.5 text-orange-500" /> // Orange toggle icon
                ) : (
                  <IconSun className="h-3.5 w-3.5 text-orange-500" />
                )}
              </button>
            </div>
          </header>

          {/* Page content — full width, no extra padding container */}
          <div className="flex-1 flex flex-col overflow-x-hidden w-full relative">
            {children}
            
            {/* Global Notification Toast Popup */}
            {activePopup && (
              <div className="fixed inset-0 bg-background/60 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-card border-2 border-secondary/40 p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 space-y-4 relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                      <span className="font-bold text-[9px] text-secondary uppercase tracking-widest">AI Co-pilot Alert</span>
                    </div>
                    <button
                      onClick={() => setActivePopup(null)}
                      className="text-muted-foreground hover:text-foreground text-xs font-bold bg-muted/60 hover:bg-muted h-6 w-6 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Dismiss Alert"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">{activePopup.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{activePopup.message}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
                    <button
                      onClick={() => {
                        alert(`Snoozed: "${activePopup.title}" for 10m.`);
                        setActivePopup(null);
                      }}
                      className="bg-primary/10 hover:bg-primary/15 text-primary text-[9px] font-bold py-1.5 px-2 rounded-md border border-primary/20 cursor-pointer transition-colors"
                    >
                      Snooze 10m
                    </button>
                    <button
                      onClick={() => {
                        alert(`Snoozed: "${activePopup.title}" for 30m.`);
                        setActivePopup(null);
                      }}
                      className="bg-primary/10 hover:bg-primary/15 text-primary text-[9px] font-bold py-1.5 px-2 rounded-md border border-primary/20 cursor-pointer transition-colors"
                    >
                      Add 30m
                    </button>
                    <button
                      onClick={() => {
                        const nextMute = !isMuted;
                        setIsMuted(nextMute);
                        localStorage.setItem("lifesaver_mute_sound", nextMute ? "true" : "false");
                        alert(nextMute ? "Notification sounds muted." : "Notification sounds unmuted.");
                      }}
                      className="bg-destructive/10 hover:bg-destructive/15 text-destructive text-[9px] font-bold py-1.5 px-2 rounded-md border border-destructive/20 cursor-pointer transition-colors"
                    >
                      {isMuted ? "Unmute Sound" : "Stop Sounds"}
                    </button>
                    <button
                      onClick={() => {
                        // Mark as read and dismiss
                        const current = getNotifications();
                        const updated = current.map(item => item.id === activePopup.id ? { ...item, read: true } : item);
                        localStorage.setItem("lifesaver_notifications", JSON.stringify(updated));
                        window.dispatchEvent(new Event("lifesaver_notification_update"));
                        setActivePopup(null);
                      }}
                      className="bg-secondary hover:bg-secondary/95 text-white text-[9px] font-extrabold py-1.5 px-3 rounded-md border border-secondary/20 cursor-pointer transition-colors ml-auto flex items-center gap-1 shadow-sm"
                    >
                      <IconCheck className="h-3 w-3" /> Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
