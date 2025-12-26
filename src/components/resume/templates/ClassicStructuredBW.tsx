import React from 'react';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicStructuredBWProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicStructuredBW: React.FC<ClassicStructuredBWProps> = ({ resumeData, settings }) => {
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
        .resume-classic-structured-bw-override {
          background-color: #ffffff !important;
        }
        .resume-classic-structured-bw-override aside {
          background-color: #1a1a1a !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-structured-bw-override"
        style={{
          fontFamily: fontFamily,
          fontSize: `${settings.fontSize || 10}pt`,
          lineHeight: settings.lineHeight || 1.5,
          color: '#1a1a1a',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          display: 'flex',
        }}
      >
        {/* Main Content Area (70%) - White Background */}
        <main style={{
          flex: '0 0 70%',
          padding: '45px 40px',
          backgroundColor: '#ffffff',
        }}>
          {/* Header Section */}
          <header style={{
            marginBottom: '35px',
            paddingBottom: '20px',
            borderBottom: '3px solid #000000',
          }}>
            {personalInfo.fullName && (
              <h1 style={{
                fontSize: '2.4rem',
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
                fontSize: '1.2rem',
                fontWeight: 400,
                color: '#4a4a4a',
                wordWrap: 'break-word',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}>
                {personalInfo.jobTitle}
              </h2>
            )}
          </header>

          {/* Summary Section */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ 
              marginBottom: '32px',
              padding: '20px 24px',
              background: '#f5f5f5',
              borderRadius: '0',
              borderLeft: '5px solid #000000',
              borderTop: '1px solid #d0d0d0',
              borderRight: '1px solid #d0d0d0',
              borderBottom: '1px solid #d0d0d0',
            }}>
              <h2 style={{
                fontSize: '1rem',
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

          {/* Work Experience Section */}
          {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '1.15rem',
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
                  paddingLeft: '20px',
                  borderLeft: '4px solid #000000',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '-8px',
                    top: '0',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#000000',
                    border: '3px solid #ffffff',
                  }} />
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
                        fontWeight: 500,
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
                      marginBottom: '10px',
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
                      fontSize: '0.95rem',
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
                            paddingLeft: '20px',
                            position: 'relative',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                          }}>
                            <span style={{
                              position: 'absolute',
                              left: 0,
                              color: '#000000',
                              fontSize: '1rem',
                              fontWeight: 'bold',
                            }}>■</span>
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
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '1.15rem',
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
                  background: '#f5f5f5',
                  borderRadius: '0',
                  borderLeft: '4px solid #000000',
                  borderTop: '1px solid #d0d0d0',
                  borderRight: '1px solid #d0d0d0',
                  borderBottom: '1px solid #d0d0d0',
                }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    marginBottom: '6px',
                    color: '#000000',
                  }}>
                    {item.title || ''}
                  </div>
                  {item.description && (
                    <p style={{ 
                      fontSize: '0.95rem', 
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
                      fontSize: '0.9rem',
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

        {/* Right Sidebar (30%) - Black Background */}
        <aside style={{
          width: '30%',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          padding: '45px 30px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Contact Information */}
          {contactItems.length > 0 && (
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '18px',
                color: '#ffffff',
                borderBottom: '2px solid #ffffff',
                paddingBottom: '10px',
              }}>
                Contact
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {contactItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        fontSize: '0.8rem',
                        color: '#e0e0e0',
                        wordWrap: 'break-word',
                      }}
                    >
                      <Icon size={15} color="#ffffff" />
                      <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {skillCategories.length > 0 && (
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '18px',
                color: '#ffffff',
                borderBottom: '2px solid #ffffff',
                paddingBottom: '10px',
              }}>
                {skillsSection?.title?.toUpperCase() || 'SKILLS'}
              </h3>
              {skillCategories.map((category, catIndex) => (
                <div key={catIndex} style={{ marginBottom: '18px' }}>
                  <span style={{
                    fontWeight: 600,
                    marginBottom: '10px',
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {category}
                  </span>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}>
                    {skillsByCategory[category].map((skill, skillIndex) => (
                      <span key={skillIndex} style={{
                        fontSize: '0.75rem',
                        color: '#e0e0e0',
                        fontWeight: 400,
                        paddingLeft: '10px',
                        position: 'relative',
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          color: '#ffffff',
                        }}>•</span>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education Section */}
          {educationSection && educationSection.items && educationSection.items.length > 0 && (
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '18px',
                color: '#ffffff',
                borderBottom: '2px solid #ffffff',
                paddingBottom: '10px',
              }}>
                {educationSection.title?.toUpperCase() || 'EDUCATION'}
              </h3>
              {educationSection.items.map((item, index) => (
                <div key={item.id || index} style={{ 
                  marginBottom: '18px',
                  paddingBottom: '18px',
                  borderBottom: index < educationSection.items.length - 1 ? '1px solid #4a4a4a' : 'none',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#ffffff', marginBottom: '6px' }}>
                    {item.subtitle || item.title || ''}
                  </div>
                  {item.title && item.subtitle && (
                    <div style={{ fontSize: '0.75rem', color: '#b0b0b0', marginBottom: '4px' }}>
                      {item.title}
                    </div>
                  )}
                  {item.date && (
                    <div style={{ fontSize: '0.7rem', color: '#b0b0b0', fontStyle: 'italic' }}>
                      {item.date}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Languages Section */}
          {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '18px',
                color: '#ffffff',
                borderBottom: '2px solid #ffffff',
                paddingBottom: '10px',
              }}>
                {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {languagesSection.items.map((item, index) => (
                  <div key={item.id || index} style={{
                    fontSize: '0.75rem',
                    color: '#e0e0e0',
                  }}>
                    <strong style={{ color: '#ffffff' }}>{item.title || ''}</strong>
                    {item.subtitle && ` - ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {certificationsSection && certificationsSection.items && certificationsSection.items.length > 0 && (
            <div>
              <h3 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '18px',
                color: '#ffffff',
                borderBottom: '2px solid #ffffff',
                paddingBottom: '10px',
              }}>
                {certificationsSection.title?.toUpperCase() || 'CERTIFICATIONS'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {certificationsSection.items.map((item, index) => (
                  <div key={item.id || index} style={{
                    fontSize: '0.75rem',
                    color: '#e0e0e0',
                  }}>
                    <strong style={{ color: '#ffffff' }}>{item.title || ''}</strong>
                    {item.subtitle && (
                      <div style={{ fontSize: '0.7rem', color: '#b0b0b0', marginTop: '4px' }}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

export default ClassicStructuredBW;







