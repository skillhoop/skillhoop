/**
 * JSearch API (RapidAPI) job object – matches the standard JSearch JSON response.
 */
export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_description: string;
  job_apply_link: string;
  job_city: string | null;
  job_state: string | null;
  job_country: string | null;
  job_posted_at_datetime_utc: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
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
