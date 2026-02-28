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
    const { email, password } = body ?? {};

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({
        error: 'email and password are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const supabase = createClient(url, anonKey);
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('auth-proxy error:', err);
    return res.status(500).json({
      error: message,
      code: 'SERVER_ERROR',
    });
  }
}
