# Context Flow

**Context-Aware AI Development Intelligence Platform for VS Code**

Context Flow is the intelligence layer between developers and AI coding tools. It automatically understands your repository context, enhances prompts, enforces architecture standards, and validates AI-generated code.

## Features

- **Repository Scanner** — Automatically detects framework, folder structure, architecture style, and dependency graph
- **Context Builder** — Collects relevant files, APIs, hooks, and services based on your intent
- **Prompt Enhancer** — Injects coding standards, architecture rules, and project constraints into AI prompts
- **AI Chat Panel** — Integrated AI workflow inside VS Code with multi-provider support
- **Code Validator** — Validates AI-generated code for architecture, performance, and security issues

## Supported AI Providers

- OpenAI (GPT-4, GPT-4o)
- Anthropic (Claude 3.5, Claude 4)
- Google Gemini
- Local LLMs (Ollama, LM Studio)

## Commands

| Command                                | Description                                  |
| -------------------------------------- | -------------------------------------------- |
| `Context Flow: Scan Repository`        | Analyze workspace structure and dependencies |
| `Context Flow: Open AI Chat`           | Open the AI chat panel                       |
| `Context Flow: Enhance Prompt`         | Enhance a prompt with project context        |
| `Context Flow: Validate Current File`  | Run validators on the active file            |
| `Context Flow: Show Collected Context` | Preview what context would be collected      |

## Getting Started

1. Install the extension
2. Open a workspace
3. The extension auto-scans your repository on startup
4. Use the AI Chat panel or commands to interact

## Configuration

| Setting                          | Default  | Description                       |
| -------------------------------- | -------- | --------------------------------- |
| `contextFlow.aiProvider`         | `openai` | Active AI provider                |
| `contextFlow.maxTokenBudget`     | `4096`   | Maximum token budget for context  |
| `contextFlow.autoEnhancePrompts` | `true`   | Auto-enhance prompts with context |
| `contextFlow.autoValidate`       | `true`   | Auto-validate AI-generated code   |
| `contextFlow.telemetryEnabled`   | `false`  | Enable anonymous usage telemetry  |
| `contextFlow.scanOnStartup`      | `true`   | Scan repository on activation     |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Run tests
npm test

# Package extension
npm run package
```

## Architecture

```
src/
├── extension/       # VS Code extension entry point
├── scanner/         # Repository scanning & framework detection
├── context-engine/  # Context collection & relevance scoring
├── prompt-engine/   # Prompt enhancement & template management
├── ai-providers/    # AI provider abstraction layer
├── validators/      # Code validation (architecture, performance, security)
├── memory-engine/   # Knowledge graph & session memory
├── ui/              # Webview panels (React + Tailwind CSS)
├── telemetry/       # Usage tracking & governance
└── shared/          # Types, interfaces, utilities, constants
```

## License

MIT
