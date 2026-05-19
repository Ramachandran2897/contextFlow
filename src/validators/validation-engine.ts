import type {
  ValidationContext,
  ValidationReport,
  ValidationIssue,
  RefactorSuggestion,
} from '../shared/types/index';
import { ValidatorError } from '../shared/errors';
import { Logger } from '../shared/logger';
import type { IValidator, IValidationEngine } from './interfaces';

const MODULE = 'validators';

export class ValidationEngine implements IValidationEngine {
  private readonly _validators: IValidator[] = [];
  private readonly _logger = Logger.getInstance();

  registerValidator(validator: IValidator): void {
    this._validators.push(validator);
    this._logger.info(MODULE, `Validator registered: ${validator.name} (${validator.category})`);
  }

  async validateCode(code: string, context: ValidationContext): Promise<ValidationReport> {
    this._logger.info(MODULE, `Validating code for: ${context.filePath}`);

    const allIssues: ValidationIssue[] = [];

    try {
      const results = await Promise.all(this._validators.map((v) => v.validate(code, context)));

      for (const result of results) {
        allIssues.push(...result.issues);
      }

      const suggestions = this.getSuggestions({
        issues: allIssues,
        suggestions: [],
        score: 0,
        passed: true,
      });
      const score = this._calculateScore(allIssues);
      const passed = allIssues.filter((i) => i.severity === 'error').length === 0;

      const report: ValidationReport = {
        issues: allIssues,
        suggestions,
        score,
        passed,
      };

      this._logger.info(MODULE, 'Validation complete', {
        issues: allIssues.length,
        score,
        passed,
      });

      return report;
    } catch (error) {
      throw new ValidatorError(
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VALIDATION_FAILED',
        error instanceof Error ? error : undefined,
      );
    }
  }

  getSuggestions(report: ValidationReport): RefactorSuggestion[] {
    const suggestions: RefactorSuggestion[] = [];

    for (const issue of report.issues) {
      if (issue.suggestion) {
        suggestions.push({
          title: issue.message,
          description: issue.suggestion,
          category: issue.category,
          priority:
            issue.severity === 'error' ? 'high' : issue.severity === 'warning' ? 'medium' : 'low',
        });
      }
    }

    return suggestions;
  }

  getValidators(): IValidator[] {
    return [...this._validators];
  }

  private _calculateScore(issues: ValidationIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'error':
          score -= 15;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 1;
          break;
      }
    }

    return Math.max(0, score);
  }
}
