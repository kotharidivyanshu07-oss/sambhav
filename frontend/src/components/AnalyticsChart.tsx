import React, { useState } from 'react';
import type { AnalyticsDataPoint } from '../types';
import { Zap, RefreshCw } from 'lucide-react';

interface AnalyticsChartProps {
  data: AnalyticsDataPoint[];
  onRefresh?: () => void;
  loading?: boolean;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, onRefresh, loading }) => {
  const [hoveredPoint, setHoveredPoint] = useState<AnalyticsDataPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center text-gray-500 font-mono text-sm">
        No analytics telemetry points available.
      </div>
    );
  }

  const maxReq = Math.max(...data.map(d => d.requests_per_sec), 100);
  const chartHeight = 180;
  const chartWidth = 600;

  const pointsString = data
    .map((d, idx) => {
      const x = (idx / (data.length - 1)) * chartWidth;
      const y = chartHeight - (d.requests_per_sec / maxReq) * (chartHeight - 20);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              High-Throughput Event Loop Performance
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time API requests/sec & event loop latency profiling
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
          title="Refresh metrics"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto py-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48 overflow-visible"
        >
          <defs>
            <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1={chartHeight - 1} x2={chartWidth} y2={chartHeight - 1} stroke="rgba(255,255,255,0.1)" />

          {/* Area Fill */}
          <polygon
            points={`0,${chartHeight} ${pointsString} ${chartWidth},${chartHeight}`}
            fill="url(#reqGradient)"
          />

          {/* Line Path */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Data Nodes */}
          {data.map((d, idx) => {
            const x = (idx / (data.length - 1)) * chartWidth;
            const y = chartHeight - (d.requests_per_sec / maxReq) * (chartHeight - 20);
            const isHovered = hoveredPoint?.timestamp === d.timestamp;

            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={isHovered ? "6" : "3.5"}
                className="fill-blue-500 stroke-gray-950 stroke-2 cursor-pointer transition-all hover:scale-125"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip display */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 glass-panel bg-gray-900/90 border border-blue-500/30 rounded-xl p-3 text-xs font-mono shadow-xl space-y-1">
            <div className="text-gray-400 border-b border-gray-800 pb-1 font-bold">
              Time: {hoveredPoint.timestamp}
            </div>
            <div className="text-blue-400">
              Throughput: <span className="text-white font-bold">{hoveredPoint.requests_per_sec} req/s</span>
            </div>
            <div className="text-emerald-400">
              Avg Latency: <span className="text-white font-bold">{hoveredPoint.avg_latency_ms} ms</span>
            </div>
            <div className="text-purple-400">
              Active Users: <span className="text-white font-bold">{hoveredPoint.active_users}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono mt-2 pt-2 border-t border-gray-800/60">
        <span>Timeline Start ({data[0]?.timestamp || '00:00'})</span>
        <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          FastAPI Non-Blocking Event Loop
        </span>
        <span>Latest ({data[data.length - 1]?.timestamp || 'Now'})</span>
      </div>
    </div>
  );
};
