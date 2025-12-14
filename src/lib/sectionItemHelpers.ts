/**
 * Section Item Helpers
 * Standardized utilities for creating and managing section items consistently
 */

import { SectionItem } from '../types/resume';
import { createDateRangeString, parseDateRange, parseToStandardDate } from './dateFormatHelpers';

/**
 * Generate a unique ID for a section item
 */
export function generateSectionItemId(prefix: string = 'item'): string {
  return `${prefix}-${generateUUID()}`;
}

// Use browser crypto API for UUID generation
function generateUUID(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a standardized experience item
 * Structure: title = jobTitle, subtitle = companyName
 */
export function createExperienceItem(data: {
  id?: string;
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate?: string;
  description?: string;
}): SectionItem {
  // Use standardized date range format
  const dateString = createDateRangeString(data.startDate, data.endDate);

  return {
    id: data.id || generateSectionItemId('exp'),
    title: data.jobTitle || '',
    subtitle: data.companyName || '',
    date: dateString,
    description: data.description || '',
  };
}

/**
 * Create a standardized education item
 * Structure: title = institution, subtitle = degree
 */
export function createEducationItem(data: {
  id?: string;
  institution: string;
  degree: string;
  date?: string;
  description?: string;
}): SectionItem {
  // Normalize date to standard format
  const normalizedDate = parseToStandardDate(data.date || '');
  
  return {
    id: data.id || generateSectionItemId('edu'),
    title: data.institution || '',
    subtitle: data.degree || '',
    date: normalizedDate,
    description: data.description || '',
  };
}

/**
 * Create a standardized skills item
 * Structure: title = skillName, subtitle = proficiency (optional)
 */
export function createSkillItem(data: {
  id?: string;
  skillName: string;
  proficiency?: string;
}): SectionItem {
  return {
    id: data.id || generateSectionItemId('skill'),
    title: data.skillName || '',
    subtitle: data.proficiency || '',
    date: '',
    description: '',
  };
}

/**
 * Parse an experience item back to its components
 */
export function parseExperienceItem(item: SectionItem): {
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate: string;
  description: string;
} {
  // Use standardized date range parser
  const { startDate, endDate } = parseDateRange(item.date);
  return {
    jobTitle: item.title || '',
    companyName: item.subtitle || '',
    startDate: startDate || '',
    endDate: endDate || '',
    description: item.description || '',
  };
}

/**
 * Parse an education item back to its components
 */
export function parseEducationItem(item: SectionItem): {
  institution: string;
  degree: string;
  date: string;
  description: string;
} {
  return {
    institution: item.title || '',
    degree: item.subtitle || '',
    date: item.date || '',
    description: item.description || '',
  };
}

/**
 * Parse a skill item back to its components
 */
export function parseSkillItem(item: SectionItem): {
  skillName: string;
  proficiency: string;
} {
  return {
    skillName: item.title || '',
    proficiency: item.subtitle || '',
  };
}

/**
 * Validate a section item structure
 */
export function validateSectionItem(item: SectionItem, sectionType: 'experience' | 'education' | 'skills'): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!item.id || item.id.trim() === '') {
    errors.push('Item ID is required');
  }

  if (!item.title || item.title.trim() === '') {
    errors.push('Title is required');
  }

  // Section-specific validation
  if (sectionType === 'experience') {
    if (!item.subtitle || item.subtitle.trim() === '') {
      errors.push('Company name is required for experience items');
    }
  } else if (sectionType === 'education') {
    if (!item.subtitle || item.subtitle.trim() === '') {
      errors.push('Degree is required for education items');
    }
  }
  // Skills don't require subtitle (proficiency is optional)

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize a section item to ensure all fields exist
 */
export function normalizeSectionItem(item: Partial<SectionItem>): SectionItem {
  return {
    id: item.id || generateSectionItemId(),
    title: item.title || '',
    subtitle: item.subtitle || '',
    date: item.date || '',
    description: item.description || '',
  };
}

