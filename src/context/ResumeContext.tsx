import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { ResumeData, PersonalInfo, FormattingSettings, ResumeSection, TargetJob, INITIAL_RESUME_STATE } from '../types/resume';

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
  | { type: 'TOGGLE_AI_SIDEBAR' };

// Context state type
interface ResumeContextState {
  state: ResumeData;
  dispatch: React.Dispatch<ResumeAction>;
}

// Create context
const ResumeContext = createContext<ResumeContextState | undefined>(undefined);

// Helper function to get initial state from localStorage
function getInitialState(): ResumeData {
  try {
    const storedData = localStorage.getItem('resume-data');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading resume data from localStorage:', error);
  }
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
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage whenever state changes (with debouncing)
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer to save after 500ms
    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem('resume-data', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving resume data to localStorage:', error);
      }
    }, 500);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state]);

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

