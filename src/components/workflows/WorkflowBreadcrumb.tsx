import { useNavigate } from 'react-router-dom';
import { WorkflowTracking, type Workflow, type WorkflowStep } from '../../lib/workflowTracking';
import { Target, CheckCircle, Circle, ArrowRight, ChevronRight } from 'lucide-react';

interface WorkflowBreadcrumbProps {
  workflowId: string;
  currentFeaturePath: string;
  compact?: boolean;
}

export default function WorkflowBreadcrumb({ workflowId, currentFeaturePath, compact = false }: WorkflowBreadcrumbProps) {
  const navigate = useNavigate();
  const workflow = WorkflowTracking.getWorkflow(workflowId as any);
  
  if (!workflow) return null;

  const currentStepIndex = workflow.steps.findIndex(step => step.featurePath === currentFeaturePath);
  const currentStep = currentStepIndex >= 0 ? workflow.steps[currentStepIndex] : null;

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
      bgLight: 'bg-indigo-200',
      hover: 'hover:bg-indigo-100',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      textDark: 'text-purple-900',
      bgDark: 'bg-purple-600',
      bgLight: 'bg-purple-200',
      hover: 'hover:bg-purple-100',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      textDark: 'text-green-900',
      bgDark: 'bg-green-600',
      bgLight: 'bg-green-200',
      hover: 'hover:bg-green-100',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      textDark: 'text-orange-900',
      bgDark: 'bg-orange-600',
      bgLight: 'bg-orange-200',
      hover: 'hover:bg-orange-100',
    },
  };

  const styles = colorClasses[color];

  const handleStepClick = (step: WorkflowStep) => {
    if (step.status !== 'not-started' || step.featurePath === currentFeaturePath) {
      navigate(step.featurePath);
    }
  };

  const getStepStatusIcon = (step: WorkflowStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (step.status === 'in-progress' || index === currentStepIndex) {
      return <Circle className="w-4 h-4 text-blue-600 fill-blue-600" />;
    } else {
      return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getStepStatusClass = (step: WorkflowStep, index: number) => {
    if (step.status === 'completed') {
      return 'text-green-700 bg-green-50 border-green-200';
    } else if (step.status === 'in-progress' || index === currentStepIndex) {
      return `${styles.textDark} ${styles.bg} ${styles.border}`;
    } else {
      return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  if (compact) {
    // Compact version - shows only current step and progress
    return (
      <div className={`${styles.bg} border ${styles.border} rounded-xl p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className={`w-5 h-5 ${styles.text}`} />
            <div>
              <p className={`text-sm font-semibold ${styles.textDark}`}>{workflow.name}</p>
              {currentStep && (
                <p className={`text-xs ${styles.text}`}>
                  Step {currentStepIndex + 1} of {workflow.steps.length}: {currentStep.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-24 ${styles.bgLight} rounded-full h-2`}>
              <div 
                className={`${styles.bgDark} h-2 rounded-full transition-all`} 
                style={{ width: `${workflow.progress}%` }} 
              />
            </div>
            <span className={styles.text}>{Math.round(workflow.progress)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // Full version - shows all steps with navigation
  return (
    <div className={`${styles.bg} border ${styles.border} rounded-xl p-4 mb-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Target className={`w-5 h-5 ${styles.text}`} />
          <div>
            <p className={`text-sm font-semibold ${styles.textDark}`}>{workflow.name}</p>
            {currentStep && (
              <p className={`text-xs ${styles.text}`}>
                Step {currentStepIndex + 1} of {workflow.steps.length}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-24 ${styles.bgLight} rounded-full h-2`}>
            <div 
              className={`${styles.bgDark} h-2 rounded-full transition-all`} 
              style={{ width: `${workflow.progress}%` }} 
            />
          </div>
          <span className={styles.text}>{Math.round(workflow.progress)}%</span>
        </div>
      </div>

      {/* Full Path Steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {workflow.steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isClickable = step.status !== 'not-started' || isCurrent;
          const stepStatusClass = getStepStatusClass(step, index);

          return (
            <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
              {/* Step Circle */}
              <button
                onClick={() => handleStepClick(step)}
                disabled={!isClickable}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
                  ${isCurrent ? `${styles.bgDark} text-white border-transparent` : stepStatusClass}
                `}
                title={step.name}
              >
                <div className="flex items-center gap-2">
                  {getStepStatusIcon(step, index)}
                  <span className="text-xs font-medium whitespace-nowrap">
                    {index + 1}. {step.name}
                  </span>
                </div>
              </button>

              {/* Arrow between steps */}
              {index < workflow.steps.length - 1 && (
                <ChevronRight 
                  className={`w-4 h-4 ${styles.text} flex-shrink-0`} 
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Details */}
      {currentStep && (
        <div className={`mt-4 pt-4 border-t ${styles.border}`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 ${styles.bgDark} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-sm font-bold">{currentStepIndex + 1}</span>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${styles.textDark} mb-1`}>
                Current Step: {currentStep.name}
              </p>
              <p className={`text-xs ${styles.text}`}>
                {currentStep.feature} • {workflow.category}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

