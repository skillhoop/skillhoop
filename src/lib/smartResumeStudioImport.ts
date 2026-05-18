/**
 * Smart Resume Studio — file import parsing and merge helpers.
 */

import type { Certification, ResumeData, ResumeSection, SectionItem } from '../types/resume';
import { INITIAL_RESUME_STATE } from '../types/resume';
import { getParseResumeUrl } from './aiApiUrl';
import { fileToBase64, resolveAuthForParseResume } from './parseResumeClient';
import { looksLikeResumeStudioData, storedResumeToPlainText } from './storedResumeToPlainText';
import { migrateResumeData } from './resumeMigrations';
import { validateImportedResume } from './importValidation';
import { parseResumeFromText } from './resumeParser';
import { generateSectionItemId, normalizeSectionItem } from './sectionItemHelpers';

const MERGE_SECTION_TYPES = ['experience', 'education', 'skills', 'certifications'] as const;
type MergeSectionType = (typeof MERGE_SECTION_TYPES)[number];

function isMergeSectionType(type: string): type is MergeSectionType {
  return (MERGE_SECTION_TYPES as readonly string[]).includes(type);
}

function reassignSectionItemIds(items: SectionItem[], prefix: string): SectionItem[] {
  return items.map((item) =>
    normalizeSectionItem({ ...item, id: generateSectionItemId(prefix) }),
  );
}

function reassignCertificationIds(certs: Certification[]): Certification[] {
  return certs.map((cert) => ({
    ...cert,
    id: generateSectionItemId('cert'),
  }));
}

/**
 * Normalize arbitrary parsed JSON into a full ResumeData shape.
 */
export function normalizeImportedResumePayload(raw: unknown): ResumeData {
  if (looksLikeResumeStudioData(raw)) {
    return migrateResumeData(raw);
  }

  const validation = validateImportedResume(raw);
  if (!validation.isValid) {
    throw new Error('INVALID_IMPORT');
  }

  const base =
    raw && typeof raw === 'object'
      ? { ...INITIAL_RESUME_STATE, ...(raw as Record<string, unknown>) }
      : INITIAL_RESUME_STATE;

  return migrateResumeData({
    ...base,
    ...validation.validatedData,
  });
}

async function parsePdfResumeFile(file: File): Promise<ResumeData> {
  const { userId, accessToken } = await resolveAuthForParseResume();
  const base64 = await fileToBase64(file);
  const response = await fetch(getParseResumeUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      fileData: base64,
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      userId,
      feature_name: 'smart_resume_studio',
    }),
  });

  const data = (await response.json()) as { error?: string; content?: string };
  if (!response.ok) {
    throw new Error(data.error || 'Failed to parse resume PDF');
  }

  const rawContent = data?.content;
  if (!rawContent) {
    throw new Error('No parse result from resume service');
  }

  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as unknown;
      if (
        looksLikeResumeStudioData(parsed) ||
        (parsed &&
          typeof parsed === 'object' &&
          ('experience' in (parsed as object) ||
            'education' in (parsed as object) ||
            'sections' in (parsed as object)))
      ) {
        return normalizeImportedResumePayload(parsed);
      }
    } catch {
      /* fall through to text parsing */
    }
  }

  let parsedUnknown: unknown = rawContent;
  if (jsonMatch) {
    try {
      parsedUnknown = JSON.parse(jsonMatch[0]);
    } catch {
      parsedUnknown = rawContent;
    }
  }

  const text = storedResumeToPlainText(parsedUnknown).trim() || rawContent.trim();
  if (!text) {
    throw new Error('Could not extract text from PDF');
  }

  const partial = await parseResumeFromText(text);
  return migrateResumeData({
    ...INITIAL_RESUME_STATE,
    ...partial,
  });
}

async function parseJsonResumeFile(file: File): Promise<ResumeData> {
  const text = await file.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('JSON_PARSE');
  }
  return normalizeImportedResumePayload(raw);
}

/**
 * Parse an uploaded .pdf or .json resume file into ResumeData.
 */
export async function parseResumeImportFile(file: File): Promise<ResumeData> {
  const lowerName = file.name.toLowerCase();
  const isJson =
    file.type === 'application/json' ||
    lowerName.endsWith('.json');
  const isPdf =
    file.type.includes('pdf') ||
    lowerName.endsWith('.pdf');

  if (!isJson && !isPdf) {
    throw new Error('UNSUPPORTED_TYPE');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('FILE_TOO_LARGE');
  }

  if (isJson) {
    return parseJsonResumeFile(file);
  }

  return parsePdfResumeFile(file);
}

function mergeSectionItems(
  current: ResumeSection[],
  imported: ResumeSection[],
): ResumeSection[] {
  const byType = new Map(imported.map((s) => [s.type, s]));

  const merged = current.map((section) => {
    if (!isMergeSectionType(section.type)) {
      return section;
    }
    const importedSection = byType.get(section.type);
    if (!importedSection?.items?.length) {
      return section;
    }
    const prefix = section.type === 'certifications' ? 'cert' : section.type.slice(0, 3);
    const appended = reassignSectionItemIds(importedSection.items, prefix);
    return {
      ...section,
      items: [...section.items, ...appended],
      isVisible: section.isVisible || appended.length > 0,
    };
  });

  for (const importedSection of imported) {
    if (!isMergeSectionType(importedSection.type)) continue;
    if (merged.some((s) => s.type === importedSection.type)) continue;
    if (!importedSection.items?.length) continue;
    const prefix =
      importedSection.type === 'certifications' ? 'cert' : importedSection.type.slice(0, 3);
    merged.push({
      ...importedSection,
      items: reassignSectionItemIds(importedSection.items, prefix),
      isVisible: true,
    });
  }

  return merged;
}

/**
 * Append imported experience, education, skills, and certifications with fresh IDs.
 */
export function mergeImportedResume(current: ResumeData, imported: ResumeData): ResumeData {
  const mergedSections = mergeSectionItems(current.sections, imported.sections);

  const mergedCertifications = [
    ...(current.certifications ?? []),
    ...reassignCertificationIds(imported.certifications ?? []),
  ];

  return {
    ...current,
    title: current.title || imported.title,
    personalInfo: {
      ...current.personalInfo,
      fullName: current.personalInfo.fullName || imported.personalInfo.fullName,
      email: current.personalInfo.email || imported.personalInfo.email,
      phone: current.personalInfo.phone || imported.personalInfo.phone,
      location: current.personalInfo.location || imported.personalInfo.location,
      linkedin: current.personalInfo.linkedin || imported.personalInfo.linkedin,
      website: current.personalInfo.website || imported.personalInfo.website,
      summary: current.personalInfo.summary || imported.personalInfo.summary,
      jobTitle: current.personalInfo.jobTitle || imported.personalInfo.jobTitle,
    },
    sections: mergedSections,
    certifications: mergedCertifications.length > 0 ? mergedCertifications : current.certifications,
    projects: [...(current.projects ?? []), ...(imported.projects ?? [])],
    languages: [...(current.languages ?? []), ...(imported.languages ?? [])],
    volunteer: [...(current.volunteer ?? []), ...(imported.volunteer ?? [])],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Overwrite current studio profile with imported data while keeping the active resume id.
 */
export function overwriteWithImportedResume(
  current: ResumeData,
  imported: ResumeData,
): ResumeData {
  return {
    ...imported,
    id: current.id || imported.id,
    settings: {
      ...imported.settings,
      studioFormatting: {
        ...(imported.settings.studioFormatting ?? {}),
        ...(current.settings.studioFormatting ?? {}),
      },
      smartStudioSectionMeta: {
        ...(imported.settings.smartStudioSectionMeta ?? {}),
        ...(current.settings.smartStudioSectionMeta ?? {}),
      },
    },
    updatedAt: new Date().toISOString(),
  };
}
