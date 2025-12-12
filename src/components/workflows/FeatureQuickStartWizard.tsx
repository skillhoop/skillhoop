import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Circle, Sparkles, Target, Lightbulb } from 'lucide-react';

interface QuickStartStep {
  id: string;
  title: string;
  description: string;
  tips?: string[];
  actionLabel?: string;
  onAction?: () => void;
}

interface FeatureQuickStartWizardProps {
  featureName: string;
  featureDescription: string;
  steps: QuickStartStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  storageKey?: string; // To remember if user has dismissed this wizard
}

export default function FeatureQuickStartWizard({
  featureName,
  featureDescription,
  steps,
  isOpen,
  onClose,
  onComplete,
  storageKey
}: FeatureQuickStartWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen && storageKey) {
      // Check if user has dismissed this wizard before
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed === 'true') {
        onClose();
      }
    }
  }, [isOpen, storageKey, onClose]);

  if (!isOpen) return null;

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Wizard complete
      if (dontShowAgain && storageKey) {
        localStorage.setItem(storageKey, 'true');
      }
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

  const handleClose = () => {
    if (dontShowAgain && storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    onClose();
  };

  const handleAction = () => {
    if (currentStep.onAction) {
      currentStep.onAction();
    }
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Wizard Modal */}
      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{featureName} Quick Start</h2>
              <p className="text-white/90 text-sm">{featureDescription}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progress</span>
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
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
                  <div className={`mt-2 text-xs text-center max-w-[100px] ${
                    index === currentStepIndex ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
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
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 mb-6 text-lg leading-relaxed">
              {currentStep.description}
            </p>

            {/* Tips */}
            {currentStep.tips && currentStep.tips.length > 0 && (
              <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Pro Tips
                </h4>
                <ul className="space-y-2">
                  {currentStep.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <span className="text-indigo-600 font-bold mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Don't show again checkbox */}
          {storageKey && (
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Don't show this guide again
                </span>
              </label>
            </div>
          )}

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
                onClick={handleClose}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Skip Guide
              </button>
            </div>

            <div className="flex gap-3">
              {currentStepIndex < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}
              <button
                onClick={currentStep.onAction ? handleAction : handleNext}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
              >
                {currentStep.actionLabel || (currentStepIndex === steps.length - 1 ? 'Get Started' : 'Continue')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
