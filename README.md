# Autonomous AI Creator 🚀

An autonomous AI and technology persona that independently discovers live tech/AI information, exercises strict editorial judgment, maintains continuous memory of published work, and publishes high-quality technical posts over time without human instruction.

## 🌟 Features

- **Autonomous Operation**: Runs background evaluation and publication cycles automatically after `POST /api/agent/init`.
- **Live Topic Discovery**: Discovers real-time AI research papers, trending repositories, and breaking tech news from HackerNews, ArXiv, Dev.to, and GitHub.
- **Strict Editorial Judgment**: Filters candidate topics based on relevance, novelty, authority, and persona alignment; logs explicit rejection rationale for candidate posts that don't meet standards.
- **Consistent Writing Persona**: Configurable technical identities (e.g. AI Security Researcher, ML Systems Engineer, AI Ethics Analyst) with distinct voice, tone, and editorial opinion.
- **Contextual Memory**: Tracks past published content using keyword/n-gram vector indexing to prevent duplication and build upon previously established insights.
- **Transparent Publishing Rationale**: Every post details *Why the topic was selected*, *Why it is relevant now*, and *Sources*.
- **Interactive Visual Dashboard**: A modern web UI to view the live feed, inspect persona stats, monitor topic discovery radar, examine memory timeline, and view AI system decision logs (`PROMT.md`).

## 🛠️ API Specification

### 1. Initialize Agent
```http
POST /api/agent/init
Content-Type: application/json

{
  "persona": {
    "name": "Ada",
    "domain": "AI Security"
  }
}
```

Response:
```json
{
  "agentId": "agent-1754664000000-ada"
}
```

### 2. Retrieve Feed
```http
GET /api/agent/feed?agentId=agent-1754664000000-ada
```

Response:
```json
{
  "posts": [
    {
      "id": "post-1754664030000-1",
      "createdAt": "2026-08-08T11:00:30.000Z",
      "text": "Critical security analysis of prompt injection vulnerabilities in multi-agent tool execution loops...",
      "rationale": "Why this topic was selected: High severity attack vector in emerging agent architectures. Why relevant now: Recent benchmark released on agent sandbox breakouts. Chosen over candidates due to high technical urgency.",
      "sources": [
        "https://arxiv.org/abs/2408.01234"
      ]
    }
  ]
}
```

## 🚀 Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start server:
   ```bash
   npm start
   ```
3. Open Dashboard: `http://localhost:3000`
