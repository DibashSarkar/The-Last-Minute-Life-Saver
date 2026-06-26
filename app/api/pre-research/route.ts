import { NextResponse } from "next/server";
import { runPreResearch } from "@/lib/gemini";
import { getTask, saveTask } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const task = await getTask(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Mark scaffolding status as generating
    task.scaffolding = {
      targetAudiences: [],
      headlineAngles: [],
      structuralTemplates: [],
      status: "generating",
      modelUsed: "gemini-1.5-pro",
    };
    await saveTask(task);

    // Call Gemini Pro for deep scaffolding assets
    try {
      const { targetAudiences, headlineAngles, structuralTemplates, modelUsed } = 
        await runPreResearch(task.title, task.description || "No description provided");

      task.scaffolding = {
        targetAudiences,
        headlineAngles,
        structuralTemplates,
        status: "completed",
        modelUsed,
      };
      
      task.updatedAt = new Date().toISOString();
      await saveTask(task);

      return NextResponse.json({ task });
    } catch (e: any) {
      task.scaffolding.status = "failed";
      await saveTask(task);
      throw e;
    }
  } catch (error: any) {
    console.error("API Pre-Research error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate pre-research assets" }, { status: 500 });
  }
}
