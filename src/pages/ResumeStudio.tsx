import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResumeProvider, useResume } from '../context/ResumeContext';

/**
 * Generate a unique ID using crypto.randomUUID()
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
import ResumeEditor from '../components/resume/ResumeEditor';
import ResumePreview from '../components/resume/ResumePreview';
import ResumeToolbar from '../components/resume/ResumeToolbar';
import AICopilot from '../components/resume/AICopilot';
import { WorkflowTracking } from '../lib/workflowTracking';
import { Target, ArrowRight, Check, X } from 'lucide-react';
import FirstTimeEntryCard from '../components/workflows/FirstTimeEntryCard';
import WorkflowBreadcrumb from '../components/workflows/WorkflowBreadcrumb';
import WorkflowPrompt from '../components/workflows/WorkflowPrompt';
import WorkflowTransition from '../components/workflows/WorkflowTransition';
import WorkflowQuickActions from '../components/workflows/WorkflowQuickActions';
import WorkflowStatusIndicator from '../components/workflows/WorkflowStatusIndicator';

export default function ResumeStudio() {
        return (
    <ResumeProvider>
      <ResumeStudioContent />
    </ResumeProvider>
  );
}

function ResumeStudioContent() {
  const navigate = useNavigate();
  const { state, dispatch } = useResume();
  
  // Workflow state
  const [workflowContext, setWorkflowContext] = useState<any>(null);
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);

  // Check for workflow context on mount
  useEffect(() => {
    const context = WorkflowTracking.getWorkflowContext();
    
    // Workflow 2: Skill Development
    if (context?.workflowId === 'skill-development-advancement') {
      setWorkflowContext(context);
      
      // Mark step as in-progress
      const workflow = WorkflowTracking.getWorkflow('skill-development-advancement');
      if (workflow) {
        const updateStep = workflow.steps.find(s => s.id === 'update-resume');
        if (updateStep && updateStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('skill-development-advancement', 'update-resume', 'in-progress');
        }
      }
      
      // Auto-update resume with certifications and skills if available
      if (context.certifications && context.certifications.length > 0) {
        // Find or create certifications section
        const certSection = state.sections.find(s => s.type === 'certifications');
        if (certSection) {
          // Update existing certifications section
          const newCertItems = context.certifications.map((cert: any) => ({
            id: generateId(),
            title: cert.name,
            organization: cert.issuer,
            date: cert.dateEarned,
            description: cert.skills?.join(', ') || '',
          }));
          
          dispatch({
            type: 'UPDATE_SECTION',
            payload: {
              id: certSection.id,
              updates: {
                items: [...certSection.items, ...newCertItems]
              }
            }
          });
        } else {
          // Create new certifications section
          dispatch({
            type: 'ADD_SECTION',
            payload: {
              id: `section_cert_${Date.now()}`,
              type: 'certifications',
              title: 'Certifications',
              items: context.certifications.map((cert: any) => ({
                id: generateId(),
                title: cert.name,
                organization: cert.issuer,
                date: cert.dateEarned,
                description: cert.skills?.join(', ') || '',
              }))
            }
          });
        }
      }
      
      // Auto-update skills if available
      if (context.identifiedSkills && context.identifiedSkills.length > 0) {
        const skillsSection = state.sections.find(s => s.type === 'skills');
        if (skillsSection) {
          const newSkills = context.identifiedSkills.map((skill: any) => skill.name);
          const existingSkills = skillsSection.items.map((item: any) => item.title || item.name || '');
          const uniqueSkills = [...new Set([...existingSkills, ...newSkills])];
          
          dispatch({
            type: 'UPDATE_SECTION',
            payload: {
              id: skillsSection.id,
              updates: {
                items: uniqueSkills.map((skill, idx) => ({
                  id: `skill_${idx}`,
                  title: skill,
                  level: 'intermediate', // Default level
                }))
              }
            }
          });
        }
      }
      
      // Mark as completed when resume is updated
      WorkflowTracking.updateStepStatus('skill-development-advancement', 'update-resume', 'completed', {
        certificationsAdded: context.certifications?.length || 0,
        skillsAdded: context.identifiedSkills?.length || 0
      });
      setShowWorkflowPrompt(true);
    }
    
    // Workflow 6: Document Consistency & Version Control
    if (context?.workflowId === 'document-consistency-version-control') {
      setWorkflowContext(context);
      
      // Mark step as in-progress
      const workflow = WorkflowTracking.getWorkflow('document-consistency-version-control');
      if (workflow) {
        const updateStep = workflow.steps.find(s => s.id === 'update-resume-consistency');
        if (updateStep && updateStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('document-consistency-version-control', 'update-resume-consistency', 'in-progress');
        }
      }
      
      // Mark as completed when resume is saved/updated
      // This will be triggered when user saves the resume
      const hasResumeData = state.sections.length > 0 || state.personalInfo.name;
      if (hasResumeData) {
        WorkflowTracking.updateStepStatus('document-consistency-version-control', 'update-resume-consistency', 'completed', {
          resumeUpdated: true,
          sectionsCount: state.sections.length
        });
        
        // Store resume data in workflow context
        WorkflowTracking.setWorkflowContext({
          workflowId: 'document-consistency-version-control',
          resumeData: {
            personalInfo: state.personalInfo,
            sectionsCount: state.sections.length
          },
          action: 'sync-cover-letters'
        });
        
        setShowWorkflowPrompt(true);
      }
    }
  }, [state.sections, state.personalInfo, dispatch]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50">
      {/* First-Time Entry Card */}
      <div className="px-6 pt-6 shrink-0">
        <FirstTimeEntryCard
          featurePath="/dashboard/resume-studio"
          featureName="Resume Studio"
        />
      </div>

      {/* Workflow Status Indicator - Shows which workflow this resume is part of */}
      <div className="px-6 pt-3 shrink-0 no-print">
        <WorkflowStatusIndicator
          featurePath="/dashboard/resume-studio"
          featureName="Resume"
          compact={true}
        />
      </div>

      {/* Workflow Breadcrumb - Workflow 2 */}
      {workflowContext?.workflowId === 'skill-development-advancement' && (
        <div className="px-6 pt-3 shrink-0 no-print">
          <WorkflowBreadcrumb
            workflowId="skill-development-advancement"
            currentFeaturePath="/dashboard/resume-studio"
            compact={true}
          />
        </div>
      )}

      {/* Workflow Breadcrumb - Workflow 6 */}
      {workflowContext?.workflowId === 'document-consistency-version-control' && (
        <div className="px-6 pt-3 shrink-0 no-print">
          <WorkflowBreadcrumb
            workflowId="document-consistency-version-control"
            currentFeaturePath="/dashboard/resume-studio"
            compact={true}
          />
        </div>
      )}

      {/* Workflow Quick Actions - Workflow 2 */}
      {workflowContext?.workflowId === 'skill-development-advancement' && (
        <div className="px-6 pt-3 shrink-0 no-print">
          <WorkflowQuickActions
            workflowId="skill-development-advancement"
            currentFeaturePath="/dashboard/resume-studio"
            compact={true}
          />
        </div>
      )}

      {/* Workflow Quick Actions - Workflow 6 */}
      {workflowContext?.workflowId === 'document-consistency-version-control' && (
        <div className="px-6 pt-3 shrink-0 no-print">
          <WorkflowQuickActions
            workflowId="document-consistency-version-control"
            currentFeaturePath="/dashboard/resume-studio"
            compact={true}
          />
        </div>
      )}

      {/* Workflow Transition - Workflow 2 (after resume updated) */}
      {workflowContext?.workflowId === 'skill-development-advancement' && state.sections.length > 0 && (
        <div className="px-6 pt-3 shrink-0 no-print">
          <WorkflowTransition
            workflowId="skill-development-advancement"
            currentFeaturePath="/dashboard/resume-studio"
            compact={true}
          />
        </div>
      )}

      {/* Workflow Transition - Workflow 6 (after resume updated) */}
      {workflowContext?.workflowId === 'document-consistency-version-control' && state.sections.length > 0 && (
        <div className="px-6 pt-3 shrink-0 no-print">
          <WorkflowTransition
            workflowId="document-consistency-version-control"
            currentFeaturePath="/dashboard/resume-studio"
            compact={true}
          />
        </div>
      )}

      {/* Workflow Prompt - Workflow 2 */}
      {showWorkflowPrompt && workflowContext?.workflowId === 'skill-development-advancement' && (
        <div className="px-6 pt-3 shrink-0 no-print">
          <WorkflowPrompt
            workflowId="skill-development-advancement"
            currentFeaturePath="/dashboard/resume-studio"
            message="✅ Resume Updated! Your resume has been updated with new skills and certifications. Showcase them in your portfolio!"
            actionText="Showcase Portfolio"
            actionUrl="/dashboard/portfolio"
            onDismiss={() => setShowWorkflowPrompt(false)}
            onAction={(action) => {
              if (action === 'continue') {
                WorkflowTracking.setWorkflowContext({
                  workflowId: 'skill-development-advancement',
                  resumeUpdated: true,
                  action: 'showcase-portfolio'
                });
              }
            }}
          />
        </div>
      )}

      {/* Workflow Prompt - Workflow 6 */}
      {showWorkflowPrompt && workflowContext?.workflowId === 'document-consistency-version-control' && (
        <div className="px-6 pt-3 shrink-0 no-print">
          <WorkflowPrompt
            workflowId="document-consistency-version-control"
            currentFeaturePath="/dashboard/resume-studio"
            message="✅ Resume Updated for Consistency! Your resume is now consistent. Ready to sync your cover letters?"
            actionText="Sync Cover Letters"
            actionUrl="/dashboard/smart-cover-letter"
            onDismiss={() => setShowWorkflowPrompt(false)}
            onAction={(action) => {
              if (action === 'continue') {
                WorkflowTracking.setWorkflowContext({
                  workflowId: 'document-consistency-version-control',
                  resumeUpdated: true,
                  action: 'sync-cover-letters'
                });
              }
            }}
          />
        </div>
      )}

      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 no-print">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg
              className="h-8 w-8 text-indigo-600"
              viewBox="0 0 32 32"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 4H20V20H4V4Z" />
              <path d="M12 12H28V28H12V12Z" fillOpacity="0.7" />
            </svg>
            <span className="font-bold text-xl text-slate-900">Career Clarified</span>
          </div>
        </div>
        <ResumeToolbar />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50">
        {/* Left Column - Editor */}
        <div className="w-96 bg-white overflow-y-auto border-r border-slate-200 no-print">
          <ResumeEditor />
        </div>

        {/* Right Column - Preview */}
        <div className="flex-1 bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 overflow-y-auto p-8">
          <ResumePreview />
        </div>

        {/* AI Sidebar - Conditional */}
        {state.isAISidebarOpen && (
          <div className="w-80 border-l bg-[#eff2fd] shadow-xl transition-all duration-300 ease-in-out no-print">
            <AICopilot />
          </div>
        )}
      </main>
    </div>
  );
}
