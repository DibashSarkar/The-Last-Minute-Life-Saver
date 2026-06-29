import { NextResponse } from "next/server";
import { runCrisisCommunication } from "@/lib/gemini";
import { getTask } from "@/lib/firebase";
import { verifyAuthToken, unauthorizedResponse } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  const uid = await verifyAuthToken(request);
  if (!uid) return unauthorizedResponse();

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  try {
    const { taskId, stakeholderType, disposition } = await request.json();

    if (!taskId || typeof taskId !== "string" || !stakeholderType || typeof stakeholderType !== "string") {
      return NextResponse.json({ error: "Task ID and Stakeholder Type are required" }, { status: 400 });
    }

    const task = await getTask(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const { draft, modelUsed } = await runCrisisCommunication(
      task.title,
      stakeholderType,
      task.description || "",
      disposition || "Formal & Professional"
    );

    return NextResponse.json({ draft, modelUsed });
  } catch (error: any) {
    console.error("API Crisis Communication error:", error);
    return NextResponse.json({ error: "Failed to write message — please try again" }, { status: 500 });
  }
}
