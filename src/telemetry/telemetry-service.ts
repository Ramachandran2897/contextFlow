import type {
  TelemetryEvent,
  AIUsageRecord,
  DateRange,
  UsageReport,
  AIProviderType,
} from '../shared/types/index';
import { Logger } from '../shared/logger';
import type { ITelemetryService } from './interfaces';

const MODULE = 'telemetry';

/**
 * Telemetry service implementation.
 * All tracking is opt-in only. No data is collected without explicit user consent.
 */
export class TelemetryService implements ITelemetryService {
  private _enabled = false;
  private readonly _events: TelemetryEvent[] = [];
  private readonly _usageRecords: AIUsageRecord[] = [];
  private readonly _logger = Logger.getInstance();

  trackEvent(event: TelemetryEvent): void {
    if (!this._enabled) return;
    this._events.push(event);
    this._logger.debug(MODULE, `Event tracked: ${event.name}`);
  }

  trackAIUsage(usage: AIUsageRecord): void {
    if (!this._enabled) return;
    this._usageRecords.push(usage);
    this._logger.debug(
      MODULE,
      `AI usage tracked: ${usage.provider} - ${usage.tokenUsage.totalTokens} tokens`,
    );
  }

  async getUsageReport(range: DateRange): Promise<UsageReport> {
    const filtered = this._usageRecords.filter(
      (r) => r.timestamp >= range.start && r.timestamp <= range.end,
    );

    const byProvider: Record<AIProviderType, { tokens: number; cost: number }> = {
      openai: { tokens: 0, cost: 0 },
      anthropic: { tokens: 0, cost: 0 },
      gemini: { tokens: 0, cost: 0 },
      local: { tokens: 0, cost: 0 },
    };

    let totalTokens = 0;
    let totalCost = 0;

    for (const record of filtered) {
      totalTokens += record.tokenUsage.totalTokens;
      totalCost += record.cost;
      const providerStats = byProvider[record.provider];
      providerStats.tokens += record.tokenUsage.totalTokens;
      providerStats.cost += record.cost;
    }

    return {
      totalTokens,
      totalCost,
      byProvider,
      sessionCount: filtered.length,
      range,
    };
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
    this._logger.info(MODULE, `Telemetry ${enabled ? 'enabled' : 'disabled'}`);
  }
}
