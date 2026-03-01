import type { Job, JSearchSearchResponse, SearchJobsResult } from '../../types/job';
import { supabase } from '../supabase';

const JSEARCH_SEARCH_URL = 'https://jsearch.p.rapidapi.com/search';

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

/** Maps a global_jobs row back to our unified Job type. */
function globalRowToJob(row: GlobalJobRow): Job {
  return {
    job_id: row.id,
    job_title: row.title,
    employer_name: row.employer_name,
    employer_logo: row.employer_logo,
    job_description: row.description ?? undefined,
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
 * Database-first search: returns jobs from global_jobs posted in the last 48h
 * that match the query (title/employer/description). Uses auth-proxy to bypass ISP block on Supabase.
 * Returns null if we should hit APIs.
 */
async function searchWarehouseFirst(query: string): Promise<Job[] | null> {
  const q = query.trim().toLowerCase();
  const since = new Date(Date.now() - WAREHOUSE_RECENT_HOURS * 60 * 60 * 1000).toISOString();

  try {
    const res = await fetch('/api/auth-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'query_jobs',
        title: query.trim(),
        location: undefined,
        posted_at_utc: since,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[jobService] searchWarehouseFirst proxy error:', res.status, err);
      return null;
    }
    const json = (await res.json()) as { data?: GlobalJobRow[] };
    const list = (json.data ?? []) as GlobalJobRow[];
    const filtered = q
      ? list.filter(
          (r) =>
            (r.title ?? '').toLowerCase().includes(q) ||
            (r.employer_name ?? '').toLowerCase().includes(q) ||
            (r.description ?? '').toLowerCase().includes(q) ||
            q.split(/\s+/).some(
              (w) =>
                (r.title ?? '').toLowerCase().includes(w) ||
                (r.employer_name ?? '').toLowerCase().includes(w)
            )
        )
      : list;
    if (filtered.length > WAREHOUSE_MIN_JOBS_TO_SKIP_API) return filtered.map(globalRowToJob);
    return null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[jobService] searchWarehouseFirst error:', message);
    return null;
  }
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
  descriptionBreakdown?: { oneSentenceJobSummary?: string };
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
    return {
      job_id: toStr(j.job_id),
      job_title: toStr(j.job_title),
      employer_name: toStr(j.employer_name),
      employer_logo: typeof j.employer_logo === 'string' ? j.employer_logo : null,
      job_description: typeof j.job_description === 'string' ? j.job_description : undefined,
      job_apply_link: toStr(j.job_apply_link) || '#',
      job_city: typeof j.job_city === 'string' ? j.job_city : null,
      job_state: typeof j.job_state === 'string' ? j.job_state : null,
      job_country: typeof j.job_country === 'string' ? j.job_country : null,
      job_posted_at_datetime_utc: typeof j.job_posted_at_datetime_utc === 'string' ? j.job_posted_at_datetime_utc : new Date().toISOString(),
      job_min_salary: typeof j.job_min_salary === 'number' ? j.job_min_salary : null,
      job_max_salary: typeof j.job_max_salary === 'number' ? j.job_max_salary : null,
      job_highlights: j.job_highlights,
    };
  }

  if (source === 'adzuna') {
    const a = raw as AdzunaJobRaw;
    const loc = locationDisplay(a);
    const company = (a.company?.display_name != null ? String(a.company.display_name) : '') || 'Unknown';
    const title = (a.title != null ? String(a.title) : '') || 'Job';
    const id = (a.id != null ? String(a.id) : '') || `adz-${title.slice(0, 20)}-${Date.now()}`;
    const link = (a.redirect_url != null ? String(a.redirect_url) : '') || '#';
    const desc = (a.description != null ? String(a.description) : '') || '';
    const created = (a.created != null ? String(a.created) : '') || new Date().toISOString();
    return {
      job_id: id,
      job_title: title,
      employer_name: company,
      employer_logo: null,
      job_description: desc || undefined,
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
    const desc = (jr.descriptionBreakdown?.oneSentenceJobSummary != null ? String(jr.descriptionBreakdown.oneSentenceJobSummary) : '') || '';
    const created = (jr.createdAt != null ? String(jr.createdAt) : '') || new Date().toISOString();
    const minS = jr.salaryRangeMinYearly;
    const maxS = jr.salaryRangeMaxYearly;
    return {
      job_id: id,
      job_title: title,
      employer_name: company,
      employer_logo: typeof jr.owner?.photo === 'string' ? jr.owner.photo : null,
      job_description: desc || undefined,
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
    const desc = (ar.description != null ? String(ar.description) : '') || '';
    const created =
      typeof ar.created_at === 'number'
        ? new Date(ar.created_at * 1000).toISOString()
        : new Date().toISOString();
    return {
      job_id: id,
      job_title: title,
      employer_name: company,
      employer_logo: null,
      job_description: desc || undefined,
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
  return {
    job_id: toStr(r.job_id ?? r.id ?? r._id) || `job-${Date.now()}`,
    job_title: toStr(r.job_title ?? r.title) || 'Job',
    employer_name: toStr(r.employer_name ?? r.company_name ?? r.company?.display_name ?? r.owner?.companyName) || 'Unknown',
    employer_logo: typeof r.employer_logo === 'string' ? r.employer_logo : null,
    job_description: typeof r.job_description === 'string' ? r.job_description : undefined,
    job_apply_link: toStr(r.job_apply_link ?? r.redirect_url ?? r.url) || '#',
    job_city: toStr(r.job_city ?? r.locationAddress ?? r.location?.display_name ?? r.location?.name) || null,
    job_state: null,
    job_country: null,
    job_posted_at_datetime_utc: toStr(r.job_posted_at_datetime_utc ?? r.created ?? r.createdAt) || new Date().toISOString(),
    job_min_salary: typeof r.job_min_salary === 'number' ? r.job_min_salary : typeof (r as { salary_min?: number }).salary_min === 'number' ? (r as { salary_min: number }).salary_min : null,
    job_max_salary: typeof r.job_max_salary === 'number' ? r.job_max_salary : typeof (r as { salary_max?: number }).salary_max === 'number' ? (r as { salary_max: number }).salary_max : null,
    job_highlights: undefined,
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

  // Step 1: JSearch
  const jsearch = await fetchFromJSearch(trimmed);
  if (!jsearch.limited && jsearch.jobs.length > 0) {
    saveJobsToWarehouse(jsearch.jobs);
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
