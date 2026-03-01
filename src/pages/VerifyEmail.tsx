import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AUTH_STORAGE_KEY = 'sb-tnbeugqrflocjjjxcceh-auth-token';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      // Prefer query params (e.g. ?token_hash=...&type=email), then hash
      let tokenHash =
        searchParams.get('token_hash') ||
        new URLSearchParams(window.location.hash.substring(1)).get('token_hash');
      let type =
        searchParams.get('type') ||
        new URLSearchParams(window.location.hash.substring(1)).get('type');

      if (!tokenHash || !type) {
        setStatus('error');
        setErrorMessage('Invalid verification link. Missing token or type.');
        return;
      }

      try {
        const res = await fetch('/api/auth-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verifyEmail',
            token_hash: tokenHash,
            type: type.trim(),
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus('error');
          setErrorMessage(
            (data?.error as string) || 'Verification failed. The link may have expired.'
          );
          return;
        }

        if (data.session) {
          const storagePayload = {
            currentSession: data.session,
            expiresAt:
              typeof data.session.expires_in === 'number'
                ? Math.floor(Date.now() / 1000) + data.session.expires_in
                : Math.floor(Date.now() / 1000) + 60 * 60,
          };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storagePayload));
          try {
            void supabase.auth.setSession(data.session);
          } catch (sessionErr) {
            console.error('VerifyEmail setSession:', sessionErr);
          }
          setStatus('success');
          // Clear URL and redirect after short delay
          window.history.replaceState(null, '', '/verify-email');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage('Verification succeeded but no session was returned.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Network error. Please try again.'
        );
      }
    };

    run();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4" />
          <p className="text-gray-600">Verifying your email…</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <p className="text-green-600 font-medium mb-2">Email verified successfully.</p>
          <p className="text-gray-600 text-sm">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <p className="text-red-600 font-medium mb-2">Verification failed</p>
        <p className="text-gray-600 text-sm mb-4">{errorMessage}</p>
        <Link
          to="/login"
          className="inline-block text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default VerifyEmail;
