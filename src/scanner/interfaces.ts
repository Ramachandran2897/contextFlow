import type {
  DependencyGraph,
  FrameworkInfo,
  RepositoryScanResult,
  ArchitectureStyle,
} from '../shared/types/index';

/**
 * Repository scanner interface.
 * Responsible for analyzing workspace structure, framework, and dependencies.
 */
export interface IRepositoryScanner {
  scan(workspaceRoot: string): Promise<RepositoryScanResult>;
  getFramework(): FrameworkInfo | undefined;
  getDependencyGraph(): DependencyGraph | undefined;
  getArchitectureStyle(): ArchitectureStyle | undefined;
  getLastScanResult(): RepositoryScanResult | undefined;
  invalidateCache(): void;
}
