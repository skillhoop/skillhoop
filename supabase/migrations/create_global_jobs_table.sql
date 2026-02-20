-- Proprietary Job Warehouse: cache of jobs from JSearch, Adzuna, JoinRise, Arbeitnow
-- Used for database-first search to reduce API costs. Schema matches unified Job type.

CREATE TABLE IF NOT EXISTS global_jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    employer_name TEXT NOT NULL,
    employer_logo TEXT,
    description TEXT,
    apply_link TEXT NOT NULL DEFAULT '#',
    city TEXT,
    state TEXT,
    country TEXT,
    posted_at_utc TEXT NOT NULL,
    min_salary NUMERIC,
    max_salary NUMERIC,
    highlights JSONB
);

-- Index for database-first search: recent jobs by posted_at_utc
CREATE INDEX IF NOT EXISTS idx_global_jobs_posted_at_utc ON global_jobs(posted_at_utc DESC);

-- Optional: full-text search on title + employer + description (for future use)
CREATE INDEX IF NOT EXISTS idx_global_jobs_title_employer ON global_jobs USING gin(
    (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(employer_name, '') || ' ' || coalesce(description, '')))
);

-- Allow anonymous read/write for client-side harvester and search (public job cache)
ALTER TABLE global_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read global_jobs" ON global_jobs;
CREATE POLICY "Allow public read global_jobs"
    ON global_jobs FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert global_jobs" ON global_jobs;
CREATE POLICY "Allow public insert global_jobs"
    ON global_jobs FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update global_jobs" ON global_jobs;
CREATE POLICY "Allow public update global_jobs"
    ON global_jobs FOR UPDATE
    USING (true)
    WITH CHECK (true);
