import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Save, FileText, History, CheckCircle2, Upload, Share2, Edit, Eye } from 'lucide-react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useEditorTour } from '../components/onboarding/useEditorTour';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ResumeProvider, useResume } from '../context/ResumeContext';
import ResumeControlPanel, {
  ResumeControlPanelData,
  Section,
  FormattingValues,
  ResumeData,
} from '../components/resume/ResumeControlPanel';
import { calculateATSScore, ATSAnalysis } from '../utils/atsScorer';
import { saveResume, getCurrentResumeId, loadResume, type SavedResume } from '../lib/resumeStorage';
import { type ResumeVersion } from '../lib/resumeVersionHistory';
import { convertEditorToContext, convertContextToEditor } from '../lib/resumeDataConverter';
import type { ResumeSection as ContextResumeSection } from '../types/resume';
import SaveResumeModal from '../components/resume/SaveResumeModal';
import ResumeLibrary from '../components/resume/ResumeLibrary';
import ExportModal from '../components/resume/ExportModal';
import VersionHistoryModal from '../components/resume/VersionHistoryModal';
import ImportResumeModal from '../components/resume/ImportResumeModal';
import CollaborationModal from '../components/resume/CollaborationModal';
import PhotoModernGray from '../components/resume/templates/PhotoModernGray';
import PhotoElegant from '../components/resume/templates/PhotoElegant';
import PhotoContemporary from '../components/resume/templates/PhotoContemporary';
import PhotoMinimalist from '../components/resume/templates/PhotoMinimalist';
import PhotoCreative from '../components/resume/templates/PhotoCreative';
import PhotoProfessional from '../components/resume/templates/PhotoProfessional';
import PhotoClassic from '../components/resume/templates/PhotoClassic';
import PhotoModern from '../components/resume/templates/PhotoModern';
import PhotoBold from '../components/resume/templates/PhotoBold';
import PhotoExecutive from '../components/resume/templates/PhotoExecutive';
import PhotoDynamic from '../components/resume/templates/PhotoDynamic';
import PhotoTech from '../components/resume/templates/PhotoTech';
import PhotoArtistic from '../components/resume/templates/PhotoArtistic';
import PhotoLuxury from '../components/resume/templates/PhotoLuxury';
import PhotoCorporate from '../components/resume/templates/PhotoCorporate';
import PhotoVibrant from '../components/resume/templates/PhotoVibrant';
import PhotoModernClean from '../components/resume/templates/PhotoModernClean';
import PhotoIndustrial from '../components/resume/templates/PhotoIndustrial';
import PhotoNature from '../components/resume/templates/PhotoNature';
import PhotoRetro from '../components/resume/templates/PhotoRetro';
import PhotoOcean from '../components/resume/templates/PhotoOcean';
import PhotoSunset from '../components/resume/templates/PhotoSunset';
import PhotoMonochrome from '../components/resume/templates/PhotoMonochrome';
import PhotoSoft from '../components/resume/templates/PhotoSoft';
import PhotoGeometric from '../components/resume/templates/PhotoGeometric';
import PhotoElegantModern from '../components/resume/templates/PhotoElegantModern';
import PhotoFresh from '../components/resume/templates/PhotoFresh';
import PhotoBusiness from '../components/resume/templates/PhotoBusiness';
import PhotoProfessionalSidebar from '../components/resume/templates/PhotoProfessionalSidebar';
import PhotoProfessionalTop from '../components/resume/templates/PhotoProfessionalTop';
import PhotoProfessionalBW from '../components/resume/templates/PhotoProfessionalBW';
import PhotoProfessionalCompact from '../components/resume/templates/PhotoProfessionalCompact';
import PhotoProfessionalClassicBW from '../components/resume/templates/PhotoProfessionalClassicBW';
import ClassicFormal from '../components/resume/templates/ClassicFormal';
import ClassicProfessionalBW from '../components/resume/templates/ClassicProfessionalBW';
import ClassicExecutiveBW from '../components/resume/templates/ClassicExecutiveBW';
import ClassicModernBW from '../components/resume/templates/ClassicModernBW';
import ClassicTraditionalBW from '../components/resume/templates/ClassicTraditionalBW';
import ClassicStructuredBW from '../components/resume/templates/ClassicStructuredBW';
import ClassicCompactBW from '../components/resume/templates/ClassicCompactBW';
import ClassicElegantBW from '../components/resume/templates/ClassicElegantBW';
import ClassicMinimalBW from '../components/resume/templates/ClassicMinimalBW';
import ClassicRefinedBW from '../components/resume/templates/ClassicRefinedBW';
import ClassicCorporateBW from '../components/resume/templates/ClassicCorporateBW';
import ClassicSidebarBW from '../components/resume/templates/ClassicSidebarBW';
import ClassicCenteredBW from '../components/resume/templates/ClassicCenteredBW';
import ClassicTimelineBW from '../components/resume/templates/ClassicTimelineBW';
import ClassicHeaderBarBW from '../components/resume/templates/ClassicHeaderBarBW';

// Storage key for localStorage
const STORAGE_KEY = 'career-clarified-resume-data';

// Default resume data structure
const DEFAULT_RESUME_DATA = {
  personalInfo: {
    fullName: "Your Name",
    jobTitle: "Product Designer",
    email: "hello@example.com",
    phone: "+1 234 567 890",
    location: "San Francisco, CA"
  },
  summary: "Passionate designer with 5+ years of experience...",
  experience: [
    {
      id: "1",
      jobTitle: "Senior Software Engineer",
      company: "Tech Company Inc.",
      location: "San Francisco, CA",
      startDate: "2021",
      endDate: "Present",
      description: "Led development of a microservices architecture serving 1M+ daily active users\nReduced page load time by 40% through optimization and caching strategies\nMentored junior developers and established coding best practices"
    }
  ],
  education: [
    {
      id: "1",
      school: "University of Technology",
      degree: "Bachelor of Science",
      location: "San Francisco, CA",
      startDate: "2015",
      endDate: "2019"
    }
  ],
  skills: ["JavaScript", "React", "Node.js", "Product Management"],
  // Advanced sections (start empty; user can add items from the Sections tab)
  projects: [],
  certifications: [],
  languages: [],
  volunteer: [],
  customSections: [
    // Pre-wire advanced sections so they behave like first-class sections
    { id: 'achievements', title: 'Achievements & Awards', items: [] },
    { id: 'publications', title: 'Publications', items: [] },
    { id: 'presentations', title: 'Presentations & Speaking', items: [] },
    { id: 'courses', title: 'Courses & Training', items: [] },
    { id: 'techStack', title: 'Technical Stack & Tools', items: [] },
    { id: 'portfolio', title: 'Portfolio / Featured Work', items: [] },
    { id: 'openSource', title: 'Open Source Contributions', items: [] },
    { id: 'leadership', title: 'Leadership & Activities', items: [] },
    { id: 'interests', title: 'Interests & Hobbies', items: [] },
    { id: 'patents', title: 'Patents', items: [] },
    { id: 'research', title: 'Research Experience', items: [] },
    { id: 'teaching', title: 'Teaching & Mentoring', items: [] },
    { id: 'references', title: 'References & Testimonials', items: [] },
  ]
};

// Helper function to map template ID to template string
// Supports both legacy numeric IDs and newer string-based IDs
const getTemplateString = (
  templateId: number | string | null
): 'classic'
  | 'modern'
  | 'modern-contemporary'
  | 'creative-classic'
  | 'executive-photo'
  | 'portrait-photo'
  | 'minimalist'
  | 'creative'
  | 'classic-elegant'
  | 'classic-traditional'
  | 'classic-column'
  | 'classic-boxed'
  | 'classic-formal'
  | 'photo-modern-gray' => {
  // Legacy numeric mappings (kept for backwards compatibility)
  if (templateId === 2) return 'modern'; // Tech Modern
  if (templateId === 1) return 'classic'; // Professional Classic
  if (templateId === 3) return 'executive-photo'; // Executive Photo
  if (templateId === 6) return 'portrait-photo'; // Portrait Photo

  // Newer string-based template IDs from the Templates tab
  if (templateId === 'classic') return 'classic'; // Professional Classic (string id)
  if (templateId === 'classic-elegant') return 'classic-elegant';
  if (templateId === 'classic-traditional') return 'classic-traditional';
  if (templateId === 'classic-column') return 'classic-column';
  if (templateId === 'classic-boxed') return 'classic-boxed';
  if (templateId === 'classic-formal') return 'classic-formal';
  if (templateId === 'classic-professional-bw') return 'classic-professional-bw';
  if (templateId === 'classic-executive-bw') return 'classic-executive-bw';
  if (templateId === 'classic-modern-bw') return 'classic-modern-bw';
  if (templateId === 'classic-traditional-bw') return 'classic-traditional-bw';
  if (templateId === 'classic-structured-bw') return 'classic-structured-bw';
  if (templateId === 'classic-compact-bw') return 'classic-compact-bw';
  if (templateId === 'classic-elegant-bw') return 'classic-elegant-bw';
  if (templateId === 'classic-minimal-bw') return 'classic-minimal-bw';
  if (templateId === 'classic-refined-bw') return 'classic-refined-bw';
  if (templateId === 'classic-corporate-bw') return 'classic-corporate-bw';
  if (templateId === 'classic-sidebar-bw') return 'classic-sidebar-bw';
  if (templateId === 'classic-centered-bw') return 'classic-centered-bw';
  if (templateId === 'classic-timeline-bw') return 'classic-timeline-bw';
  if (templateId === 'classic-header-bar-bw') return 'classic-header-bar-bw';
  if (templateId === 'modern') return 'modern';
  if (templateId === 'minimalist') return 'minimalist';
  if (templateId === 'creative') return 'creative';

  // Creative Classic: same data structure as classic, but different visual layout
  if (templateId === 4 || templateId === 'creative-classic') return 'creative-classic';

  // Executive Photo: photo-forward executive layout
  if (templateId === 'executive-photo') return 'executive-photo';

  // Portrait Photo: modern portrait-focused photo layout
  if (templateId === 'portrait-photo') return 'portrait-photo';

  // Modern Contemporary template
  if (templateId === 'modern-contemporary') return 'modern-contemporary';

  // Photo Modern Gray template
  if (templateId === 'photo-modern-gray') return 'photo-modern-gray';
  if (templateId === 'photo-elegant') return 'photo-elegant';
  if (templateId === 'photo-contemporary') return 'photo-contemporary';
  if (templateId === 'photo-minimalist') return 'photo-minimalist';
  if (templateId === 'photo-creative') return 'photo-creative';
  if (templateId === 'photo-professional') return 'photo-professional';
  if (templateId === 'photo-classic') return 'photo-classic';
  if (templateId === 'photo-modern-new') return 'photo-modern-new';
  if (templateId === 'photo-bold') return 'photo-bold';
  if (templateId === 'photo-executive') return 'photo-executive';
  if (templateId === 'photo-dynamic') return 'photo-dynamic';
  if (templateId === 'photo-tech') return 'photo-tech';
  if (templateId === 'photo-artistic') return 'photo-artistic';
  if (templateId === 'photo-luxury') return 'photo-luxury';
  if (templateId === 'photo-corporate') return 'photo-corporate';
  if (templateId === 'photo-vibrant') return 'photo-vibrant';
  if (templateId === 'photo-modern-clean') return 'photo-modern-clean';
  if (templateId === 'photo-industrial') return 'photo-industrial';
  if (templateId === 'photo-nature') return 'photo-nature';
  if (templateId === 'photo-retro') return 'photo-retro';
  if (templateId === 'photo-ocean') return 'photo-ocean';
  if (templateId === 'photo-sunset') return 'photo-sunset';
  if (templateId === 'photo-monochrome') return 'photo-monochrome';
  if (templateId === 'photo-soft') return 'photo-soft';
  if (templateId === 'photo-geometric') return 'photo-geometric';
  if (templateId === 'photo-elegant-modern') return 'photo-elegant-modern';
  if (templateId === 'photo-fresh') return 'photo-fresh';
  if (templateId === 'photo-business') return 'photo-business';
  if (templateId === 'photo-professional-sidebar') return 'photo-professional-sidebar';
  if (templateId === 'photo-professional-top') return 'photo-professional-top';
  if (templateId === 'photo-professional-bw') return 'photo-professional-bw';
  if (templateId === 'photo-professional-compact') return 'photo-professional-compact';
  if (templateId === 'photo-professional-classic-bw') return 'photo-professional-classic-bw';

  // Fallback to classic for any other IDs
  return 'classic';
};

// ResumePreviewSection Component
interface ResumePreviewSectionProps {
  resumeData: ResumeData;
  templateId:
    | 'classic'
    | 'classic-elegant'
    | 'classic-traditional'
    | 'classic-column'
    | 'classic-boxed'
    | 'classic-formal'
    | 'classic-professional-bw'
    | 'classic-executive-bw'
    | 'classic-modern-bw'
    | 'classic-traditional-bw'
    | 'classic-structured-bw'
    | 'classic-compact-bw'
    | 'classic-elegant-bw'
    | 'classic-minimal-bw'
    | 'classic-refined-bw'
    | 'classic-corporate-bw'
    | 'classic-sidebar-bw'
    | 'classic-centered-bw'
    | 'classic-timeline-bw'
    | 'classic-header-bar-bw'
    | 'modern'
    | 'creative-classic'
    | 'executive-photo'
    | 'portrait-photo'
    | 'minimalist'
    | 'creative'
    | 'photo-modern-gray'
    | 'photo-elegant'
    | 'photo-contemporary'
    | 'photo-minimalist'
    | 'photo-creative'
    | 'photo-professional'
    | 'photo-classic'
    | 'photo-modern-new'
    | 'photo-bold'
    | 'photo-executive'
    | 'photo-dynamic'
    | 'photo-tech'
    | 'photo-artistic'
    | 'photo-luxury'
    | 'photo-corporate'
    | 'photo-vibrant'
    | 'photo-modern-clean'
    | 'photo-industrial'
    | 'photo-nature'
    | 'photo-retro'
    | 'photo-ocean'
    | 'photo-sunset'
    | 'photo-monochrome'
    | 'photo-soft'
    | 'photo-geometric'
    | 'photo-elegant-modern'
    | 'photo-fresh'
    | 'photo-business'
    | 'photo-professional-sidebar'
    | 'photo-professional-top'
    | 'photo-professional-bw'
    | 'photo-professional-compact'
    | 'photo-professional-classic-bw';
  sections: Section[];
  formatting: FormattingValues;
  lineHeight: number;
}

function ResumePreviewSection({ resumeData, templateId, sections, formatting, lineHeight }: ResumePreviewSectionProps) {
  // Elegant Classic Layout - refined classic with subtle left accent
  if (templateId === 'classic-elegant') {
    return (
      <div className="min-h-[297mm] flex flex-col md:flex-row gap-6">
        {/* Narrow left column for contact + skills */}
        <aside className="md:w-1/3 border-r border-gray-200 pr-6 mr-6">
          {sections.find((s) => s.id === 'heading')?.isVisible && (
            <div className="mb-6">
              <h1
                className="text-3xl font-light tracking-tight text-gray-900"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {resumeData.personalInfo.fullName}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {resumeData.personalInfo.jobTitle}
              </p>
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>{resumeData.personalInfo.email}</p>
                <p>{resumeData.personalInfo.phone}</p>
                <p>{resumeData.personalInfo.location}</p>
              </div>
            </div>
          )}

          {sections.find((s) => s.id === 'skills')?.isVisible && (
            <div className="mt-4">
              <h2 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-gray-500 mb-2">
                Skills
              </h2>
              <ul className="space-y-1 text-xs text-gray-800">
                {resumeData.skills.map((skill, idx) => (
                  <li key={idx}>• {skill}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Main content column */}
        <main className="flex-1 space-y-6">
          {sections.find((s) => s.id === 'profile')?.isVisible && (
            <section>
              <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-2">
                Profile
              </h2>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {resumeData.summary}
              </p>
            </section>
          )}

          {sections.find((s) => s.id === 'experience')?.isVisible && (
            <section>
              <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-3">
                Experience
              </h2>
              <div className="space-y-4">
                {resumeData.experience.map((exp) => (
                  <article
                    key={exp.id}
                    className="break-inside-avoid"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {exp.jobTitle || 'Job Title'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {exp.company && exp.location
                            ? `${exp.company} • ${exp.location}`
                            : exp.company || ''}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {exp.startDate && exp.endDate
                          ? `${exp.startDate} - ${exp.endDate}`
                          : exp.startDate || ''}
                      </p>
                    </div>
                    {exp.description && (
                      <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                        {exp.description.split('\n').map((line, idx) => (
                          <p key={idx} className="mb-1">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {sections.find((s) => s.id === 'education')?.isVisible && (
            <section>
              <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-3">
                Education
              </h2>
              <div className="space-y-3 text-sm text-gray-800">
                {resumeData.education.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-semibold">
                      {edu.degree || 'Degree'}
                    </p>
                    {edu.school && (
                      <p className="text-xs text-gray-500">{edu.school}</p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-500">
                      {edu.startDate && edu.endDate
                        ? `${edu.startDate} - ${edu.endDate}`
                        : edu.startDate || ''}
                    </p>
                    {edu.location && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {edu.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {sections.find((s) => s.id === 'projects')?.isVisible &&
            resumeData.projects &&
            resumeData.projects.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-3">
                  Projects
                </h2>
                <div className="space-y-3 text-sm text-gray-800">
                  {resumeData.projects.map((proj) => (
                    <div key={proj.id}>
                      <p className="font-semibold">
                        {proj.url ? (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 underline underline-offset-2"
                          >
                            {proj.name || proj.title || 'Project Name'}
                          </a>
                        ) : (
                          proj.name || proj.title || 'Project Name'
                        )}
                      </p>
                      {proj.description && (
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
        </main>
      </div>
    );
  }

  // Traditional Classic Layout - very formal, conservative, corporate design
  if (templateId === 'classic-traditional') {
    return (
      <div className="min-h-[297mm] space-y-6" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        {/* Formal Header with double border */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <header className="border-t-2 border-b-2 border-gray-800 py-4 mb-6">
            <div className="text-center">
              <h1
                className="text-4xl font-bold text-gray-900 uppercase tracking-wide mb-2"
                style={{ letterSpacing: '0.1em' }}
              >
                {resumeData.personalInfo.fullName}
              </h1>
              <div className="border-t border-b border-gray-400 py-2 my-2">
                <p className="text-lg text-gray-700 font-semibold">
                  {resumeData.personalInfo.jobTitle}
                </p>
              </div>
              <div className="flex justify-center gap-6 text-sm text-gray-600 mt-3">
                <span>{resumeData.personalInfo.email}</span>
                <span>|</span>
                <span>{resumeData.personalInfo.phone}</span>
                <span>|</span>
                <span>{resumeData.personalInfo.location}</span>
              </div>
            </div>
          </header>
        )}

        {/* Professional Summary */}
        {sections.find((s) => s.id === 'profile')?.isVisible && (
          <section className="mb-6">
            <h2
              className="text-base font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-800 pb-1 mb-3"
              style={{ letterSpacing: '0.15em' }}
            >
              Professional Summary
            </h2>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {resumeData.summary}
            </p>
          </section>
        )}

        {/* Experience Section */}
        {sections.find((s) => s.id === 'experience')?.isVisible && (
          <section className="mb-6">
            <h2
              className="text-base font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-800 pb-1 mb-4"
              style={{ letterSpacing: '0.15em' }}
            >
              Professional Experience
            </h2>
            <div className="space-y-5">
              {resumeData.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="break-inside-avoid"
                  style={{ pageBreakInside: 'avoid' }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {exp.jobTitle || 'Job Title'}
                      </h3>
                      <p className="text-xs text-gray-600 italic mt-0.5">
                        {exp.company && exp.location
                          ? `${exp.company}, ${exp.location}`
                          : exp.company || ''}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 font-semibold whitespace-nowrap">
                      {exp.startDate && exp.endDate
                        ? `${exp.startDate} - ${exp.endDate}`
                        : exp.startDate || ''}
                    </p>
                  </div>
                  {exp.description && (
                    <div className="mt-2 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-gray-300">
                      {exp.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-1">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {sections.find((s) => s.id === 'education')?.isVisible && (
          <section className="mb-6">
            <h2
              className="text-base font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-800 pb-1 mb-4"
              style={{ letterSpacing: '0.15em' }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {edu.degree || 'Degree'}
                      </p>
                      {edu.school && (
                        <p className="text-xs text-gray-600 italic mt-0.5">
                          {edu.school}
                        </p>
                      )}
                      {edu.location && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {edu.location}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-semibold whitespace-nowrap">
                      {edu.startDate && edu.endDate
                        ? `${edu.startDate} - ${edu.endDate}`
                        : edu.startDate || ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {sections.find((s) => s.id === 'skills')?.isVisible && (
          <section className="mb-6">
            <h2
              className="text-base font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-800 pb-1 mb-4"
              style={{ letterSpacing: '0.15em' }}
            >
              Core Competencies
            </h2>
            <div className="grid grid-cols-3 gap-x-8 gap-y-2">
              {resumeData.skills.map((skill, index) => (
                <div key={index} className="text-xs text-gray-700">
                  • {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {sections.find((s) => s.id === 'certifications')?.isVisible &&
          resumeData.certifications &&
          resumeData.certifications.length > 0 && (
            <section className="mb-6">
              <h2
                className="text-base font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-800 pb-1 mb-4"
                style={{ letterSpacing: '0.15em' }}
              >
                Certifications
              </h2>
              <div className="space-y-3">
                {resumeData.certifications.map((cert) => (
                  <div key={cert.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {cert.name || 'Certification Name'}
                        </p>
                        {cert.issuer && (
                          <p className="text-xs text-gray-600 italic mt-0.5">
                            {cert.issuer}
                          </p>
                        )}
                        {cert.credentialId && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Credential ID: {cert.credentialId}
                          </p>
                        )}
                      </div>
                      {cert.date && (
                        <p className="text-xs text-gray-600 font-semibold whitespace-nowrap">
                          {cert.date}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Projects Section */}
        {sections.find((s) => s.id === 'projects')?.isVisible &&
          resumeData.projects &&
          resumeData.projects.length > 0 && (
            <section className="mb-6">
              <h2
                className="text-base font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-800 pb-1 mb-4"
                style={{ letterSpacing: '0.15em' }}
              >
                Key Projects
              </h2>
              <div className="space-y-4">
                {resumeData.projects.map((proj) => (
                  <div key={proj.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {proj.url ? (
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-900 underline"
                            >
                              {proj.name || proj.title || 'Project Name'}
                            </a>
                          ) : (
                            proj.name || proj.title || 'Project Name'
                          )}
                        </p>
                        {proj.description && (
                          <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">
                            {proj.description}
                          </p>
                        )}
                      </div>
                      {proj.startDate && proj.endDate && (
                        <p className="text-xs text-gray-600 font-semibold whitespace-nowrap">
                          {proj.startDate} - {proj.endDate}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Languages Section */}
        {sections.find((s) => s.id === 'languages')?.isVisible &&
          resumeData.languages &&
          resumeData.languages.length > 0 && (
            <section className="mb-6">
              <h2
                className="text-base font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-800 pb-1 mb-4"
                style={{ letterSpacing: '0.15em' }}
              >
                Languages
              </h2>
              <div className="space-y-2">
                {resumeData.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center text-xs text-gray-700">
                    <span className="font-semibold">{lang.language}</span>
                    <span className="text-gray-600 capitalize">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Volunteer Section */}
        {sections.find((s) => s.id === 'volunteer')?.isVisible &&
          resumeData.volunteer &&
          resumeData.volunteer.length > 0 && (
            <section className="mb-6">
              <h2
                className="text-base font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-800 pb-1 mb-4"
                style={{ letterSpacing: '0.15em' }}
              >
                Volunteer Experience
              </h2>
              <div className="space-y-4">
                {resumeData.volunteer.map((vol) => (
                  <div key={vol.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {vol.organization || 'Organization'}
                        </p>
                        {vol.role && (
                          <p className="text-xs text-gray-600 italic mt-0.5">
                            {vol.role}
                          </p>
                        )}
                        {vol.description && (
                          <div className="mt-2 text-xs text-gray-700 whitespace-pre-wrap pl-4 border-l-2 border-gray-300">
                            {vol.description.split('\n').map((line, idx) => (
                              <p key={idx} className="mb-1">
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 font-semibold whitespace-nowrap">
                        {vol.startDate && vol.endDate
                          ? `${vol.startDate} - ${vol.endDate}`
                          : vol.startDate || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Custom sections (Achievements, Publications, etc.) */}
        {resumeData.customSections &&
          resumeData.customSections.map((customSection) => {
            const isVisible = sections.find((s) => s.id === customSection.id)?.isVisible;
            if (!isVisible || !customSection.items || customSection.items.length === 0) return null;

            return (
              <section key={customSection.id} className="mb-6">
                <h2
                  className="text-base font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-800 pb-1 mb-4"
                  style={{ letterSpacing: '0.15em' }}
                >
                  {customSection.title}
                </h2>
                <div className="space-y-4">
                  {customSection.items.map((item) => (
                    <div key={item.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {item.title || 'Title'}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-gray-600 italic mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                          {item.description && (
                            <div className="mt-2 text-xs text-gray-700 whitespace-pre-wrap pl-4 border-l-2 border-gray-300">
                              {item.description.split('\n').map((line, idx) => (
                                <p key={idx} className="mb-1">
                                  {line}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        {item.date && (
                          <p className="text-xs text-gray-600 font-semibold whitespace-nowrap">
                            {item.date}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    );
  }

  // Column Classic Layout - very classic, clear left column labels / right content
  if (templateId === 'classic-column') {
    return (
      <div className="min-h-[297mm]">
        {/* Header */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-wide">
              {resumeData.personalInfo.fullName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {resumeData.personalInfo.jobTitle}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {resumeData.personalInfo.email} · {resumeData.personalInfo.phone} ·{' '}
              {resumeData.personalInfo.location}
            </p>
          </header>
        )}

        {/* Two-column classic body: left labels, right content */}
        <main className="space-y-4">
          {/* Summary */}
          {sections.find((s) => s.id === 'profile')?.isVisible && (
            <section className="grid grid-cols-[140px,1fr] gap-4 items-start">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 border-r border-gray-300 pr-3">
                Summary
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {resumeData.summary}
              </div>
            </section>
          )}

          {/* Experience */}
          {sections.find((s) => s.id === 'experience')?.isVisible && (
            <section className="grid grid-cols-[140px,1fr] gap-4 items-start">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 border-r border-gray-300 pr-3 pt-1">
                Experience
              </div>
              <div className="space-y-4">
                {resumeData.experience.map((exp) => (
                  <article
                    key={exp.id}
                    className="break-inside-avoid"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {exp.jobTitle || 'Job Title'}
                        </h3>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {exp.company && exp.location
                            ? `${exp.company} • ${exp.location}`
                            : exp.company || ''}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 whitespace-nowrap">
                        {exp.startDate && exp.endDate
                          ? `${exp.startDate} - ${exp.endDate}`
                          : exp.startDate || ''}
                      </p>
                    </div>
                    {exp.description && (
                      <div className="mt-1.5 text-sm text-gray-700 whitespace-pre-wrap">
                        {exp.description.split('\n').map((line, idx) => (
                          <p key={idx} className="mb-1">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {sections.find((s) => s.id === 'education')?.isVisible && (
            <section className="grid grid-cols-[140px,1fr] gap-4 items-start">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 border-r border-gray-300 pr-3 pt-1">
                Education
              </div>
              <div className="space-y-3 text-sm text-gray-800">
                {resumeData.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {edu.degree || 'Degree'}
                        </p>
                        {edu.school && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {edu.school}
                          </p>
                        )}
                        {edu.location && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {edu.location}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 whitespace-nowrap">
                        {edu.startDate && edu.endDate
                          ? `${edu.startDate} - ${edu.endDate}`
                          : edu.startDate || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {sections.find((s) => s.id === 'skills')?.isVisible && (
            <section className="grid grid-cols-[140px,1fr] gap-4 items-start">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 border-r border-gray-300 pr-3 pt-1">
                Skills
              </div>
              <div className="text-sm text-gray-800">
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {resumeData.skills.map((skill, idx) => (
                    <span key={idx}>• {skill}</span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Certifications */}
          {sections.find((s) => s.id === 'certifications')?.isVisible &&
            resumeData.certifications &&
            resumeData.certifications.length > 0 && (
              <section className="grid grid-cols-[140px,1fr] gap-4 items-start">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 border-r border-gray-300 pr-3 pt-1">
                  Certifications
                </div>
                <div className="space-y-2 text-sm text-gray-800">
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id}>
                      <div className="flex justify-between gap-4">
                        <p className="font-semibold">
                          {cert.name || 'Certification Name'}
                        </p>
                        {cert.date && (
                          <p className="text-xs text-gray-600 whitespace-nowrap">
                            {cert.date}
                          </p>
                        )}
                      </div>
                      {cert.issuer && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          {cert.issuer}
                        </p>
                      )}
                      {cert.credentialId && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          ID: {cert.credentialId}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Languages */}
          {sections.find((s) => s.id === 'languages')?.isVisible &&
            resumeData.languages &&
            resumeData.languages.length > 0 && (
              <section className="grid grid-cols-[140px,1fr] gap-4 items-start">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 border-r border-gray-300 pr-3 pt-1">
                  Languages
                </div>
                <div className="space-y-1 text-sm text-gray-800">
                  {resumeData.languages.map((lang) => (
                    <div
                      key={lang.id}
                      className="flex justify-between gap-4 items-center"
                    >
                      <span className="font-medium">{lang.language}</span>
                      <span className="text-xs text-gray-600 capitalize">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Volunteer */}
          {sections.find((s) => s.id === 'volunteer')?.isVisible &&
            resumeData.volunteer &&
            resumeData.volunteer.length > 0 && (
              <section className="grid grid-cols-[140px,1fr] gap-4 items-start">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 border-r border-gray-300 pr-3 pt-1">
                  Volunteer
                </div>
                <div className="space-y-3 text-sm text-gray-800">
                  {resumeData.volunteer.map((vol) => (
                    <div key={vol.id}>
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            {vol.organization || 'Organization'}
                          </p>
                          {vol.role && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {vol.role}
                            </p>
                          )}
                          {vol.description && (
                            <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">
                              {vol.description}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 whitespace-nowrap">
                          {vol.startDate && vol.endDate
                            ? `${vol.startDate} - ${vol.endDate}`
                            : vol.startDate || ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </main>
      </div>
    );
  }

  // Boxed Classic Layout - very classic, boxed single-column sections
  if (templateId === 'classic-boxed') {
    return (
      <div className="min-h-[297mm]">
        {/* Header */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 tracking-wide uppercase">
              {resumeData.personalInfo.fullName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {resumeData.personalInfo.jobTitle}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {resumeData.personalInfo.email} • {resumeData.personalInfo.phone} •{' '}
              {resumeData.personalInfo.location}
            </p>
          </header>
        )}

        <main className="space-y-4">
          {/* Summary */}
          {sections.find((s) => s.id === 'profile')?.isVisible && (
            <section className="border border-gray-300 rounded-md p-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700 mb-2">
                Professional Summary
              </h2>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {resumeData.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {sections.find((s) => s.id === 'experience')?.isVisible && (
            <section className="border border-gray-300 rounded-md p-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700 mb-3">
                Experience
              </h2>
              <div className="space-y-4">
                {resumeData.experience.map((exp) => (
                  <article
                    key={exp.id}
                    className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0 break-inside-avoid"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {exp.jobTitle || 'Job Title'}
                        </h3>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {exp.company && exp.location
                            ? `${exp.company} • ${exp.location}`
                            : exp.company || ''}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 whitespace-nowrap">
                        {exp.startDate && exp.endDate
                          ? `${exp.startDate} - ${exp.endDate}`
                          : exp.startDate || ''}
                      </p>
                    </div>
                    {exp.description && (
                      <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                        {exp.description.split('\n').map((line, idx) => (
                          <p key={idx} className="mb-1">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {sections.find((s) => s.id === 'education')?.isVisible && (
            <section className="border border-gray-300 rounded-md p-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700 mb-3">
                Education
              </h2>
              <div className="space-y-3 text-sm text-gray-800">
                {resumeData.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {edu.degree || 'Degree'}
                        </p>
                        {edu.school && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {edu.school}
                          </p>
                        )}
                        {edu.location && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {edu.location}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 whitespace-nowrap">
                        {edu.startDate && edu.endDate
                          ? `${edu.startDate} - ${edu.endDate}`
                          : edu.startDate || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {sections.find((s) => s.id === 'skills')?.isVisible && (
            <section className="border border-gray-300 rounded-md p-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700 mb-3">
                Skills
              </h2>
              <div className="flex flex-wrap gap-3 text-sm text-gray-800">
                {resumeData.skills.map((skill, idx) => (
                  <span key={idx}>• {skill}</span>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {sections.find((s) => s.id === 'certifications')?.isVisible &&
            resumeData.certifications &&
            resumeData.certifications.length > 0 && (
              <section className="border border-gray-300 rounded-md p-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700 mb-3">
                  Certifications
                </h2>
                <div className="space-y-2 text-sm text-gray-800">
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id}>
                      <div className="flex justify-between gap-4">
                        <p className="font-semibold">
                          {cert.name || 'Certification Name'}
                        </p>
                        {cert.date && (
                          <p className="text-xs text-gray-600 whitespace-nowrap">
                            {cert.date}
                          </p>
                        )}
                      </div>
                      {cert.issuer && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          {cert.issuer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Languages */}
          {sections.find((s) => s.id === 'languages')?.isVisible &&
            resumeData.languages &&
            resumeData.languages.length > 0 && (
              <section className="border border-gray-300 rounded-md p-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700 mb-3">
                  Languages
                </h2>
                <div className="space-y-1 text-sm text-gray-800">
                  {resumeData.languages.map((lang) => (
                    <div
                      key={lang.id}
                      className="flex justify-between gap-4 items-center"
                    >
                      <span className="font-medium">{lang.language}</span>
                      <span className="text-xs text-gray-600 capitalize">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Volunteer */}
          {sections.find((s) => s.id === 'volunteer')?.isVisible &&
            resumeData.volunteer &&
            resumeData.volunteer.length > 0 && (
              <section className="border border-gray-300 rounded-md p-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700 mb-3">
                  Volunteer Experience
                </h2>
                <div className="space-y-3 text-sm text-gray-800">
                  {resumeData.volunteer.map((vol) => (
                    <div key={vol.id}>
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            {vol.organization || 'Organization'}
                          </p>
                          {vol.role && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {vol.role}
                            </p>
                          )}
                          {vol.description && (
                            <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">
                              {vol.description}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 whitespace-nowrap">
                          {vol.startDate && vol.endDate
                            ? `${vol.startDate} - ${vol.endDate}`
                            : vol.startDate || ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </main>
      </div>
    );
  }

  // Formal Classic Layout - very formal, conservative, corporate design with structured sections
  if (templateId === 'classic-formal') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicFormal component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicFormal
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Times New Roman, Georgia, serif',
          fontSize: 11,
          accentColor: formatting.accentColor || '#1a1a1a',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Classic Professional BW Layout
  if (templateId === 'classic-professional-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicProfessionalBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicProfessionalBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Times New Roman, Georgia, serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Classic Executive BW Layout
  if (templateId === 'classic-executive-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicExecutiveBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicExecutiveBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Times New Roman, Georgia, serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Classic Modern BW Layout
  if (templateId === 'classic-modern-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicModernBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicModernBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Arial, Helvetica, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Classic Traditional BW Layout
  if (templateId === 'classic-traditional-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicTraditionalBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicTraditionalBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Garamond, Times New Roman, serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Classic Structured BW Layout
  if (templateId === 'classic-structured-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicStructuredBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicStructuredBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Times New Roman, Georgia, serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Classic Compact BW Layout
  if (templateId === 'classic-compact-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicCompactBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicCompactBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Times New Roman, Georgia, serif',
          fontSize: 9,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Classic Elegant BW Layout
  if (templateId === 'classic-elegant-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicElegantBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicElegantBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Garamond, Times New Roman, serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#1a1a1a',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Classic Minimal BW Layout
  if (templateId === 'classic-minimal-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicMinimalBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicMinimalBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Arial, Helvetica, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.7,
        }}
      />
    );
  }

  // Classic Refined BW Layout
  if (templateId === 'classic-refined-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicRefinedBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicRefinedBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Times New Roman, Georgia, serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Classic Corporate BW Layout
  if (templateId === 'classic-corporate-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for ClassicCorporateBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <ClassicCorporateBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Arial, Helvetica, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Classic Centered BW Layout
  if (templateId === 'classic-centered-bw') {
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);

    return (
      <ClassicCenteredBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Times New Roman, Georgia, serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Classic Timeline BW Layout
  if (templateId === 'classic-timeline-bw') {
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);

    return (
      <ClassicTimelineBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Times New Roman, Georgia, serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Classic Header Bar BW Layout
  if (templateId === 'classic-header-bar-bw') {
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);

    return (
      <ClassicHeaderBarBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Arial, Helvetica, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Old classic-formal implementation (replaced by ClassicFormal component)
  if (false && templateId === 'classic-formal-old') {
    return (
      <div className="min-h-[297mm] space-y-5" style={{ fontFamily: '"Garamond", "Times New Roman", serif' }}>
        {/* Formal Header with centered layout and divider lines */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <header className="border-b-4 border-gray-900 pb-4 mb-6">
            <div className="text-center">
              <h1
                className="text-5xl font-bold text-gray-900 uppercase tracking-wider mb-2"
                style={{ letterSpacing: '0.15em', fontFamily: '"Garamond", serif' }}
              >
                {resumeData.personalInfo.fullName}
              </h1>
              <div className="border-t-2 border-b-2 border-gray-700 py-2 my-3">
                <p className="text-lg text-gray-800 font-semibold tracking-wide">
                  {resumeData.personalInfo.jobTitle}
                </p>
              </div>
              <div className="flex justify-center items-center gap-4 text-xs text-gray-700 mt-3">
                <span className="font-medium">{resumeData.personalInfo.email}</span>
                <span className="text-gray-500">|</span>
                <span className="font-medium">{resumeData.personalInfo.phone}</span>
                <span className="text-gray-500">|</span>
                <span className="font-medium">{resumeData.personalInfo.location}</span>
              </div>
            </div>
          </header>
        )}

        {/* Professional Summary */}
        {sections.find((s) => s.id === 'profile')?.isVisible && (
          <section className="mb-5">
            <h2
              className="text-sm font-bold uppercase tracking-[0.3em] text-gray-900 border-b-3 border-gray-900 pb-2 mb-3"
              style={{ letterSpacing: '0.2em', borderBottomWidth: '3px' }}
            >
              Professional Summary
            </h2>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap pl-2">
              {resumeData.summary}
            </p>
          </section>
        )}

        {/* Experience Section */}
        {sections.find((s) => s.id === 'experience')?.isVisible && (
          <section className="mb-5">
            <h2
              className="text-sm font-bold uppercase tracking-[0.3em] text-gray-900 border-b-3 border-gray-900 pb-2 mb-4"
              style={{ letterSpacing: '0.2em', borderBottomWidth: '3px' }}
            >
              Professional Experience
            </h2>
            <div className="space-y-5">
              {resumeData.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="break-inside-avoid pl-2"
                  style={{ pageBreakInside: 'avoid' }}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        {exp.jobTitle || 'Job Title'}
                      </h3>
                      <p className="text-xs text-gray-700 italic mt-0.5 font-medium">
                        {exp.company && exp.location
                          ? `${exp.company}, ${exp.location}`
                          : exp.company || ''}
                      </p>
                    </div>
                    <p className="text-xs text-gray-700 font-bold whitespace-nowrap">
                      {exp.startDate && exp.endDate
                        ? `${exp.startDate} - ${exp.endDate}`
                        : exp.startDate || ''}
                    </p>
                  </div>
                  {exp.description && (
                    <div className="mt-2 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap pl-4 border-l-3 border-gray-400" style={{ borderLeftWidth: '3px' }}>
                      {exp.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-1">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {sections.find((s) => s.id === 'education')?.isVisible && (
          <section className="mb-5">
            <h2
              className="text-sm font-bold uppercase tracking-[0.3em] text-gray-900 border-b-3 border-gray-900 pb-2 mb-4"
              style={{ letterSpacing: '0.2em', borderBottomWidth: '3px' }}
            >
              Education
            </h2>
            <div className="space-y-4 pl-2">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        {edu.degree || 'Degree'}
                      </p>
                      {edu.school && (
                        <p className="text-xs text-gray-700 italic mt-0.5 font-medium">
                          {edu.school}
                        </p>
                      )}
                      {edu.location && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          {edu.location}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 font-bold whitespace-nowrap">
                      {edu.startDate && edu.endDate
                        ? `${edu.startDate} - ${edu.endDate}`
                        : edu.startDate || ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {sections.find((s) => s.id === 'skills')?.isVisible && (
          <section className="mb-5">
            <h2
              className="text-sm font-bold uppercase tracking-[0.3em] text-gray-900 border-b-3 border-gray-900 pb-2 mb-4"
              style={{ letterSpacing: '0.2em', borderBottomWidth: '3px' }}
            >
              Core Competencies
            </h2>
            <div className="grid grid-cols-4 gap-x-6 gap-y-2 pl-2">
              {resumeData.skills.map((skill, index) => (
                <div key={index} className="text-xs text-gray-800 font-medium">
                  • {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {sections.find((s) => s.id === 'certifications')?.isVisible &&
          resumeData.certifications &&
          resumeData.certifications.length > 0 && (
            <section className="mb-5">
              <h2
                className="text-sm font-bold uppercase tracking-[0.3em] text-gray-900 border-b-3 border-gray-900 pb-2 mb-4"
                style={{ letterSpacing: '0.2em', borderBottomWidth: '3px' }}
              >
                Professional Certifications
              </h2>
              <div className="space-y-3 pl-2">
                {resumeData.certifications.map((cert) => (
                  <div key={cert.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          {cert.name || 'Certification Name'}
                        </p>
                        {cert.issuer && (
                          <p className="text-xs text-gray-700 italic mt-0.5 font-medium">
                            {cert.issuer}
                          </p>
                        )}
                        {cert.credentialId && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            Credential ID: {cert.credentialId}
                          </p>
                        )}
                      </div>
                      {cert.date && (
                        <p className="text-xs text-gray-700 font-bold whitespace-nowrap">
                          {cert.date}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Projects Section */}
        {sections.find((s) => s.id === 'projects')?.isVisible &&
          resumeData.projects &&
          resumeData.projects.length > 0 && (
            <section className="mb-5">
              <h2
                className="text-sm font-bold uppercase tracking-[0.3em] text-gray-900 border-b-3 border-gray-900 pb-2 mb-4"
                style={{ letterSpacing: '0.2em', borderBottomWidth: '3px' }}
              >
                Key Projects
              </h2>
              <div className="space-y-4 pl-2">
                {resumeData.projects.map((proj) => (
                  <div key={proj.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-baseline mb-1">
                      <div>
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          {proj.url ? (
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-900 underline"
                            >
                              {proj.name || proj.title || 'Project Name'}
                            </a>
                          ) : (
                            proj.name || proj.title || 'Project Name'
                          )}
                        </p>
                        {proj.description && (
                          <p className="mt-1 text-xs text-gray-800 whitespace-pre-wrap">
                            {proj.description}
                          </p>
                        )}
                      </div>
                      {proj.startDate && proj.endDate && (
                        <p className="text-xs text-gray-700 font-bold whitespace-nowrap">
                          {proj.startDate} - {proj.endDate}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Languages Section */}
        {sections.find((s) => s.id === 'languages')?.isVisible &&
          resumeData.languages &&
          resumeData.languages.length > 0 && (
            <section className="mb-5">
              <h2
                className="text-sm font-bold uppercase tracking-[0.3em] text-gray-900 border-b-3 border-gray-900 pb-2 mb-4"
                style={{ letterSpacing: '0.2em', borderBottomWidth: '3px' }}
              >
                Languages
              </h2>
              <div className="space-y-2 pl-2">
                {resumeData.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center text-xs text-gray-800">
                    <span className="font-bold uppercase tracking-wide">{lang.language}</span>
                    <span className="text-gray-700 capitalize font-medium">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Volunteer Section */}
        {sections.find((s) => s.id === 'volunteer')?.isVisible &&
          resumeData.volunteer &&
          resumeData.volunteer.length > 0 && (
            <section className="mb-5">
              <h2
                className="text-sm font-bold uppercase tracking-[0.3em] text-gray-900 border-b-3 border-gray-900 pb-2 mb-4"
                style={{ letterSpacing: '0.2em', borderBottomWidth: '3px' }}
              >
                Volunteer Experience
              </h2>
              <div className="space-y-4 pl-2">
                {resumeData.volunteer.map((vol) => (
                  <div key={vol.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-baseline mb-1">
                      <div>
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          {vol.organization || 'Organization'}
                        </p>
                        {vol.role && (
                          <p className="text-xs text-gray-700 italic mt-0.5 font-medium">
                            {vol.role}
                          </p>
                        )}
                        {vol.description && (
                          <div className="mt-2 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap pl-4 border-l-3 border-gray-400" style={{ borderLeftWidth: '3px' }}>
                            {vol.description.split('\n').map((line, idx) => (
                              <p key={idx} className="mb-1">
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 font-bold whitespace-nowrap">
                        {vol.startDate && vol.endDate
                          ? `${vol.startDate} - ${vol.endDate}`
                          : vol.startDate || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>
    );
  }

  // Creative Layout - bold, colorful single-column
  if (templateId === 'creative') {
    const initials =
      resumeData.personalInfo.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'CR';

    return (
      <div className="min-h-[297mm] flex flex-col">
        {/* Hero header */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <header className="-mx-8 -mt-8 mb-8 bg-gradient-to-r from-rose-500 via-orange-400 to-yellow-300 px-10 py-8 text-white flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shadow-lg">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight">
                {resumeData.personalInfo.fullName}
              </h1>
              <p className="mt-1 text-lg text-white/90">
                {resumeData.personalInfo.jobTitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/90">
                <span>{resumeData.personalInfo.email}</span>
                <span>{resumeData.personalInfo.phone}</span>
                <span>{resumeData.personalInfo.location}</span>
              </div>
            </div>
          </header>
        )}

        <main className="space-y-8">
          {/* Summary */}
          {sections.find((s) => s.id === 'profile')?.isVisible && (
            <section className="bg-white/90 rounded-xl border border-rose-100/60 p-5 shadow-[0_10px_25px_rgba(244,63,94,0.08)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500 mb-3">
                About Me
              </h2>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {resumeData.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {sections.find((s) => s.id === 'experience')?.isVisible && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-700 mb-3">
                Experience
              </h2>
              <div className="space-y-4">
                {resumeData.experience.map((exp, idx) => (
                  <article
                    key={exp.id}
                    className="rounded-xl border border-gray-100 bg-white/95 p-5 shadow-[0_6px_18px_rgba(15,23,42,0.06)] relative overflow-hidden break-inside-avoid"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 w-1"
                      style={{
                        background:
                          idx % 2 === 0
                            ? 'linear-gradient(to bottom, #F97316, #F43F5E)'
                            : 'linear-gradient(to bottom, #6366F1, #8B5CF6)',
                      }}
                    />
                    <div className="pl-4">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {exp.jobTitle || 'Job Title'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {exp.company && exp.location
                              ? `${exp.company} • ${exp.location}`
                              : exp.company || ''}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {exp.startDate && exp.endDate
                            ? `${exp.startDate} - ${exp.endDate}`
                            : exp.startDate || ''}
                        </p>
                      </div>
                      {exp.description && (
                        <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                          {exp.description.split('\n').map((line, lineIdx) => (
                            <p key={lineIdx} className="mb-1">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {sections.find((s) => s.id === 'projects')?.isVisible &&
            resumeData.projects &&
            resumeData.projects.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-700 mb-3">
                  Selected Projects
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {resumeData.projects.map((proj) => (
                    <article
                      key={proj.id}
                      className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-rose-50 p-4 text-sm text-gray-800"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {proj.url ? (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline"
                          >
                            {proj.name || proj.title || 'Project Name'}
                          </a>
                        ) : (
                          proj.name || proj.title || 'Project Name'
                        )}
                      </h3>
                      {proj.company && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {proj.company}
                        </p>
                      )}
                      {proj.description && (
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                          {proj.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

          {/* Skills, Education, etc. stacked in creative chips/cards */}
          <section className="grid gap-4 md:grid-cols-3">
            {sections.find((s) => s.id === 'skills')?.isVisible && (
              <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500 mb-2">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white text-rose-600 border border-rose-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {sections.find((s) => s.id === 'education')?.isVisible && (
              <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500 mb-2">
                  Education
                </h3>
                <div className="space-y-2 text-xs text-gray-800">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id}>
                      <p className="font-semibold">
                        {edu.degree || 'Degree'}
                      </p>
                      {edu.school && (
                        <p className="text-gray-500">{edu.school}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sections.find((s) => s.id === 'languages')?.isVisible &&
              resumeData.languages &&
              resumeData.languages.length > 0 && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500 mb-2">
                    Languages
                  </h3>
                  <div className="space-y-1 text-xs text-gray-800">
                    {resumeData.languages.map((lang) => (
                      <div key={lang.id} className="flex justify-between">
                        <span>{lang.language}</span>
                        <span className="text-gray-500 capitalize">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </section>
        </main>
      </div>
    );
  }
  // Minimalist Layout - ultra-clean, lots of white space
  if (templateId === 'minimalist') {
    return (
      <div className="min-h-[297mm] flex flex-col">
        {/* Header */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <header className="mb-8">
            <h1 className="text-4xl font-light tracking-tight text-gray-900">
              {resumeData.personalInfo.fullName}
            </h1>
            <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-4">
              <span>{resumeData.personalInfo.jobTitle}</span>
              <span>{resumeData.personalInfo.email}</span>
              <span>{resumeData.personalInfo.phone}</span>
              <span>{resumeData.personalInfo.location}</span>
            </div>
          </header>
        )}

        <main className="grid grid-cols-1 gap-10 md:grid-cols-[2fr,1.2fr]">
          {/* Main column */}
          <div className="space-y-8">
            {/* Summary */}
            {sections.find((s) => s.id === 'profile')?.isVisible && (
              <section>
                <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-3">
                  Summary
                </h2>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {resumeData.summary}
                </p>
              </section>
            )}

            {/* Experience */}
            {sections.find((s) => s.id === 'experience')?.isVisible && (
              <section>
                <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-3">
                  Experience
                </h2>
                <div className="space-y-5">
                  {resumeData.experience.map((exp) => (
                    <article
                      key={exp.id}
                      className="break-inside-avoid"
                      style={{ pageBreakInside: 'avoid' }}
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {exp.jobTitle || 'Job Title'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {exp.company && exp.location
                              ? `${exp.company} • ${exp.location}`
                              : exp.company || ''}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {exp.startDate && exp.endDate
                            ? `${exp.startDate} - ${exp.endDate}`
                            : exp.startDate || ''}
                        </p>
                      </div>
                      {exp.description && (
                        <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                          {exp.description.split('\n').map((line, idx) => (
                            <p key={idx} className="mb-1">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {sections.find((s) => s.id === 'projects')?.isVisible &&
              resumeData.projects &&
              resumeData.projects.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-3">
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {resumeData.projects.map((proj) => (
                      <article key={proj.id} className="text-sm text-gray-800">
                        <div className="flex justify-between gap-4">
                          <h3 className="font-semibold">
                            {proj.url ? (
                              <a
                                href={proj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-900 underline underline-offset-2"
                              >
                                {proj.name || proj.title || 'Project Name'}
                              </a>
                            ) : (
                              proj.name || proj.title || 'Project Name'
                            )}
                          </h3>
                          {proj.startDate && proj.endDate && (
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              {proj.startDate} - {proj.endDate}
                            </p>
                          )}
                        </div>
                        {proj.description && (
                          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                            {proj.description}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Skills */}
            {sections.find((s) => s.id === 'skills')?.isVisible && (
              <section>
                <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-3">
                  Skills
                </h2>
                <ul className="space-y-1 text-sm text-gray-800">
                  {resumeData.skills.map((skill, idx) => (
                    <li key={idx}>• {skill}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Education */}
            {sections.find((s) => s.id === 'education')?.isVisible && (
              <section>
                <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-3">
                  Education
                </h2>
                <div className="space-y-3 text-sm text-gray-800">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id}>
                      <p className="font-semibold">
                        {edu.degree || 'Degree'}
                      </p>
                      {edu.school && (
                        <p className="text-xs text-gray-500">{edu.school}</p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-500">
                        {edu.startDate && edu.endDate
                          ? `${edu.startDate} - ${edu.endDate}`
                          : edu.startDate || ''}
                      </p>
                      {edu.location && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {edu.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {sections.find((s) => s.id === 'certifications')?.isVisible &&
              resumeData.certifications &&
              resumeData.certifications.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-3">
                    Certifications
                  </h2>
                  <div className="space-y-2 text-sm text-gray-800">
                    {resumeData.certifications.map((cert) => (
                      <div key={cert.id}>
                        <p className="font-semibold">
                          {cert.name || 'Certification Name'}
                        </p>
                        {cert.issuer && (
                          <p className="text-xs text-gray-500">
                            {cert.issuer}
                          </p>
                        )}
                        {cert.date && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {cert.date}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* Languages */}
            {sections.find((s) => s.id === 'languages')?.isVisible &&
              resumeData.languages &&
              resumeData.languages.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-500 mb-3">
                    Languages
                  </h2>
                  <div className="space-y-1 text-sm text-gray-800">
                    {resumeData.languages.map((lang) => (
                      <div key={lang.id} className="flex justify-between">
                        <span>{lang.language}</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </aside>
        </main>
      </div>
    );
  }
  // Portrait Photo Layout - modern single-column with prominent portrait
  if (templateId === 'portrait-photo') {
    const initials =
      resumeData.personalInfo.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'PP';

    return (
      <div className="min-h-[297mm] flex flex-col">
        {/* Header with portrait */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <header className="-mx-8 -mt-8 mb-8 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-10 py-8 text-white flex items-center gap-6">
            <div className="w-28 h-28 rounded-2xl border-4 border-white/40 shadow-2xl overflow-hidden flex-shrink-0 bg-blue-900/40 flex items-center justify-center text-2xl font-semibold">
              {resumeData.profilePicture ? (
                <img
                  src={resumeData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {resumeData.personalInfo.fullName}
              </h1>
              <p className="mt-1 text-lg text-sky-100">
                {resumeData.personalInfo.jobTitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-sky-100/90">
                <span>{resumeData.personalInfo.email}</span>
                <span>{resumeData.personalInfo.phone}</span>
                <span>{resumeData.personalInfo.location}</span>
              </div>
            </div>
          </header>
        )}

        <main className="grid grid-cols-1 gap-6 md:grid-cols-[1.8fr,1.2fr]">
          {/* Main content column */}
          <div className="space-y-6">
            {/* Summary */}
            {sections.find((s) => s.id === 'profile')?.isVisible && (
              <section>
                <h2
                  className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-700 mb-2"
                  style={{ color: formatting.accentColor }}
                >
                  Profile
                </h2>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {resumeData.summary}
                </p>
              </section>
            )}

            {/* Experience */}
            {sections.find((s) => s.id === 'experience')?.isVisible && (
              <section>
                <h2
                  className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-700 mb-3"
                  style={{ color: formatting.accentColor }}
                >
                  Experience
                </h2>
                <div className="space-y-4">
                  {resumeData.experience.map((exp) => (
                    <article
                      key={exp.id}
                      className="border border-gray-100 rounded-lg p-4 bg-white/90 shadow-[0_1px_3px_rgba(15,23,42,0.05)] break-inside-avoid"
                      style={{ pageBreakInside: 'avoid' }}
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {exp.jobTitle || 'Job Title'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {exp.company && exp.location
                              ? `${exp.company} • ${exp.location}`
                              : exp.company || ''}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {exp.startDate && exp.endDate
                            ? `${exp.startDate} - ${exp.endDate}`
                            : exp.startDate || ''}
                        </p>
                      </div>
                      {exp.description && (
                        <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                          {exp.description.split('\n').map((line, idx) => (
                            <p key={idx} className="mb-1">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {sections.find((s) => s.id === 'projects')?.isVisible &&
              resumeData.projects &&
              resumeData.projects.length > 0 && (
                <section>
                  <h2
                    className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-700 mb-3"
                    style={{ color: formatting.accentColor }}
                  >
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {resumeData.projects.map((proj) => (
                      <article key={proj.id} className="text-sm text-gray-800">
                        <div className="flex justify-between gap-4">
                          <h3 className="font-semibold">
                            {proj.url ? (
                              <a
                                href={proj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {proj.name || proj.title || 'Project Name'}
                              </a>
                            ) : (
                              proj.name || proj.title || 'Project Name'
                            )}
                          </h3>
                          {proj.startDate && proj.endDate && (
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              {proj.startDate} - {proj.endDate}
                            </p>
                          )}
                        </div>
                        {proj.description && (
                          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                            {proj.description}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
          </div>

          {/* Sidebar column */}
          <aside className="space-y-6">
            {/* Skills */}
            {sections.find((s) => s.id === 'skills')?.isVisible && (
              <section className="rounded-xl border border-blue-50 bg-blue-50/70 p-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-800 mb-3">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-800 border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {sections.find((s) => s.id === 'education')?.isVisible && (
              <section className="rounded-xl border border-gray-100 bg-white/90 p-4">
                <h2
                  className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-700 mb-3"
                  style={{ color: formatting.accentColor }}
                >
                  Education
                </h2>
                <div className="space-y-3 text-sm text-gray-800">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id}>
                      <p className="font-semibold">
                        {edu.degree || 'Degree'}
                      </p>
                      {edu.school && (
                        <p className="text-xs text-gray-500">{edu.school}</p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-500">
                        {edu.startDate && edu.endDate
                          ? `${edu.startDate} - ${edu.endDate}`
                          : edu.startDate || ''}
                      </p>
                      {edu.location && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {edu.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {sections.find((s) => s.id === 'certifications')?.isVisible &&
              resumeData.certifications &&
              resumeData.certifications.length > 0 && (
                <section className="rounded-xl border border-gray-100 bg-white/90 p-4">
                  <h2
                    className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-700 mb-3"
                    style={{ color: formatting.accentColor }}
                  >
                    Certifications
                  </h2>
                  <div className="space-y-2 text-sm text-gray-800">
                    {resumeData.certifications.map((cert) => (
                      <div key={cert.id}>
                        <p className="font-semibold">
                          {cert.name || 'Certification Name'}
                        </p>
                        {cert.issuer && (
                          <p className="text-xs text-gray-500">
                            {cert.issuer}
                          </p>
                        )}
                        {cert.date && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {cert.date}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* Languages */}
            {sections.find((s) => s.id === 'languages')?.isVisible &&
              resumeData.languages &&
              resumeData.languages.length > 0 && (
                <section className="rounded-xl border border-gray-100 bg-white/90 p-4">
                  <h2
                    className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-700 mb-3"
                    style={{ color: formatting.accentColor }}
                  >
                    Languages
                  </h2>
                  <div className="space-y-1 text-sm text-gray-800">
                    {resumeData.languages.map((lang) => (
                      <div key={lang.id} className="flex justify-between">
                        <span>{lang.language}</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </aside>
        </main>
      </div>
    );
  }
  // Executive Photo Layout - photo-forward executive design
  if (templateId === 'executive-photo') {
    const initials =
      resumeData.personalInfo.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'EP';

    return (
      <div className="min-h-[297mm] grid grid-cols-[1.1fr,2fr] gap-0">
        {/* Left executive photo / sidebar */}
        <aside className="bg-slate-900 text-white p-6 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden mb-4">
            {resumeData.profilePicture ? (
              <img
                src={resumeData.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-2xl font-semibold">
                {initials}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-semibold tracking-wide text-center">
            {resumeData.personalInfo.fullName}
          </h1>
          <p className="mt-1 text-sm text-amber-300 text-center">
            {resumeData.personalInfo.jobTitle}
          </p>

          <div className="mt-4 text-xs text-slate-200 space-y-1 text-center">
            <p>{resumeData.personalInfo.email}</p>
            <p>{resumeData.personalInfo.phone}</p>
            <p>{resumeData.personalInfo.location}</p>
          </div>

          {/* Sidebar skills */}
          {sections.find((s) => s.id === 'skills')?.isVisible && (
            <div className="mt-8 w-full">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 mb-3">
                Core Competencies
              </h2>
              <div className="space-y-2">
                {resumeData.skills.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[11px]">
                      <span>{skill}</span>
                      <span className="text-slate-400">
                        {['Expert', 'Advanced', 'Pro', 'Lead'][idx % 4]}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                        style={{ width: `${70 + (idx % 4) * 7}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right main content */}
        <main className="bg-white p-8 space-y-6">
          {/* Summary */}
          {sections.find((s) => s.id === 'profile')?.isVisible && (
            <section>
              <h2
                className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 mb-2"
                style={{ color: formatting.accentColor }}
              >
                Executive Summary
              </h2>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">
                {resumeData.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {sections.find((s) => s.id === 'experience')?.isVisible && (
            <section>
              <h2
                className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 mb-2"
                style={{ color: formatting.accentColor }}
              >
                Leadership Experience
              </h2>
              <div className="space-y-4">
                {resumeData.experience.map((exp) => (
                  <article
                    key={exp.id}
                    className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 break-inside-avoid"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {exp.jobTitle || 'Job Title'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {exp.company && exp.location
                            ? `${exp.company} • ${exp.location}`
                            : exp.company || ''}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 whitespace-nowrap">
                        {exp.startDate && exp.endDate
                          ? `${exp.startDate} - ${exp.endDate}`
                          : exp.startDate || ''}
                      </p>
                    </div>
                    {exp.description && (
                      <div className="mt-1.5 text-sm text-slate-700 whitespace-pre-wrap">
                        {exp.description.split('\n').map((line, idx) => (
                          <p key={idx} className="mb-1">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {sections.find((s) => s.id === 'education')?.isVisible && (
            <section>
              <h2
                className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 mb-2"
                style={{ color: formatting.accentColor }}
              >
                Education
              </h2>
              <div className="space-y-3">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="text-sm text-slate-800">
                    <p className="font-semibold">
                      {edu.degree || 'Degree'}
                    </p>
                    {edu.school && (
                      <p className="text-xs text-slate-500">{edu.school}</p>
                    )}
                    <p className="mt-0.5 text-xs text-slate-500">
                      {edu.startDate && edu.endDate
                        ? `${edu.startDate} - ${edu.endDate}`
                        : edu.startDate || ''}
                    </p>
                    {edu.location && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {edu.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {sections.find((s) => s.id === 'certifications')?.isVisible &&
            resumeData.certifications &&
            resumeData.certifications.length > 0 && (
              <section>
                <h2
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 mb-2"
                  style={{ color: formatting.accentColor }}
                >
                  Certifications
                </h2>
                <div className="space-y-2 text-sm text-slate-800">
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id}>
                      <p className="font-semibold">
                        {cert.name || 'Certification Name'}
                      </p>
                      {cert.issuer && (
                        <p className="text-xs text-slate-500">
                          {cert.issuer}
                        </p>
                      )}
                      {cert.date && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {cert.date}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Languages */}
          {sections.find((s) => s.id === 'languages')?.isVisible &&
            resumeData.languages &&
            resumeData.languages.length > 0 && (
              <section>
                <h2
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 mb-2"
                  style={{ color: formatting.accentColor }}
                >
                  Languages
                </h2>
                <div className="flex flex-wrap gap-3 text-sm text-slate-800">
                  {resumeData.languages.map((lang) => (
                    <span key={lang.id} className="flex items-center gap-1">
                      <span className="font-medium">{lang.language}</span>
                      <span className="text-xs text-slate-500 capitalize">
                        ({lang.proficiency})
                      </span>
                    </span>
                  ))}
                </div>
              </section>
            )}

          {/* Volunteer */}
          {sections.find((s) => s.id === 'volunteer')?.isVisible &&
            resumeData.volunteer &&
            resumeData.volunteer.length > 0 && (
              <section>
                <h2
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 mb-2"
                  style={{ color: formatting.accentColor }}
                >
                  Board & Volunteer Work
                </h2>
                <div className="space-y-3 text-sm text-slate-800">
                  {resumeData.volunteer.map((vol) => (
                    <div key={vol.id}>
                      <p className="font-semibold">
                        {vol.organization || 'Organization'}
                      </p>
                      {vol.role && (
                        <p className="text-xs text-slate-500">{vol.role}</p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-500">
                        {vol.startDate && vol.endDate
                          ? `${vol.startDate} - ${vol.endDate}`
                          : vol.startDate || ''}
                      </p>
                      {vol.description && (
                        <p className="mt-0.5 text-xs text-slate-600 whitespace-pre-wrap">
                          {vol.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
        </main>
      </div>
    );
  }

  // Creative Classic Layout - visually distinct but uses the same content/sections
  if (templateId === 'creative-classic') {
    return (
      <div className="min-h-[297mm] flex flex-col">
        {/* Header Section */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <div className="relative -mx-8 -mt-8 mb-8 overflow-hidden rounded-t-lg">
            {/* Gradient banner */}
            <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 px-10 py-8 text-white">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    {resumeData.personalInfo.fullName}
                  </h1>
                  <p className="mt-1 text-lg md:text-xl font-medium text-white/90">
                    {resumeData.personalInfo.jobTitle}
                  </p>
                </div>
                <div className="text-sm md:text-right space-y-1 text-white/90">
                  <p>{resumeData.personalInfo.email}</p>
                  <p>{resumeData.personalInfo.phone}</p>
                  <p>{resumeData.personalInfo.location}</p>
                </div>
              </div>
            </div>

            {/* Sub-bar accent */}
            <div className="h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[2.2fr,1.2fr]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Professional Summary */}
            {sections.find((s) => s.id === 'profile')?.isVisible && (
              <section className="bg-white/80 rounded-lg border border-gray-100 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                <h2
                  className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-700 mb-3 flex items-center gap-2"
                  style={{ color: formatting.accentColor }}
                >
                  <span className="inline-block h-px w-6 rounded-full bg-gray-300" />
                  Professional Summary
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {resumeData.summary}
                </p>
              </section>
            )}

            {/* Experience Section */}
            {sections.find((s) => s.id === 'experience')?.isVisible && (
              <section>
                <h2
                  className="text-sm font-semibold tracking-[0.2em] uppercase mb-3 text-gray-800 flex items-center gap-2"
                  style={{ color: formatting.accentColor }}
                >
                  <span
                    className="inline-block h-5 w-1 rounded-full"
                    style={{ backgroundColor: formatting.accentColor }}
                  />
                  Experience
                </h2>
                <div className="space-y-4">
                  {resumeData.experience.map((exp) => (
                    <article
                      key={exp.id}
                      className="rounded-lg border border-gray-100 bg-white/80 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] break-inside-avoid"
                      style={{ pageBreakInside: 'avoid' }}
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {exp.jobTitle || 'Job Title'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {exp.company && exp.location
                              ? `${exp.company} • ${exp.location}`
                              : exp.company || ''}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {exp.startDate && exp.endDate
                            ? `${exp.startDate} - ${exp.endDate}`
                            : exp.startDate || ''}
                        </p>
                      </div>
                      {exp.description && (
                        <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                          {exp.description.split('\n').map((line, idx) => (
                            <p key={idx} className="mb-1">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Section */}
            {sections.find((s) => s.id === 'projects')?.isVisible &&
              resumeData.projects &&
              resumeData.projects.length > 0 && (
                <section>
                  <h2
                    className="text-sm font-semibold tracking-[0.2em] uppercase mb-3 text-gray-800 flex items-center gap-2"
                    style={{ color: formatting.accentColor }}
                  >
                    <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-amber-400 to-rose-400" />
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {resumeData.projects.map((proj) => (
                      <article
                        key={proj.id}
                        className="rounded-lg border border-gray-100 bg-white/80 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] break-inside-avoid"
                        style={{ pageBreakInside: 'avoid' }}
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {proj.url ? (
                                <a
                                  href={proj.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline"
                                >
                                  {proj.name || proj.title || 'Project Name'}
                                </a>
                              ) : (
                                proj.name || proj.title || 'Project Name'
                              )}
                            </h3>
                            {proj.company && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {proj.company}
                              </p>
                            )}
                          </div>
                          {proj.startDate && proj.endDate && (
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              {proj.startDate} - {proj.endDate}
                            </p>
                          )}
                        </div>
                        {proj.description && (
                          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                            {proj.description}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
          </div>

          {/* Sidebar column */}
          <div className="space-y-6">
            {/* Skills Section */}
            {sections.find((s) => s.id === 'skills')?.isVisible && (
              <section className="rounded-lg border border-gray-100 bg-slate-900/95 p-4 text-white shadow-[0_1px_6px_rgba(15,23,42,0.35)]">
                <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-200 mb-3">
                  Core Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/15"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Education Section */}
            {sections.find((s) => s.id === 'education')?.isVisible && (
              <section className="rounded-lg border border-gray-100 bg-white/90 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                <h2
                  className="text-xs font-semibold tracking-[0.25em] uppercase mb-3 text-gray-700"
                  style={{ color: formatting.accentColor }}
                >
                  Education
                </h2>
                <div className="space-y-3">
                  {resumeData.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="border-l-2 border-gray-200 pl-3 text-sm text-gray-800"
                    >
                      <p className="font-semibold">
                        {edu.degree || 'Degree'}
                      </p>
                      {edu.school && (
                        <p className="text-xs text-gray-500">{edu.school}</p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-500">
                        {edu.startDate && edu.endDate
                          ? `${edu.startDate} - ${edu.endDate}`
                          : edu.startDate || ''}
                      </p>
                      {edu.location && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {edu.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications Section */}
            {sections.find((s) => s.id === 'certifications')?.isVisible &&
              resumeData.certifications &&
              resumeData.certifications.length > 0 && (
                <section className="rounded-lg border border-gray-100 bg-white/90 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                  <h2
                    className="text-xs font-semibold tracking-[0.25em] uppercase mb-3 text-gray-700"
                    style={{ color: formatting.accentColor }}
                  >
                    Certifications
                  </h2>
                  <div className="space-y-3 text-sm text-gray-800">
                    {resumeData.certifications.map((cert) => (
                      <div key={cert.id} className="border-l-2 border-gray-200 pl-3">
                        <p className="font-semibold">
                          {cert.name || 'Certification Name'}
                        </p>
                        {cert.issuer && (
                          <p className="text-xs text-gray-500">
                            {cert.issuer}
                          </p>
                        )}
                        {cert.date && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {cert.date}
                          </p>
                        )}
                        {cert.credentialId && (
                          <p className="mt-0.5 text-[11px] text-gray-500">
                            ID: {cert.credentialId}
                          </p>
                        )}
                        {cert.expiryDate && (
                          <p className="mt-0.5 text-[11px] text-gray-500">
                            Expires: {cert.expiryDate}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* Languages Section */}
            {sections.find((s) => s.id === 'languages')?.isVisible &&
              resumeData.languages &&
              resumeData.languages.length > 0 && (
                <section className="rounded-lg border border-gray-100 bg-white/90 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                  <h2
                    className="text-xs font-semibold tracking-[0.25em] uppercase mb-3 text-gray-700"
                    style={{ color: formatting.accentColor }}
                  >
                    Languages
                  </h2>
                  <div className="space-y-2 text-sm text-gray-800">
                    {resumeData.languages.map((lang) => (
                      <div
                        key={lang.id}
                        className="flex items-center justify-between"
                      >
                        <span className="font-medium">{lang.language}</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* Volunteer Section */}
            {sections.find((s) => s.id === 'volunteer')?.isVisible &&
              resumeData.volunteer &&
              resumeData.volunteer.length > 0 && (
                <section className="rounded-lg border border-gray-100 bg-white/90 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                  <h2
                    className="text-xs font-semibold tracking-[0.25em] uppercase mb-3 text-gray-700"
                    style={{ color: formatting.accentColor }}
                  >
                    Volunteer
                  </h2>
                  <div className="space-y-3 text-sm text-gray-800">
                    {resumeData.volunteer.map((vol) => (
                      <div
                        key={vol.id}
                        className="border-l-2 border-gray-200 pl-3"
                      >
                        <p className="font-semibold">
                          {vol.organization || 'Organization'}
                        </p>
                        {vol.role && (
                          <p className="text-xs text-gray-500">{vol.role}</p>
                        )}
                        <p className="mt-0.5 text-xs text-gray-500">
                          {vol.startDate && vol.endDate
                            ? `${vol.startDate} - ${vol.endDate}`
                            : vol.startDate || ''}
                        </p>
                        {vol.description && (
                          <div className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                            {vol.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>
        </div>
      </div>
    );
  }

  // Photo Modern Gray Layout
  if (templateId === 'photo-modern-gray') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoModernGray component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoModernGray
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'system-ui, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#374151',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Elegant Layout
  if (templateId === 'photo-elegant') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoElegant component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoElegant
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Georgia, Times New Roman, serif',
          fontSize: 11,
          accentColor: formatting.accentColor || '#475569',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Photo Contemporary Layout
  if (templateId === 'photo-contemporary') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoContemporary component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoContemporary
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Inter, Segoe UI, system-ui, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#1e293b',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Minimalist Layout
  if (templateId === 'photo-minimalist') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoMinimalist component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoMinimalist
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Helvetica Neue, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#2d3748',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Photo Creative Layout
  if (templateId === 'photo-creative') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoCreative component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoCreative
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Poppins, Segoe UI, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#667eea',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Photo Professional Layout
  if (templateId === 'photo-professional') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoProfessional component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoProfessional
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Calibri, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#2c3e50',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Classic Layout
  if (templateId === 'photo-classic') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoClassic component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoClassic
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Times New Roman, Times, serif',
          fontSize: 11,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Modern Layout
  if (templateId === 'photo-modern-new') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoModern component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoModern
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'SF Pro Display, Helvetica Neue, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#007aff',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Bold Layout
  if (templateId === 'photo-bold') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoBold component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoBold
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Montserrat, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#ff6b35',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Executive Layout
  if (templateId === 'photo-executive') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoExecutive component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoExecutive
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Playfair Display, Times New Roman, serif',
          fontSize: 11,
          accentColor: formatting.accentColor || '#2d5016',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Photo Dynamic Layout
  if (templateId === 'photo-dynamic') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoDynamic component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoDynamic
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Roboto, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#6366f1',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Tech Layout
  if (templateId === 'photo-tech') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoTech component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoTech
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Inter, Segoe UI, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#06b6d4',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Artistic Layout
  if (templateId === 'photo-artistic') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoArtistic component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoArtistic
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Crimson Text, Georgia, serif',
          fontSize: 11,
          accentColor: formatting.accentColor || '#ec4899',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Photo Luxury Layout
  if (templateId === 'photo-luxury') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoLuxury component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoLuxury
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Playfair Display, Times New Roman, serif',
          fontSize: 11,
          accentColor: formatting.accentColor || '#d4af37',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Photo Corporate Layout
  if (templateId === 'photo-corporate') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoCorporate component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoCorporate
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Open Sans, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#1e40af',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Vibrant Layout
  if (templateId === 'photo-vibrant') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoVibrant component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoVibrant
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Poppins, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#ec4899',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Modern Clean Layout
  if (templateId === 'photo-modern-clean') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoModernClean component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoModernClean
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Inter, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#6366f1',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Photo Industrial Layout
  if (templateId === 'photo-industrial') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoIndustrial component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoIndustrial
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Roboto, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#6b7280',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Nature Layout
  if (templateId === 'photo-nature') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoNature component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoNature
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Merriweather, Georgia, serif',
          fontSize: 11,
          accentColor: formatting.accentColor || '#4caf50',
          lineHeight: formatting.lineSpacing || 1.6,
        }}
      />
    );
  }

  // Photo Retro Layout
  if (templateId === 'photo-retro') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoRetro component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoRetro
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Bebas Neue, Arial Black, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#ffc107',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Ocean Layout
  if (templateId === 'photo-ocean') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoOcean component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoOcean
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Montserrat, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#00bcd4',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Sunset Layout
  if (templateId === 'photo-sunset') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoSunset component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoSunset
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Lato, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#ff8e53',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Monochrome Layout
  if (templateId === 'photo-monochrome') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoMonochrome component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoMonochrome
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Helvetica Neue, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Soft Layout
  if (templateId === 'photo-soft') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoSoft component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoSoft
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Poppins, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#d1ecf1',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Geometric Layout
  if (templateId === 'photo-geometric') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoGeometric component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoGeometric
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Inter, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#764ba2',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Elegant Modern Layout
  if (templateId === 'photo-elegant-modern') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoElegantModern component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoElegantModern
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Playfair Display, Georgia, serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#e8d5b7',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Fresh Layout
  if (templateId === 'photo-fresh') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoFresh component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoFresh
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Nunito, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#4facfe',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Business Layout
  if (templateId === 'photo-business') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoBusiness component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoBusiness
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Roboto, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#1e3a5f',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Professional Sidebar Layout
  if (templateId === 'photo-professional-sidebar') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoProfessionalSidebar component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoProfessionalSidebar
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Open Sans, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#1a365d',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Professional Top Layout
  if (templateId === 'photo-professional-top') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoProfessionalTop component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoProfessionalTop
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Source Sans Pro, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#1e40af',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Professional BW Layout
  if (templateId === 'photo-professional-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoProfessionalBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoProfessionalBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Calibri, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Professional Compact Layout
  if (templateId === 'photo-professional-compact') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoProfessionalCompact component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoProfessionalCompact
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Segoe UI, Arial, sans-serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#2563eb',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Photo Professional Classic BW Layout
  if (templateId === 'photo-professional-classic-bw') {
    // Convert ResumeEditorPage format to ResumeContext format for PhotoProfessionalClassicBW component
    const contextData = convertEditorToContext(resumeData, templateId, formatting, sections as ContextResumeSection[]);
    
    return (
      <PhotoProfessionalClassicBW
        resumeData={{
          personalInfo: contextData.personalInfo,
          sections: contextData.sections,
        }}
        settings={{
          fontFamily: formatting.font || 'Times New Roman, Georgia, serif',
          fontSize: 10,
          accentColor: formatting.accentColor || '#000000',
          lineHeight: formatting.lineSpacing || 1.5,
        }}
      />
    );
  }

  // Classic Layout (existing centered layout)
  if (templateId === 'classic') {
    return (
      <>
        {/* Header Section */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <div
            className="mb-6 pb-4 border-b-2"
            style={{ borderColor: formatting.accentColor }}
          >
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: formatting.accentColor }}
            >
              {resumeData.personalInfo.fullName}
            </h1>
            <div className="text-gray-600 space-y-1">
              <p>{resumeData.personalInfo.jobTitle}</p>
              <p>{resumeData.personalInfo.email} • {resumeData.personalInfo.phone}</p>
              <p>{resumeData.personalInfo.location}</p>
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {sections.find((s) => s.id === 'profile')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-2 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Professional Summary
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {resumeData.summary}
            </p>
          </div>
        )}

        {/* Experience Section */}
        {sections.find((s) => s.id === 'experience')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{exp.jobTitle || "Job Title"}</h3>
                    <span className="text-gray-600 text-sm">
                      {exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : 
                       exp.startDate ? exp.startDate : ""}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {exp.company && exp.location ? `${exp.company} • ${exp.location}` :
                     exp.company ? exp.company : ""}
                  </p>
                  {exp.description && (
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {exp.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-1">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {sections.find((s) => s.id === 'education')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree || "Degree"} {edu.school && `at ${edu.school}`}
                    </h3>
                    <span className="text-gray-600 text-sm">
                      {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : 
                       edu.startDate ? edu.startDate : ""}
                    </span>
                  </div>
                  {edu.location && (
                    <p className="text-gray-600 text-sm">{edu.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {sections.find((s) => s.id === 'skills')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${formatting.accentColor}20`,
                    color: formatting.accentColor,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {sections.find((s) => s.id === 'certifications')?.isVisible && resumeData.certifications && resumeData.certifications.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Certifications
            </h2>
            <div className="space-y-3">
              {resumeData.certifications.map((cert) => (
                <div key={cert.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{cert.name || "Certification Name"}</h3>
                    {cert.date && (
                      <span className="text-gray-600 text-sm">{cert.date}</span>
                    )}
                  </div>
                  {cert.issuer && (
                    <p className="text-gray-600 text-sm mb-1">{cert.issuer}</p>
                  )}
                  {cert.credentialId && (
                    <p className="text-gray-500 text-xs">Credential ID: {cert.credentialId}</p>
                  )}
                  {cert.expiryDate && (
                    <p className="text-gray-500 text-xs">Expires: {cert.expiryDate}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {sections.find((s) => s.id === 'projects')?.isVisible && resumeData.projects && resumeData.projects.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Projects
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {proj.url ? (
                        <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {proj.name || "Project Name"}
                        </a>
                      ) : (
                        proj.name || "Project Name"
                      )}
                    </h3>
                    {proj.startDate && proj.endDate && (
                      <span className="text-gray-600 text-sm">{proj.startDate} - {proj.endDate}</span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-gray-700 mb-2 whitespace-pre-wrap">{proj.description}</p>
                  )}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proj.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages Section */}
        {sections.find((s) => s.id === 'languages')?.isVisible && resumeData.languages && resumeData.languages.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Languages
            </h2>
            <div className="space-y-2">
              {resumeData.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">{lang.language}</span>
                  <span className="text-gray-600 text-sm capitalize">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteer Section */}
        {sections.find((s) => s.id === 'volunteer')?.isVisible && resumeData.volunteer && resumeData.volunteer.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Volunteer Work
            </h2>
            <div className="space-y-4">
              {resumeData.volunteer.map((vol) => (
                <div key={vol.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{vol.organization || "Organization"}</h3>
                    <span className="text-gray-600 text-sm">
                      {vol.startDate && vol.endDate ? `${vol.startDate} - ${vol.endDate}` : 
                       vol.startDate ? vol.startDate : ""}
                    </span>
                  </div>
                  {vol.role && (
                    <p className="text-gray-600 text-sm mb-2">{vol.role}</p>
                  )}
                  {vol.description && (
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {vol.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-1">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // Modern Layout (sidebar layout)
  return (
    <div className="grid grid-cols-[1fr_2fr] min-h-[800px]">
      {/* Left Column - Sidebar (Dark Background) */}
      <div className="bg-slate-800 text-white p-6">
        {/* Profile Photo */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <div className="mb-6">
            {resumeData.profilePicture ? (
              <img
                src={resumeData.profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-2 border-white/30"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/10 mx-auto mb-6 flex items-center justify-center border-2 border-white/30">
                <span className="text-white/50 text-sm">
                  {resumeData.personalInfo.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'Photo'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Contact Info */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2 text-white">
              {resumeData.personalInfo.fullName}
            </h1>
            <p className="text-white/80 mb-4">{resumeData.personalInfo.jobTitle}</p>
            <div className="space-y-2 text-sm text-white/70">
              <p>{resumeData.personalInfo.email}</p>
              <p>{resumeData.personalInfo.phone}</p>
              <p>{resumeData.personalInfo.location}</p>
            </div>
          </div>
        )}

        {/* Core Skills */}
        {sections.find((s) => s.id === 'skills')?.isVisible && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide text-white border-b border-white/20 pb-2 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
              Core Skills
            </h2>
            <div className="flex flex-col gap-2">
              {resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 text-white border border-white/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Main Content (White Background) */}
      <div className="bg-white p-6">
        {/* Professional Summary */}
        {sections.find((s) => s.id === 'profile')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-3 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Professional Summary
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {resumeData.summary}
            </p>
          </div>
        )}

        {/* Experience Section */}
        {sections.find((s) => s.id === 'experience')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{exp.jobTitle || "Job Title"}</h3>
                    <span className="text-gray-600 text-sm">
                      {exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : 
                       exp.startDate ? exp.startDate : ""}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {exp.company && exp.location ? `${exp.company} • ${exp.location}` :
                     exp.company ? exp.company : ""}
                  </p>
                  {exp.description && (
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {exp.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-1">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {sections.find((s) => s.id === 'education')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree || "Degree"} {edu.school && `at ${edu.school}`}
                    </h3>
                    <span className="text-gray-600 text-sm">
                      {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : 
                       edu.startDate ? edu.startDate : ""}
                    </span>
                  </div>
                  {edu.location && (
                    <p className="text-gray-600 text-sm">{edu.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {sections.find((s) => s.id === 'certifications')?.isVisible && resumeData.certifications && resumeData.certifications.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Certifications
            </h2>
            <div className="space-y-3">
              {resumeData.certifications.map((cert) => (
                <div key={cert.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{cert.name || "Certification Name"}</h3>
                    {cert.date && (
                      <span className="text-gray-600 text-sm">{cert.date}</span>
                    )}
                  </div>
                  {cert.issuer && (
                    <p className="text-gray-600 text-sm mb-1">{cert.issuer}</p>
                  )}
                  {cert.credentialId && (
                    <p className="text-gray-500 text-xs">Credential ID: {cert.credentialId}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {sections.find((s) => s.id === 'projects')?.isVisible && resumeData.projects && resumeData.projects.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Projects
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {proj.url ? (
                        <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {proj.name || "Project Name"}
                        </a>
                      ) : (
                        proj.name || "Project Name"
                      )}
                    </h3>
                    {proj.startDate && proj.endDate && (
                      <span className="text-gray-600 text-sm">{proj.startDate} - {proj.endDate}</span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-gray-700 mb-2 whitespace-pre-wrap">{proj.description}</p>
                  )}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proj.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages Section */}
        {sections.find((s) => s.id === 'languages')?.isVisible && resumeData.languages && resumeData.languages.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Languages
            </h2>
            <div className="space-y-2">
              {resumeData.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">{lang.language}</span>
                  <span className="text-gray-600 text-sm capitalize">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteer Section */}
        {sections.find((s) => s.id === 'volunteer')?.isVisible && resumeData.volunteer && resumeData.volunteer.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Volunteer Work
            </h2>
            <div className="space-y-4">
              {resumeData.volunteer.map((vol) => (
                <div key={vol.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{vol.organization || "Organization"}</h3>
                    <span className="text-gray-600 text-sm">
                      {vol.startDate && vol.endDate ? `${vol.startDate} - ${vol.endDate}` : 
                       vol.startDate ? vol.startDate : ""}
                    </span>
                  </div>
                  {vol.role && (
                    <p className="text-gray-600 text-sm mb-2">{vol.role}</p>
                  )}
                  {vol.description && (
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {vol.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-1">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumeEditorPage() {
  return (
    <ResumeProvider>
      <ResumeEditorPageContent />
    </ResumeProvider>
  );
}

function ResumeEditorPageContent() {
  // Mobile detection
  const isMobile = useIsMobile();
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('edit');
  
  // ResumeContext - Use it to sync template changes with ResumePreview
  const { dispatch: contextDispatch } = useResume();
  
  // Onboarding tour
  useEditorTour();
  
  // Ref for PDF printing
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: resumePreviewRef,
    documentTitle: 'My_Resume',
  });

  // New feature handlers
  const handleSave = () => {
    setShowSaveModal(true);
  };

  const handleSaveConfirm = (title: string) => {
    try {
      const contextData = convertEditorToContext(resumeData, templateId, formatting, sections);
      contextData.atsScore = atsAnalysis.score; // Include ATS score
      const resumeId = saveResume({ ...contextData, title }, title);
      setCurrentResumeId(resumeId);
      
      // Save analytics snapshot
      const analytics = calculateResumeAnalytics(resumeData);
      saveAnalyticsSnapshot(resumeId, analytics);
      
      setShowSaveModal(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume. Please try again.');
    }
  };

  const handleLoadResume = (savedResume: SavedResume) => {
    const editorData = convertContextToEditor(savedResume.data);
    setResumeData(editorData);
    setCurrentResumeId(savedResume.id);
    
    // Update template and formatting
    const templateId = savedResume.data.settings.templateId === 'modern' ? 2 : 1;
    setTemplateId(templateId);
    setFormatting({
      font: savedResume.data.settings.fontFamily || 'Inter',
      lineSpacing: savedResume.data.settings.lineHeight || 1.5,
      accentColor: savedResume.data.settings.accentColor || '#3B82F6',
    });
    
    setShowLibrary(false);
  };

  const handleRestoreVersion = (version: ResumeVersion) => {
    // Create backup before restoring
    try {
      const { saveVersion } = require('../lib/resumeVersionHistory');
      const contextData = convertEditorToContext(resumeData, templateId, formatting, sections);
      saveVersion(version.resumeId, contextData, {
        createdBy: 'restore-backup',
        changeSummary: 'Backup before restoring version',
      });
    } catch (error) {
      console.error('Error creating backup:', error);
    }

    // Restore the version
    const editorData = convertContextToEditor(version.data);
    setResumeData(editorData);
    
    // Update template and formatting
    const restoredTemplateId = version.data.settings.templateId === 'modern' ? 2 : 1;
    setTemplateId(restoredTemplateId);
    setFormatting({
      font: version.data.settings.fontFamily || 'Inter',
      lineSpacing: version.data.settings.lineHeight || 1.5,
      accentColor: version.data.settings.accentColor || '#3B82F6',
    });
    
    // Save the restored version
    saveResume(version.data);
    setCurrentResumeId(version.resumeId);
    setShowVersionHistory(false);
  };

  // State Management
  const [templateId, setTemplateId] = useState<number | string | null>(2); // Default to template ID 2 (Tech Modern)
  const [formatting, setFormatting] = useState<FormattingValues>({
    font: 'Inter',
    lineSpacing: 1.5,
    accentColor: '#3B82F6', // Blue
  });
  const [sections, setSections] = useState<Section[]>([
    { id: 'heading', label: 'Heading', isVisible: true },
    { id: 'profile', label: 'Profile', isVisible: true },
    { id: 'experience', label: 'Experience', isVisible: true },
    { id: 'education', label: 'Education', isVisible: true },
    { id: 'skills', label: 'Skills', isVisible: true },
    { id: 'certifications', label: 'Certifications', isVisible: false },
    { id: 'projects', label: 'Projects', isVisible: false },
    { id: 'languages', label: 'Languages', isVisible: false },
    { id: 'volunteer', label: 'Volunteer Work', isVisible: false },
    // Additional optional sections for more flexibility
    { id: 'achievements', label: 'Achievements & Awards', isVisible: false },
    { id: 'publications', label: 'Publications', isVisible: false },
    { id: 'presentations', label: 'Presentations & Speaking', isVisible: false },
    { id: 'courses', label: 'Courses & Training', isVisible: false },
    { id: 'techStack', label: 'Technical Stack & Tools', isVisible: false },
    { id: 'portfolio', label: 'Portfolio / Featured Work', isVisible: false },
    { id: 'openSource', label: 'Open Source Contributions', isVisible: false },
    { id: 'leadership', label: 'Leadership & Activities', isVisible: false },
    { id: 'interests', label: 'Interests & Hobbies', isVisible: false },
    { id: 'patents', label: 'Patents', isVisible: false },
    { id: 'research', label: 'Research Experience', isVisible: false },
    { id: 'teaching', label: 'Teaching & Mentoring', isVisible: false },
    { id: 'references', label: 'References & Testimonials', isVisible: false },
  ]);
  const [resumeData, setResumeData] = useState(DEFAULT_RESUME_DATA);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [loadingExperienceId, setLoadingExperienceId] = useState<string | null>(null);
  
  // New features state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);

  // Calculate ATS score whenever resumeData or templateId changes
  const atsAnalysis: ATSAnalysis = useMemo(() => {
    const templateString = getTemplateString(templateId);
    return calculateATSScore(resumeData, templateString);
  }, [resumeData, templateId]);

  // Load current resume ID on mount
  useEffect(() => {
    setCurrentResumeId(getCurrentResumeId());
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      // First try to load from resume storage
      const currentId = getCurrentResumeId();
      if (currentId) {
        const loadedResume = loadResume(currentId);
        if (loadedResume) {
          // Convert context format to editor format
          const editorData = convertContextToEditor(loadedResume);
          setResumeData(editorData);
          // Update template and formatting from loaded resume
          const templateId = loadedResume.settings.templateId === 'modern' ? 2 : 1;
          setTemplateId(templateId);
          setFormatting({
            font: loadedResume.settings.fontFamily || 'Inter',
            lineSpacing: loadedResume.settings.lineHeight || 1.5,
            accentColor: loadedResume.settings.accentColor || '#3B82F6',
          });
          return;
        }
      }
      
      // Fallback to legacy localStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setResumeData(parsedData);
      }
    } catch (error) {
      console.error('Failed to load resume data from localStorage:', error);
      // If there's an error parsing, fall back to default data
    }
  }, []);

  // Auto-save data to localStorage whenever resumeData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
      
      // Also auto-save to new storage system if resume has been saved before
      if (currentResumeId) {
        const contextData = convertEditorToContext(resumeData, templateId, formatting, sections);
        contextData.atsScore = atsAnalysis.score; // Include ATS score
        saveResume({ ...contextData, id: currentResumeId });
        
        // Save analytics snapshot periodically (every 5 minutes of changes)
        const analytics = calculateResumeAnalytics(resumeData);
        saveAnalyticsSnapshot(currentResumeId, analytics);
      }
    } catch (error) {
      console.error('Failed to save resume data to localStorage:', error);
    }
  }, [resumeData, templateId, formatting, sections, currentResumeId]);

  // Handler Functions
  const handleContentChange = (path: string, value: string) => {
    setResumeData((prev) => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };
  const handleFormattingChange = (key: string, value: string | number) => {
    setFormatting((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSectionToggle = (id: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, isVisible: !section.isVisible } : section
      )
    );
  };

  const handleTemplateChange = (id: number | string) => {
    // Update local state (for ResumeEditorPage's own use)
    setTemplateId(id);
    
    // Dispatch to ResumeContext so ResumePreview can see it
    contextDispatch({
      type: 'UPDATE_SETTINGS',
      payload: { templateId: String(id) },
    });
  };

  const handleAIAction = (action: string) => {
    // ATS score is now calculated automatically based on resume data
    if (action === 'ats') {
      // Could trigger additional optimization logic here if needed
    }
  };

  const handleAIGenerateSummary = async () => {
    // Check if summary and jobTitle exist
    if (!resumeData.summary || resumeData.summary.trim() === '') {
      alert('Please enter a summary first.');
      return;
    }

    if (!resumeData.personalInfo.jobTitle || resumeData.personalInfo.jobTitle.trim() === '') {
      alert('Please enter a job title first.');
      return;
    }

    setIsGeneratingAI(true);

    try {
      const response = await fetch('/api/enhance-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: resumeData.summary,
          jobTitle: resumeData.personalInfo.jobTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance summary');
      }

      const data = await response.json();
      
      // Update the summary with the enhanced version
      setResumeData((prev) => ({
        ...prev,
        summary: data.enhancedSummary,
      }));
    } catch (error) {
      console.error('Error enhancing summary:', error);
      alert(error instanceof Error ? error.message : 'Failed to enhance summary. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAIEnhanceExperience = async (id: string, currentDescription: string) => {
    // Check if description exists
    if (!currentDescription || currentDescription.trim() === '') {
      alert('Please enter a description first.');
      return;
    }

    // Check if jobTitle exists (use the experience item's jobTitle or fallback to personalInfo.jobTitle)
    const experienceItem = resumeData.experience.find((exp) => exp.id === id);
    const jobTitle = experienceItem?.jobTitle || resumeData.personalInfo.jobTitle;

    if (!jobTitle || jobTitle.trim() === '') {
      alert('Please enter a job title for this experience entry or in your personal info.');
      return;
    }

    setLoadingExperienceId(id);

    try {
      const response = await fetch('/api/enhance-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: currentDescription,
          jobTitle: jobTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance experience description');
      }

      const data = await response.json();
      
      // Update the specific experience item's description
      setResumeData((prev) => ({
        ...prev,
        experience: prev.experience.map((exp) =>
          exp.id === id ? { ...exp, description: data.enhancedText } : exp
        ),
      }));
    } catch (error) {
      console.error('Error enhancing experience:', error);
      alert(error instanceof Error ? error.message : 'Failed to enhance experience description. Please try again.');
    } finally {
      setLoadingExperienceId(null);
    }
  };

  // Experience Handlers
  const handleAddExperience = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: newId,
          jobTitle: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: ""
        }
      ]
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id)
    }));
  };

  const handleUpdateExperience = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  // Education Handlers
  const handleAddEducation = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: newId,
          school: "",
          degree: "",
          location: "",
          startDate: "",
          endDate: ""
        }
      ]
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id)
    }));
  };

  const handleUpdateEducation = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Skills Handlers
  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !resumeData.skills.includes(trimmedSkill)) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill]
      }));
    }
  };

  const handleRemoveSkill = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Certifications Handlers
  const handleAddCertification = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        {
          id: newId,
          name: "",
          issuer: "",
          date: "",
          expiryDate: "",
          credentialId: "",
          credentialUrl: "",
        }
      ]
    }));
    // Make certifications section visible if not already
    setSections((prev) => {
      if (!prev.find(s => s.id === 'certifications')) {
        return [...prev, { id: 'certifications', label: 'Certifications', isVisible: true }];
      }
      return prev.map(s => s.id === 'certifications' ? { ...s, isVisible: true } : s);
    });
  };

  const handleRemoveCertification = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((cert) => cert.id !== id)
    }));
  };

  const handleUpdateCertification = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  // Projects Handlers
  const handleAddProject = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          id: newId,
          title: "",
          role: "",
          company: "",
          startDate: "",
          endDate: "",
          description: "",
          url: "",
        }
      ]
    }));
    // Make projects section visible if not already
    setSections((prev) => {
      if (!prev.find(s => s.id === 'projects')) {
        return [...prev, { id: 'projects', label: 'Projects', isVisible: true }];
      }
      return prev.map(s => s.id === 'projects' ? { ...s, isVisible: true } : s);
    });
  };

  const handleRemoveProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((proj) => proj.id !== id)
    }));
  };

  const handleUpdateProject = (id: string, field: string, value: string | string[]) => {
    setResumeData((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
  };

  // Languages Handlers
  const handleAddLanguage = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      languages: [
        ...(prev.languages || []),
        {
          id: newId,
          language: "",
          proficiency: 'professional' as const,
        }
      ]
    }));
    // Make languages section visible if not already
    setSections((prev) => {
      if (!prev.find(s => s.id === 'languages')) {
        return [...prev, { id: 'languages', label: 'Languages', isVisible: true }];
      }
      return prev.map(s => s.id === 'languages' ? { ...s, isVisible: true } : s);
    });
  };

  const handleRemoveLanguage = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter((lang) => lang.id !== id)
    }));
  };

  const handleUpdateLanguage = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: (prev.languages || []).map((lang) =>
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  // Volunteer Handlers
  const handleAddVolunteer = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      volunteer: [
        ...(prev.volunteer || []),
        {
          id: newId,
          organization: "",
          role: "",
          startDate: "",
          endDate: "",
          description: "",
        }
      ]
    }));
    // Make volunteer section visible if not already
    setSections((prev) => {
      if (!prev.find(s => s.id === 'volunteer')) {
        return [...prev, { id: 'volunteer', label: 'Volunteer Work', isVisible: true }];
      }
      return prev.map(s => s.id === 'volunteer' ? { ...s, isVisible: true } : s);
    });
  };

  const handleRemoveVolunteer = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      volunteer: (prev.volunteer || []).filter((vol) => vol.id !== id)
    }));
  };

  const handleUpdateVolunteer = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      volunteer: (prev.volunteer || []).map((vol) =>
        vol.id === id ? { ...vol, [field]: value } : vol
      )
    }));
  };

  // Custom Sections Handlers
  const handleAddCustomSection = (title: string) => {
    const newId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setResumeData((prev) => ({
      ...prev,
      customSections: [
        ...(prev.customSections || []),
        {
          id: newId,
          title: title,
          items: [],
        }
      ]
    }));
    // Also add to sections array for visibility toggle
    setSections((prev) => [
      ...prev,
      {
        id: newId,
        label: title,
        isVisible: true,
      }
    ]);
  };

  const handleRemoveCustomSection = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter((cs) => cs.id !== id)
    }));
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateCustomSection = (id: string, title: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((cs) =>
        cs.id === id ? { ...cs, title } : cs
      )
    }));
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label: title } : s))
    );
  };

  const handleAddCustomSectionItem = (sectionId: string) => {
    const newItemId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((cs) =>
        cs.id === sectionId
          ? {
              ...cs,
              items: [
                ...cs.items,
                {
                  id: newItemId,
                  title: "",
                  subtitle: "",
                  date: "",
                  description: "",
                }
              ]
            }
          : cs
      )
    }));
  };

  const handleRemoveCustomSectionItem = (sectionId: string, itemId: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((cs) =>
        cs.id === sectionId
          ? {
              ...cs,
              items: cs.items.filter((item) => item.id !== itemId)
            }
          : cs
      )
    }));
  };

  const handleUpdateCustomSectionItem = (sectionId: string, itemId: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((cs) =>
        cs.id === sectionId
          ? {
              ...cs,
              items: cs.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              )
            }
          : cs
      )
    }));
  };

  // Profile Picture Handlers
  const handleProfilePictureChange = (file: File) => {
    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      alert('File size exceeds 2MB limit. Please choose a smaller image.');
      return;
    }

    // Validate file type (JPEG/PNG)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPEG or PNG image.');
      return;
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setResumeData((prev) => ({
        ...prev,
        profilePicture: base64String
      }));
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setResumeData((prev) => {
      const { profilePicture, ...rest } = prev;
      return rest;
    });
  };

  // Drag and Drop Handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Determine which list we're sorting based on ID structure
    // IDs are formatted as "experience-{id}" or "education-{id}"
    const activeId = String(active.id);
    const overId = String(over.id);

    // Check if it's an experience item
    if (activeId.startsWith('experience-') && overId.startsWith('experience-')) {
      const activeIndex = resumeData.experience.findIndex(
        (exp) => `experience-${exp.id}` === activeId
      );
      const overIndex = resumeData.experience.findIndex(
        (exp) => `experience-${exp.id}` === overId
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        setResumeData((prev) => ({
          ...prev,
          experience: arrayMove(prev.experience, activeIndex, overIndex),
        }));
      }
    }
    // Check if it's an education item
    else if (activeId.startsWith('education-') && overId.startsWith('education-')) {
      const activeIndex = resumeData.education.findIndex(
        (edu) => `education-${edu.id}` === activeId
      );
      const overIndex = resumeData.education.findIndex(
        (edu) => `education-${edu.id}` === overId
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        setResumeData((prev) => ({
          ...prev,
          education: arrayMove(prev.education, activeIndex, overIndex),
        }));
      }
    }
  };

  // Prepare data object for ResumeControlPanel
  const panelData: ResumeControlPanelData = {
    currentTemplateId: templateId,
    formatting,
    sections,
    atsScore: atsAnalysis.score,
    atsAnalysis, // Pass the full analysis object
  };

  // Calculate line-height from lineSpacing
  const lineHeight = formatting.lineSpacing;

  // Get template string from template ID
  const templateString = getTemplateString(templateId);

  return (
    <>
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          
          /* Ensure resume container takes full viewport and removes background */
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          /* Ensure the main container doesn't limit print area */
          html, body {
            height: auto;
            overflow: visible;
          }
        }
      `}</style>
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50">
        {/* Page Header with Toolbar - Hidden on mobile */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 print:hidden hidden md:flex">
          <h1 className="text-xl font-semibold text-gray-900">Resume Editor</h1>
          <div className="flex items-center gap-2">
            {/* Import Button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>

            {/* My Resumes Button */}
            <button
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>My Resumes</span>
            </button>

            {/* Version History Button */}
            {currentResumeId && (
              <button
                onClick={() => setShowVersionHistory(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
                title="View version history"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                saveStatus === 'saved'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              {saveStatus === 'saved' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{currentResumeId ? 'Update' : 'Save'}</span>
                </>
              )}
            </button>

            {/* Share/Collaborate Button */}
            {currentResumeId && (
              <button
                onClick={() => setShowCollaborationModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            )}

            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Mobile Tab Bar - Only visible on mobile */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 flex shrink-0 print:hidden">
            <button
              onClick={() => setMobileViewMode('edit')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                mobileViewMode === 'edit'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setMobileViewMode('preview')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                mobileViewMode === 'preview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
        )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Control Panel - Hidden on mobile when in preview mode */}
        <div className={`${isMobile && mobileViewMode === 'preview' ? 'hidden' : ''} w-full md:w-96 shrink-0 border-r border-gray-200 bg-white print:hidden overflow-y-auto ${isMobile ? 'pb-20' : ''}`}>
          <ResumeControlPanel
            data={panelData}
            resumeData={resumeData}
            onTemplateChange={handleTemplateChange}
            onFormattingChange={handleFormattingChange}
            onSectionToggle={handleSectionToggle}
            onAIAction={handleAIAction}
            onAIGenerate={handleAIGenerateSummary}
            isGeneratingAI={isGeneratingAI}
            onContentChange={handleContentChange}
            onAddExperience={handleAddExperience}
            onRemoveExperience={handleRemoveExperience}
            onUpdateExperience={handleUpdateExperience}
            onAddEducation={handleAddEducation}
            onRemoveEducation={handleRemoveEducation}
            onUpdateEducation={handleUpdateEducation}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            onProfilePictureChange={handleProfilePictureChange}
            onRemoveProfilePicture={handleRemoveProfilePicture}
            onAIEnhanceExperience={handleAIEnhanceExperience}
            loadingExperienceId={loadingExperienceId}
            onDragEnd={handleDragEnd}
            onAddCertification={handleAddCertification}
            onRemoveCertification={handleRemoveCertification}
            onUpdateCertification={handleUpdateCertification}
            onAddProject={handleAddProject}
            onRemoveProject={handleRemoveProject}
            onUpdateProject={handleUpdateProject}
            onAddLanguage={handleAddLanguage}
            onRemoveLanguage={handleRemoveLanguage}
            onUpdateLanguage={handleUpdateLanguage}
            onAddVolunteer={handleAddVolunteer}
            onRemoveVolunteer={handleRemoveVolunteer}
            onUpdateVolunteer={handleUpdateVolunteer}
            onAddCustomSection={handleAddCustomSection}
            onRemoveCustomSection={handleRemoveCustomSection}
            onUpdateCustomSection={handleUpdateCustomSection}
            onAddCustomSectionItem={handleAddCustomSectionItem}
            onRemoveCustomSectionItem={handleRemoveCustomSectionItem}
            onUpdateCustomSectionItem={handleUpdateCustomSectionItem}
            resumeId={currentResumeId || undefined}
          />
        </div>

        {/* Right Side - Live Preview - Hidden on mobile when in edit mode */}
        <div className={`${isMobile && mobileViewMode === 'edit' ? 'hidden' : ''} flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:bg-white print:overflow-visible ${isMobile ? 'pb-20' : ''}`}>
          <div className="max-w-4xl mx-auto">
            {/* Resume Preview Section */}
            <div
              ref={resumePreviewRef}
              className={`relative bg-white shadow-xl rounded-lg mx-auto print:shadow-none print:rounded-none print:m-0 print:max-w-full print:w-full ${
                templateString === 'modern' ||
                templateString === 'creative-classic' ||
                templateString === 'executive-photo' ||
                templateString === 'portrait-photo' ||
                templateString === 'creative'
                  ? 'overflow-hidden p-8'
                  : 'p-8'
              }`}
              style={{
                fontFamily: formatting.font,
                lineHeight: lineHeight,
                minHeight: '297mm',
                width: '210mm',
                maxWidth: '210mm',
              }}
            >
              {/* Visual Page Break Marker - Only visible in preview, hidden in print */}
              <div 
                className="absolute left-0 right-0 print:hidden pointer-events-none z-10"
                style={{
                  top: '297mm',
                  borderTop: '2px dashed rgba(239, 68, 68, 0.3)',
                }}
              >
                <span 
                  className="absolute left-2 text-xs text-red-500 opacity-70 bg-white px-2"
                  style={{ top: '-8px' }}
                >
                  End of Page 1
                </span>
              </div>
              
              <ResumePreviewSection
                resumeData={resumeData}
                templateId={templateString}
                sections={sections}
                formatting={formatting}
                lineHeight={lineHeight}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Bar - Only visible on mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 print:hidden md:hidden">
          <div className="flex items-center justify-around px-4 py-3">
            <button
              onClick={handleSave}
              className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                saveStatus === 'saved'
                  ? 'text-green-700'
                  : 'text-slate-600'
              }`}
            >
              <Save className="w-5 h-5" />
              <span>{currentResumeId ? 'Update' : 'Save'}</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            {currentResumeId && (
              <button
                onClick={() => setShowLibrary(true)}
                className="flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium text-slate-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>My Resumes</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Save Modal */}
      <SaveResumeModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveConfirm}
        currentResume={convertEditorToContext(resumeData, templateId, formatting, sections)}
        isUpdating={!!currentResumeId}
      />

      {/* Resume Library */}
      <ResumeLibrary
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onLoad={handleLoadResume}
        currentResumeId={currentResumeId}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resume={convertEditorToContext(resumeData, templateId, formatting, sections)}
      />

      {/* Version History Modal */}
      {currentResumeId && (
        <VersionHistoryModal
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          resumeId={currentResumeId}
          currentResume={convertEditorToContext(resumeData, templateId, formatting, sections)}
          onRestore={handleRestoreVersion}
        />
      )}

      {/* Import Resume Modal */}
      <ImportResumeModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(importedData) => {
          // Merge imported data with current resume
          setResumeData(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              ...importedData.personalInfo,
              // Only update if imported data has values
              fullName: importedData.personalInfo.fullName || prev.personalInfo.fullName,
              email: importedData.personalInfo.email || prev.personalInfo.email,
              phone: importedData.personalInfo.phone || prev.personalInfo.phone,
              location: importedData.personalInfo.location || prev.personalInfo.location,
            },
            summary: importedData.summary || prev.summary,
            experience: importedData.experience.length > 0 ? importedData.experience : prev.experience,
            education: importedData.education.length > 0 ? importedData.education : prev.education,
            skills: importedData.skills.length > 0 ? [...new Set([...prev.skills, ...importedData.skills])] : prev.skills,
          }));
        }}
      />

      {/* Collaboration Modal */}
      {currentResumeId && (
        <CollaborationModal
          isOpen={showCollaborationModal}
          onClose={() => setShowCollaborationModal(false)}
          resumeId={currentResumeId}
          resumeTitle={resumeData.personalInfo.fullName || 'Untitled Resume'}
        />
      )}
    </div>
    </>
  );
}

