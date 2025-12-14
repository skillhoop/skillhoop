/**
 * LocalStorage Quota Management Utility
 * Handles QuotaExceededError gracefully by attempting to free space
 * and providing user-friendly error messages
 */

export interface StorageResult {
  success: boolean;
  error?: string;
  freedSpace?: boolean;
}

/**
 * Storage priority levels for cleanup
 * Lower priority items are removed first when quota is exceeded
 */
export enum StoragePriority {
  CRITICAL = 1, // Current resume data, user settings
  HIGH = 2, // Recent version history, recent analytics
  MEDIUM = 3, // Older version history, older analytics
  LOW = 4, // Cached data, old parsed resumes
  VERY_LOW = 5, // Temporary data, old workflow data
}

/**
 * Storage keys organized by priority for cleanup
 */
const STORAGE_PRIORITY_MAP: Record<string, StoragePriority> = {
  // CRITICAL - Never delete these
  'smart_resume_studio_current_resume_id': StoragePriority.CRITICAL,
  'resume-data': StoragePriority.CRITICAL,
  'resume_dirty_flag': StoragePriority.CRITICAL,
  'resume_dirty_data': StoragePriority.CRITICAL,
  'resume_last_modified': StoragePriority.CRITICAL,
  'darkMode': StoragePriority.CRITICAL,
  
  // HIGH - Recent important data
  'smart_resume_studio_resumes': StoragePriority.HIGH,
  'resume_version_history': StoragePriority.HIGH,
  'resume_analytics_history': StoragePriority.HIGH,
  
  // MEDIUM - Older but still useful
  'resume_shareable_links': StoragePriority.MEDIUM,
  'interview_prep_sessions': StoragePriority.MEDIUM,
  'tracked_jobs': StoragePriority.MEDIUM,
  
  // LOW - Cached/parsed data
  'parsed_resumes': StoragePriority.LOW,
  'linkedin_profile': StoragePriority.LOW,
  'content_history': StoragePriority.LOW,
  
  // VERY_LOW - Temporary/workflow data
  'workflow_context': StoragePriority.VERY_LOW,
  'dismissed_workflow_suggestions': StoragePriority.VERY_LOW,
  'hasSeenTour': StoragePriority.VERY_LOW,
};

/**
 * Estimate the size of a value in bytes
 */
function estimateSize(value: string): number {
  return new Blob([value]).size;
}

/**
 * Get total size of localStorage in bytes
 */
export function getLocalStorageSize(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      total += estimateSize(key + value);
    }
  }
  return total;
}

/**
 * Get available localStorage quota (approximate)
 */
export async function getAvailableQuota(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota && estimate.usage) {
        return estimate.quota - estimate.usage;
      }
    } catch (error) {
      console.warn('Could not estimate storage quota:', error);
    }
  }
  // Fallback: assume 5MB quota (typical browser limit)
  return 5 * 1024 * 1024 - getLocalStorageSize();
}

/**
 * Free up space by removing low-priority items
 * @param targetBytes - Target bytes to free (optional, defaults to 1MB)
 * @returns Number of bytes freed
 */
function freeUpSpace(targetBytes: number = 1024 * 1024): number {
  let freedBytes = 0;
  const itemsToRemove: string[] = [];
  
  // Collect items sorted by priority (lowest first)
  const items: Array<{ key: string; priority: StoragePriority; size: number }> = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    const value = localStorage.getItem(key) || '';
    const size = estimateSize(key + value);
    const priority = STORAGE_PRIORITY_MAP[key] || StoragePriority.MEDIUM;
    
    // Never remove CRITICAL items
    if (priority === StoragePriority.CRITICAL) continue;
    
    items.push({ key, priority, size });
  }
  
  // Sort by priority (lowest first), then by size (largest first)
  items.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.size - a.size;
  });
  
  // Remove items until we've freed enough space
  for (const item of items) {
    if (freedBytes >= targetBytes) break;
    
    itemsToRemove.push(item.key);
    freedBytes += item.size;
  }
  
  // Actually remove the items
  for (const key of itemsToRemove) {
    try {
      localStorage.removeItem(key);
      console.log(`Freed space by removing: ${key}`);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }
  
  return freedBytes;
}

/**
 * Safely set an item in localStorage with quota error handling
 * @param key - Storage key
 * @param value - Value to store
 * @param priority - Priority level (defaults to MEDIUM)
 * @param retryWithCleanup - Whether to retry after cleanup if quota exceeded (default: true)
 * @returns StorageResult indicating success or failure
 */
export function safeSetItem(
  key: string,
  value: string,
  priority: StoragePriority = StoragePriority.MEDIUM,
  retryWithCleanup: boolean = true
): StorageResult {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (error) {
    // Check if it's a quota error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(`QuotaExceededError for key: ${key}`);
      
      // If this is a critical item, try to free space
      if (priority === StoragePriority.CRITICAL && retryWithCleanup) {
        const freedBytes = freeUpSpace();
        
        if (freedBytes > 0) {
          // Retry after cleanup
          try {
            localStorage.setItem(key, value);
            return { success: true, freedSpace: true };
          } catch (retryError) {
            // Still failed after cleanup
            return {
              success: false,
              error: 'Storage is full. Please delete some old resumes or clear your browser cache.',
            };
          }
        } else {
          // Couldn't free any space
          return {
            success: false,
            error: 'Storage is full and cannot be freed. Please delete some old resumes or clear your browser cache.',
          };
        }
      } else {
        // Non-critical item - just fail gracefully
        return {
          success: false,
          error: 'Storage is full. Some non-essential data could not be saved.',
        };
      }
    }
    
    // Other errors (e.g., security errors)
    return {
      success: false,
      error: `Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Safely get an item from localStorage
 * @param key - Storage key
 * @returns The value or null if not found/error
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Safely remove an item from localStorage
 * @param key - Storage key
 * @returns true if successful, false otherwise
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all non-critical items from localStorage
 * @returns Number of items removed
 */
export function clearNonCriticalData(): number {
  let removed = 0;
  const keysToRemove: string[] = [];
  
  // Collect all non-critical keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    const priority = STORAGE_PRIORITY_MAP[key] || StoragePriority.MEDIUM;
    if (priority !== StoragePriority.CRITICAL) {
      keysToRemove.push(key);
    }
  }
  
  // Remove them
  for (const key of keysToRemove) {
    if (safeRemoveItem(key)) {
      removed++;
    }
  }
  
  return removed;
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
  totalSize: number;
  itemCount: number;
  byPriority: Record<StoragePriority, { count: number; size: number }>;
} {
  const stats = {
    totalSize: 0,
    itemCount: 0,
    byPriority: {
      [StoragePriority.CRITICAL]: { count: 0, size: 0 },
      [StoragePriority.HIGH]: { count: 0, size: 0 },
      [StoragePriority.MEDIUM]: { count: 0, size: 0 },
      [StoragePriority.LOW]: { count: 0, size: 0 },
      [StoragePriority.VERY_LOW]: { count: 0, size: 0 },
    },
  };
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    const value = localStorage.getItem(key) || '';
    const size = estimateSize(key + value);
    const priority = STORAGE_PRIORITY_MAP[key] || StoragePriority.MEDIUM;
    
    stats.totalSize += size;
    stats.itemCount++;
    stats.byPriority[priority].count++;
    stats.byPriority[priority].size += size;
  }
  
  return stats;
}



