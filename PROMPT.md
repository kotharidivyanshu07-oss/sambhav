# 📖 PROMPT.md: Engineering Diary & Prompt Progression Log

This document serves as the complete transparency log detailing the natural language prompt progression, evolutionary steps, and vibe coding methodology utilized to construct the **Sambhav Full-Stack Autonomous AI Telemetry Dashboard**.

---

## 📑 Table of Contents

1. [Development Philosophy & Vibe Coding Workflow](#-development-philosophy--vibe-coding-workflow)
2. [The 4 Core Pillars Blueprint](#-the-4-core-pillars-blueprint)
3. [Phase 1: Full-Stack Layout & Key Safeguards](#phase-1-full-stack-layout--key-safeguards)
4. [Phase 2: Database Schema & JWT Authentication Engine](#phase-2-database-schema--jwt-authentication-engine)
5. [Phase 3: Autonomous Worker Loop & Breeth AI Integration](#phase-3-autonomous-worker-loop--breeth-ai-integration)
6. [Phase 4: Dark-Themed Dashboard & Virtualized Console UI](#phase-4-dark-themed-dashboard--virtualized-console-ui)
7. [Phase 5: Real-Time SSE Streaming & Rate-Limiting Protection](#phase-5-real-time-sse-streaming--rate-limiting-protection)
8. [Phase 6: Operational Controls & Emergency Kill-Switch](#phase-6-operational-controls--emergency-kill-switch)

---

## 💡 Development Philosophy & Vibe Coding Workflow

The construction of **Sambhav** followed an iterative, prompt-driven engineering workflow using Google Antigravity (`agy` CLI). Rather than writing manual code line-by-line, the application was built by expressing high-level architectural intent and quantitative requirements via structured natural language prompts.

### Key Workflow Strategies Used:
* **Declarative Prompting**: Specifying exact operational outcomes, data structures, and performance bounds (e.g. 60 FPS rendering, zero frame drops, sub-16ms layout calculations).
* **Empirical Log Diagnostics**: Running build commands (`npm run build`, `pytest`, `uvicorn`) after every file edit and parsing exact error stack traces to drive bug fixes.
* **Continuous Verification**: Executing non-blocking background curl requests and checking database persistence before marking features as complete.

---

## 🏛 The 4 Core Pillars Blueprint

Every prompt and architectural decision strictly enforced these four foundational principles:

1. **Scalability**: Modular FastAPI routes, async SQLAlchemy 2.0 connection pools (`asyncpg`), and windowed slice log virtualization (~20 DOM nodes up to 100,000 items).
2. **Authentication**: Dual JWT token architecture (Access/Refresh), salt-factored Bcrypt password hashing (`bcrypt.gensalt(12)`), and tenant data isolation.
3. **Security**: Security Headers Middleware, Pydantic v2 input sanitization, SlowAPI rate-limiting, and an Emergency Kill-Switch.
4. **Handling Large Amounts of People**: Asynchronous event loop architecture, atomic task claims (`FOR UPDATE SKIP LOCKED`), and non-blocking Server-Sent Events (SSE) telemetry streaming.

---

## Phase 1: Full-Stack Layout & Key Safeguards

### 💬 Prompt Fed to AGY CLI:
> *"Initialize a highly scalable and secure full-stack layout. Provision a Python FastAPI application inside a `/backend` directory and a React + Vite + Tailwind CSS dashboard inside a `/frontend` directory. Configure a root repository environment tracking system with strict git-ignores to safeguard system keys. Ensure Uvicorn binds dynamically to `HOST` and `PORT` environment variables."*

### 🛠 Codebase Evolution & Deliverables:
* Created root `.gitignore` ignoring `.env`, `venv`, `node_modules`, `dist`, `*.db`.
* Provisioned `/backend` directory with Python 3.14 virtualenv and `requirements.txt`.
* Created `backend/app/core/config.py` with Pydantic `Settings` class loading environment keys.
* Built dynamic Uvicorn runner inside `backend/app/main.py` binding to `os.environ.get("HOST")` and `os.environ.get("PORT")`.
* Created `/frontend` React app using Vite v8 and `@tailwindcss/vite`.

---

## Phase 2: Database Schema & JWT Authentication Engine

### 💬 Prompt Fed to AGY CLI:
> *"Create a secure database table schema using SQLAlchemy for a User model inside `backend/app/models/user.py`. Then, implement the JWT token sign-up and password hashing endpoints inside `backend/app/api/v1/endpoints/auth.py`. Ensure it maps perfectly with the Settings class keys defined in our `config.py`."*

### 🛠 Codebase Evolution & Deliverables:
* Built SQLAlchemy 2.0 async database models: `User`, `ActivityLog`, `Metric`, and `AgentTask`.
* Implemented `backend/app/core/security.py` featuring Bcrypt password hashing and HMAC-SHA256 JWT Access/Refresh token generators.
* Implemented authentication endpoints (`POST /register`, `POST /login`, `POST /refresh`, `GET /me`) in `backend/app/api/v1/endpoints/auth.py`.
* Added startup database lifespan auto-seeding default admin account (`admin@example.com` / `AdminPass123!`).

---

## Phase 3: Autonomous Worker Loop & Breeth AI Integration

### 💬 Prompt Fed to AGY CLI:
> *"Develop the core autonomous AI agent inside the Python background worker using Breeth AI API and Google GenAI SDK. The process must handle an unprompted background `while` loop that fetches real-time marketing or news trends, synthesizes content outputs, and continuously streams its internal thinking milestones (e.g., `[SEARCHING]`, `[SYNTHESIZING]`) directly into your PostgreSQL tracking database. Wrap all operations in strict error-handling code blocks to guarantee 100% engine uptime."*

### 🛠 Codebase Evolution & Deliverables:
* Implemented `AsyncTaskWorkerEngine` inside `backend/app/core/worker.py` managing 4 parallel consumer loops and an unprompted background cycle every 45 seconds.
* Built `AutonomousTrendAgent` in `backend/app/core/agent.py` supporting Breeth AI API (`https://api.breeth.ai/v1/chat/completions`) and Google GenAI SDK (`google-genai`).
* Integrated real-time milestone streaming (`[INITIALIZING_AGENT]`, `[SEARCHING_MARKETING_TRENDS]`, `[ANALYZING_SENTIMENT]`, `[CONNECTING_BREETH_AI]`, `[COMPLETED]`) directly persisting into `AgentTask.result` and `ActivityLog` tables.

---

## Phase 4: Dark-Themed Dashboard & Virtualized Console UI

### 💬 Prompt Fed to AGY CLI:
> *"Create a clean dark-themed dashboard frontend in React with Tailwind CSS for authenticated users. The dashboard layout must include: 1. Main sidebar navigation tabs. 2. An Active Goal card with an operation status asset. 3. A highly efficient virtualized console log component that handles thousands of rapid backend updates without dropping UI frames. 4. A column grid displaying the agent's finalized content."*

### 🛠 Codebase Evolution & Deliverables:
* Built `Sidebar.tsx` with tab navigation (`Overview`, `Workers`, `Analytics`, `Audit Trail`, `RBAC Users`, `Security Pillars`).
* Built `ActiveGoalCard.tsx` featuring an active goal status asset, progress track (84%), and worker count badges.
* Built `VirtualizedConsoleLog.tsx` implementing windowed slice math (`paddingTop`, `paddingBottom`, `ROW_HEIGHT = 32px`), rendering a constant ~20 DOM nodes even with 10,000 log items in buffer memory. Included a **"Simulate 5K Rapid Logs"** stress-testing button.
* Built `FinalizedContentGrid.tsx` rendering 3-column responsive cards with virality scores, campaign hooks, target channels, headlines, action plans, and JSON download tools.

---

## Phase 5: Real-Time SSE Streaming & Rate-Limiting Protection

### 💬 Prompt Fed to AGY CLI:
> *"Connect the React frontend to the FastAPI Python server using an optimized Server-Sent Events (SSE) route or polling endpoint. The interface must pull execution logs and data points compiled by the background Python worker loop. Implement rate-limiting thresholds on the backend routing layer to keep the system fully functional and resilient when a large amount of people load the dashboard at the same time."*

### 🛠 Codebase Evolution & Deliverables:
* Created `/api/v1/stream/telemetry` endpoint in `backend/app/api/v1/endpoints/stream.py` returning `StreamingResponse(media_type="text/event-stream")`.
* Configured `SlowAPI` rate-limiting (`@limiter.limit("100/minute")`) and disabled Nginx response buffering (`X-Accel-Buffering: no`).
* Added `ApiClient.createSseEventSource()` in `frontend/src/services/api.ts` to connect browser `EventSource` directly to backend execution streams using JWT access tokens.

---

## Phase 6: Operational Controls & Emergency Kill-Switch

### 💬 Prompt Fed to AGY CLI:
> *"Add an operational controls component card to the UI dashboard layer. This widget must feature: 1. A global Emergency Kill-Switch button that safely intercepts and stops the backend Python worker loop immediately. 2. A real-time token spend metrics tracker checking live API expenses against safety margins. 3. A Human-in-the-Loop toggle switch that requires a user approval flag before finalizing content posts."*

### 🛠 Codebase Evolution & Deliverables:
* Extended `AsyncTaskWorkerEngine` in `worker.py` with operational control parameters: `human_in_loop_required`, `current_token_spend` ($4.28 / $25.00), and `total_tokens_used` (142,500).
* Created operational control endpoints in `backend/app/api/v1/endpoints/dashboard.py`:
  - `GET /api/v1/dashboard/operational-controls`
  - `POST /api/v1/dashboard/kill-switch`
  - `POST /api/v1/dashboard/toggle-human-in-loop`
* Built `OperationalControlsCard.tsx` in React with an Emergency Kill-Switch (with double-click safety confirmation), token budget capacity bar, and Human-in-the-Loop toggle switch.
* Persisted audit entries in `ActivityLog` for every kill-switch or governance action.

---

## 📊 Summary of Engineering Artifacts

| File Path | Description |
| :--- | :--- |
| [`/README.md`](file:///Users/abhinavsharma/Comp.%20Language/sambhav/README.md) | Complete system architecture documentation, setup guide & 4 core pillars |
| [`/PROMPT.md`](file:///Users/abhinavsharma/Comp.%20Language/sambhav/PROMPT.md) | Prompt progression engineering diary and vibe coding workflow log |
| [`/backend/app/core/agent.py`](file:///Users/abhinavsharma/Comp.%20Language/sambhav/backend/app/core/agent.py) | Breeth AI & Google GenAI SDK Autonomous Agent with milestone streaming |
| [`/backend/app/core/worker.py`](file:///Users/abhinavsharma/Comp.%20Language/sambhav/backend/app/core/worker.py) | Non-blocking async worker engine with operational control state |
| [`/backend/app/api/v1/endpoints/stream.py`](file:///Users/abhinavsharma/Comp.%20Language/sambhav/backend/app/api/v1/endpoints/stream.py) | Optimized Server-Sent Events (SSE) telemetry route |
| [`/frontend/src/components/VirtualizedConsoleLog.tsx`](file:///Users/abhinavsharma/Comp.%20Language/sambhav/frontend/src/components/VirtualizedConsoleLog.tsx) | Windowed slice virtualized log console renderer (~20 DOM nodes at 60 FPS) |
| [`/frontend/src/components/OperationalControlsCard.tsx`](file:///Users/abhinavsharma/Comp.%20Language/sambhav/frontend/src/components/OperationalControlsCard.tsx) | Emergency Kill-Switch & Human-in-the-Loop control card |
