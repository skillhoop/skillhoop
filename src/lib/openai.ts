/**
 * OpenAI Helper Functions
 * Functions for AI-powered resume content generation and improvement
 */

import { supabase } from './supabase';

/**
 * Generate or improve resume content using AI
 * @param currentText - The current text to improve or generate from
 * @param type - The type of improvement to apply
 * @returns Promise resolving to the improved/generated text
 */
export async function generateResumeContent(
  currentText: string,
  type: 'improve' | 'fix_grammar' | 'make_professional'
): Promise<string> {
  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Build the prompt based on type
  let systemPrompt = '';
  let userPrompt = '';

  switch (type) {
    case 'improve':
      systemPrompt = 'You are an expert resume writer. Your specialty is transforming ordinary resume content into powerful, achievement-focused statements that capture attention and demonstrate value.';
      userPrompt = `You are an expert resume writer. Improve the following text to be more action-oriented, quantifiable, and professional for a resume:

${currentText}

Guidelines:
1. Use strong action verbs at the beginning
2. Include quantifiable metrics where possible (numbers, percentages, dollar amounts)
3. Focus on achievements and impact, not just responsibilities
4. Keep it concise but powerful
5. Use industry-appropriate language
6. Ensure ATS compatibility

Return ONLY the improved text, no explanations or additional formatting.`;
      break;

    case 'fix_grammar':
      systemPrompt = 'You are an expert editor specializing in professional documents. You fix grammar, spelling, and punctuation errors while maintaining the original meaning and tone.';
      userPrompt = `Fix any grammar, spelling, and punctuation errors in the following resume text. Maintain the original meaning and professional tone:

${currentText}

Return ONLY the corrected text, no explanations.`;
      break;

    case 'make_professional':
      systemPrompt = 'You are an expert resume writer who transforms casual or informal text into professional, polished resume content.';
      userPrompt = `Transform the following text into professional, polished resume content suitable for a resume:

${currentText}

Guidelines:
1. Use formal, professional language
2. Remove casual expressions and slang
3. Use industry-standard terminology
4. Maintain a confident but humble tone
5. Ensure ATS compatibility
6. Keep the same core information and meaning

Return ONLY the professional version of the text, no explanations.`;
      break;
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      systemMessage: systemPrompt,
      prompt: userPrompt,
      userId: userId,
      feature_name: 'resume_studio',
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate resume content');
  }

  const data = await response.json();
  return data.content?.trim() || '';
}

