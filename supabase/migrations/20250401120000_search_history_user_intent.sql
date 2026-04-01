-- Per-user search sessions (30-day UI) + intent; anonymous rows keep user_id NULL for 12h JSearch cache.
ALTER TABLE public.search_history
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS intent TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_search_history_user_created
    ON public.search_history (user_id, created_at DESC)
    WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_search_history_anon_lookup
    ON public.search_history (keywords, location, created_at DESC)
    WHERE user_id IS NULL;
