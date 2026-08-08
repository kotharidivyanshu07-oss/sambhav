import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data/runtime');

// Ensure runtime data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
  agents: path.join(DATA_DIR, 'agents.json'),
  posts: path.join(DATA_DIR, 'posts.json'),
  memory: path.join(DATA_DIR, 'memory.json'),
  rejections: path.join(DATA_DIR, 'rejections.json'),
  logs: path.join(DATA_DIR, 'system_logs.json')
};

// Generic read helper
function readJson(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

// Generic write helper (atomic write via temp file)
function writeJson(filePath, data) {
  try {
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

export const Storage = {
  // Agent Operations
  getAgents() {
    return readJson(FILES.agents, []);
  },
  getAgent(agentId) {
    const agents = this.getAgents();
    return agents.find(a => a.id === agentId) || null;
  },
  saveAgent(agent) {
    const agents = this.getAgents();
    const index = agents.findIndex(a => a.id === agent.id);
    if (index >= 0) {
      agents[index] = { ...agents[index], ...agent };
    } else {
      agents.push(agent);
    }
    writeJson(FILES.agents, agents);
    return agent;
  },

  // Post Operations
  getPosts(agentId = null) {
    const posts = readJson(FILES.posts, []);
    if (agentId) {
      return posts.filter(p => p.agentId === agentId);
    }
    return posts;
  },
  savePost(post) {
    const posts = readJson(FILES.posts, []);
    posts.unshift(post); // newest first
    writeJson(FILES.posts, posts);
    return post;
  },

  // Memory Operations
  getMemory(agentId) {
    const memory = readJson(FILES.memory, []);
    return memory.filter(m => m.agentId === agentId);
  },
  saveMemoryItem(item) {
    const memory = readJson(FILES.memory, []);
    memory.push({
      ...item,
      id: item.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: item.timestamp || new Date().toISOString()
    });
    writeJson(FILES.memory, memory);
    return item;
  },

  // Rejection Log Operations
  getRejections(agentId = null) {
    const rejections = readJson(FILES.rejections, []);
    if (agentId) {
      return rejections.filter(r => r.agentId === agentId);
    }
    return rejections;
  },
  saveRejection(rejection) {
    const rejections = readJson(FILES.rejections, []);
    rejections.unshift({
      ...rejection,
      id: `rej-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: rejection.timestamp || new Date().toISOString()
    });
    writeJson(FILES.rejections, rejections);
  },

  // System Activity Logs
  getLogs(agentId = null) {
    const logs = readJson(FILES.logs, []);
    if (agentId) {
      return logs.filter(l => l.agentId === agentId);
    }
    return logs;
  },
  logActivity(agentId, level, message, details = {}) {
    const logs = readJson(FILES.logs, []);
    const entry = {
      id: `log-${Date.now()}`,
      agentId,
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };
    logs.unshift(entry);
    if (logs.length > 500) logs.pop(); // keep last 500 logs
    writeJson(FILES.logs, logs);
    return entry;
  }
};
