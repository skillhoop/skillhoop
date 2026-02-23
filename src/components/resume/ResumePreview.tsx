import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Edit, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { ResumeSection, SectionItem, PersonalInfo, FormattingSettings } from '../../types/resume';
import { getTemplateById } from '../../lib/resumeTemplates';
import PhotoModernGray from './templates/PhotoModernGray';
import PhotoElegant from './templates/PhotoElegant';
import PhotoContemporary from './templates/PhotoContemporary';
import PhotoMinimalist from './templates/PhotoMinimalist';
import PhotoCreative from './templates/PhotoCreative';
import PhotoProfessional from './templates/PhotoProfessional';
import PhotoClassic from './templates/PhotoClassic';
import PhotoModern from './templates/PhotoModern';
import PhotoBold from './templates/PhotoBold';
import PhotoExecutive from './templates/PhotoExecutive';
import PhotoDynamic from './templates/PhotoDynamic';
import PhotoTech from './templates/PhotoTech';
import PhotoArtistic from './templates/PhotoArtistic';
import PhotoLuxury from './templates/PhotoLuxury';
import PhotoCorporate from './templates/PhotoCorporate';
import PhotoVibrant from './templates/PhotoVibrant';
import PhotoModernClean from './templates/PhotoModernClean';
import PhotoIndustrial from './templates/PhotoIndustrial';
import PhotoNature from './templates/PhotoNature';
import PhotoRetro from './templates/PhotoRetro';
import PhotoOcean from './templates/PhotoOcean';
import PhotoSunset from './templates/PhotoSunset';
import PhotoMonochrome from './templates/PhotoMonochrome';
import PhotoSoft from './templates/PhotoSoft';
import PhotoGeometric from './templates/PhotoGeometric';
import PhotoElegantModern from './templates/PhotoElegantModern';
import PhotoFresh from './templates/PhotoFresh';
import PhotoBusiness from './templates/PhotoBusiness';
import PhotoProfessionalSidebar from './templates/PhotoProfessionalSidebar';
import PhotoProfessionalTop from './templates/PhotoProfessionalTop';
import PhotoProfessionalBW from './templates/PhotoProfessionalBW';
import PhotoProfessionalCompact from './templates/PhotoProfessionalCompact';
import PhotoProfessionalClassicBW from './templates/PhotoProfessionalClassicBW';
import ClassicTimeline from './templates/ClassicTimeline';
import ClassicFormal from './templates/ClassicFormal';
import ClassicProfessionalBW from './templates/ClassicProfessionalBW';
import ClassicExecutiveBW from './templates/ClassicExecutiveBW';
import ClassicModernBW from './templates/ClassicModernBW';
import ClassicTraditionalBW from './templates/ClassicTraditionalBW';
import ClassicStructuredBW from './templates/ClassicStructuredBW';
import ClassicCompactBW from './templates/ClassicCompactBW';
import ClassicElegantBW from './templates/ClassicElegantBW';
import ClassicMinimalBW from './templates/ClassicMinimalBW';
import ClassicRefinedBW from './templates/ClassicRefinedBW';
import ClassicCorporateBW from './templates/ClassicCorporateBW';
import ClassicSidebarBW from './templates/ClassicSidebarBW';
import ClassicCenteredBW from './templates/ClassicCenteredBW';
import ClassicTimelineBW from './templates/ClassicTimelineBW';
import ClassicHeaderBarBW from './templates/ClassicHeaderBarBW';

// SectionWrapper component for clickable sections with edit badge
function SectionWrapper({ sectionId, children }: { sectionId: string; children: React.ReactNode }) {
  const { dispatch } = useResume();

  const handleClick = () => {
    dispatch({ type: 'SET_FOCUSED_SECTION', payload: sectionId });
  };

  return (
    <div
      className="relative group cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-slate-100 hover:ring-offset-4 hover:ring-offset-white rounded-md"
      onClick={handleClick}
    >
      {/* Edit Badge */}
      <button
        className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-500 p-1.5 rounded-full shadow-sm border border-slate-100"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <Edit className="w-4 h-4" />
      </button>
      {children}
    </div>
  );
}

// Shared section rendering component
function SectionContent({ section, settings, templateId, templateStyles }: { section: ResumeSection; settings: FormattingSettings; templateId?: string; templateStyles?: any }) {
  const isMinimalist = templateId === 'minimalist';
  const isCreative = templateId === 'creative';
  const isModern = templateId?.startsWith('modern') || templateId === 'modern';

  if (section.type === 'experience') {
    return (
      <>
        <h2
          className={isModern && templateStyles ? templateStyles.sectionTitle : `${isMinimalist ? 'text-base font-serif mb-4 pb-1 border-b' : isCreative ? 'text-lg font-semibold mb-3' : 'text-lg font-bold uppercase mb-3 pb-2 border-b-2'}`}
          style={isCreative ? { color: settings.accentColor } : isMinimalist ? {} : isModern && templateStyles ? {} : { borderColor: settings.accentColor }}
        >
          {section.title}
        </h2>
        {section.items && section.items.length > 0 ? (
          <div className="space-y-4">
            {section.items.map((item: SectionItem, index: number) => (
              <div key={item.id || index} className="text-slate-700">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  {item.date && (
                    <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                      {item.date}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="italic text-slate-700 mb-2">{item.subtitle}</p>
                )}
                {item.description && (
                  <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">No experience entries yet.</p>
        )}
      </>
    );
  }

  if (section.type === 'education') {
    return (
      <>
        <h2
          className={isModern && templateStyles ? templateStyles.sectionTitle : `${isMinimalist ? 'text-base font-serif mb-4 pb-1 border-b' : isCreative ? 'text-lg font-semibold mb-3' : 'text-lg font-bold uppercase mb-3 pb-2 border-b-2'}`}
          style={isCreative ? { color: settings.accentColor } : isMinimalist ? {} : isModern && templateStyles ? {} : { borderColor: settings.accentColor }}
        >
          {section.title}
        </h2>
        {section.items && section.items.length > 0 ? (
          <div className="space-y-4">
            {section.items.map((item: SectionItem, index: number) => (
              <div key={item.id || index} className="text-slate-700">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  {item.date && (
                    <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                      {item.date}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="italic text-slate-700 mb-2">{item.subtitle}</p>
                )}
                {item.description && (
                  <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">No education entries yet.</p>
        )}
      </>
    );
  }

  if (section.type === 'skills') {
    return (
      <>
        <h2
          className={isModern && templateStyles ? templateStyles.sectionTitle : `${isMinimalist ? 'text-base font-serif mb-4 pb-1 border-b' : isCreative ? 'text-lg font-semibold mb-3' : 'text-lg font-bold uppercase mb-3 pb-2 border-b-2'}`}
          style={isCreative ? { color: settings.accentColor } : isMinimalist ? {} : isModern && templateStyles ? {} : { borderColor: settings.accentColor }}
        >
          {section.title}
        </h2>
        {section.items && section.items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {section.items.map((item: SectionItem, index: number) => (
              <span
                key={item.id || index}
                className={isModern && templateStyles?.skillsLayout === 'tags' ? "px-3 py-1 rounded-md text-sm font-medium print:border" : "bg-slate-100 text-slate-800 px-3 py-1 rounded-md text-sm font-medium print:border print:border-slate-200"}
                style={isModern && templateStyles?.skillsLayout === 'tags' ? { 
                  backgroundColor: templateStyles?.accentColor ? `${templateStyles.accentColor}20` : (templateId === 'modern-contemporary' ? '#0D948820' : '#2563EB20'),
                  color: templateStyles?.accentColor || (templateId === 'modern-contemporary' ? '#0D9488' : '#2563EB'),
                  borderColor: templateStyles?.accentColor ? `${templateStyles.accentColor}40` : (templateId === 'modern-contemporary' ? '#0D948840' : '#2563EB40')
                } : {}}
              >
                {item.title}
                {item.subtitle && (
                  <span className="text-xs text-slate-600 ml-1">
                    ({item.subtitle})
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">No skills yet.</p>
        )}
      </>
    );
  }

  // Handle projects section
  if (section.type === 'projects') {
    return (
      <>
        <h2
          className={`${isMinimalist ? 'text-base font-serif mb-4 pb-1 border-b' : isCreative ? 'text-lg font-semibold mb-3' : 'text-lg font-bold uppercase mb-3 pb-2 border-b-2'}`}
          style={isCreative ? { color: settings.accentColor } : isMinimalist ? {} : { borderColor: settings.accentColor }}
        >
          {section.title}
        </h2>
        {section.items && section.items.length > 0 ? (
          <div className="space-y-4">
            {section.items.map((item: SectionItem, index: number) => (
              <div key={item.id || index} className="text-slate-700">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  {item.date && (
                    <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                      {item.date}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="italic text-slate-700 mb-2">{item.subtitle}</p>
                )}
                {item.description && (
                  <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">No projects yet.</p>
        )}
      </>
    );
  }

  // Handle certifications section
  if (section.type === 'certifications') {
    return (
      <>
        <h2
          className={`${isMinimalist ? 'text-base font-serif mb-4 pb-1 border-b' : isCreative ? 'text-lg font-semibold mb-3' : 'text-lg font-bold uppercase mb-3 pb-2 border-b-2'}`}
          style={isCreative ? { color: settings.accentColor } : isMinimalist ? {} : { borderColor: settings.accentColor }}
        >
          {section.title}
        </h2>
        {section.items && section.items.length > 0 ? (
          <div className="space-y-3">
            {section.items.map((item: SectionItem, index: number) => (
              <div key={item.id || index} className="text-slate-700">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  {item.date && (
                    <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                      {item.date}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="text-slate-700 mb-1">{item.subtitle}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">No certifications yet.</p>
        )}
      </>
    );
  }

  // Handle languages section
  if (section.type === 'languages') {
    return (
      <>
        <h2
          className={`${isMinimalist ? 'text-base font-serif mb-4 pb-1 border-b' : isCreative ? 'text-lg font-semibold mb-3' : 'text-lg font-bold uppercase mb-3 pb-2 border-b-2'}`}
          style={isCreative ? { color: settings.accentColor } : isMinimalist ? {} : { borderColor: settings.accentColor }}
        >
          {section.title}
        </h2>
        {section.items && section.items.length > 0 ? (
          <div className="space-y-2">
            {section.items.map((item: SectionItem, index: number) => (
              <div key={item.id || index} className="flex justify-between items-center">
                <span className="font-medium text-slate-900">{item.title}</span>
                <span className="text-sm text-slate-600 capitalize">{item.subtitle}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">No languages yet.</p>
        )}
      </>
    );
  }

  // Handle volunteer section
  if (section.type === 'volunteer') {
    return (
      <>
        <h2
          className={`${isMinimalist ? 'text-base font-serif mb-4 pb-1 border-b' : isCreative ? 'text-lg font-semibold mb-3' : 'text-lg font-bold uppercase mb-3 pb-2 border-b-2'}`}
          style={isCreative ? { color: settings.accentColor } : isMinimalist ? {} : { borderColor: settings.accentColor }}
        >
          {section.title}
        </h2>
        {section.items && section.items.length > 0 ? (
          <div className="space-y-4">
            {section.items.map((item: SectionItem, index: number) => (
              <div key={item.id || index} className="text-slate-700">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  {item.date && (
                    <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                      {item.date}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="italic text-slate-700 mb-2">{item.subtitle}</p>
                )}
                {item.description && (
                  <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">No volunteer experience yet.</p>
        )}
      </>
    );
  }

  // Handle custom sections - they use the generic format
  if (section.type === 'custom') {
    return (
      <>
        <h2
          className={`${isMinimalist ? 'text-base font-serif mb-4 pb-1 border-b' : isCreative ? 'text-lg font-semibold mb-3' : 'text-lg font-bold uppercase mb-3 pb-2 border-b-2'}`}
          style={isCreative ? { color: settings.accentColor } : isMinimalist ? {} : { borderColor: settings.accentColor }}
        >
          {section.title}
        </h2>
        {section.items && section.items.length > 0 ? (
          <div className="space-y-4">
            {section.items.map((item: SectionItem, index: number) => (
              <div key={item.id || index} className="text-slate-700">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  {item.date && (
                    <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                      {item.date}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="italic text-slate-700 mb-2">{item.subtitle}</p>
                )}
                {item.description && (
                  <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">No items in this section yet.</p>
        )}
      </>
    );
  }

  return (
    <>
      <h2
        className={`${isMinimalist ? 'text-base font-serif mb-4 pb-1 border-b' : isCreative ? 'text-lg font-semibold mb-3' : 'text-xl font-semibold mb-3'}`}
        style={isCreative ? { color: settings.accentColor } : isMinimalist ? {} : { color: settings.accentColor }}
      >
        {section.title}
      </h2>
      {section.items && section.items.length > 0 ? (
        <div className="space-y-4">
          {section.items.map((item: SectionItem | string, index: number) => (
            <div key={index} className="text-slate-700">
              {typeof item === 'string' ? (
                <p>{item}</p>
              ) : (
                <pre className="text-xs">{JSON.stringify(item, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 italic">No items in this section yet.</p>
      )}
    </>
  );
}

// Preview wrapper component with responsive scaling
function PreviewWrapper({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) {
  return (
    <div
      className="resume-preview-wrapper"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s ease-out',
      }}
    >
      {children}
    </div>
  );
}

// Minimalist Template Component (memoized to prevent unnecessary re-renders)
const MinimalistTemplate = React.memo(function MinimalistTemplate({ personalInfo, sections, settings }: { personalInfo: PersonalInfo; sections: ResumeSection[]; settings: FormattingSettings }) {
  const contactInfo = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean);

  return (
    <div
      className="resume-preview-container w-[210mm] min-h-[297mm] p-12 text-slate-900"
      style={{
        fontFamily: 'Times New Roman, serif',
        fontSize: `${settings.fontSize}pt`,
        lineHeight: settings.lineHeight,
      }}
    >
      {/* Header */}
      <SectionWrapper sectionId="personal">
        <header className="mb-10">
          {personalInfo.fullName && (
            <h1 className="text-4xl font-serif text-left mb-4 text-slate-900">
              {personalInfo.fullName}
            </h1>
          )}
          <div className="border-b border-slate-300 mb-6"></div>
          {contactInfo.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.linkedin && (
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {personalInfo.website && (
                <a
                  href={personalInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Website
                </a>
              )}
            </div>
          )}
        </header>
      </SectionWrapper>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <SectionWrapper sectionId="summary">
          <section className="mb-10">
            <h2 className="text-base font-serif mb-4 pb-1 border-b text-slate-900">
              Professional Summary
            </h2>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">{personalInfo.summary}</p>
          </section>
        </SectionWrapper>
      )}

      {/* Sections */}
      {sections.length > 0 && (
        <div className="space-y-10">
          {sections
            .filter((section) => section.isVisible)
            .map((section) => (
              <SectionWrapper key={section.id} sectionId={section.id}>
                <section className="mb-10">
                  <SectionContent section={section} settings={settings} templateId="minimalist" />
                </section>
              </SectionWrapper>
            ))}
        </div>
      )}
    </div>
  );
});

// Creative Template Component (memoized to prevent unnecessary re-renders)
const CreativeTemplate = React.memo(function CreativeTemplate({ personalInfo, sections, settings }: { personalInfo: PersonalInfo; sections: ResumeSection[]; settings: FormattingSettings }) {
  const contactInfo = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean);

  // Get primary color from accent color or default to blue
  const primaryColor = settings.accentColor || '#2563EB';

  return (
    <div
      className="resume-preview-container w-[210mm] min-h-[297mm] text-slate-900"
      style={{
        fontFamily: settings.fontFamily,
        fontSize: `${settings.fontSize}pt`,
        lineHeight: settings.lineHeight,
      }}
    >
      {/* Header with colored block */}
      <SectionWrapper sectionId="personal">
        <header 
          className="relative p-10 mb-8 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex flex-col items-center">
            {/* Profile Photo - centered in header */}
            {personalInfo.profilePicture && (
              <img
                src={personalInfo.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white object-cover mb-4"
              />
            )}
            
            {personalInfo.fullName && (
              <h1 className="text-4xl font-bold mb-2 text-white">
                {personalInfo.fullName}
              </h1>
            )}
            
            {personalInfo.jobTitle && (
              <p className="text-xl text-white/90 mb-4">{personalInfo.jobTitle}</p>
            )}

            {contactInfo.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/90">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.linkedin && (
                  <a
                    href={personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-white"
                  >
                    LinkedIn
                  </a>
                )}
                {personalInfo.website && (
                  <a
                    href={personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-white"
                  >
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        </header>
      </SectionWrapper>

      <div className="px-8 pb-8">
        {/* Professional Summary */}
        {personalInfo.summary && (
          <SectionWrapper sectionId="summary">
            <section className="mb-6">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: primaryColor }}
              >
                Professional Summary
              </h2>
              <p className="text-slate-700 whitespace-pre-line">{personalInfo.summary}</p>
            </section>
          </SectionWrapper>
        )}

        {/* Sections */}
        {sections.length > 0 && (
          <div className="space-y-6">
            {sections
              .filter((section) => section.isVisible)
              .map((section) => (
                <SectionWrapper key={section.id} sectionId={section.id}>
                  <section className="mb-6">
                    <SectionContent section={section} settings={settings} templateId="creative" />
                  </section>
                </SectionWrapper>
              ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Modern Template Component (memoized to prevent unnecessary re-renders)
const ModernTemplate = React.memo(function ModernTemplate({ personalInfo, sections, settings, templateId }: { personalInfo: PersonalInfo; sections: ResumeSection[]; settings: FormattingSettings; templateId: string }) {
  // Map template IDs to actual template IDs in resumeTemplates
  let actualTemplateId = templateId;
  if (templateId === 'modern') {
    actualTemplateId = 'modern-tech';
  } else if (templateId === 'modern-contemporary') {
    actualTemplateId = 'modern-contemporary';
  } else if (templateId === 'modern-tech') {
    actualTemplateId = 'modern-tech';
  }
  
  // Get the template definition from resumeTemplates
  const template = getTemplateById(actualTemplateId);
  
  // Debug: Log template retrieval
  if (!template && actualTemplateId === 'modern-contemporary') {
    console.warn('Modern Contemporary template not found, using fallback styles');
  }
  
  // Use template styles if found, otherwise use fallback
  // For modern-contemporary, use teal/cyan/blue gradient (distinct from modern-tech)
  // For modern-tech, use slate/purple gradient
  const templateStyles = template?.styles || (actualTemplateId === 'modern-contemporary' ? {
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
  } : {
    container: 'max-w-[210mm] mx-auto bg-white',
    header: 'bg-gradient-to-r from-slate-600 to-purple-600 text-white p-8 -mx-8 -mt-8 mb-6',
    headerName: 'text-3xl font-bold tracking-tight',
    headerTitle: 'text-lg opacity-90 mt-1',
    headerContact: 'text-sm opacity-80 mt-3 flex gap-4 flex-wrap',
    mainContent: 'px-8',
    sectionTitle: 'text-sm font-bold uppercase tracking-wider text-slate-600 border-b-2 border-slate-200 pb-1 mb-3 mt-6',
    sectionContent: 'text-sm text-gray-700',
    skillsLayout: 'tags',
    accentColor: '#4F46E5',
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: '10pt',
  });

  const contactInfo = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean);

  return (
    <div
      className={`resume-preview-container w-[210mm] min-h-[297mm] ${templateStyles.container}`}
      style={{
        fontFamily: templateStyles.fontFamily,
        fontSize: templateStyles.fontSize,
        lineHeight: settings.lineHeight,
      }}
    >
      {/* Header with gradient */}
      <SectionWrapper sectionId="personal">
        <header className={templateStyles.header}>
          {personalInfo.fullName && (
            <h1 className={templateStyles.headerName}>
              {personalInfo.fullName}
            </h1>
          )}
          
          {personalInfo.jobTitle && (
            <p className={templateStyles.headerTitle}>
              {personalInfo.jobTitle}
            </p>
          )}

          {/* Contact Information */}
          {contactInfo.length > 0 && (
            <div className={templateStyles.headerContact}>
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.linkedin && (
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {personalInfo.website && (
                <a
                  href={personalInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Website
                </a>
              )}
              {personalInfo.location && <span>{personalInfo.location}</span>}
            </div>
          )}
        </header>
      </SectionWrapper>

      {/* Main Content */}
      <div className={templateStyles.mainContent}>
        {sections
          .filter((section) => section.isVisible)
          .map((section) => (
            <SectionWrapper key={section.id} sectionId={section.id}>
              <section className="mb-6">
                <SectionContent section={section} settings={settings} templateId={templateId} templateStyles={templateStyles} />
              </section>
            </SectionWrapper>
          ))}
      </div>
    </div>
  );
});

// Classic/Default Template Component (memoized to prevent unnecessary re-renders)
const ClassicTemplate = React.memo(function ClassicTemplate({ personalInfo, sections, settings }: { personalInfo: PersonalInfo; sections: ResumeSection[]; settings: FormattingSettings }) {
  const contactInfo = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean);

  return (
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] p-8 text-slate-900"
        style={{
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}pt`,
          lineHeight: settings.lineHeight,
        }}
      >
        {/* Header - Personal Information */}
        <SectionWrapper sectionId="personal">
          <header className="text-center mb-6 pb-6 border-b border-slate-200">
            {personalInfo.fullName && (
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: settings.accentColor }}
              >
                {personalInfo.fullName}
              </h1>
            )}
            
            {personalInfo.jobTitle && (
              <p className="text-lg text-slate-600 mb-3">{personalInfo.jobTitle}</p>
            )}

            {/* Contact Information */}
            {contactInfo.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
                {personalInfo.email && (
                  <span>{personalInfo.email}</span>
                )}
                {personalInfo.phone && (
                  <span>{personalInfo.phone}</span>
                )}
                {personalInfo.linkedin && (
                  <a
                    href={personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: settings.accentColor }}
                  >
                    LinkedIn
                  </a>
                )}
                {personalInfo.website && (
                  <a
                    href={personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: settings.accentColor }}
                  >
                    Website
                  </a>
                )}
              </div>
            )}
          </header>
        </SectionWrapper>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <SectionWrapper sectionId="summary">
            <section className="mb-6">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: settings.accentColor }}
              >
                Professional Summary
              </h2>
              <p className="text-slate-700 whitespace-pre-line">{personalInfo.summary}</p>
            </section>
          </SectionWrapper>
        )}

        {/* Sections */}
        {sections.length > 0 ? (
          <div className="space-y-6">
            {sections
              .filter((section) => section.isVisible)
              .map((section) => (
                <SectionWrapper key={section.id} sectionId={section.id}>
                  <section className="mb-6">
                  <SectionContent section={section} settings={settings} />
                  </section>
                </SectionWrapper>
              ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-8">
            <p className="text-sm">Add sections to see them here.</p>
          </div>
        )}
      </div>
  );
});

function ResumePreview() {
  // Consume context directly - this ensures re-renders when context updates
  const { state } = useResume();
  const { personalInfo, sections, settings, projects, certifications, languages, volunteer, customSections } = state;
  const templateId = settings.templateId || 'classic';
  const [scale, setScale] = useState(1);
  const [isFitToWidth, setIsFitToWidth] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Debug: Log template ID changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ResumePreview - Template ID changed to:', templateId);
    }
  }, [templateId]);

  // Calculate responsive scale based on container width
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // A4 dimensions in mm converted to px (1mm ≈ 3.779527559px at 96 DPI)
      const previewWidthMm = 210;
      const previewHeightMm = 297;
      const mmToPx = 3.779527559;
      const previewWidth = previewWidthMm * mmToPx;
      const previewHeight = previewHeightMm * mmToPx;

      if (isFitToWidth) {
        // Fit to width with some padding
        const availableWidth = containerWidth - 32; // 16px padding on each side
        const scaleX = availableWidth / previewWidth;
        
        // Also check height to ensure it fits
        const availableHeight = containerHeight - 100; // Account for controls and padding
        const scaleY = availableHeight / previewHeight;
        
        // Use the smaller scale to ensure it fits both dimensions
        const calculatedScale = Math.min(scaleX, scaleY, 1);
        setScale(Math.max(0.3, Math.min(calculatedScale, 1))); // Clamp between 0.3 and 1
      }
    };

    calculateScale();
    const resizeObserver = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', calculateScale);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, [isFitToWidth]);

  // Memoize all sections calculation - only recalculate when relevant data changes
  const allSections = useMemo(() => {
    const result = [...sections];

    // Add projects section if exists
    if (projects && projects.length > 0) {
      result.push({
        id: 'projects',
        title: 'Projects',
        type: 'projects',
        isVisible: true,
        items: projects.map(proj => ({
          id: proj.id,
          title: proj.title || 'Untitled Project',
          subtitle: proj.role || proj.company || '',
          date: `${proj.startDate || ''}${proj.endDate ? ` - ${proj.endDate}` : ''}`,
          description: proj.description || '',
        })),
      });
    }

    // Add certifications section if exists
    if (certifications && certifications.length > 0) {
      result.push({
        id: 'certifications',
        title: 'Certifications',
        type: 'certifications',
        isVisible: true,
        items: certifications.map(cert => ({
          id: cert.id,
          title: cert.name || '',
          subtitle: cert.issuer || '',
          date: cert.date || '',
          description: cert.url || '',
        })),
      });
    }

    // Add languages section if exists
    if (languages && languages.length > 0) {
      result.push({
        id: 'languages',
        title: 'Languages',
        type: 'languages',
        isVisible: true,
        items: languages.map(lang => ({
          id: lang.id,
          title: lang.language || '',
          subtitle: lang.proficiency || '',
          date: '',
          description: '',
        })),
      });
    }

    // Add volunteer section if exists
    if (volunteer && volunteer.length > 0) {
      result.push({
        id: 'volunteer',
        title: 'Volunteer Work',
        type: 'volunteer',
        isVisible: true,
        items: volunteer.map(vol => ({
          id: vol.id,
          title: vol.organization || '',
          subtitle: vol.role || '',
          date: `${vol.startDate || ''}${vol.endDate ? ` - ${vol.endDate}` : ''}`,
          description: vol.description || '',
        })),
      });
    }

    // Add custom sections if exist
    if (customSections && customSections.length > 0) {
      customSections.forEach(customSection => {
        result.push({
          id: customSection.id,
          title: customSection.title || '',
          type: 'custom',
          isVisible: true,
          items: customSection.items || [],
        });
      });
    }

    return result;
  }, [sections, projects, certifications, languages, volunteer, customSections]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2)); // Max 200%
    setIsFitToWidth(false);
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.3)); // Min 30%
    setIsFitToWidth(false);
  };

  const handleFitToWidth = () => {
    setIsFitToWidth(true);
  };

  return (
    <div 
      key={settings.templateId}
      ref={containerRef}
      className="min-h-full w-full flex flex-col items-center justify-start p-4 overflow-auto"
    >
      {/* Zoom Controls */}
      <div className="flex items-center gap-2 mb-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-2 sticky top-4 z-10">
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-slate-100 rounded-md transition-colors"
          title="Zoom Out"
          disabled={scale <= 0.3}
        >
          <ZoomOut className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-sm font-medium text-slate-700 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-slate-100 rounded-md transition-colors"
          title="Zoom In"
          disabled={scale >= 2}
        >
          <ZoomIn className="w-4 h-4 text-slate-600" />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          onClick={handleFitToWidth}
          className="p-2 hover:bg-slate-100 rounded-md transition-colors"
          title="Fit to Width"
        >
          <Maximize2 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Preview Container */}
      <div 
        className="flex items-start justify-center w-full"
        style={{
          minHeight: 'calc(100% - 60px)',
        }}
      >
        <PreviewWrapper scale={scale}>
          {(() => {
            // Debug: Log template ID for troubleshooting
            if (process.env.NODE_ENV === 'development') {
              console.log('ResumePreview - Current templateId:', templateId, 'Type:', typeof templateId);
            }
            
            // 1. PRIORITY: Check for Custom Components FIRST (before any generic renderer)
            // Check for photo-modern-gray with explicit string comparison
            const normalizedTemplateId = String(templateId).trim().toLowerCase();
            const isPhotoModernGray = normalizedTemplateId === 'photo-modern-gray';
            const isPhotoElegant = normalizedTemplateId === 'photo-elegant';
            const isPhotoContemporary = normalizedTemplateId === 'photo-contemporary';
            const isPhotoMinimalist = normalizedTemplateId === 'photo-minimalist';
            const isPhotoCreative = normalizedTemplateId === 'photo-creative';
            const isPhotoProfessional = normalizedTemplateId === 'photo-professional';
            const isPhotoClassic = normalizedTemplateId === 'photo-classic';
            const isPhotoModern = normalizedTemplateId === 'photo-modern-new';
            const isPhotoBold = normalizedTemplateId === 'photo-bold';
            const isPhotoExecutive = normalizedTemplateId === 'photo-executive';
            const isPhotoDynamic = normalizedTemplateId === 'photo-dynamic';
            const isPhotoTech = normalizedTemplateId === 'photo-tech';
            const isPhotoArtistic = normalizedTemplateId === 'photo-artistic';
            const isPhotoLuxury = normalizedTemplateId === 'photo-luxury';
            const isPhotoCorporate = normalizedTemplateId === 'photo-corporate';
            const isPhotoVibrant = normalizedTemplateId === 'photo-vibrant';
            const isPhotoModernClean = normalizedTemplateId === 'photo-modern-clean';
            const isPhotoIndustrial = normalizedTemplateId === 'photo-industrial';
            const isPhotoNature = normalizedTemplateId === 'photo-nature';
            const isPhotoRetro = normalizedTemplateId === 'photo-retro';
            const isPhotoOcean = normalizedTemplateId === 'photo-ocean';
            const isPhotoSunset = normalizedTemplateId === 'photo-sunset';
            const isPhotoMonochrome = normalizedTemplateId === 'photo-monochrome';
            const isPhotoSoft = normalizedTemplateId === 'photo-soft';
            const isPhotoGeometric = normalizedTemplateId === 'photo-geometric';
            const isPhotoElegantModern = normalizedTemplateId === 'photo-elegant-modern';
            const isPhotoFresh = normalizedTemplateId === 'photo-fresh';
            const isPhotoBusiness = normalizedTemplateId === 'photo-business';
            const isPhotoProfessionalSidebar = normalizedTemplateId === 'photo-professional-sidebar';
            const isPhotoProfessionalTop = normalizedTemplateId === 'photo-professional-top';
            const isPhotoProfessionalBW = normalizedTemplateId === 'photo-professional-bw';
            const isPhotoProfessionalCompact = normalizedTemplateId === 'photo-professional-compact';
            const isPhotoProfessionalClassicBW = normalizedTemplateId === 'photo-professional-classic-bw';
            
            if (isPhotoModernGray) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoModernGray template');
              }
              return <PhotoModernGray resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoElegant) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoElegant template');
              }
              return <PhotoElegant resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoContemporary) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoContemporary template');
              }
              return <PhotoContemporary resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoMinimalist) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoMinimalist template');
              }
              return <PhotoMinimalist resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoCreative) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoCreative template');
              }
              return <PhotoCreative resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoProfessional) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoProfessional template');
              }
              return <PhotoProfessional resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoClassic) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoClassic template');
              }
              return <PhotoClassic resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoModern) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoModern template');
              }
              return <PhotoModern resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoBold) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoBold template');
              }
              return <PhotoBold resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoExecutive) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoExecutive template');
              }
              return <PhotoExecutive resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoDynamic) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoDynamic template');
              }
              return <PhotoDynamic resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoTech) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoTech template');
              }
              return <PhotoTech resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoArtistic) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoArtistic template');
              }
              return <PhotoArtistic resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoLuxury) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoLuxury template');
              }
              return <PhotoLuxury resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoCorporate) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoCorporate template');
              }
              return <PhotoCorporate resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoVibrant) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoVibrant template');
              }
              return <PhotoVibrant resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoModernClean) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoModernClean template');
              }
              return <PhotoModernClean resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoIndustrial) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoIndustrial template');
              }
              return <PhotoIndustrial resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoNature) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoNature template');
              }
              return <PhotoNature resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoRetro) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoRetro template');
              }
              return <PhotoRetro resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoOcean) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoOcean template');
              }
              return <PhotoOcean resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoSunset) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoSunset template');
              }
              return <PhotoSunset resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoMonochrome) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoMonochrome template');
              }
              return <PhotoMonochrome resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoSoft) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoSoft template');
              }
              return <PhotoSoft resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoGeometric) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoGeometric template');
              }
              return <PhotoGeometric resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoElegantModern) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoElegantModern template');
              }
              return <PhotoElegantModern resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoFresh) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoFresh template');
              }
              return <PhotoFresh resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoBusiness) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoBusiness template');
              }
              return <PhotoBusiness resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoProfessionalSidebar) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoProfessionalSidebar template');
              }
              return <PhotoProfessionalSidebar resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoProfessionalTop) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoProfessionalTop template');
              }
              return <PhotoProfessionalTop resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoProfessionalBW) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoProfessionalBW template');
              }
              return <PhotoProfessionalBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoProfessionalCompact) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoProfessionalCompact template');
              }
              return <PhotoProfessionalCompact resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            if (isPhotoProfessionalClassicBW) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Rendering PhotoProfessionalClassicBW template');
              }
              return <PhotoProfessionalClassicBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            // Check for classic-timeline
            const isClassicTimeline = String(templateId).trim() === 'classic-timeline';
            if (isClassicTimeline) {
              return <ClassicTimeline resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicFormal = String(templateId).trim() === 'classic-formal';
            if (isClassicFormal) {
              return <ClassicFormal resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicProfessionalBW = String(templateId).trim() === 'classic-professional-bw';
            if (isClassicProfessionalBW) {
              return <ClassicProfessionalBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicExecutiveBW = String(templateId).trim() === 'classic-executive-bw';
            if (isClassicExecutiveBW) {
              return <ClassicExecutiveBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicModernBW = String(templateId).trim() === 'classic-modern-bw';
            if (isClassicModernBW) {
              return <ClassicModernBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicTraditionalBW = String(templateId).trim() === 'classic-traditional-bw';
            if (isClassicTraditionalBW) {
              return <ClassicTraditionalBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicStructuredBW = String(templateId).trim() === 'classic-structured-bw';
            if (isClassicStructuredBW) {
              return <ClassicStructuredBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicCompactBW = String(templateId).trim() === 'classic-compact-bw';
            if (isClassicCompactBW) {
              return <ClassicCompactBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicElegantBW = String(templateId).trim() === 'classic-elegant-bw';
            if (isClassicElegantBW) {
              return <ClassicElegantBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicMinimalBW = String(templateId).trim() === 'classic-minimal-bw';
            if (isClassicMinimalBW) {
              return <ClassicMinimalBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicRefinedBW = String(templateId).trim() === 'classic-refined-bw';
            if (isClassicRefinedBW) {
              return <ClassicRefinedBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicCorporateBW = String(templateId).trim() === 'classic-corporate-bw';
            if (isClassicCorporateBW) {
              return <ClassicCorporateBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicSidebarBW = String(templateId).trim() === 'classic-sidebar-bw';
            if (isClassicSidebarBW) {
              return <ClassicSidebarBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicCenteredBW = String(templateId).trim() === 'classic-centered-bw';
            if (isClassicCenteredBW) {
              return <ClassicCenteredBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicTimelineBW = String(templateId).trim() === 'classic-timeline-bw';
            if (isClassicTimelineBW) {
              return <ClassicTimelineBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            const isClassicHeaderBarBW = String(templateId).trim() === 'classic-header-bar-bw';
            if (isClassicHeaderBarBW) {
              return <ClassicHeaderBarBW resumeData={{ personalInfo, sections: allSections }} settings={settings} />;
            }
            
            // 2. Other custom components
            // Minimal templates
            if (templateId === 'minimalist' || templateId === 'minimal-clean' || templateId === 'minimal-swiss' || templateId === 'modern-minimalist') {
              return <MinimalistTemplate personalInfo={personalInfo} sections={allSections} settings={settings} />;
            }
            // Creative templates
            if (templateId === 'creative' || templateId === 'creative-artistic' || templateId === 'creative-bold') {
              return <CreativeTemplate personalInfo={personalInfo} sections={allSections} settings={settings} />;
            }
            // Modern templates
            if (templateId === 'modern-contemporary' || templateId === 'modern-tech' || templateId === 'modern' || templateId === 'modern-vibrant' || templateId === 'two-column-modern' || templateId === 'sidebar-accent') {
              return <ModernTemplate personalInfo={personalInfo} sections={allSections} settings={settings} templateId={templateId} />;
            }
            // Classic templates that should use the generic classic template
            if (templateId === 'classic-professional' || templateId === 'classic-elegant' || templateId === 'executive-formal' || templateId === 'executive-distinguished') {
              return <ClassicTemplate personalInfo={personalInfo} sections={allSections} settings={settings} />;
            }
            // Photo templates (photo-modern-gray already handled above)
            if (templateId === 'photo-professional' || templateId === 'photo-modern') {
              return <ClassicTemplate personalInfo={personalInfo} sections={allSections} settings={settings} />;
            }
            
            // 3. Check for generic/registry templates (if any generic renderer exists)
            // Note: Currently no generic renderer, but this is where it would go
            
            // 4. Fallback to Classic (for any unrecognized template IDs)
            return <ClassicTemplate personalInfo={personalInfo} sections={allSections} settings={settings} />;
          })()}
        </PreviewWrapper>
      </div>
    </div>
  );
}

// Export without memo to ensure re-renders when context updates
export default ResumePreview;
