import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoProfessionalCompactProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoProfessionalCompact: React.FC<PhotoProfessionalCompactProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Segoe UI', 'Arial', sans-serif";
  
  return (
    <>
      <style>{`
        .resume-professional-compact-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-professional-compact-override"
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
        {/* Compact Professional Header */}
        <header style={{
          background: '#ffffff',
          padding: '30px 50px',
          borderBottom: '4px solid #2563eb',
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          flexWrap: 'wrap',
        }}>
          {/* Professional Accent Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: '#2563eb',
          }} />
          
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
                width: '120px',
                height: '120px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '3px solid #2563eb',
                backgroundColor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                ...(isHovering && {
                  borderColor: '#3b82f6',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
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
                        backgroundColor: 'rgba(37, 99, 235, 0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Upload size={20} color="#ffffff" />
                      <span>Change Photo</span>
                      <button
                        onClick={handleRemovePhoto}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '4px',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        title="Remove photo"
                      >
                        <X size={14} color="#2563eb" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  color: '#6b7280',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {isHovering ? (
                    <>
                      <Upload size={24} color="#2563eb" />
                      <span style={{ color: '#2563eb' }}>Upload</span>
                    </>
                  ) : (
                    <span>Photo</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Name, Title, and Contact Info */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            {personalInfo.fullName && (
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '6px',
                lineHeight: '1.1',
                wordWrap: 'break-word',
              }}>
                {personalInfo.fullName}
              </h1>
            )}
            {personalInfo.jobTitle && (
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 400,
                color: '#475569',
                marginBottom: '16px',
                wordWrap: 'break-word',
              }}>
                {personalInfo.jobTitle}
              </h2>
            )}
            {contactItems.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '18px',
                fontSize: '0.85rem',
                color: '#64748b',
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
                      <Icon size={14} color="#2563eb" />
                      <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
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
              marginBottom: '28px',
              padding: '20px 24px',
              background: '#f8fafc',
              borderRadius: '0',
              borderLeft: '4px solid #2563eb',
              borderTop: '1px solid #e2e8f0',
              borderRight: '1px solid #e2e8f0',
              borderBottom: '1px solid #e2e8f0',
            }}>
              <h2 style={{
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '1.5px',
                marginBottom: '10px',
                color: '#2563eb',
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
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
            {/* Left Column - Experience and Projects (65%) */}
            <div style={{ flex: '0 0 65%' }}>
              {/* Work Experience Section */}
              {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
                <section style={{ marginBottom: '28px' }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    marginBottom: '18px',
                    color: '#1e293b',
                    borderBottom: '2px solid #2563eb',
                    paddingBottom: '8px',
                  }}>
                    {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
                  </h2>
                  {experienceSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '24px',
                      paddingLeft: '18px',
                      borderLeft: '3px solid #2563eb',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-7px',
                        top: '0',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb',
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
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: '#1e293b',
                        }}>
                          {item.title || ''}
                        </div>
                        {item.date && (
                          <div style={{
                            fontSize: '0.85rem',
                            color: '#2563eb',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            background: '#f8fafc',
                            padding: '4px 12px',
                            borderRadius: '0',
                            border: '1px solid #e2e8f0',
                          }}>
                            {item.date}
                          </div>
                        )}
                      </div>
                      {item.subtitle && (
                        <div style={{
                          fontSize: '0.95rem',
                          color: '#475569',
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
                                paddingLeft: '18px',
                                position: 'relative',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                              }}>
                                <span style={{
                                  position: 'absolute',
                                  left: 0,
                                  color: '#2563eb',
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
                <section style={{ marginBottom: '28px' }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    marginBottom: '18px',
                    color: '#1e293b',
                    borderBottom: '2px solid #2563eb',
                    paddingBottom: '8px',
                  }}>
                    {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                  </h2>
                  {projectsSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '18px',
                      padding: '18px',
                      background: '#f8fafc',
                      borderRadius: '0',
                      borderLeft: '4px solid #2563eb',
                      borderTop: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        marginBottom: '6px',
                        color: '#1e293b',
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
                          color: '#2563eb',
                          fontSize: '0.9rem',
                          textDecoration: 'none',
                          fontWeight: 600,
                          borderBottom: '1px solid #2563eb',
                        }}>
                          {item.subtitle.includes('http') ? 'View Project →' : item.subtitle}
                        </a>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>

            {/* Right Column - Skills, Education, Languages (35%) */}
            <div style={{ flex: '0 0 35%' }}>
              {/* Skills Section */}
              {skillCategories.length > 0 && (
                <section style={{ marginBottom: '28px' }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    marginBottom: '18px',
                    color: '#1e293b',
                    borderBottom: '2px solid #2563eb',
                    paddingBottom: '8px',
                  }}>
                    {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                  </h2>
                  {skillCategories.map((category, catIndex) => (
                    <div key={catIndex} style={{ marginBottom: '16px' }}>
                      <span style={{
                        fontWeight: 700,
                        marginBottom: '10px',
                        display: 'block',
                        fontSize: '0.95rem',
                        color: '#1e293b',
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
                            border: '1px solid #2563eb',
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
                <section style={{ marginBottom: '28px' }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    marginBottom: '18px',
                    color: '#1e293b',
                    borderBottom: '2px solid #2563eb',
                    paddingBottom: '8px',
                  }}>
                    {educationSection.title?.toUpperCase() || 'EDUCATION'}
                  </h2>
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ 
                      marginBottom: '18px',
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0',
                      borderLeft: '3px solid #2563eb',
                      borderTop: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '6px' }}>
                        {item.subtitle || item.title || ''}
                      </div>
                      {item.title && item.subtitle && (
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                          {item.title}
                        </div>
                      )}
                      {item.date && (
                        <div style={{ fontSize: '0.8rem', color: '#2563eb', fontStyle: 'normal', fontWeight: 600 }}>
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
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    marginBottom: '18px',
                    color: '#1e293b',
                    borderBottom: '2px solid #2563eb',
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
                        borderRadius: '0',
                        borderLeft: '3px solid #2563eb',
                        borderTop: '1px solid #e2e8f0',
                        borderRight: '1px solid #e2e8f0',
                        borderBottom: '1px solid #e2e8f0',
                      }}>
                        <strong style={{ color: '#1e293b' }}>{item.title || ''}</strong>
                        {item.subtitle && ` - ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
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

export default PhotoProfessionalCompact;







