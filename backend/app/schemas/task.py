import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    task_type: str = Field(..., example="DATA_ANALYSIS", description="Task identifier (DATA_ANALYSIS, SECURITY_AUDIT, REPORT_GENERATION, ML_INFERENCE)")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Task execution parameters")
    priority: int = Field(1, ge=1, le=3, description="1=Normal, 2=High, 3=Urgent")


class TaskResponse(BaseModel):
    id: int
    task_type: str
    payload: str
    status: str
    priority: int
    result: Optional[str] = None
    error_message: Optional[str] = None
    execution_time_ms: float
    user_id: int
    created_at: datetime.datetime
    started_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)


class WorkerStats(BaseModel):
    is_running: bool
    active_workers: int
    queue_depth: int
    processed_total: int
    failed_total: int
    avg_processing_time_ms: float
    loop_status: str
