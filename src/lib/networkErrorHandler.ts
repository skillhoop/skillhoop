/**
 * Network Error Handling Utility
 * Provides comprehensive error handling for network requests including:
 * - Retry logic for transient failures
 * - Timeout handling
 * - Offline detection
 * - User-friendly error messages
 */

import { toast } from 'sonner';
import { getUserFriendlyError, type UserFriendlyError } from './errorMessages';

export interface NetworkError extends Error {
  type: 'network' | 'timeout' | 'offline' | 'server' | 'client' | 'rate_limit' | 'unknown';
  statusCode?: number;
  retryable: boolean;
  originalError?: Error;
  retryAfter?: number; // Seconds to wait before retrying (from Retry-After header)
  rateLimitInfo?: {
    limit?: number;
    remaining?: number;
    reset?: number; // Unix timestamp when rate limit resets
  };
}

export interface FetchOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds (default: 30000)
  retries?: number; // Number of retry attempts (default: 3)
  retryDelay?: number; // Delay between retries in milliseconds (default: 1000)
  retryCondition?: (error: NetworkError) => boolean; // Custom retry condition
  rateLimitDelay?: number; // Minimum delay between requests in milliseconds (default: 0)
  deduplicate?: boolean; // Whether to deduplicate identical requests (default: false)
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // Assume online if we can't detect
}

/**
 * Create a network error from various error types
 */
export function createNetworkError(error: unknown, response?: Response): NetworkError {
  // Handle fetch errors (network failures, CORS, etc.)
  if (error instanceof TypeError) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      if (!isOnline()) {
        return {
          name: 'NetworkError',
          message: 'You are currently offline. Please check your internet connection.',
          type: 'offline',
          retryable: true,
          originalError: error,
        };
      }
      return {
        name: 'NetworkError',
        message: 'Network request failed. Please check your internet connection.',
        type: 'network',
        retryable: true,
        originalError: error,
      };
    }
    if (error.message.includes('timeout') || error.message.includes('aborted')) {
      return {
        name: 'TimeoutError',
        message: 'Request timed out. The server may be slow or unavailable.',
        type: 'timeout',
        retryable: true,
        originalError: error,
      };
    }
  }

  // Handle Response errors
  if (response) {
    const statusCode = response.status;
    if (statusCode >= 500) {
      return {
        name: 'ServerError',
        message: `Server error (${statusCode}). The server may be temporarily unavailable.`,
        type: 'server',
        statusCode,
        retryable: true,
      };
    }
    if (statusCode === 408 || statusCode === 504) {
      return {
        name: 'TimeoutError',
        message: 'Request timed out. Please try again.',
        type: 'timeout',
        statusCode,
        retryable: true,
      };
    }
    if (statusCode === 429) {
      const retryAfter = parseRetryAfter(response);
      const rateLimitInfo = parseRateLimitHeaders(response);
      return {
        name: 'RateLimitError',
        message: 'Too many requests. Please wait before trying again.',
        type: 'rate_limit',
        statusCode,
        retryable: true,
        retryAfter,
        rateLimitInfo,
      };
    }
    if (statusCode >= 400 && statusCode < 500) {
      return {
        name: 'ClientError',
        message: `Request failed (${statusCode}). Please check your input and try again.`,
        type: 'client',
        statusCode,
        retryable: statusCode === 408, // Only 408 (Request Timeout) is retryable
      };
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      type: 'unknown',
      retryable: false,
      originalError: error,
    };
  }

  return {
    name: 'UnknownError',
    message: 'An unknown network error occurred.',
    type: 'unknown',
    retryable: false,
  };
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse rate limit headers from response
 */
function parseRateLimitHeaders(response: Response): NetworkError['rateLimitInfo'] {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  return {
    limit: limit ? parseInt(limit, 10) : undefined,
    remaining: remaining ? parseInt(remaining, 10) : undefined,
    reset: reset ? parseInt(reset, 10) : undefined,
  };
}

/**
 * Parse Retry-After header
 */
function parseRetryAfter(response: Response): number | undefined {
  const retryAfter = response.headers.get('Retry-After');
  if (!retryAfter) return undefined;
  
  // Retry-After can be either seconds (number) or HTTP date
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds;
  }
  
  // Try parsing as HTTP date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.ceil((date.getTime() - Date.now()) / 1000);
  }
  
  return undefined;
}

/**
 * Request queue for rate limiting
 */
interface QueuedRequest {
  url: string;
  options: FetchOptions;
  resolve: (value: Response) => void;
  reject: (error: NetworkError) => void;
  timestamp: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private minDelay = 0;

  setMinDelay(ms: number): void {
    this.minDelay = ms;
  }

  async enqueue(
    url: string,
    options: FetchOptions
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        url,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      
      // Enforce minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelay) {
        await sleep(this.minDelay - timeSinceLastRequest);
      }

      try {
        // Use fetchWithRetry to maintain retry logic, but without rate limit delay to avoid recursion
        const response = await fetchWithRetry(request.url, {
          ...request.options,
          rateLimitDelay: 0, // Prevent double queuing
        });
        this.lastRequestTime = Date.now();
        request.resolve(response);
      } catch (error) {
        request.reject(error instanceof Error && 'type' in error ? error as NetworkError : createNetworkError(error));
      }
    }

    this.processing = false;
  }

  clear(): void {
    this.queue.forEach(req => {
      req.reject(createNetworkError(new Error('Request queue cleared')));
    });
    this.queue = [];
  }
}

// Global request queue instance
const requestQueue = new RequestQueue();

/**
 * Request deduplication cache
 */
interface CachedRequest {
  promise: Promise<Response>;
  timestamp: number;
}

const requestCache = new Map<string, CachedRequest>();
const CACHE_TTL = 5000; // 5 seconds cache for deduplication

function getCacheKey(url: string, options: FetchOptions): string {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${url}:${body}`;
}

function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, cached] of requestCache.entries()) {
    if (now - cached.timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
}

/**
 * Enhanced fetch with retry, timeout, and error handling
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = 30000, // 30 seconds default
    retries = 3,
    retryDelay = 1000, // 1 second default
    retryCondition,
    rateLimitDelay = 0, // No delay by default
    deduplicate = false,
    ...fetchOptions
  } = options;

  // Check if offline
  if (!isOnline()) {
    throw createNetworkError(new Error('Offline'), undefined);
  }

  // Handle request deduplication
  if (deduplicate) {
    clearExpiredCache();
    const cacheKey = getCacheKey(url, { ...fetchOptions, method: fetchOptions.method || 'GET' });
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.promise;
    }
  }

  // Handle rate limiting with queue
  if (rateLimitDelay > 0) {
    requestQueue.setMinDelay(rateLimitDelay);
    return requestQueue.enqueue(url, { ...options, rateLimitDelay: 0 }); // Prevent double queuing
  }

  let lastError: NetworkError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check if response is ok
        if (!response.ok) {
          const networkError = createNetworkError(null, response);
          
          // Handle rate limiting with retry-after
          if (networkError.type === 'rate_limit' && networkError.retryAfter) {
            if (attempt < retries) {
              lastError = networkError;
              // Use retry-after if provided, otherwise use exponential backoff
              const delay = networkError.retryAfter * 1000; // Convert to milliseconds
              await sleep(delay);
              continue;
            }
          }
          
          // Check if we should retry
          if (attempt < retries && networkError.retryable) {
            const shouldRetry = retryCondition 
              ? retryCondition(networkError)
              : networkError.retryable;
            
            if (shouldRetry) {
              lastError = networkError;
              // For rate limits, use longer delay
              const delay = networkError.type === 'rate_limit' 
                ? (networkError.retryAfter ? networkError.retryAfter * 1000 : retryDelay * Math.pow(2, attempt + 1))
                : retryDelay * (attempt + 1); // Exponential backoff
              await sleep(delay);
              continue;
            }
          }
          
          throw networkError;
        }

        // Cache successful response for deduplication
        if (deduplicate) {
          const cacheKey = getCacheKey(url, { ...fetchOptions, method: fetchOptions.method || 'GET' });
          requestCache.set(cacheKey, {
            promise: Promise.resolve(response.clone()), // Clone for caching
            timestamp: Date.now(),
          });
        }

        return response;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Handle abort (timeout)
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          const timeoutError = createNetworkError(
            new Error('Request timeout'),
            undefined
          );
          
          if (attempt < retries) {
            lastError = timeoutError;
            await sleep(retryDelay * (attempt + 1));
            continue;
          }
          
          throw timeoutError;
        }
        
        // Handle other fetch errors
        const networkError = createNetworkError(fetchError);
        
        if (attempt < retries && networkError.retryable) {
          const shouldRetry = retryCondition 
            ? retryCondition(networkError)
            : networkError.retryable;
          
          if (shouldRetry) {
            lastError = networkError;
            await sleep(retryDelay * (attempt + 1));
            continue;
          }
        }
        
        throw networkError;
      }
    } catch (error) {
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        if (error instanceof Error && 'type' in error) {
          throw error; // Already a NetworkError
        }
        throw createNetworkError(error);
      }
      
      // Store error for retry
      if (error instanceof Error && 'type' in error) {
        lastError = error as NetworkError;
      } else {
        lastError = createNetworkError(error);
      }
      
      // Wait before retrying
      await sleep(retryDelay * (attempt + 1));
    }
  }

  // If we get here, all retries failed
  throw lastError || createNetworkError(new Error('All retry attempts failed'));
}

/**
 * Enhanced fetch for API calls with JSON handling
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions & { body?: unknown } = {}
): Promise<T> {
  const { body, ...fetchOptions } = options;

  // Prepare request body
  const requestBody = body ? JSON.stringify(body) : undefined;
  const headers = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  try {
    const response = await fetchWithRetry(url, {
      ...fetchOptions,
      method: fetchOptions.method || 'POST',
      headers,
      body: requestBody,
    });

    // Parse JSON response
    const data = await response.json().catch(() => {
      throw createNetworkError(
        new Error('Invalid JSON response from server'),
        response
      );
    });

    // Check for error in response
    if (data.error) {
      throw createNetworkError(
        new Error(data.error),
        response
      );
    }

    return data;
  } catch (error) {
    // Re-throw network errors as-is
    if (error instanceof Error && 'type' in error) {
      throw error;
    }
    
    // Convert unknown errors to network errors
    throw createNetworkError(error);
  }
}

/**
 * Get user-friendly error message for network errors
 */
export function getNetworkErrorMessage(error: NetworkError, context?: string): UserFriendlyError {
  const baseError = getUserFriendlyError(error, context);
  
  // Enhance with network-specific details
  if (error.type === 'offline') {
    return {
      ...baseError,
      title: 'You\'re Offline',
      message: 'You are currently offline. Please check your internet connection and try again.',
      action: 'Make sure your device is connected to the internet. If you\'re on a mobile device, try disabling airplane mode.',
    };
  }
  
  if (error.type === 'timeout') {
    return {
      ...baseError,
      title: 'Request Timed Out',
      message: 'The request took too long to complete. The server may be slow or overloaded.',
      action: 'Please try again in a moment. If the problem persists, the server may be experiencing issues.',
    };
  }
  
  if (error.type === 'server' && error.statusCode) {
    return {
      ...baseError,
      title: 'Server Error',
      message: `The server returned an error (${error.statusCode}). This is usually temporary.`,
      action: 'Please try again in a few moments. If the problem persists, contact support.',
    };
  }
  
  if (error.type === 'client' && error.statusCode === 401) {
    return {
      ...baseError,
      title: 'Authentication Required',
      message: 'You need to be logged in to perform this action.',
      action: 'Please log in and try again.',
    };
  }
  
  if (error.type === 'client' && error.statusCode === 403) {
    return {
      ...baseError,
      title: 'Access Denied',
      message: 'You don\'t have permission to perform this action.',
      action: 'Please check your account permissions or contact support.',
    };
  }
  
  if (error.type === 'rate_limit' || (error.type === 'client' && error.statusCode === 429)) {
    const retryAfter = error.retryAfter;
    const waitTime = retryAfter 
      ? retryAfter < 60 
        ? `${retryAfter} seconds`
        : `${Math.ceil(retryAfter / 60)} minutes`
      : 'a few moments';
    
    return {
      ...baseError,
      title: 'Rate Limit Exceeded',
      message: `You've made too many requests. Please wait ${waitTime} before trying again.`,
      action: retryAfter 
        ? `The request will automatically retry after ${waitTime}. You can also try again manually.`
        : 'Please wait a few seconds and try again.',
    };
  }
  
  return baseError;
}

/**
 * Show network error to user
 */
export function showNetworkError(error: NetworkError, context?: string): void {
  const friendlyError = getNetworkErrorMessage(error, context);
  const message = `${friendlyError.title}\n\n${friendlyError.message}${friendlyError.action ? `\n\n${friendlyError.action}` : ''}`;
  
  alert(message);
  
  console.error('Network error:', {
    error,
    context,
    friendlyError,
  });
}

/**
 * Standardized error handler for API and network errors
 * Logs the error and displays a user-friendly toast notification
 * 
 * @param error - The error object (can be any type)
 * @param userMessage - Optional custom message to show to the user
 */
export function handleError(error: unknown, userMessage?: string): void {
  // Log the full error to console for debugging
  console.error('Error occurred:', error);

  // Extract error message
  let message = userMessage;

  if (!message) {
    // Try to extract message from error object
    if (error instanceof Error) {
      message = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message);
    } else if (error && typeof error === 'object' && 'response' in error) {
      // Handle axios-style errors
      const errorWithResponse = error as { response?: { data?: { message?: string; error?: string }; statusText?: string } };
      const response = errorWithResponse.response;
      if (response?.data?.message) {
        message = response.data.message;
      } else if (response?.data?.error) {
        message = response.data.error;
      } else if (response?.statusText) {
        message = response.statusText;
      }
    } else if (typeof error === 'string') {
      message = error;
    }
  }

  // Fallback to generic message
  if (!message || message.trim() === '') {
    message = 'Something went wrong. Please check your connection.';
  }

  // Display toast notification using sonner
  toast.error(message);
}

