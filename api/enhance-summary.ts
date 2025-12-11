import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Parse the incoming JSON body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { summary, jobTitle } = body;

    // Validate required fields
    if (!summary || typeof summary !== 'string') {
      return res.status(400).json({ error: 'Summary is required and must be a string' });
    }

    if (!jobTitle || typeof jobTitle !== 'string') {
      return res.status(400).json({ error: 'Job title is required and must be a string' });
    }

    // Create the prompt for OpenAI
    const prompt = `Rewrite the following resume summary to be more professional, concise, and impactful for a ${jobTitle} position. Make it compelling and highlight relevant skills and experience. Keep it to 3-4 sentences maximum.

Original Summary:
${summary}

Enhanced Summary:`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini as specified, can be changed to gpt-3.5-turbo if preferred
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer specializing in creating compelling and concise resume summaries that highlight relevant skills and experience for specific job titles.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    // Extract the response content
    const enhancedSummary = completion.choices[0]?.message?.content;

    if (!enhancedSummary) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    // Return the enhanced summary
    return res.status(200).json({ enhancedSummary: enhancedSummary.trim() });
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to enhance summary';
    return res.status(500).json({
      error: errorMessage,
    });
  }
}

