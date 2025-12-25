import React from 'react';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicSidebarBWProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicSidebarBW: React.FC<ClassicSidebarBWProps> = ({ resumeData, settings }) => {
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
  
  // Group skills if they have subtitles (categories)
  const groupSkillsByCategory = () => {
    if (!skillsSection?.items || skillsSection.items.length === 0) return {};
    
    const grouped: Record<string, string[]> = {};
    skillsSection.items.forEach(item => {
      const category = item.subtitle || 'Technical Skills';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      if (item.title) {
        grouped[category].push(item.title);
      }
    });
    return grouped;
  };
  
  const skillsByCategory = groupSkillsByCategory();
  const skillCategories = Object.keys(skillsByCategory);
  
  // Use font from settings or default
  const fontFamily = settings.fontFamily || "'Times New Roman', 'Georgia', serif";
  
  return (
    <>
      <style>{`
        .resume-classic-sidebar-bw-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-sidebar-bw-override"
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
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Section - Full Width */}
        <header style={{
          background: '#ffffff',
          padding: '35px 50px',
          borderBottom: '3px solid #000000',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}>
            {/* Name and Title - Left */}
            <div style={{ flex: '1', minWidth: '250px' }}>
              {personalInfo.fullName && (
                <h1 style={{
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  color: '#000000',
                  marginBottom: '5px',
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

            {/* Contact Information - Right */}
            {contactItems.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
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
                        gap: '8px',
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
          </div>
        </header>

        {/* Main Content - Sidebar Layout */}
        <div style={{ 
          display: 'flex', 
          flex: '1',
          alignItems: 'flex-start',
        }}>
          {/* Left Sidebar - Narrow (25%) */}
          <aside style={{
            width: '25%',
            minWidth: '150px',
            background: '#f8f8f8',
            padding: '30px 20px',
            borderRight: '2px solid #000000',
            height: '100%',
          }}>
            {/* Summary Section in Sidebar */}
            {(personalInfo.summary || summarySection) && (
              <section style={{ marginBottom: '30px' }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  Summary
                </h2>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#1a1a1a',
                  lineHeight: '1.6',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}>
                  {(personalInfo.summary || '').substring(0, 200)}
                  {(personalInfo.summary || '').length > 200 ? '...' : ''}
                </p>
              </section>
            )}

            {/* Skills Section */}
            {skillCategories.length > 0 && (
              <section style={{ marginBottom: '30px' }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '14px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                </h2>
                {skillCategories.map((category, catIndex) => (
                  <div key={catIndex} style={{ marginBottom: '16px' }}>
                    <span style={{
                      fontWeight: 600,
                      marginBottom: '6px',
                      display: 'block',
                      fontSize: '0.75rem',
                      color: '#000000',
                    }}>
                      {category}
                    </span>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}>
                      {skillsByCategory[category].map((skill, skillIndex) => (
                        <span key={skillIndex} style={{
                          fontSize: '0.7rem',
                          color: '#1a1a1a',
                          fontWeight: 400,
                          paddingLeft: '8px',
                          position: 'relative',
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            color: '#000000',
                            fontSize: '0.6rem',
                          }}>•</span>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Education Section */}
            {educationSection && educationSection.items && educationSection.items.length > 0 && (
              <section style={{ marginBottom: '30px' }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '14px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {educationSection.title?.toUpperCase() || 'EDUCATION'}
                </h2>
                {educationSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ 
                    marginBottom: '14px',
                    padding: '10px',
                    backgroundColor: '#ffffff',
                    borderRadius: '0',
                    borderLeft: '3px solid #000000',
                    borderTop: '1px solid #d0d0d0',
                    borderRight: '1px solid #d0d0d0',
                    borderBottom: '1px solid #d0d0d0',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.75rem', color: '#000000', marginBottom: '3px' }}>
                      {item.subtitle || item.title || ''}
                    </div>
                    {item.title && item.subtitle && (
                      <div style={{ fontSize: '0.7rem', color: '#4a4a4a', marginBottom: '3px' }}>
                        {item.title}
                      </div>
                    )}
                    {item.date && (
                      <div style={{ fontSize: '0.65rem', color: '#4a4a4a', fontStyle: 'normal', fontWeight: 500 }}>
                        {item.date}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Languages Section */}
            {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
              <section style={{ marginBottom: '30px' }}>
                <h2 style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '14px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: 0,
                }}>
                  {languagesSection.items.map((item, index) => (
                    <li key={item.id || index} style={{
                      marginBottom: '8px',
                      fontSize: '0.75rem',
                      color: '#1a1a1a',
                      padding: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0',
                      borderLeft: '3px solid #000000',
                      borderTop: '1px solid #d0d0d0',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                    }}>
                      <strong style={{ color: '#000000', fontWeight: 600 }}>{item.title || ''}</strong>
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
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: '14px',
                  color: '#000000',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '6px',
                }}>
                  {certificationsSection.title?.toUpperCase() || 'CERTIFICATIONS'}
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: 0,
                }}>
                  {certificationsSection.items.map((item, index) => (
                    <li key={item.id || index} style={{
                      marginBottom: '8px',
                      fontSize: '0.75rem',
                      color: '#1a1a1a',
                      padding: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0',
                      borderLeft: '3px solid #000000',
                      borderTop: '1px solid #d0d0d0',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                    }}>
                      <strong style={{ color: '#000000', fontWeight: 600 }}>{item.title || ''}</strong>
                      {item.subtitle && (
                        <div style={{ fontSize: '0.7rem', color: '#4a4a4a', marginTop: '3px' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>

          {/* Main Content Area - Wide (75%) */}
          <main style={{
            flex: '1',
            padding: '30px 40px',
            background: '#ffffff',
          }}>
            {/* Work Experience Section */}
            {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
              <section style={{ marginBottom: '30px' }}>
                <h2 style={{
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  color: '#000000',
                  borderBottom: '3px solid #000000',
                  paddingBottom: '10px',
                }}>
                  {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
                </h2>
                {experienceSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ 
                    marginBottom: '24px',
                    paddingBottom: '24px',
                    borderBottom: index < experienceSection.items.length - 1 ? '1px solid #e0e0e0' : 'none',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
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
                        fontSize: '0.95rem',
                        color: '#4a4a4a',
                        marginBottom: '12px',
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
                              marginBottom: '8px',
                              paddingLeft: '18px',
                              position: 'relative',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                            }}>
                              <span style={{
                                position: 'absolute',
                                left: 0,
                                color: '#000000',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                              }}>▪</span>
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
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  color: '#000000',
                  borderBottom: '3px solid #000000',
                  paddingBottom: '10px',
                }}>
                  {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                </h2>
                {projectsSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ 
                    marginBottom: '18px',
                    padding: '18px',
                    background: '#f8f8f8',
                    borderRadius: '0',
                    borderLeft: '4px solid #000000',
                    borderTop: '1px solid #d0d0d0',
                    borderRight: '1px solid #d0d0d0',
                    borderBottom: '1px solid #d0d0d0',
                  }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      marginBottom: '8px',
                      color: '#000000',
                    }}>
                      {item.title || ''}
                    </div>
                    {item.description && (
                      <p style={{ 
                        fontSize: '0.9rem', 
                        color: '#1a1a1a', 
                        marginBottom: '8px',
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
          </main>
        </div>
      </div>
    </>
  );
};

export default ClassicSidebarBW;






