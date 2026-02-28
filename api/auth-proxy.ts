import { createClient } from '@supabase/supabase-js';

interface ApiRequest {
  method?: string;
  body?: string | Record<string, unknown>;
}

interface ApiResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    end: () => void;
    json: (data: Record<string, unknown>) => void;
  };
}

type AuthAction = 'login' | 'signup' | 'resetPassword';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  console.log(
    "Proxy attempting connection to:",
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ? "URL Found" : "URL MISSING"
  );

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Requested-With, Accept'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return res.status(500).json({
      error: 'Server auth not configured',
      code: 'CONFIG_MISSING',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { action, email, password, name, redirectTo } = body ?? {};

    const actionType = action === 'signup' || action === 'resetPassword' ? action : 'login';

    if (actionType === 'resetPassword') {
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          error: 'email is required',
          code: 'VALIDATION_ERROR',
        });
      }
    } else {
      if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        return res.status(400).json({
          error: 'email and password are required',
          code: 'VALIDATION_ERROR',
        });
      }
    }

    const supabase = createClient(url, anonKey);

    switch (actionType) {
      case 'login': {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          const status = error.message?.includes('Invalid login credentials') ? 401 : 400;
          return res.status(status).json({
            error: error.message,
            code: error.status?.toString() ?? 'AUTH_ERROR',
          });
        }

        if (!data.session) {
          return res.status(500).json({
            error: 'No session returned',
            code: 'NO_SESSION',
          });
        }

        return res.status(200).json({
          session: data.session,
          user: data.user,
        });
      }

      case 'signup': {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: name && typeof name === 'string' ? { full_name: name } : undefined,
          },
        });

        if (error) {
          const status = 400;
          return res.status(status).json({
            error: error.message,
            code: error.status?.toString() ?? 'SIGNUP_ERROR',
          });
        }

        if (!data) {
          return res.status(500).json({
            error: 'No data returned from sign up',
            code: 'NO_DATA',
          });
        }

        return res.status(200).json({
          user: data.user,
          session: data.session ?? null,
          needsEmailConfirmation: !!data.user && !data.session,
        });
      }

      case 'resetPassword': {
        const redirectUrl =
          typeof redirectTo === 'string' && redirectTo
            ? redirectTo
            : null;
        if (!redirectUrl) {
          return res.status(400).json({
            error: 'redirectTo is required for password reset',
            code: 'VALIDATION_ERROR',
          });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl,
        });

        if (error) {
          return res.status(400).json({
            error: error.message,
            code: error.status?.toString() ?? 'RESET_ERROR',
          });
        }

        return res.status(200).json({ ok: true, message: 'Reset email sent' });
      }

      default:
        return res.status(400).json({
          error: 'Invalid action',
          code: 'VALIDATION_ERROR',
        });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('auth-proxy error:', err);
    return res.status(500).json({
      error: message,
      code: 'SERVER_ERROR',
    });
  }
}
