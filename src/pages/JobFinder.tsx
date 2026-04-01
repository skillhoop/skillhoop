/**
 * Smart Job Matcher — Single source of truth for Job Finder.
 * Uses ONLY real APIs: searchJobs (jobService) + predictiveJobMatching.
 * JobFinderModule.tsx is not used; dashboard renders this page.
 */
import { useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react';
import { 
  Search, Briefcase, MapPin, DollarSign, Calendar, Building2, 
  ExternalLink, BookmarkPlus, Bookmark, Check, ChevronDown, X, Loader2, 
  Star, Clock, FileText, Upload, Sparkles, Target, TrendingUp, 
  AlertCircle, BarChart3, ArrowLeft, Plus, GraduationCap, Globe,
  SlidersHorizontal, Share2, MoreHorizontal, CheckCircle2, AlertTriangle,
  FolderOpen, Info
} from 'lucide-react';
import {
  getJobRecommendations,
  generateJobAlerts,
  type JobRecommendation,
  type JobListing,
  type ResumeProfile,
  type JobAlert
} from '../lib/predictiveJobMatching';
import { WorkflowTracking } from '../lib/workflowTracking';
import { useWorkflowContext } from '../hooks/useWorkflowContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import FirstTimeEntryCard from '../components/workflows/FirstTimeEntryCard';
import WorkflowBreadcrumb from '../components/workflows/WorkflowBreadcrumb';
import WorkflowPrompt from '../components/workflows/WorkflowPrompt';
import WorkflowCompletion from '../components/workflows/WorkflowCompletion';
import WorkflowTransition from '../components/workflows/WorkflowTransition';
import WorkflowQuickActions from '../components/workflows/WorkflowQuickActions';
import type { Job as JSearchJob, JobHighlights } from '../types/job';
import {
  getWorkspaceJobSections,
  type JobWorkspaceSection,
  isJobSectionSubheadBullet,
  jobSectionSubheadText,
} from '../lib/jobDescriptionSections';
import {
  searchJobs,
  fetchJSearchJobDetails,
  shouldDeepFetchJobDescription,
} from '../lib/services/jobService';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { insertUserJobHistory, JOB_FINDER_SESSION_RESTORE_KEY } from '../lib/userJobHistory';
import { calculateLocalBaseMatch, getBestMatchingAchievement, getMarketValueEstimate } from '../lib/probabilityEngine';
import JobSearchDashboard from '../components/dashboard/JobSearchDashboard';
import JobSearchBar, { type JobSearchBarFilters } from '../components/jobfinder/JobSearchBar';
import { WorkspaceJobBoardMatchCards } from '../components/jobfinder/WorkspaceJobBoardMatchCards';
import { JobBoardBriefcaseIcon } from '../components/jobfinder/jobBoardIcons';

// --- Types (aligned with jobService JSearch response + UI) ---
interface Job {
  id: string; // matches job_id from jobService (JSearch)
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string;
  postedDate: string;
  url: string;
  source: string;
  matchScore?: number;
  whyMatch?: string;
  logoInitial?: string;
  logoColor?: string;
  /** Match reasons from AI (for "Why this is a top match") */
  reasons?: string[];
  daysAgo?: string;
  experienceLevel?: string;
  /** JSearch structured bullets (Responsibilities, Qualifications, etc.) */
  jobHighlights?: JobHighlights;
  /** Short preview from API when full description is missing */
  snippet?: string;
  /** Raw `job_description` from API (fallback if `description` was cleared or derived elsewhere) */
  job_description?: string;
  /** Alternate short JD field from some boards */
  job_description_snippet?: string;
  /** Benefits text or bullet strings from API */
  job_benefits?: string;
  /** Aggregated description + highlights + benefits from jobService */
  greedy_full_text?: string;
  /** Description + snippet + Qualifications/Responsibilities (jobService); preferred when API body is short */
  unified_description?: string;
  /** After a successful or failed job-details call, avoid repeat fetches */
  jsearch_details_fetched?: boolean;
  /** JSearch country hint for job-details */
  job_country?: string | null;
  /** JSearch job_highlights.Skills or merged list for Skills row */
  skills?: string[];
}

interface Filters {
  datePosted: string;
  experienceLevel: string;
  remote: string;
  salaryRange: string;
}

interface ResumeFilters {
  workType: string;
  remote: string;
  experienceLevel: string;
  minSalary: string;
  location: string;
}

interface TrackedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  postedDate: string;
  source: string;
  status: string;
  notes: string;
  applicationDate: string;
  interviewDate: string;
  contacts: string;
  url: string;
  whyMatch?: string;
  description?: string;
  addedFrom: string;
  addedAt: string;
}

interface ResumeData {
  personalInfo?: {
    fullName?: string; // Changed from 'name' to 'fullName' for consistency
    name?: string; // Keep for backward compatibility
    title?: string; // Job title when provided by parser
    jobTitle?: string; // Same as title; used by app and Job Finder search
    email?: string;
    location?: string;
  };
  skills?: {
    technical?: string[];
    soft?: string[];
  };
  experience?: Array<{
    position?: string;
    company?: string;
    location?: string;
    duration?: string;
    description?: string;
  }>;
  summary?: string;
}

/** Safely trim values that may be non-strings (e.g. from API/parser). Avoids "trim is not a function". */
function safeTrim(s: unknown): string {
  if (s == null) return '';
  return typeof s === 'string' ? s.trim() : String(s).trim();
}

type WorkspaceResultSortKey = 'original' | 'ats' | 'hire' | 'date';

/** Deduped short skill tags for job cards / Skills section (JSearch + fallbacks). */
function normalizeJobSkillTokens(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raw) {
    const t = safeTrim(r);
    if (!t || t.length > 80) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= 16) break;
  }
  return out;
}

function skillsTokensFromHighlights(h?: JobHighlights): string[] {
  if (!h?.Skills?.length) return [];
  return normalizeJobSkillTokens(h.Skills);
}

function extractSkillLikeChunksFromRequirements(req: string): string[] {
  if (!req?.trim()) return [];
  const parts = req.split(/[,;•\n]/).map((s) => s.trim()).filter(Boolean);
  return normalizeJobSkillTokens(parts)
    .filter((p) => p.length >= 2 && p.length <= 48)
    .slice(0, 12);
}

function workspaceJobPostedMs(job: Job): number {
  const d = safeTrim(job.postedDate);
  if (!d) return 0;
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : 0;
}

function workspaceHireSortScore(job: Job): number {
  const hp = (job as { hireProbability?: number }).hireProbability;
  if (typeof hp === 'number' && !Number.isNaN(hp)) return hp;
  return job.matchScore ?? 0;
}

/**
 * Skills row at bottom of detail: API highlights → job.skills → reason tags → requirements → resume matches → fallback.
 */
function buildWorkspaceDetailSkillPills(
  job: Job,
  reasonTags: string[],
  skillsWithMatch: { name: string; matched: boolean }[]
): string[] {
  const fromStored = normalizeJobSkillTokens(job.skills ?? []);
  if (fromStored.length) return fromStored.slice(0, 12);
  const fromHi = skillsTokensFromHighlights(job.jobHighlights);
  if (fromHi.length) return fromHi.slice(0, 12);
  const fromReasons = normalizeJobSkillTokens(reasonTags);
  if (fromReasons.length) return fromReasons.slice(0, 12);
  const fromReq = extractSkillLikeChunksFromRequirements(job.requirements || '');
  if (fromReq.length) return fromReq.slice(0, 12);
  const resumeMatched = normalizeJobSkillTokens(
    skillsWithMatch.filter((s) => s.matched).map((s) => s.name)
  );
  if (resumeMatched.length) return resumeMatched.slice(0, 12);
  return [];
}

/**
 * Build a detailed professional summary from resumeData for the dashboard.
 * Stitches together: summary, last 2 experience items, and top 5 skills.
 * Returns 2-3 clean, readable paragraphs.
 */
function buildDetailedResumeSummary(data: ResumeData | null): string {
  if (!data) return 'No summary extracted. Upload a resume to get started.';
  const paragraphs: string[] = [];

  // Paragraph 1: Overall summary (from parsed resume)
  const summary = data.summary;
  if (summary && typeof summary === 'string' && summary.trim()) {
    paragraphs.push(summary.trim());
  }

  // Paragraph 2: Last 2 experience items (most recent 2)
  const recentExp = (data.experience ?? []).slice(0, 2);
  if (recentExp.length > 0) {
    const expLines = recentExp.map((exp) => {
      const pos = exp.position ?? 'Role';
      const company = exp.company ?? 'Company';
      const duration = exp.duration ?? '';
      const desc = exp.description?.trim();
      const suffix = duration ? ` (${duration})` : '';
      if (desc) {
        const snippet = desc.length > 180 ? desc.slice(0, 180).trim() + '...' : desc;
        return `At ${company} as ${pos}${suffix}: ${snippet}`;
      }
      return `At ${company} as ${pos}${suffix}.`;
    });
    paragraphs.push(expLines.join(' '));
  }

  // Paragraph 3: Top 5 skills
  const allSkills = [...(data.skills?.technical ?? []), ...(data.skills?.soft ?? [])];
  const top5 = allSkills.slice(0, 5).filter((s): s is string => Boolean(s && typeof s === 'string' && s.trim()));
  if (top5.length > 0) {
    paragraphs.push(`Key skills include ${top5.join(', ')}.`);
  }

  if (paragraphs.length === 0) return 'No summary extracted. Upload a resume to get started.';
  return paragraphs.join('\n\n');
}

/** Normalize location for display and query: if object, use city/name/display_name/region/countryName; otherwise string. Prevents '[object Object]' in UI. */
function locationToDisplayString(loc: unknown): string {
  if (loc == null) return '';
  if (typeof loc === 'string') return loc === '[object Object]' ? '' : loc;
  if (typeof loc === 'object' && loc !== null && !Array.isArray(loc)) {
    const o = loc as Record<string, unknown>;
    const city = typeof o.city === 'string' ? o.city : '';
    const name = typeof o.name === 'string' ? o.name : '';
    const displayName = typeof o.display_name === 'string' ? o.display_name : '';
    const displayLocation = typeof o.displayLocation === 'string' ? o.displayLocation : '';
    const region = typeof o.region === 'string' ? o.region : '';
    const countryName = typeof o.countryName === 'string' ? o.countryName : '';
    const regionCountry = region && countryName ? [region, countryName].filter(Boolean).join(', ') : (region || countryName);
    return city || name || displayName || displayLocation || regionCountry || '';
  }
  const s = String(loc);
  return s === '[object Object]' ? '' : s;
}

/** Parse required years from job requirements text (e.g. "5+ years", "3-5 years experience"). */
function parseRequiredYearsFromRequirements(requirements: string | undefined): number | null {
  if (!requirements?.trim()) return null;
  const text = requirements.trim().toLowerCase();
  const rangeMatch = text.match(/(\d+)\s*[-–]\s*(\d+)\s*(?:years?|yrs?|y\.?o\.?)/);
  if (rangeMatch) return parseInt(rangeMatch[2], 10);
  const plusMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?|y\.?o\.?)/);
  if (plusMatch) return parseInt(plusMatch[1], 10);
  const simpleMatch = text.match(/(?:(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience)/);
  if (simpleMatch) return parseInt(simpleMatch[1], 10);
  return null;
}

/** True if reason text implies "exceeds required experience" (so we can re-categorize when user is under). */
function isExceedsExperienceReason(reason: string): boolean {
  const r = reason.toLowerCase();
  return /\bexceeds?\b.*\b(experience|required|qualification)/.test(r) ||
    /\b(experience|qualification)s?\s+exceeds?\b/.test(r) ||
    /\babove\s+required\b/.test(r) ||
    /\bmore\s+than\s+required\b/.test(r) ||
    /\bover\s+qualified\b/.test(r);
}

/** True if reason mentions missing skill(s) — must only appear in Growth Areas, not top match. */
function isMissingSkillReason(reason: string): boolean {
  const r = reason.toLowerCase();
  return /\bmissing\b.*\b(skill|qualification|requirement)/.test(r) ||
    /\b(skill|qualification)s?\s+(missing|gap|lack)/.test(r) ||
    /\b(lack|without)\s+.*\s+(experience|skill)/.test(r) ||
    /\bneed(s|ed)?\s+(more|additional)\s+(experience|skill)/.test(r);
}

/** True if reason mentions under/below required experience — must only appear in Growth Areas. */
function isUnderExperienceReason(reason: string): boolean {
  const r = reason.toLowerCase();
  return /\b(under|below)\s+(required|qualification|experience)/.test(r) ||
    /\b(less|fewer)\s+.*\s+(years?|experience)/.test(r) ||
    /\b(experience|years?)\s+(below|under)\s+required/.test(r);
}

/** Industry keywords used to detect alignment between JD and resume experience. */
const INDUSTRY_KEYWORDS = [
  'logistics', 'finance', 'banking', 'healthcare', 'retail', 'ecommerce', 'saas', 'technology',
  'insurance', 'consulting', 'manufacturing', 'education', 'edtech', 'fintech', 'healthtech',
  'pharmaceutical', 'government', 'nonprofit', 'media', 'hospitality'
];

/** Stopwords for context keyword extraction (skills + experience). */
const CONTEXT_STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'in', 'is', 'it', 'of', 'on', 'or', 'the', 'to', 'with',
  'this', 'that', 'their', 'our', 'your', 'we', 'you', 'they', 'have', 'had', 'was', 'were', 'will', 'can', 'all', 'each',
  'years', 'year', 'experience', 'responsibilities', 'including', 'etc', 'using', 'used',
]);

/**
 * Extract top 5 most frequent meaningful words (context keywords) from resumeData.skills and resumeData.experience.
 * Used to identify matches in the Job Description — industry-agnostic.
 */
function extractContextKeywords(resumeData: ResumeData | null): string[] {
  if (!resumeData) return [];
  const textParts: string[] = [];
  const technical = resumeData.skills?.technical ?? [];
  const soft = resumeData.skills?.soft ?? [];
  technical.forEach(s => { if (s?.trim()) textParts.push(s.trim()); });
  soft.forEach(s => { if (s?.trim()) textParts.push(s.trim()); });
  resumeData.experience?.forEach(exp => {
    const desc = exp?.description?.trim();
    if (desc) textParts.push(desc);
    const pos = exp?.position?.trim();
    if (pos) textParts.push(pos);
  });
  const combined = textParts.join(' ').toLowerCase();
  const tokens = combined.replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(Boolean);
  const freq = new Map<string, number>();
  for (const t of tokens) {
    const w = t.replace(/^['-]+|['-]+$/g, '').toLowerCase();
    if (w.length < 2 || CONTEXT_STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 5).map(([word]) => word);
}

/**
 * Four-point narrative for "Why this is a top match" — natural, persuasive sentences
 * built from resumeData (same object used in Resume View debug).
 */
interface TopMatchNarrative {
  /** Point 1: Background/Tenure — years of experience + relevant title. */
  background: string;
  /** Point 2: Responsibilities — core duty from JD mapped to user's track record. */
  responsibilities: string;
  /** Point 3: Contributions/Skills — tools and how they will be used for the role. */
  contributions: string;
  /** Point 4: Result-Oriented — specific achievement suggesting immediate value. */
  resultOriented: string;
}

// Duty validation: allow strings that start with an action verb and contain at least one context keyword (industry-agnostic).
const DUTY_ACTION_VERBS = [
  'managing', 'overseeing', 'handling', 'leading', 'coordinating', 'resolving', 'processing',
  'reconciling', 'maintaining', 'preparing', 'reviewing', 'ensuring', 'supporting', 'assisting',
  'monitoring', 'tracking', 'analyzing', 'documenting', 'communicating', 'facilitating',
  'developing', 'implementing', 'optimizing', 'creating', 'building', 'driving', 'executing',
];
const DUTY_FORBIDDEN_SUBSTRINGS = [
  'nos', 'location:', 'headquarters', 'headquartered', 'business solutions provider',
  'we are ', 'company overview', 'about us', 'our company', 'our mission', 'full-time',
  'part-time', 'remote', 'hybrid', 'salary', 'benefits', 'equal opportunity', 'eoe',
];

function isForbiddenDuty(text: string): boolean {
  const lower = text.toLowerCase();
  return DUTY_FORBIDDEN_SUBSTRINGS.some(f => lower.includes(f));
}

function dutyStartsWithActionVerb(text: string): boolean {
  const trimmed = text.trim();
  const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase() || '';
  return DUTY_ACTION_VERBS.some(v => firstWord === v || firstWord.startsWith(v));
}

function dutyContainsContextKeyword(text: string, contextKeywords: string[]): boolean {
  if (!contextKeywords.length) return false;
  const lower = text.toLowerCase();
  return contextKeywords.some(k => lower.includes(k.toLowerCase()));
}

function isValidDutyCandidateWithContext(text: string, contextKeywords: string[]): boolean {
  if (!text || text.length < 10 || text.length > 120) return false;
  if (isForbiddenDuty(text)) return false;
  if (!dutyStartsWithActionVerb(text)) return false;
  if (!dutyContainsContextKeyword(text, contextKeywords)) return false;
  return true;
}

/** Clean duty phrase for display: remove bullet points, "Key Responsibility" headers, extra punctuation. */
function cleanDutyPhrase(raw: string): string {
  let s = raw
    .replace(/^[-•*]\s*/g, '')
    .replace(/^\d+[.)]\s*/g, '')
    .replace(/\b(key responsibility|key responsibilities)\s*:?\s*/gi, '')
    .replace(/[•*–—]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s.replace(/^[.:,\s]+|[.:,\s]+$/g, '').trim();
  return s || raw;
}

/** Stable hash of string for template rotation (Job 1 → A, Job 2 → B, etc.). */
function templateIndexForJob(job: Job): number {
  const s = (job.id ?? job.title ?? '') + (job.company ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 3;
}

/** Point 4 templates (rotation) — wrap the chosen achievement bullet. */
function getPoint4Template(idx: number, bullet: string): string {
  const lower = bullet.toLowerCase();
  const templates = [
    () => `Your history of ${lower} suggests you can drive immediate efficiency in this role.`,
    () => `Your track record of ${lower} demonstrates you can deliver value from day one.`,
    () => `Experience such as ${lower} positions you to contribute quickly in this role.`,
  ];
  return templates[idx % 3]();
}

/**
 * Build a 4-point narrative for "Why this is a top match" using resumeData and job.
 * Produces full, professional sentences without STAR headers.
 */
function buildEvidenceBullets(
  resumeData: ResumeData | null,
  profile: ResumeProfile | null,
  job: Job,
  options?: { recentlyUsedBullets?: string[]; selectedSearchStrategy?: string | null; willingToRelocate?: boolean }
): (TopMatchNarrative & { point4RawBullet?: string; relocateBullet?: string }) | null {
  if (!resumeData?.experience?.length) return null;

  const contextKeywords = extractContextKeywords(resumeData);
  const currentRole = resumeData.experience[0];
  const company = currentRole?.company || 'your current role';
  const jobText = `${job.title} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
  const jobDesc = (job.description || '').toLowerCase();
  const jobReqs = (job.requirements || '').toLowerCase();
  const currentDesc = (currentRole?.description || '').toLowerCase();

  // --- Point 1 (Universal): job title or, when Skill-Based Match, technical skills narrative ---
  const jobTitleFromResume = resumeData.personalInfo?.jobTitle ?? resumeData.personalInfo?.title ?? currentRole?.position ?? 'a professional in this field';
  const technicalSkills = resumeData.skills?.technical || [];
  const skillBasedActive = options?.selectedSearchStrategy === 'skill_based' && technicalSkills.length > 0;
  const skillsPhrase = technicalSkills.slice(0, 3).join(', ');
  const background = skillBasedActive
    ? `Your advanced proficiency in ${skillsPhrase} makes you a strong technical contender for this role, even beyond your previous title.`
    : `Your specialized background as a ${jobTitleFromResume} aligns with the core needs of this position.`;

  // --- Point 2 (Responsibilities): JD sentence that contains a context keyword and starts with an action verb ---
  const responsibilityPatterns = [
    /\b(managing|overseeing|handling|leading|coordinating|resolving|processing|reconciling)\s+([^.,]+?)(?=[.,]|$)/gi,
    /\b(responsible for|responsibility for|duties include)\s+([^.,]+?)(?=[.,]|$)/gi,
    /\b(experience with|experience in)\s+([^.,]+?)(?=[.,]|$)/gi,
  ];
  let jdDuty = '';
  const fullJd = `${job.description || ''} ${job.requirements || ''}`;
  const allCandidates: string[] = [];
  for (const re of responsibilityPatterns) {
    let match: RegExpExecArray | null;
    const resetRe = new RegExp(re.source, re.flags);
    while ((match = resetRe.exec(fullJd)) !== null && match[0]) {
      const candidate = match[0].replace(/^(responsible for|responsibility for|duties include|experience with|experience in)\s+/i, '').trim();
      allCandidates.push(candidate);
    }
  }
  for (const candidate of allCandidates) {
    if (isValidDutyCandidateWithContext(candidate, contextKeywords)) {
      jdDuty = candidate;
      break;
    }
  }
  if (!jdDuty) {
    const reqFirst = (job.requirements || '').split(/[.;]/)[0]?.trim();
    if (reqFirst && isValidDutyCandidateWithContext(reqFirst, contextKeywords)) jdDuty = reqFirst;
  }
  if (!jdDuty && fullJd) {
    const verbPattern = /\b(managing|overseeing|handling|leading|coordinating|resolving|processing|reconciling|maintaining|preparing|reviewing|ensuring|supporting|monitoring|tracking|analyzing|documenting|communicating|facilitating|developing|implementing|optimizing)\s+([^.,;]+?)(?=[.,;]|$)/gi;
    let verbMatch: RegExpExecArray | null;
    const verbRe = new RegExp(verbPattern.source, verbPattern.flags);
    while ((verbMatch = verbRe.exec(fullJd)) !== null && verbMatch[0]) {
      const phrase = verbMatch[0].trim();
      if (phrase.length >= 12 && phrase.length <= 100 && !isForbiddenDuty(phrase) && dutyContainsContextKeyword(phrase, contextKeywords)) {
        jdDuty = phrase;
        break;
      }
    }
  }
  const usedGenericFallback = !jdDuty;
  if (!jdDuty) {
    jdDuty = 'managing critical workflows and meeting key deliverables';
  }
  const dutyPhrase = cleanDutyPhrase(jdDuty);
  const jobTitle = (job.title || '').trim();
  const responsibilities = usedGenericFallback && jobTitle
    ? `Your background matches their need for an expert ${jobTitle}, a core component of this role.`
    : `Your background matches their need for ${dutyPhrase}, a core component of this role.`;

  // --- Point 3 (Contributions/Skills): map technical skills from debug view to JD requirements ---
  const matchingTools: string[] = [];
  for (const skill of technicalSkills) {
    if (!skill || skill.length < 2) continue;
    const skillLower = skill.toLowerCase();
    if (jobText.includes(skillLower)) matchingTools.push(skill);
  }
  const toolsList = matchingTools.length > 0 ? matchingTools.slice(0, 4) : technicalSkills.slice(0, 3);
  const toolsPhrase = toolsList.length > 0 ? toolsList.join(', ') : technicalSkills.slice(0, 3).join(', ');
  const jobUse = 'the requirements of this role';
  const contributions = toolsPhrase
    ? `Your proficiency in ${toolsPhrase} provides the technical toolkit needed to manage ${jobUse} immediately.`
    : `Your technical expertise from your role at ${company} will be an asset for the requirements of this position.`;

  // --- Point 4 (Result-Oriented): best-matching achievement from all experience bullets (debug view) ---
  const localProfileForEngine = {
    skills: [...(resumeData.skills?.technical ?? []), ...(resumeData.skills?.soft ?? [])],
    experience: (resumeData.experience ?? []).map(exp => ({
      title: exp.position ?? exp.company ?? '',
      company: exp.company ?? '',
      duration: exp.duration ?? '',
      description: exp.description ?? '',
    })),
    personalInfo: resumeData.personalInfo ? { jobTitle: resumeData.personalInfo.jobTitle ?? resumeData.personalInfo.title, location: resumeData.personalInfo.location } : undefined,
    summary: resumeData.summary,
  };
  const localJobForEngine = {
    title: job.title,
    requirements: `${(job.description || '').trim()} ${(job.requirements || '').trim()}`.trim(),
    location: job.location,
  };
  const recentlyUsed = options?.recentlyUsedBullets ?? [];
  const bestBullet = getBestMatchingAchievement(localProfileForEngine, localJobForEngine, { recentlyUsedBullets: recentlyUsed });
  const point4Idx = templateIndexForJob(job);
  const resultOriented = bestBullet
    ? getPoint4Template(point4Idx, bestBullet)
    : 'Your track record of delivering results in this domain suggests you can drive immediate value in this role.';

  const jobLocation = (job.location || '').trim();
  const relocateBullet = options?.willingToRelocate && jobLocation
    ? `Since you are willing to relocate, highlight your flexibility to join their team in ${jobLocation} during the interview.`
    : undefined;

  return {
    background,
    responsibilities,
    contributions,
    resultOriented,
    ...(bestBullet ? { point4RawBullet: bestBullet } : {}),
    ...(relocateBullet ? { relocateBullet } : {}),
  };
}

// --- Job Tracking Utilities ---
const JobTrackingUtils = {
  getAllTrackedJobs(): TrackedJob[] {
    try {
      const stored = localStorage.getItem('tracked_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveTrackedJobs(jobs: TrackedJob[]): boolean {
    try {
      localStorage.setItem('tracked_jobs', JSON.stringify(jobs));
      localStorage.setItem('tracked_jobs_last_updated', Date.now().toString());
      return true;
    } catch {
      return false;
    }
  },

  addJobToTracker(job: Job, source = 'job-finder', status = 'new-leads'): { success: boolean; message: string; duplicate?: boolean; job?: TrackedJob } {
    const trackedJobs = this.getAllTrackedJobs();
    
    const isDuplicate = trackedJobs.some(tracked => {
      const urlMatch = tracked.url && job.url && tracked.url.toLowerCase() === job.url.toLowerCase();
      const titleCompanyMatch = tracked.title === job.title && tracked.company === job.company;
      return urlMatch || titleCompanyMatch;
    });

    if (isDuplicate) {
      return { success: false, message: 'This job is already being tracked', duplicate: true };
    }

    const trackerJob: TrackedJob = {
      id: Date.now() + Math.random(),
      title: job.title || 'Untitled Position',
      company: job.company || 'Unknown Company',
      location: job.location || 'Not specified',
      salary: job.salary || 'Competitive',
      matchScore: job.matchScore || 0,
      postedDate: job.postedDate || new Date().toISOString().split('T')[0],
      source: job.source || source,
      status: status,
      notes: job.whyMatch ? `Why this matches: ${job.whyMatch}` : '',
      applicationDate: '',
      interviewDate: '',
      contacts: '',
      url: job.url || '#',
      whyMatch: job.whyMatch || '',
      description: job.description,
      addedFrom: source,
      addedAt: new Date().toISOString()
    };

    trackedJobs.push(trackerJob);
    this.saveTrackedJobs(trackedJobs);

    return { success: true, message: 'Job added to tracker!', job: trackerJob };
  },

  removeJobFromTracker(job: Job): boolean {
    const trackedJobs = this.getAllTrackedJobs();
    const next = trackedJobs.filter((tracked) => {
      const urlMatch =
        Boolean(tracked.url && job.url && tracked.url.toLowerCase() === job.url.toLowerCase());
      const titleCompanyMatch = tracked.title === job.title && tracked.company === job.company;
      return !(urlMatch || titleCompanyMatch);
    });
    if (next.length === trackedJobs.length) return false;
    this.saveTrackedJobs(next);
    return true;
  },

  isJobTracked(job: Job): boolean {
    const trackedJobs = this.getAllTrackedJobs();
    return trackedJobs.some(tracked => {
      const urlMatch = tracked.url && job.url && tracked.url.toLowerCase() === job.url.toLowerCase();
      const titleCompanyMatch = tracked.title === job.title && tracked.company === job.company;
      return urlMatch || titleCompanyMatch;
    });
  },

  bulkAddJobs(jobs: Job[], source = 'job-finder', minMatchScore = 0): { total: number; added: number; duplicates: number } {
    const filteredJobs = minMatchScore > 0 ? jobs.filter(job => (job.matchScore || 0) >= minMatchScore) : jobs;
    let added = 0;
    let duplicates = 0;

    filteredJobs.forEach(job => {
      const result = this.addJobToTracker(job, source, 'new-leads');
      if (result.success) added++;
      if (result.duplicate) duplicates++;
    });

    return { total: filteredJobs.length, added, duplicates };
  }
};

// --- Location Database ---
const locationDatabase = [
  'Remote', 'Remote, Worldwide',
  'Hyderabad, Telangana, India', 'Mumbai, Maharashtra, India', 'Delhi, India',
  'Bangalore, Karnataka, India', 'Chennai, Tamil Nadu, India', 'Pune, Maharashtra, India',
  'New York, NY, United States', 'Los Angeles, CA, United States', 'San Francisco, CA, United States',
  'Chicago, IL, United States', 'Boston, MA, United States', 'Seattle, WA, United States',
  'Austin, TX, United States', 'Denver, CO, United States', 'Miami, FL, United States',
  'London, England, United Kingdom', 'Manchester, England, United Kingdom', 'Berlin, Germany',
  'Paris, France', 'Amsterdam, Netherlands', 'Toronto, Ontario, Canada', 'Vancouver, BC, Canada',
  'Sydney, NSW, Australia', 'Melbourne, VIC, Australia', 'Singapore', 'Tokyo, Japan',
  'Dubai, United Arab Emirates'
];

// --- Job Titles Database ---
const jobTitlesDatabase = [
  'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer',
  'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
  'Data Scientist', 'Data Analyst', 'Business Analyst',
  'Product Manager', 'Senior Product Manager', 'Technical Product Manager',
  'Project Manager', 'Program Manager', 'Scrum Master',
  'UX Designer', 'UI Designer', 'Product Designer',
  'Marketing Manager', 'Digital Marketing Manager', 'Content Marketing Manager',
  'Sales Manager', 'Business Development Manager', 'Account Manager',
  'Machine Learning Engineer', 'AI Engineer', 'Cloud Engineer',
  'QA Engineer', 'Test Engineer', 'Security Engineer'
];

/** Format "days ago" from JSearch posted date */
function getDaysAgo(postedDate: string): string {
  if (!postedDate) return 'Recently';
  const d = new Date(postedDate);
  if (isNaN(d.getTime())) return 'Recently';
  const diff = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

const LOGO_COLORS = ['bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-slate-800'];
function getLogoColor(companyName: string): string {
  let n = 0;
  for (let i = 0; i < (companyName || '').length; i++) n += (companyName as string).charCodeAt(i);
  return LOGO_COLORS[Math.abs(n) % LOGO_COLORS.length];
}

// --- Filter Panel Component ---
const FilterPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col border-l border-slate-200 animate-slide-in-right">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0 bg-slate-50/30">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="text-[#111827] w-6 h-6" />
            All Filters
          </h2>
          <button type="button" onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-[#111827] rounded-lg hover:bg-slate-50 transition-colors" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Salary Range</h3>
              <span className="text-sm font-medium text-[#111827]">$80k - $220k+</span>
            </div>
            <div className="relative h-2 bg-slate-100 rounded-full">
              <div className="absolute left-[20%] right-[10%] h-full bg-[#111827] rounded-full" />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>$0k</span>
                <span>$300k+</span>
              </div>
            </div>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Date Posted
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['Any time', 'Past 24 hours', 'Past week', 'Past month'].map((time) => (
                <button key={time} type="button" className="py-2 px-3 rounded-lg text-sm font-medium border transition-all bg-slate-50/50 border-slate-200 text-gray-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#111827]">
                  {time}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Experience Level</h3>
            <div className="space-y-2">
              {['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'].map((level) => (
                <label key={level} className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-slate-300 text-[#111827] focus:ring-[#111827] cursor-pointer" type="checkbox" />
                  <span className="text-gray-700 group-hover:text-gray-900">{level}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Job Type</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input defaultChecked className="w-5 h-5 rounded border-slate-300 text-[#111827] focus:ring-[#111827] cursor-pointer" type="checkbox" />
                <span className="text-gray-700 group-hover:text-gray-900">Full-time</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-5 h-5 rounded border-slate-300 text-[#111827] focus:ring-[#111827] cursor-pointer" type="checkbox" />
                <span className="text-gray-700 group-hover:text-gray-900">Contract</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-5 h-5 rounded border-slate-300 text-[#111827] focus:ring-[#111827] cursor-pointer" type="checkbox" />
                <span className="text-gray-700 group-hover:text-gray-900">Part-time</span>
              </label>
            </div>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-600" />
              Education
            </h3>
            <div className="space-y-2">
              {["Bachelor's Degree", "Master's Degree", "Doctorate", "High School or equivalent"].map((edu) => (
                <label key={edu} className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-slate-300 text-[#111827] focus:ring-[#111827] cursor-pointer" type="checkbox" />
                  <span className="text-gray-700 group-hover:text-gray-900">{edu}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-600" />
              Industry
            </h3>
            <div className="space-y-2">
              {['Technology', 'Financial Services', 'Healthcare', 'E-commerce', 'Entertainment'].map((ind) => (
                <label key={ind} className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-slate-300 text-[#111827] focus:ring-[#111827] cursor-pointer" type="checkbox" />
                  <span className="text-gray-700 group-hover:text-gray-900">{ind}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-slate-200 bg-slate-50/30 shrink-0 flex items-center gap-4">
          <button type="button" onClick={onClose} className="text-sm font-medium text-[#111827] hover:text-[#111827] transition-colors">Reset all</button>
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white font-semibold rounded-lg shadow-sm transition-all">Show results</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
/** Format location from JSearch job: use job.location if present; if job_city + job_country exist use "[City], [Country]"; else reconstruct from job_city, job_state, job_country. */
function formatJSearchLocation(job: JSearchJob): string {
  const raw = job as JSearchJob & { location?: string; job_location?: string };
  const loc = raw.location ?? raw.job_location;
  if (typeof loc === 'string' && loc.trim()) return loc.trim();
  if (job.job_city && job.job_country) return `${job.job_city}, ${job.job_country}`;
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Location not specified';
}

/** First-word prefixes to strip for elastic title retry (Senior, Lead, Junior, etc.) */
const TITLE_PREFIXES_TO_STRIP = /^(Senior|Lead|Junior|Principal|Staff|Chief|Associate|Entry\s+Level|Mid\s+Level|Executive)\s+/i;

/**
 * Reverse-geocode lat/long to city + country (and state for broaden). Uses Intl.DisplayNames for country.
 */
async function reverseGeocodeToCityCountry(
  lat: number,
  lon: number
): Promise<{ city: string; state: string; countryCode: string; countryName: string; displayLocation: string }> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  const addr = data?.address ?? {};
  const city = (addr.city || addr.town || addr.village || addr.municipality || addr.county || '').trim();
  const state = (addr.state || addr.region || '').trim();
  const countryCode = (addr.country_code ?? '').toString().toUpperCase().slice(0, 2);
  let countryName = state; // fallback
  if (countryCode) {
    try {
      countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) ?? countryCode;
    } catch {
      countryName = countryCode;
    }
  }
  const displayLocation = city ? `${city}, ${countryName}` : (state ? `${state}, ${countryName}` : countryName);
  return { city, state, countryCode, countryName, displayLocation };
}

/** Fallback options when location is [object Object] or empty — use Hyderabad as physical location fallback. */
type LocationFallback = { ipDetectedCity?: string; resumeLocation?: string };

const LOCATION_QUERY_FALLBACK = 'Hyderabad';

/**
 * Sanitize location for JSearch query: strip text after hyphen, remove digits.
 * Broaden to metro: Secundrabad/Secunderabad/Lalpet -> Hyderabad for better JSearch results.
 * Handles objects immediately to avoid '[object Object]' poisoning.
 * When result would be [object Object] or empty, returns ipDetectedCity || resumeLocation || 'Hyderabad'.
 */
function sanitizeLocationForQuery(loc: unknown, fallback?: LocationFallback): string {
  if (!loc) return (fallback?.ipDetectedCity || fallback?.resumeLocation || LOCATION_QUERY_FALLBACK).trim() || LOCATION_QUERY_FALLBACK;
  // Immediate Object Extraction: city, name, display_name, displayLocation, display_location
  let s = '';
  if (typeof loc === 'object' && loc !== null) {
    const obj = loc as Record<string, unknown>;
    s = (typeof obj.city === 'string' ? obj.city : '') ||
        (typeof obj.name === 'string' ? obj.name : '') ||
        (typeof obj.display_name === 'string' ? obj.display_name : '') ||
        (typeof obj.displayLocation === 'string' ? obj.displayLocation : '') ||
        (typeof obj.display_location === 'string' ? obj.display_location : '') ||
        (typeof fallback?.ipDetectedCity === 'string' && fallback.ipDetectedCity ? fallback.ipDetectedCity : '') ||
        '';
  } else {
    s = String(loc);
  }
  if (s === '[object Object]' || !s.trim()) return (fallback?.ipDetectedCity || fallback?.resumeLocation || LOCATION_QUERY_FALLBACK).trim() || LOCATION_QUERY_FALLBACK;
  let out = s.trim();
  const hyphenIdx = out.indexOf(' - ');
  if (hyphenIdx !== -1) out = out.slice(0, hyphenIdx).trim();
  const hyphenIdx2 = out.indexOf('-');
  if (hyphenIdx2 !== -1) out = out.slice(0, hyphenIdx2).trim();
  out = out.replace(/\d+/g, '').trim();
  out = out.replace(/\s+/g, ' ').trim();
  const lower = out.toLowerCase();
  if (lower === 'secundrabad' || lower === 'secunderabad' || lower === 'lalpet') return LOCATION_QUERY_FALLBACK;
  return out;
}

/** US state/region abbreviations and common names: map to "United States" when parsing resume location. */
const US_STATE_ABBREVS = new Set(
  'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' ')
);
const US_STATE_NAMES = new Set(
  ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia', 'United States', 'USA', 'US']
);

/**
 * Parse country from a "City, State" or "City, Country" location string.
 * Last segment: if US state/abbrev/USA/US → "United States", else use as country name.
 */
function parseCountryFromLocationString(location: string | undefined): string {
  const s = safeTrim(location);
  if (!s) return '';
  const parts = s.split(',').map(p => p.trim()).filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) return '';
  const upper = last.toUpperCase();
  const norm = last.toLowerCase();
  if (US_STATE_ABBREVS.has(upper) || norm === 'usa' || norm === 'us' || norm === 'united states') return 'United States';
  if (Array.from(US_STATE_NAMES).some(n => n.toLowerCase() === norm)) return 'United States';
  return last;
}

/**
 * Sanitize job title for JSearch query: strip special chars (/ - etc.), take first three words.
 * e.g. "Senior Account Manager" -> "Senior Account Manager" (preserves Manager/Engineer for API).
 */
function sanitizeTitleForQuery(title: unknown): string {
  const t = safeTrim(title);
  if (!t) return '';
  const stripped = t.replace(/[/\-–—,|&]+/g, ' ').replace(/\s+/g, ' ').trim();
  const words = stripped.split(/\s+/).filter(Boolean);
  return words.slice(0, 3).join(' ');
}

/** Career family from job title: Tech (developer/engineer roles) vs non-Tech (business, finance, etc.). Used for Industry Guard. */
function isUserCareerFamilyTech(userJobTitle: string): boolean {
  const lower = (userJobTitle || '').toLowerCase();
  return /\b(developer|engineer|software|programmer|devops|sre|frontend|backend|full\s*stack|technical\s*lead|engineering)\b/.test(lower);
}

/** True if job title looks like a tech role (Developer, Engineer). Used to block relevance leak into business profiles. */
function isTechRoleJob(jobTitle: string): boolean {
  const lower = (jobTitle || '').toLowerCase();
  return /\b(developer|engineer)\b/.test(lower);
}

/** Coerce API benefits field (string or list) to a single trimmed string. */
function stringifyJobBenefitsField(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === 'string' ? x.trim() : String(x)))
      .filter(Boolean)
      .join('\n')
      .trim();
  }
  return String(v).trim();
}

/** Optional snippet-style fields some boards return alongside `job_description`. */
function descriptionFallbackFields(
  j: JSearchJob | undefined
): Pick<Job, 'snippet' | 'job_description' | 'job_description_snippet' | 'job_benefits'> {
  if (!j) return {};
  const ext = j as JSearchJob & Record<string, unknown>;
  const jdSnippet =
    (typeof ext.job_description_snippet === 'string' && ext.job_description_snippet.trim()) || '';
  const benefitsStr = stringifyJobBenefitsField(ext.job_benefits);
  const sn =
    (typeof ext.job_snippet === 'string' && ext.job_snippet.trim()) ||
    (typeof ext.snippet === 'string' && ext.snippet.trim()) ||
    (typeof ext.job_summary === 'string' && ext.job_summary.trim()) ||
    jdSnippet ||
    benefitsStr ||
    '';
  const jd =
    (typeof j.job_description === 'string' && j.job_description.trim()) ||
    jdSnippet ||
    '';
  return {
    ...(sn ? { snippet: sn } : {}),
    ...(jd ? { job_description: jd } : {}),
    ...(jdSnippet ? { job_description_snippet: jdSnippet } : {}),
    ...(benefitsStr ? { job_benefits: benefitsStr } : {}),
  };
}

/** Hybrid before remote so titles like "Hybrid / remote" classify correctly. */
const WORK_TYPE_HYBRID_RE =
  /\b(hybrid|split\s*between\s*(?:home|office)|\d+\s*days?\s*(?:\/|\s)?(?:per\s*week\s*)?(?:in\s*)?(?:the\s*)?office|part-?remote|onsite\s*\+\s*remote|remote\s*\+\s*office)\b/i;
const WORK_TYPE_REMOTE_RE =
  /\b(remote|work\s*from\s*home|wfh|work-from-home|telecommute|fully\s*remote|100%\s*remote|distributed\s*(?:team|workforce)|work\s*anywhere|location\s*flexible)\b/i;

function inferWorkTypeFromCorpus(title: string, location: string, description: string): string {
  const corpus = `${safeTrim(title)}\n${safeTrim(location)}\n${safeTrim(description)}`.toLowerCase();
  if (WORK_TYPE_HYBRID_RE.test(corpus)) return 'Hybrid';
  if (WORK_TYPE_REMOTE_RE.test(corpus)) return 'Remote';
  return 'Full-time';
}

/**
 * Maps JSearch / jobService rows to UI work-mode `job.type` (Remote / Hybrid / Full-time)
 * for badges. Uses API fields when present, else title + location + description heuristics.
 */
function inferDisplayWorkTypeFromJSearch(j: JSearchJob): string {
  const ext = j as JSearchJob & Record<string, unknown>;

  const empTypes = ext.job_employment_types;
  if (Array.isArray(empTypes)) {
    const s = empTypes.map((x) => String(x).toLowerCase()).join(' | ');
    if (/\bhybrid\b/.test(s)) return 'Hybrid';
    if (/\bremote\b/.test(s) || /\bwork\s*from\s*home\b/.test(s)) return 'Remote';
  }

  const et = ext.job_employment_type;
  if (typeof et === 'string') {
    const e = et.toLowerCase();
    if (e.includes('hybrid')) return 'Hybrid';
    if (e.includes('remote') || e.includes('work from home')) return 'Remote';
  }

  if (ext.job_is_remote === true) return 'Remote';

  const title = safeTrim(j.job_title);
  const loc = formatJSearchLocation(j);
  const desc =
    safeTrim(typeof j.job_description === 'string' ? j.job_description : '') ||
    safeTrim(typeof ext.job_description_snippet === 'string' ? ext.job_description_snippet : '') ||
    safeTrim(typeof ext.job_snippet === 'string' ? ext.job_snippet : '') ||
    safeTrim(typeof ext.snippet === 'string' ? ext.snippet : '') ||
    safeTrim(typeof ext.job_summary === 'string' ? ext.job_summary : '') ||
    safeTrim(stringifyJobBenefitsField(ext.job_benefits)) ||
    '';

  return inferWorkTypeFromCorpus(title, loc, desc);
}

function inferDisplayWorkTypeFromListing(job: Pick<JobListing, 'title' | 'location' | 'description'>): string {
  return inferWorkTypeFromCorpus(job.title, job.location, job.description ?? '');
}

/** Convert JSearch job (jobService) to display Job for UI/tracking */
function jsearchToJob(j: JSearchJob): Job {
  const salaryStr =
    j.job_min_salary != null && j.job_max_salary != null
      ? `$${Math.round(j.job_min_salary / 1000)}k - $${Math.round(j.job_max_salary / 1000)}k`
      : 'Competitive';
  const fb = descriptionFallbackFields(j);
  const ext = j as JSearchJob & Record<string, unknown>;
  const jdSnip = typeof ext.job_description_snippet === 'string' ? ext.job_description_snippet.trim() : '';
  const benefitsStr = stringifyJobBenefitsField(ext.job_benefits);
  const greedyStr = typeof ext.greedy_full_text === 'string' ? ext.greedy_full_text.trim() : '';
  const unifiedStr =
    typeof j.unified_description === 'string' ? j.unified_description.trim() : '';
  const descBody =
    (typeof j.job_description === 'string' && j.job_description.trim()) ||
    unifiedStr ||
    greedyStr ||
    jdSnip ||
    j.job_highlights?.Qualifications?.join(' ') ||
    fb.snippet ||
    benefitsStr ||
    '';
  return {
    id: j.job_id,
    title: j.job_title,
    company: j.employer_name,
    location: formatJSearchLocation(j),
    salary: salaryStr,
    type: inferDisplayWorkTypeFromJSearch(j),
    description: descBody,
    unified_description: unifiedStr || undefined,
    greedy_full_text: greedyStr || undefined,
    requirements: j.job_highlights?.Responsibilities?.join(' ') || j.job_highlights?.Qualifications?.join(' ') || '',
    postedDate: j.job_posted_at_datetime_utc?.split('T')[0] ?? '',
    url: j.job_apply_link,
    source: 'JSearch',
    matchScore: 0,
    jobHighlights: j.job_highlights,
    job_country: typeof j.job_country === 'string' ? j.job_country : null,
    skills: skillsTokensFromHighlights(j.job_highlights),
    ...fb,
  };
}

/** Same text stack as the description workspace (for deep-fetch threshold + section parsing). */
function workspaceEffectiveDescription(job: Job): string {
  return (
    safeTrim(job.greedy_full_text) ||
    safeTrim(job.unified_description) ||
    safeTrim(job.description) ||
    safeTrim(job.snippet) ||
    safeTrim(job.job_description) ||
    safeTrim(job.job_description_snippet) ||
    safeTrim(job.job_benefits) ||
    ''
  );
}

/** Snippet-first body for Role Overview while JSearch job-details is in flight (instant click feedback). */
function optimisticRoleOverviewBody(job: Job): string {
  const fromSnippet = safeTrim(job.snippet) || safeTrim(job.job_description_snippet);
  if (fromSnippet) return fromSnippet;
  const eff = workspaceEffectiveDescription(job);
  if (eff) return eff.length > 600 ? `${eff.slice(0, 600).trim()}…` : eff;
  return `Looking for a ${safeTrim(job.title) || 'role'} at ${safeTrim(job.company) || 'the company'} in ${safeTrim(job.location) || 'your area'}.`;
}

/** List badge uses emerald for ≥90% — same bar for background prefetch of top matches. */
const HIGH_MATCH_PREFETCH_THRESHOLD = 90;

function mergeJSearchDetailIntoDisplayJob(base: Job, detailJob: JSearchJob): Job {
  const fromApi = jsearchToJob(detailJob);
  return {
    ...base,
    description: fromApi.description,
    unified_description: fromApi.unified_description,
    greedy_full_text: fromApi.greedy_full_text,
    snippet: fromApi.snippet,
    job_description: fromApi.job_description,
    job_description_snippet: fromApi.job_description_snippet,
    job_benefits: fromApi.job_benefits,
    requirements:
      detailJob.job_highlights?.Responsibilities?.join(' ') ||
      detailJob.job_highlights?.Qualifications?.join(' ') ||
      base.requirements,
    jobHighlights: detailJob.job_highlights ?? base.jobHighlights,
    job_country: typeof detailJob.job_country === 'string' ? detailJob.job_country : base.job_country,
    type: fromApi.type,
    skills:
      (fromApi.skills && fromApi.skills.length > 0)
        ? fromApi.skills
        : skillsTokensFromHighlights(detailJob.job_highlights) || base.skills,
    jsearch_details_fetched: true,
  };
}

/** One giant prose block with little structure — split into thirds for readability. */
function shouldUseBigPortalForUnstructuredLongRead(sections: JobWorkspaceSection[], fullBody: string): boolean {
  const len = fullBody.trim().length;
  if (len < 600) return false;
  if (sections.length !== 1) return false;
  const s = sections[0];
  if (s.id !== 'overview' || s.format !== 'overview') return false;
  const paras = s.paragraphs ?? [];
  if (paras.length !== 1) return false;
  const p0 = paras[0] ?? '';
  return p0.length >= 600 || len >= 1200;
}

/** When the parser finds no sections, split body into three LinkedIn-style blocks so the panel is never empty. */
function buildBigPortalFallbackSections(body: string, fallbackSentence: string): JobWorkspaceSection[] {
  const raw = body.trim() || fallbackSentence.trim();
  const padDetails =
    'Additional responsibilities and requirements may be available in the full listing after you apply.';
  const padCompany = 'Learn more about the organization on their website or careers page.';
  const ensure = (s: string, pad: string) => (s.trim() ? s.trim() : pad);

  if (!raw) {
    return [
      {
        id: 'fb-company',
        title: 'About the company',
        format: 'overview',
        paragraphs: ['Company information was not provided in this posting.'],
      },
      { id: 'fb-overview', title: 'About the role', format: 'overview', paragraphs: [fallbackSentence] },
      {
        id: 'fb-details',
        title: 'Additional details',
        format: 'overview',
        paragraphs: ['No further details were included with this listing.'],
      },
    ];
  }

  let part1: string;
  let part2: string;
  let part3: string;
  if (raw.length <= 500) {
    const t = Math.ceil(raw.length / 3) || 1;
    part1 = raw.slice(0, t).trim();
    part2 = raw.slice(t, t * 2).trim();
    part3 = raw.slice(t * 2).trim();
  } else {
    part1 = raw.slice(0, 500).trim();
    const rest = raw.slice(500);
    const mid = Math.floor(rest.length / 2);
    part2 = rest.slice(0, mid).trim();
    part3 = rest.slice(mid).trim();
  }

  return [
    { id: 'fb-company', title: 'About the company', format: 'overview', paragraphs: [ensure(part3, padCompany)] },
    { id: 'fb-overview', title: 'About the role', format: 'overview', paragraphs: [part1] },
    { id: 'fb-details', title: 'Additional details', format: 'overview', paragraphs: [ensure(part2, padDetails)] },
  ];
}

/** Renders bullets as stacked list rows; prefixed entries become qualification sub-headings. */
function renderWorkspaceBulletList(bullets: string[]) {
  const nodes: ReactNode[] = [];
  let bucket: string[] = [];
  const flushUl = () => {
    if (bucket.length === 0) return;
    nodes.push(
      <ul
        key={`ul-${nodes.length}`}
        className="list-disc space-y-2 pl-8 marker:text-slate-400"
      >
        {bucket.map((b, j) => (
          <li key={j} className="whitespace-pre-line">
            {b}
          </li>
        ))}
      </ul>
    );
    bucket = [];
  };
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    if (isJobSectionSubheadBullet(b)) {
      flushUl();
      nodes.push(
        <p
          key={`sh-${i}`}
          className={`font-semibold text-slate-800 mb-2 block ${nodes.length > 0 ? 'mt-4' : ''}`}
        >
          {jobSectionSubheadText(b)}
        </p>
      );
    } else {
      bucket.push(b);
    }
  }
  flushUl();
  return <div className="space-y-2">{nodes}</div>;
}

/** Pulsing bars aligned with description subsection density */
function JobDetailSubsectionSkeleton({ barWidths }: { barWidths: string[] }) {
  return (
    <div className="space-y-2.5" aria-hidden>
      {barWidths.map((w, i) => (
        <div
          key={i}
          className={`h-3 bg-slate-200 animate-pulse rounded-md ${w}`}
        />
      ))}
    </div>
  );
}

/** Scannable job description blocks for workspace (results) view */
function WorkspaceJobDetailSections({
  job,
  isLoadingDetails,
}: {
  job: Job;
  isLoadingDetails?: boolean;
}) {
  const effectiveDescription = workspaceEffectiveDescription(job);

  const fallbackSentence = `Looking for a ${safeTrim(job.title) || 'role'} at ${safeTrim(job.company) || 'the company'} in ${safeTrim(job.location) || 'your area'}.`;

  let sections = getWorkspaceJobSections({
    description: effectiveDescription,
    requirements: job.requirements,
    jobHighlights: job.jobHighlights,
    greedyFullText: effectiveDescription,
    displaySkills: job.skills?.length ? job.skills : null,
  });
  if (
    sections.length === 0 ||
    shouldUseBigPortalForUnstructuredLongRead(sections, effectiveDescription)
  ) {
    sections = buildBigPortalFallbackSections(effectiveDescription, fallbackSentence);
  }

  if (isLoadingDetails) {
    const overviewText = optimisticRoleOverviewBody(job);
    return (
      <div className="relative" aria-busy="true" aria-live="polite">
        <p className="sr-only">Loading full job description</p>
        <section className="scroll-mt-2">
          <h4 className="text-[13px] font-medium text-slate-900 mb-2">About the company</h4>
          <JobDetailSubsectionSkeleton barWidths={['w-[95%]', 'w-full', 'w-[80%]']} />
        </section>
        <section className="scroll-mt-2 border-t border-slate-200 pt-5 mt-5">
          <h4 className="text-[13px] font-medium text-slate-900 my-3.5 mb-2">About the role</h4>
          <div className="text-[13px] text-slate-600 leading-[1.7] whitespace-pre-line jd-body">
            <p className="leading-relaxed text-slate-600 whitespace-pre-line">{overviewText}</p>
          </div>
        </section>
        <section className="scroll-mt-2 border-t border-slate-200 pt-5 mt-5">
          <h4 className="text-[13px] font-medium text-slate-900 my-3.5 mb-2">Responsibilities</h4>
          <JobDetailSubsectionSkeleton
            barWidths={['w-full', 'w-[92%]', 'w-[88%]', 'w-[72%]']}
          />
        </section>
        <section className="scroll-mt-2 border-t border-slate-200 pt-5 mt-5">
          <h4 className="text-[13px] font-medium text-slate-900 my-3.5 mb-2">Requirements</h4>
          <JobDetailSubsectionSkeleton barWidths={['w-[96%]', 'w-full', 'w-[85%]', 'w-[70%]']} />
        </section>
        <section className="scroll-mt-2 border-t border-slate-200 pt-5 mt-5">
          <h4 className="text-[13px] font-medium text-slate-900 my-3.5 mb-2">Skills</h4>
          <JobDetailSubsectionSkeleton barWidths={['w-[88%]', 'w-[75%]']} />
        </section>
      </div>
    );
  }

  return (
    <div className="relative">
      <div>
        {sections.map((s, index) => (
          <section
            key={s.id}
            className={`scroll-mt-2 ${index > 0 ? 'border-t border-slate-200 pt-5 mt-5' : ''}`}
          >
            <h4 className="text-[13px] font-medium text-slate-900 my-3.5 mb-2">{s.title}</h4>
            <div className="text-[13px] text-slate-600 leading-[1.7] whitespace-pre-line jd-body">
              {s.bullets?.length ? renderWorkspaceBulletList(s.bullets) : null}
              {s.paragraphs?.length
                ? s.paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className={
                        s.format === 'overview'
                          ? 'leading-relaxed mb-4 text-slate-600 last:mb-0 whitespace-pre-line'
                          : 'mb-2 text-slate-600 last:mb-0 whitespace-pre-line'
                      }
                    >
                      {p}
                    </p>
                  ))
                : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// --- JobCompanyLogo Component ---
interface JobCompanyLogoProps {
  logoUrl: string | null | undefined;
  companyName: string;
}

const JobCompanyLogo: React.FC<JobCompanyLogoProps> = ({ logoUrl, companyName }) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state when logoUrl changes
  useEffect(() => {
    setImageError(false);
  }, [logoUrl]);

  // If no logo URL provided or image failed to load, show fallback icon
  if (!logoUrl || imageError) {
    return (
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
        <Building2 className="w-6 h-6 text-slate-500" />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
      <img
        src={logoUrl}
        alt={`${companyName} logo`}
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

interface JobFinderProps {
  onViewChange?: (view: string) => void;
  initialSearchTerm?: string;
}

const JobFinder = ({ onViewChange, initialSearchTerm }: JobFinderProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tab state (Quick Search removed — only Personalized Jobs + History)
  const [activeTab, setActiveTab] = useState<'resumes' | 'history'>('resumes');

  // Workflow state
  const { workflowContext, updateContext } = useWorkflowContext();
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);

  // Workspace view: derived from URL so browser back/forward works (/dashboard/finder/results)
  const showWorkspace = location.pathname.includes('/finder/results');
  const [selectedWorkspaceJobId, setSelectedWorkspaceJobId] = useState<string | null>(null);
  const [workspaceResultSort, setWorkspaceResultSort] = useState<WorkspaceResultSortKey>('original');
  const [workspaceSortMenuOpen, setWorkspaceSortMenuOpen] = useState(false);
  const workspaceOriginalOrderRef = useRef<string[]>([]);
  const workspaceSortMenuRef = useRef<HTMLDivElement | null>(null);
  const [jobDetailsLoadingJobId, setJobDetailsLoadingJobId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showScoreBreakdownTooltip, setShowScoreBreakdownTooltip] = useState(false);

  // Search bar state (used in workspace header; optional initial from props)
  const [quickSearchJobTitle, setQuickSearchJobTitle] = useState(initialSearchTerm ?? '');
  const [quickSearchLocation, setQuickSearchLocation] = useState('');
  const [jobResults, setJobResults] = useState<Job[]>([]);
  // Elastic location: IP-detected (silent default; no browser permission). Used when user hasn't set location.
  const [ipDetectedCity, setIpDetectedCity] = useState<string>('');
  const ipRegionRef = useRef<{ region: string; countryName: string } | null>(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationPromptValue, setLocationPromptValue] = useState('');
  const [showBroadenHorizon, setShowBroadenHorizon] = useState(false);
  const pendingLocationResolveRef = useRef<((value: string) => void) | null>(null);
  const lastResolvedRegionRef = useRef<{ state: string; countryName: string; displayLocation: string } | null>(null);
  const lastUsedSearchLocationRef = useRef<string>('');
  const [willingToRelocate, setWillingToRelocate] = useState(false);

  // Personalized Search state
  const [personalizedJobResults, setPersonalizedJobResults] = useState<Job[]>([]);
  const [isSearchingPersonalized, setIsSearchingPersonalized] = useState(false);
  const personalizedSearchInFlightRef = useRef(false); // Guard against double call (e.g. Strict Mode)
  const apiLimitToastShownRef = useRef(false); // Show "API Limit Reached" toast only once per search flow
  const lastSearchResultRef = useRef<{ sourceQuality?: 'deep' | 'standard' } | null>(null); // For "Deep Analysis limited" note
  /** Completed JSearch job-details responses (or null if fetch returned nothing). */
  const jobDetailsCacheRef = useRef<Map<string, JSearchJob | null>>(new Map());
  const jobDetailFetchInFlightRef = useRef<Set<string>>(new Set());
  const recentPoint4BulletsRef = useRef<string[]>([]); // Last 3 bullets used for Point 4 (diversity penalty)
  const [selectedSearchStrategy, setSelectedSearchStrategy] = useState<string | null>(null);
  const [sourceQualityNote, setSourceQualityNote] = useState<'deep' | 'standard' | null>(null); // Show small note when fallback used
  const [backupSourceBannerDismissed, setBackupSourceBannerDismissed] = useState(false);

  // Resume state
  const [uploadedResumes, setUploadedResumes] = useState<Record<string, ResumeData>>({});
  const [showResumeDashboard, setShowResumeDashboard] = useState(true); // false = show upload screen (cross navigates here)
  const [activeResume, setActiveResume] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  // Manual Entry fallback when title/skills weren't detected from resume
  const [manualJobTitle, setManualJobTitle] = useState('');
  const [manualTopSkills, setManualTopSkills] = useState('');
  
  // Suggestions state
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState<string[]>([]);
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    datePosted: 'Any time',
    experienceLevel: 'Any level',
    remote: 'Any',
    salaryRange: 'Any'
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState<Record<string, boolean>>({});
  // Search bar filters (for JobSearchBar dropdowns; synced with filters/resumeFilters)
  const [searchBarFilters, setSearchBarFilters] = useState<JobSearchBarFilters>({
    datePosted: 'Any time',
    experience: 'Any level',
    jobType: 'Full-time',
    salary: ''
  });
  const [showResumeDataDebug, setShowResumeDataDebug] = useState(false);

  // Resume filters state
  const [resumeFilters, setResumeFilters] = useState<ResumeFilters>({
    workType: 'Full-time',
    remote: 'Any',
    experienceLevel: 'Any level',
    minSalary: 'Any',
    location: ''
  });

  const displayLoc = (() => {
    const s = locationToDisplayString(resumeFilters.location);
    return (s === '' || s === '[object Object]' ? LOCATION_QUERY_FALLBACK : s);
  })();

  const jobsToDisplay = useMemo(
    () =>
      Array.isArray(personalizedJobResults)
        ? personalizedJobResults
        : ((personalizedJobResults as { jobs?: Job[] })?.jobs ?? []),
    [personalizedJobResults]
  );

  useEffect(() => {
    workspaceOriginalOrderRef.current = jobsToDisplay.map((j) => j.id);
  }, [jobsToDisplay]);

  useEffect(() => {
    if (sourceQualityNote !== 'standard') setBackupSourceBannerDismissed(false);
  }, [sourceQualityNote]);

  const sortedWorkspaceJobs = useMemo(() => {
    const list = [...jobsToDisplay];
    const sortKey = workspaceResultSort;
    if (sortKey === 'original') {
      const order = workspaceOriginalOrderRef.current;
      if (order.length > 0 && list.length > 0 && order.length === list.length) {
        const pos = new Map(order.map((id, i) => [id, i] as const));
        if (list.every((j) => pos.has(j.id))) {
          return list.sort((a, b) => (pos.get(a.id)! - pos.get(b.id)!));
        }
      }
      return list;
    }
    if (sortKey === 'ats') {
      return list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    }
    if (sortKey === 'hire') {
      return list.sort((a, b) => workspaceHireSortScore(b) - workspaceHireSortScore(a));
    }
    if (sortKey === 'date') {
      return list.sort((a, b) => workspaceJobPostedMs(b) - workspaceJobPostedMs(a));
    }
    return list;
  }, [jobsToDisplay, workspaceResultSort]);

  useEffect(() => {
    if (!workspaceSortMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = workspaceSortMenuRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) setWorkspaceSortMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [workspaceSortMenuOpen]);

  const workspaceResultsContextLine = (() => {
    const n = sortedWorkspaceJobs.length;
    const title =
      safeTrim(quickSearchJobTitle) ||
      safeTrim(manualJobTitle) ||
      safeTrim(resumeData?.personalInfo?.jobTitle ?? resumeData?.personalInfo?.title ?? '') ||
      'Personalized matches';
    const loc =
      locationToDisplayString(quickSearchLocation) ||
      displayLoc ||
      safeTrim(ipDetectedCity) ||
      'Any location';
    return `${n} results · ${title} · ${loc}`;
  })();

  const workspaceSortButtonLabel =
    workspaceResultSort === 'original'
      ? 'Relevance'
      : workspaceResultSort === 'ats'
        ? 'Match Score'
        : workspaceResultSort === 'hire'
          ? 'Hire Probability'
          : 'Date Posted';

  // Tracking state
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Predictive matching state
  const [predictiveRecommendations, setPredictiveRecommendations] = useState<JobRecommendation[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [searchProgressMessage, setSearchProgressMessage] = useState<string | null>(null);
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  // Fail-open: hardcoded so UI always allows searches (blocking DB checks disabled)
  const [userCredits, setUserCredits] = useState<number>(999);

  // Sync initialSearchTerm into search bar
  useEffect(() => {
    if (initialSearchTerm != null) setQuickSearchJobTitle(initialSearchTerm);
  }, [initialSearchTerm]);

  // Keep selected job in sync with personalized results (e.g. after new search: select first if current id not in list)
  useEffect(() => {
    if (!showWorkspace || personalizedJobResults.length === 0) return;
    const exists = selectedWorkspaceJobId && personalizedJobResults.some(j => j.id === selectedWorkspaceJobId);
    if (!exists) setSelectedWorkspaceJobId(personalizedJobResults[0].id);
  }, [showWorkspace, personalizedJobResults, selectedWorkspaceJobId]);

  const finalizeJSearchDetailFetch = useCallback((jobId: string, detail: JSearchJob | null) => {
    jobDetailsCacheRef.current.set(jobId, detail);
    jobDetailFetchInFlightRef.current.delete(jobId);
    setPersonalizedJobResults((prev) => {
      const cur = prev.find((x) => x.id === jobId);
      if (!cur) return prev;
      if (!detail) {
        const marked = prev.map((x) => (x.id === jobId ? { ...x, jsearch_details_fetched: true } : x));
        try {
          sessionStorage.setItem('job_finder_results', JSON.stringify(marked));
        } catch {
          /* ignore */
        }
        return marked;
      }
      const merged = mergeJSearchDetailIntoDisplayJob(cur, detail);
      const next = prev.map((x) => (x.id === jobId ? merged : x));
      try {
        sessionStorage.setItem('job_finder_results', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setJobDetailsLoadingJobId((loadingId) => (loadingId === jobId ? null : loadingId));
  }, []);

  // JSearch: full job description (job-details) when the listing only had a short snippet
  useEffect(() => {
    if (!showWorkspace || !selectedWorkspaceJobId) {
      setJobDetailsLoadingJobId(null);
      return;
    }
    const job = personalizedJobResults.find((j) => j.id === selectedWorkspaceJobId);
    if (!job) return;

    const needsDeepFetch =
      job.source === 'JSearch' &&
      !job.jsearch_details_fetched &&
      shouldDeepFetchJobDescription(workspaceEffectiveDescription(job));

    if (!needsDeepFetch) {
      setJobDetailsLoadingJobId(null);
      return;
    }

    if (jobDetailsCacheRef.current.has(selectedWorkspaceJobId)) {
      finalizeJSearchDetailFetch(selectedWorkspaceJobId, jobDetailsCacheRef.current.get(selectedWorkspaceJobId)!);
      return;
    }

    if (jobDetailFetchInFlightRef.current.has(selectedWorkspaceJobId)) {
      setJobDetailsLoadingJobId(selectedWorkspaceJobId);
      return;
    }

    let cancelled = false;
    setJobDetailsLoadingJobId(selectedWorkspaceJobId);
    jobDetailFetchInFlightRef.current.add(selectedWorkspaceJobId);

    fetchJSearchJobDetails(selectedWorkspaceJobId, { country: job.job_country ?? null })
      .then((detail) => {
        if (cancelled) return;
        finalizeJSearchDetailFetch(selectedWorkspaceJobId, detail);
      })
      .finally(() => {
        jobDetailFetchInFlightRef.current.delete(selectedWorkspaceJobId);
        if (cancelled) {
          setJobDetailsLoadingJobId((id) => (id === selectedWorkspaceJobId ? null : id));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showWorkspace, selectedWorkspaceJobId, personalizedJobResults, finalizeJSearchDetailFetch]);

  // Prefetch job-details for top High Match JSearch rows (hidden; fills cache for instant opens)
  useEffect(() => {
    if (!showWorkspace || personalizedJobResults.length === 0) return;

    const candidates = [...personalizedJobResults]
      .filter(
        (j) =>
          j.source === 'JSearch' &&
          !j.jsearch_details_fetched &&
          (j.matchScore ?? 0) >= HIGH_MATCH_PREFETCH_THRESHOLD &&
          shouldDeepFetchJobDescription(workspaceEffectiveDescription(j))
      )
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
      .slice(0, 5);

    for (const j of candidates) {
      if (jobDetailsCacheRef.current.has(j.id)) continue;
      if (jobDetailFetchInFlightRef.current.has(j.id)) continue;

      const id = j.id;
      jobDetailFetchInFlightRef.current.add(id);
      fetchJSearchJobDetails(id, { country: j.job_country ?? null })
        .then((detail) => {
          finalizeJSearchDetailFetch(id, detail);
        })
        .finally(() => {
          jobDetailFetchInFlightRef.current.delete(id);
        });
    }
  }, [showWorkspace, personalizedJobResults, finalizeJSearchDetailFetch]);

  // Check for workflow context changes
  useEffect(() => {
    if (workflowContext?.workflowId === 'job-application-pipeline') {
      const workflow = WorkflowTracking.getWorkflow('job-application-pipeline');
      if (workflow) {
        const findJobsStep = workflow.steps.find(s => s.id === 'find-jobs');
        if (findJobsStep && findJobsStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('job-application-pipeline', 'find-jobs', 'in-progress');
        }
      }
    }
  }, [workflowContext]);

  // Restore job results: vault session first, then browser back/forward cache
  useEffect(() => {
    if (!location.pathname.includes('/finder/results')) return;

    const restoreRaw = sessionStorage.getItem(JOB_FINDER_SESSION_RESTORE_KEY);
    if (restoreRaw) {
      try {
        const payload = JSON.parse(restoreRaw) as {
          jobs: Job[];
          meta?: Record<string, unknown>;
        };
        sessionStorage.removeItem(JOB_FINDER_SESSION_RESTORE_KEY);
        if (Array.isArray(payload.jobs) && payload.jobs.length > 0) {
          jobDetailsCacheRef.current.clear();
          jobDetailFetchInFlightRef.current.clear();
          setPersonalizedJobResults(payload.jobs);
          setSelectedWorkspaceJobId(payload.jobs[0].id);
          sessionStorage.setItem('job_finder_results', JSON.stringify(payload.jobs));
          const m = payload.meta ?? {};
          if (typeof m.quickSearchJobTitle === 'string') {
            setQuickSearchJobTitle(m.quickSearchJobTitle);
            setManualJobTitle(m.quickSearchJobTitle);
          }
          if (typeof m.quickSearchLocation === 'string') setQuickSearchLocation(m.quickSearchLocation);
          if (m.searchBarFilters && typeof m.searchBarFilters === 'object' && !Array.isArray(m.searchBarFilters)) {
            setSearchBarFilters((prev) => ({ ...prev, ...(m.searchBarFilters as Partial<typeof searchBarFilters>) }));
          }
          if (m.resumeFilters && typeof m.resumeFilters === 'object' && !Array.isArray(m.resumeFilters)) {
            setResumeFilters((prev) => ({ ...prev, ...(m.resumeFilters as Partial<ResumeFilters>) }));
          }
          if (typeof m.willingToRelocate === 'boolean') setWillingToRelocate(m.willingToRelocate);
          if (m.sourceQualityNote === 'standard' || m.sourceQualityNote === 'deep' || m.sourceQualityNote === null) {
            setSourceQualityNote(m.sourceQualityNote);
          }
          if ('selectedSearchStrategy' in m) {
            setSelectedSearchStrategy((m.selectedSearchStrategy as string | null) ?? null);
          }
          return;
        }
      } catch {
        sessionStorage.removeItem(JOB_FINDER_SESSION_RESTORE_KEY);
      }
    }

    const stored = sessionStorage.getItem('job_finder_results');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Job[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          jobDetailsCacheRef.current.clear();
          jobDetailFetchInFlightRef.current.clear();
          setPersonalizedJobResults(parsed);
          setSelectedWorkspaceJobId(parsed[0].id);
        }
      } catch {
        sessionStorage.removeItem('job_finder_results');
      }
    }
  }, [location.pathname]);

  // Load data on mount
  useEffect(() => {
    // Load tracked jobs
    const tracked = JobTrackingUtils.getAllTrackedJobs();
    setTrackedJobIds(new Set(tracked.map(j => j.url)));

    // Load saved resumes from localStorage (full data)
    const savedResumes = localStorage.getItem('parsed_resumes');
    if (savedResumes) {
      try {
        const resumes = JSON.parse(savedResumes) as Record<string, ResumeData>;
        setUploadedResumes(resumes);
        const activeResumeName = localStorage.getItem('active_resume_for_job_search');
        if (activeResumeName && resumes[activeResumeName]) {
          setActiveResume(activeResumeName);
          setResumeData(resumes[activeResumeName]);
        } else if (Object.keys(resumes).length > 0) {
          const firstResume = Object.keys(resumes)[0];
          setActiveResume(firstResume);
          setResumeData(resumes[firstResume]);
        }
      } catch {
        setUploadedResumes({});
      }
    }
  }, []);

  // Elastic location: IP-based city detection (client-side, no permission). Used only when location input is empty.
  // IP geolocation (silent default): city + region/country for Broaden fallback. No browser permission.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then((data: { city?: string; region?: string; country_name?: string; error?: boolean }) => {
        if (cancelled || data?.error) return;
        const city = typeof data?.city === 'string' ? data.city.trim() : '';
        const region = typeof data?.region === 'string' ? data.region.trim() : '';
        const countryName = typeof data?.country_name === 'string' ? data.country_name.trim() : '';
        if (city) setIpDetectedCity(city);
        if (region || countryName) ipRegionRef.current = { region, countryName };
      })
      .catch(() => { /* non-blocking */ });
    return () => { cancelled = true; };
  }, []);

  // Blocking daily limit checks disabled (fail-open). userCredits hardcoded to 999 above.
  // useEffect(() => {
  //   let cancelled = false;
  //   (async () => {
  //     try {
  //       const { data: { user } } = await supabase.auth.getUser();
  //       if (!user || cancelled) return;
  //       const { data: profile } = await supabase
  //         .from('profiles')
  //         .select('daily_limit')
  //         .eq('id', user.id)
  //         .maybeSingle();
  //       const today = new Date();
  //       today.setHours(0, 0, 0, 0);
  //       const { count: usedToday } = await supabase
  //         .from('ai_usage_logs')
  //         .select('*', { count: 'exact', head: true })
  //         .eq('user_id', user.id)
  //         .gte('created_at', today.toISOString());
  //       if (cancelled) return;
  //       const limit = profile?.daily_limit ?? 0;
  //       setUserCredits(Math.max(0, limit - (usedToday ?? 0)));
  //     } catch {
  //       if (!cancelled) setUserCredits(0);
  //     }
  //   })();
  //   return () => { cancelled = true; };
  // }, []);

  // Sync manual entry fields when active resume changes so form reflects current resume
  useEffect(() => {
    if (!resumeData) {
      setManualJobTitle('');
      setManualTopSkills('');
      return;
    }
    const title =
      resumeData.personalInfo?.jobTitle ??
      resumeData.personalInfo?.title ??
      resumeData.experience?.[0]?.position ??
      '';
    setManualJobTitle(title);
    setManualTopSkills((resumeData.skills?.technical ?? []).join(', '));
  }, [activeResume, resumeData]);

  // When resumes tab is active, re-sync from localStorage so list always has full parsed_resumes data
  useEffect(() => {
    if (activeTab !== 'resumes') return;
    const raw = localStorage.getItem('parsed_resumes');
    if (!raw) return;
    try {
      const resumes = JSON.parse(raw) as Record<string, ResumeData>;
      setUploadedResumes(resumes);
      const currentActive = activeResume;
      if (currentActive && resumes[currentActive]) {
        setResumeData(resumes[currentActive]);
      } else if (Object.keys(resumes).length > 0 && !resumes[currentActive ?? '']) {
        const first = Object.keys(resumes)[0];
        setActiveResume(first);
        setResumeData(resumes[first]);
      }
    } catch {
      // ignore parse errors
    }
  }, [activeTab]);

  // Show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Handle job title input
  const handleJobTitleChange = (value: string) => {
    setQuickSearchJobTitle(value);
    if (value.trim().length > 0) {
      const filtered = jobTitlesDatabase.filter(title =>
        title.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setJobTitleSuggestions(filtered);
      setShowJobTitleSuggestions(true);
    } else {
      setJobTitleSuggestions([]);
      setShowJobTitleSuggestions(false);
    }
  };

  // Handle location input
  const handleLocationChange = (value: string) => {
    setQuickSearchLocation(value);
    if (value.trim().length > 0) {
      const filtered = locationDatabase.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  /**
   * Get user's home country for "Willing to Relocate" (home-country prioritization).
   * Priority: lastResolvedRegionRef (GPS/IP) → ipRegionRef (IP) → parse resumeData.personalInfo.location.
   */
  const getHomeCountry = useCallback((): string => {
    const fromRegion = lastResolvedRegionRef.current?.countryName;
    if (fromRegion && safeTrim(fromRegion)) return safeTrim(fromRegion);
    const fromIp = ipRegionRef.current?.countryName;
    if (fromIp && safeTrim(fromIp)) return safeTrim(fromIp);
    const fromResume = parseCountryFromLocationString(resumeData?.personalInfo?.location);
    return fromResume || '';
  }, [resumeData?.personalInfo?.location]);

  /**
   * Resolve location for "Find Personalized Jobs" without asking for browser GPS (silent default).
   * Priority: manual/resume location → IP-detected city → location prompt.
   * Use this for the main flow so we don't show "Allow location?" unless user clicks "Jobs Near Me".
   */
  const resolveLocationForSearch = useCallback((): Promise<string> => {
    const manual = safeTrim(quickSearchLocation || locationToDisplayString(resumeFilters.location) || locationToDisplayString(resumeData?.personalInfo?.location));
    if (manual) return Promise.resolve(manual);
    if (ipDetectedCity) {
      const ip = ipRegionRef.current;
      lastResolvedRegionRef.current = ip?.region || ip?.countryName
        ? { state: ip.region || '', countryName: ip.countryName || '', displayLocation: [ip.region, ip.countryName].filter(Boolean).join(', ') }
        : null;
      return Promise.resolve(ipDetectedCity);
    }
    setShowLocationPrompt(true);
    return new Promise((resolve) => {
      pendingLocationResolveRef.current = resolve;
    });
  }, [quickSearchLocation, resumeFilters.location, resumeData?.personalInfo?.location, ipDetectedCity]);

  /** Resolve location using browser GPS (opt-in only, e.g. "Jobs Near Me"). Shows "Allow location?" popup. */
  const resolveSearchLocationAsync = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator?.geolocation) {
        const fallback = safeTrim(resumeData?.personalInfo?.location);
        if (fallback) resolve(fallback);
        else {
          setShowLocationPrompt(true);
          pendingLocationResolveRef.current = resolve;
        }
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const rev = await reverseGeocodeToCityCountry(latitude, longitude);
            lastResolvedRegionRef.current = {
              state: rev.state,
              countryName: rev.countryName,
              displayLocation: rev.state ? `${rev.state}, ${rev.countryName}` : rev.countryName
            };
            resolve(rev.displayLocation);
          } catch {
            const fallback = safeTrim(resumeData?.personalInfo?.location);
            if (fallback) resolve(fallback);
            else {
              setShowLocationPrompt(true);
              pendingLocationResolveRef.current = resolve;
            }
          }
        },
        () => {
          const fallback = safeTrim(resumeData?.personalInfo?.location);
          if (fallback) resolve(fallback);
          else {
            setShowLocationPrompt(true);
            pendingLocationResolveRef.current = resolve;
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });
  }, [resumeData?.personalInfo?.location]);

  const handleLocationPromptSubmit = useCallback(() => {
    const value = locationPromptValue.trim();
    if (value) {
      setQuickSearchLocation(value);
      setResumeFilters(prev => ({ ...prev, location: value }));
      pendingLocationResolveRef.current?.(value);
      pendingLocationResolveRef.current = null;
      setShowLocationPrompt(false);
      setLocationPromptValue('');
    }
  }, [locationPromptValue]);

  /** Strip first word (Senior, Lead, Junior, etc.) for elastic title retry. */
  const stripFirstWordFromTitle = useCallback((title: string): string => {
    if (!title?.trim()) return title;
    return title.replace(TITLE_PREFIXES_TO_STRIP, '').replace(/\s+/g, ' ').trim() || title;
  }, []);

  /** Core noun of title for relaxed Industry Guard (e.g. "Account Manager" → "Manager"). Last word of stripped title. */
  const getCoreNounFromTitle = useCallback((title: string): string => {
    const stripped = stripFirstWordFromTitle(title || '');
    const words = stripped.split(/\s+/).filter(Boolean);
    return words.length > 0 ? words[words.length - 1]!.toLowerCase() : '';
  }, [stripFirstWordFromTitle]);

  // Handle filter toggle
  const handleToggleFilter = (filterType: string) => {
    setShowFilterDropdown(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [filterType]: !prev[filterType]
    }));
  };

  // Handle filter selection
  const handleSelectFilter = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setShowFilterDropdown({});
  };

  // Handle JobSearchBar filter change (syncs to filters + resumeFilters)
  const handleSearchBarFilterChange = useCallback((key: keyof JobSearchBarFilters, value: string) => {
    setSearchBarFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'datePosted') setFilters(prev => ({ ...prev, datePosted: value || 'Any time' }));
    if (key === 'experience') {
      const exp = (value || 'Any Level').replace(/^Any Level$/i, 'Any level');
      setFilters(prev => ({ ...prev, experienceLevel: exp }));
      setResumeFilters(prev => ({ ...prev, experienceLevel: exp }));
    }
    if (key === 'jobType') setResumeFilters(prev => ({ ...prev, workType: value || 'Full-time' }));
    if (key === 'salary') setFilters(prev => ({ ...prev, salaryRange: value || 'Any' }));
  }, []);

  // Parse duration string to approximate years (e.g. "2 years", "2020 - 2023", "Jan 2020 - Present") for ATS tenure. Role-agnostic: 5 years "Freelance Illustration" counts the same as 5 years "Accounts Receivable".
  const parseDurationToYears = (duration: string | undefined): number | null => {
    const d = safeTrim(duration);
    if (!d) return null;
    const lower = d.toLowerCase();
    const yearsMatch = lower.match(/(\d+)\+?\s*(?:years?|yrs?)/);
    if (yearsMatch) return parseInt(yearsMatch[1], 10);
    const rangeMatch = lower.match(/(\d{4})\s*[-–]\s*(?:present|now|current|\d{4})/i) || lower.match(/(\d{4})\s*[-–]\s*(\d{4})/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : new Date().getFullYear();
      return Math.max(0, end - start);
    }
    return null;
  };

  // Convert ResumeData to ResumeProfile (uses Manual Entry fallbacks so AI always gets valid title/skills)
  // Prefer parsed resume jobTitle for first experience so job_finder AI gets the extracted title.
  const convertToResumeProfile = (data: ResumeData | null): ResumeProfile | null => {
    if (!data) return null;
    const manualSkillsList = safeTrim(manualTopSkills)
      ? manualTopSkills.split(',').map(s => safeTrim(s)).filter(Boolean)
      : [];
    const skillsFromData = data.skills?.technical || [];
    const manualTitle = safeTrim(manualJobTitle);
    const extractedTitle = safeTrim(data.personalInfo?.jobTitle ?? data.personalInfo?.title ?? '');
    const experienceList = data.experience?.length
      ? (data.experience || []).map((exp, i) => {
          const firstTitle = extractedTitle || (i === 0 && manualTitle ? manualTitle : null) || exp.position || 'Unknown';
          return {
            title: i === 0 ? firstTitle : (exp.position || 'Unknown'),
            company: exp.company || 'Unknown',
            duration: exp.duration || 'Not specified',
            description: exp.description || ''
          };
        })
      : (extractedTitle || manualTitle ? [{
          title: extractedTitle || manualTitle,
          company: 'Unknown',
          duration: 'Not specified',
          description: ''
        }] : []);
    const yearsFromDurations = (data.experience || [])
      .map((e) => parseDurationToYears(e.duration))
      .filter((y): y is number => y != null);
    const totalYears = yearsFromDurations.length > 0
      ? yearsFromDurations.reduce((a, b) => a + b, 0)
      : null;
    return {
      skills: skillsFromData.length > 0 ? [...skillsFromData, ...(data.skills?.soft || [])] : [...manualSkillsList, ...(data.skills?.soft || [])],
      experience: experienceList.length > 0 ? experienceList : [{ title: 'Unknown', company: 'Unknown', duration: 'Not specified', description: '' }],
      education: [],
      location: safeTrim(data.personalInfo?.location),
      yearsOfExperience: totalYears ?? data.experience?.length ?? (manualTitle ? 1 : 0),
      industry: undefined,
      currentSalary: undefined
    };
  };

  /** JSearch-friendly query: "[Job Title]" "[City]" — quoted city forces API to prioritize that specific location. */
  const getStrictJSearchQuery = useCallback((title: string, location: string): string => {
    const t = sanitizeTitleForQuery(title).replace(/"/g, '');
    const loc = sanitizeLocationForQuery(location);
    if (t && loc) return `"${t}" "${loc}"`;
    if (t) return `"${t}"`;
    if (loc) return `"${loc}"`;
    return '';
  }, []);

  /** Unquoted fuzzy query for absolute fallback: "Account Manager India" — lets API use its own search algorithms. */
  const getFuzzyJSearchQuery = useCallback((title: string, location: string): string => {
    const t = sanitizeTitleForQuery(title).replace(/"/g, '').trim();
    const loc = sanitizeLocationForQuery(location).trim();
    if (t && loc) return `${t} ${loc}`;
    if (t) return t;
    if (loc) return loc;
    return '';
  }, []);

  // Build search query and goal description from selected strategy + resume.
  // Uses actual title/location from resume (no hardcoded tech or US city defaults).
  const buildStrategicQuery = (resolvedLocationOverride?: string): { query: string; searchGoal: string } => {
    const extractedTitle = safeTrim(
      resumeData?.personalInfo?.jobTitle ||
      resumeData?.personalInfo?.title ||
      resumeData?.experience?.[0]?.position ||
      manualJobTitle ||
      ''
    );
    const fromResumeSkills = resumeData?.skills?.technical || [];
    const manualSkillsList = safeTrim(manualTopSkills)
      ? manualTopSkills.split(',').map(s => safeTrim(s)).filter(Boolean)
      : [];
    const skills = fromResumeSkills.length > 0 ? fromResumeSkills : manualSkillsList;
    // If no title from resume/manual, use first 2-3 words of first technical skill (never long summary sentences)
    const recentJob = extractedTitle
      ? extractedTitle
      : (skills[0] ? skills[0].split(/\s+/).slice(0, 3).join(' ') : '');
    console.log('Source Title for Query:', extractedTitle || (recentJob ? `(fallback: ${recentJob})` : '(empty)'));
    // Elastic location priority: override (from geolocation) > User-typed > Resume View (debug) > IP-detected city
    const rawLocation = safeTrim(
      resolvedLocationOverride ?? quickSearchLocation ?? locationToDisplayString(resumeFilters.location) ??
      locationToDisplayString(resumeData?.personalInfo?.location) ??
      ipDetectedCity ??
      ''
    );
    const resumeLocationStr = safeTrim(locationToDisplayString(resumeData?.personalInfo?.location) || locationToDisplayString(resumeFilters.location));
    const location = sanitizeLocationForQuery(rawLocation, { ipDetectedCity, resumeLocation: resumeLocationStr });

    const careerProgressionTitles: Record<string, string[]> = {
      'software engineer': ['Senior Software Engineer', 'Staff Engineer', 'Principal Engineer'],
      'product designer': ['Senior Product Designer', 'Product Manager', 'Lead Product Designer'],
      'data scientist': ['Senior Data Scientist', 'Lead Data Scientist', 'ML Engineer'],
      'product manager': ['Senior Product Manager', 'Director of Product', 'VP Product'],
      'frontend developer': ['Senior Frontend Developer', 'Staff Frontend Engineer'],
      'backend developer': ['Senior Backend Developer', 'Staff Backend Engineer'],
      'full stack': ['Senior Full Stack Engineer', 'Staff Engineer'],
      'ux designer': ['Senior UX Designer', 'Lead UX Designer', 'Product Designer'],
      'project manager': ['Senior Project Manager', 'Program Manager', 'Delivery Manager'],
      'analyst': ['Senior Analyst', 'Lead Analyst', 'Manager']
    };

    const industryTerms = ['SaaS', 'Fintech', 'Healthtech'];
    const industryKeywords = ['fintech', 'finance', 'banking', 'healthcare', 'healthtech', 'saas', 'edtech', 'ecommerce', 'retail', 'insurance', 'consulting'];

    let queryParts: string[] = [];
    let searchGoal = 'Match jobs to your background and skills';

    switch (selectedSearchStrategy) {
      case 'career_progression': {
        if (!recentJob) {
          queryParts = [];
          searchGoal = 'Career progression: next-step roles. Add a job title (resume or manual) for better results.';
          break;
        }
        const lower = recentJob.toLowerCase();
        if (lower.includes('junior')) {
          const seniorTitle = recentJob.replace(/junior/gi, 'Senior').trim();
          queryParts = [seniorTitle];
        } else {
          const matchedKey = Object.keys(careerProgressionTitles).find(k => lower.includes(k));
          if (matchedKey && careerProgressionTitles[matchedKey]) {
            queryParts = careerProgressionTitles[matchedKey].slice(0, 2);
          } else {
            queryParts = [`${recentJob} Manager`, `${recentJob} Lead`];
          }
        }
        searchGoal = `Career progression: next-step roles (e.g. ${queryParts[0]}) based on current title "${recentJob}". Weight match scores for growth fit.`;
        break;
      }
      case 'industry_switch': {
        const roleWithoutIndustry = recentJob
          ? industryKeywords.reduce((acc, kw) => acc.replace(new RegExp(kw, 'gi'), ''), recentJob).replace(/\s+/g, ' ').trim() || recentJob
          : '';
        queryParts = roleWithoutIndustry ? [roleWithoutIndustry, ...industryTerms] : industryTerms;
        searchGoal = `Industry switch: same role in different industry (e.g. ${industryTerms.join(', ')}). Weight transferable skills and cultural fit.`;
        break;
      }
      case 'skill_based': {
        if (skills.length > 0) {
          queryParts = skills.slice(0, 5);
          searchGoal = `Skill-based match: prioritize jobs that require these skills (${queryParts.join(', ')}). Weight technical fit over title.`;
        } else {
          queryParts = recentJob ? [recentJob] : [];
          searchGoal = recentJob ? 'Match jobs to your background.' : 'Match jobs to your skills. Add title or skills for better results.';
        }
        break;
      }
      case 'passion_based':
        searchGoal = 'Match jobs to interests and passion areas. Weight motivation and culture fit.';
        queryParts = recentJob ? [recentJob, ...skills.slice(0, 2)] : skills.slice(0, 3);
        break;
      case 'background':
      default:
        queryParts = recentJob ? [recentJob] : [];
        if (skills.length > 0) queryParts.push(...skills.slice(0, 3));
        break;
    }

    // Elastic JSearch query. For Skill-Based Match: "[Skill1]" "[Skill2]" in [Location]; otherwise title + location.
    let query: string;
    if (selectedSearchStrategy === 'skill_based' && skills.length >= 1) {
      const topSkills = skills.slice(0, 2).map(s => sanitizeTitleForQuery(s).replace(/"/g, '').trim()).filter(Boolean);
      const skillPhrases = topSkills.map(s => `"${s}"`).join(' ');
      query = location ? `${skillPhrases} in ${location}` : skillPhrases;
    } else {
      const titleForQuery = extractedTitle || recentJob || '';
      const simplifiedTitle = sanitizeTitleForQuery(titleForQuery);
      const queryPartsShort = [simplifiedTitle, location].filter(Boolean);
      query = queryPartsShort.join(' ').replace(/"/g, '');
    }
    console.log('JSearch Final Query:', query);
    console.log('[AI_AUDIT] Strategic query', {
      strategy: selectedSearchStrategy,
      inputTitle: recentJob,
      transformedQuery: query,
      searchGoal
    });
    return { query, searchGoal };
  };

  // Find Jobs / Personalized search: geolocation → resolve location → strict query (jobTitle + location) → JSearch → elastic retry → AI matching.
  const handleFindJobs = async () => {
    return handlePersonalizedSearch();
  };

  // Personalized search: resolve location (GPS/resume/prompt) → strict JSearch query → elastic title retry → getJobRecommendations → showWorkspace
  // When locationOverride is set (e.g. from "Broaden your horizon?"), skip geolocation and use that location.
  const handlePersonalizedSearch = async (locationOverride?: string) => {
    if (!activeResume || !resumeData) {
      showNotification('Please select a resume first', 'error');
      return;
    }
    if (personalizedSearchInFlightRef.current) return;
    personalizedSearchInFlightRef.current = true;
    setShowBroadenHorizon(false);
    setSearchProgressMessage(null);
    setSourceQualityNote(null);
    lastSearchResultRef.current = null;
    sessionStorage.removeItem('job_finder_results');

    setIsSearchingPersonalized(true);

    const jobUrlMap = new Map<string, string>();
    apiLimitToastShownRef.current = false;

    const searchWithLimitHandling = async (
      q: string,
      adzunaOptions?: { location?: string; ipDetectedCity?: string }
    ): Promise<{ jobs: JSearchJob[]; sourceQuality?: 'deep' | 'standard' }> => {
      const result = await searchJobs(q, adzunaOptions);
      if (result.sourceQuality === 'standard' && !apiLimitToastShownRef.current) {
        apiLimitToastShownRef.current = true;
        showNotification('Deep Analysis limited – showing jobs from backup source', 'info');
      }
      return { jobs: result.jobs, sourceQuality: result.sourceQuality };
    };

    try {
      let resolvedLocation: string;
      const userTypedLocation = safeTrim(quickSearchLocation);
      if (willingToRelocate) {
        // Country-wide relocation: detect country of user's CURRENT physical location (GPS then IP), then search "[Title] in [Country]".
        setIsResolvingLocation(true);
        try {
          if (navigator?.geolocation) {
            toast.info('SkillHoop uses your location to find nearby jobs. We don\'t store or share this data.', { duration: 4000 });
            type GpsRegion = { state: string; countryName: string; displayLocation: string };
            const result = await new Promise<{ region: GpsRegion | null }>((resolve) => {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  try {
                    const rev = await reverseGeocodeToCityCountry(position.coords.latitude, position.coords.longitude);
                    resolve({ region: { state: rev.state, countryName: rev.countryName, displayLocation: rev.displayLocation } });
                  } catch {
                    resolve({ region: null });
                  }
                },
                () => resolve({ region: null }),
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
              );
            });
            if (result.region) lastResolvedRegionRef.current = result.region;
          }
          // If no GPS, getHomeCountry() falls back to ipRegionRef (IP) then resume
          if (!lastResolvedRegionRef.current?.countryName && ipRegionRef.current) {
            const ip = ipRegionRef.current;
            lastResolvedRegionRef.current = { state: ip.region || '', countryName: ip.countryName || '', displayLocation: [ip.region, ip.countryName].filter(Boolean).join(', ') };
          }
        } finally {
          setIsResolvingLocation(false);
        }
        const homeCountry = getHomeCountry();
        resolvedLocation = homeCountry || '';
      } else if (safeTrim(locationOverride)) {
        resolvedLocation = safeTrim(locationOverride);
        setQuickSearchLocation(resolvedLocation);
        setResumeFilters(prev => ({ ...prev, location: resolvedLocation }));
      } else if (userTypedLocation) {
        // User manually typed a location in the search bar — use it; do not override with GPS.
        resolvedLocation = userTypedLocation;
        setResumeFilters(prev => ({ ...prev, location: resolvedLocation }));
      } else {
        // Geographic priority: 1) GPS city, 2) Manual input, 3) IP city, 4) Default (Hyderabad).
        // Trigger geolocation only when user intends to search; show trust message before browser popup.
        setIsResolvingLocation(true);
        let gpsCity: string | null = null;
        let gpsRegion: { state: string; countryName: string; displayLocation: string } | null = null;
        try {
          if (navigator?.geolocation) {
            toast.info('SkillHoop uses your location to find nearby jobs. We don\'t store or share this data.', { duration: 4000 });
            type GpsRegion = { state: string; countryName: string; displayLocation: string };
            const result = await new Promise<{ city: string | null; region: GpsRegion | null }>((resolve) => {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  try {
                    const rev = await reverseGeocodeToCityCountry(position.coords.latitude, position.coords.longitude);
                    const city = rev.city || rev.displayLocation || null;
                    const region = { state: rev.state, countryName: rev.countryName, displayLocation: rev.displayLocation };
                    resolve({ city, region });
                  } catch {
                    resolve({ city: null, region: null });
                  }
                },
                () => resolve({ city: null, region: null }),
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
              );
            });
            // Ensure gpsCity is always a string (fix [object Object] bug if API returns object)
            const rawCity = result.city;
            gpsCity = typeof rawCity === 'string' ? rawCity : (rawCity && typeof rawCity === 'object' && rawCity !== null && 'city' in rawCity ? String((rawCity as { city: string }).city) : null);
            gpsRegion = result.region;
          }
          // Strict priority: 1) GPS city, 2) Manual input, 3) IP city, 4) Default (Hyderabad). Silent fallback on deny.
          resolvedLocation = (gpsCity || userTypedLocation || ipDetectedCity || 'Hyderabad').trim();
          if (gpsRegion) lastResolvedRegionRef.current = gpsRegion;
          if (resolvedLocation) {
            setQuickSearchLocation(resolvedLocation);
            setResumeFilters(prev => ({ ...prev, location: resolvedLocation }));
          }
        } finally {
          setIsResolvingLocation(false);
        }
      }

      const extractedTitle = safeTrim(
        resumeData.personalInfo?.jobTitle ||
        resumeData.personalInfo?.title ||
        resumeData.experience?.[0]?.position ||
        manualJobTitle ||
        ''
      );
      // Ensure location is always a STRING before JSearch (fix [object Object] bug) — String-First lockdown.
      const rawLocForQuery = willingToRelocate ? resolvedLocation : (resolvedLocation || safeTrim(quickSearchLocation || locationToDisplayString(resumeFilters.location) || locationToDisplayString(resumeData.personalInfo?.location) || ipDetectedCity || ''));
      const resumeLocForFallback = safeTrim(locationToDisplayString(resumeData.personalInfo?.location) || locationToDisplayString(resumeFilters.location));
      const locStr: string = (sanitizeLocationForQuery(rawLocForQuery, { ipDetectedCity, resumeLocation: resumeLocForFallback }).trim() || ipDetectedCity || resumeLocForFallback || 'Remote').trim();
      lastUsedSearchLocationRef.current = locStr;

      // Build JSearch query from strategy. When willingToRelocate, use home country so query is "[Job Title]" in [Country]; if country unknown, pass '' for title-only.
      const locationForStrategy = willingToRelocate ? (resolvedLocation || '') : (resolvedLocation || undefined);
      const { query: strategicQuery, searchGoal } = buildStrategicQuery(locationForStrategy);
      let query = strategicQuery && strategicQuery.length >= 2 ? strategicQuery : getStrictJSearchQuery(extractedTitle, locStr);
      if (!query || query.length < 2) {
        const skills = resumeData?.skills?.technical || [];
        const fallbackTitle = extractedTitle || (skills[0] ? skills[0].split(/\s+/).slice(0, 2).join(' ') : '') || 'professional';
        const fallbackLoc = locStr || ipDetectedCity || (ipRegionRef.current?.countryName ?? '');
        query = getStrictJSearchQuery(fallbackTitle, fallbackLoc);
      }
      const locSource = (locStr && ipDetectedCity && locStr.trim() === ipDetectedCity.trim()) ? 'IP-Detection'
        : (resumeLocForFallback && locStr.trim() === resumeLocForFallback.trim()) ? 'Resume'
        : (quickSearchLocation && sanitizeLocationForQuery(quickSearchLocation).trim() && locStr.trim() === sanitizeLocationForQuery(quickSearchLocation).trim()) ? 'Search'
        : (displayLoc && safeTrim(displayLoc) && locStr.trim() === safeTrim(displayLoc).trim()) ? 'Filters'
        : (locStr.trim() === 'Remote') ? 'Default'
        : 'User';
      console.log('JSearch Final Query (strict):', query);
      console.log('🚨 FINAL JSEARCH PAYLOAD: Title:', extractedTitle, '| Loc:', locStr, locStr ? `(Source: ${locSource})` : '');

      setIsGeneratingRecommendations(true);

      // Step 1: Primary search (title + location; when willingToRelocate = title + home country)
      let searchResult = await searchWithLimitHandling(query, { location: locStr, ipDetectedCity });
      lastSearchResultRef.current = searchResult;
      let jsearchJobs = searchResult.jobs;

      // Zero-fail retry: title-based fallbacks. When willingToRelocate: Title+Home Country → Remote in [Country] → Remote → Elastic Title. Otherwise: Remote → State → Country → Elastic Title.
      // When not relocating, track which geographic level produced results (for Geographic Bouncer).
      let searchLevel: 'city' | 'state' | 'country' = 'city';
      let usedElasticTitleRetry = false;
      let usedFuzzyRetry = false;
      if (willingToRelocate) {
        const homeCountryForRetry = resolvedLocation || '';
        // Retry 1a: Same Title + Remote in [Home Country] (strictly within home country when possible)
        if (jsearchJobs.length === 0 && extractedTitle && homeCountryForRetry) {
          const remoteInCountryQuery = getStrictJSearchQuery(extractedTitle, `Remote in ${homeCountryForRetry}`);
          if (remoteInCountryQuery) {
            console.log('JSearch retry 1a (Relocate: Title + Remote in Home Country):', remoteInCountryQuery);
            searchResult = await searchWithLimitHandling(remoteInCountryQuery, { location: locStr, ipDetectedCity });
            lastSearchResultRef.current = searchResult;
            jsearchJobs = searchResult.jobs;
          }
        }
        // Retry 1b: Same Title + Remote (global remote)
        if (jsearchJobs.length === 0 && extractedTitle) {
          const remoteQuery = getStrictJSearchQuery(extractedTitle, 'Remote');
          if (remoteQuery) {
            console.log('JSearch retry 1b (Relocate: Title + Remote):', remoteQuery);
            searchResult = await searchWithLimitHandling(remoteQuery, { location: locStr, ipDetectedCity });
            lastSearchResultRef.current = searchResult;
            jsearchJobs = searchResult.jobs;
          }
        }
        // Retry 5 (Elastic Title): Core title + Home Country — strip seniority, search "[Core Title]" "[Country]"
        if (jsearchJobs.length === 0 && extractedTitle && homeCountryForRetry) {
          const coreTitle = stripFirstWordFromTitle(extractedTitle);
          if (coreTitle) {
            setSearchProgressMessage(`Broadening search to all ${coreTitle} roles in ${homeCountryForRetry}...`);
            const retry5Query = getStrictJSearchQuery(coreTitle, homeCountryForRetry);
            if (retry5Query) {
              console.log('JSearch retry 5 (Elastic Title + Country):', retry5Query);
              searchResult = await searchWithLimitHandling(retry5Query, { location: locStr, ipDetectedCity });
              lastSearchResultRef.current = searchResult;
              jsearchJobs = searchResult.jobs;
              if (jsearchJobs.length > 0) usedElasticTitleRetry = true;
            }
          }
        }
        // Retry 6 (Fuzzy): Unquoted query as absolute safety net — e.g. "Account Manager India"
        if (jsearchJobs.length === 0 && extractedTitle && homeCountryForRetry) {
          const coreTitle = stripFirstWordFromTitle(extractedTitle);
          if (coreTitle) {
            setSearchProgressMessage(`Performing deep fuzzy search for ${coreTitle} roles in ${homeCountryForRetry}...`);
            const retry6Query = getFuzzyJSearchQuery(coreTitle, homeCountryForRetry);
            if (retry6Query) {
              console.log('JSearch retry 6 (Fuzzy, unquoted):', retry6Query);
              searchResult = await searchWithLimitHandling(retry6Query, { location: locStr, ipDetectedCity });
              lastSearchResultRef.current = searchResult;
              jsearchJobs = searchResult.jobs;
              if (jsearchJobs.length > 0) {
                usedFuzzyRetry = true;
                searchLevel = 'country';
              }
            }
          }
        }
      } else {

        // Retry 1: Same Title + Remote
        if (jsearchJobs.length === 0 && extractedTitle) {
          const remoteQuery = getStrictJSearchQuery(extractedTitle, 'Remote');
          if (remoteQuery) {
            console.log('JSearch retry 1 (Same Title + Remote):', remoteQuery);
            searchResult = await searchWithLimitHandling(remoteQuery, { location: locStr, ipDetectedCity });
            lastSearchResultRef.current = searchResult;
            jsearchJobs = searchResult.jobs;
          }
        }
        // Retry 3: Same Title + State/Region — skip if state is missing (e.g. GPS denied) and go to Retry 4
        if (jsearchJobs.length === 0 && extractedTitle) {
          const region = lastResolvedRegionRef.current;
          const stateLoc = region?.state?.trim() ?? '';
          if (stateLoc) {
            const cityLabel = locStr.split(',')[0].trim() || locStr;
            setSearchProgressMessage(`No jobs in ${cityLabel}, checking ${stateLoc}...`);
            const retry3Query = getStrictJSearchQuery(extractedTitle, stateLoc);
            if (retry3Query) {
              console.log('JSearch retry 3 (Same Title + State/Region):', retry3Query);
              searchResult = await searchWithLimitHandling(retry3Query, { location: locStr, ipDetectedCity });
              lastSearchResultRef.current = searchResult;
              jsearchJobs = searchResult.jobs;
              if (jsearchJobs.length > 0) searchLevel = 'state';
            }
          }
        }
        // Retry 4: Same Title + Home Country (country-wide safety net)
        if (jsearchJobs.length === 0 && extractedTitle) {
          const homeCountry = (getHomeCountry() || lastResolvedRegionRef.current?.countryName || '').trim();
          if (homeCountry) {
            setSearchProgressMessage(`Checking ${homeCountry} for high-match roles...`);
            const retry4Query = getStrictJSearchQuery(extractedTitle, homeCountry);
            if (retry4Query) {
              console.log('JSearch retry 4 (Same Title + Country):', retry4Query);
              searchResult = await searchWithLimitHandling(retry4Query, { location: locStr, ipDetectedCity });
              lastSearchResultRef.current = searchResult;
              jsearchJobs = searchResult.jobs;
              if (jsearchJobs.length > 0) searchLevel = 'country';
            }
          }
        }
        // Retry 5 (Elastic Title): Core title + Country — strip seniority, "[Core Title]" "[Country]"
        if (jsearchJobs.length === 0 && extractedTitle) {
          const homeCountry = (getHomeCountry() || lastResolvedRegionRef.current?.countryName || '').trim();
          if (homeCountry) {
            const coreTitle = stripFirstWordFromTitle(extractedTitle);
            if (coreTitle) {
              setSearchProgressMessage(`Broadening search to all ${coreTitle} roles in ${homeCountry}...`);
              const retry5Query = getStrictJSearchQuery(coreTitle, homeCountry);
              if (retry5Query) {
                console.log('JSearch retry 5 (Elastic Title + Country):', retry5Query);
                searchResult = await searchWithLimitHandling(retry5Query, { location: locStr, ipDetectedCity });
                lastSearchResultRef.current = searchResult;
                jsearchJobs = searchResult.jobs;
                if (jsearchJobs.length > 0) {
                  usedElasticTitleRetry = true;
                  searchLevel = 'country';
                }
              }
            }
          }
        }
        // Retry 6 (Fuzzy): Unquoted query as absolute safety net — e.g. "Account Manager India"
        if (jsearchJobs.length === 0 && extractedTitle) {
          const homeCountry = (getHomeCountry() || lastResolvedRegionRef.current?.countryName || '').trim();
          if (homeCountry) {
            const coreTitle = stripFirstWordFromTitle(extractedTitle);
            if (coreTitle) {
              setSearchProgressMessage(`Performing deep fuzzy search for ${coreTitle} roles in ${homeCountry}...`);
              const retry6Query = getFuzzyJSearchQuery(coreTitle, homeCountry);
              if (retry6Query) {
                console.log('JSearch retry 6 (Fuzzy, unquoted):', retry6Query);
                searchResult = await searchWithLimitHandling(retry6Query, { location: locStr, ipDetectedCity });
                lastSearchResultRef.current = searchResult;
                jsearchJobs = searchResult.jobs;
                if (jsearchJobs.length > 0) {
                  usedFuzzyRetry = true;
                  searchLevel = 'country';
                }
              }
            }
          }
        }
      }

      // Zero-fail retry for global: if title-only search returned 0 results, retry with Skill-Based logic (global candidate = skill-match).
      if (jsearchJobs.length === 0) {
        const fromResumeSkills = resumeData?.skills?.technical || [];
        const manualSkillsList = safeTrim(manualTopSkills) ? manualTopSkills.split(',').map(s => safeTrim(s)).filter(Boolean) : [];
        const skills = fromResumeSkills.length > 0 ? fromResumeSkills : manualSkillsList;
        if (skills.length >= 1) {
          const topSkills = skills.slice(0, 2).map(s => sanitizeTitleForQuery(s).replace(/"/g, '').trim()).filter(Boolean);
          const skillPhrases = topSkills.map(s => `"${s}"`).join(' ');
          if (skillPhrases) {
            console.log('JSearch retry 4 (Skill-Based, Global):', skillPhrases);
            searchResult = await searchWithLimitHandling(skillPhrases, { location: locStr, ipDetectedCity });
            lastSearchResultRef.current = searchResult;
            jsearchJobs = searchResult.jobs;
          }
        }
      }

      // Industry Guard: do not show Developer/Engineer jobs to non-Tech profiles — unless user chose Skill-Based Match.
      // When Retry 5 (Elastic Title) was used, relax: allow roles that contain the core noun of user's title (e.g. Account Manager → Client Manager, Success Manager).
      // When Retry 6 (Fuzzy) was used: STRICTLY apply tech check — no relaxation; block all Engineer/Developer jobs for non-tech users.
      const skillBasedMatchActive = selectedSearchStrategy === 'skill_based';
      if (!skillBasedMatchActive) {
        const userIsTech = isUserCareerFamilyTech(extractedTitle);
        const coreNoun = usedElasticTitleRetry && !usedFuzzyRetry ? getCoreNounFromTitle(extractedTitle) : '';
        jsearchJobs = jsearchJobs.filter(job => {
          if (!isTechRoleJob(job.job_title || '')) return true;
          if (userIsTech) return true;
          if (usedFuzzyRetry) return false; // Strict: no Engineer/Developer for non-tech when fuzzy was used
          if (usedElasticTitleRetry && coreNoun && (job.job_title || '').toLowerCase().includes(coreNoun)) return true;
          return false;
        });
      }

      // Geographic Bouncer: when not relocating, keep only jobs in the searched city/state or Remote in user's country.
      // String-First: locStr is always a string; if it ever is "[object Object]", default already applied above (IP city / Resume / Remote).
      const bouncerLocStr: string = (typeof locStr === 'string' && locStr !== '[object Object]') ? locStr : (ipDetectedCity || resumeLocForFallback || 'Remote');
      if (!willingToRelocate && bouncerLocStr) {
        const searchedCity = bouncerLocStr.split(',')[0].trim().toLowerCase();
        const userCountry = (getHomeCountry() || '').trim().toLowerCase();
        jsearchJobs = jsearchJobs.filter(job => {
          const raw = job as JSearchJob & { location?: string; job_location?: string };
          const locationStr = (raw.location ?? raw.job_location ?? '').toString().toLowerCase();
          const jobCity = (job.job_city ?? '').toString().toLowerCase();
          const jobCountry = (job.job_country ?? '').toString().toLowerCase();
          const isRemote = /remote/.test(locationStr) || jobCity === 'remote';
          if (isRemote && userCountry && jobCountry && jobCountry.includes(userCountry)) return true;
          // Country-level (and state-level, and fuzzy Retry 6): allow any job in user's home country.
          if ((searchLevel === 'country' || searchLevel === 'state' || usedFuzzyRetry) && userCountry && jobCountry && jobCountry.includes(userCountry)) return true;
          if (searchedCity && (locationStr.includes(searchedCity) || jobCity.includes(searchedCity))) return true;
          return false;
        });
      }

      if (jsearchJobs.length === 0) {
        setSearchProgressMessage(null);
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        setShowBroadenHorizon(true);
        showNotification('No jobs found for this title and location.', 'info');
        return;
      }

      setSearchProgressMessage(null);

      const highlightsById = new Map<string, JobHighlights | undefined>(
        jsearchJobs.map((j) => [j.job_id, j.job_highlights])
      );
      const jsearchById = new Map<string, JSearchJob>(jsearchJobs.map((j) => [j.job_id, j]));

      // Convert JSearch jobs to JobListing for AI (unified description for JSearch + Adzuna/Arbeitnow)
      const jobListings = jsearchJobs.map(job => {
        jobUrlMap.set(job.job_id, job.job_apply_link);
        const extJ = job as JSearchJob & Record<string, unknown>;
        const jd = typeof job.job_description === 'string' ? job.job_description.trim() : '';
        const greedyFt = typeof extJ.greedy_full_text === 'string' ? extJ.greedy_full_text.trim() : '';
        const unifiedFt =
          typeof job.unified_description === 'string' ? job.unified_description.trim() : '';
        const jdSnip =
          typeof extJ.job_description_snippet === 'string' ? extJ.job_description_snippet.trim() : '';
        const benefitsStr = stringifyJobBenefitsField(extJ.job_benefits);
        const legacyDesc =
          typeof (job as JSearchJob & { description?: string }).description === 'string'
            ? (job as JSearchJob & { description?: string }).description!.trim()
            : '';
        const description =
          greedyFt ||
          unifiedFt ||
          jd ||
          jdSnip ||
          benefitsStr ||
          legacyDesc ||
          job.job_highlights?.Qualifications?.join(' ') ||
          '';
        return {
          id: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location: formatJSearchLocation(job),
          description: typeof description === 'string' ? description : '',
          requirements: job.job_highlights?.Responsibilities?.join(' ') || job.job_highlights?.Qualifications?.join(' ') || '',
          salaryRange: job.job_min_salary != null && job.job_max_salary != null
            ? `$${Math.round(job.job_min_salary / 1000)}k - $${Math.round(job.job_max_salary / 1000)}k`
            : undefined,
          postedDate: job.job_posted_at_datetime_utc?.split('T')[0] ?? '',
          source: 'JSearch',
          experienceLevel: resumeFilters.experienceLevel !== 'Any level' ? resumeFilters.experienceLevel : undefined
        };
      });

      const profile = convertToResumeProfile(resumeData);
      if (!profile) {
        setSearchProgressMessage(null);
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('Failed to convert resume to profile.', 'error');
        return;
      }

      const isStandardSource = lastSearchResultRef.current?.sourceQuality === 'standard';
      const aiLimit = isStandardSource ? Math.min(jobListings.length, 25) : 15;
      const topForAi = jobListings.slice(0, aiLimit);
      if (topForAi.length === 0) {
        setSearchProgressMessage(null);
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('No jobs to rank. Try a different search.', 'info');
        return;
      }

      // jobTitle for API: strictly from parsed resume when available (personalInfo.jobTitle/title), so AI matching uses extracted title
      const apiJobTitleFromResume = resumeData?.personalInfo
        ? (resumeData.personalInfo.jobTitle ?? resumeData.personalInfo.title)
        : undefined;
      const apiJobTitle = typeof apiJobTitleFromResume === 'string' && apiJobTitleFromResume.trim() ? apiJobTitleFromResume.trim() : undefined;

      let recommendations: JobRecommendation[];
      try {
        recommendations = await getJobRecommendations(profile, topForAi, topForAi.length, searchGoal, apiJobTitle);
      } catch (aiError) {
        console.error('[JobFinder] getJobRecommendations failed:', aiError);
        const fallbackCount = isStandardSource ? jsearchJobs.length : 15;
        const fallbackJobs: Job[] = jsearchJobs.slice(0, fallbackCount).map(j => {
          const g = jsearchToJob(j);
          return {
            ...g,
            matchScore: 0,
            whyMatch: '',
            reasons: [],
            logoInitial: (g.company || 'U').substring(0, 1),
            logoColor: getLogoColor(g.company || 'Unknown'),
            daysAgo: getDaysAgo(g.postedDate),
            experienceLevel: resumeFilters.experienceLevel !== 'Any level' ? resumeFilters.experienceLevel : undefined
          };
        });
        jobDetailsCacheRef.current.clear();
        jobDetailFetchInFlightRef.current.clear();
        setPersonalizedJobResults(fallbackJobs);
        setSourceQualityNote(lastSearchResultRef.current?.sourceQuality ?? null);
        setPredictiveRecommendations([]);
        if (fallbackJobs.length > 0) {
          setSelectedWorkspaceJobId(fallbackJobs[0].id);
          sessionStorage.setItem('job_finder_results', JSON.stringify(fallbackJobs));
          void insertUserJobHistory({
            query,
            intent: selectedSearchStrategy,
            jobIds: fallbackJobs.map((j) => j.id),
            jobsSnapshot: fallbackJobs,
            uiState: {
              searchBarFilters: { ...searchBarFilters },
              resumeFilters: { ...resumeFilters },
              quickSearchJobTitle,
              quickSearchLocation,
              willingToRelocate,
              sourceQualityNote:
                lastSearchResultRef.current?.sourceQuality === 'standard' ||
                lastSearchResultRef.current?.sourceQuality === 'deep'
                  ? lastSearchResultRef.current.sourceQuality
                  : null,
              selectedSearchStrategy,
            },
          });
          navigate('/dashboard/finder/results');
        }
        setSearchProgressMessage(null);
        queueMicrotask(() => {
          setIsSearchingPersonalized(false);
          setIsGeneratingRecommendations(false);
          showNotification('AI ranking failed. Showing job list without scores.', 'info');
        });
        return;
      }

      setPredictiveRecommendations(recommendations);

      const buildJobFromRec = (rec: JobRecommendation): Job => {
        const company = rec.job.company || 'Unknown';
        const rawJ = jsearchById.get(rec.job.id);
        const highlightsForSkills = rawJ?.job_highlights ?? highlightsById.get(rec.job.id);
        const fb = descriptionFallbackFields(rawJ);
        const greedyFromApi =
          rawJ && typeof rawJ.greedy_full_text === 'string' ? rawJ.greedy_full_text.trim() : '';
        const unifiedFromApi =
          rawJ && typeof rawJ.unified_description === 'string' ? rawJ.unified_description.trim() : '';
        const desc =
          greedyFromApi ||
          unifiedFromApi ||
          safeTrim(rec.job.description) ||
          fb.snippet ||
          fb.job_description ||
          safeTrim(fb.job_description_snippet) ||
          safeTrim(fb.job_benefits) ||
          '';
        return {
          ...rec.job,
          id: rec.job.id,
          title: rec.job.title,
          company,
          location: rec.job.location,
          salary: rec.job.salaryRange || 'Competitive',
          type: rawJ ? inferDisplayWorkTypeFromJSearch(rawJ) : inferDisplayWorkTypeFromListing(rec.job),
          description: desc,
          unified_description: unifiedFromApi || undefined,
          greedy_full_text: greedyFromApi || undefined,
          requirements: rec.job.requirements ?? '',
          postedDate: rec.job.postedDate ?? '',
          url: jobUrlMap.get(rec.job.id) || '#',
          source: rec.job.source ?? 'JSearch',
          jobHighlights: highlightsById.get(rec.job.id),
          job_country: rawJ?.job_country ?? null,
          matchScore: rec.matchScore,
          whyMatch: rec.whyMatch ?? (Array.isArray(rec.reasons) ? rec.reasons.join(' | ') : ''),
          reasons: rec.reasons ?? [],
          logoInitial: company.substring(0, 1),
          logoColor: getLogoColor(company),
          daysAgo: getDaysAgo(rec.job.postedDate),
          experienceLevel: resumeFilters.experienceLevel !== 'Any level' ? resumeFilters.experienceLevel : undefined,
          skills: skillsTokensFromHighlights(highlightsForSkills),
          ...fb,
        };
      };

      const enhancedResults: Job[] = isStandardSource
        ? jobListings.map(jobListing => {
            const rec = recommendations.find(r => String(r.job.id) === String(jobListing.id));
            if (rec) return buildJobFromRec(rec);
            const company = jobListing.company || 'Unknown';
            const rawListing = jsearchById.get(jobListing.id);
            const fb = descriptionFallbackFields(rawListing);
            const greedyFromApi =
              rawListing && typeof rawListing.greedy_full_text === 'string'
                ? rawListing.greedy_full_text.trim()
                : '';
            const unifiedFromApi =
              rawListing && typeof rawListing.unified_description === 'string'
                ? rawListing.unified_description.trim()
                : '';
            const desc =
              greedyFromApi ||
              unifiedFromApi ||
              safeTrim(jobListing.description) ||
              fb.snippet ||
              fb.job_description ||
              safeTrim(fb.job_description_snippet) ||
              safeTrim(fb.job_benefits) ||
              '';
            return {
              id: jobListing.id,
              title: jobListing.title,
              company,
              location: jobListing.location,
              salary: jobListing.salaryRange || 'Competitive',
              type: rawListing
                ? inferDisplayWorkTypeFromJSearch(rawListing)
                : inferDisplayWorkTypeFromListing(jobListing),
              description: desc,
              unified_description: unifiedFromApi || undefined,
              greedy_full_text: greedyFromApi || undefined,
              requirements: jobListing.requirements ?? '',
              postedDate: jobListing.postedDate ?? '',
              url: jobUrlMap.get(jobListing.id) || '#',
              source: jobListing.source ?? 'JSearch',
              jobHighlights: highlightsById.get(jobListing.id),
              job_country: rawListing?.job_country ?? null,
              matchScore: 0,
              whyMatch: '',
              reasons: [],
              logoInitial: company.substring(0, 1),
              logoColor: getLogoColor(company),
              daysAgo: getDaysAgo(jobListing.postedDate),
              experienceLevel: resumeFilters.experienceLevel !== 'Any level' ? resumeFilters.experienceLevel : undefined,
              skills: skillsTokensFromHighlights(highlightsById.get(jobListing.id)),
              ...fb,
            };
          })
        : recommendations.map(rec => buildJobFromRec(rec));

      // Debug: verify array before state update (remove after confirming fix)
      console.log('Final Jobs to State:', enhancedResults);

      // Always set state from the jobs array, never from raw SearchJobsResult
      jobDetailsCacheRef.current.clear();
      jobDetailFetchInFlightRef.current.clear();
      setPersonalizedJobResults(enhancedResults);
      setSourceQualityNote(lastSearchResultRef.current?.sourceQuality ?? null);
      if (enhancedResults.length > 0) {
        setSelectedWorkspaceJobId(enhancedResults[0].id);
        sessionStorage.setItem('job_finder_results', JSON.stringify(enhancedResults));
        void insertUserJobHistory({
          query,
          intent: selectedSearchStrategy,
          jobIds: enhancedResults.map((j) => j.id),
          jobsSnapshot: enhancedResults,
          uiState: {
            searchBarFilters: { ...searchBarFilters },
            resumeFilters: { ...resumeFilters },
            quickSearchJobTitle,
            quickSearchLocation,
            willingToRelocate,
            sourceQualityNote:
              lastSearchResultRef.current?.sourceQuality === 'standard' ||
              lastSearchResultRef.current?.sourceQuality === 'deep'
                ? lastSearchResultRef.current.sourceQuality
                : null,
            selectedSearchStrategy,
          },
        });
        navigate('/dashboard/finder/results');
      }
      setSearchProgressMessage(null);
      // Defer loading off and toast until after jobs state has committed to avoid "No Jobs Found" flicker
      queueMicrotask(() => {
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('Found personalized job matches!', 'success');
      });
    } catch (error) {
      console.error('Error in personalized search:', error);
      setSearchProgressMessage(null);
      setIsSearchingPersonalized(false);
      setIsGeneratingRecommendations(false);
      showNotification(
        error instanceof Error ? error.message : 'Failed to search jobs. Please try again.',
        'error'
      );
    } finally {
      personalizedSearchInFlightRef.current = false;
    }
  };

  // Generate job alerts
  const handleGenerateJobAlerts = async () => {
    if (!resumeData) {
      showNotification('Please select a resume first', 'error');
      return;
    }

    try {
      const profile = convertToResumeProfile(resumeData);
      if (!profile) {
        throw new Error('Failed to convert resume to profile');
      }

      const alerts = await generateJobAlerts(profile);
      setJobAlerts(alerts);
      showNotification(`Generated ${alerts.length} job alerts!`, 'success');
    } catch (error) {
      console.error('Error generating job alerts:', error);
      showNotification('Failed to generate alerts. Please check your API key.', 'error');
    }
  };

  // Strip PDF metadata / binary artifacts that can leak into text (e.g. /Type /Catalog)
  const stripPdfMetadataFromText = (text: string): string => {
    return text
      .split(/\r?\n/)
      .filter(line => {
        const t = line.trim();
        if (!t) return true;
        // Drop lines that look like PDF object metadata
        if (/^\s*\/[\w#]+\s+(\/[\w#]+|\d+)\s*$/.test(t)) return false;
        if (/^\s*\/[\w#]+\s*$/.test(t)) return false;
        if (/^\[[\s\d]+\]\s*[<>]/.test(t)) return false;
        return true;
      })
      .join('\n');
  };

  // Convert File to Base64 string (raw base64, no data URL prefix)
  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URL prefix if present (e.g. "data:application/pdf;base64,")
        const base64 = result.includes(',') ? result.split(',')[1] ?? result : result;
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(f);
    });

  // Handle resume upload — AI-first: send Base64 to backend for vision-based parsing (works for Canva/complex PDFs)
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('text') && !file.name.endsWith('.docx')) {
      showNotification('Please upload a PDF, DOCX, or TXT file', 'error');
      return;
    }

    setIsUploadingResume(true);

    try {
      // Auth gate: get session first (bypasses ISP block when server verifies via supabaseAdmin).
      // Fallback to localStorage parsing if getSession fails (e.g. network/ISP block).
      let userId: string | null = null;
      let accessToken: string | null = null;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id && session?.access_token) {
          userId = session.user.id;
          accessToken = session.access_token;
        }
      } catch (sessionError) {
        console.warn('getSession failed (e.g. ISP block), falling back to localStorage:', sessionError);
      }

      if (!userId || !accessToken) {
        if (typeof window !== 'undefined') {
          try {
            const rawToken = window.localStorage.getItem('sb-tnbeugqrflocjjjxcceh-auth-token');
            const ghost = window.localStorage.getItem('skillhoop_ghost_session');
            if (rawToken) {
              try {
                const parsed = JSON.parse(rawToken) as {
                  currentSession?: { access_token?: string; user?: { id?: string; sub?: string } };
                };
                userId = parsed.currentSession?.user?.id || parsed.currentSession?.user?.sub || null;
                accessToken = parsed.currentSession?.access_token ?? null;
              } catch (parseError) {
                console.error('Error parsing Supabase auth token from storage:', parseError);
              }
            }
            if (!userId && ghost) {
              try {
                const parsedGhost = JSON.parse(ghost) as
                  | { userId?: string; user_id?: string; user?: { id?: string } }
                  | undefined;
                userId = parsedGhost?.userId || parsedGhost?.user_id || parsedGhost?.user?.id || null;
              } catch {
                /* ghost may be opaque */
              }
            }
          } catch (storageError) {
            console.error('Error accessing auth token from storage:', storageError);
          }
        }
      }

      if (!userId || !accessToken) {
        showNotification('Please sign in to upload and parse your resume.', 'error');
        return;
      }

      const base64 = await fileToBase64(file);

      const apiUrl = typeof window !== 'undefined' && window.location?.hostname === 'localhost'
        ? 'http://localhost:3000/api/parse-resume'
        : '/api/parse-resume';

      const payload = {
        fileData: base64,
        fileName: file.name,
        mimeType: file.type,
        userId,
        feature_name: 'job_finder',
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        showNotification(data.error || 'Unknown Server Error', 'error');
        return;
      }

      const content = data?.content;
      if (!content) {
        showNotification('No data returned from resume analysis. Please try again.', 'error');
        return;
      }

      // Extract JSON from response (model may wrap in markdown or extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const raw = jsonMatch ? jsonMatch[0] : content;
      type AIParsed = {
        personalInfo?: {
          fullName?: string;
          name?: string;
          email?: string;
          location?: string;
          jobTitle?: string;
          title?: string;
        };
        skills?: { technical?: string[]; soft?: string[] };
        'technical skills'?: string[];
        technicalSkills?: string[];
        'soft skills'?: string[];
        softSkills?: string[];
        experience?: Array<{ position?: string; company?: string; location?: string; duration?: string; description?: string }>;
        'professional experience'?: Array<{ position?: string; company?: string; location?: string; duration?: string; description?: string }>;
        summary?: string;
      };
      const parsed = JSON.parse(raw) as AIParsed;

      const skillsObj = parsed.skills;
      const technical = Array.isArray(skillsObj?.technical)
        ? skillsObj.technical
        : parsed['technical skills'] ?? parsed.technicalSkills ?? [];
      const soft = Array.isArray(skillsObj?.soft)
        ? skillsObj.soft
        : parsed['soft skills'] ?? parsed.softSkills ?? [];
      const experienceList = parsed.experience ?? parsed['professional experience'] ?? [];

      const jobTitleFromApi = safeTrim(parsed.personalInfo?.jobTitle ?? parsed.personalInfo?.title ?? '');

      // Normalize location to string (API may return object e.g. { city, country })
      const rawLoc = parsed.personalInfo?.location;
      const locationStr = typeof rawLoc === 'string'
        ? rawLoc
        : rawLoc && typeof rawLoc === 'object' && rawLoc !== null && !Array.isArray(rawLoc)
          ? Object.values(rawLoc).filter((v): v is string => typeof v === 'string').join(', ') || ''
          : '';

      const parsedData: ResumeData = {
        personalInfo: {
          fullName: parsed.personalInfo?.fullName ?? parsed.personalInfo?.name ?? '',
          email: parsed.personalInfo?.email ?? '',
          location: locationStr,
          title: jobTitleFromApi || undefined,
          jobTitle: jobTitleFromApi || undefined,
        },
        skills: {
          technical: Array.isArray(technical) ? technical : [],
          soft: Array.isArray(soft) ? soft : [],
        },
        experience: Array.isArray(experienceList)
          ? experienceList.map(
              (e: {
                position?: string;
                company?: string;
                location?: string;
                duration?: string;
                description?: string;
              }) => ({
                position: e.position ?? '',
                company: e.company ?? '',
                location: e.location ?? '',
                duration: e.duration ?? '',
                description: e.description ?? '',
              })
            )
          : [],
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      };

      const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
      savedResumes[file.name] = parsedData;
      localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));

      setUploadedResumes(savedResumes);
      setActiveResume(file.name);
      setResumeData(parsedData);
      setShowResumeDashboard(true);
      localStorage.setItem('active_resume_for_job_search', file.name);

      showNotification('Resume uploaded and analyzed successfully!', 'success');
    } catch (error) {
      console.warn('Resume upload/parse error:', error);
      const message =
        (error instanceof Error && error.message)
          ? error.message
          : 'Failed to upload or parse resume. Please try again.';
      showNotification(message, 'error');
    } finally {
      setIsUploadingResume(false);
      event.target.value = '';
    }
  };

  // Select resume
  const handleSelectResume = (resumeName: string) => {
    const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
    if (savedResumes[resumeName]) {
      setActiveResume(resumeName);
      setResumeData(savedResumes[resumeName]);
      localStorage.setItem('active_resume_for_job_search', resumeName);
    }
  };

  // Delete resume
  const handleDeleteResume = (resumeName: string) => {
    if (!confirm(`Are you sure you want to delete "${resumeName}"?`)) return;
    
    const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
    delete savedResumes[resumeName];
    localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
    setUploadedResumes(savedResumes);
    
    if (activeResume === resumeName) {
      const remaining = Object.keys(savedResumes);
      if (remaining.length > 0) {
        handleSelectResume(remaining[0]);
      } else {
        setActiveResume(null);
        setResumeData(null);
        setManualJobTitle('');
        setManualTopSkills('');
        localStorage.removeItem('active_resume_for_job_search');
      }
    }
  };

  // Apply Manual Entry: merge current job title and top skills into resumeData and persist
  const applyManualEntry = () => {
    if (!activeResume || !resumeData) return;
    const title = safeTrim(manualJobTitle);
    const skillsList = safeTrim(manualTopSkills)
      ? manualTopSkills.split(',').map(s => safeTrim(s)).filter(Boolean)
      : [];
    const updated: ResumeData = {
      ...resumeData,
      experience: title
        ? [{ position: title, company: resumeData.experience?.[0]?.company ?? '', description: resumeData.experience?.[0]?.description ?? '' }, ...(resumeData.experience?.slice(1) || [])]
        : resumeData.experience || [],
      skills: {
        ...resumeData.skills,
        technical: skillsList.length > 0 ? skillsList : (resumeData.skills?.technical || [])
      }
    };
    const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
    savedResumes[activeResume] = updated;
    localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
    setUploadedResumes(savedResumes);
    setResumeData(updated);
    showNotification('Manual entry applied. Search will use your job title and skills.', 'success');
  };

  // Track job (toggle: remove if already saved)
  const handleTrackJob = (job: Job) => {
    if (JobTrackingUtils.isJobTracked(job)) {
      const removed = JobTrackingUtils.removeJobFromTracker(job);
      if (removed) {
        showNotification(`"${job.title}" removed from Job Tracker`, 'info');
        const tracked = JobTrackingUtils.getAllTrackedJobs();
        setTrackedJobIds(new Set(tracked.map((j) => j.url)));
      }
      return;
    }

    const result = JobTrackingUtils.addJobToTracker(job, 'job-finder', 'new-leads');
    
    if (result.success) {
      showNotification(`"${job.title}" added to Job Tracker!`, 'success');
      const tracked = JobTrackingUtils.getAllTrackedJobs();
      setTrackedJobIds(new Set(tracked.map(j => j.url)));
      
      // Update workflow progress - Workflow 1
      const workflow1 = WorkflowTracking.getWorkflow('job-application-pipeline');
      if (workflow1 && workflowContext?.workflowId === 'job-application-pipeline') {
        // Mark find-jobs as completed if we have jobs
        if (tracked.length > 0) {
          WorkflowTracking.updateStepStatus('job-application-pipeline', 'find-jobs', 'completed', {
            jobsFound: tracked.length
          });
        }
        
        // Show workflow prompt if in workflow
        if (workflow1.isActive) {
          setShowWorkflowPrompt(true);
          // Store job data in workflow context for next step
          updateContext({
            workflowId: 'job-application-pipeline',
            currentJob: {
              id: result.job?.id,
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              url: job.url
            }
          });
        }
      }
      
      // Update workflow progress - Workflow 3
      const workflow3 = WorkflowTracking.getWorkflow('personal-brand-job-discovery');
      if (workflow3 && workflowContext?.workflowId === 'personal-brand-job-discovery') {
        // Mark find-brand-matched-jobs as completed
        WorkflowTracking.updateStepStatus('personal-brand-job-discovery', 'find-brand-matched-jobs', 'completed', {
          jobsFound: tracked.length,
          brandMatch: true
        });
        
        // Complete the workflow if all steps are done
        if (workflow3.progress === 100) {
          WorkflowTracking.completeWorkflow('personal-brand-job-discovery');
        }
      }
    } else if (result.duplicate) {
      showNotification('This job is already in your tracker', 'info');
      const tracked = JobTrackingUtils.getAllTrackedJobs();
      setTrackedJobIds(new Set(tracked.map((j) => j.url)));
    }
  };

  // Apply and track
  const handleApplyAndTrack = (job: Job) => {
    const result = JobTrackingUtils.addJobToTracker(job, 'job-finder', 'applied');
    
    if (result.success || result.duplicate) {
      window.open(job.url, '_blank');
      showNotification('Opening application page...', 'success');
      const tracked = JobTrackingUtils.getAllTrackedJobs();
      setTrackedJobIds(new Set(tracked.map(j => j.url)));
    }
  };

  // Bulk track
  const handleBulkTrack = (jobs: Job[], minScore = 80) => {
    const result = JobTrackingUtils.bulkAddJobs(jobs, 'job-finder', minScore);
    showNotification(
      `Added ${result.added} jobs to tracker${result.duplicates > 0 ? ` (${result.duplicates} duplicates skipped)` : ''}`,
      result.added > 0 ? 'success' : 'info'
    );
    const tracked = JobTrackingUtils.getAllTrackedJobs();
    setTrackedJobIds(new Set(tracked.map(j => j.url)));
  };

  // Export CSV
  const handleExportCSV = (jobs: Job[]) => {
    const csv = jobs.map(job =>
      `"${job.title}","${job.company}","${job.location}","${job.salary}","${job.type}","${job.url}"`
    ).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent('Title,Company,Location,Salary,Type,URL\n' + csv);
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `job-search-results-${Date.now()}.csv`;
    link.click();
    showNotification('Results exported to CSV', 'success');
  };

  // Check if tracked (URL set + title/company match so UI stays in sync with storage)
  const isJobTracked = (job: Job): boolean =>
    trackedJobIds.has(job.url) || JobTrackingUtils.isJobTracked(job);

  // Match score color
  const getMatchScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Render job card
  const renderJobCard = (job: Job, index: number) => (
    <div key={index} className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
            {job.matchScore > 0 && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(job.matchScore)}`}>
                {job.matchScore}% match
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {job.postedDate}
            </span>
          </div>
          
          <p className="text-slate-700 mb-4">{job.description}</p>
          
          {job.whyMatch && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Why this matches:</strong> {job.whyMatch}
              </p>
            </div>
          )}

          {isJobTracked(job) && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                Already tracked
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {isJobTracked(job) ? (
              <button className="px-4 py-2 bg-slate-100 text-[#111827] rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center gap-1">
                <Check className="w-4 h-4" />
                View in Tracker
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleTrackJob(job); }}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-all flex items-center gap-1"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Track This Job
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleApplyAndTrack(job); }}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-all flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Apply & Track
                </button>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleAnalyzeJob(job); }}
              disabled={isAnalyzingJob || !resumeData}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold hover:bg-orange-200 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzingJob && selectedJobForAnalysis?.id === job.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  Analyze Match
                </>
              )}
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-2 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl font-semibold transition-all flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // JSearch API job card (title, logo/fallback, location, Apply Now)
  const renderJSearchJobCard = (job: JSearchJob) => {
    const locationStr = formatJSearchLocation(job);
    const internalJob = jsearchToJob(job);
    const isTracked = isJobTracked(internalJob);
    return (
      <div key={job.job_id} className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-start gap-4">
          <JobCompanyLogo logoUrl={job.employer_logo} companyName={job.employer_name} />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-800 mb-1">{job.job_title}</h3>
            <p className="text-slate-600 font-medium mb-2">{job.employer_name}</p>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{locationStr}</span>
            </div>
            <p className="text-slate-700 text-sm line-clamp-3 mb-4">{internalJob.description || '—'}</p>
            <div className="flex flex-wrap gap-2">
              {!isTracked && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleTrackJob(internalJob); }}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-all flex items-center gap-1"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Track
                </button>
              )}
              <a
                href={job.job_apply_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl font-semibold transition-all flex items-center gap-1 inline-flex"
              >
                <ExternalLink className="w-4 h-4" />
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const selectedJob = sortedWorkspaceJobs.find((j) => j.id === selectedWorkspaceJobId);

  // --- Workspace View (split pane) when user has run personalized search ---
  if (showWorkspace) {
    return (
      <div className="flex flex-col h-[calc(100vh-1.25rem)] overflow-hidden text-neutral-900 font-sans relative w-full">
        <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />
        {/* Match default Job Finder: space-y-6 (24px) between header area and search bar in shell + gap from search to main content */}
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <div className="flex shrink-0 flex-col">
            {/* JobSearchBar — z-10 so it scrolls under the dashboard header (z-20) */}
            <div className="z-10 w-full shrink-0 pt-1">
              <JobSearchBar
                jobTitle={quickSearchJobTitle}
                onJobTitleChange={(v) => { setQuickSearchJobTitle(v); setManualJobTitle(v); }}
                location={locationToDisplayString(quickSearchLocation ?? '')}
                onLocationChange={(v) => handleLocationChange(v)}
                onSearch={() => handlePersonalizedSearch()}
                isSearching={isSearchingPersonalized || isResolvingLocation}
                filters={searchBarFilters}
                onFilterChange={handleSearchBarFilterChange}
                onHistoryClick={() => navigate('/work-history-manager?tab=jobs-history')}
                onAllFiltersClick={() => setShowFilters(true)}
                embedded={false}
              />
            </div>
            {sourceQualityNote === 'standard' && (
              <div className="mt-1 w-full shrink-0">
                <div
                  className={`flex min-h-[2.375rem] items-center gap-1.5 rounded-lg px-3 py-2 ${
                    backupSourceBannerDismissed
                      ? 'border border-transparent bg-transparent'
                      : 'border border-amber-200 bg-amber-50/80 text-xs text-amber-800'
                  }`}
                  role={backupSourceBannerDismissed ? 'presentation' : 'status'}
                >
                  {!backupSourceBannerDismissed ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                      <p className="min-w-0 flex-1 leading-snug">
                        Deep Analysis limited — results from backup source
                      </p>
                      <button
                        type="button"
                        onClick={() => setBackupSourceBannerDismissed(true)}
                        className="-m-0.5 shrink-0 rounded-md p-1 text-amber-700 transition-colors hover:bg-amber-100/90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
                        aria-label="Dismiss backup source notice"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        <main className="flex min-h-0 flex-1 w-full flex-col overflow-hidden">
          <div className="flex flex-1 min-h-0 w-full flex-col md:flex-row rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="w-full md:w-[38%] md:min-w-[260px] border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-white shrink-0 md:shrink-0 max-h-[40vh] md:max-h-none md:h-full min-h-0">
              <div className="shrink-0 flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3.5 py-2.5">
                <span className="min-w-0 text-[12px] font-medium text-slate-600 truncate" title={workspaceResultsContextLine}>
                  {workspaceResultsContextLine}
                </span>
                <div className="relative shrink-0" ref={workspaceSortMenuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkspaceSortMenuOpen((o) => !o);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {workspaceSortButtonLabel}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" aria-hidden />
                  </button>
                  {workspaceSortMenuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-20 mt-1 w-[188px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {(
                        [
                          { key: 'original' as const, label: 'Relevance' },
                          { key: 'ats' as const, label: 'Match Score' },
                          { key: 'hire' as const, label: 'Hire Probability' },
                          { key: 'date' as const, label: 'Date Posted' },
                        ] as const
                      ).map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          role="menuitem"
                          className={`flex w-full px-3 py-1.5 text-left text-[12px] hover:bg-slate-50 ${
                            workspaceResultSort === key ? 'font-semibold text-blue-600' : 'text-slate-800'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setWorkspaceResultSort(key);
                            setWorkspaceSortMenuOpen(false);
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar workspace-scrollbar">
              {sortedWorkspaceJobs.map((job) => {
                const typeLower = (job.type || '').toLowerCase();
                const isRemote = typeLower.includes('remote');
                const isHybrid = typeLower.includes('hybrid');
                const workTagClass = isRemote ? 'tag-remote' : isHybrid ? 'tag-hybrid' : 'tag-meta';
                const workLabel = isRemote ? 'Remote' : isHybrid ? 'Hybrid' : safeTrim(job.type) || 'On-site';
                const hot = (job.matchScore ?? 0) >= 95;
                const expLabel = safeTrim(job.experienceLevel) || '—';
                return (
                  <div
                    key={job.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedWorkspaceJobId(job.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedWorkspaceJobId(job.id);
                      }
                    }}
                    className={`px-3.5 py-3 border-b border-slate-200 cursor-pointer transition-colors ${selectedWorkspaceJobId === job.id ? 'bg-[#E1F5EE]' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="w-[38px] h-[38px] rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                        <JobBoardBriefcaseIcon size={20} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-1 items-start">
                          <h3 className="text-[13px] font-medium text-slate-900 leading-snug line-clamp-2">{job.title}</h3>
                          {hot ? <span className="tag-hot shrink-0">Hot</span> : null}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 truncate">{job.company}</p>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                          <span className="truncate">{job.location}</span>
                          <span className="shrink-0">·</span>
                          <span className="shrink-0">{job.daysAgo || getDaysAgo(job.postedDate)}</span>
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                          <span className={workTagClass}>{workLabel}</span>
                          <span className="tag-meta">{expLabel}</span>
                          <span className="source-badge">{job.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
            {selectedJob ? (
              <div className="flex flex-1 flex-col bg-white overflow-hidden min-h-0 min-w-0">
                <div className="shrink-0 overflow-visible border-b border-slate-200 px-5 py-4">
                  <div className="flex gap-3.5 items-start overflow-visible">
                    <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                      <JobBoardBriefcaseIcon size={24} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0 flex gap-4 justify-between items-stretch">
                      <div className="min-w-0 flex flex-col justify-center">
                        <h1 className="text-lg font-medium text-slate-900 leading-tight tracking-tight">{selectedJob.title}</h1>
                        <p className="text-sm text-blue-600 mt-1">{selectedJob.company}</p>
                        {(() => {
                          const tl = (selectedJob.type || '').toLowerCase();
                          const wr = tl.includes('remote');
                          const hy = tl.includes('hybrid');
                          const wlab = wr ? 'Remote' : hy ? 'Hybrid' : safeTrim(selectedJob.type) || 'On-site';
                          const wbadge = wr ? 'tag-remote' : hy ? 'tag-hybrid' : 'tag-meta';
                          return (
                            <p className="text-[13px] text-slate-600 leading-relaxed mt-2">
                              <span>{selectedJob.location}</span>
                              <span className="mx-1.5">·</span>
                              <span className={`inline align-middle ${wbadge}`}>{wlab}</span>
                              <br />
                              <span className="text-slate-600">Posted: {selectedJob.daysAgo || getDaysAgo(selectedJob.postedDate)}</span>
                              <span className="mx-1.5">·</span>
                              <span>Exp: {safeTrim(selectedJob.experienceLevel) || '—'}</span>
                            </p>
                          );
                        })()}
                      </div>
                      <div className="relative flex w-[158px] shrink-0 flex-col gap-1.5 justify-center overflow-visible">
                        <div className="relative w-full overflow-visible">
                          <button
                            type="button"
                            onClick={() => handleTrackJob(selectedJob)}
                            className={`absolute top-1/2 right-full z-10 mr-2 flex h-[38px] w-[38px] -translate-y-1/2 items-center justify-center rounded-md border border-slate-200 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 ${
                              isJobTracked(selectedJob)
                                ? 'bg-slate-100 text-slate-900'
                                : 'bg-white text-slate-600'
                            }`}
                            title={isJobTracked(selectedJob) ? 'Untrack this job' : 'Track this job'}
                            aria-label={isJobTracked(selectedJob) ? 'Untrack this job' : 'Track this job'}
                          >
                            <Bookmark
                              size={15}
                              className={isJobTracked(selectedJob) ? 'fill-current' : undefined}
                              aria-hidden
                            />
                          </button>
                          <a
                            href={selectedJob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center rounded-lg bg-emerald-500 px-2.5 py-1.5 text-center text-[12.5px] font-medium leading-snug text-white transition-colors hover:bg-emerald-600"
                          >
                            Apply now
                          </a>
                        </div>
                        <Link
                          to="/dashboard/ai-cover-letter"
                          className="w-full text-center rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12.5px] leading-snug text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          Write cover letter ↗
                        </Link>
                        <Link
                          to="/dashboard/application-tailor"
                          className="w-full text-center rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12.5px] leading-snug text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          Tailor resume ↗
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 custom-scrollbar workspace-scrollbar bg-white min-h-0">
                  {/* SkillHoop Role Match Analysis: ATS Match | Hire Probability | Market Value + Strategy */}
                  {(() => {
                    const profile = convertToResumeProfile(resumeData);
                    const localResult = profile
                      ? calculateLocalBaseMatch(
                          {
                            skills: profile.skills,
                            experience: profile.experience,
                            personalInfo: {
                              jobTitle: resumeData?.personalInfo?.jobTitle ?? resumeData?.personalInfo?.title,
                              location: resumeData?.personalInfo?.location,
                            },
                            summary: resumeData?.summary,
                          },
                          { title: selectedJob.title, requirements: selectedJob.requirements, location: selectedJob.location },
                          { willingToRelocate }
                        )
                      : { score: 0, matchReason: 'Add resume to see match' };
                    const localScore = localResult.score;
                    const localProfile = resumeData
                      ? {
                          skills: [...(resumeData.skills?.technical || []), ...(resumeData.skills?.soft || [])],
                          experience: (resumeData.experience || []).map((e: { position?: string; company?: string; description?: string }) => ({
                            title: e.position || 'Unknown',
                            company: e.company || 'Unknown',
                            duration: 'Not specified',
                            description: e.description || '',
                          })),
                          personalInfo: {
                            jobTitle: resumeData.personalInfo?.jobTitle ?? resumeData.personalInfo?.title ?? resumeData.experience?.[0]?.position,
                            location: resumeData.personalInfo?.location,
                          },
                          summary: resumeData.summary,
                        }
                      : null;
                    const marketValue = localProfile
                      ? getMarketValueEstimate(
                          {
                            title: selectedJob.title,
                            location: selectedJob.location,
                            salaryRange: selectedJob.salary,
                            job_min_salary: (selectedJob as { job_min_salary?: number | null }).job_min_salary,
                            job_max_salary: (selectedJob as { job_max_salary?: number | null }).job_max_salary,
                          },
                          localProfile
                        )
                      : { displayValue: 'Competitive', isCompetitive: true, showBlunderDisclaimer: false };
                    const hireProbability = (selectedJob as { hireProbability?: number }).hireProbability ?? localScore;
                    const yearsOfExperience = profile?.yearsOfExperience ?? 0;
                    const reasons = selectedJob.reasons ?? [];
                    const isGrowthAreaReason = (r: string) =>
                      isExceedsExperienceReason(r) || isMissingSkillReason(r) || isUnderExperienceReason(r);
                    const topMatchReasonsFromAi = reasons.filter((r) => !isGrowthAreaReason(r));
                    const matchNarrative = buildEvidenceBullets(resumeData, profile, selectedJob, {
                      recentlyUsedBullets: recentPoint4BulletsRef.current,
                      selectedSearchStrategy,
                      willingToRelocate,
                    });
                    if (matchNarrative?.point4RawBullet) {
                      recentPoint4BulletsRef.current = [
                        ...recentPoint4BulletsRef.current.filter((b) => b !== matchNarrative!.point4RawBullet),
                        matchNarrative.point4RawBullet,
                      ].slice(-3);
                    }
                    const matchScore = Math.round(selectedJob.matchScore ?? localScore);
                    const reasonsForUI = matchNarrative
                      ? [matchNarrative.background, matchNarrative.responsibilities, matchNarrative.contributions, matchNarrative.resultOriented, matchNarrative.relocateBullet].filter(Boolean) as string[]
                      : topMatchReasonsFromAi;
                    const jobText = `${selectedJob.title} ${selectedJob.requirements || ''}`.toLowerCase();
                    const allSkills = [...(resumeData?.skills?.technical || []), ...(resumeData?.skills?.soft || [])];
                    const skillsWithMatch = allSkills.length > 0
                      ? allSkills.map((name) => ({ name, matched: jobText.includes(name.toLowerCase()) }))
                      : [{ name: 'Experience', matched: true }, { name: 'Communication', matched: true }, { name: 'Problem solving', matched: true }];
                    const tagsFromReasons = (selectedJob.reasons ?? []).slice(0, 6);
                    const tags = tagsFromReasons.length > 0 ? tagsFromReasons : (selectedJob.requirements || '').split(/[,;.]/).map((s) => s.trim()).filter(Boolean).slice(0, 5);
                    const skillPills = buildWorkspaceDetailSkillPills(selectedJob, tags, skillsWithMatch);
                    const skillPillsDisplay =
                      skillPills.length > 0 ? skillPills : ['See job description for skill requirements'];
                    const salaryRaw = (selectedJob.salary || '').trim();
                    const salaryDisclosed =
                      /\d/.test(salaryRaw) &&
                      !/not\s*listed|undisclosed|^n\/a$/i.test(salaryRaw);
                    const roleAvgYears = parseRequiredYearsFromRequirements(selectedJob.requirements) ?? 4;
                    const primaryMatchBlurb =
                      (selectedJob.whyMatch?.trim()) ||
                      reasonsForUI[0] ||
                      'Your profile aligns with this role.';
                    const sjType = (selectedJob.type || '').toLowerCase();
                    const sjRemote = sjType.includes('remote');
                    const sjHybrid = sjType.includes('hybrid');
                    const workTypeCell = sjRemote ? 'Remote' : sjHybrid ? 'Hybrid' : safeTrim(selectedJob.type) || '—';
                    return (
                      <>
                        <WorkspaceJobBoardMatchCards
                          key={selectedJob.id}
                          atsScore={matchScore}
                          hireProbability={Math.round(Number(hireProbability) || 0)}
                          salaryRangeLabel={salaryRaw || marketValue.displayValue}
                          foundKeywordTags={tags}
                          missingSkillNames={skillsWithMatch.filter((s) => !s.matched).map((s) => s.name)}
                          userYearsExperience={yearsOfExperience}
                          roleAvgYears={roleAvgYears}
                          salaryDisclosed={salaryDisclosed}
                          marketEstimateRange={marketValue.displayValue}
                        />

                        <h2 className="text-[13px] font-medium text-slate-900 mt-1">Why this matches your profile</h2>
                        <div className="rounded-lg border border-[#9FE1CB] bg-[#E1F5EE] px-3.5 py-2.5 text-[13px] text-[#085041] leading-relaxed">
                          {primaryMatchBlurb}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Experience</div>
                            <div className="text-xs font-medium text-slate-900 mt-0.5">{safeTrim(selectedJob.experienceLevel) || '—'}</div>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Salary</div>
                            <div className="text-xs font-medium text-slate-900 mt-0.5">{salaryRaw || '—'}</div>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Work type</div>
                            <div className="text-xs font-medium text-slate-900 mt-0.5 capitalize">{workTypeCell}</div>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Source</div>
                            <div className="text-xs font-medium text-slate-900 mt-0.5 truncate" title={selectedJob.source}>{selectedJob.source}</div>
                          </div>
                        </div>

                        <WorkspaceJobDetailSections
                          job={selectedJob}
                          isLoadingDetails={jobDetailsLoadingJobId === selectedJob.id}
                        />

                        <h2 className="text-[13px] font-medium text-slate-900 mt-3.5 mb-2">Skills</h2>
                        <div className="flex flex-wrap gap-1.5 pb-6">
                          {skillPillsDisplay.map((t, i) => (
                            <span key={`${t}-${i}`} className="skill-pill">
                              {t}
                            </span>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 min-h-[120px] md:min-h-0 items-center justify-center bg-white text-slate-600 md:border-l border-slate-200">
                <p className="text-sm font-medium text-slate-500">Select a job to view details</p>
              </div>
            )}
          </div>
        </main>
        </div>
        <style>{`
          .custom-scrollbar::-webkit-scrollbar, .workspace-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track, .workspace-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
          .workspace-scrollbar::-webkit-scrollbar-thumb { background: rgb(148 163 184 / 0.9); border-radius: 3px; }
          .workspace-scrollbar::-webkit-scrollbar-thumb:hover { background: rgb(100 116 139 / 0.95); }
          .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
          @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // --- Default view: Personalized Jobs + History tabs (no Quick Search) ---
  return (
    <div className="space-y-6 bg-[#f8fafc] min-h-screen rounded-2xl">
      {/* First-Time Entry Card */}
      <FirstTimeEntryCard
        featurePath="/dashboard/job-finder"
        featureName="Job Finder"
      />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`} style={{ animation: 'slideIn 0.3s ease-out' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : 'ℹ️'}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Workflow Breadcrumb - Workflow 3 */}
      {workflowContext?.workflowId === 'personal-brand-job-discovery' && (
        <WorkflowBreadcrumb
          workflowId="personal-brand-job-discovery"
          currentFeaturePath="/dashboard/job-finder"
        />
      )}

      {/* Workflow Breadcrumb - Workflow 7 */}
      {workflowContext?.workflowId === 'market-intelligence-career-strategy' && (
        <WorkflowBreadcrumb
          workflowId="market-intelligence-career-strategy"
          currentFeaturePath="/dashboard/job-finder"
        />
      )}

      {/* Workflow Prompt - Workflow 1 */}
      {showWorkflowPrompt && workflowContext?.workflowId === 'job-application-pipeline' && (
        <WorkflowPrompt
          workflowId="job-application-pipeline"
          currentFeaturePath="/dashboard/job-finder"
          message="🎉 Job Saved to Tracker! You're making great progress in your Job Application Pipeline workflow."
          actionText="Tailor Resume"
          actionUrl="/dashboard/application-tailor"
          onDismiss={() => setShowWorkflowPrompt(false)}
          onAction={(action) => {
            if (action === 'continue') {
              const context = WorkflowTracking.getWorkflowContext();
              if (workflowContext?.currentJob) {
                updateContext({
                  workflowId: 'job-application-pipeline',
                  currentJob: workflowContext.currentJob,
                  action: 'tailor-resume'
                });
              }
            }
          }}
        />
      )}

      {/* Workflow Breadcrumb - Workflow 1 */}
      {workflowContext?.workflowId === 'job-application-pipeline' && (
        <WorkflowBreadcrumb
          workflowId="job-application-pipeline"
          currentFeaturePath="/dashboard/job-finder"
        />
      )}

      {/* Workflow Quick Actions - Workflow 1 */}
      {workflowContext?.workflowId === 'job-application-pipeline' && (
        <WorkflowQuickActions
          workflowId="job-application-pipeline"
          currentFeaturePath="/dashboard/job-finder"
        />
      )}

      {/* Workflow Transition - Workflow 1 (after job saved) */}
      {workflowContext?.workflowId === 'job-application-pipeline' && trackedJobIds.size > 0 && (
        <WorkflowTransition
          workflowId="job-application-pipeline"
          currentFeaturePath="/dashboard/job-finder"
          compact={true}
        />
      )}

      {/* Workflow Completion - Workflow 3 */}
      {workflowContext?.workflowId === 'personal-brand-job-discovery' && (() => {
        const workflow = WorkflowTracking.getWorkflow('personal-brand-job-discovery');
        return workflow?.completedAt ? (
          <WorkflowCompletion
            workflowId="personal-brand-job-discovery"
            onDismiss={() => {}}
          />
        ) : null;
      })()}

      {/* Resume data debug modal (temporary — verify parsed CV) */}
      {showResumeDataDebug && resumeData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Resume data debug">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowResumeDataDebug(false)} />
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Resume data (selected CV)</h2>
              <button
                type="button"
                onClick={() => setShowResumeDataDebug(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="p-4 overflow-auto text-left text-sm text-gray-800 bg-gray-50 flex-1 rounded-b-xl font-mono whitespace-pre-wrap break-words">
              {JSON.stringify(resumeData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Search bar + filters — hidden on 2nd page (Your Resumes + Customize Your Job Search) */}
      <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />
      {!(activeTab === 'resumes' && Object.keys(uploadedResumes).length > 0 && showResumeDashboard) && (
        <JobSearchBar
          jobTitle={quickSearchJobTitle}
          onJobTitleChange={(v) => { setQuickSearchJobTitle(v); setManualJobTitle(v); }}
          location={locationToDisplayString(quickSearchLocation ?? '')}
          onLocationChange={(v) => handleLocationChange(v)}
          onSearch={() => handlePersonalizedSearch()}
          isSearching={isSearchingPersonalized || isResolvingLocation}
          filters={searchBarFilters}
          onFilterChange={handleSearchBarFilterChange}
          onHistoryClick={() => navigate('/work-history-manager?tab=jobs-history')}
          onAllFiltersClick={() => setShowFilters(true)}
        />
      )}

      {/* Main content: upload resume + customize search + Find Personalized Jobs, or History */}
      {activeTab === 'resumes' && (
        <div className="space-y-6">
          {/* Central content card — upload screen (shown when no resumes, or when cross clicked from dashboard) */}
          {(Object.keys(uploadedResumes).length === 0 || !showResumeDashboard) && (
            <>
              <section className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 p-8 md:py-20 flex flex-col items-center text-center">
                <div className="mb-6 p-4 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                  <Upload size={48} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Upload Your Resume</h1>
                <p className="text-gray-500 max-w-md mx-auto mb-8">Upload your CV/resume and get AI-powered job recommendations tailored to your skills.</p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-lg">
                  <label className="cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto">
                    <input
                      id="resume-upload-input"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={isUploadingResume}
                    />
                    <span
                      className={`inline-flex items-center justify-center gap-2 py-3 px-8 rounded-lg font-medium transition-all w-full sm:w-auto ${
                        isUploadingResume
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#111827] hover:bg-[#1f2937] text-white shadow-lg hover:-translate-y-0.5'
                      }`}
                    >
                      {isUploadingResume ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload Resume
                        </>
                      )}
                    </span>
                  </label>
                  <label
                    htmlFor="resume-upload-input"
                    className={`inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 font-medium py-3 px-8 rounded-lg shadow-sm transition-all hover:bg-gray-100 hover:-translate-y-0.5 w-full sm:w-auto cursor-pointer ${
                      isUploadingResume ? 'pointer-events-none opacity-60' : ''
                    }`}
                  >
                    <FolderOpen size={18} />
                    Select Your Resume
                  </label>
                </div>
                <p className="mt-6 text-xs font-semibold text-slate-600/80 uppercase tracking-wide">SUPPORTS PDF, DOCX, AND TXT</p>
                {Object.keys(uploadedResumes).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowResumeDashboard(true)}
                    className="mt-4 text-sm font-medium text-[#111827] hover:text-[#1f2937] underline underline-offset-2"
                  >
                    View my resumes and customize search
                  </button>
                )}
              </section>
              {/* Feature cards — pastel backgrounds like dashboard stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 shadow-sm">
                  <Search className="text-blue-600 mb-4" size={24} />
                  <h3 className="font-bold text-gray-900">AI Search</h3>
                  <p className="text-sm text-gray-600">Tailored job listings searched across multiple boards.</p>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6 shadow-sm">
                  <Sparkles className="text-emerald-600 mb-4" size={24} />
                  <h3 className="font-bold text-gray-900">Smart Matching</h3>
                  <p className="text-sm text-gray-600">Matching against your resume for relevance and fit.</p>
                </div>
                <div className="bg-purple-50 rounded-xl border border-purple-100 p-6 shadow-sm">
                  <Target className="text-purple-600 mb-4" size={24} />
                  <h3 className="font-bold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Track jobs, tailor your resume, or apply with one click.</p>
                </div>
              </div>
            </>
          )}

          {/* JobSearchDashboard — replaces post-upload screen with polished dashboard */}
          {Object.keys(uploadedResumes).length > 0 && showResumeDashboard && (
            <JobSearchDashboard
              activeResume={activeResume}
              resumeData={resumeData}
              resumeSummary={buildDetailedResumeSummary(resumeData)}
              onFindJobs={handlePersonalizedSearch}
              isFindingJobs={isSearchingPersonalized || isResolvingLocation}
              onClose={() => setShowResumeDashboard(false)}
              findJobsStatus={
                isResolvingLocation
                  ? 'Finding jobs near you...'
                  : isSearchingPersonalized
                    ? (searchProgressMessage || 'AI is calculating your next career move...')
                    : 'Our AI will match your background with 10k+ available opportunities.'
              }
              findJobsBtnText={
                isResolvingLocation
                  ? 'Finding jobs near you...'
                  : isSearchingPersonalized
                    ? (searchProgressMessage || 'Analyzing matches...')
                    : 'Find Personalized Jobs'
              }
              resumeFilters={resumeFilters}
              onResumeFiltersChange={(updates) => setResumeFilters(prev => ({ ...prev, ...updates }))}
              selectedSearchStrategy={selectedSearchStrategy}
              onSearchStrategyChange={setSelectedSearchStrategy}
              onUploadNew={handleResumeUpload}
              isUploadingResume={isUploadingResume}
              showManualEntry={!!(resumeData && (!resumeData.experience?.[0]?.position || !(resumeData.skills?.technical?.length)))}
              manualJobTitle={manualJobTitle}
              manualTopSkills={manualTopSkills}
              onManualJobTitleChange={setManualJobTitle}
              onManualTopSkillsChange={setManualTopSkills}
              onApplyManualEntry={applyManualEntry}
            />
          )}

          {/* Broaden your horizon — shown below dashboard when no jobs found */}
          {Object.keys(uploadedResumes).length > 0 && showBroadenHorizon && (() => {
            const region = lastResolvedRegionRef.current;
            const broaderFromLast = safeTrim(lastUsedSearchLocationRef.current);
            const parts = broaderFromLast ? broaderFromLast.split(',').map(s => s.trim()).filter(Boolean) : [];
            let broaderLocation: string = region?.displayLocation ?? (parts.length > 2 ? parts.slice(-2).join(', ') : parts.length === 2 ? parts[1] : parts[0] ?? '') ?? broaderFromLast ?? '';
            broaderLocation = typeof broaderLocation === 'string' ? broaderLocation : '';
            if (broaderLocation === '[object Object]' || !broaderLocation.trim()) {
              const ip = ipRegionRef.current;
              broaderLocation = ip ? [ip.region, ip.countryName].filter(Boolean).join(', ') : 'your region';
            }
            if (!broaderLocation) return null;
            const searchInLabel = broaderLocation;
            return (
              <div className="mt-6 p-5 rounded-xl border border-amber-200 bg-amber-50/80">
                <p className="text-sm text-amber-900 mb-2">No jobs found for this title and location.</p>
                <p className="text-xs text-amber-800 mb-4">Try searching across the whole region for more options.</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowBroadenHorizon(false);
                    handlePersonalizedSearch(searchInLabel);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Broaden your horizon?
                </button>
                <span className="ml-2 text-xs text-amber-800">
                  (Search in {searchInLabel})
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {/* Location prompt modal — "Where should we look for jobs?" (Task 1 fallback) */}
      {showLocationPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Enter search location">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowLocationPrompt(false); setLocationPromptValue(''); pendingLocationResolveRef.current?.(''); pendingLocationResolveRef.current = null; }} />
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Where should we look for jobs?</h2>
            <p className="text-sm text-gray-500 mb-4">Enter a city, state, or country to search.</p>
            <input
              type="text"
              value={locationPromptValue}
              onChange={(e) => setLocationPromptValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocationPromptSubmit()}
              placeholder="e.g. Paris, Rome, Hyderabad"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowLocationPrompt(false); setLocationPromptValue(''); pendingLocationResolveRef.current?.(''); pendingLocationResolveRef.current = null; }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLocationPromptSubmit}
                disabled={!locationPromptValue.trim()}
                className="px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History tab — pastel empty state */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Search History</h3>
            <p className="text-slate-500 mb-8">Your past personalized searches will appear here.</p>
            <button
              onClick={() => setActiveTab('resumes')}
              className="px-8 py-3 bg-[#111827] text-white rounded-xl font-bold hover:bg-[#1f2937] transition-all shadow-lg active:scale-95"
            >
              Start New Search
            </button>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default JobFinder;
