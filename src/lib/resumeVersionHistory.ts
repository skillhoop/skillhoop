/**
 * Resume Version History Service
 * Tracks and manages versions of resumes
 */

import { ResumeData } from '../types/resume';
import { safeGetItem, safeSetItem, StoragePriority } from './localStorageQuota';
import { 
  safeParseJSON, 
  recoverVersionHistory, 
  cleanupCorruptedData, 
  createDataBackup,
  validateAndRepairResumeData
} from './dataRecovery';
import { migrateResumeData, needsMigration } from './resumeMigrations';

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

// Version history limits to prevent unbounded growth
export const MAX_VERSIONS_PER_RESUME = 50; // Limit to prevent storage bloat per resume
export const MAX_TOTAL_VERSIONS = 500; // Global limit across all resumes
export const MAX_VERSION_AGE_DAYS = 90; // Delete versions older than 90 days

// Export constants for external use
export const VERSION_LIMITS = {
  MAX_VERSIONS_PER_RESUME,
  MAX_TOTAL_VERSIONS,
  MAX_VERSION_AGE_DAYS,
} as const;

/**
 * Get all versions for a resume with corruption recovery
 */
export function getResumeVersions(resumeId: string): ResumeVersion[] {
  try {
    const stored = safeGetItem(VERSION_HISTORY_KEY);
    if (stored) {
      // Create backup before attempting recovery
      createDataBackup(VERSION_HISTORY_KEY, stored);
      
      const parseResult = safeParseJSON<ResumeVersion[]>(stored, [], VERSION_HISTORY_KEY);
      
      if (parseResult.success && parseResult.data) {
        // Migrate, validate and repair each version
        const validVersions = parseResult.data
          .filter(v => v && v.resumeId === resumeId && v.data)
          .map(v => {
            // Migrate if needed
            let dataToProcess = v.data;
            if (needsMigration(dataToProcess)) {
              dataToProcess = migrateResumeData(dataToProcess);
            }
            return {
              ...v,
              data: validateAndRepairResumeData(dataToProcess) || dataToProcess,
            };
          })
          .filter(v => v.data) // Remove versions with invalid data
          .sort((a, b) => b.versionNumber - a.versionNumber); // Newest first
        
        if (parseResult.recovered || validVersions.length !== parseResult.data.filter(v => v.resumeId === resumeId).length) {
          console.warn('Recovered corrupted version history data');
          // Save the recovered data back to storage
          try {
            const allVersions = parseResult.data.filter(v => v.resumeId !== resumeId).concat(validVersions);
            safeSetItem(VERSION_HISTORY_KEY, JSON.stringify(allVersions), StoragePriority.HIGH);
          } catch (saveError) {
            console.error('Failed to save recovered version history:', saveError);
          }
        }
        
        return validVersions;
      } else {
        // Try to recover from backup or repair
        console.warn('Failed to parse version history, attempting recovery...');
        const recovered = recoverVersionHistory(VERSION_HISTORY_KEY, resumeId);
        
        if (recovered.length > 0) {
          console.log(`Recovered ${recovered.length} version(s) for resume ${resumeId}`);
          return recovered;
        }
        
        // If recovery failed, clean up corrupted data
        cleanupCorruptedData(VERSION_HISTORY_KEY);
      }
    }
  } catch (error) {
    console.error('Error loading version history:', error);
    // Attempt recovery as last resort
    const recovered = recoverVersionHistory(VERSION_HISTORY_KEY, resumeId);
    if (recovered.length > 0) {
      return recovered;
    }
  }
  return [];
}

export interface VersionSaveResult {
  success: boolean;
  versionId?: string;
  error?: string;
  retried?: boolean;
}

/**
 * Save a new version of a resume with error handling and retry logic
 */
export function saveVersion(
  resumeId: string,
  resumeData: ResumeData,
  options?: {
    createdBy?: string;
    label?: string;
    changeSummary?: string;
  }
): VersionSaveResult {
  const maxRetries = 2;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const allVersions = getAllVersions();
      const resumeVersions = getResumeVersions(resumeId);
      
      // Get next version number
      const nextVersionNumber = resumeVersions.length > 0 
        ? Math.max(...resumeVersions.map(v => v.versionNumber)) + 1
        : 1;

      // Ensure resume data is migrated before saving version
      let versionData = resumeData;
      if (needsMigration(resumeData)) {
        console.log(`Migrating resume data before saving version`);
        versionData = migrateResumeData(resumeData);
      }
      
      // Create new version
      const newVersion: ResumeVersion = {
        id: generateVersionId(),
        resumeId,
        versionNumber: nextVersionNumber,
        data: JSON.parse(JSON.stringify(versionData)), // Deep clone
        createdAt: new Date().toISOString(),
        createdBy: options?.createdBy || 'manual',
        label: options?.label,
        changeSummary: options?.changeSummary,
      };

      // Add new version
      allVersions.push(newVersion);

      // Clean up old versions using comprehensive cleanup strategy
      const cleanedVersions = cleanupOldVersions(allVersions);
      
      // Create backup before saving
      const currentData = safeGetItem(VERSION_HISTORY_KEY);
      if (currentData) {
        createDataBackup(VERSION_HISTORY_KEY, currentData);
      }
      
      const dataToSave = JSON.stringify(cleanedVersions);
      const result = safeSetItem(VERSION_HISTORY_KEY, dataToSave, StoragePriority.HIGH);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save version history due to storage quota');
      }

      // Success - return version ID
      return {
        success: true,
        versionId: newVersion.id,
        retried: attempt > 0,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Error saving version (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError);
      
      // If this was the last attempt, return failure
      if (attempt === maxRetries) {
        return {
          success: false,
          error: lastError.message || 'Failed to save version history after retries',
          retried: true,
        };
      }
      
      // Wait a bit before retrying (exponential backoff) - synchronous delay
      const delay = 100 * Math.pow(2, attempt);
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Busy wait (synchronous)
      }
    }
  }
  
  // This should never be reached, but TypeScript needs it
  return {
    success: false,
    error: lastError?.message || 'Unknown error saving version',
  };
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
    
    // Create backup before saving
    const currentData = safeGetItem(VERSION_HISTORY_KEY);
    if (currentData) {
      createDataBackup(VERSION_HISTORY_KEY, currentData);
    }
    
    const dataToSave = JSON.stringify(filtered);
    const result = safeSetItem(VERSION_HISTORY_KEY, dataToSave, StoragePriority.HIGH);
    return result.success;
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
    
    // Create backup before saving
    const currentData = safeGetItem(VERSION_HISTORY_KEY);
    if (currentData) {
      createDataBackup(VERSION_HISTORY_KEY, currentData);
    }
    
    const dataToSave = JSON.stringify(filtered);
    const result = safeSetItem(VERSION_HISTORY_KEY, dataToSave, StoragePriority.HIGH);
    return result.success;
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
    
    // Create backup before saving
    const currentData = safeGetItem(VERSION_HISTORY_KEY);
    if (currentData) {
      createDataBackup(VERSION_HISTORY_KEY, currentData);
    }
    
    const dataToSave = JSON.stringify(allVersions);
    const result = safeSetItem(VERSION_HISTORY_KEY, dataToSave, StoragePriority.HIGH);
    return result.success;
  } catch (error) {
    console.error('Error labeling version:', error);
    return false;
  }
}

/**
 * Clean up old versions using multiple strategies:
 * 1. Per-resume limit (MAX_VERSIONS_PER_RESUME)
 * 2. Global limit (MAX_TOTAL_VERSIONS)
 * 3. Age-based cleanup (MAX_VERSION_AGE_DAYS)
 */
function cleanupOldVersions(allVersions: ResumeVersion[]): ResumeVersion[] {
  const now = new Date();
  const maxAgeMs = MAX_VERSION_AGE_DAYS * 24 * 60 * 60 * 1000;
  
  // Step 1: Remove versions older than MAX_VERSION_AGE_DAYS
  const cleaned = allVersions.filter(v => {
    const versionAge = now.getTime() - new Date(v.createdAt).getTime();
    return versionAge <= maxAgeMs;
  });
  
  // Step 2: Apply per-resume limit (keep newest MAX_VERSIONS_PER_RESUME per resume)
  const versionsByResume = new Map<string, ResumeVersion[]>();
  cleaned.forEach(v => {
    if (!versionsByResume.has(v.resumeId)) {
      versionsByResume.set(v.resumeId, []);
    }
    versionsByResume.get(v.resumeId)!.push(v);
  });
  
  // Sort each resume's versions by version number (newest first) and keep only MAX_VERSIONS_PER_RESUME
  const perResumeCleaned: ResumeVersion[] = [];
  versionsByResume.forEach((versions) => {
    const sorted = versions.sort((a, b) => b.versionNumber - a.versionNumber);
    const toKeep = sorted.slice(0, MAX_VERSIONS_PER_RESUME);
    perResumeCleaned.push(...toKeep);
  });
  
  // Step 3: Apply global limit if still too many versions
  if (perResumeCleaned.length > MAX_TOTAL_VERSIONS) {
    // Sort all versions by creation date (newest first) and keep only MAX_TOTAL_VERSIONS
    const sortedByDate = perResumeCleaned.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Keep the newest MAX_TOTAL_VERSIONS, but ensure we keep at least one version per resume
    const versionsToKeep = new Map<string, ResumeVersion[]>();
    const remainingSlots = MAX_TOTAL_VERSIONS;
    let keptCount = 0;
    
    // First pass: ensure at least one version per resume
    sortedByDate.forEach(v => {
      if (!versionsToKeep.has(v.resumeId)) {
        versionsToKeep.set(v.resumeId, []);
      }
      const resumeVersions = versionsToKeep.get(v.resumeId)!;
      if (resumeVersions.length === 0) {
        resumeVersions.push(v);
        keptCount++;
      }
    });
    
    // Second pass: fill remaining slots with newest versions
    sortedByDate.forEach(v => {
      const resumeVersions = versionsToKeep.get(v.resumeId)!;
      if (keptCount < remainingSlots && !resumeVersions.includes(v)) {
        resumeVersions.push(v);
        keptCount++;
      }
    });
    
    // Flatten the map back to array
    const finalVersions: ResumeVersion[] = [];
    versionsToKeep.forEach(versions => {
      finalVersions.push(...versions);
    });
    
    return finalVersions;
  }
  
  return perResumeCleaned;
}

/**
 * Proactively clean up old versions (can be called periodically)
 * Returns the number of versions removed
 */
export function cleanupVersionHistory(): { removed: number; remaining: number } {
  try {
    const allVersions = getAllVersions();
    const beforeCount = allVersions.length;
    
    // Clean up all versions using the cleanup function
    const cleaned = cleanupOldVersions(allVersions);
    
    const afterCount = cleaned.length;
    const removed = beforeCount - afterCount;
    
    if (removed > 0) {
      // Save cleaned versions
      const currentData = safeGetItem(VERSION_HISTORY_KEY);
      if (currentData) {
        createDataBackup(VERSION_HISTORY_KEY, currentData);
      }
      
      const dataToSave = JSON.stringify(cleaned);
      const result = safeSetItem(VERSION_HISTORY_KEY, dataToSave, StoragePriority.HIGH);
      if (result.success) {
        console.log(`Cleaned up ${removed} old version(s), ${afterCount} remaining`);
      }
    }
    
    return { removed, remaining: afterCount };
  } catch (error) {
    console.error('Error cleaning up version history:', error);
    const allVersions = getAllVersions();
    return { removed: 0, remaining: allVersions.length };
  }
}

/**
 * Get all versions (across all resumes) with corruption recovery
 */
function getAllVersions(): ResumeVersion[] {
  try {
    const stored = safeGetItem(VERSION_HISTORY_KEY);
    if (stored) {
      const parseResult = safeParseJSON<ResumeVersion[]>(stored, [], VERSION_HISTORY_KEY);
      
      if (parseResult.success && parseResult.data) {
        // Migrate, validate and repair each version
        const validVersions = parseResult.data
          .filter(v => v && v.data)
          .map(v => {
            // Migrate if needed
            let dataToProcess = v.data;
            if (needsMigration(dataToProcess)) {
              dataToProcess = migrateResumeData(dataToProcess);
            }
            return {
              ...v,
              data: validateAndRepairResumeData(dataToProcess) || dataToProcess,
            };
          })
          .filter(v => v.data); // Remove versions with invalid data
        
        if (parseResult.recovered || validVersions.length !== parseResult.data.length) {
          console.warn('Recovered corrupted version history data');
          // Save the recovered data back to storage
          try {
            safeSetItem(VERSION_HISTORY_KEY, JSON.stringify(validVersions), StoragePriority.HIGH);
          } catch (saveError) {
            console.error('Failed to save recovered version history:', saveError);
          }
        }
        
        return validVersions;
      } else {
        // If recovery failed, clean up corrupted data
        cleanupCorruptedData(VERSION_HISTORY_KEY);
      }
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

