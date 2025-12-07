import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase admin client with Service Role Key
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ApiRequest {
  method?: string;
  body?: string | Record<string, unknown>;
  headers?: Record<string, string>;
}

interface ApiResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    end: () => void;
    json: (data: Record<string, unknown>) => void;
  };
}

/**
 * Generate a slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract excerpt from content (first 150 characters)
 */
function extractExcerpt(content: string): string {
  // Remove HTML tags for excerpt
  const textContent = content.replace(/<[^>]*>/g, '');
  return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the incoming JSON body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { topic, targetFeature, featurePath, userId } = body;

    // Validate required fields
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!targetFeature) {
      return res.status(400).json({ error: 'Target feature is required' });
    }

    if (!featurePath) {
      return res.status(400).json({ error: 'Feature path is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Check if Supabase credentials are configured
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    // Verify user exists (basic check - frontend handles admin authorization)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Build the system prompt
    const systemPrompt = `You are an expert Career Coach. Write an SEO-optimized blog post about ${topic}. Use H2 and H3 tags for structure. The tone should be authoritative but encouraging.`;

    // Build the user prompt with "Trojan Horse" logic
    const userPrompt = `Write a comprehensive, SEO-optimized blog post about "${topic}".

Requirements:
1. Use H2 tags for main sections and H3 tags for subsections
2. Write in an authoritative but encouraging tone
3. The article should be well-structured with an introduction, body paragraphs, and conclusion
4. Include practical tips and actionable advice
5. Somewhere in the article (naturally, not forced), mention that readers can solve this problem using ${targetFeature} and hyperlink it to ${featurePath}
6. The link should feel organic and helpful, not like an advertisement
7. Aim for approximately 1000-1500 words
8. Format the content in HTML with proper heading tags

Return the full HTML content of the blog post.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    });

    // Extract the response content
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    // Generate title from the content (first H1 or use topic)
    let title = topic;
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    } else {
      // Try to extract from first paragraph or use topic as title
      title = topic.charAt(0).toUpperCase() + topic.slice(1);
    }

    // Generate slug
    const slug = generateSlug(title);

    // Check if slug already exists
    const { data: existingPost } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();

    let finalSlug = slug;
    if (existingPost) {
      // Append timestamp to make it unique
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Extract excerpt
    const excerpt = extractExcerpt(content);

    // Create the blog post as a draft (published_at is null)
    const { data: blogPost, error: insertError } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title: title,
        slug: finalSlug,
        excerpt: excerpt,
        content: content,
        author: profile.email || 'Career Clarified Team',
        published_at: null, // Draft by default
        category: null, // Can be set later
        featured_image: null, // Can be set later
        related_feature_link: featurePath,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating blog post:', insertError);
      return res.status(500).json({ error: 'Failed to save blog post', details: insertError.message });
    }

    // Return the created blog post
    return res.status(200).json({
      success: true,
      post: blogPost,
    });
  } catch (error: unknown) {
    console.error('Blog generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate blog post';
    return res.status(500).json({
      error: errorMessage,
    });
  }
}

