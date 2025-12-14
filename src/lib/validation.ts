/**
 * Resume Data Validation using Zod
 * Validates resume data before saving to prevent crashes and data corruption
 */

import { z } from 'zod';
import { ResumeData } from '../types/resume';
import { getOptionalString, getStringValue } from './optionalFieldHelpers';

// Date validation helper - checks if date string is valid
const dateStringSchema = z.string().refine(
  (val) => {
    if (!val || val.trim() === '') return true; // Empty dates are allowed
    // Try to parse the date
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: 'Invalid date format' }
);

// URL validation helper - allows empty strings or valid URLs
const optionalUrlSchema = z.string()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid URL format' }
  )
  .optional();

// Section Item Schema with enhanced validation
const SectionItemSchema = z.object({
  id: z.string().min(1, 'ID is required').max(100, 'ID too long'),
  title: z.string().max(500, 'Title too long').default(''),
  subtitle: z.string().max(500, 'Subtitle too long').default(''),
  date: dateStringSchema.default(''),
  description: z.string().max(5000, 'Description too long').default(''),
}).refine(
  (data) => {
    // Ensure at least one field has content
    return data.title || data.subtitle || data.description;
  },
  { message: 'Section item must have at least one field with content', path: ['title'] }
);

// Resume Section Schema with enhanced validation
const ResumeSectionSchema = z.object({
  id: z.string().min(1, 'Section ID is required').max(100, 'Section ID too long'),
  title: z.string().min(1, 'Section title is required').max(200, 'Section title too long'),
  type: z.enum([
    'personal',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'languages',
    'volunteer',
    'custom',
  ]),
  isVisible: z.boolean().default(true),
  items: z.array(SectionItemSchema)
    .max(100, 'Too many items in section')
    .default([])
    .refine(
      (items) => {
        // Check for duplicate IDs within the section
        const ids = items.map(item => item.id);
        return ids.length === new Set(ids).size;
      },
      { message: 'Duplicate item IDs found in section' }
    ),
});

// Personal Info Schema with enhanced validation
const PersonalInfoSchema = z.object({
  fullName: z.string()
    .max(200, 'Full name too long')
    .default('')
    .refine(
      (val) => {
        // Check for suspicious patterns (e.g., script tags, excessive special chars)
        if (val.includes('<script') || val.includes('javascript:')) {
          return false;
        }
        return true;
      },
      { message: 'Full name contains invalid characters' }
    ),
  email: z
    .string()
    .max(255, 'Email too long')
    .email('Invalid email address')
    .or(z.literal(''))
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true;
        // Additional email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val);
      },
      { message: 'Invalid email format' }
    ),
  phone: z.string()
    .max(50, 'Phone number too long')
    .default('')
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        // Basic phone validation (allows various formats)
        const phoneRegex = /^[\d\s\-+()]+$/;
        return phoneRegex.test(val);
      },
      { message: 'Invalid phone number format' }
    ),
  linkedin: optionalUrlSchema,
  website: optionalUrlSchema,
  summary: z.string()
    .max(2000, 'Summary too long')
    .default(''),
  location: z.string()
    .max(200, 'Location too long')
    .optional(),
  jobTitle: z.string()
    .max(200, 'Job title too long')
    .optional(),
  profilePicture: optionalUrlSchema,
});

// Formatting Settings Schema with enhanced validation
const FormattingSettingsSchema = z.object({
  fontFamily: z.string()
    .max(100, 'Font family name too long')
    .default('Inter')
    .refine(
      (val) => {
        // Check for safe font names (no script injection)
        return !val.includes('<') && !val.includes('>') && !val.includes('script');
      },
      { message: 'Invalid font family name' }
    ),
  fontSize: z.number()
    .min(8, 'Font size too small')
    .max(24, 'Font size too large')
    .default(11)
    .refine((val) => !isNaN(val) && isFinite(val), { message: 'Font size must be a valid number' }),
  accentColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
    .default('#3B82F6'),
  lineHeight: z.number()
    .min(0.5, 'Line height too small')
    .max(5, 'Line height too large')
    .default(1.5)
    .refine((val) => !isNaN(val) && isFinite(val), { message: 'Line height must be a valid number' }),
  layout: z.enum(['classic', 'modern', 'columns']).default('classic'),
  templateId: z.string()
    .max(100, 'Template ID too long')
    .optional(),
});

// Target Job Schema
const TargetJobSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  industry: z.string().default(''),
});

// Project Schema with date range validation
const ProjectSchema = z.object({
  id: z.string().min(1).max(100, 'ID too long'),
  title: z.string().max(500, 'Title too long').default(''),
  role: z.string().max(200, 'Role too long').optional(),
  company: z.string().max(200, 'Company name too long').optional(),
  startDate: dateStringSchema.default(''),
  endDate: dateStringSchema.default(''),
  description: z.string().max(5000, 'Description too long').default(''),
  url: optionalUrlSchema,
}).refine(
  (data) => {
    // Validate date range: end date should be after start date
    if (data.startDate && data.endDate && data.startDate.trim() && data.endDate.trim()) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return end >= start;
      }
    }
    return true;
  },
  { message: 'End date must be after start date', path: ['endDate'] }
);

// Certification Schema with enhanced validation
const CertificationSchema = z.object({
  id: z.string().min(1).max(100, 'ID too long'),
  name: z.string().max(500, 'Certification name too long').default(''),
  issuer: z.string().max(200, 'Issuer name too long').default(''),
  date: dateStringSchema.default(''),
  url: optionalUrlSchema,
}).refine(
  (data) => {
    // At least name or issuer should be provided
    return data.name.trim() || data.issuer.trim();
  },
  { message: 'Certification must have a name or issuer', path: ['name'] }
);

// Language Schema
const LanguageSchema = z.object({
  id: z.string().min(1),
  language: z.string().default(''),
  proficiency: z
    .enum(['Native', 'Fluent', 'Intermediate', 'Basic', 'Conversational', 'Professional'])
    .default('Intermediate'),
});

// Volunteer Schema with date range validation
const VolunteerSchema = z.object({
  id: z.string().min(1).max(100, 'ID too long'),
  organization: z.string().max(200, 'Organization name too long').default(''),
  role: z.string().max(200, 'Role too long').default(''),
  startDate: dateStringSchema.default(''),
  endDate: dateStringSchema.default(''),
  description: z.string().max(5000, 'Description too long').default(''),
}).refine(
  (data) => {
    // Validate date range
    if (data.startDate && data.endDate && data.startDate.trim() && data.endDate.trim()) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return end >= start;
      }
    }
    return true;
  },
  { message: 'End date must be after start date', path: ['endDate'] }
).refine(
  (data) => {
    // At least organization or role should be provided
    return data.organization.trim() || data.role.trim();
  },
  { message: 'Volunteer entry must have an organization or role', path: ['organization'] }
);

// Custom Section Schema
const CustomSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().default(''),
  items: z.array(SectionItemSchema).default([]),
});

// Main Resume Data Schema with comprehensive validation
export const ResumeSchema = z.object({
  id: z.string()
    .min(1, 'Resume ID is required')
    .max(100, 'Resume ID too long')
    .refine(
      (val) => {
        // Check for valid ID format (no special characters that could cause issues)
        return /^[a-zA-Z0-9_-]+$/.test(val);
      },
      { message: 'Resume ID contains invalid characters' }
    ),
  title: z.string()
    .max(200, 'Title too long')
    .default('Untitled Resume')
    .refine(
      (val) => {
        // Check for suspicious patterns
        return !val.includes('<script') && !val.includes('javascript:');
      },
      { message: 'Title contains invalid characters' }
    ),
  personalInfo: PersonalInfoSchema,
  sections: z.array(ResumeSectionSchema)
    .max(50, 'Too many sections')
    .default([])
    .refine(
      (sections) => {
        // Check for duplicate section IDs
        const ids = sections.map(s => s.id);
        return ids.length === new Set(ids).size;
      },
      { message: 'Duplicate section IDs found' }
    ),
  settings: FormattingSettingsSchema,
  atsScore: z.number()
    .min(0, 'ATS score cannot be negative')
    .max(100, 'ATS score cannot exceed 100')
    .default(0)
    .refine((val) => !isNaN(val) && isFinite(val), { message: 'ATS score must be a valid number' }),
  updatedAt: z.string()
    .refine(
      (val) => {
        if (!val) return false;
        // Try to parse as ISO date
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Invalid updatedAt date format' }
    ),
  isAISidebarOpen: z.boolean().default(false),
  targetJob: TargetJobSchema,
  targetJobId: z.string()
    .max(100, 'Target job ID too long')
    .nullable()
    .optional(),
  focusedSectionId: z.string()
    .max(100, 'Focused section ID too long')
    .nullable()
    .default(null),
  projects: z.array(ProjectSchema)
    .max(100, 'Too many projects')
    .optional()
    .refine(
      (projects) => {
        if (!projects) return true;
        // Check for duplicate project IDs
        const ids = projects.map(p => p.id);
        return ids.length === new Set(ids).size;
      },
      { message: 'Duplicate project IDs found' }
    ),
  certifications: z.array(CertificationSchema)
    .max(100, 'Too many certifications')
    .optional()
    .refine(
      (certs) => {
        if (!certs) return true;
        // Check for duplicate certification IDs
        const ids = certs.map(c => c.id);
        return ids.length === new Set(ids).size;
      },
      { message: 'Duplicate certification IDs found' }
    ),
  languages: z.array(LanguageSchema)
    .max(50, 'Too many languages')
    .optional()
    .refine(
      (langs) => {
        if (!langs) return true;
        // Check for duplicate language IDs
        const ids = langs.map(l => l.id);
        return ids.length === new Set(ids).size;
      },
      { message: 'Duplicate language IDs found' }
    ),
  volunteer: z.array(VolunteerSchema)
    .max(50, 'Too many volunteer entries')
    .optional()
    .refine(
      (vols) => {
        if (!vols) return true;
        // Check for duplicate volunteer IDs
        const ids = vols.map(v => v.id);
        return ids.length === new Set(ids).size;
      },
      { message: 'Duplicate volunteer IDs found' }
    ),
  customSections: z.array(CustomSectionSchema)
    .max(20, 'Too many custom sections')
    .optional()
    .refine(
      (sections) => {
        if (!sections) return true;
        // Check for duplicate custom section IDs
        const ids = sections.map(s => s.id);
        return ids.length === new Set(ids).size;
      },
      { message: 'Duplicate custom section IDs found' }
    ),
}).refine(
  (data) => {
    // Cross-field validation: focusedSectionId should reference an existing section
    if (data.focusedSectionId) {
      const sectionExists = data.sections.some(s => s.id === data.focusedSectionId);
      return sectionExists;
    }
    return true;
  },
  { message: 'Focused section ID does not exist', path: ['focusedSectionId'] }
);

// Validation result type
export interface ValidationResult {
  success: boolean;
  data?: ResumeData;
  errors?: z.ZodError;
  errorMessages?: string[];
}

/**
 * Validate resume data
 * @param data - The resume data to validate
 * @returns Validation result with success status and errors if any
 */
export function validateResume(data: unknown): ValidationResult {
  try {
    // Parse and validate the data
    const validatedData = ResumeSchema.parse(data);

    return {
      success: true,
      data: validatedData as ResumeData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format error messages for user-friendly display
      const errorMessages = error.issues.map((err: z.ZodIssue) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });

      return {
        success: false,
        errors: error,
        errorMessages,
      };
    }

    // Unexpected error
    return {
      success: false,
      errorMessages: ['Unexpected validation error occurred'],
    };
  }
}

/**
 * Safe validate - attempts to fix common issues and return valid data
 * @param data - The resume data to validate and fix
 * @returns Validation result with potentially fixed data
 */
export function safeValidateResume(data: unknown): ValidationResult {
  try {
    // Type guard: ensure data is an object
    if (!data || typeof data !== 'object') {
      return {
        success: false,
        errorMessages: ['Invalid data type: expected object'],
      };
    }
    
    const dataObj = data as Record<string, unknown>;
    
    // First, ensure all required fields exist with defaults
    const sanitizedData = {
      id: (typeof dataObj.id === 'string' ? dataObj.id : '') || '',
      title: (typeof dataObj.title === 'string' ? dataObj.title : '') || 'Untitled Resume',
      personalInfo: {
        fullName: getStringValue((dataObj.personalInfo as Record<string, unknown>)?.fullName as string | null | undefined),
        email: getStringValue((dataObj.personalInfo as Record<string, unknown>)?.email as string | null | undefined),
        phone: getStringValue((dataObj.personalInfo as Record<string, unknown>)?.phone as string | null | undefined),
        linkedin: getOptionalString((dataObj.personalInfo as Record<string, unknown>)?.linkedin as string | null | undefined),
        website: getOptionalString((dataObj.personalInfo as Record<string, unknown>)?.website as string | null | undefined),
        summary: getStringValue((dataObj.personalInfo as Record<string, unknown>)?.summary as string | null | undefined),
        location: getOptionalString((dataObj.personalInfo as Record<string, unknown>)?.location as string | null | undefined),
        jobTitle: getOptionalString((dataObj.personalInfo as Record<string, unknown>)?.jobTitle as string | null | undefined),
        profilePicture: getOptionalString((dataObj.personalInfo as Record<string, unknown>)?.profilePicture as string | null | undefined),
      },
      sections: Array.isArray(dataObj.sections) ? dataObj.sections : [],
      settings: {
        fontFamily: (typeof (dataObj.settings as Record<string, unknown>)?.fontFamily === 'string' ? (dataObj.settings as Record<string, unknown>).fontFamily : 'Inter') || 'Inter',
        fontSize: typeof (dataObj.settings as Record<string, unknown>)?.fontSize === 'number' ? (dataObj.settings as Record<string, unknown>).fontSize : 11,
        accentColor: (typeof (dataObj.settings as Record<string, unknown>)?.accentColor === 'string' ? (dataObj.settings as Record<string, unknown>).accentColor : '#3B82F6') || '#3B82F6',
        lineHeight: typeof (dataObj.settings as Record<string, unknown>)?.lineHeight === 'number' ? (dataObj.settings as Record<string, unknown>).lineHeight : 1.5,
        layout: (typeof (dataObj.settings as Record<string, unknown>)?.layout === 'string' ? (dataObj.settings as Record<string, unknown>).layout : 'classic') || 'classic',
        templateId: (typeof (dataObj.settings as Record<string, unknown>)?.templateId === 'string' ? (dataObj.settings as Record<string, unknown>).templateId : 'classic') || 'classic',
      },
      atsScore: typeof dataObj.atsScore === 'number' ? dataObj.atsScore : 0,
      updatedAt: (typeof dataObj.updatedAt === 'string' ? dataObj.updatedAt : '') || new Date().toISOString(),
      isAISidebarOpen: typeof dataObj.isAISidebarOpen === 'boolean' ? dataObj.isAISidebarOpen : false,
      targetJob: {
        title: (typeof (dataObj.targetJob as Record<string, unknown>)?.title === 'string' ? (dataObj.targetJob as Record<string, unknown>).title : '') || '',
        description: (typeof (dataObj.targetJob as Record<string, unknown>)?.description === 'string' ? (dataObj.targetJob as Record<string, unknown>).description : '') || '',
        industry: (typeof (dataObj.targetJob as Record<string, unknown>)?.industry === 'string' ? (dataObj.targetJob as Record<string, unknown>).industry : '') || '',
      },
      targetJobId: (typeof dataObj.targetJobId === 'string' ? dataObj.targetJobId : null) || null,
      focusedSectionId: (typeof dataObj.focusedSectionId === 'string' ? dataObj.focusedSectionId : null) || null,
      projects: Array.isArray(dataObj.projects) ? dataObj.projects : undefined,
      certifications: Array.isArray(dataObj.certifications) ? dataObj.certifications : undefined,
      languages: Array.isArray(dataObj.languages) ? dataObj.languages : undefined,
      volunteer: Array.isArray(dataObj.volunteer) ? dataObj.volunteer : undefined,
      customSections: Array.isArray(dataObj.customSections) ? dataObj.customSections : undefined,
    };

    // Now validate the sanitized data
    return validateResume(sanitizedData);
  } catch {
    return {
      success: false,
      errorMessages: ['Failed to sanitize resume data'],
    };
  }
}

