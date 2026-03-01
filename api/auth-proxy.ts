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

type AuthAction = 'login' | 'signup' | 'resetPassword' | 'verifyEmail' | 'refresh' | 'resend';

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
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    return res.status(500).json({
      error: 'Server auth not configured',
      code: 'CONFIG_MISSING',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { action, email, password, name, redirectTo, token_hash, type, refresh_token } = body ?? {};

    const supabase = createClient(url, anonKey);

    // verifyEmail: token_hash + type from email link
    if (action === 'verifyEmail') {
      if (!token_hash || typeof token_hash !== 'string' || !type || typeof type !== 'string') {
        return res.status(400).json({
          error: 'token_hash and type are required for verifyEmail',
          code: 'VALIDATION_ERROR',
        });
      }
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token_hash.trim(),
        type: type.trim() as 'email' | 'email_change' | 'magiclink' | 'recovery',
      });
      if (error) {
        return res.status(400).json({
          error: error.message,
          code: error.status?.toString() ?? 'VERIFY_ERROR',
        });
      }
      if (!data.session) {
        return res.status(500).json({
          error: 'No session returned from verification',
          code: 'NO_SESSION',
        });
      }
      return res.status(200).json({
        session: data.session,
        user: data.user,
      });
    }

    // resend: resend confirmation email (type e.g. 'signup')
    if (action === 'resend') {
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          error: 'email is required for resend',
          code: 'VALIDATION_ERROR',
        });
      }
      // ResendParams for email only accepts 'signup' | 'email_change'
      const rawType = type && typeof type === 'string' ? type.trim() : 'signup';
      const resendType: 'signup' | 'email_change' = rawType === 'email_change' ? 'email_change' : 'signup';
      const { error: resendError } = await supabase.auth.resend({
        type: resendType,
        email: email.trim(),
      });
      if (resendError) {
        return res.status(400).json({
          error: resendError.message,
          code: resendError.status?.toString() ?? 'RESEND_ERROR',
        });
      }
      return res.status(200).json({ ok: true, message: 'Confirmation email resent' });
    }

    // refresh: refresh_token from request body
    if (action === 'refresh') {
      if (!refresh_token || typeof refresh_token !== 'string') {
        return res.status(400).json({
          error: 'refresh_token is required for refresh',
          code: 'VALIDATION_ERROR',
        });
      }
      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refresh_token.trim() });
      if (error) {
        return res.status(401).json({
          error: error.message,
          code: error.status?.toString() ?? 'REFRESH_ERROR',
        });
      }
      if (!data.session) {
        return res.status(500).json({
          error: 'No session returned from refresh',
          code: 'NO_SESSION',
        });
      }
      return res.status(200).json({
        session: data.session,
        user: data.user,
      });
    }

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
        const trimmedEmail = email.trim();

        if (!serviceRoleKey) {
          return res.status(500).json({ error: 'Server configuration missing' });
        }

        // Pre-signup check: Admin client checks for existing user to avoid showing success screen
        const supabaseAdmin = createClient(url, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        let listData: { users?: Array<{ email?: string | null }> } | undefined;
        try {
          const result = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });
          listData = result.data;
          console.log('listUsers result:', { userCount: listData?.users?.length ?? 0, users: listData?.users?.map((u) => u.email) });
        } catch (listErr) {
          console.error('listUsers failed:', listErr);
          return res.status(500).json({
            error: 'Unable to check existing users',
            code: 'LIST_USERS_ERROR',
          });
        }
        const users = listData?.users ?? [];
        const existingUser = users.find(
          (u) => u.email?.toLowerCase() === trimmedEmail.toLowerCase()
        );
        if (existingUser) {
          console.log(`DEBUG: Duplicate found for ${trimmedEmail}`);
          return res.status(400).json({
            error: 'An account with this email already exists. Please log in instead.',
            code: 'DUPLICATE_EMAIL',
          });
        }

        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: name && typeof name === 'string' ? { full_name: name } : undefined,
          },
        });

        if (error) {
          const isDuplicate =
            error.message?.toLowerCase().includes('already registered') ||
            error.message?.toLowerCase().includes('already exists') ||
            error.message?.toLowerCase().includes('duplicate');
          if (isDuplicate) {
            return res.status(400).json({
              error: 'An account with this email already exists. Please log in instead.',
              code: 'DUPLICATE_EMAIL',
            });
          }
          return res.status(400).json({
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
