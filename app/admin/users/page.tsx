"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, getMockUsersList, UserProfile } from "@/lib/firebase";

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      if (user.role !== "admin") {
        window.location.href = "/dashboard";
        return;
      }
      setLoading(false);

      const list = await getMockUsersList();
      setUsersList(list);
    }
    checkAuthAndLoad();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span>Accessing Administration Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-16 transition-colors duration-300">
      
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1 transition-colors">
          ← Exit Admin Area
        </a>
        <h1 className="text-xs font-semibold tracking-wider text-primary uppercase">
          User Cohorts Directory
        </h1>
      </header>

      {/* Main Layout */}
      <div className="max-w-5xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mt-8 flex-1 text-left">
        
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-2 text-xs font-semibold flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block pb-1">Cockpit Nodes</span>
          <a href="/admin" className="p-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-semibold">
            Overview Stats
          </a>
          <a href="/admin/users" className="p-3.5 rounded-xl bg-primary/10 text-primary border border-primary/20 transition-all font-semibold">
            Users Cohort Table
          </a>
          <a href="/admin/tokens" className="p-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-semibold">
            Token Expenditures
          </a>
          <a href="/admin/logs" className="p-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-semibold">
            System Cron Logs
          </a>
        </aside>

        {/* Content Node */}
        <main className="md:col-span-3 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xs font-semibold tracking-widest text-primary uppercase">Cohort Registry Directory</h2>
            <p className="text-[10px] text-muted-foreground">Searchable list of all virtual and authenticated accounts linked to host.</p>
          </div>

          <section className="bg-card border border-border rounded-[2rem] p-8 shadow-xl">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-[10px]">
                    <th className="py-2.5">User UID</th>
                    <th className="py-2.5">Email Address</th>
                    <th className="py-2.5">Display Name</th>
                    <th className="py-2.5">Onboarded?</th>
                    <th className="py-2.5">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.uid} className="border-b border-border/40 text-foreground">
                      <td className="py-3.5 font-mono text-[10px] text-muted-foreground/60">{u.uid}</td>
                      <td className="py-3.5 font-semibold text-xs">{u.email}</td>
                      <td className="py-3.5 text-muted-foreground">{u.displayName || "Not set"}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded text-[8px] font-semibold tracking-wider border ${
                          u.onboarded 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                            : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                        }`}>
                          {u.onboarded ? "COMPLETE" : "PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 text-[10px] text-muted-foreground/60">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}
