/**
 * Predictive Job Matching Service
 * ML-based job recommendation, salary prediction, and success probability scoring
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
  /** ATS score 0-100 from keyword density and formatting match (resume vs job description) */
  atsScore?: number;
  confidence: number;
  reasons: string[];
  /** Single cohesive sentence summarizing why this job matches (from reasons array) */
  whyMatch?: string;
  salaryPrediction: SalaryPrediction;
  successProbability: SuccessProbability;
  recommendedActions: string[];
}

export interface SalaryPrediction {
  predictedMin: number;
  predictedMax: number;
  predictedMedian: number;
  confidence: number;
  factors: string[];
  marketComparison: {
    percentile: number;
    industryAverage: number;
    locationAdjustment: number;
  };
}

export interface SuccessProbability {
  overallProbability: number; // 0-100
  breakdown: {
    qualifications: number;
    experience: number;
    skills: number;
    location: number;
    timing: number;
  };
  riskFactors: string[];
  improvementSuggestions: string[];
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
      timeout: 45000, // 45 seconds for AI responses
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

function extractJSON<T>(text: string): T {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(text);
}

/** Map AI reasons array into a single cohesive sentence for whyMatch. */
function reasonsToWhyMatchSentence(reasons: string[]): string {
  if (!reasons || reasons.length === 0) return '';
  const trimmed = reasons.filter(Boolean).map(r => r.trim());
  if (trimmed.length === 0) return '';
  if (trimmed.length === 1) return `Your profile aligns with this role: ${trimmed[0]}.`;
  if (trimmed.length === 2) return `Your profile aligns with this role: ${trimmed[0]} and ${trimmed[1]}.`;
  const rest = trimmed.slice(0, -1).join(', ');
  const last = trimmed[trimmed.length - 1];
  return `Your profile aligns with this role: ${rest}, and ${last}.`;
}

const TOP_KEYWORDS_COUNT = 5;

/**
 * Fallback ATS score when AI returns 0 or omits atsScore: (skillsMatched / totalRequiredKeywords) * 100.
 * Extracts up to TOP_KEYWORDS_COUNT keywords from the job (requirements + description) and counts
 * how many appear in the resume (profile skills + experience).
 */
function calculateAtsFallback(profile: ResumeProfile, job: JobListing): number {
  const jobText = `${job.requirements || ''} ${job.description || ''} ${job.title || ''}`.toLowerCase();
  // Extract candidate keywords: words of 3+ chars, skip common stopwords
  const stop = new Set(['the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'will', 'your', 'are', 'not', 'can', 'all', 'has', 'been', 'may', 'its', 'new', 'any', 'our', 'out', 'use', 'one', 'two', 'etc']);
  const words = jobText.split(/\s+/).filter(w => w.length >= 3 && !stop.has(w) && /[a-z]/.test(w));
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const w of words) {
    const norm = w.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (norm.length >= 2 && !seen.has(norm)) {
      seen.add(norm);
      keywords.push(norm);
      if (keywords.length >= TOP_KEYWORDS_COUNT) break;
    }
  }
  const totalRequiredKeywords = Math.max(1, keywords.length);
  const resumeText = [
    ...(profile.skills || []),
    ...(profile.experience || []).flatMap(e => [e.title || '', e.description || '', e.company || ''])
  ].join(' ').toLowerCase();
  const skillsMatched = keywords.filter(kw => resumeText.includes(kw)).length;
  return Math.round((skillsMatched / totalRequiredKeywords) * 100);
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
  const systemPrompt = `You are an expert job matching AI with deep knowledge of career paths, skill requirements, and job market trends. You analyze resumes and job listings to provide intelligent, personalized recommendations.`;

  const profileSummary = `
RESUME PROFILE:
- Skills: ${profile.skills.join(', ')}
- Years of Experience: ${profile.yearsOfExperience}
- Industry: ${profile.industry || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Experience: ${profile.experience.map(e => `${e.title} at ${e.company}`).join(', ')}
- Education: ${profile.education.map(e => `${e.degree} in ${e.field}`).join(', ')}
`;

  const jobsSummary = jobListings.slice(0, 20).map((job, idx) => `
JOB ${idx + 1} (id: "${job.id}"):
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${(job.description || '').substring(0, 800)}${(job.description || '').length > 800 ? '...' : ''}
Requirements: ${(job.requirements || '').substring(0, 500)}${(job.requirements || '').length > 500 ? '...' : ''}
`).join('\n');

  const goalInstruction = searchGoal
    ? `\nSEARCH GOAL (weight match scores and reasons to reflect this): ${searchGoal}\n`
    : '';

  const prompt = `Analyze this resume profile and rank these job listings by how well they match.${goalInstruction}

${profileSummary}

AVAILABLE JOBS:
${jobsSummary}

For each job, provide:
1. Match score (0-100): Assign a matchScore based on how well the user's background (Experience + Skills) aligns with the job requirements. Do not return 0 unless there is absolutely no overlap.
2. ATS score (0-100): Identify the top 5 must-have keywords from the Job Description (requirements + description). Compare them to the Resume (skills + experience). The atsScore is the percentage of these 5 keywords found in the Resume (e.g. 3 of 5 = 60, 5 of 5 = 100). Return this number; do not return 0 unless none of the top keywords appear in the resume.
3. Confidence level (0-100) in the recommendation
4. Specific reasons why this job matches (or doesn't)
5. Salary prediction based on profile and job requirements
6. Application success probability
7. Recommended actions to improve match

Return a JSON array with this exact structure. For "jobId" use the exact id value from the job list above (e.g. the "id" in "JOB 1 (id: \"...\")"):
[
  {
    "jobId": "<exact id from the job list above>",
    "matchScore": <number 0-100>,
    "atsScore": <number 0-100, keyword/format ATS pass likelihood>,
    "confidence": <number 0-100>,
    "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"],
    "salaryPrediction": {
      "predictedMin": <number in thousands>,
      "predictedMax": <number in thousands>,
      "predictedMedian": <number in thousands>,
      "confidence": <number 0-100>,
      "factors": ["<factor 1>", "<factor 2>"],
      "marketComparison": {
        "percentile": <number 0-100>,
        "industryAverage": <number in thousands>,
        "locationAdjustment": <number percentage>
      }
    },
    "successProbability": {
      "overallProbability": <number 0-100>,
      "breakdown": {
        "qualifications": <number 0-100>,
        "experience": <number 0-100>,
        "skills": <number 0-100>,
        "location": <number 0-100>,
        "timing": <number 0-100>
      },
      "riskFactors": ["<risk 1>", "<risk 2>"],
      "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>"]
    },
    "recommendedActions": ["<action 1>", "<action 2>"]
  }
]

Rank jobs from highest to lowest match score. Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    const recommendations = extractJSON<Array<{
      jobId: string;
      matchScore: number;
      atsScore?: number;
      confidence: number;
      reasons: string[];
      salaryPrediction: SalaryPrediction;
      successProbability: SuccessProbability;
      recommendedActions: string[];
    }>>(response);

    // Merge recommendations with job listings (match by id; coerce to string so AI-returned number still matches)
    return recommendations
      .map(rec => {
        const jobIdStr = rec.jobId != null ? String(rec.jobId) : '';
        const job = jobListings.find(j => String(j.id) === jobIdStr);
        if (!job) return null;
        // Coerce matchScore to number (AI may return string); if missing/NaN or 0, use overallProbability so UI aligns with Probability card
        const rawNum = typeof rec.matchScore === 'number' && !Number.isNaN(rec.matchScore)
          ? rec.matchScore
          : (typeof rec.matchScore === 'string' ? Number(rec.matchScore) : undefined);
        const rawScore = typeof rawNum === 'number' && !Number.isNaN(rawNum) ? rawNum : undefined;
        const fallback = rec.successProbability?.overallProbability;
        const resolved =
          rawScore != null && rawScore > 0
            ? Math.min(100, Math.max(0, Math.round(rawScore)))
            : (typeof fallback === 'number' && !Number.isNaN(fallback)
                ? Math.min(100, Math.max(0, Math.round(fallback)))
                : (typeof fallback === 'string' ? Math.min(100, Math.max(0, Math.round(Number(fallback)))) : undefined));
        const matchScore = resolved ?? (rawScore != null ? Math.min(100, Math.max(0, Math.round(rawScore))) : 0);
        // ATS score: use AI atsScore if valid and non-zero; if 0 or missing, use calculated fallback (skillsMatched/totalRequiredKeywords)*100
        const rawAts = rec.atsScore != null && typeof rec.atsScore === 'number' && !Number.isNaN(rec.atsScore)
          ? rec.atsScore
          : (typeof rec.atsScore === 'string' ? Number(rec.atsScore) : undefined);
        const fromAi = typeof rawAts === 'number' && !Number.isNaN(rawAts)
          ? Math.min(100, Math.max(0, Math.round(rawAts)))
          : undefined;
        const fallbackAts = calculateAtsFallback(profile, job);
        const atsScore = (fromAi != null && fromAi > 0) ? fromAi : fallbackAts;
        return {
          job,
          matchScore,
          atsScore,
          confidence: rec.confidence,
          reasons: rec.reasons,
          whyMatch: reasonsToWhyMatchSentence(rec.reasons || []),
          salaryPrediction: rec.salaryPrediction,
          successProbability: rec.successProbability,
          recommendedActions: rec.recommendedActions
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
 * Predict salary range for a job based on resume profile
 */
export async function predictSalary(
  profile: ResumeProfile,
  jobListing: JobListing
): Promise<SalaryPrediction> {
  const systemPrompt = `You are a compensation analyst with access to salary data across industries, locations, and experience levels. You provide accurate salary predictions based on market data.`;

  const prompt = `Predict the salary range for this job based on the candidate's profile and job requirements.

CANDIDATE PROFILE:
- Skills: ${profile.skills.join(', ')}
- Years of Experience: ${profile.yearsOfExperience}
- Experience / tenure: ${profile.experience.map(e => `${e.title} at ${e.company} (${e.duration})`).join('; ')}
- Current Salary: ${profile.currentSalary ? `$${profile.currentSalary}k` : 'Not provided'}
- Location: ${profile.location || 'Not specified'}
- Industry: ${profile.industry || 'Not specified'}

JOB LISTING:
Title: ${jobListing.title}
Company: ${jobListing.company}
Location: ${jobListing.location}
Description: ${(jobListing.description || '').substring(0, 500)}
Requirements: ${(jobListing.requirements || '').substring(0, 300)}
${jobListing.salaryRange ? `Posted Salary Range: ${jobListing.salaryRange}` : ''}

Provide a salary prediction considering:
1. Market rates for this role and location
2. Candidate's experience level
3. Industry standards
4. Company size and type (if inferable)
5. Required skills and qualifications

Market value / Top % ranking: Compare the job's salary to the user's specific seniority and tenure (e.g. years at each employer). If the job pays $50k but the candidate has 5+ years of relevant experience (e.g. Accounts Receivable at Forward Air and Health Clarified), weigh that in marketComparison.percentile: a $50k offer for a senior AR professional is below market, so reflect that in the percentile (e.g. lower "Top %" / higher percentile number). If the salary is strong for their level, use a higher "Top %" (lower percentile). Always tie the "Top %" to how the job's salary compares to the user's tenure and role level.

Return a JSON object with this exact structure:
{
  "predictedMin": <number in thousands, e.g., 80 for $80k>,
  "predictedMax": <number in thousands, e.g., 120 for $120k>,
  "predictedMedian": <number in thousands>,
  "confidence": <number 0-100>,
  "factors": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "marketComparison": {
    "percentile": <number 0-100 representing where this salary falls in the market for this candidate's tenure/seniority>,
    "industryAverage": <number in thousands>,
    "locationAdjustment": <number percentage, e.g., 15 for 15% above/below average>
  }
}

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<SalaryPrediction>(response);
  } catch (error) {
    console.error('Error predicting salary:', error);
    throw error;
  }
}

/**
 * Calculate application success probability
 */
export async function calculateSuccessProbability(
  profile: ResumeProfile,
  jobListing: JobListing
): Promise<SuccessProbability> {
  const systemPrompt = `You are an expert recruiter and career advisor with deep knowledge of hiring processes, candidate evaluation, and what makes applications successful.`;

  const prompt = `Calculate the probability of success for this candidate applying to this job.

CANDIDATE PROFILE:
- Skills: ${profile.skills.join(', ')}
- Years of Experience: ${profile.yearsOfExperience}
- Experience: ${profile.experience.map(e => `${e.title} at ${e.company} - ${e.description.substring(0, 100)}`).join('\n')}
- Education: ${profile.education.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join(', ')}
- Location: ${profile.location || 'Not specified'}

JOB LISTING:
Title: ${jobListing.title}
Company: ${jobListing.company}
Location: ${jobListing.location}
Description: ${jobListing.description || ''}
Requirements: ${jobListing.requirements || ''}
Experience Level: ${jobListing.experienceLevel || 'Not specified'}

Analyze:
1. How well qualifications match requirements
2. Experience relevance and level
3. Skills alignment
4. Location compatibility (remote/onsite)
5. Timing factors (job posting age, market conditions)

Return a JSON object with this exact structure:
{
  "overallProbability": <number 0-100>,
  "breakdown": {
    "qualifications": <number 0-100>,
    "experience": <number 0-100>,
    "skills": <number 0-100>,
    "location": <number 0-100>,
    "timing": <number 0-100>
  },
  "riskFactors": ["<risk factor 1>", "<risk factor 2>", "<risk factor 3>"],
  "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}

Be realistic and specific. Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<SuccessProbability>(response);
  } catch (error) {
    console.error('Error calculating success probability:', error);
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



