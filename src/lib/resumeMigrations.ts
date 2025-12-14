/**
 * Resume Data Migration System
 * Handles schema versioning and data migration for resume data
 */

import { ResumeData, INITIAL_RESUME_STATE, PersonalInfo, FormattingSettings, TargetJob } from '../types/resume';
import { normalizeSectionItem } from './sectionItemHelpers';
import { getOptionalString, getStringValue } from './optionalFieldHelpers';

// Current schema version - increment this when schema changes
export const CURRENT_SCHEMA_VERSION = 3;

// Schema version history:
// v1: Initial schema (no version tracking)
// v2: Added targetJobId, focusedSectionId, advanced sections (projects, certifications, etc.)
// v3: Added profilePicture to PersonalInfo, improved FormattingSettings structure

export interface MigratedResumeData extends ResumeData {
  _schemaVersion?: number; // Internal field to track version
}

/**
 * Detect the schema version of resume data
 */
export function detectSchemaVersion(data: any): number {
  // If data has explicit version, use it
  if (data._schemaVersion && typeof data._schemaVersion === 'number') {
    return data._schemaVersion;
  }
  
  // Detect version based on field presence
  if (data.projects !== undefined || data.certifications !== undefined || data.targetJobId !== undefined) {
    return 2; // v2 introduced these fields
  }
  
  if (data.personalInfo?.profilePicture !== undefined) {
    return 3; // v3 introduced profilePicture
  }
  
  // If data has targetJob but not targetJobId, it's likely v1
  if (data.targetJob && !data.targetJobId) {
    return 1;
  }
  
  // Default to v1 for legacy data
  return 1;
}

/**
 * Migrate from v1 to v2
 */
function migrateV1ToV2(data: any): MigratedResumeData {
  const migrated: MigratedResumeData = {
    ...data,
    _schemaVersion: 2,
  };
  
  // Add new v2 fields with defaults
  if (migrated.targetJobId === undefined) {
    migrated.targetJobId = null;
  }
  
  if (migrated.focusedSectionId === undefined) {
    migrated.focusedSectionId = null;
  }
  
  // Add advanced sections if they don't exist
  if (migrated.projects === undefined) {
    migrated.projects = [];
  }
  
  if (migrated.certifications === undefined) {
    migrated.certifications = [];
  }
  
  if (migrated.languages === undefined) {
    migrated.languages = [];
  }
  
  if (migrated.volunteer === undefined) {
    migrated.volunteer = [];
  }
  
  if (migrated.customSections === undefined) {
    migrated.customSections = [];
  }
  
  // Ensure targetJob structure is correct
  if (!migrated.targetJob || typeof migrated.targetJob !== 'object') {
    migrated.targetJob = {
      title: '',
      description: '',
      industry: '',
    };
  } else {
    // Ensure targetJob has all required fields
    migrated.targetJob = {
      title: migrated.targetJob.title || '',
      description: migrated.targetJob.description || '',
      industry: migrated.targetJob.industry || '',
    };
  }
  
  return migrated;
}

/**
 * Migrate from v2 to v3
 */
function migrateV2ToV3(data: MigratedResumeData): MigratedResumeData {
  const migrated: MigratedResumeData = {
    ...data,
    _schemaVersion: 3,
  };
  
  // Add profilePicture to PersonalInfo if missing
  if (migrated.personalInfo && migrated.personalInfo.profilePicture === undefined) {
    migrated.personalInfo.profilePicture = '';
  }
  
  // Ensure FormattingSettings has all required fields
  if (migrated.settings) {
    const defaultSettings: FormattingSettings = {
      fontFamily: 'Inter',
      fontSize: 11,
      accentColor: '#3B82F6',
      lineHeight: 1.5,
      layout: 'classic',
      templateId: 'classic',
    };
    
    migrated.settings = {
      ...defaultSettings,
      ...migrated.settings,
      // Ensure templateId exists
      templateId: migrated.settings.templateId || 'classic',
    };
  }
  
  return migrated;
}

/**
 * Migrate legacy PersonalInfo format (name -> fullName)
 */
function migrateLegacyPersonalInfo(personalInfo: any): PersonalInfo {
  if (!personalInfo || typeof personalInfo !== 'object') {
    return INITIAL_RESUME_STATE.personalInfo;
  }
  
  // Handle legacy 'name' field -> 'fullName'
  const fullName = personalInfo.fullName || personalInfo.name || '';
  
  return {
    fullName,
    email: getStringValue(personalInfo.email),
    phone: getStringValue(personalInfo.phone),
    linkedin: getOptionalString(personalInfo.linkedin || personalInfo.linkedIn),
    website: getOptionalString(personalInfo.website || personalInfo.portfolio),
    summary: getStringValue(personalInfo.summary),
    location: getOptionalString(personalInfo.location),
    jobTitle: getOptionalString(personalInfo.jobTitle),
    profilePicture: getOptionalString(personalInfo.profilePicture),
  };
}

/**
 * Migrate legacy FormattingSettings format
 */
function migrateLegacySettings(settings: any): FormattingSettings {
  if (!settings || typeof settings !== 'object') {
    return INITIAL_RESUME_STATE.settings;
  }
  
  // Handle legacy fontSize as string -> number
  let fontSize = settings.fontSize;
  if (typeof fontSize === 'string') {
    const sizeMap: Record<string, number> = {
      'small': 10,
      'medium': 11,
      'large': 12,
    };
    fontSize = sizeMap[fontSize] || 11;
  } else if (typeof fontSize !== 'number') {
    fontSize = 11;
  }
  
  // Handle legacy accentColor format
  let accentColor = settings.accentColor || '#3B82F6';
  if (!accentColor.startsWith('#')) {
    // Try to convert color names to hex
    const colorMap: Record<string, string> = {
      'blue': '#3B82F6',
      'green': '#10B981',
      'purple': '#8B5CF6',
      'red': '#EF4444',
      'orange': '#F59E0B',
    };
    accentColor = colorMap[accentColor.toLowerCase()] || '#3B82F6';
  }
  
  return {
    fontFamily: settings.fontFamily || 'Inter',
    fontSize,
    accentColor,
    lineHeight: typeof settings.lineHeight === 'number' ? settings.lineHeight : 1.5,
    layout: settings.layout || 'classic',
    templateId: settings.templateId || 'classic',
  };
}

/**
 * Migrate legacy TargetJob format
 */
function migrateLegacyTargetJob(targetJob: any): TargetJob {
  if (!targetJob || typeof targetJob !== 'object') {
    return INITIAL_RESUME_STATE.targetJob;
  }
  
  return {
    title: targetJob.title || '',
    description: targetJob.description || '',
    industry: targetJob.industry || '',
  };
}

/**
 * Migrate legacy sections format
 */
function migrateLegacySections(sections: any[]): ResumeData['sections'] {
  if (!Array.isArray(sections)) {
    return INITIAL_RESUME_STATE.sections;
  }
  
  return sections.map(section => {
    if (!section || typeof section !== 'object') {
      return {
        id: crypto.randomUUID(),
        title: 'Untitled Section',
        type: 'custom',
        isVisible: true,
        items: [],
      };
    }
    
      return {
        id: section.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `section_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`),
      title: section.title || 'Untitled Section',
      type: section.type || 'custom',
      isVisible: section.isVisible !== false,
        items: Array.isArray(section.items) ? section.items.map((item: any) => 
          normalizeSectionItem({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            date: item.date,
            description: item.description,
          })
        ) : [],
    };
  });
}

/**
 * Main migration function - migrates data to current schema version
 */
export function migrateResumeData(data: any): ResumeData {
  if (!data || typeof data !== 'object') {
    console.warn('Invalid data provided to migrateResumeData, returning initial state');
    return INITIAL_RESUME_STATE;
  }
  
  // Detect current version
  let currentVersion = detectSchemaVersion(data);
  
  // Start with a copy of the data
  let migrated: MigratedResumeData = { ...data };
  
  // Migrate through each version
  if (currentVersion < 2) {
    migrated = migrateV1ToV2(migrated);
    currentVersion = 2;
  }
  
  if (currentVersion < 3) {
    migrated = migrateV2ToV3(migrated);
    currentVersion = 3;
  }
  
  // Ensure all required fields exist with proper structure
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `resume_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };
  
  const final: ResumeData = {
    id: migrated.id || generateId(),
    title: migrated.title || 'Untitled Resume',
    personalInfo: migrateLegacyPersonalInfo(migrated.personalInfo),
    sections: migrateLegacySections(migrated.sections),
    settings: migrateLegacySettings(migrated.settings),
    atsScore: typeof migrated.atsScore === 'number' ? migrated.atsScore : 0,
    updatedAt: migrated.updatedAt || new Date().toISOString(),
    isAISidebarOpen: migrated.isAISidebarOpen || false,
    targetJob: migrateLegacyTargetJob(migrated.targetJob),
    targetJobId: migrated.targetJobId !== undefined ? migrated.targetJobId : null,
    focusedSectionId: migrated.focusedSectionId !== undefined ? migrated.focusedSectionId : null,
    projects: Array.isArray(migrated.projects) ? migrated.projects : [],
    certifications: Array.isArray(migrated.certifications) ? migrated.certifications : [],
    languages: Array.isArray(migrated.languages) ? migrated.languages : [],
    volunteer: Array.isArray(migrated.volunteer) ? migrated.volunteer : [],
    customSections: Array.isArray(migrated.customSections) ? migrated.customSections : [],
  };
  
  // Remove internal version field before returning
  delete (final as any)._schemaVersion;
  
  return final;
}

/**
 * Mark data with current schema version
 */
export function markWithCurrentVersion(data: ResumeData): MigratedResumeData {
  return {
    ...data,
    _schemaVersion: CURRENT_SCHEMA_VERSION,
  };
}

/**
 * Check if data needs migration
 */
export function needsMigration(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return true; // Invalid data needs migration (will return initial state)
  }
  
  const version = detectSchemaVersion(data);
  return version < CURRENT_SCHEMA_VERSION;
}

/**
 * Get migration info for debugging
 */
export function getMigrationInfo(data: any): {
  detectedVersion: number;
  currentVersion: number;
  needsMigration: boolean;
  migrationPath: number[];
} {
  const detectedVersion = detectSchemaVersion(data);
  const needs = needsMigration(data);
  
  const migrationPath: number[] = [];
  if (detectedVersion < CURRENT_SCHEMA_VERSION) {
    for (let v = detectedVersion; v < CURRENT_SCHEMA_VERSION; v++) {
      migrationPath.push(v + 1);
    }
  }
  
  return {
    detectedVersion,
    currentVersion: CURRENT_SCHEMA_VERSION,
    needsMigration: needs,
    migrationPath,
  };
}

