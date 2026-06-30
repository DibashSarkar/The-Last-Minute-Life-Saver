import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  Firestore,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  Auth,
} from "firebase/auth";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;
  importance: boolean;
  urgency: boolean;
  priorityScore: number;
  status: "pending" | "in_progress" | "completed";
  estimatedDuration: number;
  actualDuration: number;
  deadline: string;
  energyRequired: "high" | "medium" | "low";
  dependencies: string[];
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

export interface TimeBlock {
  id: string;
  taskId: string | null;
  title: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  modelUsed?: string;
}

export interface UserSettings {
  workingHours: {
    start: string;
    end: string;
  };
  currentEnergyState: "high" | "medium" | "low" | "overwhelmed";
  pomodoroConfig: {
    focusDuration: number;
    breakDuration: number;
  };
}

export interface CommunicationLog {
  id: string;
  taskId: string;
  taskTitle: string;
  stakeholder: string;
  draft: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
  onboarded: boolean;
  age?: number;
  gender?: string;
  role?: "user" | "admin";
}

// ─── Firebase Initialization ──────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let firebaseApp: FirebaseApp | null = null;
export let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured && typeof window !== "undefined") {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db   = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  } catch (err) {
    console.error("Firebase init failed:", err);
  }
}

export const isSandboxMode = () => !isFirebaseConfigured;

// ─── Sandbox (localStorage) fallback ─────────────────────────────────────────
// Used ONLY when Firebase env vars are not configured.

const LS_PREFIX = "lifesaver_sandbox_";

function lsGet<T>(key: string, def: T): T {
  if (typeof window === "undefined") return def;
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : def;
  } catch { return def; }
}

function lsSet(key: string, val: unknown): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch {}
}

// Derive sandbox user key
function sandboxUid(): string {
  const u = lsGet<UserProfile | null>("currentUser", null);
  return u?.uid ?? "sandbox_guest";
}

// ─── Helper: get current Firebase user UID (throws in sandbox if not logged in) ──

async function requireUid(): Promise<string> {
  if (!auth) {
    // Sandbox mode
    const u = lsGet<UserProfile | null>("currentUser", null);
    if (!u) throw new Error("Not authenticated");
    return u.uid;
  }
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth!, (user) => {
      unsub();
      if (user) resolve(user.uid);
      else reject(new Error("Not authenticated"));
    });
  });
}

// ─── AUTHENTICATION ───────────────────────────────────────────────────────────

/**
 * Sign in with email + password (real Firebase Auth).
 * Falls back to sandbox localStorage login when Firebase not configured.
 */
export async function authLogin(email: string, password?: string): Promise<UserProfile> {
  if (!auth) {
    // Sandbox fallback
    const users = lsGet<Record<string, UserProfile>>("users", {
      sandbox_guest: {
        uid: "sandbox_guest",
        email: "guest@lifesaver.ai",
        displayName: "Demo User",
        createdAt: new Date().toISOString(),
        onboarded: true,
      },
    });
    let found = Object.values(users).find((u) => u.email === email) ?? null;
    const isAdminEmail = email === "dibash6396@gmail.com" || email.endsWith("@lifesaver.ai");
    const defaultRole = isAdminEmail ? "admin" : "user";
    if (!found) {
      found = {
        uid: `user_${crypto.randomUUID().slice(0, 8)}`,
        email,
        displayName: email.split("@")[0],
        createdAt: new Date().toISOString(),
        onboarded: false,
        role: defaultRole,
      };
      users[found.uid] = found;
      lsSet("users", users);
    } else if (!found.role || (isAdminEmail && found.role !== "admin")) {
      found.role = defaultRole;
      users[found.uid] = found;
      lsSet("users", users);
    }
    lsSet("currentUser", found);
    return found;
  }

  const cred = await signInWithEmailAndPassword(auth, email, password ?? "");
  const firebaseUser = cred.user;
  return firebaseUserToProfile(firebaseUser);
}

/**
 * Sign in with Google popup.
 */
export async function authLoginWithGoogle(): Promise<UserProfile> {
  if (!auth) throw new Error("Firebase not configured. Use email login in sandbox mode.");
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  const cred = await signInWithPopup(auth, provider);
  const firebaseUser = cred.user;
  // Create or update user doc in Firestore
  await ensureUserDocument(firebaseUser);
  return firebaseUserToProfile(firebaseUser);
}

/**
 * Register with email + password (real Firebase Auth).
 */
export async function authRegister(
  email: string,
  displayName?: string,
  password?: string
): Promise<UserProfile> {
  if (!auth) {
    // Sandbox fallback
    const users = lsGet<Record<string, UserProfile>>("users", {});
    const isAdminEmail = email === "dibash6396@gmail.com" || email.endsWith("@lifesaver.ai");
    const defaultRole = isAdminEmail ? "admin" : "user";
    const newUser: UserProfile = {
      uid: `user_${crypto.randomUUID().slice(0, 8)}`,
      email,
      displayName: displayName || email.split("@")[0],
      createdAt: new Date().toISOString(),
      onboarded: false,
      role: defaultRole,
    };
    users[newUser.uid] = newUser;
    lsSet("users", users);
    lsSet("currentUser", newUser);
    return newUser;
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password ?? "");
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  await ensureUserDocument(cred.user, displayName);
  return firebaseUserToProfile(cred.user);
}

/**
 * Sign out.
 */
export async function authLogout(): Promise<void> {
  if (!auth) {
    lsSet("currentUser", null);
    return;
  }
  await signOut(auth);
}

/**
 * Send password reset email.
 */
export async function authSendPasswordReset(email: string): Promise<void> {
  if (!auth) throw new Error("Firebase not configured");
  await sendPasswordResetEmail(auth, email);
}

/**
 * Get the currently logged-in user profile.
 * Returns null if not logged in.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!auth) {
    return lsGet<UserProfile | null>("currentUser", null);
  }
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth!, async (user) => {
      unsub();
      if (!user) { resolve(null); return; }
      // Try to get extended profile from Firestore
      try {
        const snap = await getDoc(doc(db!, "users", user.uid));
        if (snap.exists()) {
          resolve(snap.data() as UserProfile);
        } else {
          await ensureUserDocument(user);
          resolve(firebaseUserToProfile(user));
        }
      } catch {
        resolve(firebaseUserToProfile(user));
      }
    });
  });
}

/**
 * Get raw Firebase Auth instance (for useEffect listeners in components).
 */
export function getFirebaseAuth(): Auth | null {
  return auth;
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

function firebaseUserToProfile(user: User): UserProfile {
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? user.email?.split("@")[0],
    createdAt: user.metadata.creationTime ?? new Date().toISOString(),
    onboarded: false,
  };
}

async function ensureUserDocument(user: User, displayName?: string): Promise<void> {
  if (!db) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  
  const email = user.email ?? "";
  const isAdminEmail = email === "dibash6396@gmail.com" || email.endsWith("@lifesaver.ai");
  const defaultRole = isAdminEmail ? "admin" : "user";

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: email,
      displayName: displayName ?? user.displayName ?? email.split("@")[0],
      createdAt: new Date().toISOString(),
      onboarded: false,
      role: defaultRole,
    } as UserProfile);
  } else {
    const data = snap.data();
    if (!data.role || (isAdminEmail && data.role !== "admin")) {
      await setDoc(ref, { role: defaultRole }, { merge: true });
    }
  }
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export async function setOnboardingCompleted(uid: string, profileData?: Partial<UserProfile>): Promise<void> {
  if (!db) {
    const users = lsGet<Record<string, UserProfile>>("users", {});
    if (users[uid]) {
      users[uid].onboarded = true;
      if (profileData) Object.assign(users[uid], profileData);
      lsSet("users", users);
    }
    const cur = lsGet<UserProfile | null>("currentUser", null);
    if (cur && cur.uid === uid) {
      cur.onboarded = true;
      if (profileData) Object.assign(cur, profileData);
      lsSet("currentUser", cur);
    }
    return;
  }
  await setDoc(doc(db, "users", uid), { onboarded: true, ...profileData }, { merge: true });
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: UserSettings = {
  workingHours: { start: "09:00", end: "17:00" },
  currentEnergyState: "high",
  pomodoroConfig: { focusDuration: 25, breakDuration: 5 },
};

export async function getSettings(): Promise<UserSettings> {
  if (!db) return lsGet("settings", DEFAULT_SETTINGS);
  try {
    const uid = await requireUid();
    const snap = await getDoc(doc(db, "users", uid, "data", "settings"));
    return snap.exists() ? (snap.data() as UserSettings) : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  if (!db) { lsSet("settings", updated); return updated; }
  try {
    const uid = await requireUid();
    await setDoc(doc(db, "users", uid, "data", "settings"), updated, { merge: true });
  } catch { lsSet("settings", updated); }
  return updated;
}

// ─── TASKS ───────────────────────────────────────────────────────────────────

export async function getTasks(): Promise<Task[]> {
  if (!db) {
    const obj = lsGet<Record<string, Task>>("tasks", {});
    return Object.values(obj);
  }
  try {
    const uid = await requireUid();
    const snap = await getDocs(collection(db, "users", uid, "tasks"));
    return snap.docs.map((d) => d.data() as Task);
  } catch {
    return Object.values(lsGet<Record<string, Task>>("tasks", {}));
  }
}

export async function getTask(id: string): Promise<Task | null> {
  if (!db) return lsGet<Record<string, Task>>("tasks", {})[id] ?? null;
  try {
    const uid = await requireUid();
    const snap = await getDoc(doc(db, "users", uid, "tasks", id));
    return snap.exists() ? (snap.data() as Task) : null;
  } catch { return null; }
}

export async function saveTask(task: Task): Promise<Task> {
  if (!db) {
    const obj = lsGet<Record<string, Task>>("tasks", {});
    obj[task.id] = task;
    lsSet("tasks", obj);
    return task;
  }
  try {
    const uid = await requireUid();
    await setDoc(doc(db, "users", uid, "tasks", task.id), task, { merge: true });
  } catch {
    const obj = lsGet<Record<string, Task>>("tasks", {});
    obj[task.id] = task;
    lsSet("tasks", obj);
  }
  return task;
}

export async function updateTaskFields(id: string, fields: Partial<Task>): Promise<Task | null> {
  const task = await getTask(id);
  if (!task) return null;
  return saveTask({ ...task, ...fields, updatedAt: new Date().toISOString() });
}

export async function deleteTask(id: string): Promise<boolean> {
  if (!db) {
    const obj = lsGet<Record<string, Task>>("tasks", {});
    if (obj[id]) { delete obj[id]; lsSet("tasks", obj); return true; }
    return false;
  }
  try {
    const uid = await requireUid();
    await deleteDoc(doc(db, "users", uid, "tasks", id));
    return true;
  } catch { return false; }
}

// ─── TIME BLOCKS ─────────────────────────────────────────────────────────────

export async function getTimeBlocks(): Promise<TimeBlock[]> {
  if (!db) return Object.values(lsGet<Record<string, TimeBlock>>("timeBlocks", {}));
  try {
    const uid = await requireUid();
    const snap = await getDocs(collection(db, "users", uid, "timeBlocks"));
    return snap.docs.map((d) => d.data() as TimeBlock);
  } catch {
    return Object.values(lsGet<Record<string, TimeBlock>>("timeBlocks", {}));
  }
}

export async function saveTimeBlocks(blocks: TimeBlock[]): Promise<TimeBlock[]> {
  if (!db) {
    const obj: Record<string, TimeBlock> = {};
    blocks.forEach((b) => (obj[b.id] = b));
    lsSet("timeBlocks", obj);
    return blocks;
  }
  try {
    const uid = await requireUid();
    for (const b of blocks) {
      await setDoc(doc(db, "users", uid, "timeBlocks", b.id), b, { merge: true });
    }
  } catch {
    const obj: Record<string, TimeBlock> = {};
    blocks.forEach((b) => (obj[b.id] = b));
    lsSet("timeBlocks", obj);
  }
  return blocks;
}

export async function clearAllTimeBlocks(): Promise<void> {
  if (!db) { lsSet("timeBlocks", {}); return; }
  try {
    const uid = await requireUid();
    const snap = await getDocs(collection(db, "users", uid, "timeBlocks"));
    for (const d of snap.docs) await deleteDoc(d.ref);
  } catch { lsSet("timeBlocks", {}); }
}

// ─── COMMUNICATION LOGS ───────────────────────────────────────────────────────

export async function getCommunicationHistory(): Promise<CommunicationLog[]> {
  if (!db) return Object.values(lsGet<Record<string, CommunicationLog>>("communicationLogs", {}));
  try {
    const uid = await requireUid();
    const snap = await getDocs(collection(db, "users", uid, "communicationLogs"));
    return snap.docs.map((d) => d.data() as CommunicationLog);
  } catch {
    return Object.values(lsGet<Record<string, CommunicationLog>>("communicationLogs", {}));
  }
}

export async function saveCommunicationLog(
  taskId: string,
  taskTitle: string,
  stakeholder: string,
  draft: string
): Promise<CommunicationLog> {
  const newLog: CommunicationLog = {
    id: `comm_${crypto.randomUUID().slice(0, 9)}`,
    taskId,
    taskTitle,
    stakeholder,
    draft,
    timestamp: new Date().toISOString(),
  };

  if (!db) {
    const obj = lsGet<Record<string, CommunicationLog>>("communicationLogs", {});
    obj[newLog.id] = newLog;
    lsSet("communicationLogs", obj);
    return newLog;
  }

  try {
    const uid = await requireUid();
    await setDoc(doc(db, "users", uid, "communicationLogs", newLog.id), newLog);
  } catch {
    const obj = lsGet<Record<string, CommunicationLog>>("communicationLogs", {});
    obj[newLog.id] = newLog;
    lsSet("communicationLogs", obj);
  }
  return newLog;
}

// ─── ACTIVITY LOGS (replaces system logs + token tracking) ───────────────────

export interface ActivityLog {
  timestamp: string;
  message: string;
}

export function getActivityLogs(): ActivityLog[] {
  return lsGet<ActivityLog[]>("activityLogs", []);
}

export function addActivityLog(message: string): void {
  const logs = getActivityLogs();
  const updated = [{ timestamp: new Date().toISOString(), message }, ...logs].slice(0, 50);
  lsSet("activityLogs", updated);
}

// ─── Legacy compatibility shims ───────────────────────────────────────────────
// Keep these so existing dashboard code doesn't break during transition

export function getSystemLogs(): ActivityLog[] { return getActivityLogs(); }
export function addSystemLog(msg: string): void { addActivityLog(msg); }
export function getTokenConsumption() { return lsGet("tokenStats", { flashCount: 0, proCount: 0 }); }
export function incrementTokenConsumption(model: "flash" | "pro", count: number) {
  const s = getTokenConsumption();
  if (model === "flash") s.flashCount += count; else s.proCount += count;
  lsSet("tokenStats", s);
}
export async function getMockUsersList(): Promise<UserProfile[]> {
  if (!db) {
    const users = lsGet<Record<string, UserProfile>>("users", {});
    return Object.values(users);
  }
  try {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (err) {
    console.error("Failed to fetch users list:", err);
    return [];
  }
}
