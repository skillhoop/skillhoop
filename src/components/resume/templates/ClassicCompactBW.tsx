import React from 'react';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicCompactBWProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicCompactBW: React.FC<ClassicCompactBWProps> = ({ resumeData, settings }) => {
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
        .resume-classic-compact-bw-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-compact-bw-override"
        style={{
          fontFamily: fontFamily,
          fontSize: `${settings.fontSize || 9}pt`,
          lineHeight: settings.lineHeight || 1.5,
          color: '#1a1a1a',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          padding: '35px 45px',
        }}
      >
        {/* Compact Header */}
        <header style={{
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '2px solid #000000',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '12px',
          }}>
            {/* Name and Title */}
            <div style={{ flex: '1', minWidth: '200px' }}>
              {personalInfo.fullName && (
                <h1 style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#000000',
                  marginBottom: '4px',
                  lineHeight: '1.1',
                  wordWrap: 'break-word',
                  letterSpacing: '1px',
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
                }}>
                  {personalInfo.jobTitle}
                </h2>
              )}
            </div>

            {/* Contact Info - Compact Row */}
            {contactItems.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '0.75rem',
                color: '#1a1a1a',
                alignItems: 'center',
              }}>
                {contactItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        wordWrap: 'break-word',
                      }}
                    >
                      <Icon size={12} color="#000000" />
                      <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {/* Main Content - Two Column Layout */}
        <div style={{ display: 'flex', gap: '35px', alignItems: 'flex-start' }}>
          {/* Left Column (60%) */}
          <div style={{ flex: '0 0 60%' }}>
            {/* Summary Section */}
            {(personalInfo.summary || summarySection) && (
              <section style={{ 
                marginBottom: '22px',
                padding: '15px 18px',
                background: '#f5f5f5',
                borderRadius: '0',
                borderLeft: '3px solid #000000',
              }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '8px',
                  color: '#000000',
                }}>
                  Summary
                </h2>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#1a1a1a',
                  lineHeight: '1.6',
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
              <section style={{ marginBottom: '22px' }}>
                <h2 style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '15px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {experienceSection.title?.toUpperCase() || 'EXPERIENCE'}
                </h2>
                {experienceSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ 
                    marginBottom: '18px',
                  }}>
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
                          fontSize: '0.75rem',
                          color: '#4a4a4a',
                          fontStyle: 'normal',
                          fontWeight: 500,
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
                        fontWeight: 500,
                        fontStyle: 'italic',
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
                            <li key={lineIndex} style={{ 
                              marginBottom: '4px',
                              paddingLeft: '14px',
                              position: 'relative',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                            }}>
                              <span style={{
                                position: 'absolute',
                                left: 0,
                                color: '#000000',
                                fontSize: '0.7rem',
                              }}>•</span>
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

            {/* Projects Section */}
            {projectsSection && projectsSection.items && projectsSection.items.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '15px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                </h2>
                {projectsSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ 
                    marginBottom: '14px',
                    padding: '12px',
                    background: '#f5f5f5',
                    borderRadius: '0',
                    borderLeft: '3px solid #000000',
                  }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      marginBottom: '4px',
                      color: '#000000',
                    }}>
                      {item.title || ''}
                    </div>
                    {item.description && (
                      <p style={{ 
                        fontSize: '0.85rem', 
                        color: '#1a1a1a', 
                        marginBottom: '4px',
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        margin: 0,
                      }}>
                        {item.description.split('\n')[0]}
                      </p>
                    )}
                    {item.subtitle && (
                      <a href={item.subtitle} style={{
                        color: '#000000',
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        fontWeight: 500,
                        borderBottom: '1px solid #000000',
                      }}>
                        {item.subtitle.includes('http') ? 'View →' : item.subtitle}
                      </a>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Right Column (40%) */}
          <div style={{ flex: '0 0 40%' }}>
            {/* Skills Section */}
            {skillsList.length > 0 && (
              <section style={{ marginBottom: '22px' }}>
                <h2 style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  {skillsList.map((skill, index) => (
                    <li key={index} style={{
                      fontSize: '0.85rem',
                      color: '#1a1a1a',
                      lineHeight: '1.4',
                      paddingLeft: '12px',
                      position: 'relative',
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: '#000000',
                        fontSize: '0.7rem',
                      }}>•</span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Education Section */}
            {educationSection && educationSection.items && educationSection.items.length > 0 && (
              <section style={{ marginBottom: '22px' }}>
                <h2 style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {educationSection.title?.toUpperCase() || 'EDUCATION'}
                </h2>
                {educationSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ 
                    marginBottom: '14px',
                    padding: '12px',
                    backgroundColor: '#ffffff',
                    borderRadius: '0',
                    borderLeft: '3px solid #000000',
                    borderTop: '1px solid #d0d0d0',
                    borderRight: '1px solid #d0d0d0',
                    borderBottom: '1px solid #d0d0d0',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#000000', marginBottom: '4px' }}>
                      {item.subtitle || item.title || ''}
                    </div>
                    {item.title && item.subtitle && (
                      <div style={{ fontSize: '0.8rem', color: '#4a4a4a', marginBottom: '4px' }}>
                        {item.title}
                      </div>
                    )}
                    {item.date && (
                      <div style={{ fontSize: '0.75rem', color: '#4a4a4a', fontStyle: 'normal', fontWeight: 500 }}>
                        {item.date}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Languages Section */}
            {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
              <section style={{ marginBottom: '22px' }}>
                <h2 style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: 0,
                  margin: 0,
                }}>
                  {languagesSection.items.map((item, index) => (
                    <li key={item.id || index} style={{
                      marginBottom: '8px',
                      fontSize: '0.85rem',
                      color: '#1a1a1a',
                      padding: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0',
                      borderLeft: '3px solid #000000',
                      borderTop: '1px solid #d0d0d0',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                    }}>
                      <strong style={{ color: '#000000' }}>{item.title || ''}</strong>
                      {item.subtitle && ` - ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Certifications Section */}
            {certificationsSection && certificationsSection.items && certificationsSection.items.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {certificationsSection.title?.toUpperCase() || 'CERTIFICATIONS'}
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: 0,
                  margin: 0,
                }}>
                  {certificationsSection.items.map((item, index) => (
                    <li key={item.id || index} style={{
                      marginBottom: '8px',
                      fontSize: '0.85rem',
                      color: '#1a1a1a',
                      padding: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0',
                      borderLeft: '3px solid #000000',
                      borderTop: '1px solid #d0d0d0',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                    }}>
                      <strong style={{ color: '#000000' }}>{item.title || ''}</strong>
                      {item.subtitle && (
                        <div style={{ fontSize: '0.75rem', color: '#4a4a4a', marginTop: '4px' }}>
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

export default ClassicCompactBW;






