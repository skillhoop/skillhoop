/**
 * Z-Index Management System
 * Provides standardized z-index values to prevent conflicts between modals, overlays, and other UI elements
 */

/**
 * Z-index layers (in order from lowest to highest)
 * Each layer should be at least 10 apart to allow for stacking
 */
export const Z_INDEX = {
  // Base layers (0-100)
  BASE: 0,
  DROPDOWN: 10,
  DROPDOWN_OVERLAY: 20,
  
  // Modal layers (100-200)
  MODAL_BACKDROP: 100,
  MODAL: 110,
  
  // Stacked modals (200-300)
  MODAL_STACK_1: 200,  // First stacked modal (e.g., confirmation on top of main modal)
  MODAL_STACK_2: 210,  // Second stacked modal
  MODAL_STACK_3: 220,  // Third stacked modal
  
  // Toast/Notification layers (300-400)
  TOAST: 300,
  NOTIFICATION: 310,
  
  // Widget layers (400-500)
  CHAT_WIDGET: 400,
  CHAT_WIDGET_OPEN: 410,
  
  // Maximum layer (for critical overlays)
  MAXIMUM: 9999,
} as const;

/**
 * Get z-index for a modal with optional stacking level
 * @param level - Stacking level (0 = base modal, 1+ = stacked on top)
 */
export function getModalZIndex(level: number = 0): number {
  if (level === 0) return Z_INDEX.MODAL;
  if (level === 1) return Z_INDEX.MODAL_STACK_1;
  if (level === 2) return Z_INDEX.MODAL_STACK_2;
  if (level === 3) return Z_INDEX.MODAL_STACK_3;
  // For levels beyond 3, increment by 10
  return Z_INDEX.MODAL_STACK_3 + (level - 3) * 10;
}

/**
 * Get z-index for modal backdrop with optional stacking level
 */
export function getModalBackdropZIndex(level: number = 0): number {
  if (level === 0) return Z_INDEX.MODAL_BACKDROP;
  // Backdrop should be 10 below the modal
  return getModalZIndex(level) - 10;
}

/**
 * Get Tailwind CSS class for z-index
 * Note: Tailwind's default z-index classes only go up to z-50
 * For higher values, we'll use arbitrary values like z-[110]
 */
export function getZIndexClass(value: number): string {
  // Map common values to Tailwind classes
  const tailwindMap: Record<number, string> = {
    0: 'z-0',
    10: 'z-10',
    20: 'z-20',
    30: 'z-30',
    40: 'z-40',
    50: 'z-50',
  };
  
  if (value in tailwindMap) {
    return tailwindMap[value];
  }
  
  // Use arbitrary value for custom z-index
  return `z-[${value}]`;
}

/**
 * Get Tailwind CSS class for modal z-index
 */
export function getModalZIndexClass(level: number = 0): string {
  return getZIndexClass(getModalZIndex(level));
}

/**
 * Get Tailwind CSS class for modal backdrop z-index
 */
export function getModalBackdropZIndexClass(level: number = 0): string {
  return getZIndexClass(getModalBackdropZIndex(level));
}


