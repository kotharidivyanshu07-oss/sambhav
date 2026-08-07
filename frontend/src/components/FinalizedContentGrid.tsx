import React, { useState } from 'react';
import { Sparkles, Download, Copy, Check, TrendingUp } from 'lucide-react';

export interface FinalizedContentItem {
  id: string | number;
  title: string;
  category: string;
  virality_score: number;
  campaign_hook: string;
  target_channels: string[];
  suggested_headlines: string[];
  action_plan: string[];
  created_at: string;
}

interface FinalizedContentGridProps {
  items: FinalizedContentItem[];
}

export const FinalizedContentGrid: React.FC<FinalizedContentGridProps> = ({ items }) => {
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const defaultItems: FinalizedContentItem[] = [
    {
      id: 1,
      title: "Agentic AI Orchestration & Telemetry Campaign",
      category: "Technology & AI",
      virality_score: 96.5,
      campaign_hook: "Empower your workflows with Breeth AI & FastAPI Asynchronous Meshes",
      target_channels: ["LinkedIn", "Twitter/X", "ProductHunt", "TechCrunch"],
      suggested_headlines: [
        "Build Real-Time Asynchronous AI Meshes Without Network Locks",
        "From Zero to High Throughput: FastAPI + React + PostgreSQL Architecture",
        "Why Event Loop Telemetry Matters for Modern Enterprise Apps"
      ],
      action_plan: [
        "Deploy FastAPI async background worker engine",
        "Stream live thinking milestones into PostgreSQL database",
        "Enforce JWT authentication and strict CORS boundaries"
      ],
      created_at: "Just now"
    },
    {
      id: 2,
      title: "Micro-Animations & Glassmorphic Design Strategy",
      category: "UI/UX & Product Strategy",
      virality_score: 92.4,
      campaign_hook: "Wow your users with high-end glassmorphism and sub-16ms UI responsiveness",
      target_channels: ["Dribbble", "Twitter/X", "Medium", "Dev.to"],
      suggested_headlines: [
        "Subtle Micro-Animations That Drive 3x User Engagement",
        "Designing Glassmorphic Interfaces for Dark Mode Web Apps",
        "High Performance Virtualized UI Rendering Patterns"
      ],
      action_plan: [
        "Implement Tailwind CSS glass-panel utility classes",
        "Apply windowed virtualized rendering for console logs",
        "Maintain 60 FPS viewport updates under load"
      ],
      created_at: "5 mins ago"
    },
    {
      id: 3,
      title: "Zero-Lock PostgreSQL Database Persistence",
      category: "Database & Scalability",
      virality_score: 94.8,
      campaign_hook: "Atomic claims and async connection pooling for 100k concurrent requests",
      target_channels: ["HackerNews", "Reddit r/programming", "GitHub Showcase"],
      suggested_headlines: [
        "Scaling PostgreSQL with Async SQLAlchemy 2.0 and Connection Pools",
        "Lock-Free Agent Task Claims with FOR UPDATE SKIP LOCKED",
        "Real-Time Telemetry Audit Logs in Production Systems"
      ],
      action_plan: [
        "Configure asyncpg connection pool parameters",
        "Add database indexes on status and priority columns",
        "Implement graceful background worker recovery loops"
      ],
      created_at: "12 mins ago"
    }
  ];

  const displayItems = items.length > 0 ? items : defaultItems;

  const handleCopy = (item: FinalizedContentItem) => {
    const textToCopy = `Campaign: ${item.title}\nHook: ${item.campaign_hook}\nHeadlines:\n${item.suggested_headlines.map(h => `- ${h}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadJson = (item: FinalizedContentItem) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `synthesized_campaign_${item.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Agent Finalized Synthesized Content
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-sans">
            Autonomous marketing strategy, viral headlines & execution plans synthesized by AI background workers
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono shrink-0">
          {displayItems.length} Finalized Strategies
        </span>
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group space-y-4"
          >
            <div className="space-y-3">
              {/* Category & Score Header */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-gray-900 text-gray-300 border border-gray-800">
                  {item.category}
                </span>

                <span className="flex items-center space-x-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="h-3 w-3" />
                  <span>{item.virality_score}% Virality</span>
                </span>
              </div>

              {/* Title */}
              <h4 className="text-base font-extrabold text-white font-sans tracking-tight leading-snug">
                {item.title}
              </h4>

              {/* Hook */}
              <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-900 text-xs text-purple-200 font-mono italic">
                "{item.campaign_hook}"
              </div>

              {/* Channels */}
              <div>
                <span className="text-[11px] font-mono text-gray-500 uppercase block mb-1.5 font-semibold">
                  Target Channels
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.target_channels.map((ch, cIdx) => (
                    <span key={cIdx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      #{ch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Headlines */}
              <div>
                <span className="text-[11px] font-mono text-gray-500 uppercase block mb-1.5 font-semibold">
                  Suggested Headlines
                </span>
                <ul className="space-y-1 text-xs text-gray-300 font-sans">
                  {item.suggested_headlines.map((hl, hIdx) => (
                    <li key={hIdx} className="flex items-start space-x-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span className="line-clamp-2">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer & Actions */}
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-500">
                {item.created_at}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(item)}
                  className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-800"
                  title="Copy Campaign Copy"
                >
                  {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => handleDownloadJson(item)}
                  className="p-1.5 rounded-lg bg-gray-900 hover:bg-purple-600/20 text-gray-400 hover:text-purple-300 transition-colors border border-gray-800"
                  title="Download JSON Artifact"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
