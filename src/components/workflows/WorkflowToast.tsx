/**
 * WorkflowToast
 * Non-intrusive toast notification for workflow prompts
 * Replaces intrusive modal prompts with dismissible toasts
 */

import { X, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface WorkflowToastProps {
  isOpen: boolean;
  onDismiss: () => void;
  onContinue?: () => void;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  variant?: 'success' | 'info' | 'warning';
  autoDismiss?: number; // Auto-dismiss after milliseconds (default: 8000)
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export default function WorkflowToast({
  isOpen,
  onDismiss,
  onContinue,
  title,
  message,
  actionText,
  actionUrl,
  variant = 'success',
  autoDismiss = 8000,
  position = 'top-right',
}: WorkflowToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Auto-dismiss
  useEffect(() => {
    if (isOpen && autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300); // Wait for animation
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    if (actionUrl) {
      window.location.href = actionUrl;
    }
    handleDismiss();
  };

  if (!isOpen) return null;

  const variantStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      message: 'text-green-800',
      button: 'bg-green-600 hover:bg-green-700 text-white',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      message: 'text-yellow-800',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
  };

  const styles = variantStyles[variant];

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <div
        className={`${styles.bg} border rounded-lg shadow-lg max-w-md w-full p-4 space-y-3 ${
          isVisible ? 'scale-100' : 'scale-95'
        } transition-transform duration-300`}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {variant === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${styles.title} mb-1`}>{title}</h3>
            <p className={`text-sm ${styles.message}`}>{message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 ${styles.message} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        {(onContinue || actionUrl) && (
          <div className="flex items-center gap-2 pt-2 border-t border-current border-opacity-20">
            {actionText && (
              <button
                onClick={handleContinue}
                className={`${styles.button} px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1`}
              >
                {actionText}
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleDismiss}
              className={`text-xs ${styles.message} hover:opacity-70 transition-opacity`}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



