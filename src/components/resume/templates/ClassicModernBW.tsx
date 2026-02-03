import React from 'react';
import { Phone, Mail, MapPin, Linkedin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicModernBWProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicModernBW: React.FC<ClassicModernBWProps> = ({ resumeData, settings }) => {
  const { personalInfo, sections } = resumeData;
  
  // Extract sections
  const summarySection = sections.find(s => s.type === 'personal' || s.id === 'summary');
  const experienceSection = sections.find(s => s.type === 'experience');
  const educationSection = sections.find(s => s.type === 'education');
  const skillsSection = sections.find(s => s.type === 'skills');
  const projectsSection = sections.find(s => s.type === 'projects');
  const languagesSection = sections.find(s => s.type === 'languages');
  
  // Split name into first and last
  const nameParts = personalInfo.fullName ? personalInfo.fullName.trim().split(/\s+/) : [];
  const firstName = nameParts.length > 0 ? nameParts[0] : '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  // Contact info items
  const contactItems = [
    { icon: Phone, text: personalInfo.phone, show: !!personalInfo.phone },
    { icon: Mail, text: personalInfo.email, show: !!personalInfo.email },
    { icon: Linkedin, text: personalInfo.linkedin, show: !!personalInfo.linkedin },
    { icon: MapPin, text: personalInfo.location, show: !!personalInfo.location },
  ].filter(item => item.show);
  
  // Get skills list
  const skillsList = skillsSection?.items?.map(item => item.title).filter(Boolean) || [];
  
  // Use font from settings or default to sans-serif
  const fontFamily = settings.fontFamily || "'Arial', 'Helvetica', sans-serif";
  
  return (
    <>
      <style>{`
        .resume-classic-modern-bw-override {
          background-color: #ffffff !important;
          background-image: 
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px);
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-modern-bw-override"
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
        {/* Header Section - Name on Left, Contact on Right */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '35px',
          paddingBottom: '20px',
        }}>
          {/* Name - Left Side */}
          <div style={{ flex: '1' }}>
            {personalInfo.fullName && (
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: 300,
                color: '#000000',
                lineHeight: '1.1',
                wordWrap: 'break-word',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                margin: 0,
              }}>
                {firstName && (
                  <span style={{ fontWeight: 300 }}>{firstName}</span>
                )}
                {lastName && (
                  <span style={{ fontWeight: 700, marginLeft: firstName ? '8px' : '0' }}>{lastName}</span>
                )}
                {!lastName && firstName && (
                  <span style={{ fontWeight: 700 }}>{firstName}</span>
                )}
              </h1>
            )}
          </div>

          {/* Contact Info - Right Side */}
          {contactItems.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'flex-end',
              fontSize: '0.75rem',
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
                      gap: '8px',
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

        {/* Two Column Layout */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          {/* Left Column (33%) */}
          <aside style={{ flex: '0 0 33%' }}>
            {/* Education Section */}
            {educationSection && educationSection.items && educationSection.items.length > 0 && (
              <section style={{ marginBottom: '35px' }}>
                <h2 style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  marginBottom: '20px',
                  color: '#000000',
                }}>
                  Education
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                    }}>
                      <div style={{
                        fontWeight: 600,
                        color: '#000000',
                        marginBottom: '4px',
                      }}>
                        {item.subtitle || item.title || ''}
                      </div>
                      {item.title && item.subtitle && (
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#4a4a4a',
                          marginBottom: '4px',
                        }}>
                          {item.title}
                        </div>
                      )}
                      {item.date && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#666666',
                          fontStyle: 'normal',
                        }}>
                          {item.date}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills Section */}
            {skillsList.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  marginBottom: '20px',
                  color: '#000000',
                }}>
                  Skills
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  {skillsList.map((skill, index) => (
                    <li key={index} style={{
                      fontSize: '0.85rem',
                      color: '#1a1a1a',
                      lineHeight: '1.5',
                      paddingLeft: '0',
                    }}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>

          {/* Right Column (67%) */}
          <main style={{ flex: '0 0 67%' }}>
            {/* Profile/Summary Section */}
            {(personalInfo.summary || summarySection) && (
              <section style={{ marginBottom: '35px' }}>
                <h2 style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  marginBottom: '18px',
                  color: '#000000',
                }}>
                  Profile
                </h2>
                <p style={{
                  fontSize: '0.9rem',
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
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  marginBottom: '25px',
                  color: '#000000',
                }}>
                  Work Experience
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {experienceSection.items.map((item, index) => (
                    <div key={item.id || index}>
                      {/* Job Title */}
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#000000',
                        marginBottom: '6px',
                      }}>
                        {item.title || 'YOUR JOB TITLE'}
                      </div>
                      
                      {/* Company, Location, Date */}
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#4a4a4a',
                        marginBottom: '12px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}>
                        {item.subtitle && (
                          <span>{item.subtitle}</span>
                        )}
                        {item.date && (
                          <span>{item.date}</span>
                        )}
                      </div>
                      
                      {/* Description */}
                      {item.description && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#1a1a1a',
                          lineHeight: '1.7',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }}>
                          {item.description.split('\n').map((line, lineIndex) => {
                            const cleanLine = line.trim();
                            if (!cleanLine) return null;
                            
                            // Check if it's a bullet point
                            const isBullet = /^[•\-\*]\s*/.test(cleanLine);
                            const cleanBulletLine = cleanLine.replace(/^[•\-\*]\s*/, '');
                            
                            if (isBullet) {
                              return (
                                <div key={lineIndex} style={{
                                  marginBottom: '6px',
                                  paddingLeft: '16px',
                                  position: 'relative',
                                }}>
                                  <span style={{
                                    position: 'absolute',
                                    left: 0,
                                    color: '#000000',
                                  }}>•</span>
                                  {cleanBulletLine}
                                </div>
                              );
                            } else {
                              return (
                                <p key={lineIndex} style={{
                                  marginBottom: '10px',
                                  marginTop: lineIndex === 0 ? 0 : '10px',
                                }}>
                                  {cleanLine}
                                </p>
                              );
                            }
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Section */}
            {projectsSection && projectsSection.items && projectsSection.items.length > 0 && (
              <section style={{ marginTop: '35px' }}>
                <h2 style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  marginBottom: '25px',
                  color: '#000000',
                }}>
                  Projects
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {projectsSection.items.map((item, index) => (
                    <div key={item.id || index}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#000000',
                        marginBottom: '6px',
                      }}>
                        {item.title || ''}
                      </div>
                      {item.description && (
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#1a1a1a',
                          lineHeight: '1.7',
                          wordWrap: 'break-word',
                          marginBottom: '6px',
                        }}>
                          {item.description.split('\n')[0]}
                        </p>
                      )}
                      {item.subtitle && (
                        <a href={item.subtitle} style={{
                          color: '#000000',
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          borderBottom: '1px solid #000000',
                        }}>
                          {item.subtitle.includes('http') ? 'View Project' : item.subtitle}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default ClassicModernBW;






















