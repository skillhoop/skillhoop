import type { Job, JSearchSearchResponse } from '../../types/job';

const JSEARCH_SEARCH_URL = 'https://jsearch.p.rapidapi.com/search';

/**
 * Search jobs via JSearch API (RapidAPI).
 * On API failure, logs the error and returns an empty array.
 */
export async function searchJobs(query: string): Promise<Job[]> {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST;

  if (!apiKey || !apiHost) {
    console.error('Job search: missing VITE_RAPIDAPI_KEY or VITE_RAPIDAPI_HOST');
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: query.trim(),
      page: '1',
      num_pages: '1',
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
      console.error('Job search API error:', res.status, res.statusText, await res.text());
      return [];
    }

    const data: JSearchSearchResponse = await res.json();
    const jobs = data?.data ?? [];
    return Array.isArray(jobs) ? jobs : [];
  } catch (err) {
    console.error('Job search failed:', err);
    return [];
  }
}
