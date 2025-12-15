/**
 * Resume Storage Service
 * Manages saving, loading, and organizing multiple resumes
 * Note: This is now a fallback/cache layer. Primary storage is Supabase.
 */

import { toast } from 'sonner';
import { ResumeData } from '../types/resume';
import { saveVersion } from './resumeVersionHistory';
import { safeSetItem, safeGetItem, safeRemoveItem, StoragePriority } from './localStorageQuota';
import { 
  safeParseJSON, 
  recoverResumesFromStorage, 
  cleanupCorruptedData, 
  createDataBackup,
  validateAndRepairResumeData,
  restoreFromBackup
} from './dataRecovery';
import { migrateResumeData, needsMigration } from './resumeMigrations';
import { trackVersionSaveFailure } from './versionSaveTracker';
import { showErrorToUser, ErrorContexts, getResumeErrorMessage } from './errorMessages';
import { sanitizeResumeData, sanitizeText } from './inputSanitization';
import { encryptResumeData, decryptResumeData } from './dataEncryption';
import { FeatureIntegration } from './featureIntegration';
import { safeValidateResume } from './validation';

/**
 * Generate a unique ID using crypto.randomUUID()
 */
function generateResumeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers (shouldn't happen in modern browsers)
  return `resume_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export interface SavedResume {
  id: string;
  title: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
  atsScore?: number;
  tags?: string[];
}

const STORAGE_KEY = 'smart_resume_studio_resumes';
const CURRENT_RESUME_KEY = 'smart_resume_studio_current_resume_id';

/**
 * Get all saved resumes with corruption recovery
 * Decrypts sensitive data after loading
 */
export async function getAllSavedResumes(): Promise<SavedResume[]> {
  try {
    const stored = safeGetItem(STORAGE_KEY);
    if (stored) {
      // Create backup before attempting recovery
      createDataBackup(STORAGE_KEY, stored);
      
      const parseResult = safeParseJSON<SavedResume[]>(stored, [], STORAGE_KEY);
      
      if (parseResult.success && parseResult.data) {
        if (parseResult.recovered) {
          console.warn('Recovered corrupted resume data from storage');
          // Save the recovered data back to storage
          try {
            safeSetItem(STORAGE_KEY, JSON.stringify(parseResult.data), StoragePriority.HIGH);
          } catch (saveError) {
            console.error('Failed to save recovered data:', saveError);
          }
        }
        // Decrypt sensitive data
        const decryptedResumes = await Promise.all(
          parseResult.data.map(async (resume) => ({
            ...resume,
            data: await decryptResumeData(resume.data),
          }))
        );
        return decryptedResumes;
      } else {
        // Try to recover from backup or version history
        console.warn('Failed to parse resume data, attempting recovery...');
        const currentResumeId = getCurrentResumeId();
        const recovered = recoverResumesFromStorage(STORAGE_KEY, currentResumeId);
        
        if (recovered.length > 0) {
          console.log(`Recovered ${recovered.length} resume(s) from corrupted storage`);
          // Save recovered data
          try {
            safeSetItem(STORAGE_KEY, JSON.stringify(recovered), StoragePriority.HIGH);
          } catch (saveError) {
            console.error('Failed to save recovered resumes:', saveError);
          }
          // Decrypt recovered data
          const decryptedRecovered = await Promise.all(
            recovered.map(async (resume) => ({
              ...resume,
              data: await decryptResumeData(resume.data),
            }))
          );
          return decryptedRecovered;
        }
        
        // If recovery failed, clean up corrupted data
        cleanupCorruptedData(STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('Error loading saved resumes:', error);
    // Attempt recovery as last resort
    const currentResumeId = getCurrentResumeId();
    const recovered = recoverResumesFromStorage(STORAGE_KEY, currentResumeId);
    if (recovered.length > 0) {
      // Decrypt recovered data
      const decryptedRecovered = await Promise.all(
        recovered.map(async (resume) => ({
          ...resume,
          data: await decryptResumeData(resume.data),
        }))
      );
      return decryptedRecovered;
    }
  }
  return [];
}

/**
 * Save a resume
 * Encrypts sensitive data before storing
 */
export async function saveResume(resume: ResumeData, title?: string): Promise<string> {
  try {
    // Validate resume data before saving
    const validation = safeValidateResume(resume);
    if (!validation.success) {
      console.error('Resume validation failed:', validation.errorMessages);
      // Try to use the fixed data if available, otherwise throw error
      if (validation.data) {
        resume = validation.data;
      } else {
        const errorMessage = validation.errorMessages?.join('\n') || 'Invalid resume data';
        throw new Error(`Resume validation failed: ${errorMessage}`);
      }
    } else if (validation.data) {
      // Use validated data (may have been fixed)
      resume = validation.data;
    }
    
    const resumes = await getAllSavedResumes();
    const resumeId = resume.id || generateResumeId();
    const resumeTitle = title || resume.title || 'Untitled Resume';
    
    // Ensure resume data is migrated to current schema
    let migratedResume = resume;
    if (needsMigration(resume)) {
      console.log(`Migrating resume ${resumeId} before saving`);
      migratedResume = migrateResumeData(resume);
    }
    
    // Sanitize data before saving to prevent XSS
    const sanitizedResume = sanitizeResumeData(migratedResume);
    
    // Encrypt sensitive data before storing
    const encryptedResume = await encryptResumeData(sanitizedResume);
    
    const savedResume: SavedResume = {
      id: resumeId,
      title: sanitizeText(resumeTitle),
      data: {
        ...encryptedResume,
        id: resumeId,
        title: sanitizeText(resumeTitle),
        updatedAt: new Date().toISOString(),
      },
      createdAt: resume.id ? (resumes.find(r => r.id === resume.id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: resume.settings.templateId,
      atsScore: resume.atsScore,
    };

    // Remove existing if updating
    const filteredResumes = resumes.filter(r => r.id !== resumeId);
    filteredResumes.push(savedResume);

    // Sort by updatedAt (newest first)
    filteredResumes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Create backup before saving
    const currentData = safeGetItem(STORAGE_KEY);
    if (currentData) {
      createDataBackup(STORAGE_KEY, currentData);
    }

    // Use quota-safe storage for resume data (HIGH priority)
    const dataToSave = JSON.stringify(filteredResumes);
    const result = safeSetItem(
      STORAGE_KEY,
      dataToSave,
      StoragePriority.HIGH
    );
    
    if (!result.success) {
      // Check if it's a quota error
      const errorStr = result.error || '';
      const isQuotaError = errorStr.toLowerCase().includes('quota') || 
                           errorStr.toLowerCase().includes('full') ||
                           errorStr.toLowerCase().includes('storage');
      
      if (isQuotaError) {
        // Show user-friendly toast notification
        toast.error('Local storage is full. Please delete old versions or download a backup.');
      }
      
      // Still throw error so caller knows save failed
      // But the app state remains valid - user can still download PDF
      const errorMessage = getResumeErrorMessage(result.error || 'Storage quota exceeded', 'SAVE_RESUME');
      throw new Error(errorMessage);
    }
    
    // Track last active resume for cross-feature access
    try {
      FeatureIntegration.setLastResumeId(savedResume.id);
    } catch (err) {
      console.error('Failed to set last resume ID:', err);
    }

    setCurrentResumeId(resumeId);
    
    // Save version history with error handling and user notification
    const isUpdate = resume.id && resumes.find(r => r.id === resume.id);
    const versionResult = saveVersion(resumeId, savedResume.data, {
      createdBy: isUpdate ? 'manual' : 'initial',
      changeSummary: isUpdate ? 'Resume updated' : 'Resume created',
    });
    
    if (!versionResult.success) {
      // Log error for debugging
      console.error('Failed to save version history:', versionResult.error);
      
      // Track the failure for reporting
      trackVersionSaveFailure(
        resumeId,
        versionResult.error || 'Unknown error',
        versionResult.retried || false
      );
      
      // Show user-friendly notification (non-blocking)
      // The resume save succeeded, but version history failed
      // We'll notify the user but not block the save operation
      setTimeout(() => {
        const errorMessage = getResumeErrorMessage(
          versionResult.error || 'Unknown error',
          'SAVE_VERSION'
        );
        alert(`Version History Notice\n\n${errorMessage}\n\nYour resume was saved successfully.`);
      }, 100);
    }
    
    return resumeId;
  } catch (error) {
    console.error('Error saving resume:', error);
    const errorMessage = getResumeErrorMessage(error, 'SAVE_RESUME');
    throw new Error(errorMessage);
  }
}

/**
 * Load a resume by ID
 * Decrypts sensitive data after loading
 */
export async function loadResume(id: string): Promise<ResumeData | null> {
  try {
    const resumes = await getAllSavedResumes();
    const savedResume = resumes.find(r => r.id === id);
    
    if (savedResume && savedResume.data) {
      // Validate loaded resume data
      const validation = safeValidateResume(savedResume.data);
      if (!validation.success) {
        console.warn('Loaded resume data failed validation, attempting repair:', validation.errorMessages);
        // Try to use repaired data
        if (validation.data) {
          return validation.data;
        } else {
          // Data is too corrupted, try to recover
          console.error('Resume data too corrupted to repair');
          return null;
        }
      } else if (validation.data) {
        // Return validated (and potentially fixed) data
        return validation.data;
      }
      // Check if migration is needed
      let dataToProcess = savedResume.data;
      if (needsMigration(dataToProcess)) {
        console.log(`Migrating resume ${id} from legacy schema`);
        dataToProcess = migrateResumeData(dataToProcess);
      }
      
      // Validate and repair the resume data
      const repaired = validateAndRepairResumeData(dataToProcess);
      
      if (repaired) {
        // Decrypt sensitive data
        const decrypted = await decryptResumeData(repaired);
        // Sanitize data to prevent XSS attacks
        const sanitized = sanitizeResumeData(decrypted);
        setCurrentResumeId(id);
        return sanitized;
      } else {
        console.warn(`Resume ${id} data is corrupted and could not be repaired`);
      }
    }
  } catch (error) {
    console.error('Error loading resume:', error);
    // Try to recover from backup
    const backupData = restoreFromBackup(STORAGE_KEY);
    if (backupData) {
      const parseResult = safeParseJSON<SavedResume[]>(backupData, [], STORAGE_KEY);
      if (parseResult.success && parseResult.data) {
        const savedResume = parseResult.data.find(r => r.id === id);
        if (savedResume) {
          const repaired = validateAndRepairResumeData(savedResume.data);
          if (repaired) {
            // Decrypt sensitive data
            const decrypted = await decryptResumeData(repaired);
            // Sanitize data to prevent XSS attacks
            const sanitized = sanitizeResumeData(decrypted);
            setCurrentResumeId(id);
            return sanitized;
          }
        }
      }
    }
  }
  return null;
}

/**
 * Delete a resume
 */
export async function deleteResume(id: string): Promise<boolean> {
  try {
    const resumes = await getAllSavedResumes();
    const filteredResumes = resumes.filter(r => r.id !== id);
    
    // Re-encrypt resumes before saving
    const encryptedResumes = await Promise.all(
      filteredResumes.map(async (resume) => ({
        ...resume,
        data: await encryptResumeData(resume.data),
      }))
    );
    
    const result = safeSetItem(
      STORAGE_KEY,
      JSON.stringify(encryptedResumes),
      StoragePriority.HIGH
    );
    
    if (!result.success) {
      console.error('Failed to delete resume from storage:', result.error);
      showErrorToUser(result.error || 'Storage error', ErrorContexts.DELETE_RESUME);
      return false;
    }
    
    // Clear current resume if it was deleted
    const currentId = getCurrentResumeId();
    if (currentId === id) {
      clearCurrentResumeId();
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    showErrorToUser(error, ErrorContexts.DELETE_RESUME);
    return false;
  }
}

/**
 * Duplicate a resume
 */
export async function duplicateResume(id: string, newTitle?: string): Promise<string | null> {
  try {
    const resumes = await getAllSavedResumes();
    const originalResume = resumes.find(r => r.id === id);
    
    if (!originalResume) {
      return null;
    }

    const newId = generateResumeId();
    const duplicatedResume: SavedResume = {
      ...originalResume,
      id: newId,
      title: newTitle || `${originalResume.title} (Copy)`,
      data: {
        ...originalResume.data,
        id: newId,
        title: newTitle || `${originalResume.title} (Copy)`,
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedResumes = [...resumes, duplicatedResume];
    updatedResumes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Re-encrypt resumes before saving
    const encryptedResumes = await Promise.all(
      updatedResumes.map(async (resume) => ({
        ...resume,
        data: await encryptResumeData(resume.data),
      }))
    );

    const result = safeSetItem(
      STORAGE_KEY,
      JSON.stringify(encryptedResumes),
      StoragePriority.HIGH
    );
    
    if (!result.success) {
      const errorMessage = getResumeErrorMessage(result.error || 'Storage quota exceeded', 'DUPLICATE_RESUME');
      throw new Error(errorMessage);
    }
    
    return newId;
  } catch (error) {
    console.error('Error duplicating resume:', error);
    showErrorToUser(error, ErrorContexts.DUPLICATE_RESUME);
    return null;
  }
}

/**
 * Rename a resume
 */
export async function renameResume(id: string, newTitle: string): Promise<boolean> {
  try {
    const resumes = await getAllSavedResumes();
    const resumeIndex = resumes.findIndex(r => r.id === id);
    
    if (resumeIndex === -1) {
      return false;
    }

    resumes[resumeIndex].title = sanitizeText(newTitle);
    resumes[resumeIndex].data.title = sanitizeText(newTitle);
    resumes[resumeIndex].updatedAt = new Date().toISOString();
    resumes[resumeIndex].data.updatedAt = new Date().toISOString();

    // Re-encrypt resumes before saving
    const encryptedResumes = await Promise.all(
      resumes.map(async (resume) => ({
        ...resume,
        data: await encryptResumeData(resume.data),
      }))
    );

    const result = safeSetItem(
      STORAGE_KEY,
      JSON.stringify(encryptedResumes),
      StoragePriority.HIGH
    );
    
    if (!result.success) {
      const errorMessage = getResumeErrorMessage(result.error || 'Storage quota exceeded', 'RENAME_RESUME');
      throw new Error(errorMessage);
    }
    
    return true;
  } catch (error) {
    console.error('Error renaming resume:', error);
    showErrorToUser(error, ErrorContexts.RENAME_RESUME);
    return false;
  }
}

/**
 * Get current resume ID
 */
export function getCurrentResumeId(): string | null {
  try {
    return safeGetItem(CURRENT_RESUME_KEY);
  } catch {
    return null;
  }
}

/**
 * Set current resume ID
 */
export function setCurrentResumeId(id: string): void {
  try {
    const result = safeSetItem(CURRENT_RESUME_KEY, id, StoragePriority.CRITICAL);
    if (!result.success) {
      console.error('Error setting current resume ID:', result.error);
    }
  } catch (error) {
    console.error('Error setting current resume ID:', error);
  }
}

/**
 * Clear current resume ID
 */
export function clearCurrentResumeId(): void {
  try {
    safeRemoveItem(CURRENT_RESUME_KEY);
  } catch (error) {
    console.error('Error clearing current resume ID:', error);
  }
}

/**
 * Get resume count
 */
export async function getResumeCount(): Promise<number> {
  const resumes = await getAllSavedResumes();
  return resumes.length;
}

/**
 * Search resumes by title or tags
 */
export async function searchResumes(query: string): Promise<SavedResume[]> {
  const resumes = await getAllSavedResumes();
  const lowerQuery = query.toLowerCase();
  
  return resumes.filter((resume: SavedResume) => 
    resume.title.toLowerCase().includes(lowerQuery) ||
    resume.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
  );
}

