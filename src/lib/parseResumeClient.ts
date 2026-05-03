import { supabase } from './supabase';

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

/** Session + bearer token for POST /api/parse-resume (same pattern as Job Finder). */
export async function resolveAuthForParseResume(): Promise<{ userId: string; accessToken: string }> {
  let userId: string | null = null;
  let accessToken: string | null = null;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id && session?.access_token) {
      userId = session.user.id;
      accessToken = session.access_token;
    }
  } catch {
    /* ignore */
  }
  if (!userId || !accessToken) {
    if (typeof window !== 'undefined') {
      try {
        const rawToken = window.localStorage.getItem('sb-tnbeugqrflocjjjxcceh-auth-token');
        if (rawToken) {
          const parsed = JSON.parse(rawToken) as {
            currentSession?: { access_token?: string; user?: { id?: string; sub?: string } };
          };
          userId = parsed.currentSession?.user?.id || parsed.currentSession?.user?.sub || null;
          accessToken = parsed.currentSession?.access_token ?? null;
        }
      } catch {
        /* ignore */
      }
    }
  }
  if (!userId || !accessToken) {
    throw new Error('Please sign in to parse your resume.');
  }
  return { userId, accessToken };
}
