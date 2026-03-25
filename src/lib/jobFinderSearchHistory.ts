/**
 * Persisted Job Finder personalized search sessions (localStorage).
 * Used from Job Finder (record) and Work History Manager (list + reopen).
 */

const STORAGE_KEY = 'job_finder_search_history';
const MAX_ENTRIES = 30;

export const JOB_FINDER_STRATEGY_LABELS: Record<string, string> = {
  background: 'Your Background',
  career_progression: 'Next Career Step',
  skill_based: 'Skill-Based Match',
  passion_based: 'Passion & Interests',
  industry_switch: 'Industry Switch',
};

export function strategyIdToLabel(strategyId: string | null | undefined): string | null {
  if (strategyId == null || strategyId === '') return null;
  return JOB_FINDER_STRATEGY_LABELS[strategyId] ?? strategyId;
}

/** UI/session fields to reapply when reopening a saved search in the workspace */
export interface JobFinderSessionRestoreV1 {
  quickSearchJobTitle: string;
  quickSearchLocation: string;
  selectedSearchStrategy: string | null;
  activeResume: string | null;
  willingToRelocate: boolean;
}

export interface JobFinderSearchHistoryEntry {
  id: string;
  searchedAt: string;
  searchStrategyId: string | null;
  searchStrategyLabel: string | null;
  /** Primary query string shown to the user (strategic JSearch query) */
  jsearchQuery: string;
  location: string;
  resumeFileName: string | null;
  resultCount: number;
  jobs: unknown[];
  sessionRestore: JobFinderSessionRestoreV1;
}

function safeParse(raw: string | null): JobFinderSearchHistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is JobFinderSearchHistoryEntry =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as JobFinderSearchHistoryEntry).id === 'string' &&
        Array.isArray((x as JobFinderSearchHistoryEntry).jobs)
    );
  } catch {
    return [];
  }
}

export function getJobFinderSearchHistory(): JobFinderSearchHistoryEntry[] {
  if (typeof localStorage === 'undefined') return [];
  return safeParse(localStorage.getItem(STORAGE_KEY)).sort(
    (a, b) => new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime()
  );
}

export function addJobFinderSearchHistoryEntry(
  partial: Omit<JobFinderSearchHistoryEntry, 'id' | 'searchedAt' | 'searchStrategyLabel' | 'resultCount'> & {
    searchStrategyLabel?: string | null;
  }
): JobFinderSearchHistoryEntry {
  const id = `jf_hist_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const searchedAt = new Date().toISOString();
  const resultCount = Array.isArray(partial.jobs) ? partial.jobs.length : 0;
  const searchStrategyLabel =
    partial.searchStrategyLabel ?? strategyIdToLabel(partial.searchStrategyId);

  const entry: JobFinderSearchHistoryEntry = {
    id,
    searchedAt,
    searchStrategyId: partial.searchStrategyId,
    searchStrategyLabel,
    jsearchQuery: partial.jsearchQuery,
    location: partial.location,
    resumeFileName: partial.resumeFileName,
    resultCount,
    jobs: partial.jobs,
    sessionRestore: partial.sessionRestore,
  };

  if (typeof localStorage === 'undefined') return entry;

  const prev = safeParse(localStorage.getItem(STORAGE_KEY));
  const next = [entry, ...prev.filter((e) => e.id !== id)].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode */
  }
  return entry;
}

export function getJobFinderSearchHistoryCount(): number {
  return getJobFinderSearchHistory().length;
}
