import React from 'react';

// Helper function to create icon components
const createIcon = (svgContent: string) => ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        dangerouslySetInnerHTML={{ __html: svgContent }}
    />
);

// Export individual icon components following lucide-react naming conventions
export const FileText = createIcon(`<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />`);

export const Upload = createIcon(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />`);

export const Plus = createIcon(`<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />`);

export const AlertCircle = createIcon(`<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />`);

export const CheckCircle = createIcon(`<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />`);

export const RefreshCw = createIcon(`<polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L20.49 9" /><path d="M20.49 15a9 9 0 0 1-14.85 3.36L3.51 15" />`);

export const ArrowRight = createIcon(`<line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />`);

export const Star = createIcon(`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />`);

export const Target = createIcon(`<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />`);

export const Brain = createIcon(`<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.2a1 1 0 0 0 1 1h.3a1 1 0 0 0 .9-.6 2.5 2.5 0 0 1 2.4-1.9 2.5 2.5 0 0 1 2.5 2.5v1.3a1 1 0 0 0 1 1h.1a1 1 0 0 0 1-1V10a2.5 2.5 0 0 1 2.5-2.5 2.5 2.5 0 0 1 0 5A2.5 2.5 0 0 1 20 15v.2a1 1 0 0 0 1 1h.1a1 1 0 0 0 1-1V14a2.5 2.5 0 0 1 2.5-2.5 2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1-2.5-2.5v-1.3a1 1 0 0 0-1-1h-.3a1 1 0 0 0-.9.6 2.5 2.5 0 0 1-2.4 1.9A2.5 2.5 0 0 1 12 15.5v-1.2a1 1 0 0 0-1-1h-.1a1 1 0 0 0-1 1V16a2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1 0-5A2.5 2.5 0 0 1 8 11v-.2a1 1 0 0 0-1-1h-.1a1 1 0 0 0-1 1V12a2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1 0-5A2.5 2.5 0 0 1 4 7V5.7a1 1 0 0 0-1-1h-.3a1 1 0 0 0-.9.6 2.5 2.5 0 0 1-2.4 1.9A2.5 2.5 0 0 1 0 4.5 2.5 2.5 0 0 1 2.5 2h.1A2.5 2.5 0 0 1 5 4.5v1.2a1 1 0 0 0 1 1h.3a1 1 0 0 0 .9-.6A2.5 2.5 0 0 1 9.5 4.2V2.5A2.5 2.5 0 0 1 9.5 2z" /><path d="M12 13a2.5 2.5 0 0 0-2.5 2.5v.2a1 1 0 0 1-1 1h-.1a1 1 0 0 1-1-1V16a2.5 2.5 0 0 0-5 0v.2a1 1 0 0 1-1 1h-.1a1 1 0 0 1-1-1V16a2.5 2.5 0 0 0-5 0v.2a1 1 0 0 1-1 1h-.1a1 1 0 0 1-1-1V16a2.5 2.5 0 0 0-2.5-2.5 2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 2.5-2.5v-.2a1 1 0 0 1 1-1h.1a1 1 0 0 1 1 1V18a2.5 2.5 0 0 0 5 0v-.2a1 1 0 0 1 1-1h.1a1 1 0 0 1 1 1V18a2.5 2.5 0 0 0 5 0v-.2a1 1 0 0 1 1-1h.1a1 1 0 0 1 1 1V18a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0-2.5 2.5v.2a1 1 0 0 1-1 1h-.1a1 1 0 0 1-1-1V16a2.5 2.5 0 0 0-2.5-2.5z" />`);

export const Shield = createIcon(`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />`);

export const TrendingUp = createIcon(`<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />`);

export const Clock = createIcon(`<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />`);

export const Sparkles = createIcon(`<path d="m12 3-1.9 1.9-3.2.9 1 3.1-.9 3.2 3.1 1 1.9 1.9 1.9-1.9 3.1-1-.9-3.2 1-3.1-3.2-.9z" /><path d="M5 22s1.5-2 4-2" /><path d="m19 22-4-2" /><path d="M22 5s-2-1.5-2-4" /><path d="m2 5 2-4" />`);

export const Zap = createIcon(`<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />`);

export const Download = createIcon(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />`);

export const Save = createIcon(`<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />`);

export const Eye = createIcon(`<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />`);

export const RotateCcw = createIcon(`<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />`);

export const X = createIcon(`<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />`);

export const List = createIcon(`<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>`);

export const ListOrdered = createIcon(`<line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>`);

export const Indent = createIcon(`<polyline points="21 12 15 6 21 18 15 12"/><line x1="3" x2="15" y1="6" y2="6"/><line x1="3" x2="15" y1="18" y2="18"/><line x1="3" x2="21" y1="12" y2="12"/>`);

export const Outdent = createIcon(`<polyline points="3 12 9 6 3 18 9 12"/><line x1="21" x2="9" y1="6" y2="6"/><line x1="21" x2="9" y1="18" y2="18"/><line x1="21" x2="3" y1="12" y2="12"/>`);

export const AlignCenter = createIcon(`<line x1="18" x2="6" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="18" x2="6" y1="18" y2="18"/>`);

export const AlignLeft = createIcon(`<line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/>`);

export const AlignRight = createIcon(`<line x1="21" x2="7" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="21" x2="7" y1="18" y2="18"/>`);

export const Bold = createIcon(`<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>`);

export const Italic = createIcon(`<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>`);

export const Underline = createIcon(`<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>`);

export const Link = createIcon(`<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/>`);

export const Phone = createIcon(`<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`);

export const Mail = createIcon(`<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`);

export const MapPin = createIcon(`<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`);

export const Minus = createIcon(`<line x1="5" y1="12" x2="19" y2="12"/>`);

export const Calendar = createIcon(`<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" y2="6"/><line x1="8" y1="2" y2="6"/><line x1="3" y1="10" y2="10"/>`);

