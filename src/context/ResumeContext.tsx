import React, { createContext, useContext, useReducer, useEffect, useRef, useState, ReactNode } from 'react';
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

// Action types
type ResumeAction =
  | { type: 'SET_RESUME'; payload: ResumeData }
  | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<FormattingSettings> }
  | { type: 'UPDATE_TARGET_JOB'; payload: Partial<TargetJob> }
  | { type: 'UPDATE_ATS_SCORE'; payload: number }
  | { type: 'ADD_SECTION'; payload: ResumeSection }
  | { type: 'REMOVE_SECTION'; payload: string } // section id
  | { type: 'UPDATE_SECTION'; payload: { id: string; updates: Partial<ResumeSection> } }
  | { type: 'ADD_SECTION_ITEM'; payload: { sectionId: string; item: ResumeSection['items'][0] } }
  | { type: 'REMOVE_SECTION_ITEM'; payload: { sectionId: string; itemId: string } }
  | { type: 'UPDATE_SECTION_ITEM'; payload: { sectionId: string; itemId: string; data: Partial<ResumeSection['items'][0]> } }
  | { type: 'RESET_RESUME' }
  | { type: 'TOGGLE_AI_SIDEBAR' }
  | { type: 'SET_FOCUSED_SECTION'; payload: string | null };

// Context state type
interface ResumeContextState {
  state: ResumeData;
  dispatch: React.Dispatch<ResumeAction>;
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

    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        personalInfo: {
          ...state.personalInfo,
          ...action.payload,
        },
        updatedAt: new Date().toISOString(),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
        updatedAt: new Date().toISOString(),
      };

    case 'UPDATE_TARGET_JOB':
      return {
        ...state,
        targetJob: {
          ...state.targetJob,
          ...action.payload,
        },
        updatedAt: new Date().toISOString(),
      };

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

    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.id
            ? { ...section, ...action.payload.updates }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };

    case 'ADD_SECTION_ITEM':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? { ...section, items: [...section.items, action.payload.item] }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };

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

    case 'UPDATE_SECTION_ITEM':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === action.payload.itemId
                    ? { ...item, ...action.payload.data }
                    : item
                ),
              }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };

    case 'TOGGLE_AI_SIDEBAR':
      return {
        ...state,
        isAISidebarOpen: !state.isAISidebarOpen,
      };

    case 'SET_FOCUSED_SECTION':
      return {
        ...state,
        focusedSectionId: action.payload,
      };

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
  const [isLoading, setIsLoading] = useState(true);
  const [hasConflict, setHasConflict] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

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
            const loadedResume = loadResume(currentResumeId);
            if (loadedResume && mounted) {
              dispatch({ type: 'SET_RESUME', payload: loadedResume });
            }
          } else {
            // Try legacy localStorage
            const storedData = localStorage.getItem('resume-data');
            if (storedData && mounted) {
              try {
                const parsed = JSON.parse(storedData);
                dispatch({ type: 'SET_RESUME', payload: parsed });
              } catch (e) {
                console.error('Error parsing legacy localStorage data:', e);
              }
            }
          }
          setIsLoading(false);
          return;
        }

        // User is logged in - check for dirty LocalStorage data first
        const { resume: dirtyResume, lastModified: dirtyLastModified } = getDirtyResumeFromLocalStorage();
        
        // Load latest resume from Supabase
        const { resume: cloudResume, resumeId, lastModified: cloudLastModified } = 
          await loadLatestResumeFromSupabase(user.id);

        // Conflict detection: If LocalStorage has newer data, show conflict prompt
        if (dirtyResume && dirtyLastModified && cloudResume && cloudLastModified) {
          const dirtyTime = new Date(dirtyLastModified).getTime();
          const cloudTime = new Date(cloudLastModified).getTime();
          
          if (dirtyTime > cloudTime) {
            // LocalStorage is newer - conflict detected
            if (mounted) {
              setHasConflict(true);
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
              setHasConflict(false);
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
          const loadedResume = loadResume(currentResumeId);
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
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer to save after 500ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Validate resume data before saving
        const validation = validateResume(state);
        
        if (!validation.success) {
          // Validation failed - log errors and show alert
          console.error('Resume validation failed:', validation.errorMessages);
          
          // Show user-friendly error message
          const errorSummary = validation.errorMessages?.slice(0, 3).join('\n') || 'Invalid resume data';
          alert(`Please fix errors before saving:\n\n${errorSummary}${validation.errorMessages && validation.errorMessages.length > 3 ? '\n...and more' : ''}`);
          
          // Do not save to Supabase - prevent database corruption
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
              localStorage.setItem('resume-data', JSON.stringify(validatedState));
              const currentId = getCurrentResumeId();
              if (currentId && validatedState.id) {
                saveResume(validatedState);
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
          localStorage.setItem('resume-data', JSON.stringify(validatedState));
          const currentId = getCurrentResumeId();
          if (currentId && validatedState.id) {
            saveResume(validatedState);
          }
        }
      } catch (error) {
        console.error('Error saving resume data:', error);
        // Last resort: try LocalStorage (but still validate)
        try {
          const validation = validateResume(state);
          if (validation.success) {
            localStorage.setItem('resume-data', JSON.stringify(validation.data || state));
          } else {
            console.error('Cannot save invalid data even to LocalStorage');
          }
        } catch (localError) {
          console.error('Error saving to LocalStorage:', localError);
        }
      }
    }, 500);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state, isLoading]);

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
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

