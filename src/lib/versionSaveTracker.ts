/**
 * Version Save Failure Tracker
 * Tracks and reports version history save failures to users
 */

const FAILURE_STORAGE_KEY = 'version_save_failures';
const MAX_FAILURES_TO_TRACK = 10;

export interface VersionSaveFailure {
  resumeId: string;
  error: string;
  timestamp: string;
  retried: boolean;
}

/**
 * Track a version save failure
 */
export function trackVersionSaveFailure(
  resumeId: string,
  error: string,
  retried: boolean = false
): void {
  try {
    const failures = getVersionSaveFailures();
    const newFailure: VersionSaveFailure = {
      resumeId,
      error,
      timestamp: new Date().toISOString(),
      retried,
    };
    
    failures.push(newFailure);
    
    // Keep only the most recent failures
    if (failures.length > MAX_FAILURES_TO_TRACK) {
      failures.shift();
    }
    
    localStorage.setItem(FAILURE_STORAGE_KEY, JSON.stringify(failures));
  } catch (error) {
    console.error('Error tracking version save failure:', error);
  }
}

/**
 * Get all tracked version save failures
 */
export function getVersionSaveFailures(): VersionSaveFailure[] {
  try {
    const stored = localStorage.getItem(FAILURE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading version save failures:', error);
  }
  return [];
}

/**
 * Clear tracked failures for a specific resume
 */
export function clearFailuresForResume(resumeId: string): void {
  try {
    const failures = getVersionSaveFailures();
    const filtered = failures.filter(f => f.resumeId !== resumeId);
    localStorage.setItem(FAILURE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error clearing failures:', error);
  }
}

/**
 * Clear all tracked failures
 */
export function clearAllFailures(): void {
  try {
    localStorage.removeItem(FAILURE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing all failures:', error);
  }
}

/**
 * Get failure count for a resume
 */
export function getFailureCount(resumeId: string): number {
  const failures = getVersionSaveFailures();
  return failures.filter(f => f.resumeId === resumeId).length;
}

/**
 * Check if there are recent failures that should be shown to user
 */
export function hasRecentFailures(resumeId: string, withinMinutes: number = 5): boolean {
  const failures = getVersionSaveFailures();
  const now = Date.now();
  const threshold = now - (withinMinutes * 60 * 1000);
  
  return failures.some(f => 
    f.resumeId === resumeId && 
    new Date(f.timestamp).getTime() > threshold
  );
}



