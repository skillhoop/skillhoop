import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoContemporaryProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoContemporary: React.FC<PhotoContemporaryProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Inter', 'Segoe UI', system-ui, sans-serif";
  
  return (
    <>
      <style>{`
        .resume-contemporary-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-contemporary-override"
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
        {/* Header Section with Photo */}
        <header style={{
          backgroundColor: '#1e293b',
          color: '#ffffff',
          padding: '50px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: '40px',
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
                width: '140px',
                height: '140px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '3px solid #ffffff',
                backgroundColor: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                ...(isHovering && {
                  borderColor: '#60a5fa',
                  boxShadow: '0 6px 20px rgba(96, 165, 250, 0.4)',
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
                  color: '#94a3b8',
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
                      <Upload size={24} color="#94a3b8" />
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
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '10px',
                lineHeight: '1.2',
                wordWrap: 'break-word',
                letterSpacing: '-0.5px',
              }}>
                {personalInfo.fullName}
              </h1>
            )}
            {personalInfo.jobTitle && (
              <h2 style={{
                fontSize: '1.2rem',
                fontWeight: 400,
                color: '#cbd5e1',
                marginBottom: '20px',
                wordWrap: 'break-word',
              }}>
                {personalInfo.jobTitle}
              </h2>
            )}
            {contactItems.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                fontSize: '0.9rem',
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
                        color: '#e2e8f0',
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

        {/* Main Content */}
        <div style={{ padding: '40px' }}>
          {/* Summary Section */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ marginBottom: '35px' }}>
              <h2 style={{
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '1.5px',
                marginBottom: '15px',
                color: '#1e293b',
                borderBottom: '2px solid #1e293b',
                paddingBottom: '8px',
              }}>
                Professional Summary
              </h2>
              <p style={{
                fontSize: '1rem',
                color: '#475569',
                lineHeight: '1.7',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}>
                {personalInfo.summary || ''}
              </p>
            </section>
          )}

          {/* Two Column Layout for Experience and Sidebar */}
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
            {/* Left Column - Experience and Projects (70%) */}
            <div style={{ flex: '0 0 70%' }}>
              {/* Work Experience Section */}
              {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
                <section style={{ marginBottom: '35px' }}>
                  <h2 style={{
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    marginBottom: '20px',
                    color: '#1e293b',
                    borderBottom: '2px solid #1e293b',
                    paddingBottom: '8px',
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
                          fontSize: '1.1rem',
                          color: '#1e293b',
                        }}>
                          {item.title || ''}
                        </div>
                        {item.date && (
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#64748b',
                            fontStyle: 'italic',
                          }}>
                            {item.date}
                          </div>
                        )}
                      </div>
                      {item.subtitle && (
                        <div style={{
                          fontSize: '1rem',
                          color: '#475569',
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
                          color: '#475569',
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
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    marginBottom: '20px',
                    color: '#1e293b',
                    borderBottom: '2px solid #1e293b',
                    paddingBottom: '8px',
                  }}>
                    {projectsSection.title?.toUpperCase() || 'PROJECTS'}
                  </h2>
                  {projectsSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ marginBottom: '25px' }}>
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
                          color: '#475569', 
                          marginBottom: '6px',
                          lineHeight: '1.6',
                          wordWrap: 'break-word',
                        }}>
                          {item.description.split('\n')[0]}
                        </p>
                      )}
                      {item.subtitle && (
                        <a href={item.subtitle} style={{
                          color: '#1e40af',
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

            {/* Right Sidebar (30%) */}
            <aside style={{ 
              flex: '0 0 30%',
              backgroundColor: '#f8fafc',
              padding: '25px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}>
              {/* Skills Section */}
              {skillCategories.length > 0 && (
                <section style={{ marginBottom: '30px' }}>
                  <h2 style={{
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    marginBottom: '15px',
                    color: '#1e293b',
                    borderBottom: '2px solid #1e293b',
                    paddingBottom: '6px',
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
                        color: '#475569',
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
                            padding: '5px 12px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            color: '#475569',
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
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    marginBottom: '15px',
                    color: '#1e293b',
                    borderBottom: '2px solid #1e293b',
                    paddingBottom: '6px',
                  }}>
                    {educationSection.title?.toUpperCase() || 'EDUCATION'}
                  </h2>
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} style={{ marginBottom: '20px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', marginBottom: '4px' }}>
                        {item.subtitle || item.title || ''}
                      </div>
                      {item.title && item.subtitle && (
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>
                          {item.title}
                        </div>
                      )}
                      {item.date && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
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
                    marginBottom: '15px',
                    color: '#1e293b',
                    borderBottom: '2px solid #1e293b',
                    paddingBottom: '6px',
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
                        color: '#475569',
                      }}>
                        <strong style={{ color: '#1e293b' }}>{item.title || ''}</strong>
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

export default PhotoContemporary;







