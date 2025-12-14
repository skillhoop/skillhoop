/**
 * Optional Field Helpers
 * Standardized utilities for handling optional fields consistently
 */

/**
 * Normalize an optional field value
 * Converts null, undefined, or empty string to a consistent default
 */
export function normalizeOptionalField<T>(
  value: T | null | undefined | '',
  defaultValue: T | '' = ''
): T | '' {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return value;
}

/**
 * Get a string value, defaulting to empty string
 * Handles null, undefined, and empty strings consistently
 */
export function getStringValue(value: string | null | undefined | ''): string {
  return normalizeOptionalField(value, '');
}

/**
 * Get an optional string value (can be undefined)
 * Only converts null/empty string to undefined, preserves undefined
 */
export function getOptionalString(value: string | null | undefined | ''): string | undefined {
  if (value === null || value === '') {
    return undefined;
  }
  return value;
}

/**
 * Check if an optional field has a value
 */
export function hasOptionalValue(value: any): boolean {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Get a value or return a default
 * More explicit than || operator, handles empty strings correctly
 */
export function getValueOrDefault<T>(value: T | null | undefined | '', defaultValue: T): T {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return value as T;
}

/**
 * Normalize personal info optional fields
 */
export function normalizePersonalInfoOptionalFields(personalInfo: {
  linkedin?: string | null;
  website?: string | null;
  location?: string | null;
  jobTitle?: string | null;
  profilePicture?: string | null;
}): {
  linkedin: string | undefined;
  website: string | undefined;
  location: string | undefined;
  jobTitle: string | undefined;
  profilePicture: string | undefined;
} {
  return {
    linkedin: getOptionalString(personalInfo.linkedin),
    website: getOptionalString(personalInfo.website),
    location: getOptionalString(personalInfo.location),
    jobTitle: getOptionalString(personalInfo.jobTitle),
    profilePicture: getOptionalString(personalInfo.profilePicture),
  };
}

/**
 * Normalize section item optional fields
 * Ensures all fields are strings (empty string for optional fields)
 */
export function normalizeSectionItemFields(item: {
  id?: string | null;
  title?: string | null;
  subtitle?: string | null;
  date?: string | null;
  description?: string | null;
}): {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
} {
  return {
    id: getStringValue(item.id || ''),
    title: getStringValue(item.title || ''),
    subtitle: getStringValue(item.subtitle || ''),
    date: getStringValue(item.date || ''),
    description: getStringValue(item.description || ''),
  };
}

/**
 * Normalize project optional fields
 */
export function normalizeProjectOptionalFields(project: {
  role?: string | null;
  company?: string | null;
  url?: string | null;
}): {
  role: string | undefined;
  company: string | undefined;
  url: string | undefined;
} {
  return {
    role: getOptionalString(project.role),
    company: getOptionalString(project.company),
    url: getOptionalString(project.url),
  };
}

/**
 * Normalize certification optional fields
 */
export function normalizeCertificationOptionalFields(certification: {
  url?: string | null;
}): {
  url: string | undefined;
} {
  return {
    url: getOptionalString(certification.url),
  };
}

/**
 * Normalize formatting settings optional fields
 */
export function normalizeFormattingSettingsOptionalFields(settings: {
  templateId?: string | null;
}): {
  templateId: string | undefined;
} {
  return {
    templateId: getOptionalString(settings.templateId),
  };
}

/**
 * Normalize resume data optional fields
 */
export function normalizeResumeDataOptionalFields(resume: {
  targetJobId?: string | null;
  focusedSectionId?: string | null;
  projects?: any[] | null;
  certifications?: any[] | null;
  languages?: any[] | null;
  volunteer?: any[] | null;
  customSections?: any[] | null;
}): {
  targetJobId: string | null | undefined;
  focusedSectionId: string | null;
  projects: any[] | undefined;
  certifications: any[] | undefined;
  languages: any[] | undefined;
  volunteer: any[] | undefined;
  customSections: any[] | undefined;
} {
  return {
    targetJobId: resume.targetJobId === null ? null : getOptionalString(resume.targetJobId),
    focusedSectionId: resume.focusedSectionId === null ? null : getStringValue(resume.focusedSectionId || '') || null,
    projects: resume.projects && resume.projects.length > 0 ? resume.projects : undefined,
    certifications: resume.certifications && resume.certifications.length > 0 ? resume.certifications : undefined,
    languages: resume.languages && resume.languages.length > 0 ? resume.languages : undefined,
    volunteer: resume.volunteer && resume.volunteer.length > 0 ? resume.volunteer : undefined,
    customSections: resume.customSections && resume.customSections.length > 0 ? resume.customSections : undefined,
  };
}



