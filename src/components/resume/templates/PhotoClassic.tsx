import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoClassicProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoClassic: React.FC<PhotoClassicProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Times New Roman', 'Times', serif";
  
  return (
    <>
      <style>{`
        .resume-classic-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-classic-override"
        style={{
          fontFamily: fontFamily,
          fontSize: `${settings.fontSize || 11}pt`,
          lineHeight: settings.lineHeight || 1.5,
          color: '#000000',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          padding: '35px 40px',
        }}
      >
        {/* Header Section with Photo */}
        <header style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '30px',
          marginBottom: '30px',
          paddingBottom: '25px',
          borderBottom: '2px solid #000000',
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
                width: '130px',
                height: '130px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '2px solid #000000',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                ...(isHovering && {
                  borderColor: '#333333',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
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
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
                        <X size={14} color="#333" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  color: '#999999',
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
                      <Upload size={24} color="#999999" />
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
          <div style={{ flex: 1 }}>
            {personalInfo.fullName && (
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#000000',
                marginBottom: '8px',
                lineHeight: '1.2',
                wordWrap: 'break-word',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                {personalInfo.fullName}
              </h1>
            )}
            {personalInfo.jobTitle && (
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 400,
                color: '#333333',
                marginBottom: '15px',
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
                gap: '15px',
                fontSize: '0.9rem',
                color: '#000000',
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
                      <Icon size={16} />
                      <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {/* Summary Section */}
        {(personalInfo.summary || summarySection) && (
          <section style={{ 
            marginBottom: '25px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderLeft: '4px solid #000000',
          }}>
            <h2 style={{
              fontSize: '1rem',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '1px',
              marginBottom: '10px',
              color: '#000000',
            }}>
              Professional Summary
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: '#000000',
              lineHeight: '1.6',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}>
              {personalInfo.summary || ''}
            </p>
          </section>
        )}

        {/* Two Column Layout */}
        <div style={{ display: 'flex', gap: '35px', alignItems: 'flex-start' }}>
          {/* Left Column - Experience and Projects (65%) */}
          <div style={{ flex: '0 0 65%' }}>
            {/* Work Experience Section */}
            {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
              <section style={{ marginBottom: '30px' }}>
                <h2 style={{
                  fontSize: '1.1rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '15px',
                  color: '#000000',
                  borderBottom: '1px solid #000000',
                  paddingBottom: '5px',
                }}>
                  {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
                </h2>
                {experienceSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: '20px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '5px',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#000000',
                      }}>
                        {item.title || ''}
                      </div>
                      {item.date && (
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#666666',
                          fontStyle: 'italic',
                        }}>
                          {item.date}
                        </div>
                      )}
                    </div>
                    {item.subtitle && (
                      <div style={{
                        fontSize: '0.95rem',
                        color: '#333333',
                        marginBottom: '8px',
                        fontWeight: 500,
                      }}>
                        {item.subtitle}
                      </div>
                    )}
                    {item.description && (
                      <ul style={{
                        listStyle: 'disc',
                        paddingLeft: '20px',
                        fontSize: '0.95rem',
                        color: '#000000',
                        lineHeight: '1.6',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}>
                        {item.description.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
                          const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                          return (
                            <li key={lineIndex} style={{ marginBottom: '4px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
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
                  fontSize: '1.1rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '15px',
                  color: '#000000',
                  borderBottom: '1px solid #000000',
                  paddingBottom: '5px',
                }}>
                  {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                </h2>
                {projectsSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: '18px' }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      marginBottom: '4px',
                      color: '#000000',
                    }}>
                      {item.title || ''}
                    </div>
                    {item.description && (
                      <p style={{ 
                        fontSize: '0.95rem', 
                        color: '#000000', 
                        marginBottom: '4px',
                        lineHeight: '1.6',
                        wordWrap: 'break-word',
                      }}>
                        {item.description.split('\n')[0]}
                      </p>
                    )}
                    {item.subtitle && (
                      <a href={item.subtitle} style={{
                        color: '#000000',
                        fontSize: '0.9rem',
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

          {/* Right Sidebar (35%) */}
          <aside style={{ 
            flex: '0 0 35%',
            padding: '20px',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
          }}>
            {/* Skills Section */}
            {skillCategories.length > 0 && (
              <section style={{ marginBottom: '25px' }}>
                <h2 style={{
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  color: '#000000',
                  borderBottom: '1px solid #000000',
                  paddingBottom: '4px',
                }}>
                  {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                </h2>
                {skillCategories.map((category, catIndex) => (
                  <div key={catIndex} style={{ marginBottom: '12px' }}>
                    <span style={{
                      fontWeight: 600,
                      marginBottom: '6px',
                      display: 'block',
                      fontSize: '0.9rem',
                      color: '#333333',
                    }}>
                      {category}
                    </span>
                    <ul style={{
                      listStyle: 'none',
                      paddingLeft: '15px',
                    }}>
                      {skillsByCategory[category].map((skill, skillIndex) => (
                        <li key={skillIndex} style={{
                          marginBottom: '4px',
                          fontSize: '0.85rem',
                          color: '#000000',
                          position: 'relative',
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '-15px',
                            color: '#000000',
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
              <section style={{ marginBottom: '25px' }}>
                <h2 style={{
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  color: '#000000',
                  borderBottom: '1px solid #000000',
                  paddingBottom: '4px',
                }}>
                  {educationSection.title?.toUpperCase() || 'EDUCATION'}
                </h2>
                {educationSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#000000', marginBottom: '3px' }}>
                      {item.subtitle || item.title || ''}
                    </div>
                    {item.title && item.subtitle && (
                      <div style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '3px' }}>
                        {item.title}
                      </div>
                    )}
                    {item.date && (
                      <div style={{ fontSize: '0.8rem', color: '#666666', fontStyle: 'italic' }}>
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
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  color: '#000000',
                  borderBottom: '1px solid #000000',
                  paddingBottom: '4px',
                }}>
                  {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: '15px',
                }}>
                  {languagesSection.items.map((item, index) => (
                    <li key={item.id || index} style={{
                      marginBottom: '8px',
                      fontSize: '0.9rem',
                      color: '#000000',
                      position: 'relative',
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: '-15px',
                        color: '#000000',
                      }}>•</span>
                      <strong>{item.title || ''}</strong>
                      {item.subtitle && ` - ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>
    </>
  );
};

export default PhotoClassic;







