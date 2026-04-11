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

type CanonicalSectionKey =
  | 'company'
  | 'overview'
  | 'responsibilities'
  | 'requirements'
  | 'education'
  | 'skills'
  | 'benefits';

/** Prefixed bullet strings rendered as sub-headings in Job Finder (see `isJobSectionSubheadBullet`). */
export const JOB_SECTION_SUBHEAD_PREFIX = '__SUBHEAD__::';

export function isJobSectionSubheadBullet(s: string): boolean {
  return s.startsWith(JOB_SECTION_SUBHEAD_PREFIX);
}

export function jobSectionSubheadText(s: string): string {
  return s.slice(JOB_SECTION_SUBHEAD_PREFIX.length);
}

/** Standalone qualification subsection titles (rendered bold above following bullets). */
function isQualificationSubheaderLine(t: string): boolean {
  const u = t.trim().replace(/:+\s*$/u, '');
  if (u.length < 6 || u.length > 80) return false;
  return /^(basic|preferred|minimum|desired|required|essential|mandatory)\s+qualifications?$/i.test(u);
}

function htmlToPlain(text: string): string {
  if (!text?.trim()) return '';
  let s = text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Headings from HTML → own lines so the structured parser can treat them as section titles (no keyword match required).
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, _lvl: string, inner: string) => {
    const plainInner = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return plainInner ? `\n${plainInner}\n` : '\n';
  });

  // Short <b>/<strong> labels (LinkedIn/Indeed-style) → pseudo-headers; long runs stay inline.
  s = s.replace(/<(?:b|strong)[^>]*>([\s\S]*?)<\/(?:b|strong)>/gi, (_full, inner: string) => {
    const noTags = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (noTags.length >= 2 && noTags.length <= 140 && !/\.\s+[A-Z][a-z]/.test(noTags)) {
      return `\n${noTags}\n`;
    }
    return noTags ? ` ${noTags} ` : ' ';
  });

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
        `^((?:skills|technical\\s+skills|required\\s+skills|key\\s+skills|competencies|soft\\s+skills|technologies|tech\\s+stack))${end}`,
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

/** Strip decorative lines and excess blank lines before parsing. */
function cleaningPassPlain(plain: string): string {
  const lines = plain.split(/\r?\n/).map((l) => l.trim());
  const out: string[] = [];
  for (const l of lines) {
    if (!l) {
      out.push('');
      continue;
    }
    if (/^[_\-=*\s·]{3,}$/.test(l)) continue;
    out.push(l);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Portal-style short lines: bold wrapper, colon heading, or keywords (Candidate / Profile / Role / Offer). */
function isKeywordPortalHeaderLine(stripped: string): boolean {
  const words = stripped.split(/\s+/).filter(Boolean);
  if (words.length > 15) return false;
  return /\b(candidate|profile|role|offer)\b/i.test(stripped);
}

/** < 100 chars and (entirely **bold**, keyword header, or heading ending in `:`) → section title. */
function isHeuristicSectionTitle(rawTrimmed: string, stripped: string): boolean {
  if (rawTrimmed.length >= 100) return false;
  if (/^[-–•*]\s|^\d+[.)]\s/.test(rawTrimmed)) return false;
  if (/https?:\/\//i.test(rawTrimmed)) return false;
  if (/^\*\*[^*]+\*\*\s*:?\s*$/i.test(rawTrimmed)) return true;
  if (isKeywordPortalHeaderLine(stripped)) return true;
  if (stripped.endsWith(':') && stripped.length < 100) return true;
  return false;
}

function looksLikeImplicitSectionHeader(line: string): boolean {
  const t = line.trim().replace(/^#{1,6}\s+/, '').replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1').trim();
  if (t.length < 4 || t.length > 78) return false;
  if (matchSectionHeader(t)) return false;
  if (/^[-–•*]\s|^\d+[.)]\s/.test(t)) return false;
  if (/https?:\/\//i.test(t)) return false;
  if (/^\W*$/.test(t)) return false;
  if (/\.\s+[A-Z]/.test(t)) return false;
  if (t.endsWith('.') && t.length > 35) return false;

  const words = t.split(/\s+/).filter(Boolean);
  if (words.length > 12) return false;

  const lettersOnly = t.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length >= 5) {
    const upperRatio = lettersOnly.replace(/[^A-Z]/g, '').length / lettersOnly.length;
    if (upperRatio >= 0.88 && words.length <= 10 && !t.includes('.')) return true;
  }

  if (t.endsWith(':') && t.length < 100 && words.length <= 12) return true;

  if (words.length >= 2 && words.length <= 8 && t.length <= 52) {
    const small = new Set(['and', 'or', 'the', 'a', 'an', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'as']);
    let titled = 0;
    for (const w of words) {
      const wClean = w.replace(/[:;,.!?]+$/, '');
      if (!wClean) continue;
      if (small.has(wClean.toLowerCase())) {
        titled++;
        continue;
      }
      if (/^[A-Z][a-z0-9]*$/.test(wClean) || /^[A-Z]{2,}$/.test(wClean)) titled++;
    }
    if (titled >= Math.ceil(words.length * 0.75) && !/\.\s/.test(t)) return true;
  }

  return false;
}

function matchImplicitSectionHeader(
  line: string,
  implicitRegistry: Map<string, string>
): { key: string; title: string } | null {
  const rawTrim = line.trim();
  const t = rawTrim.replace(/^#{1,6}\s+/, '').replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1').trim();
  const heuristic = isHeuristicSectionTitle(rawTrim, t);
  if (!heuristic && !looksLikeImplicitSectionHeader(t)) return null;
  const norm = t.replace(/[:\s]+$/u, '').trim().toLowerCase();
  let key = implicitRegistry.get(norm);
  if (!key) {
    key = `implicit-${implicitRegistry.size}`;
    implicitRegistry.set(norm, key);
  }
  const title = t.replace(/:+\s*$/u, '').trim();
  return { key, title };
}

function parseStructuredDescription(description: string): {
  sections: Map<string, { title: string; lines: string[] }>;
  preamble: string[];
} {
  const plain = cleaningPassPlain(htmlToPlain(description));
  const rawLines = plain.split(/\r?\n/);
  const preamble: string[] = [];
  const sections = new Map<string, { title: string; lines: string[] }>();
  let currentKey: '__preamble__' | string = '__preamble__';
  const implicitRegistry = new Map<string, string>();

  for (let raw of rawLines) {
    const line = raw.trim();
    if (!line) continue;
    const hdr = matchSectionHeader(line);
    if (hdr) {
      currentKey = hdr.key;
      if (!sections.has(hdr.key)) sections.set(hdr.key, { title: hdr.title, lines: [] });
      continue;
    }
    const implicit = matchImplicitSectionHeader(line, implicitRegistry);
    if (implicit) {
      currentKey = implicit.key;
      if (!sections.has(implicit.key)) sections.set(implicit.key, { title: implicit.title, lines: [] });
      continue;
    }
    if (currentKey === '__preamble__') preamble.push(line);
    else sections.get(currentKey)!.lines.push(line);
  }
  return { sections, preamble };
}

function countBulletLikeMarkers(line: string): number {
  const symbols = (line.match(/[-–•*+]/g) ?? []).length;
  const numbered = (line.match(/\d+[.)]\s/g) ?? []).length;
  return symbols + numbered;
}

function stripListPrefix(s: string): string {
  return s
    .replace(/^[-–•*+]\s*/, '')
    .replace(/^\d+[.)]\s+/, '')
    .trim();
}

/**
 * When bullets are crammed on one line ("a • b • c" or "x - y - z"), split so each item can become its own row.
 * Only splits when the marker is not at line start (already a normal list line).
 */
function splitMidLineBulletMarkers(line: string): string[] {
  const t = line.trim();
  if (!t) return [];
  // Mid-line: • ; spaced + * ; spaced hyphen/em-dash (avoid single-word hyphens)
  const midLineDelim =
    /(?<=\S)(?:\s*•\s*|\s+\+\s+|\s+\*\s+|\s+[–-]\s+)(?=\S)/u;
  if (!midLineDelim.test(t)) return [t];
  const parts = t.split(midLineDelim).map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [t];
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
    const segments = splitMidLineBulletMarkers(line);
    for (const seg of segments) {
      out.push(...splitDenseLineIntoItems(seg));
    }
  }
  return out;
}

function linesToBullets(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (isQualificationSubheaderLine(t)) {
      out.push(`${JOB_SECTION_SUBHEAD_PREFIX}${t.replace(/:+\s*$/u, '').trim()}`);
      continue;
    }
    const m = line.match(/^[-–•*+]\s*(.+)$|^\d+[.)]\s*(.+)$/);
    if (m) out.push((m[1] || m[2]).trim());
    else out.push(stripListPrefix(line));
  }
  return out.filter(Boolean);
}

/** Qualifications / Skills: each newline that starts with a capital letter becomes its own bullet. */
function qualSkillsCapitalLineBullets(lines: string[]): string[] | null {
  const expanded = expandAggressiveListLines(lines);
  const pieces = expanded.flatMap((line) =>
    line.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)
  );
  if (!pieces.length) return null;
  const startsWithCapital = (s: string) => {
    const u = stripListPrefix(s);
    return u.length > 0 && /^[\p{Lu}]/u.test(u);
  };
  if (!pieces.some(startsWithCapital)) return null;
  const bullets: string[] = [];
  let acc = '';
  for (const piece of pieces) {
    const u = stripListPrefix(piece);
    if (isQualificationSubheaderLine(u)) {
      if (acc) bullets.push(acc);
      acc = '';
      bullets.push(`${JOB_SECTION_SUBHEAD_PREFIX}${u.replace(/:+\s*$/u, '').trim()}`);
      continue;
    }
    if (u.length && startsWithCapital(piece)) {
      if (acc) bullets.push(acc);
      acc = u;
    } else {
      acc = acc ? `${acc} ${u}`.trim() : u;
    }
  }
  if (acc) bullets.push(acc);
  return bullets.length ? bullets : null;
}

function formatSectionLines(
  lines: string[],
  opts?: { qualOrSkills?: boolean }
): { paragraphs?: string[]; bullets?: string[] } {
  if (!lines.length) return {};
  if (opts?.qualOrSkills) {
    const forced = qualSkillsCapitalLineBullets(lines);
    if (forced?.length) return { bullets: forced };
  }
  const expanded = expandAggressiveListLines(lines);
  const anyMidLineBulletSplit = lines.some((l) => splitMidLineBulletMarkers(l).length > 1);
  const bulletish = expanded.filter((l) => /^[-–•*+]\s|^\d+[.)]\s/.test(l));
  const denseTrigger = lines.some((l) => countBulletLikeMarkers(l) > 3);
  if (
    denseTrigger ||
    bulletish.length >= Math.max(2, Math.ceil(expanded.length * 0.35)) ||
    anyMidLineBulletSplit
  ) {
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
    Responsibilities: 'Responsibilities',
    Qualifications: 'Requirements',
    Skills: 'Skills',
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

function canonicalSectionTitle(key: CanonicalSectionKey): string {
  const titles: Record<CanonicalSectionKey, string> = {
    company: 'About the Company',
    overview: 'About the Role',
    responsibilities: 'Responsibilities',
    requirements: 'Requirements',
    education: 'Education',
    skills: 'Skills',
    benefits: 'Benefits',
  };
  return titles[key];
}

function canonicalSectionFormat(key: CanonicalSectionKey): 'overview' | 'list' {
  return key === 'company' || key === 'overview' ? 'overview' : 'list';
}

function canonicalKeyFromSection(section: JobWorkspaceSection): CanonicalSectionKey {
  const text = `${section.id} ${section.title}`.toLowerCase();
  if (/company|about the company|about us|organization/.test(text)) return 'company';
  if (/about the role|overview|summary|position/.test(text)) return 'overview';
  if (/responsibilit|duties|what you'll do|what you will do/.test(text)) return 'responsibilities';
  if (/education|degree|bachelor|master|phd|diploma/.test(text)) return 'education';
  if (/skills|competenc|tech stack|technologies/.test(text)) return 'skills';
  if (/benefits|perks|what we offer|compensation/.test(text)) return 'benefits';
  return 'requirements';
}

function dedupeText(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const t = item.trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

function isEducationLine(text: string): boolean {
  return /\b(education|degree|bachelor'?s?|master'?s?|phd|diploma|b\.?tech|m\.?tech|mba|bsc|msc|graduate|undergraduate)\b/i.test(
    text
  );
}

/** Preamble before any section header: detect employer intro / “about us” copy for smart company extraction. */
function preambleLooksLikeCompanyIntro(text: string, employerName?: string | null): boolean {
  const t = text.trim();
  if (!t) return false;
  const n = typeof employerName === 'string' ? employerName.trim() : '';
  if (n.length >= 2) {
    try {
      const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${escaped}\\b`, 'i').test(t)) return true;
    } catch {
      if (t.toLowerCase().includes(n.toLowerCase())) return true;
    }
  }
  if (t.length < 36) return false;
  return /\b(we are|our company|our mission|our vision|about us|who we are|founded in|since\s+\d{4}|leading (?:global |worldwide |)?provider|is a (?:leading |worldwide )?|committed to (?:our |the )?(?:mission|values)|proud to be|join our team|employees worldwide|headquartered|best workplace|award[- ]winning|(?:industry\s+)?experts?|delivering|empowering)\b/i.test(
    t
  );
}

/** First \\n\\n-delimited block of greedy text (Role overview anchor). */
function firstParagraphFromGreedy(greedyFullText: string | undefined, description: string): string {
  const src = (greedyFullText ?? description ?? '').trim();
  if (!src) return '';
  const plain = cleaningPassPlain(htmlToPlain(src));
  const firstBlock = plain.split(/\n{2,}/)[0]?.trim() ?? '';
  return firstBlock.replace(/\n/g, ' ').trim();
}

/**
 * Build ordered sections for the workspace detail panel.
 *
 * Pass the same “effective” full description the Job Finder uses (`workspaceEffectiveDescription`):
 * greedy → full → unified → primary description fields. That keeps preamble / “About the Company”
 * heuristics (`preambleLooksLikeCompanyIntro`, `matchSectionHeader`) working on the richest text.
 */
export function getWorkspaceJobSections(job: {
  description: string;
  requirements: string;
  jobHighlights?: JobHighlights | null;
  /** Full aggregated body (description + highlights + benefits); drives overview first paragraph */
  greedyFullText?: string;
  /** Merged skill tags when JSearch `Skills` highlights are empty */
  displaySkills?: string[] | null;
  /** Listing employer name — used to map preamble prose into About the Company when there is no header */
  employerName?: string | null;
}): JobWorkspaceSection[] {
  const out: JobWorkspaceSection[] = [];
  const plainDesc = cleaningPassPlain(htmlToPlain(job.description || ''));
  const parsed = parseStructuredDescription(job.description || '');
  const hl = job.jobHighlights || {};
  const firstGreedyPara = firstParagraphFromGreedy(job.greedyFullText, job.description || '');

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
  let movedPreambleToCompany = false;
  if (companyBlock?.lines.length) {
    push('company', 'About the Company', formatSectionLines(companyBlock.lines), 'overview');
  } else if (parsed.preamble.length) {
    const joinedPreamble = parsed.preamble.join(' ').trim();
    if (preambleLooksLikeCompanyIntro(joinedPreamble, job.employerName)) {
      movedPreambleToCompany = true;
      push('company', 'About the Company', formatSectionLines(parsed.preamble), 'overview');
    }
  }

  const preambleFmt = formatSectionLines(movedPreambleToCompany ? [] : parsed.preamble);
  const overviewLines = parsed.sections.get('overview')?.lines || [];
  const overviewFmt = formatSectionLines(overviewLines);

  const parsedOverviewParas = [
    ...coerceToOverviewParagraphs(preambleFmt),
    ...coerceToOverviewParagraphs(overviewFmt),
  ];

  const overviewParagraphs: string[] = [];
  if (firstGreedyPara) overviewParagraphs.push(firstGreedyPara);
  for (const p of parsedOverviewParas) {
    const pt = p.trim();
    if (!pt) continue;
    if (firstGreedyPara && pt === firstGreedyPara) continue;
    if (firstGreedyPara && firstGreedyPara.includes(pt) && pt.length < firstGreedyPara.length) continue;
    overviewParagraphs.push(pt);
  }

  if (overviewParagraphs.length) {
    push('overview', 'About the Role', { paragraphs: overviewParagraphs }, 'overview');
  } else if (plainDesc) {
    push('overview', 'About the Role', { paragraphs: [plainDesc] }, 'overview');
  }

  const hlSkills = hl.Skills;
  const parsedSkills = parsed.sections.get('skills');
  const hlResp = hl.Responsibilities;
  const parsedResp = parsed.sections.get('responsibilities');
  const hlQual = hl.Qualifications;
  const parsedQual = parsed.sections.get('qualifications');

  if (hlResp?.length) {
    push('resp-hl', 'Responsibilities', { bullets: hlResp }, 'list');
  } else if (parsedResp?.lines.length) {
    push('resp', 'Responsibilities', formatSectionLines(parsedResp.lines), 'list');
  }

  if (hlQual?.length) {
    push('qual-hl', 'Requirements', { bullets: hlQual }, 'list');
  } else if (parsedQual?.lines.length) {
    push('qual', 'Requirements', formatSectionLines(parsedQual.lines, { qualOrSkills: true }), 'list');
  }

  if (hlSkills?.length) {
    push('skills-hl', 'Skills', { bullets: hlSkills }, 'list');
  } else if (parsedSkills?.lines.length) {
    push('skills', 'Skills', formatSectionLines(parsedSkills.lines, { qualOrSkills: true }), 'list');
  } else if (job.displaySkills?.length) {
    push('skills-display', 'Skills', { bullets: [...job.displaySkills] }, 'list');
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
          push('resp-inferred', 'Responsibilities', { bullets: parts }, 'list');
          usedRequirementsForStructuredSection = true;
        } else if (missingQual && (looksLikeQual || !looksLikeResp)) {
          push('qual-inferred', 'Requirements', { bullets: parts }, 'list');
          usedRequirementsForStructuredSection = true;
        }
      }
    }
  }

  const benefits = parsed.sections.get('benefits');
  if (benefits?.lines.length) push('benefits', 'Benefits', formatSectionLines(benefits.lines), 'list');

  const implicitOrder: string[] = [];
  for (const k of parsed.sections.keys()) {
    if (k.startsWith('implicit-')) implicitOrder.push(k);
  }
  implicitOrder.sort((a, b) => {
    const na = parseInt(a.replace('implicit-', ''), 10);
    const nb = parseInt(b.replace('implicit-', ''), 10);
    return (Number.isNaN(na) ? 0 : na) - (Number.isNaN(nb) ? 0 : nb);
  });
  for (const key of implicitOrder) {
    const block = parsed.sections.get(key);
    if (block?.lines.length) push(`sec-${key}`, block.title, formatSectionLines(block.lines), 'list');
  }

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

  // Normalize to a consistent, predictable section schema across all listings.
  const byKey = new Map<CanonicalSectionKey, { paragraphs: string[]; bullets: string[] }>();
  for (const s of out) {
    const key = canonicalKeyFromSection(s);
    const cur = byKey.get(key) ?? { paragraphs: [], bullets: [] };
    if (s.paragraphs?.length) cur.paragraphs.push(...s.paragraphs);
    if (s.bullets?.length) cur.bullets.push(...s.bullets);
    byKey.set(key, cur);
  }

  // Split education from generic requirements when providers blend both in one list.
  const req = byKey.get('requirements');
  if (req?.bullets.length) {
    const edu = byKey.get('education') ?? { paragraphs: [], bullets: [] };
    const reqKeep: string[] = [];
    for (const b of req.bullets) {
      if (isEducationLine(b)) edu.bullets.push(b);
      else reqKeep.push(b);
    }
    req.bullets = reqKeep;
    byKey.set('requirements', req);
    byKey.set('education', edu);
  }

  const ordered: CanonicalSectionKey[] = [
    'company',
    'overview',
    'responsibilities',
    'requirements',
    'education',
    'skills',
    'benefits',
  ];
  const normalized: JobWorkspaceSection[] = [];

  for (const key of ordered) {
    const format = canonicalSectionFormat(key);
    const data = byKey.get(key) ?? { paragraphs: [], bullets: [] };
    const paragraphs = dedupeText(data.paragraphs);
    const bullets = dedupeText(data.bullets);
    const hasContent = paragraphs.length > 0 || bullets.length > 0;

    if (hasContent) {
      normalized.push({
        id: `std-${key}`,
        title: canonicalSectionTitle(key),
        format,
        ...(format === 'overview'
          ? { paragraphs: paragraphs.length ? paragraphs : bullets }
          : { bullets: bullets.length ? bullets : paragraphs }),
      });
      continue;
    }
  }

  // Keep only lightweight overview fallbacks; hide empty list sections.
  const hasCompany = normalized.some((s) => s.id === 'std-company');
  if (!hasCompany) {
    normalized.push({
      id: 'std-company',
      title: canonicalSectionTitle('company'),
      format: 'overview',
      paragraphs: ['Company details were not provided in this posting.'],
    });
  }
  const hasOverview = normalized.some((s) => s.id === 'std-overview');
  if (!hasOverview) {
    normalized.push({
      id: 'std-overview',
      title: canonicalSectionTitle('overview'),
      format: 'overview',
      paragraphs: [plainDesc || 'Role details were not provided in a structured format.'],
    });
  }

  normalized.sort((a, b) => {
    const ia = ordered.indexOf(canonicalKeyFromSection(a));
    const ib = ordered.indexOf(canonicalKeyFromSection(b));
    return ia - ib;
  });

  return normalized;
}
