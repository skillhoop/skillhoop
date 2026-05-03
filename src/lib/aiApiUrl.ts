/**
 * Resolve AI HTTP endpoints for local dev (Vite) vs production (same-origin / Vercel).
 * Matches patterns used in Job Finder and jobService.
 */
export function getAiGenerateUrl(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  if (env.VITE_AI_GENERATE_URL) return env.VITE_AI_GENERATE_URL;
  if (env.VITE_AI_API_BASE) return `${env.VITE_AI_API_BASE.replace(/\/$/, '')}/api/generate`;
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    return 'http://localhost:3000/api/generate';
  }
  return '/api/generate';
}

export function getParseResumeUrl(): string {
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    return 'http://localhost:3000/api/parse-resume';
  }
  return '/api/parse-resume';
}
