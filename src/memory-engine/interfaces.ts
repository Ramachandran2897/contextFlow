import type {
  AISession,
  Recommendation,
  KnowledgeGraph,
  MemorySearchResult,
} from '../shared/types/index';

/**
 * Memory engine interface.
 * Responsible for long-term repository intelligence and session memory.
 */
export interface IMemoryEngine {
  storeSession(session: AISession): Promise<void>;
  getRecommendations(intent: string): Promise<Recommendation[]>;
  getKnowledgeGraph(): Promise<KnowledgeGraph>;
  search(query: string): Promise<MemorySearchResult[]>;
  getSessions(limit?: number): Promise<AISession[]>;
  clearSessions(): Promise<void>;
}
