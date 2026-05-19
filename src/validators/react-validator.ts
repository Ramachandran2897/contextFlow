import type {
  ValidationContext,
  ValidationResult,
  ValidationIssue,
  ValidatorCategory,
} from '../shared/types/index';
import type { IValidator } from './interfaces';

/**
 * React-specific code validator.
 * Detects common React performance and pattern issues.
 */
export class ReactValidator implements IValidator {
  readonly name = 'React Validator';
  readonly category: ValidatorCategory = 'performance';

  async validate(code: string, context: ValidationContext): Promise<ValidationResult> {
    if (
      context.framework !== 'react' &&
      context.framework !== 'react-native' &&
      context.framework !== 'nextjs'
    ) {
      return { issues: [], passed: true };
    }

    const issues: ValidationIssue[] = [];

    this._checkInlineFunctions(code, issues);
    this._checkMissingMemoization(code, issues);
    this._checkInlineStyles(code, issues);
    this._checkMissingKeys(code, issues);
    this._checkUseEffectDependencies(code, issues);

    return {
      issues,
      passed: issues.filter((i) => i.severity === 'error').length === 0,
    };
  }

  private _checkInlineFunctions(code: string, issues: ValidationIssue[]): void {
    // Detect inline arrow functions in JSX event handlers
    const inlinePattern = /on\w+=\{(?:\(\)|\([^)]*\))\s*=>/g;
    let match: RegExpExecArray | null;

    while ((match = inlinePattern.exec(code)) !== null) {
      const line = code.slice(0, match.index).split('\n').length;
      issues.push({
        message: 'Inline function detected in JSX',
        severity: 'warning',
        category: 'performance',
        line,
        suggestion: 'Extract to useCallback or a named function to prevent unnecessary re-renders.',
      });
    }
  }

  private _checkMissingMemoization(code: string, issues: ValidationIssue[]): void {
    // Check if component exports without React.memo
    const exportDefault = /export\s+default\s+function\s+(\w+)/g;
    const hasMemo = code.includes('React.memo') || code.includes('memo(');

    let match: RegExpExecArray | null;
    while ((match = exportDefault.exec(code)) !== null) {
      if (!hasMemo) {
        issues.push({
          message: `Component "${match[1]}" is not wrapped in React.memo`,
          severity: 'info',
          category: 'performance',
          suggestion:
            'Consider wrapping with React.memo if this component receives props and re-renders frequently.',
        });
      }
    }
  }

  private _checkInlineStyles(code: string, issues: ValidationIssue[]): void {
    const stylePattern = /style=\{\{/g;
    let match: RegExpExecArray | null;

    while ((match = stylePattern.exec(code)) !== null) {
      const line = code.slice(0, match.index).split('\n').length;
      issues.push({
        message: 'Inline style object detected',
        severity: 'warning',
        category: 'style',
        line,
        suggestion:
          'Move styles to a stylesheet, Tailwind classes, or a constant outside the component.',
      });
    }
  }

  private _checkMissingKeys(code: string, issues: ValidationIssue[]): void {
    // Simple check for .map() without key prop
    const mapPattern = /\.map\([^)]*\)\s*=>\s*[(<]/g;
    const hasKey = /key=/g;

    if (mapPattern.test(code) && !hasKey.test(code)) {
      issues.push({
        message: 'Possible missing key prop in list rendering',
        severity: 'warning',
        category: 'performance',
        suggestion:
          'Add a unique key prop to elements rendered in .map() to help React identify changes.',
      });
    }
  }

  private _checkUseEffectDependencies(code: string, issues: ValidationIssue[]): void {
    // Check for useEffect with empty dependency array but referencing external variables
    const emptyDepsPattern = /useEffect\(\s*\(\)\s*=>\s*\{[^}]*\},\s*\[\]\)/g;

    if (emptyDepsPattern.test(code)) {
      issues.push({
        message: 'useEffect with empty dependency array detected',
        severity: 'info',
        category: 'performance',
        suggestion: 'Verify that all referenced variables are included in the dependency array.',
      });
    }
  }
}
