/**
 * Resume Import Converter
 * Converts parsed resume data (from PDF/LinkedIn) to ResumeEditorPage format
 */

import type { ParsedResumeData } from './resumeParser';
import { ResumeData as EditorResumeData } from '../components/resume/ResumeControlPanel';

/**
 * Convert parsed resume data to ResumeEditorPage format
 */
export function convertParsedToEditorFormat(parsed: ParsedResumeData): EditorResumeData {
  // Handle both 'name' and 'fullName' for backward compatibility
  // Using type assertion for legacy data that might have 'name' instead of 'fullName'
  const fullName = parsed.personalInfo.fullName || (parsed.personalInfo as ParsedResumeData['personalInfo'] & { name?: string }).name || '';
  
  return {
    personalInfo: {
      fullName: fullName,
      jobTitle: '', // Will be extracted from experience or summary if available
      email: parsed.personalInfo.email || '',
      phone: parsed.personalInfo.phone || '',
      location: parsed.personalInfo.location || '',
    },
    summary: parsed.summary || '',
    experience: parsed.experience.map((exp, index) => ({
      id: `exp_${Date.now()}_${index}`,
      jobTitle: exp.position || '',
      company: exp.company || '',
      location: '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: [
        exp.description || '',
        ...(exp.achievements || []).map((ach: string) => `• ${ach}`),
      ].filter(Boolean).join('\n'),
    })),
    education: parsed.education.map((edu, index: number) => ({
      id: `edu_${Date.now()}_${index}`,
      school: edu.institution || '',
      degree: `${edu.degree || ''} ${edu.field ? `in ${edu.field}` : ''}`.trim(),
      location: '',
      startDate: '',
      endDate: edu.graduationDate || '',
    })),
    skills: [
      ...(parsed.skills?.technical || []),
      ...(parsed.skills?.soft || []),
      ...(parsed.skills?.languages || []),
    ],
  };
}

