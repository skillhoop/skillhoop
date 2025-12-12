import React, { useEffect, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import ExperienceEditor from './ExperienceEditor';
import EducationEditor from './EducationEditor';
import SkillsEditor from './SkillsEditor';
import AIAssistantButton from '../ui/AIAssistantButton';

// EditorSection component for highlighting and auto-scrolling focused sections
function EditorSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const { state, dispatch } = useResume();
  const isActive = state.focusedSectionId === id;
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Auto-clear focus after 2000ms
      const timeout = setTimeout(() => {
        dispatch({ type: 'SET_FOCUSED_SECTION', payload: null });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isActive, dispatch]);

  return (
    <div
      ref={sectionRef}
      className={`transition-all duration-500 rounded-lg p-1 ${
        isActive ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : 'ring-0'
      }`}
    >
      {children}
    </div>
  );
}

export default function ResumeEditor() {
  const { state, dispatch } = useResume();
  const { personalInfo } = state;

  const handleInputChange = (field: keyof typeof personalInfo, value: string) => {
    dispatch({
      type: 'UPDATE_PERSONAL_INFO',
      payload: { [field]: value },
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Personal Details Section */}
      <EditorSection id="personal" title="Personal Details">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Personal Details</h2>
          
          <div className="space-y-4">
          {/* Full Name */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={personalInfo.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="John Doe"
            />
          </div>

          {/* Job Title */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={personalInfo.jobTitle || ''}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="Software Engineer"
            />
          </div>

          {/* Email */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={personalInfo.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Phone */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={personalInfo.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* LinkedIn */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              value={personalInfo.linkedin || ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>

          {/* Website */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={personalInfo.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="https://johndoe.com"
            />
          </div>
          </div>
        </div>
      </EditorSection>

      {/* Professional Summary Section */}
      <EditorSection id="summary" title="Summary">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Professional Summary</h2>
          <div className="space-y-4">
            <div className="bg-white/50 backdrop-blur rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="summary" className="block text-sm font-medium text-slate-700">
                  Professional Summary
                </label>
                <AIAssistantButton
                  currentText={personalInfo.summary || ''}
                  onAccept={(newText) => handleInputChange('summary', newText)}
                />
              </div>
              <textarea
                id="summary"
                value={personalInfo.summary || ''}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                rows={6}
                className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5 resize-none"
                placeholder="A brief summary of your professional background and key achievements..."
              />
            </div>
          </div>
        </div>
      </EditorSection>

      {/* Experience Section */}
      <EditorSection id="experience" title="Experience">
        <ExperienceEditor />
      </EditorSection>

      {/* Education Section */}
      <EditorSection id="education" title="Education">
        <EducationEditor />
      </EditorSection>

      {/* Skills Section */}
      <EditorSection id="skills" title="Skills">
        <SkillsEditor />
      </EditorSection>
    </div>
  );
}
