import { GoogleGenAI, Type, Schema } from "@google/genai";
import { incrementTokenConsumption, addSystemLog } from "./firebase";

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI client:", e);
  }
}

// Model Routing Definitions
const MODEL_FLASH = "gemini-1.5-flash";
const MODEL_PRO = "gemini-1.5-pro";

// Helper to delay for simulation
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// MOCK GENERATORS FOR SANDBOX MODE
const mockPanicDump = (text: string) => {
  console.log("Using Mock Panic Dump parsing...");
  return {
    tasks: [
      {
        title: "Outline marketing strategy",
        description: "Brainstorm core channels, identify key messages, and write brief summary.",
        importance: true,
        urgency: true,
        estimatedDuration: 45,
        energyRequired: "high" as const,
        deadlineOffsetDays: 1
      },
      {
        title: "Draft landing page ad copy",
        description: "Write headline variations, product benefit descriptions, and call-to-actions.",
        importance: true,
        urgency: false,
        estimatedDuration: 60,
        energyRequired: "high" as const,
        deadlineOffsetDays: 2
      },
      {
        title: "Clean email inbox",
        description: "Sort out notifications, reply to pending internal threads, archive old threads.",
        importance: false,
        urgency: false,
        estimatedDuration: 30,
        energyRequired: "low" as const,
        deadlineOffsetDays: 3
      },
      {
        title: "Submit status update report",
        description: "Draft bullets showing completion milestones for this week and send to manager.",
        importance: false,
        urgency: true,
        estimatedDuration: 15,
        energyRequired: "low" as const,
        deadlineOffsetDays: 0
      }
    ]
  };
};

const mockPreResearch = (title: string, desc: string) => {
  return {
    targetAudiences: [
      "Busy startup founders needing fast marketing templates",
      "Freelance copywriters balancing multiple client projects",
      "Corporate product managers finalizing launching assets under high stress"
    ],
    headlineAngles: [
      `1. "Drowning in deadlines? Let ${title} kickstart your brainstorming in 5 seconds."`,
      `2. "The frictionless way to go from a blank page to a finished draft: ${title}."`,
      `3. "Stop stressing, start finishing: A framework for ${title} under pressure."`
    ],
    structuralTemplates: [
      "Introduction: Grab interest and frame the core problem",
      "The Catalyst: Why previous solutions failed for this audience",
      "The Solution Blueprint: Step-by-step breakdown based on: " + desc,
      "Call to Action: Single clear next step for the reader"
    ]
  };
};

const mockCrisisCommunication = (title: string, stakeholderType: string) => {
  const salutation = stakeholderType.toLowerCase() === "client" ? "Hi Team," : "Hi Project Manager,";
  return `${salutation}

I wanted to provide a quick heads-up regarding the "${title}" task. 

Due to some unexpected technical bottlenecks during integration, I am running slightly behind schedule. To ensure we maintain high quality and don't rush the core mechanics, I am adjusting my timeline. 

I expect to have this completed and ready for your review in approximately 2 hours. I will update you immediately if anything shifts. 

Thank you for your flexibility, and apologies for the last-minute delay.

Best regards,
Productivity Companion (on behalf of User)`;
};

// EXPORTED API FUNCTIONS WITH AUTO-ROUTING
// 1. Unstructured Brain Dump Parser (Gemini 1.5 Flash)
export async function runPanicDump(text: string): Promise<{
  tasks: Array<{
    title: string;
    description: string;
    importance: boolean;
    urgency: boolean;
    estimatedDuration: number;
    energyRequired: "high" | "medium" | "low";
    deadlineOffsetDays: number;
  }>;
  modelUsed: string;
}> {
  addSystemLog(`Initiating raw text triage parsing (Requested chars: ${text.length}).`);
  
  if (!ai) {
    await delay(1000);
    incrementTokenConsumption("flash", 120);
    addSystemLog(`Triage complete. Extracted 4 tasks via local sandbox parser.`);
    return { ...mockPanicDump(text), modelUsed: "Mock Sandbox (No API Key)" };
  }

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      tasks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            importance: { type: Type.BOOLEAN },
            urgency: { type: Type.BOOLEAN },
            estimatedDuration: { type: Type.INTEGER },
            energyRequired: { 
              type: Type.STRING, 
              enum: ["high", "medium", "low"] 
            },
            deadlineOffsetDays: { type: Type.INTEGER }
          },
          required: ["title", "description", "importance", "urgency", "estimatedDuration", "energyRequired", "deadlineOffsetDays"]
        }
      }
    },
    required: ["tasks"]
  };

  try {
    const prompt = `You are a triage agent for a panicked, overwhelmed user.
    The user wrote this brain dump: "${text}".
    Break this down into distinct, atomic, realistic tasks.
    Estimate how long each task will take in minutes (e.g. 15, 30, 45, 60, 90).
    Categorize them using the Eisenhower matrix (importance and urgency flags).
    Estimate energy required:
    - high: requires deep creative thinking or writing
    - medium: requires moderate problem solving
    - low: administrative or easy tasks (checking mail, organizing, simple reporting)
    Estimate deadlineOffsetDays: when does it need to be done? (0 = today, 1 = tomorrow, etc.)`;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini");
    const data = JSON.parse(resultText);
    
    // Increment telemetry tokens (simulated count based on generated characters)
    const tokens = Math.ceil(resultText.length / 4) + 150;
    incrementTokenConsumption("flash", tokens);
    addSystemLog(`Triage complete. Extracted ${data.tasks?.length || 0} tasks using ${MODEL_FLASH}.`);

    return { tasks: data.tasks || [], modelUsed: MODEL_FLASH };
  } catch (error) {
    console.error("Gemini Panic Dump error, falling back to mock:", error);
    incrementTokenConsumption("flash", 150);
    return { ...mockPanicDump(text), modelUsed: `Fallback: ${MODEL_FLASH} (Error)` };
  }
}

// 2. Pre-Research & Scaffolding (Gemini 1.5 Pro)
export async function runPreResearch(
  title: string, 
  description: string
): Promise<{
  targetAudiences: string[];
  headlineAngles: string[];
  structuralTemplates: string[];
  modelUsed: string;
}> {
  addSystemLog(`Running autonomous pre-research scaffolding pipeline for task: "${title}".`);
  
  if (!ai) {
    await delay(1200);
    incrementTokenConsumption("pro", 450);
    addSystemLog(`Scaffolding complete. Mock templates loaded in sandbox.`);
    return { ...mockPreResearch(title, description), modelUsed: "Mock Sandbox (No API Key)" };
  }

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      targetAudiences: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      headlineAngles: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      structuralTemplates: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["targetAudiences", "headlineAngles", "structuralTemplates"]
  };

  try {
    const prompt = `You are a pre-research assistant. Given a task to start:
    Task Title: "${title}"
    Task Description: "${description}"
    
    To eliminate starting friction and help the user start writing/designing immediately, generate:
    1. 3 target audience profiles relevant to this task.
    2. 3 copywriting hooks, headline angles, or brainstorming starter ideas.
    3. A clear, structural outline/step-by-step template to kickstart this specific task.`;

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini");
    const data = JSON.parse(resultText);
    
    const tokens = Math.ceil(resultText.length / 4) + 600;
    incrementTokenConsumption("pro", tokens);
    addSystemLog(`Scaffolding assets generated successfully using ${MODEL_PRO}.`);

    return {
      targetAudiences: data.targetAudiences || [],
      headlineAngles: data.headlineAngles || [],
      structuralTemplates: data.structuralTemplates || [],
      modelUsed: MODEL_PRO
    };
  } catch (error) {
    console.error("Gemini Pre-Research error, falling back to mock:", error);
    incrementTokenConsumption("pro", 500);
    return { ...mockPreResearch(title, description), modelUsed: `Fallback: ${MODEL_PRO} (Error)` };
  }
}

// 3. Crisis Shifting & Auto-Negotiation (Gemini 1.5 Flash)
export interface NegotiableBlock {
  id: string;
  taskId: string | null;
  title: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  importance: boolean;
  urgency: boolean;
}

export async function runAutoNegotiation(
  missedBlock: NegotiableBlock,
  otherBlocks: NegotiableBlock[],
  workingHours: { start: string; end: string }
): Promise<{
  rescheduledBlocks: Array<{
    id: string;
    startTime: string;
    endTime: string;
  }>;
  droppedBlockIds: string[];
  explanation: string;
  modelUsed: string;
}> {
  addSystemLog(`Schedule crisis shift triggered. Missed block detected: "${missedBlock.title}".`);
  
  if (!ai) {
    await delay(1500);
    incrementTokenConsumption("flash", 240);
    const lowPriority = otherBlocks.find(b => !b.importance && !b.urgency && !b.isCompleted);
    const droppedIds = lowPriority ? [lowPriority.id] : [];
    
    const rescheduled = [{
      id: missedBlock.id,
      startTime: missedBlock.startTime,
      endTime: missedBlock.endTime
    }];

    addSystemLog(`Shifting complete. Postponed ${droppedIds.length} lower-priority items.`);

    return {
      rescheduledBlocks: rescheduled,
      droppedBlockIds: droppedIds,
      explanation: `I noticed you missed "${missedBlock.title}". I shifted this critical task to your next slot and cleared room by postponing your lower-priority item: "${lowPriority?.title || 'None'}".`,
      modelUsed: "Mock Sandbox (No API Key)"
    };
  }

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      rescheduledBlocks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            startTime: { type: Type.STRING },
            endTime: { type: Type.STRING }
          },
          required: ["id", "startTime", "endTime"]
        }
      },
      droppedBlockIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      explanation: { type: Type.STRING }
    },
    required: ["rescheduledBlocks", "droppedBlockIds", "explanation"]
  };

  try {
    const prompt = `You are a crisis schedule coordinator. A user has missed a scheduled slot.
    Missed Task: "${missedBlock.title}" (ID: ${missedBlock.id}, Start: ${missedBlock.startTime}, End: ${missedBlock.endTime})
    Other Remaining Tasks for today:
    ${JSON.stringify(otherBlocks.map(b => ({ id: b.id, title: b.title, start: b.startTime, end: b.endTime, important: b.importance, urgent: b.urgency })))}
    
    Working Hours: ${workingHours.start} to ${workingHours.end}.
    
    Your Goal:
    1. Make space for the missed critical task "${missedBlock.title}" in the remaining schedule today.
    2. Identify and drop/defer lower priority tasks (those that are Not Important and Not Urgent, or Not Important but Urgent). Add their IDs to droppedBlockIds.
    3. Update the start and end times of the tasks that need to shift to accommodate the changes.
    4. Provide a clear, empathetic explanation (max 2 sentences) of what you changed (e.g. "I shifted task X forward and postponed task Y to free up time").
    
    Ensure shifted times are ISO strings that fall strictly within working hours and don't overlap.`;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini");
    const data = JSON.parse(resultText);
    
    const tokens = Math.ceil(resultText.length / 4) + 300;
    incrementTokenConsumption("flash", tokens);
    addSystemLog(`Crisis negotiation complete using ${MODEL_FLASH}. Postponed: ${data.droppedBlockIds?.length || 0} blocks.`);

    return {
      rescheduledBlocks: data.rescheduledBlocks || [],
      droppedBlockIds: data.droppedBlockIds || [],
      explanation: data.explanation || "",
      modelUsed: MODEL_FLASH
    };
  } catch (error) {
    console.error("Gemini Auto-Negotiation error, falling back to mock:", error);
    incrementTokenConsumption("flash", 300);
    const lowPriority = otherBlocks.find(b => !b.importance && !b.isCompleted);
    return {
      rescheduledBlocks: [{ id: missedBlock.id, startTime: missedBlock.startTime, endTime: missedBlock.endTime }],
      droppedBlockIds: lowPriority ? [lowPriority.id] : [],
      explanation: `Failsafe Shift: Rescheduled "${missedBlock.title}". Deferred "${lowPriority?.title || 'None'}" due to a connectivity fallback.`,
      modelUsed: `Fallback: ${MODEL_FLASH} (Error)`
    };
  }
}

// 4. One-Click Stakeholder Shield Communication (Gemini 1.5 Pro)
export async function runCrisisCommunication(
  taskTitle: string,
  stakeholderType: string,
  taskDescription: string
): Promise<{
  draft: string;
  modelUsed: string;
}> {
  addSystemLog(`Drafting extension request draft (Stakeholder Shield) to role: "${stakeholderType}".`);
  
  if (!ai) {
    await delay(1200);
    incrementTokenConsumption("pro", 380);
    addSystemLog(`Stakeholder draft generated in sandbox.`);
    return { 
      draft: mockCrisisCommunication(taskTitle, stakeholderType), 
      modelUsed: "Mock Sandbox (No API Key)" 
    };
  }

  try {
    const prompt = `You are a professional communication advisor.
    The user is going to miss a deadline for this task:
    Task Title: "${taskTitle}"
    Task Description: "${taskDescription}"
    Stakeholder Role: "${stakeholderType}" (e.g. Client, Manager, Professor, Teammate)
    
    Draft a highly professional, polite, and reassuring update explaining the delay.
    - Take accountability.
    - Briefly and professionally mention that integration details are being polished to ensure high quality (keep the explanation generic but realistic).
    - Propose a realistic delay of 2-3 hours or a minor shift to the deadline.
    - Make it easy for the stakeholder to say yes.
    Keep it concise and ready to send. DO NOT include placeholders like [Your Name] or [Insert Date]; write the message in a complete, ready-to-copy state.`;

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: prompt
    });

    const draft = response.text || mockCrisisCommunication(taskTitle, stakeholderType);
    
    const tokens = Math.ceil(draft.length / 4) + 400;
    incrementTokenConsumption("pro", tokens);
    addSystemLog(`Stakeholder draft created via ${MODEL_PRO}.`);

    return { draft, modelUsed: MODEL_PRO };
  } catch (error) {
    console.error("Gemini Crisis Communication error, falling back to mock:", error);
    incrementTokenConsumption("pro", 400);
    return { 
      draft: mockCrisisCommunication(taskTitle, stakeholderType), 
      modelUsed: `Fallback: ${MODEL_PRO} (Error)` 
    };
  }
}
