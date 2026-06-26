import { NextResponse } from "next/server";
import { runPanicDump } from "@/lib/gemini";
import { saveTask, Task } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json({ error: "Text brain dump is required" }, { status: 400 });
    }

    // Security Validation & Sanitization
    if (text.length > 5000) {
      return NextResponse.json({ error: "Brain dump exceeds maximum limit of 5,000 characters" }, { status: 400 });
    }

    // Strip HTML/Script tags to prevent DB sanitization leaks
    const sanitizedText = text.replace(/<[^>]*>?/gm, '').trim();
    if (sanitizedText === "") {
      return NextResponse.json({ error: "Invalid text characters provided" }, { status: 400 });
    }

    const { tasks: parsedTasks, modelUsed } = await runPanicDump(sanitizedText);

    const createdTasks: Task[] = [];
    const now = new Date().toISOString();

    for (const parsed of parsedTasks) {
      // Calculate a realistic deadline
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + (parsed.deadlineOffsetDays ?? 1));
      deadlineDate.setHours(17, 0, 0, 0); // 5 PM deadline default

      const newTask: Task = {
        id: `task_${Math.random().toString(36).substr(2, 9)}`,
        title: parsed.title,
        description: parsed.description,
        importance: parsed.importance,
        urgency: parsed.urgency,
        priorityScore: 0, // Will be updated on schedule
        status: "pending",
        estimatedDuration: parsed.estimatedDuration || 30,
        actualDuration: 0,
        deadline: deadlineDate.toISOString(),
        energyRequired: parsed.energyRequired || "medium",
        dependencies: [],
        createdAt: now,
        updatedAt: now,
      };

      // Save to Firebase (or Sandbox)
      await saveTask(newTask);
      createdTasks.push(newTask);
    }

    return NextResponse.json({
      tasks: createdTasks,
      modelUsed,
    });
  } catch (error: any) {
    console.error("API Panic Dump error:", error);
    return NextResponse.json({ error: error.message || "Failed to process brain dump" }, { status: 500 });
  }
}
