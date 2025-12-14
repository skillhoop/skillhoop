/**
 * Required Fields Validation for UI
 * Checks required fields before save and provides user-friendly feedback
 */

import { ResumeData } from '../types/resume';

export interface RequiredFieldError {
  field: string;
  label: string;
  section: string;
  message: string;
}

export interface RequiredFieldsResult {
  isValid: boolean;
  errors: RequiredFieldError[];
  summary: string;
}

/**
 * Define required fields and their user-friendly labels
 */
const REQUIRED_FIELDS = {
  personalInfo: {
    fullName: {
      label: 'Full Name',
      section: 'Personal Details',
      message: 'Full name is required',
    },
  },
  resume: {
    title: {
      label: 'Resume Title',
      section: 'Resume',
      message: 'Resume title is required',
    },
  },
  sections: {
    // At least one section should have content
    hasContent: {
      label: 'Resume Content',
      section: 'Resume',
      message: 'Your resume must have at least one section with content (Experience, Education, or Skills)',
    },
  },
} as const;

/**
 * Check if resume has at least some content
 */
function hasResumeContent(resume: ResumeData): boolean {
  // Check if there's at least one section with items
  const hasSectionContent = resume.sections.some(section => 
    section.items && section.items.length > 0
  );
  
  // Check if there's experience, education, or skills
  const experienceSection = resume.sections.find(s => s.type === 'experience');
  const educationSection = resume.sections.find(s => s.type === 'education');
  const skillsSection = resume.sections.find(s => s.type === 'skills');
  const hasExperience = (experienceSection?.items?.length ?? 0) > 0;
  const hasEducation = (educationSection?.items?.length ?? 0) > 0;
  const hasSkills = (skillsSection?.items?.length ?? 0) > 0;
  
  // Check advanced sections
  const hasProjects = (resume.projects?.length ?? 0) > 0;
  const hasCertifications = (resume.certifications?.length ?? 0) > 0;
  
  return hasSectionContent || hasExperience || hasEducation || hasSkills || hasProjects || hasCertifications;
}

/**
 * Validate required fields for a resume
 */
export function validateRequiredFields(resume: ResumeData): RequiredFieldsResult {
  const errors: RequiredFieldError[] = [];
  
  // Check Full Name
  if (!resume.personalInfo?.fullName || resume.personalInfo.fullName.trim() === '') {
    errors.push({
      field: 'fullName',
      label: REQUIRED_FIELDS.personalInfo.fullName.label,
      section: REQUIRED_FIELDS.personalInfo.fullName.section,
      message: REQUIRED_FIELDS.personalInfo.fullName.message,
    });
  }
  
  // Check Resume Title
  if (!resume.title || resume.title.trim() === '') {
    errors.push({
      field: 'title',
      label: REQUIRED_FIELDS.resume.title.label,
      section: REQUIRED_FIELDS.resume.title.section,
      message: REQUIRED_FIELDS.resume.title.message,
    });
  }
  
  // Check if resume has content
  if (!hasResumeContent(resume)) {
    errors.push({
      field: 'hasContent',
      label: REQUIRED_FIELDS.sections.hasContent.label,
      section: REQUIRED_FIELDS.sections.hasContent.section,
      message: REQUIRED_FIELDS.sections.hasContent.message,
    });
  }
  
  // Generate summary
  let summary = '';
  if (errors.length === 0) {
    summary = 'All required fields are filled.';
  } else if (errors.length === 1) {
    summary = `Please fill in: ${errors[0].label}`;
  } else {
    const fieldList = errors.map(e => e.label).join(', ');
    summary = `Please fill in the following required fields: ${fieldList}`;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    summary,
  };
}

/**
 * Get field path for focusing/scroll to
 */
export function getFieldPath(field: string): string {
  const fieldMap: Record<string, string> = {
    fullName: 'personal',
    title: 'personal', // Title is shown in save modal, but we can highlight personal section
    hasContent: 'experience', // Default to experience section
  };
  
  return fieldMap[field] || 'personal';
}

/**
 * Check if a specific field is required and missing
 */
export function isFieldRequiredAndMissing(resume: ResumeData, field: string): boolean {
  switch (field) {
    case 'fullName':
      return !resume.personalInfo?.fullName || resume.personalInfo.fullName.trim() === '';
    case 'title':
      return !resume.title || resume.title.trim() === '';
    case 'hasContent':
      return !hasResumeContent(resume);
    default:
      return false;
  }
}

/**
 * Get user-friendly field label
 */
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    fullName: 'Full Name',
    title: 'Resume Title',
    hasContent: 'Resume Content',
  };
  
  return labels[field] || field;
}


