/**
 * Real-time Input Validation Utilities
 * Provides validation functions for email, phone, and URLs with user-friendly error messages
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation regex (RFC 5322 compliant, simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (supports international formats)
 * Allows: +1 (555) 123-4567, (555) 123-4567, 555-123-4567, 5551234567, +44 20 7946 0958, etc.
 */
const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}[-\s\.]?[0-9]{1,9}$/;

/**
 * URL validation regex (supports http, https, and common protocols)
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const trimmed = email.trim();
  
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., name@example.com)',
    };
  }
  
  // Additional checks
  if (trimmed.length > 254) {
    return {
      isValid: false,
      error: 'Email address is too long (maximum 254 characters)',
    };
  }
  
  if (trimmed.split('@')[0].length > 64) {
    return {
      isValid: false,
      error: 'Email local part is too long (maximum 64 characters)',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const trimmed = phone.trim();
  
  // Remove common formatting characters for validation
  const digitsOnly = trimmed.replace(/[\s\-\(\)\.\+]/g, '');
  
  // Check if it contains only digits and formatting characters
  if (!/^[\d\s\-\(\)\.\+]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Phone number can only contain digits, spaces, dashes, parentheses, and +',
    };
  }
  
  // Check minimum length (at least 7 digits for a valid phone number)
  if (digitsOnly.length < 7) {
    return {
      isValid: false,
      error: 'Phone number is too short (minimum 7 digits required)',
    };
  }
  
  // Check maximum length (reasonable limit)
  if (digitsOnly.length > 20) {
    return {
      isValid: false,
      error: 'Phone number is too long (maximum 20 digits)',
    };
  }
  
  // Check format with regex
  if (!PHONE_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number (e.g., +1 (555) 123-4567)',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate URL
 */
export function validateURL(url: string, fieldName: string = 'URL'): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const trimmed = url.trim();
  
  // Check if it starts with http:// or https://
  let urlToValidate = trimmed;
  if (!trimmed.match(/^https?:\/\//i)) {
    // Try adding https:// for validation
    urlToValidate = `https://${trimmed}`;
  }
  
  try {
    // Use URL constructor for validation
    new URL(urlToValidate);
  } catch {
    // If URL constructor fails, try regex
    if (!URL_REGEX.test(trimmed)) {
      return {
        isValid: false,
        error: `Please enter a valid ${fieldName} (e.g., https://example.com)`,
      };
    }
  }
  
  // Additional checks
  if (trimmed.length > 2048) {
    return {
      isValid: false,
      error: `${fieldName} is too long (maximum 2048 characters)`,
    };
  }
  
  // Check for common mistakes
  if (trimmed.includes(' ')) {
    return {
      isValid: false,
      error: `${fieldName} cannot contain spaces`,
    };
  }
  
  return { isValid: true };
}

/**
 * Validate LinkedIn URL specifically
 */
export function validateLinkedInURL(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const trimmed = url.trim();
  
  // First validate as a general URL
  const urlValidation = validateURL(trimmed, 'LinkedIn URL');
  if (!urlValidation.isValid) {
    return urlValidation;
  }
  
  // Check if it's a LinkedIn URL
  const linkedinPatterns = [
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/i,
    /^https?:\/\/(www\.)?linkedin\.com\/profile\/view\?id=[\w\-]+/i,
    /^linkedin\.com\/in\/[\w\-]+\/?$/i,
  ];
  
  const isLinkedInURL = linkedinPatterns.some(pattern => pattern.test(trimmed));
  
  if (!isLinkedInURL) {
    return {
      isValid: false,
      error: 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate multiple fields at once
 */
export function validateFields(fields: {
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  if (fields.email !== undefined) {
    const emailResult = validateEmail(fields.email);
    if (!emailResult.isValid && emailResult.error) {
      errors.email = emailResult.error;
      isValid = false;
    }
  }
  
  if (fields.phone !== undefined) {
    const phoneResult = validatePhone(fields.phone);
    if (!phoneResult.isValid && phoneResult.error) {
      errors.phone = phoneResult.error;
      isValid = false;
    }
  }
  
  if (fields.linkedin !== undefined) {
    const linkedinResult = validateLinkedInURL(fields.linkedin);
    if (!linkedinResult.isValid && linkedinResult.error) {
      errors.linkedin = linkedinResult.error;
      isValid = false;
    }
  }
  
  if (fields.website !== undefined) {
    const websiteResult = validateURL(fields.website, 'Website URL');
    if (!websiteResult.isValid && websiteResult.error) {
      errors.website = websiteResult.error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
}



