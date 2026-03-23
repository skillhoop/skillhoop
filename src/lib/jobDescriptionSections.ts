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

/**
 * Fuzzy line-start matching: headers often omit colons, vary casing, or add a dash/em dash suffix.
 * Order matters (first match wins): company before overview; qualifications vs benefits disambiguated.
 */
function matchSectionHeader(line: string): { key: string; title: string } | null {
  const t = line.trim().replace(/^#{1,6}\s+/, '').replace(/[:\s]+$/u, '').trim();
  if (t.length > 120) return null;

  const end = String.raw`(?:\s*$|[\s:–—\-]+|\s+[–—\-]\s+)`;
  const rules: { key: string; title: string; re: RegExp }[] = [
    {
      key: 'company',
      title: 'Company description',
      re: new RegExp(
        `^((?:about\\s+(?:the\\s+)?company|about\\s+us|who\\s+we\\s+are|our\\s+company|company\\s+overview|the\\s+organization))${end}`,
        'i'
      ),
    },
    {
      key: 'overview',
      title: 'Role overview',
      re: new RegExp(
        `^((?:job\\s+description|about\\s+the\\s+role|the\\s+role|role\\s+overview|position\\s+summary|position\\s+overview|overview|summary|opening))${end}`,
        'i'
      ),
    },
    {
      key: 'responsibilities',
      title: 'Key responsibilities',
      re: new RegExp(
        `^((?:(?:key\\s+)?responsibilit(?:y|ies)|what\\s+you(?:'ll|\\s+will)\\s+do|duties|day[-\\s]to[-\\s]day|in\\s+this\\s+role|your\\s+role))${end}`,
        'i'
      ),
    },
    {
      key: 'skills',
      title: 'Skills required',
      re: new RegExp(
        `^((?:skills|technical\\s+skills|required\\s+skills|key\\s+skills|competencies|technologies|tech\\s+stack))${end}`,
        'i'
      ),
    },
    {
      key: 'qualifications',
      title: 'Qualifications',
      re: new RegExp(
        `^((?:qualifications|requirements|what\\s+we(?:'re|\\s+are)\\s+looking\\s+for|must\\s+haves?|you\\s+have|minimum\\s+qualifications|education|experience\\s+required|eligibility|about\\s+you|your\\s+profile|who\\s+you\\s+are))${end}`,
        'i'
      ),
    },
    {
      key: 'benefits',
      title: 'Benefits',
      re: new RegExp(
        `^((?:benefits|what\\s+we\\s+offer|perks|compensation(?:\\s+&|\\s+and)?\\s*benefits|why\\s+join(?:\\s+us)?|reasons\\s+to\\s+join))${end}`,
        'i'
      ),
    },
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

function formatSectionLines(lines: string[]): { paragraphs?: string[]; bullets?: string[] } {
  if (!lines.length) return {};
  const expanded = expandAggressiveListLines(lines);
  const bulletish = expanded.filter((l) => /^[-–•*]\s|^\d+[.)]\s/.test(l));
  const denseTrigger = lines.some((l) => countBulletLikeMarkers(l) > 3);
  if (denseTrigger || bulletish.length >= Math.max(2, Math.ceil(expanded.length * 0.35))) {
    return { bullets: linesToBullets(expanded) };
  }
  const joined = expanded.join('\n').trim();
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
    push('company', companyBlock.title, formatSectionLines(companyBlock.lines), 'overview');
  }

  const preambleFmt = formatSectionLines(parsed.preamble);
  const overviewLines = parsed.sections.get('overview')?.lines || [];
  const overviewFmt = formatSectionLines(overviewLines);

  const overviewParagraphs: string[] = [
    ...coerceToOverviewParagraphs(preambleFmt),
    ...coerceToOverviewParagraphs(overviewFmt),
  ];

  if (overviewParagraphs.length) {
    push('overview', 'Role overview', { paragraphs: overviewParagraphs }, 'overview');
  } else if (plainDesc) {
    push('overview', 'Role overview', { paragraphs: [plainDesc] }, 'overview');
  }

  const hlSkills = hl.Skills;
  const parsedSkills = parsed.sections.get('skills');
  if (hlSkills?.length) {
    push('skills-hl', 'Skills required', { bullets: hlSkills }, 'list');
  } else if (parsedSkills?.lines.length) {
    push('skills', parsedSkills.title, formatSectionLines(parsedSkills.lines), 'list');
  }

  const hlResp = hl.Responsibilities;
  const parsedResp = parsed.sections.get('responsibilities');
  if (hlResp?.length) {
    push('resp-hl', 'Key responsibilities', { bullets: hlResp }, 'list');
  } else if (parsedResp?.lines.length) {
    push('resp', parsedResp.title, formatSectionLines(parsedResp.lines), 'list');
  }

  const hlQual = hl.Qualifications;
  const parsedQual = parsed.sections.get('qualifications');
  if (hlQual?.length) {
    push('qual-hl', 'Qualifications', { bullets: hlQual }, 'list');
  } else if (parsedQual?.lines.length) {
    push('qual', parsedQual.title, formatSectionLines(parsedQual.lines), 'list');
  }

  /** When API omits job_highlights, infer list sections from the flattened `requirements` string (still distinct from description). */
  let usedRequirementsForStructuredSection = false;
  const plainReqFull = htmlToPlain(job.requirements || '');
  if (plainReqFull.length > 25) {
    const reqSnippet = plainReqFull.slice(0, 48);
    const reqDup = plainDesc.includes(reqSnippet);
    if (!reqDup) {
      const parts = splitLooseRequirements(job.requirements);
      if (parts.length >= 2) {
        const head = plainReqFull.slice(0, 160).toLowerCase();
        const looksLikeResp =
          /\bresponsibilit|what\s+you(?:'ll|\s+will)\s+do|key\s+duties|role\s+includes|you\s+will\b/.test(head);
        const looksLikeQual =
          /\bqualification|requirements?|must\s+have|education|degree|years?\s+of\s+experience|experience\s+required\b/.test(
            head
          );
        const missingQual = !hlQual?.length && !parsedQual?.lines.length;
        const missingResp = !hlResp?.length && !parsedResp?.lines.length;
        if (missingResp && looksLikeResp && !looksLikeQual) {
          push('resp-inferred', 'Key responsibilities', { bullets: parts }, 'list');
          usedRequirementsForStructuredSection = true;
        } else if (missingQual && (looksLikeQual || !looksLikeResp)) {
          push('qual-inferred', 'Qualifications', { bullets: parts }, 'list');
          usedRequirementsForStructuredSection = true;
        }
      }
    }
  }

  const benefits = parsed.sections.get('benefits');
  if (benefits?.lines.length) push('benefits', benefits.title, formatSectionLines(benefits.lines), 'list');

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

  if (plainReqFull.length > 40 && !usedRequirementsForStructuredSection) {
    const reqSnippet = plainReqFull.slice(0, 48);
    const dup = plainDesc.includes(reqSnippet);
    if (!dup) {
      const parts = splitLooseRequirements(job.requirements);
      if (parts.length > 1) push('requirements-field', 'Additional requirements', { bullets: parts }, 'list');
      else push('requirements-field', 'Additional requirements', { paragraphs: [plainReqFull] }, 'list');
    }
  }

  return out;
}
