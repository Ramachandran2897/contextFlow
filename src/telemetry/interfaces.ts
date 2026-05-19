import type { TelemetryEvent, AIUsageRecord, DateRange, UsageReport } from '../shared/types/index';

/**
 * Telemetry service interface.
 * Tracks usage, performance, and provides governance data.
 * Respects user privacy preferences (opt-in only).
 */
export interface ITelemetryService {
  trackEvent(event: TelemetryEvent): void;
  trackAIUsage(usage: AIUsageRecord): void;
  getUsageReport(range: DateRange): Promise<UsageReport>;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
}
