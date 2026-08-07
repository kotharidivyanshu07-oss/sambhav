import asyncio
import json
import logging
import datetime
from typing import AsyncGenerator
from fastapi import APIRouter, Depends, Request, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.core.middleware import limiter
from app.core.security import decode_token
from app.core.worker import task_worker
from app.models.user import User, ActivityLog
from app.models.task import AgentTask

logger = logging.getLogger("sse_stream_endpoint")

router = APIRouter(prefix="/stream", tags=["Server-Sent Events Stream"])


async def sse_event_generator(request: Request, user_id: int) -> AsyncGenerator[str, None]:
    """
    Non-blocking SSE Generator yielding live execution logs & telemetry data points.
    Compiled by the background Python worker loop.
    """
    last_log_id = 0

    while True:
        # Check if client disconnected
        if await request.is_disconnected():
            logger.info(f"SSE Client disconnected (User #{user_id})")
            break

        try:
            async with async_session_factory_stream() as session:
                # 1. Fetch recent activity logs created by background worker
                stmt = (
                    select(ActivityLog)
                    .where(ActivityLog.id > last_log_id)
                    .order_by(ActivityLog.id.asc())
                    .limit(10)
                )
                res = await session.execute(stmt)
                new_logs = res.scalars().all()

                for log in new_logs:
                    last_log_id = max(last_log_id, log.id)
                    event_data = {
                        "type": "log_entry",
                        "log": {
                            "id": log.id,
                            "timestamp": log.created_at.strftime("%H:%M:%S"),
                            "level": "milestone" if "MILESTONE" in log.action else "error" if "ERROR" in log.action else "info",
                            "source": "BREETH_AI" if "AGENT" in log.action else "WORKER_LOOP",
                            "message": f"{log.action}: {log.details or ''}"
                        }
                    }
                    yield f"data: {json.dumps(event_data)}\n\n"

                # 2. Yield live worker telemetry metrics
                worker_stats = task_worker.get_stats()
                telemetry_event = {
                    "type": "worker_telemetry",
                    "telemetry": worker_stats,
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
                }
                yield f"data: {json.dumps(telemetry_event)}\n\n"

        except Exception as err:
            logger.error(f"Error in SSE event stream generator: {err}")
            error_event = {
                "type": "error",
                "message": "Stream error encountered, retrying..."
            }
            yield f"data: {json.dumps(error_event)}\n\n"

        # Non-blocking yield delay to prevent database contention under high client concurrency
        await asyncio.sleep(1.5)


# Session helper for streaming generator
from app.core.database import async_session_factory as async_session_factory_stream


@router.get("/telemetry")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def stream_telemetry_sse(
    request: Request,
    token: str = Query(None, description="JWT Access Token for EventSource compatibility"),
    db: AsyncSession = Depends(get_db)
):
    """
    Optimized Server-Sent Events (SSE) Route.
    Streams execution logs and telemetry data points from the background worker.
    Protected by rate-limiting thresholds to maintain 100% resilience under heavy traffic spikes.
    """
    user_id = None
    
    # 1. Authenticate via token query param or Bearer header
    auth_header = request.headers.get("Authorization")
    raw_token = token
    if not raw_token and auth_header and auth_header.startswith("Bearer "):
        raw_token = auth_header.split(" ")[1]

    if raw_token:
        payload = decode_token(raw_token, is_refresh=False)
        if payload and payload.get("sub"):
            try:
                user_id = int(payload.get("sub"))
            except ValueError:
                pass

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for SSE telemetry stream"
        )

    return StreamingResponse(
        sse_event_generator(request, user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering for real-time SSE
        }
    )
