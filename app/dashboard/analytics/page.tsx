"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, getTasks, Task } from "@/lib/firebase";
import { IconChevronLeft, IconChevronRight, IconCalendar } from "@tabler/icons-react";

export default function AnalyticsPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("week");
  const [selectedDate, setSelectedDate] = useState("");

  // Pagination states for the day-wide task list
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Set default selected date to today
    setSelectedDate(new Date().toISOString().split("T")[0]);

    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setLoadingUser(false);
      const ts = await getTasks();
      setTasks(ts);
    }
    checkAuthAndLoad();
  }, []);

  const completed = tasks.filter(t => t.status === "completed");
  const pending   = tasks.filter(t => t.status !== "completed");

  const completedWithTime = completed.filter(t => t.actualDuration > 0);
  const totalActual       = completedWithTime.reduce((sum, t) => sum + t.actualDuration, 0);
  const totalEstimated    = completedWithTime.reduce((sum, t) => sum + t.estimatedDuration, 0);
  const avgSpeedRatio     = totalEstimated > 0 ? (totalActual / totalEstimated) : 1;

  const highEnergy   = tasks.filter(t => t.energyRequired === "high").length;
  const mediumEnergy = tasks.filter(t => t.energyRequired === "medium").length;
  const lowEnergy    = tasks.filter(t => t.energyRequired === "low").length;

  const completionPct = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

  // Filter tasks for Day-wide list
  const getFilteredDayTasks = () => {
    if (!selectedDate) return tasks;
    return tasks.filter(t => {
      const taskDate = new Date(t.createdAt).toISOString().split("T")[0];
      return taskDate === selectedDate;
    });
  };

  const dayTasks = getFilteredDayTasks();

  // Paginated tasks
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDayTasks = dayTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dayTasks.length / itemsPerPage);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-sans">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
          <span className="text-sm font-medium">Loading your progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-16 transition-colors duration-300">

      {/* Header */}
      <header className="border-b border-border bg-background px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <a href="/dashboard" className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1 transition-colors">
          ← Back to Dashboard
        </a>
        <h1 className="text-xs font-semibold tracking-wider text-primary uppercase flex items-center gap-2">
          📊 Progress Report
        </h1>
      </header>

      <main className="max-w-full mx-auto w-full px-0 md:px-6 mt-6 space-y-6 flex-1 text-left">
        
        {/* Period Selector Tabs and Date Input Row */}
        <div className="bg-card border border-border rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-md text-xs w-fit">
            {[
              { id: "day", label: "Day-wide" },
              { id: "week", label: "Weekly" },
              { id: "month", label: "Monthly" },
              { id: "year", label: "Yearly" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id as any)}
                className={`px-3 py-1.5 rounded-sm font-bold transition-all cursor-pointer ${
                  period === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date Selector input */}
          <div className="flex items-center gap-2 bg-muted border border-border px-3 py-1.5 rounded-md text-xs w-full sm:w-auto">
            <IconCalendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1); // Reset page on date change
              }}
              className="bg-transparent border-none text-foreground font-bold focus:outline-none w-full sm:w-auto cursor-pointer"
            />
          </div>
        </div>

        {/* Top Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Speed Card */}
          <div className="border border-border bg-card rounded-md p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xl shrink-0">⚡</div>
              <span className="text-xs font-bold text-foreground">How Fast You Work</span>
            </div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {avgSpeedRatio.toFixed(2)}x
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
              {avgSpeedRatio > 1.15
                ? "Tasks are taking longer than estimated — schedule adjusts automatically."
                : avgSpeedRatio < 0.85
                ? "You're faster than estimated! Good work."
                : "You're right on track with your time estimates."}
            </p>
          </div>

          {/* Completion Rate Card */}
          <div className="border border-border bg-card rounded-md p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xl shrink-0">✅</div>
              <span className="text-xs font-bold text-foreground">Tasks Done vs Remaining</span>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {completionPct}%
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-secondary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold">
              {completed.length} done · {pending.length} remaining
            </p>
          </div>

          {/* Difficulty Mix Card */}
          <div className="border border-border bg-card rounded-md p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xl shrink-0">🔋</div>
              <span className="text-xs font-bold text-foreground">Task Difficulty Mix</span>
            </div>
            <div className="flex gap-2 items-center text-[10px]">
              <div className="flex-1 text-center bg-card p-2 border border-border rounded-md">
                <div className="text-sm font-bold text-rose-600 dark:text-rose-450">{highEnergy}</div>
                <div className="text-[8px] text-muted-foreground font-bold mt-0.5">🔥 Hard</div>
              </div>
              <div className="flex-1 text-center bg-card p-2 border border-border rounded-md">
                <div className="text-sm font-bold text-amber-600 dark:text-amber-450">{mediumEnergy}</div>
                <div className="text-[8px] text-muted-foreground font-bold mt-0.5">⚡ Medium</div>
              </div>
              <div className="flex-1 text-center bg-card p-2 border border-border rounded-md">
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-450">{lowEnergy}</div>
                <div className="text-[8px] text-muted-foreground font-bold mt-0.5">🌿 Easy</div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold">
              When overwhelmed, the app filters out 🔥 hard tasks.
            </p>
          </div>

        </section>

        {/* Day-Wide Tasks Full-Width List Section with Pagination */}
        <section className="bg-card border border-border rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border pb-3">
            <div>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Day-Wide Completed/Pending Tasks</h2>
              <p className="text-[10px] text-muted-foreground">Showing tasks logs created on {selectedDate || "selected date"}</p>
            </div>
            <span className="text-[10px] bg-muted border border-border px-2 py-0.5 rounded font-bold text-muted-foreground">
              Total: {dayTasks.length} tasks
            </span>
          </div>

          {dayTasks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground/60 text-xs bg-muted/10 border border-dashed border-border rounded-md space-y-2">
              <div className="text-3xl">⏱️</div>
              <p>No tasks logs found for this date. Select another date or create tasks on your workspace page.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="divide-y divide-border/60">
                {currentDayTasks.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-foreground">{t.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        Est: {t.estimatedDuration}m · Actual: {t.actualDuration || 0}m
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                        t.status === "completed" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border/60 text-[10px] font-bold text-muted-foreground">
                  <span>Page {currentPage} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center h-7 w-7 rounded border border-border bg-card hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <IconChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center h-7 w-7 rounded border border-border bg-card hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <IconChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Task Accuracy Table */}
        <section className="bg-card border border-border rounded-md p-4 space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-lg shrink-0">📈</div>
            <div>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Time Accuracy per Completed Task</h2>
              <p className="text-[9px] text-muted-foreground font-semibold">How close your estimates were vs actual focused work time</p>
            </div>
          </div>

          {completedWithTime.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground/60 text-xs bg-muted/10 border border-dashed border-border rounded-md space-y-2">
              <div className="text-3xl">⏱️</div>
              <p>No timing data yet. Complete tasks in Focus Mode with the timer running to see accuracy stats here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-[10px] uppercase">
                    <th className="py-2.5 font-bold">Task</th>
                    <th className="py-2.5 font-bold">You Guessed</th>
                    <th className="py-2.5 font-bold">Actual Time</th>
                    <th className="py-2.5 font-bold">Deviation</th>
                  </tr>
                </thead>
                <tbody>
                  {completedWithTime.map(t => {
                    const ratio      = t.actualDuration / t.estimatedDuration;
                    const devPercent = Math.round((ratio - 1) * 100);
                    return (
                      <tr key={t.id} className="border-b border-border/40 text-foreground hover:bg-muted/10 transition-colors">
                        <td className="py-3.5 font-semibold text-xs">{t.title}</td>
                        <td className="py-3.5 text-muted-foreground font-semibold">{t.estimatedDuration} min</td>
                        <td className="py-3.5 font-bold">{t.actualDuration} min</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border ${
                            ratio > 1.15
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                              : ratio < 0.85
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground border-border"
                          }`}>
                            {devPercent > 0 ? `+${devPercent}% over` : devPercent === 0 ? "Perfect!" : `${Math.abs(devPercent)}% under`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
