import type {
  ValidationContext,
  ValidationResult,
  ValidationIssue,
  ValidatorCategory,
} from '../shared/types/index';
import type { IValidator } from './interfaces';

/**
 * Architecture validator.
 * Detects structural issues like incorrect imports and folder placement.
 */
export class ArchitectureValidator implements IValidator {
  readonly name = 'Architecture Validator';
  readonly category: ValidatorCategory = 'architecture';

  async validate(code: string, context: ValidationContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    this._checkRelativeImportDepth(code, issues);
    this._checkCircularPatterns(code, context, issues);
    this._checkBarrelImports(code, issues);

    return {
      issues,
      passed: issues.filter((i) => i.severity === 'error').length === 0,
    };
  }

  private _checkRelativeImportDepth(code: string, issues: ValidationIssue[]): void {
    const deepImportPattern = /from\s+['"](\.\.\/(\.\.\/){2,}[^'"]+)['"]/g;
    let match: RegExpExecArray | null;

    while ((match = deepImportPattern.exec(code)) !== null) {
      const line = code.slice(0, match.index).split('\n').length;
      issues.push({
        message: `Deep relative import detected: "${match[1]}"`,
        severity: 'warning',
        category: 'architecture',
        line,
        suggestion: 'Use path aliases (e.g., @module/) instead of deep relative imports.',
      });
    }
  }

  private _checkCircularPatterns(
    code: string,
    context: ValidationContext,
    issues: ValidationIssue[],
  ): void {
    // Check if file imports from its own module's parent
    const filePath = context.filePath;
    const importPattern = /from\s+['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;

    while ((match = importPattern.exec(code)) !== null) {
      const importPath = match[1];
      if (
        importPath.includes('../') &&
        importPath.includes(filePath.split('/').slice(-2, -1)[0] ?? '')
      ) {
        issues.push({
          message: 'Potential circular dependency pattern detected',
          severity: 'warning',
          category: 'architecture',
          suggestion: 'Review import structure to avoid circular dependencies between modules.',
        });
        break;
      }
    }
  }

  private _checkBarrelImports(code: string, issues: ValidationIssue[]): void {
    // Detect importing from deep internal paths of other modules
    const internalImportPattern = /from\s+['"]@\w+\/[^'"\/]+\/[^'"]+['"]/g;
    let match: RegExpExecArray | null;

    while ((match = internalImportPattern.exec(code)) !== null) {
      const line = code.slice(0, match.index).split('\n').length;
      issues.push({
        message: 'Importing from internal module path',
        severity: 'info',
        category: 'architecture',
        line,
        suggestion: 'Import from the module barrel file (index.ts) instead of internal paths.',
      });
    }
  }
}
