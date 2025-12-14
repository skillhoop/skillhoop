/**
 * Resume Auditor
 * Scans resume content for quality issues and provides actionable feedback
 */

import type { ResumeData } from '../types/resume';

export interface AuditWarning {
  id: string;
  section: string;
  message: string;
  severity: 'warning' | 'error';
  field?: string; // Optional field identifier for scrolling
}

// Weak verbs to detect
const WEAK_VERBS = [
  /\bresponsible for\b/gi,
  /\bhelped\b/gi,
  /\bworked on\b/gi,
  /\bworked with\b/gi,
  /\bdid\b/gi,
  /\bmade\b/gi,
  /\btried\b/gi,
  /\battempted\b/gi,
  /\bassisted\b/gi,
  /\bparticipated\b/gi,
];

// First person pronouns
const FIRST_PERSON = [
  /\bI\b/g,
  /\bme\b/g,
  /\bmy\b/g,
  /\bwe\b/g,
  /\bour\b/g,
  /\bus\b/g,
];

// Filler words
const FILLER_WORDS = [
  /\bvery\b/gi,
  /\bbasically\b/gi,
  /\bactually\b/gi,
  /\breally\b/gi,
  /\bjust\b/gi,
  /\bquite\b/gi,
  /\bsimply\b/gi,
  /\bkind of\b/gi,
  /\bsort of\b/gi,
];

// Action verb suggestions
const ACTION_VERB_SUGGESTIONS: Record<string, string[]> = {
  'responsible for': ['Managed', 'Led', 'Oversaw', 'Directed', 'Coordinated'],
  'helped': ['Supported', 'Facilitated', 'Enabled', 'Contributed to'],
  'worked on': ['Developed', 'Created', 'Built', 'Designed', 'Implemented'],
  'worked with': ['Collaborated with', 'Partnered with', 'Liaised with'],
  'did': ['Executed', 'Performed', 'Completed', 'Delivered'],
  'made': ['Created', 'Produced', 'Generated', 'Established'],
  'tried': ['Attempted', 'Pursued', 'Sought'],
  'attempted': ['Pursued', 'Sought', 'Strived'],
  'assisted': ['Supported', 'Facilitated', 'Aided'],
  'participated': ['Contributed to', 'Engaged in', 'Took part in'],
};

/**
 * Extract all text content from resume for analysis
 * Currently unused but kept for future analysis features
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _extractTextContent(resumeData: ResumeData): string {
  let text = '';

  // Personal info summary
  if (resumeData.personalInfo?.summary) {
    text += resumeData.personalInfo.summary + ' ';
  }

  // Sections
  if (resumeData.sections) {
    resumeData.sections.forEach((section) => {
      if (section.items) {
        section.items.forEach((item) => {
          if (item.description) text += item.description + ' ';
          if (item.title) text += item.title + ' ';
          if (item.subtitle) text += item.subtitle + ' ';
        });
      }
    });
  }

  // Projects
  if (resumeData.projects) {
    resumeData.projects.forEach((project) => {
      if (project.description) text += project.description + ' ';
      if (project.title) text += project.title + ' ';
    });
  }

  return text;
}

/**
 * Check for weak verbs in text
 */
function checkWeakVerbs(text: string, section: string, field?: string): AuditWarning[] {
  const warnings: AuditWarning[] = [];

  WEAK_VERBS.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      const verb = matches[0].toLowerCase().trim();
      const suggestions = ACTION_VERB_SUGGESTIONS[verb] || ['Use stronger action verbs'];
      
      warnings.push({
        id: `weak-verb-${section}-${warnings.length}`,
        section,
        message: `Found weak verb "${verb}". Consider using: ${suggestions.join(', ')}`,
        severity: 'warning',
        field,
      });
    }
  });

  return warnings;
}

/**
 * Check for first person pronouns
 */
function checkFirstPerson(text: string, section: string, field?: string): AuditWarning[] {
  const warnings: AuditWarning[] = [];

  FIRST_PERSON.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      warnings.push({
        id: `first-person-${section}-${warnings.length}`,
        section,
        message: `Found first person "${matches[0]}". Resumes should be written in third person or without pronouns.`,
        severity: 'warning',
        field,
      });
    }
  });

  return warnings;
}

/**
 * Check for filler words
 */
function checkFillerWords(text: string, section: string, field?: string): AuditWarning[] {
  const warnings: AuditWarning[] = [];

  FILLER_WORDS.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      warnings.push({
        id: `filler-${section}-${warnings.length}`,
        section,
        message: `Found filler word "${matches[0]}". Remove unnecessary words to make your resume more concise.`,
        severity: 'warning',
        field,
      });
    }
  });

  return warnings;
}

/**
 * Check for empty fields in Experience and Education sections
 */
function checkEmptyFields(resumeData: ResumeData): AuditWarning[] {
  const warnings: AuditWarning[] = [];

  // Check Experience section
  const experienceSection = resumeData.sections?.find((s) => s.type === 'experience');
  if (experienceSection) {
    experienceSection.items.forEach((item, index) => {
      if (!item.title || item.title.trim() === '') {
        warnings.push({
          id: `empty-experience-title-${index}`,
          section: 'Experience',
          message: `Experience item ${index + 1} is missing a job title.`,
          severity: 'error',
          field: `experience-${index}-title`,
        });
      }
      if (!item.subtitle || item.subtitle.trim() === '') {
        warnings.push({
          id: `empty-experience-company-${index}`,
          section: 'Experience',
          message: `Experience item ${index + 1} is missing a company name.`,
          severity: 'error',
          field: `experience-${index}-company`,
        });
      }
      if (!item.description || item.description.trim() === '') {
        warnings.push({
          id: `empty-experience-description-${index}`,
          section: 'Experience',
          message: `Experience item ${index + 1} is missing a description.`,
          severity: 'error',
          field: `experience-${index}-description`,
        });
      }
    });
  }

  // Check Education section
  const educationSection = resumeData.sections?.find((s) => s.type === 'education');
  if (educationSection) {
    educationSection.items.forEach((item, index) => {
      if (!item.title || item.title.trim() === '') {
        warnings.push({
          id: `empty-education-degree-${index}`,
          section: 'Education',
          message: `Education item ${index + 1} is missing a degree.`,
          severity: 'error',
          field: `education-${index}-degree`,
        });
      }
      if (!item.subtitle || item.subtitle.trim() === '') {
        warnings.push({
          id: `empty-education-school-${index}`,
          section: 'Education',
          message: `Education item ${index + 1} is missing a school name.`,
          severity: 'error',
          field: `education-${index}-school`,
        });
      }
    });
  }

  return warnings;
}

/**
 * Main audit function
 */
export function auditResume(resumeData: ResumeData): AuditWarning[] {
  const warnings: AuditWarning[] = [];

  // Check empty fields first (errors)
  warnings.push(...checkEmptyFields(resumeData));

  // Extract all text content (for future use if needed)
  // const allText = extractTextContent(resumeData);

  // Check sections individually for better context
  if (resumeData.sections) {
    resumeData.sections.forEach((section) => {
      if (section.items) {
        section.items.forEach((item, itemIndex) => {
          const itemText = [
            item.title,
            item.subtitle,
            item.description,
          ].filter(Boolean).join(' ');

          if (itemText) {
            warnings.push(...checkWeakVerbs(itemText, section.title || section.type, `section-${section.id}-item-${itemIndex}`));
            warnings.push(...checkFirstPerson(itemText, section.title || section.type, `section-${section.id}-item-${itemIndex}`));
            warnings.push(...checkFillerWords(itemText, section.title || section.type, `section-${section.id}-item-${itemIndex}`));
          }
        });
      }
    });
  }

  // Check personal info summary
  if (resumeData.personalInfo?.summary) {
    const summaryText = resumeData.personalInfo.summary;
    warnings.push(...checkWeakVerbs(summaryText, 'Summary', 'summary'));
    warnings.push(...checkFirstPerson(summaryText, 'Summary', 'summary'));
    warnings.push(...checkFillerWords(summaryText, 'Summary', 'summary'));
  }

  // Check projects
  if (resumeData.projects) {
    resumeData.projects.forEach((project, index) => {
      const projectText = [project.title, project.description].filter(Boolean).join(' ');
      if (projectText) {
        warnings.push(...checkWeakVerbs(projectText, 'Projects', `project-${index}`));
        warnings.push(...checkFirstPerson(projectText, 'Projects', `project-${index}`));
        warnings.push(...checkFillerWords(projectText, 'Projects', `project-${index}`));
      }
    });
  }

  // Remove duplicates (same issue in same section)
  const uniqueWarnings = warnings.filter((warning, index, self) =>
    index === self.findIndex((w) => 
      w.id === warning.id || 
      (w.section === warning.section && w.message === warning.message)
    )
  );

  return uniqueWarnings;
}


