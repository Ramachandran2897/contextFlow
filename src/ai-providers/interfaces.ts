import type {
  AIProviderType,
  AIResponse,
  AIStreamChunk,
  EnhancedPrompt,
} from '../shared/types/index';

/**
 * AI provider interface.
 * Each provider (OpenAI, Anthropic, Gemini, Local) implements this.
 */
export interface IAIProvider {
  readonly name: AIProviderType;
  readonly maxTokens: number;
  complete(prompt: EnhancedPrompt): Promise<AIResponse>;
  stream(prompt: EnhancedPrompt): AsyncIterable<AIStreamChunk>;
  estimateTokens(content: string): number;
  validateApiKey(): Promise<boolean>;
}

/**
 * Registry for managing multiple AI providers.
 */
export interface IAIProviderRegistry {
  register(provider: IAIProvider): void;
  get(name: AIProviderType): IAIProvider | undefined;
  getActive(): IAIProvider;
  setActive(name: AIProviderType): void;
  getAvailable(): AIProviderType[];
}
