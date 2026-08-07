import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MetricCard } from './components/MetricCard';
import { ActiveGoalCard } from './components/ActiveGoalCard';
import { VirtualizedConsoleLog } from './components/VirtualizedConsoleLog';
import type { ConsoleLogEntry } from './components/VirtualizedConsoleLog';
import { FinalizedContentGrid } from './components/FinalizedContentGrid';
import type { FinalizedContentItem } from './components/FinalizedContentGrid';
import { AnalyticsChart } from './components/AnalyticsChart';
import { ActivityFeed } from './components/ActivityFeed';
import { SystemHealthWidget } from './components/SystemHealthWidget';
import { UsersTable } from './components/UsersTable';
import { AuthModal } from './components/AuthModal';
import { SecurityPillarsView } from './components/SecurityPillarsView';
import { TaskWorkerWidget } from './components/TaskWorkerWidget';
import { OperationalControlsCard } from './components/OperationalControlsCard';
import type { OperationalControlsData } from './components/OperationalControlsCard';
import { api } from './services/api';
import type { Metric, ActivityLog, AnalyticsDataPoint, SystemHealth, User, AgentTask } from './types';
import { Server, AlertCircle } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isGoalPaused, setIsGoalPaused] = useState<boolean>(false);

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDataPoint[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogEntry[]>([]);
  const [operationalControls, setOperationalControls] = useState<OperationalControlsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize initial telemetry console logs
  useEffect(() => {
    const initialLogs: ConsoleLogEntry[] = [
      { id: 1, timestamp: new Date().toLocaleTimeString(), level: 'info', source: 'FASTAPI_CORE', message: 'FastAPI async engine initialized on port 8000' },
      { id: 2, timestamp: new Date().toLocaleTimeString(), level: 'milestone', source: 'WORKER_LOOP', message: 'AsyncTaskWorkerEngine started with 4 parallel workers' },
      { id: 3, timestamp: new Date().toLocaleTimeString(), level: 'info', source: 'POSTGRES_POOL', message: 'AsyncPG connection pool pre-pinged (size=20, max_overflow=10)' },
      { id: 4, timestamp: new Date().toLocaleTimeString(), level: 'milestone', source: 'BREETH_AI', message: '[INITIALIZING_AGENT] Autonomous Trend Agent ready' },
    ];
    setConsoleLogs(initialLogs);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const hData = await api.get<SystemHealth>('/dashboard/health');
      setHealth(hData);
    } catch (err: any) {
      setApiError('Backend server unreachable at http://localhost:8000. Start backend with `./backend/venv/bin/uvicorn app.main:app --reload`.');
    }

    if (user) {
      try {
        const [mRes, aRes, actRes, tRes, ctrlRes] = await Promise.all([
          api.get<Metric[]>('/dashboard/metrics'),
          api.get<AnalyticsDataPoint[]>('/dashboard/analytics?hours=24'),
          api.get<ActivityLog[]>('/dashboard/activities?limit=30'),
          api.get<AgentTask[]>('/tasks?limit=10'),
          api.get<OperationalControlsData>('/dashboard/operational-controls').catch(() => null),
        ]);
        setMetrics(mRes);
        setAnalytics(aRes);
        setActivities(actRes);
        setTasks(tRes);
        if (ctrlRes) setOperationalControls(ctrlRes);

        // Convert activity logs to console log entries
        const newLogs: ConsoleLogEntry[] = actRes.map(act => ({
          id: act.id,
          timestamp: new Date(act.created_at).toLocaleTimeString(),
          level: act.action.includes('MILESTONE') ? 'milestone' : act.action.includes('ERROR') ? 'error' : 'info',
          source: act.action.includes('AGENT') ? 'BREETH_AI' : 'AUTH_SERVICE',
          message: `${act.action}: ${act.details || ''}`
        }));
        setConsoleLogs(prev => {
          const combined = [...prev, ...newLogs];
          // Deduplicate by ID
          const seen = new Set();
          return combined.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          }).slice(-5000); // Ring buffer 5,000 entries
        });

        if (user.role === 'admin') {
          const uRes = await api.get<User[]>('/users');
          setUsersList(uRes);
        }
      } catch (err: any) {
        console.warn('Telemetry load warning:', err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      api.get<SystemHealth>('/dashboard/health')
        .then(h => setHealth(h))
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Connect Optimized Server-Sent Events (SSE) Stream when authenticated
  useEffect(() => {
    if (!user) return;

    const sse = api.createSseEventSource('/stream/telemetry');
    if (!sse) return;

    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'log_entry' && payload.log) {
          const newEntry: ConsoleLogEntry = payload.log;
          setConsoleLogs(prev => {
            if (prev.some(l => l.id === newEntry.id)) return prev;
            return [...prev, newEntry].slice(-5000);
          });
        }
      } catch (err) {
        // ignore non-json SSE frames
      }
    };

    sse.onerror = (err) => {
      console.warn('SSE stream notice, gracefully falling back to background polling:', err);
      sse.close();
    };

    return () => {
      sse.close();
    };
  }, [user]);

  const handleTriggerKillSwitch = async () => {
    try {
      const res = await api.post<OperationalControlsData>('/dashboard/kill-switch');
      setOperationalControls(res);
      loadDashboardData();
    } catch (err: any) {
      console.warn('Kill switch action warning:', err);
    }
  };

  const handleToggleHumanInLoop = async () => {
    try {
      const res = await api.post<OperationalControlsData>('/dashboard/toggle-human-in-loop');
      setOperationalControls(res);
    } catch (err: any) {
      console.warn('Toggle human-in-loop warning:', err);
    }
  };

  // Handler to simulate rapid high-volume log bursts (5,000 items)
  const handleSimulateBurst = useCallback((count: number) => {
    const burstItems: ConsoleLogEntry[] = [];
    const now = new Date().toLocaleTimeString();
    const levels: ('info' | 'milestone' | 'warn' | 'error')[] = ['info', 'milestone', 'info', 'warn'];
    const sources = ['BREETH_AI', 'WORKER_LOOP', 'POSTGRES_POOL', 'JWT_AUTH'];

    for (let i = 0; i < count; i++) {
      const lvl = levels[i % levels.length];
      const src = sources[i % sources.length];
      burstItems.push({
        id: `burst_${Date.now()}_${i}`,
        timestamp: now,
        level: lvl,
        source: src,
        message: `Rapid Telemetry Event #${i + 1}: Executing non-blocking async stream iteration`
      });
    }

    setConsoleLogs(prev => [...prev, ...burstItems].slice(-10000));
  }, []);

  const handleClearLogs = () => {
    setConsoleLogs([]);
  };

  const handleUpdateUserInState = (updatedUser: User) => {
    setUsersList(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
  };

  // Convert tasks into finalized content items
  const finalizedContentItems: FinalizedContentItem[] = tasks
    .filter(t => t.status === 'COMPLETED' && t.result)
    .map(t => {
      let parsedRes: any = {};
      try {
        parsedRes = JSON.parse(t.result!);
      } catch (e) {}

      const synth = parsedRes.synthesized_content || {};
      return {
        id: t.id,
        title: `${t.task_type} Strategy #${t.id}`,
        category: parsedRes.target_industry || 'Technology & AI',
        virality_score: 95.8,
        campaign_hook: synth.campaign_hook || 'Leverage Breeth AI Autonomous Systems for 10x throughput',
        target_channels: synth.channels || synth.target_channels || ['LinkedIn', 'Twitter/X', 'ProductHunt'],
        suggested_headlines: synth.suggested_headlines || [
          'Build Real-Time Asynchronous AI Meshes Without Network Locks',
          'From Zero to High Throughput: FastAPI + React + PostgreSQL Architecture'
        ],
        action_plan: synth.action_plan || [
          'Deploy FastAPI async background worker engine',
          'Stream live thinking milestones into PostgreSQL database'
        ],
        created_at: new Date(t.created_at).toLocaleTimeString()
      };
    });

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      {apiError && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 text-xs font-mono text-amber-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button onClick={loadDashboardData} className="underline text-white font-bold ml-4">
            Retry Connection
          </button>
        </div>
      )}

      <div className="flex-1 flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
          {/* Top Banner Info for Unauthenticated Users */}
          {!user && (
            <div className="glass-panel bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <Server className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">Full-Stack Core Environment Provisioned</h4>
                  <p className="text-xs text-gray-300 font-sans mt-0.5">
                    FastAPI app in <code className="text-blue-300 font-mono bg-blue-950/60 px-1 py-0.5 rounded">/backend</code> & React + Vite dashboard in <code className="text-blue-300 font-mono bg-blue-950/60 px-1 py-0.5 rounded">/frontend</code>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold shrink-0 transition-colors shadow-lg shadow-blue-500/20"
              >
                Sign In / One-Click Demo
              </button>
            </div>
          )}

          {/* 1. Active Goal Card with Operation Status Asset */}
          <ActiveGoalCard
            isPaused={isGoalPaused}
            onPauseToggle={() => setIsGoalPaused(!isGoalPaused)}
            onForceRun={loadDashboardData}
          />

          {/* Operational Controls Component Card */}
          <OperationalControlsCard
            data={operationalControls}
            onTriggerKillSwitch={handleTriggerKillSwitch}
            onToggleHumanInLoop={handleToggleHumanInLoop}
            loading={loading}
          />

          {/* Tab 1: Main Overview Dashboard */}
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {metrics.length > 0
                  ? metrics.map(m => <MetricCard key={m.id} metric={m} />)
                  : [
                      { id: 1, title: 'Active Users', value: user ? '1,248' : 'Sign in to sync', change_percentage: 12.4, trend: 'up', category: 'user', created_at: '' },
                      { id: 2, title: 'API Throughput', value: '4,820 req/s', change_percentage: 8.7, trend: 'up', category: 'system', created_at: '' },
                      { id: 3, title: 'Avg Latency', value: '19.4 ms', change_percentage: -12.5, trend: 'down', category: 'system', created_at: '' },
                      { id: 4, title: 'System Health', value: '99.99%', change_percentage: 0.01, trend: 'up', category: 'system', created_at: '' }
                    ].map(m => <MetricCard key={m.id} metric={m as any} />)
                }
              </div>

              {/* 3. Virtualized Console Log Component */}
              <VirtualizedConsoleLog
                logs={consoleLogs}
                onClearLogs={handleClearLogs}
                onSimulateBurst={handleSimulateBurst}
              />

              {/* 4. Column Grid Displaying Agent's Finalized Content */}
              <FinalizedContentGrid items={finalizedContentItems} />

              <TaskWorkerWidget isAuthenticated={!!user} onRequireAuth={() => setIsAuthOpen(true)} />
            </>
          )}

          {/* Tab 2: Async Agent Workers */}
          {activeTab === 'tasks' && (
            <TaskWorkerWidget isAuthenticated={!!user} onRequireAuth={() => setIsAuthOpen(true)} />
          )}

          {/* Tab 3: Performance Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <AnalyticsChart data={analytics} onRefresh={loadDashboardData} loading={loading} />
              <SystemHealthWidget health={health} />
            </div>
          )}

          {/* Tab 4: Audit Trail */}
          {activeTab === 'activities' && (
            <ActivityFeed activities={activities} />
          )}

          {/* Tab 5: Users Management */}
          {activeTab === 'users' && (
            user?.role === 'admin' ? (
              <UsersTable users={usersList} onUpdateUser={handleUpdateUserInState} />
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center space-y-3 font-mono">
                <div className="text-amber-400 font-bold text-sm">Protected Endpoint (RBAC Admin Required)</div>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Sign in using the pre-seeded admin account <code className="text-purple-300">admin@example.com</code> to manage roles and user privileges.
                </p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Sign In As Admin
                </button>
              </div>
            )
          )}

          {/* Tab 6: Security Pillars */}
          {activeTab === 'security' && (
            <SecurityPillarsView />
          )}
        </main>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

export default App;
