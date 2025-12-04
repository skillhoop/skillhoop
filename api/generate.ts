import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
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
    const { prompt, systemMessage, model = 'gpt-4o-mini' } = body;

    // Validate required fields
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
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

    // Return the content
    return res.status(200).json({ content });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate response',
    });
  }
}

