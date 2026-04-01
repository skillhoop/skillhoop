-- Safe daily cleanup: prune stale warehouse rows and search cache while preserving favorites
-- and recent data. pg_cron jobs run in the database (02:00 server time).
-- Filename sorts after create_global_jobs_table.sql so the warehouse table exists first.

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Required for the job janitor DELETE below (favorites use is_saved = true).
ALTER TABLE public.global_jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.global_jobs ADD COLUMN IF NOT EXISTS is_saved BOOLEAN NOT NULL DEFAULT false;

-- Safety: rows younger than 30 days are never removed by cleanup-old-jobs. Only unsaved
-- rows older than 30 days are deleted; is_saved = true keeps favorited jobs regardless of age.

SELECT cron.schedule(
    'cleanup-old-jobs',
    '0 2 * * *',
    $$DELETE FROM public.global_jobs WHERE created_at < NOW() - INTERVAL '30 days' AND is_saved = false;$$
);

SELECT cron.schedule(
    'cleanup-old-history',
    '0 2 * * *',
    $$DELETE FROM public.search_history WHERE created_at < NOW() - INTERVAL '7 days';$$
);
