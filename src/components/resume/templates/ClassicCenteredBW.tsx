import React from 'react';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicCenteredBWProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicCenteredBW: React.FC<ClassicCenteredBWProps> = ({ resumeData, settings }) => {
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
        .resume-classic-centered-bw-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-centered-bw-override"
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
        }}
      >
        {/* Centered Header Section */}
        <header style={{
          background: '#ffffff',
          padding: '40px 50px 30px',
          textAlign: 'center',
          borderBottom: '4px solid #000000',
        }}>
          {personalInfo.fullName && (
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#000000',
              marginBottom: '8px',
              lineHeight: '1.1',
              wordWrap: 'break-word',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
              {personalInfo.fullName}
            </h1>
          )}
          {personalInfo.jobTitle && (
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 400,
              color: '#4a4a4a',
              marginBottom: '20px',
              wordWrap: 'break-word',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              {personalInfo.jobTitle}
            </h2>
          )}
          
          {/* Contact Information - Centered with Icons */}
          {contactItems.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              fontSize: '0.85rem',
              color: '#1a1a1a',
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
                      wordWrap: 'break-word',
                    }}
                  >
                    <Icon size={14} color="#000000" />
                    <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </header>

        {/* Main Content */}
        <div style={{ padding: '35px 50px' }}>
          {/* Summary Section - Full Width */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ 
              marginBottom: '30px',
              padding: '20px 24px',
              background: '#f8f8f8',
              borderRadius: '0',
              borderLeft: '5px solid #000000',
              borderTop: '1px solid #d0d0d0',
              borderRight: '1px solid #d0d0d0',
              borderBottom: '1px solid #d0d0d0',
            }}>
              <h2 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '12px',
                color: '#000000',
              }}>
                Professional Summary
              </h2>
              <p style={{
                fontSize: '0.95rem',
                color: '#1a1a1a',
                lineHeight: '1.7',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}>
                {personalInfo.summary || ''}
              </p>
            </section>
          )}

          {/* Two Column Layout - Asymmetric (55% / 45%) */}
          <div style={{ display: 'flex', gap: '35px', alignItems: 'flex-start' }}>
            {/* Left Column - Experience and Projects (55%) */}
            <div style={{ flex: '0 0 55%' }}>
              {/* Work Experience Section */}
              {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '18px',
                    color: '#000000',
                    borderBottom: '3px solid #000000',
                    paddingBottom: '8px',
                  }}>
                    {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
                  </h2>
                  {experienceSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '20px',
                      paddingBottom: '20px',
                      borderBottom: index < experienceSection.items.length - 1 ? '1px solid #e0e0e0' : 'none',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '6px',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: '#000000',
                        }}>
                          {item.title || ''}
                        </div>
                        {item.date && (
                          <div style={{
                            fontSize: '0.85rem',
                            color: '#4a4a4a',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            background: '#f5f5f5',
                            padding: '4px 12px',
                            borderRadius: '0',
                            border: '1px solid #000000',
                          }}>
                            {item.date}
                          </div>
                        )}
                      </div>
                      {item.subtitle && (
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#4a4a4a',
                          marginBottom: '10px',
                          fontWeight: 500,
                        }}>
                          {item.subtitle}
                        </div>
                      )}
                      {item.description && (
                        <ul style={{
                          listStyle: 'none',
                          paddingLeft: 0,
                          fontSize: '0.9rem',
                          color: '#1a1a1a',
                          lineHeight: '1.7',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }}>
                          {item.description.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
                            const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                            return (
                              <li key={lineIndex} style={{ 
                                marginBottom: '6px',
                                paddingLeft: '16px',
                                position: 'relative',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                              }}>
                                <span style={{
                                  position: 'absolute',
                                  left: 0,
                                  color: '#000000',
                                  fontSize: '0.7rem',
                                }}>▸</span>
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
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '18px',
                    color: '#000000',
                    borderBottom: '3px solid #000000',
                    paddingBottom: '8px',
                  }}>
                    {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                  </h2>
                  {projectsSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '16px',
                      padding: '16px',
                      background: '#f8f8f8',
                      borderRadius: '0',
                      borderLeft: '4px solid #000000',
                      borderTop: '1px solid #d0d0d0',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        marginBottom: '6px',
                        color: '#000000',
                      }}>
                        {item.title || ''}
                      </div>
                      {item.description && (
                        <p style={{ 
                          fontSize: '0.9rem', 
                          color: '#1a1a1a', 
                          marginBottom: '6px',
                          lineHeight: '1.6',
                          wordWrap: 'break-word',
                        }}>
                          {item.description.split('\n')[0]}
                        </p>
                      )}
                      {item.subtitle && (
                        <a href={item.subtitle} style={{
                          color: '#000000',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          fontWeight: 500,
                          borderBottom: '1px solid #000000',
                        }}>
                          {item.subtitle.includes('http') ? 'View Project →' : item.subtitle}
                        </a>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>

            {/* Right Column - Education, Skills, Languages, Certifications (45%) */}
            <div style={{ flex: '0 0 45%' }}>
              {/* Education Section */}
              {educationSection && educationSection.items && educationSection.items.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '16px',
                    color: '#000000',
                    borderBottom: '3px solid #000000',
                    paddingBottom: '8px',
                  }}>
                    {educationSection.title?.toUpperCase() || 'EDUCATION'}
                  </h2>
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '16px',
                      padding: '14px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0',
                      borderLeft: '3px solid #000000',
                      borderTop: '1px solid #d0d0d0',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#000000', marginBottom: '4px' }}>
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

              {/* Skills Section */}
              {skillsList.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '16px',
                    color: '#000000',
                    borderBottom: '3px solid #000000',
                    paddingBottom: '8px',
                  }}>
                    {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                  </h2>
                  <ul style={{
                    listStyle: 'none',
                    paddingLeft: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}>
                    {skillsList.map((skill, index) => (
                      <li key={index} style={{
                        fontSize: '0.85rem',
                        color: '#1a1a1a',
                        lineHeight: '1.5',
                        paddingLeft: '14px',
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

              {/* Languages Section */}
              {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '16px',
                    color: '#000000',
                    borderBottom: '3px solid #000000',
                    paddingBottom: '8px',
                  }}>
                    {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
                  </h2>
                  <ul style={{
                    listStyle: 'none',
                    paddingLeft: 0,
                  }}>
                    {languagesSection.items.map((item, index) => (
                      <li key={item.id || index} style={{
                        marginBottom: '10px',
                        fontSize: '0.85rem',
                        color: '#1a1a1a',
                        padding: '10px',
                        backgroundColor: '#ffffff',
                        borderRadius: '0',
                        borderLeft: '3px solid #000000',
                        borderTop: '1px solid #d0d0d0',
                        borderRight: '1px solid #d0d0d0',
                        borderBottom: '1px solid #d0d0d0',
                      }}>
                        <strong style={{ color: '#000000', fontWeight: 700 }}>{item.title || ''}</strong>
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
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '16px',
                    color: '#000000',
                    borderBottom: '3px solid #000000',
                    paddingBottom: '8px',
                  }}>
                    {certificationsSection.title?.toUpperCase() || 'CERTIFICATIONS'}
                  </h2>
                  <ul style={{
                    listStyle: 'none',
                    paddingLeft: 0,
                  }}>
                    {certificationsSection.items.map((item, index) => (
                      <li key={item.id || index} style={{
                        marginBottom: '10px',
                        fontSize: '0.85rem',
                        color: '#1a1a1a',
                        padding: '10px',
                        backgroundColor: '#ffffff',
                        borderRadius: '0',
                        borderLeft: '3px solid #000000',
                        borderTop: '1px solid #d0d0d0',
                        borderRight: '1px solid #d0d0d0',
                        borderBottom: '1px solid #d0d0d0',
                      }}>
                        <strong style={{ color: '#000000', fontWeight: 700 }}>{item.title || ''}</strong>
                        {item.subtitle && (
                          <div style={{ fontSize: '0.8rem', color: '#4a4a4a', marginTop: '4px' }}>
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
      </div>
    </>
  );
};

export default ClassicCenteredBW;






