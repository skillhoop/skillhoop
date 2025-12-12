/**
 * Workflow Outcomes Tracking System
 * Connects workflow completions to real-world results and outcomes
 */

import { WorkflowTracking, type WorkflowId } from './workflowTracking';
import { supabase } from './supabase';

export interface WorkflowOutcome {
  workflowId: WorkflowId;
  workflowName: string;
  completedAt: string;
  
  // Real-world metrics
  applicationsSubmitted?: number;
  interviewsScheduled?: number;
  skillsImproved?: number;
  certificationsEarned?: number;
  contentCreated?: number;
  brandScoreIncrease?: number;
  averageMatchScore?: number;
  
  // ROI metrics
  estimatedSalaryIncrease?: number;
  timeToComplete?: number; // in days
  stepsCompleted?: number;
  totalSteps?: number;
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface WorkflowImpactMetrics {
  workflowId: WorkflowId;
  workflowName: string;
  
  // Job Application Pipeline metrics
  applicationsSubmitted?: number;
  interviewsScheduled?: number;
  offersReceived?: number;
  averageMatchScore?: number;
  
  // Skill Development metrics
  skillsImproved?: number;
  certificationsEarned?: number;
  learningHoursInvested?: number;
  
  // Brand Building metrics
  brandScoreIncrease?: number;
  contentCreated?: number;
  contentEngagement?: number;
  
  // Overall impact
  estimatedSalaryIncrease?: number;
  careerAdvancementScore?: number;
}

class WorkflowOutcomesService {
  private storageKey = 'workflow_outcomes';
  
  /**
   * Track outcome when workflow is completed
   */
  async trackWorkflowOutcome(workflowId: WorkflowId): Promise<WorkflowOutcome | null> {
    try {
      const workflow = WorkflowTracking.getWorkflow(workflowId);
      if (!workflow || !workflow.completedAt) {
        return null;
      }

      // Check if already tracked
      const existing = this.getOutcomes();
      const alreadyTracked = existing.find(o => 
        o.workflowId === workflowId && 
        o.completedAt === workflow.completedAt
      );
      
      if (alreadyTracked) {
        return alreadyTracked;
      }

      // Gather real-world metrics based on workflow type
      const metrics = await this.gatherRealWorldMetrics(workflowId, workflow);
      
      const outcome: WorkflowOutcome = {
        workflowId,
        workflowName: workflow.name,
        completedAt: workflow.completedAt,
        stepsCompleted: workflow.steps.filter(s => s.status === 'completed').length,
        totalSteps: workflow.steps.length,
        ...metrics
      };

      // Save outcome
      const outcomes = this.getOutcomes();
      outcomes.push(outcome);
      this.saveOutcomes(outcomes);

      return outcome;
    } catch (error) {
      console.error('Error tracking workflow outcome:', error);
      return null;
    }
  }

  /**
   * Gather real-world metrics for a completed workflow
   */
  private async gatherRealWorldMetrics(
    workflowId: WorkflowId,
    workflow: any
  ): Promise<Partial<WorkflowOutcome>> {
    const metrics: Partial<WorkflowOutcome> = {};
    const startedAt = workflow.startedAt ? new Date(workflow.startedAt).getTime() : Date.now();
    const completedAt = new Date(workflow.completedAt).getTime();
    metrics.timeToComplete = Math.ceil((completedAt - startedAt) / (1000 * 60 * 60 * 24));

    switch (workflowId) {
      case 'job-application-pipeline':
        return await this.gatherJobApplicationMetrics(metrics);
      
      case 'skill-development-advancement':
        return await this.gatherSkillDevelopmentMetrics(metrics);
      
      case 'personal-brand-job-discovery':
        return await this.gatherBrandBuildingMetrics(metrics);
      
      case 'interview-preparation-ecosystem':
        return await this.gatherInterviewPrepMetrics(metrics);
      
      case 'continuous-improvement-loop':
        return await this.gatherImprovementLoopMetrics(metrics);
      
      case 'document-consistency-version-control':
        return await this.gatherDocumentConsistencyMetrics(metrics);
      
      case 'market-intelligence-career-strategy':
        return await this.gatherMarketIntelligenceMetrics(metrics);
      
      default:
        return metrics;
    }
  }

  /**
   * Gather metrics for Job Application Pipeline
   */
  private async gatherJobApplicationMetrics(metrics: Partial<WorkflowOutcome>): Promise<Partial<WorkflowOutcome>> {
    // Get tracked jobs from localStorage
    try {
      const trackedJobs = JSON.parse(localStorage.getItem('tracked_jobs') || '[]');
      
      // Count applications submitted
      const applicationsSubmitted = trackedJobs.filter((job: any) => 
        ['applied', 'interviewing', 'offer'].includes(job.status) || job.applicationDate
      ).length;
      
      // Count interviews scheduled
      const interviewsScheduled = trackedJobs.filter((job: any) => 
        ['interviewing', 'offer'].includes(job.status) || job.interviewDate
      ).length;
      
      // Calculate average match score
      const appliedJobs = trackedJobs.filter((job: any) => 
        ['applied', 'interviewing', 'offer'].includes(job.status)
      );
      const averageMatchScore = appliedJobs.length > 0
        ? Math.round(appliedJobs.reduce((sum: number, job: any) => sum + (job.matchScore || 0), 0) / appliedJobs.length)
        : 0;

      return {
        ...metrics,
        applicationsSubmitted,
        interviewsScheduled,
        averageMatchScore
      };
    } catch (error) {
      console.error('Error gathering job application metrics:', error);
      return metrics;
    }
  }

  /**
   * Gather metrics for Skill Development
   */
  private async gatherSkillDevelopmentMetrics(metrics: Partial<WorkflowOutcome>): Promise<Partial<WorkflowOutcome>> {
    try {
      // Get certifications from localStorage or component state
      // For now, we'll check workflow metadata
      const workflow = WorkflowTracking.getWorkflow('skill-development-advancement');
      const certificationsEarned = workflow?.steps
        .find(s => s.id === 'earn-certifications')?.metadata?.certificationsEarned || 0;

      // Get skills improved from skill watchlist or learning path
      // This would ideally come from Supabase skill_watchlist table
      let skillsImproved = 0;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: watchlist } = await supabase
            .from('skill_watchlist')
            .select('*')
            .eq('user_id', user.id);
          
          if (watchlist) {
            skillsImproved = watchlist.length;
          }
        }
      } catch (e) {
        // Fallback: estimate from workflow context
        const context = WorkflowTracking.getWorkflowContext();
        skillsImproved = context?.identifiedSkills?.length || 0;
      }

      return {
        ...metrics,
        skillsImproved,
        certificationsEarned
      };
    } catch (error) {
      console.error('Error gathering skill development metrics:', error);
      return metrics;
    }
  }

  /**
   * Gather metrics for Brand Building
   */
  private async gatherBrandBuildingMetrics(metrics: Partial<WorkflowOutcome>): Promise<Partial<WorkflowOutcome>> {
    try {
      // Get brand score from latest brand audit
      let brandScoreIncrease = 0;
      let contentCreated = 0;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get latest brand audit
          const { data: audits } = await supabase
            .from('brand_audits')
            .select('brand_score')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(2);

          if (audits && audits.length >= 2) {
            const latest = audits[0].brand_score?.overall || 0;
            const previous = audits[1].brand_score?.overall || 0;
            brandScoreIncrease = latest - previous;
          }

          // Get content created count
          const { data: content } = await supabase
            .from('content_analytics')
            .select('id')
            .eq('user_id', user.id);

          contentCreated = content?.length || 0;
        }
      } catch (e) {
        console.error('Error fetching brand metrics:', e);
      }

      return {
        ...metrics,
        brandScoreIncrease,
        contentCreated
      };
    } catch (error) {
      console.error('Error gathering brand building metrics:', error);
      return metrics;
    }
  }

  /**
   * Gather metrics for Interview Prep
   */
  private async gatherInterviewPrepMetrics(metrics: Partial<WorkflowOutcome>): Promise<Partial<WorkflowOutcome>> {
    try {
      // Get interview prep sessions from localStorage
      const sessionsStr = localStorage.getItem('interview_prep_sessions');
      if (sessionsStr) {
        const sessions = JSON.parse(sessionsStr);
        const interviewsScheduled = sessions.filter((session: any) => 
          session.interviewDate && new Date(session.interviewDate) > new Date()
        ).length;

        return {
          ...metrics,
          interviewsScheduled
        };
      }
      return metrics;
    } catch (error) {
      console.error('Error gathering interview prep metrics:', error);
      return metrics;
    }
  }

  /**
   * Gather metrics for Continuous Improvement Loop
   */
  private async gatherImprovementLoopMetrics(metrics: Partial<WorkflowOutcome>): Promise<Partial<WorkflowOutcome>> {
    try {
      // Get skills improved from workflow context
      const context = WorkflowTracking.getWorkflowContext();
      const skillsImproved = context?.improvementAreas?.length || 0;

      return {
        ...metrics,
        skillsImproved
      };
    } catch (error) {
      console.error('Error gathering improvement loop metrics:', error);
      return metrics;
    }
  }

  /**
   * Gather metrics for Document Consistency
   */
  private async gatherDocumentConsistencyMetrics(metrics: Partial<WorkflowOutcome>): Promise<Partial<WorkflowOutcome>> {
    // This workflow is more about consistency, so metrics are limited
    return metrics;
  }

  /**
   * Gather metrics for Market Intelligence
   */
  private async gatherMarketIntelligenceMetrics(metrics: Partial<WorkflowOutcome>): Promise<Partial<WorkflowOutcome>> {
    try {
      // Get market insights from workflow context
      const context = WorkflowTracking.getWorkflowContext();
      const eventsBookmarked = context?.marketTrends?.eventsBookmarked?.length || 0;
      const roleModelsFollowed = context?.marketTrends?.roleModelsFollowed?.length || 0;

      return {
        ...metrics,
        metadata: {
          eventsBookmarked,
          roleModelsFollowed
        }
      };
    } catch (error) {
      console.error('Error gathering market intelligence metrics:', error);
      return metrics;
    }
  }

  /**
   * Get all outcomes
   */
  getOutcomes(): WorkflowOutcome[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading workflow outcomes:', e);
      return [];
    }
  }

  /**
   * Save outcomes
   */
  private saveOutcomes(outcomes: WorkflowOutcome[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(outcomes));
    } catch (e) {
      console.error('Error saving workflow outcomes:', e);
    }
  }

  /**
   * Get impact metrics for a workflow
   */
  getImpactMetrics(workflowId: WorkflowId): WorkflowImpactMetrics | null {
    const outcomes = this.getOutcomes();
    const outcome = outcomes.find(o => o.workflowId === workflowId);
    
    if (!outcome) return null;

    return {
      workflowId: outcome.workflowId,
      workflowName: outcome.workflowName,
      applicationsSubmitted: outcome.applicationsSubmitted,
      interviewsScheduled: outcome.interviewsScheduled,
      skillsImproved: outcome.skillsImproved,
      certificationsEarned: outcome.certificationsEarned,
      brandScoreIncrease: outcome.brandScoreIncrease,
      contentCreated: outcome.contentCreated,
      averageMatchScore: outcome.averageMatchScore,
      estimatedSalaryIncrease: outcome.estimatedSalaryIncrease
    };
  }

  /**
   * Get all impact metrics
   */
  getAllImpactMetrics(): WorkflowImpactMetrics[] {
    const outcomes = this.getOutcomes();
    return outcomes.map(outcome => ({
      workflowId: outcome.workflowId,
      workflowName: outcome.workflowName,
      applicationsSubmitted: outcome.applicationsSubmitted,
      interviewsScheduled: outcome.interviewsScheduled,
      skillsImproved: outcome.skillsImproved,
      certificationsEarned: outcome.certificationsEarned,
      brandScoreIncrease: outcome.brandScoreIncrease,
      contentCreated: outcome.contentCreated,
      averageMatchScore: outcome.averageMatchScore,
      estimatedSalaryIncrease: outcome.estimatedSalaryIncrease
    }));
  }

  /**
   * Calculate ROI for a workflow
   */
  calculateROI(workflowId: WorkflowId): {
    timeInvested: number;
    estimatedValue: number;
    roi: number;
  } | null {
    const outcome = this.getOutcomes().find(o => o.workflowId === workflowId);
    if (!outcome) return null;

    const timeInvested = outcome.timeToComplete || 0;
    
    // Estimate value based on outcomes
    let estimatedValue = 0;
    
    if (outcome.applicationsSubmitted) {
      estimatedValue += outcome.applicationsSubmitted * 50; // $50 per application
    }
    if (outcome.interviewsScheduled) {
      estimatedValue += outcome.interviewsScheduled * 200; // $200 per interview opportunity
    }
    if (outcome.skillsImproved) {
      estimatedValue += outcome.skillsImproved * 1000; // $1000 per skill improved
    }
    if (outcome.certificationsEarned) {
      estimatedValue += outcome.certificationsEarned * 500; // $500 per certification
    }
    if (outcome.brandScoreIncrease) {
      estimatedValue += outcome.brandScoreIncrease * 20; // $20 per brand score point
    }
    if (outcome.estimatedSalaryIncrease) {
      estimatedValue += outcome.estimatedSalaryIncrease;
    }

    const roi = timeInvested > 0 ? (estimatedValue / timeInvested) * 100 : 0;

    return {
      timeInvested,
      estimatedValue,
      roi: Math.round(roi)
    };
  }

  /**
   * Auto-track outcomes when workflows are completed
   */
  async checkAndTrackOutcomes(): Promise<WorkflowOutcome[]> {
    const workflows = WorkflowTracking.getAllWorkflows();
    const completedWorkflows = workflows.filter(w => w.completedAt && !w.isActive);
    const existingOutcomes = this.getOutcomes();
    const existingWorkflowIds = new Set(existingOutcomes.map(o => o.workflowId));

    const newOutcomes: WorkflowOutcome[] = [];

    for (const workflow of completedWorkflows) {
      if (!existingWorkflowIds.has(workflow.id)) {
        const outcome = await this.trackWorkflowOutcome(workflow.id);
        if (outcome) {
          newOutcomes.push(outcome);
        }
      }
    }

    return newOutcomes;
  }
}

// Note: Interview prep data is stored in localStorage, we'll access it directly

export const WorkflowOutcomes = new WorkflowOutcomesService();
