/**
 * Convert Resume Data to HTML
 * Converts resume state to HTML for export purposes
 * Optimized to reduce HTML size by using CSS classes instead of inline styles
 */

import { ResumeData } from '../types/resume';
import { escapeHtml } from './inputSanitization';

export function resumeToHTML(resume: ResumeData): string {
  const { personalInfo, sections, settings } = resume;
  const accentColor = settings.accentColor || '#3B82F6';

  // Build CSS styles once
  const styles = `
    <style>
      :root {
        --accent-color: ${accentColor};
      }
      .resume-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid var(--accent-color);
      }
      .resume-header h1 {
        color: var(--accent-color);
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .resume-header .job-title {
        font-size: 16px;
        color: #666;
        margin-bottom: 8px;
      }
      .resume-header .contact-info {
        font-size: 12px;
        color: #666;
      }
      .resume-section {
        margin-bottom: 25px;
      }
      .resume-section h2 {
        color: var(--accent-color);
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        text-transform: uppercase;
        border-bottom: 1px solid var(--accent-color);
        padding-bottom: 5px;
      }
      .resume-section p {
        line-height: 1.6;
        color: #333;
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
      .section-items {
        margin-top: 15px;
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
      .empty-section {
        color: #999;
        font-style: italic;
      }
    </style>
  `;

  // Header HTML
  const contactInfo = [
    personalInfo.email && `<span>${escapeHtml(personalInfo.email)}</span>`,
    personalInfo.phone && `<span>${escapeHtml(personalInfo.phone)}</span>`,
    personalInfo.linkedin && `<a href="${escapeHtml(personalInfo.linkedin)}" target="_blank">LinkedIn</a>`,
    personalInfo.website && `<a href="${escapeHtml(personalInfo.website)}" target="_blank">Website</a>`,
  ].filter(Boolean).join(' • ');

  const htmlParts: string[] = [styles];

  htmlParts.push(`
    <div class="resume-header">
      ${personalInfo.fullName ? `<h1>${escapeHtml(personalInfo.fullName)}</h1>` : ''}
      ${personalInfo.jobTitle ? `<p class="job-title">${escapeHtml(personalInfo.jobTitle)}</p>` : ''}
      ${contactInfo ? `<div class="contact-info">${contactInfo}</div>` : ''}
    </div>
  `);

  // Professional Summary
  if (personalInfo.summary) {
    htmlParts.push(`
      <div class="resume-section">
        <h2>Professional Summary</h2>
        <p>${escapeHtml(personalInfo.summary).replace(/\n/g, '<br>')}</p>
      </div>
    `);
  }

  // Sections
  sections
    .filter(section => section.isVisible)
    .forEach(section => {
      htmlParts.push(`
        <div class="resume-section">
          <h2>${escapeHtml(section.title)}</h2>
      `);

      if (section.type === 'skills') {
        // Skills as tags
        const skills = section.items.map(item => item.title || String(item)).filter(Boolean);
        htmlParts.push(`
          <div class="skills-container">
            ${skills.map(skill => `<span class="skill-tag">${escapeHtml(String(skill))}</span>`).join('')}
          </div>
        `);
      } else if (section.items && section.items.length > 0) {
        // Experience, Education, etc.
        htmlParts.push('<div class="section-items">');
        section.items.forEach(item => {
          htmlParts.push(`
            <div class="section-item">
              <div class="section-item-header">
                <h3 class="section-item-title">${escapeHtml(item.title || '')}</h3>
                ${item.date ? `<span class="section-item-date">${escapeHtml(item.date)}</span>` : ''}
              </div>
              ${item.subtitle ? `<p class="section-item-subtitle">${escapeHtml(item.subtitle)}</p>` : ''}
              ${item.description ? `<p class="section-item-description">${escapeHtml(item.description).replace(/\n/g, '<br>')}</p>` : ''}
            </div>
          `);
        });
        htmlParts.push('</div>');
      } else {
        htmlParts.push('<p class="empty-section">No items in this section yet.</p>');
      }

      htmlParts.push('</div>');
    });

  return htmlParts.join('');
}

// escapeHtml is now imported from inputSanitization.ts

