import type {
  Job,
  JobHighlights,
  JSearchSearchResponse,
  RefinedSearchQuery,
  SearchJobsResult,
  UnifiedSearchResult,
} from '../../types/job';
import { supabase } from '../supabase';

const JSEARCH_SEARCH_URL = 'https://jsearch.p.rapidapi.com/search';
const JSEARCH_JOB_DETAILS_URL = 'https://jsearch.p.rapidapi.com/job-details';

/** When listing description is shorter than this, Job Finder may call job-details for full HTML body. */
export const JOB_DESCRIPTION_DEEP_FETCH_THRESHOLD = 800;

/** Primary prose length under this (Adzuna / JoinRise / Arbeitnow) → append “View full posting” hint. */
export const THIN_BOARD_PRIMARY_DESCRIPTION_THRESHOLD = 1000;

const VIEW_FULL_POSTING_SENTINEL = 'View full posting:';

function appendThinBoardFullPostingNotice(
  primaryLen: number,
  applyLink: string,
  parts: {
    job_description: string | undefined;
    unified_description: string | undefined;
    greedy_full_text: string | undefined;
  }
): Pick<Job, 'job_description' | 'unified_description' | 'greedy_full_text'> {
  if (primaryLen >= THIN_BOARD_PRIMARY_DESCRIPTION_THRESHOLD) {
    return {
      job_description: parts.job_description,
      unified_description: parts.unified_description,
      greedy_full_text: parts.greedy_full_text,
    };
  }
  const jd0 = (parts.job_description ?? '').trim();
  if (jd0.includes(VIEW_FULL_POSTING_SENTINEL)) {
    return {
      job_description: parts.job_description,
      unified_description: parts.unified_description,
      greedy_full_text: parts.greedy_full_text,
    };
  }
  const url = (applyLink ?? '').trim();
  const notice =
    url && url !== '#'
      ? `\n\n---\n${VIEW_FULL_POSTING_SENTINEL} ${url}\n\n(This board only returned a short summary in SkillHoop — open the link for the complete job description.)`
      : `\n\n---\nComplete job description was not provided by this board. Try the employer’s careers site when you have an apply URL.`;
  return {
    job_description: `${parts.job_description ?? ''}${notice}`.trim() || notice.trim(),
    unified_description: parts.unified_description ? `${parts.unified_description}${notice}` : undefined,
    greedy_full_text: parts.greedy_full_text ? `${parts.greedy_full_text}${notice}` : undefined,
  };
}

/** Prefer normalized listing prose; fallback for legacy rows without `job_listing_prose`. */
export function jobListingProseForDeepFetch(job: {
  job_listing_prose?: string;
  full_description?: string;
  job_description?: string;
}): string {
  const lp = (job.job_listing_prose ?? '').trim();
  if (lp) return lp;
  const jd = (job.job_description ?? '').trim();
  const fd = (job.full_description ?? '').trim();
  const best = fd.length > jd.length ? fd : jd;
  return (best || jd || fd).trim();
}

// --- Proprietary Job Warehouse (global_jobs table) ---
/** Row shape for global_jobs table; maps from our unified Job type. */
interface GlobalJobRow {
  id: string;
  title: string;
  employer_name: string;
  employer_logo: string | null;
  description: string | null;
  apply_link: string;
  city: string | null;
  state: string | null;
  country: string | null;
  posted_at_utc: string;
  min_salary: number | null;
  max_salary: number | null;
  highlights: Record<string, string[] | undefined> | null;
  is_saved?: boolean;
}

function jobToGlobalRow(job: Job): GlobalJobRow {
  return {
    id: job.job_id,
    title: job.job_title,
    employer_name: job.employer_name,
    employer_logo: job.employer_logo,
    description: job.job_description ?? null,
    apply_link: job.job_apply_link,
    city: job.job_city,
    state: job.job_state,
    country: job.job_country,
    posted_at_utc: job.job_posted_at_datetime_utc,
    min_salary: job.job_min_salary,
    max_salary: job.job_max_salary,
    highlights: job.job_highlights ?? null,
  };
}

/**
 * Saves jobs to the proprietary warehouse (background harvester).
 * Maps unified Job type to global_jobs schema and upserts. Do not await in callers.
 */
export function saveJobsToWarehouse(jobs: Job[]): void {
  if (!jobs.length) return;
  const mapped = jobs.map(jobToGlobalRow);
  supabase
    .from('global_jobs')
    .upsert(mapped, { onConflict: 'id' })
    .then(({ error }) => {
      if (error) console.error('[jobService] saveJobsToWarehouse failed:', error.message);
    });
}

function normalizeBenefitsField(v: Job['job_benefits']): string {
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

/**
 * Greedy aggregation: description + snippet + highlights (qualifications, responsibilities, skills, extras) + benefits.
 */
function buildGreedyFullText(parts: {
  job_description?: string;
  job_description_snippet?: string;
  job_highlights?: JobHighlights | null;
  job_benefits?: Job['job_benefits'];
}): string {
  const blocks: string[] = [];
  const desc = (parts.job_description ?? '').trim();
  const snip = (parts.job_description_snippet ?? '').trim();
  if (desc) blocks.push(desc);
  if (snip && snip !== desc) blocks.push(snip);
  const hl = parts.job_highlights;
  if (hl) {
    const qual = (hl.Qualifications ?? []).map((x) => String(x).trim()).filter(Boolean).join('\n');
    const resp = (hl.Responsibilities ?? []).map((x) => String(x).trim()).filter(Boolean).join('\n');
    const skills = (hl.Skills ?? []).map((x) => String(x).trim()).filter(Boolean).join('\n');
    if (qual) blocks.push(qual);
    if (resp) blocks.push(resp);
    if (skills) blocks.push(skills);
    const handled = new Set(['Qualifications', 'Responsibilities', 'Skills', 'skills']);
    for (const [k, v] of Object.entries(hl)) {
      if (handled.has(k) || !Array.isArray(v) || v.length === 0) continue;
      const chunk = v.map((x) => String(x).trim()).filter(Boolean).join('\n');
      if (chunk) blocks.push(chunk);
    }
  }
  const ben = normalizeBenefitsField(parts.job_benefits);
  if (ben) blocks.push(ben);
  return blocks.join('\n\n');
}

/**
 * LinkedIn-style core body: main description + distinct snippet + Qualifications + Responsibilities only
 * (excludes Skills, benefits, and other highlight keys so short postings get a focused merged narrative).
 */
function buildUnifiedDescription(parts: {
  job_description?: string;
  job_description_snippet?: string;
  job_highlights?: JobHighlights | null;
}): string {
  const blocks: string[] = [];
  const desc = (parts.job_description ?? '').trim();
  const snip = (parts.job_description_snippet ?? '').trim();
  if (desc) blocks.push(desc);
  if (snip && snip !== desc) blocks.push(snip);
  const hl = parts.job_highlights;
  if (hl) {
    const qual = (hl.Qualifications ?? []).map((x) => String(x).trim()).filter(Boolean).join('\n');
    const resp = (hl.Responsibilities ?? []).map((x) => String(x).trim()).filter(Boolean).join('\n');
    if (qual) blocks.push(qual);
    if (resp) blocks.push(resp);
  }
  return blocks.join('\n\n');
}

/** Strip ZWSP/BOM and normalize HTML ellipsis entities for reliable truncation probes. */
function normalizeTruncationProbe(text: string): string {
  return text
    .replace(/[\uFEFF\u200B\u200C\u200D]/g, '')
    .replace(/&hellip;|&#8230;|&#x2026;/gi, '\u2026')
    .trimEnd();
}

/** True when the listing body looks provider-truncated (ellipsis / dot-dot-dot). */
export function endsWithTruncationMarker(text: string): boolean {
  const t = normalizeTruncationProbe(text);
  return /(?:\.{3,}|\u2026|…)\s*$/u.test(t);
}

/** Snippet-style copy often contains `...` or an ellipsis character anywhere in the string. */
export function descriptionContainsTruncationMarker(text: string): boolean {
  const t = normalizeTruncationProbe(text);
  return /(?:\.{3,}|\u2026|…)/u.test(t);
}

/**
 * Pick the visible job body. Prefer `greedy_full_text` when the API description is truncated
 * or clearly shorter than the merged greedy aggregate so the UI gets full text.
 */
function pickJobDescription(originalDesc: string | undefined, unified: string, greedy: string): string | undefined {
  const d = (originalDesc ?? '').trim();
  const u = unified.trim();
  const g = greedy.trim();

  if (g.length > 0 && descriptionContainsTruncationMarker(d)) {
    return g || u || d || undefined;
  }

  const greedySignificantlyLonger =
    g.length > 0 &&
    d.length > 0 &&
    (g.length >= d.length + 80 || g.length > d.length * 1.25);

  if (endsWithTruncationMarker(d)) {
    if (g.length > 0) return g || u || d || undefined;
    if (u.length > d.length) return u || d || undefined;
  }

  if (g.length > 0 && greedySignificantlyLonger) {
    return g || u || d || undefined;
  }

  if (d.length >= 100) return d || undefined;
  if (u) return u;
  if (g) return g;
  return d || undefined;
}

/** Maps a global_jobs row back to our unified Job type. */
function globalRowToJob(row: GlobalJobRow): Job {
  const rawDesc = row.description ?? '';
  const unified = buildUnifiedDescription({
    job_description: rawDesc,
    job_highlights: row.highlights ?? undefined,
  });
  const greedy = buildGreedyFullText({
    job_description: rawDesc,
    job_highlights: row.highlights ?? undefined,
  });
  const picked = pickJobDescription(rawDesc, unified, greedy);
  const thin = appendThinBoardFullPostingNotice(rawDesc.trim().length, row.apply_link, {
    job_description: picked,
    unified_description: unified || undefined,
    greedy_full_text: greedy || undefined,
  });
  return {
    job_id: row.id,
    job_title: row.title,
    employer_name: row.employer_name,
    employer_logo: row.employer_logo,
    unified_description: thin.unified_description,
    job_listing_prose: rawDesc.trim() || undefined,
    job_source: 'Warehouse',
    job_description: thin.job_description,
    greedy_full_text: thin.greedy_full_text,
    job_apply_link: row.apply_link,
    job_city: row.city,
    job_state: row.state,
    job_country: row.country,
    job_posted_at_datetime_utc: row.posted_at_utc,
    job_min_salary: row.min_salary,
    job_max_salary: row.max_salary,
    job_highlights: row.highlights ?? undefined,
  };
}

const WAREHOUSE_RECENT_HOURS = 48;
const WAREHOUSE_MIN_JOBS_TO_SKIP_API = 5;

/**
 * Local warehouse + search_history hydration must not surface listings older than this window.
 * Stale rows are ignored so users see relatively fresh postings (JSearch/API remains authoritative for new data).
 */
const LOCAL_DB_MAX_JOB_AGE_MS = 21 * 24 * 60 * 60 * 1000;

function postedAtIsFreshForLocalDb(isoPostedAt: string | null | undefined): boolean {
  const t = typeof isoPostedAt === 'string' ? isoPostedAt.trim() : '';
  if (!t) return false;
  const cutoff = new Date(Date.now() - LOCAL_DB_MAX_JOB_AGE_MS).toISOString();
  return t >= cutoff;
}

function normalizeSearchHistoryKeys(keywords: string, location?: string | null) {
  return {
    keywords: keywords.trim().toLowerCase(),
    location: (location ?? '').trim().toLowerCase(),
  };
}

/** 12h JSearch query cache via Supabase search_history + global_jobs hydration. */
async function trySearchHistoryBeforeJSearch(
  keywords: string,
  location?: string | null
): Promise<Job[] | null> {
  const keys = normalizeSearchHistoryKeys(keywords, location);
  try {
    const res = await fetch('/api/auth-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'search_history_try_hit',
        keywords: keys.keywords,
        location: keys.location,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[jobService] search_history_try_hit error:', res.status, err);
      return null;
    }
    const json = (await res.json()) as { data?: GlobalJobRow[] | null };
    const rows = json.data;
    if (!rows || !Array.isArray(rows) || rows.length === 0) return null;
    const jobs = rows
      .filter((r) => postedAtIsFreshForLocalDb(r.posted_at_utc))
      .map(globalRowToJob);
    return jobs.length > 0 ? jobs : null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[jobService] trySearchHistoryBeforeJSearch:', message);
    return null;
  }
}

export type RecordSearchHistoryMeta = {
  intent?: string | null;
  accessToken?: string | null;
};

function extractJobIdsForHistory(jobsOrIds: Job[] | string[]): string[] {
  if (!jobsOrIds.length) return [];
  if (typeof (jobsOrIds as string[])[0] === 'string') {
    return (jobsOrIds as string[]).map((x) => String(x)).filter(Boolean);
  }
  return (jobsOrIds as Job[]).map((j) => j.job_id).filter(Boolean);
}

/**
 * Persists search_history: anonymous 12h JSearch cache (no accessToken), or user vault row (accessToken + optional intent).
 */
export function recordSearchHistoryAfterJSearch(
  keywords: string,
  location: string | null | undefined,
  jobsOrIds: Job[] | string[],
  meta?: RecordSearchHistoryMeta
): void {
  const keys = normalizeSearchHistoryKeys(keywords, location);
  const job_ids = extractJobIdsForHistory(jobsOrIds);
  if (!keys.keywords || !job_ids.length) return;
  const payload: Record<string, unknown> = {
    action: 'search_history_record',
    keywords: keys.keywords,
    location: keys.location,
    job_ids,
    intent: meta?.intent != null && String(meta.intent).trim() ? String(meta.intent).trim() : '',
  };
  const token = meta?.accessToken?.trim();
  if (token) payload.access_token = token;
  fetch('/api/auth-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.warn('[jobService] search_history_record failed:', err instanceof Error ? err.message : err);
  });
}

/** Hydrate canonical jobs from global_jobs by id (session restore; preserves order). */
export async function fetchWarehouseJobsByIds(jobIds: string[]): Promise<Job[] | null> {
  const ids = [...new Set(jobIds.map((x) => String(x)).filter(Boolean))].slice(0, 120);
  if (!ids.length) return null;
  try {
    const res = await fetch('/api/auth-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'warehouse_jobs_by_ids', job_ids: ids }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[jobService] warehouse_jobs_by_ids error:', res.status, err);
      return null;
    }
    const json = (await res.json()) as { data?: GlobalJobRow[] | null };
    const rows = json.data;
    if (!rows || !Array.isArray(rows) || rows.length === 0) return null;
    return rows.map(globalRowToJob);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[jobService] fetchWarehouseJobsByIds:', message);
    return null;
  }
}

export async function fetchGlobalJobsSavedFlags(jobIds: string[]): Promise<Record<string, boolean>> {
  const ids = [...new Set(jobIds.map((x) => String(x)).filter(Boolean))].slice(0, 200);
  if (!ids.length) return {};
  try {
    const res = await fetch('/api/auth-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'global_jobs_saved_flags', job_ids: ids }),
    });
    if (!res.ok) return {};
    const json = (await res.json()) as { flags?: Record<string, boolean> };
    return json.flags && typeof json.flags === 'object' ? json.flags : {};
  } catch {
    return {};
  }
}

export type SearchHistoryVaultRow = {
  id: string;
  keywords: string;
  location: string;
  intent: string;
  job_ids: string[];
  created_at: string;
};

export async function listSearchHistoryForUser(accessToken: string | null): Promise<SearchHistoryVaultRow[]> {
  const token = typeof accessToken === 'string' ? accessToken.trim() : '';
  if (!token) return [];
  try {
    const res = await fetch('/api/auth-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'search_history_list_for_user',
        access_token: token,
      }),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: SearchHistoryVaultRow[] };
    const rows = json.data;
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => ({
      id: String(r.id),
      keywords: String(r.keywords ?? ''),
      location: String(r.location ?? ''),
      intent: String(r.intent ?? ''),
      job_ids: Array.isArray(r.job_ids) ? r.job_ids.map((x) => String(x)) : [],
      created_at: String(r.created_at ?? ''),
    }));
  } catch {
    return [];
  }
}

export async function setGlobalJobSaved(jobId: string, isSaved: boolean): Promise<boolean> {
  const id = typeof jobId === 'string' ? jobId.trim() : '';
  if (!id) return false;
  try {
    const res = await fetch('/api/auth-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'global_jobs_set_saved',
        job_id: id,
        is_saved: isSaved,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Raw rows from global_jobs for the recent posting window (no relevance filter). */
async function fetchGlobalJobsRecentRows(): Promise<GlobalJobRow[]> {
  const since = new Date(Date.now() - WAREHOUSE_RECENT_HOURS * 60 * 60 * 1000).toISOString();
  try {
    const res = await fetch('/api/auth-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'query_jobs',
        title: '',
        location: undefined,
        posted_at_utc: since,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[jobService] fetchGlobalJobsRecentRows proxy error:', res.status, err);
      return [];
    }
    const json = (await res.json()) as { data?: GlobalJobRow[] };
    return Array.isArray(json.data) ? (json.data as GlobalJobRow[]) : [];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[jobService] fetchGlobalJobsRecentRows error:', message);
    return [];
  }
}

function warehouseRowMatchesRefinement(row: GlobalJobRow, refined: RefinedSearchQuery): boolean {
  const kws = refined.keywords.map((k) => k.toLowerCase()).filter(Boolean);
  const blob = `${row.title ?? ''} ${row.employer_name ?? ''} ${row.description ?? ''}`.toLowerCase();
  if (kws.length === 0) return true;
  const keywordMatch = kws.some((kw) => {
    if (blob.includes(kw)) return true;
    const parts = kw.split(/\s+/).filter((w) => w.length > 1);
    return parts.length > 0 && parts.every((w) => blob.includes(w));
  });
  if (!keywordMatch) return false;
  if (refined.filters.remote) {
    const locBlob = `${row.title ?? ''} ${row.description ?? ''} ${row.city ?? ''} ${row.state ?? ''}`.toLowerCase();
    if (!/\bremote\b|work\s*from\s*home|wfh/.test(locBlob)) return false;
  }
  const minSal = refined.filters.minSalary;
  if (typeof minSal === 'number' && minSal > 0) {
    const hi = row.max_salary ?? row.min_salary;
    if (hi != null && hi < minSal) return false;
  }
  return true;
}

function filterWarehouseRowsByRefinement(
  rows: GlobalJobRow[],
  refined: RefinedSearchQuery,
  fallbackQueryLine: string
): GlobalJobRow[] {
  const fresh = rows.filter((r) => postedAtIsFreshForLocalDb(r.posted_at_utc));
  const matched = fresh.filter((r) => warehouseRowMatchesRefinement(r, refined));
  if (matched.length > 0) return matched;
  const q = fallbackQueryLine.trim().toLowerCase();
  if (!q) return [];
  return fresh.filter((r) => {
    const blob = `${r.title ?? ''} ${r.employer_name ?? ''} ${r.description ?? ''}`.toLowerCase();
    return (
      blob.includes(q) ||
      q.split(/\s+/).some((w) => w.length > 1 && blob.includes(w)) ||
      blob.split(/\s+/).some((w) => w.length > 2 && q.includes(w))
    );
  });
}

/**
 * Database-first search: returns jobs from global_jobs posted in the last 48h
 * that match the query (title/employer/description). Uses auth-proxy to bypass ISP block on Supabase.
 * Returns null if we should hit APIs.
 */
async function searchWarehouseFirst(query: string): Promise<Job[] | null> {
  const q = query.trim().toLowerCase();
  const list = await fetchGlobalJobsRecentRows();
  const filtered = q
    ? list.filter(
        (r) =>
          (r.title ?? '').toLowerCase().includes(q) ||
          (r.employer_name ?? '').toLowerCase().includes(q) ||
          (r.description ?? '').toLowerCase().includes(q) ||
          q.split(/\s+/).some(
            (w) =>
              (r.title ?? '').toLowerCase().includes(w) || (r.employer_name ?? '').toLowerCase().includes(w)
          )
      )
    : list;
  const fresh = filtered.filter((r) => postedAtIsFreshForLocalDb(r.posted_at_utc));
  if (fresh.length > WAREHOUSE_MIN_JOBS_TO_SKIP_API) return fresh.map(globalRowToJob);
  return null;
}

/** Merge job lists; prefer primary order; drop duplicates by job_id or apply URL. */
export function mergeJobsDedupe(primary: Job[], secondary: Job[]): Job[] {
  const seenId = new Set<string>();
  const seenUrl = new Set<string>();
  const out: Job[] = [];

  const normUrl = (u: string) => u.trim().toLowerCase().split('?')[0] ?? '';

  const push = (j: Job) => {
    const id = String(j.job_id ?? '').trim();
    const rawUrl = String(j.job_apply_link ?? '').trim();
    const url = rawUrl && rawUrl !== '#' ? normUrl(rawUrl) : '';
    if (id && seenId.has(id)) return;
    if (url && seenUrl.has(url)) return;
    if (id) seenId.add(id);
    if (url) seenUrl.add(url);
    out.push(j);
  };

  for (const j of primary) push(j);
  for (const j of secondary) push(j);
  return out;
}

function fallbackRefineFromPrompt(userPrompt: string): RefinedSearchQuery {
  const trimmed = typeof userPrompt === 'string' ? userPrompt.trim() : '';
  const parts = trimmed ? trimmed.split(/\s+/).map((w) => w.replace(/[^\w\-+.#]/g, '')).filter(Boolean).slice(0, 10) : [];
  return {
    keywords: parts.length > 0 ? parts : ['professional'],
    filters: { remote: false, minSalary: 0 },
    seniority: 'any',
  };
}

function parseRefinedSearchJson(text: string): RefinedSearchQuery | null {
  try {
    const trimmed = (text ?? '').trim();
    const m = trimmed.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const o = JSON.parse(m[0]) as Record<string, unknown>;
    const rawKw = o.keywords;
    const keywords = Array.isArray(rawKw)
      ? rawKw.map((k) => String(k).trim()).filter(Boolean).slice(0, 12)
      : [];
    const fo = o.filters;
    const filtersObj = fo && typeof fo === 'object' ? (fo as Record<string, unknown>) : {};
    const remote = Boolean(filtersObj.remote);
    const minRaw = filtersObj.minSalary;
    const minSalary =
      typeof minRaw === 'number' && !Number.isNaN(minRaw)
        ? Math.max(0, Math.round(minRaw))
        : typeof minRaw === 'string' && /^\d+$/.test(minRaw.trim())
          ? parseInt(minRaw.trim(), 10)
          : 0;
    const seniority = typeof o.seniority === 'string' ? o.seniority.trim() || 'any' : 'any';
    if (keywords.length === 0) return null;
    return { keywords, filters: { remote, minSalary }, seniority };
  } catch {
    return null;
  }
}

async function callGenerateRefinePrompt(fullPrompt: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('Sign in required');

  const { apiFetch } = await import('../networkErrorHandler');

  const env = import.meta.env as Record<string, string | undefined>;
  const viteAiGenerateUrl = env.VITE_AI_GENERATE_URL;
  const viteAiApiBase = env.VITE_AI_API_BASE;
  let apiUrl: string;
  if (viteAiGenerateUrl) apiUrl = viteAiGenerateUrl;
  else if (viteAiApiBase) apiUrl = `${viteAiApiBase.replace(/\/$/, '')}/api/generate`;
  else if (typeof window !== 'undefined' && window.location?.hostname === 'localhost')
    apiUrl = 'http://localhost:3000/api/generate';
  else apiUrl = '/api/generate';

  const data = await apiFetch<{ content: string }>(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      systemMessage:
        'You convert job search prompts into a compact JSON object. Output ONLY valid JSON with keys: keywords (string[], 3–8 short search terms), filters (object with remote boolean, minSalary number; use 0 if not specified), seniority (string: one of entry, mid, senior, lead, any). Example: {"keywords":["React","frontend","TypeScript"],"filters":{"remote":true,"minSalary":120000},"seniority":"mid"}',
      prompt: fullPrompt,
      userId: user.id,
      feature_name: 'job_finder',
      jobTitle: 'Job Search',
    }),
    timeout: 45000,
    retries: 1,
  });
  return data.content || '';
}

/**
 * GPT-4o-mini query refiner for warehouse-first search.
 * Optional onKeywordsReveal: called with growing keyword prefix for a streaming-style UI (timed reveals).
 */
export async function refineSearchQuery(
  userPrompt: string,
  userResume: string,
  options?: { onKeywordsReveal?: (keywords: string[]) => void }
): Promise<RefinedSearchQuery> {
  const p = typeof userPrompt === 'string' ? userPrompt.trim() : '';
  const resume = typeof userResume === 'string' ? userResume.trim().slice(0, 3500) : '';
  const fullPrompt = `User search intent: ${p || 'jobs'}\n\nResume context (for disambiguation):\n${resume || '(none)'}`;

  let refined: RefinedSearchQuery;
  try {
    const raw = await callGenerateRefinePrompt(fullPrompt);
    refined = parseRefinedSearchJson(raw) ?? fallbackRefineFromPrompt(p);
  } catch (err) {
    console.warn('[jobService] refineSearchQuery:', err instanceof Error ? err.message : err);
    refined = fallbackRefineFromPrompt(p);
  }

  if (options?.onKeywordsReveal) {
    const kws = refined.keywords;
    const reveal = options.onKeywordsReveal;
    queueMicrotask(() => reveal([]));
    for (let i = 0; i < kws.length; i++) {
      await new Promise((r) => setTimeout(r, 48));
      reveal(kws.slice(0, i + 1));
    }
  }

  return refined;
}

export type UnifiedSearchOptions = SearchJobsOptions & {
  /** Fired as soon as warehouse rows are mapped to jobs (before optional JSearch merge). */
  onInstantWarehouse?: (jobs: Job[]) => void;
  /** Growing keyword prefixes while refining (streaming-style). */
  onKeywordsReveal?: (keywords: string[]) => void;
  /** Skip GPT refine (e.g. after Jobs History vault restore). Uses raw prompt tokens only. */
  skipRefine?: boolean;
};

/** Raw-keyword warehouse snapshot for perceived-fast first paint (runs in parallel with refine). */
async function emitSpeculativeWarehouseJobs(
  rowsPromise: Promise<GlobalJobRow[]>,
  promptLine: string,
  onInstantWarehouse?: (jobs: Job[]) => void
): Promise<void> {
  if (!onInstantWarehouse) return;
  try {
    const rows = await rowsPromise;
    const rawRefined = fallbackRefineFromPrompt(promptLine);
    const speculativeRows = filterWarehouseRowsByRefinement(rows, rawRefined, promptLine).slice(0, 120);
    const jobs = speculativeRows.map(globalRowToJob);
    if (jobs.length > 0) onInstantWarehouse(jobs);
  } catch (err) {
    console.warn('[jobService] emitSpeculativeWarehouseJobs:', err instanceof Error ? err.message : err);
  }
}

const UNIFIED_JSEARCH_WAREHOUSE_THRESHOLD = 10;

/**
 * Warehouse-first unified search: speculative raw-keyword warehouse (parallel) + refine → merge global_jobs → optional JSearch.
 */
export async function unifiedSearch(
  userPrompt: string,
  userResume: string,
  options?: UnifiedSearchOptions
): Promise<UnifiedSearchResult> {
  const promptLine = typeof userPrompt === 'string' ? userPrompt.trim() : '';
  const skipRefine = options?.skipRefine === true;

  const rowsPromise = fetchGlobalJobsRecentRows();
  if (!skipRefine) {
    void emitSpeculativeWarehouseJobs(rowsPromise, promptLine, options?.onInstantWarehouse);
  }

  const refined = skipRefine
    ? fallbackRefineFromPrompt(promptLine)
    : await refineSearchQuery(promptLine, userResume, {
        onKeywordsReveal: options?.onKeywordsReveal,
      });

  const rows = await rowsPromise;
  const matchedRows = filterWarehouseRowsByRefinement(rows, refined, promptLine).slice(0, 120);
  let warehouseJobs = matchedRows.map(globalRowToJob);
  if (skipRefine && warehouseJobs.length > 0) {
    options?.onInstantWarehouse?.(warehouseJobs);
  }

  let merged = warehouseJobs;
  let sourceQuality: 'deep' | 'standard' = warehouseJobs.length > 0 ? 'standard' : 'deep';

  if (warehouseJobs.length < UNIFIED_JSEARCH_WAREHOUSE_THRESHOLD) {
    const loc = (options?.location ?? '').trim();
    const jsearchQuery =
      [...refined.keywords, loc && !refined.filters.remote ? loc : '', refined.filters.remote ? 'remote' : '']
        .filter(Boolean)
        .join(' ')
        .trim() || promptLine;

    const jres = await fetchFromJSearch(jsearchQuery || 'jobs');
    if (!jres.limited && jres.jobs.length > 0) {
      saveJobsToWarehouse(jres.jobs);
      recordSearchHistoryAfterJSearch(jsearchQuery || promptLine, options?.location, jres.jobs, {
        intent: 'unified_search',
      });
      sourceQuality = 'deep';
    } else if (jres.status === 429 || jres.limited) {
      sourceQuality = 'standard';
    }
    merged = mergeJobsDedupe(warehouseJobs, jres.jobs);
  }

  return { jobs: merged, sourceQuality, refined };
}

// --- Raw API response types (for normalizer) ---
interface AdzunaJobRaw {
  id?: string;
  title?: string;
  description?: string;
  created?: string;
  redirect_url?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  location?: { display_name?: string; area?: string[] };
  company?: { display_name?: string };
  contract_type?: string;
}

interface JoinRiseJobRaw {
  _id?: string;
  title?: string;
  url?: string;
  locationAddress?: string;
  createdAt?: string;
  owner?: { companyName?: string; photo?: string };
  description?: string;
  full_description?: string;
  descriptionBreakdown?: {
    oneSentenceJobSummary?: string;
    fullDescription?: string;
    fullTextDescription?: string;
    description?: string;
    jobDescription?: string;
    longDescription?: string;
  };
  salaryRangeMinYearly?: number | null;
  salaryRangeMaxYearly?: number | null;
}

interface ArbeitnowJobRaw {
  slug?: string;
  title?: string;
  url?: string;
  location?: string;
  company_name?: string;
  description?: string;
  created_at?: number;
  salary_min?: number | null;
  salary_max?: number | null;
}

/** Safely string for id generation when API returns non-string. */
function toStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return String(v);
}

function longestNonEmptyString(...candidates: string[]): string {
  return candidates.reduce((best, s) => {
    const t = (s ?? '').trim();
    if (!t) return best;
    if (!best) return t;
    return t.length > best.length ? t : best;
  }, '');
}

function adzunaPrimaryDescription(a: AdzunaJobRaw): string {
  const r = a as Record<string, unknown>;
  const base = a.description != null ? String(a.description).trim() : '';
  return longestNonEmptyString(
    base,
    toStr(r.full_description),
    toStr(r.fullDescription),
    toStr(r.description_full),
    toStr(r.full_text),
    toStr(r.body)
  );
}

function joinRisePrimaryDescription(jr: JoinRiseJobRaw): string {
  const r = jr as Record<string, unknown>;
  const b = jr.descriptionBreakdown ?? {};
  const br = b as Record<string, unknown>;
  return longestNonEmptyString(
    jr.description != null ? String(jr.description).trim() : '',
    jr.full_description != null ? String(jr.full_description).trim() : '',
    toStr(r.full_description),
    toStr(r.description),
    toStr(b.oneSentenceJobSummary),
    toStr(br.fullDescription),
    toStr(br.fullTextDescription),
    toStr(br.description),
    toStr(br.jobDescription),
    toStr(br.longDescription)
  );
}

function arbeitnowPrimaryDescription(ar: ArbeitnowJobRaw): string {
  const r = ar as Record<string, unknown>;
  const base = ar.description != null ? String(ar.description).trim() : '';
  return longestNonEmptyString(base, toStr(r.full_description), toStr(r.full_text), toStr(r.body));
}

/** Safely get first line of location from various shapes. */
function locationDisplay(raw: AdzunaJobRaw | JoinRiseJobRaw | ArbeitnowJobRaw): string {
  if (!raw) return 'Remote';
  const r = raw as Record<string, unknown>;
  if (typeof r.locationAddress === 'string' && r.locationAddress.trim()) return (r.locationAddress as string).trim();
  if (r.location && typeof r.location === 'object') {
    const loc = r.location as { display_name?: string; name?: string };
    const s = loc.display_name || loc.name;
    if (typeof s === 'string' && s.trim()) return s.trim();
  }
  return 'Remote';
}

/**
 * Error-proof normalizer: converts any source shape to canonical Job.
 * Handles JSearch (passthrough), Adzuna, JoinRise, and Arbeitnow.
 */
function normalizeToJob(
  raw: Job | AdzunaJobRaw | JoinRiseJobRaw | ArbeitnowJobRaw,
  source: 'jsearch' | 'adzuna' | 'joinrise' | 'arbeitnow'
): Job {
  // Already canonical JSearch Job
  if (source === 'jsearch' && raw && 'job_id' in raw && 'job_title' in raw && 'employer_name' in raw) {
    const j = raw as Job;
    const jd = typeof j.job_description === 'string' ? j.job_description.trim() : '';
    const fullAlt = typeof j.full_description === 'string' ? j.full_description.trim() : '';
    const rawDesc = (fullAlt.length > jd.length ? fullAlt : jd) || fullAlt || jd;
    const rawSnip = typeof j.job_description_snippet === 'string' ? j.job_description_snippet : undefined;
    const unified = buildUnifiedDescription({
      job_description: rawDesc,
      job_description_snippet: rawSnip,
      job_highlights: j.job_highlights,
    });
    const greedy = buildGreedyFullText({
      job_description: rawDesc,
      job_description_snippet: rawSnip,
      job_highlights: j.job_highlights,
      job_benefits: j.job_benefits,
    });
    return {
      job_id: toStr(j.job_id),
      job_title: toStr(j.job_title),
      employer_name: toStr(j.employer_name),
      employer_logo: typeof j.employer_logo === 'string' ? j.employer_logo : null,
      unified_description: unified || undefined,
      job_listing_prose: rawDesc || undefined,
      job_source: 'JSearch',
      job_description: pickJobDescription(rawDesc || undefined, unified, greedy),
      greedy_full_text: greedy || undefined,
      job_description_snippet: rawSnip,
      job_benefits: Array.isArray(j.job_benefits)
        ? j.job_benefits.map((x) => (typeof x === 'string' ? x : String(x)))
        : typeof j.job_benefits === 'string'
          ? j.job_benefits
          : undefined,
      job_apply_link: toStr(j.job_apply_link) || '#',
      job_city: typeof j.job_city === 'string' ? j.job_city : null,
      job_state: typeof j.job_state === 'string' ? j.job_state : null,
      job_country: typeof j.job_country === 'string' ? j.job_country : null,
      job_posted_at_datetime_utc: typeof j.job_posted_at_datetime_utc === 'string' ? j.job_posted_at_datetime_utc : new Date().toISOString(),
      job_min_salary: typeof j.job_min_salary === 'number' ? j.job_min_salary : null,
      job_max_salary: typeof j.job_max_salary === 'number' ? j.job_max_salary : null,
      job_highlights: j.job_highlights,
      ...(fullAlt ? { full_description: fullAlt } : {}),
    };
  }

  if (source === 'adzuna') {
    const a = raw as AdzunaJobRaw;
    const loc = locationDisplay(a);
    const company = (a.company?.display_name != null ? String(a.company.display_name) : '') || 'Unknown';
    const title = (a.title != null ? String(a.title) : '') || 'Job';
    const id = (a.id != null ? String(a.id) : '') || `adz-${title.slice(0, 20)}-${Date.now()}`;
    const link = (a.redirect_url != null ? String(a.redirect_url) : '') || '#';
    const desc = adzunaPrimaryDescription(a);
    const created = (a.created != null ? String(a.created) : '') || new Date().toISOString();
    const unified = buildUnifiedDescription({ job_description: desc });
    const greedy = buildGreedyFullText({ job_description: desc });
    const picked = pickJobDescription(desc || undefined, unified, greedy);
    const thin = appendThinBoardFullPostingNotice(desc.trim().length, link, {
      job_description: picked,
      unified_description: unified || undefined,
      greedy_full_text: greedy || undefined,
    });
    return {
      job_id: id,
      job_title: title,
      employer_name: company,
      employer_logo: null,
      unified_description: thin.unified_description,
      job_listing_prose: desc.trim() || undefined,
      job_source: 'Adzuna',
      job_description: thin.job_description,
      greedy_full_text: thin.greedy_full_text,
      job_apply_link: link,
      job_city: loc || null,
      job_state: null,
      job_country: null,
      job_posted_at_datetime_utc: created,
      job_min_salary: typeof a.salary_min === 'number' ? a.salary_min : null,
      job_max_salary: typeof a.salary_max === 'number' ? a.salary_max : null,
      job_highlights: undefined,
    };
  }

  if (source === 'joinrise') {
    const jr = raw as JoinRiseJobRaw;
    const company = (jr.owner?.companyName != null ? String(jr.owner.companyName) : '') || 'Unknown';
    const title = (jr.title != null ? String(jr.title) : '') || 'Job';
    const id = (jr._id != null ? String(jr._id) : '') || `rise-${title.slice(0, 20)}-${Date.now()}`;
    const link = (jr.url != null ? String(jr.url) : '') || '#';
    const loc = (jr.locationAddress != null ? String(jr.locationAddress) : '') || 'Remote';
    const desc = joinRisePrimaryDescription(jr);
    const created = (jr.createdAt != null ? String(jr.createdAt) : '') || new Date().toISOString();
    const minS = jr.salaryRangeMinYearly;
    const maxS = jr.salaryRangeMaxYearly;
    const unified = buildUnifiedDescription({ job_description: desc });
    const greedy = buildGreedyFullText({ job_description: desc });
    const picked = pickJobDescription(desc || undefined, unified, greedy);
    const thin = appendThinBoardFullPostingNotice(desc.trim().length, link, {
      job_description: picked,
      unified_description: unified || undefined,
      greedy_full_text: greedy || undefined,
    });
    return {
      job_id: id,
      job_title: title,
      employer_name: company,
      employer_logo: typeof jr.owner?.photo === 'string' ? jr.owner.photo : null,
      unified_description: thin.unified_description,
      job_listing_prose: desc.trim() || undefined,
      job_source: 'JoinRise',
      job_description: thin.job_description,
      greedy_full_text: thin.greedy_full_text,
      job_apply_link: link,
      job_city: loc || null,
      job_state: null,
      job_country: null,
      job_posted_at_datetime_utc: created,
      job_min_salary: typeof minS === 'number' ? minS : null,
      job_max_salary: typeof maxS === 'number' ? maxS : null,
      job_highlights: undefined,
    };
  }

  if (source === 'arbeitnow') {
    const ar = raw as ArbeitnowJobRaw;
    const loc = (ar.location != null ? String(ar.location) : '') || locationDisplay(ar);
    const company = (ar.company_name != null ? String(ar.company_name) : '') || 'Unknown';
    const title = (ar.title != null ? String(ar.title) : '') || 'Job';
    const id = (ar.slug != null ? String(ar.slug) : '') || `arb-${title.slice(0, 20)}-${Date.now()}`;
    const link = (ar.url != null ? String(ar.url) : '') || '#';
    const desc = arbeitnowPrimaryDescription(ar);
    const created =
      typeof ar.created_at === 'number'
        ? new Date(ar.created_at * 1000).toISOString()
        : new Date().toISOString();
    const unified = buildUnifiedDescription({ job_description: desc });
    const greedy = buildGreedyFullText({ job_description: desc });
    const picked = pickJobDescription(desc || undefined, unified, greedy);
    const thin = appendThinBoardFullPostingNotice(desc.trim().length, link, {
      job_description: picked,
      unified_description: unified || undefined,
      greedy_full_text: greedy || undefined,
    });
    return {
      job_id: id,
      job_title: title,
      employer_name: company,
      employer_logo: null,
      unified_description: thin.unified_description,
      job_listing_prose: desc.trim() || undefined,
      job_source: 'Arbeitnow',
      job_description: thin.job_description,
      greedy_full_text: thin.greedy_full_text,
      job_apply_link: link,
      job_city: loc || null,
      job_state: null,
      job_country: null,
      job_posted_at_datetime_utc: created,
      job_min_salary: typeof ar.salary_min === 'number' ? ar.salary_min : null,
      job_max_salary: typeof ar.salary_max === 'number' ? ar.salary_max : null,
      job_highlights: undefined,
    };
  }

  // Fallback: minimal Job from unknown shape
  const r = raw as Record<string, unknown>;
  const jdFallback = toStr(r.job_description ?? r.description);
  const fullFallback =
    typeof r.full_description === 'string' ? String(r.full_description).trim() : '';
  const rawDesc = fullFallback.length > jdFallback.length ? fullFallback : jdFallback;
  const rawSnip = typeof r.job_description_snippet === 'string' ? r.job_description_snippet : undefined;
  const rawHl = r.job_highlights as JobHighlights | undefined;
  const unified = buildUnifiedDescription({
    job_description: rawDesc,
    job_description_snippet: rawSnip,
    job_highlights: rawHl,
  });
  const greedy = buildGreedyFullText({
    job_description: rawDesc,
    job_description_snippet: rawSnip,
    job_highlights: rawHl,
    job_benefits: r.job_benefits as Job['job_benefits'],
  });
  return {
    job_id: toStr(r.job_id ?? r.id ?? r._id) || `job-${Date.now()}`,
    job_title: toStr(r.job_title ?? r.title) || 'Job',
    employer_name: toStr(r.employer_name ?? r.company_name ?? r.company?.display_name ?? r.owner?.companyName) || 'Unknown',
    employer_logo: typeof r.employer_logo === 'string' ? r.employer_logo : null,
    unified_description: unified || undefined,
    job_listing_prose: rawDesc.trim() || undefined,
    job_source:
      typeof r.job_source === 'string' && r.job_source.trim() ? r.job_source.trim() : undefined,
    job_description: pickJobDescription(rawDesc || undefined, unified, greedy),
    greedy_full_text: greedy || undefined,
    job_apply_link: toStr(r.job_apply_link ?? r.redirect_url ?? r.url) || '#',
    job_city: toStr(r.job_city ?? r.locationAddress ?? r.location?.display_name ?? r.location?.name) || null,
    job_state: null,
    job_country: null,
    job_posted_at_datetime_utc: toStr(r.job_posted_at_datetime_utc ?? r.created ?? r.createdAt) || new Date().toISOString(),
    job_min_salary: typeof r.job_min_salary === 'number' ? r.job_min_salary : typeof (r as { salary_min?: number }).salary_min === 'number' ? (r as { salary_min: number }).salary_min : null,
    job_max_salary: typeof r.job_max_salary === 'number' ? r.job_max_salary : typeof (r as { salary_max?: number }).salary_max === 'number' ? (r as { salary_max: number }).salary_max : null,
    job_highlights: undefined,
    ...(fullFallback ? { full_description: fullFallback } : {}),
  };
}

// --- Step 1: JSearch ---
async function fetchFromJSearch(query: string): Promise<{ jobs: Job[]; status: number; limited: boolean }> {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST;
  const empty = { jobs: [] as Job[], status: 0, limited: true };

  if (!apiKey || !apiHost) {
    console.error('[jobService] Missing env: VITE_RAPIDAPI_KEY or VITE_RAPIDAPI_HOST');
    return empty;
  }

  try {
    const params = new URLSearchParams({
      query: query.trim(),
      page: '1',
      num_pages: '3',
    });
    const url = `${JSEARCH_SEARCH_URL}?${params.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      },
    });

    if (res.status === 429 || res.status === 403) {
      return { jobs: [], status: res.status, limited: true };
    }
    if (!res.ok) {
      const body = await res.text();
      console.error('[jobService] JSearch API error:', res.status, res.statusText, body);
      return { jobs: [], status: res.status, limited: false };
    }

    const data: JSearchSearchResponse = await res.json();
    const raw = data?.data ?? [];
    const arr = Array.isArray(raw) ? raw : [];
    const jobs = arr.map((item) => normalizeToJob(item as Job, 'jsearch'));
    const limited = res.status === 429 || jobs.length === 0;
    return { jobs, status: res.status, limited };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[jobService] JSearch fetch failed:', message);
    return empty;
  }
}

/**
 * True when JSearch `job-details` should run. Pass **main listing prose only** (`job_listing_prose`:
 * API job_description / full_description, no highlight or benefit padding). Callers must not pass
 * `greedy_full_text` or that can suppress deep fetch while the primary paragraph is still short.
 */
export function shouldDeepFetchJobDescription(mainListingProse: string | undefined | null): boolean {
  const t = normalizeTruncationProbe((mainListingProse ?? '').trim());
  if (endsWithTruncationMarker(t)) return true;
  if (t.length < JOB_DESCRIPTION_DEEP_FETCH_THRESHOLD * 2 && descriptionContainsTruncationMarker(t)) return true;
  return t.length < JOB_DESCRIPTION_DEEP_FETCH_THRESHOLD;
}

export interface FetchJSearchJobDetailsOptions {
  /** ISO 3166-1 alpha-2; improves match for some boards */
  country?: string | null;
}

/**
 * Fetches a single job from JSearch `job-details` (full HTML description).
 * Returns null if keys are missing, request fails, or the id is not a JSearch job.
 */
export async function fetchJSearchJobDetails(
  jobId: string,
  options?: FetchJSearchJobDetailsOptions
): Promise<Job | null> {
  const id = typeof jobId === 'string' ? jobId.trim() : '';
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST;
  if (!id || !apiKey || !apiHost) return null;

  try {
    const params = new URLSearchParams({ job_id: id });
    const c = options?.country?.trim();
    if (c) params.set('country', c.toLowerCase());
    // JSearch: `language` is supported across search/job-details; improves consistent EN bodies on some hosts.
    params.set('language', 'en');
    const url = `${JSEARCH_JOB_DETAILS_URL}?${params.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn('[jobService] JSearch job-details error:', res.status, body.slice(0, 200));
      return null;
    }
    const data: JSearchSearchResponse = await res.json();
    const raw = data?.data ?? [];
    const arr = Array.isArray(raw) ? raw : [];
    const first = arr[0];
    if (!first || typeof first !== 'object') return null;
    return normalizeToJob(first as Job, 'jsearch');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[jobService] JSearch job-details failed:', message);
    return null;
  }
}

// --- Adzuna: global country mapper (supported: in, gb, us, de, ca, au) ---
const ADZUNA_DEFAULT_COUNTRY = 'in';

/** Location keywords (cities, regions, country names) → Adzuna country code. */
const LOCATION_TO_ADZUNA: Array<{ keys: string[]; code: string }> = [
  { keys: ['india', 'hyderabad', 'mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'pune', 'ahmedabad'], code: 'in' },
  { keys: ['united kingdom', 'uk', 'britain', 'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'bristol', 'edinburgh'], code: 'gb' },
  { keys: ['united states', 'usa', 'us', 'america', 'new york', 'san francisco', 'los angeles', 'chicago', 'boston', 'seattle', 'austin', 'denver', 'miami', 'washington'], code: 'us' },
  { keys: ['germany', 'deutschland', 'berlin', 'munich', 'hamburg', 'frankfurt', 'cologne', 'stuttgart', 'düsseldorf'], code: 'de' },
  { keys: ['canada', 'toronto', 'vancouver', 'montreal', 'calgary', 'ottawa', 'edmonton'], code: 'ca' },
  { keys: ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra'], code: 'au' },
];

/**
 * Maps a location string (e.g. 'London', 'Hyderabad') to Adzuna country code.
 * Hierarchy: locString first → if empty/unknown use ipDetectedCity → else default 'in'.
 */
export function mapLocationToAdzunaCountry(locString?: string | null, ipDetectedCity?: string | null): string {
  const normalize = (s: string) => s.trim().toLowerCase();
  const match = (s: string): string | null => {
    const n = normalize(s);
    if (!n) return null;
    for (const { keys, code } of LOCATION_TO_ADZUNA) {
      if (keys.some((k) => n === k || n.includes(k) || k.includes(n))) return code;
    }
    return null;
  };

  const fromLoc = locString != null && locString !== '' ? match(locString) : null;
  if (fromLoc) return fromLoc;
  const fromIp = ipDetectedCity != null && ipDetectedCity !== '' ? match(ipDetectedCity) : null;
  if (fromIp) return fromIp;
  return ADZUNA_DEFAULT_COUNTRY;
}

// --- Step 2: Adzuna (dynamic country from mapper) ---
async function fetchFromAdzuna(query: string, countryCode: string): Promise<Job[]> {
  const appId = import.meta.env.VITE_ADZUNA_APP_ID;
  const appKey = import.meta.env.VITE_ADZUNA_APP_KEY;
  const country = (countryCode || ADZUNA_DEFAULT_COUNTRY).toLowerCase();

  if (!appId || !appKey) {
    return [];
  }

  try {
    const base = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`;
    const encodedQuery = encodeURIComponent(query.trim().slice(0, 200));
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: '20',
    });
    const url = `${base}?${params.toString()}&what=${encodedQuery}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: AdzunaJobRaw[] };
    const results = Array.isArray(json?.results) ? json.results : [];
    return results.map((item) => normalizeToJob(item, 'adzuna'));
  } catch (err) {
    console.error('[jobService] Adzuna fetch failed:', err);
    return [];
  }
}

// --- Step 3 (safety net): JoinRise public API ---
async function fetchFromJoinRise(query: string): Promise<Job[]> {
  try {
    const res = await fetch(
      `https://api.joinrise.io/api/v1/jobs/public?limit=30`,
      { method: 'GET' }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { result?: { jobs?: JoinRiseJobRaw[] }; success?: boolean };
    const list = json?.result?.jobs ?? [];
    if (!Array.isArray(list)) return [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter((j) => {
          const t = (j.title ?? '').toLowerCase();
          const c = (j.owner?.companyName ?? '').toLowerCase();
          return t.includes(q) || c.includes(q) || q.split(/\s+/).some((w) => t.includes(w) || c.includes(w));
        })
      : list.slice(0, 25);
    return filtered.map((item) => normalizeToJob(item, 'joinrise'));
  } catch (err) {
    console.error('[jobService] JoinRise fetch failed:', err);
    return [];
  }
}

// --- Step 3 (safety net): Arbeitnow (public API, no key) ---
async function fetchFromArbeitnow(query: string): Promise<Job[]> {
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', { method: 'GET' });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: ArbeitnowJobRaw[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter((j) => {
          const t = (j.title ?? '').toLowerCase();
          const c = (j.company_name ?? '').toLowerCase();
          const loc = (j.location ?? '').toLowerCase();
          return t.includes(q) || c.includes(q) || loc.includes(q) || q.split(/\s+/).some((w) => t.includes(w) || c.includes(w));
        })
      : list.slice(0, 25);
    return filtered.map((item) => normalizeToJob(item, 'arbeitnow'));
  } catch (err) {
    console.error('[jobService] Arbeitnow fetch failed:', err);
    return [];
  }
}

/**
 * Waterfall fallback: JSearch → (if 429 or empty) Adzuna → (if still empty) Arbeitnow then JoinRise.
 * User never sees an error; they get jobs from whichever source succeeds.
 * Returns { jobs, sourceQuality: 'standard' } when using fallback so UI can show "Deep Analysis limited" if desired.
 */
const LOCATION_QUERY_FALLBACK = 'Hyderabad';

export interface SearchJobsOptions {
  location?: string | null;
  ipDetectedCity?: string | null;
}

export async function searchJobs(query: string, options?: SearchJobsOptions): Promise<SearchJobsResult> {
  let trimmed = typeof query === 'string' ? query.trim() : '';
  if (trimmed === '[object Object]' || !trimmed) {
    trimmed = LOCATION_QUERY_FALLBACK;
  } else if (trimmed.includes('[object Object]')) {
    trimmed = trimmed.replace(/\[object Object\]/g, LOCATION_QUERY_FALLBACK).trim();
  }

  // Database-first: if we have enough relevant jobs in the last 48h, return them and skip APIs
  const warehouseJobs = await searchWarehouseFirst(trimmed);
  if (warehouseJobs && warehouseJobs.length > WAREHOUSE_MIN_JOBS_TO_SKIP_API) {
    return { jobs: warehouseJobs, sourceQuality: 'standard' };
  }

  // JSearch 12h query cache (keywords + location): avoid duplicate RapidAPI search calls
  const cachedJSearch = await trySearchHistoryBeforeJSearch(trimmed, options?.location);
  if (cachedJSearch && cachedJSearch.length > 0) {
    return { jobs: cachedJSearch, sourceQuality: 'deep' };
  }

  // Step 1: JSearch
  const jsearch = await fetchFromJSearch(trimmed);
  if (!jsearch.limited && jsearch.jobs.length > 0) {
    saveJobsToWarehouse(jsearch.jobs);
    recordSearchHistoryAfterJSearch(trimmed, options?.location, jsearch.jobs);
    return { jobs: jsearch.jobs, sourceQuality: 'deep' };
  }

  // JSearch 429 (or empty): don't stop — immediately trigger Adzuna and Warehouse in parallel
  if (jsearch.status === 429) {
    console.warn('🚨 JSearch 429 — triggering Adzuna and Warehouse (Global Jobs) in parallel.');
  } else if (jsearch.limited && jsearch.jobs.length === 0) {
    console.warn('🚨 JSearch Limited - Switching to Adzuna.');
  }

  const adzunaCountry = mapLocationToAdzunaCountry(options?.location, options?.ipDetectedCity);
  const [adzunaJobs, warehouseJobsOn429] = await Promise.all([
    fetchFromAdzuna(trimmed, adzunaCountry),
    jsearch.status === 429 ? searchWarehouseFirst(trimmed) : Promise.resolve(null),
  ]);

  if (adzunaJobs.length > 0) {
    saveJobsToWarehouse(adzunaJobs);
    return { jobs: adzunaJobs, sourceQuality: 'standard' };
  }
  if (jsearch.status === 429 && warehouseJobsOn429 && warehouseJobsOn429.length > 0) {
    return { jobs: warehouseJobsOn429, sourceQuality: 'standard' };
  }

  console.log('📡 Adzuna empty, falling back to public sources...');

  // Step 3: Zero-result waterfall fallback — try Arbeitnow and JoinRise
  const [arbeitnowJobs, joinRiseJobs] = await Promise.all([
    fetchFromArbeitnow(trimmed),
    fetchFromJoinRise(trimmed),
  ]);
  const combined = [...arbeitnowJobs, ...joinRiseJobs];
  if (combined.length > 0) {
    saveJobsToWarehouse(combined);
    return { jobs: combined, sourceQuality: 'standard' };
  }

  return { jobs: [] };
}

/** Career prefs for the Job Finder adversarial audit (see `getJobRecommendations` in predictiveJobMatching). */
export type { CareerPreferences } from '../predictiveJobMatching';
