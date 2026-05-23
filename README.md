# AI Assessment Creator

An AI-powered tool for generating academic question papers. Provide a title, subject, question type breakdown, and an optional source document — the app queues the job, streams real-time progress via WebSocket, and delivers a structured, downloadable PDF paper.

---

## Features

- **AI-generated question papers** using OpenAI (GPT-4o-mini by default)
- **Multiple question types** — MCQ, Short Answer, Long Answer, True/False, Fill in the Blank
- **Configurable structure** — set counts and marks per question type; totals are validated automatically
- **Source file upload** — attach a PDF, `.txt`, or `.md` file as reference context for generation
- **Real-time progress** — live status updates streamed to the browser via Socket.IO
- **PDF export** — download the finished paper as a formatted PDF
- **Regeneration** — re-run generation on any existing assignment
- **Mock AI mode** — run and develop without an OpenAI key

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 18, Tailwind CSS 3, Zustand, Socket.IO Client |
| Backend | Node.js 20+, Express 4, TypeScript 5.8 |
| AI | OpenRouter API (`z-ai/glm-4.5-air:free`) |
| Queue | BullMQ 5 (Redis-backed) |
| Database | MongoDB (Mongoose 8) |
| Real-time | Socket.IO 4 |
| PDF | PDFKit |
| Infrastructure | Docker Compose (MongoDB + Redis) |

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Env config, Redis client
│   │   ├── middleware/      # Request validation (Zod)
│   │   ├── models/          # Mongoose models
│   │   ├── queues/          # BullMQ queue definitions
│   │   ├── routes/          # Express API routes
│   │   ├── services/        # AI, PDF, cache, prompt builder
│   │   ├── types/           # Shared TypeScript types
│   │   ├── websocket/       # Socket.IO setup
│   │   ├── workers/         # BullMQ workers (generation + PDF)
│   │   └── index.ts         # App entry point
│   ├── uploads/             # Uploaded source files
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── create/      # New assignment form
│   │   │   └── assignments/[id]/
│   │   │       ├── generating/  # Live progress page
│   │   │       └── paper/       # Generated paper view
│   │   └── components/      # UI components
│   ├── .env.example
│   └── package.json
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (for MongoDB and Redis)
- An OpenAI API key — or use mock mode to skip this

### 1. Start infrastructure

```bash
docker-compose up -d
```

This starts MongoDB on port `27017` and Redis on port `6379`.

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vedaai-assessments
REDIS_URL=redis://localhost:6379
OPENROUTER_API_KEY=your_openrouter_api_key   # get one free at openrouter.ai/keys
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=z-ai/glm-4.5-air:free
USE_MOCK_AI=false                             # set to true to skip AI calls
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=uploads
```

### 3. Configure the frontend

```bash
cd frontend
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

### 4. Install dependencies

```bash
# backend
cd backend && npm install

# frontend
cd frontend && npm install
```

### 5. Run the app

Open two terminals:

```bash
# Terminal 1 — backend API + workers
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

The frontend is available at `http://localhost:3000` and the API at `http://localhost:4000`.

---

## API Reference

All routes are prefixed with `/api/assignments`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create a new assignment (supports `multipart/form-data` for file upload) |
| `GET` | `/` | List all assignments (latest 50, paper content excluded). Supports `?status=` filter |
| `GET` | `/:id` | Get a single assignment |
| `POST` | `/:id/generate` | Queue paper generation |
| `POST` | `/:id/regenerate` | Re-queue generation — clears Redis cache and overwrites existing paper |
| `GET` | `/:id/paper` | Get the generated paper JSON (Redis cache → MongoDB fallback) |
| `GET` | `/:id/pdf` | Download the paper as a formatted PDF (on-the-fly generation) |
| `POST` | `/:id/pdf` | Queue async PDF generation to disk |
| `DELETE` | `/:id` | Delete an assignment and invalidate its Redis cache |

### Health check

```
GET /health
```

Returns `{ status: "ok", mockAi: boolean }`.

---

## Question Types

| Type | Key |
|---|---|
| Multiple Choice | `mcq` |
| Short Answer | `short_answer` |
| Long Answer | `long_answer` |
| True / False | `true_false` |
| Fill in the Blank | `fill_blank` |

Each type is configured with a `count` and `marksPerQuestion`. The sum of all counts must equal `totalQuestions`, and the sum of `count × marksPerQuestion` must equal `totalMarks` — the API validates both.

---

## Mock AI Mode

Set `USE_MOCK_AI=true` (or leave `OPENROUTER_API_KEY` blank) to run without calling the AI. The mock worker generates a placeholder paper after a short delay, useful for UI development and testing.

---

## Building for Production

```bash
# Backend
cd backend
npm run build      # compiles TypeScript to dist/
npm start          # runs dist/index.js

# Frontend
cd frontend
npm run build
npm start
```
