import React from 'react';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicRefinedBWProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicRefinedBW: React.FC<ClassicRefinedBWProps> = ({ resumeData, settings }) => {
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
        .resume-classic-refined-bw-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-refined-bw-override"
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
        {/* Refined Header with Top Border */}
        <header style={{
          background: '#ffffff',
          padding: '40px 50px 30px',
          borderTop: '5px solid #000000',
          borderBottom: '2px solid #000000',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '25px',
          }}>
            {/* Name and Title - Left */}
            <div style={{ flex: '1', minWidth: '250px' }}>
              {personalInfo.fullName && (
                <h1 style={{
                  fontSize: '2.3rem',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '6px',
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
                  fontSize: '1.1rem',
                  fontWeight: 400,
                  color: '#4a4a4a',
                  wordWrap: 'break-word',
                  fontStyle: 'italic',
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
                gap: '10px',
                fontSize: '0.85rem',
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
                      <Icon size={15} color="#000000" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div style={{ padding: '35px 50px' }}>
          {/* Summary Section */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ 
              marginBottom: '30px',
              padding: '22px 26px',
              background: '#f8f8f8',
              borderRadius: '0',
              borderLeft: '4px solid #000000',
              borderTop: '1px solid #d0d0d0',
              borderRight: '1px solid #d0d0d0',
              borderBottom: '1px solid #d0d0d0',
            }}>
              <h2 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '2.5px',
                marginBottom: '12px',
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
              }}>
                {personalInfo.summary || ''}
              </p>
            </section>
          )}

          {/* Two Column Layout */}
          <div style={{ display: 'flex', gap: '42px', alignItems: 'flex-start' }}>
            {/* Left Column - Experience (60%) */}
            <div style={{ flex: '0 0 60%' }}>
              {/* Work Experience Section */}
              {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '2.5px',
                    marginBottom: '18px',
                    color: '#000000',
                    borderBottom: '2.5px solid #000000',
                    paddingBottom: '8px',
                  }}>
                    {experienceSection.title?.toUpperCase() || 'EXPERIENCE'}
                  </h2>
                  {experienceSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '22px',
                      paddingLeft: '18px',
                      borderLeft: '3px solid #000000',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-7px',
                        top: '0',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#000000',
                        border: '2px solid #ffffff',
                      }} />
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '6px',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{
                          fontWeight: 600,
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
                            fontWeight: 500,
                            background: '#f0f0f0',
                            padding: '3px 12px',
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
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '2.5px',
                    marginBottom: '18px',
                    color: '#000000',
                    borderBottom: '2.5px solid #000000',
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
                        fontWeight: 600,
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

            {/* Right Column - Skills, Education, Languages, Certifications (40%) */}
            <div style={{ flex: '0 0 40%' }}>
              {/* Skills Section */}
              {skillCategories.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '2.5px',
                    marginBottom: '16px',
                    color: '#000000',
                    borderBottom: '2.5px solid #000000',
                    paddingBottom: '8px',
                  }}>
                    {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                  </h2>
                  {skillCategories.map((category, catIndex) => (
                    <div key={catIndex} style={{ marginBottom: '14px' }}>
                      <span style={{
                        fontWeight: 600,
                        marginBottom: '8px',
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#000000',
                      }}>
                        {category}
                      </span>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}>
                        {skillsByCategory[category].map((skill, skillIndex) => (
                          <span key={skillIndex} style={{
                            fontSize: '0.8rem',
                            color: '#1a1a1a',
                            fontWeight: 400,
                            paddingLeft: '10px',
                            position: 'relative',
                          }}>
                            <span style={{
                              position: 'absolute',
                              left: 0,
                              color: '#000000',
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
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '2.5px',
                    marginBottom: '16px',
                    color: '#000000',
                    borderBottom: '2.5px solid #000000',
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
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#000000', marginBottom: '4px' }}>
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
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '2.5px',
                    marginBottom: '16px',
                    color: '#000000',
                    borderBottom: '2.5px solid #000000',
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
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '2.5px',
                    marginBottom: '16px',
                    color: '#000000',
                    borderBottom: '2.5px solid #000000',
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
                        <strong style={{ color: '#000000', fontWeight: 600 }}>{item.title || ''}</strong>
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

export default ClassicRefinedBW;







