import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoProfessionalSidebarProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoProfessionalSidebar: React.FC<PhotoProfessionalSidebarProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Open Sans', 'Arial', sans-serif";
  
  return (
    <>
      <style>{`
        .resume-professional-sidebar-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-professional-sidebar-override"
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
        {/* Left Sidebar - Photo and Personal Info */}
        <aside style={{
          width: '280px',
          background: '#1a365d',
          color: '#ffffff',
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Professional Accent Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: '#2c5282',
          }} />
          
          {/* Photo Section */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
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
                width: '180px',
                height: '180px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '4px solid #2c5282',
                backgroundColor: '#2c5282',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                margin: '0 auto',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                ...(isHovering && {
                  borderColor: '#4a90e2',
                  boxShadow: '0 6px 18px rgba(74, 144, 226, 0.6)',
                  transform: 'scale(1.02)',
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
                        backgroundColor: 'rgba(26, 54, 93, 0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: 'white',
                        fontSize: '0.8rem',
                      }}
                    >
                      <Upload size={22} color="#4a90e2" />
                      <span style={{ color: '#4a90e2' }}>Change Photo</span>
                      <button
                        onClick={handleRemovePhoto}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(74, 144, 226, 0.9)',
                          border: 'none',
                          borderRadius: '4px',
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
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  {isHovering ? (
                    <>
                      <Upload size={28} color="#4a90e2" />
                      <span style={{ color: '#4a90e2' }}>Upload Photo</span>
                    </>
                  ) : (
                    <span>Photo</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Name and Title */}
          {personalInfo.fullName && (
            <h1 style={{
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '8px',
              lineHeight: '1.2',
              wordWrap: 'break-word',
              textAlign: 'center',
            }}>
              {personalInfo.fullName}
            </h1>
          )}
          {personalInfo.jobTitle && (
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 400,
              color: '#b8d4f0',
              marginBottom: '30px',
              wordWrap: 'break-word',
              textAlign: 'center',
            }}>
              {personalInfo.jobTitle}
            </h2>
          )}

          {/* Contact Information */}
          {contactItems.length > 0 && (
            <section style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '1px',
                marginBottom: '16px',
                color: '#4a90e2',
                borderBottom: '2px solid #2c5282',
                paddingBottom: '8px',
              }}>
                Contact
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '0.85rem',
              }}>
                {contactItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '10px',
                        color: '#b8d4f0',
                        wordWrap: 'break-word',
                      }}
                    >
                      <Icon size={16} color="#4a90e2" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Skills Section */}
          {skillCategories.length > 0 && (
            <section style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '1px',
                marginBottom: '16px',
                color: '#4a90e2',
                borderBottom: '2px solid #2c5282',
                paddingBottom: '8px',
              }}>
                {skillsSection?.title?.toUpperCase() || 'SKILLS'}
              </h3>
              {skillCategories.map((category, catIndex) => (
                <div key={catIndex} style={{ marginBottom: '16px' }}>
                  <span style={{
                    fontWeight: 600,
                    marginBottom: '8px',
                    display: 'block',
                    fontSize: '0.85rem',
                    color: '#ffffff',
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
                        padding: '4px 10px',
                        backgroundColor: 'rgba(74, 144, 226, 0.2)',
                        border: '1px solid #4a90e2',
                        borderRadius: '0',
                        color: '#b8d4f0',
                        fontWeight: 400,
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
              <h3 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '1px',
                marginBottom: '16px',
                color: '#4a90e2',
                borderBottom: '2px solid #2c5282',
                paddingBottom: '8px',
              }}>
                {educationSection.title?.toUpperCase() || 'EDUCATION'}
              </h3>
              {educationSection.items.map((item, index) => (
                <div key={item.id || index} style={{ 
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: index < educationSection.items.length - 1 ? '1px solid #2c5282' : 'none',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff', marginBottom: '4px' }}>
                    {item.subtitle || item.title || ''}
                  </div>
                  {item.title && item.subtitle && (
                    <div style={{ fontSize: '0.75rem', color: '#b8d4f0', marginBottom: '4px' }}>
                      {item.title}
                    </div>
                  )}
                  {item.date && (
                    <div style={{ fontSize: '0.75rem', color: '#4a90e2', fontStyle: 'normal', fontWeight: 500 }}>
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
              <h3 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '1px',
                marginBottom: '16px',
                color: '#4a90e2',
                borderBottom: '2px solid #2c5282',
                paddingBottom: '8px',
              }}>
                {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
              </h3>
              <ul style={{
                listStyle: 'none',
                paddingLeft: 0,
              }}>
                {languagesSection.items.map((item, index) => (
                  <li key={item.id || index} style={{
                    marginBottom: '10px',
                    fontSize: '0.85rem',
                    color: '#b8d4f0',
                  }}>
                    <strong style={{ color: '#ffffff' }}>{item.title || ''}</strong>
                    {item.subtitle && ` - ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Right Main Content */}
        <main style={{
          flex: 1,
          padding: '40px 45px',
          background: '#ffffff',
        }}>
          {/* Summary Section */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ 
              marginBottom: '30px',
              padding: '24px 28px',
              background: '#f5f7fa',
              borderRadius: '0',
              borderLeft: '4px solid #1a365d',
              borderTop: '1px solid #e0e6ed',
              borderRight: '1px solid #e0e6ed',
              borderBottom: '1px solid #e0e6ed',
            }}>
              <h2 style={{
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '1.5px',
                marginBottom: '12px',
                color: '#1a365d',
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

          {/* Work Experience Section */}
          {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
            <section style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '1.15rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '1.5px',
                marginBottom: '20px',
                color: '#1a365d',
                borderBottom: '2px solid #2c5282',
                paddingBottom: '8px',
              }}>
                {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
              </h2>
              {experienceSection.items.map((item, index) => (
                <div key={item.id || index} style={{ 
                  marginBottom: '26px',
                  paddingLeft: '20px',
                  borderLeft: '3px solid #2c5282',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '0',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#1a365d',
                    border: '3px solid #ffffff',
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
                      color: '#1a1a1a',
                    }}>
                      {item.title || ''}
                    </div>
                    {item.date && (
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#1a365d',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        background: '#f5f7fa',
                        padding: '4px 12px',
                        borderRadius: '0',
                        border: '1px solid #e0e6ed',
                      }}>
                        {item.date}
                      </div>
                    )}
                  </div>
                  {item.subtitle && (
                    <div style={{
                      fontSize: '0.95rem',
                      color: '#2c5282',
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
                              color: '#2c5282',
                              fontSize: '0.9rem',
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
            <section style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '1.15rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '1.5px',
                marginBottom: '20px',
                color: '#1a365d',
                borderBottom: '2px solid #2c5282',
                paddingBottom: '8px',
              }}>
                {projectsSection.title?.toUpperCase() || 'PROJECTS'}
              </h2>
              {projectsSection.items.map((item, index) => (
                <div key={item.id || index} style={{ 
                  marginBottom: '20px',
                  padding: '20px',
                  background: '#f5f7fa',
                  borderRadius: '0',
                  borderLeft: '4px solid #1a365d',
                  borderTop: '1px solid #e0e6ed',
                  borderRight: '1px solid #e0e6ed',
                  borderBottom: '1px solid #e0e6ed',
                }}>
                  <div style={{
                    fontWeight: 600,
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
                      color: '#2c5282',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500,
                      borderBottom: '1px solid #2c5282',
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
    </>
  );
};

export default PhotoProfessionalSidebar;







