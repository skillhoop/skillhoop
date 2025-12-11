import React, { useState } from 'react';
import { Layers, LayoutTemplate, Palette, Bot, GripVertical, ChevronRight, ChevronDown, Sparkles, FileText, Plus, Eye, EyeOff, Trash2, X, Wand2, Loader2 } from 'lucide-react';
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

type TabId = 'sections' | 'templates' | 'formatting' | 'copilot';

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

export interface ResumeControlPanelData {
  currentTemplateId: number | null;
  formatting: FormattingValues;
  sections: Section[];
  atsScore: number;
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
  profilePicture?: string;
}

export interface ResumeControlPanelProps {
  data: ResumeControlPanelData;
  resumeData: ResumeData;
  onTemplateChange: (id: number) => void;
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
}

// SortableItem Component - Wraps items with drag functionality
interface SortableItemProps {
  id: string;
  children: (dragHandleProps: any) => React.ReactNode;
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

function SectionsTab({ sections, resumeData, onToggle, onContentChange, onAddExperience, onRemoveExperience, onUpdateExperience, onAddEducation, onRemoveEducation, onUpdateEducation, onAddSkill, onRemoveSkill, onProfilePictureChange, onRemoveProfilePicture, onAIEnhanceExperience, loadingExperienceId, onDragEnd }: SectionsTabProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedExperienceId, setExpandedExperienceId] = useState<string | null>(null);
  const [expandedEducationId, setExpandedEducationId] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState<string>('');

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd || (() => {})}
    >
      <div className="p-6 space-y-3">
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={resumeData.summary}
                      onChange={(e) => onContentChange('summary', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Passionate designer with 5+ years of experience..."
                    />
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
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
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
  currentTemplateId: number | null;
  onSelect: (id: number) => void;
}

function TemplatesTab({ currentTemplateId, onSelect }: TemplatesTabProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const filters = ['All', 'Classic', 'Photo', 'Modern'];
  
  const templates = [
    { id: 1, name: 'Professional Classic', category: 'Classic' },
    { id: 2, name: 'Tech Modern', category: 'Modern' },
    { id: 3, name: 'Executive Photo', category: 'Photo' },
    { id: 4, name: 'Creative Classic', category: 'Classic' },
    { id: 5, name: 'Minimalist Modern', category: 'Modern' },
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
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <LayoutTemplate className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{template.name}</p>
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
  onAIAction: (action: string) => void;
  onAIGenerate?: () => void;
  isGeneratingAI?: boolean;
}

function AICopilotTab({ atsScore, onAIAction, onAIGenerate, isGeneratingAI }: AICopilotTabProps) {
  const actions = [
    { id: 'ats', label: 'ATS Optimization', icon: <FileText className="w-4 h-4" /> },
    { id: 'enhance', label: 'Enhance Text', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'gap', label: 'Gap Justification', icon: <Plus className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ATS Score Card */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">ATS Score</div>
        <div className="text-4xl font-bold text-blue-600 mb-1">{atsScore}%</div>
        <div className="text-xs text-gray-500">Run optimization to improve</div>
      </div>

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

      {/* Action Buttons */}
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAIAction(action.id)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
          >
            <div className="text-gray-600">{action.icon}</div>
            <span className="text-sm font-medium text-gray-900">{action.label}</span>
          </button>
        ))}
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
}: ResumeControlPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('sections');

  const tabs: Tab[] = [
    { id: 'sections', label: 'Sections', icon: <Layers className="w-5 h-5" /> },
    { id: 'templates', label: 'Templates', icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: 'formatting', label: 'Formatting', icon: <Palette className="w-5 h-5" /> },
    { id: 'copilot', label: 'AI Copilot', icon: <Bot className="w-5 h-5" /> },
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
          />
        );
      case 'templates':
        return <TemplatesTab currentTemplateId={data.currentTemplateId} onSelect={onTemplateChange} />;
      case 'formatting':
        return <FormattingTab values={data.formatting} onChange={onFormattingChange} />;
      case 'copilot':
        return <AICopilotTab atsScore={data.atsScore} onAIAction={onAIAction} onAIGenerate={onAIGenerate} isGeneratingAI={isGeneratingAI} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - Fixed Width */}
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

      {/* Content Area */}
      <div className="flex-1 bg-white overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}

