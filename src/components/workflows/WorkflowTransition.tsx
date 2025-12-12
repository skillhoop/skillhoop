import { useNavigate } from 'react-router-dom';
import { WorkflowTracking, type WorkflowId, type WorkflowStep } from '../../lib/workflowTracking';
import { 
  ArrowRight, CheckCircle, Circle, Zap, Sparkles, 
  ChevronRight, Clock, Target, TrendingUp
} from 'lucide-react';

interface WorkflowTransitionProps {
  workflowId: WorkflowId;
  currentFeaturePath: string;
  onAction?: (action: 'continue' | 'skip' | 'dismiss') => void;
  autoShow?: boolean;
  compact?: boolean;
}

export default function WorkflowTransition({
  workflowId,
  currentFeaturePath,
  onAction,
  autoShow = true,
  compact = false
}: WorkflowTransitionProps) {
  const navigate = useNavigate();
  const workflow = WorkflowTracking.getWorkflow(workflowId);

  if (!workflow || !workflow.isActive) return null;

  const currentStepIndex = workflow.steps.findIndex(step => step.featurePath === currentFeaturePath);
  const currentStep = currentStepIndex >= 0 ? workflow.steps[currentStepIndex] : null;
  const nextStep = workflow.steps[currentStepIndex + 1];
  const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
  const totalSteps = workflow.steps.length;

  // Only show if current step is completed and there's a next step
  if (!currentStep || currentStep.status !== 'completed' || !nextStep) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Career Hub': return {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-600',
        textDark: 'text-indigo-900',
        bgDark: 'bg-indigo-600',
        hover: 'hover:bg-indigo-100',
        gradient: 'from-indigo-500 to-purple-600'
      };
      case 'Brand Building': return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        textDark: 'text-purple-900',
        bgDark: 'bg-purple-600',
        hover: 'hover:bg-purple-100',
        gradient: 'from-purple-500 to-pink-600'
      };
      case 'Upskilling': return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        textDark: 'text-green-900',
        bgDark: 'bg-green-600',
        hover: 'hover:bg-green-100',
        gradient: 'from-green-500 to-emerald-600'
      };
      case 'Cross-Category': return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        textDark: 'text-orange-900',
        bgDark: 'bg-orange-600',
        hover: 'hover:bg-orange-100',
        gradient: 'from-orange-500 to-amber-600'
      };
      default: return {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-600',
        textDark: 'text-indigo-900',
        bgDark: 'bg-indigo-600',
        hover: 'hover:bg-indigo-100',
        gradient: 'from-indigo-500 to-purple-600'
      };
    }
  };

  const colors = getCategoryColor(workflow.category);

  const handleContinue = () => {
    // Mark next step as in-progress
    if (nextStep.status === 'not-started') {
      WorkflowTracking.updateStepStatus(workflowId, nextStep.id, 'in-progress');
    }
    
    // Navigate to next step
    navigate(nextStep.featurePath);
    
    if (onAction) {
      onAction('continue');
    }
  };

  const handleSkip = () => {
    if (onAction) {
      onAction('skip');
    }
  };

  const handleDismiss = () => {
    if (onAction) {
      onAction('dismiss');
    }
  };

  if (compact) {
    return (
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 ${colors.bgDark} rounded-lg flex items-center justify-center text-white`}>
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${colors.textDark}`}>
                Ready for next step?
              </p>
              <p className={`text-xs ${colors.text}`}>
                {nextStep.name} • Step {currentStepIndex + 2} of {totalSteps}
              </p>
            </div>
          </div>
          <button
            onClick={handleContinue}
            className={`px-4 py-2 ${colors.bgDark} text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2`}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r ${colors.gradient} rounded-2xl p-6 text-white shadow-xl mb-4 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full -ml-8 -mb-8"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Step Complete! 🎉</h3>
            <p className="text-white/90 text-sm">
              You've completed: <strong>{currentStep.name}</strong>
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/80">Progress</span>
            <span className="font-semibold">{completedSteps} of {totalSteps} steps</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${workflow.progress}%` }}
            />
          </div>
        </div>

        {/* Next Step Preview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Next Step:</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-sm font-bold">{currentStepIndex + 2}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{nextStep.name}</p>
              <p className="text-xs text-white/70">{nextStep.feature}</p>
            </div>
            <Circle className="w-4 h-4 text-white/50" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleContinue}
            className="flex-1 px-6 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Zap className="w-5 h-5" />
            Continue to {nextStep.name}
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleDismiss}
            className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

