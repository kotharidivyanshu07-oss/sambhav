import {
  BarChart3,
  Bot,
  Compass,
  Cpu,
  FileText,
  Play,
  Rocket,
  Search,
  Settings,
  Share2,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: Bot, active: true },
  { label: 'Content Logs', icon: FileText },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Agent Settings', icon: Settings },
];

const thoughtSteps = [
  '[SEARCHING] scanning X conversations for emerging tech signals',
  '[ANALYZING] ranking viral topics by momentum and audience fit',
  '[WRITING] drafting a newsletter hook and CTA sequence',
  '[PUBLISHING] preparing a launch-ready content package',
];

const cards = [
  {
    title: 'The AI Newsletter That Writes Itself',
    snippet:
      'A sharp, high-conversion intro for the next edition, built from live trend clusters and audience intent.',
    accent: 'from-cyan-500/30 to-blue-600/20',
  },
  {
    title: 'Trend Thread: Developer Tools Rising',
    snippet:
      'A threaded post concept with punchy hooks, timed references, and a CTA that feels native to the platform.',
    accent: 'from-fuchsia-500/30 to-violet-600/20',
  },
];

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-slate-900/70 px-5 py-6 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-2">
              <Cpu className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Autonomous AI</p>
              <h1 className="text-lg font-semibold">Maverick Agent</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
              <p className="text-sm font-semibold text-emerald-200">Mission sync live</p>
            </div>
            <p className="text-sm text-slate-300">Audience pulse is rising. The agent is primed to publish within the next 12 minutes.</p>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Content orchestration</p>
              <h2 className="text-3xl font-semibold text-white">Autonomous Content Maverick</h2>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              <Zap className="h-4 w-4 text-cyan-300" />
              <span>Live demo mode · polished for capture</span>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-2xl shadow-cyan-950/20">
                <div className="border-b border-white/10 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-cyan-300">Active Goal</p>
                      <h3 className="mt-1 text-xl font-semibold text-white">Analyzing trending tech on X</h3>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-200">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                      In motion
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Compass className="h-4 w-4 text-cyan-300" />
                      Current mission
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">Drafting a script for a newsletter that feels native, sharp, and conversion-ready.</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                      <Rocket className="h-4 w-4" />
                      82% signal confidence · 14 ideas shortlisted
                    </div>
                  </div>

                  <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-4">
                    <div className="flex items-center gap-2 text-sm text-cyan-200">
                      <Sparkles className="h-4 w-4" />
                      Suggested angle
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">“The AI-native creator stack that actually compounds attention”</p>
                    <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15">
                      <Play className="h-4 w-4" />
                      Preview output
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-300">Agent Thought Process</p>
                    <h3 className="text-lg font-semibold text-white">Live reasoning stream</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
                    live
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-sm text-slate-300">
                  <div className="space-y-3">
                    {thoughtSteps.map((step, index) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                        <p className={`${index === 0 ? 'text-cyan-200' : 'text-slate-300'}`}>
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-300">Generated Content Showcase</p>
                    <h3 className="text-lg font-semibold text-white">Fresh outputs</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
                    2 new
                  </div>
                </div>

                <div className="space-y-4">
                  {cards.map((card) => (
                    <article key={card.title} className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900">
                      <div className={`h-32 bg-gradient-to-r ${card.accent}`}>
                        <div className="flex h-full items-center justify-center">
                          <div className="rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                            Visual concept ready
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-lg font-semibold text-white">{card.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{card.snippet}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex gap-2">
                            <button className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                              <Share2 className="h-4 w-4" />
                            </button>
                            <button className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                              <TrendingUp className="h-4 w-4" />
                            </button>
                          </div>
                          <button className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-200">
                            Publish
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-5 shadow-2xl shadow-slate-950/30">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Search className="h-4 w-4" />
                  Signal summary
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">3 high-intent topics resurfacing now</p>
                <p className="mt-2 text-sm text-slate-300">The agent is balancing resonance, novelty, and platform-native pacing for the next publish window.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
