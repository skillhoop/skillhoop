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
    <div className="min-h-full flex items-center justify-center">
      {/* A4 Paper Container */}
      <div
        className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-8 text-slate-900 transform scale-90"
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
                  {section.type === 'experience' ? (
                    <>
                      {/* Experience Section Title */}
                      <h2
                        className="text-lg font-bold uppercase mb-3 pb-2 border-b-2"
                        style={{ borderColor: settings.accentColor }}
                      >
                        {section.title}
                      </h2>
                      {section.items && section.items.length > 0 ? (
                        <div className="space-y-4">
                          {section.items.map((item, index: number) => (
                            <div key={item.id || index} className="text-slate-700">
                              {/* Row 1: Job Title (left) and Date Range (right) */}
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-900">{item.title}</h3>
                                {item.date && (
                                  <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                                    {item.date}
                                  </span>
                                )}
                              </div>
                              {/* Row 2: Company Name (italic) */}
                              {item.subtitle && (
                                <p className="italic text-slate-700 mb-2">{item.subtitle}</p>
                              )}
                              {/* Row 3: Description (preserve whitespace) */}
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
                  ) : section.type === 'education' ? (
                    <>
                      {/* Education Section Title */}
                      <h2
                        className="text-lg font-bold uppercase mb-3 pb-2 border-b-2"
                        style={{ borderColor: settings.accentColor }}
                      >
                        {section.title}
                      </h2>
                      {section.items && section.items.length > 0 ? (
                        <div className="space-y-4">
                          {section.items.map((item, index: number) => (
                            <div key={item.id || index} className="text-slate-700">
                              {/* Row 1: Institution (left) and Date (right) */}
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-900">{item.title}</h3>
                                {item.date && (
                                  <span className="text-sm text-slate-600 whitespace-nowrap ml-4">
                                    {item.date}
                                  </span>
                                )}
                              </div>
                              {/* Row 2: Degree (italic) */}
                              {item.subtitle && (
                                <p className="italic text-slate-700 mb-2">{item.subtitle}</p>
                              )}
                              {/* Row 3: Description (small text) */}
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
                  ) : section.type === 'skills' ? (
                    <>
                      {/* Skills Section Title */}
                      <h2
                        className="text-lg font-bold uppercase mb-3 pb-2 border-b-2"
                        style={{ borderColor: settings.accentColor }}
                      >
                        {section.title}
                      </h2>
                      {section.items && section.items.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {section.items.map((item, index: number) => (
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
                  ) : (
                    <>
                      {/* Default Section Layout */}
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
                    </>
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
