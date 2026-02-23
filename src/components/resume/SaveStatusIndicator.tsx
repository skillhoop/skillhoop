/**
 * Save Status Indicator
 * Shows clear status of auto-save vs manual save
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';

interface SaveStatusIndicatorProps {
  className?: string;
}

export default function SaveStatusIndicator({ className = '' }: SaveStatusIndicatorProps) {
  const { isSaving, saveError } = useResume();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  useEffect(() => {
    if (saveError) {
      setSaveStatus('error');
      return;
    }

    if (isSaving) {
      setSaveStatus('saving');
    } else if (saveStatus === 'saving') {
      setSaveStatus('saved');
      setLastSaved(new Date());
      // Clear saved status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, [isSaving, saveStatus, saveError]);

  if (!isSaving && !saveStatus && !lastSaved && !saveError) {
    return null; // Don't show anything if nothing has happened
  }

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      {saveError || saveStatus === 'error' ? (
        <>
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span className="text-red-600">Not saved</span>
          {saveError && <span className="text-red-500">{saveError}</span>}
        </>
      ) : isSaving || saveStatus === 'saving' ? (
        <>
          <Clock className="w-3 h-3 animate-spin text-slate-600" />
          <span className="text-slate-600">Auto-saving...</span>
        </>
      ) : saveStatus === 'saved' ? (
        <>
          <CheckCircle2 className="w-3 h-3 text-green-600" />
          <span className="text-green-600">Auto-saved</span>
          {lastSaved && (
            <span className="text-slate-400">
              {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </>
      ) : null}
    </div>
  );
}


