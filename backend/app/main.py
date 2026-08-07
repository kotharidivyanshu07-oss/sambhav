import os
import contextlib
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import init_db, async_session_factory
from app.core.middleware import SecurityHeadersMiddleware, limiter
from app.core.security import hash_password
from app.models.user import User, Metric
from sqlalchemy import select, func


from app.core.worker import task_worker


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup initialization and seeding."""
    # 1. Initialize tables
    await init_db()

    # 2. Seed initial data (Admin account & Default Metrics) if DB is empty
    async with async_session_factory() as session:
        user_res = await session.execute(select(User).where(User.email == "admin@example.com"))
        admin_user = user_res.scalar_one_or_none()
        
        if not admin_user:
            admin_user = User(
                email="admin@example.com",
                full_name="System Administrator",
                hashed_password=hash_password("AdminPass123!"),
                role="admin",
                is_active=True,
                is_superuser=True
            )
            session.add(admin_user)
            
            # Seed metrics
            initial_metrics = [
                Metric(title="Active Users", value="1,248", change_percentage=14.2, trend="up", category="user"),
                Metric(title="API Throughput", value="4,820 req/s", change_percentage=8.7, trend="up", category="system"),
                Metric(title="Avg Response Time", value="19.4 ms", change_percentage=-12.5, trend="down", category="system"),
                Metric(title="Uptime SLA", value="99.99%", change_percentage=0.01, trend="up", category="system"),
            ]
            session.add_all(initial_metrics)
            await session.commit()

    # 3. Start Async Task Worker Engine background loops
    await task_worker.start()

    yield

    # Cleanup tasks on shutdown
    await task_worker.stop()


app = FastAPI(
    title="Scalable FastAPI Core Engine",
    description="High-performance, secure backend architecture supporting JWT authentication, rate limiting, and async ORM operations.",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Set rate limiter state
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Handle rate limit exceedances gracefully with 429 Too Many Requests."""
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": "Rate limit exceeded",
            "detail": "Too many requests. Please throttle your API consumption."
        }
    )


# Attach Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Configure CORS Middleware safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Response-Time"]
)

# Register API routes
app.include_router(api_router)


@app.get("/", tags=["System"])
async def root_status():
    return {
        "system": "FastAPI Core Engine",
        "status": "operational",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else "disabled"
    }


if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", settings.HOST or "0.0.0.0")
    port = int(os.environ.get("PORT", settings.PORT or 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=settings.DEBUG)

