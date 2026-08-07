import { Target, Play, Pause, RefreshCw, ShieldCheck, Zap, Layers } from 'lucide-react';

interface ActiveGoalCardProps {
  goalTitle?: string;
  status?: string;
  progressPercentage?: number;
  activeWorkerCount?: number;
  currentMilestone?: string;
  onPauseToggle?: () => void;
  onForceRun?: () => void;
  isPaused?: boolean;
}

export const ActiveGoalCard: React.FC<ActiveGoalCardProps> = ({
  goalTitle = "Synthesize Real-Time AI Marketing Strategy & Streaming Telemetry Mesh",
  status = "OPERATIONAL_RUNNING",
  progressPercentage = 84,
  activeWorkerCount = 4,
  currentMilestone = "[SYNTHESIZING_CONTENT]",
  onPauseToggle,
  onForceRun,
  isPaused = false,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
      {/* Subtle top ambient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Info Column */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Target className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider text-blue-400 uppercase">
                Active Autonomous Goal
              </span>
              <h2 className="text-base font-extrabold text-white font-sans tracking-tight">
                {goalTitle}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-400">
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300">
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>Milestone: <strong className="text-purple-300">{currentMilestone}</strong></span>
            </span>

            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Workers: <strong className="text-white">{activeWorkerCount} Active</strong></span>
            </span>

            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Isolation: <strong className="text-blue-300">JWT Tenant Protected</strong></span>
            </span>
          </div>
        </div>

        {/* Right Status & Control Column (Operation Status Asset) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t lg:border-t-0 lg:border-l border-gray-800/80 pt-4 lg:pt-0 lg:pl-6 shrink-0">
          {/* Operation Status Asset Badge & Progress */}
          <div className="space-y-2 min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`}></span>
                <span className="uppercase">{isPaused ? 'PAUSED' : status}</span>
              </span>
              <span className="text-white font-extrabold">{progressPercentage}%</span>
            </div>

            {/* Custom Styled Progress Track */}
            <div className="w-full h-2.5 rounded-full bg-gray-900 border border-gray-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500 shadow-sm shadow-emerald-500/30"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onPauseToggle}
              className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors ${
                isPaused
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30'
              }`}
              title={isPaused ? 'Resume Goal Execution' : 'Pause Goal Execution'}
            >
              {isPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={onForceRun}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-lg shadow-blue-500/20"
              title="Force Execute Cycle Now"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline font-mono">Sync</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
