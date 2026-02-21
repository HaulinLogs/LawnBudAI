/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates that a value is a positive number (> 0)
 * @param value - String value to validate
 * @param fieldName - Name of field for error message
 * @returns ValidationResult with valid flag and optional error message
 */
export function validatePositiveNumber(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (num <= 0) {
    return {
      valid: false,
      error: `${fieldName} must be a positive number`,
    };
  }

  return { valid: true };
}

/**
 * Validates that a number is within a specified range (inclusive)
 * @param value - String value to validate
 * @param fieldName - Name of field for error message
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateNumberInRange(
  value: string,
  fieldName: string,
  min: number,
  max: number,
): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (num < min || num > max) {
    return {
      valid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
    };
  }

  return { valid: true };
}

/**
 * Validates that a field is not empty
 * @param value - String or undefined value to validate
 * @param fieldName - Name of field for error message
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateRequiredField(
  value: string | undefined,
  fieldName: string,
): ValidationResult {
  if (value === undefined || value === '') {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  return { valid: true };
}

/**
 * Validates a form by running multiple validators in sequence
 * Stops at first failure and returns that error
 * @param validators - Array of validator functions that return ValidationResult
 * @returns ValidationResult with valid flag and first error encountered, if any
 */
export function validateForm(validators: (() => ValidationResult)[]): ValidationResult {
  for (const validator of validators) {
    const result = validator();
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}
