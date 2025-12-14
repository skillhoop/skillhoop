import React, { createContext, useContext, useReducer, useEffect, useRef, useState, useMemo, useCallback, ReactNode } from 'react';
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
  canUndo: boolean; // Whether undo is available
  canRedo: boolean; // Whether redo is available
  undo: () => void; // Undo function
  redo: () => void; // Redo function
}

// Create context
const ResumeContext = createContext<ResumeContextState | undefined>(undefined);

// Helper function to get initial state (will be replaced by async loading)
function getInitialState(): ResumeData {
  return INITIAL_RESUME_STATE;
}

// Reducer function
function resumeReducer(state: ResumeData, action: ResumeAction): ResumeData {
  switch (action.type) {
    case 'SET_RESUME':
      return action.payload;

    case 'RESET_RESUME':
      localStorage.removeItem('resume-data');
      return INITIAL_RESUME_STATE;

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
  const [state, dispatch] = useReducer(resumeReducer, initialData || getInitialState());
  const [history, setHistory] = useState<HistoryState>(() => 
    createHistoryState(initialData || getInitialState())
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const isUndoRedoRef = useRef(false);

  // Clean up old versions on mount (run once per session)
  useEffect(() => {
    // Run cleanup in background (non-blocking)
    const result = cleanupVersionHistory();
    if (result.removed > 0) {
      console.log(`Cleaned up ${result.removed} old version(s) on app load`);
    }
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
                  console.log('Migrating legacy resume data from localStorage');
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
        console.error('Error loading resume from cloud:', error);
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

  // Save to Supabase whenever state changes (with debouncing)
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

    // Set new timer to save after 1000ms (1 second) - debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      console.log('ResumeContext: Starting save, isSaving is already true');
      try {
        // Validate resume data before saving
        const validation = validateResume(state);
        
        if (!validation.success) {
          // Validation failed - log errors and show alert
          console.error('Resume validation failed:', validation.errorMessages);
          
          // Show user-friendly error message
          const errorSummary = validation.errorMessages?.slice(0, 3).join('\n') || 'Invalid resume data';
          const errorMessage = `Invalid Resume Data\n\nPlease fix the following errors before saving:\n\n${errorSummary}${validation.errorMessages && validation.errorMessages.length > 3 ? '\n\n...and more errors. Please check all fields.' : ''}\n\nReview the highlighted fields and correct any issues.`;
          alert(errorMessage);
          
          // Do not save to Supabase - prevent database corruption
          setIsSaving(false);
          return;
        }

        // Validation passed - proceed with save
        const validatedState = validation.data || state;

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
                  await saveResume(validatedState);
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
              await saveResume(validatedState);
            }
          }
        }
      } catch (error) {
        console.error('Error saving resume data:', error);
        // Last resort: try LocalStorage (but still validate)
        try {
          const validation = validateResume(state);
          if (validation.success) {
            const result = safeSetItem(
              'resume-data',
              JSON.stringify(validation.data || state),
              StoragePriority.CRITICAL
            );
            if (!result.success) {
              console.error('Failed to save to LocalStorage:', result.error);
              showErrorToUser(result.error || 'Storage error', ErrorContexts.SAVE_RESUME);
            }
          } else {
            console.error('Cannot save invalid data even to LocalStorage');
          }
        } catch (localError) {
          console.error('Error saving to LocalStorage:', localError);
        }
      } finally {
        setIsSaving(false);
        console.log('ResumeContext: Save completed, isSaving set to false');
      }
    }, 1000); // Increased to 1000ms (1 second) for better performance

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, isLoading]);

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
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    undo: handleUndo,
    redo: handleRedo,
  }), [state, dispatch, isSaving, history, handleUndo, handleRedo]);

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

