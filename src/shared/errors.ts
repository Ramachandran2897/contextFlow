/**
 * Base error class for all Context Flow errors.
 * Provides module context and error codes for structured error handling.
 */
export class ContextFlowError extends Error {
  constructor(
    message: string,
    readonly module: string,
    readonly code: string,
    readonly cause?: Error,
  ) {
    super(message);
    this.name = 'ContextFlowError';
  }
}

export class ScannerError extends ContextFlowError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, 'scanner', code, cause);
    this.name = 'ScannerError';
  }
}

export class ContextEngineError extends ContextFlowError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, 'context-engine', code, cause);
    this.name = 'ContextEngineError';
  }
}

export class PromptEngineError extends ContextFlowError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, 'prompt-engine', code, cause);
    this.name = 'PromptEngineError';
  }
}

export class AIProviderError extends ContextFlowError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, 'ai-providers', code, cause);
    this.name = 'AIProviderError';
  }
}

export class ValidatorError extends ContextFlowError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, 'validators', code, cause);
    this.name = 'ValidatorError';
  }
}

export class MemoryEngineError extends ContextFlowError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, 'memory-engine', code, cause);
    this.name = 'MemoryEngineError';
  }
}
