import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download } from 'lucide-react';
import ResumeControlPanel, {
  ResumeControlPanelData,
  Section,
  FormattingValues,
} from '../components/resume/ResumeControlPanel';

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

  // Handler Functions
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

  // Prepare data object for ResumeControlPanel
  const panelData: ResumeControlPanelData = {
    currentTemplateId: templateId,
    formatting,
    sections,
    atsScore,
  };

  // Calculate line-height from lineSpacing
  const lineHeight = formatting.lineSpacing;

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
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Control Panel */}
        <div className="w-96 shrink-0 border-r border-gray-200 bg-white print:hidden">
          <ResumeControlPanel
            data={panelData}
            onTemplateChange={handleTemplateChange}
            onFormattingChange={handleFormattingChange}
            onSectionToggle={handleSectionToggle}
            onAIAction={handleAIAction}
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

            {/* Dummy Resume Paper */}
            <div
              ref={resumePreviewRef}
              className="bg-white shadow-xl rounded-lg p-8 mx-auto print:shadow-none print:rounded-none print:p-8 print:m-0 print:max-w-full print:w-full"
              style={{
                fontFamily: formatting.font,
                lineHeight: lineHeight,
                minHeight: '800px',
                maxWidth: '8.5in',
              }}
            >
            {/* Header Section */}
            <div
              className="mb-6 pb-4 border-b-2"
              style={{ borderColor: formatting.accentColor }}
            >
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: formatting.accentColor }}
              >
                John Doe
              </h1>
              <div className="text-gray-600 space-y-1">
                <p>Software Engineer</p>
                <p>john.doe@email.com • (555) 123-4567</p>
                <p>linkedin.com/in/johndoe • johndoe.com</p>
              </div>
            </div>

            {/* Professional Summary */}
            {sections.find((s) => s.id === 'profile')?.isVisible && (
              <div className="mb-6">
                <h2
                  className="text-xl font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: formatting.accentColor }}
                >
                  Professional Summary
                </h2>
                <p className="text-gray-700">
                  Experienced software engineer with 5+ years of expertise in full-stack
                  development. Proven track record of building scalable web applications
                  using modern technologies. Passionate about clean code, user experience,
                  and continuous learning.
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
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">Senior Software Engineer</h3>
                      <span className="text-gray-600 text-sm">2021 - Present</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Tech Company Inc. • San Francisco, CA</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>
                        Led development of a microservices architecture serving 1M+ daily active users
                      </li>
                      <li>
                        Reduced page load time by 40% through optimization and caching strategies
                      </li>
                      <li>
                        Mentored junior developers and established coding best practices
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">Software Engineer</h3>
                      <span className="text-gray-600 text-sm">2019 - 2021</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Startup Co. • Remote</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>
                        Built responsive web applications using React and Node.js
                      </li>
                      <li>
                        Collaborated with design team to implement pixel-perfect UI components
                      </li>
                    </ul>
                  </div>
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
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">Bachelor of Science in Computer Science</h3>
                    <span className="text-gray-600 text-sm">2015 - 2019</span>
                  </div>
                  <p className="text-gray-600 text-sm">University of Technology • GPA: 3.8/4.0</p>
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
                  {['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL'].map((skill) => (
                    <span
                      key={skill}
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
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
}

