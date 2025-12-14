/**
 * Resume Export Utilities
 * Provides multiple export formats: PDF, DOCX, HTML, TXT, and shareable links
 */

// --- Types ---
export interface ExportOptions {
  title: string;
  content: string;
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
  margins?: { top: number; right: number; bottom: number; left: number };
  accentColor?: string;
}

export interface ShareableLinkData {
  id: string;
  title: string;
  content: string;
  templateId?: string;
  createdAt: string;
  expiresAt?: string;
}

// --- Storage Keys ---
const STORAGE_KEYS = {
  SHARED_RESUMES: 'shared_resumes',
};

// --- Helper Functions ---

/**
 * Strip HTML tags and convert to plain text
 */
function htmlToPlainText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Replace <br> and block elements with newlines
  const text = div.innerHTML
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '');
  
  // Clean up extra whitespace
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Generate a unique ID for shareable links using crypto.randomUUID()
 */
function generateShareId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `resume_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Compress string using base64 (for URL-safe sharing)
 */
function compressForUrl(text: string): string {
  try {
    return btoa(encodeURIComponent(text));
  } catch (e) {
    console.error('Error compressing text:', e);
    return '';
  }
}

/**
 * Decompress string from URL format
 */
export function decompressFromUrl(compressed: string): string {
  try {
    return decodeURIComponent(atob(compressed));
  } catch (e) {
    console.error('Error decompressing text:', e);
    return '';
  }
}

// --- Export Functions ---

/**
 * Export resume as PDF using html2pdf.js
 * Generates PDF directly without browser print dialog
 */
export async function exportToPDF(options: ExportOptions): Promise<boolean> {
  const {
    title,
    content,
    fontFamily = 'Inter, system-ui, sans-serif',
    fontSize = 11,
    lineSpacing = 1.4,
    margins = { top: 20, right: 20, bottom: 20, left: 20 },
    accentColor = '#3B82F6'
  } = options;

  try {
    // Dynamically import html2pdf.js
    const html2pdf = (await import('html2pdf.js')).default;

    // Load Google Fonts if needed
    if (fontFamily.includes('Inter')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      // Wait for font to load
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Create a temporary container element
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 width
    container.style.padding = '0';
    container.style.margin = '0';
    container.style.background = 'white';
    container.style.fontFamily = fontFamily;
    container.style.fontSize = `${fontSize}pt`;
    container.style.lineHeight = `${lineSpacing}`;
    container.style.color = '#1f2937';
    
    // Create the HTML content with inline styles (better compatibility)
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      .resume-content {
        width: 100%;
        padding: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
      }
      
      p {
        margin-bottom: 0.5em;
      }
      
      b, strong {
        color: ${accentColor};
        font-weight: 600;
      }
      
      .resume-section {
        margin-bottom: 1.5em;
      }
      
      .resume-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid ${accentColor};
      }
      
      .resume-header h1 {
        color: ${accentColor};
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      
      ul, ol {
        margin-left: 1.5em;
        margin-bottom: 0.5em;
      }
      
      li {
        margin-bottom: 0.25em;
      }
      
      a {
        color: ${accentColor};
        text-decoration: none;
      }
      
      .skills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .skill-tag {
        background-color: #f3f4f6;
        color: #1f2937;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .section-item {
        margin-bottom: 15px;
      }
      
      .section-item-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 5px;
      }
      
      .section-item-title {
        font-weight: bold;
        font-size: 16px;
        color: #1f2937;
        margin: 0;
      }
      
      .section-item-date {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
        margin-left: 10px;
      }
      
      .section-item-subtitle {
        font-style: italic;
        color: #666;
        margin-bottom: 5px;
        font-size: 14px;
      }
      
      .section-item-description {
        line-height: 1.6;
        color: #333;
        font-size: 13px;
        white-space: pre-line;
      }
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'resume-content';
    contentDiv.innerHTML = content;
    
    container.appendChild(styleElement);
    container.appendChild(contentDiv);

    // Append to body temporarily
    document.body.appendChild(container);

    // Wait for images to load
    const images = container.querySelectorAll('img');
    if (images.length > 0) {
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
            setTimeout(resolve, 3000); // Timeout after 3 seconds
          });
        })
      );
    }

    // Additional wait for rendering
    await new Promise(resolve => setTimeout(resolve, 300));

    // Configure PDF options
    const marginArray: [number, number, number, number] = [margins.top, margins.right, margins.bottom, margins.left];
    const opt = {
      margin: marginArray,
      filename: `${sanitizeFilename(title)}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        allowTaint: false,
        backgroundColor: '#ffffff',
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const,
        compress: true,
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    // Generate and download PDF
    await html2pdf().set(opt).from(container).save();

    // Clean up
    document.body.removeChild(container);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export resume as HTML file
 */
export function exportToHTML(options: ExportOptions): void {
  const {
    title,
    content,
    fontFamily = 'Inter, system-ui, sans-serif',
    fontSize = 11,
    lineSpacing = 1.4,
    accentColor = '#3B82F6'
  } = options;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${fontFamily};
      font-size: ${fontSize}pt;
      line-height: ${lineSpacing};
      color: #1f2937;
      background: #f8fafc;
      padding: 40px;
    }
    .resume-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      padding: 40px;
    }
    p { margin-bottom: 0.5em; }
    b, strong { color: ${accentColor}; font-weight: 600; }
    .resume-section { margin-bottom: 1em; }
    ul, ol { margin-left: 1.5em; margin-bottom: 0.5em; }
    li { margin-bottom: 0.25em; }
    @media print {
      body { background: white; padding: 0; }
      .resume-container { box-shadow: none; padding: 20mm; }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    ${content}
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(title)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export resume as plain text file
 */
export function exportToTXT(options: ExportOptions): void {
  const { title, content } = options;
  
  const plainText = htmlToPlainText(content);
  
  const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(title)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export resume as DOCX-compatible RTF file
 * Note: This creates an RTF file that can be opened in Word
 * RTF is a reliable fallback format that doesn't require external libraries
 */
export function exportToRTF(options: ExportOptions): void {
  const { title, content, fontFamily = 'Arial', accentColor = '#3B82F6' } = options;
  
  // Convert HTML to plain text with basic formatting
  const plainText = htmlToPlainText(content);
  
  // Extract RGB values from accent color
  const getRtfColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `\\red${r}\\green${g}\\blue${b}`;
  };
  
  // Escape RTF special characters
  const escapeRtf = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/\n/g, '\\par\n');
  };
  
  // Parse font family (take first font if multiple)
  const primaryFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  
  // Create RTF content with improved formatting
  const lines = plainText.split('\n');
  const rtfLines = lines.map((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return '\\par';
    
    // Detect headings (all caps, short lines, or lines ending with colon)
    const isHeading = (
      (trimmedLine.match(/^[A-Z\s]+$/) && trimmedLine.length < 50 && trimmedLine.length > 2) ||
      trimmedLine.endsWith(':') ||
      (index === 0 && trimmedLine.length < 100)
    );
    
    if (isHeading) {
      return `\\b\\fs28 ${escapeRtf(trimmedLine)}\\b0\\fs22\\par`;
    }
    
    return `${escapeRtf(trimmedLine)}\\par`;
  });
  
  const rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033
{\\fonttbl{\\f0\\fnil\\fcharset0 ${primaryFont};}}
{\\colortbl ;\\red0\\green0\\blue0;${getRtfColor(accentColor)};}
{\\*\\generator Career Clarified Resume Export}\\viewkind4\\uc1 
\\pard\\sa200\\sl276\\slmult1\\f0\\fs22\\lang9
${rtfLines.join('\n')}
}`;

  const blob = new Blob([rtfContent], { type: 'application/rtf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(title)}.rtf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export resume as DOCX file
 * Creates a proper DOCX file using the docx library
 * Falls back to RTF format if docx library is unavailable
 * @returns Object with success status and fallback information
 */
export async function exportToDOCX(options: ExportOptions): Promise<{ success: boolean; usedFallback: boolean; format: 'docx' | 'rtf' }> {
  const { title, content, fontFamily = 'Inter, system-ui, sans-serif' } = options;
  
  // Try to use docx library first
  try {
    // Check if docx library is available
    const docxModule = await import('docx').catch(() => null);
    const fileSaverModule = await import('file-saver').catch(() => null);
    
    if (!docxModule || !fileSaverModule) {
      throw new Error('DOCX library not available');
    }
    
    const { Document, Packer, Paragraph, HeadingLevel } = docxModule;
    const { saveAs } = fileSaverModule;
    
    // Convert HTML to plain text with structure
    const plainText = htmlToPlainText(content);
    const lines = plainText.split('\n').filter(line => line.trim());
    
    // Build document paragraphs
    // Note: docx library's Paragraph type is complex, using any for compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const children: any[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Detect headings (all caps, short lines, or lines ending with colon)
      if (
        (trimmedLine.match(/^[A-Z\s]+$/) && trimmedLine.length < 50 && trimmedLine.length > 2) ||
        trimmedLine.endsWith(':') ||
        (index === 0 && trimmedLine.length < 100)
      ) {
        children.push(
          new Paragraph({
            text: trimmedLine,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          })
        );
      } else {
        // Regular paragraph
        children.push(
          new Paragraph({
            text: trimmedLine,
            spacing: { after: 120 },
          })
        );
      }
    });
    
    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });
    
    // Generate and download
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${sanitizeFilename(title)}.docx`);
    
    return { success: true, usedFallback: false, format: 'docx' };
  } catch (error) {
    console.warn('DOCX library not available or failed, using RTF fallback:', error);
    
    // Fallback to RTF - always available, no external dependencies
    try {
      exportToRTF({ ...options, fontFamily });
      return { success: true, usedFallback: true, format: 'rtf' };
    } catch (rtfError) {
      console.error('Error creating RTF fallback:', rtfError);
      throw new Error('Failed to export document. Both DOCX and RTF formats failed.');
    }
  }
}

/**
 * Export resume as JSON (for backup/import)
 */
export function exportToJSON(resume: {
  title: string;
  content: string;
  templateId?: string;
  atsScore?: number;
  photoUrl?: string;
}): void {
  const exportData = {
    ...resume,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(resume.title)}_backup.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- Shareable Links ---

/**
 * Create a shareable link for a resume
 */
export function createShareableLink(resume: {
  title: string;
  content: string;
  templateId?: string;
}): { id: string; url: string } {
  const id = generateShareId();
  
  const shareData: ShareableLinkData = {
    id,
    title: resume.title,
    content: resume.content,
    templateId: resume.templateId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  };

  // Store in localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHARED_RESUMES);
    const sharedResumes: ShareableLinkData[] = stored ? JSON.parse(stored) : [];
    sharedResumes.push(shareData);
    localStorage.setItem(STORAGE_KEYS.SHARED_RESUMES, JSON.stringify(sharedResumes));
  } catch (e) {
    console.error('Error storing shareable link:', e);
  }

  // Generate URL with compressed data as fallback
  // Note: compressedData is generated for potential future use with the share URL
  compressForUrl(JSON.stringify({
    t: resume.title,
    c: resume.content.substring(0, 5000), // Limit size for URL
  }));

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/dashboard/resume-studio?share=${id}`;
  
  return { id, url: shareUrl };
}

/**
 * Get a shared resume by ID
 */
export function getSharedResume(id: string): ShareableLinkData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHARED_RESUMES);
    if (!stored) return null;
    
    const sharedResumes: ShareableLinkData[] = JSON.parse(stored);
    const resume = sharedResumes.find(r => r.id === id);
    
    if (resume && resume.expiresAt) {
      // Check if expired
      if (new Date(resume.expiresAt) < new Date()) {
        // Remove expired link
        const filtered = sharedResumes.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.SHARED_RESUMES, JSON.stringify(filtered));
        return null;
      }
    }
    
    return resume || null;
  } catch (e) {
    console.error('Error getting shared resume:', e);
    return null;
  }
}

/**
 * Delete a shared resume link
 */
export function deleteShareableLink(id: string): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHARED_RESUMES);
    if (!stored) return false;
    
    const sharedResumes: ShareableLinkData[] = JSON.parse(stored);
    const filtered = sharedResumes.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHARED_RESUMES, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Error deleting shareable link:', e);
    return false;
  }
}

/**
 * Get all shareable links for current user
 */
export function getAllShareableLinks(): ShareableLinkData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHARED_RESUMES);
    if (!stored) return [];
    
    const sharedResumes: ShareableLinkData[] = JSON.parse(stored);
    const now = new Date();
    
    // Filter out expired links
    return sharedResumes.filter(r => {
      if (r.expiresAt && new Date(r.expiresAt) < now) {
        return false;
      }
      return true;
    });
  } catch (e) {
    console.error('Error getting shareable links:', e);
    return [];
  }
}

// --- QR Code ---

/**
 * Generate QR code URL using public API
 */
export function generateQRCodeUrl(text: string, size: number = 200): string {
  const encodedText = encodeURIComponent(text);
  // Using QR Server API (free, no API key required)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&format=svg`;
}

/**
 * Generate QR code as base64 data URL
 */
export async function generateQRCodeDataUrl(text: string, size: number = 200): Promise<string> {
  try {
    const response = await fetch(generateQRCodeUrl(text, size));
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Error generating QR code:', e);
    throw e;
  }
}

// --- Utility Functions ---

/**
 * Sanitize filename for safe download
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (fallbackError) {
      console.error('Error copying to clipboard:', fallbackError);
      return false;
    }
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


