export interface SectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface ResumeSection {
  id: string;
  title: string;
  type: 'personal' | 'experience' | 'education' | 'skills' | 'custom';
  isVisible: boolean;
  items: SectionItem[];
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  website?: string;
  summary: string;
  location?: string;
  jobTitle?: string;
}

export interface FormattingSettings {
  fontFamily: string;
  fontSize: number;
  accentColor: string;
  lineHeight: number;
  layout: 'classic' | 'modern' | 'columns';
}

export interface ResumeData {
  id: string;
  title: string;
  personalInfo: PersonalInfo;
  sections: ResumeSection[];
  settings: FormattingSettings;
  atsScore: number;
  updatedAt: string;
}

export const INITIAL_RESUME_STATE: ResumeData = {
  id: '',
  title: 'Untitled Resume',
  personalInfo: { fullName: '', email: '', phone: '', summary: '', jobTitle: '' },
  sections: [
    {
      id: 'experience',
      type: 'experience',
      title: 'Experience',
      isVisible: true,
      items: [],
    },
    {
      id: 'education',
      type: 'education',
      title: 'Education',
      isVisible: true,
      items: [],
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      isVisible: true,
      items: [],
    },
  ],
  settings: { fontFamily: 'Inter', fontSize: 11, accentColor: '#3B82F6', lineHeight: 1.5, layout: 'classic' },
  atsScore: 0,
  updatedAt: new Date().toISOString(),
};

