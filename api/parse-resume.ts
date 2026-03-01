import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const RESUME_STORAGE_BUCKET = 'resumes';

// Supabase admin client for Storage upload (RLS: use userId as folder prefix)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TIER_LIMITS: Record<string, number> = {
  free: 5,
  pro: 50,
  ultimate: 200,
};
const PRO_FEATURES = ['application_tailor', 'interview_prep'];
const ULTIMATE_FEATURES = ['content_engine', 'skill_radar', 'skill_benchmarking', 'ai_portfolio'];

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

function getSpecificStorageErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  const rawMsg = typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message?: string }).message)
    : msg;
  const lower = (rawMsg || msg).toLowerCase();
  if (lower.includes('bucket') && (lower.includes('not found') || lower.includes('does not exist')))
    return rawMsg || 'Bucket not found. Ensure a Supabase Storage bucket named "resumes" exists.';
  if (lower.includes('unauthorized') || lower.includes('permission') || lower.includes('policy') || lower.includes('row level'))
    return rawMsg || 'Unauthorized: Storage RLS or permissions may be blocking upload.';
  if (lower.includes('jwt') || lower.includes('invalid api key') || lower.includes('service role'))
    return rawMsg || 'Supabase service role key invalid or missing.';
  return rawMsg || msg || 'Storage upload failed.';
}

function getSpecificOpenAIErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();
  if (lower.includes('api key') || lower.includes('invalid_api_key') || lower.includes('incorrect_api_key'))
    return 'API Key missing or invalid. Set OPENAI_API_KEY on the server.';
  if (lower.includes('rate limit') || lower.includes('429'))
    return 'OpenAI rate limit exceeded. Try again in a moment.';
  return msg || 'AI parsing failed.';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { fileData, fileName, mimeType, userId, feature_name = 'job_finder' } = body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!fileData || typeof fileData !== 'string') {
      return res.status(400).json({ error: 'File data (base64) is required' });
    }

    // Enforce tier and usage limits when Supabase is configured (skip if profiles table missing/fails)
    if (supabaseAdmin) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('tier')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Parser Error Details: profile fetch failed (e.g. row missing). Auto-creating profile.', profileError);
        // Ensure profile row exists so DB dependencies (e.g. RLS) are satisfied before resume processing
        const { error: upsertError } = await supabaseAdmin
          .from('profiles')
          .upsert({ id: userId, updated_at: new Date().toISOString() }, { onConflict: 'id' });
        if (upsertError) {
          console.error('Parser Error Details: profile upsert failed (non-fatal).', upsertError);
        }
        // Do not fail: proceed without tier/usage enforcement for this request
      } else {
        const tier = (profile?.tier as string) || 'free';
        if (ULTIMATE_FEATURES.includes(feature_name) && tier !== 'ultimate') {
          return res.status(403).json({ error: 'This feature requires Career Architect (Ultimate) tier.' });
        }
        if (PRO_FEATURES.includes(feature_name) && tier === 'free') {
          return res.status(403).json({ error: 'This feature requires Job Seeker (Pro) or Career Architect (Ultimate) tier.' });
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todayStart = today.toISOString();
        const { count, error: usageError } = await supabaseAdmin
          .from('ai_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', todayStart);

        if (usageError) {
          console.error('Parser Error Details: usage check', usageError);
          return res.status(500).json({ error: 'Failed to check usage limits' });
        }

        const usageCount = count ?? 0;
        const tierLimit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
        if (usageCount >= tierLimit) {
          return res.status(429).json({ error: 'Daily limit reached' });
        }
      }
    }

    const rawBase64 = String(fileData).includes(',') ? String(fileData).split(',')[1] : String(fileData);
    const isPdf = (mimeType && String(mimeType).toLowerCase().includes('pdf')) || (fileName && String(fileName).toLowerCase().endsWith('.pdf'));
    if (!isPdf) {
      return res.status(400).json({ error: 'Resume file must be a PDF for AI parsing. Please upload a PDF.' });
    }

    const safeName = (fileName && String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_')) || 'resume.pdf';
    // User ID as folder prefix for RLS: resumes/{userId}/{timestamp}-{filename}
    const storagePath = `${userId}/${Date.now()}-${safeName}`;
    const pdfBuffer = Buffer.from(rawBase64, 'base64');

    console.log('File size:', pdfBuffer.length);

    // ——— Step 1: Upload to Supabase Storage ———
    if (supabaseAdmin) {
      const { error: bucketError } = await supabaseAdmin.storage.getBucket(RESUME_STORAGE_BUCKET);
      if (bucketError) {
        console.error('Parser Error Details: bucket check', bucketError);
        return res.status(400).json({
          error: "Storage bucket 'resumes' not found. Please create it in Supabase Storage.",
        });
      }
      try {
        const { error: uploadError } = await supabaseAdmin.storage
          .from(RESUME_STORAGE_BUCKET)
          .upload(storagePath, pdfBuffer, {
            contentType: mimeType || 'application/pdf',
            upsert: false,
          });

        if (uploadError) {
          console.error('Parser Error Details:', uploadError);
          const specificMessage = getSpecificStorageErrorMessage(uploadError);
          const rawMessage = typeof uploadError === 'object' && uploadError !== null && 'message' in uploadError
            ? String((uploadError as { message?: string }).message)
            : specificMessage;
          return res.status(500).json({ error: rawMessage || specificMessage });
        }
      } catch (uploadErr) {
        console.error('Parser Error Details:', uploadErr);
        const specificMessage = getSpecificStorageErrorMessage(uploadErr);
        const rawMessage = uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
        return res.status(500).json({ error: rawMessage || specificMessage });
      }
    } else {
      // No Supabase configured — skip upload but continue to parse (optional)
      console.warn('Supabase not configured; skipping resume storage upload. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable.');
    }

    // ——— Step 2: AI parsing (PDF text extraction + OpenAI) ———
    if (!process.env.OPENAI_API_KEY) {
      console.error('Parser Error Details: OPENAI_API_KEY is not set');
      return res.status(500).json({ error: 'API Key missing. Set OPENAI_API_KEY on the server.' });
    }

    let extractedText = '';
    try {
      const { default: PDFParser } = await import('pdf2json');
      extractedText = await new Promise<string>((resolve, reject) => {
        const parser = new PDFParser(null, true);
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
    } catch (parseErr) {
      console.error('Parser Error Details:', parseErr);
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      return res.status(500).json({
        error: `PDF parse error: ${msg}. File may be corrupted or image-only.`,
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

    const systemContent =
      'You are an expert resume/CV parser. You MUST extract the Professional Experience section and populate experience (array) and personalInfo.jobTitle. Use company, position, location, and duration for each experience entry. If no job title is stated, infer one from dominant technical skills. Respond with only valid JSON, no markdown.';

    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    if (extractedText && extractedText.trim()) {
      messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: `${resumeParsePrompt}\n\n---\n\n${extractedText}` },
      ];
    } else {
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

    let content: string;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
      });
      content = completion.choices[0]?.message?.content ?? '';
    } catch (openaiErr) {
      console.error('Parser Error Details:', openaiErr);
      const specificMessage = getSpecificOpenAIErrorMessage(openaiErr);
      return res.status(500).json({ error: specificMessage });
    }

    if (!content) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    if (supabaseAdmin) {
      const { error: logError } = await supabaseAdmin
        .from('ai_usage_logs')
        .insert({
          user_id: userId,
          feature_name: feature_name,
          created_at: new Date().toISOString(),
        });
      if (logError) {
        console.error('Parser Error Details: usage log insert', logError);
      }
    }

    return res.status(200).json({ content });
  } catch (error: unknown) {
    console.error('Parser Error Details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload or parse resume';
    return res.status(500).json({ error: errorMessage });
  }
}
