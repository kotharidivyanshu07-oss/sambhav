import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class MetricResponse(BaseModel):
    id: int
    title: str
    value: str
    change_percentage: float
    trend: str
    category: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class AnalyticsDataPoint(BaseModel):
    timestamp: str
    active_users: int
    requests_per_sec: int
    avg_latency_ms: float
    error_rate: float


class SystemHealthResponse(BaseModel):
    status: str
    environment: str
    active_connections: int
    uptime_seconds: float
    memory_usage_mb: float
    event_loop_lag_ms: float
    db_status: str
