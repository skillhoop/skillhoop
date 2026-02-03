import React from 'react';
import { Phone, Mail, MapPin, Linkedin } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicTraditionalBWProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicTraditionalBW: React.FC<ClassicTraditionalBWProps> = ({ resumeData, settings }) => {
  const { personalInfo, sections } = resumeData;
  
  // Extract sections
  const summarySection = sections.find(s => s.type === 'personal' || s.id === 'summary');
  const experienceSection = sections.find(s => s.type === 'experience');
  const educationSection = sections.find(s => s.type === 'education');
  const skillsSection = sections.find(s => s.type === 'skills');
  const certificationsSection = sections.find(s => s.type === 'certifications');
  
  // Contact info items
  const contactItems = [
    { icon: Phone, text: personalInfo.phone, show: !!personalInfo.phone },
    { icon: Mail, text: personalInfo.email, show: !!personalInfo.email },
    { icon: MapPin, text: personalInfo.location, show: !!personalInfo.location },
    { icon: Linkedin, text: personalInfo.linkedin, show: !!personalInfo.linkedin },
  ].filter(item => item.show);
  
  // Get skills list for the grid
  const skillsList = skillsSection?.items?.map(item => item.title).filter(Boolean) || [];
  
  // Split skills into 4 columns for the grid
  const getSkillsGrid = () => {
    const columns = 4;
    const itemsPerColumn = Math.ceil(skillsList.length / columns);
    const grid: string[][] = [];
    for (let i = 0; i < columns; i++) {
      grid.push(skillsList.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }
    return grid;
  };
  
  const skillsGrid = getSkillsGrid();
  
  // Use serif for headers, sans-serif for body
  const serifFont = "'Garamond', 'Times New Roman', serif";
  const sansSerifFont = "'Arial', 'Helvetica', sans-serif";
  
  return (
    <>
      <style>{`
        .resume-classic-traditional-bw-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-traditional-bw-override"
        style={{
          fontSize: `${settings.fontSize || 10}pt`,
          lineHeight: settings.lineHeight || 1.6,
          color: '#1a1a1a',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          padding: '40px 50px',
        }}
      >
        {/* Header Section */}
        <header style={{
          marginBottom: '30px',
        }}>
          {/* Name and Title Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px',
          }}>
            {/* Name - Left */}
            {personalInfo.fullName && (
              <h1 style={{
                fontFamily: serifFont,
                fontSize: '2.4rem',
                fontWeight: 700,
                color: '#000000',
                margin: 0,
                lineHeight: '1.1',
                wordWrap: 'break-word',
                letterSpacing: '4px',
                textTransform: 'uppercase',
              }}>
                {personalInfo.fullName}
              </h1>
            )}
            
            {/* Job Title - Right */}
            {personalInfo.jobTitle && (
              <h2 style={{
                fontFamily: serifFont,
                fontSize: '1rem',
                fontWeight: 400,
                color: '#000000',
                margin: 0,
                lineHeight: '1.1',
                wordWrap: 'break-word',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                textAlign: 'right',
              }}>
                {personalInfo.jobTitle}
              </h2>
            )}
          </div>
          
          {/* Divider */}
          <div style={{
            height: '1px',
            backgroundColor: '#d0d0d0',
            marginBottom: '16px',
          }} />
          
          {/* Contact Info - Single Row */}
          {contactItems.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              alignItems: 'center',
              fontFamily: sansSerifFont,
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

        {/* Main Content - Single Column */}
        <main>
          {/* Professional Summary Section */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontFamily: serifFont,
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '4px',
                marginBottom: '8px',
                color: '#000000',
                borderBottom: '1px solid #d0d0d0',
                paddingBottom: '6px',
              }}>
                Professional Summary
              </h2>
              <p style={{
                fontFamily: sansSerifFont,
                fontSize: '0.95rem',
                color: '#1a1a1a',
                lineHeight: '1.7',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                marginBottom: '16px',
                marginTop: '12px',
              }}>
                {personalInfo.summary || ''}
              </p>
              
              {/* Skills Grid - 4 Columns */}
              {skillsList.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px 20px',
                  marginTop: '16px',
                  fontFamily: sansSerifFont,
                  fontSize: '0.85rem',
                  color: '#1a1a1a',
                }}>
                  {skillsGrid.map((column, colIndex) => (
                    <div key={colIndex} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      {column.map((skill, skillIndex) => (
                        <div key={skillIndex} style={{
                          lineHeight: '1.4',
                        }}>
                          {skill}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Work Experience Section */}
          {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
            <section style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontFamily: serifFont,
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '4px',
                marginBottom: '8px',
                color: '#000000',
                borderBottom: '1px solid #d0d0d0',
                paddingBottom: '6px',
              }}>
                Work Experience
              </h2>
              <div style={{ marginTop: '16px' }}>
                {experienceSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ 
                    marginBottom: '24px',
                  }}>
                    {/* Job Title and Company/Date Row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{
                        fontFamily: sansSerifFont,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#000000',
                      }}>
                        {item.title || 'Position Title'}
                      </div>
                      {item.date && (
                        <div style={{
                          fontFamily: sansSerifFont,
                          fontSize: '0.85rem',
                          color: '#4a4a4a',
                          fontStyle: 'normal',
                        }}>
                          {item.date}
                        </div>
                      )}
                    </div>
                    
                    {/* Company and Location */}
                    {item.subtitle && (
                      <div style={{
                        fontFamily: sansSerifFont,
                        fontSize: '0.85rem',
                        color: '#4a4a4a',
                        marginBottom: '10px',
                      }}>
                        {item.subtitle}
                      </div>
                    )}
                    
                    {/* Description Bullets */}
                    {item.description && (
                      <ul style={{
                        listStyle: 'none',
                        paddingLeft: 0,
                        margin: 0,
                        fontFamily: sansSerifFont,
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
                                fontSize: '0.8rem',
                              }}>•</span>
                              {cleanLine}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Licenses Section */}
          {(educationSection || certificationsSection) && (
            <section>
              <h2 style={{
                fontFamily: serifFont,
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '4px',
                marginBottom: '8px',
                color: '#000000',
                borderBottom: '1px solid #d0d0d0',
                paddingBottom: '6px',
              }}>
                Education & Licenses
              </h2>
              <div style={{ marginTop: '16px', fontFamily: sansSerifFont }}>
                {/* Education Items */}
                {educationSection && educationSection.items && educationSection.items.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    {educationSection.items.map((item, index) => (
                      <div key={item.id || index} style={{ 
                        marginBottom: '16px',
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                        }}>
                          <div>
                            <div style={{
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              color: '#000000',
                              marginBottom: '4px',
                            }}>
                              {item.subtitle || item.title || 'Name of Degree'}
                            </div>
                            {item.title && item.subtitle && (
                              <div style={{
                                fontSize: '0.85rem',
                                color: '#4a4a4a',
                                marginBottom: '4px',
                              }}>
                                {item.title}
                              </div>
                            )}
                            {!item.title && item.subtitle && (
                              <div style={{
                                fontSize: '0.85rem',
                                color: '#4a4a4a',
                              }}>
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                          {item.date && (
                            <div style={{
                              fontSize: '0.85rem',
                              color: '#4a4a4a',
                              fontStyle: 'normal',
                              textAlign: 'right',
                            }}>
                              {item.date}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Certifications/Licenses */}
                {certificationsSection && certificationsSection.items && certificationsSection.items.length > 0 && (
                  <div>
                    {certificationsSection.items.map((item, index) => (
                      <div key={item.id || index} style={{ 
                        marginBottom: '16px',
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                        }}>
                          <div>
                            <div style={{
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              color: '#000000',
                              marginBottom: '4px',
                            }}>
                              {item.title || 'License Name'}
                            </div>
                            {item.subtitle && (
                              <div style={{
                                fontSize: '0.85rem',
                                color: '#4a4a4a',
                              }}>
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                          {item.date && (
                            <div style={{
                              fontSize: '0.85rem',
                              color: '#4a4a4a',
                              fontStyle: 'normal',
                              textAlign: 'right',
                            }}>
                              {item.date}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
};

export default ClassicTraditionalBW;






















