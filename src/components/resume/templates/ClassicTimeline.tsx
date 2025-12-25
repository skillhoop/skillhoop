import React from 'react';
import { Phone, Mail, Globe, MapPin, Award, Linkedin, Github, Twitter } from 'lucide-react';
import type { PersonalInfo, ResumeSection, FormattingSettings } from '../../../types/resume';

interface ClassicTimelineProps {
  resumeData: {
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
  };
  settings: FormattingSettings;
}

const ClassicTimeline: React.FC<ClassicTimelineProps> = ({ resumeData, settings }) => {
  const { personalInfo, sections } = resumeData;
  
  // Extract sections
  const summarySection = sections.find(s => s.type === 'personal' || s.id === 'summary');
  const experienceSection = sections.find(s => s.type === 'experience');
  const educationSection = sections.find(s => s.type === 'education');
  const skillsSection = sections.find(s => s.type === 'skills');
  const certificationsSection = sections.find(s => s.type === 'certifications');
  
  // Get accent color from settings, default to gray if not provided
  const accentColor = settings.accentColor || '#374151';
  
  // Contact info items
  const contactItems = [
    { icon: MapPin, text: personalInfo.location, show: !!personalInfo.location },
    { icon: Phone, text: personalInfo.phone, show: !!personalInfo.phone },
    { icon: Mail, text: personalInfo.email, show: !!personalInfo.email },
    { icon: Globe, text: personalInfo.website, show: !!personalInfo.website },
  ].filter(item => item.show);
  
  // Social links
  const socialLinks = [
    { icon: Linkedin, text: personalInfo.linkedin, show: !!personalInfo.linkedin },
    { icon: Github, text: personalInfo.website?.includes('github') ? personalInfo.website : '', show: !!personalInfo.website?.includes('github') },
    { icon: Twitter, text: '', show: false }, // Add if needed
  ].filter(item => item.show);
  
  // Get skills/expertise list
  const expertiseItems = skillsSection?.items?.map(item => item.title).filter(Boolean) || [];
  
  // Get awards/certifications
  const awardsItems = certificationsSection?.items?.map(item => ({
    title: item.title || '',
    subtitle: item.subtitle || '',
  })) || [];
  
  return (
    <div
      className="resume-preview-container w-[210mm] min-h-[297mm] relative overflow-hidden flex"
      style={{
        fontFamily: settings.fontFamily || 'system-ui, sans-serif',
        fontSize: `${settings.fontSize || 10}pt`,
        lineHeight: settings.lineHeight || 1.5,
      }}
    >
      {/* Left Sidebar (35%) */}
      <div className="w-[35%] bg-gray-100 px-6 py-6">
        {/* Header Info */}
        <div className="mb-6">
          {personalInfo.fullName && (
            <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900 mb-2">
              {personalInfo.fullName}
            </h1>
          )}
          {personalInfo.jobTitle && (
            <p className="text-sm uppercase tracking-wider text-gray-700">
              {personalInfo.jobTitle}
            </p>
          )}
        </div>
        
        {/* Contact Section */}
        {contactItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              CONTACT
            </h2>
            <div className="space-y-2">
              {contactItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-2 text-xs text-gray-700">
                    <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Expertise Section */}
        {expertiseItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              EXPERTISE
            </h2>
            <ul className="space-y-1.5">
              {expertiseItems.map((skill, index) => (
                <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Awards Section */}
        {awardsItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              AWARDS
            </h2>
            <div className="space-y-3">
              {awardsItems.map((award, index) => (
                <div key={index}>
                  {award.title && (
                    <p className="text-xs font-semibold text-gray-900">{award.title}</p>
                  )}
                  {award.subtitle && (
                    <p className="text-xs text-gray-600 mt-0.5">{award.subtitle}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Follow Me / Social Links */}
        {socialLinks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              FOLLOW ME
            </h2>
            <div className="space-y-2">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="break-words">{link.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Right Content (65%) */}
      <div className="w-[65%] bg-white px-8 py-6">
        {/* Summary Section */}
        {(personalInfo.summary || summarySection) && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              STATEMENT
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed">
              {personalInfo.summary || ''}
            </p>
          </div>
        )}
        
        {/* Work Experience Section with Timeline */}
        {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">
              {experienceSection.title?.toUpperCase() || 'WORK EXPERIENCE'}
            </h2>
            <div className="relative">
              {/* Container with padding for dates on left */}
              <div className="pl-20">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[80px] top-0 bottom-0 w-px bg-gray-300" />
                
                <div className="space-y-6">
                  {experienceSection.items.map((item, index) => (
                    <div key={item.id || index} className="relative">
                      {/* Date Range (Left of line) */}
                      {item.date && (
                        <div className="absolute -left-20 top-0 text-xs text-gray-600 whitespace-nowrap text-right" 
                             style={{ width: '70px' }}>
                          {item.date}
                        </div>
                      )}
                      
                      {/* Timeline Dot - positioned on the line */}
                      <div className="absolute -left-[13px] top-0 w-3 h-3 rounded-full bg-white border-2 border-gray-400 z-10" 
                           style={{ left: '80px' }} />
                      
                      {/* Content (Right of line) */}
                      <div className="pl-4">
                        {item.title && (
                          <h3 className="text-sm font-bold text-gray-900 mb-1">
                            {item.title}
                          </h3>
                        )}
                        {item.subtitle && (
                          <p className="text-xs text-gray-600 mb-2">{item.subtitle}</p>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {item.description.split('\n').map((line, lineIndex) => {
                              const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                              return cleanLine ? (
                                <span key={lineIndex}>
                                  {lineIndex > 0 && <br />}
                                  {cleanLine}
                                </span>
                              ) : null;
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Education Section with Timeline */}
        {educationSection && educationSection.items && educationSection.items.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">
              {educationSection.title?.toUpperCase() || 'EDUCATION'}
            </h2>
            <div className="relative">
              {/* Container with padding for dates on left */}
              <div className="pl-20">
                {/* Vertical Timeline Line (continues from experience) */}
                <div className="absolute left-[80px] top-0 bottom-0 w-px bg-gray-300" />
                
                <div className="space-y-6">
                  {educationSection.items.map((item, index) => (
                    <div key={item.id || index} className="relative">
                      {/* Date Range (Left of line) */}
                      {item.date && (
                        <div className="absolute -left-20 top-0 text-xs text-gray-600 whitespace-nowrap text-right" 
                             style={{ width: '70px' }}>
                          {item.date}
                        </div>
                      )}
                      
                      {/* Timeline Dot - positioned on the line */}
                      <div className="absolute -left-[13px] top-0 w-3 h-3 rounded-full bg-white border-2 border-gray-400 z-10" 
                           style={{ left: '80px' }} />
                      
                      {/* Content (Right of line) */}
                      <div className="pl-4">
                        {item.title && (
                          <h3 className="text-sm font-bold text-gray-900 mb-1">
                            {item.title}
                          </h3>
                        )}
                        {item.subtitle && (
                          <p className="text-xs text-gray-600 mb-2">{item.subtitle}</p>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicTimeline;

