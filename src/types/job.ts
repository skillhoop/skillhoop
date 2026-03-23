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
  /** Short description variant returned by some boards / JSearch */
  job_description_snippet?: string;
  /** Benefits copy as string or list of strings */
  job_benefits?: string | string[];
  job_apply_link: string;
  job_city: string | null;
  job_state: string | null;
  job_country: string | null;
  job_posted_at_datetime_utc: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_highlights?: JobHighlights;
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
