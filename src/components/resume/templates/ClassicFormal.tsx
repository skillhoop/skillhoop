import React from 'react';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicFormalProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicFormal: React.FC<ClassicFormalProps> = ({ resumeData, settings }) => {
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
  const accentColor = settings.accentColor || '#1a1a1a';
  
  return (
    <div
      className="resume-preview-container w-[210mm] min-h-[297mm]"
      style={{
        fontFamily: fontFamily,
        fontSize: `${settings.fontSize || 11}pt`,
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
      {/* Formal Header Bar */}
      <header style={{
        background: accentColor,
        color: '#ffffff',
        padding: '28px 50px',
        borderBottom: `4px solid ${accentColor}`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          {/* Name and Title */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            {personalInfo.fullName && (
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '6px',
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
                fontSize: '1.1rem',
                fontWeight: 400,
                color: '#f0f0f0',
                wordWrap: 'break-word',
                fontStyle: 'italic',
              }}>
                {personalInfo.jobTitle}
              </h2>
            )}
          </div>

          {/* Contact Information - Right Side */}
          {contactItems.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.85rem',
              color: '#ffffff',
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
                    <Icon size={16} color="#ffffff" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div style={{ padding: '40px 50px' }}>
        {/* Summary Section */}
        {(personalInfo.summary || summarySection) && (
          <section style={{ 
            marginBottom: '32px',
            padding: '20px 24px',
            background: '#f8f8f8',
            borderRadius: '0',
            borderLeft: `5px solid ${accentColor}`,
            borderTop: '1px solid #e0e0e0',
            borderRight: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
          }}>
            <h2 style={{
              fontSize: '1rem',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '2px',
              marginBottom: '12px',
              color: accentColor,
            }}>
              Professional Summary
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#1a1a1a',
              lineHeight: '1.8',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}>
              {personalInfo.summary || ''}
            </p>
          </section>
        )}

        {/* Two Column Layout */}
        <div style={{ display: 'flex', gap: '45px', alignItems: 'flex-start' }}>
          {/* Left Column - Experience and Projects (60%) */}
          <div style={{ flex: '0 0 60%' }}>
            {/* Work Experience Section */}
            {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '1.15rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  color: accentColor,
                  borderBottom: `3px solid ${accentColor}`,
                  paddingBottom: '10px',
                }}>
                  {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
                </h2>
                {experienceSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ 
                    marginBottom: '24px',
                    paddingLeft: '20px',
                    borderLeft: `4px solid ${accentColor}`,
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: '-10px',
                      top: '0',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: accentColor,
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
                        color: accentColor,
                      }}>
                        {item.title || ''}
                      </div>
                      {item.date && (
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#4a4a4a',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          background: '#f0f0f0',
                          padding: '4px 14px',
                          borderRadius: '0',
                          border: `1px solid ${accentColor}`,
                        }}>
                          {item.date}
                        </div>
                      )}
                    </div>
                    {item.subtitle && (
                      <div style={{
                        fontSize: '1rem',
                        color: '#4a4a4a',
                        marginBottom: '12px',
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
                        lineHeight: '1.8',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}>
                        {item.description.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
                          const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                          return (
                            <li key={lineIndex} style={{ 
                              marginBottom: '10px',
                              paddingLeft: '22px',
                              position: 'relative',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                            }}>
                              <span style={{
                                position: 'absolute',
                                left: 0,
                                color: accentColor,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
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
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '1.15rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  color: accentColor,
                  borderBottom: `3px solid ${accentColor}`,
                  paddingBottom: '10px',
                }}>
                  {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                </h2>
                {projectsSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ 
                    marginBottom: '20px',
                    padding: '18px',
                    background: '#f8f8f8',
                    borderRadius: '0',
                    borderLeft: `5px solid ${accentColor}`,
                    borderTop: '1px solid #e0e0e0',
                    borderRight: '1px solid #e0e0e0',
                    borderBottom: '1px solid #e0e0e0',
                  }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      marginBottom: '8px',
                      color: accentColor,
                    }}>
                      {item.title || ''}
                    </div>
                    {item.description && (
                      <p style={{ 
                        fontSize: '0.95rem', 
                        color: '#1a1a1a', 
                        marginBottom: '8px',
                        lineHeight: '1.7',
                        wordWrap: 'break-word',
                      }}>
                        {item.description.split('\n')[0]}
                      </p>
                    )}
                    {item.subtitle && (
                      <a href={item.subtitle} style={{
                        color: accentColor,
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        fontWeight: 500,
                        borderBottom: `1px solid ${accentColor}`,
                      }}>
                        {item.subtitle.includes('http') ? 'View Project →' : item.subtitle}
                      </a>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Right Column - Skills, Education, Languages, Certifications (40%) */}
          <div style={{ flex: '0 0 40%' }}>
            {/* Skills Section */}
            {skillCategories.length > 0 && (
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '1.15rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  color: accentColor,
                  borderBottom: `3px solid ${accentColor}`,
                  paddingBottom: '10px',
                }}>
                  {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                </h2>
                {skillCategories.map((category, catIndex) => (
                  <div key={catIndex} style={{ marginBottom: '18px' }}>
                    <span style={{
                      fontWeight: 700,
                      marginBottom: '12px',
                      display: 'block',
                      fontSize: '0.95rem',
                      color: accentColor,
                    }}>
                      {category}
                    </span>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}>
                      {skillsByCategory[category].map((skill, skillIndex) => (
                        <span key={skillIndex} style={{
                          fontSize: '0.85rem',
                          padding: '6px 14px',
                          backgroundColor: '#ffffff',
                          border: `1.5px solid ${accentColor}`,
                          borderRadius: '0',
                          color: '#1a1a1a',
                          fontWeight: 500,
                        }}>
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
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '1.15rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  color: accentColor,
                  borderBottom: `3px solid ${accentColor}`,
                  paddingBottom: '10px',
                }}>
                  {educationSection.title?.toUpperCase() || 'EDUCATION'}
                </h2>
                {educationSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ 
                    marginBottom: '20px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '0',
                    borderLeft: `5px solid ${accentColor}`,
                    borderTop: '1px solid #e0e0e0',
                    borderRight: '1px solid #e0e0e0',
                    borderBottom: '1px solid #e0e0e0',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: accentColor, marginBottom: '6px' }}>
                      {item.subtitle || item.title || ''}
                    </div>
                    {item.title && item.subtitle && (
                      <div style={{ fontSize: '0.9rem', color: '#4a4a4a', marginBottom: '6px' }}>
                        {item.title}
                      </div>
                    )}
                    {item.date && (
                      <div style={{ fontSize: '0.85rem', color: '#4a4a4a', fontStyle: 'normal', fontWeight: 500 }}>
                        {item.date}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Languages Section */}
            {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '1.15rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  color: accentColor,
                  borderBottom: `3px solid ${accentColor}`,
                  paddingBottom: '10px',
                }}>
                  {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: 0,
                }}>
                  {languagesSection.items.map((item, index) => (
                    <li key={item.id || index} style={{
                      marginBottom: '14px',
                      fontSize: '0.95rem',
                      color: '#1a1a1a',
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0',
                      borderLeft: `5px solid ${accentColor}`,
                      borderTop: '1px solid #e0e0e0',
                      borderRight: '1px solid #e0e0e0',
                      borderBottom: '1px solid #e0e0e0',
                    }}>
                      <strong style={{ color: accentColor }}>{item.title || ''}</strong>
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
                  fontSize: '1.15rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  color: accentColor,
                  borderBottom: `3px solid ${accentColor}`,
                  paddingBottom: '10px',
                }}>
                  {certificationsSection.title?.toUpperCase() || 'CERTIFICATIONS'}
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: 0,
                }}>
                  {certificationsSection.items.map((item, index) => (
                    <li key={item.id || index} style={{
                      marginBottom: '14px',
                      fontSize: '0.95rem',
                      color: '#1a1a1a',
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0',
                      borderLeft: `5px solid ${accentColor}`,
                      borderTop: '1px solid #e0e0e0',
                      borderRight: '1px solid #e0e0e0',
                      borderBottom: '1px solid #e0e0e0',
                    }}>
                      <strong style={{ color: accentColor }}>{item.title || ''}</strong>
                      {item.subtitle && (
                        <div style={{ fontSize: '0.85rem', color: '#4a4a4a', marginTop: '4px' }}>
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
  );
};

export default ClassicFormal;






















