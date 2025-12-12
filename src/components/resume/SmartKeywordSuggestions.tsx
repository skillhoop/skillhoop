import React, { useState, useEffect } from 'react';
import { Hash, TrendingUp, Plus, X, Sparkles } from 'lucide-react';
import { extractAndMatchKeywords } from '../../lib/resumeAI';

interface SmartKeywordSuggestionsProps {
  targetJobDescription?: string;
  currentResumeText: string;
  onAddKeyword: (keyword: string) => void;
  enabled?: boolean;
}

export default function SmartKeywordSuggestions({
  targetJobDescription,
  currentResumeText,
  onAddKeyword,
  enabled = true,
}: SmartKeywordSuggestionsProps) {
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!enabled || !targetJobDescription || targetJobDescription.trim().length < 50) {
      setSuggestedKeywords([]);
      return;
    }

    const fetchKeywords = async () => {
      setIsLoading(true);
      try {
        // Create a simple HTML wrapper for the resume text (extractAndMatchKeywords expects HTML)
        const resumeHTML = `<div>${currentResumeText.replace(/\n/g, '<br>')}</div>`;
        const result = await extractAndMatchKeywords(resumeHTML, targetJobDescription);
        // Filter out keywords that are already in the resume, prioritize critical/important ones
        const resumeLower = currentResumeText.toLowerCase();
        const missingKeywords = result.keywords
          .filter(kw => !kw.found && (kw.importance === 'critical' || kw.importance === 'important'))
          .sort((a, b) => {
            // Critical first, then important
            if (a.importance === 'critical' && b.importance !== 'critical') return -1;
            if (a.importance !== 'critical' && b.importance === 'critical') return 1;
            return 0;
          })
          .slice(0, 10) // Top 10 missing keywords
          .map(kw => kw.keyword);
        
        setSuggestedKeywords(missingKeywords);
      } catch (error) {
        console.error('Error fetching keyword suggestions:', error);
        setSuggestedKeywords([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce
    const timer = setTimeout(fetchKeywords, 1500);
    return () => clearTimeout(timer);
  }, [targetJobDescription, currentResumeText, enabled]);

  if (!enabled || !targetJobDescription || suggestedKeywords.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 border border-blue-200 rounded-lg bg-blue-50">
      <div
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-900">
            Missing Keywords from Job Description
          </span>
          <span className="text-xs text-blue-700 bg-blue-200 px-1.5 py-0.5 rounded">
            {suggestedKeywords.length}
          </span>
        </div>
        {isExpanded ? (
          <X className="w-4 h-4 text-blue-600" />
        ) : (
          <Plus className="w-4 h-4 text-blue-600" />
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-blue-200 p-2">
          {isLoading ? (
            <div className="text-xs text-blue-700 text-center py-2">
              Analyzing job description...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestedKeywords.map((keyword, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddKeyword(keyword);
                    // Remove from suggestions after adding
                    setSuggestedKeywords(prev => prev.filter(k => k !== keyword));
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white text-blue-700 border border-blue-300 rounded hover:bg-blue-100 hover:border-blue-400 transition-colors"
                >
                  <Hash className="w-3 h-3" />
                  {keyword}
                  <Plus className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

