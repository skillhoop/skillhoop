/**
 * Turn job description + JSearch highlights into scannable sections for the Job Finder workspace.
 */
import type { JobHighlights } from '../types/job';

export interface JobWorkspaceSection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

function htmlToPlain(text: string): string {
  if (!text?.trim()) return '';
  let s = text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  s = s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  return s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();
}

function matchSectionHeader(line: string): { key: string; title: string } | null {
  const t = line.trim().replace(/^#{1,6}\s+/, '').replace(/:\s*$/, '').trim();
  if (t.length > 100) return null;
  const rules: { key: string; title: string; re: RegExp }[] = [
    { key: 'company', title: 'Company description', re: /^(about (the )?company|about us|who we are|our company|company overview|the organization)$/i },
    { key: 'overview', title: 'Role overview', re: /^(job description|the role|role overview|position (summary|overview)|overview|summary|opening)$/i },
    {
      key: 'responsibilities',
      title: 'Key responsibilities',
      re: /^(key )?responsibilit(y|ies)|what you('ll| will) do|duties|day[- ]to[- ]day|in this role|your role$/i,
    },
    { key: 'skills', title: 'Skills required', re: /^(skills|technical skills|required skills|key skills|competencies|technologies|tech stack)$/i },
    {
      key: 'qualifications',
      title: 'Qualifications',
      re: /^(qualifications|requirements|what we('re| are) looking for|must have|you have|minimum qualifications|education|experience required|eligibility)$/i,
    },
    { key: 'benefits', title: 'Benefits', re: /^(benefits|what we offer|perks|compensation( &| and)? benefits)$/i },
  ];
  for (const r of rules) {
    if (r.re.test(t)) return { key: r.key, title: r.title };
  }
  return null;
}

function parseStructuredDescription(description: string): {
  sections: Map<string, { title: string; lines: string[] }>;
  preamble: string[];
} {
  const plain = htmlToPlain(description);
  const rawLines = plain.split(/\r?\n/);
  const preamble: string[] = [];
  const sections = new Map<string, { title: string; lines: string[] }>();
  let currentKey: '__preamble__' | string = '__preamble__';

  for (let raw of rawLines) {
    const line = raw.trim();
    if (!line) continue;
    const hdr = matchSectionHeader(line);
    if (hdr) {
      currentKey = hdr.key;
      if (!sections.has(hdr.key)) sections.set(hdr.key, { title: hdr.title, lines: [] });
      continue;
    }
    if (currentKey === '__preamble__') preamble.push(line);
    else sections.get(currentKey)!.lines.push(line);
  }
  return { sections, preamble };
}

function linesToBullets(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const m = line.match(/^[-–•*]\s*(.+)$|^\d+[.)]\s*(.+)$/);
    if (m) out.push((m[1] || m[2]).trim());
    else out.push(line);
  }
  return out.filter(Boolean);
}

function formatSectionLines(lines: string[]): { paragraphs?: string[]; bullets?: string[] } {
  if (!lines.length) return {};
  const bulletish = lines.filter((l) => /^[-–•*]\s|^\d+[.)]\s/.test(l));
  if (bulletish.length >= Math.max(2, Math.ceil(lines.length * 0.45))) {
    return { bullets: linesToBullets(lines) };
  }
  const joined = lines.join('\n').trim();
  const paras = joined
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean);
  if (paras.length) return { paragraphs: paras };
  return { paragraphs: [joined] };
}

function splitLooseRequirements(text: string): string[] {
  const plain = htmlToPlain(text);
  const lines = plain.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines.map((l) => l.replace(/^[-–•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim()).filter(Boolean);
  if (plain.includes('•')) return plain.split('•').map((s) => s.trim()).filter(Boolean);
  if (plain.includes(';') && plain.length > 80) return plain.split(';').map((s) => s.trim()).filter(Boolean);
  return plain ? [plain] : [];
}

function highlightTitle(key: string): string {
  const map: Record<string, string> = {
    Responsibilities: 'Key responsibilities',
    Qualifications: 'Qualifications',
    Skills: 'Skills required',
    Benefits: 'Benefits',
    Requirements: 'Requirements',
    Education: 'Education',
    Experience: 'Experience',
  };
  if (map[key]) return map[key];
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function highlightSectionOrder(key: string): number {
  const lower = key.toLowerCase();
  if (/^(about|company)/i.test(key) || /company|about/i.test(lower)) return 0;
  if (/skill|competenc|tech/i.test(lower)) return 30;
  if (/responsibilit|duties|what you/i.test(lower)) return 40;
  if (/qualif|requirement|education|experience|must have/i.test(lower)) return 50;
  if (/benefit|perk|offer/i.test(lower)) return 90;
  return 60;
}

/**
 * Build ordered sections for the workspace detail panel.
 */
export function getWorkspaceJobSections(job: {
  description: string;
  requirements: string;
  jobHighlights?: JobHighlights | null;
}): JobWorkspaceSection[] {
  const out: JobWorkspaceSection[] = [];
  const plainDesc = htmlToPlain(job.description || '');
  const parsed = parseStructuredDescription(job.description || '');
  const hl = job.jobHighlights || {};

  const push = (id: string, title: string, content: { paragraphs?: string[]; bullets?: string[] }) => {
    const hasP = content.paragraphs?.some((p) => p.trim());
    const hasB = content.bullets?.some((b) => b.trim());
    if (!hasP && !hasB) return;
    out.push({
      id,
      title,
      ...(hasP ? { paragraphs: content.paragraphs!.filter((p) => p.trim()) } : {}),
      ...(hasB ? { bullets: content.bullets!.filter((b) => b.trim()) } : {}),
    });
  };

  const companyBlock = parsed.sections.get('company');
  if (companyBlock?.lines.length) {
    push('company', companyBlock.title, formatSectionLines(companyBlock.lines));
  }

  const preambleFmt = formatSectionLines(parsed.preamble);
  const overviewLines = parsed.sections.get('overview')?.lines || [];
  const overviewFmt = formatSectionLines(overviewLines);

  const overviewParagraphs: string[] = [];
  let overviewHasList = false;
  if (preambleFmt.paragraphs?.length) overviewParagraphs.push(...preambleFmt.paragraphs);
  if (preambleFmt.bullets?.length) {
    push('overview-pre', 'Role overview', { bullets: preambleFmt.bullets });
    overviewHasList = true;
  }
  if (overviewFmt.paragraphs?.length) overviewParagraphs.push(...overviewFmt.paragraphs);
  if (overviewFmt.bullets?.length) {
    push('overview-list', 'Role overview', { bullets: overviewFmt.bullets });
    overviewHasList = true;
  }

  if (overviewParagraphs.length) {
    push('overview', 'Role overview', { paragraphs: overviewParagraphs });
  } else if (plainDesc && !overviewHasList) {
    push('overview', 'Role overview', { paragraphs: [plainDesc] });
  }

  const hlSkills = hl.Skills;
  const parsedSkills = parsed.sections.get('skills');
  if (hlSkills?.length) {
    push('skills-hl', 'Skills required', { bullets: hlSkills });
  } else if (parsedSkills?.lines.length) {
    push('skills', parsedSkills.title, formatSectionLines(parsedSkills.lines));
  }

  const hlResp = hl.Responsibilities;
  const parsedResp = parsed.sections.get('responsibilities');
  if (hlResp?.length) {
    push('resp-hl', 'Key responsibilities', { bullets: hlResp });
  } else if (parsedResp?.lines.length) {
    push('resp', parsedResp.title, formatSectionLines(parsedResp.lines));
  }

  const hlQual = hl.Qualifications;
  const parsedQual = parsed.sections.get('qualifications');
  if (hlQual?.length) {
    push('qual-hl', 'Qualifications', { bullets: hlQual });
  } else if (parsedQual?.lines.length) {
    push('qual', parsedQual.title, formatSectionLines(parsedQual.lines));
  }

  const benefits = parsed.sections.get('benefits');
  if (benefits?.lines.length) push('benefits', benefits.title, formatSectionLines(benefits.lines));

  const handledHighlightKeys = new Set(['Responsibilities', 'Qualifications', 'Skills', 'skills']);
  const extraEntries = Object.entries(hl).filter(
    ([k, v]) => Array.isArray(v) && (v as string[]).length && !handledHighlightKeys.has(k)
  );
  extraEntries
    .sort(([a], [b]) => highlightSectionOrder(a) - highlightSectionOrder(b) || a.localeCompare(b))
    .forEach(([key, val]) => {
      const bullets = (val as string[]).filter(Boolean);
      if (bullets.length) push(`hl-${key}`, highlightTitle(key), { bullets });
    });

  const plainReq = htmlToPlain(job.requirements || '');
  if (plainReq.length > 40) {
    const snippet = plainReq.slice(0, 48);
    const dup = plainDesc.includes(snippet);
    if (!dup) {
      const parts = splitLooseRequirements(job.requirements);
      if (parts.length > 1) push('requirements-field', 'Additional requirements', { bullets: parts });
      else push('requirements-field', 'Additional requirements', { paragraphs: [plainReq] });
    }
  }

  return out;
}
