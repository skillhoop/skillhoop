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
  personalInfo?: { jobTitle?: string };
  /** Optional: professional summary — included in keyword search. */
  summary?: string;
}

export interface LocalJob {
  title: string;
  requirements?: string;
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
    if (keywords.length >= 10) break;
  }
  return { keywords, titleWordSet };
}

/**
 * Check if a single JD keyword matches the profile (skills, experience, jobTitle, summary).
 * Uses .includes() for variations and COMMON_SYNONYMS (e.g. 'AR' ↔ 'Accounts Receivable').
 */
function keywordMatchesProfile(kw: string, skillList: string[], resumeText: string): boolean {
  const normalized = kw.toLowerCase().trim();
  if (normalized.length < 2) return false;

  // Direct or partial match in full resume text (experience, jobTitle, summary, etc.)
  if (resumeText.includes(normalized)) return true;

  // Match in skills: use .includes() so "Account" matches "Accounting", "Excel" matches "Microsoft Excel"
  for (const skill of skillList) {
    const s = skill.toLowerCase().trim();
    if (s.includes(normalized) || normalized.includes(s)) return true;
  }

  // Synonym: JD has "ar" -> resume may have "accounts receivable"
  const synonym = COMMON_SYNONYMS[normalized];
  if (synonym) {
    if (resumeText.includes(synonym)) return true;
    for (const skill of skillList) {
      if (skill.toLowerCase().includes(synonym)) return true;
    }
  }

  return false;
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
  // Skills are matched separately via skillList; include in text so "Accounts Receivable" in skills is searchable
  for (const s of profile.skills) {
    parts.push(s.toLowerCase().trim());
  }
  return parts.join(' ');
}

/**
 * Count weighted keyword matches: title keywords count 2x, domain synonyms (COMMON_SYNONYMS) 1.5x.
 */
function countKeywordMatches(
  profile: LocalProfile,
  job: LocalJob,
  extracted: { keywords: string[]; titleWordSet: Set<string> }
): number {
  const skillList = profile.skills.map(s => s.toLowerCase().trim());
  const resumeText = buildResumeSearchText(profile);
  let weightedCount = 0;
  for (const kw of extracted.keywords) {
    if (!keywordMatchesProfile(kw, skillList, resumeText)) continue;
    const fromTitle = extracted.titleWordSet.has(kw);
    const isDomainSynonym = kw in COMMON_SYNONYMS;
    let weight = fromTitle ? 2 : 1;
    if (isDomainSynonym) weight *= 1.5;
    weightedCount += weight;
  }
  return weightedCount;
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

/**
 * Local baseline match: (KeywordMatch/10 * 50) + (TenureMatch * 30) + 20.
 * TenureMatch is capped 0–1. Title keywords count 2x; domain synonyms 1.5x.
 * If job title and resume title overlap > 50%, score is floored at 60%.
 */
export function calculateLocalBaseMatch(profile: LocalProfile, job: LocalJob): number {
  const totalYears = sumTenureYears(profile);
  const tenureMatch = Math.min(1, totalYears / 3); // 3+ years = full 30 points (realistic for Specialist roles)

  const extracted = extractCoreKeywords(job);
  const weightedMatchCount = countKeywordMatches(profile, job, extracted);
  // Normalize by ~10 keywords; weighted count can exceed 10, so cap effective ratio at 1.2 for scoring
  const effectiveRatio = Math.min(1.2, weightedMatchCount / 10);
  const keywordScore = effectiveRatio * 50; // up to 50 points (can slightly exceed with 2x/1.5x weights)

  const tenureScore = tenureMatch * 30; // up to 30 points
  const baseline = 20; // fixed 20 points

  let raw = keywordScore + tenureScore + baseline;
  const titleOverlap = jobTitleResumeTitleOverlap(profile, job);
  if (titleOverlap > 0.5) raw = Math.max(raw, 60); // strong title match: floor 60%
  return Math.round(Math.min(100, Math.max(0, raw)));
}
