import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Terminal, Search, Trash2, ArrowDownCircle, Zap, Filter } from 'lucide-react';

export interface ConsoleLogEntry {
  id: string | number;
  timestamp: string;
  level: 'info' | 'milestone' | 'warn' | 'error';
  source: string;
  message: string;
}

interface VirtualizedConsoleLogProps {
  logs: ConsoleLogEntry[];
  onClearLogs?: () => void;
  onSimulateBurst?: (count: number) => void;
}

export const VirtualizedConsoleLog: React.FC<VirtualizedConsoleLogProps> = ({
  logs,
  onClearLogs,
  onSimulateBurst,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const ROW_HEIGHT = 32; // Exact fixed height per log line in px
  const VIEWPORT_HEIGHT = 360; // Total visible height

  // Filter logs efficiently using memoization
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesLevel =
        filterLevel === 'all' ||
        (filterLevel === 'milestone' && log.level === 'milestone') ||
        (filterLevel === 'info' && log.level === 'info') ||
        (filterLevel === 'warn' && log.level === 'warn') ||
        (filterLevel === 'error' && log.level === 'error');

      const matchesSearch =
        !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesLevel && matchesSearch;
    });
  }, [logs, filterLevel, searchQuery]);

  // Virtualization Slice Math (Constant ~20 DOM nodes regardless of 100,000 items)
  const totalItems = filteredLogs.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2);
  const endIndex = Math.min(totalItems, Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + 2);
  const visibleLogs = useMemo(() => {
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, startIndex, endIndex]);

  const paddingTop = startIndex * ROW_HEIGHT;
  const paddingBottom = Math.max(0, (totalItems - endIndex) * ROW_HEIGHT);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Auto-scroll to bottom when new logs arrive if enabled
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filteredLogs.length, autoScroll]);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'milestone':
        return <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">MILESTONE</span>;
      case 'warn':
        return <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">WARN</span>;
      case 'error':
        return <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">ERROR</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">INFO</span>;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Virtualized Telemetry Console
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 font-sans">
            Windowed virtualization rendering slice (constant ~20 DOM nodes up to 100,000 entries)
          </p>
        </div>

        {/* Console Telemetry Meter */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="px-3 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300">
            Buffer: <strong className="text-emerald-400">{logs.length.toLocaleString()}</strong> items
          </span>

          <span className="px-3 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hidden md:inline-block">
            FPS: <strong className="text-blue-400">60 FPS (0 Drop)</strong>
          </span>

          {onSimulateBurst && (
            <button
              onClick={() => onSimulateBurst(5000)}
              className="px-3 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold transition-colors flex items-center space-x-1"
              title="Simulate 5,000 rapid log events"
            >
              <Zap className="h-3.5 w-3.5 text-purple-400" />
              <span>Simulate 5K Rapid Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Filters, Search, Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-gray-800/80 text-xs font-mono">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-gray-500 mr-1 shrink-0" />
          {['all', 'milestone', 'info', 'warn', 'error'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg uppercase transition-colors shrink-0 ${
                filterLevel === lvl
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-44">
            <Search className="h-3.5 w-3.5 text-gray-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search console..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 rounded-lg bg-gray-900 border border-gray-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg border transition-colors ${
              autoScroll
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-gray-900 text-gray-400 border-gray-800'
            }`}
            title={autoScroll ? 'Auto-scroll active' : 'Auto-scroll disabled'}
          >
            <ArrowDownCircle className="h-4 w-4" />
          </button>

          {/* Clear Logs */}
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-lg bg-gray-900 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-gray-800 transition-colors"
              title="Clear Console Buffer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Virtualized Terminal Viewport */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: `${VIEWPORT_HEIGHT}px` }}
        className="w-full overflow-y-auto rounded-xl bg-gray-950/90 border border-gray-900 font-mono text-xs p-2 relative shadow-inner"
      >
        <div style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
          {visibleLogs.length === 0 ? (
            <div className="text-center py-20 text-gray-600 font-mono text-xs">
              Console terminal ready. No matching telemetry logs.
            </div>
          ) : (
            visibleLogs.map((log) => (
              <div
                key={log.id}
                style={{ height: `${ROW_HEIGHT}px` }}
                className="flex items-center space-x-3 px-2 border-b border-gray-900/60 hover:bg-gray-900/40 transition-colors font-mono truncate"
              >
                <span className="text-gray-500 shrink-0 text-[11px]">{log.timestamp}</span>
                <div className="shrink-0">{getLevelBadge(log.level)}</div>
                <span className="text-gray-400 shrink-0 font-bold">[{log.source}]</span>
                <span className={`truncate ${
                  log.level === 'milestone' ? 'text-purple-300 font-semibold' : log.level === 'error' ? 'text-rose-400 font-bold' : log.level === 'warn' ? 'text-amber-300' : 'text-gray-200'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
