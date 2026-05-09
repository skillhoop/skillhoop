export interface SectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  /** Work location for experience rows (Smart Resume Studio / importers). */
  location?: string;
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
  hobbies?: string;
}

/** Dashboard Smart Resume Studio visual options (persisted with resume settings). */
export interface SmartStudioFormatting {
  themeColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  pageMargins: 'narrow' | 'normal' | 'wide';
  sidebarStyle: 'dark' | 'light' | 'colored';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  uppercaseHeaders: boolean;
  bulletStyle: 'disc' | 'circle' | 'square';
  boldTitles: boolean;
  italicDetails: boolean;
  underlineHeaders: boolean;
}

export interface FormattingSettings {
  fontFamily: string;
  fontSize: number;
  accentColor: string;
  lineHeight: number;
  /** Optional user-selected theme color (preferred over accentColor for templates). */
  themeColor?: string;
  /** Optional generic color key from older settings; treated like themeColor. */
  color?: string;
  layout?: 'classic' | 'modern' | 'columns';
  templateId?: string;
  /** Section chrome for Smart Resume Studio (heading/summary visibility, labels). */
  smartStudioSectionMeta?: Record<string, { visible: boolean; label: string }>;
  /** Smart Resume Studio sidebar/formatting panel (separate from PDF numeric settings). */
  studioFormatting?: Partial<SmartStudioFormatting>;
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
  settings: {
    fontFamily: 'Inter',
    fontSize: 11,
    accentColor: '#3B82F6',
    lineHeight: 1.5,
    layout: 'classic',
    templateId: 'classic',
    studioFormatting: {
      themeColor: 'slate',
      fontFamily: 'sans',
      fontSize: 'medium',
      layoutDensity: 'comfortable',
      pageMargins: 'normal',
      sidebarStyle: 'dark',
      textAlign: 'left',
      lineHeight: 'relaxed',
      uppercaseHeaders: true,
      bulletStyle: 'disc',
      boldTitles: true,
      italicDetails: false,
      underlineHeaders: false,
    },
    smartStudioSectionMeta: {
      heading: { visible: true, label: 'Heading' },
      summary: { visible: true, label: 'Profile' },
      experience: { visible: true, label: 'Experience' },
      education: { visible: true, label: 'Education' },
      skills: { visible: true, label: 'Skills' },
      projects: { visible: true, label: 'Projects' },
      certifications: { visible: false, label: 'Certifications' },
      languages: { visible: false, label: 'Languages' },
      volunteer: { visible: false, label: 'Volunteering' },
      awards: { visible: false, label: 'Awards' },
      references: { visible: false, label: 'References' },
      hobbies: { visible: false, label: 'Hobbies' },
      publications: { visible: false, label: 'Publications' },
      patents: { visible: false, label: 'Patents' },
      speaking: { visible: false, label: 'Speaking' },
      memberships: { visible: false, label: 'Memberships' },
      licenses: { visible: false, label: 'Licenses' },
      training: { visible: false, label: 'Training' },
      extracurricular: { visible: false, label: 'Extracurricular' },
      custom: { visible: false, label: 'Custom Section' },
    },
  },
  atsScore: 0,
  updatedAt: new Date().toISOString(),
  isAISidebarOpen: false,
  targetJob: { title: '', description: '', industry: '' },
  targetJobId: null,
  focusedSectionId: null,
};

