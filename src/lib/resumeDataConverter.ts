/**
 * Resume Data Converter
 * Converts between ResumeEditorPage format and ResumeContext format
 */

import { ResumeData as EditorResumeData } from '../components/resume/ResumeControlPanel';
import { ResumeData as ContextResumeData } from '../types/resume';

/**
 * Convert ResumeEditorPage format to ResumeContext format
 */
export function convertEditorToContext(
  editorData: EditorResumeData,
  templateId: number | string | null,
  formatting: any,
  sections: any[]
): ContextResumeData {
  // Convert experience
  const experienceSection = {
    id: 'experience',
    type: 'experience' as const,
    title: 'Experience',
    isVisible: sections.find(s => s.id === 'experience')?.isVisible ?? true,
    items: editorData.experience.map(exp => ({
      id: exp.id,
      title: exp.jobTitle || '',
      subtitle: exp.company || '',
      date: exp.startDate && exp.endDate 
        ? `${exp.startDate} - ${exp.endDate}` 
        : exp.startDate || '',
      description: exp.description || '',
    })),
  };

  // Convert education
  const educationSection = {
    id: 'education',
    type: 'education' as const,
    title: 'Education',
    isVisible: sections.find(s => s.id === 'education')?.isVisible ?? true,
    items: editorData.education.map(edu => ({
      id: edu.id,
      title: edu.degree || '',
      subtitle: edu.school || '',
      date: edu.startDate && edu.endDate 
        ? `${edu.startDate} - ${edu.endDate}` 
        : edu.startDate || '',
      description: edu.location || '',
    })),
  };

  // Convert skills
  const skillsSection = {
    id: 'skills',
    type: 'skills' as const,
    title: 'Skills',
    isVisible: sections.find(s => s.id === 'skills')?.isVisible ?? true,
    items: editorData.skills.map((skill, idx) => ({
      id: `skill_${idx}`,
      title: skill,
      subtitle: '',
      date: '',
      description: '',
    })),
  };

  // Convert certifications
  const certificationsSection = {
    id: 'certifications',
    type: 'custom' as const,
    title: 'Certifications',
    isVisible: sections.find(s => s.id === 'certifications')?.isVisible ?? false,
    items: (editorData.certifications || []).map(cert => ({
      id: cert.id,
      title: cert.name || '',
      subtitle: cert.issuer || '',
      date: cert.date || '',
      description: [cert.credentialId, cert.expiryDate].filter(Boolean).join(' • '),
    })),
  };

  // Convert projects
  const projectsSection = {
    id: 'projects',
    type: 'custom' as const,
    title: 'Projects',
    isVisible: sections.find(s => s.id === 'projects')?.isVisible ?? false,
    items: (editorData.projects || []).map(proj => ({
      id: proj.id,
      title: proj.name || '',
      subtitle: proj.technologies?.join(', ') || '',
      date: proj.startDate && proj.endDate ? `${proj.startDate} - ${proj.endDate}` : proj.startDate || '',
      description: proj.description || '',
    })),
  };

  // Convert languages
  const languagesSection = {
    id: 'languages',
    type: 'custom' as const,
    title: 'Languages',
    isVisible: sections.find(s => s.id === 'languages')?.isVisible ?? false,
    items: (editorData.languages || []).map(lang => ({
      id: lang.id,
      title: lang.language || '',
      subtitle: '',
      date: '',
      description: lang.proficiency || '',
    })),
  };

  // Get template string
  const templateString = templateId === 2 ? 'modern' : templateId === 1 ? 'classic' : 'classic';

  // Build sections array (only include visible sections)
  const allSections = [
    experienceSection,
    educationSection,
    skillsSection,
    certificationsSection,
    projectsSection,
    languagesSection,
  ].filter(s => s.isVisible);

  return {
    id: '',
    title: 'Untitled Resume',
    personalInfo: {
      fullName: editorData.personalInfo.fullName || '',
      email: editorData.personalInfo.email || '',
      phone: editorData.personalInfo.phone || '',
      linkedin: '',
      website: '',
      summary: editorData.summary || '',
      location: editorData.personalInfo.location || '',
      jobTitle: editorData.personalInfo.jobTitle || '',
      profilePicture: editorData.profilePicture,
    },
    sections: allSections,
    settings: {
      fontFamily: formatting.font || 'Inter',
      fontSize: 11,
      accentColor: formatting.accentColor || '#3B82F6',
      lineHeight: formatting.lineSpacing || 1.5,
      layout: templateString === 'modern' ? 'modern' : 'classic',
      templateId: templateString,
    },
    atsScore: 0,
    updatedAt: new Date().toISOString(),
    isAISidebarOpen: false,
    targetJob: { title: '', description: '', industry: '' },
    focusedSectionId: null,
  };
}

/**
 * Convert ResumeContext format to ResumeEditorPage format
 */
export function convertContextToEditor(contextData: ContextResumeData): EditorResumeData {
  const experienceSection = contextData.sections.find(s => s.type === 'experience');
  const educationSection = contextData.sections.find(s => s.type === 'education');
  const skillsSection = contextData.sections.find(s => s.type === 'skills');

  return {
    personalInfo: {
      fullName: contextData.personalInfo.fullName || '',
      jobTitle: contextData.personalInfo.jobTitle || '',
      email: contextData.personalInfo.email || '',
      phone: contextData.personalInfo.phone || '',
      location: contextData.personalInfo.location || '',
    },
    summary: contextData.personalInfo.summary || '',
    experience: experienceSection?.items.map(item => ({
      id: item.id,
      jobTitle: item.title || '',
      company: item.subtitle || '',
      location: '',
      startDate: item.date.split(' - ')[0] || '',
      endDate: item.date.split(' - ')[1] || '',
      description: item.description || '',
    })) || [],
    education: educationSection?.items.map(item => ({
      id: item.id,
      school: item.subtitle || '',
      degree: item.title || '',
      location: item.description || '',
      startDate: item.date.split(' - ')[0] || '',
      endDate: item.date.split(' - ')[1] || '',
    })) || [],
    skills: skillsSection?.items.map(item => item.title).filter(Boolean) || [],
    profilePicture: contextData.personalInfo.profilePicture,
  };
}

