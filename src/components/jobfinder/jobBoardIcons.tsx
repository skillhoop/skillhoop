/** Inline SVGs aligned with reference job-board HTML (no lucide). */

/**
 * Returns a Briefcase icon as an SVG string (viewBox 24×24, 2px stroke).
 * Use for HTML injection or via {@link JobBoardBriefcaseIcon} in React.
 */
export function getBriefcaseIcon(size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
}

export function JobBoardBriefcaseIcon({ size, className }: { size: number; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center text-current [&>svg]:block ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: getBriefcaseIcon(size) }}
      aria-hidden
    />
  );
}

export function JobBoardTrackBookmarkIcon({
  size,
  className,
  tracked,
}: {
  size: number;
  className?: string;
  tracked?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={tracked ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}
