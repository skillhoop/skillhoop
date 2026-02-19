/**
 * Smart Job Matcher — Single source of truth for Job Finder.
 * Uses ONLY real APIs: searchJobs (jobService) + predictiveJobMatching.
 * JobFinderModule.tsx is not used; dashboard renders this page.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, Briefcase, MapPin, DollarSign, Calendar, Building2, 
  ExternalLink, BookmarkPlus, Check, ChevronDown, X, Loader2, 
  Star, Clock, FileText, Upload, Sparkles, Target, TrendingUp, 
  AlertCircle, BarChart3, ArrowLeft, Plus, GraduationCap, Globe,
  SlidersHorizontal, Share2, MoreHorizontal, Layers, CheckCircle2, AlertTriangle,
  FolderOpen, Info, Crosshair
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
import { useNavigate } from 'react-router-dom';
import FirstTimeEntryCard from '../components/workflows/FirstTimeEntryCard';
import WorkflowBreadcrumb from '../components/workflows/WorkflowBreadcrumb';
import WorkflowPrompt from '../components/workflows/WorkflowPrompt';
import WorkflowCompletion from '../components/workflows/WorkflowCompletion';
import WorkflowTransition from '../components/workflows/WorkflowTransition';
import WorkflowQuickActions from '../components/workflows/WorkflowQuickActions';
import type { Job as JSearchJob } from '../types/job';
import { searchJobs } from '../lib/services/jobService';
import { supabase } from '../lib/supabase';
import { apiFetch } from '../lib/networkErrorHandler';
import { calculateLocalBaseMatch, getBestMatchingAchievement } from '../lib/probabilityEngine';

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

/** Map known tool/skill families for "similar to X" strategy suggestions. */
const SIMILAR_SKILL_BRIDGES: Record<string, string> = {
  sap: 'ERPs like Oracle or NetSuite',
  oracle: 'ERPs like SAP or NetSuite',
  netsuite: 'ERPs like SAP or Oracle',
  excel: 'spreadsheet and data tools',
  'pivot table': 'Excel and reporting tools',
  tableau: 'BI tools like Power BI or Looker',
  'power bi': 'BI tools like Tableau or Looker',
  salesforce: 'CRMs like HubSpot or Dynamics',
  hubspot: 'CRMs like Salesforce or Dynamics',
};

/**
 * Convert a "gap" reason into an Interview Strategy sentence (coaching tone).
 * Uses resume/job context for company name and tenure so strategies feel specific.
 */
function gapToInterviewStrategy(
  reason: string,
  resumeData: ResumeData | null,
  _profile: ResumeProfile | null,
  job: Job
): string {
  const r = reason.trim();
  const currentCompany = resumeData?.experience?.[0]?.company || 'your recent role';
  const requiredYears = parseRequiredYearsFromRequirements(job.requirements);

  // Missing skill: e.g. "Missing: SAP", "Lack of SAP experience"
  if (isMissingSkillReason(r)) {
    const skillMatch = r.match(/\bmissing\s*[:\s]*([^.(),]+?)(?:\s+experience|\.|$)/i)
      || r.match(/\b(lack|without)\s+of\s+([^.(),]+?)(?:\s+experience|\.|$)/i)
      || r.match(/\b(skill|qualification)s?\s+(?:missing|gap|lack)\s*[:\s]*([^.]+?)(?:\.|$)/i);
    const skillName = (skillMatch?.[1] ?? skillMatch?.[2] ?? '').trim() || 'this requirement';
    const skillLower = skillName.toLowerCase();
    const similar = SIMILAR_SKILL_BRIDGES[skillLower] || 'similar tools or systems';
    return `Highlight your quick learning curve with ${similar} to bridge the ${skillName} requirement.`;
  }

  // Under required experience / tenure
  if (isUnderExperienceReason(r)) {
    const yearsPhrase = requiredYears != null ? `${requiredYears}-year` : 'their';
    return `Emphasize your recent results at ${currentCompany} to address the ${yearsPhrase} tenure preference.`;
  }

  // Exceeds required (overqualified)
  if (isExceedsExperienceReason(r)) {
    return `Position your seniority as an asset for mentoring and leading initiatives.`;
  }

  // Fallback: turn negative phrasing into a soft strategy
  if (/\b(below|under|missing|lack)\b/i.test(r)) {
    return `Use your strengths at ${currentCompany} to show how you can deliver value despite this preference.`;
  }
  return r;
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
      <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col border-l border-indigo-100 animate-slide-in-right">
        <div className="flex items-center justify-between p-5 border-b border-indigo-100 shrink-0 bg-indigo-50/30">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="text-indigo-600 w-6 h-6" />
            All Filters
          </h2>
          <button type="button" onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Salary Range</h3>
              <span className="text-sm font-medium text-indigo-600">$80k - $220k+</span>
            </div>
            <div className="relative h-2 bg-indigo-100 rounded-full">
              <div className="absolute left-[20%] right-[10%] h-full bg-indigo-500 rounded-full" />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>$0k</span>
                <span>$300k+</span>
              </div>
            </div>
          </div>
          <div className="h-px bg-indigo-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Date Posted
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['Any time', 'Past 24 hours', 'Past week', 'Past month'].map((time) => (
                <button key={time} type="button" className="py-2 px-3 rounded-lg text-sm font-medium border transition-all bg-indigo-50/50 border-indigo-200 text-gray-700 hover:bg-indigo-100 hover:border-indigo-300 hover:text-indigo-800">
                  {time}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px bg-indigo-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Experience Level</h3>
            <div className="space-y-2">
              {['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'].map((level) => (
                <label key={level} className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                  <span className="text-gray-700 group-hover:text-gray-900">{level}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="h-px bg-indigo-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Job Type</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input defaultChecked className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                <span className="text-gray-700 group-hover:text-gray-900">Full-time</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                <span className="text-gray-700 group-hover:text-gray-900">Contract</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                <span className="text-gray-700 group-hover:text-gray-900">Part-time</span>
              </label>
            </div>
          </div>
          <div className="h-px bg-indigo-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Education
            </h3>
            <div className="space-y-2">
              {["Bachelor's Degree", "Master's Degree", "Doctorate", "High School or equivalent"].map((edu) => (
                <label key={edu} className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                  <span className="text-gray-700 group-hover:text-gray-900">{edu}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="h-px bg-indigo-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              Industry
            </h3>
            <div className="space-y-2">
              {['Technology', 'Financial Services', 'Healthcare', 'E-commerce', 'Entertainment'].map((ind) => (
                <label key={ind} className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                  <span className="text-gray-700 group-hover:text-gray-900">{ind}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-indigo-100 bg-indigo-50/30 shrink-0 flex items-center gap-4">
          <button type="button" onClick={onClose} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Reset all</button>
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

/**
 * Sanitize location for JSearch query: strip text after hyphen, remove digits.
 * Broaden to metro: Secundrabad/Secunderabad/Lalpet -> Hyderabad for better JSearch results.
 */
function sanitizeLocationForQuery(loc: unknown): string {
  const s = safeTrim(loc);
  if (!s) return '';
  let out = s;
  const hyphenIdx = out.indexOf(' - ');
  if (hyphenIdx !== -1) out = out.slice(0, hyphenIdx).trim();
  const hyphenIdx2 = out.indexOf('-');
  if (hyphenIdx2 !== -1) out = out.slice(0, hyphenIdx2).trim();
  out = out.replace(/\d+/g, '').trim();
  out = out.replace(/\s+/g, ' ').trim();
  const lower = out.toLowerCase();
  if (lower === 'secundrabad' || lower === 'secunderabad' || lower === 'lalpet') return 'Hyderabad';
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
 * Sanitize job title for JSearch query: strip special chars (/ - etc.), take first two words.
 * e.g. "Accounts Receivable / Collector" -> "Accounts Receivable"
 */
function sanitizeTitleForQuery(title: unknown): string {
  const t = safeTrim(title);
  if (!t) return '';
  const stripped = t.replace(/[/\-–—,|&]+/g, ' ').replace(/\s+/g, ' ').trim();
  const words = stripped.split(/\s+/).filter(Boolean);
  return words.slice(0, 2).join(' ');
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

/** Convert JSearch job (jobService) to display Job for UI/tracking */
function jsearchToJob(j: JSearchJob): Job {
  const salaryStr =
    j.job_min_salary != null && j.job_max_salary != null
      ? `$${Math.round(j.job_min_salary / 1000)}k - $${Math.round(j.job_max_salary / 1000)}k`
      : 'Competitive';
  return {
    id: j.job_id,
    title: j.job_title,
    company: j.employer_name,
    location: formatJSearchLocation(j),
    salary: salaryStr,
    type: 'Full-time',
    description: j.job_description || j.job_highlights?.Qualifications?.join(' ') || '',
    requirements: j.job_highlights?.Responsibilities?.join(' ') || j.job_highlights?.Qualifications?.join(' ') || '',
    postedDate: j.job_posted_at_datetime_utc?.split('T')[0] ?? '',
    url: j.job_apply_link,
    source: 'JSearch',
    matchScore: 0,
  };
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

  // Tab state (Quick Search removed — only Personalized Jobs + History)
  const [activeTab, setActiveTab] = useState<'resumes' | 'history'>('resumes');

  // Workflow state
  const { workflowContext, updateContext } = useWorkflowContext();
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);

  // Workspace view (split pane) state
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [selectedWorkspaceJobId, setSelectedWorkspaceJobId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showScoreBreakdownTooltip, setShowScoreBreakdownTooltip] = useState(false);

  // Search bar state (used in workspace header; optional initial from props)
  const [quickSearchJobTitle, setQuickSearchJobTitle] = useState(initialSearchTerm ?? '');
  const [quickSearchLocation, setQuickSearchLocation] = useState('');
  const [jobResults, setJobResults] = useState<Job[]>([]);
  // Elastic location: IP-detected (silent default; no browser permission). Used when user hasn't set location.
  const [ipDetectedCity, setIpDetectedCity] = useState<string>('');
  const ipRegionRef = useRef<{ region: string; countryName: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
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
  const recentPoint4BulletsRef = useRef<string[]>([]); // Last 3 bullets used for Point 4 (diversity penalty)
  const [selectedSearchStrategy, setSelectedSearchStrategy] = useState<string | null>(null);
  
  // Resume state
  const [uploadedResumes, setUploadedResumes] = useState<Record<string, ResumeData>>({});
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
  const [showResumeDataDebug, setShowResumeDataDebug] = useState(false);

  // Resume filters state
  const [resumeFilters, setResumeFilters] = useState<ResumeFilters>({
    workType: 'Full-time',
    remote: 'Any',
    experienceLevel: 'Any level',
    minSalary: 'Any',
    location: ''
  });
  
  // Tracking state
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Predictive matching state
  const [predictiveRecommendations, setPredictiveRecommendations] = useState<JobRecommendation[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [searchProgressMessage, setSearchProgressMessage] = useState<string | null>(null);
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [userCredits, setUserCredits] = useState<number>(0);

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

  // Fetch user AI credits (for probability card CTA gating)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('daily_limit')
          .eq('id', user.id)
          .maybeSingle();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: usedToday } = await supabase
          .from('ai_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString());
        if (cancelled) return;
        const limit = profile?.daily_limit ?? 0;
        setUserCredits(Math.max(0, limit - (usedToday ?? 0)));
      } catch {
        if (!cancelled) setUserCredits(0);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

  // Locate Me: only on click (GDPR — browser permission popup only when user requests). Reverse-geocode to City, Country (Intl).
  const handleLocateMe = useCallback(() => {
    if (!navigator?.geolocation) {
      showNotification('Geolocation is not supported by your browser.', 'info');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const rev = await reverseGeocodeToCityCountry(latitude, longitude);
          const display = rev.displayLocation || 'Unknown';
          setQuickSearchLocation(display);
          setResumeFilters(prev => ({ ...prev, location: display }));
          showNotification(`Location set to ${display}`, 'success');
        } catch {
          showNotification('Could not resolve location name. Try entering it manually.', 'error');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        showNotification('Location access denied or unavailable.', 'error');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [showNotification]);

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
    const manual = safeTrim(quickSearchLocation || resumeFilters.location || resumeData?.personalInfo?.location);
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
  const convertToResumeProfile = (data: ResumeData | null): ResumeProfile | null => {
    if (!data) return null;
    const manualSkillsList = safeTrim(manualTopSkills)
      ? manualTopSkills.split(',').map(s => safeTrim(s)).filter(Boolean)
      : [];
    const skillsFromData = data.skills?.technical || [];
    const manualTitle = safeTrim(manualJobTitle);
    const experienceList = data.experience?.length
      ? (data.experience || []).map((exp, i) => ({
          title: (i === 0 && !exp.position && manualTitle) ? manualTitle : (exp.position || 'Unknown'),
          company: exp.company || 'Unknown',
          duration: exp.duration || 'Not specified',
          description: exp.description || ''
        }))
      : (manualTitle ? [{
          title: manualTitle,
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
      resolvedLocationOverride ?? quickSearchLocation ?? resumeFilters.location ??
      resumeData?.personalInfo?.location ??
      ipDetectedCity ??
      ''
    );
    const location = sanitizeLocationForQuery(rawLocation);

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

    setIsSearchingPersonalized(true);

    const jobUrlMap = new Map<string, string>();
    apiLimitToastShownRef.current = false;

    const searchWithLimitHandling = async (q: string): Promise<JSearchJob[]> => {
      try {
        return await searchJobs(q);
      } catch (e: unknown) {
        const err = e as { message?: string; code?: string };
        if (err?.message === 'API_LIMIT' || err?.code === 'API_LIMIT') {
          if (!apiLimitToastShownRef.current) {
            apiLimitToastShownRef.current = true;
            showNotification('API Limit Reached - Using cached results', 'info');
          }
          return [];
        }
        throw e;
      }
    };

    try {
      let resolvedLocation: string;
      const userTypedLocation = safeTrim(quickSearchLocation);
      if (willingToRelocate) {
        // Country-wide relocation: detect country of user's CURRENT physical location (GPS then IP), then search "[Title] in [Country]".
        setIsResolvingLocation(true);
        try {
          if (navigator?.geolocation) {
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
        // Geographic priority: 1) GPS/IP (physical location), 2) Manual (search bar), 3) CV Fallback = Rome, Italy only.
        setIsResolvingLocation(true);
        let gpsCity: string | null = null;
        let gpsRegion: { state: string; countryName: string; displayLocation: string } | null = null;
        try {
          if (navigator?.geolocation) {
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
          // Strict priority: 1) GPS city, 2) IP-detected city, 3) User-typed location, 4) Rome, Italy only
          resolvedLocation = (gpsCity || ipDetectedCity || userTypedLocation || 'Rome, Italy').trim();
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
      // Ensure locForQuery is always a STRING (fix [object Object] bug)
      const rawLocForQuery = willingToRelocate ? resolvedLocation : (resolvedLocation || safeTrim(quickSearchLocation || resumeFilters.location || resumeData.personalInfo?.location || ipDetectedCity || ''));
      const locForQuery: string = typeof rawLocForQuery === 'string' ? rawLocForQuery : (rawLocForQuery && typeof rawLocForQuery === 'object' && 'city' in rawLocForQuery ? String((rawLocForQuery as { city: string }).city) : safeTrim(String(rawLocForQuery)) || ipDetectedCity || '');
      const locStr = locForQuery;
      lastUsedSearchLocationRef.current = locStr;

      // Build JSearch query from strategy. When willingToRelocate, use home country so query is "[Job Title]" in [Country]; if country unknown, pass '' for title-only.
      const locationForStrategy = willingToRelocate ? (resolvedLocation || '') : (resolvedLocation || undefined);
      const { query: strategicQuery, searchGoal } = buildStrategicQuery(locationForStrategy);
      let query = strategicQuery && strategicQuery.length >= 2 ? strategicQuery : getStrictJSearchQuery(extractedTitle, locForQuery);
      if (!query || query.length < 2) {
        const skills = resumeData?.skills?.technical || [];
        const fallbackTitle = extractedTitle || (skills[0] ? skills[0].split(/\s+/).slice(0, 2).join(' ') : '') || 'professional';
        const fallbackLoc = locForQuery || ipDetectedCity || (ipRegionRef.current?.countryName ?? '');
        query = getStrictJSearchQuery(fallbackTitle, fallbackLoc);
      }
      console.log('JSearch Final Query (strict):', query);

      setIsGeneratingRecommendations(true);

      // Step 1: Primary search (title + location; when willingToRelocate = title + home country)
      let jsearchJobs = await searchWithLimitHandling(query);

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
            jsearchJobs = await searchWithLimitHandling(remoteInCountryQuery);
          }
        }
        // Retry 1b: Same Title + Remote (global remote)
        if (jsearchJobs.length === 0 && extractedTitle) {
          const remoteQuery = getStrictJSearchQuery(extractedTitle, 'Remote');
          if (remoteQuery) {
            console.log('JSearch retry 1b (Relocate: Title + Remote):', remoteQuery);
            jsearchJobs = await searchWithLimitHandling(remoteQuery);
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
              jsearchJobs = await searchWithLimitHandling(retry5Query);
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
              jsearchJobs = await searchWithLimitHandling(retry6Query);
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
            jsearchJobs = await searchWithLimitHandling(remoteQuery);
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
              jsearchJobs = await searchWithLimitHandling(retry3Query);
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
              jsearchJobs = await searchWithLimitHandling(retry4Query);
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
                jsearchJobs = await searchWithLimitHandling(retry5Query);
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
                jsearchJobs = await searchWithLimitHandling(retry6Query);
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
            jsearchJobs = await searchWithLimitHandling(skillPhrases);
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
      // Country-wide safety net: when search was broadened to state or country (Retry 3/4) or fuzzy (Retry 6), allow any job in user's home country; job_title stays flexible.
      if (!willingToRelocate && locStr) {
        const searchedCity = locStr.split(',')[0].trim().toLowerCase();
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

      // Convert JSearch jobs to JobListing for AI
      const jobListings = jsearchJobs.map(job => {
        jobUrlMap.set(job.job_id, job.job_apply_link);
        return {
          id: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location: formatJSearchLocation(job),
          description: job.job_description || job.job_highlights?.Qualifications?.join(' ') || '',
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

      const topForAi = jobListings.slice(0, 15);
      if (topForAi.length === 0) {
        setSearchProgressMessage(null);
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('No jobs to rank. Try a different search.', 'info');
        return;
      }

      let recommendations: JobRecommendation[];
      try {
        recommendations = await getJobRecommendations(profile, topForAi, 15, searchGoal);
      } catch (aiError) {
        console.error('[JobFinder] getJobRecommendations failed:', aiError);
        const fallbackJobs: Job[] = jsearchJobs.slice(0, 15).map(j => {
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
        setPersonalizedJobResults(fallbackJobs);
        setPredictiveRecommendations([]);
        if (fallbackJobs.length > 0) {
          setSelectedWorkspaceJobId(fallbackJobs[0].id);
          setShowWorkspace(true);
        }
        setSearchProgressMessage(null);
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('AI ranking failed. Showing job list without scores.', 'info');
        return;
      }

      setPredictiveRecommendations(recommendations);

      const enhancedResults: Job[] = recommendations.map(rec => {
        const company = rec.job.company || 'Unknown';
        return {
          ...rec.job,
          id: rec.job.id,
          title: rec.job.title,
          company,
          location: rec.job.location,
          salary: rec.job.salaryRange || 'Competitive',
          type: 'Full-time',
          description: rec.job.description ?? '',
          requirements: rec.job.requirements ?? '',
          postedDate: rec.job.postedDate ?? '',
          url: jobUrlMap.get(rec.job.id) || '#',
          source: rec.job.source ?? 'JSearch',
          matchScore: rec.matchScore,
          whyMatch: rec.whyMatch ?? (Array.isArray(rec.reasons) ? rec.reasons.join(' | ') : ''),
          reasons: rec.reasons ?? [],
          logoInitial: company.substring(0, 1),
          logoColor: getLogoColor(company),
          daysAgo: getDaysAgo(rec.job.postedDate),
          experienceLevel: resumeFilters.experienceLevel !== 'Any level' ? resumeFilters.experienceLevel : undefined
        };
      });

      setPersonalizedJobResults(enhancedResults);
      if (enhancedResults.length > 0) {
        setSelectedWorkspaceJobId(enhancedResults[0].id);
        setShowWorkspace(true);
      }
      setSearchProgressMessage(null);
      setIsSearchingPersonalized(false);
      setIsGeneratingRecommendations(false);
      showNotification('Found personalized job matches!', 'success');
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
      const base64 = await fileToBase64(file);
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) {
        showNotification('Please sign in to upload and parse your resume.', 'error');
        return;
      }

      const apiUrl = typeof window !== 'undefined' && window.location?.hostname === 'localhost'
        ? 'http://localhost:3000/api/generate'
        : '/api/generate';

      const payload = {
        fileData: base64,
        fileName: file.name,
        mimeType: file.type,
        userId,
        feature_name: 'job_finder',
      };

      const data = await apiFetch<{ content: string }>(apiUrl, {
        method: 'POST',
        body: payload,
        timeout: 90000,
        retries: 2,
      });

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
      localStorage.setItem('active_resume_for_job_search', file.name);

      showNotification('Resume uploaded and analyzed successfully!', 'success');
    } catch (error) {
      console.warn('Resume upload/parse error:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to upload or parse resume. Please try again.',
        'error'
      );
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

  // Track job
  const handleTrackJob = (job: Job) => {
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

  // Check if tracked
  const isJobTracked = (job: Job): boolean => trackedJobIds.has(job.url);

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
              <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-200 transition-all flex items-center gap-1">
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
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-1"
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
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-1 inline-flex"
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

  const selectedJob = personalizedJobResults.find(j => j.id === selectedWorkspaceJobId);

  // --- Workspace View (split pane) when user has run personalized search ---
  if (showWorkspace) {
    return (
      <div className="flex flex-col h-[calc(100vh-3rem)] overflow-hidden text-gray-900 font-sans transition-colors duration-200 bg-indigo-50/30">
        <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />
        {/* Search bar + filters — pastel border */}
        <div className="shrink-0 p-4 pb-0">
          <div className="w-full bg-white border border-indigo-100 shadow-sm rounded-xl p-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <button onClick={() => setShowWorkspace(false)} className="self-start p-2 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors" aria-label="Back">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-1 w-full gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                    placeholder="Search by title, skill, or company"
                    type="text"
                    value={quickSearchJobTitle}
                    onChange={(e) => setQuickSearchJobTitle(e.target.value)}
                  />
                </div>
                <div className="relative flex-1 min-w-0 hidden sm:block">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                    placeholder="City, state, or zip code"
                    type="text"
                    value={quickSearchLocation || resumeFilters.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    title="Use my current location"
                    aria-label="Use my current location"
                  >
                    {isLocating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Crosshair className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <label
                  className="hidden sm:flex items-center gap-2 shrink-0 cursor-pointer select-none py-2.5 px-3 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50/50 transition-colors"
                  title={getHomeCountry() ? `Show high-match roles across ${getHomeCountry()}` : 'Show high-match roles across your country (detected from location or resume)'}
                >
                  <input
                    type="checkbox"
                    checked={willingToRelocate}
                    onChange={(e) => setWillingToRelocate(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Willing to Relocate</span>
                  {willingToRelocate && (
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {getHomeCountry() ? `Show high-match roles across ${getHomeCountry()}` : 'Show high-match roles across your country'}
                    </span>
                  )}
                </label>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0 flex-wrap md:flex-nowrap">
                <button type="button" className="px-4 py-2 border border-indigo-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 transition-colors whitespace-nowrap">
                  Date posted
                </button>
                <button type="button" className="px-4 py-2 border border-indigo-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 transition-colors whitespace-nowrap">
                  Experience level
                </button>
                <button type="button" className="px-4 py-2 border border-indigo-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 transition-colors whitespace-nowrap inline-flex items-center gap-1.5">
                  Remote <X className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-6 bg-indigo-200 mx-1 hidden md:block" />
                <button type="button" onClick={() => setShowFilters(true)} className="px-4 py-2 border border-indigo-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 transition-colors whitespace-nowrap inline-flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                <button type="button" className="md:ml-2 px-4 py-2 text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap" title="Search History">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium hidden lg:inline">History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <main className="flex-1 overflow-hidden flex flex-col min-h-0 pt-4">
          {/* Results header */}
          <div className="flex items-center justify-between mb-3 shrink-0 px-1">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{personalizedJobResults.length} results</span>
              {quickSearchJobTitle ? ` for "${quickSearchJobTitle}"` : ''}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">AI Sorting:</span>
              <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg border border-indigo-100 transition-colors">
                Relevance <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {/* Split: job list + detail */}
          <div className="flex-1 bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden flex min-h-0">
            <div className="w-full md:w-[40%] lg:w-[35%] xl:w-[30%] border-r border-indigo-100 flex flex-col bg-white overflow-y-auto custom-scrollbar">
              {personalizedJobResults.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedWorkspaceJobId(job.id)}
                  className={`p-4 border-b border-indigo-50 cursor-pointer transition-colors relative ${selectedWorkspaceJobId === job.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-indigo-50/50 border-l-2 border-l-transparent'}`}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center p-1 shrink-0">
                      {job.logoInitial ? (
                        <div className={`w-full h-full rounded-md flex items-center justify-center text-white text-sm font-bold ${job.logoColor || 'bg-gray-500'}`}>{job.logoInitial}</div>
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-[15px] leading-tight mb-0.5 truncate ${selectedWorkspaceJobId === job.id ? 'text-indigo-700' : 'text-gray-900'}`}>{job.title}</h3>
                      <p className="text-[13px] text-gray-700 mb-0.5 truncate">{job.company}</p>
                      <p className="text-[12px] text-gray-500 truncate">{job.location}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${job.matchScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{job.matchScore}% Match</span>
                        {job.matchScore >= 95 && <span className="text-[10px] text-indigo-600 flex items-center gap-0.5"><Sparkles className="w-3 h-3 text-indigo-500" /> Top Pick</span>}
                        <span className="text-[11px] text-gray-400 ml-auto">{job.daysAgo || getDaysAgo(job.postedDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedJob ? (
              <div className="hidden md:flex flex-1 flex-col bg-white overflow-hidden relative">
                {/* Sticky header: title, meta, tags, actions */}
                <div className="p-6 border-b border-indigo-100 bg-white shrink-0 z-10 sticky top-0 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{selectedJob.title}</h1>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600 items-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                          <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                          {selectedJob.company}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {selectedJob.location}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-green-600 font-medium">Be an early applicant</span>
                        <span className="text-gray-400">•</span>
                        <span>Posted {selectedJob.daysAgo || getDaysAgo(selectedJob.postedDate)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-medium text-blue-800">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                          {selectedJob.type || 'Full-time'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-lg text-xs font-medium text-purple-800">
                          <Layers className="w-3.5 h-3.5 text-purple-600" />
                          {selectedJob.experienceLevel || 'Mid-Senior Level'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => handleTrackJob(selectedJob)} className="p-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors" title="Save">
                        <BookmarkPlus className="w-5 h-5" />
                      </button>
                      <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all">
                        Apply Now <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
                  {/* HIRE PROBABILITY — local baseline, CTA for Deep AI */}
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
                    return (
                      <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-800/90 mb-2">
                          HIRE PROBABILITY
                        </p>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-3xl font-bold text-amber-900">{localScore}%</span>
                          <span className="text-sm text-amber-800/80" title={localScore < 50 ? 'Unlock the Deep AI Analysis for a human-like review of your industry context.' : undefined}>
                            {localScore < 50 ? 'Initial Alignment' : 'Basic Match'}
                          </span>
                        </div>
                        <p className="text-xs text-amber-700/60 mb-2 flex items-center gap-1.5 relative">
                          {localResult.matchReason}
                          {localResult.breakdown != null && (
                            <span
                              className="inline-flex text-amber-700/80 hover:text-amber-800 cursor-help"
                              onMouseEnter={() => setShowScoreBreakdownTooltip(true)}
                              onMouseLeave={() => setShowScoreBreakdownTooltip(false)}
                              title="How this score was calculated"
                            >
                              <Info className="w-3.5 h-3.5 shrink-0" />
                              {showScoreBreakdownTooltip && (
                                <span className="absolute left-0 top-full z-10 mt-1 px-2.5 py-2 text-xs font-normal text-amber-900 bg-amber-100 border border-amber-300 rounded-lg shadow-md">
                                  Keyword Match: {localResult.breakdown.keywordScore}/50<br />
                                  Tenure Fit: {localResult.breakdown.tenureScore}/30<br />
                                  Location Synergy: {localResult.breakdown.locationSynergy}/5<br />
                                  Base Score: {localResult.breakdown.baseScore}
                                </span>
                              )}
                            </span>
                          )}
                        </p>
                        {localScore < 50 && (
                          <p className="text-xs text-amber-700/80 mb-3">Unlock the Deep AI Analysis for a human-like review of your industry context.</p>
                        )}
                        <button
                          type="button"
                          disabled={userCredits <= 0}
                          className="w-full py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-600 text-white shadow-sm disabled:hover:bg-amber-500"
                        >
                          Find your probability of getting hired
                        </button>
                        {userCredits <= 0 && (
                          <p className="text-xs text-amber-700/80 mt-2">Use credits to unlock Deep AI analysis.</p>
                        )}
                        {resumeData && (
                          <button
                            type="button"
                            onClick={() => setShowResumeDataDebug(true)}
                            className="mt-3 text-xs text-amber-700/70 hover:text-amber-800 underline flex items-center gap-1 mx-auto"
                            title="View the parsed resume data used for matching"
                          >
                            <Info className="w-3 h-3" />
                            View Data Source (Debug)
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Why this is a top match — evidence-based bullets; exclude missing/under/exceeding from top match (Growth Areas only) */}
                  {(() => {
                    const profile = convertToResumeProfile(resumeData);
                    const yearsOfExperience = profile?.yearsOfExperience ?? 0;
                    const requiredYears = parseRequiredYearsFromRequirements(selectedJob.requirements);
                    const isUnderRequired = requiredYears != null && yearsOfExperience < requiredYears;
                    const reasons = selectedJob.reasons ?? [];
                    // Hard constraint: never show missing skill or under/exceeding experience as top match reasons
                    const isGrowthAreaReason = (r: string) =>
                      isExceedsExperienceReason(r) || isMissingSkillReason(r) || isUnderExperienceReason(r);
                    const topMatchReasonsFromAi = reasons.filter((r) => !isGrowthAreaReason(r));
                    const growthOrRisksReasons: string[] = [];
                    reasons.filter(isGrowthAreaReason).forEach((r) => growthOrRisksReasons.push(r));
                    if (isUnderRequired && requiredYears != null && !growthOrRisksReasons.some((r) => /below|under|years?\s+required/i.test(r))) {
                      growthOrRisksReasons.push(`Below required experience (${requiredYears}+ years required, you have ${yearsOfExperience}).`);
                    }
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
                    const topMatchReasons = matchNarrative ? [] : topMatchReasonsFromAi;
                    const matchScore = selectedJob.matchScore ?? 0;
                    const isEliteMatch = matchScore > 70;
                    const currentCompany = resumeData?.experience?.[0]?.company || 'Forward Air';
                    const mainStrategy = isEliteMatch
                      ? `You are an elite match. In the interview, focus on your specific 'Result' from ${currentCompany} to justify a top-of-market salary.`
                      : "This role has some gaps. Use your 'Action' skills (SAP/Oracle) to prove you can learn their specific workflow quickly.";
                    const gapStrategies = growthOrRisksReasons.map((r) =>
                      gapToInterviewStrategy(r, resumeData, profile, selectedJob)
                    );
                    const interviewStrategyReasons = [mainStrategy, ...gapStrategies];
                    // Summary sentence: high-level overview when STAR evidence exists
                    const summaryOverview = 'Strong alignment in industry experience and technical skills.';
                    const whyMatchSentence = matchNarrative
                      ? `Your profile aligns with this role: ${summaryOverview}`
                      : (interviewStrategyReasons.length > 0
                          ? 'This role aligns with your skills and experience. See interview strategy below.'
                          : (selectedJob.whyMatch || 'This role aligns with your skills and experience.'));
                    return (
                      <div className="rounded-xl border border-indigo-100 bg-[#F8F8FC] p-5">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                          Why this is a top match
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                          {whyMatchSentence}
                        </p>
                        {matchNarrative ? (
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-sm text-gray-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="flex-1">{matchNarrative.background}</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="flex-1">{matchNarrative.responsibilities}</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="flex-1">{matchNarrative.contributions}</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="flex-1">{matchNarrative.resultOriented}</span>
                            </li>
                            {matchNarrative.relocateBullet && (
                              <li className="flex items-start gap-2 text-sm text-gray-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="flex-1">{matchNarrative.relocateBullet}</span>
                              </li>
                            )}
                          </ul>
                        ) : topMatchReasons.length > 0 ? (
                          <ul className="space-y-2">
                            {topMatchReasons.map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <div className="mt-5 rounded-lg border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-violet-50/70 p-4">
                          <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-500 shrink-0" />
                            Interview Strategy
                          </h4>
                          <p className="text-xs text-indigo-700/90 mb-3">
                            {matchScore > 70 ? 'Leverage your strengths to secure top-of-market terms.' : 'Areas to highlight so you can present your fit confidently.'}
                          </p>
                          <ul className="space-y-2">
                            {interviewStrategyReasons.map((strategy, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-indigo-800">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                <span>{strategy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {matchNarrative && resumeData && (
                          <div className="mt-4 pt-4 border-t border-indigo-200">
                            <button
                              type="button"
                              onClick={() => setShowResumeDataDebug(true)}
                              className="text-xs text-indigo-600/70 hover:text-indigo-800 underline flex items-center gap-1"
                              title="View the parsed resume data used for this match narrative"
                            >
                              <Info className="w-3 h-3" />
                              View Data Source (Debug)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Role Overview / Content */}
                  <div className="space-y-4 pb-12">
                    <h3 className="font-bold text-gray-900 text-lg">Role Overview</h3>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      {selectedJob.description && <p>{selectedJob.description}</p>}
                      {selectedJob.requirements && (
                        <>
                          <h4 className="font-bold text-gray-900 mt-4 mb-2">Requirements</h4>
                          <p>{selectedJob.requirements}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center bg-indigo-50/30 text-indigo-600 border-l border-indigo-100">
                <p className="text-sm font-medium">Select a job to view details</p>
              </div>
            )}
          </div>
        </main>
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
          .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
          @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // --- Default view: Personalized Jobs + History tabs (no Quick Search) ---
  return (
    <div className="space-y-6 bg-gradient-to-b from-indigo-50/40 to-transparent rounded-2xl p-1 -m-1">
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
          <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 max-w-2xl w-full max-h-[80vh] flex flex-col">
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

      {/* Tab Navigation — pastel-inspired like workflow tabs */}
      <nav className="w-full bg-white rounded-xl shadow-sm border border-indigo-100 p-1.5 flex items-center">
        <button
          onClick={() => setActiveTab('resumes')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'resumes' ? 'bg-[#111827] text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
          }`}
        >
          <FileText size={18} />
          <span>Personalized Jobs</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'history' ? 'bg-[#111827] text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
          }`}
        >
          <Clock size={18} />
          <span>History</span>
        </button>
      </nav>

      {/* Personalized Jobs tab: upload resume + customize search + Find Personalized Jobs */}
      {activeTab === 'resumes' && (
        <div className="space-y-6">
          {/* Central content card — separate white card, rounded-2xl (reference) */}
          {Object.keys(uploadedResumes).length === 0 && (
            <>
              <section className="w-full bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 md:py-20 flex flex-col items-center text-center">
                <div className="mb-6 p-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500">
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
                <p className="mt-6 text-xs font-semibold text-indigo-500/80 uppercase tracking-wide">SUPPORTS PDF, DOCX, AND TXT</p>
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

          {/* Uploaded Resumes — inside white card when has resumes (aligned with reference) */}
          {Object.keys(uploadedResumes).length > 0 && (
            <div className="w-full bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 md:p-10">
            <div className="border-b border-indigo-100 pb-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Resumes</h1>
                <div className="flex items-center gap-2">
                  {resumeData && (
                    <button
                      type="button"
                      onClick={() => setShowResumeDataDebug(true)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 font-medium"
                    >
                      Resume View (debug)
                    </button>
                  )}
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium py-2.5 px-5 rounded-lg shadow-sm transition-all hover:bg-indigo-100">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={isUploadingResume}
                    />
                    <Upload className="w-4 h-4" />
                    Upload New
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(uploadedResumes).map(([name, data]) => (
                  <div
                    key={name}
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${
                      activeResume === name
                        ? 'border-indigo-300 bg-indigo-50 shadow-sm ring-1 ring-indigo-200'
                        : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 shadow-sm'
                    }`}
                    onClick={() => handleSelectResume(name)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                          {activeResume === name && (
                            <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full">Active</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteResume(name); }}
                        className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Remove resume"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {data.skills?.technical && data.skills.technical.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {data.skills.technical.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-xs rounded-md">
                            {skill}
                          </span>
                        ))}
                        {data.skills.technical.length > 3 && (
                          <span className="text-xs text-gray-500">+{data.skills.technical.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          {/* Customize Your Job Search — aligned with reference */}
          {activeResume && uploadedResumes[activeResume] && (
            <div className="border-t border-indigo-100 pt-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Customize Your Job Search</h1>
              <p className="text-gray-500 mb-6">Select a search strategy based on your goals</p>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Search jobs based on</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'background', label: 'Your Background' },
                    { id: 'career_progression', label: 'Next Career Step' },
                    { id: 'skill_based', label: 'Skill-Based Match' },
                    { id: 'passion_based', label: 'Passion & Interests' },
                    { id: 'industry_switch', label: 'Industry Switch' }
                  ].map(strategy => (
                    <button
                      key={strategy.id}
                      type="button"
                      onClick={() => setSelectedSearchStrategy(selectedSearchStrategy === strategy.id ? null : strategy.id)}
                      disabled={isSearchingPersonalized || isResolvingLocation}
                      className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                        selectedSearchStrategy === strategy.id
                          ? 'bg-[#111827] text-white shadow-lg'
                          : 'bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                      } ${isSearchingPersonalized ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {strategy.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Entry fallback when job title or skills weren't detected — ensures buildStrategicQuery has valid data */}
              {(resumeData && (!resumeData.experience?.[0]?.position || !(resumeData.skills?.technical?.length))) && (
                <div className="mb-6 p-5 rounded-xl border border-amber-200 bg-amber-50/80">
                  <h3 className="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Manual Entry
                  </h3>
                  <p className="text-xs text-amber-800 mb-4">Add your current job title and top skills so recommendations and search work correctly.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Current Job Title</label>
                      <input
                        type="text"
                        value={manualJobTitle}
                        onChange={(e) => setManualJobTitle(e.target.value)}
                        placeholder="e.g. Accounts Receivable, Product Manager"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Top Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={manualTopSkills}
                        onChange={(e) => setManualTopSkills(e.target.value)}
                        placeholder="e.g. JavaScript, React, Python"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={applyManualEntry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#1f2937]"
                  >
                    <Check className="w-4 h-4" />
                    Apply
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Work Type</label>
                  <select
                    value={resumeFilters.workType}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, workType: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remote Preference</label>
                  <select
                    value={resumeFilters.remote}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, remote: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                  >
                    <option value="Any">Any</option>
                    <option value="Remote">Remote Only</option>
                    <option value="On-site">On-site Only</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={resumeFilters.experienceLevel}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                  >
                    <option value="Any level">Any Level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeFilters.location}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State or Remote"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePersonalizedSearch}
                disabled={isSearchingPersonalized || isResolvingLocation}
                className={`w-full flex items-center justify-center gap-2 py-3 px-8 rounded-lg font-medium transition-all ${
                  !isSearchingPersonalized && !isResolvingLocation
                    ? 'bg-[#111827] hover:bg-[#1f2937] text-white shadow-lg hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isResolvingLocation ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finding jobs near you...
                  </>
                ) : isSearchingPersonalized ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {searchProgressMessage || 'AI is calculating your next career move...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Find Personalized Jobs
                  </>
                )}
              </button>

              {/* Task 4: Zero-state — Broaden your horizon? (search state/province or country instead of city) */}
              {showBroadenHorizon && (() => {
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
            </div>
          )}
        </div>
      )}

      {/* Location prompt modal — "Where should we look for jobs?" (Task 1 fallback) */}
      {showLocationPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Enter search location">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowLocationPrompt(false); setLocationPromptValue(''); pendingLocationResolveRef.current?.(''); pendingLocationResolveRef.current = null; }} />
          <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Where should we look for jobs?</h2>
            <p className="text-sm text-gray-500 mb-4">Enter a city, state, or country to search.</p>
            <input
              type="text"
              value={locationPromptValue}
              onChange={(e) => setLocationPromptValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocationPromptSubmit()}
              placeholder="e.g. Paris, Rome, Hyderabad"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none mb-4"
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white border border-indigo-100 rounded-2xl p-12 text-center shadow-sm">
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
