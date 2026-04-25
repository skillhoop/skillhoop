import { type ReactNode } from 'react';
import {
  getWorkspaceJobSections,
  type JobWorkspaceSection,
  isJobSectionSubheadBullet,
  jobSectionSubheadText,
} from '../../lib/jobDescriptionSections';
import type { Job } from '../../types/jobFinderDisplay';

function safeTrim(s: unknown): string {
  if (s == null) return '';
  return typeof s === 'string' ? s.trim() : String(s).trim();
}

/**
 * Best available body for the workspace: longest-rich fields first, then fallbacks.
 */
export function workspaceEffectiveDescription(job: Job): string {
  return (
    safeTrim(job.greedy_full_text) ||
    safeTrim(job.full_description) ||
    safeTrim(job.unified_description) ||
    safeTrim(job.description) ||
    safeTrim(job.job_description) ||
    safeTrim(job.snippet) ||
    safeTrim(job.job_description_snippet) ||
    safeTrim(job.job_benefits) ||
    ''
  );
}

function shouldUseBigPortalForUnstructuredLongRead(sections: JobWorkspaceSection[], fullBody: string): boolean {
  const len = fullBody.trim().length;
  if (len < 600) return false;
  if (sections.length !== 1) return false;
  const s = sections[0];
  if (s.id !== 'overview' || s.format !== 'overview') return false;
  const paras = s.paragraphs ?? [];
  if (paras.length !== 1) return false;
  const p0 = paras[0] ?? '';
  return p0.length >= 600 || len >= 1200;
}

function buildBigPortalFallbackSections(body: string, fallbackSentence: string): JobWorkspaceSection[] {
  const raw = body.trim() || fallbackSentence.trim();
  const padDetails =
    'Additional responsibilities and requirements may be available in the full listing after you apply.';
  const padCompany = 'Learn more about the organization on their website or careers page.';
  const ensure = (s: string, pad: string) => (s.trim() ? s.trim() : pad);

  if (!raw) {
    return [
      {
        id: 'fb-company',
        title: 'About the Company',
        format: 'overview',
        paragraphs: ['Company information was not provided in this posting.'],
      },
      { id: 'fb-overview', title: 'About the Role', format: 'overview', paragraphs: [fallbackSentence] },
      {
        id: 'fb-details',
        title: 'Additional details',
        format: 'overview',
        paragraphs: ['No further details were included with this listing.'],
      },
    ];
  }

  let part1: string;
  let part2: string;
  let part3: string;
  if (raw.length <= 500) {
    const t = Math.ceil(raw.length / 3) || 1;
    part1 = raw.slice(0, t).trim();
    part2 = raw.slice(t, t * 2).trim();
    part3 = raw.slice(t * 2).trim();
  } else {
    part1 = raw.slice(0, 500).trim();
    const rest = raw.slice(500);
    const mid = Math.floor(rest.length / 2);
    part2 = rest.slice(0, mid).trim();
    part3 = rest.slice(mid).trim();
  }

  return [
    { id: 'fb-company', title: 'About the Company', format: 'overview', paragraphs: [ensure(part3, padCompany)] },
    { id: 'fb-overview', title: 'About the Role', format: 'overview', paragraphs: [part1] },
    { id: 'fb-details', title: 'Additional details', format: 'overview', paragraphs: [ensure(part2, padDetails)] },
  ];
}

function renderWorkspaceBulletList(bullets: string[]) {
  const nodes: ReactNode[] = [];
  let bucket: string[] = [];
  const flushUl = () => {
    if (bucket.length === 0) return;
    nodes.push(
      <ul
        key={`ul-${nodes.length}`}
        className="list-disc space-y-2 pl-8 marker:text-slate-400"
      >
        {bucket.map((b, j) => (
          <li key={j} className="whitespace-pre-line">
            {b}
          </li>
        ))}
      </ul>
    );
    bucket = [];
  };
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    if (isJobSectionSubheadBullet(b)) {
      flushUl();
      nodes.push(
        <p
          key={`sh-${i}`}
          className={`font-semibold text-slate-800 mb-2 block ${nodes.length > 0 ? 'mt-4' : ''}`}
        >
          {jobSectionSubheadText(b)}
        </p>
      );
    } else {
      bucket.push(b);
    }
  }
  flushUl();
  return <div className="space-y-2">{nodes}</div>;
}

function JobDetailSubsectionSkeleton({ barWidths }: { barWidths: string[] }) {
  return (
    <div className="space-y-2.5" aria-hidden>
      {barWidths.map((w, i) => (
        <div
          key={i}
          className={`h-3 bg-slate-200 animate-pulse rounded-md ${w}`}
        />
      ))}
    </div>
  );
}

function optimisticRoleOverviewBody(job: Job): string {
  const eff = workspaceEffectiveDescription(job);
  if (eff) return eff;
  return `Looking for a ${safeTrim(job.title) || 'role'} at ${safeTrim(job.company) || 'the company'} in ${safeTrim(job.location) || 'your area'}.`;
}

/** Scannable job description blocks for workspace (results) right pane */
export function WorkspaceJobDetailSections({
  job,
  isLoadingDetails,
}: {
  job: Job;
  isLoadingDetails?: boolean;
}) {
  const effectiveDescription = workspaceEffectiveDescription(job);
  const greedyFullTextForSections =
    safeTrim(job.greedy_full_text) || effectiveDescription;

  const fallbackSentence = `Looking for a ${safeTrim(job.title) || 'role'} at ${safeTrim(job.company) || 'the company'} in ${safeTrim(job.location) || 'your area'}.`;

  let sections = getWorkspaceJobSections({
    description: effectiveDescription,
    requirements: job.requirements,
    jobHighlights: job.jobHighlights,
    greedyFullText: greedyFullTextForSections,
    displaySkills: job.skills?.length ? job.skills : null,
    employerName: job.company,
  });
  if (
    sections.length === 0 ||
    shouldUseBigPortalForUnstructuredLongRead(sections, effectiveDescription)
  ) {
    sections = buildBigPortalFallbackSections(effectiveDescription, fallbackSentence);
  }

  if (isLoadingDetails) {
    const overviewText = optimisticRoleOverviewBody(job);
    return (
      <div className="relative" aria-busy="true" aria-live="polite">
        <p className="sr-only">Loading full job description</p>
        <section className="scroll-mt-2">
          <h4 className="text-[13px] font-medium text-slate-900 mb-2">About the Company</h4>
          <JobDetailSubsectionSkeleton barWidths={['w-[95%]', 'w-full', 'w-[80%]']} />
        </section>
        <section className="scroll-mt-2 border-t border-slate-200 pt-5 mt-5">
          <h4 className="text-[13px] font-medium text-slate-900 my-3.5 mb-2">About the Role</h4>
          <div className="text-[13px] text-slate-600 leading-[1.7] whitespace-pre-line jd-body">
            <p className="leading-relaxed text-slate-600 whitespace-pre-line">{overviewText}</p>
          </div>
        </section>
        <section className="scroll-mt-2 border-t border-slate-200 pt-5 mt-5">
          <h4 className="text-[13px] font-medium text-slate-900 my-3.5 mb-2">Responsibilities</h4>
          <JobDetailSubsectionSkeleton
            barWidths={['w-full', 'w-[92%]', 'w-[88%]', 'w-[72%]']}
          />
        </section>
        <section className="scroll-mt-2 border-t border-slate-200 pt-5 mt-5">
          <h4 className="text-[13px] font-medium text-slate-900 my-3.5 mb-2">Requirements</h4>
          <JobDetailSubsectionSkeleton barWidths={['w-[96%]', 'w-full', 'w-[85%]', 'w-[70%]']} />
        </section>
        <section className="scroll-mt-2 border-t border-slate-200 pt-5 mt-5">
          <h4 className="text-[13px] font-medium text-slate-900 my-3.5 mb-2">Skills</h4>
          <JobDetailSubsectionSkeleton barWidths={['w-[88%]', 'w-[75%]']} />
        </section>
      </div>
    );
  }

  return (
    <div className="relative">
      <div>
        {sections.map((s, index) => (
          <section
            key={s.id}
            className={`scroll-mt-2 ${index > 0 ? 'border-t border-slate-200 pt-5 mt-5' : ''}`}
          >
            <h4 className="text-[13px] font-medium text-slate-900 my-3.5 mb-2">{s.title}</h4>
            <div className="text-[13px] text-slate-600 leading-[1.7] whitespace-pre-line jd-body">
              {s.bullets?.length ? renderWorkspaceBulletList(s.bullets) : null}
              {(() => {
                if (!s.paragraphs?.length) return null;
                return s.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className={
                      s.format === 'overview'
                        ? 'leading-relaxed mb-4 text-slate-600 last:mb-0 whitespace-pre-line'
                        : 'mb-2 text-slate-600 last:mb-0 whitespace-pre-line'
                    }
                  >
                    {p}
                  </p>
                ));
              })()}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
