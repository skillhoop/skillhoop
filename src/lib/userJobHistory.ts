import { supabase } from './supabase';

export type JobFinderUiState = {
  searchBarFilters?: Record<string, string>;
  resumeFilters?: Record<string, string>;
  quickSearchJobTitle?: string;
  quickSearchLocation?: string;
  willingToRelocate?: boolean;
  sourceQualityNote?: 'deep' | 'standard' | null;
  selectedSearchStrategy?: string | null;
};

export type UserJobHistoryRow = {
  id: string;
  query: string;
  intent: string | null;
  job_ids: string[];
  jobs_snapshot: unknown;
  ui_state: JobFinderUiState;
  created_at: string;
};

const SESSION_RESTORE_KEY = 'job_finder_session_restore';
const WAREHOUSE_RESTORE_KEY = 'job_finder_warehouse_restore';
/** `sessionStorage` mirror of current result list in Job Finder (see `setJobFinderResultsSessionStorage`). */
export const JOB_FINDER_RESULTS_KEY = 'job_finder_results';

const JOB_FINDER_SESSION_MAX_BYTES = 4 * 1024 * 1024;

function utf8ByteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

function warnDevOversize(): void {
  if (import.meta.env.DEV) {
    console.warn(
      '[userJobHistory] Job Finder storage payload exceeded 4MB; storing only the first 10 jobs to avoid sessionStorage quota errors.',
    );
  }
}

function firstTenJobsOrEmpty<T>(jobs: T[]): T[] {
  if (!Array.isArray(jobs) || jobs.length <= 10) return jobs;
  return jobs.slice(0, 10);
}

export function intentStrategyToBadgeLabel(intent: string | null | undefined): string {
  switch (intent) {
    case 'industry_switch':
      return 'Industry Switch';
    case 'skill_based':
      return 'Skill-Based Match';
    case 'career_progression':
      return 'Career Step';
    case 'passion_based':
      return 'Passion & Interests';
    case 'background':
      return 'Background Match';
    default:
      return intent ? intent.replace(/_/g, ' ') : 'Personalized Search';
  }
}

export async function listUserJobHistory(limit = 100): Promise<UserJobHistoryRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_job_history')
    .select('id, query, intent, job_ids, jobs_snapshot, ui_state, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[userJobHistory] list failed:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    query: row.query ?? '',
    intent: row.intent ?? null,
    job_ids: Array.isArray(row.job_ids) ? row.job_ids : [],
    jobs_snapshot: row.jobs_snapshot,
    ui_state: (row.ui_state && typeof row.ui_state === 'object' ? row.ui_state : {}) as JobFinderUiState,
    created_at: row.created_at,
  }));
}

export async function insertUserJobHistory(payload: {
  query: string;
  intent: string | null;
  jobIds: string[];
  jobsSnapshot: unknown[];
  uiState: JobFinderUiState;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('user_job_history').insert({
    user_id: user.id,
    query: payload.query,
    intent: payload.intent,
    job_ids: payload.jobIds,
    jobs_snapshot: payload.jobsSnapshot,
    ui_state: payload.uiState,
  });

  if (error) {
    console.warn('[userJobHistory] insert failed:', error.message);
  }
}

export function writeJobFinderSessionRestore(jobs: unknown[], meta: JobFinderUiState): void {
  try {
    let toStore: unknown[] = Array.isArray(jobs) ? jobs : [];
    let payload = JSON.stringify({ jobs: toStore, meta });
    if (utf8ByteLength(payload) > JOB_FINDER_SESSION_MAX_BYTES) {
      warnDevOversize();
      toStore = firstTenJobsOrEmpty(toStore);
      payload = JSON.stringify({ jobs: toStore, meta });
    }
    sessionStorage.setItem(SESSION_RESTORE_KEY, payload);
  } catch {
    /* ignore quota */
  }
}

export const JOB_FINDER_SESSION_RESTORE_KEY = SESSION_RESTORE_KEY;

/** Session restore: Job Finder hydrates from global_jobs by job id (no new search API). */
export function writeJobFinderWarehouseRestore(jobIds: string[], meta: JobFinderUiState): void {
  try {
    let ids: string[] = Array.isArray(jobIds) ? jobIds.map((x) => String(x)).filter(Boolean) : [];
    let payload = JSON.stringify({ jobIds: ids, meta });
    if (utf8ByteLength(payload) > JOB_FINDER_SESSION_MAX_BYTES) {
      warnDevOversize();
      ids = firstTenJobsOrEmpty(ids);
      payload = JSON.stringify({ jobIds: ids, meta });
    }
    sessionStorage.setItem(WAREHOUSE_RESTORE_KEY, payload);
  } catch {
    /* ignore quota */
  }
}

/** Persists the current result list; trims to 10 jobs if the JSON would exceed ~4MB. */
export function setJobFinderResultsSessionStorage(jobs: unknown[]): void {
  try {
    let list: unknown[] = Array.isArray(jobs) ? jobs : [];
    let payload = JSON.stringify(list);
    if (utf8ByteLength(payload) > JOB_FINDER_SESSION_MAX_BYTES) {
      warnDevOversize();
      list = firstTenJobsOrEmpty(list);
      payload = JSON.stringify(list);
    }
    sessionStorage.setItem(JOB_FINDER_RESULTS_KEY, payload);
  } catch {
    /* ignore quota */
  }
}

export const JOB_FINDER_WAREHOUSE_RESTORE_KEY = WAREHOUSE_RESTORE_KEY;
