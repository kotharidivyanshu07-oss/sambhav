import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Server, Cpu, Key } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      {/* Brand & System Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Cpu className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-wide">SAMBHAV</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                TRACK 3: AUTONOMOUS AI CREATOR
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              FastAPI + Breeth AI Creator Engine
            </p>
          </div>
        </div>
      </div>

      {/* Security & User Actions */}
      <div className="flex items-center space-x-4">
        {/* Environment Indicator */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800 text-xs font-mono text-gray-300">
          <Server className="h-3.5 w-3.5 text-emerald-400" />
          <span>PORT: 8000</span>
          <span className="text-gray-600">|</span>
          <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
          <span>CORS: ENABLED</span>
        </div>

        {user ? (
          <div className="flex items-center space-x-3 bg-gray-900/80 border border-gray-800 rounded-xl p-1.5 pr-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white flex items-center gap-1">
                {user.full_name}
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded ${
                  user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gray-800 text-gray-400'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono truncate max-w-[140px]">{user.email}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Key className="h-3.5 w-3.5" />
            <span>Sign In / Demo</span>
          </button>
        )}
      </div>
    </header>
  );
};
