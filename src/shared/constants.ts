/** Extension identifier */
export const EXTENSION_ID = 'context-flow';

/** Extension display name */
export const EXTENSION_NAME = 'Context Flow';

/** Maximum depth for repository scanning */
export const MAX_SCAN_DEPTH = 10;

/** Default token budget for context building */
export const DEFAULT_TOKEN_BUDGET = 4096;

/** Maximum files to include in context */
export const MAX_CONTEXT_FILES = 20;

/** File extensions to scan */
export const SCANNABLE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.css',
  '.scss',
  '.html',
] as const;

/** Directories to always ignore during scanning */
export const IGNORED_DIRECTORIES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  'coverage',
  '.vscode-test',
  '__pycache__',
] as const;

/** Command identifiers */
export const COMMANDS = {
  SCAN_REPOSITORY: 'contextFlow.scanRepository',
  OPEN_CHAT: 'contextFlow.openChat',
  ENHANCE_PROMPT: 'contextFlow.enhancePrompt',
  VALIDATE_CODE: 'contextFlow.validateCode',
  SHOW_CONTEXT: 'contextFlow.showContext',
} as const;

/** View identifiers */
export const VIEWS = {
  CHAT_PANEL: 'contextFlow.chatPanel',
  CONTEXT_VIEW: 'contextFlow.contextView',
  VALIDATION_VIEW: 'contextFlow.validationView',
} as const;

/** Configuration keys */
export const CONFIG = {
  AI_PROVIDER: 'contextFlow.aiProvider',
  MAX_TOKEN_BUDGET: 'contextFlow.maxTokenBudget',
  AUTO_ENHANCE_PROMPTS: 'contextFlow.autoEnhancePrompts',
  AUTO_VALIDATE: 'contextFlow.autoValidate',
  TELEMETRY_ENABLED: 'contextFlow.telemetryEnabled',
  SCAN_ON_STARTUP: 'contextFlow.scanOnStartup',
} as const;

/** Output channel name */
export const OUTPUT_CHANNEL_NAME = 'Context Flow';
