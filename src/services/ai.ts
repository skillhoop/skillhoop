import OpenAI from 'openai';

// Initialize OpenAI client
// Note: dangerouslyAllowBrowser is set to true for development only
// In production, API calls should be made through a backend server
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Dev only - should use backend in production
});

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
  const systemPrompt =
    'You are an expert ATS (Applicant Tracking System) optimizer. Analyze the resume JSON against the provided Job Description.';

  const userPrompt = `Resume Data (JSON):
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription}

Please analyze the resume against the job description and provide:
1. A score from 0-100 indicating how well the resume matches the job description
2. An array of exactly 3 specific, actionable improvements
3. An array of critical missing keywords from the job description that should be added to the resume

Return your response in the following JSON format:
{
  "score": <number 0-100>,
  "feedback": [<string>, <string>, <string>],
  "missingKeywords": [<string>, ...]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response content received from OpenAI');
    }

    const analysisResult: ResumeAnalysisResult = JSON.parse(responseContent);

    // Validate the response structure
    if (
      typeof analysisResult.score !== 'number' ||
      !Array.isArray(analysisResult.feedback) ||
      !Array.isArray(analysisResult.missingKeywords)
    ) {
      throw new Error('Invalid response format from OpenAI');
    }

    return analysisResult;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}

