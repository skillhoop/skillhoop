import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoVibrantProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoVibrant: React.FC<PhotoVibrantProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Poppins', 'Arial', sans-serif";
  
  return (
    <>
      <style>{`
        .resume-vibrant-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-vibrant-override"
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
        {/* Vibrant Header with Colorful Gradient */}
        <header style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 25%, #10b981 50%, #3b82f6 75%, #8b5cf6 100%)',
          color: '#ffffff',
          padding: '50px 50px 60px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Colorful Pattern Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(20%, -20%)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-20%, 20%)',
          }} />
          
          {/* Colorful Accent Bars */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '6px',
            background: 'linear-gradient(90deg, #ec4899 0%, #f59e0b 20%, #10b981 40%, #3b82f6 60%, #8b5cf6 80%, #ec4899 100%)',
            backgroundSize: '200% 100%',
          }} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '45px',
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
          }}>
            {/* Photo Section with Vibrant Frame */}
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
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '5px solid #ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(255, 255, 255, 0.3)',
                  ...(isHovering && {
                    borderColor: '#fbbf24',
                    boxShadow: '0 12px 32px rgba(251, 191, 36, 0.6), 0 0 0 8px rgba(251, 191, 36, 0.4)',
                    transform: 'scale(1.05) rotate(2deg)',
                  }),
                }}
              >
                {/* Colorful Corner Accents */}
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
                  borderRadius: '0 0 12px 0',
                  opacity: isHovering ? 1 : 0.7,
                  transition: 'opacity 0.3s',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  borderRadius: '0 0 0 12px',
                  opacity: isHovering ? 1 : 0.7,
                  transition: 'opacity 0.3s',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '-2px',
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  borderRadius: '0 12px 0 0',
                  opacity: isHovering ? 1 : 0.7,
                  transition: 'opacity 0.3s',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)',
                  borderRadius: '12px 0 0 0',
                  opacity: isHovering ? 1 : 0.7,
                  transition: 'opacity 0.3s',
                }} />
                
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
                          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.85) 0%, rgba(59, 130, 246, 0.85) 100%)',
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
                        <Upload size={28} />
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
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '12px',
                  lineHeight: '1.1',
                  wordWrap: 'break-word',
                  letterSpacing: '-0.5px',
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)',
                }}>
                  {personalInfo.fullName}
                </h1>
              )}
              {personalInfo.jobTitle && (
                <h2 style={{
                  fontSize: '1.4rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.95)',
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
              padding: '28px 32px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
              borderRadius: '12px',
              borderLeft: '6px solid #ec4899',
              borderTop: '2px solid rgba(236, 72, 153, 0.3)',
              borderRight: '2px solid rgba(236, 72, 153, 0.3)',
              borderBottom: '2px solid rgba(236, 72, 153, 0.3)',
            }}>
              <h2 style={{
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                fontWeight: 800,
                letterSpacing: '2px',
                marginBottom: '14px',
                color: '#ec4899',
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
                    fontWeight: 800,
                    letterSpacing: '2px',
                    marginBottom: '22px',
                    color: '#ec4899',
                    borderBottom: '4px solid #3b82f6',
                    paddingBottom: '10px',
                  }}>
                    {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
                  </h2>
                  {experienceSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '30px',
                      paddingLeft: '22px',
                      borderLeft: '4px solid #10b981',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-10px',
                        top: '0',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)',
                        border: '4px solid #ffffff',
                        boxShadow: '0 0 0 2px #10b981',
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
                            background: 'linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)',
                            padding: '5px 14px',
                            borderRadius: '20px',
                          }}>
                            {item.date}
                          </div>
                        )}
                      </div>
                      {item.subtitle && (
                        <div style={{
                          fontSize: '1rem',
                          color: '#3b82f6',
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
                                  color: '#ec4899',
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
                    fontSize: '1.3rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    marginBottom: '22px',
                    color: '#ec4899',
                    borderBottom: '4px solid #3b82f6',
                    paddingBottom: '10px',
                  }}>
                    {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                  </h2>
                  {projectsSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '24px',
                      padding: '22px',
                      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                      borderRadius: '12px',
                      borderLeft: '6px solid #8b5cf6',
                      borderTop: '2px solid rgba(139, 92, 246, 0.3)',
                      borderRight: '2px solid rgba(139, 92, 246, 0.3)',
                      borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
                    }}>
                      <div style={{
                        fontWeight: 700,
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
                          color: '#8b5cf6',
                          fontSize: '0.95rem',
                          textDecoration: 'none',
                          fontWeight: 600,
                          borderBottom: '2px solid #8b5cf6',
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
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: '32px',
              borderRadius: '12px',
              border: '3px solid #f59e0b',
            }}>
              {/* Skills Section */}
              {skillCategories.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    color: '#ec4899',
                    borderBottom: '3px solid #3b82f6',
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
                        color: '#3b82f6',
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
                            border: '2px solid #ec4899',
                            borderRadius: '20px',
                            color: '#1a1a1a',
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
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    color: '#ec4899',
                    borderBottom: '3px solid #3b82f6',
                    paddingBottom: '10px',
                  }}>
                    {educationSection.title?.toUpperCase() || 'EDUCATION'}
                  </h2>
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '22px',
                      padding: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      borderLeft: '5px solid #10b981',
                      borderTop: '2px solid rgba(16, 185, 129, 0.3)',
                      borderRight: '2px solid rgba(16, 185, 129, 0.3)',
                      borderBottom: '2px solid rgba(16, 185, 129, 0.3)',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', marginBottom: '6px' }}>
                        {item.subtitle || item.title || ''}
                      </div>
                      {item.title && item.subtitle && (
                        <div style={{ fontSize: '0.9rem', color: '#3b82f6', marginBottom: '6px' }}>
                          {item.title}
                        </div>
                      )}
                      {item.date && (
                        <div style={{ fontSize: '0.85rem', color: '#10b981', fontStyle: 'normal', fontWeight: 600 }}>
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
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    color: '#ec4899',
                    borderBottom: '3px solid #3b82f6',
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
                        borderRadius: '10px',
                        borderLeft: '4px solid #8b5cf6',
                        borderTop: '2px solid rgba(139, 92, 246, 0.3)',
                        borderRight: '2px solid rgba(139, 92, 246, 0.3)',
                        borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
                      }}>
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

export default PhotoVibrant;






