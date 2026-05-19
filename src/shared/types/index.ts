// ─── AI Provider Types ───────────────────────────────────────────────────────

export type AIProviderType = 'openai' | 'anthropic' | 'gemini' | 'local';

export interface AIResponse {
  readonly content: string;
  readonly model: string;
  readonly provider: AIProviderType;
  readonly tokenUsage: TokenUsage;
  readonly finishReason: 'stop' | 'length' | 'error';
}

export interface AIStreamChunk {
  readonly content: string;
  readonly done: boolean;
}

export interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

// ─── Scanner Types ───────────────────────────────────────────────────────────

export type FrameworkType =
  | 'react'
  | 'react-native'
  | 'nextjs'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'node'
  | 'unknown';

export type ArchitectureStyle =
  | 'feature-based'
  | 'layer-based'
  | 'atomic'
  | 'mvc'
  | 'clean'
  | 'unknown';

export interface FrameworkInfo {
  readonly type: FrameworkType;
  readonly version: string;
  readonly language: 'typescript' | 'javascript';
  readonly packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
}

export interface FolderStructure {
  readonly root: string;
  readonly srcDir: string;
  readonly directories: DirectoryNode[];
  readonly totalFiles: number;
}

export interface DirectoryNode {
  readonly path: string;
  readonly name: string;
  readonly children: DirectoryNode[];
  readonly fileCount: number;
}

export interface DependencyGraph {
  readonly nodes: DependencyNode[];
  readonly edges: DependencyEdge[];
}

export interface DependencyNode {
  readonly id: string;
  readonly filePath: string;
  readonly type: 'component' | 'hook' | 'service' | 'util' | 'type' | 'screen' | 'api';
}

export interface DependencyEdge {
  readonly source: string;
  readonly target: string;
  readonly type: 'import' | 'export' | 'extends' | 'implements';
}

export interface NamingConventions {
  readonly fileNaming: 'kebab-case' | 'camelCase' | 'PascalCase' | 'mixed';
  readonly componentNaming: 'PascalCase' | 'camelCase';
  readonly hookPrefix: boolean;
  readonly indexBarrels: boolean;
}

export interface FeatureModule {
  readonly name: string;
  readonly path: string;
  readonly files: string[];
  readonly dependencies: string[];
}

export interface RepositoryScanResult {
  readonly framework: FrameworkInfo;
  readonly structure: FolderStructure;
  readonly dependencies: DependencyGraph;
  readonly architecture: ArchitectureStyle;
  readonly conventions: NamingConventions;
  readonly modules: FeatureModule[];
  readonly scannedAt: Date;
}

// ─── Context Engine Types ────────────────────────────────────────────────────

export interface ContextOptions {
  readonly maxTokens?: number;
  readonly includeTypes?: boolean;
  readonly includeTests?: boolean;
  readonly depth?: number;
}

export interface ScoredFile {
  readonly path: string;
  readonly score: number;
  readonly reason: string;
  readonly content?: string;
}

export interface APIReference {
  readonly name: string;
  readonly path: string;
  readonly method: string;
  readonly endpoint?: string;
}

export interface ComponentReference {
  readonly name: string;
  readonly path: string;
  readonly props: string[];
}

export interface HookReference {
  readonly name: string;
  readonly path: string;
  readonly returnType: string;
}

export interface ServiceReference {
  readonly name: string;
  readonly path: string;
  readonly methods: string[];
}

export interface TypeReference {
  readonly name: string;
  readonly path: string;
  readonly kind: 'interface' | 'type' | 'enum' | 'class';
}

export interface RelatedFiles {
  readonly imports: string[];
  readonly importedBy: string[];
  readonly sameModule: string[];
}

export interface ContextResult {
  readonly files: ScoredFile[];
  readonly apis: APIReference[];
  readonly components: ComponentReference[];
  readonly hooks: HookReference[];
  readonly services: ServiceReference[];
  readonly types: TypeReference[];
  readonly tokenCount: number;
}

// ─── Prompt Engine Types ─────────────────────────────────────────────────────

export interface PromptTemplate {
  readonly id: string;
  readonly name: string;
  readonly content: string;
  readonly category: string;
  readonly isBuiltIn: boolean;
}

export interface AppliedRule {
  readonly name: string;
  readonly content: string;
  readonly source: 'built-in' | 'project' | 'user';
}

export interface EnhancedPrompt {
  readonly original: string;
  readonly enhanced: string;
  readonly context: ContextResult;
  readonly rules: AppliedRule[];
  readonly tokenCount: number;
  readonly provider: AIProviderType;
}

// ─── Validator Types ─────────────────────────────────────────────────────────

export type ValidatorCategory = 'architecture' | 'performance' | 'security' | 'style';

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface ValidationContext {
  readonly filePath: string;
  readonly framework: FrameworkType;
  readonly architecture: ArchitectureStyle;
  readonly scanResult?: RepositoryScanResult;
}

export interface ValidationIssue {
  readonly message: string;
  readonly severity: IssueSeverity;
  readonly category: ValidatorCategory;
  readonly line?: number;
  readonly column?: number;
  readonly suggestion?: string;
}

export interface RefactorSuggestion {
  readonly title: string;
  readonly description: string;
  readonly category: ValidatorCategory;
  readonly priority: 'high' | 'medium' | 'low';
}

export interface ValidationResult {
  readonly issues: ValidationIssue[];
  readonly passed: boolean;
}

export interface ValidationReport {
  readonly issues: ValidationIssue[];
  readonly suggestions: RefactorSuggestion[];
  readonly score: number;
  readonly passed: boolean;
}

// ─── Memory Engine Types ─────────────────────────────────────────────────────

export interface AISession {
  readonly id: string;
  readonly prompt: string;
  readonly response: string;
  readonly provider: AIProviderType;
  readonly tokenUsage: TokenUsage;
  readonly timestamp: Date;
  readonly context?: ContextResult;
}

export interface Recommendation {
  readonly title: string;
  readonly description: string;
  readonly relatedFile: string;
  readonly confidence: number;
}

export interface GraphNode {
  readonly id: string;
  readonly label: string;
  readonly type: 'screen' | 'api' | 'service' | 'module' | 'component' | 'hook';
  readonly path: string;
}

export interface GraphEdge {
  readonly source: string;
  readonly target: string;
  readonly relationship: 'uses' | 'implements' | 'extends' | 'navigates-to' | 'calls';
}

export interface GraphFilter {
  readonly type?: GraphNode['type'];
  readonly relationship?: GraphEdge['relationship'];
}

export interface KnowledgeGraph {
  readonly nodes: GraphNode[];
  readonly edges: GraphEdge[];
}

export interface MemorySearchResult {
  readonly session: AISession;
  readonly relevance: number;
}

// ─── Telemetry Types ─────────────────────────────────────────────────────────

export interface TelemetryEvent {
  readonly name: string;
  readonly properties?: Record<string, string | number | boolean>;
  readonly timestamp: Date;
}

export interface AIUsageRecord {
  readonly provider: AIProviderType;
  readonly model: string;
  readonly tokenUsage: TokenUsage;
  readonly cost: number;
  readonly timestamp: Date;
}

export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

export interface UsageReport {
  readonly totalTokens: number;
  readonly totalCost: number;
  readonly byProvider: Record<AIProviderType, { tokens: number; cost: number }>;
  readonly sessionCount: number;
  readonly range: DateRange;
}
