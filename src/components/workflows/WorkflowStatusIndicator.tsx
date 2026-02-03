import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowTracking, WORKFLOW_DEFINITIONS, type WorkflowId } from '../../lib/workflowTracking';
import { Target, ArrowRight, Info, X } from 'lucide-react';

interface WorkflowStatusIndicatorProps {
  featurePath: string;
  featureName: string;
  compact?: boolean;
  onDismiss?: () => void;
}

export default function WorkflowStatusIndicator({
  featurePath,
  featureName,
  compact = false,
  onDismiss
}: WorkflowStatusIndicatorProps) {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Find workflows that include this feature
    const allWorkflows = WorkflowTracking.getAllWorkflows();
    const relevantWorkflows = allWorkflows.filter((workflow: any) => 
      workflow.isActive && 
      workflow.steps.some((step: any) => step.featurePath === featurePath)
    );
    setWorkflows(relevantWorkflows);
  }, [featurePath]);

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (dismissed || workflows.length === 0) {
    return null;
  }

  // Get the primary workflow (first active one)
  const primaryWorkflow = workflows[0];
  const definition = WORKFLOW_DEFINITIONS[primaryWorkflow.id as WorkflowId];
  const currentStep = primaryWorkflow.steps.find((step: any) => step.featurePath === featurePath);
  const nextStep = primaryWorkflow.steps.find((step: any) => 
    step.status === 'not-started' || step.status === 'in-progress'
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Career Hub': return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        textDark: 'text-blue-900',
        bgDark: 'bg-blue-600'
      };
      case 'Brand Building': return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        textDark: 'text-purple-900',
        bgDark: 'bg-purple-600'
      };
      case 'Upskilling': return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        textDark: 'text-green-900',
        bgDark: 'bg-green-600'
      };
      case 'Cross-Category': return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        textDark: 'text-orange-900',
        bgDark: 'bg-orange-600'
      };
      default: return {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-600',
        textDark: 'text-indigo-900',
        bgDark: 'bg-indigo-600'
      };
    }
  };

  const colors = getCategoryColor(definition.category);

  if (compact) {
    return (
      <div className={`${colors.bg} border ${colors.border} rounded-lg p-3 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className={`w-4 h-4 ${colors.text}`} />
            <span className={`text-sm font-medium ${colors.textDark}`}>
              Part of: {definition.name}
            </span>
          </div>
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className={`${colors.text} hover:opacity-70 transition-opacity`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 mb-6`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-lg ${colors.bgDark} flex items-center justify-center flex-shrink-0`}>
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Info className={`w-4 h-4 ${colors.text}`} />
              <h4 className={`font-semibold ${colors.textDark}`}>
                This {featureName.toLowerCase()} is part of:
              </h4>
            </div>
            <p className={`font-bold text-lg ${colors.textDark} mb-2`}>
              {definition.name}
            </p>
            
            {/* Workflow Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600">Workflow Progress</span>
                <span className={`text-xs font-semibold ${colors.text}`}>
                  {primaryWorkflow.progress}%
                </span>
              </div>
              <div className="w-full bg-white/80 rounded-full h-2">
                <div
                  className={`${colors.bgDark} h-2 rounded-full transition-all`}
                  style={{ width: `${primaryWorkflow.progress}%` }}
                />
              </div>
            </div>

            {/* Current Step */}
            {currentStep && (
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colors.bgDark}`} />
                  <span className="text-sm text-slate-700">
                    {currentStep.name} {currentStep.status === 'completed' && '✓'}
                  </span>
                </div>
              </div>
            )}

            {/* Next Step */}
            {nextStep && nextStep.id !== currentStep?.id && (
              <div className="flex items-center gap-2">
                <ArrowRight className={`w-4 h-4 ${colors.text}`} />
                <button
                  onClick={() => {
                    if (nextStep.status === 'not-started') {
                      WorkflowTracking.updateStepStatus(primaryWorkflow.id, nextStep.id, 'in-progress');
                    }
                    navigate(nextStep.featurePath);
                  }}
                  className={`text-sm font-semibold ${colors.text} hover:underline`}
                >
                  {nextStep.name} (Next step)
                </button>
              </div>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className={`${colors.text} hover:opacity-70 transition-opacity flex-shrink-0 ml-2`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
