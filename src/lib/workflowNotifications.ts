/**
 * Workflow Notification System
 * Generates intelligent notifications based on workflow state and progress
 */

import { WorkflowTracking, type WorkflowId, type Workflow } from './workflowTracking';

export interface WorkflowNotification {
  id: string;
  type: 'workflow-completed' | 'step-completed' | 'workflow-started' | 'next-step-reminder' | 'milestone' | 'inactivity' | 'contextual-reminder' | 'step-started-reminder';
  workflowId: WorkflowId;
  workflowName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  read: boolean;
  metadata?: Record<string, any>;
  persistent?: boolean; // For important notifications that should persist
}

export interface NotificationPreferences {
  enabled: boolean;
  workflowCompleted: boolean;
  stepCompleted: boolean;
  milestones: boolean;
  inactivityReminders: boolean;
  contextualReminders: boolean;
  reminderFrequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

class WorkflowNotificationService {
  private storageKey = 'workflow_notifications';
  private lastCheckKey = 'workflow_notifications_last_check';
  private preferencesKey = 'workflow_notification_preferences';
  private stepStartedTrackingKey = 'workflow_step_started_tracking';
  
  // Default preferences
  private defaultPreferences: NotificationPreferences = {
    enabled: true,
    workflowCompleted: true,
    stepCompleted: true,
    milestones: true,
    inactivityReminders: true,
    contextualReminders: true,
    reminderFrequency: 'daily',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  };

  /**
   * Get notification preferences
   */
  getPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(this.preferencesKey);
      return stored ? JSON.parse(stored) : this.defaultPreferences;
    } catch {
      return this.defaultPreferences;
    }
  }

  /**
   * Save notification preferences
   */
  savePreferences(preferences: NotificationPreferences): void {
    try {
      localStorage.setItem(this.preferencesKey, JSON.stringify(preferences));
    } catch (e) {
      console.error('Error saving notification preferences:', e);
    }
  }

  /**
   * Check if we're in quiet hours
   */
  private isQuietHours(): boolean {
    const prefs = this.getPreferences();
    if (!prefs.quietHours.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMin] = prefs.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = prefs.quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }
    return currentTime >= startTime && currentTime < endTime;
  }

  /**
   * Track when a step is started
   */
  trackStepStarted(workflowId: WorkflowId, stepId: string): void {
    try {
      const tracking = this.getStepStartedTracking();
      const key = `${workflowId}-${stepId}`;
      tracking[key] = Date.now();
      localStorage.setItem(this.stepStartedTrackingKey, JSON.stringify(tracking));
    } catch (e) {
      console.error('Error tracking step started:', e);
    }
  }

  /**
   * Get step started tracking data
   */
  private getStepStartedTracking(): Record<string, number> {
    try {
      const stored = localStorage.getItem(this.stepStartedTrackingKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Generate notifications based on current workflow state
   */
  generateNotifications(): WorkflowNotification[] {
    const notifications: WorkflowNotification[] = [];
    const workflows = WorkflowTracking.getAllWorkflows();
    const lastCheck = this.getLastCheckTime();
    const now = Date.now();
    const preferences = this.getPreferences();

    // Don't generate notifications if disabled or in quiet hours
    if (!preferences.enabled || this.isQuietHours()) {
      return notifications;
    }

    workflows.forEach(workflow => {
      // Check for newly completed workflows
      if (workflow.completedAt && preferences.workflowCompleted) {
        const completedAt = new Date(workflow.completedAt).getTime();
        if (completedAt > lastCheck) {
          const completedStepsCount = workflow.steps.filter(s => s.status === 'completed').length;
          notifications.push({
            id: `wf-completed-${workflow.id}-${completedAt}`,
            type: 'workflow-completed',
            workflowId: workflow.id,
            workflowName: workflow.name,
            title: '🎉 Workflow Complete!',
            message: `You've successfully completed "${workflow.name}"! You completed ${completedStepsCount} steps. Great job!`,
            actionUrl: '/dashboard',
            actionText: 'View Dashboard',
            priority: 'high',
            timestamp: completedAt,
            read: false,
            persistent: true, // Important notification
            metadata: { 
              progress: workflow.progress,
              stepsCompleted: completedStepsCount,
              totalSteps: workflow.steps.length
            }
          });
        }
      }

      // Check for newly completed steps
      if (workflow.isActive && preferences.stepCompleted) {
        workflow.steps.forEach(step => {
          if (step.completedAt) {
            const completedAt = new Date(step.completedAt).getTime();
            if (completedAt > lastCheck) {
              const nextStep = WorkflowTracking.getNextStep(workflow.id);
              notifications.push({
                id: `step-completed-${workflow.id}-${step.id}-${completedAt}`,
                type: 'step-completed',
                workflowId: workflow.id,
                workflowName: workflow.name,
                title: '✅ Step Completed',
                message: `You completed "${step.name}" in ${workflow.name}. ${nextStep ? `Next: ${nextStep.name}` : 'Almost done!'}`,
                actionUrl: nextStep?.featurePath,
                actionText: nextStep ? 'Continue' : 'View Progress',
                priority: 'medium',
                timestamp: completedAt,
                read: false,
                metadata: { stepId: step.id, stepName: step.name, nextStep: nextStep?.name }
              });
            }
          }
        });

        // Check for milestones (25%, 50%, 75%)
        if (preferences.milestones) {
          const milestones = [25, 50, 75];
          milestones.forEach(milestone => {
            if (workflow.progress >= milestone && workflow.progress < milestone + 5) {
              // Check if we've already notified for this milestone
              const existingNotifications = this.getNotifications();
              const alreadyNotified = existingNotifications.some(n => 
                n.type === 'milestone' && 
                n.workflowId === workflow.id && 
                n.metadata?.milestone === milestone
              );

              if (!alreadyNotified) {
                notifications.push({
                  id: `milestone-${workflow.id}-${milestone}-${now}`,
                  type: 'milestone',
                  workflowId: workflow.id,
                  workflowName: workflow.name,
                  title: `🎯 ${milestone}% Complete!`,
                  message: `You're ${milestone}% through "${workflow.name}". Keep up the great work!`,
                  actionUrl: WorkflowTracking.getNextStep(workflow.id)?.featurePath,
                  actionText: 'Continue',
                  priority: 'low',
                  timestamp: now,
                  read: false,
                  metadata: { milestone, progress: workflow.progress }
                });
              }
            }
          });
        }

        // Check for inactivity (workflow started but no progress in 3 days)
        if (preferences.inactivityReminders && workflow.startedAt) {
          const startedAt = new Date(workflow.startedAt).getTime();
          const daysSinceStart = (now - startedAt) / (1000 * 60 * 60 * 24);
          const lastStepCompletion = workflow.steps
            .filter(s => s.completedAt)
            .map(s => new Date(s.completedAt!).getTime())
            .sort((a, b) => b - a)[0];

          if (lastStepCompletion) {
            const daysSinceLastStep = (now - lastStepCompletion) / (1000 * 60 * 60 * 24);
            // Smart timing: Only notify if it's been 2-3 days (not too frequent)
            if (daysSinceLastStep >= 2 && daysSinceLastStep < 3.5) {
              const existingNotifications = this.getNotifications();
              const alreadyNotified = existingNotifications.some(n => 
                n.type === 'inactivity' && 
                n.workflowId === workflow.id &&
                n.timestamp > now - (24 * 60 * 60 * 1000) // Within last 24 hours
              );

              if (!alreadyNotified) {
                const nextStep = WorkflowTracking.getNextStep(workflow.id);
                notifications.push({
                  id: `inactivity-${workflow.id}-${now}`,
                  type: 'inactivity',
                  workflowId: workflow.id,
                  workflowName: workflow.name,
                  title: '⏰ Continue Your Progress',
                  message: `You haven't made progress on "${workflow.name}" in ${Math.floor(daysSinceLastStep)} day${Math.floor(daysSinceLastStep) !== 1 ? 's' : ''}. ${nextStep ? `Next step: ${nextStep.name}` : 'You\'re almost done!'}`,
                  actionUrl: nextStep?.featurePath,
                  actionText: 'Continue Workflow',
                  priority: 'medium',
                  timestamp: now,
                  read: false,
                  metadata: { daysSinceLastStep: Math.floor(daysSinceLastStep) }
                });
              }
            }
          }
        }

        // Check for contextual reminders (steps started but not completed)
        if (preferences.contextualReminders) {
          workflow.steps.forEach(step => {
            if (step.status === 'in-progress' && !step.completedAt && step.metadata?.startedAt) {
              const stepStartedAt = new Date(step.metadata.startedAt).getTime();
              const daysSinceStarted = (now - stepStartedAt) / (1000 * 60 * 60 * 24);
              
              // Smart timing: Send reminder after 1 day, then again after 2 days (not too frequent)
              if ((daysSinceStarted >= 1 && daysSinceStarted < 1.5) || 
                  (daysSinceStarted >= 2 && daysSinceStarted < 2.5)) {
                const existingNotifications = this.getNotifications();
                const alreadyNotified = existingNotifications.some(n => 
                  n.type === 'step-started-reminder' && 
                  n.workflowId === workflow.id &&
                  n.metadata?.stepId === step.id &&
                  n.timestamp > now - (12 * 60 * 60 * 1000) // Within last 12 hours
                );

                if (!alreadyNotified) {
                  const daysText = Math.floor(daysSinceStarted) === 1 ? '1 day' : `${Math.floor(daysSinceStarted)} days`;
                  notifications.push({
                    id: `step-reminder-${workflow.id}-${step.id}-${now}`,
                    type: 'step-started-reminder',
                    workflowId: workflow.id,
                    workflowName: workflow.name,
                    title: '📝 Continue Your Work',
                    message: `You started "${step.name}" ${daysText} ago. Complete it to continue your "${workflow.name}" workflow!`,
                    actionUrl: step.featurePath,
                    actionText: 'Continue Step',
                    priority: 'medium',
                    timestamp: now,
                    read: false,
                    metadata: { 
                      stepId: step.id, 
                      stepName: step.name,
                      daysSinceStarted: Math.floor(daysSinceStarted)
                    }
                  });
                }
              }
            }
          });
        }
      }
    });

    // Check for newly started workflows
    workflows.forEach(workflow => {
      if (workflow.startedAt) {
        const startedAt = new Date(workflow.startedAt).getTime();
        if (startedAt > lastCheck) {
          const firstStep = workflow.steps.find(s => s.status === 'not-started') || workflow.steps[0];
          notifications.push({
            id: `wf-started-${workflow.id}-${startedAt}`,
            type: 'workflow-started',
            workflowId: workflow.id,
            workflowName: workflow.name,
            title: '🚀 Workflow Started!',
            message: `You've started "${workflow.name}". ${firstStep ? `First step: ${firstStep.name}` : 'Let\'s get started!'}`,
            actionUrl: firstStep?.featurePath,
            actionText: 'Begin',
            priority: 'high',
            timestamp: startedAt,
            read: false,
            metadata: { firstStep: firstStep?.name }
          });
        }
      }
    });

    return notifications;
  }

  /**
   * Get all workflow notifications
   */
  getNotifications(): WorkflowNotification[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading workflow notifications:', e);
      return [];
    }
  }

  /**
   * Save notifications
   */
  saveNotifications(notifications: WorkflowNotification[]): void {
    try {
      // Keep only last 100 notifications
      const limited = notifications.slice(-100);
      localStorage.setItem(this.storageKey, JSON.stringify(limited));
    } catch (e) {
      console.error('Error saving workflow notifications:', e);
    }
  }

  /**
   * Add new notifications
   */
  addNotifications(newNotifications: WorkflowNotification[]): void {
    const existing = this.getNotifications();
    const existingIds = new Set(existing.map(n => n.id));
    
    // Filter out duplicates
    const unique = newNotifications.filter(n => !existingIds.has(n.id));
    const updated = [...existing, ...unique].sort((a, b) => b.timestamp - a.timestamp);
    
    this.saveNotifications(updated);
    this.updateLastCheckTime();
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.saveNotifications(updated);
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications(updated);
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.filter(n => n.id !== notificationId);
    this.saveNotifications(updated);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.saveNotifications([]);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  }

  /**
   * Get last check time
   */
  private getLastCheckTime(): number {
    try {
      const stored = localStorage.getItem(this.lastCheckKey);
      return stored ? parseInt(stored, 10) : Date.now() - (7 * 24 * 60 * 60 * 1000); // Default to 7 days ago
    } catch {
      return Date.now() - (7 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Update last check time
   */
  private updateLastCheckTime(): void {
    try {
      localStorage.setItem(this.lastCheckKey, Date.now().toString());
    } catch (e) {
      console.error('Error updating last check time:', e);
    }
  }

  /**
   * Check and generate new notifications (should be called periodically)
   */
  checkAndGenerate(): WorkflowNotification[] {
    const preferences = this.getPreferences();
    
    // Respect reminder frequency
    const lastCheck = this.getLastCheckTime();
    const now = Date.now();
    const hoursSinceLastCheck = (now - lastCheck) / (1000 * 60 * 60);
    
    if (preferences.reminderFrequency === 'daily' && hoursSinceLastCheck < 24) {
      // Only check once per day
      return [];
    }
    if (preferences.reminderFrequency === 'weekly' && hoursSinceLastCheck < 168) {
      // Only check once per week
      return [];
    }
    
    const newNotifications = this.generateNotifications();
    if (newNotifications.length > 0) {
      this.addNotifications(newNotifications);
    }
    return newNotifications;
  }

  /**
   * Get persistent notifications (important notifications that should persist)
   */
  getPersistentNotifications(): WorkflowNotification[] {
    return this.getNotifications().filter(n => n.persistent && !n.read);
  }
}

export const WorkflowNotifications = new WorkflowNotificationService();

