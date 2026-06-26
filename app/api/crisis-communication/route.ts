import { NextResponse } from "next/server";
import { runCrisisCommunication } from "@/lib/gemini";
import { getTask } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const { taskId, stakeholderType } = await request.json();

    if (!taskId || !stakeholderType) {
      return NextResponse.json({ error: "Task ID and Stakeholder Type are required" }, { status: 400 });
    }

    const task = await getTask(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Call Gemini Pro for high-quality, professional stakeholder message generation
    const { draft, modelUsed } = await runCrisisCommunication(
      task.title,
      stakeholderType,
      task.description || "No description provided"
    );

    return NextResponse.json({
      draft,
      modelUsed,
    });
  } catch (error: any) {
    console.error("API Crisis Communication error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate communication draft" }, { status: 500 });
  }
}
