import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoProfessionalProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoProfessional: React.FC<PhotoProfessionalProps> = ({ resumeData, settings }) => {
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
  const fontFamily = settings.fontFamily || "'Calibri', 'Arial', sans-serif";
  
  return (
    <>
      <style>{`
        .resume-professional-override {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        className="resume-preview-container w-[210mm] min-h-[297mm] resume-professional-override"
        style={{
          fontFamily: fontFamily,
          fontSize: `${settings.fontSize || 10}pt`,
          lineHeight: settings.lineHeight || 1.5,
          color: '#2c3e50',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          display: 'flex',
          minHeight: '297mm',
        }}
      >
        {/* Main Content (70%) */}
        <div style={{ 
          flex: '0 0 70%', 
          padding: '45px 40px',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}>
          {/* Header Section */}
          <header style={{
            borderBottom: '3px solid #2c3e50',
            paddingBottom: '20px',
            marginBottom: '30px',
          }}>
            {personalInfo.fullName && (
              <h1 style={{
                fontSize: '2.4rem',
                fontWeight: 700,
                color: '#2c3e50',
                marginBottom: '8px',
                lineHeight: '1.2',
                wordWrap: 'break-word',
                letterSpacing: '-0.5px',
              }}>
                {personalInfo.fullName}
              </h1>
            )}
            {personalInfo.jobTitle && (
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 400,
                color: '#34495e',
                marginBottom: '15px',
                wordWrap: 'break-word',
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
                color: '#5a6c7d',
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
          </header>

          {/* Summary Section */}
          {(personalInfo.summary || summarySection) && (
            <section style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: '12px',
                color: '#2c3e50',
                borderBottom: '2px solid #2c3e50',
                paddingBottom: '5px',
              }}>
                Professional Summary
              </h2>
              <p style={{
                fontSize: '0.95rem',
                color: '#34495e',
                lineHeight: '1.6',
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
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: '18px',
                color: '#2c3e50',
                borderBottom: '2px solid #2c3e50',
                paddingBottom: '5px',
              }}>
                {experienceSection.title?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
              </h2>
              {experienceSection.items.map((item, index) => (
                <div key={item.id || index} style={{ marginBottom: '25px' }}>
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
                      color: '#2c3e50',
                    }}>
                      {item.title || ''}
                    </div>
                    {item.date && (
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#7f8c8d',
                        fontStyle: 'italic',
                      }}>
                        {item.date}
                      </div>
                    )}
                  </div>
                  {item.subtitle && (
                    <div style={{
                      fontSize: '0.95rem',
                      color: '#34495e',
                      marginBottom: '8px',
                      fontWeight: 500,
                    }}>
                      {item.subtitle}
                    </div>
                  )}
                  {item.description && (
                    <ul style={{
                      listStyle: 'disc',
                      paddingLeft: '22px',
                      fontSize: '0.95rem',
                      color: '#34495e',
                      lineHeight: '1.6',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}>
                      {item.description.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
                        const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                        return (
                          <li key={lineIndex} style={{ marginBottom: '5px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
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
                marginBottom: '18px',
                color: '#2c3e50',
                borderBottom: '2px solid #2c3e50',
                paddingBottom: '5px',
              }}>
                {projectsSection.title?.toUpperCase() || 'PROJECTS'}
              </h2>
              {projectsSection.items.map((item, index) => (
                <div key={item.id || index} style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    marginBottom: '5px',
                    color: '#2c3e50',
                  }}>
                    {item.title || ''}
                  </div>
                  {item.description && (
                    <p style={{ 
                      fontSize: '0.95rem', 
                      color: '#34495e', 
                      marginBottom: '5px',
                      lineHeight: '1.6',
                      wordWrap: 'break-word',
                    }}>
                      {item.description.split('\n')[0]}
                    </p>
                  )}
                  {item.subtitle && (
                    <a href={item.subtitle} style={{
                      color: '#3498db',
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
          backgroundColor: '#ecf0f1',
          padding: '45px 30px',
          borderLeft: '4px solid #2c3e50',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Photo Section */}
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
                width: '170px',
                height: '170px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #2c3e50',
                backgroundColor: '#bdc3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                ...(isHovering && {
                  borderColor: '#3498db',
                  boxShadow: '0 6px 20px rgba(52, 152, 219, 0.3)',
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
                  color: '#7f8c8d',
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
                      <Upload size={28} color="#7f8c8d" />
                      <span>Upload Photo</span>
                    </>
                  ) : (
                    <span>Photo</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Skills Section */}
          {skillCategories.length > 0 && (
            <section style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: '15px',
                color: '#2c3e50',
                borderBottom: '2px solid #2c3e50',
                paddingBottom: '5px',
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
                    color: '#34495e',
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
                        color: '#34495e',
                        position: 'relative',
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: '-15px',
                          color: '#2c3e50',
                          fontWeight: 'bold',
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
                letterSpacing: '1px',
                marginBottom: '15px',
                color: '#2c3e50',
                borderBottom: '2px solid #2c3e50',
                paddingBottom: '5px',
              }}>
                {educationSection.title?.toUpperCase() || 'EDUCATION'}
              </h2>
              {educationSection.items.map((item, index) => (
                <div key={item.id || index} style={{ marginBottom: '18px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2c3e50', marginBottom: '4px' }}>
                    {item.subtitle || item.title || ''}
                  </div>
                  {item.title && item.subtitle && (
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '4px' }}>
                      {item.title}
                    </div>
                  )}
                  {item.date && (
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d', fontStyle: 'italic' }}>
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
                color: '#2c3e50',
                borderBottom: '2px solid #2c3e50',
                paddingBottom: '5px',
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
                    color: '#34495e',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '-15px',
                      color: '#2c3e50',
                      fontWeight: 'bold',
                    }}>•</span>
                    <strong style={{ color: '#2c3e50' }}>{item.title || ''}</strong>
                    {item.subtitle && ` - ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
};

export default PhotoProfessional;






















