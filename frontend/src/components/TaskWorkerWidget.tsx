import React, { useState, useEffect } from 'react';
import type { AgentTask, WorkerStats } from '../types';
import { api } from '../services/api';
import { Cpu, Play, CheckCircle2, AlertTriangle, Clock, Layers, Sparkles, RefreshCw } from 'lucide-react';

interface TaskWorkerWidgetProps {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export const TaskWorkerWidget: React.FC<TaskWorkerWidgetProps> = ({ isAuthenticated, onRequireAuth }) => {
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [taskType, setTaskType] = useState<string>('DATA_ANALYSIS');
  const [priority, setPriority] = useState<number>(1);
  const [payloadText, setPayloadText] = useState<string>('{"title": "Automated Security & Performance Report"}');
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const loadWorkerData = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const [wStats, tList] = await Promise.all([
          api.get<WorkerStats>('/tasks/stats/worker'),
          api.get<AgentTask[]>('/tasks?limit=15'),
        ]);
        setStats(wStats);
        setTasks(tList);
      }
    } catch (err: any) {
      console.warn('Task worker telemetry load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
    const interval = setInterval(loadWorkerData, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleEnqueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    setSubmitting(true);
    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch (e) {
        parsedPayload = { raw: payloadText };
      }

      await api.post<AgentTask>('/tasks/enqueue', {
        task_type: taskType,
        priority: priority,
        payload: parsedPayload,
      });

      await loadWorkerData();
    } catch (err: any) {
      alert(`Task Enqueue Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-emerald-400 animate-pulse" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                Autonomous Async Worker Engine
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-sans leading-relaxed">
              Background event loop processing autonomous agent tasks independently from user network requests.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
              stats?.is_running
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{stats?.loop_status || 'HEALTHY_ASYNC'}</span>
            </span>

            <button
              onClick={loadWorkerData}
              disabled={loading}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="text-xs text-gray-400 font-mono">Active Workers</div>
            <div className="text-xl font-extrabold text-white font-mono mt-0.5">
              {stats?.active_workers || 4} Parallel
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="text-xs text-gray-400 font-mono">Queue Depth</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
              {stats?.queue_depth || 0} Pending
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="text-xs text-gray-400 font-mono">Processed Total</div>
            <div className="text-xl font-extrabold text-blue-400 font-mono mt-0.5">
              {stats?.processed_total || 0} Tasks
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="text-xs text-gray-400 font-mono">Avg Processing</div>
            <div className="text-xl font-extrabold text-purple-400 font-mono mt-0.5">
              {stats?.avg_processing_time_ms || 0} ms
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enqueue Task Form */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Enqueue Background Task
            </h3>
          </div>

          {!isAuthenticated ? (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center space-y-3">
              <p className="text-xs text-purple-300 font-mono">
                Authentication required to dispatch autonomous background agent tasks.
              </p>
              <button
                onClick={onRequireAuth}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition-colors"
              >
                Sign In / Demo
              </button>
            </div>
          ) : (
            <form onSubmit={handleEnqueue} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="DATA_ANALYSIS">DATA_ANALYSIS (Statistical Outlier Analysis)</option>
                  <option value="SECURITY_AUDIT">SECURITY_AUDIT (SAIF Vulnerability Scan)</option>
                  <option value="REPORT_GENERATION">REPORT_GENERATION (PDF Synthesizer)</option>
                  <option value="ML_INFERENCE">ML_INFERENCE (Async Model Scoring)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Execution Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value={1}>1 - Normal Priority</option>
                  <option value={2}>2 - High Priority</option>
                  <option value={3}>3 - Urgent Execution</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">JSON Payload</label>
                <textarea
                  rows={3}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{submitting ? 'Dispatching...' : 'Dispatch Autonomous Task'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Live Task Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Live Task Stream
              </h3>
            </div>
            <span className="text-xs font-mono text-gray-500">
              Auto-syncs every 3s
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {!isAuthenticated ? (
              <div className="text-center py-12 text-xs text-gray-500 font-mono">
                Sign in to view real-time task queue execution streams.
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-500 font-mono">
                No active agent tasks. Dispatch a task above to test worker processing!
              </div>
            ) : (
              tasks.map((task) => {
                const isPending = task.status === 'PENDING';
                const isProcessing = task.status === 'PROCESSING';
                const isCompleted = task.status === 'COMPLETED';
                const isFailed = task.status === 'FAILED';
                const isExpanded = expandedTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800/80 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1 border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isProcessing
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse'
                            : isFailed
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                          {isProcessing && <RefreshCw className="h-3 w-3 animate-spin" />}
                          {isFailed && <AlertTriangle className="h-3 w-3" />}
                          {isPending && <Clock className="h-3 w-3" />}
                          <span>{task.status}</span>
                        </span>

                        <span className="text-xs font-bold text-white font-mono">
                          {task.task_type}
                        </span>

                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 font-mono">
                          P{task.priority}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] font-mono text-gray-400">
                        {task.execution_time_ms > 0 && (
                          <span className="text-emerald-400 font-semibold">
                            {task.execution_time_ms} ms
                          </span>
                        )}
                        <button
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className="text-xs text-blue-400 hover:text-white font-mono underline"
                        >
                          {isExpanded ? 'Hide Payload' : 'View Payload & Result'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-800/80 space-y-2 text-xs font-mono">
                        <div>
                          <span className="text-gray-500">Payload:</span>
                          <pre className="mt-1 p-2 rounded-lg bg-gray-950 text-gray-300 text-[11px] overflow-x-auto">
                            {task.payload}
                          </pre>
                        </div>
                        {task.result && (
                          <div>
                            <span className="text-emerald-400 font-bold">Computed Worker Result:</span>
                            <pre className="mt-1 p-2 rounded-lg bg-gray-950 text-emerald-300 text-[11px] overflow-x-auto">
                              {task.result}
                            </pre>
                          </div>
                        )}
                        {task.error_message && (
                          <div>
                            <span className="text-rose-400 font-bold">Execution Exception:</span>
                            <div className="mt-1 p-2 rounded-lg bg-rose-950/40 text-rose-300 text-[11px]">
                              {task.error_message}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
