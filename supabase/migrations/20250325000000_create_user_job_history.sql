-- Saved Job Finder sessions per user (search query, intent, job ids, full snapshot for restoration)
CREATE TABLE IF NOT EXISTS public.user_job_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL DEFAULT '',
    intent TEXT,
    job_ids TEXT[] NOT NULL DEFAULT '{}',
    jobs_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    ui_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_job_history_user_created
    ON public.user_job_history (user_id, created_at DESC);

ALTER TABLE public.user_job_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own job history"
    ON public.user_job_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own job history"
    ON public.user_job_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
