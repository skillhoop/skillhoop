import React from 'react';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicBalancedBWProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicBalancedBW: React.FC<ClassicBalancedBWProps> = ({ resumeData, settings }) => {
  const { personalInfo, sections } = resumeData;
  
  // Extract sections
  const summarySection = sections.find(s => s.type === 'personal' || s.id === 'summary');
  const experienceSection = sections.find(s => s.type === 'experience');
  const educationSection = sections.find(s => s.type === 'education');
  const skillsSection = sections.find(s => s.type === 'skills');
  const projectsSection = sections.find(s => s.type === 'projects');
  const languagesSection = sections.find(s => s.type === 'languages');
  const certificationsSection = sections.find(s => s.type === 'certifications');
  
  // Contact info items
  const contactItems = [
    { icon: Phone, text: personalInfo.phone, show: !!personalInfo.phone },
    { icon: Mail, text: personalInfo.email, show: !!personalInfo.email },
    { icon: Globe, text: personalInfo.website, show: !!personalInfo.website },
    { icon: MapPin, text: personalInfo.location, show: !!personalInfo.location },
  ].filter(item => item.show);
  
  // Get skills list
  const skillsList = skillsSection?.items?.map(item => item.title).filter(Boolean) || [];
  
  // Use font from settings or default
  const fontFamily = settings.fontFamily || "'Times New Roman', 'Georgia', serif";
  
  return (
    <>
      <style>{`
        .resume-classic-balanced-bw-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-balanced-bw-override"
        style={{
          fontFamily: fontFamily,
          fontSize: `${settings.fontSize || 10}pt`,
          lineHeight: settings.lineHeight || 1.6,
          color: '#1a1a1a',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          padding: '40px 45px',
        }}
      >
        {/* Header Section */}
        <header style={{
          marginBottom: '30px',
          paddingBottom: '16px',
          borderBottom: '2px solid #000000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '20px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 200px' }}>
            {personalInfo.fullName && (
              <h1 style={{
                fontSize: '2.1rem',
                fontWeight: 700,
                color: '#000000',
                marginBottom: '4px',
                lineHeight: '1.1',
                wordWrap: 'break-word',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}>
                {personalInfo.fullName}
              </h1>
            )}
            {personalInfo.jobTitle && (
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 400,
                color: '#4a4a4a',
                wordWrap: 'break-word',
                letterSpacing: '1px',
              }}>
                {personalInfo.jobTitle}
              </h2>
            )}
          </div>
          {contactItems.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.8rem',
              color: '#1a1a1a',
              textAlign: 'right',
            }}>
              {contactItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'flex-end',
                      wordWrap: 'break-word',
                    }}
                  >
                    <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                    <Icon size={14} color="#000000" />
                  </div>
                );
              })}
            </div>
          )}
        </header>

        {/* Two Column Layout */}
        <div style={{ display: 'flex', gap: '35px', alignItems: 'flex-start' }}>
          {/* Left Column (50%) - Summary & Experience */}
          <div style={{ flex: '0 0 50%' }}>
            {/* Summary Section */}
            {(personalInfo.summary || summarySection) && (
              <section style={{ marginBottom: '24px' }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '10px',
                  color: '#000000',
                }}>
                  Summary
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#1a1a1a',
                  lineHeight: '1.7',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  margin: 0,
                }}>
                  {personalInfo.summary || ''}
                </p>
              </section>
            )}

            {/* Work Experience Section */}
            {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '14px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {experienceSection.title?.toUpperCase() || 'EXPERIENCE'}
                </h2>
                {experienceSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: '18px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: '#000000',
                      }}>
                        {item.title || ''}
                      </div>
                      {item.date && (
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#4a4a4a',
                          fontWeight: 400,
                        }}>
                          {item.date}
                        </div>
                      )}
                    </div>
                    {item.subtitle && (
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#4a4a4a',
                        marginBottom: '6px',
                        fontWeight: 400,
                      }}>
                        {item.subtitle}
                      </div>
                    )}
                    {item.description && (
                      <ul style={{
                        listStyle: 'none',
                        paddingLeft: 0,
                        fontSize: '0.85rem',
                        color: '#1a1a1a',
                        lineHeight: '1.6',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        margin: 0,
                      }}>
                        {item.description.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
                          const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                          return (
                            <li
                              key={lineIndex}
                              style={{
                                marginBottom: '6px',
                                paddingLeft: '14px',
                                position: 'relative',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                              }}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  color: '#000000',
                                  fontSize: '0.7rem',
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
          </div>

          {/* Right Column (50%) - Skills, Education, etc. */}
          <div style={{ flex: '0 0 50%' }}>
            {/* Skills Section */}
            {skillsList.length > 0 && (
              <section style={{ marginBottom: '24px' }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '12px',
                  color: '#000000',
                }}>
                  {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '8px 18px',
                  }}
                >
                  {skillsList.map((skill, index) => (
                    <div
                      key={index}
                      style={{
                        fontSize: '0.85rem',
                        color: '#1a1a1a',
                        lineHeight: '1.5',
                      }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education Section */}
            {educationSection && educationSection.items && educationSection.items.length > 0 && (
              <section style={{ marginBottom: '24px' }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '12px',
                  color: '#000000',
                }}>
                  {educationSection.title?.toUpperCase() || 'EDUCATION'}
                </h2>
                {educationSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: '14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: '#000000',
                            marginBottom: '4px',
                          }}
                        >
                          {item.subtitle || item.title || ''}
                        </div>
                        {item.title && item.subtitle && (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: '#4a4a4a',
                            }}
                          >
                            {item.title}
                          </div>
                        )}
                      </div>
                      {item.date && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#4a4a4a',
                            fontWeight: 400,
                          }}
                        >
                          {item.date}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Projects Section */}
            {projectsSection && projectsSection.items && projectsSection.items.length > 0 && (
              <section style={{ marginBottom: '24px' }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '12px',
                  color: '#000000',
                }}>
                  {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                </h2>
                {projectsSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#000000',
                        marginBottom: '4px',
                      }}
                    >
                      {item.title || ''}
                    </div>
                    {item.description && (
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: '#1a1a1a',
                          lineHeight: '1.6',
                          margin: 0,
                          marginBottom: '4px',
                        }}
                      >
                        {item.description.split('\n')[0]}
                      </p>
                    )}
                    {item.subtitle && (
                      <a
                        href={item.subtitle}
                        style={{
                          color: '#000000',
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          fontWeight: 400,
                          borderBottom: '1px solid #000000',
                        }}
                      >
                        {item.subtitle.includes('http') ? 'View Project →' : item.subtitle}
                      </a>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Languages Section */}
            {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
              <section style={{ marginBottom: '24px' }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '12px',
                  color: '#000000',
                }}>
                  {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
                </h2>
                <ul
                  style={{
                    listStyle: 'none',
                    paddingLeft: 0,
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#1a1a1a',
                  }}
                >
                  {languagesSection.items.map((item, index) => (
                    <li key={item.id || index} style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#000000' }}>{item.title || ''}</strong>
                      {item.subtitle &&
                        ` - ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Certifications Section */}
            {certificationsSection && certificationsSection.items && certificationsSection.items.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '12px',
                  color: '#000000',
                }}>
                  {certificationsSection.title?.toUpperCase() || 'CERTIFICATIONS'}
                </h2>
                <ul
                  style={{
                    listStyle: 'none',
                    paddingLeft: 0,
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#1a1a1a',
                  }}
                >
                  {certificationsSection.items.map((item, index) => (
                    <li key={item.id || index} style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#000000' }}>{item.title || ''}</strong>
                      {item.subtitle && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#4a4a4a',
                            marginTop: '2px',
                          }}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClassicBalancedBW;







