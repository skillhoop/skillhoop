/**
 * React Hook for Real-time Input Validation
 * Provides validation state and handlers for form inputs
 */

import { useState, useCallback, useEffect } from 'react';
import {
  validateEmail,
  validatePhone,
  validateLinkedInURL,
  validateURL,
  type ValidationResult,
} from '../lib/inputValidation';

export interface UseInputValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface ValidationState {
  value: string;
  error: string | null;
  isValid: boolean;
  touched: boolean;
}

/**
 * Hook for validating a single input field
 */
export function useInputValidation(
  initialValue: string = '',
  validator: (value: string) => ValidationResult,
  options: UseInputValidationOptions = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
  } = options;

  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Validate function
  const validate = useCallback(
    (val: string) => {
      const result = validator(val);
      setError(result.isValid ? null : result.error || null);
      return result.isValid;
    },
    [validator]
  );

  // Handle value change
  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      setTouched(true);

      if (validateOnChange) {
        // Clear existing timer
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        // Debounce validation
        const timer = setTimeout(() => {
          validate(newValue);
        }, debounceMs);

        setDebounceTimer(timer);
      }
    },
    [validateOnChange, debounceMs, debounceTimer, validate]
  );

  // Handle blur
  const handleBlur = useCallback(() => {
    setTouched(true);
    if (validateOnBlur) {
      validate(value);
    }
  }, [validateOnBlur, validate, value]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Validate on initial value change
  useEffect(() => {
    if (initialValue !== value) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const isValid = error === null;
  const showError = touched && error !== null;

  return {
    value,
    error,
    isValid,
    touched,
    showError,
    handleChange,
    handleBlur,
    setValue,
    setTouched,
    validate: () => validate(value),
  };
}

/**
 * Hook for email validation
 */
export function useEmailValidation(
  initialValue: string = '',
  options?: UseInputValidationOptions
) {
  return useInputValidation(initialValue, validateEmail, options);
}

/**
 * Hook for phone validation
 */
export function usePhoneValidation(
  initialValue: string = '',
  options?: UseInputValidationOptions
) {
  return useInputValidation(initialValue, validatePhone, options);
}

/**
 * Hook for LinkedIn URL validation
 */
export function useLinkedInValidation(
  initialValue: string = '',
  options?: UseInputValidationOptions
) {
  return useInputValidation(initialValue, validateLinkedInURL, options);
}

/**
 * Hook for website URL validation
 */
export function useWebsiteValidation(
  initialValue: string = '',
  options?: UseInputValidationOptions
) {
  return useInputValidation(initialValue, (val) => validateURL(val, 'Website URL'), options);
}



