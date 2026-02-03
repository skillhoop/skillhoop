import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { calculateProfileStrength, type ProfileStrengthResult } from '../../lib/profileStrength';

interface ProfileStrengthProps {
  resumeData: unknown;
}

export default function ProfileStrength({ resumeData }: ProfileStrengthProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Memoize the expensive calculation - only recalculate when resumeData changes
  const strengthResult: ProfileStrengthResult = useMemo(() => {
    return calculateProfileStrength(resumeData as any);
  }, [resumeData]);
  
  const { score, suggestions } = strengthResult;

  // Memoize strength label calculation
  const strengthInfo = useMemo(() => {
    const getStrengthLabel = (score: number): { label: string; color: string; bgColor: string; progressColor: string } => {
      if (score >= 80) {
        return {
          label: 'Excellent',
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          progressColor: 'bg-green-500',
        };
      } else if (score >= 50) {
        return {
          label: 'Good',
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          progressColor: 'bg-yellow-500',
        };
      } else {
        return {
          label: 'Needs Improvement',
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          progressColor: 'bg-red-500',
        };
      }
    };
    return getStrengthLabel(score);
  }, [score]);

  return (
    <div className={`border-b border-gray-200 ${strengthInfo.bgColor} transition-colors`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${strengthInfo.color}`} />
            <h3 className={`text-sm font-semibold ${strengthInfo.color}`}>
              Resume Strength
            </h3>
          </div>
          {suggestions.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-xs ${strengthInfo.color} hover:opacity-80 transition-opacity flex items-center gap-1`}
            >
              {isExpanded ? (
                <>
                  <span>Hide</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>Improve</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Score Label */}
        <div className="mb-2">
          <span className={`text-lg font-bold ${strengthInfo.color}`}>
            {strengthInfo.label}
          </span>
          <span className={`text-sm ml-2 ${strengthInfo.color} opacity-75`}>
            ({score}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`${strengthInfo.progressColor} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Suggestions (Collapsible) */}
        {isExpanded && suggestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Improve your resume:</h4>
            <ul className="space-y-1.5">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Show message if score is 100% */}
        {score === 100 && (
          <div className="mt-2 text-xs text-green-700 font-medium">
            🎉 Your resume is complete!
          </div>
        )}
      </div>
    </div>
  );
}

