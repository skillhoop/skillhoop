import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [currentRole, setCurrentRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [careerGoal, setCareerGoal] = useState('');

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

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    // Validate all fields
    if (!currentRole.trim() || !experienceLevel || !careerGoal) {
      alert('Please complete all fields before finishing.');
      return;
    }

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

      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_role: currentRole.trim(),
          experience_level: experienceLevel,
          career_goal: careerGoal,
          has_completed_onboarding: true,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        alert('Error saving your information. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Success - close modal
      onComplete();
    } catch (error) {
      console.error('Error in onboarding:', error);
      alert('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return currentRole.trim().length > 0;
      case 2:
        return experienceLevel.length > 0;
      case 3:
        return careerGoal.length > 0;
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
            style={{ width: `${(currentStep / 3) * 100}%` }}
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
              
              <div>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g., Software Engineer, Marketing Manager, Student..."
                  className="w-full px-6 py-4 text-lg bg-white/60 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  autoFocus
                />
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
              {[1, 2, 3].map((step) => (
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

            {currentStep < 3 ? (
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
                onClick={handleFinish}
                disabled={!canProceed() || isSubmitting}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  canProceed() && !isSubmitting
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Finish'
                )}
              </button>
            )}
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

