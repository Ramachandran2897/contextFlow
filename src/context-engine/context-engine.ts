import type {
  ContextOptions,
  ContextResult,
  RelatedFiles,
  ScoredFile,
  APIReference,
  ComponentReference,
  HookReference,
  ServiceReference,
  TypeReference,
} from '../shared/types/index';
import { ContextEngineError } from '../shared/errors';
import { Logger } from '../shared/logger';
import { DEFAULT_TOKEN_BUDGET, MAX_CONTEXT_FILES } from '../shared/constants';
import { estimateTokenCount } from '../shared/utils/index';
import type { IRepositoryScanner } from '../scanner/interfaces';
import type { IContextEngine } from './interfaces';

const MODULE = 'context-engine';

export class ContextEngine implements IContextEngine {
  private readonly _logger = Logger.getInstance();

  constructor(private readonly _scanner: IRepositoryScanner) {}

  async buildContext(intent: string, options?: ContextOptions): Promise<ContextResult> {
    this._logger.info(MODULE, `Building context for intent: "${intent}"`);

    const maxTokens = options?.maxTokens ?? DEFAULT_TOKEN_BUDGET;
    const scanResult = this._scanner.getLastScanResult();

    if (!scanResult) {
      throw new ContextEngineError(
        'Repository has not been scanned yet. Run scan first.',
        'NO_SCAN_RESULT',
      );
    }

    try {
      const files = await this._collectRelevantFiles(intent, maxTokens);
      const apis = this._extractAPIs(intent, files);
      const components = this._extractComponents(intent, files);
      const hooks = this._extractHooks(intent, files);
      const services = this._extractServices(intent, files);
      const types = this._extractTypes(intent, files);

      const allContent = files.map((f) => f.content ?? '').join('\n');
      const tokenCount = estimateTokenCount(allContent);

      const result: ContextResult = {
        files,
        apis,
        components,
        hooks,
        services,
        types,
        tokenCount,
      };

      this._logger.info(MODULE, 'Context built', {
        fileCount: files.length,
        tokenCount,
        maxTokens,
      });

      return result;
    } catch (error) {
      if (error instanceof ContextEngineError) throw error;
      throw new ContextEngineError(
        `Failed to build context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BUILD_FAILED',
        error instanceof Error ? error : undefined,
      );
    }
  }

  scoreRelevance(file: string, intent: string): number {
    const fileName = file.toLowerCase();
    const intentWords = intent.toLowerCase().split(/\s+/);

    let score = 0;

    for (const word of intentWords) {
      if (word.length < 3) continue;
      if (fileName.includes(word)) {
        score += 10;
      }
    }

    // Boost common patterns
    if (fileName.includes('service')) score += 3;
    if (fileName.includes('hook') || fileName.startsWith('use')) score += 3;
    if (fileName.includes('component')) score += 2;
    if (fileName.includes('type') || fileName.includes('interface')) score += 2;
    if (fileName.includes('api')) score += 3;
    if (fileName.includes('index')) score += 1;

    return Math.min(score, 100);
  }

  async getRelatedFiles(filePath: string): Promise<RelatedFiles> {
    // Placeholder — will use dependency graph from scanner
    this._logger.debug(MODULE, `Getting related files for: ${filePath}`);
    return {
      imports: [],
      importedBy: [],
      sameModule: [],
    };
  }

  private async _collectRelevantFiles(intent: string, _maxTokens: number): Promise<ScoredFile[]> {
    // Placeholder implementation — will be enhanced with ts-morph analysis
    const scanResult = this._scanner.getLastScanResult();
    if (!scanResult) return [];

    const files: ScoredFile[] = [];

    // Score and collect files based on intent keywords
    // This will be significantly enhanced in Phase 2
    return files.slice(0, MAX_CONTEXT_FILES);
  }

  private _extractAPIs(_intent: string, _files: ScoredFile[]): APIReference[] {
    return [];
  }

  private _extractComponents(_intent: string, _files: ScoredFile[]): ComponentReference[] {
    return [];
  }

  private _extractHooks(_intent: string, _files: ScoredFile[]): HookReference[] {
    return [];
  }

  private _extractServices(_intent: string, _files: ScoredFile[]): ServiceReference[] {
    return [];
  }

  private _extractTypes(_intent: string, _files: ScoredFile[]): TypeReference[] {
    return [];
  }
}
