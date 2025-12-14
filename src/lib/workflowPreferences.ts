/**
 * Workflow Preferences
 * Manages user preferences for workflow prompts and notifications
 */

const WORKFLOW_PREFERENCES_KEY = 'workflow-preferences';

export interface WorkflowPreferences {
  enableWorkflowPrompts: boolean;
  enableWorkflowToasts: boolean;
  autoDismissToasts: boolean;
  toastDuration: number; // milliseconds
  dismissedWorkflows: string[]; // Workflow IDs that user has dismissed
}

const DEFAULT_PREFERENCES: WorkflowPreferences = {
  enableWorkflowPrompts: true,
  enableWorkflowToasts: true,
  autoDismissToasts: true,
  toastDuration: 8000,
  dismissedWorkflows: [],
};

/**
 * Get user workflow preferences
 */
export function getWorkflowPreferences(): WorkflowPreferences {
  try {
    const stored = localStorage.getItem(WORKFLOW_PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('Error loading workflow preferences:', error);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Save user workflow preferences
 */
export function saveWorkflowPreferences(preferences: Partial<WorkflowPreferences>): void {
  try {
    const current = getWorkflowPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(WORKFLOW_PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving workflow preferences:', error);
  }
}

/**
 * Check if workflow prompts are enabled
 */
export function areWorkflowPromptsEnabled(): boolean {
  return getWorkflowPreferences().enableWorkflowPrompts;
}

/**
 * Check if workflow toasts are enabled
 */
export function areWorkflowToastsEnabled(): boolean {
  return getWorkflowPreferences().enableWorkflowToasts;
}

/**
 * Check if a workflow has been dismissed by the user
 */
export function isWorkflowDismissed(workflowId: string): boolean {
  const preferences = getWorkflowPreferences();
  return preferences.dismissedWorkflows.includes(workflowId);
}

/**
 * Dismiss a workflow (user doesn't want to see prompts for it)
 */
export function dismissWorkflow(workflowId: string): void {
  const preferences = getWorkflowPreferences();
  if (!preferences.dismissedWorkflows.includes(workflowId)) {
    preferences.dismissedWorkflows.push(workflowId);
    saveWorkflowPreferences(preferences);
  }
}

/**
 * Re-enable a dismissed workflow
 */
export function enableWorkflow(workflowId: string): void {
  const preferences = getWorkflowPreferences();
  preferences.dismissedWorkflows = preferences.dismissedWorkflows.filter(
    (id) => id !== workflowId
  );
  saveWorkflowPreferences(preferences);
}

/**
 * Get toast duration preference
 */
export function getToastDuration(): number {
  return getWorkflowPreferences().toastDuration;
}



