/**
 * JSearch API (RapidAPI) job object – matches the standard JSearch JSON response.
 */
/** JSearch job_highlights (optional); keys may include Qualifications, Responsibilities, etc. */
export interface JobHighlights {
  Qualifications?: string[];
  Responsibilities?: string[];
  /** Present on some JSearch postings */
  Skills?: string[];
  [key: string]: string[] | undefined;
}

export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_description?: string;
  /**
   * Raw listing body from the provider (longer of job_description vs full_description when both exist).
   * Excludes highlight/benefit merges — use for JSearch job-details gating so bullets don’t mask short prose.
   */
  job_listing_prose?: string;
  /** Board that supplied this row after normalization (JSearch, Adzuna, JoinRise, Arbeitnow, …). */
  job_source?: string;
  /** Some JSearch/job-details payloads expose a separate full body field */
  full_description?: string;
  /** Description + snippet + Qualifications/Responsibilities only (no skills/benefits); preferred body when API description is short */
  unified_description?: string;
  /** Concatenation of description, snippet, highlights, benefits for parsing and fallbacks */
  greedy_full_text?: string;
  /** Short description variant returned by some boards / JSearch */
  job_description_snippet?: string;
  /** Benefits copy as string or list of strings */
  job_benefits?: string | string[];
  job_apply_link: string;
  /** Some JSearch rows expose a Google job search URL distinct from the apply link */
  job_google_link?: string;
  job_city: string | null;
  job_state: string | null;
  job_country: string | null;
  job_posted_at_datetime_utc: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_highlights?: JobHighlights;
  /** Adversarial audit: high-confidence posting issues (e.g. remote mismatch, red flags). */
  warnings?: string[];
  /** Positive signals surfaced by the same audit pass (optional). */
  matchHighlights?: string[];
}

/**
 * JSearch API search response wrapper.
 */
export interface JSearchSearchResponse {
  data?: Job[];
  status?: string;
  request_id?: string;
  parameters?: Record<string, unknown>;
}

/**
 * Result of searchJobs (waterfall). Use .jobs for the list.
 * sourceQuality: 'deep' = JSearch (full analysis); 'standard' = fallback source (Adzuna/Arbeitnow/JoinRise).
 */
export interface SearchJobsResult {
  jobs: Job[];
  sourceQuality?: 'deep' | 'standard';
}

/** LLM-structured job search facets (warehouse + JSearch). */
export interface RefinedSearchQuery {
  keywords: string[];
  filters: { remote: boolean; minSalary: number };
  seniority: string;
}

export interface UnifiedSearchResult extends SearchJobsResult {
  refined: RefinedSearchQuery;
}
