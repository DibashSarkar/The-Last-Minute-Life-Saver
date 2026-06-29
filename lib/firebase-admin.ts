/**
 * Firebase Admin SDK — server-side only.
 * Used by API routes to verify auth tokens.
 * Never import this in client components.
 */
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

const isAdminConfigured =
  !!process.env.FIREBASE_ADMIN_PROJECT_ID &&
  !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  !!process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (isAdminConfigured) {
  try {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
          // Replace escaped newlines from env var
          privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      adminApp = getApps()[0];
    }
    adminAuth = getAuth(adminApp);
  } catch (err) {
    console.error("Firebase Admin init failed:", err);
  }
}

/**
 * Verify a Firebase ID token from the Authorization header.
 * Returns the decoded uid, or null if invalid / admin not configured.
 */
export async function verifyAuthToken(request: Request): Promise<string | null> {
  if (!adminAuth) {
    // Admin SDK not configured — allow in sandbox/dev mode
    // In production this should always return null for unauthed requests
    if (process.env.NODE_ENV === "production") return null;
    return "sandbox_user"; // dev bypass
  }

  const authHeader = request.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

/**
 * Middleware helper: returns 401 JSON response if not authenticated.
 * Usage: const uid = await requireAuth(request); if (!uid) return unauthorized();
 */
export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized — please sign in" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
