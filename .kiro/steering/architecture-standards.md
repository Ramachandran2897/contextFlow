---
inclusion: always
---

# Context Flow — Architecture & Coding Standards

## Folder Structure

```
src/
├── extension/          # VS Code extension entry point, activation, commands
├── scanner/            # Repository scanning, framework detection, dependency graph
├── context-engine/     # Context collection, file relevance scoring
├── prompt-engine/      # Prompt enhancement, template management, token optimization
├── ai-providers/       # AI provider abstraction (OpenAI, Anthropic, Gemini)
├── validators/         # AI output validation (architecture, performance, security)
├── memory-engine/      # Knowledge graph, session memory, recommendations
├── ui/                 # Webview panels (React + Tailwind CSS)
├── telemetry/          # Usage tracking, analytics, audit logs
└── shared/             # Types, interfaces, utilities, constants
```

## Module Boundaries

Each module MUST:

- Export through a single `index.ts` barrel file
- Define its public API via TypeScript interfaces
- Not import directly from another module's internal files
- Communicate with other modules via dependency injection or events

## TypeScript Standards

- **Strict mode** enabled (`strict: true` in tsconfig)
- **No `any` types** — use `unknown` with type guards when type is uncertain
- **Explicit return types** on all exported functions
- **Interface-first design** — define interfaces before implementations
- **Readonly by default** — use `readonly` for properties that shouldn't change
- **Discriminated unions** over type assertions
- **Exhaustive switch** statements with `never` type checking

## Naming Conventions

| Element         | Convention                 | Example                 |
| --------------- | -------------------------- | ----------------------- |
| Files           | kebab-case                 | `repository-scanner.ts` |
| Classes         | PascalCase                 | `RepositoryScanner`     |
| Interfaces      | PascalCase with `I` prefix | `IRepositoryScanner`    |
| Types           | PascalCase                 | `ScanResult`            |
| Functions       | camelCase                  | `scanRepository()`      |
| Constants       | UPPER_SNAKE_CASE           | `MAX_SCAN_DEPTH`        |
| Enums           | PascalCase (members too)   | `ScanStatus.Complete`   |
| Private members | camelCase with `_` prefix  | `_cache`                |

## Design Patterns

### Dependency Injection

All services receive dependencies through constructor injection:

```typescript
interface IContextEngine {
  buildContext(intent: string): Promise<ContextResult>;
}

class ContextEngine implements IContextEngine {
  constructor(
    private readonly _scanner: IRepositoryScanner,
    private readonly _memory: IMemoryEngine,
  ) {}
}
```

### Provider Pattern (AI Providers)

```typescript
interface IAIProvider {
  readonly name: string;
  complete(prompt: EnhancedPrompt): Promise<AIResponse>;
  estimateTokens(content: string): number;
}
```

### Event-Driven Communication

Modules emit events for cross-cutting concerns:

```typescript
interface IEventBus {
  emit<T>(event: string, data: T): void;
  on<T>(event: string, handler: (data: T) => void): Disposable;
}
```

### Repository Pattern (Storage)

```typescript
interface IRepository<T> {
  get(id: string): Promise<T | undefined>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(filter?: Partial<T>): Promise<T[]>;
}
```

## Error Handling

- Use custom error classes extending `Error`
- Never throw raw strings
- Catch errors at module boundaries
- Log errors with context (module, operation, relevant data)
- Degrade gracefully — never crash the extension

```typescript
class ContextFlowError extends Error {
  constructor(
    message: string,
    readonly module: string,
    readonly code: string,
    readonly cause?: Error,
  ) {
    super(message);
    this.name = "ContextFlowError";
  }
}
```

## Import Rules

- Use path aliases (`@scanner/`, `@context-engine/`, etc.)
- No relative imports crossing module boundaries
- Group imports: VS Code API → external packages → internal modules → local files
- No circular imports (enforced by tooling)

## VS Code Extension Best Practices

- Register all disposables in `ExtensionContext.subscriptions`
- Use `workspace.getConfiguration()` for settings
- Store secrets in `SecretStorage`, never in settings
- Lazy-load heavy modules (tree-sitter, ts-morph)
- Use `OutputChannel` for logging, not `console.log`
- Support multi-root workspaces
- Respect `.gitignore` when scanning

## Webview UI Standards

- React with functional components only
- Tailwind CSS for styling (no inline styles)
- VS Code Webview UI Toolkit for native look
- Message passing between extension and webview via `postMessage`
- No direct VS Code API access from webview
