import { supabase } from '../lib/supabase';
import { generateCacheKey, withCache } from '../lib/aiResultCache';

export interface ResumeAnalysisResult {
  score: number; // 0-100
  feedback: string[]; // Array of 3 specific improvements
  missingKeywords: string[]; // Array of critical missing keywords
}

/**
 * Analyzes a resume against a job description using AI
 * @param resumeData - The resume data object to analyze
 * @param jobDescription - The job description to match against
 * @returns Promise resolving to analysis results with score, feedback, and missing keywords
 */
export async function analyzeResume(
  resumeData: any,
  jobDescription: string
): Promise<ResumeAnalysisResult> {
  // Get current user ID for authentication and usage tracking
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to analyze resume');
  }

  if (!jobDescription || jobDescription.trim() === '') {
    throw new Error('Job description is required for resume analysis');
  }

  // Generate cache key from resume data and job description
  const cacheKey = generateCacheKey('analyze_resume', userId, resumeData, jobDescription);

  // Use cache wrapper
  return withCache(
    cacheKey,
    async () => {
      try {
        const response = await fetch('/api/generateResume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeData,
            jobDescription,
            userId,
            type: 'analyze',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
          throw new Error(errorData.error || `Failed to analyze resume: ${response.statusText}`);
        }

        const analysisResult: ResumeAnalysisResult = await response.json();

        // Validate the response structure
        if (
          typeof analysisResult.score !== 'number' ||
          !Array.isArray(analysisResult.feedback) ||
          !Array.isArray(analysisResult.missingKeywords)
        ) {
          throw new Error('Invalid response format from API');
        }

        return analysisResult;
      } catch (error) {
        console.error('Error analyzing resume:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to analyze resume. Please try again.');
      }
    },
    24 * 60 * 60 * 1000 // 24 hours TTL
  );
}

