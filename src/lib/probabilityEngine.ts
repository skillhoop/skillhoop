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
}

export interface LocalJob {
  title: string;
  requirements?: string;
}

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'the', 'this', 'but', 'they', 'have', 'had', 'what', 'when',
  'where', 'which', 'who', 'years', 'year', 'experience', 'required', 'preferred'
]);

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

/**
 * Extract up to 10 core keywords from job title and requirements (lowercase, no stopwords, min length 2).
 */
function extractCoreKeywords(job: LocalJob): string[] {
  const text = `${job.title ?? ''} ${job.requirements ?? ''}`.toLowerCase();
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
  return keywords;
}

/**
 * Count how many of the given keywords appear in profile skills or experience (title/description).
 */
function countKeywordMatches(profile: LocalProfile, keywords: string[]): number {
  const skillSet = new Set(profile.skills.map(s => s.toLowerCase().trim()));
  const expText = profile.experience
    .map(e => `${e.title} ${e.description}`.toLowerCase())
    .join(' ');
  let count = 0;
  for (const kw of keywords) {
    if (skillSet.has(kw) || expText.includes(kw)) count++;
  }
  return count;
}

/**
 * Sum total years of experience from profile.experience durations.
 */
function sumTenureYears(profile: LocalProfile): number {
  return profile.experience.reduce((sum, e) => sum + parseDurationToYears(e.duration), 0);
}

/**
 * Local baseline match: (KeywordMatch/10 * 50) + (TenureMatch * 30) + 20.
 * TenureMatch is capped 0–1 (e.g. 5+ years = 1).
 */
export function calculateLocalBaseMatch(profile: LocalProfile, job: LocalJob): number {
  const totalYears = sumTenureYears(profile);
  const tenureMatch = Math.min(1, totalYears / 5); // 5+ years = full 30% component

  const keywords = extractCoreKeywords(job);
  const matchCount = countKeywordMatches(profile, keywords);
  const keywordScore = (matchCount / 10) * 50; // 10 core keywords, up to 50 points

  const tenureScore = tenureMatch * 30; // up to 30 points
  const baseline = 20; // fixed 20 points

  const raw = keywordScore + tenureScore + baseline;
  return Math.round(Math.min(100, Math.max(0, raw)));
}
