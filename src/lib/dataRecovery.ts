/**
 * Data Recovery Utility
 * Handles corrupted data recovery for localStorage and JSON parsing
 */

import { ResumeData, INITIAL_RESUME_STATE } from '../types/resume';
import { SavedResume } from './resumeStorage';
import { ResumeVersion } from './resumeVersionHistory';
import { safeGetItem, safeRemoveItem } from './localStorageQuota';
import { migrateResumeData, needsMigration } from './resumeMigrations';

export interface ParseResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
  recovered?: boolean;
}

/**
 * Attempts to repair corrupted JSON by fixing common issues
 */
function repairJSON(jsonString: string): string | null {
  try {
    // Try to fix common JSON corruption issues
    let repaired = jsonString.trim();
    
    // Remove BOM if present
    if (repaired.charCodeAt(0) === 0xFEFF) {
      repaired = repaired.slice(1);
    }
    
    // Try to fix incomplete JSON (missing closing brackets)
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // Add missing closing brackets
    if (openBraces > closeBraces) {
      repaired += '}'.repeat(openBraces - closeBraces);
    }
    if (openBrackets > closeBrackets) {
      repaired += ']'.repeat(openBrackets - closeBrackets);
    }
    
    // Try to fix trailing commas
    repaired = repaired.replace(/,\s*([}\]])/g, '$1');
    
    // Try to fix unquoted keys
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
    
    return repaired;
  } catch (error) {
    return null;
  }
}

/**
 * Safely parse JSON with recovery mechanisms
 */
export function safeParseJSON<T>(
  jsonString: string | null,
  fallback: T | null = null,
  key?: string
): ParseResult<T> {
  if (!jsonString) {
    return { success: false, data: fallback, error: 'Empty or null JSON string' };
  }

  // Try normal parsing first
  try {
    const parsed = JSON.parse(jsonString) as T;
    return { success: true, data: parsed };
  } catch (error) {
    console.warn(`JSON parse error for key "${key || 'unknown'}":`, error);
    
    // Try to repair and parse again
    const repaired = repairJSON(jsonString);
    if (repaired) {
      try {
        const parsed = JSON.parse(repaired) as T;
        if (import.meta.env.DEV) {
          console.log(`Successfully recovered corrupted data for key "${key || 'unknown'}"`);
        }
        return { success: true, data: parsed, recovered: true };
      } catch (repairedError) {
        console.error(`Repair failed for key "${key || 'unknown'}":`, repairedError);
      }
    }
    
    // If repair failed, try to extract partial data
    const partialData = extractPartialData<T>(jsonString);
    if (partialData) {
      if (import.meta.env.DEV) {
        console.log(`Extracted partial data for key "${key || 'unknown'}"`);
      }
      return { success: true, data: partialData, recovered: true };
    }
    
    return {
      success: false,
      data: fallback,
      error: error instanceof Error ? error.message : 'Unknown parse error',
    };
  }
}

/**
 * Attempts to extract partial data from corrupted JSON
 */
function extractPartialData<T>(jsonString: string): T | null {
  try {
    // Try to extract valid JSON objects/arrays from the string
    const objectMatch = jsonString.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as T;
      } catch {
        // Continue to try array extraction
      }
    }
    
    const arrayMatch = jsonString.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]) as T;
      } catch {
        // Give up
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate and repair ResumeData structure
 */
export function validateAndRepairResumeData(data: any): ResumeData | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  try {
    // Ensure required fields exist with defaults
    const repaired: ResumeData = {
      id: data.id || crypto.randomUUID(),
      title: data.title || 'Untitled Resume',
      personalInfo: {
        fullName: data.personalInfo?.fullName || data.personalInfo?.name || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        linkedin: data.personalInfo?.linkedin || '',
        website: data.personalInfo?.website || '',
        summary: data.personalInfo?.summary || '',
        location: data.personalInfo?.location || '',
        jobTitle: data.personalInfo?.jobTitle || '',
        profilePicture: data.personalInfo?.profilePicture || '',
      },
      sections: Array.isArray(data.sections) ? data.sections : [],
      settings: {
        templateId: data.settings?.templateId || 'classic',
        fontSize: data.settings?.fontSize || 'medium',
        fontFamily: data.settings?.fontFamily || 'Arial',
        colorScheme: data.settings?.colorScheme || 'blue',
        spacing: data.settings?.spacing || 'medium',
        ...data.settings,
      },
      atsScore: typeof data.atsScore === 'number' ? data.atsScore : 0,
      updatedAt: data.updatedAt || new Date().toISOString(),
      isAISidebarOpen: data.isAISidebarOpen || false,
      targetJob: data.targetJob || {
        title: '',
        company: '',
        description: '',
        requirements: [],
      },
      targetJobId: data.targetJobId || null,
      focusedSectionId: data.focusedSectionId || null,
      projects: Array.isArray(data.projects) ? data.projects : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      languages: Array.isArray(data.languages) ? data.languages : [],
      volunteer: Array.isArray(data.volunteer) ? data.volunteer : [],
      customSections: Array.isArray(data.customSections) ? data.customSections : [],
    };

    return repaired;
  } catch (error) {
    console.error('Error repairing resume data:', error);
    return null;
  }
}

/**
 * Recover resumes from corrupted storage
 * Attempts to load from backup or version history
 */
export function recoverResumesFromStorage(
  storageKey: string,
  currentResumeId: string | null
): SavedResume[] {
  const recovered: SavedResume[] = [];
  
  try {
    // Try to load from the main storage key
    const stored = safeGetItem(storageKey);
    if (stored) {
      const parseResult = safeParseJSON<SavedResume[]>(stored, [], storageKey);
      if (parseResult.success && parseResult.data) {
        // Migrate, validate and repair each resume
        for (const resume of parseResult.data) {
          if (resume && resume.data) {
            // Check if migration is needed
            let dataToProcess = resume.data;
            if (needsMigration(dataToProcess)) {
              if (import.meta.env.DEV) {
                console.log(`Migrating resume ${resume.id} from legacy schema during recovery`);
              }
              dataToProcess = migrateResumeData(dataToProcess);
            }
            
            const repaired = validateAndRepairResumeData(dataToProcess);
            if (repaired) {
              recovered.push({
                ...resume,
                data: repaired,
              });
            }
          }
        }
      }
    }
    
    // If we have a current resume ID but it's not in recovered list, try to recover it
    if (currentResumeId && !recovered.find(r => r.id === currentResumeId)) {
      const legacyData = safeGetItem('resume-data');
      if (legacyData) {
        const parseResult = safeParseJSON<any>(legacyData, null, 'resume-data');
        if (parseResult.success && parseResult.data) {
          // Migrate if needed
          let dataToProcess = parseResult.data;
          if (needsMigration(dataToProcess)) {
            if (import.meta.env.DEV) {
              console.log('Migrating legacy resume data during recovery');
            }
            dataToProcess = migrateResumeData(dataToProcess);
          }
          
          const repaired = validateAndRepairResumeData(dataToProcess);
          if (repaired) {
            recovered.push({
              id: currentResumeId,
              title: repaired.title || 'Recovered Resume',
              data: repaired,
              createdAt: repaired.updatedAt || new Date().toISOString(),
              updatedAt: repaired.updatedAt || new Date().toISOString(),
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error recovering resumes:', error);
  }
  
  return recovered;
}

/**
 * Recover version history from corrupted storage
 */
export function recoverVersionHistory(
  storageKey: string,
  resumeId: string
): ResumeVersion[] {
  try {
    const stored = safeGetItem(storageKey);
    if (!stored) {
      return [];
    }
    
    const parseResult = safeParseJSON<ResumeVersion[]>(stored, [], storageKey);
    if (parseResult.success && parseResult.data) {
      // Filter and validate versions for this resume
      return parseResult.data
        .filter(v => v && v.resumeId === resumeId && v.data)
        .map(v => ({
          ...v,
          data: validateAndRepairResumeData(v.data) || INITIAL_RESUME_STATE,
        }))
        .filter(v => v.data !== INITIAL_RESUME_STATE); // Remove invalid versions
    }
  } catch (error) {
    console.error('Error recovering version history:', error);
  }
  
  return [];
}

/**
 * Clean up corrupted data by removing invalid entries
 */
export function cleanupCorruptedData(storageKey: string): boolean {
  try {
    const stored = safeGetItem(storageKey);
    if (!stored) {
      return true; // Nothing to clean
    }
    
    // Try to parse and validate
    const parseResult = safeParseJSON<any>(stored, null, storageKey);
    if (!parseResult.success) {
      // Data is corrupted beyond repair - remove it
      console.warn(`Removing corrupted data for key: ${storageKey}`);
      safeRemoveItem(storageKey);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error(`Error cleaning up corrupted data for ${storageKey}:`, error);
    // If cleanup fails, remove the corrupted data
    safeRemoveItem(storageKey);
    return false;
  }
}

/**
 * Create a backup of data before attempting recovery
 */
export function createDataBackup(storageKey: string, data: string): void {
  try {
    const backupKey = `${storageKey}_backup_${Date.now()}`;
    // Only keep last 3 backups
    const backupKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${storageKey}_backup_`)) {
        backupKeys.push(key);
      }
    }
    
    // Sort by timestamp and keep only the 3 most recent
    backupKeys.sort().reverse();
    if (backupKeys.length >= 3) {
      for (let i = 3; i < backupKeys.length; i++) {
        safeRemoveItem(backupKeys[i]);
      }
    }
    
    // Create new backup
    localStorage.setItem(backupKey, data);
  } catch (error) {
    console.warn('Could not create backup:', error);
    // Don't throw - backup is optional
  }
}

/**
 * Restore from backup if available
 */
export function restoreFromBackup(storageKey: string): string | null {
  try {
    const backupKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${storageKey}_backup_`)) {
        backupKeys.push(key);
      }
    }
    
    if (backupKeys.length === 0) {
      return null;
    }
    
    // Get the most recent backup
    backupKeys.sort().reverse();
    const latestBackup = safeGetItem(backupKeys[0]);
    
    if (latestBackup) {
      if (import.meta.env.DEV) {
        console.log(`Restoring from backup: ${backupKeys[0]}`);
      }
      return latestBackup;
    }
  } catch (error) {
    console.error('Error restoring from backup:', error);
  }
  
  return null;
}

