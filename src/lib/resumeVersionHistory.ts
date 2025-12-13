/**
 * Resume Version History Service
 * Tracks and manages versions of resumes
 */

import { ResumeData } from '../types/resume';

/**
 * Generate a unique ID using crypto.randomUUID()
 */
function generateVersionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `version_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionNumber: number;
  data: ResumeData;
  createdAt: string;
  createdBy?: string; // Could be 'auto-save', 'manual', 'restore', etc.
  label?: string; // User-defined label like "Before major changes"
  changeSummary?: string; // Brief description of what changed
}

const VERSION_HISTORY_KEY = 'smart_resume_studio_version_history';
const MAX_VERSIONS_PER_RESUME = 50; // Limit to prevent storage bloat

/**
 * Get all versions for a resume
 */
export function getResumeVersions(resumeId: string): ResumeVersion[] {
  try {
    const stored = localStorage.getItem(VERSION_HISTORY_KEY);
    if (stored) {
      const allVersions: ResumeVersion[] = JSON.parse(stored);
      return allVersions
        .filter(v => v.resumeId === resumeId)
        .sort((a, b) => b.versionNumber - a.versionNumber); // Newest first
    }
  } catch (error) {
    console.error('Error loading version history:', error);
  }
  return [];
}

/**
 * Save a new version of a resume
 */
export function saveVersion(
  resumeId: string,
  resumeData: ResumeData,
  options?: {
    createdBy?: string;
    label?: string;
    changeSummary?: string;
  }
): string {
  try {
    const allVersions = getAllVersions();
    const resumeVersions = getResumeVersions(resumeId);
    
    // Get next version number
    const nextVersionNumber = resumeVersions.length > 0 
      ? Math.max(...resumeVersions.map(v => v.versionNumber)) + 1
      : 1;

    // Create new version
    const newVersion: ResumeVersion = {
      id: generateVersionId(),
      resumeId,
      versionNumber: nextVersionNumber,
      data: JSON.parse(JSON.stringify(resumeData)), // Deep clone
      createdAt: new Date().toISOString(),
      createdBy: options?.createdBy || 'manual',
      label: options?.label,
      changeSummary: options?.changeSummary,
    };

    // Add new version
    allVersions.push(newVersion);

    // Clean up old versions (keep only MAX_VERSIONS_PER_RESUME per resume)
    const resumeVersionsUpdated = allVersions
      .filter(v => v.resumeId === resumeId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
    
    if (resumeVersionsUpdated.length > MAX_VERSIONS_PER_RESUME) {
      const versionsToKeep = resumeVersionsUpdated.slice(0, MAX_VERSIONS_PER_RESUME);
      const versionsToRemove = resumeVersionsUpdated.slice(MAX_VERSIONS_PER_RESUME);
      const versionsToRemoveIds = new Set(versionsToRemove.map(v => v.id));
      
      // Remove old versions
      const filteredVersions = allVersions.filter(v => 
        !(v.resumeId === resumeId && versionsToRemoveIds.has(v.id))
      );
      
      localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(filteredVersions));
    } else {
      localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(allVersions));
    }

    return newVersion.id;
  } catch (error) {
    console.error('Error saving version:', error);
    throw new Error('Failed to save version');
  }
}

/**
 * Get a specific version by ID
 */
export function getVersion(versionId: string): ResumeVersion | null {
  try {
    const allVersions = getAllVersions();
    return allVersions.find(v => v.id === versionId) || null;
  } catch (error) {
    console.error('Error loading version:', error);
    return null;
  }
}

/**
 * Delete a version
 */
export function deleteVersion(versionId: string): boolean {
  try {
    const allVersions = getAllVersions();
    const filtered = allVersions.filter(v => v.id !== versionId);
    localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting version:', error);
    return false;
  }
}

/**
 * Delete all versions for a resume
 */
export function deleteAllVersions(resumeId: string): boolean {
  try {
    const allVersions = getAllVersions();
    const filtered = allVersions.filter(v => v.resumeId !== resumeId);
    localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting all versions:', error);
    return false;
  }
}

/**
 * Label a version
 */
export function labelVersion(versionId: string, label: string): boolean {
  try {
    const allVersions = getAllVersions();
    const versionIndex = allVersions.findIndex(v => v.id === versionId);
    
    if (versionIndex === -1) {
      return false;
    }

    allVersions[versionIndex].label = label;
    localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(allVersions));
    return true;
  } catch (error) {
    console.error('Error labeling version:', error);
    return false;
  }
}

/**
 * Get all versions (across all resumes)
 */
function getAllVersions(): ResumeVersion[] {
  try {
    const stored = localStorage.getItem(VERSION_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading all versions:', error);
  }
  return [];
}

/**
 * Compare two versions and get a summary of changes
 */
export function compareVersions(version1: ResumeVersion, version2: ResumeVersion): {
  sectionsChanged: string[];
  personalInfoChanged: boolean;
  settingsChanged: boolean;
  summary: string;
} {
  const changes: string[] = [];
  const sectionsChanged: string[] = [];
  
  // Compare personal info
  const v1Personal = JSON.stringify(version1.data.personalInfo);
  const v2Personal = JSON.stringify(version2.data.personalInfo);
  if (v1Personal !== v2Personal) {
    changes.push('Personal information');
  }

  // Compare sections
  const v1Sections = version1.data.sections;
  const v2Sections = version2.data.sections;
  
  v1Sections.forEach((section, index) => {
    const v2Section = v2Sections[index];
    if (!v2Section || JSON.stringify(section) !== JSON.stringify(v2Section)) {
      sectionsChanged.push(section.title);
      changes.push(section.title);
    }
  });

  // Check for new sections
  v2Sections.forEach((section, index) => {
    if (!v1Sections[index]) {
      sectionsChanged.push(section.title);
      changes.push(`Added ${section.title}`);
    }
  });

  // Compare settings
  const v1Settings = JSON.stringify(version1.data.settings);
  const v2Settings = JSON.stringify(version2.data.settings);
  if (v1Settings !== v2Settings) {
    changes.push('Formatting settings');
  }

  const summary = changes.length > 0
    ? `Changed: ${changes.join(', ')}`
    : 'No changes detected';

  return {
    sectionsChanged,
    personalInfoChanged: v1Personal !== v2Personal,
    settingsChanged: v1Settings !== v2Settings,
    summary,
  };
}

/**
 * Get version count for a resume
 */
export function getVersionCount(resumeId: string): number {
  return getResumeVersions(resumeId).length;
}

/**
 * Format date for display
 */
export function formatVersionDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}

