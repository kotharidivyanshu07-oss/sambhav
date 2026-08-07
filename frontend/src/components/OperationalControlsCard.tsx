import React, { useState } from 'react';
import { AlertOctagon, DollarSign, UserCheck, ShieldAlert, Cpu, Power } from 'lucide-react';

export interface OperationalControlsData {
  worker_running: boolean;
  human_in_loop_required: boolean;
  current_spend_usd: number;
  daily_budget_limit_usd: number;
  safety_margin_percentage: number;
  total_tokens_used: number;
  safety_status: string;
}

interface OperationalControlsCardProps {
  data?: OperationalControlsData | null;
  onTriggerKillSwitch?: () => void;
  onToggleHumanInLoop?: () => void;
  loading?: boolean;
}

export const OperationalControlsCard: React.FC<OperationalControlsCardProps> = ({
  data,
  onTriggerKillSwitch,
  onToggleHumanInLoop,
  loading = false,
}) => {
  const [isConfirmingKill, setIsConfirmingKill] = useState<boolean>(false);

  const controls = data || {
    worker_running: true,
    human_in_loop_required: true,
    current_spend_usd: 4.28,
    daily_budget_limit_usd: 25.00,
    safety_margin_percentage: 82.8,
    total_tokens_used: 142500,
    safety_status: "SAFE_MARGIN"
  };

  const handleKillClick = () => {
    if (!isConfirmingKill && controls.worker_running) {
      setIsConfirmingKill(true);
      setTimeout(() => setIsConfirmingKill(false), 4000); // auto reset confirmation after 4s
      return;
    }

    setIsConfirmingKill(false);
    if (onTriggerKillSwitch) {
      onTriggerKillSwitch();
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden space-y-6">
      {/* Background Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
        !controls.worker_running
          ? 'bg-rose-500'
          : controls.safety_margin_percentage < 20.0
          ? 'bg-amber-500'
          : 'bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500'
      }`}></div>

      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl border ${
            !controls.worker_running
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                Operational Controls & System Governance
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white font-sans tracking-tight">
              Safety Margins, Kill-Switch & Human Oversight
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 border ${
            controls.worker_running
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
          }`}>
            <span className={`h-2 w-2 rounded-full ${controls.worker_running ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`}></span>
            <span>{controls.worker_running ? 'WORKER LOOP ACTIVE' : 'EMERGENCY STOPPED'}</span>
          </span>
        </div>
      </div>

      {/* 3-Column Operational Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* 1. Global Emergency Kill-Switch Widget */}
        <div className="glass-panel rounded-xl p-5 border border-gray-800/80 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase flex items-center space-x-1">
                <AlertOctagon className="h-4 w-4" />
                <span>Emergency Control</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800">
                Pillar #4: Large Concurrency
              </span>
            </div>
            <h4 className="text-sm font-bold text-white font-sans">
              Global Worker Loop Kill-Switch
            </h4>
            <p className="text-xs text-gray-400 font-sans">
              Safely intercepts and halts all active Python background event loops immediately without corrupting PostgreSQL database locks.
            </p>
          </div>

          <div>
            <button
              onClick={handleKillClick}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-2 ${
                !controls.worker_running
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : isConfirmingKill
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-bounce shadow-rose-600/40'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-500'
              }`}
            >
              <Power className="h-4 w-4" />
              <span>
                {!controls.worker_running
                  ? 'RESUME WORKER LOOP'
                  : isConfirmingKill
                  ? 'CLICK AGAIN TO CONFIRM STOP'
                  : 'STOP WORKER IMMEDIATELY'}
              </span>
            </button>
          </div>
        </div>

        {/* 2. Real-Time Token Spend Metrics Tracker Widget */}
        <div className="glass-panel rounded-xl p-5 border border-gray-800/80 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Token Spend Tracker</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {controls.safety_margin_percentage}% Margin
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-white font-mono">
                ${controls.current_spend_usd.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                / ${controls.daily_budget_limit_usd.toFixed(2)} Limit
              </span>
            </div>

            {/* Safety Margin Capacity Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>API Budget Consumed</span>
                <span className="text-white font-bold">{controls.total_tokens_used.toLocaleString()} Tokens</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-900 border border-gray-800 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    controls.safety_margin_percentage < 20.0
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (controls.current_spend_usd / controls.daily_budget_limit_usd) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-gray-400 flex items-center space-x-1 pt-1 border-t border-gray-900">
            <ShieldAlert className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Safety Margin: <strong className="text-emerald-300">Within Safe Limits</strong></span>
          </div>
        </div>

        {/* 3. Human-in-the-Loop Toggle Switch Widget */}
        <div className="glass-panel rounded-xl p-5 border border-gray-800/80 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center space-x-1">
                <UserCheck className="h-4 w-4" />
                <span>Human Oversite</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                controls.human_in_loop_required
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {controls.human_in_loop_required ? 'APPROVAL REQUIRED' : 'AUTO POST ACTIVE'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white font-sans">
              Human-in-the-Loop Gate
            </h4>
            <p className="text-xs text-gray-400 font-sans">
              Enforces explicit user approval flag on synthesized agent campaigns before publishing to production channels.
            </p>
          </div>

          {/* Interactive Toggle Switch */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-900">
            <span className="text-xs font-mono text-gray-300 font-semibold">
              Require User Approval Flag:
            </span>

            <button
              onClick={onToggleHumanInLoop}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                controls.human_in_loop_required ? 'bg-purple-600' : 'bg-gray-800'
              }`}
              role="switch"
              aria-checked={controls.human_in_loop_required}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  controls.human_in_loop_required ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
