/**
 * Workflow Recommendations Engine
 * Intelligent system for recommending workflows based on user behavior, progress, and goals
 */

import { WorkflowTracking, type WorkflowId, type Workflow, WORKFLOW_DEFINITIONS } from './workflowTracking';
import { supabase } from './supabase';

export interface WorkflowRecommendation {
  workflowId: WorkflowId;
  score: number; // 0-100, higher is better
  reason: string;
  priority: 'high' | 'medium' | 'low';
  prerequisites?: WorkflowId[];
  estimatedTime?: string;
  category: 'Career Hub' | 'Brand Building' | 'Upskilling' | 'Cross-Category';
  tags?: string[];
}

export interface UserContext {
  resumeCount: number;
  jobCount: number;
  brandScore: number | null;
  coverLetterCount: number;
  completedWorkflows: WorkflowId[];
  activeWorkflows: WorkflowId[];
  daysSinceLastActivity: number;
  careerGoal?: string;
  skillGaps?: string[];
  recentFeatures?: string[];
}

class WorkflowRecommendationsEngine {
  // Workflow dependency graph
  private workflowDependencies: Record<WorkflowId, WorkflowId[]> = {
    'job-application-pipeline': [],
    'skill-development-advancement': [],
    'personal-brand-job-discovery': [],
    'interview-preparation-ecosystem': ['job-application-pipeline'],
    'continuous-improvement-loop': ['job-application-pipeline'],
    'document-consistency-version-control': ['job-application-pipeline'],
    'market-intelligence-career-strategy': [],
  };

  // Workflow prerequisites (soft dependencies)
  private workflowPrerequisites: Record<WorkflowId, Partial<UserContext>> = {
    'job-application-pipeline': { resumeCount: 1 },
    'skill-development-advancement': {},
    'personal-brand-job-discovery': {},
    'interview-preparation-ecosystem': { jobCount: 1 },
    'continuous-improvement-loop': { jobCount: 5 },
    'document-consistency-version-control': { resumeCount: 1 },
    'market-intelligence-career-strategy': {},
  };

  // Workflow tags for matching
  private workflowTags: Record<WorkflowId, string[]> = {
    'job-application-pipeline': ['job-search', 'applications', 'resume', 'beginner', 'essential'],
    'skill-development-advancement': ['skills', 'learning', 'growth', 'upskilling', 'career-growth'],
    'personal-brand-job-discovery': ['branding', 'linkedin', 'networking', 'content', 'visibility'],
    'interview-preparation-ecosystem': ['interviews', 'preparation', 'practice', 'advanced'],
    'continuous-improvement-loop': ['optimization', 'analytics', 'improvement', 'advanced'],
    'document-consistency-version-control': ['resume', 'documents', 'organization', 'maintenance'],
    'market-intelligence-career-strategy': ['research', 'strategy', 'market-analysis', 'planning'],
  };

  /**
   * Get user context from various data sources
   */
  async getUserContext(): Promise<UserContext> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return this.getDefaultContext();
      }

      // Get resume count
      const { count: resumeCount } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get job count
      const { count: jobCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get cover letter count
      const { count: coverLetterCount } = await supabase
        .from('cover_letters')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get brand score (latest audit)
      const { data: brandAudit } = await supabase
        .from('brand_audits')
        .select('overall_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get user profile for career goal (if profiles table exists and has career_goal column)
      let careerGoal: string | undefined;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('career_goal')
          .eq('id', user.id)
          .single();
        careerGoal = profile?.career_goal || undefined;
      } catch (error) {
        // Profiles table might not exist or career_goal column might not be present
        // This is okay, we'll continue without it
        console.debug('Could not fetch career goal from profile:', error);
      }

      // Get workflows
      const workflows = WorkflowTracking.getAllWorkflows();
      const completedWorkflows = workflows
        .filter(w => w.completedAt)
        .map(w => w.id);
      const activeWorkflows = workflows
        .filter(w => w.isActive && !w.completedAt)
        .map(w => w.id);

      // Calculate days since last activity
      const lastActivity = workflows
        .flatMap(w => w.steps)
        .filter(s => s.completedAt)
        .map(s => new Date(s.completedAt!).getTime())
        .sort((a, b) => b - a)[0];

      const daysSinceLastActivity = lastActivity
        ? Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24))
        : 999;

      return {
        resumeCount: resumeCount || 0,
        jobCount: jobCount || 0,
        brandScore: brandAudit?.overall_score || null,
        coverLetterCount: coverLetterCount || 0,
        completedWorkflows,
        activeWorkflows,
        daysSinceLastActivity,
        careerGoal,
      };
    } catch (error) {
      console.error('Error fetching user context:', error);
      return this.getDefaultContext();
    }
  }

  private getDefaultContext(): UserContext {
    return {
      resumeCount: 0,
      jobCount: 0,
      brandScore: null,
      coverLetterCount: 0,
      completedWorkflows: [],
      activeWorkflows: [],
      daysSinceLastActivity: 999,
    };
  }

  /**
   * Calculate recommendation score for a workflow
   */
  private calculateScore(workflowId: WorkflowId, context: UserContext): number {
    let score = 0;
    const workflow = WORKFLOW_DEFINITIONS[workflowId];
    const prerequisites = this.workflowPrerequisites[workflowId];
    const dependencies = this.workflowDependencies[workflowId];

    // Base score (all workflows start with some score)
    score += 10;

    // Check if already completed
    if (context.completedWorkflows.includes(workflowId)) {
      return 0; // Don't recommend completed workflows
    }

    // Check if already active
    if (context.activeWorkflows.includes(workflowId)) {
      return 5; // Low score for active workflows (user is already doing it)
    }

    // Prerequisites check (boost if prerequisites met)
    if (prerequisites.resumeCount && context.resumeCount >= prerequisites.resumeCount) {
      score += 20;
    }
    if (prerequisites.jobCount && context.jobCount >= prerequisites.jobCount) {
      score += 20;
    }
    if (prerequisites.brandScore && context.brandScore !== null && context.brandScore >= (prerequisites.brandScore || 0)) {
      score += 15;
    }

    // Dependency check (boost if dependencies completed)
    if (dependencies.length > 0) {
      const completedDeps = dependencies.filter(dep => context.completedWorkflows.includes(dep));
      score += (completedDeps.length / dependencies.length) * 30;
    }

    // Category-based scoring
    if (workflow.category === 'Career Hub') {
      if (context.jobCount === 0 && context.resumeCount === 0) {
        score += 25; // High priority for beginners
      }
      if (context.jobCount > 0 && workflowId === 'interview-preparation-ecosystem') {
        score += 30; // High priority if user has applications
      }
    }

    if (workflow.category === 'Brand Building') {
      if (context.brandScore === null) {
        score += 25; // High priority if no brand score
      }
      if (context.brandScore !== null && context.brandScore < 60) {
        score += 20; // Medium priority if low brand score
      }
    }

    if (workflow.category === 'Upskilling') {
      if (context.completedWorkflows.length > 2) {
        score += 15; // Good for experienced users
      }
    }

    // Career goal matching
    if (context.careerGoal) {
      const goalLower = context.careerGoal.toLowerCase();
      if (goalLower.includes('job') || goalLower.includes('career') || goalLower.includes('position')) {
        if (workflowId === 'job-application-pipeline' || workflowId === 'interview-preparation-ecosystem') {
          score += 20;
        }
      }
      if (goalLower.includes('brand') || goalLower.includes('visibility') || goalLower.includes('network')) {
        if (workflowId === 'personal-brand-job-discovery') {
          score += 20;
        }
      }
      if (goalLower.includes('skill') || goalLower.includes('learn') || goalLower.includes('grow')) {
        if (workflowId === 'skill-development-advancement') {
          score += 20;
        }
      }
    }

    // Inactivity boost (if user hasn't been active, suggest easy workflows)
    if (context.daysSinceLastActivity > 7) {
      if (workflowId === 'job-application-pipeline' || workflowId === 'personal-brand-job-discovery') {
        score += 15; // Easy to restart workflows
      }
    }

    // Specific workflow logic
    switch (workflowId) {
      case 'job-application-pipeline':
        if (context.resumeCount === 0) score += 30;
        if (context.jobCount === 0) score += 25;
        break;

      case 'skill-development-advancement':
        if (context.completedWorkflows.length >= 2) score += 20;
        break;

      case 'personal-brand-job-discovery':
        if (context.brandScore === null) score += 30;
        if (context.brandScore !== null && context.brandScore < 60) score += 25;
        break;

      case 'interview-preparation-ecosystem':
        if (context.jobCount >= 3) score += 30;
        if (context.completedWorkflows.includes('job-application-pipeline')) score += 25;
        break;

      case 'continuous-improvement-loop':
        if (context.jobCount >= 5) score += 25;
        if (context.completedWorkflows.length >= 3) score += 20;
        break;

      case 'document-consistency-version-control':
        if (context.resumeCount >= 2 || context.coverLetterCount >= 2) score += 25;
        if (context.completedWorkflows.includes('job-application-pipeline')) score += 20;
        break;

      case 'market-intelligence-career-strategy':
        if (context.completedWorkflows.length >= 2) score += 20;
        if (context.jobCount >= 3) score += 15;
        break;
    }

    // Penalize if prerequisites not met
    if (prerequisites.resumeCount && context.resumeCount < prerequisites.resumeCount) {
      score -= 30;
    }
    if (prerequisites.jobCount && context.jobCount < prerequisites.jobCount) {
      score -= 30;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommendation reason
   */
  private generateReason(workflowId: WorkflowId, context: UserContext, score: number): string {
    const workflow = WORKFLOW_DEFINITIONS[workflowId];
    const reasons: string[] = [];

    // Prerequisites-based reasons
    if (workflowId === 'job-application-pipeline' && context.resumeCount === 0) {
      reasons.push("You don't have a resume yet. This workflow will help you create one and start applying.");
    }
    if (workflowId === 'job-application-pipeline' && context.jobCount === 0) {
      reasons.push("Start your job search journey with this comprehensive application workflow.");
    }
    if (workflowId === 'personal-brand-job-discovery' && context.brandScore === null) {
      reasons.push("Build your personal brand to stand out in the job market.");
    }
    if (workflowId === 'personal-brand-job-discovery' && context.brandScore !== null && context.brandScore < 60) {
      reasons.push(`Your brand score is ${context.brandScore}. Improve it to attract better opportunities.`);
    }
    if (workflowId === 'interview-preparation-ecosystem' && context.jobCount >= 3) {
      reasons.push(`You have ${context.jobCount} applications. Prepare for interviews to increase your success rate.`);
    }
    if (workflowId === 'skill-development-advancement' && context.completedWorkflows.length >= 2) {
      reasons.push("You've completed several workflows. Now focus on developing new skills to advance your career.");
    }
    if (workflowId === 'document-consistency-version-control' && context.resumeCount >= 2) {
      reasons.push("You have multiple documents. Keep them consistent and organized.");
    }
    if (workflowId === 'continuous-improvement-loop' && context.jobCount >= 5) {
      reasons.push("You have many applications. Learn from outcomes and continuously improve.");
    }
    if (workflowId === 'market-intelligence-career-strategy' && context.completedWorkflows.length >= 2) {
      reasons.push("Use market intelligence to inform your career strategy and make data-driven decisions.");
    }

    // Dependency-based reasons
    const dependencies = this.workflowDependencies[workflowId];
    if (dependencies.length > 0) {
      const completedDeps = dependencies.filter(dep => context.completedWorkflows.includes(dep));
      if (completedDeps.length === dependencies.length) {
        reasons.push("You've completed the prerequisites. This is the perfect next step.");
      }
    }

    // Inactivity-based reasons
    if (context.daysSinceLastActivity > 7) {
      reasons.push("You haven't been active recently. This workflow is a great way to get back on track.");
    }

    // Career goal-based reasons
    if (context.careerGoal) {
      const goalLower = context.careerGoal.toLowerCase();
      if ((goalLower.includes('job') || goalLower.includes('career')) && 
          (workflowId === 'job-application-pipeline' || workflowId === 'interview-preparation-ecosystem')) {
        reasons.push("This aligns with your career goal of finding a new position.");
      }
      if (goalLower.includes('brand') && workflowId === 'personal-brand-job-discovery') {
        reasons.push("This aligns with your goal of building your personal brand.");
      }
      if (goalLower.includes('skill') && workflowId === 'skill-development-advancement') {
        reasons.push("This aligns with your goal of developing new skills.");
      }
    }

    // Default reason if none generated
    if (reasons.length === 0) {
      reasons.push(`This ${workflow.category.toLowerCase()} workflow will help you progress in your career.`);
    }

    return reasons.join(' ');
  }

  /**
   * Get priority level based on score
   */
  private getPriority(score: number): 'high' | 'medium' | 'low' {
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    return 'low';
  }

  /**
   * Get estimated time for workflow
   */
  private getEstimatedTime(workflowId: WorkflowId): string {
    const estimates: Record<WorkflowId, string> = {
      'job-application-pipeline': '2-3 weeks',
      'skill-development-advancement': '4-6 weeks',
      'personal-brand-job-discovery': '3-4 weeks',
      'interview-preparation-ecosystem': '1-2 weeks',
      'continuous-improvement-loop': 'Ongoing',
      'document-consistency-version-control': '1 week',
      'market-intelligence-career-strategy': '2-3 weeks',
    };
    return estimates[workflowId] || '2-4 weeks';
  }

  /**
   * Get top recommendations
   */
  async getRecommendations(limit: number = 5): Promise<WorkflowRecommendation[]> {
    const context = await this.getUserContext();
    const allWorkflowIds = Object.keys(WORKFLOW_DEFINITIONS) as WorkflowId[];

    const recommendations: WorkflowRecommendation[] = allWorkflowIds
      .map(workflowId => {
        const score = this.calculateScore(workflowId, context);
        const workflow = WORKFLOW_DEFINITIONS[workflowId];
        const dependencies = this.workflowDependencies[workflowId];

        return {
          workflowId,
          score,
          reason: this.generateReason(workflowId, context, score),
          priority: this.getPriority(score),
          prerequisites: dependencies.length > 0 ? dependencies : undefined,
          estimatedTime: this.getEstimatedTime(workflowId),
          category: workflow.category,
          tags: this.workflowTags[workflowId],
        };
      })
      .filter(rec => rec.score > 0) // Only include workflows with positive scores
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Get recommendation for a specific workflow
   */
  async getRecommendationForWorkflow(workflowId: WorkflowId): Promise<WorkflowRecommendation | null> {
    const context = await this.getUserContext();
    const score = this.calculateScore(workflowId, context);

    if (score === 0) return null;

    const workflow = WORKFLOW_DEFINITIONS[workflowId];
    const dependencies = this.workflowDependencies[workflowId];

    return {
      workflowId,
      score,
      reason: this.generateReason(workflowId, context, score),
      priority: this.getPriority(score),
      prerequisites: dependencies.length > 0 ? dependencies : undefined,
      estimatedTime: this.getEstimatedTime(workflowId),
      category: workflow.category,
      tags: this.workflowTags[workflowId],
    };
  }

  /**
   * Get recommendations based on category
   */
  async getRecommendationsByCategory(
    category: 'Career Hub' | 'Brand Building' | 'Upskilling' | 'Cross-Category',
    limit: number = 3
  ): Promise<WorkflowRecommendation[]> {
    const allRecommendations = await this.getRecommendations(20);
    return allRecommendations
      .filter(rec => rec.category === category)
      .slice(0, limit);
  }
}

export const WorkflowRecommendations = new WorkflowRecommendationsEngine();

