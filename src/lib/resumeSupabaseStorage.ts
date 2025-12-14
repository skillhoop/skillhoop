/**
 * Supabase Resume Storage Service
 * Cloud-first storage for resumes with LocalStorage as fallback
 */

import { supabase } from './supabase';
import { ResumeData } from '../types/resume';
import { safeSetItem, safeGetItem, safeRemoveItem, StoragePriority } from './localStorageQuota';
import { safeParseJSON, validateAndRepairResumeData } from './dataRecovery';
import { migrateResumeData, needsMigration } from './resumeMigrations';

export interface SupabaseResume {
  id: string;
  user_id: string;
  title: string;
  resume_data: ResumeData;
  created_at: string;
  updated_at: string;
  template_id?: string;
  ats_score?: number;
  tags?: string[];
  is_dirty?: boolean; // Flag for unsynced changes
  last_modified?: string; // Timestamp for conflict detection
}

const LOCALSTORAGE_DIRTY_KEY = 'resume_dirty_flag';
const LOCALSTORAGE_DIRTY_DATA_KEY = 'resume_dirty_data';
const LOCALSTORAGE_LAST_MODIFIED_KEY = 'resume_last_modified';

/**
 * Generate a unique ID using crypto.randomUUID()
 */
export function generateResumeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers (shouldn't happen in modern browsers)
  return `resume_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Save resume to Supabase (primary storage)
 * Falls back to LocalStorage if network fails
 */
export async function saveResumeToSupabase(
  resume: ResumeData,
  userId: string
): Promise<{ success: boolean; resumeId: string; usedFallback: boolean }> {
  try {
    // Ensure resume is migrated to current schema before saving
    let resumeToSave = resume;
    if (needsMigration(resume)) {
      console.log(`Migrating resume ${resume.id} before saving to Supabase`);
      resumeToSave = migrateResumeData(resume);
    }
    
    const resumeId = resumeToSave.id || generateResumeId();
    const now = new Date().toISOString();

    const resumePayload = {
      id: resumeId,
      user_id: userId,
      title: resumeToSave.title || 'Untitled Resume',
      resume_data: resumeToSave,
      updated_at: now,
      template_id: resumeToSave.settings.templateId,
      ats_score: resumeToSave.atsScore,
      last_modified: now,
      is_dirty: false,
    };

    // Try to upsert to Supabase
    const { data, error } = await supabase
      .from('resumes')
      .upsert(resumePayload, {
        onConflict: 'id,user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Success - clear dirty flag from LocalStorage
    clearDirtyFlag();

    return {
      success: true,
      resumeId: data.id,
      usedFallback: false,
    };
  } catch (error) {
    console.error('Error saving resume to Supabase:', error);

    // Fallback to LocalStorage
    try {
      const now = new Date().toISOString();
      
      // Use quota-safe storage for critical dirty data
      // Ensure resume is migrated before saving to localStorage
      const resumeToSave = needsMigration(resume) ? migrateResumeData(resume) : resume;
      const dirtyDataResult = safeSetItem(
        LOCALSTORAGE_DIRTY_DATA_KEY,
        JSON.stringify(resumeToSave),
        StoragePriority.CRITICAL
      );
      
      const lastModifiedResult = safeSetItem(
        LOCALSTORAGE_LAST_MODIFIED_KEY,
        now,
        StoragePriority.CRITICAL
      );
      
      const dirtyFlagResult = safeSetItem(
        LOCALSTORAGE_DIRTY_KEY,
        'true',
        StoragePriority.CRITICAL
      );

      // If any critical save failed, throw error
      if (!dirtyDataResult.success || !lastModifiedResult.success || !dirtyFlagResult.success) {
        const errorMsg = dirtyDataResult.error || lastModifiedResult.error || dirtyFlagResult.error || 
          'Storage is full. Please free up space and try again.';
        throw new Error(errorMsg);
      }

      return {
        success: true,
        resumeId: resume.id || generateResumeId(),
        usedFallback: true,
      };
    } catch (localError) {
      console.error('Error saving to LocalStorage fallback:', localError);
      const errorMessage = localError instanceof Error 
        ? localError.message 
        : 'Failed to save resume. Please check your connection and try again.';
      throw new Error(errorMessage);
    }
  }
}

/**
 * Load resume from Supabase
 * Returns null if not found
 */
export async function loadResumeFromSupabase(
  resumeId: string,
  userId: string
): Promise<ResumeData | null> {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw error;
    }

    if (data && data.resume_data) {
      let resumeData = data.resume_data as ResumeData;
      
      // Migrate if needed
      if (needsMigration(resumeData)) {
        console.log(`Migrating resume ${resumeId} from Supabase`);
        resumeData = migrateResumeData(resumeData);
        
        // Save migrated data back to Supabase
        try {
          await supabase
            .from('resumes')
            .update({ resume_data: resumeData })
            .eq('id', resumeId)
            .eq('user_id', userId);
        } catch (migrationError) {
          console.warn('Failed to save migrated data to Supabase:', migrationError);
        }
      }
      
      return resumeData;
    }

    return null;
  } catch (error) {
    console.error('Error loading resume from Supabase:', error);
    return null;
  }
}

/**
 * Load the most recent resume for a user
 */
export async function loadLatestResumeFromSupabase(
  userId: string
): Promise<{ resume: ResumeData | null; resumeId: string | null; lastModified: string | null }> {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('id, resume_data, updated_at, last_modified')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return { resume: null, resumeId: null, lastModified: null };
      }
      throw error;
    }

    if (data && data.resume_data) {
      let resumeData = data.resume_data as ResumeData;
      
      // Migrate if needed
      if (needsMigration(resumeData)) {
        console.log(`Migrating latest resume from Supabase`);
        resumeData = migrateResumeData(resumeData);
        
        // Save migrated data back to Supabase
        try {
          await supabase
            .from('resumes')
            .update({ resume_data: resumeData })
            .eq('id', data.id)
            .eq('user_id', userId);
        } catch (migrationError) {
          console.warn('Failed to save migrated data to Supabase:', migrationError);
        }
      }
      
      return {
        resume: resumeData,
        resumeId: data.id,
        lastModified: data.last_modified || data.updated_at,
      };
    }

    return { resume: null, resumeId: null, lastModified: null };
  } catch (error) {
    console.error('Error loading latest resume from Supabase:', error);
    return { resume: null, resumeId: null, lastModified: null };
  }
}

/**
 * Get all resumes for a user
 */
export async function getAllResumesFromSupabase(userId: string): Promise<SupabaseResume[]> {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as SupabaseResume[];
  } catch (error) {
    console.error('Error loading all resumes from Supabase:', error);
    return [];
  }
}

/**
 * Delete resume from Supabase
 */
export async function deleteResumeFromSupabase(
  resumeId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting resume from Supabase:', error);
    return false;
  }
}

/**
 * Check if there's a dirty (unsynced) resume in LocalStorage
 */
export function getDirtyResumeFromLocalStorage(): {
  resume: ResumeData | null;
  lastModified: string | null;
} {
  try {
    const isDirty = safeGetItem(LOCALSTORAGE_DIRTY_KEY) === 'true';
    if (!isDirty) {
      return { resume: null, lastModified: null };
    }

    const dirtyData = safeGetItem(LOCALSTORAGE_DIRTY_DATA_KEY);
    const lastModified = safeGetItem(LOCALSTORAGE_LAST_MODIFIED_KEY);

    if (dirtyData) {
      const parseResult = safeParseJSON<ResumeData>(dirtyData, null, LOCALSTORAGE_DIRTY_DATA_KEY);
      
      if (parseResult.success && parseResult.data) {
        // Migrate if needed
        let dataToProcess = parseResult.data;
        if (needsMigration(dataToProcess)) {
          console.log('Migrating dirty resume data from localStorage');
          dataToProcess = migrateResumeData(dataToProcess);
        }
        
        const repaired = validateAndRepairResumeData(dataToProcess);
        if (repaired) {
          return {
            resume: repaired,
            lastModified,
          };
        }
      }
      
      // If parsing/repair failed, clean up corrupted data
      console.warn('Corrupted dirty resume data detected, cleaning up...');
      safeRemoveItem(LOCALSTORAGE_DIRTY_DATA_KEY);
      safeRemoveItem(LOCALSTORAGE_LAST_MODIFIED_KEY);
      safeRemoveItem(LOCALSTORAGE_DIRTY_KEY);
    }
  } catch (error) {
    console.error('Error reading dirty resume from LocalStorage:', error);
  }

  return { resume: null, lastModified: null };
}

/**
 * Clear the dirty flag from LocalStorage
 */
export function clearDirtyFlag(): void {
  try {
    safeRemoveItem(LOCALSTORAGE_DIRTY_KEY);
    safeRemoveItem(LOCALSTORAGE_DIRTY_DATA_KEY);
    safeRemoveItem(LOCALSTORAGE_LAST_MODIFIED_KEY);
  } catch (error) {
    console.error('Error clearing dirty flag:', error);
  }
}

/**
 * Retry syncing dirty resume to Supabase
 */
export async function retrySyncDirtyResume(userId: string): Promise<boolean> {
  const { resume, lastModified } = getDirtyResumeFromLocalStorage();

  if (!resume) {
    return false;
  }

  try {
    const result = await saveResumeToSupabase(resume, userId);
    if (result.success && !result.usedFallback) {
      clearDirtyFlag();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error retrying sync:', error);
    return false;
  }
}

