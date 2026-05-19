import * as vscode from 'vscode';
import type {
  AIProviderType,
  AIResponse,
  AIStreamChunk,
  EnhancedPrompt,
} from '../shared/types/index';
import { AIProviderError } from '../shared/errors';
import { Logger } from '../shared/logger';
import { estimateTokenCount } from '../shared/utils/index';
import type { IAIProvider } from './interfaces';

const MODULE = 'ai-providers:openai';

/**
 * OpenAI provider implementation.
 * Uses VS Code SecretStorage for API key management.
 */
export class OpenAIProvider implements IAIProvider {
  readonly name: AIProviderType = 'openai';
  readonly maxTokens = 128000;
  private readonly _logger = Logger.getInstance();
  private _secretStorage: vscode.SecretStorage | undefined;

  setSecretStorage(storage: vscode.SecretStorage): void {
    this._secretStorage = storage;
  }

  async complete(prompt: EnhancedPrompt): Promise<AIResponse> {
    const apiKey = await this._getApiKey();
    if (!apiKey) {
      throw new AIProviderError('OpenAI API key not configured', 'NO_API_KEY');
    }

    this._logger.info(MODULE, 'Sending completion request');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an expert software developer.' },
            { role: 'user', content: prompt.enhanced },
          ],
          max_tokens: 4096,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new AIProviderError(
          `OpenAI API error: ${response.status} ${response.statusText}`,
          'API_ERROR',
        );
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string }; finish_reason: string }>;
        usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
        model: string;
      };

      const choice = data.choices[0];
      if (!choice) {
        throw new AIProviderError('No response from OpenAI', 'EMPTY_RESPONSE');
      }

      return {
        content: choice.message.content,
        model: data.model,
        provider: 'openai',
        tokenUsage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        finishReason: choice.finish_reason === 'stop' ? 'stop' : 'length',
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(
        `OpenAI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REQUEST_FAILED',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async *stream(prompt: EnhancedPrompt): AsyncIterable<AIStreamChunk> {
    const apiKey = await this._getApiKey();
    if (!apiKey) {
      throw new AIProviderError('OpenAI API key not configured', 'NO_API_KEY');
    }

    this._logger.info(MODULE, 'Starting stream request');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert software developer.' },
          { role: 'user', content: prompt.enhanced },
        ],
        max_tokens: 4096,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new AIProviderError(`OpenAI stream error: ${response.status}`, 'STREAM_ERROR');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          yield { content: '', done: true };
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }

          try {
            const parsed = JSON.parse(data) as {
              choices: Array<{ delta: { content?: string } }>;
            };
            const content = parsed.choices[0]?.delta?.content ?? '';
            if (content) {
              yield { content, done: false };
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  estimateTokens(content: string): number {
    return estimateTokenCount(content);
  }

  async validateApiKey(): Promise<boolean> {
    const apiKey = await this._getApiKey();
    if (!apiKey) return false;

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async _getApiKey(): Promise<string | undefined> {
    if (!this._secretStorage) return undefined;
    return this._secretStorage.get('contextFlow.openaiApiKey');
  }
}
