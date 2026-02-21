import {
  validatePositiveNumber,
  validateNumberInRange,
  validateRequiredField,
  validateForm,
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validatePositiveNumber', () => {
    it('should accept valid positive numbers', () => {
      expect(validatePositiveNumber('1', 'Amount')).toEqual({ valid: true });
      expect(validatePositiveNumber('25.5', 'Amount')).toEqual({ valid: true });
      expect(validatePositiveNumber('100', 'Amount')).toEqual({ valid: true });
      expect(validatePositiveNumber('0.1', 'Amount')).toEqual({ valid: true });
    });

    it('should reject zero', () => {
      const result = validatePositiveNumber('0', 'Amount');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive number');
    });

    it('should reject negative numbers', () => {
      const result = validatePositiveNumber('-5', 'Amount');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive number');
    });

    it('should reject non-numeric values', () => {
      const result = validatePositiveNumber('abc', 'Amount');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid');
    });

    it('should reject empty strings', () => {
      const result = validatePositiveNumber('', 'Amount');
      expect(result.valid).toBe(false);
    });

    it('should include field name in error message', () => {
      const result = validatePositiveNumber('-5', 'Height');
      expect(result.error).toContain('Height');
    });

    it('should reject NaN', () => {
      const result = validatePositiveNumber('NaN', 'Amount');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateNumberInRange', () => {
    it('should accept numbers within range (inclusive)', () => {
      expect(validateNumberInRange('0', 'NPK', 0, 100)).toEqual({ valid: true });
      expect(validateNumberInRange('50', 'NPK', 0, 100)).toEqual({ valid: true });
      expect(validateNumberInRange('100', 'NPK', 0, 100)).toEqual({ valid: true });
    });

    it('should reject numbers below minimum', () => {
      const result = validateNumberInRange('-1', 'NPK', 0, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('0');
      expect(result.error).toContain('100');
    });

    it('should reject numbers above maximum', () => {
      const result = validateNumberInRange('101', 'NPK', 0, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('0');
      expect(result.error).toContain('100');
    });

    it('should reject non-numeric values', () => {
      const result = validateNumberInRange('abc', 'NPK', 0, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid');
    });

    it('should include field name in error message', () => {
      const result = validateNumberInRange('150', 'Nitrogen', 0, 100);
      expect(result.error).toContain('Nitrogen');
    });

    it('should work with decimal ranges', () => {
      expect(validateNumberInRange('0.5', 'Value', 0.1, 99.9)).toEqual({ valid: true });
    });
  });

  describe('validateRequiredField', () => {
    it('should accept non-empty strings', () => {
      expect(validateRequiredField('value', 'Date')).toEqual({ valid: true });
      expect(validateRequiredField('2024-01-01', 'Date')).toEqual({ valid: true });
    });

    it('should reject empty strings', () => {
      const result = validateRequiredField('', 'Date');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Date');
      expect(result.error).toContain('required');
    });

    it('should reject undefined', () => {
      const result = validateRequiredField(undefined, 'Date');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Date');
      expect(result.error).toContain('required');
    });

    it('should include field name in error message', () => {
      const result = validateRequiredField('', 'Location');
      expect(result.error).toContain('Location');
    });

    it('should accept strings with whitespace content', () => {
      expect(validateRequiredField('  ', 'Notes')).toEqual({ valid: true });
    });
  });

  describe('validateForm', () => {
    it('should return valid if all validators pass', () => {
      const validators = [
        () => validatePositiveNumber('10', 'Amount'),
        () => validateRequiredField('2024-01-01', 'Date'),
        () => validateNumberInRange('50', 'NPK', 0, 100),
      ];
      expect(validateForm(validators)).toEqual({ valid: true });
    });

    it('should return first error if any validator fails', () => {
      const validators = [
        () => validatePositiveNumber('10', 'Amount'),
        () => validateRequiredField('', 'Date'),
        () => validateNumberInRange('50', 'NPK', 0, 100),
      ];
      const result = validateForm(validators);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Date');
      expect(result.error).toContain('required');
    });

    it('should skip remaining validators after first failure', () => {
      let secondValidatorCalled = false;
      const validators = [
        () => validateRequiredField('', 'Field1'),
        () => {
          secondValidatorCalled = true;
          return validateRequiredField('value', 'Field2');
        },
      ];
      validateForm(validators);
      expect(secondValidatorCalled).toBe(false);
    });

    it('should handle empty validator array', () => {
      expect(validateForm([])).toEqual({ valid: true });
    });

    it('should execute validators in order', () => {
      const calls: string[] = [];
      const validators = [
        () => {
          calls.push('first');
          return validatePositiveNumber('10', 'Amount');
        },
        () => {
          calls.push('second');
          return validateRequiredField('value', 'Date');
        },
      ];
      validateForm(validators);
      expect(calls).toEqual(['first', 'second']);
    });
  });
});
