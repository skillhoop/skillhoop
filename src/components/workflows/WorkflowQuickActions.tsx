import { useNavigate } from 'react-router-dom';
import { WorkflowTracking, type WorkflowId } from '../../lib/workflowTracking';
import { 
  ArrowRight, Zap, Target, CheckCircle, Circle, 
  Clock, TrendingUp, Sparkles
} from 'lucide-react';

interface WorkflowQuickActionsProps {
  workflowId: WorkflowId;
  currentFeaturePath: string;
  compact?: boolean;
}

export default function WorkflowQuickActions({
  workflowId,
  currentFeaturePath,
  compact = false
}: WorkflowQuickActionsProps) {
  const navigate = useNavigate();
  const workflow = WorkflowTracking.getWorkflow(workflowId);

  if (!workflow || !workflow.isActive) return null;

  const currentStepIndex = workflow.steps.findIndex(step => step.featurePath === currentFeaturePath);
  const nextStep = workflow.steps[currentStepIndex + 1];
  const nextTwoSteps = workflow.steps.slice(currentStepIndex + 1, currentStepIndex + 3);

  if (!nextStep) return null;

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
  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
      textDark: 'text-indigo-900',
      bgDark: 'bg-indigo-600',
      hover: 'hover:bg-indigo-100',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      textDark: 'text-purple-900',
      bgDark: 'bg-purple-600',
      hover: 'hover:bg-purple-100',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      textDark: 'text-green-900',
      bgDark: 'bg-green-600',
      hover: 'hover:bg-green-100',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      textDark: 'text-orange-900',
      bgDark: 'bg-orange-600',
      hover: 'hover:bg-orange-100',
    },
  };

  const styles = colorClasses[color];

  const handleNavigateToStep = (stepPath: string, stepId: string) => {
    const step = workflow.steps.find(s => s.id === stepId);
    if (step && step.status === 'not-started') {
      WorkflowTracking.updateStepStatus(workflowId, stepId, 'in-progress');
    }
    navigate(stepPath);
  };

  if (compact) {
    return (
      <div className={`${styles.bg} border ${styles.border} rounded-lg p-3 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className={`w-4 h-4 ${styles.text}`} />
            <span className={`text-xs font-medium ${styles.textDark}`}>
              Next: {nextStep.name}
            </span>
          </div>
          <button
            onClick={() => handleNavigateToStep(nextStep.featurePath, nextStep.id)}
            className={`px-3 py-1.5 ${styles.bgDark} text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1`}
          >
            Go
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-xl p-4 mb-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className={`w-4 h-4 ${styles.text}`} />
        <h4 className={`text-sm font-semibold ${styles.textDark}`}>Quick Actions</h4>
      </div>
      
      <div className="space-y-2">
        {nextTwoSteps.map((step, idx) => {
          const isNext = idx === 0;
          const isClickable = step.status !== 'not-started' || isNext;
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && handleNavigateToStep(step.featurePath, step.id)}
              disabled={!isClickable}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg border transition-all
                ${isClickable ? `${styles.hover} cursor-pointer` : 'opacity-50 cursor-not-allowed'}
                ${isNext ? `${styles.bgDark} text-white border-transparent` : `bg-white ${styles.border}`}
              `}
            >
              <div className="flex items-center gap-3">
                {isNext ? (
                  <Zap className="w-4 h-4" />
                ) : (
                  <Circle className={`w-4 h-4 ${styles.text}`} />
                )}
                <div className="text-left">
                  <p className={`text-sm font-medium ${isNext ? 'text-white' : styles.textDark}`}>
                    {step.name}
                  </p>
                  <p className={`text-xs ${isNext ? 'text-white/80' : styles.text}`}>
                    {step.feature}
                  </p>
                </div>
              </div>
              {isNext && (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

