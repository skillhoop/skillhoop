import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateResumeContent } from '../../lib/openai';

interface AIAssistantButtonProps {
  currentText: string;
  onAccept: (newText: string) => void;
  className?: string;
}

export default function AIAssistantButton({ currentText, onAccept, className = '' }: AIAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = async (type: 'improve' | 'fix_grammar' | 'make_professional') => {
    if (!currentText.trim()) {
      setError('Please enter some text first');
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsOpen(false);

    try {
      const improvedText = await generateResumeContent(currentText, type);
      onAccept(improvedText);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content. Please try again.';
      setError(errorMessage);
      console.error('Error generating resume content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        id="ai-assistant-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          flex items-center justify-center
          w-8 h-8 rounded-md
          text-indigo-600 hover:text-indigo-700
          bg-indigo-50 hover:bg-indigo-100
          border border-indigo-200 hover:border-indigo-300
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
        `}
        title="AI Assistant - Improve your text"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isLoading && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-slate-300 rounded-md shadow-lg min-w-[200px] py-1">
          <button
            type="button"
            onClick={() => handleOptionClick('improve')}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            Improve Writing
          </button>
          <button
            type="button"
            onClick={() => handleOptionClick('fix_grammar')}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            Fix Grammar
          </button>
          <button
            type="button"
            onClick={() => handleOptionClick('make_professional')}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            Make More Professional
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-red-50 border border-red-200 rounded-md shadow-lg px-3 py-2 text-sm text-red-700 min-w-[200px]">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

