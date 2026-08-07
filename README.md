# ⚡ Sambhav: Full-Stack Autonomous AI Telemetry Dashboard

An enterprise-grade, highly scalable full-stack layout featuring a **Python FastAPI** backend powered by an asynchronous background worker engine (**Breeth AI API & Google GenAI SDK**) and a **React + Vite + Tailwind CSS** dark-themed dashboard.

---

## 🛠 Technology Stack

* **Backend Engine**: Python 3.14, FastAPI, Uvicorn, AsyncPG, SQLAlchemy 2.0 (Async), PyJWT, Bcrypt, SlowAPI Rate Limiting, Breeth AI API & official Google GenAI SDK (`google-genai`).
* **Frontend UI**: React 18, Vite 8, Tailwind CSS v4, Lucide Icons, Virtualized Windowed Log Renderer, Server-Sent Events (SSE) Client.
* **Database & Concurrency**: PostgreSQL (`asyncpg`) / SQLite (`aiosqlite`) with atomic task locking (`FOR UPDATE SKIP LOCKED`).

---

## 🚀 Quick Start & Local Installation Guide

### Prerequisites
* **Python**: 3.10+ (Python 3.14 recommended)
* **Node.js**: v18+ (Node v20+ recommended)
* **Git**: System git CLI

---

### Step 1: Clone Repository & Setup Root Environment
```bash
git clone <repository_url>
cd sambhav
cp .env.example .env
```

---

### Step 2: Provision & Configure Backend (`/backend`)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Step 3: Launch FastAPI Backend Server
```bash
# Set PYTHONPATH and start Uvicorn server on port 8000
PYTHONPATH=. ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* Backend API base URL: `http://localhost:8000`
* Interactive API Documentation (Swagger): `http://localhost:8000/docs`

> **Default Seeded Admin Credentials**:
> * **Email**: `admin@example.com`
> * **Password**: `AdminPass123!`

---

### Step 4: Launch React Frontend Dashboard (`/frontend`)
Open a new terminal window in the project root:
```bash
cd frontend

# Install Node modules
npm install

# Start Vite dev server on port 5173
npm run dev
```
* Dashboard URL: `http://localhost:5173`

---

## 🎛 Complete Environment Variable Controls (`.env`)

| Environment Variable | Default Value | Description |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `development` | Environment mode (`development`, `staging`, `production`) |
| `PORT` | `8000` | Dynamic binding port for Uvicorn server |
| `HOST` | `0.0.0.0` | Network binding host address |
| `DEBUG` | `true` | Debug verbosity flag |
| `JWT_SECRET_KEY` | `dev_secret_key_...` | HMAC-SHA256 Secret Key for signing Access Tokens |
| `JWT_REFRESH_SECRET_KEY` | `dev_refresh_...` | HMAC-SHA256 Secret Key for signing Refresh Tokens |
| `JWT_ALGORITHM` | `HS256` | JWT Cryptographic Algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access Token expiration duration (minutes) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh Token expiration duration (days) |
| `AI_PROVIDER` | `auto` | Active AI Provider (`auto`, `breeth`, `gemini`) |
| `BREETH_API_KEY` | `your-breeth-key` | API Key for Breeth AI API integration |
| `BREETH_API_URL` | `https://api.breeth.ai/v1/chat/completions` | Breeth AI API Endpoint URL |
| `GEMINI_API_KEY` | `your-gemini-key` | API Key for Google GenAI SDK |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated allowed CORS origins |
| `RATE_LIMIT_PER_MINUTE` | `100` | General endpoint rate limit threshold per IP |
| `AUTH_RATE_LIMIT_PER_MINUTE` | `10` | Auth endpoint rate limit threshold (Brute-force shield) |
| `DATABASE_URL` | `sqlite+aiosqlite:///./backend_app.db` | Async SQLAlchemy Database connection URI |
| `DB_POOL_SIZE` | `20` | Async connection pool size |
| `DB_MAX_OVERFLOW` | `10` | Maximum connection overflow pool limit |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Frontend API client base URL |

---

## 🏗 Full-Stack Architecture Mapping

```
[ User UI Dashboard ]
         │
         ├──► HTTP REST API (JWT Authenticated / Rate Limited) ──► FastAPI Router
         │                                                               │
         ├──► Real-Time Server-Sent Events (SSE Channel) ◄───────────────┤
         │                                                               │
         ▼                                                               ▼
[ Virtualized Console Log ] ◄── Stream Log & Telemetry ── [ Async Worker Engine ]
 (~20 Windowed DOM Nodes)                                (4 Parallel Consumer Loops)
                                                                 │
                                                                 ├──► Breeth AI API
                                                                 ├──► Google GenAI SDK
                                                                 └──► PostgreSQL Database
```

---

## 🏛 The Four Major Core Pillars

### 1. 🚀 Scalability

The application is engineered from the ground up to scale horizontally across server instances and client rendering engines:

* **Modular Clean Architecture**: Separates concerns across core configuration (`/app/core`), database models (`/app/models`), Pydantic schemas (`/app/schemas`), and versioned API routes (`/app/api/v1`).
* **Async Database Engine (SQLAlchemy 2.0)**: Built using `AsyncEngine` with `asyncpg` (PostgreSQL) and `aiosqlite` (SQLite). Features an active pool size of 20 with 10 overflow connections, guaranteeing high-throughput query resolution.
* **Windowed Virtualized Log Console (`VirtualizedConsoleLog`)**: Renders high-volume backend log streams (up to 100,000 items) using top and bottom padding spacers (`paddingTop`, `paddingBottom`). The browser maintains a constant ~20 DOM `<div>` nodes regardless of dataset size, preserving zero UI frame drops.

---

### 2. 🔐 Authentication

Implements a multi-layered security and token management protocol:

* **Dual JWT Token Architecture**: Employs short-lived 30-minute Access Tokens and long-lived 7-day Refresh Tokens signed with distinct HMAC-SHA256 secret keys.
* **Salt-Factored Bcrypt Hashing**: Password strings are hashed using Bcrypt with a salt factor of 12 (`bcrypt.gensalt(12)`), mitigating rainbow table and pre-computation attacks.
* **Tenant Isolation & Role-Based Access Control (RBAC)**: Enforces administrative permission boundaries (`admin` vs `user`). Users are restricted strictly to their owned tasks, metrics, and logs unless authenticated with administrative privileges.

---

### 3. 🛡 Security

Ensures end-to-end data integrity and protection against malicious traffic vectors:

* **Security Headers Middleware**: Injecting HTTP protection headers on every response:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
* **Input Sanitization & Validation**: All incoming requests are validated against strict Pydantic v2 schemas, filtering out unexpected or malicious payload keys.
* **Operational Controls & Emergency Kill-Switch**: Includes a prominent **Emergency Kill-Switch** button to immediately halt the backend Python worker loop, as well as a **Human-in-the-Loop** toggle switch requiring user approval flags before finalizing AI content.
* **Rate-Limiting Protection (`SlowAPI`)**: Enforces rate-limiting thresholds (10 req/min on auth, 100 req/min on general APIs), mitigating brute-force password guessing and denial-of-service attempts.

---

### 4. ⚡ Handling Large Amounts of People

Designed specifically to handle thousands of concurrent users and high traffic volume without network locks:

* **Asynchronous Event Loop Architecture**: Powered by Python's `asyncio` module and FastAPI non-blocking worker loops (`AsyncTaskWorkerEngine`). Long-running agent tasks execute in background consumer queues independently from main API HTTP request threads.
* **Atomic Task Locking (`FOR UPDATE SKIP LOCKED`)**: When background workers claim pending tasks from PostgreSQL, they use row-level locks with `SKIP LOCKED`, allowing multiple worker processes to process tasks concurrently without race conditions or database contention.
* **Non-Blocking Server-Sent Events (SSE)**: The `/api/v1/stream/telemetry` endpoint Streams execution logs and telemetry metrics directly to client browsers using non-blocking asynchronous generators (`asyncio.sleep(1.5)`), serving thousands of simultaneous dashboard connections effortlessly.

---

## 📜 License

MIT License. Designed for high-throughput, real-time enterprise AI orchestration.
