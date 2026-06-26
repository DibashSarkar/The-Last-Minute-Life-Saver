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
      setLoading(false);

      const list = await getMockUsersList();
      setUsersList(list);
    }
    checkAuthAndLoad();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span>Accessing Administration Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1">
          ← Exit Admin Area
        </a>
        <h1 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">
          User Cohorts Directory
        </h1>
      </header>

      {/* Main Layout */}
      <div className="max-w-5xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mt-8 flex-1">
        
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-2 text-xs font-semibold">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block pb-1">Cockpit Nodes</span>
          <a href="/admin" className="block p-3 rounded-lg bg-slate-900/35 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800">
            Overview Stats
          </a>
          <a href="/admin/users" className="block p-3 rounded-lg bg-indigo-950/20 text-indigo-300 border border-indigo-900/40">
            Users Cohort Table
          </a>
          <a href="/admin/tokens" className="block p-3 rounded-lg bg-slate-900/35 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800">
            Token Expenditures
          </a>
          <a href="/admin/logs" className="block p-3 rounded-lg bg-slate-900/35 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800">
            System Cron Logs
          </a>
        </aside>

        {/* Content Node */}
        <main className="md:col-span-3 space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">Cohort Registry Directory</h2>
            <p className="text-[10px] text-slate-500">Searchable list of all virtual and authenticated accounts linked to host.</p>
          </div>

          <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[10px]">
                    <th className="py-2">User UID</th>
                    <th className="py-2">Email Address</th>
                    <th className="py-2">Display Name</th>
                    <th className="py-2">Onboarded?</th>
                    <th className="py-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.uid} className="border-b border-slate-900/60 text-slate-300">
                      <td className="py-3 font-mono text-[10px] text-slate-500">{u.uid}</td>
                      <td className="py-3 font-semibold">{u.email}</td>
                      <td className="py-3 text-slate-400">{u.displayName || "Not set"}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-semibold tracking-wider ${
                          u.onboarded 
                            ? "bg-emerald-950/70 border border-emerald-900/40 text-emerald-300" 
                            : "bg-amber-950/70 border border-amber-900/40 text-amber-300"
                        }`}>
                          {u.onboarded ? "COMPLETE" : "PENDING"}
                        </span>
                      </td>
                      <td className="py-3 text-[10px] text-slate-500">
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
