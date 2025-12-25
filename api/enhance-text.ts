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
    const { text } = body;

    // Validate required fields
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    // Validate text length
    if (text.trim().length < 5) {
      return res.status(400).json({ error: 'Text must be at least 5 characters long' });
    }

    // System prompt for resume editing
    const systemPrompt = 'You are an expert resume editor. Rewrite the following text to be more professional, concise, action-oriented, and grammatically correct. Do not add conversational filler. Just return the improved text.';

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
          content: text,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract the response content
    const enhancedText = completion.choices[0]?.message?.content;

    if (!enhancedText) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    // Return the enhanced text
    return res.status(200).json({ enhancedText: enhancedText.trim() });
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to enhance text';
    return res.status(500).json({
      error: errorMessage,
    });
  }
}






















