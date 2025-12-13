/**
 * Resume Storage Service
 * Manages saving, loading, and organizing multiple resumes
 * Note: This is now a fallback/cache layer. Primary storage is Supabase.
 */

import { ResumeData } from '../types/resume';
import { saveVersion } from './resumeVersionHistory';

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
 * Get all saved resumes
 */
export function getAllSavedResumes(): SavedResume[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading saved resumes:', error);
  }
  return [];
}

/**
 * Save a resume
 */
export function saveResume(resume: ResumeData, title?: string): string {
  try {
    const resumes = getAllSavedResumes();
    const resumeId = resume.id || generateResumeId();
    const resumeTitle = title || resume.title || 'Untitled Resume';
    
    const savedResume: SavedResume = {
      id: resumeId,
      title: resumeTitle,
      data: {
        ...resume,
        id: resumeId,
        title: resumeTitle,
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredResumes));
    setCurrentResumeId(resumeId);
    
    // Save version history
    try {
      const isUpdate = resume.id && resumes.find(r => r.id === resume.id);
      saveVersion(resumeId, savedResume.data, {
        createdBy: isUpdate ? 'manual' : 'initial',
        changeSummary: isUpdate ? 'Resume updated' : 'Resume created',
      });
    } catch (error) {
      console.error('Error saving version history:', error);
      // Don't fail the save if version history fails
    }
    
    return resumeId;
  } catch (error) {
    console.error('Error saving resume:', error);
    throw new Error('Failed to save resume');
  }
}

/**
 * Load a resume by ID
 */
export function loadResume(id: string): ResumeData | null {
  try {
    const resumes = getAllSavedResumes();
    const savedResume = resumes.find(r => r.id === id);
    
    if (savedResume) {
      setCurrentResumeId(id);
      return savedResume.data;
    }
  } catch (error) {
    console.error('Error loading resume:', error);
  }
  return null;
}

/**
 * Delete a resume
 */
export function deleteResume(id: string): boolean {
  try {
    const resumes = getAllSavedResumes();
    const filteredResumes = resumes.filter(r => r.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredResumes));
    
    // Clear current resume if it was deleted
    const currentId = getCurrentResumeId();
    if (currentId === id) {
      clearCurrentResumeId();
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    return false;
  }
}

/**
 * Duplicate a resume
 */
export function duplicateResume(id: string, newTitle?: string): string | null {
  try {
    const resumes = getAllSavedResumes();
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResumes));
    
    return newId;
  } catch (error) {
    console.error('Error duplicating resume:', error);
    return null;
  }
}

/**
 * Rename a resume
 */
export function renameResume(id: string, newTitle: string): boolean {
  try {
    const resumes = getAllSavedResumes();
    const resumeIndex = resumes.findIndex(r => r.id === id);
    
    if (resumeIndex === -1) {
      return false;
    }

    resumes[resumeIndex].title = newTitle;
    resumes[resumeIndex].data.title = newTitle;
    resumes[resumeIndex].updatedAt = new Date().toISOString();
    resumes[resumeIndex].data.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    
    return true;
  } catch (error) {
    console.error('Error renaming resume:', error);
    return false;
  }
}

/**
 * Get current resume ID
 */
export function getCurrentResumeId(): string | null {
  try {
    return localStorage.getItem(CURRENT_RESUME_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Set current resume ID
 */
export function setCurrentResumeId(id: string): void {
  try {
    localStorage.setItem(CURRENT_RESUME_KEY, id);
  } catch (error) {
    console.error('Error setting current resume ID:', error);
  }
}

/**
 * Clear current resume ID
 */
export function clearCurrentResumeId(): void {
  try {
    localStorage.removeItem(CURRENT_RESUME_KEY);
  } catch (error) {
    console.error('Error clearing current resume ID:', error);
  }
}

/**
 * Get resume count
 */
export function getResumeCount(): number {
  return getAllSavedResumes().length;
}

/**
 * Search resumes by title or tags
 */
export function searchResumes(query: string): SavedResume[] {
  const resumes = getAllSavedResumes();
  const lowerQuery = query.toLowerCase();
  
  return resumes.filter(resume => 
    resume.title.toLowerCase().includes(lowerQuery) ||
    resume.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

