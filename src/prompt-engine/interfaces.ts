import type { ContextResult, EnhancedPrompt, PromptTemplate } from '../shared/types/index';

/**
 * Prompt engine interface.
 * Responsible for enhancing prompts with project context and rules.
 */
export interface IPromptEngine {
  enhance(rawPrompt: string, context: ContextResult): Promise<EnhancedPrompt>;
  applyTemplates(prompt: string): string;
  optimizeTokens(content: string, budget: number): string;
  getTemplates(): PromptTemplate[];
  saveTemplate(template: PromptTemplate): Promise<void>;
  deleteTemplate(id: string): Promise<void>;
}
