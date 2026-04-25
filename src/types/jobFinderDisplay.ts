import type { JobHighlights } from './job';

/**
 * Job Finder UI row model (aligned with jobService JSearch + AI layer).
 * Shared so the detail pane can live outside `JobFinder.tsx` without circular imports.
 */
export interface Job {
  id: string;
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
  reasons?: string[];
  daysAgo?: string;
  experienceLevel?: string;
  jobHighlights?: JobHighlights;
  snippet?: string;
  job_description?: string;
  job_description_snippet?: string;
  job_benefits?: string;
  greedy_full_text?: string;
  full_description?: string;
  unified_description?: string;
  jsearch_details_fetched?: boolean;
  is_permanently_truncated?: boolean;
  job_google_link?: string;
  job_listing_prose?: string;
  job_source?: string;
  job_country?: string | null;
  skills?: string[];
  warnings?: string[];
  matchHighlights?: string[];
}
