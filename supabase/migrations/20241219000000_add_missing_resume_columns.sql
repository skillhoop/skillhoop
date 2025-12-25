-- Migration: Add missing resume_data and is_dirty columns to resumes table
-- This migration is safe to run multiple times (idempotent)

-- Add resume_data column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'resumes' 
        AND column_name = 'resume_data'
    ) THEN
        ALTER TABLE resumes ADD COLUMN resume_data JSONB NOT NULL DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added resume_data column to resumes table';
    ELSE
        RAISE NOTICE 'resume_data column already exists';
    END IF;
END $$;

-- Add is_dirty column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'resumes' 
        AND column_name = 'is_dirty'
    ) THEN
        ALTER TABLE resumes ADD COLUMN is_dirty BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_dirty column to resumes table';
    ELSE
        RAISE NOTICE 'is_dirty column already exists';
    END IF;
END $$;

-- Update existing rows to have default values if needed
UPDATE resumes 
SET resume_data = '{}'::jsonb 
WHERE resume_data IS NULL;

UPDATE resumes 
SET is_dirty = false 
WHERE is_dirty IS NULL;










