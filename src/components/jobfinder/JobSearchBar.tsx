/**
 * Job Search Dashboard Bar — Personalized Job Search Bar.
 * Uses createPortal for dropdown menus to avoid z-index/overflow issues.
 */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  MapPin,
  ChevronDown,
  History,
  SlidersHorizontal,
  Check,
  Loader2,
  ArrowLeft
} from 'lucide-react';

// --- Reusable Dropdown Component ---
const FilterDropdown = ({
  label,
  options,
  selected,
  onSelect,
  isOpen,
  onToggle,
  onClose,
  defaultValue,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  /** When selected matches defaultValue, use neutral styling (no highlight). Highlight only when user selects a non-default value. */
  defaultValue?: string;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        portalRef.current &&
        !portalRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="shrink-0 custom-select-wrapper">
      <button
        ref={buttonRef}
        onClick={onToggle}
        type="button"
        className={`flex items-center gap-1.5 rounded-lg pl-3 pr-2 py-1.5 text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500/20 ${
          selected && (defaultValue === undefined || selected.toLowerCase() !== (defaultValue ?? '').toLowerCase())
            ? 'border border-blue-500 bg-blue-50 text-blue-500'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        <span className="whitespace-nowrap">{selected || label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 pointer-events-none ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={portalRef}
            className="bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/60 py-1.5 z-[9999]"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
          >
            {options.map((option) => (
              <div
                key={option}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelect(option);
                  onClose();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(option);
                    onClose();
                  }
                }}
                className={`px-3 py-2 text-[13px] cursor-pointer mx-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  selected === option
                    ? 'bg-blue-50/50 text-blue-500 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-500'
                }`}
              >
                <span>{option}</span>
                {selected === option && <Check size={16} />}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export interface JobSearchBarFilters {
  datePosted: string;
  experience: string;
  jobType: string;
  salary: string;
}

export interface JobSearchBarProps {
  jobTitle: string;
  onJobTitleChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  filters: JobSearchBarFilters;
  onFilterChange: (key: keyof JobSearchBarFilters, value: string) => void;
  onHistoryClick: () => void;
  onAllFiltersClick: () => void;
  /** Optional: show back button (workspace view) */
  onBack?: () => void;
}

export default function JobSearchBar({
  jobTitle,
  onJobTitleChange,
  location,
  onLocationChange,
  onSearch,
  isSearching,
  filters,
  onFilterChange,
  onHistoryClick,
  onAllFiltersClick,
  onBack,
}: JobSearchBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleFilterSelect = (key: keyof JobSearchBarFilters, value: string) => {
    onFilterChange(key, filters[key] === value ? '' : value);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <header className="bg-white border border-slate-200 rounded-xl p-2 md:p-2.5 card-shadow">
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar w-full px-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 p-2 text-gray-500 hover:text-[#111827] hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Search Input */}
          <div className="flex items-center flex-1 min-w-[200px] max-w-[360px]">
            <Search size={20} className="text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => onJobTitleChange(e.target.value)}
              placeholder="Job title, skill, or company"
              autoComplete="off"
              className="w-full bg-transparent border-transparent focus:border-transparent focus:ring-0 focus:bg-transparent focus-visible:outline-none focus-visible:ring-0 text-[14px] px-2 text-slate-700 placeholder:text-slate-500 placeholder:opacity-100 outline-none job-search-input"
            />
          </div>

          <div className="w-px h-5 bg-slate-200 shrink-0" />

          {/* Location Input — compact, closer to Search button to give job title more room */}
          <div className="flex items-center shrink-0 min-w-[130px] w-36 md:w-40 -mr-1">
            <MapPin size={20} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="City, state, or zip"
              autoComplete="off"
              className="w-full bg-transparent border-transparent focus:border-transparent focus:ring-0 focus:bg-transparent focus-visible:outline-none focus-visible:ring-0 text-[14px] px-2 text-slate-700 placeholder:text-slate-500 placeholder:opacity-100 outline-none min-w-0 job-search-input"
            />
          </div>

          {/* Search Button — minimal gap so location stays close */}
          <button
            type="button"
            onClick={onSearch}
            disabled={isSearching}
            className={`shrink-0 bg-[#1e293b] text-white px-5 py-1.5 rounded-lg text-[13px] font-bold flex items-center justify-center hover:bg-slate-800 transition-all shadow-sm ${isSearching ? 'opacity-90 cursor-not-allowed' : ''}`}
          >
            {isSearching ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={16} className="animate-spin" /> Searching
              </span>
            ) : (
              'Search'
            )}
          </button>

          <div className="w-px h-5 bg-slate-200 shrink-0 mx-1" />

          {/* Filters - only highlight when user selects a non-default value */}
          <FilterDropdown
            label="Date posted"
            options={['Any time', 'Past 24 hours', 'Past week', 'Past month']}
            selected={filters.datePosted}
            onSelect={(val) => handleFilterSelect('datePosted', val)}
            isOpen={openDropdown === 'datePosted'}
            onToggle={() => setOpenDropdown(openDropdown === 'datePosted' ? null : 'datePosted')}
            onClose={() => setOpenDropdown(null)}
            defaultValue="Any time"
          />

          <FilterDropdown
            label="Experience level"
            options={['Any Level', 'Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive']}
            selected={filters.experience}
            onSelect={(val) => handleFilterSelect('experience', val)}
            isOpen={openDropdown === 'experience'}
            onToggle={() => setOpenDropdown(openDropdown === 'experience' ? null : 'experience')}
            onClose={() => setOpenDropdown(null)}
            defaultValue="Any level"
          />

          <FilterDropdown
            label="Job type"
            options={['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']}
            selected={filters.jobType}
            onSelect={(val) => handleFilterSelect('jobType', val)}
            isOpen={openDropdown === 'jobType'}
            onToggle={() => setOpenDropdown(openDropdown === 'jobType' ? null : 'jobType')}
            onClose={() => setOpenDropdown(null)}
            defaultValue="Full-time"
          />

          <FilterDropdown
            label="Salary"
            options={['$40,000+', '$60,000+', '$80,000+', '$100,000+', '$150,000+']}
            selected={filters.salary}
            onSelect={(val) => handleFilterSelect('salary', val)}
            isOpen={openDropdown === 'salary'}
            onToggle={() => setOpenDropdown(openDropdown === 'salary' ? null : 'salary')}
            onClose={() => setOpenDropdown(null)}
            defaultValue=""
          />

          {/* History Button */}
          <button
            type="button"
            onClick={onHistoryClick}
            className="shrink-0 px-4 py-1.5 border border-slate-200 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors text-slate-700"
          >
            <History size={16} className="text-slate-400" /> <span className="hidden md:inline">History</span>
          </button>

          {/* All Filters Button */}
          <button
            type="button"
            onClick={onAllFiltersClick}
            className="shrink-0 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors text-slate-700"
          >
            <SlidersHorizontal size={16} className="text-blue-500" /> <span>All Filters</span>
          </button>
        </div>
      </header>
    </div>
  );
}
