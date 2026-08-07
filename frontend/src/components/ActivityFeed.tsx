import React, { useState } from 'react';
import type { ActivityLog } from '../types';
import { Search, Shield, User, Clock, Terminal } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityLog[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = activities.filter(
    a =>
      a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.user_email && a.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.details && a.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Audit Trail & Security Events
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Immutable user activity logs & security verification records
          </p>
        </div>

        <div className="relative">
          <Search className="h-3.5 w-3.5 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono w-48"
          />
        </div>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500 font-mono">
            No matching audit logs found.
          </div>
        ) : (
          filtered.map((log) => {
            const isLogin = log.action.includes('LOGIN');
            const isRegister = log.action.includes('REGISTER');

            return (
              <div
                key={log.id}
                className="flex items-start justify-between p-3 rounded-xl bg-gray-900/40 border border-gray-800/80 hover:border-gray-700/80 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    isLogin
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : isRegister
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {isLogin ? <User className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-mono">{log.action}</span>
                      {log.user_email && (
                        <span className="text-[11px] text-gray-400 font-mono">({log.user_email})</span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-xs text-gray-300 font-sans mt-0.5">{log.details}</p>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-gray-500 shrink-0">
                  <div className="flex items-center space-x-1 justify-end">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {log.ip_address && <div className="mt-0.5 text-gray-600">IP: {log.ip_address}</div>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
