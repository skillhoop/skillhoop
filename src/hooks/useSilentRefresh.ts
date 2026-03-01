import { useEffect, useRef } from 'react';

const AUTH_STORAGE_KEY = 'sb-tnbeugqrflocjjjxcceh-auth-token';
const REFRESH_INTERVAL_MS = 40 * 60 * 1000; // 40 minutes

/**
 * Calls the auth proxy to refresh the session and updates localStorage
 * with the new session. No Supabase SDK call on the client.
 */
export function useSilentRefresh() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const refresh = async () => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
        if (!raw) return;

        let payload: { currentSession?: { refresh_token?: string }; expiresAt?: number };
        try {
          payload = JSON.parse(raw);
        } catch {
          return;
        }

        const refreshToken = payload?.currentSession?.refresh_token;
        if (!refreshToken || typeof refreshToken !== 'string') return;

        const res = await fetch('/api/auth-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'refresh', refresh_token: refreshToken }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.session) return;

        const storagePayload = {
          currentSession: data.session,
          expiresAt:
            typeof data.session.expires_in === 'number'
              ? Math.floor(Date.now() / 1000) + data.session.expires_in
              : Math.floor(Date.now() / 1000) + 60 * 60,
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storagePayload));
      } catch (err) {
        console.error('Silent refresh failed:', err);
      }
    };

    intervalRef.current = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
}
