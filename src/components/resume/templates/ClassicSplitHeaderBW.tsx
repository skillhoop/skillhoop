import React from 'react';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicSplitHeaderBWProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicSplitHeaderBW: React.FC<ClassicSplitHeaderBWProps> = ({ resumeData, settings }) => {
  const { personalInfo, sections } = resumeData;

  const experienceSection = sections.find((s) => s.type === 'experience');
  const educationSection = sections.find((s) => s.type === 'education');
  const skillsSection = sections.find((s) => s.type === 'skills');
  const projectsSection = sections.find((s) => s.type === 'projects');
  const languagesSection = sections.find((s) => s.type === 'languages');
  const certificationsSection = sections.find((s) => s.type === 'certifications');
  const summarySection = sections.find((s) => s.id === 'summary' || s.type === 'personal');

  const contactItems = [
    { Icon: Phone, text: personalInfo.phone },
    { Icon: Mail, text: personalInfo.email },
    { Icon: Globe, text: personalInfo.website },
    { Icon: MapPin, text: personalInfo.location },
  ].filter((item) => item.text);

  const fontFamily = settings.fontFamily || '"Times New Roman", "Georgia", serif';

  return (
    <>
      <style>{`
        .resume-classic-split-header-bw-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-split-header-bw-override"
        style={{
          fontFamily,
          fontSize: `${settings.fontSize || 10}pt`,
          lineHeight: settings.lineHeight || 1.6,
          color: '#111827',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          padding: '40px 48px',
        }}
      >
        {/* Split Header: name left, contact right, horizontal rule below */}
        <header
          style={{
            marginBottom: '26px',
            paddingBottom: '10px',
            borderBottom: '3px solid #000000',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '32px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1', minWidth: '220px' }}>
            {personalInfo.fullName && (
              <h1
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#000000',
                  margin: 0,
                  wordBreak: 'break-word',
                }}
              >
                {personalInfo.fullName}
              </h1>
            )}
            {personalInfo.jobTitle && (
              <p
                style={{
                  marginTop: '4px',
                  fontSize: '0.95rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#4b5563',
                }}
              >
                {personalInfo.jobTitle}
              </p>
            )}
          </div>

          {contactItems.length > 0 && (
            <div
              style={{
                minWidth: '220px',
                textAlign: 'right',
                fontSize: '0.8rem',
                color: '#111827',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {contactItems.map(({ Icon, text }, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '8px',
                    wordBreak: 'break-word',
                  }}
                >
                  <span>{text}</span>
                  <Icon size={14} color="#000000" />
                </div>
              ))}
            </div>
          )}
        </header>

        {/* One-column body with subtle vertical guide on left */}
        <div
          style={{
            position: 'relative',
            paddingLeft: '22px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: '#000000',
              opacity: 0.6,
            }}
          />

          {/* Summary / Profile */}
          {(personalInfo.summary || summarySection) && (
            <section
              style={{
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '8px',
                }}
              >
                Profile
              </h2>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#111827',
                  lineHeight: 1.7,
                  wordBreak: 'break-word',
                  textAlign: 'justify',
                }}
              >
                {personalInfo.summary || ''}
              </p>
            </section>
          )}

          {/* Experience */}
          {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
            <section style={{ marginBottom: '22px' }}>
              <h2
                style={{
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '10px',
                  paddingTop: '4px',
                  borderTop: '1px solid #d1d5db',
                }}
              >
                {experienceSection.title?.toUpperCase() || 'EXPERIENCE'}
              </h2>
              {experienceSection.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.98rem',
                        color: '#000000',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.title}
                    </div>
                    {item.date && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#4b5563',
                          textTransform: 'uppercase',
                          letterSpacing: '0.09em',
                        }}
                      >
                        {item.date}
                      </div>
                    )}
                  </div>
                  {item.subtitle && (
                    <div
                      style={{
                        fontSize: '0.86rem',
                        color: '#4b5563',
                        marginTop: '2px',
                      }}
                    >
                      {item.subtitle}
                    </div>
                  )}
                  {item.description && (
                    <ul
                      style={{
                        listStyle: 'none',
                        paddingLeft: 0,
                        marginTop: '6px',
                        fontSize: '0.86rem',
                        color: '#111827',
                        lineHeight: 1.6,
                      }}
                    >
                      {item.description
                        .split('\n')
                        .filter((line) => line.trim())
                        .map((line, lineIdx) => {
                          const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                          return (
                            <li
                              key={lineIdx}
                              style={{
                                position: 'relative',
                                paddingLeft: '14px',
                                marginBottom: '4px',
                              }}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                }}
                              >
                                •
                              </span>
                              {cleanLine}
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {educationSection && educationSection.items && educationSection.items.length > 0 && (
            <section style={{ marginBottom: '20px' }}>
              <h2
                style={{
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '8px',
                  paddingTop: '4px',
                  borderTop: '1px solid #d1d5db',
                }}
              >
                {educationSection.title?.toUpperCase() || 'EDUCATION'}
              </h2>
              {educationSection.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: '#000000',
                    }}
                  >
                    {item.subtitle || item.title}
                  </div>
                  {item.title && item.subtitle && (
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: '#4b5563',
                      }}
                    >
                      {item.title}
                    </div>
                  )}
                  {item.date && (
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#4b5563',
                        marginTop: '2px',
                      }}
                    >
                      {item.date}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {skillsSection && skillsSection.items && skillsSection.items.length > 0 && (
            <section style={{ marginBottom: '18px' }}>
              <h2
                style={{
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '8px',
                  paddingTop: '4px',
                  borderTop: '1px solid #d1d5db',
                }}
              >
                {skillsSection.title?.toUpperCase() || 'SKILLS'}
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px 14px',
                  fontSize: '0.82rem',
                  color: '#111827',
                }}
              >
                {skillsSection.items
                  .map((item) => item.title)
                  .filter(Boolean)
                  .map((skill, idx) => (
                    <span key={idx}>• {skill}</span>
                  ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projectsSection && projectsSection.items && projectsSection.items.length > 0 && (
            <section style={{ marginBottom: '18px' }}>
              <h2
                style={{
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '8px',
                  paddingTop: '4px',
                  borderTop: '1px solid #d1d5db',
                }}
              >
                {projectsSection.title?.toUpperCase() || 'PROJECTS'}
              </h2>
              {projectsSection.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: '#000000',
                    }}
                  >
                    {item.title}
                  </div>
                  {item.description && (
                    <p
                      style={{
                        fontSize: '0.86rem',
                        color: '#111827',
                        marginTop: '4px',
                      }}
                    >
                      {item.description.split('\n')[0]}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Languages */}
          {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
            <section style={{ marginBottom: '16px' }}>
              <h2
                style={{
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '8px',
                  paddingTop: '4px',
                  borderTop: '1px solid #d1d5db',
                }}
              >
                {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px 16px',
                  fontSize: '0.82rem',
                  color: '#111827',
                }}
              >
                {languagesSection.items.map((item, idx) => (
                  <span key={item.id || idx}>
                    {item.title}
                    {item.subtitle ? ` – ${item.subtitle}` : ''}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certificationsSection && certificationsSection.items && certificationsSection.items.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '8px',
                  paddingTop: '4px',
                  borderTop: '1px solid #d1d5db',
                }}
              >
                {certificationsSection.title?.toUpperCase() || 'CERTIFICATIONS'}
              </h2>
              {certificationsSection.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    marginBottom: '6px',
                    fontSize: '0.84rem',
                    color: '#111827',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{item.title}</span>
                  {item.subtitle && (
                    <span style={{ color: '#4b5563' }}>{` – ${item.subtitle}`}</span>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default ClassicSplitHeaderBW;








