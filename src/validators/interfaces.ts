import type {
  ValidationContext,
  ValidationResult,
  ValidationReport,
  ValidatorCategory,
  RefactorSuggestion,
} from '../shared/types/index';

/**
 * Individual validator interface.
 */
export interface IValidator {
  readonly name: string;
  readonly category: ValidatorCategory;
  validate(code: string, context: ValidationContext): Promise<ValidationResult>;
}

/**
 * Validation engine that orchestrates multiple validators.
 */
export interface IValidationEngine {
  registerValidator(validator: IValidator): void;
  validateCode(code: string, context: ValidationContext): Promise<ValidationReport>;
  getSuggestions(report: ValidationReport): RefactorSuggestion[];
  getValidators(): IValidator[];
}
