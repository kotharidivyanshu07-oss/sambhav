import { Storage } from '../db/storage.js';

/**
 * Text processing helper to extract clean lower-case token terms
 */
function tokenize(text) {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w))
  );
}

const STOP_WORDS = new Set([
  'this', 'that', 'with', 'from', 'have', 'more', 'about', 'which', 'their', 'there',
  'what', 'when', 'where', 'would', 'could', 'should', 'other', 'into', 'these', 'than',
  'then', 'been', 'only', 'some', 'time', 'very', 'just', 'also', 'over', 'even'
]);

/**
 * Calculates Jaccard similarity index between two term sets
 */
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

export const MemoryEngine = {
  /**
   * Records a published post into the agent's memory bank
   */
  recordPublication(agentId, post) {
    const tokens = Array.from(tokenize(`${post.text} ${post.rationale}`));
    const memoryItem = {
      agentId,
      postId: post.id,
      title: post.title || post.text.substring(0, 60),
      createdAt: post.createdAt,
      sources: post.sources,
      tokens,
      summary: post.text.substring(0, 150)
    };
    Storage.saveMemoryItem(memoryItem);
    return memoryItem;
  },

  /**
   * Evaluates candidate topic against existing agent memory bank.
   * Returns { isDuplicate: boolean, highestSimilarity: number, relatedPostId: string | null, memoryContext: string }
   */
  checkMemoryConflict(agentId, candidate) {
    const memory = Storage.getMemory(agentId);
    if (!memory || memory.length === 0) {
      return { isDuplicate: false, highestSimilarity: 0, relatedPostId: null, memoryContext: null };
    }

    const candidateTokens = tokenize(`${candidate.title} ${candidate.summary}`);
    let highestSimilarity = 0;
    let mostSimilarItem = null;

    for (const item of memory) {
      const itemTokens = new Set(item.tokens || []);
      const similarity = jaccardSimilarity(candidateTokens, itemTokens);

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        mostSimilarItem = item;
      }
    }

    const isDuplicate = highestSimilarity > 0.55;

    let memoryContext = null;
    if (highestSimilarity >= 0.25 && mostSimilarItem) {
      memoryContext = `Connects to previously published post (${mostSimilarItem.postId}): "${mostSimilarItem.title}"`;
    }

    return {
      isDuplicate,
      highestSimilarity,
      relatedPostId: mostSimilarItem ? mostSimilarItem.postId : null,
      relatedPostTitle: mostSimilarItem ? mostSimilarItem.title : null,
      memoryContext
    };
  },

  /**
   * Retrieves key memory context highlights for feed generation
   */
  getAgentMemorySummary(agentId) {
    const memory = Storage.getMemory(agentId);
    return memory.slice(-5).map(m => ({
      postId: m.postId,
      title: m.title,
      publishedAt: m.createdAt
    }));
  }
};
