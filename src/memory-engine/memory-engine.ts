import type {
  AISession,
  Recommendation,
  KnowledgeGraph,
  MemorySearchResult,
} from '../shared/types/index';
import { MemoryEngineError } from '../shared/errors';
import { Logger } from '../shared/logger';
import type { IMemoryEngine } from './interfaces';

const MODULE = 'memory-engine';
const MAX_SESSIONS = 100;

/**
 * In-memory implementation of the memory engine.
 * MVP uses in-memory storage with JSON file persistence.
 * Will be upgraded to SQLite in Phase 3.
 */
export class MemoryEngine implements IMemoryEngine {
  private readonly _sessions: AISession[] = [];
  private readonly _logger = Logger.getInstance();

  async storeSession(session: AISession): Promise<void> {
    this._logger.info(MODULE, `Storing session: ${session.id}`);

    this._sessions.unshift(session);

    // Keep only the most recent sessions
    if (this._sessions.length > MAX_SESSIONS) {
      this._sessions.splice(MAX_SESSIONS);
    }
  }

  async getRecommendations(intent: string): Promise<Recommendation[]> {
    this._logger.debug(MODULE, `Getting recommendations for: "${intent}"`);

    const recommendations: Recommendation[] = [];
    const intentWords = intent.toLowerCase().split(/\s+/);

    for (const session of this._sessions) {
      const promptWords = session.prompt.toLowerCase().split(/\s+/);
      const overlap = intentWords.filter((w) => promptWords.includes(w)).length;

      if (overlap >= 2) {
        recommendations.push({
          title: `Similar request found`,
          description: `Previous prompt: "${session.prompt.slice(0, 100)}..."`,
          relatedFile: '',
          confidence: Math.min(overlap / intentWords.length, 1),
        });
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  async getKnowledgeGraph(): Promise<KnowledgeGraph> {
    // Placeholder — will be built from scan results and session history
    return { nodes: [], edges: [] };
  }

  async search(query: string): Promise<MemorySearchResult[]> {
    this._logger.debug(MODULE, `Searching memory: "${query}"`);

    const queryLower = query.toLowerCase();
    const results: MemorySearchResult[] = [];

    for (const session of this._sessions) {
      const promptMatch = session.prompt.toLowerCase().includes(queryLower);
      const responseMatch = session.response.toLowerCase().includes(queryLower);

      if (promptMatch || responseMatch) {
        results.push({
          session,
          relevance: promptMatch ? 0.8 : 0.5,
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }

  async getSessions(limit = 20): Promise<AISession[]> {
    return this._sessions.slice(0, limit);
  }

  async clearSessions(): Promise<void> {
    this._sessions.length = 0;
    this._logger.info(MODULE, 'All sessions cleared');
  }
}
