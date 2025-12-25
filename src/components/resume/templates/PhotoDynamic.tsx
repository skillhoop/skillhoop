import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoDynamicProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoDynamic: React.FC<PhotoDynamicProps> = ({ resumeData, settings }) => {
  const { personalInfo, sections } = resumeData;
  const { dispatch } = useResume();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Extract sections
  const summarySection = sections.find(s => s.type === 'personal' || s.id === 'summary');
  const experienceSection = sections.find(s => s.type === 'experience');
  const educationSection = sections.find(s => s.type === 'education');
  const skillsSection = sections.find(s => s.type === 'skills');
  const projectsSection = sections.find(s => s.type === 'projects');
  const languagesSection = sections.find(s => s.type === 'languages');
  
  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      alert('File size exceeds 2MB limit. Please choose a smaller image.');
      return;
    }

    // Validate file type (JPEG/PNG)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPEG or PNG image.');
      return;
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      dispatch({
        type: 'UPDATE_PERSONAL_INFO',
        payload: { profilePicture: base64String }
      });
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle remove photo
  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'UPDATE_PERSONAL_INFO',
      payload: { profilePicture: '' }
    });
  };

  // Handle click on photo area
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };
  
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
      const category = item.subtitle || 'Technical';
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
  const fontFamily = settings.fontFamily || "'Roboto', 'Arial', sans-serif";
  
  return (
    <>
      <style>{`
        .resume-dynamic-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-dynamic-override"
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
        }}
      >
        {/* Dynamic Header with Slanted Design */}
        <header style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          color: '#ffffff',
          padding: '45px 50px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Slanted Accent */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '40px',
            background: '#ffffff',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 80%)',
          }} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
          }}>
            {/* Photo Section */}
            <div style={{ flexShrink: 0 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <div
                onClick={handlePhotoClick}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{
                  width: '155px',
                  height: '155px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '4px solid #ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                  transform: 'rotate(-3deg)',
                  ...(isHovering && {
                    borderColor: '#fbbf24',
                    boxShadow: '0 12px 32px rgba(251, 191, 36, 0.5)',
                    transform: 'rotate(0deg) scale(1.05)',
                  }),
                }}
              >
                {personalInfo.profilePicture ? (
                  <>
                    <img
                      src={personalInfo.profilePicture}
                      alt="Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {isHovering && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          color: 'white',
                          fontSize: '0.8rem',
                        }}
                      >
                        <Upload size={22} />
                        <span>Change Photo</span>
                        <button
                          onClick={handleRemovePhoto}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title="Remove photo"
                        >
                          <X size={16} color="#333" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1rem',
                    textAlign: 'center',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    {isHovering ? (
                      <>
                        <Upload size={28} color="rgba(255, 255, 255, 0.9)" />
                        <span>Upload Photo</span>
                      </>
                    ) : (
                      <span>Photo</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Name and Contact Info */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              {personalInfo.fullName && (
                <h1 style={{
                  fontSize: '2.7rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '10px',
                  lineHeight: '1.1',
                  wordWrap: 'break-word',
                  letterSpacing: '-0.5px',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                }}>
                  {personalInfo.fullName}
                </h1>
              )}
              {personalInfo.jobTitle && (
                <h2 style={{
                  fontSize: '1.3rem',
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.95)',
                  marginBottom: '22px',
                  wordWrap: 'break-word',
                }}>
                  {personalInfo.jobTitle}
                </h2>
              )}
              {contactItems.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '22px',
                  fontSize: '0.95rem',
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
                          color: 'rgba(255, 255, 255, 0.9)',
                          wordWrap: 'break-word',
                        }}
                      >
                        <Icon size={18} />
                        <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div style={{ padding: '45px 50px' }}>
          {/* Summary Section */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ 
              marginBottom: '35px',
              padding: '25px 30px',
              background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
              borderRadius: '12px',
              borderLeft: '6px solid #6366f1',
            }}>
              <h2 style={{
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '12px',
                color: '#6366f1',
              }}>
                Professional Summary
              </h2>
              <p style={{
                fontSize: '1rem',
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
          <div style={{ display: 'flex', gap: '45px', alignItems: 'flex-start' }}>
            {/* Left Column - Experience and Projects (65%) */}
            <div style={{ flex: '0 0 65%' }}>
              {/* Work Experience Section */}
              {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
                <section style={{ marginBottom: '35px' }}>
                  <h2 style={{
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    color: '#6366f1',
                    borderBottom: '4px solid #6366f1',
                    paddingBottom: '8px',
                  }}>
                    {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
                  </h2>
                  {experienceSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '28px',
                      paddingLeft: '20px',
                      borderLeft: '4px solid #e0e7ff',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '0',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#6366f1',
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
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: '#1a1a1a',
                        }}>
                          {item.title || ''}
                        </div>
                        {item.date && (
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#6366f1',
                            fontStyle: 'italic',
                            fontWeight: 600,
                          }}>
                            {item.date}
                          </div>
                        )}
                      </div>
                      {item.subtitle && (
                        <div style={{
                          fontSize: '1rem',
                          color: '#6366f1',
                          marginBottom: '10px',
                          fontWeight: 600,
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
                                paddingLeft: '22px',
                                position: 'relative',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                              }}>
                                <span style={{
                                  position: 'absolute',
                                  left: 0,
                                  color: '#6366f1',
                                  fontSize: '1.2rem',
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
                <section style={{ marginBottom: '35px' }}>
                  <h2 style={{
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    color: '#6366f1',
                    borderBottom: '4px solid #6366f1',
                    paddingBottom: '8px',
                  }}>
                    {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                  </h2>
                  {projectsSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '22px',
                      padding: '20px',
                      background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
                      borderRadius: '10px',
                      borderLeft: '5px solid #8b5cf6',
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        marginBottom: '6px',
                        color: '#1a1a1a',
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
                          color: '#6366f1',
                          fontSize: '0.9rem',
                          textDecoration: 'underline',
                          fontWeight: 600,
                        }}>
                          {item.subtitle.includes('http') ? 'View Project →' : item.subtitle}
                        </a>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>

            {/* Right Sidebar (35%) */}
            <aside style={{ 
              flex: '0 0 35%',
              background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
              padding: '30px',
              borderRadius: '12px',
              border: '2px solid #c7d2fe',
            }}>
              {/* Skills Section */}
              {skillCategories.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    marginBottom: '18px',
                    color: '#6366f1',
                    borderBottom: '3px solid #6366f1',
                    paddingBottom: '8px',
                  }}>
                    {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                  </h2>
                  {skillCategories.map((category, catIndex) => (
                    <div key={catIndex} style={{ marginBottom: '18px' }}>
                      <span style={{
                        fontWeight: 700,
                        marginBottom: '10px',
                        display: 'block',
                        fontSize: '0.95rem',
                        color: '#6366f1',
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
                            border: '2px solid #6366f1',
                            borderRadius: '20px',
                            color: '#6366f1',
                            fontWeight: 600,
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
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    marginBottom: '18px',
                    color: '#6366f1',
                    borderBottom: '3px solid #6366f1',
                    paddingBottom: '8px',
                  }}>
                    {educationSection.title?.toUpperCase() || 'EDUCATION'}
                  </h2>
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '20px',
                      padding: '15px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      borderLeft: '4px solid #8b5cf6',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '4px' }}>
                        {item.subtitle || item.title || ''}
                      </div>
                      {item.title && item.subtitle && (
                        <div style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '4px' }}>
                          {item.title}
                        </div>
                      )}
                      {item.date && (
                        <div style={{ fontSize: '0.8rem', color: '#6366f1', fontStyle: 'italic', fontWeight: 600 }}>
                          {item.date}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Languages Section */}
              {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
                <section>
                  <h2 style={{
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    marginBottom: '18px',
                    color: '#6366f1',
                    borderBottom: '3px solid #6366f1',
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
                        marginBottom: '12px',
                        fontSize: '0.9rem',
                        color: '#1a1a1a',
                        padding: '10px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                      }}>
                        <strong style={{ color: '#6366f1' }}>{item.title || ''}</strong>
                        {item.subtitle && ` - ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhotoDynamic;






