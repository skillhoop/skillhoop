import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoElegantProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoElegant: React.FC<PhotoElegantProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Georgia', 'Times New Roman', serif";
  
  return (
    <>
      <style>{`
        .resume-aside-elegant-override {
          background-color: #f8f9fa !important;
        }
        .resume-aside-elegant-override section {
          background-color: #f8f9fa !important;
        }
        .resume-aside-elegant-override > div {
          background-color: #f8f9fa !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm]"
        style={{
          fontFamily: fontFamily,
          fontSize: `${settings.fontSize || 11}pt`,
          lineHeight: settings.lineHeight || 1.6,
          color: '#2c3e50',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#fff',
          display: 'flex',
          minHeight: '297mm',
        }}
      >
        {/* Left Sidebar (35%) */}
        <aside className="resume-aside-elegant-override" style={{ 
          flex: '0 0 35%', 
          backgroundColor: '#f8f9fa',
          padding: '40px 30px',
          borderRight: '2px solid #e9ecef',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Profile Photo */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '30px',
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
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #fff',
                backgroundColor: '#dee2e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                ...(isHovering && {
                  borderColor: '#6c757d',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
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
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
                          borderRadius: '50%',
                          width: '26px',
                          height: '26px',
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
                  color: '#6c757d',
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
                      <Upload size={28} color="#495057" />
                      <span>Upload Photo</span>
                    </>
                  ) : (
                    <span>Photo</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Name and Title */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            {personalInfo.fullName && (
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#212529',
                marginBottom: '8px',
                lineHeight: '1.2',
                wordWrap: 'break-word',
              }}>
                {personalInfo.fullName}
              </h1>
            )}
            {personalInfo.jobTitle && (
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 400,
                color: '#495057',
                fontStyle: 'italic',
                wordWrap: 'break-word',
              }}>
                {personalInfo.jobTitle}
              </h2>
            )}
          </div>

          {/* Contact Information */}
          {contactItems.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              {contactItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '12px',
                      fontSize: '0.85rem',
                      color: '#495057',
                      wordWrap: 'break-word',
                    }}
                  >
                    <Icon style={{ marginRight: '12px', color: '#6c757d', width: '18px', flexShrink: 0 }} />
                    <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary Section */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: '12px',
                color: '#212529',
                borderBottom: '2px solid #dee2e6',
                paddingBottom: '8px',
              }}>
                About
              </h2>
              <p style={{
                fontSize: '0.9rem',
                color: '#495057',
                lineHeight: '1.6',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                fontStyle: 'italic',
              }}>
                {personalInfo.summary || ''}
              </p>
            </section>
          )}

          {/* Skills Section */}
          {skillCategories.length > 0 && (
            <section style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: '15px',
                color: '#212529',
                borderBottom: '2px solid #dee2e6',
                paddingBottom: '8px',
              }}>
                {skillsSection?.title?.toUpperCase() || 'SKILLS'}
              </h2>
              {skillCategories.map((category, catIndex) => (
                <div key={catIndex} style={{ marginBottom: '15px' }}>
                  <span style={{
                    fontWeight: 600,
                    marginBottom: '8px',
                    display: 'block',
                    fontSize: '0.9rem',
                    color: '#495057',
                  }}>
                    {category}
                  </span>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}>
                    {skillsByCategory[category].map((skill, skillIndex) => (
                      <span key={skillIndex} style={{
                        fontSize: '0.85rem',
                        padding: '4px 10px',
                        backgroundColor: '#fff',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        color: '#495057',
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
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: '15px',
                color: '#212529',
                borderBottom: '2px solid #dee2e6',
                paddingBottom: '8px',
              }}>
                {educationSection.title?.toUpperCase() || 'EDUCATION'}
              </h2>
              {educationSection.items.map((item, index) => (
                <div key={item.id || index} style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#212529', marginBottom: '4px' }}>
                    {item.subtitle || item.title || ''}
                  </div>
                  {item.title && item.subtitle && (
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>
                      {item.title}
                    </div>
                  )}
                  {item.date && (
                    <div style={{ fontSize: '0.8rem', color: '#6c757d', fontStyle: 'italic' }}>
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
                letterSpacing: '1px',
                marginBottom: '15px',
                color: '#212529',
                borderBottom: '2px solid #dee2e6',
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
                    marginBottom: '10px',
                    fontSize: '0.9rem',
                    color: '#495057',
                  }}>
                    <strong>{item.title || ''}</strong>
                    {item.subtitle && ` - ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Main Content (65%) */}
        <div style={{ 
          flex: '0 0 65%', 
          padding: '40px 35px',
          backgroundColor: '#fff',
          overflow: 'hidden',
        }}>
          {/* Work Experience Section */}
          {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
            <section style={{ marginBottom: '35px' }}>
              <h2 style={{
                fontSize: '1.3rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '20px',
                color: '#212529',
                borderBottom: '3px solid #495057',
                paddingBottom: '10px',
              }}>
                {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
              </h2>
              {experienceSection.items.map((item, index) => (
                <div key={item.id || index} style={{ marginBottom: '30px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: '#212529',
                    }}>
                      {item.title || ''}
                    </div>
                    {item.date && (
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#6c757d',
                        fontStyle: 'italic',
                      }}>
                        {item.date}
                      </div>
                    )}
                  </div>
                  {item.subtitle && (
                    <div style={{
                      fontSize: '0.95rem',
                      color: '#495057',
                      marginBottom: '10px',
                      fontWeight: 500,
                    }}>
                      {item.subtitle}
                    </div>
                  )}
                  {item.description && (
                    <ul style={{
                      listStyle: 'disc',
                      paddingLeft: '25px',
                      fontSize: '0.95rem',
                      color: '#495057',
                      lineHeight: '1.7',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}>
                      {item.description.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
                        const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                        return (
                          <li key={lineIndex} style={{ marginBottom: '6px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
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
                marginBottom: '20px',
                color: '#212529',
                borderBottom: '3px solid #495057',
                paddingBottom: '10px',
              }}>
                {projectsSection.title?.toUpperCase() || 'PROJECTS'}
              </h2>
              {projectsSection.items.map((item, index) => (
                <div key={item.id || index} style={{ marginBottom: '25px' }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    marginBottom: '6px',
                    color: '#212529',
                  }}>
                    {item.title || ''}
                  </div>
                  {item.description && (
                    <p style={{ 
                      fontSize: '0.95rem', 
                      color: '#495057', 
                      marginBottom: '6px',
                      lineHeight: '1.6',
                      wordWrap: 'break-word',
                    }}>
                      {item.description.split('\n')[0]}
                    </p>
                  )}
                  {item.subtitle && (
                    <a href={item.subtitle} style={{
                      color: '#495057',
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
      </div>
    </>
  );
};

export default PhotoElegant;






















