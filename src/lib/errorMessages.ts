/**
 * User-Friendly Error Message System
 * Converts technical errors into actionable, user-friendly messages
 */

export enum ErrorType {
  NETWORK = 'network',
  STORAGE = 'storage',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  QUOTA = 'quota',
  CORRUPTION = 'corruption',
  UNKNOWN = 'unknown',
}

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  type: ErrorType;
}

/**
 * Detect error type from error message or error object
 */
function detectErrorType(error: Error | string | unknown): ErrorType {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('quota') || lowerMessage.includes('storage full')) {
    return ErrorType.QUOTA;
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return ErrorType.NETWORK;
  }
  if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
    return ErrorType.PERMISSION;
  }
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return ErrorType.NOT_FOUND;
  }
  if (lowerMessage.includes('corrupt') || lowerMessage.includes('parse') || lowerMessage.includes('invalid json')) {
    return ErrorType.CORRUPTION;
  }
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  if (lowerMessage.includes('storage') || lowerMessage.includes('localstorage')) {
    return ErrorType.STORAGE;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Convert error to user-friendly message
 */
export function getUserFriendlyError(error: Error | string | unknown, context?: string): UserFriendlyError {
  const errorType = detectErrorType(error);
  const errorMessage = error instanceof Error ? error.message : String(error);

  switch (errorType) {
    case ErrorType.QUOTA:
      return {
        title: 'Storage Full',
        message: 'Your browser storage is full. Please free up space by deleting old resumes or clearing your browser cache.',
        action: 'You can delete old resumes from the Resume Library or clear your browser cache in Settings.',
        type: ErrorType.QUOTA,
      };

    case ErrorType.NETWORK:
      return {
        title: 'Connection Problem',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        action: 'Make sure you\'re connected to the internet. If the problem persists, the server may be temporarily unavailable.',
        type: ErrorType.NETWORK,
      };

    case ErrorType.PERMISSION:
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        action: 'Please make sure you\'re logged in and have the necessary permissions.',
        type: ErrorType.PERMISSION,
      };

    case ErrorType.NOT_FOUND:
      return {
        title: 'Not Found',
        message: context 
          ? `The ${context} you're looking for could not be found.`
          : 'The requested item could not be found.',
        action: 'It may have been deleted or moved. Please refresh the page and try again.',
        type: ErrorType.NOT_FOUND,
      };

    case ErrorType.CORRUPTION:
      return {
        title: 'Data Error',
        message: 'The data appears to be corrupted or invalid.',
        action: 'We\'ve attempted to recover your data. If the problem persists, please contact support.',
        type: ErrorType.CORRUPTION,
      };

    case ErrorType.VALIDATION:
      return {
        title: 'Invalid Input',
        message: errorMessage.includes('validation') 
          ? errorMessage
          : 'Some of the information you entered is invalid. Please check the highlighted fields.',
        action: 'Review the error messages below each field and correct any issues.',
        type: ErrorType.VALIDATION,
      };

    case ErrorType.STORAGE:
      return {
        title: 'Storage Error',
        message: 'Unable to save to browser storage. This may be due to privacy settings or storage limitations.',
        action: 'Try using a different browser or clearing your browser cache. If the problem persists, contact support.',
        type: ErrorType.STORAGE,
      };

    default:
      return {
        title: 'Something Went Wrong',
        message: context
          ? `An error occurred while ${context}. Please try again.`
          : 'An unexpected error occurred. Please try again.',
        action: 'If the problem persists, please refresh the page or contact support.',
        type: ErrorType.UNKNOWN,
      };
  }
}

/**
 * Get a simple error message string (for alerts/toasts)
 */
export function getErrorMessage(error: Error | string | unknown, context?: string): string {
  const friendlyError = getUserFriendlyError(error, context);
  return friendlyError.message;
}

/**
 * Get a detailed error message with title and action
 */
export function getDetailedErrorMessage(error: Error | string | unknown, context?: string): string {
  const friendlyError = getUserFriendlyError(error, context);
  let message = `${friendlyError.title}\n\n${friendlyError.message}`;
  if (friendlyError.action) {
    message += `\n\n${friendlyError.action}`;
  }
  return message;
}

/**
 * Context-specific error messages
 */
export const ErrorContexts = {
  SAVE_RESUME: 'saving your resume',
  LOAD_RESUME: 'loading your resume',
  DELETE_RESUME: 'deleting your resume',
  DUPLICATE_RESUME: 'duplicating your resume',
  RENAME_RESUME: 'renaming your resume',
  SAVE_VERSION: 'saving version history',
  LOAD_VERSION: 'loading version history',
  DELETE_VERSION: 'deleting version',
  EXPORT_RESUME: 'exporting your resume',
  IMPORT_RESUME: 'importing your resume',
  VALIDATE_RESUME: 'validating your resume',
  SYNC_RESUME: 'syncing your resume',
  LOAD_JOBS: 'loading job applications',
  UPDATE_TARGET_JOB: 'updating target job',
};

/**
 * Show error to user (can be extended to use toast/notification system)
 */
export function showErrorToUser(error: Error | string | unknown, context?: string): void {
  const message = getDetailedErrorMessage(error, context);
  
  // For now, use alert. Can be replaced with toast/notification system
  alert(message);
  
  // Also log to console for debugging
  console.error('User-friendly error:', {
    originalError: error,
    context,
    friendlyMessage: message,
  });
}

/**
 * Get error message for specific resume operations
 */
export function getResumeErrorMessage(error: Error | string | unknown, operation: string): string {
  const context = ErrorContexts[operation as keyof typeof ErrorContexts] || operation;
  return getErrorMessage(error, context);
}



