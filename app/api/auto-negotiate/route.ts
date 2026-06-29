import { NextResponse } from "next/server";
import { runAutoNegotiation, NegotiableBlock } from "@/lib/gemini";
import {
  getTimeBlocks,
  saveTimeBlocks,
  getTasks,
  getSettings,
  clearAllTimeBlocks,
  TimeBlock,
} from "@/lib/firebase";
import { verifyAuthToken, unauthorizedResponse } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  const uid = await verifyAuthToken(request);
  if (!uid) return unauthorizedResponse();

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  try {
    const { missedBlockId } = await request.json();

    if (!missedBlockId || typeof missedBlockId !== "string") {
      return NextResponse.json({ error: "Missed Block ID is required" }, { status: 400 });
    }

    const allBlocks  = await getTimeBlocks();
    const missedBlock = allBlocks.find(b => b.id === missedBlockId);
    if (!missedBlock) {
      return NextResponse.json({ error: "Missed block not found" }, { status: 404 });
    }

    const tasks    = await getTasks();
    const settings = await getSettings();

    const mapBlock = (b: TimeBlock): NegotiableBlock => {
      const task = tasks.find(t => t.id === b.taskId);
      return {
        id: b.id,
        taskId: b.taskId,
        title: b.title,
        startTime: b.startTime,
        endTime: b.endTime,
        isCompleted: b.isCompleted,
        importance: task ? task.importance : false,
        urgency: task ? task.urgency : false,
      };
    };

    const targetMissedBlock  = mapBlock(missedBlock);
    const targetOtherBlocks  = allBlocks.filter(b => b.id !== missedBlockId && !b.isCompleted).map(mapBlock);

    const { rescheduledBlocks, droppedBlockIds, explanation, modelUsed } =
      await runAutoNegotiation(targetMissedBlock, targetOtherBlocks, settings.workingHours);

    const updatedBlocks: TimeBlock[] = [];
    const droppedTitles: string[]    = [];

    for (const res of rescheduledBlocks) {
      const original = allBlocks.find(b => b.id === res.id);
      if (original) {
        original.startTime = res.startTime;
        original.endTime   = res.endTime;
        original.modelUsed = modelUsed;
        updatedBlocks.push(original);
      }
    }

    const finalBlocksToSave: TimeBlock[] = allBlocks
      .map(b => {
        const updated = updatedBlocks.find(ub => ub.id === b.id);
        return updated ?? b;
      })
      .filter(b => {
        if (droppedBlockIds.includes(b.id)) { droppedTitles.push(b.title); return false; }
        return true;
      });

    await clearAllTimeBlocks();
    await saveTimeBlocks(finalBlocksToSave);

    return NextResponse.json({ rescheduled: updatedBlocks, droppedTitles, explanation, modelUsed });
  } catch (error: any) {
    console.error("API Auto-Negotiate error:", error);
    return NextResponse.json({ error: "Failed to reschedule — please try again" }, { status: 500 });
  }
}
