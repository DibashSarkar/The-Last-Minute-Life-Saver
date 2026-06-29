# 🚨 The Last-Minute Life Saver

> **Vibe2Ship Hackathon 2026** — Built with Google AI Studio · Coding Ninjas × Google for Developers

An AI-powered productivity companion that **unpacks your panic, prioritizes mathematically, and auto-negotiates your calendar** — powered by Google Gemini.

---

## What It Does

Most productivity tools are passive. They remind you of deadlines you already know you're missing. **The Last-Minute Life Saver** is active — it thinks, reschedules, researches, and communicates on your behalf so you can stay in deep work and not drown.

### Core Features

| Feature | Description |
|---|---|
| 🧠 **Panic Button** | Dump raw, panicked thoughts into a text field. Gemini Flash breaks them into atomic tasks with time estimates and Eisenhower Matrix scoring — instantly. |
| 📊 **Smart Prioritization** | Tasks are mathematically sequenced by urgency × importance × deadline proximity. No more guessing what to do first. |
| 📅 **Auto-Scheduling** | Time blocks are carved into your day automatically, respecting your working hours set during onboarding. |
| ⚡ **Deep Work Focus Mode** | A distraction-free, single-task view with a Pomodoro timer. When you enter focus mode, your pre-generated research assets are already waiting. |
| 🔄 **Crisis Auto-Negotiation** | Missed a block? The engine detects it, drops lower-priority items, and presents you with an adjusted recovery plan. |
| 🧬 **Energy-Adaptive Scheduling** | Toggle between High / Low / Overwhelmed energy states. The scheduler adapts — serving quick admin tasks when you're burnt out. |
| 🔬 **Pre-Research Agent** | Before your focus session, Gemini Pro autonomously generates target audience profiles, headline hooks, and structural templates for your task. |
| 📧 **Stakeholder Shield** | When a deadline is impossible, one click drafts a professional extension email tailored to your stakeholder's personality (Client, Manager, Professor). |
| 📈 **Velocity Recalibration** | Tracks actual vs. estimated time in real-time. Running behind? Downstream blocks shift automatically — before a crisis occurs. |

---

## Tech Stack

```
Frontend:   Next.js 16 (App Router) · TypeScript · Tailwind CSS v4
UI:         shadcn/ui (Base UI / base-mira) · @base-ui/react · @tabler/icons-react
Font:       Geist Sans + Geist Mono
AI:         Google Gemini 3.5 Flash + 1.5 Pro via @google/genai
Database:   Firebase Firestore (real-time) + Firebase Admin (server-side)
Auth:       Firebase Authentication
Deployment: Docker → Google Cloud Run (standalone output)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A [Google AI Studio](https://aistudio.google.com) API key
- A Firebase project

### 1. Clone & Install

```bash
git clone https://github.com/DibashSarkar/The-Last-Minute-Life-Saver.git
cd The-Last-Minute-Life-Saver
pnpm install
```

### 2. Set Up Environment Variables

Copy the example and fill in your keys:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_google_ai_studio_key

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

### 3. Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** The app runs in mock/sandbox mode if `GEMINI_API_KEY` is not set. All AI features will return realistic mock responses so you can still explore the full UI.

---

## Project Structure

```
app/
├── (root pages)        Landing, login, signup, onboarding
├── dashboard/          Main hub — task view, focus mode, analytics
│   ├── workspace/      Kanban / task list
│   ├── focus/          Deep Work + Pomodoro timer
│   ├── analytics/      Velocity & productivity stats
│   ├── history/        Completed tasks archive
│   └── settings/       User preferences
└── api/
    ├── panic-dump/     POST → Gemini Flash brain dump parser
    ├── pre-research/   POST → Gemini Pro scaffolding agent
    ├── auto-negotiate/ POST → Gemini Flash crisis scheduler
    └── crisis-communication/ POST → Gemini Pro stakeholder email

lib/
├── gemini.ts           All 4 Gemini AI functions with mock fallbacks
├── firebase.ts         Firestore client helpers
├── firebase-admin.ts   Server-side Firebase Admin
├── priority.ts         Eisenhower Matrix scoring engine
└── notifications.ts    Push notification helpers

components/
├── ui/                 shadcn/ui Base UI components
├── app-sidebar.tsx     Main navigation sidebar
├── chatbot.tsx         Floating AI assistant
└── ...
```

---

## Deployment (Docker → Cloud Run)

```bash
# Build the container
docker build -t last-minute-life-saver .

# Run locally
docker run -p 3000:3000 --env-file .env.local last-minute-life-saver

# Deploy to Google Cloud Run
gcloud run deploy last-minute-life-saver \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## Hackathon Context

| | |
|---|---|
| **Event** | Vibe2Ship 2026 |
| **Organizers** | Coding Ninjas × Google for Developers |
| **Problem Statement** | AI Productivity Companion |
| **Submission Date** | 30th June 2026, 02:00 PM | 
| **Round 1 Results** | 7th July 2026 |
| **Presentation Round** | 12th July 2026 |
| **Mandatory Tool** | Google AI Studio (Gemini) |

---

## 🧪 Demo Access

> The app runs in **Sandbox Mode** automatically when Firebase is not configured — all data is stored in `localStorage` with no account required.

### Test User (Sandbox / Demo)

| Field | Value |
|---|---|
| **Email** | `guest@lifesaver.ai` |
| **Password** | *(any — no password required in sandbox mode)* |
| **Mode** | Sandbox — data lives in browser localStorage |

Use this account to explore the full UI without needing a Firebase project or Gemini API key. All AI features will return realistic mock responses.

### Admin Panel

| Route | Description |
|---|---|
| `/admin` | Overview — system health, latency, outage toggle |
| `/admin/users` | Registered user list |
| `/admin/tokens` | Gemini token consumption telemetry (Flash vs Pro) |
| `/admin/logs` | Live system activity log |

> **Access:** Any logged-in user can access the admin panel during development. In production, add an `isAdmin` flag check to `checkAdminAuth()` in [`app/admin/page.tsx`](app/admin/page.tsx).

---

## License


This project is the original work of **Dibash Sarkar**, submitted for Vibe2Ship 2026.  
All intellectual property rights are retained by the author.  
Open-source libraries used are attributed in `package.json`.

---

<p align="center">Built under pressure, shipped on time. 🚀</p>
