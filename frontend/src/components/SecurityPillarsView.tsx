import React from 'react';
import { ShieldCheck, Lock, Cpu, Layers, CheckCircle2 } from 'lucide-react';

export const SecurityPillarsView: React.FC = () => {
  const pillars = [
    {
      title: '1. Scalability',
      subtitle: 'Modular Architecture & Async DB Pools',
      icon: Layers,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      bgColor: 'bg-blue-500/10',
      features: [
        'Modular directory layout (/backend & /frontend completely decoupled)',
        'SQLAlchemy 2.0 Async engine with connection pooling & max overflow limits',
        'Paginated endpoint queries (offset/limit) to prevent memory spikes',
        'Pydantic v2 strict serialization & validation for fast parsing',
      ],
    },
    {
      title: '2. Authentication',
      subtitle: 'Robust JWT Dual-Token Layer',
      icon: Lock,
      color: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      bgColor: 'bg-purple-500/10',
      features: [
        'Short-lived Access Tokens (30 mins) + Long-lived Refresh Tokens (7 days)',
        'Bcrypt salted password hashing with work factor 12',
        'Automatic client-side token refresh interceptor in API layer',
        'Role-Based Access Control (RBAC) protecting endpoints',
      ],
    },
    {
      title: '3. Security',
      subtitle: 'Strict CORS, Rate Limiting & Key Tracking',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      bgColor: 'bg-emerald-500/10',
      features: [
        'Root .env tracking system with .env.example & strict .gitignore safeguards',
        'Explicit CORS whitelist loaded from environment variables',
        'Security Headers Middleware (X-Frame-Options, X-Content-Type-Options, HSTS, CSP)',
        'Slowapi IP-based rate limiting on sensitive auth endpoints',
      ],
    },
    {
      title: '4. High Concurrency',
      subtitle: 'Asynchronous Event Loop Engine',
      icon: Cpu,
      color: 'from-rose-500 to-amber-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/20',
      bgColor: 'bg-rose-500/10',
      features: [
        'FastAPI non-blocking async route handlers for high throughput',
        'Vite bundle optimization with code splitting & minimal main-thread blocking',
        'Async SQLite/PostgreSQL drivers (aiosqlite/asyncpg) avoiding I/O blocks',
        'Real-time system health probe checking event loop responsiveness',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-2">
          <ShieldCheck className="h-6 w-6 text-blue-400" />
          <h2 className="text-lg font-bold text-white tracking-wide font-mono uppercase">
            System Architecture & 4 Core Pillars
          </h2>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed max-w-3xl font-sans">
          This full-stack environment has been provisioned according to strict enterprise-grade standards.
          Below is the verified status of the core pillars governing security, throughput, and modular scalability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div key={idx} className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${p.bgColor} border ${p.borderColor}`}>
                    <Icon className={`h-5 w-5 ${p.textColor}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">{p.title}</h3>
                    <p className="text-xs text-gray-400 font-sans">{p.subtitle}</p>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>

              <ul className="space-y-2.5 mt-4 border-t border-gray-800/80 pt-4">
                {p.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start space-x-2 text-xs font-mono text-gray-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${p.textColor} mt-1.5 shrink-0`}></span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
