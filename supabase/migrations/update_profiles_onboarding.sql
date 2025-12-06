-- Update profiles table to add onboarding columns
-- Run this in your Supabase SQL Editor

-- Add columns for user onboarding data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_role TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS career_goal TEXT,
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- Create index for faster queries on onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status 
ON public.profiles(has_completed_onboarding) 
WHERE has_completed_onboarding = false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.current_role IS 'User''s current job role or position';
COMMENT ON COLUMN public.profiles.experience_level IS 'User''s years of experience (0-2, 3-5, 5-10, 10+)';
COMMENT ON COLUMN public.profiles.career_goal IS 'User''s main career goal (Get Hired, Switch Careers, Get Promoted)';
COMMENT ON COLUMN public.profiles.has_completed_onboarding IS 'Flag indicating if user has completed the onboarding wizard';

-- Ensure Row Level Security is enabled (if not already)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies for profiles table
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

