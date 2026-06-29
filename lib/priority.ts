import { Task, TimeBlock, UserSettings } from "./firebase";

// 1. Priority Scoring Engine
export function calculatePriorityScore(task: Task, allTasks: Task[]): number {
  if (task.status === "completed") return 0;

  // Base score from Eisenhower Quadrant
  let baseScore = 10; // Q4: Not Important, Not Urgent
  if (task.importance && task.urgency) {
    baseScore = 100; // Q1: Important & Urgent
  } else if (task.importance && !task.urgency) {
    baseScore = 70;  // Q2: Important & Not Urgent
  } else if (!task.importance && task.urgency) {
    baseScore = 40;  // Q3: Not Important & Urgent
  }

  // Deadline Proximity Score
  let deadlineBonus = 0;
  try {
    const deadlineTime = new Date(task.deadline).getTime();
    const nowTime = new Date().getTime();
    const diffHours = (deadlineTime - nowTime) / (1000 * 60 * 60);

    if (diffHours < 0) {
      // Overdue
      deadlineBonus = 60;
    } else if (diffHours <= 24) {
      // Very close: linear increase up to +45
      deadlineBonus = (24 - diffHours) * 1.875;
    } else if (diffHours <= 72) {
      // Within 3 days: linear increase up to +20
      deadlineBonus = (72 - diffHours) * 0.416;
    }
  } catch (e) {
    console.error("Error calculating deadline proximity:", e);
  }

  // Dependency Score (Downstream tasks blocked by this task)
  const downstreamCount = allTasks.filter(t => 
    t.status !== "completed" && t.dependencies.includes(task.id)
  ).length;
  const dependencyBonus = downstreamCount * 12;

  let score = baseScore + deadlineBonus + dependencyBonus;

  // Check if this task itself is blocked by unfinished dependencies
  const hasUnfinishedDependencies = task.dependencies.some(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask && depTask.status !== "completed";
  });

  if (hasUnfinishedDependencies) {
    // Penalty to ensure blocked tasks aren't placed at the very top of lists
    score *= 0.4;
  }

  return Math.round(score);
}

// Helper to convert time string (HH:MM) to minutes
function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper to format minutes as HH:MM
function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// 2. Calendar Timeline Allocation / Auto-Scheduling Engine
export function autoScheduleTasks(
  tasks: Task[],
  settings: UserSettings
): TimeBlock[] {
  // Filter out completed tasks
  const activeTasks = tasks.filter(t => t.status !== "completed");
  if (activeTasks.length === 0) return [];

  // Update priority scores dynamically
  const tasksWithScores = activeTasks.map(t => ({
    ...t,
    score: calculatePriorityScore(t, tasks)
  }));

  // Sort tasks using a dependency-resolving greedy algorithm
  const scheduledTasksList: Array<Task & { score: number }> = [];
  const unscheduledTasks = [...tasksWithScores];

  while (unscheduledTasks.length > 0) {
    // A task is "schedulable" if all its dependencies are either completed or already selected in scheduledTasksList
    const schedulable = unscheduledTasks.filter(t => {
      return t.dependencies.every(depId => {
        // Dependency is resolved if it's completed in the DB OR already scheduled in this run
        const isDepCompleted = tasks.find(pt => pt.id === depId)?.status === "completed";
        const isDepAlreadyScheduled = scheduledTasksList.some(st => st.id === depId);
        return isDepCompleted || isDepAlreadyScheduled;
      });
    });

    // If there is a dependency loop or lock, fallback to take any task
    const candidatePool = schedulable.length > 0 ? schedulable : unscheduledTasks;

    // Sort candidates by priority score descending
    candidatePool.sort((a, b) => b.score - a.score);

    // Take the best candidate
    const selected = candidatePool[0];
    scheduledTasksList.push(selected);

    // Remove from unscheduled
    const idx = unscheduledTasks.findIndex(t => t.id === selected.id);
    unscheduledTasks.splice(idx, 1);
  }

  // Determine energy constraints
  // If Overwhelmed, suppress high energy tasks (filter them out or push them down)
  let tasksToSchedule = [...scheduledTasksList];
  if (settings.currentEnergyState === "overwhelmed") {
    // Keep only low and medium energy tasks
    tasksToSchedule = scheduledTasksList.filter(t => t.energyRequired !== "high");
  }

  const timeBlocks: TimeBlock[] = [];
  const workingStartMin = timeStringToMinutes(settings.workingHours.start);
  const workingEndMin = timeStringToMinutes(settings.workingHours.end);
  const workingDuration = workingEndMin - workingStartMin;

  const now = new Date();
  const currentDay = new Date(now);
  
  // Set current scheduling pointer
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  let currentPointerMinutes = currentHour * 60 + currentMin;

  // Round up to next 15-minute slot
  currentPointerMinutes = Math.ceil(currentPointerMinutes / 15) * 15;

  // If current time is past working hours, start tomorrow
  if (currentPointerMinutes >= workingEndMin) {
    currentDay.setDate(currentDay.getDate() + 1);
    currentPointerMinutes = workingStartMin;
  } else if (currentPointerMinutes < workingStartMin) {
    currentPointerMinutes = workingStartMin;
  }

  // Schedule each task in sequence
  for (const task of tasksToSchedule) {
    const duration = task.estimatedDuration || 30; // default 30 mins
    
    // Check if task fits in current day's remaining working hours
    if (currentPointerMinutes + duration > workingEndMin) {
      // Move to tomorrow
      currentDay.setDate(currentDay.getDate() + 1);
      currentPointerMinutes = workingStartMin;
    }

    // Calculate dates
    const blockStart = new Date(currentDay);
    blockStart.setHours(Math.floor(currentPointerMinutes / 60));
    blockStart.setMinutes(currentPointerMinutes % 60);
    blockStart.setSeconds(0);
    blockStart.setMilliseconds(0);

    const blockEnd = new Date(blockStart);
    blockEnd.setMinutes(blockEnd.getMinutes() + duration);

    timeBlocks.push({
      id: `block_${task.id}_${blockStart.getTime()}`,
      taskId: task.id,
      title: task.title,
      startTime: blockStart.toISOString(),
      endTime: blockEnd.toISOString(),
      isCompleted: task.status === "completed"
    });

    // Advance pointer
    currentPointerMinutes += duration;
  }

  return timeBlocks;
}
