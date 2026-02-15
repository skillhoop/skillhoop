/**
 * ATS Score for Job Finder — 4 weighted pillars + subtractive gap logic.
 * Simulates how an ATS reads a resume against a job description.
 */

import type { ResumeProfile, JobListing } from './predictiveJobMatching';

export interface ATSJobScoreResult {
  atsScore: number;
  /** Matched must-have keywords / strengths for the card */
  keyStrengths: string[];
  /** Missing must-haves, tenure/location issues for the card */
  gaps: string[];
  /** e.g. "Critical Match Issue: Tenure" */
  criticalMatchIssues: string[];
  /** Per-pillar breakdown (0–100 each) for optional UI */
  breakdown: {
    keywordDensity: number;
    titleAndExperience: number;
    formattingIntegrity: number;
    gapPenalty: number;
  };
}

const STOP = new Set<string>([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'will', 'your',
  'are', 'not', 'can', 'all', 'has', 'been', 'may', 'its', 'new', 'any', 'our',
  'out', 'use', 'one', 'two', 'etc', 'ability', 'required', 'preferred', 'must',
]);

const WEIGHT_KEYWORD = 0.5;
const WEIGHT_TITLE_EXPERIENCE = 0.3;
const WEIGHT_FORMATTING = 0.2;

/** Extract required years from job text (e.g. "5+ years", "3-5 years") */
function parseRequiredYears(jobText: string): number | null {
  const lower = jobText.toLowerCase();
  // "5+ years", "5+ yrs", "minimum 5 years", "at least 5 years"
  const patterns = [
    /(?:minimum|at least|min\.?)\s*(\d+)\+?\s*(?:years?|yrs?)/i,
    /(\d+)\+\s*(?:years?|yrs?)/i,
    /(\d+)\s*[-–]\s*\d+\s*(?:years?|yrs?)/i, // take min of range
    /(\d+)\s*(?:years?|yrs?)\s*(?:experience|of experience)/i,
  ];
  for (const re of patterns) {
    const m = lower.match(re);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

/** Normalize for fuzzy match: lowercase, collapse spaces, remove punctuation */
function norm(s: string): string {
  return s.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Extract must-have keywords/phrases from JD (requirements + description + title). Prefer exact phrases. */
function extractMustHaveKeywords(job: JobListing): { phrase: string; weight: number }[] {
  const text = `${job.requirements || ''} ${job.description || ''} ${job.title || ''}`;
  const lower = text.toLowerCase();
  const result: { phrase: string; weight: number }[] = [];
  const seen = new Set<string>();

  // Quoted phrases (high weight)
  const quoted = text.match(/"([^"]+)"/g) || [];
  quoted.forEach((q) => {
    const phrase = q.replace(/"/g, '').trim().toLowerCase();
    if (phrase.length >= 2 && phrase.length <= 50 && !seen.has(phrase)) {
      seen.add(phrase);
      result.push({ phrase, weight: 1.2 });
    }
  });

  // Title words (high weight) — important role terms
  const titleWords = (job.title || '')
    .split(/\s+/)
    .map((w) => w.replace(/[^\w]/g, '').toLowerCase())
    .filter((w) => w.length >= 2 && !STOP.has(w));
  titleWords.forEach((w) => {
    if (!seen.has(w)) {
      seen.add(w);
      result.push({ phrase: w, weight: 1.1 });
    }
  });

  // Requirements: lines that start with bullet or "must", "required", "experience with"
  const reqLines = (job.requirements || '')
    .split(/\n/)
    .map((l) => l.replace(/^[\s•\-*]+\s*/, '').trim())
    .filter(Boolean);
  reqLines.forEach((line) => {
    const lineLower = line.toLowerCase();
    // Multi-word phrases (2–4 words) from requirement lines
    const words = lineLower.split(/\s+/).filter((w) => w.length >= 2 && !STOP.has(w.replace(/[^\w]/g, '')));
    for (let i = 0; i < words.length; i++) {
      const w = words[i].replace(/[^\w]/g, '');
      if (w.length >= 2 && !seen.has(w)) {
        seen.add(w);
        result.push({ phrase: w, weight: 1 });
      }
      if (i < words.length - 1) {
        const two = `${words[i]} ${words[i + 1]}`.replace(/[^\w\s]/g, '');
        if (two.length >= 4 && !seen.has(two)) {
          seen.add(two);
          result.push({ phrase: two, weight: 1.1 });
        }
      }
    }
  });

  // Fallback: significant words from full text (cap at ~25)
  const words = lower.split(/\s+/).filter((w) => {
    const clean = w.replace(/[^a-z0-9]/gi, '').toLowerCase();
    return clean.length >= 3 && !STOP.has(clean) && /[a-z]/.test(clean);
  });
  const wordFreq = new Map<string, number>();
  words.forEach((w) => {
    const clean = w.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (clean.length >= 2) wordFreq.set(clean, (wordFreq.get(clean) ?? 0) + 1);
  });
  const sorted = [...wordFreq.entries()]
    .filter(([k]) => !seen.has(k))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  sorted.forEach(([phrase]) => {
    seen.add(phrase);
    result.push({ phrase, weight: 1 });
  });

  return result.slice(0, 30);
}

/** Build resume text from profile for keyword search */
function resumeTextFromProfile(profile: ResumeProfile): string {
  const parts = [
    ...(profile.skills || []),
    ...(profile.experience || []).flatMap((e) => [e.title || '', e.description || '', e.company || '']),
    ...(profile.education || []).flatMap((e) => [e.degree || '', e.field || '', e.institution || '']),
  ];
  return parts.join(' ').toLowerCase();
}

/** Pillar 1: Keyword density (50%). Exact terminology + frequency bonus. */
function pillarKeywordDensity(
  profile: ResumeProfile,
  job: JobListing,
  mustHaveKeywords: { phrase: string; weight: number }[]
): { score: number; keyStrengths: string[]; missing: string[] } {
  const resumeText = resumeTextFromProfile(profile);
  const resumeNorm = norm(resumeText);
  let totalWeight = 0;
  let matchedWeight = 0;
  const keyStrengths: string[] = [];
  const missing: string[] = [];

  for (const { phrase, weight } of mustHaveKeywords) {
    const phraseNorm = norm(phrase);
    totalWeight += weight;
    const exactMatch = resumeNorm.includes(phraseNorm) || resumeText.includes(phrase.toLowerCase());
    const tokenMatch = phraseNorm.split(/\s+/).every((t) => t.length >= 2 && resumeNorm.includes(t));
    const count = (resumeText.match(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
    const frequencyBonus = count >= 2 ? 1.1 : count === 1 ? 1 : 0;

    if (exactMatch || tokenMatch) {
      matchedWeight += weight * Math.min(frequencyBonus, 1.15);
      if (keyStrengths.length < 10) keyStrengths.push(phrase);
    } else {
      missing.push(phrase);
    }
  }

  const raw = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
  return {
    score: Math.min(100, Math.round(raw)),
    keyStrengths,
    missing,
  };
}

/** Pillar 2: Title and experience alignment (30%). Title match + tenure. */
function pillarTitleAndExperience(
  profile: ResumeProfile,
  job: JobListing,
  jobText: string
): { score: number; criticalIssues: string[] } {
  const criticalIssues: string[] = [];
  let titleScore = 50;
  let tenureScore = 50;

  // Title match: compare job title with current/most recent role
  const jobTitleNorm = norm(job.title || '');
  const profileTitles = (profile.experience || []).map((e) => norm(e.title || ''));
  const exactMatch = profileTitles.some((t) => jobTitleNorm.includes(t) || t.includes(jobTitleNorm));
  const wordOverlap = jobTitleNorm.split(/\s+/).filter((w) => w.length >= 2);
  const overlapCount = wordOverlap.filter((w) => profileTitles.some((t) => t.includes(w))).length;
  const overlapRatio = wordOverlap.length > 0 ? overlapCount / wordOverlap.length : 0;

  if (exactMatch) titleScore = 100;
  else if (overlapRatio >= 0.5) titleScore = 75;
  else if (overlapRatio >= 0.25) titleScore = 50;
  else titleScore = 25;

  // Tenure: required years vs profile.yearsOfExperience
  const requiredYears = parseRequiredYears(jobText);
  const profileYears = profile.yearsOfExperience ?? 0;
  if (requiredYears != null) {
    if (profileYears >= requiredYears) tenureScore = 100;
    else if (profileYears >= requiredYears - 1) tenureScore = 70;
    else {
      tenureScore = Math.max(0, Math.round((profileYears / requiredYears) * 60));
      criticalIssues.push(`Tenure: job requires ${requiredYears}+ years; profile shows ~${profileYears} years`);
    }
  } else {
    tenureScore = 80; // no explicit requirement
  }

  const score = Math.round(titleScore * 0.5 + tenureScore * 0.5);
  return { score: Math.min(100, score), criticalIssues };
}

/** Pillar 3: Formatting and parsing integrity (20%). Section presence + contact from profile. */
function pillarFormattingIntegrity(profile: ResumeProfile): number {
  let score = 0;
  const hasExperience = (profile.experience?.length ?? 0) >= 1;
  const hasEducation = (profile.education?.length ?? 0) >= 1;
  const hasSkills = (profile.skills?.length ?? 0) >= 1;
  const hasLocation = Boolean(profile.location?.trim());

  if (hasExperience) score += 40;
  if (hasEducation) score += 30;
  if (hasSkills) score += 20;
  if (hasLocation) score += 10;

  return Math.min(100, score);
}

/** Pillar 4: Gap logic (subtractive). Missing must-haves, location constraint. */
function pillarGapPenalty(
  profile: ResumeProfile,
  job: JobListing,
  missingKeywords: string[],
  criticalIssues: string[]
): { penalty: number; gapMessages: string[] } {
  const gapMessages: string[] = [];
  let penalty = 0;

  // Top missing keywords as "skill gaps" (mandatory feel)
  const topMissing = missingKeywords.slice(0, 5);
  if (topMissing.length > 0) {
    penalty += Math.min(25, topMissing.length * 6);
    gapMessages.push(...topMissing.map((m) => `Missing: "${m}"`));
  }

  // Location: strict city match and no "relocate" in resume
  const jobLoc = (job.location || '').toLowerCase();
  const resumeLoc = (profile.location || '').toLowerCase();
  const resumeText = resumeTextFromProfile(profile);
  const mentionsRelocate = /relocat|willing to move|open to (relocation|relocate)/i.test(resumeText);
  if (jobLoc && !jobLoc.includes('remote')) {
    const jobCity = jobLoc.split(/[,;]/)[0].trim();
    if (jobCity && resumeLoc && !resumeLoc.includes(jobCity) && !mentionsRelocate) {
      penalty += 10;
      gapMessages.push(`Location: job in ${jobCity}; consider adding "willing to relocate" if applicable`);
    }
  }

  gapMessages.push(...criticalIssues);
  return { penalty: Math.min(40, penalty), gapMessages };
}

/**
 * Compute ATS score for a single job against a resume profile using the 4 pillars.
 */
export function calculateAtsJobScore(profile: ResumeProfile, job: JobListing): ATSJobScoreResult {
  const jobText = `${job.requirements || ''} ${job.description || ''} ${job.title || ''}`;
  const mustHaveKeywords = extractMustHaveKeywords(job);

  const { score: keywordScore, keyStrengths, missing } = pillarKeywordDensity(profile, job, mustHaveKeywords);
  const { score: titleExpScore, criticalIssues } = pillarTitleAndExperience(profile, job, jobText);
  const formattingScore = pillarFormattingIntegrity(profile);
  const { penalty, gapMessages } = pillarGapPenalty(profile, job, missing, criticalIssues);

  // Weighted sum then subtract gap penalty
  const weighted =
    keywordScore * WEIGHT_KEYWORD +
    titleExpScore * WEIGHT_TITLE_EXPERIENCE +
    formattingScore * WEIGHT_FORMATTING;
  const rawScore = Math.round(weighted - penalty);
  const atsScore = Math.min(100, Math.max(0, rawScore));

  return {
    atsScore,
    keyStrengths,
    gaps: gapMessages,
    criticalMatchIssues: criticalIssues,
    breakdown: {
      keywordDensity: keywordScore,
      titleAndExperience: titleExpScore,
      formattingIntegrity: formattingScore,
      gapPenalty: penalty,
    },
  };
}
