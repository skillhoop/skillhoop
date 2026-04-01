-- Anonymous JSearch query cache: same keywords + location within TTL avoids repeat API calls.
-- Accessed only via server (service role) in api/auth-proxy.

CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keywords TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT '',
    job_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_lookup
    ON public.search_history (keywords, location, created_at DESC);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
