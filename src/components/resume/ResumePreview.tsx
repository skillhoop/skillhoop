import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Edit, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { ResumeSection, SectionItem, PersonalInfo, FormattingSettings } from '../../types/resume';

// SectionWrapper component for clickable sections with edit badge
function SectionWrapper({ sectionId, children }: { sectionId: string; children: React.ReactNode }) {
  const { dispatch } = useResume();

  const handleClick = () => {
    dispatch({ type: 'SET_FOCUSED_SECTION', payload: sectionId });
  };

  return (
    <div
      className="relative group cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-indigo-100 hover:ring-offset-4 hover:ring-offset-white rounded-md"
      onClick={handleClick}
    >
      {/* Edit Badge */}
      <button
        className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-indigo-500 p-1.5 rounded-full shadow-sm border border-indigo-100"
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
function SectionContent({ section, settings, templateId }: { section: ResumeSection; settings: FormattingSettings; templateId?: string }) {
  const isMinimalist = templateId === 'minimalist';
  const isCreative = templateId === 'creative';

  if (section.type === 'experience') {
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
          <p className="text-slate-500 italic text-sm">No experience entries yet.</p>
        )}
      </>
    );
  }

  if (section.type === 'education') {
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
          <p className="text-slate-500 italic text-sm">No education entries yet.</p>
        )}
      </>
    );
  }

  if (section.type === 'skills') {
    return (
      <>
        <h2
          className={`${isMinimalist ? 'text-base font-serif mb-4 pb-1 border-b' : isCreative ? 'text-lg font-semibold mb-3' : 'text-lg font-bold uppercase mb-3 pb-2 border-b-2'}`}
          style={isCreative ? { color: settings.accentColor } : isMinimalist ? {} : { borderColor: settings.accentColor }}
        >
          {section.title}
        </h2>
        {section.items && section.items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {section.items.map((item: SectionItem, index: number) => (
              <span
                key={item.id || index}
                className="bg-slate-100 text-slate-800 px-3 py-1 rounded-md text-sm font-medium print:border print:border-slate-200"
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
      className="resume-preview-container w-[210mm] min-h-[297mm] bg-white shadow-2xl p-12 text-slate-900"
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
      className="resume-preview-container w-[210mm] min-h-[297mm] bg-white shadow-2xl text-slate-900"
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
        className="resume-preview-container w-[210mm] min-h-[297mm] bg-white shadow-2xl p-8 text-slate-900"
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
  const { state } = useResume();
  const { personalInfo, sections, settings, projects, certifications, languages, volunteer, customSections } = state;
  const templateId = settings.templateId || 'classic';
  const [scale, setScale] = useState(1);
  const [isFitToWidth, setIsFitToWidth] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

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
          {templateId === 'minimalist' ? (
            <MinimalistTemplate personalInfo={personalInfo} sections={allSections} settings={settings} />
          ) : templateId === 'creative' ? (
            <CreativeTemplate personalInfo={personalInfo} sections={allSections} settings={settings} />
          ) : (
            <ClassicTemplate personalInfo={personalInfo} sections={allSections} settings={settings} />
          )}
        </PreviewWrapper>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders when unrelated state changes
// This prevents re-rendering when opening/closing sidebar or other UI interactions
export default React.memo(ResumePreview);
