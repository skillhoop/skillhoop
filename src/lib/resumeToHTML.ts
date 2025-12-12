/**
 * Convert Resume Data to HTML
 * Converts resume state to HTML for export purposes
 */

import { ResumeData } from '../types/resume';

export function resumeToHTML(resume: ResumeData): string {
  const { personalInfo, sections, settings } = resume;
  const accentColor = settings.accentColor || '#3B82F6';

  // Header HTML
  const contactInfo = [
    personalInfo.email && `<span>${escapeHtml(personalInfo.email)}</span>`,
    personalInfo.phone && `<span>${escapeHtml(personalInfo.phone)}</span>`,
    personalInfo.linkedin && `<a href="${escapeHtml(personalInfo.linkedin)}" target="_blank">LinkedIn</a>`,
    personalInfo.website && `<a href="${escapeHtml(personalInfo.website)}" target="_blank">Website</a>`,
  ].filter(Boolean).join(' • ');

  let html = `
    <div class="resume-header" style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid ${accentColor};">
      ${personalInfo.fullName ? `<h1 style="color: ${accentColor}; font-size: 28px; font-weight: bold; margin-bottom: 8px;">${escapeHtml(personalInfo.fullName)}</h1>` : ''}
      ${personalInfo.jobTitle ? `<p style="font-size: 16px; color: #666; margin-bottom: 8px;">${escapeHtml(personalInfo.jobTitle)}</p>` : ''}
      ${contactInfo ? `<div style="font-size: 12px; color: #666;">${contactInfo}</div>` : ''}
    </div>
  `;

  // Professional Summary
  if (personalInfo.summary) {
    html += `
      <div class="resume-section" style="margin-bottom: 25px;">
        <h2 style="color: ${accentColor}; font-size: 18px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid ${accentColor}; padding-bottom: 5px;">
          Professional Summary
        </h2>
        <p style="line-height: 1.6; color: #333;">${escapeHtml(personalInfo.summary).replace(/\n/g, '<br>')}</p>
      </div>
    `;
  }

  // Sections
  sections
    .filter(section => section.isVisible)
    .forEach(section => {
      html += `
        <div class="resume-section" style="margin-bottom: 25px;">
          <h2 style="color: ${accentColor}; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid ${accentColor}; padding-bottom: 5px;">
            ${escapeHtml(section.title)}
          </h2>
      `;

      if (section.type === 'skills') {
        // Skills as tags
        const skills = section.items.map(item => item.title || item.name || item).filter(Boolean);
        html += `
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${skills.map(skill => `
              <span style="background-color: #f3f4f6; color: #1f2937; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                ${escapeHtml(String(skill))}
              </span>
            `).join('')}
          </div>
        `;
      } else if (section.items && section.items.length > 0) {
        // Experience, Education, etc.
        html += '<div style="space-y: 15px;">';
        section.items.forEach(item => {
          html += `
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                <h3 style="font-weight: bold; font-size: 16px; color: #1f2937; margin: 0;">
                  ${escapeHtml(item.title || '')}
                </h3>
                ${item.date ? `<span style="font-size: 12px; color: #666; white-space: nowrap; margin-left: 10px;">${escapeHtml(item.date)}</span>` : ''}
              </div>
              ${item.subtitle ? `<p style="font-style: italic; color: #666; margin-bottom: 5px; font-size: 14px;">${escapeHtml(item.subtitle)}</p>` : ''}
              ${item.description ? `<p style="line-height: 1.6; color: #333; font-size: 13px; white-space: pre-line;">${escapeHtml(item.description).replace(/\n/g, '<br>')}</p>` : ''}
            </div>
          `;
        });
        html += '</div>';
      } else {
        html += '<p style="color: #999; font-style: italic;">No items in this section yet.</p>';
      }

      html += '</div>';
    });

  return html;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

