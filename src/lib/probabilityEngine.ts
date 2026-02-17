/**
 * Local (zero-cost) probability engine for hire match.
 * Hybrid architecture: instant baseline from tenure + keywords; Deep AI gated by credits.
 */

export interface LocalProfile {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  /** Optional: current job title from header (e.g. "Accounts Receivable") — strong signal for title match. */
  personalInfo?: { jobTitle?: string; location?: string };
  /** Optional: professional summary — included in keyword search. */
  summary?: string;
}

export interface LocalJob {
  title: string;
  requirements?: string;
  location?: string;
}

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'the', 'this', 'but', 'they', 'have', 'had', 'what', 'when',
  'where', 'which', 'who', 'years', 'year', 'experience', 'required', 'preferred',
  // Strict domain stopwords (noise that inflates match without real signal)
  'team', 'global', 'grade', 'level', 'hours', 'shift', 'role', 'responsibilities', 'work',
]);

/** Local synonyms: JD keyword (short/alias) -> phrase that may appear in resume. Enables AR ↔ Accounts Receivable etc. */
const COMMON_SYNONYMS: Record<string, string> = {
  ar: 'accounts receivable',
  ap: 'accounts payable',
  excel: 'spreadsheet',
  erp: 'enterprise resource planning',
  kpi: 'key performance',
  roi: 'return on investment',
  hr: 'human resources',
  it: 'information technology',
};

/**
 * Parse duration string to years (e.g. "2 years", "2018 - Present").
 */
function parseDurationToYears(duration: string | undefined): number {
  if (!duration?.trim()) return 0;
  const d = duration.trim().toLowerCase();
  const yearsMatch = d.match(/(\d+)\+?\s*(?:years?|yrs?)/);
  if (yearsMatch) return parseInt(yearsMatch[1], 10);
  const rangeMatch = d.match(/(\d{4})\s*[-–]\s*(?:present|now|current|\d{4})/i) ?? d.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : new Date().getFullYear();
    return Math.max(0, end - start);
  }
  const monthsMatch = d.match(/(\d+)\s*months?/);
  if (monthsMatch) return parseInt(monthsMatch[1], 10) / 12;
  return 0;
}

/** Result of keyword extraction: list of keywords and which ones came from the job title (for 2x weight). */
function extractCoreKeywords(job: LocalJob): { keywords: string[]; titleWordSet: Set<string> } {
  const titleText = (job.title ?? '').toLowerCase();
  const reqText = (job.requirements ?? '').toLowerCase();
  const titleTokens = titleText.replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(Boolean);
  const titleWordSet = new Set<string>();
  for (const t of titleTokens) {
    const w = t.replace(/^['-]+|['-]+$/g, '');
    if (w.length >= 2 && !STOPWORDS.has(w)) titleWordSet.add(w);
  }
  const text = `${titleText} ${reqText}`;
  const tokens = text.replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(Boolean);
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const t of tokens) {
    const w = t.replace(/^['-]+|['-]+$/g, '');
    if (w.length < 2 || STOPWORDS.has(w) || seen.has(w)) continue;
    seen.add(w);
    keywords.push(w);
    if (keywords.length >= 20) break;
  }
  return { keywords, titleWordSet };
}

/** Check if keyword (or its synonym) appears in a skill list. */
function keywordMatchesSkillList(kw: string, skillList: string[]): boolean {
  const normalized = kw.toLowerCase().trim();
  if (normalized.length < 2) return false;
  for (const skill of skillList) {
    const s = skill.toLowerCase().trim();
    if (s.includes(normalized) || normalized.includes(s)) return true;
  }
  const synonym = COMMON_SYNONYMS[normalized];
  if (synonym) {
    for (const skill of skillList) {
      if (skill.toLowerCase().includes(synonym)) return true;
    }
  }
  return false;
}

/** Check if keyword (or its synonym) appears in text. */
function keywordMatchesText(kw: string, text: string): boolean {
  const normalized = kw.toLowerCase().trim();
  if (normalized.length < 2) return false;
  if (text.includes(normalized)) return true;
  const synonym = COMMON_SYNONYMS[normalized];
  if (synonym && text.includes(synonym)) return true;
  return false;
}

/**
 * Return match weight: 1 if keyword is in skills, 0.7 if only in summary/experience/title (partial), 0 if no match.
 * Partial matches introduce decimals for more granular, trustworthy-looking scores.
 */
function keywordMatchWeight(
  kw: string,
  skillList: string[],
  resumeTextWithoutSkills: string
): number {
  if (keywordMatchesSkillList(kw, skillList)) return 1;
  if (keywordMatchesText(kw, resumeTextWithoutSkills)) return 0.7;
  return 0;
}

/**
 * Build full resume search text: skills, experience (title + description), personalInfo.jobTitle, summary.
 */
function buildResumeSearchText(profile: LocalProfile): string {
  const parts: string[] = [];
  if (profile.personalInfo?.jobTitle?.trim()) {
    parts.push(profile.personalInfo.jobTitle.trim().toLowerCase());
  }
  if (profile.summary?.trim()) {
    parts.push(profile.summary.trim().toLowerCase());
  }
  for (const e of profile.experience) {
    parts.push(`${e.title} ${e.description}`.toLowerCase());
  }
  for (const s of profile.skills) {
    parts.push(s.toLowerCase().trim());
  }
  return parts.join(' ');
}

/** Build resume text excluding skills (for partial-match detection: summary/experience/title only). */
function buildResumeTextWithoutSkills(profile: LocalProfile): string {
  const parts: string[] = [];
  if (profile.personalInfo?.jobTitle?.trim()) {
    parts.push(profile.personalInfo.jobTitle.trim().toLowerCase());
  }
  if (profile.summary?.trim()) {
    parts.push(profile.summary.trim().toLowerCase());
  }
  for (const e of profile.experience) {
    parts.push(`${e.title} ${e.description}`.toLowerCase());
  }
  return parts.join(' ');
}

/**
 * Text of the most recent job (experience[0]) for recency weighting.
 */
function buildMostRecentJobText(profile: LocalProfile): string {
  const e = profile.experience?.[0];
  if (!e) return '';
  return `${e.title} ${e.description}`.toLowerCase();
}

/**
 * Count weighted keyword matches: full match in skills = 1, partial (summary/experience only) = 0.7;
 * title keywords 2x, domain synonyms (COMMON_SYNONYMS) 1.5x.
 * Recency: 1.2x for keywords found in the most recent job (experience[0]).
 */
function countKeywordMatches(
  profile: LocalProfile,
  job: LocalJob,
  extracted: { keywords: string[]; titleWordSet: Set<string> }
): { weightedCount: number; hadRecencyBoost: boolean } {
  const skillList = profile.skills.map(s => s.toLowerCase().trim());
  const resumeTextWithoutSkills = buildResumeTextWithoutSkills(profile);
  const mostRecentJobText = buildMostRecentJobText(profile);
  let weightedCount = 0;
  let hadRecencyBoost = false;
  for (const kw of extracted.keywords) {
    const matchWeight = keywordMatchWeight(kw, skillList, resumeTextWithoutSkills);
    if (matchWeight === 0) continue;
    const fromTitle = extracted.titleWordSet.has(kw);
    const isDomainSynonym = kw in COMMON_SYNONYMS;
    let multiplier = fromTitle ? 2 : 1;
    if (isDomainSynonym) multiplier *= 1.5;
    const inRecentJob = mostRecentJobText.length > 0 && keywordMatchesText(kw, mostRecentJobText);
    if (inRecentJob) {
      multiplier *= 1.2;
      hadRecencyBoost = true;
    }
    weightedCount += matchWeight * multiplier;
  }
  return { weightedCount, hadRecencyBoost };
}

/**
 * Sum total years of experience from profile.experience durations.
 */
function sumTenureYears(profile: LocalProfile): number {
  return profile.experience.reduce((sum, e) => sum + parseDurationToYears(e.duration), 0);
}

/**
 * Compute word overlap between job title and resume title (0–1). Resume title = personalInfo.jobTitle or first experience title.
 */
function jobTitleResumeTitleOverlap(profile: LocalProfile, job: LocalJob): number {
  const resumeTitle =
    (profile.personalInfo?.jobTitle ?? profile.experience?.[0]?.title ?? '').trim().toLowerCase();
  const jobTitle = (job.title ?? '').trim().toLowerCase();
  if (!resumeTitle || !jobTitle) return 0;
  const jobWords = jobTitle.replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !STOPWORDS.has(w));
  const resumeSet = new Set(resumeTitle.replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !STOPWORDS.has(w)));
  if (jobWords.length === 0) return 0;
  const matchCount = jobWords.filter(w => resumeSet.has(w)).length;
  return matchCount / jobWords.length;
}

/** Score breakdown for transparency (all out of their max). */
export interface LocalMatchBreakdown {
  keywordScore: number;   // out of 50
  tenureScore: number;    // out of 30
  locationSynergy: number; // out of 5
  baseScore: number;     // 20
}

/** Result of local baseline match: rounded score, short reason, and optional breakdown for UI tooltip. */
export interface LocalMatchResult {
  score: number;
  matchReason: string;
  /** Present when profile/job were provided; use for "how was this score calculated" tooltip. */
  breakdown?: LocalMatchBreakdown;
}

/**
 * Local baseline match: (KeywordMatch/20 * 50) + tenureScore + 20.
 * Keyword match uses 20 keywords (2.5% steps); partial matches (summary-only) 0.7x.
 * Tenure: sqrt(totalYears/3)*30 (non-linear, rewards early experience).
 * Title keywords 2x; domain synonyms 1.5x. Strong title overlap floors at 60%.
 * Location synergy: +5 if profile and job both contain 'Hyderabad'. Recency: 1.2x for keywords in experience[0].
 */
export function calculateLocalBaseMatch(profile: LocalProfile, job: LocalJob): LocalMatchResult {
  const totalYears = sumTenureYears(profile);
  // Non-linear tenure: sqrt curve rewards first year more, yields organic-looking percentages
  const tenureScore = Math.min(30, Math.sqrt(totalYears / 3) * 30);

  const extracted = extractCoreKeywords(job);
  const { weightedCount: weightedMatchCount, hadRecencyBoost } = countKeywordMatches(profile, job, extracted);
  // Normalize by 20 keywords → increments of 2.5%; cap effective ratio at 1.2 for scoring
  const effectiveRatio = Math.min(1.2, weightedMatchCount / 20);
  const keywordScore = effectiveRatio * 50; // (KeywordMatchCount/20)*50 up to 50 points
  const baseline = 20; // fixed 20 points

  let raw = keywordScore + tenureScore + baseline;

  // Location synergy: +5 if both profile and job location contain 'Hyderabad'
  const profileLoc = (profile.personalInfo?.location ?? '').toLowerCase();
  const jobLoc = (job.location ?? '').toLowerCase();
  const locationSynergy = profileLoc.includes('hyderabad') && jobLoc.includes('hyderabad') ? 5 : 0;
  raw += locationSynergy;

  const titleOverlap = jobTitleResumeTitleOverlap(profile, job);
  if (titleOverlap > 0.5) raw = Math.max(raw, 60); // strong title match: floor 60%

  const score = Math.round(Math.min(100, Math.max(0, raw)));

  // Build match reason (one short phrase; prefer location > recency > title > default)
  let matchReason: string;
  if (locationSynergy > 0) matchReason = 'Strong local match';
  else if (hadRecencyBoost) matchReason = 'Current role aligns well';
  else if (titleOverlap > 0.5) matchReason = 'Title match';
  else matchReason = 'Skills and experience alignment';

  const breakdown: LocalMatchBreakdown = {
    keywordScore: Math.round(keywordScore),
    tenureScore: Math.round(tenureScore),
    locationSynergy,
    baseScore: baseline,
  };

  return { score, matchReason, breakdown };
}
