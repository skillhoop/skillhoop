import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase admin client only when service role key is set (for tier & usage)
const supabaseAdmin =
  process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null;

// Tier limits mapping
const TIER_LIMITS: Record<string, number> = {
  free: 5,
  pro: 50,
  ultimate: 200,
};

// Feature access rules by tier
// Features that require Pro or Ultimate (blocked for Free)
const PRO_FEATURES = ['application_tailor', 'interview_prep'];

// Features that require Ultimate only (blocked for Free and Pro)
const ULTIMATE_FEATURES = ['content_engine', 'skill_radar', 'skill_benchmarking', 'ai_portfolio'];

// Note: Features not listed above (resume_studio, cover_letter, job_finder, job_tracker) are available to all tiers

/**
 * Scrubs PII (Personally Identifiable Information) from text
 * Replaces email addresses and phone numbers with redaction placeholders
 */
function scrubPII(text: string): string {
  let scrubbed = text;

  // Remove email addresses
  // Pattern matches: user@domain.com, user.name@domain.co.uk, etc.
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  scrubbed = scrubbed.replace(emailPattern, '[EMAIL_REDACTED]');

  // Remove phone numbers
  // Pattern matches various formats:
  // (123) 456-7890, 123-456-7890, 123.456.7890, +1 123 456 7890, +1-123-456-7890, etc.
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  scrubbed = scrubbed.replace(phonePattern, '[PHONE_REDACTED]');

  return scrubbed;
}

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
    const { prompt, systemMessage, model = 'gpt-4o-mini', userId, feature_name, fileData, fileName, mimeType } = body;

    const isResumeFileRequest = Boolean(fileData && typeof fileData === 'string');

    // Validate required fields: either prompt or fileData (for resume parsing)
    if (!isResumeFileRequest && !prompt) {
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

    // When Supabase service role is set: enforce tier and usage limits
    if (supabaseAdmin) {
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

      // Check feature access based on tier
      if (ULTIMATE_FEATURES.includes(feature_name)) {
        if (tier !== 'ultimate') {
          return res.status(403).json({ 
            error: 'This feature requires Career Architect (Ultimate) tier. Please upgrade to access Content Engine, Skill Radar, Skill Benchmarking, and AI Portfolio.' 
          });
        }
      } else if (PRO_FEATURES.includes(feature_name)) {
        if (tier === 'free') {
          return res.status(403).json({ 
            error: 'This feature requires Job Seeker (Pro) or Career Architect (Ultimate) tier. Please upgrade to access Application Tailor and Interview Prep.' 
          });
        }
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

      if (usageCount >= tierLimit) {
        return res.status(429).json({ error: 'Daily limit reached' });
      }
    }

    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    let effectiveModel = model;

    if (isResumeFileRequest) {
      // Pure-Node PDF parsing: Base64 -> Buffer -> pdf2json (raw text) -> gpt-4o -> structured JSON. Fallback: Vision with base64 snippet.
      const rawBase64 = String(fileData).includes(',') ? String(fileData).split(',')[1] : String(fileData);
      const isPdf = (mimeType && mimeType.toLowerCase().includes('pdf')) || (fileName && fileName.toLowerCase().endsWith('.pdf'));

      if (!isPdf) {
        return res.status(400).json({ error: 'Resume file must be a PDF for AI parsing. Please upload a PDF.' });
      }

      const pdfBuffer = Buffer.from(rawBase64, 'base64');
      let extractedText: string = '';

      try {
        const { default: PDFParser } = await import('pdf2json');
        extractedText = await new Promise<string>((resolve, reject) => {
          const parser = new PDFParser(null, 1); // needRawText = 1
          parser.on('pdfParser_dataError', (err: { parserError?: Error } | Error) => {
            parser.destroy();
            reject(err && typeof err === 'object' && 'parserError' in err ? err.parserError : err);
          });
          parser.on('pdfParser_dataReady', () => {
            try {
              const text = parser.getRawTextContent();
              parser.destroy();
              resolve(text ?? '');
            } catch (e) {
              parser.destroy();
              reject(e);
            }
          });
          parser.parseBuffer(pdfBuffer, 0);
        });
      } catch (parseError) {
        console.error('Parser Error Details:', parseError);
        const parseMsg = parseError instanceof Error ? parseError.message : String(parseError);
        return res.status(500).json({
          error: `PDF parse error: ${parseMsg}. File may be corrupted or image-only.`,
        });
      }

      const resumeParsePrompt = `I am providing the raw text extracted from a resume. Analyze it and return a structured JSON object. Return only valid JSON, no markdown or extra text.

CRITICAL — You MUST do the following:

1) PROFESSIONAL EXPERIENCE (required)
   - Extract the "Professional Experience" / "Work Experience" / "Employment" section.
   - Look for company names, dates, and job titles (e.g. "Senior Accounts Receivable", "Collector", "AR Specialist").
   - Even if formatting is complex or section headers vary, identify at least the most recent role.
   - Put the most recent job title into personalInfo.jobTitle.
   - Populate the experience array with at least one entry; prefer chronological order (most recent first).

2) STRICT SCHEMA
   - personalInfo: must include fullName, email, phone, location, and jobTitle (current/most recent job title).
   - experience: must be an array of objects. Each object must contain: company, position, location, duration. You may also include startDate, endDate, description, achievements.
   - skills: technical (array of strings), soft (array of strings). Optional: languages.

3) TITLE FALLBACK (validation)
   - If you cannot find an explicit job title in the resume, infer one from the most dominant technical skills.
   - Examples: SAP + Reconciliation / Collections → "Accounts Receivable Specialist"; Excel + Reporting → "Financial Analyst"; Python + Data → "Data Analyst".
   - Never leave personalInfo.jobTitle empty; use an inferred title when necessary.

Output JSON shape (use these exact keys):
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "jobTitle": "string (required: most recent role or inferred from skills)"
  },
  "summary": "string",
  "skills": { "technical": ["string"], "soft": ["string"], "languages": ["string"] },
  "experience": [
    { "company": "string", "position": "string", "location": "string", "duration": "string", "startDate": "string", "endDate": "string", "description": "string", "achievements": ["string"] }
  ],
  "education": [{ "institution": "string", "degree": "string", "field": "string", "graduationDate": "string" }]
}`;

      effectiveModel = 'gpt-4o';

      if (extractedText && extractedText.trim()) {
        messages = [
          {
            role: 'system',
            content:
              'You are an expert resume/CV parser. You MUST extract the Professional Experience section and populate experience (array) and personalInfo.jobTitle. Use company, position, location, and duration for each experience entry. If no job title is stated, infer one from dominant technical skills (e.g. SAP + Reconciliation → Accounts Receivable Specialist). Respond with only valid JSON, no markdown.',
          },
          {
            role: 'user',
            content: `${resumeParsePrompt}\n\n---\n\n${extractedText}`,
          },
        ];
      } else {
        // Vision fallback: send a snippet of raw Base64 and ask the model to interpret as document
        const base64Snippet = rawBase64.slice(0, 8000);
        messages = [
          {
            role: 'system',
            content:
              'You are an expert resume/CV parser. Text extraction from the PDF failed (e.g. image-only or scanned PDF). Return valid JSON with: personalInfo (including jobTitle—infer from context if needed), skills (technical, soft), experience (array of objects with company, position, location, duration). Never leave experience as empty or personalInfo.jobTitle missing; infer from any visible text or use a placeholder like "Professional" if necessary. Return only valid JSON, no markdown or extra text.',
          },
          {
            role: 'user',
            content: `Could not extract text from this PDF. Here is a base64 snippet of the file (first portion). Please try to interpret it as a document and return a structured JSON resume object where possible; use empty strings or empty arrays for unknown fields.\n\nBase64 snippet:\n${base64Snippet}`,
          },
        ];
      }
    } else {
      // Standard text prompt
      const safePrompt = scrubPII(prompt);
      console.log('PII Scrubbed. Original length:', prompt.length, 'New length:', safePrompt.length);

      // [AI_MATCH_DEBUG] Log start of AVAILABLE JOBS section for handshake debugging
      const availableJobsMarker = 'AVAILABLE JOBS:';
      const markerIndex = safePrompt.indexOf(availableJobsMarker);
      if (markerIndex !== -1) {
        const sectionStart = markerIndex + availableJobsMarker.length;
        const snippet = safePrompt.slice(sectionStart, sectionStart + 1200);
        console.log('[AI_MATCH_DEBUG] AVAILABLE JOBS (first 1200 chars):', snippet);
      }

      messages = [];
      if (systemMessage) {
        messages.push({
          role: 'system',
          content: systemMessage,
        });
      }
      messages.push({
        role: 'user',
        content: safePrompt,
      });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: effectiveModel,
      messages,
    });

    // Extract the response content
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    // Log successful usage when Supabase is configured
    if (supabaseAdmin) {
      const { error: logError } = await supabaseAdmin
        .from('ai_usage_logs')
        .insert({
          user_id: userId,
          feature_name: feature_name,
          created_at: new Date().toISOString(),
        });

      if (logError) {
        console.error('Error logging usage:', logError);
      }
    }

    // Return the content
    return res.status(200).json({ content });
  } catch (error: unknown) {
    let isResumeRequest = false;
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      isResumeRequest = Boolean(body?.fileData);
    } catch {
      // ignore
    }
    if (isResumeRequest) {
      console.error('Parser Error Details:', error);
    } else {
      console.error('OpenAI API error:', error);
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
    return res.status(500).json({
      error: errorMessage,
    });
  }
}

