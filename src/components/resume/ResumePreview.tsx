import { useResume } from '../../context/ResumeContext';

export default function ResumePreview() {
  const { state } = useResume();
  const { personalInfo, sections, settings } = state;

  // Build contact info array (filter out empty values)
  const contactInfo = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean);

  return (
    <div className="p-8 bg-slate-50 min-h-full flex items-start justify-center">
      {/* A4 Paper Container */}
      <div
        className="w-[210mm] min-h-[297mm] bg-white shadow-2xl mx-auto p-8 text-slate-900"
        style={{
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}pt`,
          lineHeight: settings.lineHeight,
        }}
      >
        {/* Header - Personal Information */}
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

        {/* Professional Summary */}
        {personalInfo.summary && (
          <section className="mb-6">
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: settings.accentColor }}
            >
              Professional Summary
            </h2>
            <p className="text-slate-700 whitespace-pre-line">{personalInfo.summary}</p>
          </section>
        )}

        {/* Sections */}
        {sections.length > 0 ? (
          <div className="space-y-6">
            {sections
              .filter((section) => section.isVisible)
              .map((section) => (
                <section key={section.id} className="mb-6">
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: settings.accentColor }}
                  >
                    {section.title}
                  </h2>
                  {section.items && section.items.length > 0 ? (
                    <div className="space-y-4">
                      {section.items.map((item: any, index: number) => (
                        <div key={index} className="text-slate-700">
                          {/* Render section items - structure will be refined later */}
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
                </section>
              ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-8">
            <p className="text-sm">Add sections to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
