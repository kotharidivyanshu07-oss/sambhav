import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { WorkerService } from './engine/worker.js';
import { Storage } from './db/storage.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend dashboard
app.use(express.static(path.join(__dirname, '../public')));

// Mount API routes
app.use('/api', apiRoutes);

// Catch-all route to serve dashboard SPA index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found.' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🤖 Autonomous AI Creator Server Running on Port ${PORT}`);
  console.log(`   Dashboard: http://localhost:${PORT}`);
  console.log(`   API Endpoint (Init): POST http://localhost:${PORT}/api/agent/init`);
  console.log(`   API Endpoint (Feed): GET  http://localhost:${PORT}/api/agent/feed?agentId=...`);
  console.log(`====================================================`);

  // Auto-seed default demo agent if no agents exist yet
  const agents = Storage.getAgents();
  if (agents.length === 0) {
    console.log('[Server Setup] No existing agents found. Creating default "Ada (AI Security)" agent...');
    const defaultAgentId = 'agent-1754664000000-ada-ai-security';
    Storage.saveAgent({
      id: defaultAgentId,
      persona: { name: 'Ada', domain: 'AI Security' },
      config: { name: 'Ada', domain: 'AI Security' },
      createdAt: new Date().toISOString(),
      status: 'initialized',
      postCount: 0
    });
    WorkerService.startAgentWorker(defaultAgentId);
  } else {
    // Resume workers for active agents
    WorkerService.resumeAllActiveAgents();
  }
});
