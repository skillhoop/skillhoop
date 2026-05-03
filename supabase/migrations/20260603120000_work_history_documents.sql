-- Career vault: per-user work history documents (cloud-synced)
CREATE TABLE IF NOT EXISTS public.work_history_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    title text NOT NULL DEFAULT '',
    type text NOT NULL DEFAULT 'resume',
    content text NOT NULL DEFAULT '',
    job_title text NOT NULL DEFAULT '',
    company text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'draft',
    ats_score integer NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_history_documents_user_updated
    ON public.work_history_documents (user_id, updated_at DESC);

ALTER TABLE public.work_history_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "work_history_documents_select_own" ON public.work_history_documents;
DROP POLICY IF EXISTS "work_history_documents_insert_own" ON public.work_history_documents;
DROP POLICY IF EXISTS "work_history_documents_update_own" ON public.work_history_documents;
DROP POLICY IF EXISTS "work_history_documents_delete_own" ON public.work_history_documents;

CREATE POLICY "work_history_documents_select_own"
    ON public.work_history_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "work_history_documents_insert_own"
    ON public.work_history_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "work_history_documents_update_own"
    ON public.work_history_documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "work_history_documents_delete_own"
    ON public.work_history_documents FOR DELETE
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_work_history_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_work_history_documents_updated_at ON public.work_history_documents;
CREATE TRIGGER trg_work_history_documents_updated_at
    BEFORE UPDATE ON public.work_history_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.set_work_history_documents_updated_at();
