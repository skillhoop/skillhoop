/**
 * Import Validation Utility
 * Validates imported resume data structure, format, and completeness
 */

import { ResumeData } from '../types/resume';
import { z } from 'zod';

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedData?: Partial<ResumeData>;
}

/**
 * Schema for validating imported personal info
 */
const ImportedPersonalInfoSchema = z.object({
  fullName: z.string().optional(),
  name: z.string().optional(), // Support legacy 'name' field
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  linkedIn: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')), // Support both formats
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal('')), // Support both formats
  summary: z.string().optional(),
  jobTitle: z.string().optional(),
}).passthrough(); // Allow additional fields

/**
 * Schema for validating imported experience items
 */
const ImportedExperienceItemSchema = z.object({
  company: z.string().optional(),
  position: z.string().optional(),
  jobTitle: z.string().optional(), // Support both 'position' and 'jobTitle'
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
}).passthrough();

/**
 * Schema for validating imported education items
 */
const ImportedEducationItemSchema = z.object({
  institution: z.string().optional(),
  school: z.string().optional(), // Support both formats
  degree: z.string().optional(),
  field: z.string().optional(),
  graduationDate: z.string().optional(),
  endDate: z.string().optional(), // Support both formats
}).passthrough();

/**
 * Schema for validating imported skills
 */
const ImportedSkillsSchema = z.object({
  technical: z.array(z.string()).optional(),
  soft: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
}).passthrough();

const ImportedSkillsSchemaUnion = z.union([ImportedSkillsSchema, z.array(z.string())]); // Support both object and array formats

/**
 * Schema for validating imported resume data structure
 */
const ImportedResumeDataSchema = z.object({
  personalInfo: ImportedPersonalInfoSchema.optional(),
  summary: z.string().optional(),
  skills: ImportedSkillsSchemaUnion.optional(),
  experience: z.array(ImportedExperienceItemSchema).optional(),
  education: z.array(ImportedEducationItemSchema).optional(),
  sections: z.array(z.any()).optional(), // Sections are complex, validate separately
  projects: z.array(z.any()).optional(),
  certifications: z.array(z.any()).optional(),
  languages: z.array(z.any()).optional(),
}).passthrough();

/**
 * Validate imported resume data
 */
export function validateImportedResume(data: any): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data exists
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid import data: Data must be an object'],
      warnings: [],
    };
  }

  // Validate structure using Zod
  const parseResult = ImportedResumeDataSchema.safeParse(data);
  
  if (!parseResult.success) {
    errors.push('Invalid data structure: ' + parseResult.error.issues.map((e) => e.message).join(', '));
    return {
      isValid: false,
      errors,
      warnings,
    };
  }

  const validatedData = parseResult.data;

  // Validate personal info if present
  if (validatedData.personalInfo) {
    const personalInfoResult = ImportedPersonalInfoSchema.safeParse(validatedData.personalInfo);
    if (!personalInfoResult.success) {
      errors.push('Invalid personal info: ' + personalInfoResult.error.issues.map((e) => e.message).join(', '));
    } else {
      // Check for required fields (at least name or email)
      const hasName = !!(validatedData.personalInfo.fullName || validatedData.personalInfo.name);
      const hasEmail = !!(validatedData.personalInfo.email && validatedData.personalInfo.email.trim() !== '');
      
      if (!hasName && !hasEmail) {
        warnings.push('Personal info is missing both name and email. At least one is recommended.');
      }
    }
  } else {
    warnings.push('No personal information found in imported data.');
  }

  // Validate experience items if present
  if (validatedData.experience && Array.isArray(validatedData.experience)) {
    if (validatedData.experience.length === 0) {
      warnings.push('No experience entries found in imported data.');
    } else {
      validatedData.experience.forEach((exp, index) => {
        const expResult = ImportedExperienceItemSchema.safeParse(exp);
        if (!expResult.success) {
          errors.push(`Invalid experience item ${index + 1}: ${expResult.error.issues.map((e) => e.message).join(', ')}`);
        } else {
          // Check for required fields
          const hasCompany = !!(exp.company && exp.company.trim() !== '');
          const hasPosition = !!(exp.position || exp.jobTitle);
          
          if (!hasCompany || !hasPosition) {
            warnings.push(`Experience item ${index + 1} is missing company or position information.`);
          }
        }
      });
    }
  } else {
    warnings.push('No experience entries found in imported data.');
  }

  // Validate education items if present
  if (validatedData.education && Array.isArray(validatedData.education)) {
    if (validatedData.education.length === 0) {
      warnings.push('No education entries found in imported data.');
    } else {
      validatedData.education.forEach((edu, index) => {
        const eduResult = ImportedEducationItemSchema.safeParse(edu);
        if (!eduResult.success) {
          errors.push(`Invalid education item ${index + 1}: ${eduResult.error.issues.map((e) => e.message).join(', ')}`);
        } else {
          // Check for required fields
          const hasInstitution = !!(edu.institution || edu.school);
          const hasDegree = !!edu.degree;
          
          if (!hasInstitution || !hasDegree) {
            warnings.push(`Education item ${index + 1} is missing institution or degree information.`);
          }
        }
      });
    }
  } else {
    warnings.push('No education entries found in imported data.');
  }

  // Validate skills if present
  if (validatedData.skills) {
    if (Array.isArray(validatedData.skills)) {
      if (validatedData.skills.length === 0) {
        warnings.push('Skills array is empty.');
      }
    } else if (typeof validatedData.skills === 'object') {
      const skillsObj = validatedData.skills as any;
      const hasTechnical = Array.isArray(skillsObj.technical) && skillsObj.technical.length > 0;
      const hasSoft = Array.isArray(skillsObj.soft) && skillsObj.soft.length > 0;
      const hasLanguages = Array.isArray(skillsObj.languages) && skillsObj.languages.length > 0;
      
      if (!hasTechnical && !hasSoft && !hasLanguages) {
        warnings.push('No skills found in imported data.');
      }
    }
  } else {
    warnings.push('No skills found in imported data.');
  }

  // Validate sections if present
  if (validatedData.sections && Array.isArray(validatedData.sections)) {
    validatedData.sections.forEach((section, index) => {
      if (!section || typeof section !== 'object') {
        errors.push(`Section ${index + 1} is invalid: must be an object`);
      } else {
        if (!section.id || typeof section.id !== 'string') {
          errors.push(`Section ${index + 1} is missing a valid ID`);
        }
        if (!section.type || typeof section.type !== 'string') {
          errors.push(`Section ${index + 1} is missing a valid type`);
        }
        if (!Array.isArray(section.items)) {
          errors.push(`Section ${index + 1} items must be an array`);
        }
      }
    });
  }

  // Check data completeness
  const hasAnyData = 
    (validatedData.personalInfo && Object.keys(validatedData.personalInfo).length > 0) ||
    (validatedData.summary && validatedData.summary.trim() !== '') ||
    (validatedData.experience && validatedData.experience.length > 0) ||
    (validatedData.education && validatedData.education.length > 0) ||
    (validatedData.skills && (
      (Array.isArray(validatedData.skills) && validatedData.skills.length > 0) ||
      (typeof validatedData.skills === 'object' && Object.keys(validatedData.skills).length > 0)
    )) ||
    (validatedData.sections && validatedData.sections.length > 0);

  if (!hasAnyData) {
    errors.push('Imported data appears to be empty or invalid. Please check the source file.');
  }

  // Normalize and clean the data
  const normalizedData: Partial<ResumeData> = {
    ...validatedData,
    personalInfo: validatedData.personalInfo ? {
      fullName: validatedData.personalInfo.fullName || validatedData.personalInfo.name || '',
      email: validatedData.personalInfo.email || '',
      phone: validatedData.personalInfo.phone || '',
      location: validatedData.personalInfo.location || '',
      linkedin: validatedData.personalInfo.linkedin || validatedData.personalInfo.linkedIn || '',
      website: validatedData.personalInfo.website || validatedData.personalInfo.portfolio || '',
      summary: validatedData.personalInfo.summary || validatedData.summary || '',
      jobTitle: validatedData.personalInfo.jobTitle || '',
    } : undefined,
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validatedData: normalizedData,
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ImportValidationResult): string {
  if (result.isValid) {
    return '';
  }

  const parts: string[] = [];
  
  if (result.errors.length > 0) {
    parts.push('Errors:');
    result.errors.forEach((error, index) => {
      parts.push(`${index + 1}. ${error}`);
    });
  }
  
  if (result.warnings.length > 0) {
    parts.push('\nWarnings:');
    result.warnings.forEach((warning, index) => {
      parts.push(`${index + 1}. ${warning}`);
    });
  }
  
  return parts.join('\n');
}


