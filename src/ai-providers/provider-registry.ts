import type { AIProviderType } from '../shared/types/index';
import { AIProviderError } from '../shared/errors';
import { Logger } from '../shared/logger';
import type { IAIProvider, IAIProviderRegistry } from './interfaces';

const MODULE = 'ai-providers';

export class AIProviderRegistry implements IAIProviderRegistry {
  private readonly _providers = new Map<AIProviderType, IAIProvider>();
  private _activeProvider: AIProviderType = 'openai';
  private readonly _logger = Logger.getInstance();

  register(provider: IAIProvider): void {
    this._providers.set(provider.name, provider);
    this._logger.info(MODULE, `Provider registered: ${provider.name}`);
  }

  get(name: AIProviderType): IAIProvider | undefined {
    return this._providers.get(name);
  }

  getActive(): IAIProvider {
    const provider = this._providers.get(this._activeProvider);
    if (!provider) {
      throw new AIProviderError(
        `Active provider "${this._activeProvider}" is not registered`,
        'PROVIDER_NOT_FOUND',
      );
    }
    return provider;
  }

  setActive(name: AIProviderType): void {
    if (!this._providers.has(name)) {
      throw new AIProviderError(`Provider "${name}" is not registered`, 'PROVIDER_NOT_FOUND');
    }
    this._activeProvider = name;
    this._logger.info(MODULE, `Active provider set to: ${name}`);
  }

  getAvailable(): AIProviderType[] {
    return Array.from(this._providers.keys());
  }
}
