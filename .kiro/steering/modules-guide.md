---
inclusion: always
---

# Context Flow — Module Specifications

## Module 1: Repository Scanner (`src/scanner/`)

### Purpose

Automatically understand repository structure before AI generates code.

### Responsibilities

- Detect project framework (React, React Native, Next.js, etc.)
- Map folder structure and architecture style
- Build dependency graph (imports, exports, relationships)
- Identify feature modules and shared utilities
- Detect naming conventions and design patterns

### Key Interfaces

```typescript
interface IRepositoryScanner {
  scan(workspaceRoot: string): Promise<RepositoryScanResult>;
  getFramework(): FrameworkInfo;
  getDependencyGraph(): DependencyGraph;
  getArchitectureStyle(): ArchitectureStyle;
}

interface RepositoryScanResult {
  readonly framework: FrameworkInfo;
  readonly structure: FolderStructure;
  readonly dependencies: DependencyGraph;
  readonly architecture: ArchitectureStyle;
  readonly conventions: NamingConventions;
  readonly modules: FeatureModule[];
}
```

### Performance Target

- Medium repo (< 500 files): < 3s
- Large repo (< 5000 files): < 10s

---

## Module 2: Context Engine (`src/context-engine/`)

### Purpose

Collect and score relevant files based on developer intent.

### Responsibilities

- Parse developer intent from natural language
- Score file relevance to the current task
- Collect related APIs, hooks, components, services
- Build minimal but complete context for AI prompts
- Respect token budget constraints

### Key Interfaces

```typescript
interface IContextEngine {
  buildContext(
    intent: string,
    options?: ContextOptions,
  ): Promise<ContextResult>;
  scoreRelevance(file: string, intent: string): number;
  getRelatedFiles(filePath: string): Promise<RelatedFiles>;
}

interface ContextResult {
  readonly files: ScoredFile[];
  readonly apis: APIReference[];
  readonly components: ComponentReference[];
  readonly hooks: HookReference[];
  readonly services: ServiceReference[];
  readonly types: TypeReference[];
  readonly tokenCount: number;
}
```

### Performance Target

- Context building: < 1s

---

## Module 3: Prompt Engine (`src/prompt-engine/`)

### Purpose

Automatically improve prompts before sending to AI providers.

### Responsibilities

- Inject coding standards and architecture rules
- Apply reusable prompt templates
- Optimize token usage (reduce unnecessary context)
- Support project-specific constraints and preferences
- Manage prompt template library

### Key Interfaces

```typescript
interface IPromptEngine {
  enhance(rawPrompt: string, context: ContextResult): Promise<EnhancedPrompt>;
  applyTemplates(prompt: string): string;
  optimizeTokens(content: string, budget: number): string;
  getTemplates(): PromptTemplate[];
  saveTemplate(template: PromptTemplate): Promise<void>;
}

interface EnhancedPrompt {
  readonly original: string;
  readonly enhanced: string;
  readonly context: ContextResult;
  readonly rules: AppliedRule[];
  readonly tokenCount: number;
  readonly provider: AIProviderType;
}
```

### Built-in Rules Examples

- "Use Zustand for state management"
- "Avoid inline styles"
- "Use React Query for data fetching"
- "Follow atomic design pattern"
- "Use strict TypeScript"

---

## Module 4: AI Providers (`src/ai-providers/`)

### Purpose

Abstract AI provider communication with unified interface.

### Responsibilities

- Provide unified interface for multiple AI providers
- Handle authentication and API key management
- Manage rate limiting and retries
- Stream responses for real-time feedback
- Track token usage and costs

### Supported Providers

- OpenAI (GPT-4, GPT-4o)
- Anthropic (Claude 3.5, Claude 4)
- Google (Gemini Pro, Gemini Ultra)
- Local LLMs (Ollama, LM Studio)

### Key Interfaces

```typescript
interface IAIProvider {
  readonly name: AIProviderType;
  readonly maxTokens: number;
  complete(prompt: EnhancedPrompt): Promise<AIResponse>;
  stream(prompt: EnhancedPrompt): AsyncIterable<AIStreamChunk>;
  estimateTokens(content: string): number;
  validateApiKey(): Promise<boolean>;
}

interface IAIProviderRegistry {
  register(provider: IAIProvider): void;
  get(name: AIProviderType): IAIProvider;
  getActive(): IAIProvider;
  setActive(name: AIProviderType): void;
}
```

---

## Module 5: Validators (`src/validators/`)

### Purpose

Validate AI-generated code against project standards.

### Responsibilities

- Architecture validation (imports, folder placement, patterns)
- React/React Native performance validation
- Security validation (exposed secrets, unsafe APIs)
- Suggest refactoring improvements

### Key Interfaces

```typescript
interface IValidator {
  readonly name: string;
  readonly category: ValidatorCategory;
  validate(code: string, context: ValidationContext): Promise<ValidationResult>;
}

interface IValidationEngine {
  registerValidator(validator: IValidator): void;
  validateCode(
    code: string,
    context: ValidationContext,
  ): Promise<ValidationReport>;
  getSuggestions(report: ValidationReport): RefactorSuggestion[];
}

interface ValidationReport {
  readonly issues: ValidationIssue[];
  readonly suggestions: RefactorSuggestion[];
  readonly score: number; // 0-100
  readonly passed: boolean;
}
```

### Validator Categories

- `architecture` — imports, folder structure, module boundaries
- `performance` — re-renders, memoization, lazy loading
- `security` — secrets, unsafe APIs, insecure storage
- `style` — naming, formatting, conventions

---

## Module 6: Memory Engine (`src/memory-engine/`)

### Purpose

Create long-term repository intelligence and session memory.

### Responsibilities

- Build and maintain knowledge graph of code relationships
- Store AI session history (prompts, responses, decisions)
- Surface recommendations based on past solutions
- Track architecture decisions over time

### Key Interfaces

```typescript
interface IMemoryEngine {
  storeSession(session: AISession): Promise<void>;
  getRecommendations(intent: string): Promise<Recommendation[]>;
  getKnowledgeGraph(): Promise<KnowledgeGraph>;
  search(query: string): Promise<MemorySearchResult[]>;
}

interface KnowledgeGraph {
  readonly nodes: GraphNode[]; // screens, APIs, services, modules
  readonly edges: GraphEdge[]; // relationships between nodes
  query(filter: GraphFilter): GraphNode[];
}
```

### Storage Strategy (MVP)

- SQLite for structured data (sessions, metadata)
- JSON files for knowledge graph cache
- In-memory LRU cache for hot data

---

## Module 7: UI (`src/ui/`)

### Purpose

Provide developer-facing UI panels within VS Code.

### Responsibilities

- AI Chat Panel (primary interaction surface)
- Validation Results Panel
- Context Viewer (show what context was collected)
- Settings & Configuration UI
- Repository Health Score display

### Technology

- React 18+ with functional components
- Tailwind CSS for styling
- VS Code Webview UI Toolkit for native components
- Message passing via `postMessage` / `onDidReceiveMessage`

---

## Module 8: Telemetry (`src/telemetry/`)

### Purpose

Track usage, performance, and provide governance data.

### Responsibilities

- Track AI token usage and costs
- Monitor extension performance metrics
- Generate audit logs for enterprise
- Respect user privacy preferences (opt-in only)

### Key Interfaces

```typescript
interface ITelemetryService {
  trackEvent(event: TelemetryEvent): void;
  trackAIUsage(usage: AIUsageRecord): void;
  getUsageReport(range: DateRange): Promise<UsageReport>;
  isEnabled(): boolean;
}
```

---

## Module 9: Shared (`src/shared/`)

### Purpose

Common types, interfaces, utilities, and constants used across modules.

### Contents

- `types/` — Shared TypeScript types and interfaces
- `utils/` — Pure utility functions
- `constants.ts` — Application-wide constants
- `errors.ts` — Custom error classes
- `events.ts` — Event bus implementation
- `logger.ts` — Logging abstraction
