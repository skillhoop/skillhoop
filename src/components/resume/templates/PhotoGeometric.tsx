import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoGeometricProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoGeometric: React.FC<PhotoGeometricProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Inter', 'Arial', sans-serif";
  
  return (
    <>
      <style>{`
        .resume-geometric-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-geometric-override"
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
        {/* Geometric Header */}
        <header style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          color: '#ffffff',
          padding: '50px 50px 65px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Geometric Pattern Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255, 255, 255, 0.05) 20px, rgba(255, 255, 255, 0.05) 22px),
              repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255, 255, 255, 0.05) 20px, rgba(255, 255, 255, 0.05) 22px)
            `,
            opacity: 0.6,
          }} />
          
          {/* Geometric Shapes */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '50px',
            width: '80px',
            height: '80px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            transform: 'rotate(45deg)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '100px',
            width: '60px',
            height: '60px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute',
            top: '40px',
            right: '150px',
            width: '0',
            height: '0',
            borderLeft: '30px solid transparent',
            borderRight: '30px solid transparent',
            borderBottom: '50px solid rgba(255, 255, 255, 0.2)',
          }} />
          
          {/* Geometric Accent Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '6px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #764ba2 75%, #667eea 100%)',
          }} />
          
          {/* Decorative Bottom Geometric Pattern */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '30px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 90%, 0 0)',
          }} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '45px',
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
          }}>
            {/* Photo Section with Geometric Frame */}
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
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '5px solid #ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(118, 75, 162, 0.3)',
                  ...(isHovering && {
                    borderColor: '#f093fb',
                    boxShadow: '0 12px 32px rgba(240, 147, 251, 0.6), 0 0 0 8px rgba(240, 147, 251, 0.4)',
                    transform: 'scale(1.05)',
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
                          backgroundColor: 'rgba(102, 126, 234, 0.9)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          color: 'white',
                          fontSize: '0.8rem',
                        }}
                      >
                        <Upload size={22} color="#f093fb" />
                        <span style={{ color: '#f093fb' }}>Change Photo</span>
                        <button
                          onClick={handleRemovePhoto}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(240, 147, 251, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
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
                          <X size={16} color="#ffffff" />
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
                        <Upload size={28} color="#f093fb" />
                        <span style={{ color: '#f093fb' }}>Upload Photo</span>
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
                  fontSize: '2.9rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '12px',
                  lineHeight: '1.1',
                  wordWrap: 'break-word',
                  letterSpacing: '-0.5px',
                  textShadow: '2px 2px 6px rgba(0, 0, 0, 0.3)',
                }}>
                  {personalInfo.fullName}
                </h1>
              )}
              {personalInfo.jobTitle && (
                <h2 style={{
                  fontSize: '1.3rem',
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '24px',
                  wordWrap: 'break-word',
                }}>
                  {personalInfo.jobTitle}
                </h2>
              )}
              {contactItems.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '24px',
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
                          gap: '10px',
                          color: 'rgba(255, 255, 255, 0.95)',
                          wordWrap: 'break-word',
                        }}
                      >
                        <Icon size={18} color="#f093fb" />
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
              padding: '28px 32px',
              background: 'linear-gradient(135deg, #f5f3ff 0%, #e9d5ff 100%)',
              borderRadius: '0',
              borderLeft: '6px solid #764ba2',
              borderTop: '2px solid rgba(118, 75, 162, 0.3)',
              borderRight: '2px solid rgba(118, 75, 162, 0.3)',
              borderBottom: '2px solid rgba(118, 75, 162, 0.3)',
              position: 'relative',
            }}>
              {/* Geometric Corner Accent */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '0',
                height: '0',
                borderTop: '20px solid #764ba2',
                borderLeft: '20px solid transparent',
                opacity: 0.3,
              }} />
              <h2 style={{
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '14px',
                color: '#667eea',
              }}>
                Professional Summary
              </h2>
              <p style={{
                fontSize: '1.05rem',
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
            {/* Left Column - Experience and Projects (65%) */}
            <div style={{ flex: '0 0 65%' }}>
              {/* Work Experience Section */}
              {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
                <section style={{ marginBottom: '35px' }}>
                  <h2 style={{
                    fontSize: '1.3rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '22px',
                    color: '#667eea',
                    borderBottom: '4px solid #764ba2',
                    paddingBottom: '10px',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '-15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '0',
                      height: '0',
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderRight: '12px solid #764ba2',
                    }} />
                    {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
                  </h2>
                  {experienceSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '30px',
                      paddingLeft: '22px',
                      borderLeft: '4px solid #764ba2',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-10px',
                        top: '0',
                        width: '20px',
                        height: '20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: '4px solid #ffffff',
                        boxShadow: '0 0 0 2px #764ba2',
                        transform: 'rotate(45deg)',
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
                          fontSize: '1.15rem',
                          color: '#1a1a1a',
                        }}>
                          {item.title || ''}
                        </div>
                        {item.date && (
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#ffffff',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '5px 14px',
                            borderRadius: '0',
                            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 8px 50%)',
                          }}>
                            {item.date}
                          </div>
                        )}
                      </div>
                      {item.subtitle && (
                        <div style={{
                          fontSize: '1rem',
                          color: '#764ba2',
                          marginBottom: '12px',
                          fontWeight: 600,
                        }}>
                          {item.subtitle}
                        </div>
                      )}
                      {item.description && (
                        <ul style={{
                          listStyle: 'none',
                          paddingLeft: 0,
                          fontSize: '1rem',
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
                                paddingLeft: '24px',
                                position: 'relative',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                              }}>
                                <span style={{
                                  position: 'absolute',
                                  left: 0,
                                  color: '#764ba2',
                                  fontSize: '1.2rem',
                                  fontWeight: 'bold',
                                }}>◆</span>
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
                    fontSize: '1.3rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '22px',
                    color: '#667eea',
                    borderBottom: '4px solid #764ba2',
                    paddingBottom: '10px',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '-15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '0',
                      height: '0',
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderRight: '12px solid #764ba2',
                    }} />
                    {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                  </h2>
                  {projectsSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '24px',
                      padding: '22px',
                      background: 'linear-gradient(135deg, #f5f3ff 0%, #e9d5ff 100%)',
                      borderRadius: '0',
                      borderLeft: '6px solid #764ba2',
                      borderTop: '2px solid rgba(118, 75, 162, 0.3)',
                      borderRight: '2px solid rgba(118, 75, 162, 0.3)',
                      borderBottom: '2px solid rgba(118, 75, 162, 0.3)',
                      position: 'relative',
                    }}>
                      {/* Geometric Corner */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '0',
                        height: '0',
                        borderTop: '15px solid #764ba2',
                        borderLeft: '15px solid transparent',
                        opacity: 0.3,
                      }} />
                      <div style={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        marginBottom: '8px',
                        color: '#1a1a1a',
                      }}>
                        {item.title || ''}
                      </div>
                      {item.description && (
                        <p style={{ 
                          fontSize: '1rem', 
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
                          color: '#764ba2',
                          fontSize: '0.95rem',
                          textDecoration: 'none',
                          fontWeight: 600,
                          borderBottom: '2px solid #764ba2',
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
              background: 'linear-gradient(135deg, #f5f3ff 0%, #e9d5ff 100%)',
              padding: '32px',
              borderRadius: '0',
              border: '3px solid #764ba2',
              position: 'relative',
            }}>
              {/* Geometric Pattern Background */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(118, 75, 162, 0.05) 10px, rgba(118, 75, 162, 0.05) 12px)',
                pointerEvents: 'none',
              }} />
              
              {/* Skills Section */}
              {skillCategories.length > 0 && (
                <section style={{ marginBottom: '30px', position: 'relative', zIndex: 1 }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    color: '#667eea',
                    borderBottom: '3px solid #764ba2',
                    paddingBottom: '10px',
                  }}>
                    {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                  </h2>
                  {skillCategories.map((category, catIndex) => (
                    <div key={catIndex} style={{ marginBottom: '20px' }}>
                      <span style={{
                        fontWeight: 700,
                        marginBottom: '12px',
                        display: 'block',
                        fontSize: '1rem',
                        color: '#1a1a1a',
                      }}>
                        {category}
                      </span>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}>
                        {skillsByCategory[category].map((skill, skillIndex) => (
                          <span key={skillIndex} style={{
                            fontSize: '0.9rem',
                            padding: '8px 16px',
                            backgroundColor: '#ffffff',
                            border: '2px solid #764ba2',
                            borderRadius: '0',
                            color: '#1a1a1a',
                            fontWeight: 600,
                            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%, 6px 50%)',
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
                <section style={{ marginBottom: '30px', position: 'relative', zIndex: 1 }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    color: '#667eea',
                    borderBottom: '3px solid #764ba2',
                    paddingBottom: '10px',
                  }}>
                    {educationSection.title?.toUpperCase() || 'EDUCATION'}
                  </h2>
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '22px',
                      padding: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0',
                      borderLeft: '5px solid #764ba2',
                      borderTop: '2px solid rgba(118, 75, 162, 0.3)',
                      borderRight: '2px solid rgba(118, 75, 162, 0.3)',
                      borderBottom: '2px solid rgba(118, 75, 162, 0.3)',
                      position: 'relative',
                    }}>
                      {/* Geometric Accent */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '12px',
                        height: '12px',
                        border: '2px solid #764ba2',
                        transform: 'rotate(45deg)',
                        opacity: 0.4,
                      }} />
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1a1a1a', marginBottom: '6px' }}>
                        {item.subtitle || item.title || ''}
                      </div>
                      {item.title && item.subtitle && (
                        <div style={{ fontSize: '0.9rem', color: '#764ba2', marginBottom: '6px' }}>
                          {item.title}
                        </div>
                      )}
                      {item.date && (
                        <div style={{ fontSize: '0.85rem', color: '#764ba2', fontStyle: 'normal', fontWeight: 600 }}>
                          {item.date}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Languages Section */}
              {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
                <section style={{ position: 'relative', zIndex: 1 }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    color: '#667eea',
                    borderBottom: '3px solid #764ba2',
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
                        borderLeft: '4px solid #764ba2',
                        borderTop: '2px solid rgba(118, 75, 162, 0.3)',
                        borderRight: '2px solid rgba(118, 75, 162, 0.3)',
                        borderBottom: '2px solid rgba(118, 75, 162, 0.3)',
                        position: 'relative',
                      }}>
                        {/* Small Geometric Shape */}
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '8px',
                          height: '8px',
                          background: '#764ba2',
                          transform: 'rotate(45deg)',
                          opacity: 0.5,
                        }} />
                        <strong style={{ color: '#1a1a1a' }}>{item.title || ''}</strong>
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

export default PhotoGeometric;






