import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoSoftProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoSoft: React.FC<PhotoSoftProps> = ({ resumeData, settings }) => {
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
        .resume-soft-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-soft-override"
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
        {/* Soft Pastel Header */}
        <header style={{
          background: 'linear-gradient(135deg, #f8d7da 0%, #d1ecf1 25%, #d4edda 50%, #fff3cd 75%, #f8d7da 100%)',
          color: '#1a1a1a',
          padding: '50px 50px 60px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Soft Cloud Pattern Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(20%, -20%)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-20%, 20%)',
          }} />
          
          {/* Soft Accent Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #f8d7da 0%, #d1ecf1 25%, #d4edda 50%, #fff3cd 75%, #f8d7da 100%)',
          }} />
          
          {/* Decorative Soft Wave */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '25px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 95%)',
          }} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '45px',
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
          }}>
            {/* Photo Section with Soft Frame */}
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
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid #ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(248, 215, 218, 0.3)',
                  ...(isHovering && {
                    borderColor: '#d1ecf1',
                    boxShadow: '0 10px 28px rgba(209, 236, 241, 0.5), 0 0 0 6px rgba(209, 236, 241, 0.3)',
                    transform: 'scale(1.03)',
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
                          backgroundColor: 'rgba(248, 215, 218, 0.9)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          color: 'white',
                          fontSize: '0.8rem',
                        }}
                      >
                        <Upload size={22} color="#d1ecf1" />
                        <span style={{ color: '#d1ecf1' }}>Change Photo</span>
                        <button
                          onClick={handleRemovePhoto}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(209, 236, 241, 0.9)',
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
                    color: 'rgba(26, 26, 26, 0.6)',
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
                        <Upload size={28} color="#d1ecf1" />
                        <span style={{ color: '#d1ecf1' }}>Upload Photo</span>
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
                  fontSize: '2.8rem',
                  fontWeight: 400,
                  color: '#1a1a1a',
                  marginBottom: '10px',
                  lineHeight: '1.1',
                  wordWrap: 'break-word',
                  letterSpacing: '0.5px',
                }}>
                  {personalInfo.fullName}
                </h1>
              )}
              {personalInfo.jobTitle && (
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 300,
                  color: '#666666',
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
                          color: '#666666',
                          wordWrap: 'break-word',
                        }}
                      >
                        <Icon size={18} color="#d1ecf1" />
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
              background: 'linear-gradient(135deg, #f8d7da 0%, #d1ecf1 100%)',
              borderRadius: '12px',
              borderLeft: '5px solid #d1ecf1',
              borderTop: '2px solid rgba(209, 236, 241, 0.3)',
              borderRight: '2px solid rgba(209, 236, 241, 0.3)',
              borderBottom: '2px solid rgba(209, 236, 241, 0.3)',
            }}>
              <h2 style={{
                fontSize: '1.05rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '1.5px',
                marginBottom: '14px',
                color: '#1a1a1a',
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
                    fontSize: '1.25rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    marginBottom: '22px',
                    color: '#1a1a1a',
                    borderBottom: '3px solid #d1ecf1',
                    paddingBottom: '10px',
                  }}>
                    {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
                  </h2>
                  {experienceSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '30px',
                      paddingLeft: '22px',
                      borderLeft: '3px solid #d1ecf1',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '0',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f8d7da 0%, #d1ecf1 100%)',
                        border: '3px solid #ffffff',
                        boxShadow: '0 0 0 2px #d1ecf1',
                      }} />
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          color: '#1a1a1a',
                        }}>
                          {item.title || ''}
                        </div>
                        {item.date && (
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#666666',
                            fontStyle: 'normal',
                            fontWeight: 500,
                            background: 'linear-gradient(135deg, #f8d7da 0%, #d1ecf1 100%)',
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
                          color: '#d1ecf1',
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
                                  color: '#d1ecf1',
                                  fontSize: '1.2rem',
                                  fontWeight: 'bold',
                                }}>•</span>
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
                    fontSize: '1.25rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    marginBottom: '22px',
                    color: '#1a1a1a',
                    borderBottom: '3px solid #d1ecf1',
                    paddingBottom: '10px',
                  }}>
                    {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                  </h2>
                  {projectsSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '24px',
                      padding: '22px',
                      background: 'linear-gradient(135deg, #f8d7da 0%, #d1ecf1 100%)',
                      borderRadius: '12px',
                      borderLeft: '5px solid #d1ecf1',
                      borderTop: '2px solid rgba(209, 236, 241, 0.3)',
                      borderRight: '2px solid rgba(209, 236, 241, 0.3)',
                      borderBottom: '2px solid rgba(209, 236, 241, 0.3)',
                    }}>
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
                          color: '#d1ecf1',
                          fontSize: '0.95rem',
                          textDecoration: 'none',
                          fontWeight: 600,
                          borderBottom: '2px solid #d1ecf1',
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
              background: 'linear-gradient(135deg, #f8d7da 0%, #d1ecf1 100%)',
              padding: '32px',
              borderRadius: '12px',
              border: '3px solid #d1ecf1',
            }}>
              {/* Skills Section */}
              {skillCategories.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    marginBottom: '20px',
                    color: '#1a1a1a',
                    borderBottom: '3px solid #d1ecf1',
                    paddingBottom: '10px',
                  }}>
                    {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                  </h2>
                  {skillCategories.map((category, catIndex) => (
                    <div key={catIndex} style={{ marginBottom: '20px' }}>
                      <span style={{
                        fontWeight: 600,
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
                            border: '2px solid #d1ecf1',
                            borderRadius: '20px',
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
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    marginBottom: '20px',
                    color: '#1a1a1a',
                    borderBottom: '3px solid #d1ecf1',
                    paddingBottom: '10px',
                  }}>
                    {educationSection.title?.toUpperCase() || 'EDUCATION'}
                  </h2>
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '22px',
                      padding: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      borderLeft: '4px solid #d1ecf1',
                      borderTop: '2px solid rgba(209, 236, 241, 0.3)',
                      borderRight: '2px solid rgba(209, 236, 241, 0.3)',
                      borderBottom: '2px solid rgba(209, 236, 241, 0.3)',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1a1a1a', marginBottom: '6px' }}>
                        {item.subtitle || item.title || ''}
                      </div>
                      {item.title && item.subtitle && (
                        <div style={{ fontSize: '0.9rem', color: '#d1ecf1', marginBottom: '6px' }}>
                          {item.title}
                        </div>
                      )}
                      {item.date && (
                        <div style={{ fontSize: '0.85rem', color: '#d1ecf1', fontStyle: 'normal', fontWeight: 600 }}>
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
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    marginBottom: '20px',
                    color: '#1a1a1a',
                    borderBottom: '3px solid #d1ecf1',
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
                        borderRadius: '12px',
                        borderLeft: '4px solid #d1ecf1',
                        borderTop: '2px solid rgba(209, 236, 241, 0.3)',
                        borderRight: '2px solid rgba(209, 236, 241, 0.3)',
                        borderBottom: '2px solid rgba(209, 236, 241, 0.3)',
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

export default PhotoSoft;






















