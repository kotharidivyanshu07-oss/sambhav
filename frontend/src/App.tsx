import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MetricCard } from './components/MetricCard';
import { AnalyticsChart } from './components/AnalyticsChart';
import { ActivityFeed } from './components/ActivityFeed';
import { SystemHealthWidget } from './components/SystemHealthWidget';
import { UsersTable } from './components/UsersTable';
import { AuthModal } from './components/AuthModal';
import { SecurityPillarsView } from './components/SecurityPillarsView';
import { TaskWorkerWidget } from './components/TaskWorkerWidget';
import { api } from './services/api';
import type { Metric, ActivityLog, AnalyticsDataPoint, SystemHealth, User } from './types';
import { Server, AlertCircle } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDataPoint[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setApiError(null);

    // Always fetch unauthenticated system health probe
    try {
      const hData = await api.get<SystemHealth>('/dashboard/health');
      setHealth(hData);
    } catch (err: any) {
      setApiError('Backend server unreachable at http://localhost:8000. Start backend with `./backend/venv/bin/uvicorn app.main:app --reload`.');
    }

    if (user) {
      try {
        const [mRes, aRes, actRes] = await Promise.all([
          api.get<Metric[]>('/dashboard/metrics'),
          api.get<AnalyticsDataPoint[]>('/dashboard/analytics?hours=24'),
          api.get<ActivityLog[]>('/dashboard/activities?limit=20'),
        ]);
        setMetrics(mRes);
        setAnalytics(aRes);
        setActivities(actRes);

        if (user.role === 'admin') {
          const uRes = await api.get<User[]>('/users');
          setUsersList(uRes);
        }
      } catch (err: any) {
        console.warn('Failed to load authenticated telemetry:', err);
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

  const handleUpdateUserInState = (updatedUser: User) => {
    setUsersList(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
  };

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
          {/* Top Banner Info */}
          {!user && (
            <div className="glass-panel bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <Server className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">Full-Stack Core Environment Provisioned</h4>
                  <p className="text-xs text-gray-300 font-sans mt-0.5">
                    FastAPI app running in <code className="text-blue-300 font-mono bg-blue-950/60 px-1 py-0.5 rounded">/backend</code> & React + Vite dashboard in <code className="text-blue-300 font-mono bg-blue-950/60 px-1 py-0.5 rounded">/frontend</code>.
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

          {/* Tab 1: Dashboard Overview */}
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

              <TaskWorkerWidget isAuthenticated={!!user} onRequireAuth={() => setIsAuthOpen(true)} />

              <SystemHealthWidget health={health} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AnalyticsChart data={analytics} onRefresh={loadDashboardData} loading={loading} />
                </div>
                <div>
                  <ActivityFeed activities={activities} />
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Async Agent Tasks */}
          {activeTab === 'tasks' && (
            <TaskWorkerWidget isAuthenticated={!!user} onRequireAuth={() => setIsAuthOpen(true)} />
          )}

          {/* Tab 3: Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <AnalyticsChart data={analytics} onRefresh={loadDashboardData} loading={loading} />
              <SystemHealthWidget health={health} />
            </div>
          )}

          {/* Tab 4: Activities */}
          {activeTab === 'activities' && (
            <ActivityFeed activities={activities} />
          )}

          {/* Tab 5: Users Management (Admin) */}
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
