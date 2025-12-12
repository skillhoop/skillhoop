import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowRecommendations, type WorkflowRecommendation } from '../../lib/workflowRecommendations';
import { WorkflowTracking, WORKFLOW_DEFINITIONS, type WorkflowId } from '../../lib/workflowTracking';
import WorkflowWizard from '../workflows/WorkflowWizard';
import { 
  Sparkles, ArrowRight, Clock, Target, TrendingUp, 
  CheckCircle, X, Zap, Award, BookOpen, Briefcase
} from 'lucide-react';

interface WorkflowRecommendationsProps {
  limit?: number;
  showTitle?: boolean;
  onDismiss?: (workflowId: WorkflowId) => void;
  dismissedWorkflows?: WorkflowId[];
}

export default function WorkflowRecommendationsComponent({
  limit = 3,
  showTitle = true,
  onDismiss,
  dismissedWorkflows = []
}: WorkflowRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<WorkflowRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wizardWorkflowId, setWizardWorkflowId] = useState<WorkflowId | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        const recs = await WorkflowRecommendations.getRecommendations(limit + 5);
        // Filter out dismissed workflows
        const filtered = recs.filter(rec => !dismissedWorkflows.includes(rec.workflowId));
        setRecommendations(filtered.slice(0, limit));
      } catch (error) {
        console.error('Error loading workflow recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [limit, dismissedWorkflows]);

  const handleStartWorkflow = async (workflowId: WorkflowId) => {
    // Show wizard instead of directly navigating
    setWizardWorkflowId(workflowId);
    setIsWizardOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Career Hub': return <Briefcase className="w-5 h-5" />;
      case 'Brand Building': return <Target className="w-5 h-5" />;
      case 'Upskilling': return <BookOpen className="w-5 h-5" />;
      case 'Cross-Category': return <Zap className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'Career Hub': return 'from-blue-500 to-indigo-600';
      case 'Brand Building': return 'from-purple-500 to-pink-600';
      case 'Upskilling': return 'from-green-500 to-emerald-600';
      case 'Cross-Category': return 'from-orange-500 to-amber-600';
      default: return 'from-indigo-500 to-purple-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="text-xs font-semibold bg-red-500/20 text-red-100 px-2 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" />
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="text-xs font-semibold bg-amber-500/20 text-amber-100 px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold bg-blue-500/20 text-blue-100 px-2 py-1 rounded-full">
            Low Priority
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-300';
    if (score >= 50) return 'text-amber-300';
    return 'text-blue-300';
  };

  if (isLoading) {
    return (
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI-Powered Workflow Recommendations</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Personalized suggestions based on your progress</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const definition = WORKFLOW_DEFINITIONS[rec.workflowId];
          const workflows = WorkflowTracking.getAllWorkflows();
          const workflow = workflows.find(w => w.id === rec.workflowId);
          const isActive = workflow?.isActive || false;

          return (
            <div
              key={rec.workflowId}
              className={`bg-gradient-to-br ${getCategoryGradient(rec.category)} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    {getCategoryIcon(rec.category)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(rec.priority)}
                    {onDismiss && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(rec.workflowId);
                        }}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title and Status */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{definition.name}</h3>
                    {isActive && (
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-white/90 text-sm line-clamp-2">{definition.description}</p>
                </div>

                {/* Score and Metadata */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span className={`font-semibold ${getScoreColor(rec.score)}`}>
                      {Math.round(rec.score)}% Match
                    </span>
                  </div>
                  {rec.estimatedTime && (
                    <div className="flex items-center gap-1 text-white/80">
                      <Clock className="w-4 h-4" />
                      <span>{rec.estimatedTime}</span>
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div className="mb-4">
                  <p className="text-white/90 text-sm leading-relaxed">{rec.reason}</p>
                </div>

                {/* Prerequisites */}
                {rec.prerequisites && rec.prerequisites.length > 0 && (
                  <div className="mb-4 p-3 bg-white/10 rounded-lg">
                    <p className="text-xs font-semibold mb-1 text-white/80">Prerequisites:</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.prerequisites.map((prereq) => {
                        const prereqDef = WORKFLOW_DEFINITIONS[prereq];
                        const prereqWorkflow = workflows.find(w => w.id === prereq);
                        const isCompleted = prereqWorkflow?.completedAt !== undefined;
                        
                        return (
                          <span
                            key={prereq}
                            className={`text-xs px-2 py-1 rounded-full ${
                              isCompleted
                                ? 'bg-green-500/30 text-green-100'
                                : 'bg-white/20 text-white/80'
                            }`}
                          >
                            {isCompleted && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {prereqDef.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {rec.tags && rec.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {rec.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleStartWorkflow(rec.workflowId)}
                  className="w-full py-3 px-4 bg-white text-slate-700 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  {isActive ? 'Continue Workflow' : 'Start Workflow'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflow Wizard */}
      {wizardWorkflowId && (
        <WorkflowWizard
          workflowId={wizardWorkflowId}
          isOpen={isWizardOpen}
          onClose={() => {
            setIsWizardOpen(false);
            setWizardWorkflowId(null);
          }}
        />
      )}
    </div>
  );
}

