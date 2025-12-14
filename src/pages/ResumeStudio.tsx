import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResumeProvider, useResume } from '../context/ResumeContext';
import { FeatureIntegration, type LinkedInProfileData, type JobDataForResume } from '../lib/featureIntegration';
import type { SectionItem } from '../types/resume';
import { createDateRangeString } from '../lib/dateFormatHelpers';
import { useWorkflowContext } from '../hooks/useWorkflowContext';

// Workflow context types
interface WorkflowCertification {
  name: string;
  issuer: string;
  dateEarned: string;
  skills?: string[];
}

interface WorkflowSkill {
  name: string;
  [key: string]: unknown;
}

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
// Icons removed - not used
import FirstTimeEntryCard from '../components/workflows/FirstTimeEntryCard';
import WorkflowBreadcrumb from '../components/workflows/WorkflowBreadcrumb';
import WorkflowPrompt from '../components/workflows/WorkflowPrompt';
import WorkflowToast from '../components/workflows/WorkflowToast';
import { areWorkflowPromptsEnabled, areWorkflowToastsEnabled, getToastDuration, isWorkflowDismissed } from '../lib/workflowPreferences';
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
  
  // Workflow state - use custom hook for reactive context
  const { workflowContext, updateContext } = useWorkflowContext();
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);
  const workflowProcessedRef = useRef<Set<string>>(new Set());

  // Handle feature integration actions on mount
  useEffect(() => {
    const pendingAction = FeatureIntegration.getPendingAction();
    
    if (!pendingAction) {
      return;
    }

    console.log('Processing pending action:', pendingAction);

    try {
      switch (pendingAction.type) {
        case 'import-linkedin': {
          // Get LinkedIn profile data
          const profile = pendingAction.data as LinkedInProfileData || FeatureIntegration.getLinkedInProfile();
          
          if (profile) {
            // Update personal info
            dispatch({
              type: 'UPDATE_PERSONAL_INFO',
              payload: {
                fullName: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                location: profile.location || '',
                summary: profile.summary || '',
                linkedin: profile.name ? `https://linkedin.com/in/${profile.name.toLowerCase().replace(/\s+/g, '-')}` : '',
              },
            });

            // Add experience section
            if (profile.experience && profile.experience.length > 0) {
              const expSection = state.sections.find(s => s.type === 'experience');
              if (expSection) {
                // Update existing experience section
                const newExpItems = profile.experience.map(exp => ({
                  id: generateId(),
                  title: exp.title || '',
                  subtitle: exp.company || '',
                  date: createDateRangeString(exp.startDate, exp.endDate || 'Present'),
                  description: exp.description || '',
                }));
                
                dispatch({
                  type: 'UPDATE_SECTION',
                  payload: {
                    id: expSection.id,
                    updates: {
                      items: [...expSection.items, ...newExpItems],
                    },
                  },
                });
              } else {
                // Create new experience section
                dispatch({
                  type: 'ADD_SECTION',
                  payload: {
                    id: `section_exp_${Date.now()}`,
                    type: 'experience',
                    title: 'Experience',
                    isVisible: true,
                    items: profile.experience.map(exp => ({
                      id: generateId(),
                      title: exp.title || '',
                      subtitle: exp.company || '',
                      date: createDateRangeString(exp.startDate || '', exp.endDate || 'Present'),
                      description: exp.description || '',
                    })),
                  },
                });
              }
            }

            // Add education section
            if (profile.education && profile.education.length > 0) {
              const eduSection = state.sections.find(s => s.type === 'education');
              if (eduSection) {
                const newEduItems = profile.education.map(edu => ({
                  id: generateId(),
                  title: `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
                  subtitle: edu.school || '',
                  date: edu.endYear || edu.startYear || '',
                  description: '',
                }));
                
                dispatch({
                  type: 'UPDATE_SECTION',
                  payload: {
                    id: eduSection.id,
                    updates: {
                      items: [...eduSection.items, ...newEduItems],
                    },
                  },
                });
              } else {
                dispatch({
                  type: 'ADD_SECTION',
                  payload: {
                    id: `section_edu_${Date.now()}`,
                    type: 'education',
                    title: 'Education',
                    isVisible: true,
                    items: profile.education.map(edu => ({
                      id: generateId(),
                      title: `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
                      subtitle: edu.school || '',
                      date: edu.endYear || edu.startYear || '',
                      description: '',
                    })),
                  },
                });
              }
            }

            // Add skills section
            if (profile.skills && profile.skills.length > 0) {
              const skillsSection = state.sections.find(s => s.type === 'skills');
              if (skillsSection) {
                const existingSkills = skillsSection.items.map((item: SectionItem) => item.title || '').filter(Boolean);
                import('../lib/skillDeduplication').then(({ mergeAndDeduplicateSkills }) => {
                  const uniqueSkills = mergeAndDeduplicateSkills(existingSkills, profile.skills);
                  
                  dispatch({
                    type: 'UPDATE_SECTION',
                    payload: {
                      id: skillsSection.id,
                      updates: {
                        items: uniqueSkills.map((skill, idx) => ({
                          id: `skill_${idx}`,
                          title: skill,
                          subtitle: '',
                          date: '',
                          description: '',
                        })),
                      },
                    },
                  });
                });
              } else {
                dispatch({
                  type: 'ADD_SECTION',
                  payload: {
                    id: `section_skills_${Date.now()}`,
                    type: 'skills',
                    title: 'Skills',
                    isVisible: true,
                    items: profile.skills.map((skill, idx) => ({
                      id: `skill_${idx}`,
                      title: skill,
                      subtitle: '',
                      date: '',
                      description: '',
                    })),
                  },
                });
              }
            }

            // Add certifications if available
            if (profile.certifications && profile.certifications.length > 0) {
              const certSection = state.sections.find(s => s.type === 'certifications');
              if (certSection) {
                const newCertItems = profile.certifications.map(cert => ({
                  id: generateId(),
                  title: cert.name || '',
                  subtitle: cert.issuer || '',
                  date: cert.date || '',
                  description: '',
                }));
                
                dispatch({
                  type: 'UPDATE_SECTION',
                  payload: {
                    id: certSection.id,
                    updates: {
                      items: [...certSection.items, ...newCertItems],
                    },
                  },
                });
              } else {
                dispatch({
                  type: 'ADD_SECTION',
                  payload: {
                    id: `section_cert_${Date.now()}`,
                    type: 'certifications',
                    title: 'Certifications',
                    isVisible: true,
                    items: profile.certifications.map(cert => ({
                      id: generateId(),
                      title: cert.name || '',
                      subtitle: cert.issuer || '',
                      date: cert.date || '',
                      description: '',
                    })),
                  },
                });
              }
            }

            // Add languages if available
            if (profile.languages && profile.languages.length > 0) {
              const langSection = state.sections.find(s => s.type === 'languages');
              if (langSection) {
                const newLangItems = profile.languages.map(lang => ({
                  id: generateId(),
                  title: lang.language || '',
                  subtitle: lang.proficiency || '',
                  date: '',
                  description: '',
                }));
                
                dispatch({
                  type: 'UPDATE_SECTION',
                  payload: {
                    id: langSection.id,
                    updates: {
                      items: [...langSection.items, ...newLangItems],
                    },
                  },
                });
              } else {
                dispatch({
                  type: 'ADD_SECTION',
                  payload: {
                    id: `section_lang_${Date.now()}`,
                    type: 'languages',
                    title: 'Languages',
                    isVisible: true,
                    items: profile.languages.map(lang => ({
                      id: generateId(),
                      title: lang.language || '',
                      subtitle: lang.proficiency || '',
                      date: '',
                      description: '',
                    })),
                  },
                });
              }
            }
          }
          break;
        }

        case 'tailor-for-job': {
          // Get job data for tailoring
          const jobData = pendingAction.data as JobDataForResume || FeatureIntegration.getJobForTailoring();
          
          if (jobData) {
            // Update target job
            // Update target job - preserve targetJobId if it exists
            dispatch({
              type: 'UPDATE_TARGET_JOB',
              payload: {
                title: jobData.title || '',
                description: jobData.description || '',
                industry: jobData.company || '', // Use company as industry for now
              },
            });
            
            // If we have a job ID, also update targetJobId
            // Try to find matching job in tracked jobs
            if (jobData.id) {
              dispatch({
                type: 'SET_RESUME',
                payload: {
                  ...state,
                  targetJobId: String(jobData.id),
                },
              });
            }

            // Update resume title to reflect tailoring
            FeatureIntegration.createTailoredResumeTitle(jobData); // Generate tailored title
            dispatch({
              type: 'UPDATE_SETTINGS',
              payload: {},
            });
          }
          break;
        }

        case 'from-application-tailor': {
          // Handle data from Application Tailor
          // This would typically contain tailored resume content
          // For now, we'll just mark that we came from Application Tailor
          console.log('Resume Studio opened from Application Tailor');
          break;
        }

        case 'quick-create': {
          // Quick create action - initialize a new resume
          console.log('Quick create action triggered');
          // The resume is already initialized, so we can just ensure it's ready
          break;
        }

        default:
          console.warn('Unknown action type:', pendingAction.type);
      }

      // Navigate back if returnTo is specified
      if (pendingAction.returnTo) {
        setTimeout(() => {
          navigate(pendingAction.returnTo!);
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing pending action:', error);
    }
  }, []); // Only run on mount

  // Check for workflow context changes
  useEffect(() => {
    if (!workflowContext) return;

    const contextKey = `${workflowContext.workflowId}-${JSON.stringify(workflowContext)}`;
    
    // Prevent processing the same context multiple times
    if (workflowProcessedRef.current.has(contextKey)) {
      return;
    }
    
    workflowProcessedRef.current.add(contextKey);
    
    // Workflow 2: Skill Development
    if (workflowContext.workflowId === 'skill-development-advancement') {
      // Mark step as in-progress
      const workflow = WorkflowTracking.getWorkflow('skill-development-advancement');
      if (workflow) {
        const updateStep = workflow.steps.find(s => s.id === 'update-resume');
        if (updateStep && updateStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('skill-development-advancement', 'update-resume', 'in-progress');
        }
      }
      
      // Auto-update resume with certifications and skills if available
      if (workflowContext.certifications && workflowContext.certifications.length > 0) {
        // Find or create certifications section
        const certSection = state.sections.find(s => s.type === 'certifications');
        if (certSection) {
          // Update existing certifications section
          const newCertItems: SectionItem[] = (workflowContext.certifications as WorkflowCertification[]).map((cert) => ({
            id: generateId(),
            title: cert.name,
            subtitle: cert.issuer,
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
          const certItems: SectionItem[] = (workflowContext.certifications as WorkflowCertification[]).map((cert): SectionItem => ({
            id: generateId(),
            title: cert.name,
            subtitle: cert.issuer,
            date: cert.dateEarned,
            description: cert.skills?.join(', ') || '',
          }));
          dispatch({
            type: 'ADD_SECTION',
            payload: {
              id: `section_cert_${Date.now()}`,
              type: 'certifications',
              title: 'Certifications',
              isVisible: true,
              items: certItems
            }
          });
        }
      }
      
      // Auto-update skills if available
      if (workflowContext.identifiedSkills && workflowContext.identifiedSkills.length > 0) {
        const skillsSection = state.sections.find(s => s.type === 'skills');
        if (skillsSection) {
          const newSkills = (workflowContext.identifiedSkills as WorkflowSkill[]).map((skill) => skill.name).filter(Boolean);
          const existingSkills = skillsSection.items.map((item: SectionItem) => item.title || '').filter(Boolean);
          import('../lib/skillDeduplication').then(({ mergeAndDeduplicateSkills }) => {
            const uniqueSkills = mergeAndDeduplicateSkills(existingSkills, newSkills);
            
            dispatch({
              type: 'UPDATE_SECTION',
              payload: {
                id: skillsSection.id,
                updates: {
                  items: uniqueSkills.map((skill, idx) => ({
                    id: `skill_${idx}`,
                    title: skill,
                    subtitle: 'intermediate', // Default level
                    date: '',
                    description: '',
                  }))
                }
              }
            });
          });
        }
      }
      
      // Mark as completed when resume is updated
      WorkflowTracking.updateStepStatus('skill-development-advancement', 'update-resume', 'completed', {
        certificationsAdded: workflowContext.certifications?.length || 0,
        skillsAdded: workflowContext.identifiedSkills?.length || 0
      });
      
      // Only show prompt if enabled and not dismissed
      if (areWorkflowPromptsEnabled() && !isWorkflowDismissed('skill-development-advancement')) {
        setShowWorkflowPrompt(true);
      }
    }
    
    // Workflow 6: Document Consistency & Version Control
    if (workflowContext.workflowId === 'document-consistency-version-control') {
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
      const hasResumeData = state.sections.length > 0 || state.personalInfo.fullName;
      if (hasResumeData) {
        WorkflowTracking.updateStepStatus('document-consistency-version-control', 'update-resume-consistency', 'completed', {
          resumeUpdated: true,
          sectionsCount: state.sections.length
        });
        
        // Store resume data in workflow context
        updateContext({
          workflowId: 'document-consistency-version-control',
          resumeData: {
            personalInfo: state.personalInfo,
            sectionsCount: state.sections.length
          },
          action: 'sync-cover-letters'
        });
        
        // Only show prompt if enabled and not dismissed
        if (areWorkflowPromptsEnabled() && !isWorkflowDismissed('document-consistency-version-control')) {
          setShowWorkflowPrompt(true);
        }
      }
    }
  }, [workflowContext, state.sections, state.personalInfo, dispatch, updateContext]);

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

      {/* Workflow Toast/Prompt - Workflow 2 */}
      {showWorkflowPrompt && workflowContext?.workflowId === 'skill-development-advancement' && (
        <>
          {areWorkflowToastsEnabled() ? (
            <WorkflowToast
              isOpen={showWorkflowPrompt}
              onDismiss={() => setShowWorkflowPrompt(false)}
              onContinue={() => {
                updateContext({
                  workflowId: 'skill-development-advancement',
                  resumeUpdated: true,
                  action: 'showcase-portfolio'
                });
                navigate('/dashboard/portfolio');
                setShowWorkflowPrompt(false);
              }}
              title="Resume Updated!"
              message="Your resume has been updated with new skills and certifications. Showcase them in your portfolio!"
              actionText="Showcase Portfolio"
              variant="success"
              autoDismiss={getToastDuration()}
            />
          ) : (
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
                    updateContext({
                      workflowId: 'skill-development-advancement',
                      resumeUpdated: true,
                      action: 'showcase-portfolio'
                    });
                  }
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Workflow Toast/Prompt - Workflow 6 */}
      {showWorkflowPrompt && workflowContext?.workflowId === 'document-consistency-version-control' && (
        <>
          {areWorkflowToastsEnabled() ? (
            <WorkflowToast
              isOpen={showWorkflowPrompt}
              onDismiss={() => setShowWorkflowPrompt(false)}
              onContinue={() => {
                updateContext({
                  workflowId: 'document-consistency-version-control',
                  resumeUpdated: true,
                  action: 'sync-cover-letters'
                });
                navigate('/dashboard/smart-cover-letter');
                setShowWorkflowPrompt(false);
              }}
              title="Resume Updated!"
              message="Your resume is now consistent. Ready to sync your cover letters?"
              actionText="Sync Cover Letters"
              variant="success"
              autoDismiss={getToastDuration()}
            />
          ) : (
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
                    updateContext({
                      workflowId: 'document-consistency-version-control',
                      resumeUpdated: true,
                      action: 'sync-cover-letters'
                    });
                  }
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Header */}
      <header className="h-auto sm:h-16 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-0 shrink-0 no-print">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg
              className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600"
              viewBox="0 0 32 32"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 4H20V20H4V4Z" />
              <path d="M12 12H28V28H12V12Z" fillOpacity="0.7" />
            </svg>
            <span className="font-bold text-lg sm:text-xl text-slate-900">Career Clarified</span>
          </div>
        </div>
        <ResumeToolbar />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50">
        {/* Left Column - Editor */}
        <div className="w-full lg:w-96 bg-white overflow-y-auto border-r-0 lg:border-r border-slate-200 no-print">
          <ResumeEditor />
        </div>

        {/* Right Column - Preview */}
        <div className="flex-1 bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 overflow-y-auto p-4 sm:p-8">
          <ResumePreview />
        </div>

        {/* AI Sidebar - Conditional */}
        {state.isAISidebarOpen && (
          <div className="w-full lg:w-80 border-l-0 lg:border-l border-t lg:border-t-0 bg-[#eff2fd] shadow-xl transition-all duration-300 ease-in-out no-print">
            <AICopilot />
          </div>
        )}
      </main>
    </div>
  );
}
