/**
 * Resume Import Converter
 * Converts parsed resume data (from PDF/LinkedIn) to ResumeEditorPage format
 */

import { ResumeData as ParsedResumeData } from './resumeParser';
import { ResumeData as EditorResumeData } from '../components/resume/ResumeControlPanel';

/**
 * Convert parsed resume data to ResumeEditorPage format
 */
export function convertParsedToEditorFormat(parsed: ParsedResumeData): EditorResumeData {
  return {
    personalInfo: {
      fullName: parsed.personalInfo.name || '',
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
        ...(exp.achievements || []).map(ach => `• ${ach}`),
      ].filter(Boolean).join('\n'),
    })),
    education: parsed.education.map((edu, index) => ({
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

