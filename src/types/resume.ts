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
  type: 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'volunteer' | 'custom';
  isVisible: boolean;
  items: SectionItem[];
}

export interface Project {
  id: string;
  title: string;
  role?: string;
  company?: string;
  startDate: string;
  endDate: string;
  description: string;
  url?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Intermediate' | 'Basic' | 'Conversational' | 'Professional';
}

export interface Volunteer {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
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
  profilePicture?: string;
}

export interface FormattingSettings {
  fontFamily: string;
  fontSize: number;
  accentColor: string;
  lineHeight: number;
  layout?: 'classic' | 'modern' | 'columns';
  templateId?: string;
}

export interface TargetJob {
  title: string;
  description: string;
  industry: string;
}

export interface ResumeData {
  id: string;
  title: string;
  personalInfo: PersonalInfo;
  sections: ResumeSection[];
  settings: FormattingSettings;
  atsScore: number;
  updatedAt: string;
  isAISidebarOpen: boolean;
  targetJob: TargetJob;
  targetJobId?: string | null; // Reference to job_applications.id
  focusedSectionId: string | null;
  // Advanced sections
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  volunteer?: Volunteer[];
  customSections?: CustomSection[];
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
  settings: { fontFamily: 'Inter', fontSize: 11, accentColor: '#3B82F6', lineHeight: 1.5, layout: 'classic', templateId: 'classic' },
  atsScore: 0,
  updatedAt: new Date().toISOString(),
  isAISidebarOpen: false,
  targetJob: { title: '', description: '', industry: '' },
  targetJobId: null,
  focusedSectionId: null,
};

