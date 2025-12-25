import React, { useRef, useState } from 'react';
import { Phone, Mail, Globe, MapPin, Upload, X } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';
import { useResume } from '../../../context/ResumeContext';

interface PhotoModernGrayProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const PhotoModernGray: React.FC<PhotoModernGrayProps> = ({ resumeData, settings }) => {
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
  
  // Use Roboto font if available, fallback to system fonts
  const fontFamily = settings.fontFamily || "'Roboto', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";
  
  return (
    <>
      <style>{`
        .resume-aside-override {
          background-color: #fff !important;
        }
        .resume-aside-override section {
          background-color: #fff !important;
        }
        .resume-aside-override > div {
          background-color: #fff !important;
        }
      `}</style>
    <div
      className="resume-preview-container w-[210mm] min-h-[297mm]"
      style={{
        fontFamily: fontFamily,
        fontSize: `${settings.fontSize || 10}pt`,
        lineHeight: settings.lineHeight || 1.6,
        color: '#333',
        maxWidth: '100%',
        width: '100%',
        margin: '0 auto',
        padding: '40px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
        {/* Header Section */}
        <header 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            borderBottom: '2px solid #333',
            paddingBottom: '30px',
            marginBottom: '30px',
            flexWrap: 'wrap' as const,
            overflow: 'hidden',
          }}
        >
          {/* Left: Name and Title */}
          <div style={{ flex: 1, minWidth: '300px', overflow: 'hidden', wordWrap: 'break-word' }}>
            {personalInfo.fullName && (
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#000',
                marginBottom: '5px',
                lineHeight: '1.2',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}>
                {personalInfo.fullName}
              </h1>
            )}
            {personalInfo.jobTitle && (
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#555',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}>
                {personalInfo.jobTitle}
              </h2>
            )}
          </div>
          
          {/* Right: Contact Information */}
          {contactItems.length > 0 && (
            <div style={{ textAlign: 'right' as const, minWidth: '200px', marginTop: '10px', flexShrink: 0 }}>
              {contactItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end',
                      marginBottom: '8px',
                      fontSize: '0.9rem',
                      color: '#555',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
                    <Icon style={{ marginRight: '10px', color: '#333', width: '16px', flexShrink: 0 }} />
                    <span style={{ wordBreak: 'break-word' }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </header>
        
        {/* Main Content - Two Columns */}
        <div style={{ display: 'flex', gap: '40px', overflow: 'hidden' }}>
          {/* Left Column (65%) */}
          <div style={{ flex: '0 0 65%', overflow: 'hidden', minWidth: 0 }}>
            {/* Summary Section */}
            {(personalInfo.summary || summarySection) && (
              <section style={{ marginBottom: '30px' }}>
                <h2 className="section-title" style={{
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '15px',
                  marginTop: '0',
                  color: '#000',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '5px',
                }}>
                  SUMMARY
                </h2>
                <p style={{
                  borderLeft: '4px solid #888',
                  paddingLeft: '15px',
                  fontStyle: 'italic',
                  color: '#555',
                  marginBottom: '20px',
                  fontSize: '0.95rem',
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
                <h2 className="section-title" style={{
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '15px',
                  marginTop: '30px',
                  color: '#000',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '5px',
                }}>
                  {experienceSection.title?.toUpperCase() || 'WORK EXPERIENCE'}
                </h2>
                {experienceSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: '25px' }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: '#000',
                      marginBottom: '8px',
                    }}>
                      {item.title?.toUpperCase() || ''}
                    </div>
                    {(item.subtitle || item.date) && (
                      <div style={{
                        fontStyle: 'italic',
                        color: '#666',
                        fontSize: '0.9rem',
                        marginBottom: '8px',
                      }}>
                        {item.subtitle && `${item.subtitle}`}
                        {item.subtitle && item.date && ' | '}
                        {item.date}
                      </div>
                    )}
                    {item.description && (
                      <ul style={{
                        listStyle: 'disc',
                        paddingLeft: '20px',
                        fontSize: '0.95rem',
                        color: '#444',
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
                <h2 className="section-title" style={{
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '15px',
                  marginTop: '30px',
                  color: '#000',
                  borderBottom: '1px solid #ccc',
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
                      color: '#000',
                    }}>
                      {item.title || ''}
                    </div>
                    {item.description && (
                      <p style={{ fontSize: '0.95rem', color: '#333', marginBottom: '5px' }}>
                        {item.description.split('\n')[0]}
                      </p>
                    )}
                    {item.subtitle && (
                      <a href={item.subtitle} style={{
                        color: '#555',
                        fontSize: '0.85rem',
                        textDecoration: 'underline',
                      }}>
                        [{item.subtitle.includes('http') ? 'Link to Project' : item.subtitle}]
                      </a>
                    )}
                    {!item.subtitle && item.description && item.description.toLowerCase().includes('link') && (
                      <span style={{ color: '#555', fontSize: '0.85rem' }}>[Link to Project]</span>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>
          
          {/* Right Column (35%) */}
          <aside className="resume-aside-override" style={{ flex: '0 0 35%', overflow: 'hidden', minWidth: 0, backgroundColor: '#fff' }}>
            {/* Profile Photo - Always show, at the top of right column */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '30px',
              marginTop: '0',
              backgroundColor: '#fff',
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
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #eee',
                  backgroundColor: '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  ...(isHovering && {
                    borderColor: '#888',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
                    color: '#999',
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
                        <Upload size={24} color="#666" />
                        <span>Upload Photo</span>
                      </>
                    ) : (
                      <span>Photo</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Education Section */}
            {educationSection && educationSection.items && educationSection.items.length > 0 && (
              <section style={{ marginBottom: '30px', backgroundColor: '#fff' }}>
                <h2 className="section-title" style={{
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '15px',
                  marginTop: '0',
                  color: '#000',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '5px',
                }}>
                  {educationSection.title?.toUpperCase() || 'EDUCATION'}
                </h2>
                {educationSection.items.map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: '20px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#000' }}>
                      {item.subtitle || item.title || ''}
                    </div>
                    {item.title && item.subtitle && (
                      <div style={{ fontStyle: 'italic', color: '#666', fontSize: '0.95rem' }}>
                        {item.title}
                      </div>
                    )}
                    {item.date && (
                      <div style={{ color: '#666', fontSize: '0.95rem' }}>
                        {item.date}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}
            
            {/* Skills Section */}
            {skillCategories.length > 0 && (
              <section style={{ marginBottom: '30px', backgroundColor: '#fff' }}>
                <h2 className="section-title" style={{
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '15px',
                  marginTop: '30px',
                  color: '#000',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '5px',
                }}>
                  {skillsSection?.title?.toUpperCase() || 'SKILLS'}
                </h2>
                {skillCategories.map((category, catIndex) => (
                  <div key={catIndex}>
                    <span style={{
                      fontWeight: 700,
                      marginBottom: '10px',
                      display: 'block',
                      marginTop: catIndex > 0 ? '15px' : '0',
                      fontSize: '0.95rem',
                    }}>
                      {category}
                    </span>
                    <ul style={{
                      listStyle: 'none',
                      paddingLeft: '1em',
                      marginBottom: '20px',
                    }}>
                      {skillsByCategory[category].map((skill, skillIndex) => (
                        <li key={skillIndex} style={{
                          marginBottom: '8px',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '-1em',
                            color: '#333',
                            fontWeight: 'bold',
                          }}>•</span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}
            
            {/* Languages Section */}
            {languagesSection && languagesSection.items && languagesSection.items.length > 0 && (
              <section style={{ marginBottom: '30px' }}>
                <h2 className="section-title" style={{
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '15px',
                  marginTop: '30px',
                  color: '#000',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '5px',
                }}>
                  {languagesSection.title?.toUpperCase() || 'LANGUAGES'}
                </h2>
                <ul style={{
                  listStyle: 'none',
                  paddingLeft: '1em',
                }}>
                  {languagesSection.items.map((item, index) => (
                    <li key={item.id || index} style={{
                      marginBottom: '8px',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative',
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: '-1em',
                        color: '#333',
                        fontWeight: 'bold',
                      }}>•</span>
                      <span>
                        <strong>{item.title || ''}</strong>
                        {item.subtitle && `: ${item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)}`}
                      </span>
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

export default PhotoModernGray;

