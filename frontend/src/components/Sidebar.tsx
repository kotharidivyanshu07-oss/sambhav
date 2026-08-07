import React from 'react';
import { LayoutDashboard, Activity, ActivityIcon, Users, Shield, Zap, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Main Overview', icon: LayoutDashboard, badge: null },
    { id: 'analytics', label: 'Async Performance', icon: Activity, badge: 'Live' },
    { id: 'activities', label: 'Audit Trail', icon: ActivityIcon, badge: null },
    { id: 'users', label: 'Role & User Access', icon: Users, requiresAdmin: true, badge: user?.role === 'admin' ? 'Admin' : 'Protected' },
    { id: 'security', label: '4 Pillars & Control', icon: Shield, badge: 'Secure' },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-gray-800/80 bg-gray-950/60 p-4 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div className="px-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase font-mono">
          System Control Center
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.requiresAdmin && user?.role !== 'admin';

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setActiveTab(item.id)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                    : isDisabled
                    ? 'opacity-50 cursor-not-allowed text-gray-600'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isDisabled ? (
                  <Lock className="h-3 w-3 text-gray-600" />
                ) : item.badge ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Scalability info widget at bottom */}
      <div className="p-3.5 rounded-xl bg-gradient-to-b from-gray-900/90 to-gray-950 border border-gray-800/80 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
          <Zap className="h-3.5 w-3.5" />
          <span>Throughput Architecture</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
          FastAPI async event loop paired with SQLAlchemy 2.0 connection pool & Vite bundle optimizations.
        </p>
      </div>
    </aside>
  );
};
