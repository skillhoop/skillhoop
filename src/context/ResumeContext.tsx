import React, { createContext, useContext, useReducer, useEffect, useRef, useState, useMemo, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { ResumeData, PersonalInfo, FormattingSettings, ResumeSection, TargetJob, INITIAL_RESUME_STATE } from '../types/resume';
import { getCurrentResumeId, loadResume, saveResume } from '../lib/resumeStorage';
import { supabase } from '../lib/supabase';
import {
  saveResumeToSupabase,
  loadResumeFromSupabase,
  loadLatestResumeFromSupabase,
  getDirtyResumeFromLocalStorage,
  clearDirtyFlag,
  retrySyncDirtyResume,
} from '../lib/resumeSupabaseStorage';
import { validateResume } from '../lib/validation';
import { cleanupVersionHistory } from '../lib/resumeVersionHistory';
import { safeSetItem, safeGetItem, StoragePriority } from '../lib/localStorageQuota';
import { safeParseJSON, validateAndRepairResumeData } from '../lib/dataRecovery';
import { migrateResumeData, needsMigration } from '../lib/resumeMigrations';
import { showErrorToUser, ErrorContexts } from '../lib/errorMessages';
import {
  createHistoryState,
  undo as undoHistory,
  redo as redoHistory,
  canUndo,
  canRedo,
  getCurrentState,
  clearHistory,
  type HistoryState,
} from '../lib/undoRedoHistory';
import { sanitizeText, sanitizeEmail, sanitizePhone, sanitizeURL } from '../lib/inputSanitization';
import { areSkillsDuplicate } from '../lib/skillDeduplication';
import { handleError } from '../lib/networkErrorHandler';

/**
 * Generate a unique ID using crypto.randomUUID()
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Action types
type ResumeAction =
  | { type: 'SET_RESUME'; payload: ResumeData }
  | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<FormattingSettings> }
  | { type: 'UPDATE_TARGET_JOB'; payload: Partial<TargetJob> & { targetJobId?: string | null } }
  | { type: 'UPDATE_ATS_SCORE'; payload: number }
  | { type: 'ADD_SECTION'; payload: ResumeSection }
  | { type: 'REMOVE_SECTION'; payload: string } // section id
  | { type: 'UPDATE_SECTION'; payload: { id: string; updates: Partial<ResumeSection> } }
  | { type: 'ADD_SECTION_ITEM'; payload: { sectionId: string; item: ResumeSection['items'][0] } }
  | { type: 'REMOVE_SECTION_ITEM'; payload: { sectionId: string; itemId: string } }
  | { type: 'UPDATE_SECTION_ITEM'; payload: { sectionId: string; itemId: string; data: Partial<ResumeSection['items'][0]> } }
  | { type: 'REORDER_SECTIONS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'RESET_RESUME' }
  | { type: 'TOGGLE_AI_SIDEBAR' }
  | { type: 'SET_FOCUSED_SECTION'; payload: string | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY'; payload: ResumeData };

// Context state type
interface ResumeContextState {
  state: ResumeData;
  dispatch: React.Dispatch<ResumeAction>;
  isSaving?: boolean; // Optional saving indicator
  saveError?: string | null;
  canUndo: boolean; // Whether undo is available
  canRedo: boolean; // Whether redo is available
  undo: () => void; // Undo function
  redo: () => void; // Redo function
}

// Create context
const ResumeContext = createContext<ResumeContextState | undefined>(undefined);

// Helper function to ensure resume data always has a valid ID
function ensureResumeHasId(resumeData: ResumeData): ResumeData {
  if (!resumeData.id || resumeData.id === '') {
    return { ...resumeData, id: generateId() };
  }
  return resumeData;
}

// Helper function to get initial state (will be replaced by async loading)
function getInitialState(): ResumeData {
  const initialState = { ...INITIAL_RESUME_STATE };
  // CRITICAL: Ensure ID is always generated, never empty
  return ensureResumeHasId(initialState);
}

// Reducer function
function resumeReducer(state: ResumeData, action: ResumeAction): ResumeData {
  switch (action.type) {
    case 'SET_RESUME':
      return action.payload;

    case 'RESET_RESUME':
      localStorage.removeItem('resume-data');
      // CRITICAL: Generate a new ID when resetting, never use empty string
      const resetState = { ...INITIAL_RESUME_STATE };
      resetState.id = generateId();
      return resetState;

    case 'UPDATE_PERSONAL_INFO': {
      // Sanitize personal info to prevent XSS
      const sanitizedPersonalInfo: Partial<PersonalInfo> = {};
      if (action.payload.fullName !== undefined) sanitizedPersonalInfo.fullName = sanitizeText(action.payload.fullName);
      if (action.payload.jobTitle !== undefined) sanitizedPersonalInfo.jobTitle = sanitizeText(action.payload.jobTitle);
      if (action.payload.email !== undefined) sanitizedPersonalInfo.email = sanitizeEmail(action.payload.email);
      if (action.payload.phone !== undefined) sanitizedPersonalInfo.phone = sanitizePhone(action.payload.phone);
      if (action.payload.location !== undefined) sanitizedPersonalInfo.location = sanitizeText(action.payload.location);
      if (action.payload.linkedin !== undefined) sanitizedPersonalInfo.linkedin = sanitizeURL(action.payload.linkedin);
      if (action.payload.website !== undefined) sanitizedPersonalInfo.website = sanitizeURL(action.payload.website);
      if (action.payload.summary !== undefined) sanitizedPersonalInfo.summary = sanitizeText(action.payload.summary);
      if (action.payload.profilePicture !== undefined) sanitizedPersonalInfo.profilePicture = sanitizeURL(action.payload.profilePicture);
      
      return {
        ...state,
        personalInfo: {
          ...state.personalInfo,
          ...sanitizedPersonalInfo,
        },
        updatedAt: new Date().toISOString(),
      };
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
        updatedAt: new Date().toISOString(),
      };

    case 'UPDATE_TARGET_JOB': {
      // When updating target job, preserve targetJobId if it exists
      // Only clear targetJobId if the job title/company doesn't match any existing job
      // Extract targetJobId from payload if present (it's on ResumeData, not TargetJob)
      const { targetJobId: payloadTargetJobId, ...targetJobPayload } = action.payload as Partial<TargetJob> & { targetJobId?: string | null };
      
      return {
        ...state,
        targetJob: {
          ...state.targetJob,
          ...targetJobPayload,
        },
        // Preserve targetJobId when updating target job details
        // The ID should only be cleared if explicitly set to null
        targetJobId: payloadTargetJobId !== undefined 
          ? payloadTargetJobId 
          : state.targetJobId,
        updatedAt: new Date().toISOString(),
      };
    }

    case 'UPDATE_ATS_SCORE':
      return {
        ...state,
        atsScore: action.payload,
        updatedAt: new Date().toISOString(),
      };

    case 'ADD_SECTION':
      return {
        ...state,
        sections: [...state.sections, action.payload],
        updatedAt: new Date().toISOString(),
      };

    case 'REMOVE_SECTION':
      return {
        ...state,
        sections: state.sections.filter((section) => section.id !== action.payload),
        updatedAt: new Date().toISOString(),
      };

    case 'UPDATE_SECTION': {
      // Sanitize section updates to prevent XSS
      const sanitizedSectionUpdates: Partial<ResumeSection> = {};
      if (action.payload.updates.title !== undefined) {
        sanitizedSectionUpdates.title = sanitizeText(action.payload.updates.title);
      }
      if (action.payload.updates.items !== undefined) {
        sanitizedSectionUpdates.items = action.payload.updates.items.map(item => ({
          ...item,
          title: item.title ? sanitizeText(item.title) : item.title,
          subtitle: item.subtitle ? sanitizeText(item.subtitle) : item.subtitle,
          description: item.description ? sanitizeText(item.description) : item.description,
          date: item.date ? sanitizeText(item.date) : item.date,
        }));
      }
      
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.id
            ? { ...section, ...action.payload.updates, ...sanitizedSectionUpdates }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };
    }

    case 'ADD_SECTION_ITEM': {
      // Sanitize section item before adding
      const sanitizedNewItem = {
        ...action.payload.item,
        title: action.payload.item.title ? sanitizeText(action.payload.item.title) : action.payload.item.title,
        subtitle: action.payload.item.subtitle ? sanitizeText(action.payload.item.subtitle) : action.payload.item.subtitle,
        description: action.payload.item.description ? sanitizeText(action.payload.item.description) : action.payload.item.description,
        date: action.payload.item.date ? sanitizeText(action.payload.item.date) : action.payload.item.date,
      };
      
      // For skills section, check for duplicates before adding
      if (action.payload.sectionId === 'skills' && sanitizedNewItem.title) {
        const skillsSection = state.sections.find(s => s.id === action.payload.sectionId);
        if (skillsSection) {
          // Check if this skill already exists (case-insensitive, normalized)
          const isDuplicate = skillsSection.items.some(item => 
            item.title && areSkillsDuplicate(item.title, sanitizedNewItem.title)
          );
          
          // If duplicate, don't add it
          if (isDuplicate) {
            return state; // No change
          }
        }
      }
      
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? { ...section, items: [...section.items, sanitizedNewItem] }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };
    }

    case 'REMOVE_SECTION_ITEM':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? { ...section, items: section.items.filter((item) => item.id !== action.payload.itemId) }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };

    case 'UPDATE_SECTION_ITEM': {
      // Sanitize section item updates to prevent XSS
      const sanitizedItemData: Partial<ResumeSection['items'][0]> = {};
      if (action.payload.data.title !== undefined) sanitizedItemData.title = sanitizeText(action.payload.data.title);
      if (action.payload.data.subtitle !== undefined) sanitizedItemData.subtitle = sanitizeText(action.payload.data.subtitle);
      if (action.payload.data.description !== undefined) sanitizedItemData.description = sanitizeText(action.payload.data.description);
      if (action.payload.data.date !== undefined) sanitizedItemData.date = sanitizeText(action.payload.data.date);
      
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === action.payload.itemId
                    ? { ...item, ...action.payload.data, ...sanitizedItemData }
                    : item
                ),
              }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };
    }

    case 'REORDER_SECTIONS': {
      const { fromIndex, toIndex } = action.payload;
      const newSections = [...state.sections];
      const [movedSection] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedSection);
      return {
        ...state,
        sections: newSections,
        updatedAt: new Date().toISOString(),
      };
    }

    case 'TOGGLE_AI_SIDEBAR':
      return {
        ...state,
        isAISidebarOpen: !state.isAISidebarOpen,
      };

    case 'SET_FOCUSED_SECTION':
      return {
        ...state,
        focusedSectionId: action.payload,
        updatedAt: new Date().toISOString(),
      };

    case 'UNDO':
    case 'REDO':
    case 'CLEAR_HISTORY':
      // These are handled separately in the component
      return state;

    default:
      return state;
  }
}

// Provider component
interface ResumeProviderProps {
  children: ReactNode;
  initialData?: ResumeData;
}

export function ResumeProvider({ children, initialData }: ResumeProviderProps) {
  // CRITICAL: Ensure initialData has a valid ID before using it
  const safeInitialData = initialData ? ensureResumeHasId(initialData) : getInitialState();
  const [state, dispatch] = useReducer(resumeReducer, safeInitialData);
  const [history, setHistory] = useState<HistoryState>(() => 
    createHistoryState(safeInitialData)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const isUndoRedoRef = useRef(false);
  const isSavingRef = useRef(false); // Lock to prevent concurrent saves
  const latestStateRef = useRef<ResumeData>(state); // Always reference latest state
  const pendingSaveRef = useRef<boolean>(false); // Track if a save was queued
  const [saveTrigger, setSaveTrigger] = useState(0); // Counter to force save effect re-run when queued

  // Clean up old versions on mount (run once per session)
  useEffect(() => {
    // Run cleanup in background (non-blocking)
    cleanupVersionHistory();
  }, []);

  // Load resume from Supabase on mount (Cloud-First strategy)
  useEffect(() => {
    let mounted = true;

    async function loadResumeFromCloud() {
      try {
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Not logged in - use LocalStorage fallback
          const currentResumeId = getCurrentResumeId();
          if (currentResumeId) {
            const loadedResume = await loadResume(currentResumeId);
            if (loadedResume && mounted) {
              dispatch({ type: 'SET_RESUME', payload: loadedResume });
            }
          } else {
            // Try legacy localStorage with corruption recovery
            const storedData = safeGetItem('resume-data');
            if (storedData && mounted) {
              const parseResult = safeParseJSON<ResumeData>(storedData, null, 'resume-data');
              
              if (parseResult.success && parseResult.data) {
                // Migrate if needed
                let dataToProcess = parseResult.data;
                if (needsMigration(dataToProcess)) {
                  dataToProcess = migrateResumeData(dataToProcess);
                }
                
                // Validate and repair the data
                const repaired = validateAndRepairResumeData(dataToProcess);
                if (repaired) {
                  if (parseResult.recovered) {
                    console.warn('Recovered corrupted legacy resume data');
                  }
                  dispatch({ type: 'SET_RESUME', payload: repaired });
                } else {
                  console.error('Legacy resume data is corrupted and could not be repaired');
                }
              } else {
                console.error('Error parsing legacy localStorage data:', parseResult.error);
              }
            }
          }
          setIsLoading(false);
          return;
        }

        // User is logged in - check for dirty LocalStorage data first
        const { resume: dirtyResume, lastModified: dirtyLastModified } = getDirtyResumeFromLocalStorage();
        
        // Load latest resume from Supabase
        const { resume: cloudResume, lastModified: cloudLastModified } = 
          await loadLatestResumeFromSupabase(user.id);

        // Conflict detection: If LocalStorage has newer data, show conflict prompt
        if (dirtyResume && dirtyLastModified && cloudResume && cloudLastModified) {
          const dirtyTime = new Date(dirtyLastModified).getTime();
          const cloudTime = new Date(cloudLastModified).getTime();
          
          if (dirtyTime > cloudTime) {
            // LocalStorage is newer - conflict detected
            if (mounted) {
              // Show conflict prompt
              const shouldRestore = window.confirm(
                'You have unsaved changes on this device that are newer than your cloud data. ' +
                'Would you like to restore them? (Click OK to restore, Cancel to use cloud data)'
              );
              
              if (shouldRestore) {
                // Restore LocalStorage data
                dispatch({ type: 'SET_RESUME', payload: dirtyResume });
                // Try to sync it to cloud
                await saveResumeToSupabase(dirtyResume, user.id);
              } else {
                // Use cloud data
                if (cloudResume && mounted) {
                  dispatch({ type: 'SET_RESUME', payload: cloudResume });
                }
                clearDirtyFlag();
              }
            }
          } else {
            // Cloud is newer or equal - use cloud data
            if (cloudResume && mounted) {
              dispatch({ type: 'SET_RESUME', payload: cloudResume });
            }
            clearDirtyFlag();
          }
        } else if (dirtyResume && !cloudResume) {
          // Only LocalStorage has data - restore and sync
          if (mounted) {
            dispatch({ type: 'SET_RESUME', payload: dirtyResume });
            await saveResumeToSupabase(dirtyResume, user.id);
          }
        } else if (cloudResume && !dirtyResume) {
          // Only cloud has data - use it
          if (mounted) {
            dispatch({ type: 'SET_RESUME', payload: cloudResume });
          }
          clearDirtyFlag();
        } else if (!cloudResume && !dirtyResume) {
          // No data anywhere - check for current resume ID
          const currentResumeId = getCurrentResumeId();
          if (currentResumeId) {
            const loadedResume = await loadResumeFromSupabase(currentResumeId, user.id);
            if (loadedResume && mounted) {
              dispatch({ type: 'SET_RESUME', payload: loadedResume });
            }
          }
        }

        // Retry syncing any dirty data in background
        if (dirtyResume) {
          retrySyncDirtyResume(user.id).catch(console.error);
        }
      } catch (error) {
        handleError(error, 'Failed to load resume from cloud. Using local backup.');
        // Fallback to LocalStorage
        const currentResumeId = getCurrentResumeId();
        if (currentResumeId) {
          const loadedResume = await loadResume(currentResumeId);
          if (loadedResume && mounted) {
            dispatch({ type: 'SET_RESUME', payload: loadedResume });
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          isInitialMount.current = false;
        }
      }
    }

    loadResumeFromCloud();

    return () => {
      mounted = false;
    };
  }, []);

  // Keep latestStateRef in sync with state
  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  /**
   * Debounced save effect with queue system
   * 
   * This effect handles automatic saving of resume data with the following features:
   * 
   * 1. **Debouncing**: Waits 500ms after the last state change before saving to avoid
   *    excessive API calls while the user is typing.
   * 
   * 2. **Refs for Latest State**: Uses `latestStateRef` to always access the most current
   *    state value. This is critical because:
   *    - React closures in useEffect can capture stale state values
   *    - When the save timer fires, we need the absolute latest state, not the state
   *      from when the effect was set up
   *    - Without refs, rapid changes could cause us to save outdated data
   * 
   * 3. **Queue System**: Implements a save queue to prevent concurrent saves:
   *    - `isSavingRef`: Acts as a lock to prevent multiple saves from running simultaneously
   *    - `pendingSaveRef`: Flags that a save was requested while another save was in progress
   *    - `saveTrigger`: State counter that forces the effect to re-run when a queued save
   *      should be processed
   * 
   * 4. **Queue Flow**:
   *    - If a save is already in progress (`isSavingRef.current === true`), the new save
   *      request sets `pendingSaveRef.current = true` and exits
   *    - When the current save completes, it checks `pendingSaveRef` and if true, increments
   *      `saveTrigger` to re-run this effect, ensuring the latest state is saved
   *    - This guarantees that even if changes occur during a save operation, they will
   *      be captured in a subsequent save
   * 
   * 5. **Storage Strategy**: Cloud-First approach:
   *    - Attempts to save to Supabase first (if user is logged in)
   *    - Falls back to LocalStorage if Supabase save fails
   *    - Updates LocalStorage cache even after successful Supabase save for offline access
   * 
   * @dependencies state, isLoading, saveTrigger
   * @effect Triggers on state changes, but debounced by 500ms
   */
  useEffect(() => {
    // Skip save on initial mount
    if (isInitialMount.current || isLoading) {
      return;
    }

    // Clear existing timer
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      // Reset saving state when timer is cleared (user is still typing)
      setIsSaving(false);
    }

    // Set isSaving to true IMMEDIATELY for user feedback
    setIsSaving(true);

    // Set new timer to save after 500ms - debounced save (reduced from 1000ms for better responsiveness)
    saveTimeoutRef.current = setTimeout(async () => {
      /**
       * Debounced save function
       * 
       * This function is called after the debounce delay expires. It implements:
       * - Concurrent save prevention via isSavingRef lock
       * - Save queueing via pendingSaveRef flag
       * - Always uses latestStateRef to avoid stale closure issues
       */
      
      // Check if save is already in progress
      if (isSavingRef.current) {
        // Queue this save for after current one completes
        // The pendingSaveRef flag will trigger a new save cycle when current save finishes
        pendingSaveRef.current = true;
        setIsSaving(false);
        return;
      }

      // Mark save as in progress - prevents concurrent saves
      isSavingRef.current = true;

      try {
        // Always use latest state from ref to avoid stale closures
        // This ensures we save the most recent state, even if multiple changes
        // occurred during the debounce period
        const currentState = latestStateRef.current;
        
        // Validate resume data before saving
        const validation = validateResume(currentState);
        
        if (!validation.success) {
          // Validation failed - log errors and show toast
          const errorMessages = validation.errorMessages || [];
          console.error('Resume validation failed:', errorMessages);
          
          // Show user-friendly error message
          const errorSummary = errorMessages.slice(0, 3).join(', ') || 'Invalid resume data';
          const hasMoreErrors = errorMessages.length > 3;
          const errorDescription = hasMoreErrors 
            ? `${errorSummary}, and ${errorMessages.length - 3} more error(s). Please check all fields.`
            : errorSummary;
          
          toast.error('Invalid Resume Data', {
            description: errorDescription,
            duration: 6000,
          });
          
          // Do not save to Supabase - prevent database corruption
          setSaveError('Validation failed: Missing required fields');
          isSavingRef.current = false;
          setIsSaving(false);
          return;
        }

          // Validation passed - proceed with save
        const validatedState = validation.data || currentState;
        setSaveError(null);

        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Try to save to Supabase first (Cloud-First)
          const result = await saveResumeToSupabase(validatedState, user.id);
          
          if (result.success && !result.usedFallback) {
            // Successfully saved to Supabase - clear any dirty flags
            clearDirtyFlag();
            
            // Also update LocalStorage for offline access (but don't mark as dirty)
            try {
              const result = safeSetItem(
                'resume-data',
                JSON.stringify(validatedState),
                StoragePriority.CRITICAL
              );
              if (!result.success) {
                console.warn('Could not update LocalStorage cache:', result.error);
                // Don't throw - Supabase save succeeded, so this is just a cache miss
              } else {
                const currentId = getCurrentResumeId();
                if (currentId && validatedState.id) {
                  try {
                    await saveResume(validatedState);
                  } catch (saveError) {
                    // saveResume already shows toast for quota errors
                    // Just log the error - don't crash the app
                    // The resume state is still valid, user can download PDF
                    console.error('Error saving resume to storage:', saveError);
                  }
                }
              }
            } catch (localError) {
              console.error('Error updating LocalStorage cache:', localError);
            }
          } else {
            // Network failed - saved to LocalStorage as fallback (already marked as dirty)
            console.warn('Saved to LocalStorage fallback - will retry sync when online');
          }
        } else {
          // Not logged in - save to LocalStorage only
          const result = safeSetItem(
            'resume-data',
            JSON.stringify(validatedState),
            StoragePriority.CRITICAL
          );
          if (!result.success) {
            console.error('Failed to save resume to LocalStorage:', result.error);
            showErrorToUser(result.error || 'Storage error', ErrorContexts.SAVE_RESUME);
          } else {
            const currentId = getCurrentResumeId();
            if (currentId && validatedState.id) {
              try {
                await saveResume(validatedState);
              } catch (saveError) {
                // saveResume already shows toast for quota errors
                // Just log the error - don't crash the app
                // The resume state is still valid, user can download PDF
                console.error('Error saving resume to storage:', saveError);
              }
            }
          }
        }
      } catch (error) {
        handleError(error, 'Failed to save resume. Trying local storage as backup.');
        // Last resort: try LocalStorage (but still validate)
        try {
          // Use latest state from ref
          const currentState = latestStateRef.current;
          const validation = validateResume(currentState);
          if (validation.success) {
            const result = safeSetItem(
              'resume-data',
              JSON.stringify(validation.data || currentState),
              StoragePriority.CRITICAL
            );
            if (!result.success) {
              handleError(result.error || new Error('Storage error'), 'Failed to save to local storage.');
            }
          } else {
            handleError(new Error('Invalid resume data'), 'Cannot save invalid data even to local storage.');
          }
        } catch (localError) {
          handleError(localError, 'Error saving to local storage.');
        }
      } finally {
        // Release the lock
        isSavingRef.current = false;
        setIsSaving(false);
        
        // If a save was queued while we were saving, trigger it now
        // This ensures we save the latest state even if changes came in during save
        if (pendingSaveRef.current) {
          pendingSaveRef.current = false;
          // Increment trigger to force save effect to run
          setSaveTrigger(prev => prev + 1);
        }
      }
    }, 500); // Reduced to 500ms for better responsiveness

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, isLoading, saveTrigger]); // Include saveTrigger to react to queued saves

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    const newHistory = undoHistory(history);
    if (newHistory) {
      isUndoRedoRef.current = true;
      setHistory(newHistory);
      dispatch({ type: 'SET_RESUME', payload: getCurrentState(newHistory) });
    }
  }, [history]);

  const handleRedo = useCallback(() => {
    const newHistory = redoHistory(history);
    if (newHistory) {
      isUndoRedoRef.current = true;
      setHistory(newHistory);
      dispatch({ type: 'SET_RESUME', payload: getCurrentState(newHistory) });
    }
  }, [history]);

  // Clear history when resume is loaded/reset (but not from undo/redo)
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    // Only clear history on explicit SET_RESUME actions (not from undo/redo)
    if (!isUndoRedoRef.current) {
      setHistory(clearHistory(state));
    }
  }, [state.id]); // Clear history when switching resumes

  // Memoize context value to ensure re-renders when isSaving changes
  const contextValue: ResumeContextState = useMemo(() => ({
    state,
    dispatch,
    isSaving,
    saveError,
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    undo: handleUndo,
    redo: handleRedo,
  }), [state, dispatch, isSaving, saveError, history, handleUndo, handleRedo]);

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
}

// Custom hook
export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}

