/**
 * Input Sanitization Utilities
 * Provides comprehensive XSS protection for user input
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe rendering with dangerouslySetInnerHTML
 * Allows safe HTML tags and attributes while removing dangerous scripts
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    // Allow safe HTML tags
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img',
    ],
    // Allow safe attributes
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title', 'alt', 'src', 'class', 'id',
      'style', 'colspan', 'rowspan',
    ],
    // Allow data URIs for images (with restrictions)
    ALLOW_DATA_ATTR: false,
    // Keep relative URLs
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Add rel="noopener noreferrer" to links
    ADD_ATTR: ['target'],
    ADD_TAGS: [],
    // Return as string (not DOM)
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  });
}

/**
 * Sanitize plain text - removes all HTML tags
 * Use this for text that should never contain HTML
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // First escape HTML, then sanitize
  const div = document.createElement('div');
  div.textContent = text;
  const escaped = div.innerHTML;
  
  // Sanitize to remove any remaining HTML
  return DOMPurify.sanitize(escaped, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize URL - validates and sanitizes URLs
 * Returns empty string if URL is invalid or dangerous
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';
  
  // Remove whitespace
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
  const lowerUrl = trimmed.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }
  
  // Try to create a URL object to validate
  try {
    // If it doesn't start with http/https, add https
    let urlToValidate = trimmed;
    if (!trimmed.match(/^https?:\/\//i)) {
      urlToValidate = `https://${trimmed}`;
    }
    
    const urlObj = new URL(urlToValidate);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    
    // Return the sanitized URL
    return urlObj.href;
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Sanitize email address
 * Validates basic email format and removes dangerous characters
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  const trimmed = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return '';
  }
  
  // Remove any HTML tags
  return sanitizeText(trimmed);
}

/**
 * Sanitize phone number
 * Removes HTML and keeps only safe characters
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove HTML tags
  const sanitized = sanitizeText(phone);
  
  // Keep only digits, spaces, dashes, parentheses, plus signs, and periods
  return sanitized.replace(/[^\d\s\-()+.x]/gi, '');
}

/**
 * Escape HTML entities - for use in HTML attributes and text nodes
 * This is a more comprehensive version than the basic escapeHtml
 */
export function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize object properties recursively
 * Sanitizes all string properties in an object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, options: {
  sanitizeHTML?: boolean;
  allowedKeys?: string[];
} = {}): T {
  const { sanitizeHTML: sanitizeHTMLFields = false, allowedKeys } = options;
  
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    // Skip if key is not in allowed list (if provided)
    if (allowedKeys && !allowedKeys.includes(key)) {
      continue;
    }
    
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeHTMLFields ? sanitizeHTML(value) : sanitizeText(value);
    } else if (Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = value.map((item: unknown) => 
        typeof item === 'string' 
          ? (sanitizeHTMLFields ? sanitizeHTML(item) : sanitizeText(item))
          : typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>, options)
          : item
      ) as any;
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, options);
    }
  }
  
  return sanitized;
}

/**
 * Sanitize resume data before saving
 * Ensures all user input is properly sanitized
 */
export function sanitizeResumeData(data: any): any {
  if (!data) return data;
  
  const sanitized = { ...data };
  
  // Sanitize personal info
  if (sanitized.personalInfo) {
    sanitized.personalInfo = {
      ...sanitized.personalInfo,
      fullName: sanitizeText(sanitized.personalInfo.fullName || ''),
      jobTitle: sanitizeText(sanitized.personalInfo.jobTitle || ''),
      email: sanitizeEmail(sanitized.personalInfo.email || ''),
      phone: sanitizePhone(sanitized.personalInfo.phone || ''),
      location: sanitizeText(sanitized.personalInfo.location || ''),
      linkedin: sanitizeURL(sanitized.personalInfo.linkedin || ''),
      website: sanitizeURL(sanitized.personalInfo.website || ''),
      summary: sanitizeText(sanitized.personalInfo.summary || ''),
      profilePicture: sanitizeURL(sanitized.personalInfo.profilePicture || ''),
    };
  }
  
  // Sanitize sections
  if (Array.isArray(sanitized.sections)) {
    sanitized.sections = sanitized.sections.map((section: any) => ({
      ...section,
      title: sanitizeText(section.title || ''),
      items: Array.isArray(section.items) ? section.items.map((item: any) => ({
        ...item,
        title: sanitizeText(item.title || ''),
        subtitle: sanitizeText(item.subtitle || ''),
        description: sanitizeText(item.description || ''),
        date: sanitizeText(item.date || ''),
        name: sanitizeText(item.name || ''),
      })) : [],
    }));
  }
  
  // Sanitize other fields
  if (sanitized.title) {
    sanitized.title = sanitizeText(sanitized.title);
  }
  
  return sanitized;
}

