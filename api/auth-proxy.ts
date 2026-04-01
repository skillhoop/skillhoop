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

    // get_market_insights: server-side RPC (bypasses client Supabase block)
    if (action === 'get_market_insights') {
      const serviceRoleKeyForRpc = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKeyForRpc) {
        return res.status(500).json({
          error: 'Server not configured for market insights',
          code: 'CONFIG_MISSING',
        });
      }
      const supabaseAdminRpc = createClient(url, serviceRoleKeyForRpc, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const location = typeof body.location === 'string' ? body.location.trim() : undefined;
      let rpcData: unknown = null;
      let rpcError: { code?: string; message?: string; details?: string } | null = null;

      const runRpc = async (searchLocation: string | undefined) => {
        const result = await supabaseAdminRpc.rpc('get_market_insights', {
          search_job_title: title || undefined,
          search_location: searchLocation,
        });
        return result;
      };

      const first = await runRpc(location || undefined);
      rpcError = first.error as typeof rpcError;
      rpcData = first.data;

      if (rpcError) {
        const code = rpcError?.code;
        const message = rpcError?.message ?? '';
        console.error('get_market_insights RPC failed:', {
          code,
          message,
          details: rpcError?.details,
        });
        const isSchemaOrNotFound =
          code === 'PGRST202' ||
          /function\s+not\s+found/i.test(message);
        if (isSchemaOrNotFound) {
          return res.status(500).json({
            error: 'Market data is currently refreshing. Please try again in a moment.',
            code: 'RPC_ERROR',
          });
        }
        return res.status(500).json({
          error: rpcError?.message,
          code: 'RPC_ERROR',
        });
      }

      const hasSalaryData = (d: unknown) => {
        if (Array.isArray(d)) return d.length > 0 && (d[0]?.avg_min_salary != null || d[0]?.avg_max_salary != null);
        if (d && typeof d === 'object' && 'avg_min_salary' in d) return (d as { avg_min_salary?: unknown }).avg_min_salary != null || (d as { avg_max_salary?: unknown }).avg_max_salary != null;
        if (d && typeof d === 'object' && 'count' in d) return (d as { count?: number }).count != null && (d as { count?: number }).count! > 0;
        return false;
      };

      if (location && title && !hasSalaryData(rpcData)) {
        const fallback = await runRpc(undefined);
        if (!fallback.error && hasSalaryData(fallback.data)) {
          rpcData = fallback.data;
        }
      }

      return res.status(200).json({ data: rpcData ?? null });
    }

    // query_jobs: server-side query to global_jobs (bypasses client Supabase block)
    if (action === 'query_jobs') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKey) {
        return res.status(500).json({
          error: 'Server not configured for job query',
          code: 'CONFIG_MISSING',
        });
      }
      const supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { title, location, posted_at_utc } = body;
      const since =
        typeof posted_at_utc === 'string' && posted_at_utc
          ? posted_at_utc
          : new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: rows, error } = await supabaseAdmin
        .from('global_jobs')
        .select('*')
        .gte('posted_at_utc', since)
        .order('posted_at_utc', { ascending: false })
        .limit(100);

      if (error) {
        return res.status(500).json({
          error: error.message,
          code: 'QUERY_JOBS_ERROR',
        });
      }
      return res.status(200).json({ data: rows ?? [] });
    }

    // search_history_try_hit: last 12h cache for JSearch by normalized keywords + location; hydrates from global_jobs (21d max age on server).
    if (action === 'search_history_try_hit') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKey) {
        return res.status(500).json({
          error: 'Server not configured for search history',
          code: 'CONFIG_MISSING',
        });
      }
      const supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const rawKw = typeof body.keywords === 'string' ? body.keywords.trim().toLowerCase() : '';
      const rawLoc = typeof body.location === 'string' ? body.location.trim().toLowerCase() : '';
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      const { data: histRows, error: histError } = await supabaseAdmin
        .from('search_history')
        .select('job_ids')
        .is('user_id', null)
        .eq('keywords', rawKw)
        .eq('location', rawLoc)
        .gte('created_at', twelveHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (histError) {
        return res.status(500).json({
          error: histError.message,
          code: 'SEARCH_HISTORY_ERROR',
        });
      }
      const jobIds = (histRows?.[0]?.job_ids ?? []) as string[];
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return res.status(200).json({ data: null });
      }
      const uniqueIds = [...new Set(jobIds.map((id) => String(id)))].filter(Boolean).slice(0, 120);
      const cutoff21d = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString();
      const { data: rows, error: jobsError } = await supabaseAdmin
        .from('global_jobs')
        .select('*')
        .in('id', uniqueIds)
        .gte('posted_at_utc', cutoff21d);

      if (jobsError) {
        return res.status(500).json({
          error: jobsError.message,
          code: 'SEARCH_HISTORY_JOBS_ERROR',
        });
      }
      const list = (rows ?? []) as Record<string, unknown>[];
      if (list.length === 0) {
        return res.status(200).json({ data: null });
      }
      const orderMap = new Map(uniqueIds.map((id, i) => [id, i]));
      list.sort(
        (a, b) =>
          (orderMap.get(String(a.id)) ?? 999) - (orderMap.get(String(b.id)) ?? 999)
      );
      return res.status(200).json({ data: list });
    }

    // search_history_record: store JSearch result job ids for repeat lookups (12h TTL checked on read).
    // Optional access_token + intent: ties row to authenticated user (Jobs History vault).
    if (action === 'search_history_record') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKey) {
        return res.status(500).json({
          error: 'Server not configured for search history',
          code: 'CONFIG_MISSING',
        });
      }
      const supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const rawKw = typeof body.keywords === 'string' ? body.keywords.trim().toLowerCase() : '';
      const rawLoc = typeof body.location === 'string' ? body.location.trim().toLowerCase() : '';
      const idsRaw = body.job_ids;
      const jobIds = Array.isArray(idsRaw) ? idsRaw.map((x: unknown) => String(x)).filter(Boolean).slice(0, 120) : [];
      if (!rawKw || jobIds.length === 0) {
        return res.status(400).json({
          error: 'keywords and non-empty job_ids are required',
          code: 'VALIDATION_ERROR',
        });
      }
      const intentRaw = body.intent;
      const intent =
        typeof intentRaw === 'string' ? intentRaw.trim().slice(0, 120) : '';
      const accessToken =
        typeof body.access_token === 'string' ? body.access_token.trim() : '';
      let userId: string | null = null;
      if (accessToken) {
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(accessToken);
        if (userErr || !userData?.user?.id) {
          return res.status(401).json({
            error: userErr?.message ?? 'Invalid session',
            code: 'AUTH_INVALID',
          });
        }
        userId = userData.user.id;
      }
      const row: Record<string, unknown> = {
        keywords: rawKw,
        location: rawLoc,
        job_ids: jobIds,
        intent: intent || '',
        user_id: userId,
      };
      const { error: insError } = await supabaseAdmin.from('search_history').insert(row);
      if (insError) {
        return res.status(500).json({
          error: insError.message,
          code: 'SEARCH_HISTORY_INSERT_ERROR',
        });
      }
      return res.status(200).json({ ok: true });
    }

    // search_history_list_for_user: last 30 days of saved sessions for Jobs History vault
    if (action === 'search_history_list_for_user') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKey) {
        return res.status(500).json({
          error: 'Server not configured for search history',
          code: 'CONFIG_MISSING',
        });
      }
      const supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const accessToken =
        typeof body.access_token === 'string' ? body.access_token.trim() : '';
      if (!accessToken) {
        return res.status(400).json({
          error: 'access_token is required',
          code: 'VALIDATION_ERROR',
        });
      }
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(accessToken);
      if (userErr || !userData?.user?.id) {
        return res.status(401).json({
          error: userErr?.message ?? 'Invalid session',
          code: 'AUTH_INVALID',
        });
      }
      const uid = userData.user.id;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: rows, error: listError } = await supabaseAdmin
        .from('search_history')
        .select('id, keywords, location, intent, job_ids, created_at')
        .eq('user_id', uid)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false })
        .limit(200);
      if (listError) {
        return res.status(500).json({
          error: listError.message,
          code: 'SEARCH_HISTORY_LIST_ERROR',
        });
      }
      return res.status(200).json({ data: rows ?? [] });
    }

    // warehouse_jobs_by_ids: hydrate Job Finder workspace from global_jobs (no new API call)
    if (action === 'warehouse_jobs_by_ids') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKey) {
        return res.status(500).json({
          error: 'Server not configured for job query',
          code: 'CONFIG_MISSING',
        });
      }
      const supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const idsRaw = body.job_ids;
      const jobIds = Array.isArray(idsRaw)
        ? [...new Set(idsRaw.map((x: unknown) => String(x)).filter(Boolean))].slice(0, 120)
        : [];
      if (jobIds.length === 0) {
        return res.status(400).json({
          error: 'non-empty job_ids are required',
          code: 'VALIDATION_ERROR',
        });
      }
      const { data: rows, error: wErr } = await supabaseAdmin
        .from('global_jobs')
        .select('*')
        .in('id', jobIds);
      if (wErr) {
        return res.status(500).json({
          error: wErr.message,
          code: 'WAREHOUSE_BY_IDS_ERROR',
        });
      }
      const list = (rows ?? []) as Record<string, unknown>[];
      const orderMap = new Map(jobIds.map((id, i) => [id, i]));
      list.sort(
        (a, b) =>
          (orderMap.get(String(a.id)) ?? 999) - (orderMap.get(String(b.id)) ?? 999)
      );
      return res.status(200).json({ data: list });
    }

    // global_jobs_saved_flags: batch read is_saved for workspace UI
    if (action === 'global_jobs_saved_flags') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKey) {
        return res.status(500).json({
          error: 'Server not configured for job query',
          code: 'CONFIG_MISSING',
        });
      }
      const supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const idsRaw = body.job_ids;
      const jobIds = Array.isArray(idsRaw)
        ? [...new Set(idsRaw.map((x: unknown) => String(x)).filter(Boolean))].slice(0, 200)
        : [];
      if (jobIds.length === 0) {
        return res.status(200).json({ flags: {} });
      }
      const { data: rows, error: fErr } = await supabaseAdmin
        .from('global_jobs')
        .select('id, is_saved')
        .in('id', jobIds);
      if (fErr) {
        return res.status(500).json({
          error: fErr.message,
          code: 'SAVED_FLAGS_ERROR',
        });
      }
      const flags: Record<string, boolean> = {};
      for (const r of rows ?? []) {
        const rec = r as { id?: string; is_saved?: boolean };
        if (rec.id != null) flags[String(rec.id)] = !!rec.is_saved;
      }
      return res.status(200).json({ flags });
    }

    // global_jobs_set_saved: protect row from warehouse janitor (is_saved)
    if (action === 'global_jobs_set_saved') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKey) {
        return res.status(500).json({
          error: 'Server not configured for job query',
          code: 'CONFIG_MISSING',
        });
      }
      const supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const jobId = typeof body.job_id === 'string' ? body.job_id.trim() : '';
      const savedRaw = body.is_saved;
      const isSaved = savedRaw === true || savedRaw === 'true';
      if (!jobId) {
        return res.status(400).json({
          error: 'job_id is required',
          code: 'VALIDATION_ERROR',
        });
      }
      const { error: uErr } = await supabaseAdmin
        .from('global_jobs')
        .update({ is_saved: isSaved })
        .eq('id', jobId);
      if (uErr) {
        return res.status(500).json({
          error: uErr.message,
          code: 'SET_SAVED_ERROR',
        });
      }
      return res.status(200).json({ ok: true, is_saved: isSaved });
    }

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
