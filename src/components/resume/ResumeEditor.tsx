import React, { useEffect, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import ExperienceEditor from './ExperienceEditor';
import EducationEditor from './EducationEditor';
import SkillsEditor from './SkillsEditor';
import ProjectSectionEditor from './editors/ProjectSectionEditor';
import CertificationSectionEditor from './editors/CertificationSectionEditor';
import LanguageSectionEditor from './editors/LanguageSectionEditor';
import VolunteerSectionEditor from './editors/VolunteerSectionEditor';
import StandardListEditor from './StandardListEditor';
import AIAssistantButton from '../ui/AIAssistantButton';
import { AlertCircle, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import {
  useEmailValidation,
  usePhoneValidation,
  useLinkedInValidation,
  useWebsiteValidation,
} from '../../hooks/useInputValidation';
import { isFieldRequiredAndMissing } from '../../lib/requiredFieldsValidation';

// EditorSection component for highlighting and auto-scrolling focused sections
function EditorSection({ id, children }: { id: string; title?: string; children: React.ReactNode }) {
  const { state, dispatch } = useResume();
  const isActive = state.focusedSectionId === id;
  const sectionRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const isInteractingRef = useRef<boolean>(false);

  // Clear focus timeout
  const clearFocusTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Schedule auto-clear with interaction detection
  const scheduleAutoClear = React.useCallback(() => {
    clearFocusTimeout();
    
    const checkAndClear = () => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current;
      
      // Only clear if:
      // 1. Section is still active
      // 2. No interaction for at least 3 seconds
      // 3. User is not currently interacting
      if (isActive && timeSinceInteraction >= 3000 && !isInteractingRef.current) {
        dispatch({ type: 'SET_FOCUSED_SECTION', payload: null });
      } else if (isActive) {
        // Reschedule check if still active
        timeoutRef.current = setTimeout(checkAndClear, 1000);
      }
    };
    
    // Initial delay: 5 seconds after scroll completes, or 3 seconds if user interacted
    const timeSinceInteraction = Date.now() - lastInteractionRef.current;
    const initialDelay = timeSinceInteraction < 2000 ? 5000 : 4000; // Longer if recently interacted
    
    timeoutRef.current = setTimeout(checkAndClear, initialDelay);
  }, [isActive, dispatch]);

  // Track user interactions within the section
  useEffect(() => {
    if (!isActive || !sectionRef.current) {
      isInteractingRef.current = false;
      return;
    }

    const section = sectionRef.current;
    
    const handleInteractionStart = () => {
      lastInteractionRef.current = Date.now();
      isInteractingRef.current = true;
      // Reset the timeout when user interacts
      scheduleAutoClear();
    };

    const handleInteractionEnd = () => {
      // Small delay before marking as not interacting (handles rapid interactions)
      setTimeout(() => {
        isInteractingRef.current = false;
        lastInteractionRef.current = Date.now();
        scheduleAutoClear();
      }, 500);
    };

    // Listen for various interaction events
    const startEvents = ['click', 'input', 'keydown', 'focus', 'mousedown', 'touchstart'];
    const endEvents = ['blur', 'mouseup', 'touchend', 'keyup'];
    
    startEvents.forEach(event => {
      section.addEventListener(event, handleInteractionStart, true);
    });
    
    endEvents.forEach(event => {
      section.addEventListener(event, handleInteractionEnd, true);
    });

    return () => {
      startEvents.forEach(event => {
        section.removeEventListener(event, handleInteractionStart, true);
      });
      endEvents.forEach(event => {
        section.removeEventListener(event, handleInteractionEnd, true);
      });
    };
  }, [isActive, scheduleAutoClear]);

  useEffect(() => {
    if (isActive && sectionRef.current) {
      // Scroll to section
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Reset interaction tracking
      lastInteractionRef.current = Date.now();
      isInteractingRef.current = false;
      
      // Schedule auto-clear after scroll animation completes
      // Smooth scroll typically takes ~300-500ms, so wait 600ms to be safe
      const scrollDelay = setTimeout(() => {
        scheduleAutoClear();
      }, 600);

      return () => {
        clearTimeout(scrollDelay);
        clearFocusTimeout();
      };
    } else {
      // Clear timeout if section becomes inactive
      clearFocusTimeout();
      isInteractingRef.current = false;
    }
  }, [isActive, scheduleAutoClear]);

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
  
  // Check if resume has content
  const hasContent = state.sections.some(section => 
    section.items && section.items.length > 0
  );

  // Drag and drop state
  const [draggedSectionId, setDraggedSectionId] = React.useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = React.useState<string | null>(null);
  const [dropPosition, setDropPosition] = React.useState<'above' | 'below' | null>(null);

  // Validation hooks for each field
  const emailValidation = useEmailValidation(personalInfo.email || '');
  const phoneValidation = usePhoneValidation(personalInfo.phone || '');
  const linkedInValidation = useLinkedInValidation(personalInfo.linkedin || '');
  const websiteValidation = useWebsiteValidation(personalInfo.website || '');

  // Sync validation hooks with state changes
  useEffect(() => {
    if (personalInfo.email !== emailValidation.value) {
      emailValidation.setValue(personalInfo.email || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalInfo.email]);

  useEffect(() => {
    if (personalInfo.phone !== phoneValidation.value) {
      phoneValidation.setValue(personalInfo.phone || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalInfo.phone]);

  useEffect(() => {
    if (personalInfo.linkedin !== linkedInValidation.value) {
      linkedInValidation.setValue(personalInfo.linkedin || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalInfo.linkedin]);

  useEffect(() => {
    if (personalInfo.website !== websiteValidation.value) {
      websiteValidation.setValue(personalInfo.website || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalInfo.website]);

  const handleInputChange = (field: keyof typeof personalInfo, value: string) => {
    dispatch({
      type: 'UPDATE_PERSONAL_INFO',
      payload: { [field]: value },
    });
  };

  const handleEmailChange = (value: string) => {
    emailValidation.handleChange(value);
    handleInputChange('email', value);
  };

  const handlePhoneChange = (value: string) => {
    phoneValidation.handleChange(value);
    handleInputChange('phone', value);
  };

  const handleLinkedInChange = (value: string) => {
    linkedInValidation.handleChange(value);
    handleInputChange('linkedin', value);
  };

  const handleWebsiteChange = (value: string) => {
    websiteValidation.handleChange(value);
    handleInputChange('website', value);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Personal Details Section */}
      <EditorSection id="personal" title="Personal Details">
        <div id="section-personal">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Personal Details</h2>
          
          <div className="space-y-4">
          {/* Full Name */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              value={personalInfo.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full bg-transparent rounded-md focus:outline-none focus:ring-2 px-2 py-1.5 ${
                isFieldRequiredAndMissing(state, 'fullName')
                  ? 'border border-red-500 focus:ring-red-500/50'
                  : 'focus:ring-indigo-500/50'
              }`}
              placeholder="John Doe"
            />
            {isFieldRequiredAndMissing(state, 'fullName') && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Full name is required</span>
              </div>
            )}
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
              value={emailValidation.value}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={emailValidation.handleBlur}
              className={`w-full bg-transparent rounded-md focus:outline-none focus:ring-2 px-2 py-1.5 ${
                emailValidation.showError
                  ? 'border border-red-500 focus:ring-red-500/50'
                  : 'focus:ring-indigo-500/50'
              }`}
              placeholder="john.doe@example.com"
            />
            {emailValidation.showError && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{emailValidation.error}</span>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneValidation.value}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={phoneValidation.handleBlur}
              className={`w-full bg-transparent rounded-md focus:outline-none focus:ring-2 px-2 py-1.5 ${
                phoneValidation.showError
                  ? 'border border-red-500 focus:ring-red-500/50'
                  : 'focus:ring-indigo-500/50'
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {phoneValidation.showError && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{phoneValidation.error}</span>
              </div>
            )}
          </div>

          {/* LinkedIn */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              value={linkedInValidation.value}
              onChange={(e) => handleLinkedInChange(e.target.value)}
              onBlur={linkedInValidation.handleBlur}
              className={`w-full bg-transparent rounded-md focus:outline-none focus:ring-2 px-2 py-1.5 ${
                linkedInValidation.showError
                  ? 'border border-red-500 focus:ring-red-500/50'
                  : 'focus:ring-indigo-500/50'
              }`}
              placeholder="https://linkedin.com/in/johndoe"
            />
            {linkedInValidation.showError && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{linkedInValidation.error}</span>
              </div>
            )}
          </div>

          {/* Website */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={websiteValidation.value}
              onChange={(e) => handleWebsiteChange(e.target.value)}
              onBlur={websiteValidation.handleBlur}
              className={`w-full bg-transparent rounded-md focus:outline-none focus:ring-2 px-2 py-1.5 ${
                websiteValidation.showError
                  ? 'border border-red-500 focus:ring-red-500/50'
                  : 'focus:ring-indigo-500/50'
              }`}
              placeholder="https://johndoe.com"
            />
            {websiteValidation.showError && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{websiteValidation.error}</span>
              </div>
            )}
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

      {/* Reorderable Sections */}
      {state.sections
        .filter((section) => section.isVisible)
        .map((section) => {
          const sectionIndex = state.sections.findIndex((s) => s.id === section.id);
          const canMoveUp = sectionIndex > 0;
          const canMoveDown = sectionIndex < state.sections.length - 1;

          const handleMoveUp = () => {
            if (canMoveUp) {
              dispatch({
                type: 'REORDER_SECTIONS',
                payload: { fromIndex: sectionIndex, toIndex: sectionIndex - 1 },
              });
            }
          };

          const handleMoveDown = () => {
            if (canMoveDown) {
              dispatch({
                type: 'REORDER_SECTIONS',
                payload: { fromIndex: sectionIndex, toIndex: sectionIndex + 1 },
              });
            }
          };

          const handleDragStart = (e: React.DragEvent) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', section.id);
            setDraggedSectionId(section.id);
            // Create a custom drag image
            const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
            dragImage.style.opacity = '0.8';
            dragImage.style.transform = 'rotate(2deg)';
            document.body.appendChild(dragImage);
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            e.dataTransfer.setDragImage(dragImage, e.clientX - e.currentTarget.getBoundingClientRect().left, e.clientY - e.currentTarget.getBoundingClientRect().top);
            setTimeout(() => document.body.removeChild(dragImage), 0);
          };

          const handleDragEnd = () => {
            setDraggedSectionId(null);
            setDragOverSectionId(null);
            setDropPosition(null);
          };

          const handleDragEnter = (e: React.DragEvent) => {
            e.preventDefault();
            if (draggedSectionId && draggedSectionId !== section.id) {
              setDragOverSectionId(section.id);
            }
          };

          const handleDragLeave = (e: React.DragEvent) => {
            // Only clear if we're leaving the section entirely
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
              if (dragOverSectionId === section.id) {
                setDragOverSectionId(null);
                setDropPosition(null);
              }
            }
          };

          const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedSectionId && draggedSectionId !== section.id) {
              setDragOverSectionId(section.id);
              
              // Determine drop position based on mouse position
              const rect = e.currentTarget.getBoundingClientRect();
              const y = e.clientY;
              const midpoint = rect.top + rect.height / 2;
              setDropPosition(y < midpoint ? 'above' : 'below');
            }
          };

          const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            const draggedId = e.dataTransfer.getData('text/plain');
            const draggedIndex = state.sections.findIndex((s) => s.id === draggedId);
            let targetIndex = sectionIndex;

            // Adjust target index based on drop position
            if (dropPosition === 'below' && draggedIndex < targetIndex) {
              targetIndex += 1;
            } else if (dropPosition === 'above' && draggedIndex > targetIndex) {
              targetIndex -= 1;
            }

            if (draggedIndex !== targetIndex && draggedIndex !== -1 && targetIndex >= 0 && targetIndex < state.sections.length) {
              dispatch({
                type: 'REORDER_SECTIONS',
                payload: { fromIndex: draggedIndex, toIndex: targetIndex },
              });
            }

            setDraggedSectionId(null);
            setDragOverSectionId(null);
            setDropPosition(null);
          };

          const isDragging = draggedSectionId === section.id;
          const isDragOver = dragOverSectionId === section.id;
          const showDropIndicator = isDragOver && draggedSectionId !== section.id;

          return (
            <React.Fragment key={section.id}>
              {/* Drop indicator above */}
              {showDropIndicator && dropPosition === 'above' && (
                <div className="h-1 bg-indigo-500 rounded-full mx-4 mb-2 animate-pulse" />
              )}
              
              <EditorSection id={section.id}>
                <div 
                  id={`section-${section.id}`} 
                  className={`relative rounded-lg p-2 transition-all duration-200 ${
                    isDragging 
                      ? 'opacity-50 scale-95 shadow-lg' 
                      : isDragOver 
                        ? 'border-2 border-indigo-400 bg-indigo-50/50 shadow-md' 
                        : 'border border-transparent hover:border-slate-200'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                {/* Section Header with Reorder Controls */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleMoveUp}
                      disabled={!canMoveUp}
                      className="p-1.5 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up (or drag to reorder)"
                    >
                      <ChevronUp className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={handleMoveDown}
                      disabled={!canMoveDown}
                      className="p-1.5 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down (or drag to reorder)"
                    >
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    <div
                      draggable
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      className={`p-1.5 text-slate-400 cursor-grab active:cursor-grabbing transition-colors ${
                        isDragging ? 'text-indigo-600' : 'hover:text-slate-600'
                      }`}
                      title="Drag to reorder sections"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                {section.type === 'experience' && (
                  <div>
                    {!hasContent && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-yellow-800">
                          <AlertCircle className="w-4 h-4" />
                          <span>Add at least one experience, education, or skill to complete your resume.</span>
                        </div>
                      </div>
                    )}
                    <ExperienceEditor />
                  </div>
                )}
                {section.type === 'education' && <EducationEditor />}
                {section.type === 'skills' && <SkillsEditor />}
                {section.type === 'projects' && <ProjectSectionEditor />}
                {section.type === 'certifications' && <CertificationSectionEditor />}
                {section.type === 'languages' && <LanguageSectionEditor />}
                {section.type === 'volunteer' && <VolunteerSectionEditor />}
                {section.type === 'custom' && (
                  <StandardListEditor
                    sectionId={section.id}
                    sectionTitle={section.title || 'Custom Item'}
                    titleLabel="Title"
                    subtitleLabel="Subtitle"
                    dateLabel="Date"
                    descriptionLabel="Description"
                    titlePlaceholder="Enter title"
                    subtitlePlaceholder="Enter subtitle"
                    datePlaceholder="e.g., 2020 - 2022"
                    descriptionPlaceholder="Enter description..."
                  />
                )}
                </div>
              </EditorSection>
              
              {/* Drop indicator below */}
              {showDropIndicator && dropPosition === 'below' && (
                <div className="h-1 bg-indigo-500 rounded-full mx-4 mt-2 animate-pulse" />
              )}
            </React.Fragment>
          );
        })}
    </div>
  );
}
