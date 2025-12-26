import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoMinimalistProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoMinimalist: React.FC<PhotoMinimalistProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Helvetica Neue', 'Arial', sans-serif";
  
  return (
    <>
      <style>{`
        .resume-minimalist-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-minimalist-override"
        style={{
          fontFamily: fontFamily,
          fontSize: `${settings.fontSize || 10}pt`,
          lineHeight: settings.lineHeight || 1.6,
          color: '#2d3748',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          padding: '50px 60px',
        }}
      >
        {/* Top Section - Photo, Name, Title, Contact */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
          paddingBottom: '40px',
          borderBottom: '1px solid #e2e8f0',
        }}>
          {/* Photo */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '25px',
          }}>
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
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #e2e8f0',
                backgroundColor: '#f7fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                ...(isHovering && {
                  borderColor: '#4a5568',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Upload size={20} />
                      <span>Change Photo</span>
                      <button
                        onClick={handleRemovePhoto}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
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
                        <X size={14} color="#333" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  color: '#a0aec0',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {isHovering ? (
                    <>
                      <Upload size={24} color="#a0aec0" />
                      <span>Upload Photo</span>
                    </>
                  ) : (
                    <span>Photo</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          {personalInfo.fullName && (
            <h1 style={{
              fontSize: '2.2rem',
              fontWeight: 300,
              color: '#1a202c',
              marginBottom: '8px',
              lineHeight: '1.2',
              wordWrap: 'break-word',
              letterSpacing: '2px',
            }}>
              {personalInfo.fullName}
            </h1>
          )}

          {/* Job Title */}
          {personalInfo.jobTitle && (
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 400,
              color: '#718096',
              marginBottom: '20px',
              wordWrap: 'break-word',
              letterSpacing: '1px',
            }}>
              {personalInfo.jobTitle}
            </h2>
          )}

          {/* Contact Information */}
          {contactItems.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '15px',
              fontSize: '0.85rem',
              color: '#4a5568',
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
                    <Icon size={14} />
                    <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Content - Two Columns */}
        <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
          {/* Left Column (60%) */}
          <div style={{ flex: '0 0 60%' }}>
            {/* Summary Section */}
            {(personalInfo.summary || summarySection) && (
              <section style={{ marginBottom: '35px' }}>
                <h2 style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  marginBottom: '12px',
                  color: '#2d3748',
                }}>
                  Summary
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#4a5568',
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
              <section style={{ marginBottom: '35px' }}>
                <h2 style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  color: '#2d3748',
                }}>
                  {experienceSection.title?.toUpperCase() || 'EXPERIENCE'}
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
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: '#1a202c',
                      }}>
                        {item.title || ''}
                      </div>
                      {item.date && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#718096',
                          fontStyle: 'italic',
                        }}>
                          {item.date}
                        </div>
                      )}
                    </div>
                    {item.subtitle && (
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#4a5568',
                        marginBottom: '8px',
                        fontStyle: 'italic',
                      }}>
                        {item.subtitle}
                      </div>
                    )}
                    {item.description && (
                      <ul style={{
                        listStyle: 'none',
                        paddingLeft: 0,
                        fontSize: '0.9rem',
                        color: '#4a5568',
                        lineHeight: '1.7',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}>
                        {item.description.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
                          const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                          return (
                            <li key={lineIndex} style={{ 
                              marginBottom: '6px',
                              paddingLeft: '15px',
                              position: 'relative',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                            }}>
                              <span style={{
                                position: 'absolute',
                                left: 0,
                                color: '#cbd5e0',
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
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  color: '#2d3748',
                }}>
                  {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                </h2>
                {projectsSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      marginBottom: '4px',
                      color: '#1a202c',
                    }}>
                      {item.title || ''}
                    </div>
                    {item.description && (
                      <p style={{ 
                        fontSize: '0.9rem', 
                        color: '#4a5568', 
                        marginBottom: '4px',
                        lineHeight: '1.6',
                        wordWrap: 'break-word',
                      }}>
                        {item.description.split('\n')[0]}
                      </p>
                    )}
                    {item.subtitle && (
                      <a href={item.subtitle} style={{
                        color: '#2d3748',
                        fontSize: '0.85rem',
                        textDecoration: 'underline',
                      }}>
                        {item.subtitle.includes('http') ? 'View Project' : item.subtitle}
                      </a>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Right Column (40%) */}
          <div style={{ flex: '0 0 40%' }}>
            {/* Skills Section */}
            {skillCategories.length > 0 && (
              <section style={{ marginBottom: '35px' }}>
                <h2 style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  marginBottom: '15px',
                  color: '#2d3748',
                }}>
                  {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                </h2>
                {skillCategories.map((category, catIndex) => (
                  <div key={catIndex} style={{ marginBottom: '15px' }}>
                    <span style={{
                      fontWeight: 500,
                      marginBottom: '8px',
                      display: 'block',
                      fontSize: '0.85rem',
                      color: '#4a5568',
                    }}>
                      {category}
                    </span>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '5px',
                    }}>
                      {skillsByCategory[category].map((skill, skillIndex) => (
                        <span key={skillIndex} style={{
                          fontSize: '0.8rem',
                          padding: '3px 8px',
                          backgroundColor: '#f7fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          color: '#4a5568',
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
              <section style={{ marginBottom: '35px' }}>
                <h2 style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  marginBottom: '15px',
                  color: '#2d3748',
                }}>
                  {educationSection.title?.toUpperCase() || 'EDUCATION'}
                </h2>
                {educationSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: '18px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a202c', marginBottom: '3px' }}>
                      {item.subtitle || item.title || ''}
                    </div>
                    {item.title && item.subtitle && (
                      <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '3px' }}>
                        {item.title}
                      </div>
                    )}
                    {item.date && (
                      <div style={{ fontSize: '0.8rem', color: '#a0aec0', fontStyle: 'italic' }}>
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
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  marginBottom: '15px',
                  color: '#2d3748',
                }}>
                  {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: 0,
                }}>
                  {languagesSection.items.map((item, index) => (
                    <li key={item.id || index} style={{
                      marginBottom: '8px',
                      fontSize: '0.9rem',
                      color: '#4a5568',
                    }}>
                      <strong style={{ color: '#1a202c' }}>{item.title || ''}</strong>
                      {item.subtitle && ` - ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PhotoMinimalist;







