import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowTracking, type Workflow, type WorkflowStep } from '../../lib/workflowTracking';
import { 
  Target, ArrowRight, X, CheckCircle, Circle, Sparkles, 
  ChevronRight, Info, Clock, TrendingUp, Zap
} from 'lucide-react';

interface WorkflowPromptProps {
  workflowId: string;
  currentFeaturePath: string;
  onDismiss?: () => void;
  onAction?: (action: string) => void;
  message?: string;
  actionText?: string;
  actionUrl?: string;
}

export default function WorkflowPrompt({
  workflowId,
  currentFeaturePath,
  onDismiss,
  onAction,
  message,
  actionText,
  actionUrl
}: WorkflowPromptProps) {
  const navigate = useNavigate();
  const [showFullOverview, setShowFullOverview] = useState(false);
  const workflow = WorkflowTracking.getWorkflow(workflowId as any);
  
  if (!workflow) return null;

  const currentStepIndex = workflow.steps.findIndex(step => step.featurePath === currentFeaturePath);
  const currentStep = currentStepIndex >= 0 ? workflow.steps[currentStepIndex] : null;
  const nextSteps = workflow.steps.slice(currentStepIndex + 1, currentStepIndex + 3);
  const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
  const totalSteps = workflow.steps.length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Career Hub': return 'indigo';
      case 'Brand Building': return 'purple';
      case 'Upskilling': return 'green';
      case 'Cross-Category': return 'orange';
      default: return 'indigo';
    }
  };

  const color = getCategoryColor(workflow.category);
  const gradientClasses = {
    indigo: 'from-indigo-500 to-purple-600',
    purple: 'from-purple-500 to-pink-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600',
  };

  const gradient = gradientClasses[color];

  const handleAction = () => {
    if (actionUrl) {
      navigate(actionUrl);
    }
    if (onAction) {
      onAction('continue');
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleSkip = () => {
    // Mark current step as skipped
    if (currentStep) {
      WorkflowTracking.updateStepStatus(workflowId as any, currentStep.id, 'skipped');
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleNavigateToStep = (step: WorkflowStep) => {
    if (step.status !== 'not-started' || step.featurePath === currentFeaturePath) {
      navigate(step.featurePath);
      if (onDismiss) {
        onDismiss();
      }
    }
  };

  const getStepStatusIcon = (step: WorkflowStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else if (step.status === 'in-progress' || index === currentStepIndex) {
      return <Circle className="w-4 h-4 text-white fill-white" />;
    } else if (step.status === 'skipped') {
      return <Circle className="w-4 h-4 text-white/50" />;
    } else {
      return <Circle className="w-4 h-4 text-white/30" />;
    }
  };

  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white shadow-xl mb-4 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-xl font-bold">{workflow.name}</h3>
              </div>
              {currentStep && (
                <p className="text-white/90 text-sm">
                  Step {currentStepIndex + 1} of {totalSteps}: {currentStep.name}
                </p>
              )}
              {message && (
                <p className="text-white/80 text-sm mt-2">{message}</p>
              )}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/80">Progress</span>
            <span className="font-semibold">{completedSteps} of {totalSteps} completed</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all" 
              style={{ width: `${workflow.progress}%` }} 
            />
          </div>
        </div>

        {/* Toggle Full Overview */}
        <button
          onClick={() => setShowFullOverview(!showFullOverview)}
          className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors mb-4"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">
              {showFullOverview ? 'Hide' : 'Show'} Full Workflow Overview
            </span>
          </div>
          <ChevronRight 
            className={`w-4 h-4 transition-transform ${showFullOverview ? 'rotate-90' : ''}`} 
          />
        </button>

        {/* Full Overview */}
        {showFullOverview && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <h4 className="font-semibold mb-3 text-sm">Complete Workflow Path:</h4>
            <div className="space-y-2">
              {workflow.steps.map((step, index) => {
                const isCurrent = index === currentStepIndex;
                const isClickable = step.status !== 'not-started' || isCurrent;
                
                return (
                  <div
                    key={step.id}
                    onClick={() => isClickable && handleNavigateToStep(step)}
                    className={`
                      flex items-center gap-3 p-2 rounded-lg transition-all
                      ${isClickable ? 'cursor-pointer hover:bg-white/10' : 'opacity-50'}
                      ${isCurrent ? 'bg-white/20' : ''}
                    `}
                  >
                    {getStepStatusIcon(step, index)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold w-6">{index + 1}.</span>
                        <span className={`text-sm ${isCurrent ? 'font-semibold' : ''}`}>
                          {step.name}
                        </span>
                        {isCurrent && (
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Current</span>
                        )}
                      </div>
                      <p className="text-xs text-white/70 ml-8">{step.feature}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Steps Preview */}
        {nextSteps.length > 0 && !showFullOverview && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">What's Next:</span>
            </div>
            <div className="space-y-1">
              {nextSteps.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-2 text-sm text-white/80">
                  <ChevronRight className="w-3 h-3" />
                  <span>{currentStepIndex + 2 + idx}. {step.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {actionText && actionUrl && (
            <button
              onClick={handleAction}
              className="flex-1 px-6 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              {actionText}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
          >
            Skip This Step
          </button>
          {!actionText && (
            <button
              onClick={onDismiss}
              className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              Continue Later
            </button>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Clock className="w-3 h-3" />
            <span>Workflows guide you through related features to achieve your career goals</span>
          </div>
        </div>
      </div>
    </div>
  );
}

