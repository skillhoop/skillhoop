/**
 * LoadingSpinner
 * Reusable loading spinner component with different sizes and variants.
 * fullScreen mode uses the SkillHoop logo loading screen for consistency.
 */

import { Loader2 } from 'lucide-react';
import LoadingScreen from './LoadingScreen';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  text,
  fullScreen = false,
  overlay = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50">
        <LoadingScreen
          message={text ?? 'Just a moment...'}
          subMessage=""
          fullScreen
        />
      </div>
    );
  }

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-slate-600`} />
      {text && (
        <p className={`${textSizeClasses[size]} text-slate-600`}>{text}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
        {spinner}
      </div>
    );
  }

  return spinner;
}



