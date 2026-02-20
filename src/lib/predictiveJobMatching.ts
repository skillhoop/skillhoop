/**
 * Predictive Job Matching Service
 * AI-based job recommendation (match score + reasons only).
 */

import { supabase } from './supabase';

/** Base URL for the AI generate API (Supabase Edge Function or backend). Relative path hits current origin (404 on Vite dev). */
function getGenerateApiUrl(): string {
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
  const viteAiGenerateUrl = (env as Record<string, string | undefined>).VITE_AI_GENERATE_URL;
  const viteAiApiBase = (env as Record<string, string | undefined>).VITE_AI_API_BASE;
  let apiUrl: string;
  if (viteAiGenerateUrl) {
    apiUrl = viteAiGenerateUrl;
  } else if (viteAiApiBase) {
    apiUrl = `${viteAiApiBase.replace(/\/$/, '')}/api/generate`;
  } else if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    apiUrl = 'http://localhost:3000/api/generate';
  } else {
    apiUrl = '/api/generate';
  }
  // [ENV AUDIT] Temporary: verify AI API URL config
  console.log('[ENV AUDIT] getGenerateApiUrl', {
    VITE_AI_GENERATE_URL: viteAiGenerateUrl ?? '(not set)',
    VITE_AI_API_BASE: viteAiApiBase ?? '(not set)',
    apiUrl
  });
  return apiUrl;
}

// --- Types ---
export interface ResumeProfile {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
  }>;
  location?: string;
  yearsOfExperience: number;
  industry?: string;
  currentSalary?: number;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salaryRange?: string;
  postedDate: string;
  source: string;
  industry?: string;
  experienceLevel?: string;
}

export interface JobRecommendation {
  job: JobListing;
  matchScore: number;
  reasons: string[];
  /** Single cohesive sentence summarizing why this job matches (from reasons array) */
  whyMatch?: string;
}

export interface JobAlert {
  id: string;
  criteria: {
    keywords: string[];
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    industry?: string;
    experienceLevel?: string;
  };
  frequency: 'daily' | 'weekly' | 'realtime';
  lastChecked: string;
  active: boolean;
}

// --- Helper Functions ---
async function callOpenAI(prompt: string, systemPrompt: string = ''): Promise<string> {
  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Import network error handler
  const { apiFetch } = await import('./networkErrorHandler');

  try {
    const payload = {
      model: 'gpt-4o-mini',
      systemMessage: systemPrompt,
      prompt: prompt,
      userId: userId,
      feature_name: 'job_matching',
    };

    const apiUrl = getGenerateApiUrl();
    // [API DEBUG] Temporary: exact URL and payload for AI generate
    console.log('[API DEBUG] callOpenAI', { url: apiUrl, payload });

    const data = await apiFetch<{ content: string }>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 60000, // 60 seconds for AI responses (avoid AbortError on slow responses)
      retries: 2, // Retry twice for AI calls
    });

    return data.content || '';
  } catch (error) {
    // Re-throw network errors (they're already user-friendly)
    if (error instanceof Error && 'type' in error) {
      throw error;
    }
    // Convert unknown errors
    throw new Error(error instanceof Error ? error.message : 'Failed to get AI response');
  }
}

/**
 * Extract and parse JSON from AI response that may include surrounding text,
 * markdown code fences, or prefixes like "Here is the JSON:".
 * Uses regex to find first JSON object or array; on parse failure returns a safe
 * fallback so the UI (e.g. ATS Score) does not break.
 */
function extractJSON<T>(text: string): T {
  try {
    const trimmed = (text || '').trim();
    // Try array first so we don't mistake an array response as a single object
    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch) return JSON.parse(arrayMatch[0].trim()) as T;
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0].trim()) as T;
  } catch (e) {
    console.error('JSON Parsing failed. Raw text:', text);
    return { recommendations: [] } as T;
  }
}

/** Map AI reasons array into a single high-level summary for whyMatch (no duplication of bullet text). */
function reasonsToWhyMatchSentence(reasons: string[]): string {
  if (!reasons || reasons.length === 0) return '';
  const trimmed = reasons.filter(Boolean).map(r => r.trim());
  if (trimmed.length === 0) return '';
  if (trimmed.length === 1) return `Your profile is a strong fit for this role: ${trimmed[0]}.`;
  return 'Your profile is a strong fit for this role: industry experience and technical skills match what they need.';
}

// --- Main Functions ---

/**
 * Get ML-based job recommendations based on resume profile.
 * Optional searchGoal: when provided (e.g. career progression, industry switch), the AI weights match scores for that goal.
 */
export async function getJobRecommendations(
  profile: ResumeProfile,
  jobListings: JobListing[],
  limit: number = 10,
  searchGoal?: string
): Promise<JobRecommendation[]> {
  const systemPrompt = `You are an expert job matching AI with deep knowledge of career paths, skill requirements, and job market trends. You analyze resumes and job listings to provide intelligent, personalized recommendations.

Your response MUST be a JSON object containing a SINGLE key called 'recommendations', which is an ARRAY of objects. Never return a bare array or a single object; always use the shape: { "recommendations": [ ... ] }.`;

  const profileSummary = `
RESUME PROFILE:
- Skills: ${profile.skills.join(', ')}
- Years of Experience: ${profile.yearsOfExperience}
- Industry: ${profile.industry || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Experience: ${profile.experience.map(e => `${e.title} at ${e.company}`).join(', ')}
- Education: ${profile.education.map(e => `${e.degree} in ${e.field}`).join(', ')}
`;

  const jobsSummary = jobListings.slice(0, 20).map((job, idx) => {
    const description = (job as JobListing & { job_description?: string }).description
      ?? (job as JobListing & { job_description?: string }).job_description
      ?? '';
    const descStr = typeof description === 'string' ? description : '';
    const reqStr = (job.requirements ?? '').toString();
    return `
JOB ${idx + 1} (id: "${job.id}"):
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${descStr.substring(0, 800)}${descStr.length > 800 ? '...' : ''}
Requirements: ${reqStr.substring(0, 500)}${reqStr.length > 500 ? '...' : ''}
`;
  }).join('\n');

  const goalInstruction = searchGoal
    ? `\nSEARCH GOAL (weight match scores and reasons to reflect this): ${searchGoal}\n`
    : '';

  const prompt = `Analyze this resume profile and rank these job listings by how well they match.${goalInstruction}

${profileSummary}

AVAILABLE JOBS:
${jobsSummary}

For each job provide:
1. jobId: use the exact id from the job list above.
2. matchScore (0-100): how well the user's background aligns with the job. Do not return 0 unless there is no overlap.
3. reasons: exactly 3 one-line strings, in this order: (1) Title/Industry Alignment — the context, e.g. role/industry fit; (2) Technical Skill Match — concrete evidence, e.g. a skill that matches a requirement; (3) Recent Achievement — recency, e.g. current role or recent experience that demonstrates capability. Do NOT include: missing skills, lacking qualifications, exceeding required experience, or being under required experience — those belong in growth areas, not in reasons.

PHRASING RULES for each reason:
- FORBIDDEN: Do NOT repeat the phrase "aligns with the Job description" or "aligns with the job description" at the end of every line. Vary your wording.
- FORBIDDEN (soft/hedging): "may apply", "coincides with", "is valuable for", "could be relevant", "might support", or similar.
- REQUIRED (varied connection verbs): Use different connection phrases across reasons, e.g. "is a direct fit for", "mirrors their requirement for", "will be an asset to", "demonstrates your ability to", "directly supports", "matches", "fulfills". Example: "Your AR experience is a direct fit for their collections focus." / "SAP proficiency mirrors their requirement for ERP experience." / "Your track record will be an asset to their team."

Return a JSON object with exactly one key "recommendations" whose value is an array of objects:

{
  "recommendations": [
    { "jobId": "<exact id>", "matchScore": <0-100>, "reasons": ["<title/industry reason>", "<technical skill reason>", "<recent achievement reason>"] }
  ]
}

Rank jobs by match score (highest first). Return ONLY the JSON object, no markdown or other text.`;

  type BasicRec = { jobId: string; matchScore: number; reasons: string[] };

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    const data = extractJSON<BasicRec[] | { recommendations?: BasicRec[] }>(response);
    const recommendations = Array.isArray(data)
      ? data
      : (Array.isArray((data as { recommendations?: BasicRec[] })?.recommendations)
          ? (data as { recommendations: BasicRec[] }).recommendations
          : []);

    return recommendations
      .map(rec => {
        const jobIdStr = rec.jobId != null ? String(rec.jobId) : '';
        const job = jobListings.find(j => String(j.id) === jobIdStr);
        if (!job) return null;
        const rawNum = typeof rec.matchScore === 'number' && !Number.isNaN(rec.matchScore)
          ? rec.matchScore
          : (typeof rec.matchScore === 'string' ? Number(rec.matchScore) : undefined);
        const matchScore = typeof rawNum === 'number' && !Number.isNaN(rawNum)
          ? Math.min(100, Math.max(0, Math.round(rawNum)))
          : 0;
        return {
          job,
          matchScore,
          reasons: rec.reasons || [],
          whyMatch: reasonsToWhyMatchSentence(rec.reasons || []),
        } as JobRecommendation;
      })
      .filter((rec): rec is JobRecommendation => rec !== null)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    throw error;
  }
}

/**
 * Generate job alerts based on profile changes
 */
export async function generateJobAlerts(
  profile: ResumeProfile,
  previousProfile?: ResumeProfile
): Promise<JobAlert[]> {
  const systemPrompt = `You are an intelligent job alert system that creates personalized job search criteria based on candidate profiles and career goals.`;

  const profileChanges = previousProfile ? `
PROFILE CHANGES DETECTED:
${profile.skills.filter(s => !previousProfile.skills.includes(s)).length > 0 
  ? `- New skills: ${profile.skills.filter(s => !previousProfile.skills.includes(s)).join(', ')}` 
  : ''}
${profile.yearsOfExperience > (previousProfile.yearsOfExperience || 0)
  ? `- Experience increased from ${previousProfile.yearsOfExperience} to ${profile.yearsOfExperience} years`
  : ''}
${profile.experience.length > (previousProfile.experience.length || 0)
  ? `- New experience added`
  : ''}
` : 'This is a new profile.';

  const prompt = `Generate intelligent job alert criteria based on this candidate profile.

CURRENT PROFILE:
- Skills: ${profile.skills.join(', ')}
- Years of Experience: ${profile.yearsOfExperience}
- Industry: ${profile.industry || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Current Role: ${profile.experience[0]?.title || 'Not specified'}

${profileChanges}

Create 2-3 job alert configurations that would help this candidate find relevant opportunities. Consider:
1. Current skills and experience level
2. Natural career progression paths
3. Related roles that leverage their background
4. Industry trends and growth areas

Return a JSON array with this exact structure:
[
  {
    "criteria": {
      "keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
      "location": "<location or 'Remote' or 'Any'>",
      "salaryMin": <number in thousands or null>,
      "salaryMax": <number in thousands or null>,
      "industry": "<industry or null>",
      "experienceLevel": "<entry|mid|senior|executive or null>"
    },
    "frequency": "daily|weekly|realtime",
    "description": "<brief description of what this alert finds>"
  }
]

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    const alerts = extractJSON<Array<{
      criteria: JobAlert['criteria'];
      frequency: JobAlert['frequency'];
      description: string;
    }>>(response);

    return alerts.map((alert, idx) => ({
      id: `alert-${Date.now()}-${idx}`,
      criteria: alert.criteria,
      frequency: alert.frequency,
      lastChecked: new Date().toISOString(),
      active: true
    }));
  } catch (error) {
    console.error('Error generating job alerts:', error);
    throw error;
  }
}

/**
 * Quick match score calculation (lightweight, for real-time use)
 */
export function calculateQuickMatchScore(
  profile: ResumeProfile,
  jobListing: JobListing
): number {
  let score = 0;

  // Skills matching (40 points)
  const jobText = `${jobListing.title} ${jobListing.description} ${jobListing.requirements}`.toLowerCase();
  const matchedSkills = profile.skills.filter(skill => 
    jobText.includes(skill.toLowerCase())
  );
  score += (matchedSkills.length / Math.max(profile.skills.length, 1)) * 40;

  // Experience level (20 points)
  const experienceMatch = jobListing.experienceLevel 
    ? (profile.yearsOfExperience >= 3 && jobListing.experienceLevel.includes('senior') ? 20 :
       profile.yearsOfExperience >= 1 && jobListing.experienceLevel.includes('mid') ? 15 :
       profile.yearsOfExperience < 2 && jobListing.experienceLevel.includes('entry') ? 20 : 10)
    : 10;
  score += experienceMatch;

  // Location (20 points)
  if (jobListing.location.toLowerCase().includes('remote')) {
    score += 20;
  } else if (profile.location && jobListing.location.toLowerCase().includes(profile.location.toLowerCase())) {
    score += 20;
  } else {
    score += 5; // Partial match
  }

  // Title/role matching (20 points)
  const profileTitles = profile.experience.map(e => e.title.toLowerCase());
  const titleMatch = profileTitles.some(title => 
    jobListing.title.toLowerCase().includes(title) || 
    title.includes(jobListing.title.toLowerCase())
  );
  score += titleMatch ? 20 : 5;

  return Math.min(100, Math.round(score));
}



