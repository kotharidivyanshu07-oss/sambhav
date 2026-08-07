import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Users, ShieldAlert, Cpu } from 'lucide-react';
import type { Metric } from '../types';

interface MetricCardProps {
  metric: Metric;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const getIcon = () => {
    switch (metric.category) {
      case 'user':
        return <Users className="h-5 w-5 text-blue-400" />;
      case 'system':
        return <Cpu className="h-5 w-5 text-indigo-400" />;
      case 'security':
        return <ShieldAlert className="h-5 w-5 text-rose-400" />;
      default:
        return <Activity className="h-5 w-5 text-purple-400" />;
    }
  };

  const isPositive = metric.change_percentage >= 0;
  const isNeutral = metric.change_percentage === 0;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden group">
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase font-mono">
          {metric.title}
        </span>
        <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
          {getIcon()}
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
          {metric.value}
        </div>
        <div className={`flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full font-mono ${
          isNeutral
            ? 'bg-gray-800 text-gray-400'
            : isPositive
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {isNeutral ? (
            <Minus className="h-3 w-3" />
          ) : isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{Math.abs(metric.change_percentage)}%</span>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-gray-500 flex items-center justify-between font-mono">
        <span>Category: {metric.category}</span>
        <span className="text-emerald-400/80">Real-time sync</span>
      </div>
    </div>
  );
};
