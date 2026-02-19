import type { Job, JSearchSearchResponse } from '../../types/job';

const JSEARCH_SEARCH_URL = 'https://jsearch.p.rapidapi.com/search';

/**
 * Search jobs via JSearch API (jsearch.p.rapidapi.com) only.
 * Strict: returns ONLY data from the API. On any failure, returns [] and logs the error.
 * No mock data or fallback jobs.
 */
export async function searchJobs(query: string): Promise<Job[]> {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST;

  if (!apiKey || !apiHost) {
    console.error('[jobService] Missing env: VITE_RAPIDAPI_KEY or VITE_RAPIDAPI_HOST');
    return [];
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

    if (!res.ok) {
      const body = await res.text();
      console.error('[jobService] API error:', res.status, res.statusText, body);
      if (res.status === 403 || res.status === 429) {
        const err = new Error('API_LIMIT') as Error & { code?: string };
        err.code = 'API_LIMIT';
        throw err;
      }
      return [];
    }

    const data: JSearchSearchResponse = await res.json();
    const jobs = data?.data ?? [];
    return Array.isArray(jobs) ? jobs : [];
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'API_LIMIT') throw err;
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('[jobService] Fetch failed:', message, stack ?? '');
    return [];
  }
}
