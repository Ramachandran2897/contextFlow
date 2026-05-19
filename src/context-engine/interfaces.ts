import type { ContextOptions, ContextResult, RelatedFiles } from '../shared/types/index';

/**
 * Context engine interface.
 * Responsible for collecting and scoring relevant files based on developer intent.
 */
export interface IContextEngine {
  buildContext(intent: string, options?: ContextOptions): Promise<ContextResult>;
  scoreRelevance(file: string, intent: string): number;
  getRelatedFiles(filePath: string): Promise<RelatedFiles>;
}
