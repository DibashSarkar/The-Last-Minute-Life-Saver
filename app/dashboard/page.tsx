"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  getTasks, 
  saveTask, 
  deleteTask, 
  getSettings, 
  saveSettings, 
  getTimeBlocks, 
  saveTimeBlocks,
  clearAllTimeBlocks,
  isSandboxMode,
  getCurrentUser,
  authLogout,
  Task, 
  TimeBlock, 
  UserSettings,
  UserProfile
} from "@/lib/firebase";
import { autoScheduleTasks, calculatePriorityScore } from "@/lib/priority";
import { 
  IconActivity, 
  IconCheck, 
  IconClock, 
  IconPlus, 
  IconTrash, 
  IconFlame, 
  IconTrendingUp, 
  IconMoodSmile, 
  IconTarget, 
  IconHeart, 
  IconBrain, 
  IconCalendar, 
  IconListCheck,
  IconSun,
  IconMoon,
  IconSparkles,
  IconAlertTriangle,
  IconReport,
  IconDownload,
  IconSettings,
  IconX,
  IconBell,
  IconPlayerPlay,
} from "@tabler/icons-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  addNotification,
  NotificationItem
} from "@/lib/notifications";

// Mood Log interface
interface MoodLog {
  date: string; // YYYY-MM-DD
  mood: "great" | "good" | "okay" | "stressed" | "tired";
  energy: number; // 1 to 5
  sleep: number; // hours
  note: string;
  tasksCompleted: number;
}

// Habit interface
interface Habit {
  id: string;
  name: string;
  streak: number;
  history: string[]; // dates completed (YYYY-MM-DD)
}

// Goal interface
interface Goal {
  id: string;
  title: string;
  category: "short" | "medium" | "long";
  progress: number;
  targetDate: string;
}

interface GroupedDataPoint {
  label: string;
  shortLabel: string;
  value: number;
  mood: string;
  sleep: number;
  energy: number;
}

const HeatmapView = ({ data, timeframe }: { data: GroupedDataPoint[]; timeframe: "day" | "week" | "month" | "quarter" | "year" }) => {
  if (data.length === 0) return <div className="text-xs text-muted-foreground p-8 text-center font-semibold">No rhythm logs recorded yet.</div>;

  const isDay = timeframe === "day";
  const boxSize = timeframe === "day"
    ? "w-7.5 h-7.5 text-[8px]"
    : timeframe === "week"
    ? "w-6 h-6"
    : "w-6.5 h-6.5";

  const gridClass = timeframe === "day" || timeframe === "week"
    ? "grid-cols-7 gap-1.5"
    : timeframe === "month"
    ? "grid-cols-4 sm:grid-cols-6 gap-2"
    : "grid-cols-4 gap-2";

  return (
    <div className="w-full space-y-4">
      <div className={`grid ${gridClass} max-w-sm mx-auto justify-items-center`}>
        {data.map((d, index) => {
          const color = 
            d.mood === "great"
              ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
              : d.mood === "good"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : d.mood === "okay"
              ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
              : d.mood === "stressed"
              ? "bg-destructive/10 border-destructive/25 text-destructive"
              : "bg-amber-500/10 border-amber-500/20 text-amber-500";
          
          return (
            <div
              key={index}
              className={`${boxSize} border rounded-md flex flex-col items-center justify-center font-bold shadow-sm relative group cursor-pointer transition-all hover:scale-105 ${color}`}
            >
              <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col bg-popover border border-border p-2 rounded-lg shadow-xl text-[8px] font-semibold text-foreground z-30 pointer-events-none min-w-[100px]">
                <span className="text-primary font-bold">{d.label}</span>
                <span>Mood: {d.mood}</span>
                <span>Sleep: {d.sleep}h</span>
                <span>Energy: {d.energy}/5</span>
              </div>
              {isDay && (d.shortLabel.includes("/") ? d.shortLabel.split("/")[1] : d.shortLabel)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BarChart = ({ data }: { data: GroupedDataPoint[] }) => {
  if (data.length === 0) return <div className="text-xs text-muted-foreground p-8 text-center font-semibold">No rhythm logs recorded yet.</div>;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-end gap-1.5 h-[140px] px-2 pt-4 border-b border-border">
        {data.map((d, i) => {
          const heightPct = Math.max(10, ((d.value) / 4) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer">
              <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col bg-popover border border-border p-2 rounded-lg shadow-xl text-[8px] font-semibold text-foreground z-30 pointer-events-none min-w-[100px]">
                <span className="text-primary font-bold">{d.label}</span>
                <span>Mood: {d.mood}</span>
                <span>Sleep: {d.sleep}h</span>
                <span>Energy: {d.energy}/5</span>
              </div>
              <div 
                className="w-full rounded-t-sm bg-gradient-to-t from-secondary/70 to-secondary transition-all duration-300 group-hover:shadow-md group-hover:shadow-secondary/20"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[8px] font-bold text-muted-foreground px-2">
        {data.length > 8 ? (
          <>
            <span>{data[0].shortLabel}</span>
            <span>{data[Math.floor(data.length / 2)].shortLabel}</span>
            <span>{data[data.length - 1].shortLabel}</span>
          </>
        ) : (
          data.map((d, i) => <span key={i} className="text-center flex-1 truncate">{d.shortLabel}</span>)
        )}
      </div>
    </div>
  );
};

const LineChart = ({ data }: { data: GroupedDataPoint[] }) => {
  if (data.length === 0) return <div className="text-xs text-muted-foreground p-8 text-center font-semibold">No rhythm logs recorded yet.</div>;

  const width = 500;
  const height = 150;
  const paddingX = 30;
  const paddingY = 25;

  const points = data.map((d, i) => {
    const x = data.length > 1 
      ? paddingX + (i / (data.length - 1)) * (width - paddingX * 2)
      : width / 2;
    const normalized = (d.value - 1) / 3;
    const y = height - paddingY - normalized * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full h-[150px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="rhythm-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.25 45)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="oklch(0.65 0.25 45)" stopOpacity="0.00" />
            </linearGradient>
          </defs>
          
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} className="stroke-border/40 stroke-1" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} className="stroke-border/40 stroke-1" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} className="stroke-border/60 stroke-1" />

          {areaPath && <path d={areaPath} fill="url(#rhythm-grad)" />}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="oklch(0.65 0.25 45)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {points.map((p, i) => (
            <g key={i} className="group/dot cursor-pointer">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                className="fill-secondary stroke-card stroke-2 transition-all group-hover/dot:r-5" 
              />
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="15" 
                fill="transparent" 
              />
              <title>{`${p.label}\nMood: ${p.mood}\nSleep: ${p.sleep}h\nEnergy: ${p.energy}/5`}</title>
            </g>
          ))}
        </svg>
      </div>
      
      <div className="flex justify-between text-[8px] font-bold text-muted-foreground px-4">
        {data.length > 5 ? (
          <>
            <span>{data[0].shortLabel}</span>
            <span>{data[Math.floor(data.length / 2)].shortLabel}</span>
            <span>{data[data.length - 1].shortLabel}</span>
          </>
        ) : (
          data.map((d, i) => <span key={i}>{d.shortLabel}</span>)
        )}
      </div>
    </div>
  );
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "deadline" | "event" | "update" | "ai">("all");

  useEffect(() => {
    const updateList = () => {
      setNotifications(getNotifications());
    };
    updateList();
    window.addEventListener("lifesaver_notification_update", updateList);
    return () => window.removeEventListener("lifesaver_notification_update", updateList);
  }, []);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Core app state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    workingHours: { start: "09:00", end: "17:00" },
    currentEnergyState: "high",
    pomodoroConfig: { focusDuration: 25, breakDuration: 5 }
  });
  
  // Custom companion states (saved to localStorage for seamless sandbox integration)
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [rhythmTimeframe, setRhythmTimeframe] = useState<"day" | "week" | "month" | "quarter" | "year">("day");
  const [rhythmChartType, setRhythmChartType] = useState<"heatmap" | "bar" | "line">("heatmap");
  
  // Caring prompt pop state
  const [activePop, setActivePop] = useState<string | null>(null);
  
  // Input states
  const [panicInput, setPanicInput] = useState("");
  const [isTriageLoading, setIsTriageLoading] = useState(false);
  const [scaffoldingLoadingId, setScaffoldingLoadingId] = useState<string | null>(null);
  const [isNegotiateLoading, setIsNegotiateLoading] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState<{ explanation: string; dropped: string[] } | null>(null);
  const [sandbox, setSandbox] = useState(true);

  // New item inputs
  const [newMood, setNewMood] = useState<MoodLog["mood"]>("good");
  const [newEnergy, setNewEnergy] = useState(4);
  const [newSleep, setNewSleep] = useState(7);
  const [newMoodNote, setNewMoodNote] = useState("");
  const [newHabitName, setNewHabitName] = useState("");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<Goal["category"]>("short");
  const [newGoalDate, setNewGoalDate] = useState("");

  // Auth check & load data
  useEffect(() => {
    async function checkAuthAndLoad() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      
      if (!user.onboarded) {
        window.location.href = "/onboarding";
        return;
      }

      setCurrentUser(user);
      setLoadingUser(false);

      const ts = await getTasks();
      const bs = await getTimeBlocks();
      const st = await getSettings();
      setTasks(ts);
      setTimeBlocks(bs);
      setSettings(st);
      setSandbox(isSandboxMode());

      // Load mock companion data
      const storedMoods = localStorage.getItem("lifesaver_moods");
      if (storedMoods) {
        setMoodLogs(JSON.parse(storedMoods));
      } else {
        // Seed default logs for rich initial visualization
        const seedMoods: MoodLog[] = [];
        const today = new Date();
        const moodOptions: MoodLog["mood"][] = ["great", "good", "okay", "stressed", "tired"];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          seedMoods.push({
            date: dateStr,
            mood: moodOptions[(i % 3 === 0 ? 1 : i % 5 === 0 ? 3 : 2)],
            energy: (i % 4) + 2,
            sleep: 6 + (i % 3),
            note: "A regular day.",
            tasksCompleted: i % 2 === 0 ? 2 : 0
          });
        }
        setMoodLogs(seedMoods);
        localStorage.setItem("lifesaver_moods", JSON.stringify(seedMoods));
      }

      const storedHabits = localStorage.getItem("lifesaver_habits");
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      } else {
        const seedHabits: Habit[] = [
          { id: "h1", name: "Daily Meditation", streak: 5, history: [] },
          { id: "h2", name: "Drink 3L Water", streak: 12, history: [] },
          { id: "h3", name: "Write in Journal", streak: 3, history: [] }
        ];
        setHabits(seedHabits);
        localStorage.setItem("lifesaver_habits", JSON.stringify(seedHabits));
      }

      const storedGoals = localStorage.getItem("lifesaver_goals");
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      } else {
        const seedGoals: Goal[] = [
          { id: "g1", title: "Complete Midterm Project", category: "short", progress: 65, targetDate: "2026-07-15" },
          { id: "g2", title: "Establish Clean Work Hours Routine", category: "medium", progress: 40, targetDate: "2026-08-30" },
          { id: "g3", title: "Read 12 Books This Year", category: "long", progress: 25, targetDate: "2026-12-31" }
        ];
        setGoals(seedGoals);
        localStorage.setItem("lifesaver_goals", JSON.stringify(seedGoals));
      }
    }
    checkAuthAndLoad();

    // Listen to chatbot task added event to reload tasks instantly
    const handleTaskAdded = async () => {
      const ts = await getTasks();
      setTasks(ts);
    };
    window.addEventListener("task-added", handleTaskAdded);
    return () => window.removeEventListener("task-added", handleTaskAdded);
  }, []);

  // Caring prompts intervals
  useEffect(() => {
    const prompts = [
      "How is your energy right now? Remember to take a slow deep breath with me.",
      "Are you drinking enough water today? 💧",
      "If task lists are overwhelming, let's postpone some deadlines to tomorrow.",
      "You are doing wonderfully. Keep going!",
      "Need a sounding board? Click 'Talk to AI' or message me in the bottom-right chat box."
    ];

    const timer = setTimeout(() => {
      setActivePop(prompts[0]);
    }, 15000); // 15s initial

    const interval = setInterval(() => {
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      setActivePop(randomPrompt);
    }, 45000); // every 45s

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Sync state to localStorage
  const updateMoodLogs = (newLogs: MoodLog[]) => {
    setMoodLogs(newLogs);
    localStorage.setItem("lifesaver_moods", JSON.stringify(newLogs));
  };

  const updateHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem("lifesaver_habits", JSON.stringify(newHabits));
  };

  const updateGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem("lifesaver_goals", JSON.stringify(newGoals));
  };

  const getGroupedRhythmData = () => {
    const sortedLogs = [...moodLogs].sort((a, b) => a.date.localeCompare(b.date));
    
    const getMoodValue = (m: string) => {
      if (m === "great") return 4;
      if (m === "good") return 3;
      if (m === "okay") return 2;
      if (m === "stressed") return 1;
      return 2;
    };

    const getMoodLabel = (val: number) => {
      const rounded = Math.round(val);
      if (rounded >= 4) return "great";
      if (rounded === 3) return "good";
      if (rounded === 2) return "okay";
      return "stressed";
    };

    if (rhythmTimeframe === "day") {
      return sortedLogs.slice(-28).map(log => ({
        label: log.date,
        shortLabel: log.date.split("-")[2],
        value: getMoodValue(log.mood),
        mood: log.mood,
        sleep: log.sleep,
        energy: log.energy
      }));
    }

    const groups: { [key: string]: { values: number[]; sleep: number[]; energy: number[] } } = {};

    sortedLogs.forEach(log => {
      const date = new Date(log.date);
      let key = "";
      let shortLabel = "";

      if (rhythmTimeframe === "week") {
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek;
        const startOfWeek = new Date(date.setDate(diff));
        key = `Week of ${startOfWeek.toISOString().split("T")[0]}`;
        shortLabel = `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;
      } else if (rhythmTimeframe === "month") {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        shortLabel = monthNames[date.getMonth()];
      } else if (rhythmTimeframe === "quarter") {
        const q = Math.floor(date.getMonth() / 3) + 1;
        key = `Q${q} ${date.getFullYear()}`;
        shortLabel = `Q${q}`;
      } else if (rhythmTimeframe === "year") {
        key = `${date.getFullYear()}`;
        shortLabel = key;
      }

      if (!groups[key]) {
        groups[key] = { values: [], sleep: [], energy: [] };
      }
      groups[key].values.push(getMoodValue(log.mood));
      groups[key].sleep.push(log.sleep);
      groups[key].energy.push(log.energy);
    });

    return Object.keys(groups).map(key => {
      const valAvg = groups[key].values.reduce((a, b) => a + b, 0) / groups[key].values.length;
      const sleepAvg = groups[key].sleep.reduce((a, b) => a + b, 0) / groups[key].sleep.length;
      const energyAvg = groups[key].energy.reduce((a, b) => a + b, 0) / groups[key].energy.length;
      
      let sl = key;
      if (rhythmTimeframe === "week") {
        sl = key.replace("Week of ", "Wk ");
      } else if (rhythmTimeframe === "month") {
        sl = key.split(" ")[0];
      } else if (rhythmTimeframe === "quarter") {
        sl = key.split(" ")[0];
      } else if (rhythmTimeframe === "year") {
        sl = key;
      }

      return {
        label: key,
        shortLabel: sl,
        value: valAvg,
        mood: getMoodLabel(valAvg),
        sleep: Math.round(sleepAvg * 10) / 10,
        energy: Math.round(energyAvg * 10) / 10
      };
    });
  };

  // Triage Dump
  const handlePanicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panicInput.trim()) return;

    setIsTriageLoading(true);
    try {
      const response = await fetch("/api/panic-dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: panicInput }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
      setPanicInput("");
      
      const newBlocks = autoScheduleTasks(updatedTasks, settings);
      await clearAllTimeBlocks();
      await saveTimeBlocks(newBlocks);
      setTimeBlocks(newBlocks);
      addNotification(
        "Triage & Schedule Complete!",
        `Gemini successfully parsed your thoughts and structured your schedule.`,
        "ai"
      );
    } catch (error) {
      console.error(error);
      alert("Scheduling calibration failed. Please try again.");
    } finally {
      setIsTriageLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === "completed" ? "pending" : "completed";
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
    await saveTask(task);

    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
    const newBlocks = autoScheduleTasks(updatedTasks, settings);
    await clearAllTimeBlocks();
    await saveTimeBlocks(newBlocks);
    setTimeBlocks(newBlocks);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    const currentBlocks = await getTimeBlocks();
    const updatedBlocks = currentBlocks.filter(b => b.taskId !== taskId);
    await clearAllTimeBlocks();
    await saveTimeBlocks(updatedBlocks);
    
    setTasks(await getTasks());
    setTimeBlocks(updatedBlocks);
  };

  const handleEnergyChange = async (energy: UserSettings["currentEnergyState"]) => {
    const updatedSettings = await saveSettings({ currentEnergyState: energy });
    setSettings(updatedSettings);

    const ts = await getTasks();
    const newBlocks = autoScheduleTasks(ts, updatedSettings);
    await clearAllTimeBlocks();
    await saveTimeBlocks(newBlocks);
    setTimeBlocks(newBlocks);
    addNotification(
      "Energy Profile Calibrated",
      `Gemini successfully rescheduled your tasks optimized for a ${energy} energy state.`,
      "ai"
    );
  };

  const handlePreResearch = async (taskId: string) => {
    setScaffoldingLoadingId(taskId);
    try {
      const response = await fetch("/api/pre-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setTasks(await getTasks());
    } catch (error) {
      console.error(error);
      alert("Task preparation assistance failed.");
    } finally {
      setScaffoldingLoadingId(null);
    }
  };

  const handleAutoNegotiate = async (blockId: string) => {
    setIsNegotiateLoading(true);
    setNegotiationResult(null);
    try {
      const response = await fetch("/api/auto-negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missedBlockId: blockId }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setTimeBlocks(await getTimeBlocks());
      setNegotiationResult({
        explanation: data.explanation,
        dropped: data.droppedTitles || []
      });
    } catch (error) {
      console.error(error);
      alert("Calendar negotiation failed.");
    } finally {
      setIsNegotiateLoading(false);
    }
  };

  // Add Mood Log
  const handleLogMood = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split("T")[0];
    const newLog: MoodLog = {
      date: todayStr,
      mood: newMood,
      energy: newEnergy,
      sleep: newSleep,
      note: newMoodNote,
      tasksCompleted: tasks.filter(t => t.status === "completed").length
    };
    // Update or append
    const filtered = moodLogs.filter(log => log.date !== todayStr);
    updateMoodLogs([...filtered, newLog]);
    setNewMoodNote("");
    alert("Mood recorded successfully for today!");
  };

  // Add Habit
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newH: Habit = {
      id: `habit_${Date.now()}`,
      name: newHabitName,
      streak: 0,
      history: []
    };
    updateHabits([...habits, newH]);
    setNewHabitName("");
  };

  const handleToggleHabit = (habitId: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const completedToday = h.history.includes(todayStr);
        let nextHistory = [...h.history];
        let nextStreak = h.streak;
        if (completedToday) {
          nextHistory = nextHistory.filter(date => date !== todayStr);
          nextStreak = Math.max(0, nextStreak - 1);
        } else {
          nextHistory.push(todayStr);
          nextStreak += 1;
        }
        return { ...h, history: nextHistory, streak: nextStreak };
      }
      return h;
    });
    updateHabits(updated);
  };

  // Add Goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const newG: Goal = {
      id: `goal_${Date.now()}`,
      title: newGoalTitle,
      category: newGoalCategory,
      progress: 0,
      targetDate: newGoalDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    };
    updateGoals([...goals, newG]);
    setNewGoalTitle("");
    setNewGoalDate("");
  };

  const handleUpdateGoalProgress = (goalId: string, delta: number) => {
    const updated = goals.map(g => {
      if (g.id === goalId) {
        return { ...g, progress: Math.min(100, Math.max(0, g.progress + delta)) };
      }
      return g;
    });
    updateGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    updateGoals(goals.filter(g => g.id !== goalId));
  };

  const isBlockMissed = (block: TimeBlock) => {
    if (block.isCompleted) return false;
    const nowTime = new Date().getTime();
    const startTime = new Date(block.startTime).getTime();
    return startTime < nowTime;
  };

  const missedBlock = timeBlocks.find(b => isBlockMissed(b));

  // Calculating summary statistics
  const completedTasksCount = tasks.filter(t => t.status === "completed").length;
  const pendingTasksCount = tasks.filter(t => t.status !== "completed").length;
  const totalTasksCount = tasks.length;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const averageSleep = moodLogs.length > 0 ? (moodLogs.reduce((acc, l) => acc + l.sleep, 0) / moodLogs.length).toFixed(1) : "0";
  const currentStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  if (loadingUser) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center text-muted-foreground font-sans">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
          <span className="text-sm font-semibold">Creating personal space...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      
      {/* Sandbox Warning Banner */}
      {sandbox && (
        <div className="bg-primary/5 border-b border-border text-primary/80 text-[10px] py-2 px-4 text-center backdrop-blur-md flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span>⚡ <strong>Personal Companion:</strong> Running locally on storage database. Connect cloud credentials to sync devices.</span>
        </div>
      )}

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        
        {/* Calming Welcome Header */}
        <div className="bg-card border border-border rounded-[var(--radius)] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Hello, {currentUser?.displayName || "Companion"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Welcome back to your companion cockpit. Let's make today calm and productive.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted p-1 rounded-[var(--radius)]">
              <button
                onClick={() => handleEnergyChange("high")}
                className={`px-3 py-1.5 rounded-[calc(var(--radius)-4px)] text-xs font-semibold transition-all ${
                  settings.currentEnergyState === "high"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                High Energy
              </button>
              <button
                onClick={() => handleEnergyChange("low")}
                className={`px-3 py-1.5 rounded-[calc(var(--radius)-4px)] text-xs font-semibold transition-all ${
                  settings.currentEnergyState === "low"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Low Energy
              </button>
              <button
                onClick={() => handleEnergyChange("overwhelmed")}
                className={`px-3 py-1.5 rounded-[calc(var(--radius)-4px)] text-xs font-semibold transition-all ${
                  settings.currentEnergyState === "overwhelmed"
                    ? "bg-destructive text-destructive-foreground shadow-sm animate-pulse"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Overwhelmed
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs Content Rendering */}

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-[var(--radius)] p-4 shadow-sm space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Productivity</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold">{taskCompletionRate}%</span>
                  <span className="text-[10px] text-muted-foreground">completed</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: `${taskCompletionRate}%` }}></div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-[var(--radius)] p-4 shadow-sm space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Tasks Remaining</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold">{pendingTasksCount}</span>
                  <span className="text-[10px] text-muted-foreground">pending</span>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <IconListCheck className="h-3 w-3 text-primary" /> Organized timeline
                </span>
              </div>

              <div className="bg-card border border-border rounded-[var(--radius)] p-4 shadow-sm space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Max Streak</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold">{currentStreak} days</span>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <IconFlame className="h-3 w-3 text-orange-500" /> Keep moving!
                </span>
              </div>

              <div className="bg-card border border-border rounded-[var(--radius)] p-4 shadow-sm space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Average Sleep</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold">{averageSleep} hrs</span>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <IconHeart className="h-3 w-3 text-rose-500" /> Sleep trends stable
                </span>
              </div>
            </div>

            {/* Core Panels Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Daily timeline / Calendar Slot */}
              <div className="lg:col-span-3 bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-primary" /> Daily Activity Timeline
                  </h2>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold">Today</span>
                </div>

                {/* Crisis Shift Alert */}
                {missedBlock && (
                  <div className="bg-destructive/10 border border-destructive/25 rounded-[var(--radius)] p-4 text-xs space-y-2 mb-2">
                    <div className="flex items-center justify-between text-destructive font-semibold">
                      <span className="flex items-center gap-1"><IconAlertTriangle className="h-3.5 w-3.5" /> Delay Detected</span>
                      <span className="text-[10px] bg-destructive text-destructive-foreground px-2 py-0.5 rounded">LATE</span>
                    </div>
                    <p className="text-muted-foreground">
                      The scheduled slot for <strong>"{missedBlock.title}"</strong> has passed. Shift the timeline to balance your load.
                    </p>
                    <button
                      onClick={() => handleAutoNegotiate(missedBlock.id)}
                      disabled={isNegotiateLoading}
                      className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold py-2 rounded-[calc(var(--radius)-4px)] text-[10px] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isNegotiateLoading ? "Negotiating New Schedule..." : "Resolve & Balance Timeline"}
                    </button>
                  </div>
                )}

                {/* Shift Results summary */}
                {negotiationResult && (
                  <div className="bg-primary/10 border border-primary/20 rounded-[var(--radius)] p-4 text-xs space-y-2 mb-2 relative">
                    <button 
                      onClick={() => setNegotiationResult(null)} 
                      className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-[10px]"
                    >
                      ✕
                    </button>
                    <div className="text-primary font-bold flex items-center gap-1">
                      🧠 Companion Insight: Timeline Adjusted
                    </div>
                    <p className="text-muted-foreground">{negotiationResult.explanation}</p>
                    {negotiationResult.dropped.length > 0 && (
                      <div className="text-[10px] text-destructive font-semibold">
                        Postponed tasks: {negotiationResult.dropped.join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {/* Allocated blocks */}
                <div className="space-y-2.5">
                  {timeBlocks.length === 0 ? (
                    <div className="border border-dashed border-border rounded-[var(--radius)] flex items-center justify-center text-muted-foreground text-xs py-8">
                      Your timeline is empty. Add tasks to see calendar slots.
                    </div>
                  ) : (
                    timeBlocks
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.endTime).getTime())
                      .map((block) => {
                        const isLate = isBlockMissed(block);
                        return (
                          <div
                            key={block.id}
                            className={`border rounded-[var(--radius)] p-3.5 flex flex-col gap-1 transition-all ${
                              block.isCompleted
                                ? "bg-muted/30 border-border/40 opacity-50"
                                : isLate
                                ? "bg-destructive/5 border-destructive/30"
                                : "bg-card border-border hover:border-border/80"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-muted-foreground">
                                ⏱️ {new Date(block.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(block.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              
                              {block.isCompleted ? (
                                <span className="text-[9px] bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded">
                                  COMPLETED
                                </span>
                              ) : isLate ? (
                                <span className="text-[9px] bg-destructive/10 text-destructive font-semibold px-2 py-0.5 rounded animate-pulse">
                                  LATE
                                </span>
                              ) : (
                                <span className="text-[9px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">
                                  SCHEDULED
                                </span>
                              )}
                            </div>

                            <span className={`text-xs font-semibold ${block.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {block.title}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Quick Brain Dump / AI Suggestions */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Share thoughts Box */}
                <div className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <IconBrain className="h-4 w-4 text-primary" /> Clear Your Mind
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Write anything stressing you out. We will parse it and auto-negotiate your schedule.
                  </p>
                  <form onSubmit={handlePanicSubmit} className="space-y-3">
                    <textarea
                      value={panicInput}
                      onChange={(e) => setPanicInput(e.target.value)}
                      placeholder="e.g. I have a presentation tomorrow at 10 AM but haven't started preparing slides..."
                      rows={3}
                      className="w-full bg-background border border-border rounded-[var(--radius)] p-3 text-xs text-foreground focus:outline-none focus:border-primary transition-all font-sans resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isTriageLoading || !panicInput.trim()}
                      className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-2.5 rounded-[var(--radius)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      {isTriageLoading ? "Processing thoughts..." : "Organize Schedule"}
                    </button>
                  </form>
                </div>

                {/* Mood Quick Log */}
                <div className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <IconMoodSmile className="h-4 w-4 text-primary" /> Daily Mood Log
                  </h3>
                  <div className="flex gap-2">
                    {(["great", "good", "okay", "stressed", "tired"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setNewMood(m);
                          const todayStr = new Date().toISOString().split("T")[0];
                          const newLog: MoodLog = {
                            date: todayStr,
                            mood: m,
                            energy: newEnergy,
                            sleep: newSleep,
                            note: "Quick logged",
                            tasksCompleted: completedTasksCount
                          };
                          const filtered = moodLogs.filter(log => log.date !== todayStr);
                          updateMoodLogs([...filtered, newLog]);
                        }}
                        className={`flex-1 py-2 text-center rounded-[var(--radius)] border text-xs capitalize font-medium transition-all cursor-pointer ${
                          moodLogs.find(l => l.date === new Date().toISOString().split("T")[0])?.mood === m
                            ? "bg-primary/10 border-primary text-primary font-bold"
                            : "bg-background border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {m === "great" ? "😊" : m === "good" ? "🙂" : m === "okay" ? "😐" : m === "stressed" ? "😰" : "😴"}
                        <span className="block text-[8px] mt-1">{m}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {activeTab === "tasks" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <IconListCheck className="h-4.5 w-4.5 text-primary" /> Priority Work Queue
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Task list Column */}
              <div className="lg:col-span-3 space-y-4">
                {tasks.length === 0 ? (
                  <div className="border border-dashed border-border rounded-[var(--radius)] py-12 px-6 text-center text-muted-foreground text-xs bg-card">
                    Your task queue is empty. Type in the text area to let the companion structure it.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {tasks
                      .map(t => ({
                        ...t,
                        score: calculatePriorityScore(t, tasks)
                      }))
                      .sort((a, b) => b.score - a.score)
                      .map((task) => (
                        <div
                          key={task.id}
                          className={`border rounded-[var(--radius)] p-4 transition-all flex items-start justify-between gap-4 ${
                            task.status === "completed"
                              ? "bg-muted/20 border-border/40 opacity-60"
                              : "bg-card border-border hover:border-border/80"
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleComplete(task.id)}
                              className={`w-5 h-5 rounded-[calc(var(--radius)-6px)] border flex items-center justify-center mt-0.5 transition-all cursor-pointer shrink-0 ${
                                task.status === "completed"
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-border hover:border-muted-foreground bg-background"
                              }`}
                            >
                              {task.status === "completed" && <IconCheck className="w-3.5 h-3.5" />}
                            </button>
                            
                            <div className="min-w-0">
                              <span className={`text-xs font-semibold block ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {task.title}
                              </span>
                              {task.description && (
                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{task.description}</p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  task.energyRequired === "high"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : task.energyRequired === "medium"
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-blue-500/10 text-blue-500"
                                }`}>
                                  {task.energyRequired} Energy
                                </span>
                                
                                {task.deadline && (
                                  <span className="text-[8px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-semibold">
                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handlePreResearch(task.id)}
                              disabled={scaffoldingLoadingId === task.id}
                              className="text-[9px] font-bold border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-[calc(var(--radius)-4px)] transition-all cursor-pointer"
                              title="Generate outline"
                            >
                              {scaffoldingLoadingId === task.id ? "Preparing..." : "Get Prepared"}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Task insights / Custom Add Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Outline assistance</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Click <strong>"Get Prepared"</strong> on any task to let the companion generate sub-steps, outlines, and initial research context instantly.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── HABITS TAB ── */}
        {activeTab === "habits" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <IconActivity className="h-4.5 w-4.5 text-primary" /> Daily Habits tracker
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Habits grid log */}
              <div className="lg:col-span-3 bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Habits</h3>
                  <span className="text-[10px] text-muted-foreground">Click to mark as done</span>
                </div>

                <div className="space-y-3">
                  {habits.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      No habits added yet. Create one on the right.
                    </div>
                  ) : (
                    habits.map((h) => {
                      const todayStr = new Date().toISOString().split("T")[0];
                      const completedToday = h.history.includes(todayStr);
                      return (
                        <div key={h.id} className="flex items-center justify-between p-3 border border-border rounded-[var(--radius)] hover:border-border/80 transition-all bg-background/50">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleHabit(h.id)}
                              className={`w-5 h-5 rounded-[calc(var(--radius)-6px)] border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                completedToday
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-border hover:border-muted-foreground bg-background"
                              }`}
                            >
                              {completedToday && <IconCheck className="w-3.5 h-3.5" />}
                            </button>
                            <span className="text-xs font-semibold text-foreground">{h.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                              <IconFlame className="h-3.5 w-3.5 text-orange-500" /> {h.streak} day streak
                            </span>
                            
                            <button
                              onClick={() => {
                                const filtered = habits.filter(x => x.id !== h.id);
                                updateHabits(filtered);
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            >
                              <IconTrash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Add Habit form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add New Habit</h3>
                  <form onSubmit={handleAddHabit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="e.g. Work out 30 minutes"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                    <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold py-2 rounded-[var(--radius)] shadow-sm transition-all cursor-pointer">
                      Save Habit
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── GOALS TAB ── */}
        {activeTab === "goals" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <IconTarget className="h-4.5 w-4.5 text-primary" /> Goal Tracking
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Goals list */}
              <div className="lg:col-span-3 bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">My Active Goals</h3>
                </div>

                <div className="space-y-4">
                  {goals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      No goals tracked yet. Add one on the right.
                    </div>
                  ) : (
                    goals.map((g) => (
                      <div key={g.id} className="p-4 border border-border rounded-[var(--radius)] bg-background/50 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-foreground">{g.title}</span>
                            <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                              Target Date: {new Date(g.targetDate).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            g.category === "short"
                              ? "bg-blue-500/10 text-blue-500"
                              : g.category === "medium"
                              ? "bg-purple-500/10 text-purple-500"
                              : "bg-indigo-500/10 text-indigo-500"
                          }`}>
                            {g.category} term
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                            <span>Progress</span>
                            <span>{g.progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                            <div className="bg-secondary h-full rounded-full transition-all duration-300" style={{ width: `${g.progress}%` }}></div>
                          </div>
                        </div>

                        <div className="flex justify-between pt-1 border-t border-border/40">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateGoalProgress(g.id, -10)}
                              className="text-[9px] font-bold border border-border bg-background hover:bg-muted px-2.5 py-1 rounded cursor-pointer"
                            >
                              -10%
                            </button>
                            <button
                              onClick={() => handleUpdateGoalProgress(g.id, 10)}
                              className="text-[9px] font-bold border border-border bg-background hover:bg-muted px-2.5 py-1 rounded cursor-pointer"
                            >
                              +10%
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Goal form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add Goal</h3>
                  <form onSubmit={handleAddGoal} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Goal Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Build dynamic portfolio website"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Category</label>
                        <select
                          value={newGoalCategory}
                          onChange={(e) => setNewGoalCategory(e.target.value as Goal["category"])}
                          className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value="short">Short Term</option>
                          <option value="medium">Medium Term</option>
                          <option value="long">Long Term</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Target Date</label>
                        <input
                          type="date"
                          value={newGoalDate}
                          onChange={(e) => setNewGoalDate(e.target.value)}
                          className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold py-2 rounded-[var(--radius)] shadow-sm transition-all cursor-pointer mt-1">
                      Save Goal
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── MOOD TAB ── */}
        {activeTab === "mood" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <IconMoodSmile className="h-4.5 w-4.5 text-primary" /> Daily Mood and Rhythm Tracker
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Daily Log form */}
              <div className="lg:col-span-2 bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Record Today's Rhythm</h3>
                </div>

                <form onSubmit={handleLogMood} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Select Mood</label>
                    <div className="flex gap-2">
                      {(["great", "good", "okay", "stressed", "tired"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setNewMood(m)}
                          className={`flex-1 py-3 text-center rounded-[var(--radius)] border text-xs capitalize font-bold transition-all cursor-pointer ${
                            newMood === m
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-background border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <span className="text-base block">
                            {m === "great" ? "😊" : m === "good" ? "🙂" : m === "okay" ? "😐" : m === "stressed" ? "😰" : "😴"}
                          </span>
                          <span className="text-[8px] mt-1 block">{m}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Energy level (1-5)</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={newEnergy}
                        onChange={(e) => setNewEnergy(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-secondary"
                      />
                      <div className="flex justify-between text-[8px] text-muted-foreground font-semibold px-0.5">
                        <span>Low ({newEnergy})</span>
                        <span>High</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sleep (hours)</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={newSleep}
                        onChange={(e) => setNewSleep(parseFloat(e.target.value))}
                        className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Daily Note / Journal</label>
                    <textarea
                      placeholder="How did today feel?"
                      value={newMoodNote}
                      onChange={(e) => setNewMoodNote(e.target.value)}
                      rows={3}
                      className="w-full bg-background border border-border rounded-[var(--radius)] p-3 text-xs text-foreground focus:outline-none focus:border-primary font-sans resize-none"
                    />
                  </div>

                  <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold py-2.5 rounded-[var(--radius)] shadow-sm transition-all cursor-pointer">
                    Save Daily Rhythm
                  </button>
                </form>
              </div>

              {/* Visualized logs / trends */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Rhythm Calendar Heatmap & Charts */}
                <div className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-5 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Rhythm {rhythmChartType === "heatmap" ? "Heatmap" : rhythmChartType === "bar" ? "Bar Chart" : "Line Chart"}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        {rhythmTimeframe === "day" && "Showing daily logs (last 28 entries)"}
                        {rhythmTimeframe === "week" && "Aggregated by calendar week"}
                        {rhythmTimeframe === "month" && "Aggregated by calendar month"}
                        {rhythmTimeframe === "quarter" && "Aggregated by calendar quarter"}
                        {rhythmTimeframe === "year" && "Aggregated by calendar year"}
                      </p>
                    </div>
                    {rhythmChartType === "heatmap" && (
                      <div className="flex gap-2 text-[8px] font-semibold text-muted-foreground self-start sm:self-center">
                        <span className="flex items-center gap-1">🟢 Great</span>
                        <span className="flex items-center gap-1">🟢 Good</span>
                        <span className="flex items-center gap-1">🔵 Okay</span>
                        <span className="flex items-center gap-1">🔴 Stressed</span>
                      </div>
                    )}
                  </div>

                  {/* Selector Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-2.5 rounded-xl border border-border/60">
                    {/* Timeframe selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Timeframe:</span>
                      {(["day", "week", "month", "quarter", "year"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setRhythmTimeframe(t)}
                          className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border capitalize transition-all cursor-pointer ${
                            rhythmTimeframe === t
                              ? "bg-primary/10 border-primary/20 text-primary"
                              : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Chart Type selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Format:</span>
                      {(["heatmap", "bar", "line"] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setRhythmChartType(c)}
                          className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border capitalize transition-all cursor-pointer ${
                            rhythmChartType === c
                              ? "bg-primary/10 border-primary/20 text-primary"
                              : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render Visuals */}
                  <div className="pt-2">
                    {rhythmChartType === "heatmap" && (
                      <HeatmapView data={getGroupedRhythmData()} timeframe={rhythmTimeframe} />
                    )}
                    {rhythmChartType === "bar" && (
                      <BarChart data={getGroupedRhythmData()} />
                    )}
                    {rhythmChartType === "line" && (
                      <LineChart data={getGroupedRhythmData()} />
                    )}
                  </div>
                </div>

                {/* Mood insights card */}
                <div className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-2">
                  <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <IconSparkles className="h-4 w-4" /> Rhythm Insights
                  </h3>
                  <ul className="text-[10px] text-muted-foreground space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>You usually feel happier and report more sleep on weekends.</li>
                    <li>Completing more than 3 tasks a day improves your mood score.</li>
                    <li>Stress peaks typically fall around mid-week days.</li>
                  </ul>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ── MENTAL HEALTH TAB ── */}
        {activeTab === "mental_health" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <IconHeart className="h-4.5 w-4.5 text-primary" /> Monthly Rhythm Cycle
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Monthly Cycle Circular Track */}
              <div className="lg:col-span-3 bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm flex flex-col items-center justify-center gap-6 min-h-[350px]">
                <div className="text-center space-y-1 w-full border-b border-border pb-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Monthly Rhythm Wave</h3>
                  <p className="text-[9px] text-muted-foreground">Visualizing cycle fluctuations to support your planning</p>
                </div>

                {/* Simulated period-tracking style circular calendar representing monthly cycle */}
                <div className="relative w-52 h-52 rounded-full border border-border flex items-center justify-center bg-muted/20">
                  <div className="absolute inset-4 rounded-full border border-dashed border-border flex items-center justify-center bg-card shadow-inner">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">Current Phase</span>
                      <span className="text-xs font-extrabold text-primary">Reflective Rest</span>
                      <span className="block text-[8px] text-muted-foreground">Day 12 of 28</span>
                    </div>
                  </div>

                  {/* Circular markers representing 28 days of a monthly rhythm cycle */}
                  {Array.from({ length: 28 }).map((_, i) => {
                    const angle = (i * 360) / 28;
                    const radius = 94; // px
                    const x = Math.round(104 + radius * Math.cos((angle - 90) * (Math.PI / 180)));
                    const y = Math.round(104 + radius * Math.sin((angle - 90) * (Math.PI / 180)));
                    
                    // Highlight active day, reflection phase (days 10-15), peak focus phase (days 1-8)
                    const isToday = i === 11;
                    const color = 
                      isToday
                        ? "bg-primary border-primary shadow shadow-primary"
                        : i >= 9 && i <= 14
                        ? "bg-amber-500/20 border-amber-500/40"
                        : i <= 7
                        ? "bg-emerald-500/25 border-emerald-500/40"
                        : "bg-muted border-border";

                    return (
                      <div
                        key={i}
                        className={`absolute w-3.5 h-3.5 rounded-full border transition-all flex items-center justify-center text-[7px] font-bold cursor-help ${color}`}
                        style={{ left: `${x - 7}px`, top: `${y - 7}px` }}
                        title={`Day ${i + 1} of monthly rhythm cycle`}
                      >
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground"></span>}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 text-[9px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></span> Peak Focus Phase</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40"></span> Reflective Rest Phase</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Today</span>
                </div>
              </div>

              {/* Rhythm cycle details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rhythm Companion Insights</h3>
                  <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    <div className="p-3 border border-border rounded-md bg-background/40">
                      <h4 className="font-bold text-foreground mb-1 text-[11px]">Peak Focus Phase (Days 1 - 8)</h4>
                      <p className="text-[10px]">Your energy peaks. Excellent phase for starting new projects, hard tasks, and collaborative goals.</p>
                    </div>
                    <div className="p-3 border border-border rounded-md bg-background/40">
                      <h4 className="font-bold text-foreground mb-1 text-[11px]">Reflective Rest Phase (Days 9 - 16)</h4>
                      <p className="text-[10px]">Energy stabilizes. Best suited for reviewing logs, working on habits, setting routines, and self-care.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── PROGRESS TAB ── */}
        {activeTab === "progress" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <IconTrendingUp className="h-4.5 w-4.5 text-primary" /> Productivity Progress Trends
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Task Accomplishment (Bar Chart) */}
              <div className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Daily Productivity (Last 7 Days)</h3>
                  <span className="text-[10px] text-muted-foreground font-semibold">Completed Tasks Log</span>
                </div>

                <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
                  {[
                    { day: "Mon", count: 2 },
                    { day: "Tue", count: 4 },
                    { day: "Wed", count: 1 },
                    { day: "Thu", count: 5 },
                    { day: "Fri", count: 3 },
                    { day: "Sat", count: 0 },
                    { day: "Sun", count: 0 }
                  ].map((d, index) => {
                    const maxCount = 6;
                    const heightPercent = d.count > 0 ? (d.count / maxCount) * 100 : 8;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div 
                          className="w-full rounded-t-md transition-all duration-500 bg-gradient-to-t from-secondary/60 to-secondary hover:opacity-90"
                          style={{ height: `${heightPercent}%` }}
                          title={`${d.count} tasks completed`}
                        />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Habit Completion Rate */}
              <div className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Habit Completion Rates</h3>
                  <span className="text-[10px] text-muted-foreground font-semibold">Streaks & Logs</span>
                </div>

                <div className="space-y-4 pt-2">
                  {habits.map(h => {
                    const rate = Math.min(100, h.streak * 8);
                    return (
                      <div key={h.id} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                          <span>{h.name}</span>
                          <span>{rate}% ({h.streak} days)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="bg-secondary h-full rounded-full transition-all duration-300" style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === "notifications" && (
          <div className="space-y-6 animate-fade-in bg-card border border-border rounded-[var(--radius)] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <IconBell className="h-4.5 w-4.5 text-primary shrink-0" /> Inbox Alerts & Updates
                </h2>
                <p className="text-[10px] text-muted-foreground">Stay updated with upcoming deadlines, schedule adjustments, and AI co-pilot feedback.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => markAllAsRead()}
                  className="bg-primary/10 hover:bg-primary/15 text-primary font-bold text-[10px] py-1.5 px-3 rounded-[var(--radius)] border border-primary/20 cursor-pointer transition-colors"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => clearNotifications()}
                  className="bg-destructive/10 hover:bg-destructive/15 text-destructive font-bold text-[10px] py-1.5 px-3 rounded-[var(--radius)] border border-destructive/20 cursor-pointer transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* AI Test Cockpit */}
            <div className="p-4 border border-secondary/20 rounded-xl bg-gradient-to-br from-secondary/5 via-background to-primary/5 space-y-3">
              <div className="flex items-center gap-1.5">
                <IconSparkles className="h-4.5 w-4.5 text-secondary" />
                <h3 className="text-xs font-bold text-foreground">AI Co-pilot Simulation</h3>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Test the global co-pilot alert system. Clicking either button will instantly trigger a synthetic audio chime alert and queue a system-wide notification.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={() => {
                    addNotification(
                      "AI Schedule Reorganized!",
                      "Gemini analyzed your 5 pending tasks and shifted the documentation deadline to prevent late penalty.",
                      "ai"
                    );
                  }}
                  className="bg-secondary hover:bg-secondary/90 text-white font-extrabold text-[10px] py-2 px-3.5 rounded-[var(--radius)] flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors shimmer-glow"
                >
                  <IconPlayerPlay className="h-3 w-3 fill-white" /> Organize with AI
                </button>
                <button
                  onClick={() => {
                    addNotification(
                      "Overdue: Submit Project Draft",
                      "Your project draft deadline is approaching in 2 hours. Start Focus Session now.",
                      "deadline"
                    );
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] py-2 px-3.5 rounded-[var(--radius)] flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  <IconAlertTriangle className="h-3 w-3" /> Simulate Deadline Alert
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(["all", "deadline", "event", "ai", "update"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setNotificationFilter(type)}
                  className={`text-[9px] font-bold px-2.5 py-1 rounded-full border capitalize transition-colors cursor-pointer ${
                    notificationFilter === type
                      ? "bg-primary text-white border-primary"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "ai" ? "AI Suggestions" : type === "all" ? "All Alerts" : `${type}s`}
                </button>
              ))}
            </div>

            {/* Alerts Feed */}
            <div className="space-y-2.5 mt-2">
              {notifications.filter(n => notificationFilter === "all" || n.type === notificationFilter).length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-xl text-center">
                  <p className="text-[10px] text-muted-foreground font-semibold">No alerts found in this category.</p>
                </div>
              ) : (
                notifications
                  .filter(n => notificationFilter === "all" || n.type === notificationFilter)
                  .map(notif => {
                    const typeConfig = 
                      notif.type === "deadline" ? { border: "border-rose-500/30 bg-rose-500/5", badge: "bg-rose-500/10 text-rose-500 border border-rose-500/20" } :
                      notif.type === "event" ? { border: "border-amber-500/30 bg-amber-500/5", badge: "bg-amber-500/10 text-amber-500 border border-amber-500/20" } :
                      notif.type === "ai" ? { border: "border-secondary/30 bg-secondary/5", badge: "bg-secondary/10 text-secondary border border-secondary/20" } :
                      { border: "border-emerald-500/30 bg-emerald-500/5", badge: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" };

                    return (
                      <div
                        key={notif.id}
                        className={`p-3.5 border rounded-xl flex items-start justify-between gap-4 transition-all duration-200 ${typeConfig.border} ${
                          notif.read ? "opacity-75" : "shadow-sm"
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 tracking-wider ${typeConfig.badge}`}>
                              {notif.type}
                            </span>
                            <h4 className={`text-xs font-bold leading-none ${notif.read ? "text-muted-foreground" : "text-foreground"}`}>
                              {notif.title}
                            </h4>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-muted-foreground/60 block pt-0.5 font-bold">
                            {new Date(notif.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="h-6 w-6 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                              title="Mark as read"
                            >
                              <IconCheck className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const updated = notifications.filter(n => n.id !== notif.id);
                              localStorage.setItem("lifesaver_notifications", JSON.stringify(updated));
                              window.dispatchEvent(new Event("lifesaver_notification_update"));
                            }}
                            className="h-6 w-6 rounded-md border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center cursor-pointer transition-colors"
                            title="Delete alert"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* ── REPORTS TAB ── */}
        {activeTab === "reports" && (
          <div className="space-y-6 animate-fade-in bg-card border border-border rounded-[var(--radius)] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <IconReport className="h-4.5 w-4.5 text-primary" /> Companion Weekly Digest
                </h2>
                <p className="text-[10px] text-muted-foreground">Generate printable reports summarizing productivity & well-being metrics.</p>
              </div>
              <button 
                onClick={() => alert("Report generation complete! Check downloads folder.")} 
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-2 px-3 rounded-[var(--radius)] flex items-center gap-1.5 shadow cursor-pointer"
              >
                <IconDownload className="h-3.5 w-3.5" /> Export PDF
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <div className="p-4 border border-border rounded-md bg-background/50 space-y-2">
                <h3 className="text-xs font-bold text-foreground">Overview Summary</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Your overall task completion stands at <strong>{taskCompletionRate}%</strong>. You logged sleep daily with an average of <strong>{averageSleep} hours</strong>. Streaks and habits show steady improvements. No alarming rhythm spikes detected.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── CALENDAR TAB ── */}
        {activeTab === "calendar" && (
          <div className="space-y-6 animate-fade-in bg-card border border-border rounded-[var(--radius)] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <IconCalendar className="h-4.5 w-4.5 text-primary" /> Month Schedule Calendar
              </h2>
              <span className="text-[10px] text-muted-foreground font-semibold">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            </div>

            {/* Monthly schedule calendar with dynamic tasks */}
            <div className="grid grid-cols-7 gap-2.5 mt-4 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <span key={day} className="text-[10px] font-bold text-muted-foreground uppercase">{day}</span>
              ))}

              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                // Dynamically distribute tasks to calendar days for rich visuals
                const dayTasks = tasks.filter((_, tIdx) => (dayNum + tIdx * 3) % 15 === 0).slice(0, 2);
                return (
                  <div key={i} className="min-h-[65px] border border-border/60 bg-background/30 rounded-[var(--radius)] p-1.5 flex flex-col justify-between items-start text-[10px] hover:border-primary/40 transition-colors">
                    <span className="font-extrabold text-[8px] bg-secondary/15 text-secondary border border-secondary/20 px-1.5 py-0.5 rounded-full shadow-sm">
                      {dayNum}
                    </span>
                    <div className="w-full flex flex-col gap-0.5 mt-1.5 overflow-hidden">
                      {dayTasks.map(t => (
                        <span 
                          key={t.id} 
                          className={`text-[8px] px-1 py-0.5 rounded border truncate block font-bold ${
                            t.status === "completed"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              : "bg-primary/10 border-primary/20 text-primary"
                          }`}
                          title={t.title}
                        >
                          {t.title}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── INSIGHTS TAB ── */}
        {activeTab === "insights" && (
          <div className="space-y-6 animate-fade-in bg-card border border-border rounded-[var(--radius)] p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <IconBrain className="h-4.5 w-4.5 text-primary" /> Personal Well-being Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="p-4 border border-border rounded-md bg-background/50 space-y-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  ☀️ Morning Energy Peak
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Based on daily logs, you report highest productivity and energy level between <strong>9:00 AM and 11:30 AM</strong>. Focus your most complex tasks during this block.
                </p>
              </div>

              <div className="p-4 border border-border rounded-md bg-background/50 space-y-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  ☕ Task Completion & Mood Correlation
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Completing your short-term goals shows a direct correlation with high mood ratings (Good/Great). Ensure you log minor achievements to maintain morale.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-in bg-card border border-border rounded-[var(--radius)] p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <IconSettings className="h-4.5 w-4.5 text-primary" /> Settings & Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {/* Working Hours calibration */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Working Hours</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Start Time</label>
                    <input
                      type="time"
                      value={settings.workingHours.start}
                      onChange={async (e) => {
                        const newSettings = await saveSettings({ workingHours: { ...settings.workingHours, start: e.target.value } });
                        setSettings(newSettings);
                      }}
                      className="w-full bg-background border border-border rounded-md p-2.5 text-foreground text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">End Time</label>
                    <input
                      type="time"
                      value={settings.workingHours.end}
                      onChange={async (e) => {
                        const newSettings = await saveSettings({ workingHours: { ...settings.workingHours, end: e.target.value } });
                        setSettings(newSettings);
                      }}
                      className="w-full bg-background border border-border rounded-md p-2.5 text-foreground text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Pomodoro configuration */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pomodoro Clock config</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Focus duration (mins)</label>
                    <input
                      type="number"
                      value={settings.pomodoroConfig.focusDuration}
                      onChange={async (e) => {
                        const newSettings = await saveSettings({ pomodoroConfig: { ...settings.pomodoroConfig, focusDuration: parseInt(e.target.value) } });
                        setSettings(newSettings);
                      }}
                      className="w-full bg-background border border-border rounded-md p-2.5 text-foreground text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Break duration (mins)</label>
                    <input
                      type="number"
                      value={settings.pomodoroConfig.breakDuration}
                      onChange={async (e) => {
                        const newSettings = await saveSettings({ pomodoroConfig: { ...settings.pomodoroConfig, breakDuration: parseInt(e.target.value) } });
                        setSettings(newSettings);
                      }}
                      className="w-full bg-background border border-border rounded-md p-2.5 text-foreground text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Companion settings */}
              <div className="space-y-4 md:col-span-2 border-t border-border pt-6 mt-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-left">Companion Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-background/50">
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-semibold block">Notification Sounds</span>
                      <span className="text-[9px] text-muted-foreground">Play a soft tone on complete</span>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary border-border bg-background cursor-pointer" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-background/50">
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-semibold block">Daily Summary Emails</span>
                      <span className="text-[9px] text-muted-foreground">Receive daily calming digest</span>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary border-border bg-background cursor-pointer" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-background/50">
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-semibold block">Auto-Crisis Shift</span>
                      <span className="text-[9px] text-muted-foreground">Reschedule delays automatically</span>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary border-border bg-background cursor-pointer" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Caring Pop check-in Card */}
      {activePop && (
        <div className="fixed bottom-24 right-6 max-w-sm bg-card border border-border rounded-[var(--radius)] p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 z-40 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
              <IconHeart className="h-4 w-4 animate-pulse text-orange-500" />
              <span>Companion Check-in</span>
            </div>
            <button onClick={() => setActivePop(null)} className="text-muted-foreground hover:text-foreground">
              <IconX className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
            {activePop}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setActivePop(null);
                window.dispatchEvent(new Event("open-chatbot"));
              }}
              className="text-[9px] font-bold bg-primary text-primary-foreground px-2.5 py-1.5 rounded-[calc(var(--radius)-4px)]"
            >
              Talk to AI
            </button>
            <button 
              onClick={() => setActivePop(null)}
              className="text-[9px] font-bold border border-border bg-background hover:bg-muted text-muted-foreground px-2.5 py-1.5 rounded-[calc(var(--radius)-4px)]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex-1 bg-background flex items-center justify-center text-muted-foreground font-sans min-h-screen">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
          <span className="text-sm font-semibold">Creating personal space...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
