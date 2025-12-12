/**
 * Workflow Tracking System
 * Tracks user progress through integrated workflows
 */

import { supabase } from './supabase';

// --- Workflow Types ---

export type WorkflowId = 
  | 'job-application-pipeline'
  | 'skill-development-advancement'
  | 'personal-brand-job-discovery'
  | 'interview-preparation-ecosystem'
  | 'continuous-improvement-loop'
  | 'document-consistency-version-control'
  | 'market-intelligence-career-strategy';

export type WorkflowStepStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

export interface WorkflowStep {
  id: string;
  name: string;
  feature: string;
  featurePath: string;
  status: WorkflowStepStatus;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface Workflow {
  id: WorkflowId;
  name: string;
  description: string;
  category: 'Career Hub' | 'Brand Building' | 'Upskilling' | 'Cross-Category';
  steps: WorkflowStep[];
  startedAt?: string;
  completedAt?: string;
  progress: number; // 0-100
  isActive: boolean;
}

// --- Workflow Definitions ---

export const WORKFLOW_DEFINITIONS: Record<WorkflowId, Omit<Workflow, 'steps' | 'progress' | 'isActive' | 'startedAt' | 'completedAt'>> = {
  'job-application-pipeline': {
    id: 'job-application-pipeline',
    name: 'Job Application Pipeline',
    description: 'Complete end-to-end job application process from discovery to interview',
    category: 'Career Hub',
  },
  'skill-development-advancement': {
    id: 'skill-development-advancement',
    name: 'Skill Development to Career Advancement',
    description: 'Identify skill gaps, learn new skills, and showcase achievements',
    category: 'Upskilling',
  },
  'personal-brand-job-discovery': {
    id: 'personal-brand-job-discovery',
    name: 'Personal Brand Building to Job Discovery',
    description: 'Build your brand, create content, and discover opportunities',
    category: 'Brand Building',
  },
  'interview-preparation-ecosystem': {
    id: 'interview-preparation-ecosystem',
    name: 'Interview Preparation Ecosystem',
    description: 'Prepare for interviews using job requirements and your experience',
    category: 'Career Hub',
  },
  'continuous-improvement-loop': {
    id: 'continuous-improvement-loop',
    name: 'Continuous Improvement Loop',
    description: 'Learn from application outcomes and improve your skills',
    category: 'Cross-Category',
  },
  'document-consistency-version-control': {
    id: 'document-consistency-version-control',
    name: 'Document Consistency & Version Control',
    description: 'Maintain consistency across all your professional documents',
    category: 'Career Hub',
  },
  'market-intelligence-career-strategy': {
    id: 'market-intelligence-career-strategy',
    name: 'Market Intelligence to Career Strategy',
    description: 'Use market data to inform your career strategy and content',
    category: 'Cross-Category',
  },
};

// Workflow 1: Job Application Pipeline Steps
const JOB_APPLICATION_STEPS: WorkflowStep[] = [
  {
    id: 'find-jobs',
    name: 'Find Jobs',
    feature: 'Job Finder',
    featurePath: '/dashboard/job-finder',
    status: 'not-started',
  },
  {
    id: 'track-applications',
    name: 'Track Applications',
    feature: 'Job Tracker',
    featurePath: '/dashboard/job-tracker',
    status: 'not-started',
  },
  {
    id: 'tailor-resume',
    name: 'Tailor Resume',
    feature: 'Application Tailor',
    featurePath: '/dashboard/application-tailor',
    status: 'not-started',
  },
  {
    id: 'prepare-base-resume',
    name: 'Prepare Base Resume',
    feature: 'Smart Resume Studio',
    featurePath: '/dashboard/resume-studio',
    status: 'not-started',
  },
  {
    id: 'generate-cover-letter',
    name: 'Generate Cover Letter',
    feature: 'Cover Letter Generator',
    featurePath: '/dashboard/ai-cover-letter',
    status: 'not-started',
  },
  {
    id: 'archive-documents',
    name: 'Archive Documents',
    feature: 'Work History Manager',
    featurePath: '/dashboard/work-history',
    status: 'not-started',
  },
  {
    id: 'interview-prep',
    name: 'Interview Prep',
    feature: 'Interview Prep Kit',
    featurePath: '/dashboard/interview-prep',
    status: 'not-started',
  },
];

// Workflow 2: Skill Development to Career Advancement Steps
const SKILL_DEVELOPMENT_STEPS: WorkflowStep[] = [
  {
    id: 'identify-skills',
    name: 'Identify Skills',
    feature: 'Skill Radar',
    featurePath: '/dashboard/skill-radar',
    status: 'not-started',
  },
  {
    id: 'benchmark-skills',
    name: 'Benchmark Skills',
    feature: 'Skill Benchmarking',
    featurePath: '/dashboard/benchmarking',
    status: 'not-started',
  },
  {
    id: 'create-learning-path',
    name: 'Create Learning Path',
    feature: 'Learning Path',
    featurePath: '/dashboard/learning-path',
    status: 'not-started',
  },
  {
    id: 'complete-sprints',
    name: 'Complete Sprints',
    feature: 'Sprints',
    featurePath: '/dashboard/sprints',
    status: 'not-started',
  },
  {
    id: 'earn-certifications',
    name: 'Earn Certifications',
    feature: 'Certifications',
    featurePath: '/dashboard/certifications',
    status: 'not-started',
  },
  {
    id: 'update-resume',
    name: 'Update Resume',
    feature: 'Smart Resume Studio',
    featurePath: '/dashboard/resume-studio',
    status: 'not-started',
  },
  {
    id: 'showcase-portfolio',
    name: 'Showcase Portfolio',
    feature: 'AI Career Portfolio',
    featurePath: '/dashboard/portfolio',
    status: 'not-started',
  },
];

// Workflow 3: Personal Brand Building to Job Discovery Steps
const BRAND_BUILDING_STEPS: WorkflowStep[] = [
  {
    id: 'audit-brand',
    name: 'Audit Personal Brand',
    feature: 'Personal Brand Audit',
    featurePath: '/dashboard/brand-audit',
    status: 'not-started',
  },
  {
    id: 'create-content',
    name: 'Create Brand Content',
    feature: 'Content Engine',
    featurePath: '/dashboard/content-engine',
    status: 'not-started',
  },
  {
    id: 'showcase-brand-portfolio',
    name: 'Showcase Brand Portfolio',
    feature: 'AI Career Portfolio',
    featurePath: '/dashboard/portfolio',
    status: 'not-started',
  },
  {
    id: 'scout-career-events',
    name: 'Scout Career Events',
    feature: 'Career Event Scout',
    featurePath: '/dashboard/career-event-scout',
    status: 'not-started',
  },
  {
    id: 'find-brand-matched-jobs',
    name: 'Find Brand-Matched Jobs',
    feature: 'Job Finder',
    featurePath: '/dashboard/job-finder',
    status: 'not-started',
  },
];

// Workflow 4: Interview Preparation Ecosystem Steps
const INTERVIEW_PREP_STEPS: WorkflowStep[] = [
  {
    id: 'review-job-details',
    name: 'Review Job Details',
    feature: 'Job Tracker',
    featurePath: '/dashboard/job-tracker',
    status: 'not-started',
  },
  {
    id: 'prepare-interview',
    name: 'Prepare for Interview',
    feature: 'Interview Prep Kit',
    featurePath: '/dashboard/interview-prep',
    status: 'not-started',
  },
  {
    id: 'extract-experience-stories',
    name: 'Extract Experience Stories',
    feature: 'Smart Resume Studio',
    featurePath: '/dashboard/resume-studio',
    status: 'not-started',
  },
  {
    id: 'store-interview-outcomes',
    name: 'Store Interview Outcomes',
    feature: 'Work History Manager',
    featurePath: '/dashboard/work-history',
    status: 'not-started',
  },
];

// Workflow 5: Continuous Improvement Loop Steps
const CONTINUOUS_IMPROVEMENT_STEPS: WorkflowStep[] = [
  {
    id: 'review-outcomes',
    name: 'Review Application Outcomes',
    feature: 'Job Tracker',
    featurePath: '/dashboard/job-tracker',
    status: 'not-started',
  },
  {
    id: 'benchmark-skill-gaps',
    name: 'Benchmark Skill Gaps',
    feature: 'Skill Benchmarking',
    featurePath: '/dashboard/skill-benchmarking',
    status: 'not-started',
  },
  {
    id: 'identify-skills-to-prioritize',
    name: 'Identify Skills to Prioritize',
    feature: 'Skill Radar',
    featurePath: '/dashboard/skill-radar',
    status: 'not-started',
  },
  {
    id: 'create-learning-plan',
    name: 'Create Learning Plan',
    feature: 'Learning Path',
    featurePath: '/dashboard/learning-path',
    status: 'not-started',
  },
  {
    id: 'track-progress',
    name: 'Track Overall Progress',
    feature: 'Upskilling Dashboard',
    featurePath: '/dashboard/upskilling',
    status: 'not-started',
  },
];

// Workflow 6: Document Consistency & Version Control Steps
const DOCUMENT_CONSISTENCY_STEPS: WorkflowStep[] = [
  {
    id: 'update-resume-consistency',
    name: 'Update Resume for Consistency',
    feature: 'Smart Resume Studio',
    featurePath: '/dashboard/resume-studio',
    status: 'not-started',
  },
  {
    id: 'create-job-specific-versions',
    name: 'Create Job-Specific Versions',
    feature: 'Application Tailor',
    featurePath: '/dashboard/application-tailor',
    status: 'not-started',
  },
  {
    id: 'sync-cover-letters',
    name: 'Sync Cover Letters',
    feature: 'Cover Letter Generator',
    featurePath: '/dashboard/ai-cover-letter',
    status: 'not-started',
  },
  {
    id: 'archive-versions',
    name: 'Archive Document Versions',
    feature: 'Work History Manager',
    featurePath: '/dashboard/work-history',
    status: 'not-started',
  },
  {
    id: 'sync-portfolio-updates',
    name: 'Sync Portfolio Updates',
    feature: 'AI Career Portfolio',
    featurePath: '/dashboard/portfolio',
    status: 'not-started',
  },
];

// Workflow 7: Market Intelligence to Career Strategy Steps
const MARKET_INTELLIGENCE_STEPS: WorkflowStep[] = [
  {
    id: 'identify-trending-skills',
    name: 'Identify Trending Skills',
    feature: 'Skill Radar',
    featurePath: '/dashboard/skill-radar',
    status: 'not-started',
  },
  {
    id: 'analyze-job-demand',
    name: 'Analyze Job Demand',
    feature: 'Job Finder',
    featurePath: '/dashboard/job-finder',
    status: 'not-started',
  },
  {
    id: 'benchmark-skills-market',
    name: 'Benchmark Skills Against Market',
    feature: 'Skill Benchmarking',
    featurePath: '/dashboard/skill-benchmarking',
    status: 'not-started',
  },
  {
    id: 'suggest-brand-positioning',
    name: 'Suggest Brand Positioning',
    feature: 'Personal Brand Audit',
    featurePath: '/dashboard/brand-audit',
    status: 'not-started',
  },
  {
    id: 'create-strategic-content',
    name: 'Create Strategic Content',
    feature: 'Content Engine',
    featurePath: '/dashboard/content-engine',
    status: 'not-started',
  },
];

// --- Storage Keys ---
const STORAGE_KEYS = {
  WORKFLOWS: 'workflow_tracking',
  ACTIVE_WORKFLOW: 'active_workflow_id',
  WORKFLOW_CONTEXT: 'workflow_context', // For passing data between features
};

// --- Workflow Tracking Service ---

export const WorkflowTracking = {
  /**
   * Initialize a workflow
   */
  async initializeWorkflow(workflowId: WorkflowId): Promise<Workflow> {
    const definition = WORKFLOW_DEFINITIONS[workflowId];
    if (!definition) {
      throw new Error(`Unknown workflow: ${workflowId}`);
    }

    // Get workflow steps based on workflow ID
    let steps: WorkflowStep[] = [];
    switch (workflowId) {
      case 'job-application-pipeline':
        steps = JOB_APPLICATION_STEPS.map(s => ({ ...s }));
        break;
      case 'skill-development-advancement':
        steps = SKILL_DEVELOPMENT_STEPS.map(s => ({ ...s }));
        break;
      case 'personal-brand-job-discovery':
        steps = BRAND_BUILDING_STEPS.map(s => ({ ...s }));
        break;
      case 'interview-preparation-ecosystem':
        steps = INTERVIEW_PREP_STEPS.map(s => ({ ...s }));
        break;
      case 'continuous-improvement-loop':
        steps = CONTINUOUS_IMPROVEMENT_STEPS.map(s => ({ ...s }));
        break;
      case 'document-consistency-version-control':
        steps = DOCUMENT_CONSISTENCY_STEPS.map(s => ({ ...s }));
        break;
      case 'market-intelligence-career-strategy':
        steps = MARKET_INTELLIGENCE_STEPS.map(s => ({ ...s }));
        break;
      // Other workflows will be added as we implement them
      default:
        steps = [];
    }

    const workflow: Workflow = {
      ...definition,
      steps,
      progress: 0,
      isActive: true,
      startedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const workflows = this.getAllWorkflows();
    const existingIndex = workflows.findIndex(w => w.id === workflowId);
    if (existingIndex >= 0) {
      workflows[existingIndex] = workflow;
    } else {
      workflows.push(workflow);
    }
    this.saveWorkflows(workflows);

    // Set as active workflow
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKFLOW, workflowId);

    return workflow;
  },

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading workflows:', e);
    }
    return [];
  },

  /**
   * Save workflows
   */
  saveWorkflows(workflows: Workflow[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    } catch (e) {
      console.error('Error saving workflows:', e);
    }
  },

  /**
   * Get a specific workflow
   */
  getWorkflow(workflowId: WorkflowId): Workflow | null {
    const workflows = this.getAllWorkflows();
    return workflows.find(w => w.id === workflowId) || null;
  },

  /**
   * Update workflow step status
   */
  updateStepStatus(
    workflowId: WorkflowId,
    stepId: string,
    status: WorkflowStepStatus,
    metadata?: Record<string, any>
  ): void {
    const workflows = this.getAllWorkflows();
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (!workflow) {
      console.warn(`Workflow ${workflowId} not found`);
      return;
    }

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      console.warn(`Step ${stepId} not found in workflow ${workflowId}`);
      return;
    }

    step.status = status;
    if (status === 'completed') {
      step.completedAt = new Date().toISOString();
    }
    if (status === 'in-progress' && !step.metadata?.startedAt) {
      // Track when step was started for contextual reminders
      if (!step.metadata) step.metadata = {};
      step.metadata.startedAt = new Date().toISOString();
    }
    if (metadata) {
      step.metadata = { ...step.metadata, ...metadata };
    }

    // Recalculate progress
    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
    workflow.progress = Math.round((completedSteps / workflow.steps.length) * 100);

    // Check if workflow is complete
    if (workflow.progress === 100 && !workflow.completedAt) {
      workflow.completedAt = new Date().toISOString();
      workflow.isActive = false;
      
      // Track real-world outcomes (async, don't block)
      import('./workflowOutcomes').then(({ WorkflowOutcomes }) => {
        WorkflowOutcomes.trackWorkflowOutcome(workflowId).catch(err => {
          console.error('Error tracking workflow outcome:', err);
        });
      });
    }

    this.saveWorkflows(workflows);
  },

  /**
   * Get active workflow
   */
  getActiveWorkflow(): Workflow | null {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKFLOW) as WorkflowId | null;
    if (!activeId) return null;
    return this.getWorkflow(activeId);
  },

  /**
   * Set workflow context (for passing data between features)
   */
  setWorkflowContext(context: Record<string, any>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKFLOW_CONTEXT, JSON.stringify(context));
    } catch (e) {
      console.error('Error setting workflow context:', e);
    }
  },

  /**
   * Get workflow context
   */
  getWorkflowContext(): Record<string, any> | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKFLOW_CONTEXT);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error getting workflow context:', e);
      return null;
    }
  },

  /**
   * Clear workflow context
   */
  clearWorkflowContext(): void {
    localStorage.removeItem(STORAGE_KEYS.WORKFLOW_CONTEXT);
  },

  /**
   * Get next step in workflow
   */
  getNextStep(workflowId: WorkflowId): WorkflowStep | null {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return null;

    const nextStep = workflow.steps.find(
      step => step.status === 'not-started' || step.status === 'in-progress'
    );
    return nextStep || null;
  },

  /**
   * Mark workflow as complete
   */
  completeWorkflow(workflowId: WorkflowId): void {
    const workflows = this.getAllWorkflows();
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (workflow) {
      workflow.isActive = false;
      workflow.completedAt = new Date().toISOString();
      workflow.progress = 100;
      this.saveWorkflows(workflows);
      
      // Track real-world outcomes (async, don't block)
      import('./workflowOutcomes').then(({ WorkflowOutcomes }) => {
        WorkflowOutcomes.trackWorkflowOutcome(workflowId).catch(err => {
          console.error('Error tracking workflow outcome:', err);
        });
      });
    }
  },
};

export default WorkflowTracking;
