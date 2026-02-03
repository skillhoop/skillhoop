import React from 'react';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicMinimalBWProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicMinimalBW: React.FC<ClassicMinimalBWProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Arial', 'Helvetica', sans-serif";
  
  return (
    <>
      <style>{`
        .resume-classic-minimal-bw-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-minimal-bw-override"
        style={{
          fontFamily: fontFamily,
          fontSize: `${settings.fontSize || 10}pt`,
          lineHeight: settings.lineHeight || 1.7,
          color: '#1a1a1a',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          padding: '50px 60px',
        }}
      >
        {/* Minimal Header */}
        <header style={{
          marginBottom: '40px',
          textAlign: 'center',
        }}>
          {personalInfo.fullName && (
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 300,
              color: '#000000',
              marginBottom: '8px',
              lineHeight: '1.2',
              wordWrap: 'break-word',
              letterSpacing: '2px',
            }}>
              {personalInfo.fullName}
            </h1>
          )}
          {personalInfo.jobTitle && (
            <h2 style={{
              fontSize: '0.95rem',
              fontWeight: 300,
              color: '#666666',
              wordWrap: 'break-word',
              letterSpacing: '1px',
              marginBottom: '20px',
            }}>
              {personalInfo.jobTitle}
            </h2>
          )}
          
          {/* Contact Info - Centered */}
          {contactItems.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              fontSize: '0.8rem',
              color: '#4a4a4a',
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
                    <Icon size={13} color="#666666" />
                    <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </header>

        {/* Main Content - Single Column */}
        <main>
          {/* Summary Section */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ 
              marginBottom: '35px',
            }}>
              <h2 style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                fontWeight: 400,
                letterSpacing: '3px',
                marginBottom: '15px',
                color: '#000000',
              }}>
                Summary
              </h2>
              <p style={{
                fontSize: '0.95rem',
                color: '#1a1a1a',
                lineHeight: '1.8',
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
            <section style={{ marginBottom: '35px' }}>
              <h2 style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                fontWeight: 400,
                letterSpacing: '3px',
                marginBottom: '22px',
                color: '#000000',
              }}>
                {experienceSection.title?.toUpperCase() || 'EXPERIENCE'}
              </h2>
              {experienceSection.items.map((item, index) => (
                <div key={item.id || index} style={{ 
                  marginBottom: '28px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '6px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{
                      fontWeight: 400,
                      fontSize: '1rem',
                      color: '#000000',
                    }}>
                      {item.title || ''}
                    </div>
                    {item.date && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#666666',
                        fontStyle: 'normal',
                        fontWeight: 300,
                      }}>
                        {item.date}
                      </div>
                    )}
                  </div>
                  {item.subtitle && (
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666666',
                      marginBottom: '12px',
                      fontWeight: 300,
                      fontStyle: 'italic',
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
                      lineHeight: '1.8',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      margin: 0,
                    }}>
                      {item.description.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
                        const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                        return (
                          <li key={lineIndex} style={{ 
                            marginBottom: '8px',
                            paddingLeft: '18px',
                            position: 'relative',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                          }}>
                            <span style={{
                              position: 'absolute',
                              left: 0,
                              color: '#666666',
                              fontSize: '0.6rem',
                            }}>○</span>
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

          {/* Two Column Layout for Skills, Education, etc. */}
          <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
            {/* Left Column (50%) */}
            <div style={{ flex: '0 0 50%' }}>
              {/* Skills Section */}
              {skillsList.length > 0 && (
                <section style={{ marginBottom: '35px' }}>
                  <h2 style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    fontWeight: 400,
                    letterSpacing: '3px',
                    marginBottom: '15px',
                    color: '#000000',
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
                        fontSize: '0.9rem',
                        color: '#1a1a1a',
                        lineHeight: '1.6',
                        paddingLeft: '0',
                        fontWeight: 300,
                      }}>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Education Section */}
              {educationSection && educationSection.items && educationSection.items.length > 0 && (
                <section>
                  <h2 style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    fontWeight: 400,
                    letterSpacing: '3px',
                    marginBottom: '15px',
                    color: '#000000',
                  }}>
                    {educationSection.title?.toUpperCase() || 'EDUCATION'}
                  </h2>
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '18px',
                    }}>
                      <div style={{ fontWeight: 400, fontSize: '0.95rem', color: '#000000', marginBottom: '4px' }}>
                        {item.subtitle || item.title || ''}
                      </div>
                      {item.title && item.subtitle && (
                        <div style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '4px', fontWeight: 300 }}>
                          {item.title}
                        </div>
                      )}
                      {item.date && (
                        <div style={{ fontSize: '0.8rem', color: '#666666', fontStyle: 'normal', fontWeight: 300 }}>
                          {item.date}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>

            {/* Right Column (50%) */}
            <div style={{ flex: '0 0 50%' }}>
              {/* Projects Section */}
              {projectsSection && projectsSection.items && projectsSection.items.length > 0 && (
                <section style={{ marginBottom: '35px' }}>
                  <h2 style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    fontWeight: 400,
                    letterSpacing: '3px',
                    marginBottom: '15px',
                    color: '#000000',
                  }}>
                    {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                  </h2>
                  {projectsSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '18px',
                    }}>
                      <div style={{
                        fontWeight: 400,
                        fontSize: '0.95rem',
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
                          lineHeight: '1.7',
                          wordWrap: 'break-word',
                          margin: 0,
                        }}>
                          {item.description.split('\n')[0]}
                        </p>
                      )}
                      {item.subtitle && (
                        <a href={item.subtitle} style={{
                          color: '#666666',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          fontWeight: 300,
                          borderBottom: '1px solid #666666',
                        }}>
                          {item.subtitle.includes('http') ? 'View Project' : item.subtitle}
                        </a>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Languages Section */}
              {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
                <section style={{ marginBottom: '35px' }}>
                  <h2 style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    fontWeight: 400,
                    letterSpacing: '3px',
                    marginBottom: '15px',
                    color: '#000000',
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
                        marginBottom: '10px',
                        fontSize: '0.9rem',
                        color: '#1a1a1a',
                        fontWeight: 300,
                      }}>
                        <strong style={{ color: '#000000', fontWeight: 400 }}>{item.title || ''}</strong>
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
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    fontWeight: 400,
                    letterSpacing: '3px',
                    marginBottom: '15px',
                    color: '#000000',
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
                        marginBottom: '10px',
                        fontSize: '0.9rem',
                        color: '#1a1a1a',
                        fontWeight: 300,
                      }}>
                        <strong style={{ color: '#000000', fontWeight: 400 }}>{item.title || ''}</strong>
                        {item.subtitle && (
                          <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '4px', fontWeight: 300 }}>
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
        </main>
      </div>
    </>
  );
};

export default ClassicMinimalBW;






















