import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowTracking, type WorkflowId, type Workflow } from '../../lib/workflowTracking';
import { Target, ArrowRight, X, Sparkles, CheckCircle, Play } from 'lucide-react';
import WorkflowWizard from './WorkflowWizard';

interface FirstTimeEntryCardProps {
  featurePath: string;
  featureName: string;
  onDismiss?: () => void;
}

export default function FirstTimeEntryCard({ featurePath, featureName, onDismiss }: FirstTimeEntryCardProps) {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [wizardWorkflowId, setWizardWorkflowId] = useState<WorkflowId | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    // Check if this is first time entering this feature
    const storageKey = `first_time_${featurePath.replace(/\//g, '_')}`;
    const hasVisited = localStorage.getItem(storageKey);
    
    if (!hasVisited) {
      setIsFirstTime(true);
      // Mark as visited
      localStorage.setItem(storageKey, 'true');
    }

    // Find workflows that include this feature
    const allWorkflows = WorkflowTracking.getAllWorkflows();
    const relevantWorkflows = allWorkflows.filter(workflow => 
      workflow.steps.some(step => step.featurePath === featurePath)
    );
    setWorkflows(relevantWorkflows);
  }, [featurePath]);

  const handleStartWorkflow = async (workflowId: WorkflowId) => {
    // Initialize workflow if not already active
    const workflow = WorkflowTracking.getWorkflow(workflowId);
    if (!workflow || !workflow.isActive) {
      await WorkflowTracking.initializeWorkflow(workflowId);
    }
    
    // Open wizard instead of direct navigation
    setWizardWorkflowId(workflowId);
    setIsWizardOpen(true);
    handleDismiss();
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (dismissed || !isFirstTime || workflows.length === 0) {
    return null;
  }

  // Get the primary workflow (first one found, or most relevant)
  const primaryWorkflow = workflows[0];
  const currentStep = primaryWorkflow.steps.find(step => step.featurePath === featurePath);
  const stepIndex = primaryWorkflow.steps.findIndex(step => step.featurePath === featurePath);
  const nextSteps = primaryWorkflow.steps.slice(stepIndex + 1, stepIndex + 4); // Show next 3 steps

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Career Hub': return 'from-blue-500 to-slate-600';
      case 'Brand Building': return 'from-purple-500 to-pink-600';
      case 'Upskilling': return 'from-green-500 to-emerald-600';
      case 'Cross-Category': return 'from-orange-500 to-amber-600';
      default: return 'from-slate-500 to-purple-600';
    }
  };

  return (
    <div className="mb-6 animate-fadeIn">
      <div className={`bg-gradient-to-r ${getCategoryColor(primaryWorkflow.category)} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
        </div>

        <div className="relative z-10">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-4 pr-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-xl font-bold">You're starting: {featureName}</h3>
              </div>
              <p className="text-white/90">
                This is part of the <strong>{primaryWorkflow.name}</strong> workflow.
              </p>
              {currentStep && (
                <p className="text-sm text-white/80 mt-1">
                  Step {stepIndex + 1} of {primaryWorkflow.steps.length}: {currentStep.name}
                </p>
              )}
            </div>
          </div>

          {/* Workflow Steps Preview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <h4 className="font-semibold mb-3 text-sm">Here's what comes next:</h4>
            <div className="space-y-2">
              {/* Current Step */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">{stepIndex + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{currentStep?.name || featureName}</p>
                  <p className="text-xs text-white/70">You are here</p>
                </div>
                <CheckCircle className="w-4 h-4 text-white/50" />
              </div>

              {/* Next Steps */}
              {nextSteps.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-3 opacity-75">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">{stepIndex + 2 + idx}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{step.name}</p>
                    <p className="text-xs text-white/60">{step.feature}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/50" />
                </div>
              ))}

              {nextSteps.length === 0 && (
                <div className="flex items-center gap-3 opacity-75">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Complete the workflow!</p>
                    <p className="text-xs text-white/60">You're on the last step</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleStartWorkflow(primaryWorkflow.id)}
              className="flex-1 px-6 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Play className="w-5 h-5" />
              Start Workflow
            </button>
            <button
              onClick={handleDismiss}
              className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
            >
              Skip for now
            </button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-white/70 mt-4 text-center">
            Workflows guide you through related features to achieve your career goals
          </p>
        </div>
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

