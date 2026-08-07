export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'analyst' | 'admin';
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface Metric {
  id: number;
  title: string;
  value: string;
  change_percentage: number;
  trend: 'up' | 'down' | 'neutral';
  category: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user_email?: string;
  user_name?: string;
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface AnalyticsDataPoint {
  timestamp: string;
  active_users: number;
  requests_per_sec: number;
  avg_latency_ms: number;
  error_rate: number;
}

export interface SystemHealth {
  status: string;
  environment: string;
  active_connections: number;
  uptime_seconds: number;
  memory_usage_mb: number;
  event_loop_lag_ms: number;
  db_status: string;
}

export interface AgentTask {
  id: number;
  task_type: string;
  payload: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  priority: number;
  result?: string;
  error_message?: string;
  execution_time_ms: number;
  user_id: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface WorkerStats {
  is_running: boolean;
  active_workers: number;
  queue_depth: number;
  processed_total: number;
  failed_total: number;
  avg_processing_time_ms: number;
  loop_status: string;
}
