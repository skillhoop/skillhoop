/**
 * Resume Templates System
 * Provides different professional resume layouts and styles
 */

// --- Types ---
export interface ResumeTemplate {
  id: string;
  name: string;
  category: 'classic' | 'modern' | 'creative' | 'minimal' | 'executive' | 'photo';
  description: string;
  preview: string; // Tailwind classes for preview thumbnail
  previewGradient?: string;
  supportsPhoto: boolean;
  layout:
    | 'single-column'
    | 'two-column'
    | 'sidebar-left'
    | 'sidebar-right'
    // Additional layouts used by photo/legacy templates
    | 'sidebar'
    | 'top-centered'
    | 'compact-header'
    | 'classic-centered';
  accentPosition: 'top' | 'left' | 'right' | 'none';
  styles: TemplateStyles;
}

export interface TemplateStyles {
  container: string;
  header?: string;
  headerName: string;
  headerTitle: string;
  headerContact: string;
  photo?: string;
  sidebar?: string;
  mainContent: string;
  sectionTitle: string;
  sectionContent: string;
  skillsLayout: 'list' | 'grid' | 'tags' | 'bars';
  accentColor: string;
  fontFamily: string;
  fontSize: string;
}

// --- Template Definitions ---
export const resumeTemplates: ResumeTemplate[] = [
  // ===== CLASSIC TEMPLATES =====
  {
    id: 'classic-professional',
    name: 'Professional Classic',
    category: 'classic',
    description: 'Traditional single-column layout, perfect for corporate roles',
    preview: 'bg-white border-2 border-gray-300',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-8',
      header: 'text-center border-b-2 border-gray-300 pb-4 mb-6',
      headerName: 'text-2xl font-bold text-gray-900 uppercase tracking-wide',
      headerTitle: 'text-lg text-gray-600 mt-1',
      headerContact: 'text-sm text-gray-500 mt-2 flex justify-center gap-4 flex-wrap',
      mainContent: '',
      sectionTitle: 'text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-3 mt-6',
      sectionContent: 'text-sm text-gray-700 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#374151',
      fontFamily: 'Georgia, serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'classic-elegant',
    name: 'Elegant Traditional',
    category: 'classic',
    description: 'Refined design with subtle accents for executive positions',
    preview: 'bg-slate-50 border-l-4 border-slate-700',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-8 border-l-4 border-slate-700',
      header: 'mb-6',
      headerName: 'text-3xl font-light text-slate-800 tracking-tight',
      headerTitle: 'text-lg text-slate-600 font-light mt-1',
      headerContact: 'text-xs text-slate-500 mt-3 flex gap-4',
      mainContent: '',
      sectionTitle: 'text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 mb-3 mt-8',
      sectionContent: 'text-sm text-slate-600 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#334155',
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'classic-timeline',
    name: 'Classic Timeline',
    category: 'classic',
    description: 'Clean two-column layout with distinctive timeline design for work experience and education',
    preview: 'bg-gradient-to-r from-gray-100 via-gray-100 to-white border-2 border-gray-300',
    supportsPhoto: false,
    layout: 'sidebar-left',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-[35%] bg-gray-100 px-6 py-6',
      header: 'mb-6',
      headerName: 'text-2xl font-bold uppercase tracking-wide text-gray-900 mb-2',
      headerTitle: 'text-sm uppercase tracking-wider text-gray-700',
      headerContact: 'text-xs text-gray-700 space-y-2',
      mainContent: 'w-[65%] bg-white px-8 py-6',
      sectionTitle: 'text-xs font-bold uppercase tracking-wider text-gray-900 mb-3',
      sectionContent: 'text-xs text-gray-700 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#374151',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-formal',
    name: 'Classic Formal',
    category: 'classic',
    description: 'Traditional formal design with structured header bar and two-column layout',
    preview: 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700',
    supportsPhoto: false,
    layout: 'two-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gray-900 text-white p-7 border-b-4 border-gray-900',
      headerName: 'text-2xl font-bold uppercase tracking-wide text-white',
      headerTitle: 'text-lg text-gray-200 italic',
      headerContact: 'text-sm text-white flex flex-col gap-2',
      mainContent: 'p-10',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-gray-900 border-b-3 border-gray-900 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#1a1a1a',
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'classic-professional-bw',
    name: 'Classic Professional BW',
    category: 'classic',
    description: 'Professional black and white design with sidebar layout',
    preview: 'bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800',
    supportsPhoto: false,
    layout: 'sidebar-left',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-[30%] bg-gray-900 text-white px-8 py-10',
      header: 'mb-6',
      headerName: 'text-2xl font-bold uppercase tracking-wide text-white mb-2',
      headerTitle: 'text-sm text-gray-200 italic',
      headerContact: 'text-xs text-gray-300 space-y-2',
      mainContent: 'flex-1 bg-white px-10 py-10',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-black border-b-3 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-executive-bw',
    name: 'Classic Executive BW',
    category: 'classic',
    description: 'Executive black and white design with centered header and two-column content',
    preview: 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-black',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-white text-center p-12 border-t-6 border-b-3 border-black',
      headerName: 'text-3xl font-bold uppercase tracking-wider text-black',
      headerTitle: 'text-lg text-gray-600 uppercase border-t-2 border-b-2 border-black py-2',
      headerContact: 'text-sm text-gray-600 flex justify-center gap-5',
      mainContent: 'p-10',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-black border-b-4 border-black pb-3 mb-5',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#000000',
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-modern-bw',
    name: 'Classic Modern BW',
    category: 'classic',
    description: 'Minimalist modern two-column layout with split name header and clean typography',
    preview: 'bg-gradient-to-br from-gray-100 to-white border-2 border-gray-300',
    supportsPhoto: false,
    layout: 'two-column',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-10',
      header: 'flex justify-between mb-8 pb-5',
      headerName: 'text-2xl font-light uppercase tracking-wide text-black',
      headerTitle: 'text-sm text-gray-600',
      headerContact: 'text-xs text-gray-700 flex flex-col gap-2',
      mainContent: '',
      sectionTitle: 'text-xs font-bold uppercase tracking-widest text-black mb-5',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Arial", "Helvetica", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-traditional-bw',
    name: 'Classic Traditional BW',
    category: 'classic',
    description: 'Traditional single-column layout with mixed typography and skills grid',
    preview: 'bg-gradient-to-br from-gray-50 to-white border-2 border-gray-400',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-10',
      header: 'mb-8',
      headerName: 'text-3xl font-bold uppercase tracking-widest text-black',
      headerTitle: 'text-base uppercase tracking-wide text-black',
      headerContact: 'text-sm text-gray-700 flex gap-5',
      mainContent: '',
      sectionTitle: 'text-base font-bold uppercase tracking-widest text-black border-b border-gray-300 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'grid',
      accentColor: '#000000',
      fontFamily: '"Garamond", "Times New Roman", serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-structured-bw',
    name: 'Classic Structured BW',
    category: 'classic',
    description: 'Professional structured layout with right sidebar and main content area',
    preview: 'bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800',
    supportsPhoto: false,
    layout: 'sidebar-right',
    accentPosition: 'right',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-[30%] bg-gray-900 text-white px-8 py-10',
      header: 'mb-6 border-b-3 border-black pb-5',
      headerName: 'text-3xl font-bold uppercase tracking-wide text-black mb-2',
      headerTitle: 'text-lg text-gray-600 uppercase tracking-wide',
      headerContact: 'text-xs text-gray-300 space-y-2',
      mainContent: 'flex-1 bg-white px-10 py-10',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-black border-b-3 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-compact-bw',
    name: 'Classic Compact BW',
    category: 'classic',
    description: 'Compact space-efficient design with two-column layout and minimal spacing',
    preview: 'bg-gradient-to-br from-gray-100 to-white border-2 border-gray-400',
    supportsPhoto: false,
    layout: 'two-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-9',
      header: 'mb-6 border-b-2 border-black pb-4',
      headerName: 'text-2xl font-bold uppercase tracking-wide text-black mb-1',
      headerTitle: 'text-base text-gray-600',
      headerContact: 'text-xs text-gray-700 flex gap-3',
      mainContent: '',
      sectionTitle: 'text-sm font-bold uppercase tracking-wide text-black border-b-2 border-black pb-1 mb-3',
      sectionContent: 'text-xs text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: '9pt',
    }
  },
  {
    id: 'classic-elegant-bw',
    name: 'Classic Elegant BW',
    category: 'classic',
    description: 'Elegant design with sophisticated header bar and refined typography',
    preview: 'bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800',
    supportsPhoto: false,
    layout: 'two-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gray-900 text-white p-9 border-b-4 border-black',
      headerName: 'text-3xl font-light uppercase tracking-widest text-white mb-2',
      headerTitle: 'text-base font-light uppercase tracking-wide text-gray-200',
      headerContact: 'text-sm text-white flex flex-col gap-2 text-right',
      mainContent: 'p-10',
      sectionTitle: 'text-base font-light uppercase tracking-widest text-black border-b-2 border-gray-900 pb-2 mb-5',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#1a1a1a',
      fontFamily: '"Garamond", "Times New Roman", serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-minimal-bw',
    name: 'Classic Minimal BW',
    category: 'classic',
    description: 'Minimal clean design with centered header and generous whitespace',
    preview: 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-12',
      header: 'text-center mb-10',
      headerName: 'text-2xl font-light tracking-wide text-black mb-2',
      headerTitle: 'text-sm font-light text-gray-600 tracking-wide mb-5',
      headerContact: 'text-xs text-gray-500 flex justify-center gap-5',
      mainContent: '',
      sectionTitle: 'text-xs font-normal uppercase tracking-widest text-black mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Arial", "Helvetica", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-refined-bw',
    name: 'Classic Refined BW',
    category: 'classic',
    description: 'Refined professional design with top border header and balanced layout',
    preview: 'bg-gradient-to-br from-gray-50 to-white border-2 border-gray-500',
    supportsPhoto: false,
    layout: 'two-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-white p-10 border-t-5 border-b-2 border-black',
      headerName: 'text-3xl font-semibold uppercase tracking-wide text-black mb-2',
      headerTitle: 'text-lg text-gray-600 italic',
      headerContact: 'text-sm text-gray-700 flex flex-col gap-2 text-right',
      mainContent: 'p-9',
      sectionTitle: 'text-base font-semibold uppercase tracking-wide text-black border-b-2.5 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-corporate-bw',
    name: 'Classic Corporate BW',
    category: 'classic',
    description: 'Corporate design with full-width black header bar and structured layout',
    preview: 'bg-gradient-to-br from-black to-gray-900 border-2 border-gray-800',
    supportsPhoto: false,
    layout: 'two-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-black text-white p-8 border-b-4 border-black',
      headerName: 'text-2xl font-bold uppercase tracking-wide text-white mb-2',
      headerTitle: 'text-base text-gray-200',
      headerContact: 'text-xs text-white flex gap-4',
      mainContent: 'p-10',
      sectionTitle: 'text-base font-bold uppercase tracking-wide text-black border-b-3 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Arial", "Helvetica", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-sidebar-bw',
    name: 'Classic Sidebar BW',
    category: 'classic',
    description: 'Sidebar layout with narrow left column and wide main content area',
    preview: 'bg-gradient-to-br from-gray-100 to-white border-2 border-gray-400',
    supportsPhoto: false,
    layout: 'sidebar-left',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex flex-col',
      header: 'bg-white p-9 border-b-3 border-black',
      headerName: 'text-2xl font-bold uppercase tracking-wide text-black mb-2',
      headerTitle: 'text-base text-gray-600',
      headerContact: 'text-xs text-gray-700 flex flex-col gap-2 text-right',
      mainContent: 'flex flex-1',
      sectionTitle: 'text-base font-bold uppercase tracking-wide text-black border-b-3 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-centered-bw',
    name: 'Classic Centered BW',
    category: 'classic',
    description: 'Centered header layout with asymmetric two-column content',
    preview: 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-400',
    supportsPhoto: false,
    layout: 'two-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-white p-10 text-center border-b-4 border-black',
      headerName: 'text-2.5xl font-bold uppercase tracking-wide text-black mb-2',
      headerTitle: 'text-lg text-gray-600 uppercase tracking-wide',
      headerContact: 'text-sm text-gray-700 flex justify-center gap-5',
      mainContent: 'p-9',
      sectionTitle: 'text-base font-bold uppercase tracking-wide text-black border-b-3 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-timeline-bw',
    name: 'Classic Timeline BW',
    category: 'classic',
    description: 'Timeline layout with vertical lines and dots for experience and education',
    preview: 'bg-gradient-to-br from-gray-50 to-white border-2 border-gray-500',
    supportsPhoto: false,
    layout: 'two-column',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-white p-9 border-b-3 border-black',
      headerName: 'text-2xl font-bold uppercase tracking-wide text-black mb-2',
      headerTitle: 'text-base text-gray-600',
      headerContact: 'text-xs text-gray-700 flex flex-col gap-2 text-right',
      mainContent: 'p-9',
      sectionTitle: 'text-base font-bold uppercase tracking-wide text-black border-b-3 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'classic-header-bar-bw',
    name: 'Classic Header Bar BW',
    category: 'classic',
    description: 'Full-width black header bar with structured two-column layout',
    preview: 'bg-gradient-to-br from-black to-gray-900 border-2 border-gray-800',
    supportsPhoto: false,
    layout: 'two-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-black text-white p-6 border-b-5 border-black',
      headerName: 'text-2xl font-bold uppercase tracking-wide text-white mb-2',
      headerTitle: 'text-sm text-gray-200',
      headerContact: 'text-xs text-white flex gap-4',
      mainContent: 'p-9',
      sectionTitle: 'text-base font-bold uppercase tracking-wide text-black border-b-3 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Arial", "Helvetica", sans-serif',
      fontSize: '10pt',
    }
  },

  // ===== MODERN TEMPLATES =====
  {
    id: 'modern-tech',
    name: 'Tech Modern',
    category: 'modern',
    description: 'Clean, tech-focused design popular in Silicon Valley',
    preview: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    previewGradient: 'from-indigo-500 to-purple-600',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 -mx-8 -mt-8 mb-6',
      headerName: 'text-3xl font-bold tracking-tight',
      headerTitle: 'text-lg opacity-90 mt-1',
      headerContact: 'text-sm opacity-80 mt-3 flex gap-4 flex-wrap',
      mainContent: 'px-8',
      sectionTitle: 'text-sm font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-indigo-200 pb-1 mb-3 mt-6',
      sectionContent: 'text-sm text-gray-700',
      skillsLayout: 'tags',
      accentColor: '#4F46E5',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'modern-contemporary',
    name: 'Modern Contemporary',
    category: 'modern',
    description: 'Sleek contemporary design with vibrant teal and blue gradient accents',
    preview: 'bg-gradient-to-br from-teal-500 to-blue-600',
    previewGradient: 'from-teal-500 to-blue-600',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white p-8 -mx-8 -mt-8 mb-6',
      headerName: 'text-3xl font-bold tracking-tight',
      headerTitle: 'text-lg opacity-90 mt-1',
      headerContact: 'text-sm opacity-80 mt-3 flex gap-4 flex-wrap',
      mainContent: 'px-8',
      sectionTitle: 'text-sm font-bold uppercase tracking-wider text-teal-600 border-b-2 border-teal-200 pb-1 mb-3 mt-6',
      sectionContent: 'text-sm text-gray-700',
      skillsLayout: 'tags',
      accentColor: '#0D9488',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'modern-vibrant',
    name: 'Vibrant Modern',
    category: 'modern',
    description: 'Bold and energetic design with vibrant coral and pink gradient accents',
    preview: 'bg-gradient-to-br from-rose-500 to-orange-500',
    previewGradient: 'from-rose-500 to-orange-500',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white p-8 -mx-8 -mt-8 mb-6',
      headerName: 'text-3xl font-bold tracking-tight',
      headerTitle: 'text-lg opacity-95 mt-1 font-medium',
      headerContact: 'text-sm opacity-85 mt-3 flex gap-4 flex-wrap',
      mainContent: 'px-8',
      sectionTitle: 'text-sm font-bold uppercase tracking-wider text-rose-600 border-b-2 border-rose-200 pb-1 mb-3 mt-6',
      sectionContent: 'text-sm text-gray-700',
      skillsLayout: 'tags',
      accentColor: '#F43F5E',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'modern-minimalist',
    name: 'Clean Minimalist',
    category: 'minimal',
    description: 'Ultra-clean design with maximum white space',
    preview: 'bg-white border border-gray-200',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-10',
      header: 'mb-10',
      headerName: 'text-4xl font-extralight text-gray-900 tracking-tight',
      headerTitle: 'text-base text-gray-400 mt-2 font-light',
      headerContact: 'text-xs text-gray-400 mt-4 flex gap-6',
      mainContent: '',
      sectionTitle: 'text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400 mb-4 mt-10',
      sectionContent: 'text-sm text-gray-600 font-light leading-loose',
      skillsLayout: 'grid',
      accentColor: '#9CA3AF',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      fontSize: '10pt',
    }
  },

  // ===== TWO-COLUMN TEMPLATES =====
  {
    id: 'two-column-modern',
    name: 'Two Column Modern',
    category: 'modern',
    description: 'Efficient two-column layout for experienced professionals',
    preview: 'bg-gradient-to-r from-slate-800 via-slate-800 to-white',
    supportsPhoto: true,
    layout: 'sidebar-left',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-1/3 bg-slate-800 text-white p-6',
      header: 'mb-6',
      headerName: 'text-xl font-bold tracking-tight',
      headerTitle: 'text-sm opacity-80 mt-1',
      headerContact: 'text-xs opacity-70 mt-3 space-y-1',
      photo: 'w-24 h-24 rounded-full mx-auto mb-4 border-2 border-white/30 object-cover',
      mainContent: 'flex-1 p-6',
      sectionTitle: 'text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 mt-6',
      sectionContent: 'text-sm',
      skillsLayout: 'bars',
      accentColor: '#1E293B',
      fontFamily: '"Poppins", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'sidebar-accent',
    name: 'Accent Sidebar',
    category: 'modern',
    description: 'Bold sidebar with accent color for creative fields',
    preview: 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-white',
    supportsPhoto: true,
    layout: 'sidebar-left',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-1/3 bg-gradient-to-b from-emerald-600 to-teal-700 text-white p-6',
      header: 'mb-6',
      headerName: 'text-xl font-bold',
      headerTitle: 'text-sm opacity-90 mt-1',
      headerContact: 'text-xs opacity-80 mt-3 space-y-1',
      photo: 'w-28 h-28 rounded-lg mx-auto mb-4 border-4 border-white/20 object-cover shadow-lg',
      mainContent: 'flex-1 p-6',
      sectionTitle: 'text-xs font-bold uppercase tracking-wider text-emerald-600 border-b border-emerald-200 pb-1 mb-2 mt-6',
      sectionContent: 'text-sm text-gray-700',
      skillsLayout: 'tags',
      accentColor: '#059669',
      fontFamily: '"Montserrat", sans-serif',
      fontSize: '10pt',
    }
  },

  // ===== CREATIVE TEMPLATES =====
  {
    id: 'creative-bold',
    name: 'Bold Creative',
    category: 'creative',
    description: 'Eye-catching design for designers and creatives',
    preview: 'bg-gradient-to-br from-rose-500 to-orange-400',
    previewGradient: 'from-rose-500 to-orange-400',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-rose-500 to-orange-400 text-white p-10 -mx-8 -mt-8 mb-8 relative',
      headerName: 'text-4xl font-black tracking-tight',
      headerTitle: 'text-xl font-light mt-2 opacity-90',
      headerContact: 'text-sm mt-4 flex gap-4 opacity-80',
      photo: 'absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-white object-cover shadow-xl',
      mainContent: 'px-8',
      sectionTitle: 'text-lg font-black uppercase text-rose-500 mb-3 mt-8',
      sectionContent: 'text-sm text-gray-600',
      skillsLayout: 'tags',
      accentColor: '#F43F5E',
      fontFamily: '"Outfit", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'creative-artistic',
    name: 'Artistic Flow',
    category: 'creative',
    description: 'Flowing design with artistic elements',
    preview: 'bg-gradient-to-br from-violet-500 to-fuchsia-500',
    previewGradient: 'from-violet-500 to-fuchsia-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-gradient-to-b from-violet-50 to-white p-8',
      header: 'text-center py-8 relative',
      headerName: 'text-4xl font-light bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent',
      headerTitle: 'text-lg text-violet-400 mt-2 font-light',
      headerContact: 'text-xs text-violet-300 mt-4 flex justify-center gap-6',
      photo: 'w-32 h-32 rounded-full mx-auto mb-4 border-4 border-violet-200 object-cover shadow-lg',
      mainContent: '',
      sectionTitle: 'text-sm font-medium text-violet-600 mb-3 mt-8 flex items-center gap-2 before:content-[""] before:flex-1 before:h-px before:bg-violet-200 after:content-[""] after:flex-1 after:h-px after:bg-violet-200',
      sectionContent: 'text-sm text-gray-600 text-center',
      skillsLayout: 'tags',
      accentColor: '#8B5CF6',
      fontFamily: '"Quicksand", sans-serif',
      fontSize: '10pt',
    }
  },

  // ===== EXECUTIVE TEMPLATES =====
  {
    id: 'executive-formal',
    name: 'Executive Formal',
    category: 'executive',
    description: 'Premium design for senior leadership positions',
    preview: 'bg-slate-900 border-t-4 border-amber-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white border-t-4 border-amber-500',
      header: 'bg-slate-900 text-white p-8 -mx-8 -mt-8 mb-8',
      headerName: 'text-3xl font-semibold tracking-wide',
      headerTitle: 'text-amber-400 mt-2 text-lg',
      headerContact: 'text-sm text-slate-300 mt-4 flex gap-6',
      photo: 'float-right w-28 h-28 rounded ml-4 border-2 border-amber-500 object-cover',
      mainContent: 'px-8',
      sectionTitle: 'text-sm font-semibold uppercase tracking-wider text-slate-800 border-b-2 border-amber-500 pb-1 mb-3 mt-8',
      sectionContent: 'text-sm text-slate-700 leading-relaxed',
      skillsLayout: 'grid',
      accentColor: '#F59E0B',
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'executive-distinguished',
    name: 'Distinguished',
    category: 'executive',
    description: 'Sophisticated design for C-suite executives',
    preview: 'bg-gradient-to-b from-slate-800 to-slate-900',
    supportsPhoto: true,
    layout: 'sidebar-right',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      mainContent: 'flex-1 p-8',
      sidebar: 'w-1/4 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-6',
      header: 'border-b border-slate-200 pb-6 mb-6',
      headerName: 'text-3xl font-light text-slate-800',
      headerTitle: 'text-slate-500 mt-2',
      headerContact: 'text-xs text-slate-400 mt-3 space-y-1',
      photo: 'w-full aspect-square object-cover mb-6 grayscale',
      sectionTitle: 'text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3 mt-8',
      sectionContent: 'text-sm text-slate-600 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#475569',
      fontFamily: '"Libre Baskerville", Georgia, serif',
      fontSize: '10pt',
    }
  },

  // ===== PHOTO TEMPLATES =====
  {
    id: 'photo-professional',
    name: 'Photo Professional',
    category: 'photo',
    description: 'Professional layout with prominent photo placement',
    preview: 'bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-300',
    supportsPhoto: true,
    layout: 'sidebar-left',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-2/5 bg-gradient-to-b from-blue-50 to-slate-50 p-6 border-r border-blue-100',
      header: 'text-center mb-6',
      headerName: 'text-xl font-bold text-slate-800 mt-4',
      headerTitle: 'text-sm text-blue-600 mt-1',
      headerContact: 'text-xs text-slate-500 mt-4 space-y-2',
      photo: 'w-36 h-36 rounded-full mx-auto border-4 border-white shadow-xl object-cover',
      mainContent: 'flex-1 p-6',
      sectionTitle: 'text-sm font-bold uppercase text-blue-600 border-b border-blue-200 pb-1 mb-3 mt-6',
      sectionContent: 'text-sm text-slate-700',
      skillsLayout: 'bars',
      accentColor: '#2563EB',
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-modern',
    name: 'Photo Modern',
    category: 'photo',
    description: 'Contemporary design with circular photo accent',
    preview: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    previewGradient: 'from-cyan-500 to-blue-600',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-8 -mx-8 -mt-8 mb-8 flex items-center gap-6',
      headerName: 'text-2xl font-bold',
      headerTitle: 'text-cyan-100 mt-1',
      headerContact: 'text-xs text-cyan-100 mt-2 flex flex-wrap gap-3',
      photo: 'w-24 h-24 rounded-full border-4 border-white/30 object-cover shadow-lg flex-shrink-0',
      mainContent: 'px-8',
      sectionTitle: 'text-sm font-bold uppercase tracking-wide text-cyan-600 mb-3 mt-6',
      sectionContent: 'text-sm text-gray-700',
      skillsLayout: 'tags',
      accentColor: '#0891B2',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-modern-gray',
    name: 'Photo Modern Gray',
    category: 'photo',
    description: 'Pixel-perfect modern design with distinctive two-column layout and grayscale theme',
    preview: 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300',
    supportsPhoto: true,
    layout: 'two-column',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'relative bg-white',
      headerName: 'text-4xl font-bold uppercase tracking-tight',
      headerTitle: 'text-sm uppercase tracking-widest text-gray-600',
      headerContact: 'text-xs text-gray-700 flex flex-col items-end gap-0.5',
      photo: 'w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover',
      sidebar: 'w-[35%] bg-gray-50 px-4 py-4 border-l border-gray-200',
      mainContent: 'w-[65%] px-6 py-4',
      sectionTitle: 'text-xs font-bold uppercase tracking-widest',
      sectionContent: 'text-xs text-gray-700',
      skillsLayout: 'list',
      accentColor: '#374151',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-elegant',
    name: 'Photo Elegant',
    category: 'photo',
    description: 'Elegant sidebar layout with sophisticated typography and refined spacing',
    preview: 'bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300',
    supportsPhoto: true,
    layout: 'sidebar-left',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-[35%] bg-slate-50 p-8 border-r-2 border-slate-200',
      header: 'text-center mb-6',
      headerName: 'text-2xl font-bold text-slate-800',
      headerTitle: 'text-base text-slate-600 italic',
      headerContact: 'text-sm text-slate-600 space-y-2',
      photo: 'w-44 h-44 rounded-full mx-auto border-4 border-white shadow-lg object-cover',
      mainContent: 'flex-1 p-8',
      sectionTitle: 'text-lg font-bold uppercase tracking-wider text-slate-800 border-b-3 border-slate-700 pb-2 mb-4',
      sectionContent: 'text-sm text-slate-700 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#475569',
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'photo-contemporary',
    name: 'Photo Contemporary',
    category: 'photo',
    description: 'Modern header-based layout with dark theme and contemporary styling',
    preview: 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-slate-800 text-white p-12 flex items-center gap-8',
      headerName: 'text-3xl font-bold text-white',
      headerTitle: 'text-lg text-slate-200',
      headerContact: 'text-sm text-slate-300 flex gap-4',
      photo: 'w-36 h-36 rounded-lg border-3 border-white shadow-xl object-cover',
      mainContent: 'p-10',
      sectionTitle: 'text-lg font-bold uppercase tracking-wide text-slate-800 border-b-2 border-slate-800 pb-2 mb-4',
      sectionContent: 'text-sm text-slate-700 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#1e293b',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-minimalist',
    name: 'Photo Minimalist',
    category: 'photo',
    description: 'Clean minimalist design with centered photo and elegant typography',
    preview: 'bg-white border-2 border-gray-200',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-12',
      header: 'text-center mb-12 pb-8 border-b border-gray-200',
      headerName: 'text-3xl font-light text-gray-900 tracking-wide',
      headerTitle: 'text-base text-gray-600 tracking-wide',
      headerContact: 'text-sm text-gray-500 flex justify-center gap-4',
      photo: 'w-32 h-32 rounded-full mx-auto border-2 border-gray-200 object-cover',
      mainContent: 'flex gap-12',
      sectionTitle: 'text-xs font-semibold uppercase tracking-widest text-gray-800 mb-3',
      sectionContent: 'text-sm text-gray-700 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#2d3748',
      fontFamily: '"Helvetica Neue", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-creative',
    name: 'Photo Creative',
    category: 'photo',
    description: 'Bold creative design with gradient header and vibrant color accents',
    preview: 'bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-purple-400',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-12',
      headerName: 'text-3xl font-bold text-white',
      headerTitle: 'text-lg text-purple-100',
      headerContact: 'text-sm text-purple-100 flex gap-4',
      photo: 'w-40 h-40 rounded-xl border-4 border-white shadow-xl object-cover',
      mainContent: 'p-12',
      sectionTitle: 'text-lg font-bold uppercase tracking-wide text-purple-600 border-b-3 border-purple-600 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-700 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#667eea',
      fontFamily: '"Poppins", "Segoe UI", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-professional',
    name: 'Photo Professional',
    category: 'photo',
    description: 'Clean professional layout with sidebar photo and corporate styling',
    preview: 'bg-white border-2 border-gray-300',
    supportsPhoto: true,
    layout: 'sidebar-right',
    accentPosition: 'right',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-[30%] bg-gray-100 p-10 border-l-4 border-gray-800',
      header: 'border-b-3 border-gray-800 pb-5 mb-8',
      headerName: 'text-3xl font-bold text-gray-800',
      headerTitle: 'text-lg text-gray-600',
      headerContact: 'text-sm text-gray-500 flex gap-4',
      photo: 'w-44 h-44 rounded-full mx-auto border-4 border-gray-800 shadow-lg object-cover',
      mainContent: 'flex-1 p-10',
      sectionTitle: 'text-base font-bold uppercase tracking-wide text-gray-800 border-b-2 border-gray-800 pb-1 mb-4',
      sectionContent: 'text-sm text-gray-700 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#2c3e50',
      fontFamily: '"Calibri", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-classic',
    name: 'Photo Classic',
    category: 'photo',
    description: 'Traditional formal design with classic typography and structured layout',
    preview: 'bg-white border-2 border-black',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-10',
      header: 'flex items-start gap-8 pb-6 mb-8 border-b-2 border-black',
      headerName: 'text-3xl font-bold uppercase tracking-wide text-black',
      headerTitle: 'text-lg italic text-gray-700',
      headerContact: 'text-sm text-black flex gap-4',
      photo: 'w-32 h-32 rounded border-2 border-black object-cover',
      mainContent: 'flex gap-9',
      sectionTitle: 'text-base font-bold uppercase tracking-wide text-black border-b border-black pb-1 mb-4',
      sectionContent: 'text-sm text-black leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#000000',
      fontFamily: '"Times New Roman", "Times", serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'photo-modern-new',
    name: 'Photo Modern',
    category: 'photo',
    description: 'Sleek modern design with iOS-inspired styling and blue accent',
    preview: 'bg-white border-2 border-blue-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'p-12 flex items-center gap-10 border-b border-gray-200',
      headerName: 'text-3xl font-semibold text-gray-900',
      headerTitle: 'text-lg text-gray-500',
      headerContact: 'text-sm text-gray-700 flex gap-5',
      photo: 'w-38 h-38 rounded-2xl shadow-lg object-cover',
      mainContent: 'p-10 flex gap-12',
      sectionTitle: 'text-sm font-semibold uppercase tracking-wider text-blue-600 mb-4',
      sectionContent: 'text-sm text-gray-800 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#007aff',
      fontFamily: '"SF Pro Display", "Helvetica Neue", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-bold',
    name: 'Photo Bold',
    category: 'photo',
    description: 'Bold striking design with vibrant orange accent and strong typography',
    preview: 'bg-gradient-to-br from-orange-500 to-red-500 border-2 border-orange-400',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-orange-500 text-white p-12',
      headerName: 'text-4xl font-extrabold text-white',
      headerTitle: 'text-xl text-white',
      headerContact: 'text-sm text-white flex gap-5',
      photo: 'w-40 h-40 rounded-full border-5 border-white shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-lg font-extrabold uppercase tracking-wider text-orange-500 border-b-4 border-orange-500 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#ff6b35',
      fontFamily: '"Montserrat", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-executive',
    name: 'Photo Executive',
    category: 'photo',
    description: 'Sophisticated executive design with forest green theme and premium styling',
    preview: 'bg-gradient-to-br from-green-800 to-green-900 border-2 border-green-700',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-green-800 text-white p-12',
      headerName: 'text-3xl font-bold text-white',
      headerTitle: 'text-lg text-yellow-400 italic',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-42 h-42 rounded-lg border-5 border-white shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-green-800 border-b-3 border-green-800 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#2d5016',
      fontFamily: '"Playfair Display", "Times New Roman", serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'photo-dynamic',
    name: 'Photo Dynamic',
    category: 'photo',
    description: 'Energetic dynamic design with purple gradient and slanted accents',
    preview: 'bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-400',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-12',
      headerName: 'text-3xl font-extrabold text-white',
      headerTitle: 'text-lg text-white',
      headerContact: 'text-sm text-white flex gap-5',
      photo: 'w-40 h-40 rounded-2xl border-4 border-white shadow-xl object-cover rotate-[-3deg]',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-extrabold uppercase tracking-wider text-indigo-600 border-b-4 border-indigo-600 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#6366f1',
      fontFamily: '"Roboto", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-tech',
    name: 'Photo Tech',
    category: 'photo',
    description: 'Modern tech-focused design with geometric accents and cyan color scheme',
    preview: 'bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-slate-900 to-slate-800 text-white p-12',
      headerName: 'text-3xl font-extrabold text-white',
      headerTitle: 'text-lg text-cyan-400',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-40 h-40 rounded-lg border-3 border-cyan-500 shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-extrabold uppercase tracking-wider text-slate-900 border-b-3 border-cyan-500 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#06b6d4',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-artistic',
    name: 'Photo Artistic',
    category: 'photo',
    description: 'Creative artistic design with watercolor effects and vibrant colors',
    preview: 'bg-gradient-to-br from-yellow-200 to-amber-400 border-2 border-pink-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-yellow-200 to-amber-400 text-gray-900 p-12',
      headerName: 'text-3xl font-bold italic text-gray-900',
      headerTitle: 'text-lg text-amber-700 italic',
      headerContact: 'text-sm text-gray-900 flex gap-6',
      photo: 'w-42 h-42 rounded-full border-5 border-white shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-amber-700 border-b-4 border-pink-500 pb-2 mb-4 italic',
      sectionContent: 'text-sm text-gray-900 leading-relaxed italic',
      skillsLayout: 'tags',
      accentColor: '#ec4899',
      fontFamily: '"Crimson Text", "Georgia", serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'photo-luxury',
    name: 'Photo Luxury',
    category: 'photo',
    description: 'Premium luxury design with gold accents and elegant styling',
    preview: 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-600',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-gray-900 to-gray-800 text-white p-12',
      headerName: 'text-3xl font-bold text-white',
      headerTitle: 'text-lg text-yellow-600',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-42 h-42 rounded-full border-6 border-yellow-600 shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-gray-900 border-b-3 border-yellow-600 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#d4af37',
      fontFamily: '"Playfair Display", "Times New Roman", serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'photo-corporate',
    name: 'Photo Corporate',
    category: 'photo',
    description: 'Clean professional corporate design with blue color scheme',
    preview: 'bg-gradient-to-br from-blue-800 to-blue-600 border-2 border-blue-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-white text-gray-900 p-12',
      headerName: 'text-3xl font-bold text-blue-800',
      headerTitle: 'text-lg text-gray-600',
      headerContact: 'text-sm text-gray-600 flex gap-5',
      photo: 'w-38 h-38 rounded border-3 border-blue-800 shadow-md object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-blue-800 border-b-3 border-blue-800 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#1e40af',
      fontFamily: '"Open Sans", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-vibrant',
    name: 'Photo Vibrant',
    category: 'photo',
    description: 'Colorful vibrant design with rainbow gradient and energetic styling',
    preview: 'bg-gradient-to-br from-pink-500 via-orange-500 via-green-500 via-blue-500 to-purple-500 border-2 border-pink-400',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-pink-500 via-orange-500 via-green-500 via-blue-500 to-purple-500 text-white p-12',
      headerName: 'text-3xl font-extrabold text-white',
      headerTitle: 'text-lg text-white',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-40 h-40 rounded-xl border-5 border-white shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-extrabold uppercase tracking-wider text-pink-500 border-b-4 border-blue-500 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#ec4899',
      fontFamily: '"Poppins", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-modern-clean',
    name: 'Photo Modern Clean',
    category: 'photo',
    description: 'Ultra-clean modern design with subtle colors and minimalist aesthetic',
    preview: 'bg-white border-2 border-indigo-200',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-white text-gray-900 p-12',
      headerName: 'text-3xl font-semibold text-gray-900',
      headerTitle: 'text-lg text-gray-600',
      headerContact: 'text-sm text-gray-600 flex gap-5',
      photo: 'w-35 h-35 rounded-full border-2 border-gray-200 object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-semibold uppercase tracking-wider text-gray-900 border-b-2 border-gray-200 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-700 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#6366f1',
      fontFamily: '"Inter", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-industrial',
    name: 'Photo Industrial',
    category: 'photo',
    description: 'Industrial urban design with metallic accents and structured layout',
    preview: 'bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-gray-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-gray-800 to-gray-700 text-white p-12',
      headerName: 'text-3xl font-bold text-white',
      headerTitle: 'text-lg text-gray-300',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-39 h-39 rounded border-4 border-gray-500 shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-gray-800 border-b-3 border-gray-500 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#6b7280',
      fontFamily: '"Roboto", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-nature',
    name: 'Photo Nature',
    category: 'photo',
    description: 'Earthy natural design with green tones and organic styling',
    preview: 'bg-gradient-to-br from-green-800 to-green-700 border-2 border-green-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-green-800 to-green-700 text-white p-12',
      headerName: 'text-3xl font-bold text-white',
      headerTitle: 'text-lg text-green-200 italic',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-40 h-40 rounded-full border-5 border-green-400 shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-green-800 border-b-4 border-green-500 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#4caf50',
      fontFamily: '"Merriweather", "Georgia", serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'photo-retro',
    name: 'Photo Retro',
    category: 'photo',
    description: 'Retro vintage design with warm colors and bold typography',
    preview: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 border-2 border-yellow-400',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white p-12',
      headerName: 'text-3xl font-black uppercase text-white',
      headerTitle: 'text-lg text-yellow-300 uppercase',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-41 h-41 rounded-lg border-6 border-white shadow-xl object-cover rotate-[-2deg]',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-black uppercase tracking-wider text-red-600 border-b-5 border-yellow-500 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#ffc107',
      fontFamily: '"Bebas Neue", "Arial Black", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-ocean',
    name: 'Photo Ocean',
    category: 'photo',
    description: 'Ocean beach design with blue tones and wave effects',
    preview: 'bg-gradient-to-br from-blue-600 to-cyan-500 border-2 border-cyan-400',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-blue-700 to-cyan-500 text-white p-12',
      headerName: 'text-3xl font-bold text-white',
      headerTitle: 'text-lg text-cyan-200',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-40 h-40 rounded-full border-5 border-cyan-400 shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-blue-700 border-b-4 border-cyan-400 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#00bcd4',
      fontFamily: '"Montserrat", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-sunset',
    name: 'Photo Sunset',
    category: 'photo',
    description: 'Warm sunset design with orange and pink tones',
    preview: 'bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400 border-2 border-orange-400',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 text-white p-12',
      headerName: 'text-3xl font-bold text-white',
      headerTitle: 'text-lg text-orange-100',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-40 h-40 rounded-full border-5 border-white shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-red-500 border-b-4 border-orange-400 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#ff8e53',
      fontFamily: '"Lato", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-monochrome',
    name: 'Photo Monochrome',
    category: 'photo',
    description: 'Black and white minimalist design with elegant typography',
    preview: 'bg-gradient-to-br from-gray-900 to-gray-700 border-2 border-gray-800',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gray-900 text-white p-12',
      headerName: 'text-3xl font-light text-white uppercase tracking-wide',
      headerTitle: 'text-lg text-gray-400 uppercase tracking-wider',
      headerContact: 'text-sm text-gray-400 flex gap-6',
      photo: 'w-38 h-38 rounded-full border-4 border-white shadow-lg object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-semibold uppercase tracking-widest text-gray-900 border-b-2 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#000000',
      fontFamily: '"Helvetica Neue", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-soft',
    name: 'Photo Soft',
    category: 'photo',
    description: 'Soft pastel design with gentle colors and rounded elements',
    preview: 'bg-gradient-to-br from-pink-200 via-blue-200 to-green-200 border-2 border-blue-300',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-pink-200 via-blue-200 to-green-200 text-gray-900 p-12',
      headerName: 'text-3xl font-normal text-gray-900',
      headerTitle: 'text-lg text-gray-600',
      headerContact: 'text-sm text-gray-600 flex gap-6',
      photo: 'w-39 h-39 rounded-full border-4 border-white shadow-lg object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-semibold uppercase tracking-wide text-gray-900 border-b-3 border-blue-300 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#d1ecf1',
      fontFamily: '"Poppins", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-geometric',
    name: 'Photo Geometric',
    category: 'photo',
    description: 'Modern geometric design with angular shapes and patterns',
    preview: 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-400 border-2 border-purple-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-400 text-white p-12',
      headerName: 'text-3xl font-bold text-white',
      headerTitle: 'text-lg text-white',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-40 h-40 rounded-full border-5 border-white shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-purple-600 border-b-4 border-purple-500 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#764ba2',
      fontFamily: '"Inter", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-elegant-modern',
    name: 'Photo Elegant Modern',
    category: 'photo',
    description: 'Elegant modern design with sophisticated typography and gold accents',
    preview: 'bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-yellow-600',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-gray-800 to-gray-700 text-white p-12',
      headerName: 'text-3xl font-normal italic text-white',
      headerTitle: 'text-lg text-yellow-200 uppercase tracking-wider',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-41 h-41 rounded-full border-5 border-yellow-200 shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-normal uppercase tracking-widest text-gray-800 border-b-2 border-yellow-200 pb-2 mb-4 italic',
      sectionContent: 'text-sm text-gray-900 leading-relaxed italic',
      skillsLayout: 'tags',
      accentColor: '#e8d5b7',
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-fresh',
    name: 'Photo Fresh',
    category: 'photo',
    description: 'Fresh modern design with bright blue gradient and clean styling',
    preview: 'bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-blue-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white p-12',
      headerName: 'text-3xl font-bold text-white',
      headerTitle: 'text-lg text-white',
      headerContact: 'text-sm text-white flex gap-6',
      photo: 'w-40 h-40 rounded-full border-5 border-white shadow-xl object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-blue-500 border-b-4 border-cyan-400 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#4facfe',
      fontFamily: '"Nunito", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-business',
    name: 'Photo Business',
    category: 'photo',
    description: 'Professional business design with corporate navy blue theme',
    preview: 'bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-700',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-blue-900 text-white p-12',
      headerName: 'text-3xl font-semibold text-white',
      headerTitle: 'text-lg text-blue-200',
      headerContact: 'text-sm text-blue-200 flex gap-6',
      photo: 'w-38 h-38 rounded border-3 border-white shadow-lg object-cover',
      mainContent: 'p-12 flex gap-12',
      sectionTitle: 'text-base font-semibold uppercase tracking-wide text-blue-900 border-b-2 border-blue-700 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#1e3a5f',
      fontFamily: '"Roboto", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-professional-sidebar',
    name: 'Photo Professional Sidebar',
    category: 'photo',
    description: 'Professional sidebar layout with photo and info on left, content on right',
    preview: 'bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-700',
    supportsPhoto: true,
    layout: 'sidebar',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex',
      sidebar: 'w-70 bg-blue-900 text-white p-10',
      headerName: 'text-2xl font-semibold text-white',
      headerTitle: 'text-base text-blue-200',
      headerContact: 'text-sm text-blue-200',
      photo: 'w-45 h-45 rounded border-4 border-blue-700 shadow-lg object-cover',
      mainContent: 'flex-1 p-10 bg-white',
      sectionTitle: 'text-base font-semibold uppercase tracking-wide text-blue-900 border-b-2 border-blue-700 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#1a365d',
      fontFamily: '"Open Sans", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-professional-top',
    name: 'Photo Professional Top',
    category: 'photo',
    description: 'Professional top-centered layout with photo and info at top, content below',
    preview: 'bg-gradient-to-br from-blue-700 to-blue-600 border-2 border-blue-800',
    supportsPhoto: true,
    layout: 'top-centered',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-white text-center p-12 border-b-3 border-blue-800',
      headerName: 'text-3xl font-semibold text-blue-800',
      headerTitle: 'text-lg text-gray-600',
      headerContact: 'text-sm text-gray-600 flex justify-center gap-6',
      photo: 'w-35 h-35 rounded border-4 border-blue-800 shadow-lg object-cover mx-auto',
      mainContent: 'p-12',
      sectionTitle: 'text-base font-semibold uppercase tracking-wide text-blue-800 border-b-2 border-blue-600 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#1e40af',
      fontFamily: '"Source Sans Pro", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-professional-bw',
    name: 'Photo Professional BW',
    category: 'photo',
    description: 'Professional black and white design with sidebar-right layout',
    preview: 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-black',
    supportsPhoto: true,
    layout: 'sidebar-right',
    accentPosition: 'right',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex',
      sidebar: 'w-65 bg-gray-900 text-white p-10',
      headerName: 'text-3xl font-bold text-black',
      headerTitle: 'text-lg text-gray-600',
      headerContact: 'text-sm text-gray-600',
      photo: 'w-40 h-40 rounded border-4 border-white shadow-lg object-cover grayscale',
      mainContent: 'flex-1 p-10 bg-white',
      sectionTitle: 'text-base font-bold uppercase tracking-wide text-black border-b-2 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#000000',
      fontFamily: '"Calibri", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-professional-compact',
    name: 'Photo Professional Compact',
    category: 'photo',
    description: 'Professional compact header layout with horizontal photo and info bar',
    preview: 'bg-gradient-to-br from-blue-600 to-blue-500 border-2 border-blue-700',
    supportsPhoto: true,
    layout: 'compact-header',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-white p-8 border-b-4 border-blue-600 flex items-center gap-8',
      headerName: 'text-2xl font-bold text-gray-800',
      headerTitle: 'text-lg text-gray-600',
      headerContact: 'text-sm text-gray-500 flex gap-6',
      photo: 'w-30 h-30 rounded border-3 border-blue-600 shadow-md object-cover',
      mainContent: 'p-10',
      sectionTitle: 'text-base font-bold uppercase tracking-wide text-gray-800 border-b-2 border-blue-600 pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#2563eb',
      fontFamily: '"Segoe UI", "Arial", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-professional-classic-bw',
    name: 'Photo Professional Classic BW',
    category: 'photo',
    description: 'Professional classic black and white design with centered top layout',
    preview: 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-black',
    supportsPhoto: true,
    layout: 'classic-centered',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-white text-center p-12 border-b-3 border-black',
      headerName: 'text-3xl font-bold text-black',
      headerTitle: 'text-lg text-gray-600',
      headerContact: 'text-sm text-gray-600 flex justify-center gap-6',
      photo: 'w-33 h-33 rounded border-4 border-black shadow-lg object-cover grayscale',
      mainContent: 'p-10',
      sectionTitle: 'text-base font-bold uppercase tracking-wider text-black border-b-2 border-black pb-2 mb-4',
      sectionContent: 'text-sm text-gray-900 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#000000',
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: '10pt',
    }
  },

  // ===== MINIMAL TEMPLATES =====
  {
    id: 'minimal-clean',
    name: 'Ultra Clean',
    category: 'minimal',
    description: 'Maximum simplicity, ATS-optimized design',
    preview: 'bg-white border border-gray-100',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-8',
      header: 'border-b border-gray-100 pb-4 mb-6',
      headerName: 'text-2xl font-medium text-gray-800',
      headerTitle: 'text-gray-500 mt-1',
      headerContact: 'text-xs text-gray-400 mt-2 flex gap-4',
      mainContent: '',
      sectionTitle: 'text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2 mt-6',
      sectionContent: 'text-sm text-gray-600',
      skillsLayout: 'list',
      accentColor: '#6B7280',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'minimal-swiss',
    name: 'Swiss Design',
    category: 'minimal',
    description: 'Helvetica-inspired clean typography',
    preview: 'bg-white border-l-8 border-black',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-8 border-l-8 border-black',
      header: 'mb-8',
      headerName: 'text-5xl font-bold text-black tracking-tighter',
      headerTitle: 'text-xl text-gray-600 mt-2',
      headerContact: 'text-xs text-gray-500 mt-4 flex gap-6',
      mainContent: '',
      sectionTitle: 'text-xs font-bold uppercase tracking-widest text-black mb-4 mt-10',
      sectionContent: 'text-sm text-gray-700',
      skillsLayout: 'grid',
      accentColor: '#000000',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '10pt',
    }
  },
];

// --- Template Helper Functions ---

/**
 * Get all available templates
 */
export function getAllTemplates(): ResumeTemplate[] {
  return resumeTemplates;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: ResumeTemplate['category']): ResumeTemplate[] {
  return resumeTemplates.filter(t => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ResumeTemplate | undefined {
  return resumeTemplates.find(t => t.id === id);
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): { id: ResumeTemplate['category']; label: string }[] {
  return [
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'creative', label: 'Creative' },
    { id: 'executive', label: 'Executive' },
    { id: 'photo', label: 'Photo' },
  ];
}

/**
 * Generate CSS variables for a template's colors
 */
export function getTemplateCSSVariables(template: ResumeTemplate): Record<string, string> {
  return {
    '--resume-accent': template.styles.accentColor,
    '--resume-font': template.styles.fontFamily,
    '--resume-font-size': template.styles.fontSize,
  };
}

/**
 * Generate inline styles for the resume container
 */
export function getTemplateContainerStyles(template: ResumeTemplate): React.CSSProperties {
  return {
    fontFamily: template.styles.fontFamily,
    fontSize: template.styles.fontSize,
  };
}

/**
 * Check if a template supports two-column layout
 */
export function isTwoColumnTemplate(template: ResumeTemplate): boolean {
  return template.layout === 'sidebar-left' || template.layout === 'sidebar-right' || template.layout === 'two-column';
}

/**
 * Sample resume data for previews
 */
export const sampleResumeData = {
  name: 'Alex Johnson',
  title: 'Senior Software Engineer',
  email: 'alex.johnson@email.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexjohnson',
  summary: 'Results-driven software engineer with 8+ years of experience building scalable web applications. Passionate about clean code, system design, and mentoring junior developers.',
  skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python', 'PostgreSQL', 'Docker', 'Kubernetes'],
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      dates: '2021 - Present',
      achievements: [
        'Led development of microservices architecture serving 2M+ daily users',
        'Reduced deployment time by 70% through CI/CD pipeline optimization',
        'Mentored team of 5 junior developers',
      ]
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      dates: '2018 - 2021',
      achievements: [
        'Built core product features using React and Node.js',
        'Improved application performance by 45%',
      ]
    }
  ],
  education: {
    degree: 'B.S. Computer Science',
    school: 'University of California, Berkeley',
    year: '2018'
  }
};

/**
 * Generate preview HTML for a template
 */
export function generateTemplatePreviewHTML(template: ResumeTemplate, photoUrl?: string): string {
  const data = sampleResumeData;
  const isTwoColumn = isTwoColumnTemplate(template);
  
  const photoHtml = template.supportsPhoto && template.styles.photo
    ? `<img src="${photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'}" alt="Profile" class="${template.styles.photo}" />`
    : '';

  const headerHtml = `
    <div class="${template.styles.header}">
      ${template.layout === 'single-column' && template.supportsPhoto ? photoHtml : ''}
      <h1 class="${template.styles.headerName}">${data.name}</h1>
      <p class="${template.styles.headerTitle}">${data.title}</p>
      <div class="${template.styles.headerContact}">
        <span>${data.email}</span>
        <span>${data.phone}</span>
        <span>${data.location}</span>
      </div>
    </div>
  `;

  const skillsHtml = template.styles.skillsLayout === 'tags'
    ? `<div class="flex flex-wrap gap-2">${data.skills.map(s => `<span class="px-2 py-1 bg-gray-100 rounded text-xs">${s}</span>`).join('')}</div>`
    : template.styles.skillsLayout === 'bars'
    ? `<div class="space-y-2">${data.skills.slice(0, 5).map(s => `<div><span class="text-xs">${s}</span><div class="h-1 bg-white/30 rounded mt-1"><div class="h-full bg-white/80 rounded" style="width: ${70 + Math.random() * 30}%"></div></div></div>`).join('')}</div>`
    : template.styles.skillsLayout === 'grid'
    ? `<div class="grid grid-cols-2 gap-1">${data.skills.map(s => `<span class="text-xs">• ${s}</span>`).join('')}</div>`
    : `<ul class="space-y-1">${data.skills.map(s => `<li class="text-xs">• ${s}</li>`).join('')}</ul>`;

  const sidebarContent = isTwoColumn ? `
    <div class="${template.styles.sidebar}">
      ${photoHtml}
      ${headerHtml}
      <div class="mt-6">
        <h3 class="${template.styles.sectionTitle}" style="color: white; border-color: rgba(255,255,255,0.3);">Skills</h3>
        <div class="${template.styles.sectionContent}" style="color: rgba(255,255,255,0.9);">
          ${skillsHtml}
        </div>
      </div>
    </div>
  ` : '';

  const mainContent = `
    <div class="${template.styles.mainContent}">
      ${!isTwoColumn ? headerHtml : ''}
      
      <div>
        <h3 class="${template.styles.sectionTitle}">Professional Summary</h3>
        <p class="${template.styles.sectionContent}">${data.summary}</p>
      </div>

      ${!isTwoColumn ? `
      <div>
        <h3 class="${template.styles.sectionTitle}">Skills</h3>
        <div class="${template.styles.sectionContent}">
          ${skillsHtml}
        </div>
      </div>
      ` : ''}

      <div>
        <h3 class="${template.styles.sectionTitle}">Experience</h3>
        <div class="${template.styles.sectionContent}">
          ${data.experience.map(exp => `
            <div class="mb-4">
              <p class="font-medium">${exp.title}</p>
              <p class="text-xs opacity-70">${exp.company} | ${exp.dates}</p>
              <ul class="mt-2 space-y-1">
                ${exp.achievements.map(a => `<li>• ${a}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <h3 class="${template.styles.sectionTitle}">Education</h3>
        <div class="${template.styles.sectionContent}">
          <p class="font-medium">${data.education.degree}</p>
          <p class="text-xs opacity-70">${data.education.school} | ${data.education.year}</p>
        </div>
      </div>
    </div>
  `;

  return `
    <div class="${template.styles.container}" style="font-family: ${template.styles.fontFamily}; font-size: ${template.styles.fontSize};">
      ${template.layout === 'sidebar-right' ? mainContent + sidebarContent : sidebarContent + mainContent}
    </div>
  `;
}


