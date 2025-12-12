import React, { useState } from 'react';
import { Sparkles, Wand2, TrendingUp, Hash, Zap, Type, X, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useRealTimeAISuggestions, type RealTimeSuggestion } from '../../hooks/useRealTimeAISuggestions';

interface RealTimeAISuggestionsProps {
  currentText: string;
  onApplySuggestion: (suggestion: string) => void;
  onEnhanceText: (enhancedText: string) => void;
  sectionName?: string;
  fullResumeText?: string;
  enabled?: boolean;
  inputId?: string;
}

const SUGGESTION_TYPE_ICONS = {
  enhancement: Wand2,
  keyword: Hash,
  metric: TrendingUp,
  'action-verb': Zap,
  formatting: Type,
  autocomplete: Sparkles,
};

const SUGGESTION_TYPE_COLORS = {
  enhancement: 'bg-purple-50 text-purple-700 border-purple-200',
  keyword: 'bg-blue-50 text-blue-700 border-blue-200',
  metric: 'bg-green-50 text-green-700 border-green-200',
  'action-verb': 'bg-orange-50 text-orange-700 border-orange-200',
  formatting: 'bg-gray-50 text-gray-700 border-gray-200',
  autocomplete: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export default function RealTimeAISuggestions({
  currentText,
  onApplySuggestion,
  onEnhanceText,
  sectionName,
  fullResumeText = '',
  enabled = true,
  inputId,
}: RealTimeAISuggestionsProps) {
  const { suggestions, isLoading, error, enhanceText } = useRealTimeAISuggestions(currentText, {
    enabled,
    debounceMs: 1000,
    minLength: 10,
    sectionName,
    fullResumeText,
  });

  const [isExpanded, setIsExpanded] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);

  if (!enabled || currentText.length < 10) {
    return null;
  }

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceText(currentText);
      if (enhanced) {
        onEnhanceText(enhanced);
      }
    } catch (err) {
      console.error('Error enhancing text:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const getSuggestionIcon = (type: RealTimeSuggestion['type']) => {
    const Icon = SUGGESTION_TYPE_ICONS[type] || Sparkles;
    return <Icon className="w-3.5 h-3.5" />;
  };

  const getSuggestionColor = (type: RealTimeSuggestion['type']) => {
    return SUGGESTION_TYPE_COLORS[type] || SUGGESTION_TYPE_COLORS.autocomplete;
  };

  if (suggestions.length === 0 && !isLoading && !error) {
    return null;
  }

  return (
    <div className="mt-2 border border-slate-200 rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-medium text-slate-700">
            AI Suggestions {isLoading && <Loader2 className="w-3 h-3 inline animate-spin ml-1" />}
          </span>
          {suggestions.length > 0 && (
            <span className="text-xs text-slate-500">({suggestions.length})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {suggestions.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEnhance();
              }}
              disabled={isEnhancing}
              className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Enhance entire text"
            >
              {isEnhancing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
              Enhance
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Suggestions List */}
      {isExpanded && (
        <div className="border-t border-slate-200">
          {error && (
            <div className="p-2 text-xs text-red-600 bg-red-50">
              {error}
            </div>
          )}

          {isLoading && suggestions.length === 0 && (
            <div className="p-3 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing text...</span>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion) => {
                const Icon = getSuggestionIcon(suggestion.type);
                const colorClass = getSuggestionColor(suggestion.type);

                return (
                  <div
                    key={suggestion.id}
                    className={`flex items-start gap-2 p-2 rounded border ${colorClass} transition-all hover:shadow-sm`}
                  >
                    <div className="flex-shrink-0 mt-0.5">{Icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium mb-1">
                        {suggestion.text}
                      </div>
                      {suggestion.explanation && (
                        <div className="text-xs opacity-75 mb-1">
                          {suggestion.explanation}
                        </div>
                      )}
                      {suggestion.type === 'autocomplete' && suggestion.replacement && (
                        <div className="text-xs opacity-60 italic">
                          Complete: "{suggestion.replacement}"
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            if (suggestion.replacement) {
                              onApplySuggestion(suggestion.replacement);
                            } else {
                              onApplySuggestion(suggestion.text);
                            }
                          }}
                          className="text-xs px-2 py-1 bg-white/80 hover:bg-white rounded border border-current/20 flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Apply
                        </button>
                        <span className="text-xs opacity-60">
                          {suggestion.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && suggestions.length === 0 && !error && (
            <div className="p-3 text-xs text-slate-500 text-center">
              No suggestions available. Keep typing for AI-powered recommendations.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

