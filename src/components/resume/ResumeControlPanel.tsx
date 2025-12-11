import React, { useState } from 'react';
import { Layers, LayoutTemplate, Palette, Bot, GripVertical, ChevronRight, Sparkles, FileText, Plus } from 'lucide-react';

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

export interface ResumeControlPanelProps {
  data: ResumeControlPanelData;
  onTemplateChange: (id: number) => void;
  onFormattingChange: (key: string, value: string | number) => void;
  onSectionToggle: (id: string) => void;
  onAIAction: (action: string) => void;
}

// Sections Tab Component
interface SectionsTabProps {
  sections: Section[];
  onToggle: (id: string) => void;
}

function SectionsTab({ sections, onToggle }: SectionsTabProps) {
  return (
    <div className="p-6 space-y-3">
      {sections.map((section) => (
        <div
          key={section.id}
          className={`flex items-center gap-3 p-4 bg-white border rounded-lg hover:border-gray-300 transition-colors ${
            section.isVisible ? 'border-gray-200' : 'border-gray-100 opacity-60'
          }`}
        >
          {/* Drag Handle */}
          <div className="text-gray-400 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5" />
          </div>
          
          {/* Section Name */}
          <div className="flex-1 text-sm font-medium text-gray-900">
            {section.label}
          </div>
          
          {/* Toggle/Edit Icon */}
          <button 
            onClick={() => onToggle(section.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
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
}

function AICopilotTab({ atsScore, onAIAction }: AICopilotTabProps) {
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
  onTemplateChange,
  onFormattingChange,
  onSectionToggle,
  onAIAction,
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
        return <SectionsTab sections={data.sections} onToggle={onSectionToggle} />;
      case 'templates':
        return <TemplatesTab currentTemplateId={data.currentTemplateId} onSelect={onTemplateChange} />;
      case 'formatting':
        return <FormattingTab values={data.formatting} onChange={onFormattingChange} />;
      case 'copilot':
        return <AICopilotTab atsScore={data.atsScore} onAIAction={onAIAction} />;
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

