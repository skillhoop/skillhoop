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

// Tier limits mapping
const TIER_LIMITS: Record<string, number> = {
  free: 5,
  pro: 50,
  ultimate: 200,
};

// Restricted features for free tier
const RESTRICTED_FEATURES = ['content_engine', 'interview_prep'];

interface ApiRequest {
  method?: string;
  body?: string | Record<string, unknown>;
}

interface ApiResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    end: () => void;
    json: (data: Record<string, unknown>) => void;
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
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
    // Parse the incoming JSON body (Vercel automatically parses JSON, but handle both cases)
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { prompt, systemMessage, model = 'gpt-4o-mini', userId, feature_name } = body;

    // Validate required fields
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!feature_name) {
      return res.status(400).json({ error: 'Feature name is required' });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Check if Supabase credentials are configured
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    // Get user profile to check tier
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const tier = profile.tier || 'free';

    // Check feature gate for free tier
    if (tier === 'free' && RESTRICTED_FEATURES.includes(feature_name)) {
      return res.status(403).json({ error: 'Upgrade to Pro to access this feature' });
    }

    // Get today's date at 00:00 UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStart = today.toISOString();

    // Count usage for today
    const { count, error: usageError } = await supabaseAdmin
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayStart);

    if (usageError) {
      console.error('Error checking usage:', usageError);
      return res.status(500).json({ error: 'Failed to check usage limits' });
    }

    const usageCount = count || 0;
    const tierLimit = TIER_LIMITS[tier] || TIER_LIMITS.free;

    // Enforce rate limits
    if (usageCount >= tierLimit) {
      return res.status(429).json({ error: 'Daily limit reached' });
    }

    // Prepare messages array
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    
    if (systemMessage) {
      messages.push({
        role: 'system',
        content: systemMessage,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
    });

    // Extract the response content
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    // Log successful usage
    const { error: logError } = await supabaseAdmin
      .from('ai_usage_logs')
      .insert({
        user_id: userId,
        feature_name: feature_name,
        created_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Error logging usage:', logError);
      // Don't fail the request if logging fails, but log the error
    }

    // Return the content
    return res.status(200).json({ content });
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
    return res.status(500).json({
      error: errorMessage,
    });
  }
}

