/**
 * Turn job description + JSearch highlights into scannable sections for the Job Finder workspace.
 */
import type { JobHighlights } from '../types/job';

export interface JobWorkspaceSection {
  id: string;
  title: string;
  /** Overview prose (company / role) vs forced bullet sections (skills, responsibilities, benefits, etc.) */
  format?: 'overview' | 'list';
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
    .replace(/<\/(p|div|section|article|blockquote|h[1-6])>/gi, '\n\n')
    .replace(/<\/(li|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\u2022|\u00B7/g, '•');
  return s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();
}

/** Normalize a candidate header line (markdown, colons, bullets). */
function normalizeHeaderLine(raw: string): string {
  return raw
    .trim()
    .replace(/^#{1,6}\s+/, '')
    .replace(/^\*\*?|\*\*?$/g, '')
    .replace(/^[-–•*]\s*/, '')
    .replace(/:\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchSectionHeader(line: string): { key: string; title: string } | null {
  const t = normalizeHeaderLine(line);
  if (t.length > 90) return null;
  const rules: { key: string; title: string; re: RegExp }[] = [
    {
      key: 'company',
      title: 'Company overview',
      re: /^(about (the )?company|about us|who we are|our company|company overview|the organization|what we do|our mission)$/i,
    },
    {
      key: 'overview',
      title: 'Job description',
      re: /^(job description|the job|about (this |the )?role|about the position|the role|role overview|position (summary|overview|details)|overview|summary|opening|the opportunity|role summary)$/i,
    },
    {
      key: 'responsibilities',
      title: 'Key responsibilities',
      re: /^(key )?responsibilit(y|ies)|what you('ll| will) do|roles?\s+(&|and)\s+responsibilities|duties|day[- ]to[- ]day|in this role|your role|what you('ll| will) be doing|how you('ll| will) make an impact$/i,
    },
    {
      key: 'skills',
      title: 'Skills required',
      re: /^(skills|technical skills|required skills|desired skills|key skills|core skills|competencies|technologies|tech stack|tools|nice to have|preferred skills)$/i,
    },
    {
      key: 'qualifications',
      title: 'Qualifications',
      re: /^(qualifications|requirements|what we('re| are) looking for|must have|you have|minimum qualifications|eligibility|essential requirements|basic qualifications|preferred qualifications|experience required)$/i,
    },
    {
      key: 'education',
      title: 'Education & experience',
      re: /^(education|education (&|and) experience|academic requirements|degree requirements|experience)$/i,
    },
    {
      key: 'benefits',
      title: 'Benefits',
      re: /^(benefits|what we offer|perks|why join us|why us|compensation( &| and)? benefits)$/i,
    },
  ];
  for (const r of rules) {
    if (r.re.test(t)) return { key: r.key, title: r.title };
  }
  if (t.length >= 6 && t.length <= 55 && t === t.toUpperCase() && !/\d{4}/.test(t)) {
    const u = t;
    if (/COMPANY|ABOUT US|WHO WE ARE/.test(u)) return { key: 'company', title: 'Company overview' };
    if (/JOB DESCRIPTION|THE ROLE|ABOUT THE ROLE|POSITION|OVERVIEW|SUMMARY/.test(u)) return { key: 'overview', title: 'Job description' };
    if (/RESPONSIBIL|WHAT YOU('LL| WILL)|DUTIES/.test(u)) return { key: 'responsibilities', title: 'Key responsibilities' };
    if (/SKILL|COMPETENC|TECH|TOOLS/.test(u)) return { key: 'skills', title: 'Skills required' };
    if (/QUALIFICATION|REQUIREMENT|MUST HAVE|EXPERIENCE|EDUCATION/.test(u)) return { key: 'qualifications', title: 'Qualifications' };
    if (/BENEFIT|PERK|WHY JOIN|WHAT WE OFFER/.test(u)) return { key: 'benefits', title: 'Benefits' };
  }
  return null;
}

function parseStructuredDescription(description: string): {
  sections: Map<string, { title: string; lines: string[] }>;
  preamble: string[];
} {
  let plain = htmlToPlain(description);
  plain = plain.replace(/([^\n•])•\s*/g, '$1\n• ');
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

function countBulletLikeMarkers(line: string): number {
  const symbols = (line.match(/[-–•*]/g) ?? []).length;
  const numbered = (line.match(/\d+[.)]\s/g) ?? []).length;
  return symbols + numbered;
}

function stripListPrefix(s: string): string {
  return s
    .replace(/^[-–•*]\s*/, '')
    .replace(/^\d+[.)]\s+/, '')
    .trim();
}

/** When a single line is packed with list markers, split into discrete items. */
function splitDenseLineIntoItems(line: string): string[] {
  const t = line.trim();
  if (!t) return [];
  if (countBulletLikeMarkers(line) <= 3) return [line];
  if (t.includes(';')) {
    const parts = t.split(';').map((s) => stripListPrefix(s.trim())).filter(Boolean);
    if (parts.length > 1) return parts;
  }
  const numbered = t
    .split(/\s+(?=\d+[.)]\s)/)
    .map((s) => stripListPrefix(s.trim()))
    .filter(Boolean);
  if (numbered.length > 1) return numbered;
  const byBulletSep = t
    .split(/\s+[–•]\s+|\s+\*\s+/)
    .map((s) => stripListPrefix(s.trim()))
    .filter(Boolean);
  if (byBulletSep.length > 1) return byBulletSep;
  const byDash = t
    .split(/\s+-\s+/)
    .map((s) => stripListPrefix(s.trim()))
    .filter(Boolean);
  if (byDash.length > 1) return byDash;
  return [t];
}

function expandAggressiveListLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    out.push(...splitDenseLineIntoItems(line));
  }
  return out;
}

function linesToBullets(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const m = line.match(/^[-–•*]\s*(.+)$|^\d+[.)]\s*(.+)$/);
    if (m) out.push((m[1] || m[2]).trim());
    else out.push(stripListPrefix(line));
  }
  return out.filter(Boolean);
}

/** Split long prose into readable paragraphs when the API returns a wall of text. */
function splitWallIntoParagraphs(text: string, maxChunk = 520): string[] {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= maxChunk) return t ? [t] : [];
  const sentences = t.split(/(?<=[.!?])\s+(?=[A-Z(0-9])/);
  const out: string[] = [];
  let buf = '';
  for (const s of sentences) {
    const next = buf ? `${buf} ${s}`.trim() : s.trim();
    if (next.length > maxChunk && buf) {
      out.push(buf.trim());
      buf = s.trim();
    } else {
      buf = next;
    }
  }
  if (buf) out.push(buf.trim());
  return out.filter(Boolean);
}

type SectionKeyHint = 'overview' | 'list' | 'auto';

function formatSectionLines(lines: string[], hint: SectionKeyHint = 'auto'): { paragraphs?: string[]; bullets?: string[] } {
  if (!lines.length) return {};
  const expanded = expandAggressiveListLines(lines);
  const bulletish = expanded.filter((l) => /^[-–•*]\s|^\d+[.)]\s/.test(l));
  const denseTrigger = lines.some((l) => countBulletLikeMarkers(l) > 3);
  const preferBullets =
    hint === 'list' ||
    denseTrigger ||
    bulletish.length >= Math.max(2, Math.ceil(expanded.length * 0.35));
  if (preferBullets) {
    return { bullets: linesToBullets(expanded) };
  }
  const joined = expanded.join('\n').trim();
  const paras = joined
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean);
  if (paras.length) {
    if (hint === 'overview' && paras.length === 1 && paras[0].length > 380) {
      return { paragraphs: splitWallIntoParagraphs(paras[0]) };
    }
    return { paragraphs: paras };
  }
  if (hint === 'overview' && joined.length > 380) return { paragraphs: splitWallIntoParagraphs(joined) };
  return { paragraphs: [joined] };
}

function splitLooseRequirements(text: string): string[] {
  const plain = htmlToPlain(text);
  const lines = plain.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines.map((l) => stripListPrefix(l)).filter(Boolean);
  if (plain.includes('•')) return plain.split('•').map((s) => stripListPrefix(s)).filter(Boolean);
  if (plain.includes(';')) return plain.split(';').map((s) => stripListPrefix(s)).filter(Boolean);
  return plain ? [plain] : [];
}

/** Skills / responsibilities / benefits: always emit bullet strings (semicolons, newlines, inline markers). */
function coerceToBulletList(content: { paragraphs?: string[]; bullets?: string[] }): string[] {
  const acc: string[] = [];
  if (content.bullets?.length) {
    for (const b of content.bullets) acc.push(...splitLooseRequirements(b));
  }
  if (content.paragraphs?.length) {
    for (const p of content.paragraphs) acc.push(...splitLooseRequirements(p));
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of acc) {
    const t = s.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** Company / role overview: prose only (each prior bullet becomes its own paragraph). */
function coerceToOverviewParagraphs(content: { paragraphs?: string[]; bullets?: string[] }): string[] {
  const paras: string[] = [];
  if (content.paragraphs?.length) paras.push(...content.paragraphs.map((p) => p.trim()).filter(Boolean));
  if (content.bullets?.length) paras.push(...content.bullets.map((b) => stripListPrefix(b)).filter(Boolean));
  return paras;
}

function highlightTitle(key: string): string {
  const map: Record<string, string> = {
    Responsibilities: 'Key responsibilities',
    Qualifications: 'Qualifications',
    Skills: 'Skills required',
    Benefits: 'Benefits',
    Requirements: 'Requirements',
    Education: 'Education & experience',
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

function sectionDisplayOrder(id: string): number {
  const order: Record<string, number> = {
    company: 5,
    overview: 15,
    'skills-hl': 24,
    skills: 25,
    'resp-hl': 34,
    resp: 35,
    'qual-hl': 44,
    qual: 45,
    education: 48,
    benefits: 55,
    'requirements-field': 80,
  };
  if (order[id] != null) return order[id];
  if (id.startsWith('hl-')) return 70;
  return 65;
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

  const push = (
    id: string,
    title: string,
    content: { paragraphs?: string[]; bullets?: string[] },
    format: 'overview' | 'list' = 'list'
  ) => {
    let paragraphs = content.paragraphs;
    let bullets = content.bullets;
    if (format === 'overview') {
      const paras = coerceToOverviewParagraphs({ paragraphs, bullets });
      paragraphs = paras.length ? paras : undefined;
      bullets = undefined;
    } else {
      bullets = coerceToBulletList({ paragraphs, bullets });
      paragraphs = undefined;
      if (!bullets.length) return;
    }
    const hasP = paragraphs?.some((p) => p.trim());
    const hasB = bullets?.some((b) => b.trim());
    if (!hasP && !hasB) return;
    out.push({
      id,
      title,
      format,
      ...(hasP ? { paragraphs: paragraphs!.filter((p) => p.trim()) } : {}),
      ...(hasB ? { bullets: bullets!.filter((b) => b.trim()) } : {}),
    });
  };

  const companyBlock = parsed.sections.get('company');
  if (companyBlock?.lines.length) {
    push('company', companyBlock.title, formatSectionLines(companyBlock.lines, 'overview'), 'overview');
  }

  const preambleFmt = formatSectionLines(parsed.preamble, 'overview');
  const overviewLines = parsed.sections.get('overview')?.lines || [];
  const overviewFmt = formatSectionLines(overviewLines, 'overview');

  let overviewParagraphs: string[] = [
    ...coerceToOverviewParagraphs(preambleFmt),
    ...coerceToOverviewParagraphs(overviewFmt),
  ];

  if (!overviewParagraphs.length && plainDesc) {
    overviewParagraphs = splitWallIntoParagraphs(plainDesc);
  } else if (overviewParagraphs.length === 1 && overviewParagraphs[0].length > 500) {
    overviewParagraphs = splitWallIntoParagraphs(overviewParagraphs[0]);
  }

  if (overviewParagraphs.length) {
    push('overview', 'Job description', { paragraphs: overviewParagraphs }, 'overview');
  }

  const hlSkills = hl.Skills;
  const parsedSkills = parsed.sections.get('skills');
  if (hlSkills?.length) {
    push('skills-hl', 'Skills required', { bullets: hlSkills }, 'list');
  } else if (parsedSkills?.lines.length) {
    push('skills', parsedSkills.title, formatSectionLines(parsedSkills.lines, 'list'), 'list');
  }

  const hlResp = hl.Responsibilities;
  const parsedResp = parsed.sections.get('responsibilities');
  if (hlResp?.length) {
    push('resp-hl', 'Key responsibilities', { bullets: hlResp }, 'list');
  } else if (parsedResp?.lines.length) {
    push('resp', parsedResp.title, formatSectionLines(parsedResp.lines, 'list'), 'list');
  }

  const hlQual = hl.Qualifications;
  const parsedQual = parsed.sections.get('qualifications');
  if (hlQual?.length) {
    push('qual-hl', 'Qualifications', { bullets: hlQual }, 'list');
  } else if (parsedQual?.lines.length) {
    push('qual', parsedQual.title, formatSectionLines(parsedQual.lines, 'list'), 'list');
  }

  const educationBlock = parsed.sections.get('education');
  if (educationBlock?.lines.length) {
    push('education', educationBlock.title, formatSectionLines(educationBlock.lines, 'list'), 'list');
  }

  const benefits = parsed.sections.get('benefits');
  if (benefits?.lines.length) push('benefits', benefits.title, formatSectionLines(benefits.lines, 'list'), 'list');

  const handledHighlightKeys = new Set(['Responsibilities', 'Qualifications', 'Skills', 'skills']);
  const extraEntries = Object.entries(hl).filter(
    ([k, v]) => Array.isArray(v) && (v as string[]).length && !handledHighlightKeys.has(k)
  );
  extraEntries
    .sort(([a], [b]) => highlightSectionOrder(a) - highlightSectionOrder(b) || a.localeCompare(b))
    .forEach(([key, val]) => {
      const bullets = (val as string[]).filter(Boolean);
      if (bullets.length) push(`hl-${key}`, highlightTitle(key), { bullets }, 'list');
    });

  const plainReq = htmlToPlain(job.requirements || '');
  if (plainReq.length > 40) {
    const reqSnippet = plainReq.slice(0, 48);
    const dup = plainDesc.includes(reqSnippet);
    if (!dup) {
      const parts = splitLooseRequirements(job.requirements);
      if (parts.length > 1) push('requirements-field', 'Additional requirements', { bullets: parts }, 'list');
      else push('requirements-field', 'Additional requirements', { paragraphs: splitWallIntoParagraphs(plainReq) }, 'overview');
    }
  }

  out.sort((a, b) => sectionDisplayOrder(a.id) - sectionDisplayOrder(b.id) || a.title.localeCompare(b.title));
  return out;
}
