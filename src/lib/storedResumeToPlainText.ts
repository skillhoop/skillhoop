import { resumeDataToText } from './atsScanner';
import type { ResumeData } from '../types/resume';

export function looksLikeResumeStudioData(data: unknown): data is ResumeData {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return Array.isArray(o.sections) && typeof o.personalInfo === 'object' && o.personalInfo !== null;
}

/**
 * Convert stored resume JSON (Supabase row, parse-resume API, or Resume Studio) to plain text for AI prompts.
 */
export function storedResumeToPlainText(resumeData: unknown): string {
  if (typeof resumeData === 'string') {
    return resumeData;
  }
  if (!resumeData) return '';

  if (looksLikeResumeStudioData(resumeData)) {
    try {
      return resumeDataToText(resumeData);
    } catch {
      /* fall through */
    }
  }

  let content = '';
  const data = resumeData as Record<string, unknown>;

  const personalInfo = data.personalInfo as Record<string, unknown> | undefined;
  if (personalInfo) {
    content += `Name: ${(personalInfo.fullName || personalInfo.name || '') as string}\n`;
    content += `Job Title: ${(personalInfo.jobTitle || '') as string}\n`;
    content += `Email: ${(personalInfo.email || '') as string}\n`;
    content += `Phone: ${(personalInfo.phone || '') as string}\n`;
    content += `Location: ${(personalInfo.location || '') as string}\n\n`;
  }

  if (data.summary || (personalInfo && 'summary' in personalInfo && personalInfo.summary)) {
    content += `Summary: ${(data.summary as string) || (personalInfo && 'summary' in personalInfo ? String(personalInfo.summary) : '') || ''}\n\n`;
  }

  if (data.experience || data.sections) {
    content += 'Work Experience:\n';
    const experiences =
      (data.experience as Array<Record<string, unknown>>) ||
      (((data.sections as Array<Record<string, unknown>>)?.find(
        (s: Record<string, unknown>) => s.type === 'experience',
      ) as Record<string, unknown>)?.items as Array<Record<string, unknown>>) ||
      [];
    experiences.forEach((exp: Record<string, unknown>) => {
      content += `- ${exp.jobTitle || exp.title || exp.position || ''} at ${exp.company || exp.subtitle || ''}\n`;
      if (exp.description) content += `  ${exp.description}\n`;
      if (exp.startDate && exp.endDate) {
        content += `  ${exp.startDate} - ${exp.endDate}\n`;
      }
    });
    content += '\n';
  }

  if (data.skills) {
    content += 'Skills: ';
    if (Array.isArray(data.skills)) {
      content += (data.skills as string[]).join(', ');
    } else if (typeof data.skills === 'object' && data.skills !== null) {
      const skillsObj = data.skills as Record<string, unknown>;
      if (Array.isArray(skillsObj.technical)) {
        content += (skillsObj.technical as string[]).join(', ');
        if (Array.isArray(skillsObj.soft)) {
          content += ', ' + (skillsObj.soft as string[]).join(', ');
        }
      }
    }
    content += '\n\n';
  } else if (data.sections) {
    const skillsSection = (data.sections as Array<Record<string, unknown>>)?.find(
      (s: Record<string, unknown>) => s.type === 'skills',
    ) as Record<string, unknown> | undefined;
    if (skillsSection?.items && Array.isArray(skillsSection.items)) {
      content += 'Skills: ';
      content += (skillsSection.items as Array<Record<string, unknown>>)
        .map((item: Record<string, unknown>) => (item.title || item.name) as string)
        .join(', ');
      content += '\n\n';
    }
  }

  if (data.education || data.sections) {
    content += 'Education:\n';
    const education =
      (data.education as Array<Record<string, unknown>>) ||
      (((data.sections as Array<Record<string, unknown>>)?.find(
        (s: Record<string, unknown>) => s.type === 'education',
      ) as Record<string, unknown>)?.items as Array<Record<string, unknown>>) ||
      [];
    education.forEach((edu: Record<string, unknown>) => {
      content += `- ${edu.degree || edu.title || ''} from ${edu.institution || edu.school || edu.subtitle || ''}\n`;
      if (edu.field) content += `  ${edu.field}\n`;
      if (edu.graduationDate || edu.endDate) {
        content += `  ${edu.graduationDate || edu.endDate}\n`;
      }
    });
  }

  return content;
}
