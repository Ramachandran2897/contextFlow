import type {
  ValidationContext,
  ValidationResult,
  ValidationIssue,
  ValidatorCategory,
} from '../shared/types/index';
import type { IValidator } from './interfaces';

/**
 * Security validator.
 * Detects potential security issues in AI-generated code.
 */
export class SecurityValidator implements IValidator {
  readonly name = 'Security Validator';
  readonly category: ValidatorCategory = 'security';

  async validate(code: string, _context: ValidationContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    this._checkExposedSecrets(code, issues);
    this._checkInsecureStorage(code, issues);
    this._checkUnsafeAPICalls(code, issues);
    this._checkHardcodedURLs(code, issues);

    return {
      issues,
      passed: issues.filter((i) => i.severity === 'error').length === 0,
    };
  }

  private _checkExposedSecrets(code: string, issues: ValidationIssue[]): void {
    const secretPatterns = [
      { pattern: /['"]sk-[a-zA-Z0-9]{20,}['"]/, name: 'OpenAI API key' },
      { pattern: /['"]ghp_[a-zA-Z0-9]{36}['"]/, name: 'GitHub token' },
      { pattern: /['"]AKIA[A-Z0-9]{16}['"]/, name: 'AWS access key' },
      { pattern: /password\s*[:=]\s*['"][^'"]{3,}['"]/, name: 'Hardcoded password' },
      { pattern: /secret\s*[:=]\s*['"][^'"]{3,}['"]/, name: 'Hardcoded secret' },
    ];

    for (const { pattern, name } of secretPatterns) {
      const match = pattern.exec(code);
      if (match) {
        const line = code.slice(0, match.index).split('\n').length;
        issues.push({
          message: `Potential exposed secret: ${name}`,
          severity: 'error',
          category: 'security',
          line,
          suggestion: 'Use environment variables or VS Code SecretStorage. Never hardcode secrets.',
        });
      }
    }
  }

  private _checkInsecureStorage(code: string, issues: ValidationIssue[]): void {
    const insecurePatterns = [
      {
        pattern: /localStorage\.setItem\([^,]+,\s*[^)]*(?:token|key|secret|password)/i,
        name: 'localStorage',
      },
      {
        pattern: /sessionStorage\.setItem\([^,]+,\s*[^)]*(?:token|key|secret|password)/i,
        name: 'sessionStorage',
      },
    ];

    for (const { pattern, name } of insecurePatterns) {
      const match = pattern.exec(code);
      if (match) {
        const line = code.slice(0, match.index).split('\n').length;
        issues.push({
          message: `Sensitive data stored in ${name}`,
          severity: 'warning',
          category: 'security',
          line,
          suggestion:
            'Use secure storage mechanisms (SecretStorage, encrypted storage, httpOnly cookies).',
        });
      }
    }
  }

  private _checkUnsafeAPICalls(code: string, issues: ValidationIssue[]): void {
    // Check for fetch without error handling
    const fetchWithoutCatch = /fetch\([^)]+\)(?![\s\S]*\.catch|[\s\S]*try)/;
    if (fetchWithoutCatch.test(code)) {
      issues.push({
        message: 'API call without proper error handling',
        severity: 'warning',
        category: 'security',
        suggestion: 'Wrap API calls in try-catch blocks and handle errors gracefully.',
      });
    }

    // Check for eval usage
    if (/\beval\s*\(/.test(code)) {
      issues.push({
        message: 'Usage of eval() detected',
        severity: 'error',
        category: 'security',
        suggestion: 'Never use eval(). It enables code injection attacks.',
      });
    }
  }

  private _checkHardcodedURLs(code: string, issues: ValidationIssue[]): void {
    const urlPattern = /['"]https?:\/\/(?!localhost)[^'"]+['"]/g;
    let match: RegExpExecArray | null;
    let count = 0;

    while ((match = urlPattern.exec(code)) !== null) {
      count++;
      if (count > 2) {
        issues.push({
          message: 'Multiple hardcoded URLs detected',
          severity: 'info',
          category: 'security',
          suggestion: 'Use environment variables or a configuration file for API endpoints.',
        });
        break;
      }
    }
  }
}
