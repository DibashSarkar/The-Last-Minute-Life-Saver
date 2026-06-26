import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc
} from "firebase/firestore";

// Task Interface
export interface Task {
  id: string;
  title: string;
  description: string;
  importance: boolean; // Eisenhower Quadrant: Important
  urgency: boolean;    // Eisenhower Quadrant: Urgent
  priorityScore: number;
  status: "pending" | "in_progress" | "completed";
  estimatedDuration: number; // in minutes
  actualDuration: number;    // in minutes
  deadline: string;          // ISO String
  energyRequired: "high" | "medium" | "low";
  dependencies: string[];    // Array of Task IDs
  scaffolding?: {
    targetAudiences: string[];
    headlineAngles: string[];
    structuralTemplates: string[];
    status: "pending" | "generating" | "completed" | "failed";
    modelUsed?: string;
  };
  recalibrated?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Calendar Time Block Interface
export interface TimeBlock {
  id: string;
  taskId: string | null;
  title: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  isCompleted: boolean;
  modelUsed?: string; // Flash / Pro badge tracking
}

// User Settings Interface
export interface UserSettings {
  workingHours: {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "17:00"
  };
  currentEnergyState: "high" | "medium" | "low" | "overwhelmed";
  pomodoroConfig: {
    focusDuration: number; // in minutes
    breakDuration: number; // in minutes
  };
}

// Communication Log Interface
export interface CommunicationLog {
  id: string;
  taskId: string;
  taskTitle: string;
  stakeholder: string;
  draft: string;
  timestamp: string;
}

// User Profile Interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
  onboarded: boolean;
}

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase config is fully set up
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.projectId;

let app;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (error) {
    console.warn("Failed to initialize Firebase, falling back to Local Sandbox:", error);
  }
}

// Local Storage Sandbox / In-Memory Mock database fallback
const IS_SERVER = typeof window === "undefined";

// Global in-memory cache to sync server routes and client if running locally without Firebase
const getGlobalCache = () => {
  if (IS_SERVER) {
    const globalRef = global as any;
    if (!globalRef.__mockDb) {
      globalRef.__mockDb = {
        tasks: {},
        timeBlocks: {},
        settings: {
          workingHours: { start: "09:00", end: "17:00" },
          currentEnergyState: "high",
          pomodoroConfig: { focusDuration: 25, breakDuration: 5 }
        },
        users: {
          "user_guest": { uid: "user_guest", email: "guest@lifesaver.ai", displayName: "Demo User", createdAt: new Date().toISOString(), onboarded: true },
          "user_alice": { uid: "user_alice", email: "alice.doe@startup.com", displayName: "Alice Doe", createdAt: new Date().toISOString(), onboarded: true }
        },
        currentUser: null,
        tokenStats: { flashCount: 42, proCount: 18 },
        systemLogs: [
          { timestamp: new Date().toISOString(), message: "System initialized successfully." },
          { timestamp: new Date().toISOString(), message: "Mock databases linked to runtime thread." }
        ],
        communicationLogs: {}
      };
    }
    return globalRef.__mockDb;
  }
  return null;
};

// Local storage helpers
const loadLocalData = (key: string, defaultValue: any) => {
  if (IS_SERVER) {
    const cache = getGlobalCache();
    return cache ? cache[key] : defaultValue;
  }
  try {
    const item = localStorage.getItem(`life_saver_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const _saveLocalData = (key: string, data: any) => {
  if (IS_SERVER) {
    const cache = getGlobalCache();
    if (cache) {
      cache[key] = data;
    }
    return;
  }
  try {
    localStorage.setItem(`life_saver_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage write failed:", e);
  }
};

// Check if we are running in Firebase Mode or Sandbox Mode
export const isSandboxMode = () => !db;

// DATABASE FUNCTIONS
// 1. User Settings
export async function getSettings(): Promise<UserSettings> {
  const defaultSettings: UserSettings = {
    workingHours: { start: "09:00", end: "17:00" },
    currentEnergyState: "high",
    pomodoroConfig: { focusDuration: 25, breakDuration: 5 }
  };

  if (!db) {
    return loadLocalData("settings", defaultSettings);
  }

  try {
    const docRef = doc(db, "settings", "user_profile");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserSettings;
    }
    await setDoc(docRef, defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error("Error reading settings, using fallback:", error);
    return defaultSettings;
  }
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };

  if (!db) {
    _saveLocalData("settings", updated);
    return updated;
  }

  try {
    const docRef = doc(db, "settings", "user_profile");
    await setDoc(docRef, updated, { merge: true });
    return updated;
  } catch (error) {
    console.error("Error saving settings, saving locally:", error);
    _saveLocalData("settings", updated);
    return updated;
  }
}

// 2. Tasks
export async function getTasks(): Promise<Task[]> {
  if (!db) {
    const tasksObj = loadLocalData("tasks", {});
    return Object.values(tasksObj);
  }

  try {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasks: Task[] = [];
    querySnapshot.forEach((docSnap) => {
      tasks.push(docSnap.data() as Task);
    });
    return tasks;
  } catch (error) {
    console.error("Error loading tasks, loading locally:", error);
    const tasksObj = loadLocalData("tasks", {});
    return Object.values(tasksObj);
  }
}

export async function getTask(id: string): Promise<Task | null> {
  if (!db) {
    const tasksObj = loadLocalData("tasks", {});
    return tasksObj[id] || null;
  }

  try {
    const docRef = doc(db, "tasks", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Task;
    }
    return null;
  } catch (error) {
    console.error(`Error loading task ${id}:`, error);
    const tasksObj = loadLocalData("tasks", {});
    return tasksObj[id] || null;
  }
}

export async function saveTask(task: Task): Promise<Task> {
  if (!db) {
    const tasksObj = loadLocalData("tasks", {});
    tasksObj[task.id] = task;
    _saveLocalData("tasks", tasksObj);
    return task;
  }

  try {
    const docRef = doc(db, "tasks", task.id);
    await setDoc(docRef, task, { merge: true });
    return task;
  } catch (error) {
    console.error(`Error saving task ${task.id}:`, error);
    const tasksObj = loadLocalData("tasks", {});
    tasksObj[task.id] = task;
    _saveLocalData("tasks", tasksObj);
    return task;
  }
}

export async function updateTaskFields(id: string, fields: Partial<Task>): Promise<Task | null> {
  const task = await getTask(id);
  if (!task) return null;
  
  const updatedTask = { ...task, ...fields, updatedAt: new Date().toISOString() };
  return saveTask(updatedTask);
}

export async function deleteTask(id: string): Promise<boolean> {
  if (!db) {
    const tasksObj = loadLocalData("tasks", {});
    if (tasksObj[id]) {
      delete tasksObj[id];
      _saveLocalData("tasks", tasksObj);
      return true;
    }
    return false;
  }

  try {
    await deleteDoc(doc(db, "tasks", id));
    return true;
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    const tasksObj = loadLocalData("tasks", {});
    if (tasksObj[id]) {
      delete tasksObj[id];
      _saveLocalData("tasks", tasksObj);
      return true;
    }
    return false;
  }
}

// 3. Calendar Time Blocks
export async function getTimeBlocks(): Promise<TimeBlock[]> {
  if (!db) {
    const blocksObj = loadLocalData("timeBlocks", {});
    return Object.values(blocksObj);
  }

  try {
    const querySnapshot = await getDocs(collection(db, "timeBlocks"));
    const blocks: TimeBlock[] = [];
    querySnapshot.forEach((docSnap) => {
      blocks.push(docSnap.data() as TimeBlock);
    });
    return blocks;
  } catch (error) {
    console.error("Error loading timeBlocks, loading locally:", error);
    const blocksObj = loadLocalData("timeBlocks", {});
    return Object.values(blocksObj);
  }
}

export async function saveTimeBlocks(blocks: TimeBlock[]): Promise<TimeBlock[]> {
  if (!db) {
    const blocksObj: Record<string, TimeBlock> = {};
    blocks.forEach(b => {
      blocksObj[b.id] = b;
    });
    _saveLocalData("timeBlocks", blocksObj);
    return blocks;
  }

  try {
    for (const b of blocks) {
      await setDoc(doc(db, "timeBlocks", b.id), b, { merge: true });
    }
    return blocks;
  } catch (error) {
    console.error("Error saving time blocks, saving locally:", error);
    const blocksObj = loadLocalData("timeBlocks", {});
    blocks.forEach(b => {
      blocksObj[b.id] = b;
    });
    _saveLocalData("timeBlocks", blocksObj);
    return blocks;
  }
}

export async function clearAllTimeBlocks(): Promise<void> {
  if (!db) {
    _saveLocalData("timeBlocks", {});
    return;
  }

  try {
    const querySnapshot = await getDocs(collection(db, "timeBlocks"));
    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(doc(db, "timeBlocks", docSnap.id));
    }
  } catch (error) {
    console.error("Error clearing time blocks, clearing locally:", error);
    _saveLocalData("timeBlocks", {});
  }
}

// 4. Communication Log History
export async function getCommunicationHistory(): Promise<CommunicationLog[]> {
  const defaultLogs = {};
  const logsObj = loadLocalData("communicationLogs", defaultLogs);
  return Object.values(logsObj);
}

export async function saveCommunicationLog(
  taskId: string, 
  taskTitle: string, 
  stakeholder: string, 
  draft: string
): Promise<CommunicationLog> {
  const logsObj = loadLocalData("communicationLogs", {});
  const newLog: CommunicationLog = {
    id: `comm_${Math.random().toString(36).substr(2, 9)}`,
    taskId,
    taskTitle,
    stakeholder,
    draft,
    timestamp: new Date().toISOString()
  };
  logsObj[newLog.id] = newLog;
  _saveLocalData("communicationLogs", logsObj);
  
  // Also add to system logs
  addSystemLog(`Created Stakeholder Shield extension request for "${taskTitle}" to ${stakeholder}.`);
  return newLog;
}

// 5. System Logs console queue
export function getSystemLogs(): Array<{ timestamp: string; message: string }> {
  const defaultLogs = [
    { timestamp: new Date().toISOString(), message: "System initialized successfully." },
    { timestamp: new Date().toISOString(), message: "Mock databases linked to local Sandbox environment." }
  ];
  return loadLocalData("systemLogs", defaultLogs);
}

export function addSystemLog(message: string): void {
  const currentLogs = getSystemLogs();
  const updated = [{ timestamp: new Date().toISOString(), message }, ...currentLogs].slice(0, 100);
  _saveLocalData("systemLogs", updated);
}

// 6. Token Expenditures Monitoring
export function getTokenConsumption(): { flashCount: number; proCount: number } {
  return loadLocalData("tokenStats", { flashCount: 142, proCount: 48 });
}

export function incrementTokenConsumption(model: "flash" | "pro", count: number): void {
  const stats = getTokenConsumption();
  if (model === "flash") {
    stats.flashCount += count;
  } else {
    stats.proCount += count;
  }
  _saveLocalData("tokenStats", stats);
}

// 7. Simulated Authentication API Layer
export async function getCurrentUser(): Promise<UserProfile | null> {
  // If sandbox, use local session storage
  const activeUser = loadLocalData("currentUser", null);
  return activeUser;
}

export async function authLogin(email: string): Promise<UserProfile> {
  // Simple sandbox login
  const users = loadLocalData("users", {
    "user_guest": { uid: "user_guest", email: "guest@lifesaver.ai", displayName: "Demo User", createdAt: new Date().toISOString(), onboarded: true }
  });
  
  // Find or create profile
  let found = Object.values(users).find((u: any) => u.email === email) as UserProfile;
  if (!found) {
    found = {
      uid: `user_${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName: email.split("@")[0],
      createdAt: new Date().toISOString(),
      onboarded: false
    };
    users[found.uid] = found;
    _saveLocalData("users", users);
  }
  
  _saveLocalData("currentUser", found);
  addSystemLog(`User ${email} signed in successfully.`);
  return found;
}

export async function authRegister(email: string, displayName?: string): Promise<UserProfile> {
  const users = loadLocalData("users", {});
  const newUser: UserProfile = {
    uid: `user_${Math.random().toString(36).substr(2, 9)}`,
    email,
    displayName: displayName || email.split("@")[0],
    createdAt: new Date().toISOString(),
    onboarded: false
  };
  
  users[newUser.uid] = newUser;
  _saveLocalData("users", users);
  _saveLocalData("currentUser", newUser);
  
  addSystemLog(`Registered new user cohort ${email}.`);
  return newUser;
}

export async function authLogout(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    addSystemLog(`User ${user.email} logged out.`);
  }
  _saveLocalData("currentUser", null);
}

export async function getMockUsersList(): Promise<UserProfile[]> {
  const users = loadLocalData("users", {
    "user_guest": { uid: "user_guest", email: "guest@lifesaver.ai", displayName: "Demo User", createdAt: new Date().toISOString(), onboarded: true },
    "user_alice": { uid: "user_alice", email: "alice.doe@startup.com", displayName: "Alice Doe", createdAt: new Date().toISOString(), onboarded: true }
  });
  return Object.values(users);
}

export async function setOnboardingCompleted(uid: string): Promise<void> {
  const users = loadLocalData("users", {});
  if (users[uid]) {
    users[uid].onboarded = true;
    _saveLocalData("users", users);
    
    const active = loadLocalData("currentUser", null);
    if (active && active.uid === uid) {
      active.onboarded = true;
      _saveLocalData("currentUser", active);
    }
    
    addSystemLog(`User ${users[uid].email} completed initial configuration wizard.`);
  }
}
