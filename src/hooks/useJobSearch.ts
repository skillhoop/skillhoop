import { useState, useCallback } from 'react';
import { searchJobs } from '../lib/services/jobService';
import type { Job } from '../types/job';

export interface UseJobSearchResult {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  /** 'deep' = JSearch; 'standard' = fallback source (Adzuna/Arbeitnow/JoinRise). Undefined until first search. */
  sourceQuality?: 'deep' | 'standard';
  search: (term: string) => Promise<void>;
}

export function useJobSearch(): UseJobSearchResult {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceQuality, setSourceQuality] = useState<'deep' | 'standard' | undefined>(undefined);

  const search = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setJobs([]);
      setError('Please enter a search term.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setJobs([]);

    try {
      const result = await searchJobs(trimmed);
      setJobs(result.jobs);
      setSourceQuality(result.sourceQuality);
      if (result.jobs.length === 0) {
        setError('No jobs found. Try a different search.');
      }
    } catch (err) {
      console.error('useJobSearch:', err);
      setError('Search failed. Please try again.');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { jobs, isLoading, error, sourceQuality, search };
}
