import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowTracking, type WorkflowId, type Workflow, type WorkflowStep } from '../../lib/workflowTracking';
import { X, ArrowRight, ArrowLeft, CheckCircle, Circle, Sparkles, Target } from 'lucide-react';

interface WorkflowWizardProps {
  workflowId: WorkflowId;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function WorkflowWizard({ workflowId, isOpen, onClose, onComplete }: WorkflowWizardProps) {
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && workflowId) {
      // Get or initialize workflow
      let wf = WorkflowTracking.getWorkflow(workflowId);
      if (!wf) {
        // Initialize if doesn't exist
        WorkflowTracking.initializeWorkflow(workflowId).then(w => {
          setWorkflow(w);
          updateCompletedSteps(w);
        });
      } else {
        setWorkflow(wf);
        updateCompletedSteps(wf);
        // Set current step to first incomplete step
        const firstIncomplete = wf.steps.findIndex(s => s.status === 'not-started' || s.status === 'in-progress');
        if (firstIncomplete >= 0) {
          setCurrentStepIndex(firstIncomplete);
        }
      }
    }
  }, [isOpen, workflowId]);

  const updateCompletedSteps = (wf: Workflow) => {
    const completed = new Set<string>();
    wf.steps.forEach(step => {
      if (step.status === 'completed') {
        completed.add(step.id);
      }
    });
    setCompletedSteps(completed);
  };

  if (!isOpen || !workflow) return null;

  const currentStep = workflow.steps[currentStepIndex];
  const progress = (completedSteps.size / workflow.steps.length) * 100;
  const stepProgress = ((currentStepIndex + 1) / workflow.steps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < workflow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Wizard complete
      if (onComplete) {
        onComplete();
      }
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStartStep = () => {
    // Mark step as in-progress
    WorkflowTracking.updateStepStatus(workflowId, currentStep.id, 'in-progress');
    
    // Navigate to the feature
    navigate(currentStep.featurePath);
    onClose();
  };

  const handleSkipStep = () => {
    // Mark step as skipped
    WorkflowTracking.updateStepStatus(workflowId, currentStep.id, 'skipped');
    
    // Move to next step
    if (currentStepIndex < workflow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const getStepDescription = (step: WorkflowStep, index: number): string => {
    const descriptions: Record<string, Record<string, string>> = {
      'job-application-pipeline': {
        'find-jobs': "Let's find jobs that match your profile. We'll use your resume data to match you with relevant opportunities.",
        'track-applications': "Great! You found some matches. Let's save them to your tracker so you can manage your applications.",
        'tailor-resume': "Now let's tailor your resume for each job. This will increase your chances of getting noticed.",
        'generate-cover-letter': "Create a compelling cover letter that highlights why you're perfect for this role.",
        'archive-documents': "Keep all your tailored documents organized. This helps you track what you've sent to each company.",
        'interview-prep': "Prepare for interviews with AI-powered practice questions tailored to the job requirements."
      },
      'skill-development-advancement': {
        'identify-skills': "Identify the skills you need to develop based on your career goals and market demand.",
        'benchmark-skills': "Compare your current skill levels with what's required for your target roles.",
        'create-learning-path': "Create a structured learning path to systematically develop the skills you need.",
        'complete-sprints': "Complete focused learning sprints to make consistent progress.",
        'earn-certifications': "Earn certifications to validate your new skills and boost your credibility.",
        'update-resume': "Update your resume with your newly acquired skills and certifications.",
        'showcase-portfolio': "Showcase your achievements and projects in your career portfolio."
      },
      'personal-brand-job-discovery': {
        'audit-brand': "Analyze your current personal brand strength and identify areas for improvement.",
        'optimize-linkedin': "Optimize your LinkedIn profile to attract recruiters and showcase your expertise.",
        'showcase-brand-portfolio': "Create a compelling portfolio that showcases your work and achievements.",
        'find-brand-matched-jobs': "Discover job opportunities that align with your personal brand and expertise."
      },
      'interview-preparation-ecosystem': {
        'analyze-job-requirements': "Analyze the job requirements to understand what the interviewer is looking for.",
        'prepare-interview': "Practice interview questions tailored to this specific role and company."
      },
      'continuous-improvement-loop': {
        'review-outcomes': "Review your application outcomes to identify patterns and areas for improvement.",
        'identify-improvements': "Identify specific skills or areas you need to improve based on feedback.",
        'develop-skills': "Develop the skills you need through structured learning paths.",
        'apply-improvements': "Apply your improvements by tailoring your resume and applications."
      },
      'document-consistency-version-control': {
        'update-resume-consistency': "Update your master resume to ensure all information is current and consistent.",
        'sync-cover-letters': "Sync your cover letters to match your updated resume messaging.",
        'archive-versions': "Archive all document versions to maintain a complete history."
      },
      'market-intelligence-career-strategy': {
        'analyze-market-trends': "Analyze market trends to understand what skills and roles are in demand.",
        'benchmark-skills-market': "Benchmark your skills against market requirements for your target roles.",
        'discover-opportunities': "Discover job opportunities that match the market trends and your skills.",
        'develop-career-strategy': "Develop a strategic career plan based on market intelligence."
      }
    };

    return descriptions[workflowId]?.[step.id] || `Complete this step to continue your ${workflow.name} workflow.`;
  };

  const getStepActions = (step: WorkflowStep): string[] => {
    const actions: Record<string, Record<string, string[]>> = {
      'job-application-pipeline': {
        'find-jobs': ['Search Jobs', 'Import from LinkedIn', 'Browse by Category'],
        'track-applications': ['Save to Tracker', 'Set Reminders', 'Add Notes'],
        'tailor-resume': ['Upload Resume', 'Paste Job Description', 'Review Suggestions'],
        'generate-cover-letter': ['Generate Cover Letter', 'Customize Content', 'Download PDF'],
        'archive-documents': ['Archive Documents', 'View History', 'Export All'],
        'interview-prep': ['Practice Questions', 'Mock Interview', 'Review Answers']
      }
    };

    return actions[workflowId]?.[step.id] || ['Get Started', 'Learn More'];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Wizard Modal */}
      <div className="relative w-full max-w-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{workflow.name}</h2>
              <p className="text-white/90 text-sm">{workflow.description}</p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Current Step Progress</span>
              <span>Step {currentStepIndex + 1} of {workflow.steps.length}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-300 transition-all duration-300"
                style={{ width: `${stepProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      index < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : index === currentStepIndex
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className={`mt-2 text-xs text-center max-w-[80px] ${
                    index === currentStepIndex ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                  }`}>
                    {step.name}
                  </div>
                </div>
                {index < workflow.steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                {currentStepIndex + 1}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentStep.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {currentStep.feature}
                </p>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 mb-6 text-lg leading-relaxed">
              {getStepDescription(currentStep, currentStepIndex)}
            </p>

            {/* Step Actions Preview */}
            <div className="flex flex-wrap gap-2 mb-6">
              {getStepActions(currentStep).map((action, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-white/60 dark:bg-slate-700/60 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {action}
                </span>
              ))}
            </div>

            {/* Status Badge */}
            {completedSteps.has(currentStep.id) && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  This step is already completed!
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              )}
              <button
                onClick={handleSkipStep}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Skip This Step
              </button>
            </div>

            <div className="flex gap-3">
              {currentStepIndex < workflow.steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}
              <button
                onClick={handleStartStep}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
              >
                {completedSteps.has(currentStep.id) ? 'Review Step' : 'Start This Step'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

