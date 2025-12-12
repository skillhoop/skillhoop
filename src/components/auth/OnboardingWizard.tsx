import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { WorkflowTracking, WORKFLOW_DEFINITIONS, type WorkflowId } from '../../lib/workflowTracking';
import { Target, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [currentRole, setCurrentRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [selectedWorkflows, setSelectedWorkflows] = useState<WorkflowId[]>([]);

  const roleOptions = [
    'Student',
    'Software Engineer',
    'Product Manager',
    'Designer',
    'Marketer',
    'Sales',
    'Other',
  ];

  const experienceOptions = [
    { value: '0-2', label: '0-2 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' },
  ];

  const careerGoalOptions = [
    { value: 'Get Hired', label: 'Get Hired', icon: '🎯' },
    { value: 'Switch Careers', label: 'Switch Careers', icon: '🔄' },
    { value: 'Get Promoted', label: 'Get Promoted', icon: '📈' },
  ];

  const launchpadOptions = [
    {
      id: 'resume-studio',
      title: 'Resume Studio',
      description: 'Create and optimize your resume with AI-powered tools',
      icon: '📄',
      path: '/dashboard/resume-studio',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'brand-audit',
      title: 'Brand Audit',
      description: 'Analyze and improve your personal brand presence',
      icon: '🔍',
      path: '/dashboard/brand-audit',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'job-finder',
      title: 'Job Finder',
      description: 'Discover and track job opportunities tailored to you',
      icon: '💼',
      path: '/dashboard/job-finder',
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  // Get recommended workflows based on career goal
  const getRecommendedWorkflows = (): WorkflowId[] => {
    switch (careerGoal) {
      case 'Get Hired':
        return ['job-application-pipeline', 'interview-preparation-ecosystem', 'document-consistency-version-control'];
      case 'Switch Careers':
        return ['skill-development-advancement', 'market-intelligence-career-strategy', 'personal-brand-job-discovery'];
      case 'Get Promoted':
        return ['skill-development-advancement', 'continuous-improvement-loop', 'personal-brand-job-discovery'];
      default:
        return ['job-application-pipeline', 'skill-development-advancement'];
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    if (currentStep < 5) {
      // Skip to next step
      setCurrentStep(currentStep + 1);
    } else {
      // On last step, skip means finish without selecting workflows
      await handleFinish();
    }
  };

  const handleFinish = async (launchpadPath?: string) => {
    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user:', userError);
        alert('Error: Please log in again.');
        setIsSubmitting(false);
        return;
      }

      // Initialize selected workflows
      if (selectedWorkflows.length > 0) {
        // Initialize the first selected workflow as active
        const firstWorkflow = selectedWorkflows[0];
        await WorkflowTracking.initializeWorkflow(firstWorkflow);
        
        // Initialize other selected workflows (but not as active)
        for (let i = 1; i < selectedWorkflows.length; i++) {
          await WorkflowTracking.initializeWorkflow(selectedWorkflows[i]);
        }
      }

      // Update profiles table (allow empty values if skipped)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_role: currentRole.trim() || null,
          experience_level: experienceLevel || null,
          career_goal: careerGoal || null,
          has_completed_onboarding: true,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        alert('Error saving your information. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Success - close modal and navigate
      onComplete();
      if (launchpadPath) {
        navigate(launchpadPath);
      } else if (selectedWorkflows.length > 0) {
        // For onboarding, navigate directly to first step (wizard can be accessed later)
        // This provides immediate value after onboarding
        const firstWorkflow = WorkflowTracking.getWorkflow(selectedWorkflows[0]);
        if (firstWorkflow) {
          const firstStep = firstWorkflow.steps.find(s => s.status === 'not-started') || firstWorkflow.steps[0];
          if (firstStep) {
            // Mark first step as in-progress
            if (firstStep.status === 'not-started') {
              WorkflowTracking.updateStepStatus(selectedWorkflows[0], firstStep.id, 'in-progress');
            }
            navigate(firstStep.featurePath);
          }
        }
      }
    } catch (error) {
      console.error('Error in onboarding:', error);
      alert('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleLaunchpadSelect = async (launchpad: typeof launchpadOptions[0]) => {
    await handleFinish(launchpad.path);
  };

  const handleWorkflowToggle = (workflowId: WorkflowId) => {
    setSelectedWorkflows(prev => 
      prev.includes(workflowId)
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return currentRole.trim().length > 0;
      case 2:
        return experienceLevel.length > 0;
      case 3:
        return careerGoal.length > 0;
      case 4:
        return true; // Step 4 (launchpad) doesn't require validation
      case 5:
        return true; // Step 5 (workflows) doesn't require validation - can skip
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-slate-200/50">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 md:p-12">
          {/* Step 1: Current Role */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">What is your current role?</h2>
                <p className="text-slate-600">Tell us about your current position or job title</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`px-6 py-4 text-left rounded-xl border-2 transition-all ${
                      currentRole === role
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-lg'
                        : 'border-slate-200 bg-white/60 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="font-semibold">{role}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Experience Level */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                    <path d="M3 3v18h18"/>
                    <path d="M18 7v10"/>
                    <path d="M13 12v5"/>
                    <path d="M8 15v2"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">How many years of experience?</h2>
                <p className="text-slate-600">Select your experience level</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {experienceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setExperienceLevel(option.value)}
                    className={`px-6 py-4 text-left rounded-xl border-2 transition-all ${
                      experienceLevel === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-lg'
                        : 'border-slate-200 bg-white/60 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Career Goal */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">What is your main goal?</h2>
                <p className="text-slate-600">Choose the goal that best describes your career objective</p>
              </div>
              
              <div className="space-y-4">
                {careerGoalOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCareerGoal(option.value)}
                    className={`w-full px-6 py-5 text-left rounded-xl border-2 transition-all flex items-center gap-4 ${
                      careerGoal === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-lg'
                        : 'border-slate-200 bg-white/60 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <span className="text-3xl">{option.icon}</span>
                    <span className="font-semibold text-lg">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Launchpad Selection */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Where would you like to start?</h2>
                <p className="text-slate-600">Choose a launchpad to begin your career journey</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {launchpadOptions.map((launchpad) => (
                  <button
                    key={launchpad.id}
                    onClick={() => handleLaunchpadSelect(launchpad)}
                    disabled={isSubmitting}
                    className={`group relative overflow-hidden bg-white/60 border-2 border-slate-200 rounded-2xl p-6 text-left transition-all hover:border-indigo-500 hover:shadow-xl ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                    }`}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${launchpad.gradient} opacity-10 group-hover:opacity-20 transition-opacity rounded-full -mr-16 -mt-16`} />
                    <div className="relative">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${launchpad.gradient} mb-4 text-3xl`}>
                        {launchpad.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{launchpad.title}</h3>
                      <p className="text-slate-600 text-sm">{launchpad.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Choose Your Journey - Workflow Selection */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Choose Your Journey</h2>
                <p className="text-slate-600">Select a guided workflow based on your career goal. You can start multiple workflows later.</p>
              </div>
              
              {/* Workflow Cards - Based on Career Goal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const recommended = getRecommendedWorkflows();
                  
                  // Create workflow cards based on career goal
                  const workflowCards = [
                    {
                      id: 'job-application-pipeline' as WorkflowId,
                      title: 'Get Hired Fast',
                      subtitle: 'Job Application Pipeline',
                      description: 'Complete end-to-end job application process from discovery to interview',
                      icon: '🎯',
                      gradient: 'from-blue-500 to-indigo-600',
                      recommended: recommended.includes('job-application-pipeline'),
                      category: 'Career Hub'
                    },
                    {
                      id: 'skill-development-advancement' as WorkflowId,
                      title: 'Level Up Skills',
                      subtitle: 'Skill Development to Career Advancement',
                      description: 'Identify skill gaps, learn new skills, and showcase achievements',
                      icon: '📈',
                      gradient: 'from-green-500 to-emerald-600',
                      recommended: recommended.includes('skill-development-advancement'),
                      category: 'Upskilling'
                    },
                    {
                      id: 'personal-brand-job-discovery' as WorkflowId,
                      title: 'Build My Brand',
                      subtitle: 'Personal Brand Building to Job Discovery',
                      description: 'Build your brand, create content, and discover opportunities',
                      icon: '✨',
                      gradient: 'from-purple-500 to-pink-600',
                      recommended: recommended.includes('personal-brand-job-discovery'),
                      category: 'Brand Building'
                    },
                    {
                      id: 'all' as any,
                      title: 'Complete Career Makeover',
                      subtitle: 'All Workflows Combined',
                      description: 'Start with all recommended workflows for a comprehensive career transformation',
                      icon: '🚀',
                      gradient: 'from-orange-500 to-amber-600',
                      recommended: true,
                      category: 'Cross-Category'
                    }
                  ];
                  
                  return workflowCards.map((card) => {
                    const isSelected = card.id === 'all' 
                      ? selectedWorkflows.length === recommended.length && recommended.length > 0
                      : selectedWorkflows.includes(card.id);
                    
                    return (
                      <button
                        key={card.id}
                        onClick={() => {
                          if (card.id === 'all') {
                            // Select all recommended workflows
                            setSelectedWorkflows(recommended);
                          } else {
                            handleWorkflowToggle(card.id);
                          }
                        }}
                        disabled={isSubmitting}
                        className={`group relative overflow-hidden text-left p-6 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-xl scale-105'
                            : 'border-slate-200 bg-white/60 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-lg'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {/* Background Gradient */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity rounded-full -mr-16 -mt-16`} />
                        
                        <div className="relative">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} text-2xl mb-2`}>
                              {card.icon}
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                            {card.recommended && !isSelected && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                                <Sparkles className="w-3 h-3" />
                                Recommended
                              </span>
                            )}
                          </div>
                          
                          {/* Content */}
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{card.title}</h3>
                          <p className="text-sm text-slate-500 mb-3 font-medium">{card.subtitle}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{card.description}</p>
                          
                          {/* Steps Preview (for specific workflows) */}
                          {card.id !== 'all' && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <p className="text-xs text-slate-500 mb-2">Includes:</p>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  const workflow = WorkflowTracking.getWorkflow(card.id);
                                  const stepCount = workflow?.steps.length || 0;
                                  return (
                                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                      {stepCount} steps
                                    </span>
                                  );
                                })()}
                                <span className="text-xs text-slate-500">{card.category}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
              
              {/* Selection Summary */}
              {selectedWorkflows.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">
                        {selectedWorkflows.length} workflow{selectedWorkflows.length !== 1 ? 's' : ''} selected
                      </p>
                      <p className="text-xs text-indigo-700 mt-1">
                        {selectedWorkflows.length === 1 
                          ? 'We\'ll start with this workflow and guide you through each step!' 
                          : 'We\'ll start with the first workflow, and you can switch between them anytime.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Back
            </button>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step === currentStep
                      ? 'bg-indigo-600 w-8'
                      : step < currentStep
                      ? 'bg-indigo-300'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  canProceed()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleFinish()}
                disabled={isSubmitting || !canProceed()}
                className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  canProceed() && !isSubmitting
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Starting...' : 'Start Journey'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Skip Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep < 5 ? 'Skip' : 'Skip and finish later'}
            </button>
          </div>
        </div>
      </div>

      {/* Add fade-in animation styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

