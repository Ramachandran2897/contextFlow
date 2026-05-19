---
inclusion: always
---

# Context Flow — SDLC Process & Development Guidelines

## Software Development Life Cycle (SDLC)

Context Flow follows an **Agile SDLC** with iterative development phases aligned to the product roadmap.

### Phase 1 — MVP (Months 1–2)

**Goal:** Launch core intelligence features quickly.

| Feature             | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| Repository Scanner  | Detect framework, folder structure, architecture style, dependency graph |
| Context Builder     | Automatically collect relevant files based on developer intent           |
| Prompt Enhancer     | Inject reusable project rules into AI prompts                            |
| AI Chat Panel       | Integrated AI workflow inside VS Code webview                            |
| AI Validation Layer | Basic React & React Native code validation                               |

### Phase 2 — Validation Engine (Months 2–4)

| Feature                   | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| React Intelligence        | Detect unnecessary re-renders, missing memoization, inline functions |
| React Native Optimization | Heavy FlatLists, performance bottlenecks                             |
| Architecture Validation   | Incorrect imports, wrong folder placement, duplicated logic          |

### Phase 3 — Repository Memory (Months 4–6)

| Feature                  | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| Semantic Knowledge Graph | Store relationships between screens, APIs, services, modules |
| AI Session Memory        | Remember prompts, generated code, architecture decisions     |
| Recommendation Engine    | Surface similar implementations and existing solutions       |

### Phase 4 — Enterprise Features (Months 6–12)

| Feature                 | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| AI Governance Dashboard | Token usage, API costs, prompt history                     |
| Team Governance         | Shared rules, architecture enforcement, security policies  |
| Audit Logs              | Track who generated code, AI modifications, prompt history |
| Compliance              | SSO, on-prem deployment, private AI models                 |

---

## Development Workflow

### Branching Strategy

- `main` — stable release branch
- `develop` — integration branch
- `feature/<module>/<description>` — feature branches
- `fix/<module>/<description>` — bug fix branches
- `release/<version>` — release candidates

### Commit Convention

Follow Conventional Commits:

```
<type>(<scope>): <description>

Types: feat, fix, refactor, docs, test, chore, perf
Scopes: scanner, context-engine, prompt-engine, ai-providers, validators, memory-engine, ui, telemetry, shared, extension
```

Examples:

- `feat(scanner): add dependency graph analysis`
- `fix(validators): correct React memoization detection`
- `refactor(prompt-engine): optimize token reduction logic`

### Code Review Standards

1. All PRs require at least one review
2. Architecture changes require team lead approval
3. AI provider integrations require security review
4. No direct commits to `main` or `develop`

---

## Quality Assurance

### Testing Strategy

| Level             | Tool                         | Coverage Target                |
| ----------------- | ---------------------------- | ------------------------------ |
| Unit Tests        | Vitest                       | 80%+ for core modules          |
| Integration Tests | Vitest + VS Code Test Runner | Key workflows                  |
| E2E Tests         | @vscode/test-electron        | Extension activation, commands |
| Performance Tests | Custom benchmarks            | Scanner < 5s for large repos   |

### Code Quality Gates

- TypeScript strict mode (no `any` types)
- ESLint with strict rules
- Prettier for formatting
- No circular dependencies (enforced via madge)
- Bundle size monitoring

### Definition of Done

A feature is complete when:

1. Code is written and follows architecture standards
2. Unit tests pass with adequate coverage
3. Integration tests pass
4. Documentation is updated
5. PR is reviewed and approved
6. No regressions in existing features

---

## Architecture Principles

1. **Modular Design** — Each module is independent and testable
2. **Dependency Injection** — Use interfaces for all service boundaries
3. **Single Responsibility** — Each class/function does one thing well
4. **Open/Closed** — Open for extension, closed for modification
5. **Interface Segregation** — Small, focused interfaces
6. **Event-Driven** — Modules communicate via events where possible
7. **Fail Gracefully** — Never crash the extension; degrade gracefully

---

## Security Requirements

### MVP Security

- No secrets stored in plaintext
- API keys stored in VS Code SecretStorage
- No telemetry without user consent
- Sanitize all AI-generated code before display

### Enterprise Security

- SOC 2 compliance readiness
- Data encryption at rest and in transit
- Role-based access control
- Audit trail for all AI operations
- Private AI model support (no data leaves org)

---

## Performance Requirements

| Metric                        | Target  |
| ----------------------------- | ------- |
| Extension activation          | < 500ms |
| Repository scan (medium repo) | < 3s    |
| Repository scan (large repo)  | < 10s   |
| Context building              | < 1s    |
| Prompt enhancement            | < 200ms |
| AI validation (per file)      | < 500ms |
| Memory footprint              | < 100MB |

---

## Release Process

1. Feature freeze on `develop`
2. Create `release/<version>` branch
3. Run full test suite
4. Update CHANGELOG.md
5. Version bump in package.json
6. Build and package extension (.vsix)
7. Publish to VS Code Marketplace
8. Tag release on `main`
9. Announce release

### Versioning

Follow Semantic Versioning (SemVer):

- **MAJOR** — Breaking changes to extension API or config
- **MINOR** — New features, backward compatible
- **PATCH** — Bug fixes, performance improvements
