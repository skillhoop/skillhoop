/**
 * AI Result Caching Utility
 * Caches AI analysis results to avoid redundant API calls
 */

interface CachedResult<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const CACHE_PREFIX = 'ai_result_cache_';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_SIZE = 50; // Maximum number of cached items

/**
 * Generate a cache key from input data
 */
export function generateCacheKey(prefix: string, ...inputs: (string | object | undefined)[]): string {
  // Create a normalized string from inputs
  const normalized = inputs
    .filter(Boolean)
    .map(input => {
      if (typeof input === 'string') {
        return input.trim();
      }
      if (typeof input === 'object' && input !== null) {
        // Sort object keys for consistent hashing
        return JSON.stringify(input, Object.keys(input).sort());
      }
      return String(input);
    })
    .join('|');

  // Simple hash function (djb2 algorithm)
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) + hash) + normalized.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `${CACHE_PREFIX}${prefix}_${Math.abs(hash).toString(36)}`;
}

/**
 * Get cached result if available and not expired
 */
export function getCachedResult<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed: CachedResult<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if expired
    if (now > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('Error reading cache:', error);
    // If cache is corrupted, remove it
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignore removal errors
    }
    return null;
  }
}

/**
 * Store result in cache
 */
export function setCachedResult<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  try {
    const now = Date.now();
    const cached: CachedResult<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };

    // Clean up old cache entries if we're approaching the limit
    cleanupCache();

    localStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    // If storage quota is exceeded, try to clean up and retry
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Cache storage quota exceeded, cleaning up...');
      cleanupCache(true); // Aggressive cleanup
      try {
        localStorage.setItem(key, JSON.stringify({
          data,
          timestamp: Date.now(),
          expiresAt: Date.now() + ttl,
        }));
      } catch (retryError) {
        console.error('Failed to cache result after cleanup:', retryError);
        // Don't throw - caching is optional
      }
    } else {
      console.error('Error caching result:', error);
      // Don't throw - caching is optional
    }
  }
}

/**
 * Remove a specific cached result
 */
export function removeCachedResult(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing cache:', error);
  }
}

/**
 * Clear all AI result caches
 */
export function clearAllCaches(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
}

/**
 * Clean up expired and old cache entries
 */
function cleanupCache(aggressive: boolean = false): void {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    if (cacheKeys.length < MAX_CACHE_SIZE && !aggressive) {
      return; // No cleanup needed
    }

    const now = Date.now();
    const entries: Array<{ key: string; timestamp: number }> = [];

    // Collect all cache entries with their timestamps
    for (const key of cacheKeys) {
      try {
        const cached = localStorage.getItem(key);
        if (!cached) continue;

        const parsed = JSON.parse(cached);
        
        // Remove expired entries
        if (now > parsed.expiresAt) {
          localStorage.removeItem(key);
          continue;
        }

        entries.push({ key, timestamp: parsed.timestamp });
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(key);
      }
    }

    // If still over limit, remove oldest entries
    if (entries.length >= MAX_CACHE_SIZE || aggressive) {
      entries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = aggressive 
        ? Math.max(0, entries.length - Math.floor(MAX_CACHE_SIZE / 2)) // Remove half if aggressive
        : entries.length - MAX_CACHE_SIZE + 10; // Keep 10 below limit

      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(entries[i].key);
      }
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  expiredEntries: number;
  totalSize: number;
} {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const key of cacheKeys) {
      try {
        const cached = localStorage.getItem(key);
        if (!cached) continue;

        totalSize += cached.length;
        const parsed = JSON.parse(cached);
        
        if (now > parsed.expiresAt) {
          expiredCount++;
        }
      } catch (error) {
        // Ignore corrupted entries
      }
    }

    return {
      totalEntries: cacheKeys.length,
      expiredEntries: expiredCount,
      totalSize,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalEntries: 0, expiredEntries: 0, totalSize: 0 };
  }
}

/**
 * Wrapper function to cache AI results
 */
export async function withCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = getCachedResult<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }
  // Fetch fresh data
  const result = await fetchFn();
  
  // Cache the result
  setCachedResult(cacheKey, result, ttl);
  
  return result;
}


