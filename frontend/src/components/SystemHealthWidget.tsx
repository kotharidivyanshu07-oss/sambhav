import React from 'react';
import type { SystemHealth } from '../types';
import { Server, Database, Clock, HardDrive, Cpu, CheckCircle2 } from 'lucide-react';

interface SystemHealthWidgetProps {
  health: SystemHealth | null;
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ health }) => {
  if (!health) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center text-xs text-gray-500 font-mono">
        Connecting to system health probe...
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Server className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Async Core Diagnostics
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="uppercase">{health.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono mb-1">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>Process Uptime</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {formatUptime(health.uptime_seconds)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono mb-1">
            <HardDrive className="h-3.5 w-3.5 text-indigo-400" />
            <span>Memory RSS</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {health.memory_usage_mb} MB
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono mb-1">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span>Event Loop Lag</span>
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">
            {health.event_loop_lag_ms} ms
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono mb-1">
            <Database className="h-3.5 w-3.5 text-purple-400" />
            <span>DB Pool Size</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {health.active_connections} active
          </div>
        </div>
      </div>
    </div>
  );
};
