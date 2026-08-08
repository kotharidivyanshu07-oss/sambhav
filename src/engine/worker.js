import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Storage } from '../db/storage.js';
import { getPersonaConfig } from './persona.js';
import { DiscoveryEngine } from './discovery.js';
import { EditorialJudgmentEngine } from './judgment.js';
import { ContentGenerator } from './generator.js';
import { MemoryEngine } from './memory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROMT_MD_PATH = path.join(__dirname, '../../PROMT.md');

// Active background timers per agentId
const activeTimers = new Map();

export const WorkerService = {
  /**
   * Initializes autonomous background publishing worker for given agentId
   */
  startAgentWorker(agentId, intervalMs = 45000) {
    if (activeTimers.has(agentId)) {
      console.log(`[Worker] Worker for agent ${agentId} already active.`);
      return;
    }

    console.log(`[Worker] Starting autonomous background worker for agent ${agentId} (Interval: ${intervalMs}ms)...`);
    
    // Update agent status in storage
    const agent = Storage.getAgent(agentId);
    if (agent) {
      Storage.saveAgent({ ...agent, status: 'active', startedAt: new Date().toISOString() });
    }

    // Run first tick immediately
    this.runPublishingCycle(agentId).catch(err => {
      console.error(`[Worker Error] Agent ${agentId} initial cycle error:`, err);
    });

    // Schedule background loop
    const timerId = setInterval(() => {
      this.runPublishingCycle(agentId).catch(err => {
        console.error(`[Worker Error] Agent ${agentId} loop error:`, err);
      });
    }, intervalMs);

    activeTimers.set(agentId, timerId);
    Storage.logActivity(agentId, 'INFO', `Autonomous worker process started. Interval: ${intervalMs}ms`);
  },

  /**
   * Stops worker process for agentId
   */
  stopAgentWorker(agentId) {
    if (activeTimers.has(agentId)) {
      clearInterval(activeTimers.get(agentId));
      activeTimers.delete(agentId);
      const agent = Storage.getAgent(agentId);
      if (agent) {
        Storage.saveAgent({ ...agent, status: 'stopped' });
      }
      Storage.logActivity(agentId, 'INFO', `Autonomous worker process stopped.`);
    }
  },

  /**
   * Resumes workers for all previously active agents on server restart
   */
  resumeAllActiveAgents() {
    const agents = Storage.getAgents();
    for (const agent of agents) {
      if (agent.status === 'active' || agent.status === 'initialized') {
        this.startAgentWorker(agent.id);
      }
    }
  },

  /**
   * Core Autonomous Publishing Cycle:
   * 1. Discover live topics
   * 2. Exercise Editorial Judgment
   * 3. Record Memory & Generate Post
   * 4. Log to PROMT.md
   */
  async runPublishingCycle(agentId) {
    const agent = Storage.getAgent(agentId);
    if (!agent) {
      console.error(`[Worker] Agent ${agentId} not found.`);
      return null;
    }

    const personaConfig = getPersonaConfig(agent.persona);
    Storage.logActivity(agentId, 'INFO', `Starting discovery cycle for ${personaConfig.name} (${personaConfig.domain})...`);

    // 1. Discover Topics
    const candidates = await DiscoveryEngine.discoverTopics(personaConfig);
    Storage.logActivity(agentId, 'INFO', `Discovered ${candidates.length} candidate topics.`);

    // 2. Editorial Judgment
    const { winner, rejections } = EditorialJudgmentEngine.evaluateCandidates(agentId, candidates, personaConfig);

    if (!winner) {
      Storage.logActivity(agentId, 'WARN', `No candidate passed editorial quality standards. Cycle finished without post.`, { rejectionsCount: rejections.length });
      this.appendPromtLog(agentId, personaConfig, null, rejections);
      return null;
    }

    // 3. Generate Post & Save Memory
    const post = ContentGenerator.generatePost(agentId, winner, agent.persona);
    Storage.savePost(post);
    MemoryEngine.recordPublication(agentId, post);

    Storage.logActivity(agentId, 'SUCCESS', `Published post ${post.id}: "${winner.title}"`, { postId: post.id, score: winner.evaluationScore });
    
    // Update Agent lastPublishedAt
    Storage.saveAgent({
      ...agent,
      lastPublishedAt: new Date().toISOString(),
      postCount: (agent.postCount || 0) + 1
    });

    // 4. Append to PROMT.md file
    this.appendPromtLog(agentId, personaConfig, post, rejections);

    return post;
  },

  /**
   * Appends execution trace & AI logs directly to PROMT.md file as required by user prompt
   */
  appendPromtLog(agentId, personaConfig, post, rejections) {
    try {
      const timestamp = new Date().toISOString();
      let logMarkdown = `\n### ⚡ Autonomous Cycle: ${timestamp}\n`;
      logMarkdown += `- **Agent ID:** \`${agentId}\` (${personaConfig.name} - ${personaConfig.domain})\n`;

      if (post) {
        logMarkdown += `- **Status:** 🟢 POST PUBLISHED (\`${post.id}\`)\n`;
        logMarkdown += `- **Title:** ${post.title}\n`;
        logMarkdown += `- **Rationale:** ${post.rationale}\n`;
        logMarkdown += `- **Sources:** ${post.sources.join(', ')}\n`;
      } else {
        logMarkdown += `- **Status:** 🟡 CYCLE SKIPPED (No candidate met editorial threshold)\n`;
      }

      logMarkdown += `- **Editorial Rejections (${rejections.length}):**\n`;
      for (const rej of rejections.slice(0, 3)) {
        logMarkdown += `  - ❌ *${rej.candidateTitle}*: ${rej.reason}\n`;
      }
      logMarkdown += `\n---\n`;

      fs.appendFileSync(PROMT_MD_PATH, logMarkdown, 'utf-8');
    } catch (e) {
      console.error('[Worker] Error appending to PROMT.md:', e);
    }
  }
};
