/**
 * Resume Data Validation using Zod
 * Validates resume data before saving to prevent crashes and data corruption
 */

import { z } from 'zod';
import { ResumeData } from '../types/resume';

// Section Item Schema
const SectionItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().default(''),
  subtitle: z.string().default(''),
  date: z.string().default(''),
  description: z.string().default(''),
});

// Resume Section Schema
const ResumeSectionSchema = z.object({
  id: z.string().min(1, 'Section ID is required'),
  title: z.string().min(1, 'Section title is required'),
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
  items: z.array(SectionItemSchema).default([]),
});

// Personal Info Schema
const PersonalInfoSchema = z.object({
  fullName: z.string().default(''),
  email: z
    .string()
    .email('Invalid email address')
    .or(z.literal(''))
    .default(''),
  phone: z.string().default(''),
  linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional(),
  website: z.string().url('Invalid website URL').or(z.literal('')).optional(),
  summary: z.string().default(''),
  location: z.string().optional(),
  jobTitle: z.string().optional(),
  profilePicture: z.string().url('Invalid image URL').or(z.literal('')).optional(),
});

// Formatting Settings Schema
const FormattingSettingsSchema = z.object({
  fontFamily: z.string().default('Inter'),
  fontSize: z.number().min(8).max(24).default(11),
  accentColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
    .default('#3B82F6'),
  lineHeight: z.number().min(1).max(3).default(1.5),
  layout: z.enum(['classic', 'modern', 'columns']).default('classic'),
  templateId: z.string().optional(),
});

// Target Job Schema
const TargetJobSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  industry: z.string().default(''),
});

// Project Schema
const ProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().default(''),
  role: z.string().optional(),
  company: z.string().optional(),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  description: z.string().default(''),
  url: z.string().url('Invalid URL').or(z.literal('')).optional(),
});

// Certification Schema
const CertificationSchema = z.object({
  id: z.string().min(1),
  name: z.string().default(''),
  issuer: z.string().default(''),
  date: z.string().default(''),
  url: z.string().url('Invalid URL').or(z.literal('')).optional(),
});

// Language Schema
const LanguageSchema = z.object({
  id: z.string().min(1),
  language: z.string().default(''),
  proficiency: z
    .enum(['Native', 'Fluent', 'Intermediate', 'Basic', 'Conversational', 'Professional'])
    .default('Intermediate'),
});

// Volunteer Schema
const VolunteerSchema = z.object({
  id: z.string().min(1),
  organization: z.string().default(''),
  role: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  description: z.string().default(''),
});

// Custom Section Schema
const CustomSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().default(''),
  items: z.array(SectionItemSchema).default([]),
});

// Main Resume Data Schema
export const ResumeSchema = z.object({
  id: z.string().min(1, 'Resume ID is required'),
  title: z.string().default('Untitled Resume'),
  personalInfo: PersonalInfoSchema,
  sections: z.array(ResumeSectionSchema).default([]),
  settings: FormattingSettingsSchema,
  atsScore: z.number().min(0).max(100).default(0),
  updatedAt: z.string().datetime('Invalid date format').or(z.string()),
  isAISidebarOpen: z.boolean().default(false),
  targetJob: TargetJobSchema,
  targetJobId: z.string().nullable().optional(),
  focusedSectionId: z.string().nullable().default(null),
  projects: z.array(ProjectSchema).optional(),
  certifications: z.array(CertificationSchema).optional(),
  languages: z.array(LanguageSchema).optional(),
  volunteer: z.array(VolunteerSchema).optional(),
  customSections: z.array(CustomSectionSchema).optional(),
});

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
export function validateResume(data: any): ValidationResult {
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
      const errorMessages = error.errors.map((err) => {
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
export function safeValidateResume(data: any): ValidationResult {
  try {
    // First, ensure all required fields exist with defaults
    const sanitizedData = {
      id: data.id || '',
      title: data.title || 'Untitled Resume',
      personalInfo: {
        fullName: data.personalInfo?.fullName || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        linkedin: data.personalInfo?.linkedin || '',
        website: data.personalInfo?.website || '',
        summary: data.personalInfo?.summary || '',
        location: data.personalInfo?.location || '',
        jobTitle: data.personalInfo?.jobTitle || '',
        profilePicture: data.personalInfo?.profilePicture || '',
      },
      sections: Array.isArray(data.sections) ? data.sections : [],
      settings: {
        fontFamily: data.settings?.fontFamily || 'Inter',
        fontSize: typeof data.settings?.fontSize === 'number' ? data.settings.fontSize : 11,
        accentColor: data.settings?.accentColor || '#3B82F6',
        lineHeight: typeof data.settings?.lineHeight === 'number' ? data.settings.lineHeight : 1.5,
        layout: data.settings?.layout || 'classic',
        templateId: data.settings?.templateId || 'classic',
      },
      atsScore: typeof data.atsScore === 'number' ? data.atsScore : 0,
      updatedAt: data.updatedAt || new Date().toISOString(),
      isAISidebarOpen: typeof data.isAISidebarOpen === 'boolean' ? data.isAISidebarOpen : false,
      targetJob: {
        title: data.targetJob?.title || '',
        description: data.targetJob?.description || '',
        industry: data.targetJob?.industry || '',
      },
      targetJobId: data.targetJobId || null,
      focusedSectionId: data.focusedSectionId || null,
      projects: Array.isArray(data.projects) ? data.projects : undefined,
      certifications: Array.isArray(data.certifications) ? data.certifications : undefined,
      languages: Array.isArray(data.languages) ? data.languages : undefined,
      volunteer: Array.isArray(data.volunteer) ? data.volunteer : undefined,
      customSections: Array.isArray(data.customSections) ? data.customSections : undefined,
    };

    // Now validate the sanitized data
    return validateResume(sanitizedData);
  } catch (error) {
    return {
      success: false,
      errorMessages: ['Failed to sanitize resume data'],
    };
  }
}

