/**
 * Date Format Helpers
 * Standardized utilities for handling date formats consistently across the application
 */

/**
 * Standard date formats used in the application:
 * - Storage format: "YYYY-MM" for month/year dates (e.g., "2020-01")
 * - Display format: "MMM YYYY" for month/year (e.g., "Jan 2020")
 * - Full date format: "YYYY-MM-DD" for full dates (e.g., "2020-01-15")
 * - Date range format: "YYYY-MM - YYYY-MM" or "YYYY-MM - Present"
 */

/**
 * Parse a date string to YYYY-MM format
 * Handles various input formats:
 * - "YYYY-MM" -> "YYYY-MM"
 * - "YYYY-MM-DD" -> "YYYY-MM"
 * - "MM/YYYY" -> "YYYY-MM"
 * - "Month YYYY" (e.g., "January 2020") -> "YYYY-MM"
 * - "YYYY" -> "YYYY-01"
 * - "Present" -> "Present"
 */
export function parseToStandardDate(dateString: string | null | undefined): string {
  if (!dateString || dateString.trim() === '') {
    return '';
  }

  const trimmed = dateString.trim();

  // Handle "Present" case
  if (trimmed.toLowerCase() === 'present' || trimmed.toLowerCase() === 'current') {
    return 'Present';
  }

  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // YYYY-MM-DD format -> extract YYYY-MM
  const fullDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (fullDateMatch) {
    return `${fullDateMatch[1]}-${fullDateMatch[2]}`;
  }

  // MM/YYYY format
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const month = slashMatch[1].padStart(2, '0');
    const year = slashMatch[2];
    return `${year}-${month}`;
  }

  // Month YYYY format (e.g., "January 2020", "Jan 2020")
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const shortMonthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  const monthYearMatch = trimmed.match(/^([a-z]+)\s+(\d{4})$/i);
  if (monthYearMatch) {
    const monthName = monthYearMatch[1].toLowerCase();
    const year = monthYearMatch[2];
    
    let monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) {
      monthIndex = shortMonthNames.indexOf(monthName);
    }
    
    if (monthIndex !== -1) {
      const month = String(monthIndex + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
  }

  // YYYY format only -> default to January
  const yearOnlyMatch = trimmed.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    return `${yearOnlyMatch[1]}-01`;
  }

  // If we can't parse it, return as-is (might be a custom format)
  return trimmed;
}

/**
 * Format a standard date (YYYY-MM) for display
 * Returns formats like "Jan 2020" or "Present"
 */
export function formatDateForDisplay(dateString: string | null | undefined): string {
  if (!dateString || dateString.trim() === '') {
    return '';
  }

  const trimmed = dateString.trim();

  if (trimmed.toLowerCase() === 'present' || trimmed.toLowerCase() === 'current') {
    return 'Present';
  }

  // Parse YYYY-MM format
  const match = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const year = match[1];
    const monthIndex = parseInt(match[2], 10) - 1;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${monthNames[monthIndex]} ${year}`;
    }
  }

  // If not in standard format, return as-is
  return trimmed;
}

/**
 * Parse a date range string (e.g., "2020-01 - 2021-12" or "2020-01 - Present")
 * Returns { startDate: string, endDate: string | null }
 */
export function parseDateRange(dateRangeString: string | null | undefined): {
  startDate: string;
  endDate: string | null;
} {
  if (!dateRangeString || dateRangeString.trim() === '') {
    return { startDate: '', endDate: null };
  }

  const trimmed = dateRangeString.trim();

  // Split by common separators: " - ", " to ", "–", "—"
  const parts = trimmed.split(/\s*-\s*|\s+to\s+|\s*–\s*|\s*—\s*/i);

  if (parts.length === 1) {
    // Single date
    const parsed = parseToStandardDate(parts[0]);
    return { startDate: parsed, endDate: null };
  }

  if (parts.length >= 2) {
    const startDate = parseToStandardDate(parts[0]);
    const endDateStr = parts[1].trim();
    
    // Check if end date is "Present"
    if (endDateStr.toLowerCase() === 'present' || endDateStr.toLowerCase() === 'current') {
      return { startDate, endDate: 'Present' };
    }
    
    const endDate = parseToStandardDate(endDateStr);
    return { startDate, endDate };
  }

  return { startDate: '', endDate: null };
}

/**
 * Format a date range for display
 * Takes startDate and endDate (can be "Present") and returns formatted string
 */
export function formatDateRangeForDisplay(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string {
  if (!startDate || startDate.trim() === '') {
    return '';
  }

  const formattedStart = formatDateForDisplay(startDate);
  
  if (!endDate || endDate.trim() === '') {
    return formattedStart;
  }

  const formattedEnd = formatDateForDisplay(endDate);

  return `${formattedStart} - ${formattedEnd}`;
}

/**
 * Create a date range string in standard format
 * Returns "YYYY-MM - YYYY-MM" or "YYYY-MM - Present"
 */
export function createDateRangeString(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string {
  if (!startDate || startDate.trim() === '') {
    return '';
  }

  const parsedStart = parseToStandardDate(startDate);
  
  if (!endDate || endDate.trim() === '') {
    return parsedStart;
  }

  // Handle "Present" case
  if (endDate.toLowerCase() === 'present' || endDate.toLowerCase() === 'current') {
    return `${parsedStart} - Present`;
  }

  const parsedEnd = parseToStandardDate(endDate);
  return `${parsedStart} - ${parsedEnd}`;
}

/**
 * Validate a date string is in standard format (YYYY-MM or Present)
 */
export function isValidStandardDate(dateString: string | null | undefined): boolean {
  if (!dateString || dateString.trim() === '') {
    return true; // Empty is valid (optional field)
  }

  const trimmed = dateString.trim();

  if (trimmed.toLowerCase() === 'present' || trimmed.toLowerCase() === 'current') {
    return true;
  }

  return /^\d{4}-\d{2}$/.test(trimmed);
}

/**
 * Compare two dates in standard format
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 * "Present" is considered the latest date
 */
export function compareDates(
  date1: string | null | undefined,
  date2: string | null | undefined
): number {
  if (!date1 && !date2) return 0;
  if (!date1) return -1;
  if (!date2) return 1;

  const d1 = date1.trim();
  const d2 = date2.trim();

  // "Present" is always greater
  if (d1.toLowerCase() === 'present' && d2.toLowerCase() !== 'present') return 1;
  if (d2.toLowerCase() === 'present' && d1.toLowerCase() !== 'present') return -1;
  if (d1.toLowerCase() === 'present' && d2.toLowerCase() === 'present') return 0;

  // Compare as strings (YYYY-MM format is lexicographically sortable)
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * Get current date in standard format (YYYY-MM)
 */
export function getCurrentDateStandard(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}



