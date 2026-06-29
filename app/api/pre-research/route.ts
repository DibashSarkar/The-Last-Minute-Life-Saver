import { NextResponse } from "next/server";
import { runPreResearch } from "@/lib/gemini";
import { getTask, saveTask } from "@/lib/firebase";
import { verifyAuthToken, unauthorizedResponse } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  const uid = await verifyAuthToken(request);
  if (!uid) return unauthorizedResponse();

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  try {
    const { taskId } = await request.json();

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const task = await getTask(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    task.scaffolding = {
      targetAudiences: [],
      headlineAngles: [],
      structuralTemplates: [],
      status: "generating",
      modelUsed: "gemini-2.0-flash",
    };
    await saveTask(task);

    try {
      const { targetAudiences, headlineAngles, structuralTemplates, modelUsed } =
        await runPreResearch(task.title, task.description || "");

      task.scaffolding = { targetAudiences, headlineAngles, structuralTemplates, status: "completed", modelUsed };
      task.updatedAt = new Date().toISOString();
      await saveTask(task);

      return NextResponse.json({ task });
    } catch (e: any) {
      if (task.scaffolding) task.scaffolding.status = "failed";
      await saveTask(task);
      throw e;
    }
  } catch (error: any) {
    console.error("API Pre-Research error:", error);
    return NextResponse.json({ error: "Failed to generate ideas — please try again" }, { status: 500 });
  }
}
