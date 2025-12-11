import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { Edit } from '../ui/Icons';

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
function SectionContent({ section, settings, templateId }: { section: any; settings: any; templateId?: string }) {
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
            {section.items.map((item: any, index: number) => (
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
            {section.items.map((item: any, index: number) => (
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
            {section.items.map((item: any, index: number) => (
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
          {section.items.map((item: any, index: number) => (
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

// Minimalist Template Component
function MinimalistTemplate({ personalInfo, sections, settings }: { personalInfo: any; sections: any[]; settings: any }) {
  const contactInfo = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean);

  return (
    <div
      className="resume-preview-container w-[210mm] min-h-[297mm] bg-white shadow-2xl p-12 text-slate-900 transform scale-90"
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
}

// Creative Template Component
function CreativeTemplate({ personalInfo, sections, settings }: { personalInfo: any; sections: any[]; settings: any }) {
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
      className="resume-preview-container w-[210mm] min-h-[297mm] bg-white shadow-2xl text-slate-900 transform scale-90"
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
}

// Classic/Default Template Component
function ClassicTemplate({ personalInfo, sections, settings }: { personalInfo: any; sections: any[]; settings: any }) {
  const contactInfo = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean);

  return (
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] bg-white shadow-2xl p-8 text-slate-900 transform scale-90"
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
}

export default function ResumePreview() {
  const { state } = useResume();
  const { personalInfo, sections, settings } = state;
  const templateId = settings.templateId || 'classic';

  return (
    <div className="min-h-full flex items-center justify-center">
      {templateId === 'minimalist' ? (
        <MinimalistTemplate personalInfo={personalInfo} sections={sections} settings={settings} />
      ) : templateId === 'creative' ? (
        <CreativeTemplate personalInfo={personalInfo} sections={sections} settings={settings} />
      ) : (
        <ClassicTemplate personalInfo={personalInfo} sections={sections} settings={settings} />
      )}
    </div>
  );
}
