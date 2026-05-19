import type {
  ContextResult,
  EnhancedPrompt,
  PromptTemplate,
  AppliedRule,
  AIProviderType,
} from '../shared/types/index';
import { PromptEngineError } from '../shared/errors';
import { Logger } from '../shared/logger';
import { estimateTokenCount, truncateToTokenBudget } from '../shared/utils/index';
import { DEFAULT_TOKEN_BUDGET } from '../shared/constants';
import type { IPromptEngine } from './interfaces';
import { BUILT_IN_TEMPLATES } from './templates';

const MODULE = 'prompt-engine';

export class PromptEngine implements IPromptEngine {
  private readonly _logger = Logger.getInstance();
  private _customTemplates: PromptTemplate[] = [];
  private _activeProvider: AIProviderType = 'openai';

  setActiveProvider(provider: AIProviderType): void {
    this._activeProvider = provider;
  }

  async enhance(rawPrompt: string, context: ContextResult): Promise<EnhancedPrompt> {
    this._logger.info(MODULE, `Enhancing prompt: "${rawPrompt.slice(0, 50)}..."`);

    try {
      // Apply templates and rules
      const withTemplates = this.applyTemplates(rawPrompt);
      const rules = this._collectApplicableRules(rawPrompt);

      // Build enhanced prompt with context
      const contextSection = this._buildContextSection(context);
      const rulesSection = this._buildRulesSection(rules);

      const enhanced = [rulesSection, contextSection, '## Developer Request', withTemplates]
        .filter(Boolean)
        .join('\n\n');

      const optimized = this.optimizeTokens(enhanced, DEFAULT_TOKEN_BUDGET);
      const tokenCount = estimateTokenCount(optimized);

      const result: EnhancedPrompt = {
        original: rawPrompt,
        enhanced: optimized,
        context,
        rules,
        tokenCount,
        provider: this._activeProvider,
      };

      this._logger.info(MODULE, 'Prompt enhanced', {
        originalLength: rawPrompt.length,
        enhancedLength: optimized.length,
        tokenCount,
        rulesApplied: rules.length,
      });

      return result;
    } catch (error) {
      throw new PromptEngineError(
        `Failed to enhance prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ENHANCE_FAILED',
        error instanceof Error ? error : undefined,
      );
    }
  }

  applyTemplates(prompt: string): string {
    let enhanced = prompt;
    const allTemplates = [...BUILT_IN_TEMPLATES, ...this._customTemplates];

    for (const template of allTemplates) {
      // Check if template keywords match the prompt
      const keywords = template.name.toLowerCase().split(' ');
      const promptLower = prompt.toLowerCase();
      const isRelevant = keywords.some((kw) => promptLower.includes(kw));

      if (isRelevant) {
        enhanced += `\n${template.content}`;
      }
    }

    return enhanced;
  }

  optimizeTokens(content: string, budget: number): string {
    return truncateToTokenBudget(content, budget);
  }

  getTemplates(): PromptTemplate[] {
    return [...BUILT_IN_TEMPLATES, ...this._customTemplates];
  }

  async saveTemplate(template: PromptTemplate): Promise<void> {
    const existingIndex = this._customTemplates.findIndex((t) => t.id === template.id);
    if (existingIndex >= 0) {
      this._customTemplates[existingIndex] = template;
    } else {
      this._customTemplates.push(template);
    }
    this._logger.info(MODULE, `Template saved: ${template.name}`);
  }

  async deleteTemplate(id: string): Promise<void> {
    this._customTemplates = this._customTemplates.filter((t) => t.id !== id);
    this._logger.info(MODULE, `Template deleted: ${id}`);
  }

  private _collectApplicableRules(_prompt: string): AppliedRule[] {
    const rules: AppliedRule[] = [];

    // Built-in rules always applied
    rules.push({
      name: 'TypeScript Strict',
      content: 'Use TypeScript strict mode. No any types.',
      source: 'built-in',
    });

    return rules;
  }

  private _buildContextSection(context: ContextResult): string {
    if (context.files.length === 0) return '';

    const lines = ['## Project Context'];

    if (context.components.length > 0) {
      lines.push(`\nAvailable Components: ${context.components.map((c) => c.name).join(', ')}`);
    }
    if (context.hooks.length > 0) {
      lines.push(`Available Hooks: ${context.hooks.map((h) => h.name).join(', ')}`);
    }
    if (context.services.length > 0) {
      lines.push(`Available Services: ${context.services.map((s) => s.name).join(', ')}`);
    }
    if (context.apis.length > 0) {
      lines.push(`Available APIs: ${context.apis.map((a) => a.name).join(', ')}`);
    }

    for (const file of context.files.slice(0, 5)) {
      if (file.content) {
        lines.push(`\n### ${file.path}\n\`\`\`\n${file.content}\n\`\`\``);
      }
    }

    return lines.join('\n');
  }

  private _buildRulesSection(rules: AppliedRule[]): string {
    if (rules.length === 0) return '';

    const lines = ['## Project Rules'];
    for (const rule of rules) {
      lines.push(`- ${rule.content}`);
    }
    return lines.join('\n');
  }
}
