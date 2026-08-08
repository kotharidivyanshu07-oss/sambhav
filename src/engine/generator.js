import { getPersonaConfig } from './persona.js';

export const ContentGenerator = {
  /**
   * Generates a full published post object given the accepted candidate topic & persona
   */
  generatePost(agentId, topic, persona) {
    const personaConfig = getPersonaConfig(persona);
    const timestamp = new Date().toISOString();
    const postId = `p-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

    const text = this.craftPostText(topic, personaConfig);

    return {
      id: postId,
      agentId,
      createdAt: timestamp,
      title: topic.title,
      text,
      rationale: topic.rationale || `Selected topic "${topic.title}" for ${personaConfig.domain} analysis based on current relevance and technical depth.`,
      sources: [topic.url || 'https://arxiv.org']
    };
  },

  /**
   * Crafts distinct, high-quality post text matching persona tone & voice
   */
  craftPostText(topic, personaConfig) {
    const title = topic.title;
    const summary = topic.summary;
    const stance = personaConfig.voice.editorialStance;
    const voiceTone = personaConfig.voice.tone;

    let body = '';

    if (personaConfig.domain.toLowerCase().includes('security')) {
      body = `🔒 [${personaConfig.domain} Analysis]\n\n` +
        `Title: ${title}\n\n` +
        `Key Finding:\n${summary}\n\n` +
        `Security Stance:\n${stance}\n\n` +
        `Threat Breakdown & Mitigation Strategy:\n` +
        `1. Multi-tenant sandbox environments must enforce strict boundary isolation beyond simple context filtering.\n` +
        `2. Attack vectors using untrusted payload rendering require deterministic static validation prior to runtime execution.\n\n` +
        `Conclusion:\nAs autonomous tool execution accelerates, relying on superficial guardrails is insufficient. Defensive architectures must be verified empirically.`;
    } else if (personaConfig.domain.toLowerCase().includes('machine learning') || personaConfig.domain.toLowerCase().includes('engineering')) {
      body = `⚡ [ML Systems Architecture & Benchmark Review]\n\n` +
        `Topic: ${title}\n\n` +
        `Engineering Analysis:\n${summary}\n\n` +
        `Core Stance:\n${stance}\n\n` +
        `Production Optimization Takeaways:\n` +
        `• Micro-benchmarking shows VRAM allocation optimization directly unlocks throughput bottlenecks.\n` +
        `• Quantization strategy should balance KV-cache memory pressure against low-bit precision loss.\n\n` +
        `Recommendation: Benchmark actual FP8/FP4 kernels on hardware clusters before deploying to production.`;
    } else if (personaConfig.domain.toLowerCase().includes('ethics')) {
      body = `⚖️ [AI Governance & Societal Impact Note]\n\n` +
        `Topic: ${title}\n\n` +
        `Summary & Context:\n${summary}\n\n` +
        `Ethical Perspective:\n${stance}\n\n` +
        `Critical Questions for Deployment:\n` +
        `- How are copyright and consent frameworks preserved during automated web indexing?\n` +
        `- What public audit mechanisms exist to verify model fairness and data attribution?\n\n` +
        `Closing Thought: Rapid capability scaling must walk hand-in-hand with societal transparency.`;
    } else {
      body = `💡 [${personaConfig.domain} Technical Perspective]\n\n` +
        `Topic: ${title}\n\n` +
        `Analysis:\n${summary}\n\n` +
        `Editorial Perspective:\n${stance}\n\n` +
        `Key Takeaway:\n${personaConfig.name}'s research underscores that sustainable technical progress in ${personaConfig.domain} requires rigorous validation over marketing claims.`;
    }

    if (topic.memoryContext) {
      body = `📌 ${topic.memoryContext}\n\n` + body;
    }

    return body;
  }
};
