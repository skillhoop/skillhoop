-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    category TEXT,
    featured_image TEXT,
    related_feature_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category) WHERE category IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can view published posts
CREATE POLICY "Anyone can view published blog posts"
    ON public.blog_posts FOR SELECT
    USING (published_at IS NOT NULL);

-- Only authenticated users with admin privileges can insert/update/delete
-- Note: You'll need to adjust this policy based on your admin user ID
-- For now, we'll allow authenticated users to insert (you can restrict this further)
CREATE POLICY "Authenticated users can insert blog posts"
    ON public.blog_posts FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog posts"
    ON public.blog_posts FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog posts"
    ON public.blog_posts FOR DELETE
    USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.blog_posts IS 'Blog posts table for dynamic, AI-powered content engine';
COMMENT ON COLUMN public.blog_posts.slug IS 'URL-friendly unique identifier for the post';
COMMENT ON COLUMN public.blog_posts.published_at IS 'Timestamp when post was published. NULL means draft';
COMMENT ON COLUMN public.blog_posts.related_feature_link IS 'Link to related feature (e.g., /dashboard/resume-studio)';

