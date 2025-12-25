import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoExecutiveProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoExecutive: React.FC<PhotoExecutiveProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Playfair Display', 'Times New Roman', serif";
  
  return (
    <>
      <style>{`
        .resume-executive-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-executive-override"
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
        {/* Top Accent Bar */}
        <div style={{
          backgroundColor: '#1a472a',
          height: '12px',
          width: '100%',
        }} />

        {/* Header Section */}
        <header style={{
          backgroundColor: '#2d5016',
          color: '#ffffff',
          padding: '50px 50px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: '45px',
          flexWrap: 'wrap',
          position: 'relative',
        }}>
          {/* Decorative Corner Element */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          }} />

          {/* Photo Section */}
          <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
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
                width: '170px',
                height: '170px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '5px solid #ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                ...(isHovering && {
                  borderColor: '#d4af37',
                  boxShadow: '0 12px 32px rgba(212, 175, 55, 0.4)',
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
                          borderRadius: '6px',
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
          <div style={{ flex: 1, minWidth: '300px', position: 'relative', zIndex: 1 }}>
            {personalInfo.fullName && (
              <h1 style={{
                fontSize: '2.8rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '10px',
                lineHeight: '1.1',
                wordWrap: 'break-word',
                letterSpacing: '1px',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              }}>
                {personalInfo.fullName}
              </h1>
            )}
            {personalInfo.jobTitle && (
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 300,
                color: '#d4af37',
                marginBottom: '25px',
                wordWrap: 'break-word',
                fontStyle: 'italic',
              }}>
                {personalInfo.jobTitle}
              </h2>
            )}
            {contactItems.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '25px',
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
        </header>

        {/* Main Content */}
        <div style={{ padding: '45px 50px' }}>
          {/* Summary Section */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ 
              marginBottom: '35px',
              padding: '25px 30px',
              backgroundColor: '#f8f9f6',
              borderRadius: '6px',
              borderLeft: '5px solid #2d5016',
            }}>
              <h2 style={{
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '12px',
                color: '#2d5016',
              }}>
                Executive Summary
              </h2>
              <p style={{
                fontSize: '1rem',
                color: '#1a1a1a',
                lineHeight: '1.7',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                fontStyle: 'italic',
              }}>
                {personalInfo.summary || ''}
              </p>
            </section>
          )}

          {/* Two Column Layout */}
          <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
            {/* Left Column - Experience and Projects (65%) */}
            <div style={{ flex: '0 0 65%' }}>
              {/* Work Experience Section */}
              {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
                <section style={{ marginBottom: '35px' }}>
                  <h2 style={{
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    color: '#2d5016',
                    borderBottom: '3px solid #2d5016',
                    paddingBottom: '8px',
                  }}>
                    {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
                  </h2>
                  {experienceSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ marginBottom: '28px' }}>
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
                            color: '#2d5016',
                            fontStyle: 'italic',
                            fontWeight: 500,
                          }}>
                            {item.date}
                          </div>
                        )}
                      </div>
                      {item.subtitle && (
                        <div style={{
                          fontSize: '1rem',
                          color: '#2d5016',
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
                                  color: '#2d5016',
                                  fontSize: '1rem',
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
                <section style={{ marginBottom: '35px' }}>
                  <h2 style={{
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    color: '#2d5016',
                    borderBottom: '3px solid #2d5016',
                    paddingBottom: '8px',
                  }}>
                    {projectsSection.title?.toUpperCase() || 'KEY PROJECTS'}
                  </h2>
                  {projectsSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ marginBottom: '22px' }}>
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
                          color: '#2d5016',
                          fontSize: '0.9rem',
                          textDecoration: 'underline',
                          fontWeight: 500,
                        }}>
                          {item.subtitle.includes('http') ? 'View Project' : item.subtitle}
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
              backgroundColor: '#f8f9f6',
              padding: '30px',
              borderRadius: '6px',
              border: '2px solid #e8ebe5',
            }}>
              {/* Skills Section */}
              {skillCategories.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '18px',
                    color: '#2d5016',
                    borderBottom: '3px solid #2d5016',
                    paddingBottom: '6px',
                  }}>
                    {skillsSection?.title?.toUpperCase() || 'CORE COMPETENCIES'}
                  </h2>
                  {skillCategories.map((category, catIndex) => (
                    <div key={catIndex} style={{ marginBottom: '18px' }}>
                      <span style={{
                        fontWeight: 600,
                        marginBottom: '10px',
                        display: 'block',
                        fontSize: '0.9rem',
                        color: '#2d5016',
                      }}>
                        {category}
                      </span>
                      <ul style={{
                        listStyle: 'none',
                        paddingLeft: '15px',
                      }}>
                        {skillsByCategory[category].map((skill, skillIndex) => (
                          <li key={skillIndex} style={{
                            marginBottom: '6px',
                            fontSize: '0.85rem',
                            color: '#1a1a1a',
                            position: 'relative',
                          }}>
                            <span style={{
                              position: 'absolute',
                              left: '-15px',
                              color: '#2d5016',
                            }}>•</span>
                            {skill}
                          </li>
                        ))}
                      </ul>
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
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '18px',
                    color: '#2d5016',
                    borderBottom: '3px solid #2d5016',
                    paddingBottom: '6px',
                  }}>
                    {educationSection.title?.toUpperCase() || 'EDUCATION'}
                  </h2>
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ marginBottom: '20px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '4px' }}>
                        {item.subtitle || item.title || ''}
                      </div>
                      {item.title && item.subtitle && (
                        <div style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '4px' }}>
                          {item.title}
                        </div>
                      )}
                      {item.date && (
                        <div style={{ fontSize: '0.8rem', color: '#2d5016', fontStyle: 'italic', fontWeight: 500 }}>
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
                    fontWeight: 700,
                    letterSpacing: '2px',
                    marginBottom: '18px',
                    color: '#2d5016',
                    borderBottom: '3px solid #2d5016',
                    paddingBottom: '6px',
                  }}>
                    {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
                  </h2>
                  <ul style={{
                    listStyle: 'none',
                    paddingLeft: '15px',
                  }}>
                    {languagesSection.items.map((item, index) => (
                      <li key={item.id || index} style={{
                        marginBottom: '10px',
                        fontSize: '0.9rem',
                        color: '#1a1a1a',
                        position: 'relative',
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: '-15px',
                          color: '#2d5016',
                        }}>•</span>
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

export default PhotoExecutive;






