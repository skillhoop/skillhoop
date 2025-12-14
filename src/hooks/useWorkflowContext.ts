/**
 * Custom hook for managing workflow context
 * Provides reactive access to workflow context with proper dependency handling
 */

import { useState, useEffect, useCallback } from 'react';
import { WorkflowTracking } from '../lib/workflowTracking';

/**
 * Hook to get and subscribe to workflow context changes
 * Automatically updates when workflow context changes in localStorage
 */
export function useWorkflowContext() {
  const [workflowContext, setWorkflowContext] = useState<Record<string, any> | null>(() => {
    // Initialize with current context
    return WorkflowTracking.getWorkflowContext();
  });

  // Function to refresh context from storage
  const refreshContext = useCallback(() => {
    const context = WorkflowTracking.getWorkflowContext();
    setWorkflowContext(context);
  }, []);

  // Listen for storage changes (when context is updated from other tabs/components)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Check for workflow context storage key
      if (e.key === 'workflow_context') {
        refreshContext();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically for changes (for same-tab updates)
    const interval = setInterval(() => {
      const currentContext = WorkflowTracking.getWorkflowContext();
      const currentContextStr = JSON.stringify(currentContext);
      const stateContextStr = JSON.stringify(workflowContext);
      
      // Only update if context actually changed
      if (currentContextStr !== stateContextStr) {
        setWorkflowContext(currentContext);
      }
    }, 1000); // Check every second

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [workflowContext, refreshContext]);

  // Update context function
  const updateContext = useCallback((context: Record<string, any>) => {
    WorkflowTracking.setWorkflowContext(context);
    setWorkflowContext(context);
  }, []);

  return {
    workflowContext,
    refreshContext,
    updateContext,
  };
}

