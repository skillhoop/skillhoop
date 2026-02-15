/**
 * JSearch API (RapidAPI) job object – matches the standard JSearch JSON response.
 */
/** JSearch job_highlights (optional); keys may include Qualifications, Responsibilities, etc. */
export interface JobHighlights {
  Qualifications?: string[];
  Responsibilities?: string[];
  [key: string]: string[] | undefined;
}

export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_description?: string;
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
