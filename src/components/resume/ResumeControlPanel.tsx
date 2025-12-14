import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Layers, LayoutTemplate, Palette, Bot, GripVertical, ChevronRight, ChevronDown, Sparkles, Plus, Eye, EyeOff, Trash2, X, Wand2, Loader2, CheckCircle2, Copy, BarChart3, FileCheck } from 'lucide-react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import ConfirmDialog from '../ui/ConfirmDialog';
import RealTimeAISuggestions from './RealTimeAISuggestions';
import SmartKeywordSuggestions from './SmartKeywordSuggestions';
import ResumeAnalytics from './ResumeAnalytics';
import ProfileStrength from './ProfileStrength';
import ReviewPanel from './ReviewPanel';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type TabId = 'sections' | 'templates' | 'formatting' | 'copilot' | 'analytics' | 'review';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

// Type Definitions
export interface Section {
  id: string;
  label: string;
  isVisible: boolean;
}

export interface FormattingValues {
  font: string;
  lineSpacing: number;
  accentColor: string;
}

import { ATSAnalysis } from '../../utils/atsScorer';

export interface ResumeControlPanelData {
  currentTemplateId: number | string | null;
  formatting: FormattingValues;
  sections: Section[];
  atsScore: number;
  atsAnalysis?: ATSAnalysis;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  company?: string;
  startDate: string;
  endDate: string;
  description: string;
  url?: string;
  // Legacy support
  name?: string;
  technologies?: string[];
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic';
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  items: {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    description: string;
  }[];
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  certifications?: CertificationItem[];
  projects?: ProjectItem[];
  languages?: LanguageItem[];
  volunteer?: VolunteerItem[];
  customSections?: CustomSectionItem[];
  profilePicture?: string;
}

export interface ResumeControlPanelProps {
  data: ResumeControlPanelData;
  resumeData: ResumeData;
  onTemplateChange: (id: number | string) => void;
  onFormattingChange: (key: string, value: string | number) => void;
  onSectionToggle: (id: string) => void;
  onAIAction: (action: string) => void;
  onAIGenerate?: () => void;
  isGeneratingAI?: boolean;
  onContentChange: (path: string, value: string) => void;
  onAddExperience: () => void;
  onRemoveExperience: (id: string) => void;
  onUpdateExperience: (id: string, field: string, value: string) => void;
  onAddEducation: () => void;
  onRemoveEducation: (id: string) => void;
  onUpdateEducation: (id: string, field: string, value: string) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (index: number) => void;
  onProfilePictureChange?: (file: File) => void;
  onRemoveProfilePicture?: () => void;
  onAIEnhanceExperience?: (id: string, currentDescription: string) => void;
  loadingExperienceId?: string | null;
  onDragEnd?: (event: DragEndEvent) => void;
  // Advanced sections handlers
  onAddCertification?: () => void;
  onRemoveCertification?: (id: string) => void;
  onUpdateCertification?: (id: string, field: string, value: string) => void;
  onAddProject?: () => void;
  onRemoveProject?: (id: string) => void;
  onUpdateProject?: (id: string, field: string, value: string | string[]) => void;
  onAddLanguage?: () => void;
  onRemoveLanguage?: (id: string) => void;
  onUpdateLanguage?: (id: string, field: string, value: string) => void;
  onAddVolunteer?: () => void;
  onRemoveVolunteer?: (id: string) => void;
  onUpdateVolunteer?: (id: string, field: string, value: string) => void;
  onAddCustomSection?: (title: string) => void;
  onRemoveCustomSection?: (id: string) => void;
  onUpdateCustomSection?: (id: string, title: string) => void;
  onAddCustomSectionItem?: (sectionId: string) => void;
  onRemoveCustomSectionItem?: (sectionId: string, itemId: string) => void;
  onUpdateCustomSectionItem?: (sectionId: string, itemId: string, field: string, value: string) => void;
  targetJobDescription?: string;
  resumeId?: string;
}

// Sections Tab Component
interface SectionsTabProps {
  sections: Section[];
  resumeData: ResumeData;
  onToggle: (id: string) => void;
  onContentChange: (path: string, value: string) => void;
  onAddExperience: () => void;
  onRemoveExperience: (id: string) => void;
  onUpdateExperience: (id: string, field: string, value: string) => void;
  onAddEducation: () => void;
  onRemoveEducation: (id: string) => void;
  onUpdateEducation: (id: string, field: string, value: string) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (index: number) => void;
  onProfilePictureChange?: (file: File) => void;
  onRemoveProfilePicture?: () => void;
  onAIEnhanceExperience?: (id: string, currentDescription: string) => void;
  loadingExperienceId?: string | null;
  onDragEnd?: (event: DragEndEvent) => void;
  onAddCertification?: () => void;
  onRemoveCertification?: (id: string) => void;
  onUpdateCertification?: (id: string, field: string, value: string) => void;
  onAddProject?: () => void;
  onRemoveProject?: (id: string) => void;
  onUpdateProject?: (id: string, field: string, value: string | string[]) => void;
  onAddLanguage?: () => void;
  onRemoveLanguage?: (id: string) => void;
  onUpdateLanguage?: (id: string, field: string, value: string) => void;
  onAddVolunteer?: () => void;
  onRemoveVolunteer?: (id: string) => void;
  onUpdateVolunteer?: (id: string, field: string, value: string) => void;
  onAddCustomSection?: (title: string) => void;
  onRemoveCustomSection?: (id: string) => void;
  onUpdateCustomSection?: (id: string, title: string) => void;
  onAddCustomSectionItem?: (sectionId: string) => void;
  onRemoveCustomSectionItem?: (sectionId: string, itemId: string) => void;
  onUpdateCustomSectionItem?: (sectionId: string, itemId: string, field: string, value: string) => void;
  fullResumeText?: string;
  targetJobDescription?: string;
}

// Add Section Menu Component
interface AddSectionMenuProps {
  onAddSection: (type: 'projects' | 'certifications' | 'languages' | 'volunteer' | 'custom', customTitle?: string) => void;
  onClose: () => void;
  existingSections: string[];
}

function AddSectionMenu({ onAddSection, onClose, existingSections }: AddSectionMenuProps) {
  const [customSectionTitle, setCustomSectionTitle] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const availableSections = [
    { id: 'projects', label: 'Projects', icon: '📁', description: 'Showcase your projects' },
    { id: 'certifications', label: 'Certifications', icon: '🎓', description: 'Professional certifications' },
    { id: 'languages', label: 'Languages', icon: '🌐', description: 'Language proficiencies' },
    { id: 'volunteer', label: 'Volunteer Work', icon: '🤝', description: 'Volunteer experience' },
    { id: 'custom', label: 'Custom Section', icon: '➕', description: 'Create a custom section' },
  ];

  const handleAddCustom = () => {
    if (customSectionTitle.trim()) {
      onAddSection('custom', customSectionTitle.trim());
      setCustomSectionTitle('');
      setShowCustomInput(false);
      onClose();
    }
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-2">
        <div className="flex items-center justify-between mb-2 px-2">
          <h3 className="text-sm font-semibold text-gray-900">Add Section</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close add section menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          {availableSections.map((section) => {
            const isAdded = existingSections.includes(section.id);
            return (
              <button
                key={section.id}
                onClick={() => {
                  if (section.id === 'custom') {
                    setShowCustomInput(true);
                  } else if (!isAdded) {
                    onAddSection(section.id as 'projects' | 'certifications' | 'languages' | 'volunteer' | 'custom');
                    onClose();
                  }
                }}
                disabled={isAdded && section.id !== 'custom'}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  isAdded && section.id !== 'custom'
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{section.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{section.label}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                  {isAdded && section.id !== 'custom' && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {showCustomInput && (
          <div className="mt-2 p-2 border-t border-gray-200">
            <input
              type="text"
              value={customSectionTitle}
              onChange={(e) => setCustomSectionTitle(e.target.value)}
              placeholder="Enter section title..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCustom();
                if (e.key === 'Escape') {
                  setShowCustomInput(false);
                  setCustomSectionTitle('');
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCustom}
                className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomSectionTitle('');
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// SortableItem Component - Wraps items with drag functionality
interface SortableItemProps {
  id: string;
  children: (dragHandleProps: { style?: React.CSSProperties; listeners?: Record<string, (e: React.MouseEvent | React.TouchEvent) => void> }) => React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(dragHandleProps)}
    </div>
  );
}

function SectionsTab({ sections, resumeData, onToggle, onContentChange, onAddExperience, onRemoveExperience, onUpdateExperience, onAddEducation, onRemoveEducation, onUpdateEducation, onAddSkill, onRemoveSkill, onProfilePictureChange, onRemoveProfilePicture, onAIEnhanceExperience, loadingExperienceId, onDragEnd, onAddCertification, onRemoveCertification, onUpdateCertification, onAddProject, onRemoveProject, onUpdateProject, onAddLanguage, onRemoveLanguage, onUpdateLanguage, onAddVolunteer, onRemoveVolunteer, onUpdateVolunteer, onAddCustomSection, onRemoveCustomSection, onUpdateCustomSection, onAddCustomSectionItem, onRemoveCustomSectionItem, onUpdateCustomSectionItem }: SectionsTabProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedExperienceId, setExpandedExperienceId] = useState<string | null>(null);
  const [expandedEducationId, setExpandedEducationId] = useState<string | null>(null);
  const [expandedCertificationId, setExpandedCertificationId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [expandedVolunteerId, setExpandedVolunteerId] = useState<string | null>(null);
  const [expandedCustomSectionItemId, setExpandedCustomSectionItemId] = useState<Record<string, string | null>>({});
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false);
  const [skillInput, setSkillInput] = useState<string>('');
  const [projectTechInput, setProjectTechInput] = useState<Record<string, string>>({});

  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSectionClick = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  const handleVisibilityToggle = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    onToggle(sectionId);
  };

  const existingSectionIds = sections.map(s => s.id);
  
  const handleAddSection = (type: 'projects' | 'certifications' | 'languages' | 'volunteer' | 'custom', customTitle?: string) => {
    if (type === 'custom' && onAddCustomSection) {
      const title = customTitle || prompt('Enter section title:');
      if (title && title.trim()) {
        onAddCustomSection(title.trim());
      }
    } else if (type === 'volunteer' && onAddVolunteer) {
      onAddVolunteer();
    } else if (type === 'projects' && onAddProject) {
      onAddProject();
    } else if (type === 'certifications' && onAddCertification) {
      onAddCertification();
    } else if (type === 'languages' && onAddLanguage) {
      onAddLanguage();
    }
    setShowAddSectionMenu(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd || (() => {})}
    >
      <div className="p-6 space-y-3">
        {/* Add Section Button */}
        <div className="relative">
          <button
            onClick={() => setShowAddSectionMenu(!showAddSectionMenu)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
          {showAddSectionMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAddSectionMenu(false)}
              />
              <div className="absolute top-full left-0 mt-2 z-50">
                <AddSectionMenu
                  onAddSection={handleAddSection}
                  onClose={() => setShowAddSectionMenu(false)}
                  existingSections={existingSectionIds}
                />
              </div>
            </>
          )}
        </div>

      {sections.map((section) => {
        const isExpanded = expandedSection === section.id;
        const isVisible = section.isVisible;

        return (
          <div
            key={section.id}
            className={`bg-white border rounded-lg transition-all ${
              isVisible ? 'border-gray-200' : 'border-gray-100 opacity-60'
            } ${isExpanded ? 'shadow-md' : 'hover:border-gray-300'}`}
          >
            {/* Section Header */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => handleSectionClick(section.id)}
            >
              {/* Drag Handle */}
              <div 
                className="text-gray-400 cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-5 h-5" />
              </div>
              
              {/* Section Name */}
              <div className="flex-1 text-sm font-medium text-gray-900">
                {section.label}
              </div>
              
              {/* Visibility Toggle */}
              <button
                onClick={(e) => handleVisibilityToggle(e, section.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title={isVisible ? 'Hide section' : 'Show section'}
                aria-label={isVisible ? `Hide ${section.label} section` : `Show ${section.label} section`}
              >
                {isVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              
              {/* Expand/Collapse Icon */}
              <div className="text-gray-400">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Expanded Form Content */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                {section.id === 'heading' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => onContentChange('personalInfo.fullName', e.target.value)}
                        className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.jobTitle}
                        onChange={(e) => onContentChange('personalInfo.jobTitle', e.target.value)}
                        className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                        placeholder="Product Designer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => onContentChange('personalInfo.email', e.target.value)}
                        className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                        placeholder="hello@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => onContentChange('personalInfo.phone', e.target.value)}
                        className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => onContentChange('personalInfo.location', e.target.value)}
                        className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Profile Picture
                      </label>
                      {resumeData.profilePicture ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={resumeData.profilePicture}
                              alt="Profile preview"
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={onRemoveProfilePicture}
                              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && onProfilePictureChange) {
                                onProfilePictureChange(file);
                              }
                            }}
                            className="w-full text-xs text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && onProfilePictureChange) {
                              onProfilePictureChange(file);
                            }
                          }}
                          className="w-full text-xs text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                      )}
                      <p className="text-xs text-gray-500 mt-1">JPEG or PNG, max 2MB</p>
                    </div>
                  </div>
                )}

                {section.id === 'profile' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Professional Summary
                    </label>
                    <textarea
                      value={resumeData.personalInfo.summary}
                      onChange={(e) => onContentChange('summary', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Passionate designer with 5+ years of experience..."
                    />
                    <RealTimeAISuggestions
                      currentText={resumeData.personalInfo.summary}
                      onApplySuggestion={(suggestion) => onContentChange('summary', suggestion)}
                      onEnhanceText={(enhanced) => onContentChange('summary', enhanced)}
                      sectionName="Professional Summary"
                      fullResumeText={fullResumeText}
                      enabled={true}
                    />
                    {targetJobDescription && (
                      <SmartKeywordSuggestions
                        targetJobDescription={targetJobDescription}
                        currentResumeText={fullResumeText}
                        onAddKeyword={(keyword) => {
                          // Add keyword to summary if it makes sense, or suggest adding to skills
                          const currentSummary = resumeData.personalInfo.summary;
                          if (currentSummary.length < 200) {
                            onContentChange('summary', `${currentSummary} ${keyword}.`.trim());
                          } else {
                            // Suggest adding to skills instead
                            onAddSkill(keyword);
                          }
                        }}
                        enabled={true}
                      />
                    )}
                  </div>
                )}

                {section.id === 'experience' && (
                  <div className="space-y-3">
                    {/* List of Experience Items */}
                    <SortableContext
                      items={resumeData.experience.map((exp) => `experience-${exp.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {resumeData.experience.map((exp) => {
                        const isExpanded = expandedExperienceId === exp.id;
                        return (
                          <SortableItem key={exp.id} id={`experience-${exp.id}`}>
                            {(dragHandleProps) => (
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Experience Item Header */}
                                <div className="flex items-center justify-between p-3 bg-gray-50">
                                  {/* Drag Handle */}
                                  <div
                                    {...dragHandleProps}
                                    className="text-gray-400 cursor-grab active:cursor-grabbing mr-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  <button
                                    onClick={() => setExpandedExperienceId(isExpanded ? null : exp.id)}
                                    className="flex-1 text-left"
                                  >
                                    <div className="text-sm font-medium text-gray-900">
                                      {exp.jobTitle || "New Position"} {exp.company && `at ${exp.company}`}
                                    </div>
                                  </button>
                                  <button
                                    onClick={() => onRemoveExperience(exp.id)}
                                    className="ml-2 p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete"
                                    aria-label="Delete experience entry"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                          {/* Expanded Form */}
                          {isExpanded && (
                            <div className="p-4 space-y-4 bg-white">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Job Title
                                </label>
                                <input
                                  type="text"
                                  value={exp.jobTitle}
                                  onChange={(e) => onUpdateExperience(exp.id, 'jobTitle', e.target.value)}
                                  className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                                  placeholder="Senior Software Engineer"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Company
                                </label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => onUpdateExperience(exp.id, 'company', e.target.value)}
                                  className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                                  placeholder="Tech Company Inc."
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  value={exp.location}
                                  onChange={(e) => onUpdateExperience(exp.id, 'location', e.target.value)}
                                  className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                                  placeholder="San Francisco, CA"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Start Date
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.startDate}
                                    onChange={(e) => onUpdateExperience(exp.id, 'startDate', e.target.value)}
                                    className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                                    placeholder="2021"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    End Date
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.endDate}
                                    onChange={(e) => onUpdateExperience(exp.id, 'endDate', e.target.value)}
                                    className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                                    placeholder="Present"
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block text-xs font-medium text-gray-700">
                                    Description
                                  </label>
                                  {onAIEnhanceExperience && (
                                    <button
                                      onClick={() => onAIEnhanceExperience(exp.id, exp.description)}
                                      disabled={loadingExperienceId === exp.id}
                                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Enhance with AI"
                                    >
                                      {loadingExperienceId === exp.id ? (
                                        <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          <span>Enhancing...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Wand2 className="w-3.5 h-3.5" />
                                          <span>Enhance with AI</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                                <textarea
                                  value={exp.description}
                                  onChange={(e) => onUpdateExperience(exp.id, 'description', e.target.value)}
                                  rows={6}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                  placeholder="Describe your responsibilities and achievements..."
                                />
                                <RealTimeAISuggestions
                                  currentText={exp.description}
                                  onApplySuggestion={(suggestion) => onUpdateExperience(exp.id, 'description', suggestion)}
                                  onEnhanceText={(enhanced) => onUpdateExperience(exp.id, 'description', enhanced)}
                                  sectionName={`Experience: ${exp.jobTitle || 'Position'}`}
                                  fullResumeText={fullResumeText}
                                  enabled={true}
                                />
                              </div>
                            </div>
                          )}
                              </div>
                            )}
                          </SortableItem>
                        );
                      })}
                    </SortableContext>

                    {/* Add Position Button */}
                    <button
                      onClick={onAddExperience}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Position
                    </button>
                  </div>
                )}

                {section.id === 'education' && (
                  <div className="space-y-3">
                    {/* List of Education Items */}
                    <SortableContext
                      items={resumeData.education.map((edu) => `education-${edu.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {resumeData.education.map((edu) => {
                        const isExpanded = expandedEducationId === edu.id;
                        return (
                          <SortableItem key={edu.id} id={`education-${edu.id}`}>
                            {(dragHandleProps) => (
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Education Item Header */}
                                <div className="flex items-center justify-between p-3 bg-gray-50">
                                  {/* Drag Handle */}
                                  <div
                                    {...dragHandleProps}
                                    className="text-gray-400 cursor-grab active:cursor-grabbing mr-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  <button
                                    onClick={() => setExpandedEducationId(isExpanded ? null : edu.id)}
                                    className="flex-1 text-left"
                                  >
                                    <div className="text-sm font-medium text-gray-900">
                                      {edu.degree || "New Degree"} {edu.school && `at ${edu.school}`}
                                    </div>
                                  </button>
                                  <button
                                    onClick={() => onRemoveEducation(edu.id)}
                                    className="ml-2 p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete"
                                    aria-label="Delete education entry"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                          {/* Expanded Form */}
                          {isExpanded && (
                            <div className="p-4 space-y-4 bg-white">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  School
                                </label>
                                <input
                                  type="text"
                                  value={edu.school}
                                  onChange={(e) => onUpdateEducation(edu.id, 'school', e.target.value)}
                                  className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                                  placeholder="University of Technology"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Degree
                                </label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => onUpdateEducation(edu.id, 'degree', e.target.value)}
                                  className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                                  placeholder="Bachelor of Science"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  value={edu.location}
                                  onChange={(e) => onUpdateEducation(edu.id, 'location', e.target.value)}
                                  className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                                  placeholder="San Francisco, CA"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Start Date
                                  </label>
                                  <input
                                    type="text"
                                    value={edu.startDate}
                                    onChange={(e) => onUpdateEducation(edu.id, 'startDate', e.target.value)}
                                    className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                                    placeholder="2015"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    End Date
                                  </label>
                                  <input
                                    type="text"
                                    value={edu.endDate}
                                    onChange={(e) => onUpdateEducation(edu.id, 'endDate', e.target.value)}
                                    className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                                    placeholder="2019"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                              </div>
                            )}
                          </SortableItem>
                        );
                      })}
                    </SortableContext>

                    {/* Add Education Button */}
                    <button
                      onClick={onAddEducation}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Education
                    </button>
                  </div>
                )}

                {section.id === 'skills' && (
                  <div className="space-y-4">
                    {/* Input Field with Add Button */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (skillInput.trim()) {
                              onAddSkill(skillInput);
                              setSkillInput('');
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter a skill and press Enter"
                      />
                      <button
                        onClick={() => {
                          if (skillInput.trim()) {
                            onAddSkill(skillInput);
                            setSkillInput('');
                          }
                        }}
                        className="px-4 py-2 md:py-2 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors touch-manipulation min-h-[44px]"
                      >
                        Add
                      </button>
                    </div>

                    {/* Skills Chips */}
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => onRemoveSkill(index)}
                            className="ml-1 text-gray-500 hover:text-red-600 transition-colors p-0.5 rounded-full hover:bg-gray-200"
                            title="Remove skill"
                            aria-label={`Remove skill: ${skill}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.id === 'certifications' && onAddCertification && onRemoveCertification && onUpdateCertification && (
                  <div className="space-y-3">
                    <SortableContext
                      items={(resumeData.certifications || []).map((cert) => `certification-${cert.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {(resumeData.certifications || []).map((cert) => {
                        const isExpanded = expandedCertificationId === cert.id;
                        return (
                          <SortableItem key={cert.id} id={`certification-${cert.id}`}>
                            {(dragHandleProps) => (
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between p-3 bg-gray-50">
                                  <div className="flex items-center gap-2 flex-1">
                                    <div {...dragHandleProps} className="text-gray-400 cursor-grab active:cursor-grabbing">
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 flex-1">
                                      {cert.name || 'Untitled Certification'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setExpandedCertificationId(isExpanded ? null : cert.id)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => onRemoveCertification(cert.id)}
                                      className="text-gray-400 hover:text-red-600"
                                      aria-label="Delete certification"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                {isExpanded && (
                                  <div className="p-4 space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Certification Name</label>
                                      <input
                                        type="text"
                                        value={cert.name}
                                        onChange={(e) => onUpdateCertification(cert.id, 'name', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="AWS Certified Solutions Architect"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Issuing Organization</label>
                                      <input
                                        type="text"
                                        value={cert.issuer}
                                        onChange={(e) => onUpdateCertification(cert.id, 'issuer', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Amazon Web Services"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Date</label>
                                        <input
                                          type="text"
                                          value={cert.date}
                                          onChange={(e) => onUpdateCertification(cert.id, 'date', e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="2022-01"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Expiry Date (optional)</label>
                                        <input
                                          type="text"
                                          value={cert.expiryDate || ''}
                                          onChange={(e) => onUpdateCertification(cert.id, 'expiryDate', e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="2025-01"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Credential ID (optional)</label>
                                      <input
                                        type="text"
                                        value={cert.credentialId || ''}
                                        onChange={(e) => onUpdateCertification(cert.id, 'credentialId', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="ABC123456"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </SortableItem>
                        );
                      })}
                    </SortableContext>
                    <button
                      onClick={onAddCertification}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Certification
                    </button>
                  </div>
                )}

                {section.id === 'projects' && onAddProject && onRemoveProject && onUpdateProject && (
                  <div className="space-y-3">
                    <SortableContext
                      items={(resumeData.projects || []).map((proj) => `project-${proj.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {(resumeData.projects || []).map((proj) => {
                        const isExpanded = expandedProjectId === proj.id;
                        return (
                          <SortableItem key={proj.id} id={`project-${proj.id}`}>
                            {(dragHandleProps) => (
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between p-3 bg-gray-50">
                                  <div className="flex items-center gap-2 flex-1">
                                    <div {...dragHandleProps} className="text-gray-400 cursor-grab active:cursor-grabbing">
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 flex-1">
                                      {proj.title || proj.name || 'Untitled Project'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => onRemoveProject(proj.id)}
                                      className="text-gray-400 hover:text-red-600"
                                      aria-label="Delete project"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                {isExpanded && (
                                  <div className="p-4 space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Project Title</label>
                                      <input
                                        type="text"
                                        value={proj.title || proj.name || ''}
                                        onChange={(e) => onUpdateProject(proj.id, 'title', e.target.value)}
                                        className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                                        placeholder="E-Commerce Platform"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Role (optional)</label>
                                        <input
                                          type="text"
                                          value={proj.role || ''}
                                          onChange={(e) => onUpdateProject(proj.id, 'role', e.target.value)}
                                          className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                                          placeholder="Lead Developer"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Company (optional)</label>
                                        <input
                                          type="text"
                                          value={proj.company || ''}
                                          onChange={(e) => onUpdateProject(proj.id, 'company', e.target.value)}
                                          className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                                          placeholder="Company Name"
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Start Date</label>
                                        <input
                                          type="text"
                                          value={proj.startDate || ''}
                                          onChange={(e) => onUpdateProject(proj.id, 'startDate', e.target.value)}
                                          className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                                          placeholder="2020"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">End Date</label>
                                        <input
                                          type="text"
                                          value={proj.endDate || ''}
                                          onChange={(e) => onUpdateProject(proj.id, 'endDate', e.target.value)}
                                          className="w-full px-3 py-2 md:py-2 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                                          placeholder="2022 or Present"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
                                      <textarea
                                        value={proj.description}
                                        onChange={(e) => onUpdateProject(proj.id, 'description', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Built a full-stack e-commerce platform..."
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Technologies</label>
                                      <div className="flex gap-2 mb-2">
                                        <input
                                          type="text"
                                          value={projectTechInput[proj.id] || ''}
                                          onChange={(e) => setProjectTechInput({ ...projectTechInput, [proj.id]: e.target.value })}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && projectTechInput[proj.id]?.trim()) {
                                              e.preventDefault();
                                              const currentTechs = proj.technologies || [];
                                              onUpdateProject(proj.id, 'technologies', [...currentTechs, projectTechInput[proj.id].trim()]);
                                              setProjectTechInput({ ...projectTechInput, [proj.id]: '' });
                                            }
                                          }}
                                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="Enter technology and press Enter"
                                        />
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {proj.technologies?.map((tech, idx) => (
                                          <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm">
                                            {tech}
                                            <button
                                              onClick={() => {
                                                const newTechs = proj.technologies?.filter((_, i) => i !== idx) || [];
                                                onUpdateProject(proj.id, 'technologies', newTechs);
                                              }}
                                              className="text-gray-500 hover:text-red-600"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Project URL (optional)</label>
                                      <input
                                        type="text"
                                        value={proj.url || ''}
                                        onChange={(e) => onUpdateProject(proj.id, 'url', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://project-url.com"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </SortableItem>
                        );
                      })}
                    </SortableContext>
                    <button
                      onClick={onAddProject}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Project
                    </button>
                  </div>
                )}

                {section.id === 'languages' && onAddLanguage && onRemoveLanguage && onUpdateLanguage && (
                  <div className="space-y-3">
                    <SortableContext
                      items={(resumeData.languages || []).map((lang) => `language-${lang.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {(resumeData.languages || []).map((lang) => (
                        <SortableItem key={lang.id} id={`language-${lang.id}`}>
                          {(dragHandleProps) => (
                            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  <div {...dragHandleProps} className="text-gray-400 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <input
                                    type="text"
                                    value={lang.language}
                                    onChange={(e) => onUpdateLanguage(lang.id, 'language', e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    placeholder="English"
                                  />
                                  <select
                                    value={lang.proficiency}
                                    onChange={(e) => onUpdateLanguage(lang.id, 'proficiency', e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                  >
                                    <option value="native">Native</option>
                                    <option value="fluent">Fluent</option>
                                    <option value="professional">Professional</option>
                                    <option value="conversational">Conversational</option>
                                    <option value="basic">Basic</option>
                                  </select>
                                </div>
                                <button
                                  onClick={() => onRemoveLanguage(lang.id)}
                                  className="ml-2 text-gray-400 hover:text-red-600"
                                  aria-label={`Delete language: ${lang.language}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </SortableItem>
                      ))}
                    </SortableContext>
                    <button
                      onClick={onAddLanguage}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Language
                    </button>
                  </div>
                )}

                {/* Volunteer Section */}
                {section.id === 'volunteer' && onAddVolunteer && onRemoveVolunteer && onUpdateVolunteer && (
                  <div className="space-y-3">
                    <SortableContext
                      items={(resumeData.volunteer || []).map((vol) => `volunteer-${vol.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {(resumeData.volunteer || []).map((vol) => {
                        const isExpanded = expandedVolunteerId === vol.id;
                        return (
                          <SortableItem key={vol.id} id={`volunteer-${vol.id}`}>
                            {(dragHandleProps) => (
                              <div className="border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-2 p-3">
                                  <div {...dragHandleProps} className="text-gray-400 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900">
                                      {vol.organization || 'New Volunteer Experience'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {vol.role || 'Role'}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setExpandedVolunteerId(isExpanded ? null : vol.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => onRemoveVolunteer(vol.id)}
                                    className="text-gray-400 hover:text-red-600"
                                    aria-label="Delete volunteer experience"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                {isExpanded && (
                                  <div className="px-3 pb-3 space-y-2 border-t border-gray-200 pt-3">
                                    <input
                                      type="text"
                                      value={vol.organization}
                                      onChange={(e) => onUpdateVolunteer(vol.id, 'organization', e.target.value)}
                                      placeholder="Organization"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                    <input
                                      type="text"
                                      value={vol.role}
                                      onChange={(e) => onUpdateVolunteer(vol.id, 'role', e.target.value)}
                                      placeholder="Role"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        value={vol.startDate}
                                        onChange={(e) => onUpdateVolunteer(vol.id, 'startDate', e.target.value)}
                                        placeholder="Start Date"
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                      />
                                      <input
                                        type="text"
                                        value={vol.endDate}
                                        onChange={(e) => onUpdateVolunteer(vol.id, 'endDate', e.target.value)}
                                        placeholder="End Date"
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                      />
                                    </div>
                                    <textarea
                                      value={vol.description}
                                      onChange={(e) => onUpdateVolunteer(vol.id, 'description', e.target.value)}
                                      placeholder="Description"
                                      rows={3}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </SortableItem>
                        );
                      })}
                    </SortableContext>
                    <button
                      onClick={onAddVolunteer}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Volunteer Experience
                    </button>
                  </div>
                )}

                {/* Custom Sections */}
                {section.id === 'custom' && resumeData.customSections && resumeData.customSections.some(cs => cs.id === section.id) && (
                  <div className="space-y-3">
                    {resumeData.customSections
                      .filter(cs => cs.id === section.id)
                      .map((customSection) => (
                        <div key={customSection.id} className="space-y-3">
                          {/* Custom Section Title */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={customSection.title}
                              onChange={(e) => onUpdateCustomSection && onUpdateCustomSection(customSection.id, e.target.value)}
                              placeholder="Section Title"
                              className="flex-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                            {onRemoveCustomSection && (
                              <button
                                onClick={() => onRemoveCustomSection(customSection.id)}
                                className="text-gray-400 hover:text-red-600"
                                aria-label={`Delete custom section: ${customSection.title}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Custom Section Items */}
                          <SortableContext
                            items={customSection.items.map((item) => `custom-${customSection.id}-${item.id}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            {customSection.items.map((item) => {
                              const itemKey = `${customSection.id}-${item.id}`;
                              const isExpanded = expandedCustomSectionItemId[itemKey] === item.id;
                              return (
                                <SortableItem key={item.id} id={`custom-${customSection.id}-${item.id}`}>
                                  {(dragHandleProps) => (
                                    <div className="border border-gray-200 rounded-lg bg-gray-50">
                                      <div className="flex items-center gap-2 p-3">
                                        <div {...dragHandleProps} className="text-gray-400 cursor-grab active:cursor-grabbing">
                                          <GripVertical className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium text-sm text-gray-900">
                                            {item.title || 'New Item'}
                                          </div>
                                          {item.subtitle && (
                                            <div className="text-xs text-gray-500">{item.subtitle}</div>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => setExpandedCustomSectionItemId(prev => ({
                                            ...prev,
                                            [itemKey]: isExpanded ? null : item.id
                                          }))}
                                          className="text-gray-400 hover:text-gray-600"
                                        >
                                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                        <button
                                          onClick={() => onRemoveCustomSectionItem && onRemoveCustomSectionItem(customSection.id, item.id)}
                                          className="text-gray-400 hover:text-red-600"
                                          aria-label={`Delete item from ${customSection.title} section`}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                      {isExpanded && (
                                        <div className="px-3 pb-3 space-y-2 border-t border-gray-200 pt-3">
                                          <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => onUpdateCustomSectionItem && onUpdateCustomSectionItem(customSection.id, item.id, 'title', e.target.value)}
                                            placeholder="Title"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                          />
                                          <input
                                            type="text"
                                            value={item.subtitle}
                                            onChange={(e) => onUpdateCustomSectionItem && onUpdateCustomSectionItem(customSection.id, item.id, 'subtitle', e.target.value)}
                                            placeholder="Subtitle"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                          />
                                          <input
                                            type="text"
                                            value={item.date}
                                            onChange={(e) => onUpdateCustomSectionItem && onUpdateCustomSectionItem(customSection.id, item.id, 'date', e.target.value)}
                                            placeholder="Date"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                          />
                                          <textarea
                                            value={item.description}
                                            onChange={(e) => onUpdateCustomSectionItem && onUpdateCustomSectionItem(customSection.id, item.id, 'description', e.target.value)}
                                            placeholder="Description"
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </SortableItem>
                              );
                            })}
                          </SortableContext>
                          {onAddCustomSectionItem && (
                            <button
                              onClick={() => onAddCustomSectionItem(customSection.id)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                              Add Item
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </DndContext>
  );
}

// Templates Tab Component
interface TemplatesTabProps {
  currentTemplateId: number | string | null;
  onSelect: (id: number | string) => void;
}

function TemplatesTab({ currentTemplateId, onSelect }: TemplatesTabProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const filters = ['All', 'Classic', 'Photo', 'Modern', 'Minimalist', 'Creative'];
  
  const templates = [
    { id: 'classic', name: 'Professional Classic', category: 'Classic' },
    { id: 2, name: 'Tech Modern', category: 'Modern' },
    { id: 3, name: 'Executive Photo', category: 'Photo' },
    { id: 4, name: 'Creative Classic', category: 'Classic' },
    { id: 'minimalist', name: 'Minimalist', category: 'Minimalist' },
    { id: 'creative', name: 'Creative', category: 'Creative' },
    { id: 6, name: 'Portrait Photo', category: 'Photo' },
  ];

  const filteredTemplates = activeFilter === 'All' 
    ? templates 
    : templates.filter(t => t.category === activeFilter);

  return (
    <div className="p-6 space-y-6">
      {/* Filter Row */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const isSelected = currentTemplateId === template.id;
          // Different preview styles for different template types
          const getPreviewStyle = () => {
            if (template.id === 'minimalist') {
              return 'bg-white border border-gray-300';
            } else if (template.id === 'creative') {
              return 'bg-gradient-to-br from-blue-600 to-indigo-600';
            } else if (template.category === 'Classic') {
              return 'bg-gradient-to-br from-gray-50 to-gray-100';
            } else if (template.category === 'Modern') {
              return 'bg-gradient-to-br from-indigo-100 to-purple-100';
            } else if (template.category === 'Photo') {
              return 'bg-gradient-to-br from-cyan-100 to-blue-100';
            }
            return 'bg-gradient-to-br from-gray-50 to-gray-100';
          };
          
          return (
            <div
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-400'
              }`}
              style={{ aspectRatio: '16/9' }}
            >
              <div className={`w-full h-full ${getPreviewStyle()} flex items-center justify-center`}>
                <div className="text-center">
                  <LayoutTemplate className={`w-8 h-8 mx-auto mb-2 ${template.id === 'creative' ? 'text-white' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${template.id === 'creative' ? 'text-white' : 'text-gray-700'}`}>
                    {template.name}
                  </p>
                  {isSelected && (
                    <p className="text-xs text-blue-600 font-semibold mt-1">Selected</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Formatting Tab Component
interface FormattingTabProps {
  values: FormattingValues;
  onChange: (key: string, value: string | number) => void;
}

function FormattingTab({ values, onChange }: FormattingTabProps) {
  const fonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];
  const colors = [
    { name: 'Blue', value: '#3B82F6', class: 'bg-blue-500' },
    { name: 'Green', value: '#10B981', class: 'bg-green-500' },
    { name: 'Purple', value: '#8B5CF6', class: 'bg-purple-500' },
    { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
    { name: 'Orange', value: '#F97316', class: 'bg-orange-500' },
    { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Typography Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Typography</h3>
        <div>
          <label htmlFor="font-family" className="block text-xs text-gray-600 mb-2">
            Font Family
          </label>
          <select
            id="font-family"
            value={values.font}
            onChange={(e) => onChange('font', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spacing Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Spacing</h3>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="line-spacing" className="block text-xs text-gray-600">
              Line Spacing
            </label>
            <span className="text-xs text-gray-500">{values.lineSpacing.toFixed(1)}</span>
          </div>
          <input
            id="line-spacing"
            type="range"
            min="1"
            max="2.5"
            step="0.1"
            value={values.lineSpacing}
            onChange={(e) => onChange('lineSpacing', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Colors Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Colors</h3>
        <div className="flex gap-3 flex-wrap">
          {colors.map((color) => {
            const isSelected = values.accentColor === color.value;
            return (
              <button
                key={color.name}
                onClick={() => onChange('accentColor', color.value)}
                className="group relative"
                title={color.name}
              >
                <div className={`w-10 h-10 rounded-full ${color.class} ring-2 ring-offset-2 transition-all cursor-pointer ${
                  isSelected ? 'ring-blue-400 ring-offset-1' : 'ring-gray-200 hover:ring-blue-400'
                }`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// AI Copilot Tab Component
interface AICopilotTabProps {
  atsScore: number;
  atsAnalysis?: ATSAnalysis;
  onAIAction: (action: string) => void;
  onAIGenerate?: () => void;
  isGeneratingAI?: boolean;
  resumeData: ResumeData;
}

interface CareerGap {
  gapStartDate: string;
  gapEndDate: string;
  previousJobTitle: string;
  nextJobTitle: string;
  durationMonths: number;
  formattedStart: string;
  formattedEnd: string;
}

// Helper function to parse date string to Date object
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'current') {
    return new Date(); // Use current date for "Present"
  }
  
  // Try to parse various date formats
  // Format: "YYYY", "MM/YYYY", "YYYY-MM", "Month YYYY"
  const cleaned = dateStr.trim();
  
  // Try "YYYY" format
  if (/^\d{4}$/.test(cleaned)) {
    return new Date(parseInt(cleaned), 0, 1);
  }
  
  // Try "MM/YYYY" or "MM-YYYY"
  const slashMatch = cleaned.match(/^(\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    return new Date(parseInt(slashMatch[2]), parseInt(slashMatch[1]) - 1, 1);
  }
  
  // Try "YYYY-MM"
  const dashMatch = cleaned.match(/^(\d{4})-(\d{1,2})$/);
  if (dashMatch) {
    return new Date(parseInt(dashMatch[1]), parseInt(dashMatch[2]) - 1, 1);
  }
  
  // Try "Month YYYY" format
  const monthMatch = cleaned.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthMatch) {
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIndex = monthNames.findIndex(m => m.startsWith(monthMatch[1].toLowerCase()));
    if (monthIndex !== -1) {
      return new Date(parseInt(monthMatch[2]), monthIndex, 1);
    }
  }
  
  // Try standard Date parsing
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  return null;
}

// Helper function to format date for display
function formatDateForDisplay(date: Date): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// Helper function to calculate months between two dates
function monthsBetween(date1: Date, date2: Date): number {
  const years = date2.getFullYear() - date1.getFullYear();
  const months = date2.getMonth() - date1.getMonth();
  return years * 12 + months;
}

// Helper function to find career gaps
function findCareerGaps(experience: ExperienceItem[]): CareerGap[] {
  const gaps: CareerGap[] = [];
  
  if (experience.length < 2) {
    return gaps; // Need at least 2 jobs to have gaps
  }
  
  // Sort experience by start date (most recent first)
  // This ensures we compare the end of a later job with the start of an earlier job
  const sortedExperience = [...experience].sort((a, b) => {
    const aStart = parseDate(a.startDate);
    const bStart = parseDate(b.startDate);
    
    if (!aStart && !bStart) return 0;
    if (!aStart) return 1; // Missing start date goes later
    if (!bStart) return -1;
    
    return bStart.getTime() - aStart.getTime(); // Descending (most recent first)
  });
  
  // Check for gaps between consecutive jobs
  for (let i = 0; i < sortedExperience.length - 1; i++) {
    const laterJob = sortedExperience[i]; // More recent job
    const earlierJob = sortedExperience[i + 1]; // Older job
    
    const earlierJobEnd = parseDate(earlierJob.endDate);
    const laterJobStart = parseDate(laterJob.startDate);
    
    // Skip if we can't parse dates
    if (!earlierJobEnd || !laterJobStart) continue;
    
    // Calculate gap duration: time between end of earlier job and start of later job
    const gapMonths = monthsBetween(earlierJobEnd, laterJobStart);
    
    // If gap is more than 3 months, record it
    if (gapMonths > 3) {
      gaps.push({
        gapStartDate: earlierJob.endDate,
        gapEndDate: laterJob.startDate,
        previousJobTitle: earlierJob.jobTitle || 'Previous Position',
        nextJobTitle: laterJob.jobTitle || 'Next Position',
        durationMonths: gapMonths,
        formattedStart: formatDateForDisplay(earlierJobEnd),
        formattedEnd: formatDateForDisplay(laterJobStart),
      });
    }
  }
  
  return gaps;
}

function AICopilotTab({ atsScore, atsAnalysis, onAIAction, onAIGenerate, isGeneratingAI, resumeData }: AICopilotTabProps) {
  const [gaps, setGaps] = useState<CareerGap[]>([]);
  const [gapExplanations, setGapExplanations] = useState<Record<string, string>>({});
  const [loadingGapId, setLoadingGapId] = useState<string | null>(null);
  const [isEnhancingText, setIsEnhancingText] = useState(false);
  const [enhancedText, setEnhancedText] = useState<string | null>(null);

  // Calculate gaps when experience data changes
  useEffect(() => {
    const detectedGaps = findCareerGaps(resumeData.experience);
    setGaps(detectedGaps);
  }, [resumeData.experience]);

  // Function to generate gap explanation
  const handleGenerateExplanation = async (gap: CareerGap) => {
    const gapId = `${gap.gapStartDate}-${gap.gapEndDate}`;
    setLoadingGapId(gapId);
    
    try {
      const response = await fetch('/api/explain-gap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gapStartDate: gap.gapStartDate,
          gapEndDate: gap.gapEndDate,
          previousJobTitle: gap.previousJobTitle,
          nextJobTitle: gap.nextJobTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate explanation');
      }

      const data = await response.json();
      setGapExplanations(prev => ({
        ...prev,
        [gapId]: data.explanation,
      }));
    } catch (error) {
      console.error('Error generating gap explanation:', error);
      toast.error('Failed to generate explanation. Please try again.');
    } finally {
      setLoadingGapId(null);
    }
  };

  // Function to copy explanation to clipboard
  const handleCopyExplanation = (explanation: string) => {
    navigator.clipboard.writeText(explanation).then(() => {
      toast.success('Explanation copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    });
  };

  // Function to enhance highlighted text
  const handleEnhanceText = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default to avoid clearing selection
    e.preventDefault();
    
    // Capture the current selection
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    
    // Validate selection
    if (!selectedText || selectedText.trim().length < 5) {
      toast.error('Please highlight some text in your resume first (at least 5 characters).');
      return;
    }
    
    setIsEnhancingText(true);
    setEnhancedText(null);
    
    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance text');
      }

      const data = await response.json();
      setEnhancedText(data.enhancedText);
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enhance text. Please try again.');
    } finally {
      setIsEnhancingText(false);
    }
  };

  // Function to copy enhanced text to clipboard
  const handleCopyEnhancedText = () => {
    if (!enhancedText) return;
    
    navigator.clipboard.writeText(enhancedText).then(() => {
      toast.success('Enhanced text copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    });
  };

  // Determine score color based on value
  const getScoreColor = () => {
    if (atsScore < 50) {
      return 'text-red-600';
    } else if (atsScore >= 80) {
      return 'text-green-600';
    } else {
      return 'text-yellow-600';
    }
  };

  const getScoreBgColor = () => {
    if (atsScore < 50) {
      return 'bg-red-50 border-red-200';
    } else if (atsScore >= 80) {
      return 'bg-green-50 border-green-200';
    } else {
      return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getProgressBarColor = () => {
    if (atsScore < 50) {
      return 'bg-red-500';
    } else if (atsScore >= 80) {
      return 'bg-green-500';
    } else {
      return 'bg-yellow-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ATS Score Card */}
      <div className={`p-6 bg-gradient-to-br border rounded-lg ${getScoreBgColor()}`}>
        <div className="text-sm text-gray-600 mb-2">ATS Score</div>
        <div className={`text-4xl font-bold mb-2 ${getScoreColor()}`}>{atsScore}%</div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-300`}
            style={{ width: `${atsScore}%` }}
          />
        </div>
        
        <div className="text-xs text-gray-500">
          {atsScore < 50
            ? 'Your resume needs improvement to pass ATS filters'
            : atsScore >= 80
            ? 'Your resume is well-optimized for ATS systems'
            : 'Your resume is getting there, but could be improved'}
        </div>
      </div>

      {/* Suggestions List */}
      {atsAnalysis && atsAnalysis.suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Improvement Suggestions</h3>
          <div className="space-y-2">
            {atsAnalysis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-700 flex-1">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhance Summary with AI Button */}
      {onAIGenerate && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">AI Copilot</h3>
          <button
            onClick={onAIGenerate}
            disabled={isGeneratingAI}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingAI ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enhance Summary with AI</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Global Text Enhancer */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Global Text Enhancer</h3>
        <button
          onMouseDown={(e) => handleEnhanceText(e)}
          disabled={isEnhancingText}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEnhancingText ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enhancing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Enhance Highlighted Text</span>
            </>
          )}
        </button>
        
        {/* Enhanced Result Display */}
        {enhancedText && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-700">Enhanced Result:</p>
              <button
                onClick={handleCopyEnhancedText}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{enhancedText}</p>
            </div>
          </div>
        )}
      </div>

      {/* Gap Justification Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Gap Justification</h3>
        
        {gaps.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-900">No career gaps detected!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gaps.map((gap, index) => {
              const gapId = `${gap.gapStartDate}-${gap.gapEndDate}`;
              const explanation = gapExplanations[gapId];
              const isLoading = loadingGapId === gapId;
              
              return (
                <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Gap: {gap.formattedStart} - {gap.formattedEnd}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {gap.durationMonths} months • From {gap.previousJobTitle} to {gap.nextJobTitle}
                      </p>
                    </div>
                    <button
                      onClick={() => handleGenerateExplanation(gap)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Generate Explanation</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {explanation && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs font-medium text-gray-700">Generated Explanation:</p>
                        <button
                          onClick={() => handleCopyExplanation(explanation)}
                          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumeControlPanel({
  data,
  resumeData,
  onTemplateChange,
  onFormattingChange,
  onSectionToggle,
  onAIAction,
  onAIGenerate,
  isGeneratingAI,
  onContentChange,
  onAddExperience,
  onRemoveExperience,
  onUpdateExperience,
  onAddEducation,
  onRemoveEducation,
  onUpdateEducation,
  onAddSkill,
  onRemoveSkill,
  onProfilePictureChange,
  onRemoveProfilePicture,
  onAIEnhanceExperience,
  loadingExperienceId,
  onDragEnd,
  targetJobDescription,
  resumeId,
}: ResumeControlPanelProps) {
  // Generate full resume text for AI context
  const fullResumeText = useMemo(() => {
    let text = '';
    text += `Name: ${resumeData.personalInfo.fullName}\n`;
    text += `Job Title: ${resumeData.personalInfo.jobTitle}\n`;
    text += `Email: ${resumeData.personalInfo.email}\n`;
    text += `Phone: ${resumeData.personalInfo.phone}\n`;
    text += `Location: ${resumeData.personalInfo.location}\n\n`;
    text += `Summary: ${resumeData.summary}\n\n`;
    text += `Experience:\n`;
    resumeData.experience.forEach(exp => {
      text += `${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
      text += `${exp.description}\n\n`;
    });
    text += `Education:\n`;
    resumeData.education.forEach(edu => {
      text += `${edu.degree} at ${edu.school} (${edu.startDate} - ${edu.endDate})\n\n`;
    });
    text += `Skills: ${resumeData.skills.join(', ')}\n`;
    return text;
  }, [resumeData]);
  const [activeTab, setActiveTab] = useState<TabId>('sections');
  const isMobile = useIsMobile();

  const tabs: Tab[] = [
    { id: 'sections', label: 'Sections', icon: <Layers className="w-5 h-5" /> },
    { id: 'templates', label: 'Templates', icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: 'formatting', label: 'Formatting', icon: <Palette className="w-5 h-5" /> },
    { id: 'copilot', label: 'AI Copilot', icon: <Bot className="w-5 h-5" /> },
    { id: 'review', label: 'Review', icon: <FileCheck className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sections':
        return (
          <SectionsTab
            sections={data.sections}
            resumeData={resumeData}
            onToggle={onSectionToggle}
            onContentChange={onContentChange}
            onAddExperience={onAddExperience}
            onRemoveExperience={onRemoveExperience}
            onUpdateExperience={onUpdateExperience}
            onAddEducation={onAddEducation}
            onRemoveEducation={onRemoveEducation}
            onUpdateEducation={onUpdateEducation}
            onAddSkill={onAddSkill}
            onRemoveSkill={onRemoveSkill}
            onProfilePictureChange={onProfilePictureChange}
            onRemoveProfilePicture={onRemoveProfilePicture}
            onAIEnhanceExperience={onAIEnhanceExperience}
            loadingExperienceId={loadingExperienceId}
            onDragEnd={onDragEnd}
            fullResumeText={fullResumeText}
            targetJobDescription={targetJobDescription}
          />
        );
      case 'templates':
        return <TemplatesTab currentTemplateId={data.currentTemplateId} onSelect={onTemplateChange} />;
      case 'formatting':
        return <FormattingTab values={data.formatting} onChange={onFormattingChange} />;
      case 'copilot':
        return <AICopilotTab atsScore={data.atsScore} atsAnalysis={data.atsAnalysis} onAIAction={onAIAction} onAIGenerate={onAIGenerate} isGeneratingAI={isGeneratingAI} resumeData={resumeData} />;
      case 'review':
        return <ReviewPanel resumeData={resumeData} />;
      case 'analytics':
        return <ResumeAnalytics resumeData={resumeData} resumeId={resumeId} currentATSScore={data.atsScore} onClose={() => setActiveTab('sections')} />;
      default:
        return null;
    }
  };

  return (
    <div id="resume-control-panel" className="flex flex-col md:flex-row h-full">
      {/* Mobile: Profile Strength and Horizontal Scrollable Tabs */}
      {isMobile ? (
        <>
          {/* Profile Strength for Mobile */}
          <div className="w-full bg-white border-b border-gray-200 shrink-0">
            <ProfileStrength resumeData={resumeData} />
          </div>
          <div className="w-full bg-white border-b border-gray-200 overflow-x-auto shrink-0">
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2 px-4 py-3 min-w-[100px] transition-all duration-200 touch-manipulation ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {tab.icon}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
          </div>
        </>
      ) : (
        /* Desktop: Vertical Sidebar */
        <aside className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-full flex flex-col items-center justify-center py-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                )}
                
                {/* Icon */}
                <div
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {tab.icon}
                </div>
                
                {/* Label */}
                <span
                  className={`text-[10px] mt-1.5 font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </aside>
      )}

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Profile Strength */}
        <div className="shrink-0 border-b border-gray-200">
          <ProfileStrength resumeData={resumeData} />
        </div>
        
        {/* Scrollable Forms */}
        <div className="flex-1 overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

