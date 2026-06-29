import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { incrementTokenConsumption } from "@/lib/firebase";
import { verifyAuthToken, unauthorizedResponse } from "@/lib/firebase-admin";

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try { ai = new GoogleGenAI({ apiKey }); } catch {}
}

export async function POST(request: Request) {
  const uid = await verifyAuthToken(request);
  if (!uid) return unauthorizedResponse();

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  try {
    const { taskTitle, taskDescription, stepText } = await request.json();

    if (!taskTitle || typeof taskTitle !== "string" || !stepText || typeof stepText !== "string") {
      return NextResponse.json({ error: "Task title and step text are required" }, { status: 400 });
    }

    // Sanitize inputs
    const safeTitle = taskTitle.replace(/<[^>]*>?/gm, "").trim().slice(0, 200);
    const safeStep  = stepText.replace(/<[^>]*>?/gm, "").trim().slice(0, 500);
    const safeDesc  = (taskDescription ?? "").replace(/<[^>]*>?/gm, "").trim().slice(0, 500);

    let suggestion = "";
    const modelUsed = ai ? "gemini-2.0-flash" : "Built-in hints";

    if (ai) {
      const prompt = `You are a warm, encouraging productivity coach. The user is stuck on one step of a task.
Task: "${safeTitle}" — ${safeDesc || "no description"}
Step they are stuck on: "${safeStep}"
Give one short (max 20 words), very actionable starting sentence to break their block immediately. No intro or outro.`;

      const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
      suggestion = response.text?.trim() || "Open a blank doc and write your first three words — that's it.";
      incrementTokenConsumption("flash", Math.ceil(suggestion.length / 4) + 120);
    } else {
      const hints = [
        "Open a blank doc and write just one sentence about your goal.",
        "Set a 2-minute timer and bullet-point three immediate actions.",
        "Copy the structure of a previous similar task and fill in yours.",
        "Write the last line first — then work backwards from there.",
      ];
      suggestion = hints[Math.floor(Math.random() * hints.length)];
    }

    return NextResponse.json({ suggestion, modelUsed });
  } catch (e: any) {
    console.error("Stuck-helper API error:", e);
    return NextResponse.json({ error: "Could not generate a hint — please try again" }, { status: 500 });
  }
}
