import { useState, useEffect, useCallback, useRef } from 'react';
import { getContextAwareSuggestions, getAutoCompleteSuggestions, enhanceResumeText } from '../lib/resumeAI';
import type { ContextAwareSuggestionsResult, AutoCompleteResult, EnhancedTextResult } from '../lib/resumeAI';

export interface RealTimeSuggestion {
  id: string;
  text: string;
  type: 'enhancement' | 'keyword' | 'metric' | 'action-verb' | 'formatting' | 'autocomplete';
  confidence: number;
  explanation?: string;
  replacement?: string; // For auto-complete
}

interface UseRealTimeAISuggestionsOptions {
  enabled?: boolean;
  debounceMs?: number;
  minLength?: number;
  sectionName?: string;
  fullResumeText?: string;
}

export function useRealTimeAISuggestions(
  currentText: string,
  options: UseRealTimeAISuggestionsOptions = {}
) {
  const {
    enabled = true,
    debounceMs = 1000,
    minLength = 10,
    sectionName,
    fullResumeText = '',
  } = options;

  const [suggestions, setSuggestions] = useState<RealTimeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate unique ID for suggestions
  const generateSuggestionId = useCallback(() => {
    return `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Fetch context-aware suggestions
  const fetchSuggestions = useCallback(async (text: string) => {
    if (!enabled || text.length < minLength) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // Get context-aware suggestions
      const contextSuggestions = await getContextAwareSuggestions(
        text,
        fullResumeText,
        sectionName
      );

      // Get auto-complete suggestions if text looks incomplete (ends with space or is short)
      let autoCompleteSuggestions: AutoCompleteResult | null = null;
      if (text.trim().length < 50 && (text.endsWith(' ') || text.length < 30)) {
        try {
          autoCompleteSuggestions = await getAutoCompleteSuggestions(
            text,
            fullResumeText,
            sectionName
          );
        } catch (e) {
          // Auto-complete is optional, don't fail if it errors
          console.debug('Auto-complete failed:', e);
        }
      }

      // Combine suggestions
      const combinedSuggestions: RealTimeSuggestion[] = [];

      // Add context-aware suggestions
      if (contextSuggestions.suggestions) {
        contextSuggestions.suggestions.forEach((suggestion) => {
          combinedSuggestions.push({
            id: generateSuggestionId(),
            text: suggestion.suggestion,
            type: suggestion.type, // Type is already properly typed from ContextAwareSuggestion
            confidence: suggestion.confidence,
            explanation: suggestion.explanation,
          });
        });
      }

      // Add auto-complete suggestions
      if (autoCompleteSuggestions?.completions) {
        autoCompleteSuggestions.completions.forEach((completion) => {
          combinedSuggestions.push({
            id: generateSuggestionId(),
            text: completion,
            type: 'autocomplete',
            confidence: autoCompleteSuggestions.confidence || 70,
            replacement: completion,
          });
        });
      }

      // Sort by confidence (highest first)
      combinedSuggestions.sort((a, b) => b.confidence - a.confidence);

      // Limit to top 5 suggestions
      setSuggestions(combinedSuggestions.slice(0, 5));
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching AI suggestions:', err);
        setError(err.message || 'Failed to fetch suggestions');
        setSuggestions([]);
      } else if (!(err instanceof Error) || err.name !== 'AbortError') {
        console.error('Error fetching AI suggestions:', err);
        setError('Failed to fetch suggestions');
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled, minLength, sectionName, fullResumeText, generateSuggestionId]);

  // Debounced suggestion fetching
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!enabled || currentText.length < minLength) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(currentText);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentText, debounceMs, fetchSuggestions, enabled, minLength]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Enhance text (for apply button)
  const enhanceText = useCallback(async (originalText: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result: EnhancedTextResult = await enhanceResumeText(originalText, fullResumeText);
      return result.enhancedText;
    } catch (err: unknown) {
      console.error('Error enhancing text:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance text';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fullResumeText]);

  return {
    suggestions,
    isLoading,
    error,
    clearSuggestions,
    enhanceText,
    refreshSuggestions: () => fetchSuggestions(currentText),
  };
}

