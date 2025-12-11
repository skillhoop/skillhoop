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
    const { description, jobTitle } = body;

    // Validate required fields
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required and must be a string' });
    }

    if (!jobTitle || typeof jobTitle !== 'string') {
      return res.status(400).json({ error: 'Job title is required and must be a string' });
    }

    // Create the prompt for OpenAI
    const prompt = `Rewrite the following work experience description into 3-4 professional, results-oriented bullet points suitable for a resume. Each bullet point should:
- Start with a strong action verb
- Be concise and impactful
- Highlight achievements, responsibilities, and impact
- Use quantifiable metrics when possible
- Be tailored for a ${jobTitle} position

Original Description:
${description}

Enhanced Description (format as bullet points, one per line):`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer specializing in creating compelling, results-oriented experience descriptions that highlight achievements and impact. Format your responses as bullet points, one per line.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to enhance experience description';
    return res.status(500).json({
      error: errorMessage,
    });
  }
}

