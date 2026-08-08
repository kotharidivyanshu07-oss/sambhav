import { MemoryEngine } from './memory.js';
import { Storage } from '../db/storage.js';

export const EditorialJudgmentEngine = {
  /**
   * Evaluates candidate topics and returns selected topic + list of rejected topics with rationale.
   */
  evaluateCandidates(agentId, candidates, personaConfig) {
    const scoredCandidates = [];
    const rejections = [];

    for (const candidate of candidates) {
      // 1. Check Memory duplicate
      const memoryResult = MemoryEngine.checkMemoryConflict(agentId, candidate);
      if (memoryResult.isDuplicate) {
        const rejectionReason = `Duplicate Content: Similar topic previously published in post ${memoryResult.relatedPostId} ("${memoryResult.relatedPostTitle}"). Repetition score: ${(memoryResult.highestSimilarity * 100).toFixed(1)}%.`;
        rejections.push({
          candidateTitle: candidate.title,
          url: candidate.url,
          reason: rejectionReason,
          category: "Duplicate / Memory Overlap"
        });
        Storage.saveRejection({
          agentId,
          candidateTitle: candidate.title,
          url: candidate.url,
          reason: rejectionReason,
          category: "Memory Overlap"
        });
        continue;
      }

      // 2. Score Technical Relevance to Persona (0 - 40 points)
      let relevanceScore = 0;
      const text = `${candidate.title} ${candidate.summary}`.toLowerCase();
      const domainKeywords = personaConfig.keywords || [];

      for (const kw of domainKeywords) {
        if (text.includes(kw.toLowerCase())) {
          relevanceScore += 10;
        }
      }
      relevanceScore = Math.min(relevanceScore, 40);

      // If domain keyword match is 0 and not related to AI tech, heavily penalize
      if (relevanceScore === 0 && !text.includes('ai') && !text.includes('model') && !text.includes('paper')) {
        const rejectionReason = `Off-Domain: Candidate topic "${candidate.title}" does not align with ${personaConfig.domain} persona focus areas.`;
        rejections.push({
          candidateTitle: candidate.title,
          url: candidate.url,
          reason: rejectionReason,
          category: "Off-Domain"
        });
        Storage.saveRejection({
          agentId,
          candidateTitle: candidate.title,
          url: candidate.url,
          reason: rejectionReason,
          category: "Off-Domain"
        });
        continue;
      }

      // 3. Score Quality & Hype Detection (0 - 30 points)
      let qualityScore = 20; // default moderate score
      if (candidate.sourceType === 'ArXiv Paper' || candidate.sourceType === 'GitHub Release') {
        qualityScore += 10; // high empirical authority
      }

      // Hype penalty
      const HYPE_TERMS = ['celebrity', 'superficial', 'clickbait', 'regex fixes', 'solved by regex', 'will replace all', 'next tuesday'];
      let isHype = false;
      for (const hype of HYPE_TERMS) {
        if (text.includes(hype)) {
          isHype = true;
          break;
        }
      }

      if (isHype) {
        const rejectionReason = `Low Editorial Standard / Hype: Candidate "${candidate.title}" relies on unverified sensationalized claims or superficial solutions lacking technical rigor.`;
        rejections.push({
          candidateTitle: candidate.title,
          url: candidate.url,
          reason: rejectionReason,
          category: "Low Rigor / Hype"
        });
        Storage.saveRejection({
          agentId,
          candidateTitle: candidate.title,
          url: candidate.url,
          reason: rejectionReason,
          category: "Low Rigor / Hype"
        });
        continue;
      }

      // 4. Score Timeliness & Impact (0 - 30 points)
      let impactScore = 25;
      if (candidate.score && candidate.score > 100) impactScore += 5;

      const totalScore = relevanceScore + qualityScore + impactScore;

      // Acceptance Threshold
      if (totalScore < 50) {
        const rejectionReason = `Below Quality Threshold: Overall evaluation score (${totalScore}/100) did not meet minimum publication standards (>=50).`;
        rejections.push({
          candidateTitle: candidate.title,
          url: candidate.url,
          reason: rejectionReason,
          category: "Below Score Threshold"
        });
        Storage.saveRejection({
          agentId,
          candidateTitle: candidate.title,
          url: candidate.url,
          reason: rejectionReason,
          category: "Below Score Threshold"
        });
        continue;
      }

      scoredCandidates.push({
        candidate,
        totalScore,
        relevanceScore,
        qualityScore,
        impactScore,
        memoryContext: memoryResult.memoryContext
      });
    }

    // Sort valid candidates by score descending
    scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);

    if (scoredCandidates.length === 0) {
      return { winner: null, rejections };
    }

    // Pick top winner
    const winner = scoredCandidates[0];
    const otherCandidates = scoredCandidates.slice(1);

    // Record rejections for remaining lower-scoring candidates
    for (const alt of otherCandidates) {
      const rejectionReason = `Chosen Over By Higher Scoring Topic: Candidate scored ${alt.totalScore}/100, deferred in favor of "${winner.candidate.title}" (${winner.totalScore}/100).`;
      rejections.push({
        candidateTitle: alt.candidate.title,
        url: alt.candidate.url,
        reason: rejectionReason,
        category: "Deferred / Prioritized Other Topic"
      });
      Storage.saveRejection({
        agentId,
        candidateTitle: alt.candidate.title,
        url: alt.candidate.url,
        reason: rejectionReason,
        category: "Prioritization"
      });
    }

    // Formulate transparent rationale
    const rationale = this.generateRationale(winner, rejections, personaConfig);

    return {
      winner: {
        ...winner.candidate,
        evaluationScore: winner.totalScore,
        memoryContext: winner.memoryContext,
        rationale
      },
      rejections
    };
  },

  /**
   * Generates the detailed publishing rationale as required by API specification:
   * "Why the topic was selected, why it is relevant now, and why it was chosen over other candidates."
   */
  generateRationale(winner, rejections, personaConfig) {
    const candidate = winner.candidate;
    const score = winner.totalScore;

    const selectionReason = `Selected for deep alignment with ${personaConfig.name}'s focus as an ${personaConfig.title}. Technical relevance score: ${score}/100 based on verified ${candidate.sourceType} data.`;
    
    const relevanceNowReason = `Relevant now due to recent release/publication (${new Date(candidate.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}) directly addressing core challenges in ${personaConfig.domain}.`;

    let comparisonReason = `Chosen over ${rejections.length} alternative candidate topics evaluated in this editorial cycle.`;
    if (rejections.length > 0) {
      const topRejection = rejections[0];
      comparisonReason += ` Filtered out lower-scoring candidate "${topRejection.candidateTitle}" (${topRejection.reason.substring(0, 100)}...).`;
    }

    if (winner.memoryContext) {
      comparisonReason += ` ${winner.memoryContext}.`;
    }

    return `Why selected: ${selectionReason} Why relevant now: ${relevanceNowReason} Editorial Decision: ${comparisonReason}`;
  }
};
