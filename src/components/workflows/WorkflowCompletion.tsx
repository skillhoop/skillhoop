import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowTracking, type WorkflowId, type Workflow } from '../../lib/workflowTracking';
import { WorkflowOutcomes, type WorkflowImpactMetrics } from '../../lib/workflowOutcomes';
import { Trophy, Check, ArrowRight, Sparkles, Target, X, TrendingUp, Award } from 'lucide-react';

interface WorkflowCompletionProps {
  workflowId: WorkflowId;
  onDismiss?: () => void;
  onViewDashboard?: () => void;
  onContinue?: () => void;
  customMessage?: string;
  showSteps?: boolean;
}

export default function WorkflowCompletion({
  workflowId,
  onDismiss,
  onViewDashboard,
  onContinue,
  customMessage,
  showSteps = true
}: WorkflowCompletionProps) {
  const navigate = useNavigate();
  const workflow = WorkflowTracking.getWorkflow(workflowId);
  const [impactMetrics, setImpactMetrics] = useState<WorkflowImpactMetrics | null>(null);

  // Track outcomes and load impact metrics when component mounts
  useEffect(() => {
    if (workflow?.completedAt) {
      // Track outcome (async, won't block)
      WorkflowOutcomes.trackWorkflowOutcome(workflowId).then(() => {
        // Load impact metrics after tracking
        const metrics = WorkflowOutcomes.getImpactMetrics(workflowId);
        setImpactMetrics(metrics);
      }).catch(err => {
        console.error('Error tracking workflow outcome:', err);
      });
    }
  }, [workflowId, workflow?.completedAt]);

  if (!workflow || !workflow.completedAt) {
    return null;
  }

  const completedSteps = workflow.steps.filter(s => s.status === 'completed');
  const totalSteps = workflow.steps.length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Career Hub': return 'from-blue-500 to-indigo-600';
      case 'Brand Building': return 'from-purple-500 to-pink-600';
      case 'Upskilling': return 'from-green-500 to-emerald-600';
      case 'Cross-Category': return 'from-orange-500 to-amber-600';
      default: return 'from-green-500 to-emerald-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Career Hub': return <Target className="w-16 h-16" />;
      case 'Brand Building': return <Sparkles className="w-16 h-16" />;
      case 'Upskilling': return <TrendingUp className="w-16 h-16" />;
      case 'Cross-Category': return <Award className="w-16 h-16" />;
      default: return <Trophy className="w-16 h-16" />;
    }
  };

  const gradient = getCategoryColor(workflow.category);
  const Icon = getCategoryIcon(workflow.category);

  const handleViewDashboard = () => {
    if (onViewDashboard) {
      onViewDashboard();
    } else {
      navigate('/dashboard');
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  // Calculate completion stats
  const completionDate = workflow.completedAt ? new Date(workflow.completedAt) : null;
  const daysToComplete = workflow.startedAt && workflow.completedAt
    ? Math.ceil((new Date(workflow.completedAt).getTime() - new Date(workflow.startedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-8 text-white shadow-xl relative overflow-hidden mb-6 animate-fadeIn`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full"></div>
      </div>

      <div className="relative z-10">
        {/* Close Button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {Icon}
          </div>
          <h3 className="text-3xl font-bold mb-2">🎉 Workflow Complete!</h3>
          <p className="text-white/90 text-lg mb-2">
            {customMessage || `You've completed the ${workflow.name} workflow!`}
          </p>
          {completionDate && (
            <p className="text-white/70 text-sm">
              Completed on {completionDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
              {daysToComplete && daysToComplete > 0 && (
                <span> • Completed in {daysToComplete} {daysToComplete === 1 ? 'day' : 'days'}</span>
              )}
            </p>
          )}
        </div>

        {/* Completion Stats */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{completedSteps.length}</div>
              <div className="text-sm text-white/80">Steps Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{totalSteps}</div>
              <div className="text-sm text-white/80">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{workflow.progress}%</div>
              <div className="text-sm text-white/80">Progress</div>
            </div>
          </div>

          {/* Real-World Impact Metrics */}
          {impactMetrics && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold mb-3 text-center">Your Real-World Impact:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {impactMetrics.applicationsSubmitted !== undefined && (
                  <div className="text-center">
                    <div className="text-xl font-bold">{impactMetrics.applicationsSubmitted}</div>
                    <div className="text-xs text-white/80">Applications</div>
                  </div>
                )}
                {impactMetrics.interviewsScheduled !== undefined && (
                  <div className="text-center">
                    <div className="text-xl font-bold">{impactMetrics.interviewsScheduled}</div>
                    <div className="text-xs text-white/80">Interviews</div>
                  </div>
                )}
                {impactMetrics.skillsImproved !== undefined && (
                  <div className="text-center">
                    <div className="text-xl font-bold">{impactMetrics.skillsImproved}</div>
                    <div className="text-xs text-white/80">Skills Improved</div>
                  </div>
                )}
                {impactMetrics.certificationsEarned !== undefined && (
                  <div className="text-center">
                    <div className="text-xl font-bold">{impactMetrics.certificationsEarned}</div>
                    <div className="text-xs text-white/80">Certifications</div>
                  </div>
                )}
                {impactMetrics.brandScoreIncrease !== undefined && (
                  <div className="text-center">
                    <div className="text-xl font-bold">+{impactMetrics.brandScoreIncrease}</div>
                    <div className="text-xs text-white/80">Brand Score</div>
                  </div>
                )}
                {impactMetrics.contentCreated !== undefined && (
                  <div className="text-center">
                    <div className="text-xl font-bold">{impactMetrics.contentCreated}</div>
                    <div className="text-xs text-white/80">Content Created</div>
                  </div>
                )}
                {impactMetrics.averageMatchScore !== undefined && (
                  <div className="text-center">
                    <div className="text-xl font-bold">{impactMetrics.averageMatchScore}%</div>
                    <div className="text-xs text-white/80">Avg Match Score</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed Steps List */}
          {showSteps && completedSteps.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-3 text-center">What you accomplished:</p>
              <div className={`grid gap-2 text-sm ${
                completedSteps.length <= 4 ? 'grid-cols-2' : 
                completedSteps.length <= 6 ? 'grid-cols-2' : 
                'grid-cols-2 md:grid-cols-3'
              }`}>
                {completedSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className="text-white/90">✓ {step.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleViewDashboard}
            className="px-6 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            View Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
          {onContinue && (
            <button
              onClick={handleContinue}
              className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
            >
              Continue
            </button>
          )}
          {!onContinue && (
            <button
              onClick={handleDismiss}
              className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
            >
              Dismiss
            </button>
          )}
        </div>

        {/* Motivational Footer */}
        <div className="mt-6 pt-6 border-t border-white/20 text-center">
          <p className="text-sm text-white/70">
            🚀 Great work! You're building your career one step at a time.
          </p>
        </div>
      </div>
    </div>
  );
}

