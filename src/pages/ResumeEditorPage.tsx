import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Save, FileText, History, CheckCircle2, Upload, Share2, Edit, Eye } from 'lucide-react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useEditorTour } from '../components/onboarding/useEditorTour';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import ResumeControlPanel, {
  ResumeControlPanelData,
  Section,
  FormattingValues,
  ResumeData,
} from '../components/resume/ResumeControlPanel';
import { calculateATSScore, ATSAnalysis } from '../utils/atsScorer';
import { saveResume, getCurrentResumeId, loadResume, type SavedResume } from '../lib/resumeStorage';
import { type ResumeVersion } from '../lib/resumeVersionHistory';
import { convertEditorToContext, convertContextToEditor } from '../lib/resumeDataConverter';
import SaveResumeModal from '../components/resume/SaveResumeModal';
import ResumeLibrary from '../components/resume/ResumeLibrary';
import ExportModal from '../components/resume/ExportModal';
import VersionHistoryModal from '../components/resume/VersionHistoryModal';
import ImportResumeModal from '../components/resume/ImportResumeModal';
import CollaborationModal from '../components/resume/CollaborationModal';

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
              className="text-xl font-semibold mb-2 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
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
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
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
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
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
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
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
        {sections.find((s) => s.id === 'certifications')?.isVisible && resumeData.certifications && resumeData.certifications.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Certifications
            </h2>
            <div className="space-y-3">
              {resumeData.certifications.map((cert) => (
                <div key={cert.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{cert.name || "Certification Name"}</h3>
                    {cert.date && (
                      <span className="text-gray-600 text-sm">{cert.date}</span>
                    )}
                  </div>
                  {cert.issuer && (
                    <p className="text-gray-600 text-sm mb-1">{cert.issuer}</p>
                  )}
                  {cert.credentialId && (
                    <p className="text-gray-500 text-xs">Credential ID: {cert.credentialId}</p>
                  )}
                  {cert.expiryDate && (
                    <p className="text-gray-500 text-xs">Expires: {cert.expiryDate}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {sections.find((s) => s.id === 'projects')?.isVisible && resumeData.projects && resumeData.projects.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Projects
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {proj.url ? (
                        <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {proj.name || "Project Name"}
                        </a>
                      ) : (
                        proj.name || "Project Name"
                      )}
                    </h3>
                    {proj.startDate && proj.endDate && (
                      <span className="text-gray-600 text-sm">{proj.startDate} - {proj.endDate}</span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-gray-700 mb-2 whitespace-pre-wrap">{proj.description}</p>
                  )}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proj.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages Section */}
        {sections.find((s) => s.id === 'languages')?.isVisible && resumeData.languages && resumeData.languages.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Languages
            </h2>
            <div className="space-y-2">
              {resumeData.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">{lang.language}</span>
                  <span className="text-gray-600 text-sm capitalize">{lang.proficiency}</span>
                </div>
              ))}
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
            <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide text-white border-b border-white/20 pb-2 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
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
              className="text-xl font-semibold mb-3 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
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
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
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
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
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
        {sections.find((s) => s.id === 'certifications')?.isVisible && resumeData.certifications && resumeData.certifications.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Certifications
            </h2>
            <div className="space-y-3">
              {resumeData.certifications.map((cert) => (
                <div key={cert.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{cert.name || "Certification Name"}</h3>
                    {cert.date && (
                      <span className="text-gray-600 text-sm">{cert.date}</span>
                    )}
                  </div>
                  {cert.issuer && (
                    <p className="text-gray-600 text-sm mb-1">{cert.issuer}</p>
                  )}
                  {cert.credentialId && (
                    <p className="text-gray-500 text-xs">Credential ID: {cert.credentialId}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {sections.find((s) => s.id === 'projects')?.isVisible && resumeData.projects && resumeData.projects.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Projects
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {proj.url ? (
                        <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {proj.name || "Project Name"}
                        </a>
                      ) : (
                        proj.name || "Project Name"
                      )}
                    </h3>
                    {proj.startDate && proj.endDate && (
                      <span className="text-gray-600 text-sm">{proj.startDate} - {proj.endDate}</span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-gray-700 mb-2 whitespace-pre-wrap">{proj.description}</p>
                  )}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proj.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages Section */}
        {sections.find((s) => s.id === 'languages')?.isVisible && resumeData.languages && resumeData.languages.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-4 uppercase tracking-wide text-gray-800 break-inside-avoid"
              style={{ color: formatting.accentColor, pageBreakInside: 'avoid' }}
            >
              Languages
            </h2>
            <div className="space-y-2">
              {resumeData.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">{lang.language}</span>
                  <span className="text-gray-600 text-sm capitalize">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumeEditorPage() {
  // Mobile detection
  const isMobile = useIsMobile();
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('edit');
  
  // Onboarding tour
  useEditorTour();
  
  // Ref for PDF printing
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: resumePreviewRef,
    documentTitle: 'My_Resume',
  });

  // New feature handlers
  const handleSave = () => {
    setShowSaveModal(true);
  };

  const handleSaveConfirm = (title: string) => {
    try {
      const contextData = convertEditorToContext(resumeData, templateId, formatting, sections);
      contextData.atsScore = atsAnalysis.score; // Include ATS score
      const resumeId = saveResume({ ...contextData, title }, title);
      setCurrentResumeId(resumeId);
      
      // Save analytics snapshot
      const analytics = calculateResumeAnalytics(resumeData);
      saveAnalyticsSnapshot(resumeId, analytics);
      
      setShowSaveModal(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume. Please try again.');
    }
  };

  const handleLoadResume = (savedResume: SavedResume) => {
    const editorData = convertContextToEditor(savedResume.data);
    setResumeData(editorData);
    setCurrentResumeId(savedResume.id);
    
    // Update template and formatting
    const templateId = savedResume.data.settings.templateId === 'modern' ? 2 : 1;
    setTemplateId(templateId);
    setFormatting({
      font: savedResume.data.settings.fontFamily || 'Inter',
      lineSpacing: savedResume.data.settings.lineHeight || 1.5,
      accentColor: savedResume.data.settings.accentColor || '#3B82F6',
    });
    
    setShowLibrary(false);
  };

  const handleRestoreVersion = (version: ResumeVersion) => {
    // Create backup before restoring
    try {
      const { saveVersion } = require('../lib/resumeVersionHistory');
      const contextData = convertEditorToContext(resumeData, templateId, formatting, sections);
      saveVersion(version.resumeId, contextData, {
        createdBy: 'restore-backup',
        changeSummary: 'Backup before restoring version',
      });
    } catch (error) {
      console.error('Error creating backup:', error);
    }

    // Restore the version
    const editorData = convertContextToEditor(version.data);
    setResumeData(editorData);
    
    // Update template and formatting
    const restoredTemplateId = version.data.settings.templateId === 'modern' ? 2 : 1;
    setTemplateId(restoredTemplateId);
    setFormatting({
      font: version.data.settings.fontFamily || 'Inter',
      lineSpacing: version.data.settings.lineHeight || 1.5,
      accentColor: version.data.settings.accentColor || '#3B82F6',
    });
    
    // Save the restored version
    saveResume(version.data);
    setCurrentResumeId(version.resumeId);
    setShowVersionHistory(false);
  };

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
    { id: 'projects', label: 'Projects', isVisible: false },
    { id: 'languages', label: 'Languages', isVisible: false },
    { id: 'volunteer', label: 'Volunteer Work', isVisible: false },
  ]);
  const [resumeData, setResumeData] = useState(DEFAULT_RESUME_DATA);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [loadingExperienceId, setLoadingExperienceId] = useState<string | null>(null);
  
  // New features state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);

  // Calculate ATS score whenever resumeData or templateId changes
  const atsAnalysis: ATSAnalysis = useMemo(() => {
    const templateString = getTemplateString(templateId);
    return calculateATSScore(resumeData, templateString);
  }, [resumeData, templateId]);

  // Load current resume ID on mount
  useEffect(() => {
    setCurrentResumeId(getCurrentResumeId());
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      // First try to load from resume storage
      const currentId = getCurrentResumeId();
      if (currentId) {
        const loadedResume = loadResume(currentId);
        if (loadedResume) {
          // Convert context format to editor format
          const editorData = convertContextToEditor(loadedResume);
          setResumeData(editorData);
          // Update template and formatting from loaded resume
          const templateId = loadedResume.settings.templateId === 'modern' ? 2 : 1;
          setTemplateId(templateId);
          setFormatting({
            font: loadedResume.settings.fontFamily || 'Inter',
            lineSpacing: loadedResume.settings.lineHeight || 1.5,
            accentColor: loadedResume.settings.accentColor || '#3B82F6',
          });
          return;
        }
      }
      
      // Fallback to legacy localStorage
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
      
      // Also auto-save to new storage system if resume has been saved before
      if (currentResumeId) {
        const contextData = convertEditorToContext(resumeData, templateId, formatting, sections);
        contextData.atsScore = atsAnalysis.score; // Include ATS score
        saveResume({ ...contextData, id: currentResumeId });
        
        // Save analytics snapshot periodically (every 5 minutes of changes)
        const analytics = calculateResumeAnalytics(resumeData);
        saveAnalyticsSnapshot(currentResumeId, analytics);
      }
    } catch (error) {
      console.error('Failed to save resume data to localStorage:', error);
    }
  }, [resumeData, templateId, formatting, sections, currentResumeId]);

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
    // ATS score is now calculated automatically based on resume data
    if (action === 'ats') {
      // Could trigger additional optimization logic here if needed
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

  // Certifications Handlers
  const handleAddCertification = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        {
          id: newId,
          name: "",
          issuer: "",
          date: "",
          expiryDate: "",
          credentialId: "",
          credentialUrl: "",
        }
      ]
    }));
    // Make certifications section visible if not already
    setSections((prev) => {
      if (!prev.find(s => s.id === 'certifications')) {
        return [...prev, { id: 'certifications', label: 'Certifications', isVisible: true }];
      }
      return prev.map(s => s.id === 'certifications' ? { ...s, isVisible: true } : s);
    });
  };

  const handleRemoveCertification = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((cert) => cert.id !== id)
    }));
  };

  const handleUpdateCertification = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  // Projects Handlers
  const handleAddProject = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          id: newId,
          title: "",
          role: "",
          company: "",
          startDate: "",
          endDate: "",
          description: "",
          url: "",
        }
      ]
    }));
    // Make projects section visible if not already
    setSections((prev) => {
      if (!prev.find(s => s.id === 'projects')) {
        return [...prev, { id: 'projects', label: 'Projects', isVisible: true }];
      }
      return prev.map(s => s.id === 'projects' ? { ...s, isVisible: true } : s);
    });
  };

  const handleRemoveProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((proj) => proj.id !== id)
    }));
  };

  const handleUpdateProject = (id: string, field: string, value: string | string[]) => {
    setResumeData((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
  };

  // Languages Handlers
  const handleAddLanguage = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      languages: [
        ...(prev.languages || []),
        {
          id: newId,
          language: "",
          proficiency: 'professional' as const,
        }
      ]
    }));
    // Make languages section visible if not already
    setSections((prev) => {
      if (!prev.find(s => s.id === 'languages')) {
        return [...prev, { id: 'languages', label: 'Languages', isVisible: true }];
      }
      return prev.map(s => s.id === 'languages' ? { ...s, isVisible: true } : s);
    });
  };

  const handleRemoveLanguage = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter((lang) => lang.id !== id)
    }));
  };

  const handleUpdateLanguage = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: (prev.languages || []).map((lang) =>
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  // Volunteer Handlers
  const handleAddVolunteer = () => {
    const newId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      volunteer: [
        ...(prev.volunteer || []),
        {
          id: newId,
          organization: "",
          role: "",
          startDate: "",
          endDate: "",
          description: "",
        }
      ]
    }));
    // Make volunteer section visible if not already
    setSections((prev) => {
      if (!prev.find(s => s.id === 'volunteer')) {
        return [...prev, { id: 'volunteer', label: 'Volunteer Work', isVisible: true }];
      }
      return prev.map(s => s.id === 'volunteer' ? { ...s, isVisible: true } : s);
    });
  };

  const handleRemoveVolunteer = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      volunteer: (prev.volunteer || []).filter((vol) => vol.id !== id)
    }));
  };

  const handleUpdateVolunteer = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      volunteer: (prev.volunteer || []).map((vol) =>
        vol.id === id ? { ...vol, [field]: value } : vol
      )
    }));
  };

  // Custom Sections Handlers
  const handleAddCustomSection = (title: string) => {
    const newId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setResumeData((prev) => ({
      ...prev,
      customSections: [
        ...(prev.customSections || []),
        {
          id: newId,
          title: title,
          items: [],
        }
      ]
    }));
    // Also add to sections array for visibility toggle
    setSections((prev) => [
      ...prev,
      {
        id: newId,
        label: title,
        isVisible: true,
      }
    ]);
  };

  const handleRemoveCustomSection = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter((cs) => cs.id !== id)
    }));
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateCustomSection = (id: string, title: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((cs) =>
        cs.id === id ? { ...cs, title } : cs
      )
    }));
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label: title } : s))
    );
  };

  const handleAddCustomSectionItem = (sectionId: string) => {
    const newItemId = Date.now().toString();
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((cs) =>
        cs.id === sectionId
          ? {
              ...cs,
              items: [
                ...cs.items,
                {
                  id: newItemId,
                  title: "",
                  subtitle: "",
                  date: "",
                  description: "",
                }
              ]
            }
          : cs
      )
    }));
  };

  const handleRemoveCustomSectionItem = (sectionId: string, itemId: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((cs) =>
        cs.id === sectionId
          ? {
              ...cs,
              items: cs.items.filter((item) => item.id !== itemId)
            }
          : cs
      )
    }));
  };

  const handleUpdateCustomSectionItem = (sectionId: string, itemId: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((cs) =>
        cs.id === sectionId
          ? {
              ...cs,
              items: cs.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              )
            }
          : cs
      )
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

  // Drag and Drop Handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Determine which list we're sorting based on ID structure
    // IDs are formatted as "experience-{id}" or "education-{id}"
    const activeId = String(active.id);
    const overId = String(over.id);

    // Check if it's an experience item
    if (activeId.startsWith('experience-') && overId.startsWith('experience-')) {
      const activeIndex = resumeData.experience.findIndex(
        (exp) => `experience-${exp.id}` === activeId
      );
      const overIndex = resumeData.experience.findIndex(
        (exp) => `experience-${exp.id}` === overId
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        setResumeData((prev) => ({
          ...prev,
          experience: arrayMove(prev.experience, activeIndex, overIndex),
        }));
      }
    }
    // Check if it's an education item
    else if (activeId.startsWith('education-') && overId.startsWith('education-')) {
      const activeIndex = resumeData.education.findIndex(
        (edu) => `education-${edu.id}` === activeId
      );
      const overIndex = resumeData.education.findIndex(
        (edu) => `education-${edu.id}` === overId
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        setResumeData((prev) => ({
          ...prev,
          education: arrayMove(prev.education, activeIndex, overIndex),
        }));
      }
    }
  };

  // Prepare data object for ResumeControlPanel
  const panelData: ResumeControlPanelData = {
    currentTemplateId: templateId,
    formatting,
    sections,
    atsScore: atsAnalysis.score,
    atsAnalysis, // Pass the full analysis object
  };

  // Calculate line-height from lineSpacing
  const lineHeight = formatting.lineSpacing;

  // Get template string from template ID
  const templateString = getTemplateString(templateId);

  return (
    <>
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          
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
        {/* Page Header with Toolbar - Hidden on mobile */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 print:hidden hidden md:flex">
          <h1 className="text-xl font-semibold text-gray-900">Resume Editor</h1>
          <div className="flex items-center gap-2">
            {/* Import Button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>

            {/* My Resumes Button */}
            <button
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>My Resumes</span>
            </button>

            {/* Version History Button */}
            {currentResumeId && (
              <button
                onClick={() => setShowVersionHistory(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
                title="View version history"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                saveStatus === 'saved'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              {saveStatus === 'saved' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{currentResumeId ? 'Update' : 'Save'}</span>
                </>
              )}
            </button>

            {/* Share/Collaborate Button */}
            {currentResumeId && (
              <button
                onClick={() => setShowCollaborationModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            )}

            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Mobile Tab Bar - Only visible on mobile */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 flex shrink-0 print:hidden">
            <button
              onClick={() => setMobileViewMode('edit')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                mobileViewMode === 'edit'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setMobileViewMode('preview')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                mobileViewMode === 'preview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
        )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Control Panel - Hidden on mobile when in preview mode */}
        <div className={`${isMobile && mobileViewMode === 'preview' ? 'hidden' : ''} w-full md:w-96 shrink-0 border-r border-gray-200 bg-white print:hidden overflow-y-auto ${isMobile ? 'pb-20' : ''}`}>
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
            onDragEnd={handleDragEnd}
            onAddCertification={handleAddCertification}
            onRemoveCertification={handleRemoveCertification}
            onUpdateCertification={handleUpdateCertification}
            onAddProject={handleAddProject}
            onRemoveProject={handleRemoveProject}
            onUpdateProject={handleUpdateProject}
            onAddLanguage={handleAddLanguage}
            onRemoveLanguage={handleRemoveLanguage}
            onUpdateLanguage={handleUpdateLanguage}
            onAddVolunteer={handleAddVolunteer}
            onRemoveVolunteer={handleRemoveVolunteer}
            onUpdateVolunteer={handleUpdateVolunteer}
            onAddCustomSection={handleAddCustomSection}
            onRemoveCustomSection={handleRemoveCustomSection}
            onUpdateCustomSection={handleUpdateCustomSection}
            onAddCustomSectionItem={handleAddCustomSectionItem}
            onRemoveCustomSectionItem={handleRemoveCustomSectionItem}
            onUpdateCustomSectionItem={handleUpdateCustomSectionItem}
            resumeId={currentResumeId || undefined}
          />
        </div>

        {/* Right Side - Live Preview - Hidden on mobile when in edit mode */}
        <div className={`${isMobile && mobileViewMode === 'edit' ? 'hidden' : ''} flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:bg-white print:overflow-visible ${isMobile ? 'pb-20' : ''}`}>
          <div className="max-w-4xl mx-auto">
            {/* Resume Preview Section */}
            <div
              ref={resumePreviewRef}
              className={`relative bg-white shadow-xl rounded-lg mx-auto print:shadow-none print:rounded-none print:m-0 print:max-w-full print:w-full ${
                templateString === 'modern' ? 'overflow-hidden' : 'p-8'
              }`}
              style={{
                fontFamily: formatting.font,
                lineHeight: lineHeight,
                minHeight: '297mm',
                width: '210mm',
                maxWidth: '210mm',
              }}
            >
              {/* Visual Page Break Marker - Only visible in preview, hidden in print */}
              <div 
                className="absolute left-0 right-0 print:hidden pointer-events-none z-10"
                style={{
                  top: '297mm',
                  borderTop: '2px dashed rgba(239, 68, 68, 0.3)',
                }}
              >
                <span 
                  className="absolute left-2 text-xs text-red-500 opacity-70 bg-white px-2"
                  style={{ top: '-8px' }}
                >
                  End of Page 1
                </span>
              </div>
              
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

      {/* Mobile Floating Action Bar - Only visible on mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 print:hidden md:hidden">
          <div className="flex items-center justify-around px-4 py-3">
            <button
              onClick={handleSave}
              className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                saveStatus === 'saved'
                  ? 'text-green-700'
                  : 'text-slate-600'
              }`}
            >
              <Save className="w-5 h-5" />
              <span>{currentResumeId ? 'Update' : 'Save'}</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            {currentResumeId && (
              <button
                onClick={() => setShowLibrary(true)}
                className="flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium text-slate-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>My Resumes</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Save Modal */}
      <SaveResumeModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveConfirm}
        currentResume={convertEditorToContext(resumeData, templateId, formatting, sections)}
        isUpdating={!!currentResumeId}
      />

      {/* Resume Library */}
      <ResumeLibrary
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onLoad={handleLoadResume}
        currentResumeId={currentResumeId}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resume={convertEditorToContext(resumeData, templateId, formatting, sections)}
      />

      {/* Version History Modal */}
      {currentResumeId && (
        <VersionHistoryModal
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          resumeId={currentResumeId}
          currentResume={convertEditorToContext(resumeData, templateId, formatting, sections)}
          onRestore={handleRestoreVersion}
        />
      )}

      {/* Import Resume Modal */}
      <ImportResumeModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(importedData) => {
          // Merge imported data with current resume
          setResumeData(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              ...importedData.personalInfo,
              // Only update if imported data has values
              fullName: importedData.personalInfo.fullName || prev.personalInfo.fullName,
              email: importedData.personalInfo.email || prev.personalInfo.email,
              phone: importedData.personalInfo.phone || prev.personalInfo.phone,
              location: importedData.personalInfo.location || prev.personalInfo.location,
            },
            summary: importedData.summary || prev.summary,
            experience: importedData.experience.length > 0 ? importedData.experience : prev.experience,
            education: importedData.education.length > 0 ? importedData.education : prev.education,
            skills: importedData.skills.length > 0 ? [...new Set([...prev.skills, ...importedData.skills])] : prev.skills,
          }));
        }}
      />

      {/* Collaboration Modal */}
      {currentResumeId && (
        <CollaborationModal
          isOpen={showCollaborationModal}
          onClose={() => setShowCollaborationModal(false)}
          resumeId={currentResumeId}
          resumeTitle={resumeData.personalInfo.fullName || 'Untitled Resume'}
        />
      )}
    </div>
    </>
  );
}

