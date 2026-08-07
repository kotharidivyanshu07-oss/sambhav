import asyncio
import json
import logging
import time
import datetime
from typing import Optional, Dict, Any
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.models.task import AgentTask

logger = logging.getLogger("async_task_worker")


class AsyncTaskWorkerEngine:
    """
    Autonomous Asynchronous Background Engine.
    Executes background agent tasks independently from user HTTP request threads.
    Guarantees event loop responsiveness and zero primary API network blocking.
    """
    def __init__(self, concurrency: int = 3, poll_interval: float = 1.0):
        self.concurrency = concurrency
        self.poll_interval = poll_interval
        self.queue: asyncio.Queue[int] = asyncio.Queue()
        self.workers: list[asyncio.Task] = []
        self.is_running = False
        
        # Performance Telemetry Counters
        self.processed_total = 0
        self.failed_total = 0
        self.total_exec_time_ms = 0.0

    async def start(self):
        """Start worker loop tasks on application lifespan startup."""
        if self.is_running:
            return
        self.is_running = True
        logger.info(f"Starting Async Task Worker Engine with concurrency={self.concurrency}")

        # Spawn concurrent consumer worker loops
        for worker_id in range(self.concurrency):
            t = asyncio.create_task(self._worker_loop(worker_id))
            self.workers.append(t)

        # Spawn DB polling manager for pending tasks
        self.poller_task = asyncio.create_task(self._poll_pending_tasks())

    async def stop(self):
        """Gracefully stop background workers on application shutdown."""
        if not self.is_running:
            return
        self.is_running = False
        logger.info("Stopping Async Task Worker Engine...")

        if hasattr(self, 'poller_task'):
            self.poller_task.cancel()

        for t in self.workers:
            t.cancel()
            
        await asyncio.gather(*self.workers, return_exceptions=True)
        self.workers.clear()

    async def enqueue_task_id(self, task_id: int):
        """Put a newly created task ID directly onto the in-memory async queue for instant pick up."""
        await self.queue.put(task_id)

    async def _poll_pending_tasks(self):
        """Fallback DB poller to recover any unprocessed PENDING tasks on crash/restart."""
        while self.is_running:
            try:
                await asyncio.sleep(self.poll_interval)
                async with async_session_factory() as session:
                    stmt = (
                        select(AgentTask.id)
                        .where(AgentTask.status == "PENDING")
                        .order_by(AgentTask.priority.desc(), AgentTask.created_at.asc())
                        .limit(20)
                    )
                    res = await session.execute(stmt)
                    pending_ids = res.scalars().all()

                    for t_id in pending_ids:
                        if self.queue.qsize() < 100:
                            await self.queue.put(t_id)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in task poller loop: {e}")

    async def _worker_loop(self, worker_id: int):
        """Individual worker consumer loop handling tasks concurrently."""
        while self.is_running:
            try:
                task_id = await self.queue.get()
                await self._process_single_task(task_id, worker_id)
                self.queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker {worker_id} exception: {e}")

    async def _process_single_task(self, task_id: int, worker_id: int):
        """Atomic status update and execution of autonomous agent task."""
        t0 = time.perf_counter()
        now_utc = datetime.datetime.now(datetime.timezone.utc)

        async with async_session_factory() as session:
            # 1. Claim task atomically
            stmt = (
                select(AgentTask)
                .where(AgentTask.id == task_id, AgentTask.status == "PENDING")
                .with_for_update(skip_locked=True)
            )
            res = await session.execute(stmt)
            task = res.scalar_one_or_none()

            if not task:
                return  # Task already picked up or completed

            task.status = "PROCESSING"
            task.started_at = now_utc
            await session.commit()

            # Extract task details
            task_type = task.task_type
            try:
                payload = json.loads(task.payload) if task.payload else {}
            except Exception:
                payload = {}

        # 2. Execute simulated workload asynchronously without blocking loop
        try:
            result_data = await self._execute_agent_logic(task_type, payload)
            t1 = time.perf_counter()
            exec_ms = (t1 - t0) * 1000.0

            # 3. Update DB with COMPLETED status
            async with async_session_factory() as session:
                stmt = select(AgentTask).where(AgentTask.id == task_id)
                res = await session.execute(stmt)
                t_obj = res.scalar_one()
                t_obj.status = "COMPLETED"
                t_obj.result = json.dumps(result_data)
                t_obj.execution_time_ms = round(exec_ms, 2)
                t_obj.completed_at = datetime.datetime.now(datetime.timezone.utc)
                await session.commit()

            self.processed_total += 1
            self.total_exec_time_ms += exec_ms

        except Exception as err:
            t1 = time.perf_counter()
            exec_ms = (t1 - t0) * 1000.0

            async with async_session_factory() as session:
                stmt = select(AgentTask).where(AgentTask.id == task_id)
                res = await session.execute(stmt)
                t_obj = res.scalar_one_or_none()
                if t_obj:
                    t_obj.status = "FAILED"
                    t_obj.error_message = str(err)
                    t_obj.execution_time_ms = round(exec_ms, 2)
                    t_obj.completed_at = datetime.datetime.now(datetime.timezone.utc)
                    await session.commit()

            self.failed_total += 1

    async def _execute_agent_logic(self, task_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Core autonomous worker task handlers."""
        # Non-blocking async execution
        if task_type == "DATA_ANALYSIS":
            await asyncio.sleep(1.2)  # simulate heavy data aggregation
            return {
                "summary": "Completed statistical analysis across 15,000 data rows",
                "variance": 0.042,
                "outliers_found": 3,
                "recommendation": "System throughput optimal"
            }
        elif task_type == "SECURITY_AUDIT":
            await asyncio.sleep(0.8)  # simulate security scan
            return {
                "scan_scope": "CORS, JWT Headers, Rate Limits",
                "risk_score": 0.0,
                "vulnerabilities": 0,
                "status": "COMPLIANT_SAIF"
            }
        elif task_type == "REPORT_GENERATION":
            await asyncio.sleep(1.5)  # simulate pdf/report synthesis
            return {
                "report_title": payload.get("title", "Autonomous System Audit"),
                "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "download_url": "/reports/generated_audit.pdf"
            }
        elif task_type == "ML_INFERENCE":
            await asyncio.sleep(1.0)
            return {
                "model_version": "v2.4-async",
                "confidence": 0.984,
                "prediction": "STABLE_LOAD"
            }
        else:
            await asyncio.sleep(0.5)
            return {
                "status": "PROCESSED",
                "custom_payload_keys": list(payload.keys())
            }

    def get_stats(self) -> Dict[str, Any]:
        """Return metrics for real-time dashboard plotting."""
        avg_time = (
            self.total_exec_time_ms / self.processed_total
            if self.processed_total > 0
            else 0.0
        )
        return {
            "is_running": self.is_running,
            "active_workers": self.concurrency,
            "queue_depth": self.queue.qsize(),
            "processed_total": self.processed_total,
            "failed_total": self.failed_total,
            "avg_processing_time_ms": round(avg_time, 2),
            "loop_status": "healthy_async" if self.is_running else "stopped"
        }


# Singleton instance of the Worker Engine
task_worker = AsyncTaskWorkerEngine(concurrency=4, poll_interval=1.0)
