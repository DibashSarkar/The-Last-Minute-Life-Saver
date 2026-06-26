import { NextResponse } from "next/server";
import { runAutoNegotiation, NegotiableBlock } from "@/lib/gemini";
import { 
  getTimeBlocks, 
  saveTimeBlocks, 
  getTasks, 
  getSettings, 
  deleteTask, 
  clearAllTimeBlocks,
  TimeBlock,
  Task
} from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const { missedBlockId } = await request.json();

    if (!missedBlockId) {
      return NextResponse.json({ error: "Missed Block ID is required" }, { status: 400 });
    }

    const allBlocks = await getTimeBlocks();
    const missedBlock = allBlocks.find(b => b.id === missedBlockId);
    if (!missedBlock) {
      return NextResponse.json({ error: "Missed block not found" }, { status: 404 });
    }

    const tasks = await getTasks();
    const settings = await getSettings();

    // Map time blocks to NegotiableBlocks for the Gemini prompt
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

    const targetMissedBlock = mapBlock(missedBlock);
    const targetOtherBlocks = allBlocks
      .filter(b => b.id !== missedBlockId && !b.isCompleted)
      .map(mapBlock);

    // Call Gemini Flash for fast auto-negotiation
    const { rescheduledBlocks, droppedBlockIds, explanation, modelUsed } = 
      await runAutoNegotiation(targetMissedBlock, targetOtherBlocks, settings.workingHours);

    // Apply database updates
    const updatedBlocks: TimeBlock[] = [];
    const droppedTitles: string[] = [];

    // 1. Process rescheduled items
    for (const res of rescheduledBlocks) {
      const original = allBlocks.find(b => b.id === res.id);
      if (original) {
        original.startTime = res.startTime;
        original.endTime = res.endTime;
        original.modelUsed = modelUsed;
        updatedBlocks.push(original);
      }
    }

    // 2. Process dropped items (postpone them by removing their time block for today)
    // We remove their time blocks from the database. The tasks themselves remain "pending" in the task pool.
    const finalBlocksToSave: TimeBlock[] = allBlocks.map(b => {
      // If it is in the rescheduled list, use the updated times
      const updated = updatedBlocks.find(ub => ub.id === b.id);
      if (updated) return updated;
      return b;
    }).filter(b => {
      const isDropped = droppedBlockIds.includes(b.id);
      if (isDropped) {
        droppedTitles.push(b.title);
        return false; // Filter out/delete dropped blocks
      }
      return true;
    });

    // Write updated timeline to Firestore / local state
    // We clear current timeBlocks and write the new filtered set
    await clearAllTimeBlocks();
    await saveTimeBlocks(finalBlocksToSave);

    return NextResponse.json({
      rescheduled: updatedBlocks,
      droppedTitles,
      explanation,
      modelUsed,
    });
  } catch (error: any) {
    console.error("API Auto-Negotiate error:", error);
    return NextResponse.json({ error: error.message || "Failed to negotiate schedule crisis" }, { status: 500 });
  }
}
