import { createElement, type ReactNode } from 'react';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Globe,
  Heart,
  Trophy,
  Quote,
  Coffee,
  BookOpen,
  Lightbulb,
  Mic,
  Users,
  BadgeCheck,
  Brain,
  Bike,
  PenTool,
  Folder,
} from 'lucide-react';
import type {
  PersonalInfo,
  ResumeData,
  ResumeSection,
  SectionItem,
  SmartStudioFormatting,
} from '../types/resume';
import { parseDateRange } from './dateFormatHelpers';
import { generateSectionItemId, parseEducationItem, parseExperienceItem } from './sectionItemHelpers';

/** Legacy row shape used by Smart Resume Studio list UIs (maps to/from SectionItem). */
export type StudioLegacyListItem = Record<string, unknown> & { id?: string | number };

export interface SmartResumeStudioSectionChrome {
  visible: boolean;
  label: string;
  icon: ReactNode;
}

export interface SmartResumeStudioViewData {
  personalInfo: PersonalInfo & { avatar: string };
  summary: string;
  hobbies: string;
  skills: string[];
  sections: Record<string, SmartResumeStudioSectionChrome>;
  experience: StudioLegacyListItem[];
  education: StudioLegacyListItem[];
  projects: StudioLegacyListItem[];
  certifications: StudioLegacyListItem[];
  languages: StudioLegacyListItem[];
  volunteer: StudioLegacyListItem[];
  awards: StudioLegacyListItem[];
  references: StudioLegacyListItem[];
  publications: StudioLegacyListItem[];
  patents: StudioLegacyListItem[];
  speaking: StudioLegacyListItem[];
  memberships: StudioLegacyListItem[];
  licenses: StudioLegacyListItem[];
  training: StudioLegacyListItem[];
  extracurricular: StudioLegacyListItem[];
  custom: StudioLegacyListItem[];
}

export const DEFAULT_SMART_STUDIO_FORMATTING: SmartStudioFormatting = {
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
};

const STUDIO_CHROME_ONLY = new Set(['heading', 'summary', 'hobbies']);

const STUDIO_ICON_MAP: Record<string, ReactNode> = {
  heading: createElement(User, { size: 16 }),
  summary: createElement(FileText, { size: 16 }),
  experience: createElement(Briefcase, { size: 16 }),
  education: createElement(GraduationCap, { size: 16 }),
  skills: createElement(Code2, { size: 16 }),
  projects: createElement(Folder, { size: 16 }),
  certifications: createElement(Award, { size: 16 }),
  languages: createElement(Globe, { size: 16 }),
  volunteer: createElement(Heart, { size: 16 }),
  awards: createElement(Trophy, { size: 16 }),
  references: createElement(Quote, { size: 16 }),
  hobbies: createElement(Coffee, { size: 16 }),
  publications: createElement(BookOpen, { size: 16 }),
  patents: createElement(Lightbulb, { size: 16 }),
  speaking: createElement(Mic, { size: 16 }),
  memberships: createElement(Users, { size: 16 }),
  licenses: createElement(BadgeCheck, { size: 16 }),
  training: createElement(Brain, { size: 16 }),
  extracurricular: createElement(Bike, { size: 16 }),
  custom: createElement(PenTool, { size: 16 }),
};

export const STUDIO_LIST_SECTION_KEYS = [
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'volunteer',
  'awards',
  'references',
  'publications',
  'patents',
  'speaking',
  'memberships',
  'licenses',
  'training',
  'extracurricular',
  'custom',
] as const;

export type StudioListSectionKey = (typeof STUDIO_LIST_SECTION_KEYS)[number];

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function yearToken(d: string): string {
  if (!d || !d.trim()) return '';
  const m = d.match(/^(\d{4})/);
  return m ? m[1] : d.trim();
}

function sectionItemToLegacy(sectionKey: string, item: SectionItem): Record<string, unknown> {
  const base = { id: item.id };
  switch (sectionKey) {
    case 'experience': {
      const p = parseExperienceItem(item);
      return {
        ...base,
        role: p.jobTitle,
        company: p.companyName,
        location: p.location,
        period: item.date || '',
        description: p.description
          ? p.description.split('\n').map((l) => l.trim()).filter(Boolean)
          : [''],
      };
    }
    case 'education': {
      const p = parseEducationItem(item);
      const { startDate, endDate } = parseDateRange(p.date);
      return {
        ...base,
        degree: p.degree,
        location: p.institution,
        startYear: yearToken(startDate),
        endYear: endDate ? yearToken(endDate) : '',
      };
    }
    case 'skills':
      return { ...base, title: item.title };
    case 'projects':
      return {
        ...base,
        title: item.title,
        link: item.subtitle,
        description: item.description
          ? item.description.split('\n').map((l) => l.trim()).filter(Boolean)
          : [],
      };
    case 'languages':
      return {
        ...base,
        language: item.title,
        proficiency: item.subtitle || 'Basic',
      };
    case 'volunteer':
      return {
        ...base,
        role: item.title,
        organization: item.subtitle,
        period: item.date,
        description: item.description
          ? item.description.split('\n').map((l) => l.trim()).filter(Boolean)
          : [],
      };
    case 'certifications':
      return { ...base, name: item.title, issuer: item.subtitle, date: item.date };
    case 'references':
      return {
        ...base,
        name: item.title,
        role: item.subtitle,
        company: item.date,
        contact: item.description,
      };
    case 'awards':
      return { ...base, title: item.title, issuer: item.subtitle, date: item.date };
    case 'publications':
      return { ...base, title: item.title, publisher: item.subtitle, date: item.date };
    case 'patents':
      return { ...base, title: item.title, number: item.subtitle, date: item.date };
    case 'speaking':
      return { ...base, event: item.title, topic: item.subtitle, date: item.date };
    case 'memberships':
      return { ...base, organization: item.title, role: item.subtitle, date: item.date };
    case 'licenses':
      return { ...base, name: item.title, issuer: item.subtitle, date: item.date };
    case 'training':
      return { ...base, name: item.title, institution: item.subtitle, date: item.date };
    case 'extracurricular':
      return { ...base, role: item.title, organization: item.subtitle, date: item.date };
    case 'custom':
      return {
        ...base,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        description: item.description
          ? item.description.split('\n').map((l) => l.trim()).filter(Boolean)
          : [],
      };
    default:
      return {
        ...base,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        description: item.description,
      };
  }
}

export function legacyPatchToSectionItemData(
  sectionKey: string,
  field: string,
  value: string,
): Partial<SectionItem> {
  switch (sectionKey) {
    case 'experience':
      if (field === 'role') return { title: value };
      if (field === 'company') return { subtitle: value };
      if (field === 'location') return { location: value };
      if (field === 'period') return { date: value };
      break;
    case 'education':
      if (field === 'degree') return { subtitle: value };
      if (field === 'location') return { title: value };
      if (field === 'startYear' || field === 'endYear') {
        return {};
      }
      break;
    case 'references':
      if (field === 'name') return { title: value };
      if (field === 'role') return { subtitle: value };
      if (field === 'company') return { date: value };
      if (field === 'contact') return { description: value };
      break;
    case 'languages':
      if (field === 'language') return { title: value };
      if (field === 'proficiency') return { subtitle: value };
      break;
    case 'certifications':
      if (field === 'name') return { title: value };
      if (field === 'issuer') return { subtitle: value };
      if (field === 'date') return { date: value };
      break;
    case 'awards':
    case 'publications':
      if (field === 'title') return { title: value };
      if (field === 'issuer' || field === 'publisher') return { subtitle: value };
      if (field === 'date') return { date: value };
      break;
    case 'patents':
      if (field === 'title') return { title: value };
      if (field === 'number') return { subtitle: value };
      if (field === 'date') return { date: value };
      break;
    case 'speaking':
      if (field === 'event') return { title: value };
      if (field === 'topic') return { subtitle: value };
      if (field === 'date') return { date: value };
      break;
    case 'memberships':
    case 'extracurricular':
      if (field === 'organization') return { title: value };
      if (field === 'role') return { subtitle: value };
      if (field === 'date') return { date: value };
      break;
    case 'licenses':
    case 'training':
      if (field === 'name') return { title: value };
      if (field === 'issuer' || field === 'institution') return { subtitle: value };
      if (field === 'date') return { date: value };
      break;
    case 'volunteer':
      if (field === 'role') return { title: value };
      if (field === 'organization') return { subtitle: value };
      if (field === 'period') return { date: value };
      break;
    case 'projects':
      if (field === 'title') return { title: value };
      if (field === 'link') return { subtitle: value };
      break;
    case 'custom':
      if (field === 'title') return { title: value };
      if (field === 'subtitle') return { subtitle: value };
      if (field === 'date') return { date: value };
      break;
    default:
      break;
  }

  const stringFields: Record<string, keyof SectionItem> = {
    title: 'title',
    subtitle: 'subtitle',
    name: 'title',
    role: 'title',
    company: 'subtitle',
    issuer: 'subtitle',
    institution: 'subtitle',
    organization: 'subtitle',
    language: 'title',
    event: 'title',
    proficiency: 'subtitle',
    publisher: 'subtitle',
    topic: 'subtitle',
    number: 'subtitle',
    link: 'subtitle',
    date: 'date',
    period: 'date',
  };
  const key = stringFields[field];
  if (key) return { [key]: value } as Partial<SectionItem>;
  return {};
}

/** Merge education start/end year fields into SectionItem.date */
export function educationYearsToDate(
  item: SectionItem,
  field: 'startYear' | 'endYear',
  value: string,
): string {
  const legacy = sectionItemToLegacy('education', item) as {
    startYear?: string;
    endYear?: string;
  };
  const start = field === 'startYear' ? value : legacy.startYear || '';
  const end = field === 'endYear' ? value : legacy.endYear || '';
  if (!start && !end) return '';
  return `${start} - ${end}`.replace(/\s*-\s*$/,'').replace(/^\s*-\s*/, '');
}

export function newLegacyItemToSectionItem(sectionKey: string, raw: Record<string, unknown>): SectionItem {
  const id = String(raw.id ?? generateSectionItemId(sectionKey));
  switch (sectionKey) {
    case 'experience':
      return {
        id,
        title: String(raw.role ?? ''),
        subtitle: String(raw.company ?? ''),
        date: String(raw.period ?? ''),
        description: Array.isArray(raw.description)
          ? (raw.description as string[]).join('\n')
          : String(raw.description ?? ''),
        location: String(raw.location ?? ''),
      };
    case 'education':
      return {
        id,
        title: String(raw.location ?? ''),
        subtitle: String(raw.degree ?? ''),
        date: `${String(raw.startYear ?? '')} - ${String(raw.endYear ?? '')}`.replace(/^ - | - $/g, '').trim(),
        description: '',
      };
    case 'languages':
      return {
        id,
        title: String(raw.language ?? ''),
        subtitle: String(raw.proficiency ?? ''),
        date: '',
        description: '',
      };
    case 'references':
      return {
        id,
        title: String(raw.name ?? ''),
        subtitle: String(raw.role ?? ''),
        date: String(raw.company ?? ''),
        description: String(raw.contact ?? ''),
      };
    case 'certifications':
    case 'licenses':
      return {
        id,
        title: String(raw.name ?? ''),
        subtitle: String(raw.issuer ?? ''),
        date: String(raw.date ?? ''),
        description: '',
      };
    case 'awards':
    case 'publications':
      return {
        id,
        title: String(raw.title ?? ''),
        subtitle: String(raw.issuer ?? raw.publisher ?? ''),
        date: String(raw.date ?? ''),
        description: '',
      };
    case 'patents':
      return {
        id,
        title: String(raw.title ?? ''),
        subtitle: String(raw.number ?? ''),
        date: String(raw.date ?? ''),
        description: '',
      };
    case 'speaking':
      return {
        id,
        title: String(raw.event ?? ''),
        subtitle: String(raw.topic ?? ''),
        date: String(raw.date ?? ''),
        description: '',
      };
    case 'memberships':
    case 'extracurricular':
      return {
        id,
        title: String(raw.organization ?? ''),
        subtitle: String(raw.role ?? ''),
        date: String(raw.date ?? ''),
        description: '',
      };
    case 'training':
      return {
        id,
        title: String(raw.name ?? ''),
        subtitle: String(raw.institution ?? ''),
        date: String(raw.date ?? ''),
        description: '',
      };
    case 'volunteer':
      return {
        id,
        title: String(raw.role ?? ''),
        subtitle: String(raw.organization ?? ''),
        date: String(raw.period ?? ''),
        description: Array.isArray(raw.description)
          ? (raw.description as string[]).join('\n')
          : '',
      };
    case 'projects':
      return {
        id,
        title: String(raw.title ?? ''),
        subtitle: String(raw.link ?? ''),
        description: Array.isArray(raw.description)
          ? (raw.description as string[]).join('\n')
          : '',
      };
    case 'custom':
      return {
        id,
        title: String(raw.title ?? ''),
        subtitle: String(raw.subtitle ?? ''),
        date: String(raw.date ?? ''),
        description: Array.isArray(raw.description)
          ? (raw.description as string[]).join('\n')
          : '',
      };
    case 'skills':
      return {
        id,
        title: String(raw.title ?? 'Skill'),
        subtitle: '',
        date: '',
        description: '',
      };
    default:
      return {
        id,
        title: String(raw.title ?? 'New Item'),
        subtitle: String(raw.subtitle ?? ''),
        date: String(raw.date ?? ''),
        description: Array.isArray(raw.description)
          ? (raw.description as string[]).join('\n')
          : String(raw.description ?? ''),
      };
  }
}

export function studioKeyToResumeSectionType(sectionKey: string): ResumeSection['type'] {
  const map: Record<string, ResumeSection['type']> = {
    experience: 'experience',
    education: 'education',
    skills: 'skills',
    projects: 'projects',
    certifications: 'certifications',
    languages: 'languages',
    volunteer: 'volunteer',
    custom: 'custom',
  };
  return map[sectionKey] ?? 'custom';
}

export function mergeSmartStudioFormatting(
  settings: ResumeData['settings'],
): SmartStudioFormatting {
  return {
    ...DEFAULT_SMART_STUDIO_FORMATTING,
    ...(settings.studioFormatting ?? {}),
  };
}

export function buildSmartResumeStudioView(state: ResumeData): SmartResumeStudioViewData {
  const meta = {
    ...(state.settings.smartStudioSectionMeta ?? {}),
  };

  const sections: Record<string, SmartResumeStudioSectionChrome> = {};

  const allKeys = Object.keys(STUDIO_ICON_MAP);
  for (const key of allKeys) {
    const m = meta[key];
    const row = state.sections.find((s) => s.id === key);
    const visible = STUDIO_CHROME_ONLY.has(key)
      ? (m?.visible ?? true)
      : (row?.isVisible ?? m?.visible ?? false);
    const label = row?.title ?? m?.label ?? key;
    sections[key] = {
      visible,
      label,
      icon: STUDIO_ICON_MAP[key] ?? STUDIO_ICON_MAP.custom,
    };
  }

  const personal = state.personalInfo;
  const personalInfo = {
    ...personal,
    avatar: initialsFromName(personal.fullName || ''),
  };

  const skillsSection = state.sections.find((s) => s.id === 'skills');
  const skills = (skillsSection?.items ?? []).map((i) => i.title).filter(Boolean);

  const out: SmartResumeStudioViewData = {
    personalInfo,
    summary: personal.summary ?? '',
    hobbies: personal.hobbies ?? '',
    skills,
    sections,
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    volunteer: [],
    awards: [],
    references: [],
    publications: [],
    patents: [],
    speaking: [],
    memberships: [],
    licenses: [],
    training: [],
    extracurricular: [],
    custom: [],
  };

  for (const key of STUDIO_LIST_SECTION_KEYS) {
    if (key === 'skills') continue;
    const row = state.sections.find((s) => s.id === key);
    const legacy = (row?.items ?? []).map((item) => sectionItemToLegacy(key, item) as StudioLegacyListItem);
    (out as Record<string, StudioLegacyListItem[]>)[key] = legacy;
  }

  return out;
}

export function isStudioChromeOnlySection(sectionKey: string): boolean {
  return STUDIO_CHROME_ONLY.has(sectionKey);
}

export function ensureStudioResumeSection(
  dispatch: (a: { type: 'ADD_SECTION'; payload: ResumeSection }) => void,
  state: ResumeData,
  sectionKey: string,
): void {
  if (state.sections.some((s) => s.id === sectionKey)) return;
  const meta = state.settings.smartStudioSectionMeta?.[sectionKey];
  const title =
    meta?.label ?? sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
  const isVisible = meta?.visible ?? true;
  dispatch({
    type: 'ADD_SECTION',
    payload: {
      id: sectionKey,
      type: studioKeyToResumeSectionType(sectionKey),
      title,
      isVisible,
      items: [],
    },
  });
}
