# Project Architecture: The Last-Minute Life Saver
# Google Antigravity Agent Instructions

## 1. Project Goal
Build an AI-powered productivity companion that proactively assists users in planning, prioritizing, and completing tasks before deadlines are missed[cite: 1]. The system must move beyond traditional reminders and focus on helping users take meaningful, autonomous action[cite: 1]. 

The primary evaluation focus is to demonstrate how AI can improve productivity by helping users make better decisions and execute tasks more effectively[cite: 1].

## 2. Tech Stack Definition
- **Frontend & API:** Next.js (App Router), TypeScript, Tailwind CSS.
- **UI Primitives:** shadcn/ui configured specifically with **Base UI** (MUI-backed primitives).
- **Database / Backend:** Firebase Firestore (for real-time data syncing).
- **AI Brain:** Google AI Studio (Gemini 3.5 Flash / Gemini 1.5 Pro) via the `@google/genai` Node SDK.
- **Deployment:** Containerized (Docker) and deployed on Google Cloud Run[cite: 1].

## 3. Comprehensive Feature Set

### Category A: Core & Expected Features (The Baseline)
- **The "Panic Button" Unstructured Brain Dump (Agentic Depth):** A prominent interface action where a user inputs raw, panicked, unstructured text or thoughts (e.g., *"I'm drowning, I have an ad campaign due Monday at 2 PM but haven't even written the copy or designed creatives"*). The Gemini engine uses tool-calling to break this down into atomic micro-tasks with realistic time allocations[cite: 1].
- **Intelligent Task Prioritization:** Automatic mathematical sequencing of tasks using an Eisenhower Matrix variant calculated dynamically based on deadline proximity and task dependency weightage[cite: 1].
- **Calendar Integration & Auto-Scheduling:** A visual daily timeline interface showing time-blocks automatically carved out in Firestore based on the user's available working hours[cite: 1].
- **The "Deep Work" Focus Mode Dashboard (Product Experience):** A distraction-free UI view that displays only the current active micro-task, a ticking Pomodoro timer, and immediate actionable resources.

### Category B: Highly Unique & Missing Industry Gaps (The Unfair Advantage)
These features tackle the failures of traditional tools (which rely entirely on passive user discipline) by giving the AI true autonomous execution capabilities:

- **Autonomous Pre-Research & Scaffolding Agent (The "Head Start"):** 
  - *What it is:* Traditional apps block out time but leave you staring at a blank page. 
  - *Agentic Action:* When the AI schedules a task like *"Write copy for Facebook Ads"*, it runs a background pipeline in Google AI Studio to pre-generate initial brainstorming assets (e.g., three target audience outlines, headline angles, and structural templates). When the user clicks into "Focus Mode" for that task, they are immediately handed a highly contextual asset to eliminate starting friction.
- **Dynamic "Auto-Negotiation" & Crisis Shifting:**
  - *What it is:* Traditional tools just turn a task red when you miss a deadline, inducing anxiety.
  - *Agentic Action:* If a time block passes without completion, the backend engine automatically triggers an AI assessment. Gemini evaluates the rest of the day, drops lower-priority items (e.g., "clear inbox"), and shifts the high-priority deadline task into the next available slot, immediately presenting the user with an adjusted, realistic recovery plan.
- **Energy-Adaptive Friction Matcher:**
  - *What it is:* Forcing deep analytical work when a user is burnt out leads to failure.
  - *Agentic Action:* Users can declare or toggle their current mental state (High Energy, Low Energy, Overwhelmed). The scheduling engine dynamically adapts the timeline; if "Overwhelmed," it suppresses complex projects and serves up quick, low-friction administrative micro-tasks to help the user build behavioral momentum.

### Category C: Hyper-Advanced & Industry-First Features (Completely New Concepts)
- **The One-Click "Crisis Communication" Protocol (The Stakeholder Shield):**
  - *What it is:* When an urgent deadline is mathematically impossible to hit due to compounding delays, users freeze up out of stress.
  - *Agentic Action:* The AI recognizes the bottleneck. Instead of just failing, Gemini automatically drafts a highly professional, contextual message or email optimized for the specific stakeholder (e.g., client, manager, professor) explaining the adjustment and proposing a precise new delivery time. The interface presents this to the user as a single action: `[Approve and Send Extension Request via API]`.
- **Velocity-Aware Live Recalibration Engine:**
  - *What it is:* Static task estimation is always wrong because humans suffer from planning fallacy.
  - *Agentic Action:* As the user checks off sub-steps within Focus Mode, the app tracks actual completion velocity against the original AI estimate. If a task estimated for 1 hour is taking longer, the app actively shrinks or reschedules downstream blocks in real-time before a crisis occurs, keeping the calendar accurate to the minute.

## 4. Visual Design Identity (10% Weightage)
- **Check:** Design.md

## 5. Execution Rules for Antigravity Agent
1. **Plan First:** Always generate an Implementation Plan artifact detailing database schema structures and endpoint layouts before altering codebase files.
2. **Custom Orchestration Only:** Implement all routing, agent states, and tool-handling natively inside Next.js API routes using standard TypeScript and the official `@google/genai` library. Do not pull in visual canvas automation tools.
3. **JSON Constrained Output:** Ensure all AI calls utilize schema definitions to guarantee robust data storage within Firebase Firestore.
4. **Cloud Run Packaging:** Ensure the Next.js app configuration utilizes output: 'standalone' and maintains a clean Dockerfile optimization step for effortless deployment onto Google Cloud.