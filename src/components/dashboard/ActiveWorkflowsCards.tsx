import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowTracking, WORKFLOW_DEFINITIONS, type WorkflowId, type Workflow } from '../../lib/workflowTracking';
import { CheckCircle, ArrowRight, Rocket, Target } from 'lucide-react';
import WorkflowWizard from '../workflows/WorkflowWizard';

interface ActiveWorkflowsCardsProps {
  workflows: Workflow[];
}

export default function ActiveWorkflowsCards({ workflows }: ActiveWorkflowsCardsProps) {
  const navigate = useNavigate();
  const [wizardWorkflowId, setWizardWorkflowId] = useState<WorkflowId | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Filter only active workflows
  const activeWorkflows = workflows.filter(w => w.isActive && !w.completedAt);

  if (activeWorkflows.length === 0) {
    return null;
  }

  const handleContinueWorkflow = (workflowId: WorkflowId) => {
    // Open wizard instead of direct navigation
    setWizardWorkflowId(workflowId);
    setIsWizardOpen(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Career Hub': return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        textDark: 'text-blue-900',
        bgDark: 'bg-blue-600',
        progress: 'bg-blue-600',
        gradient: 'from-blue-500 to-slate-600'
      };
      case 'Brand Building': return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        textDark: 'text-purple-900',
        bgDark: 'bg-purple-600',
        progress: 'bg-purple-600',
        gradient: 'from-purple-500 to-pink-600'
      };
      case 'Upskilling': return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        textDark: 'text-green-900',
        bgDark: 'bg-green-600',
        progress: 'bg-green-600',
        gradient: 'from-green-500 to-emerald-600'
      };
      case 'Cross-Category': return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        textDark: 'text-orange-900',
        bgDark: 'bg-orange-600',
        progress: 'bg-orange-600',
        gradient: 'from-orange-500 to-amber-600'
      };
      default: return {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-600',
        textDark: 'text-slate-900',
        bgDark: 'bg-slate-600',
        progress: 'bg-slate-600',
        gradient: 'from-slate-500 to-purple-600'
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="w-6 h-6 text-slate-600" />
        <h2 className="text-2xl font-bold text-slate-900">Active Workflows</h2>
      </div>

      {activeWorkflows.map((workflow, index) => {
        const definition = WORKFLOW_DEFINITIONS[workflow.id];
        const colors = getCategoryColor(definition.category);
        const completedSteps = workflow.steps.filter(s => s.status === 'completed');
        const nextStep = WorkflowTracking.getNextStep(workflow.id);
        const progress = workflow.progress || 0;

        // Get completed step names (show all, but limit display to 2-3 most recent)
        const recentCompletedSteps = completedSteps.slice(-2).map(s => s.name);

        return (
          <div
            key={workflow.id}
            className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all`}
          >
            {/* Workflow Name */}
            <div className="mb-3">
              <h3 className={`text-lg font-bold ${colors.textDark} mb-1`}>
                Workflow {index + 1}: {definition.name}
              </h3>
            </div>

            {/* Progress Bar with Percentage */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-full bg-white/80 rounded-full h-4 overflow-hidden border border-white/40">
                  <div
                    className={`${colors.progress} h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${progress}%` }}
                  >
                    {progress > 15 && (
                      <span className="text-xs font-semibold text-white">{progress}%</span>
                    )}
                  </div>
                </div>
                {progress <= 15 && (
                  <span className={`ml-2 text-sm font-semibold ${colors.textDark} whitespace-nowrap`}>
                    {progress}% Complete
                  </span>
                )}
              </div>
            </div>

            {/* Completed Steps with Checkmarks */}
            {recentCompletedSteps.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  {recentCompletedSteps.map((stepName, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                      <span className={`text-sm font-medium ${colors.textDark}`}>
                        {stepName}
                      </span>
                    </div>
                  ))}
                  {completedSteps.length > 2 && (
                    <span className={`text-xs font-medium ${colors.text}`}>
                      +{completedSteps.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Next Step Preview */}
            {nextStep && (
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <ArrowRight className={`w-4 h-4 ${colors.text}`} />
                  <span className={`text-sm font-semibold ${colors.textDark}`}>
                    Next: {nextStep.name}
                  </span>
                </div>
                {nextStep.feature && (
                  <p className="text-xs text-slate-600 mt-1 ml-6 italic">
                    {nextStep.feature}
                  </p>
                )}
              </div>
            )}

            {/* Continue Workflow Button */}
            <button
              onClick={() => handleContinueWorkflow(workflow.id)}
              className={`w-full px-5 py-3 ${colors.bgDark} text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg`}
            >
              Continue Workflow
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );
      })}

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
