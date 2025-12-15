/**
 * Resume Parser Utility
 * Extracts structured data from resume files using OpenAI
 */

import { supabase } from './supabase';
import type { ResumeData as ContextResumeData, ResumeSection } from '../types/resume';
import { createDateRangeString, parseToStandardDate } from './dateFormatHelpers';


export interface ParsedResumeData {
  personalInfo: {
    fullName: string; // Changed from 'name' to 'fullName' for consistency
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    portfolio: string;
  };
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

/**
 * Extract text from a PDF file using pdf.js
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamically import pdf.js
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source (required for pdf.js)
    // Use a more reliable CDN or local worker
    if (typeof window !== 'undefined') {
      // Try to use unpkg CDN first, fallback to jsdelivr
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      verbosity: 0, // Suppress warnings
    });
    
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => {
            // Handle both string and object text items
            if (typeof item.str === 'string') {
              return item.str;
            }
            return '';
          })
          .filter((text: string) => text.trim().length > 0)
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i}:`, pageError);
        // Continue with other pages
      }
    }
    
    if (fullText.trim().length < 50) {
      throw new Error('Could not extract sufficient text from PDF. The PDF may be image-based, password-protected, or corrupted.');
    }
    
    return fullText.trim();
  } catch (error: unknown) {
    console.error('Error extracting text from PDF:', error);
    
    const errorMessage = (error instanceof Error ? error.message : String(error)) || '';
    const errorMessageLower = errorMessage.toLowerCase();
    
    // Check for password-protected or encrypted files
    if (errorMessageLower.includes('password') || errorMessageLower.includes('encrypted')) {
      throw new Error('File is password protected.');
    }
    
    // Check for corrupted or invalid files
    if (errorMessageLower.includes('corrupt') || errorMessageLower.includes('invalid') || 
        errorMessageLower.includes('malformed') || errorMessageLower.includes('unexpected')) {
      throw new Error('File appears to be corrupted.');
    }
    
    // Generic error fallback
    throw new Error(`Failed to extract text from PDF: ${errorMessage || 'Unknown error'}`);
  }
}

/**
 * Extract text from a DOCX file using mammoth
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    // Dynamically import mammoth
    const mammoth = await import('mammoth');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length < 50) {
      throw new Error('Could not extract sufficient text from DOCX file.');
    }
    
    return result.value.trim();
  } catch (error: unknown) {
    console.error('Error extracting text from DOCX:', error);
    
    const errorMessage = (error instanceof Error ? error.message : String(error)) || '';
    const errorMessageLower = errorMessage.toLowerCase();
    
    // Check for password-protected or encrypted files
    if (errorMessageLower.includes('password') || errorMessageLower.includes('encrypted')) {
      throw new Error('File is password protected.');
    }
    
    // Check for corrupted or invalid files
    if (errorMessageLower.includes('corrupt') || errorMessageLower.includes('invalid') || 
        errorMessageLower.includes('malformed') || errorMessageLower.includes('unexpected') ||
        errorMessageLower.includes('not a valid')) {
      throw new Error('File appears to be corrupted.');
    }
    
    // Generic error fallback
    throw new Error(`Failed to extract text from DOCX: ${errorMessage || 'Unknown error'}`);
  }
}

/**
 * Extract text from a file (supports PDF, DOCX, and TXT)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;
  
  try {
    // Handle PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    }
    
    // Handle DOCX files
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractTextFromDOCX(file);
    }
    
    // Handle DOC files (legacy Word format - try to read as text)
    if (
      fileType === 'application/msword' ||
      fileName.endsWith('.doc')
    ) {
      // DOC files are binary, but we can try basic extraction
      // For better results, users should convert to DOCX
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text && text.length > 50) {
            // Try to extract readable text
            const readableText = text.match(/[A-Za-z0-9\s.,;:!?\-()]{3,}/g)?.join(' ') || '';
            if (readableText.length > 50) {
              resolve(readableText);
            } else {
              reject(new Error('Could not extract text from DOC file. Please convert to DOCX or PDF format.'));
            }
          } else {
            reject(new Error('Could not read DOC file. Please convert to DOCX or PDF format.'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading DOC file'));
        reader.readAsText(file);
      });
    }
    
    // Handle text files
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text) {
            resolve(text);
          } else {
            reject(new Error('Failed to read text file'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading text file'));
        reader.readAsText(file);
      });
    }
    
    // Unsupported file type
    throw new Error(`Unsupported file type: ${fileType || 'unknown'}. Please use PDF, DOCX, or TXT format.`);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unsupported file type')) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error extracting text: ${errorMessage}`);
  }
}

/**
 * Parse resume using OpenAI
 */
export async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  const prompt = `Extract structured data from this resume text and return valid JSON only. The JSON should include:
{
  "personalInfo": {
    "fullName": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedIn": "linkedin.com/in/username",
    "portfolio": "website.com"
  },
  "summary": "Professional summary",
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["communication", "leadership"],
    "languages": ["English", "Spanish"]
  },
  "experience": [{
    "company": "Company Name",
    "position": "Job Title",
    "startDate": "YYYY-MM",
    "endDate": "YYYY-MM or Present",
    "description": "Job description",
    "achievements": ["achievement1", "achievement2"]
  }],
  "education": [{
    "institution": "University Name",
    "degree": "Degree Type",
    "field": "Field of Study",
    "graduationDate": "YYYY-MM"
  }],
  "certifications": [{
    "name": "Certification Name",
    "issuer": "Issuing Organization",
    "date": "YYYY-MM",
    "expiryDate": "YYYY-MM or null"
  }],
  "projects": [{
    "name": "Project Name",
    "description": "Project description",
    "technologies": ["tech1", "tech2"],
    "link": "project-url.com"
  }]
}

Resume text:
${resumeText}

Return only valid JSON, no additional text:`;

  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Import network error handler
    const { apiFetch } = await import('./networkErrorHandler');

    const data = await apiFetch<{ content: string }>('/api/generate', {
      method: 'POST',
      body: {
        model: 'gpt-4o-mini',
        systemMessage: 'You are an expert resume parser. Extract structured data from resume text and return only valid JSON.',
        prompt: prompt,
        userId: userId,
        feature_name: 'resume_parser',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any, // apiFetch handles JSON.stringify internally
      timeout: 60000, // 60 seconds for parsing
      retries: 2, // Retry twice for parsing
    });

    const content = data.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // If no JSON found, try parsing the whole content
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing resume with AI:', error);
    
    // Handle network errors with user-friendly messages
    if (error instanceof Error && 'type' in error) {
      const { showNetworkError } = await import('./networkErrorHandler');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      showNetworkError(error as any, 'parsing your resume');
    }
    
    throw error;
  }
}

/**
 * Parse resume from uploaded file
 */
export async function parseResume(file: File): Promise<ParsedResumeData> {
  try {
    // Extract text from file
    const resumeText = await extractTextFromFile(file);
    
    // Parse with AI
    const parsedData = await parseResumeWithAI(resumeText);
    
    // Save to localStorage
    const savedResumes = getSavedResumes();
    savedResumes[file.name] = parsedData;
    localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
    
    return parsedData;
  } catch (error: unknown) {
    console.error('Error parsing resume:', error);
    
    // Re-throw if it's already a user-friendly error message
    if (error instanceof Error && (
      error.message === 'File is password protected.' ||
      error.message === 'File appears to be corrupted.'
    )) {
      throw error;
    }
    
    // Check error message for password/encrypted/corrupt indicators
    const errorMessage = (error instanceof Error ? error.message : String(error)) || '';
    const errorMessageLower = errorMessage.toLowerCase();
    
    if (errorMessageLower.includes('password') || errorMessageLower.includes('encrypted')) {
      throw new Error('File is password protected.');
    }
    
    if (errorMessageLower.includes('corrupt') || errorMessageLower.includes('invalid') ||
        errorMessageLower.includes('malformed')) {
      throw new Error('File appears to be corrupted.');
    }
    
    // Re-throw the original error if it doesn't match our specific cases
    throw error;
  }
}

/**
 * Get saved resumes from localStorage
 */
export function getSavedResumes(): Record<string, ParsedResumeData> {
  const saved = localStorage.getItem('parsed_resumes');
  return saved ? JSON.parse(saved) : {};
}

/**
 * Save resume data to localStorage
 */
export function saveResume(resumeName: string, data: ParsedResumeData): void {
  const savedResumes = getSavedResumes();
  savedResumes[resumeName] = data;
  localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
}

/**
 * Get a specific resume by name
 */
export function getResume(resumeName: string): ParsedResumeData | null {
  const savedResumes = getSavedResumes();
  return savedResumes[resumeName] || null;
}

/**
 * Get the most recent resume
 */
export function getLatestResume(): ParsedResumeData | null {
  const savedResumes = getSavedResumes();
  const resumeNames = Object.keys(savedResumes);
  
  if (resumeNames.length === 0) {
    return null;
  }
  
  // Return the most recently added resume
  return savedResumes[resumeNames[resumeNames.length - 1]];
}

/**
 * Clear all saved resumes
 */
export function clearAllResumes(): void {
  localStorage.removeItem('parsed_resumes');
}

/**
 * Parse resume from text and convert to ResumeData format for the editor
 * This function takes raw resume text and returns data in the format expected by ResumeContext
 */
export async function parseResumeFromText(text: string): Promise<Partial<ContextResumeData>> {
  // Parse the resume text using AI
  const parsedData = await parseResumeWithAI(text);
  
  // Convert to ResumeData format used in the context
  // Handle both 'name' and 'fullName' for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const personalInfoName = parsedData.personalInfo.fullName || (parsedData.personalInfo as any).name || '';
  
  const resumeData: Partial<ContextResumeData> = {
    personalInfo: {
      fullName: personalInfoName,
      email: parsedData.personalInfo.email || '',
      phone: parsedData.personalInfo.phone || '',
      location: parsedData.personalInfo.location || '',
      linkedin: parsedData.personalInfo.linkedIn || '',
      website: parsedData.personalInfo.portfolio || '',
      summary: parsedData.summary || '',
    },
    sections: [],
  };

  // Convert experience
  if (parsedData.experience && parsedData.experience.length > 0) {
    const experienceSection: ResumeSection = {
      id: 'experience',
      type: 'experience',
      title: 'Experience',
      isVisible: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: parsedData.experience.map((exp: any, idx: number) => ({
        id: `exp_${Date.now()}_${idx}`,
        title: exp.position || '',
        subtitle: exp.company || '',
        date: createDateRangeString(exp.startDate, exp.endDate || 'Present'),
        description: [
          exp.description || '',
          ...(exp.achievements || []).map((ach: string) => `• ${ach}`),
        ].filter(Boolean).join('\n'),
      })),
    };
    resumeData.sections!.push(experienceSection);
  }

  // Convert education
  // Use standardized structure: title = institution, subtitle = degree
  if (parsedData.education && parsedData.education.length > 0) {
    const educationSection: ResumeSection = {
      id: 'education',
      type: 'education',
      title: 'Education',
      isVisible: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: parsedData.education.map((edu: any, idx: number) => ({
        id: `edu_${Date.now()}_${idx}`,
        title: edu.institution || '', // Institution goes in title
        subtitle: `${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}`, // Degree goes in subtitle
        date: parseToStandardDate(edu.graduationDate || ''),
        description: '',
      })),
    };
    resumeData.sections!.push(educationSection);
  }

  // Convert skills
  const allSkills = [
    ...(parsedData.skills?.technical || []),
    ...(parsedData.skills?.soft || []),
  ];
  if (allSkills.length > 0) {
    const skillsSection: ResumeSection = {
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      isVisible: true,
      items: allSkills.map((skill, idx) => ({
        id: `skill_${Date.now()}_${idx}`,
        title: skill,
        subtitle: '',
        date: '',
        description: '',
      })),
    };
    resumeData.sections!.push(skillsSection);
  }

  // Convert certifications
  if (parsedData.certifications && parsedData.certifications.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resumeData.certifications = parsedData.certifications.map((cert: any, idx: number) => ({
      id: `cert_${Date.now()}_${idx}`,
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
      url: undefined,
    }));
  }

  // Convert projects
  if (parsedData.projects && parsedData.projects.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resumeData.projects = parsedData.projects.map((proj: any, idx: number) => ({
      id: `proj_${Date.now()}_${idx}`,
      title: proj.name || '',
      description: proj.description || '',
      startDate: '',
      endDate: '',
      url: proj.link,
      technologies: proj.technologies || [],
    }));
  }

  // Convert languages
  if (parsedData.skills?.languages && parsedData.skills.languages.length > 0) {
    resumeData.languages = parsedData.skills.languages.map((lang: string, idx: number) => ({
      id: `lang_${Date.now()}_${idx}`,
      language: lang,
      proficiency: 'Fluent' as const,
    }));
  }

  return resumeData;
}


