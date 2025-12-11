import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download } from 'lucide-react';
import ResumeControlPanel, {
  ResumeControlPanelData,
  Section,
  FormattingValues,
  ResumeData,
} from '../components/resume/ResumeControlPanel';

// Storage key for localStorage
const STORAGE_KEY = 'career-clarified-resume-data';

// Default resume data structure
const DEFAULT_RESUME_DATA = {
  personalInfo: {
    fullName: "Your Name",
    jobTitle: "Product Designer",
    email: "hello@example.com",
    phone: "+1 234 567 890",
    location: "San Francisco, CA"
  },
  summary: "Passionate designer with 5+ years of experience...",
  experience: [
    {
      id: "1",
      jobTitle: "Senior Software Engineer",
      company: "Tech Company Inc.",
      location: "San Francisco, CA",
      startDate: "2021",
      endDate: "Present",
      description: "Led development of a microservices architecture serving 1M+ daily active users\nReduced page load time by 40% through optimization and caching strategies\nMentored junior developers and established coding best practices"
    }
  ],
  education: [
    {
      id: "1",
      school: "University of Technology",
      degree: "Bachelor of Science",
      location: "San Francisco, CA",
      startDate: "2015",
      endDate: "2019"
    }
  ],
  skills: ["JavaScript", "React", "Node.js", "Product Management"]
};

// Helper function to map template ID to template string
const getTemplateString = (templateId: number | null): 'classic' | 'modern' => {
  // Template ID 1 = Professional Classic -> 'classic'
  // Template ID 2 = Tech Modern -> 'modern'
  // Default to 'classic'
  if (templateId === 2) return 'modern';
  if (templateId === 1) return 'classic';
  return 'classic'; // Default fallback
};

// ResumePreviewSection Component
interface ResumePreviewSectionProps {
  resumeData: ResumeData;
  templateId: 'classic' | 'modern';
  sections: Section[];
  formatting: FormattingValues;
  lineHeight: number;
}

function ResumePreviewSection({ resumeData, templateId, sections, formatting, lineHeight }: ResumePreviewSectionProps) {
  // Classic Layout (existing centered layout)
  if (templateId === 'classic') {
    return (
      <>
        {/* Header Section */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <div
            className="mb-6 pb-4 border-b-2"
            style={{ borderColor: formatting.accentColor }}
          >
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: formatting.accentColor }}
            >
              {resumeData.personalInfo.fullName}
            </h1>
            <div className="text-gray-600 space-y-1">
              <p>{resumeData.personalInfo.jobTitle}</p>
              <p>{resumeData.personalInfo.email} • {resumeData.personalInfo.phone}</p>
              <p>{resumeData.personalInfo.location}</p>
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {sections.find((s) => s.id === 'profile')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-2 uppercase tracking-wide"
              style={{ color: formatting.accentColor }}
            >
              Professional Summary
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {resumeData.summary}
            </p>
          </div>
        )}

        {/* Experience Section */}
        {sections.find((s) => s.id === 'experience')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide"
              style={{ color: formatting.accentColor }}
            >
              Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{exp.jobTitle || "Job Title"}</h3>
                    <span className="text-gray-600 text-sm">
                      {exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : 
                       exp.startDate ? exp.startDate : ""}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {exp.company && exp.location ? `${exp.company} • ${exp.location}` :
                     exp.company ? exp.company : ""}
                  </p>
                  {exp.description && (
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {exp.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-1">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {sections.find((s) => s.id === 'education')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide"
              style={{ color: formatting.accentColor }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree || "Degree"} {edu.school && `at ${edu.school}`}
                    </h3>
                    <span className="text-gray-600 text-sm">
                      {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : 
                       edu.startDate ? edu.startDate : ""}
                    </span>
                  </div>
                  {edu.location && (
                    <p className="text-gray-600 text-sm">{edu.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {sections.find((s) => s.id === 'skills')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide"
              style={{ color: formatting.accentColor }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${formatting.accentColor}20`,
                    color: formatting.accentColor,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {sections.find((s) => s.id === 'certifications')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide"
              style={{ color: formatting.accentColor }}
            >
              Certifications
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">AWS Certified Solutions Architect • 2022</p>
              <p className="text-gray-700">Certified Kubernetes Administrator • 2021</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Modern Layout (sidebar layout)
  return (
    <div className="grid grid-cols-[1fr_2fr] min-h-[800px]">
      {/* Left Column - Sidebar (Dark Background) */}
      <div className="bg-slate-800 text-white p-6">
        {/* Profile Photo */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <div className="mb-6">
            {resumeData.profilePicture ? (
              <img
                src={resumeData.profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-2 border-white/30"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/10 mx-auto mb-6 flex items-center justify-center border-2 border-white/30">
                <span className="text-white/50 text-sm">
                  {resumeData.personalInfo.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'Photo'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Contact Info */}
        {sections.find((s) => s.id === 'heading')?.isVisible && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2 text-white">
              {resumeData.personalInfo.fullName}
            </h1>
            <p className="text-white/80 mb-4">{resumeData.personalInfo.jobTitle}</p>
            <div className="space-y-2 text-sm text-white/70">
              <p>{resumeData.personalInfo.email}</p>
              <p>{resumeData.personalInfo.phone}</p>
              <p>{resumeData.personalInfo.location}</p>
            </div>
          </div>
        )}

        {/* Core Skills */}
        {sections.find((s) => s.id === 'skills')?.isVisible && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide text-white border-b border-white/20 pb-2">
              Core Skills
            </h2>
            <div className="flex flex-col gap-2">
              {resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 text-white border border-white/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Main Content (White Background) */}
      <div className="bg-white p-6">
        {/* Professional Summary */}
        {sections.find((s) => s.id === 'profile')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-3 uppercase tracking-wide text-gray-800"
              style={{ color: formatting.accentColor }}
            >
              Professional Summary
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {resumeData.summary}
            </p>
          </div>
        )}

        {/* Experience Section */}
        {sections.find((s) => s.id === 'experience')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800"
              style={{ color: formatting.accentColor }}
            >
              Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{exp.jobTitle || "Job Title"}</h3>
                    <span className="text-gray-600 text-sm">
                      {exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : 
                       exp.startDate ? exp.startDate : ""}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {exp.company && exp.location ? `${exp.company} • ${exp.location}` :
                     exp.company ? exp.company : ""}
                  </p>
                  {exp.description && (
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {exp.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-1">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {sections.find((s) => s.id === 'education')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800"
              style={{ color: formatting.accentColor }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree || "Degree"} {edu.school && `at ${edu.school}`}
                    </h3>
                    <span className="text-gray-600 text-sm">
                      {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : 
                       edu.startDate ? edu.startDate : ""}
                    </span>
                  </div>
                  {edu.location && (
                    <p className="text-gray-600 text-sm">{edu.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {sections.find((s) => s.id === 'certifications')?.isVisible && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800"
              style={{ color: formatting.accentColor }}
            >
              Certifications
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">AWS Certified Solutions Architect • 2022</p>
              <p className="text-gray-700">Certified Kubernetes Administrator • 2021</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumeEditorPage() {
  // Ref for PDF printing
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: resumePreviewRef,
    documentTitle: 'My_Resume',
  });

  // State Management
  const [templateId, setTemplateId] = useState<number | null>(2); // Default to template ID 2 (Tech Modern)
  const [formatting, setFormatting] = useState<FormattingValues>({
    font: 'Inter',
    lineSpacing: 1.5,
    accentColor: '#3B82F6', // Blue
  });
  const [sections, setSections] = useState<Section[]>([
    { id: 'heading', label: 'Heading', isVisible: true },
    { id: 'profile', label: 'Profile', isVisible: true },
    { id: 'experience', label: 'Experience', isVisible: true },
    { id: 'education', label: 'Education', isVisible: true },
    { id: 'skills', label: 'Skills', isVisible: true },
    { id: 'certifications', label: 'Certifications', isVisible: false },
  ]);
  const [atsScore, setAtsScore] = useState<number>(0);
  const [resumeData, setResumeData] = useState(DEFAULT_RESUME_DATA);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [loadingExperienceId, setLoadingExperienceId] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setResumeData(parsedData);
      }
    } catch (error) {
      console.error('Failed to load resume data from localStorage:', error);
      // If there's an error parsing, fall back to default data
    }
  }, []);

  // Auto-save data to localStorage whenever resumeData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
    } catch (error) {
      console.error('Failed to save resume data to localStorage:', error);
    }
  }, [resumeData]);

  // Handler Functions
  const handleContentChange = (path: string, value: string) => {
    setResumeData((prev) => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };
  const handleFormattingChange = (key: string, value: string | number) => {
    setFormatting((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSectionToggle = (id: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, isVisible: !section.isVisible } : section
      )
    );
  };

  const handleTemplateChange = (id: number) => {
    setTemplateId(id);
  };

  const handleAIAction = (action: string) => {
    console.log('AI Action triggered:', action);
    // Simulate ATS score update (in real app, this would call an API)
    if (action === 'ats') {
      setAtsScore(85); // Mock score after optimization
    }
  };

  const handleAIGenerateSummary = async () => {
    // Check if summary and jobTitle exist
    if (!resumeData.summary || resumeData.summary.trim() === '') {
      alert('Please enter a summary first.');
      return;
    }

    if (!resumeData.personalInfo.jobTitle || resumeData.personalInfo.jobTitle.trim() === '') {
      alert('Please enter a job title first.');
      return;
    }

    setIsGeneratingAI(true);

    try {
      const response = await fetch('/api/enhance-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: resumeData.summary,
          jobTitle: resumeData.personalInfo.jobTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance summary');
      }

      const data = await response.json();
      
      // Update the summary with the enhanced version
      setResumeData((prev) => ({
        ...prev,
        summary: data.enhancedSummary,
      }));
    } catch (error) {
      console.error('Error enhancing summary:', error);
      alert(error instanceof Error ? error.message : 'Failed to enhance summary. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAIEnhanceExperience = async (id: string, currentDescription: string) => {
    // Check if description exists
    if (!currentDescription || currentDescription.trim() === '') {
      alert('Please enter a description first.');
      return;
    }

    // Check if jobTitle exists (use the experience item's jobTitle or fallback to personalInfo.jobTitle)
    const experienceItem = resumeData.experience.find((exp) => exp.id === id);
    const jobTitle = experienceItem?.jobTitle || resumeData.personalInfo.jobTitle;

    if (!jobTitle || jobTitle.trim() === '') {
      alert('Please enter a job title for this experience entry or in your personal info.');
      return;
    }

    setLoadingExperienceId(id);

    try {
      const response = await fetch('/api/enhance-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: currentDescription,
          jobTitle: jobTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance experience description');
      }

      const data = await response.json();
      
      // Update the specific experience item's description
      setResumeData((prev) => ({
        ...prev,
        experience: prev.experience.map((exp) =>
          exp.id === id ? { ...exp, description: data.enhancedText } : exp
        ),
      }));
    } catch (error) {
      console.error('Error enhancing experience:', error);
      alert(error instanceof Error ? error.message : 'Failed to enhance experience description. Please try again.');
    } finally {
      setLoadingExperienceId(null);
    }
  };

  // Experience Handlers
  const handleAddExperience = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: newId,
          jobTitle: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: ""
        }
      ]
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id)
    }));
  };

  const handleUpdateExperience = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  // Education Handlers
  const handleAddEducation = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: newId,
          school: "",
          degree: "",
          location: "",
          startDate: "",
          endDate: ""
        }
      ]
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id)
    }));
  };

  const handleUpdateEducation = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Skills Handlers
  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !resumeData.skills.includes(trimmedSkill)) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill]
      }));
    }
  };

  const handleRemoveSkill = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Profile Picture Handlers
  const handleProfilePictureChange = (file: File) => {
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
      setResumeData((prev) => ({
        ...prev,
        profilePicture: base64String
      }));
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setResumeData((prev) => {
      const { profilePicture, ...rest } = prev;
      return rest;
    });
  };

  // Prepare data object for ResumeControlPanel
  const panelData: ResumeControlPanelData = {
    currentTemplateId: templateId,
    formatting,
    sections,
    atsScore,
  };

  // Calculate line-height from lineSpacing
  const lineHeight = formatting.lineSpacing;

  // Get template string from template ID
  const templateString = getTemplateString(templateId);

  return (
    <>
      <style>{`
        @media print {
          /* Ensure resume container takes full viewport and removes background */
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          /* Ensure the main container doesn't limit print area */
          html, body {
            height: auto;
            overflow: visible;
          }
        }
      `}</style>
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50">
        {/* Page Header with Download Button */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 print:hidden">
        <h1 className="text-xl font-semibold text-gray-900">Resume Editor</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">All changes saved</span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Control Panel */}
        <div className="w-96 shrink-0 border-r border-gray-200 bg-white print:hidden">
          <ResumeControlPanel
            data={panelData}
            resumeData={resumeData}
            onTemplateChange={handleTemplateChange}
            onFormattingChange={handleFormattingChange}
            onSectionToggle={handleSectionToggle}
            onAIAction={handleAIAction}
            onAIGenerate={handleAIGenerateSummary}
            isGeneratingAI={isGeneratingAI}
            onContentChange={handleContentChange}
            onAddExperience={handleAddExperience}
            onRemoveExperience={handleRemoveExperience}
            onUpdateExperience={handleUpdateExperience}
            onAddEducation={handleAddEducation}
            onRemoveEducation={handleRemoveEducation}
            onUpdateEducation={handleUpdateEducation}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            onProfilePictureChange={handleProfilePictureChange}
            onRemoveProfilePicture={handleRemoveProfilePicture}
            onAIEnhanceExperience={handleAIEnhanceExperience}
            loadingExperienceId={loadingExperienceId}
          />
        </div>

        {/* Right Side - Live Preview */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:bg-white print:overflow-visible">
          <div className="max-w-4xl mx-auto">
            {/* Preview Header */}
            <div className="mb-6 print:hidden">
              <h2 className="text-lg font-semibold text-gray-700">Live Preview</h2>
              <p className="text-sm text-gray-500">See your changes in real-time</p>
            </div>

            {/* Resume Preview Section */}
            <div
              ref={resumePreviewRef}
              className={`bg-white shadow-xl rounded-lg mx-auto print:shadow-none print:rounded-none print:m-0 print:max-w-full print:w-full ${
                templateString === 'modern' ? 'overflow-hidden' : 'p-8'
              }`}
              style={{
                fontFamily: formatting.font,
                lineHeight: lineHeight,
                minHeight: '800px',
                maxWidth: '8.5in',
              }}
            >
              <ResumePreviewSection
                resumeData={resumeData}
                templateId={templateString}
                sections={sections}
                formatting={formatting}
                lineHeight={lineHeight}
              />
            </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
}

