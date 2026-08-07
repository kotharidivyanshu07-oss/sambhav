# Full-Stack Core Layout (FastAPI + React + Vite + Tailwind CSS)

A highly scalable, secure, and asynchronous full-stack layout built to handle high concurrency, robust token management, and modular system expansion.

---

## 🏗 Repository Structure

```text
.
├── .env.example              # Root environment template for tracking system keys
├── .env                      # Local environment configuration (Git-ignored)
├── .gitignore                # Safeguards system secrets, venv, node_modules, build outputs
├── backend/                  # Python FastAPI Asynchronous Application
│   ├── app/
│   │   ├── api/              # Versioned API routes (v1 endpoints for auth, metrics, users)
│   │   ├── core/             # Security, config, CORS, rate-limiting & async DB pool
│   │   ├── models/           # SQLAlchemy 2.0 ORM models (User, ActivityLog, Metric)
│   │   ├── schemas/          # Pydantic v2 input/output validation models
│   │   └── main.py           # FastAPI initialization & startup lifespan seeding
│   ├── pyproject.toml        # Project metadata
│   └── requirements.txt      # Async dependencies (FastAPI, uvicorn, SQLAlchemy, aiosqlite, greenlet, pyjwt, bcrypt)
└── frontend/                 # React + Vite + Tailwind CSS Dashboard
    ├── src/
    │   ├── components/       # Metric cards, SVG analytics chart, audit feed, health widget, RBAC table
    │   ├── context/          # AuthContext with token hydration & refresh handlers
    │   ├── services/         # Fetch API client with Bearer auth & auto 401 refresh
    │   ├── types/            # TypeScript interface declarations
    │   └── index.css         # Glassmorphic dark mode styling engine
    ├── vite.config.ts        # Vite configuration with Tailwind CSS plugin & proxy
    └── package.json
```

---

## 🏛 The 4 Core Pillars

### 1. 🚀 Scalability
- **Modular Architecture**: Complete separation of concerns between frontend presentation and backend logic.
- **SQLAlchemy 2.0 Async Session Pool**: Async ORM connections configured with `pool_size` and `max_overflow` for efficient DB utilization.
- **Paginated Endpoints**: Activity logs and user queries use structured offset/limit pagination.

### 2. 🔐 Authentication & RBAC
- **Dual JWT Layer**: Short-lived Access Tokens (30m) and long-lived Refresh Tokens (7d).
- **Password Protection**: Salted Bcrypt hashing (work factor 12).
- **Role-Based Access Control**: `admin`, `analyst`, and `user` privileges enforced in API dependencies.
- **Auto-Refresh Interceptor**: Client API automatically handles token refreshing on 401 responses.

### 3. 🛡 Security & Key Safeguards
- **Strict Environment Tracking**: Root `.env` containing sensitive keys is strictly git-ignored; `.env.example` tracks key structures safely.
- **CORS Whitelisting**: Strict origin controls configured via environment variables.
- **Security Headers Middleware**: Enforces `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, and `Strict-Transport-Security`.
- **Rate Limiting**: `Slowapi` IP-based rate limiting on sensitive routes (`/api/v1/auth/login`, `/api/v1/auth/register`).

### 4. ⚡ High Throughput & Concurrency
- **Non-blocking Event Loops**: FastAPI `async/await` routes eliminate thread blocking under heavy load.
- **Performance Telemetry**: Live system health probe measuring memory RSS, uptime, and event loop latency.
- **Optimized Vite Bundles**: Tree-shaken frontend distribution (296ms build).

---

## 🛠 Quick Start Guide

### 1. Backend Server Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (Port 8000)
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/v1/dashboard/health](http://localhost:8000/api/v1/dashboard/health)
- **Pre-seeded Admin Account**: `admin@example.com` / `AdminPass123!`

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

- **Dashboard Interface**: [http://localhost:5173](http://localhost:5173)
