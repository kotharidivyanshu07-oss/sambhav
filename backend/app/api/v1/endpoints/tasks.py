import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.core.middleware import limiter
from app.core.worker import task_worker
from app.models.user import User, ActivityLog
from app.models.task import AgentTask
from app.schemas.task import TaskCreate, TaskResponse, WorkerStats

router = APIRouter(prefix="/tasks", tags=["Autonomous Tasks Worker"])


@router.post("/enqueue", response_model=TaskResponse, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def enqueue_task(
    request: Request,
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Enqueue an autonomous agent task into the non-blocking async queue.
    Executes in background without locking API request threads.
    """
    payload_str = json.dumps(task_in.payload) if task_in.payload else "{}"

    task = AgentTask(
        task_type=task_in.task_type.upper(),
        payload=payload_str,
        status="PENDING",
        priority=task_in.priority,
        user_id=current_user.id
    )
    db.add(task)
    await db.flush()  # get task.id

    # Log activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="TASK_ENQUEUED",
        details=f"Enqueued {task.task_type} (Priority: {task.priority})",
        ip_address=request.client.host if request.client else "unknown"
    )
    db.add(activity)
    await db.commit()
    await db.refresh(task)

    # Push task ID directly to the async worker queue for instant non-blocking pickup
    await task_worker.enqueue_task_id(task.id)

    return task


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: str = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve list of tasks with pagination and tenant isolation."""
    stmt = select(AgentTask)
    
    # Filter by user unless admin
    if current_user.role != "admin" and not current_user.is_superuser:
        stmt = stmt.where(AgentTask.user_id == current_user.id)

    if status_filter:
        stmt = stmt.where(AgentTask.status == status_filter.upper())

    stmt = stmt.order_by(AgentTask.id.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    tasks = result.scalars().all()
    return tasks


@router.get("/stats/worker", response_model=WorkerStats)
async def get_worker_telemetry(
    current_user: User = Depends(get_current_user)
):
    """Retrieve real-time metrics of the asynchronous worker engine."""
    stats = task_worker.get_stats()
    return WorkerStats(**stats)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task_details(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch task status and computed background execution result."""
    stmt = select(AgentTask).where(AgentTask.id == task_id)
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Enforce tenant isolation
    if task.user_id != current_user.id and current_user.role != "admin" and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to target task"
        )

    return task
