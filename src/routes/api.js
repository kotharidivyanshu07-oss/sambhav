import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Storage } from '../db/storage.js';
import { WorkerService } from '../engine/worker.js';
import { getPersonaConfig } from '../engine/persona.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROMT_MD_PATH = path.join(__dirname, '../../PROMT.md');

/**
 * 1. POST /api/agent/init
 * Initializes the autonomous persona agent and launches background publishing worker.
 */
router.post('/agent/init', async (req, res) => {
  try {
    const { persona } = req.body || {};
    if (!persona || !persona.domain) {
      return res.status(400).json({ error: 'Missing persona or persona.domain in request body.' });
    }

    const personaName = persona.name || 'Ada';
    const personaDomain = persona.domain || 'AI Security';

    // Generate clean unique agentId
    const safeDomain = personaDomain.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const safeName = personaName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const agentId = `agent-${Date.now()}-${safeName}-${safeDomain}`;

    const personaConfig = getPersonaConfig({ name: personaName, domain: personaDomain });

    // Save Agent Record
    const agent = {
      id: agentId,
      persona: {
        name: personaConfig.name,
        domain: personaConfig.domain
      },
      config: personaConfig,
      createdAt: new Date().toISOString(),
      status: 'initialized',
      postCount: 0
    };
    Storage.saveAgent(agent);
    Storage.logActivity(agentId, 'INFO', `Agent ${agentId} initialized for ${personaConfig.name} (${personaConfig.domain})`);

    // Launch Autonomous Background Worker Service
    WorkerService.startAgentWorker(agentId);

    // Return exact required response format
    return res.status(200).json({
      agentId: agentId
    });
  } catch (err) {
    console.error('[API Init Error]', err);
    return res.status(500).json({ error: 'Failed to initialize agent.' });
  }
});

/**
 * 2. GET /api/agent/feed?agentId=abc-123
 * Retrieves the published posts feed for the specified agentId in reverse chronological order.
 */
router.get('/agent/feed', (req, res) => {
  try {
    const { agentId } = req.query;
    if (!agentId) {
      return res.status(400).json({ error: 'Query parameter agentId is required.' });
    }

    const rawPosts = Storage.getPosts(agentId);

    // Format posts cleanly matching exact API requirements
    const posts = rawPosts.map(p => ({
      id: p.id,
      createdAt: p.createdAt,
      text: p.text,
      rationale: p.rationale,
      sources: p.sources || []
    }));

    return res.status(200).json({
      posts: posts
    });
  } catch (err) {
    console.error('[API Feed Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve feed.' });
  }
});

/**
 * Helper Endpoint: GET /api/agent/status?agentId=...
 */
router.get('/agent/status', (req, res) => {
  const { agentId } = req.query;
  if (!agentId) {
    const agents = Storage.getAgents();
    return res.json({ agents });
  }

  const agent = Storage.getAgent(agentId);
  if (!agent) return res.status(404).json({ error: 'Agent not found.' });

  const posts = Storage.getPosts(agentId);
  const rejections = Storage.getRejections(agentId);
  const memory = Storage.getMemory(agentId);

  return res.json({
    agent,
    stats: {
      postCount: posts.length,
      rejectionCount: rejections.length,
      memoryItemCount: memory.length,
      lastPublishedAt: posts.length > 0 ? posts[0].createdAt : null
    }
  });
});

/**
 * Helper Endpoint: GET /api/agent/rejections?agentId=...
 */
router.get('/agent/rejections', (req, res) => {
  const { agentId } = req.query;
  const rejections = Storage.getRejections(agentId);
  return res.json({ rejections });
});

/**
 * Helper Endpoint: GET /api/agent/memory?agentId=...
 */
router.get('/agent/memory', (req, res) => {
  const { agentId } = req.query;
  const memory = Storage.getMemory(agentId);
  return res.json({ memory });
});

/**
 * Helper Endpoint: GET /api/agent/logs?agentId=...
 */
router.get('/agent/logs', (req, res) => {
  const { agentId } = req.query;
  const logs = Storage.getLogs(agentId);
  return res.json({ logs });
});

/**
 * Helper Endpoint: GET /api/promt
 * Returns PROMT.md contents for UI prompt log inspection
 */
router.get('/promt', (req, res) => {
  try {
    if (fs.existsSync(PROMT_MD_PATH)) {
      const content = fs.readFileSync(PROMT_MD_PATH, 'utf-8');
      return res.type('text/plain').send(content);
    }
    return res.status(404).send('PROMT.md file not found.');
  } catch (err) {
    return res.status(500).send('Error reading PROMT.md');
  }
});

/**
 * Helper Endpoint: POST /api/agent/trigger?agentId=...
 * Manually forces an autonomous cycle tick immediately.
 */
router.post('/agent/trigger', async (req, res) => {
  try {
    const { agentId } = req.body || req.query;
    if (!agentId) return res.status(400).json({ error: 'agentId required' });

    const post = await WorkerService.runPublishingCycle(agentId);
    return res.json({ success: true, post });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
