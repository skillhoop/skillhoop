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

export default async function handler(req: ApiRequest, res: ApiResponse) {
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

  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return res.status(500).json({
      error: 'Server auth not configured',
      code: 'CONFIG_MISSING',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { name, email, password } = body ?? {};

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({
        error: 'name, email and password are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: name && typeof name === 'string' ? { full_name: name } : undefined,
      },
    });

    if (error) {
      const isAlreadyRegistered =
        typeof error.message === 'string' &&
        error.message.toLowerCase().includes('user already registered');

      const status = isAlreadyRegistered ? 400 : 400;
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('signup-proxy error:', err);
    return res.status(500).json({
      error: message,
      code: 'SERVER_ERROR',
    });
  }
}

