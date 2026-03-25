import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText, Star, Target, Mail, Search, Plus, Eye, Edit2, Download,
  Trash2, X, Calendar, Building2, Briefcase, BarChart3, Clock,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, ArrowRight, Check,
  FolderOpen, History as HistoryIcon, MapPin
} from 'lucide-react';
import {
  getJobFinderSearchHistory,
  type JobFinderSearchHistoryEntry,
} from '../lib/jobFinderSearchHistory';
import { WorkflowTracking } from '../lib/workflowTracking';
import FirstTimeEntryCard from '../components/workflows/FirstTimeEntryCard';

// --- Types ---
interface WorkHistoryDocument {
  id: string;
  title: string;
  type: 'resume' | 'tailored-resume' | 'application-tailor' | 'cover-letter';
  content: string;
  jobTitle: string;
  company: string;
  status: 'draft' | 'completed';
  atsScore: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentStats {
  resumes: number;
  tailored: number;
  coverLetters: number;
  drafts: number;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

// --- Storage Service ---
const WorkHistoryStorage = {
  storageKey: 'work_history_documents',

  getAllDocuments(): WorkHistoryDocument[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading work history documents:', e);
      return [];
    }
  },

  getDocumentById(id: string): WorkHistoryDocument | null {
    const documents = this.getAllDocuments();
    return documents.find(doc => doc.id === id) || null;
  },

  saveDocument(document: Partial<WorkHistoryDocument>): WorkHistoryDocument {
    const documents = this.getAllDocuments();
    const now = new Date().toISOString();
    const isUpdate = !!document.id;

    if (isUpdate) {
      const index = documents.findIndex(d => d.id === document.id);
      if (index >= 0) {
        documents[index] = { 
          ...documents[index], 
          ...document, 
          updatedAt: now 
        } as WorkHistoryDocument;
        localStorage.setItem(this.storageKey, JSON.stringify(documents));
        return documents[index];
      }
    }

    const newDoc: WorkHistoryDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: document.title || '',
      type: document.type || 'resume',
      content: document.content || '',
      jobTitle: document.jobTitle || '',
      company: document.company || '',
      status: document.status || 'draft',
      atsScore: document.atsScore ?? null,
      createdAt: now,
      updatedAt: now,
    };
    documents.push(newDoc);
    localStorage.setItem(this.storageKey, JSON.stringify(documents));
    return newDoc;
  },

  deleteDocument(id: string): boolean {
    try {
      const documents = this.getAllDocuments();
      const filtered = documents.filter(d => d.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Error deleting document:', e);
      return false;
    }
  }
};

// --- Helper Functions ---
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'resume': return <Star className="w-5 h-5" />;
    case 'tailored-resume':
    case 'application-tailor': return <Target className="w-5 h-5" />;
    case 'cover-letter': return <Mail className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'resume': return 'Resume';
    case 'tailored-resume': return 'Tailored Resume';
    case 'application-tailor': return 'Application Tailor';
    case 'cover-letter': return 'Cover Letter';
    default: return 'Document';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'resume': return 'text-yellow-500';
    case 'tailored-resume':
    case 'application-tailor': return 'text-orange-500';
    case 'cover-letter': return 'text-blue-500';
    default: return 'text-slate-500';
  }
};

const getScoreColor = (score: number | null) => {
  if (score === null) return 'text-slate-400';
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  return 'text-red-500';
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

const sanitizeFilename = (filename: string) => {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

// --- Main Component ---
export default function WorkHistoryManager() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<WorkHistoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Workflow state (for tracking only; UI lives in dashboard Workflow tab)
  const [workflowContext, setWorkflowContext] = useState<any>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<
    'all' | 'resumes' | 'tailored' | 'cover-letters' | 'jobs-history'
  >('all');
  const [jobSearchHistory, setJobSearchHistory] = useState<JobFinderSearchHistoryEntry[]>(() =>
    getJobFinderSearchHistory()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal State
  const [viewingDoc, setViewingDoc] = useState<WorkHistoryDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<WorkHistoryDocument | null>(null);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Toast
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const DOCUMENTS_PER_PAGE = 12;

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // Cleanup toast on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Deep link: Job Finder workspace History button → ?library=jobs-history
  useEffect(() => {
    if (searchParams.get('library') === 'jobs-history') {
      setActiveTab('jobs-history');
      setCurrentPage(1);
      setJobSearchHistory(getJobFinderSearchHistory());
    }
  }, [searchParams]);

  const selectLibraryTab = useCallback(
    (tab: 'all' | 'resumes' | 'tailored' | 'cover-letters' | 'jobs-history') => {
      setActiveTab(tab);
      setCurrentPage(1);
      if (tab === 'jobs-history') {
        setJobSearchHistory(getJobFinderSearchHistory());
        setSearchParams((prev) => {
          const n = new URLSearchParams(prev);
          n.set('library', 'jobs-history');
          return n;
        });
      } else {
        setSearchParams((prev) => {
          const n = new URLSearchParams(prev);
          n.delete('library');
          return n;
        });
      }
    },
    [setSearchParams]
  );

  const openJobFinderHistoryEntry = (entry: JobFinderSearchHistoryEntry) => {
    try {
      sessionStorage.setItem('job_finder_results', JSON.stringify(entry.jobs));
      sessionStorage.setItem('job_finder_session_restore', JSON.stringify(entry.sessionRestore));
    } catch {
      showToast('Could not restore this search. Storage may be full.', 'error');
      return;
    }
    navigate('/dashboard/finder/results');
  };

  // Check for workflow context on mount
  useEffect(() => {
    const context = WorkflowTracking.getWorkflowContext();
    
    // Workflow 1: Job Application Pipeline
    if (context?.workflowId === 'job-application-pipeline') {
      setWorkflowContext(context);
      
      // If we have tailored resume or cover letter from workflow, auto-save them
      if (context.tailoredResume) {
        const resumeDoc = WorkHistoryStorage.saveDocument({
          title: `Tailored Resume - ${context.currentJob?.title || 'Application'}`,
          type: 'tailored-resume',
          content: context.tailoredResume,
          jobTitle: context.currentJob?.title || '',
          company: context.currentJob?.company || '',
          status: 'completed',
        });
        setDocuments(prev => [...prev, resumeDoc]);
      }
      
      if (context.coverLetter) {
        const coverLetterDoc = WorkHistoryStorage.saveDocument({
          title: `Cover Letter - ${context.currentJob?.title || 'Application'}`,
          type: 'cover-letter',
          content: context.coverLetter,
          jobTitle: context.currentJob?.title || '',
          company: context.currentJob?.company || '',
          status: 'completed',
        });
        setDocuments(prev => [...prev, coverLetterDoc]);
      }
      
      // Mark step as in-progress
      const workflow = WorkflowTracking.getWorkflow('job-application-pipeline');
      if (workflow) {
        const archiveStep = workflow.steps.find(s => s.id === 'archive-documents');
        if (archiveStep && archiveStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('job-application-pipeline', 'archive-documents', 'in-progress');
        }
      }
    }
    
    // Workflow 6: Document Consistency & Version Control
    if (context?.workflowId === 'document-consistency-version-control') {
      setWorkflowContext(context);
      
      // Mark step as in-progress
      const workflow = WorkflowTracking.getWorkflow('document-consistency-version-control');
      if (workflow) {
        const archiveStep = workflow.steps.find(s => s.id === 'archive-versions');
        if (archiveStep && archiveStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('document-consistency-version-control', 'archive-versions', 'in-progress');
        }
      }
      
      // Auto-save resume and cover letter versions if available
      if (context.resumeData) {
        // Save resume version for consistency tracking
        const resumeDoc = WorkHistoryStorage.saveDocument({
          title: `Resume - Consistent Version`,
          type: 'resume',
          content: JSON.stringify(context.resumeData),
          jobTitle: '',
          company: '',
          status: 'completed',
        });
        setDocuments(prev => [...prev, resumeDoc]);
      }
      
      if (context.coverLetter) {
        const coverLetterDoc = WorkHistoryStorage.saveDocument({
          title: `Cover Letter - Synced Version`,
          type: 'cover-letter',
          content: context.coverLetter,
          jobTitle: '',
          company: '',
          status: 'completed',
        });
        setDocuments(prev => [...prev, coverLetterDoc]);
      }
    }
  }, []);

  // Load documents
  useEffect(() => {
    const loadDocuments = () => {
      try {
        setIsLoading(true);
        const loaded = WorkHistoryStorage.getAllDocuments();
        setDocuments(loaded);
        setError(null);
        
        // Update workflow progress if documents were saved
        // Workflow 1: Job Application Pipeline
        const workflow1 = WorkflowTracking.getWorkflow('job-application-pipeline');
        if (workflow1 && workflow1.isActive && workflowContext?.workflowId === 'job-application-pipeline' && loaded.length > 0) {
          // Check if we have documents from this workflow
          const hasWorkflowDocs = loaded.some(doc => 
            doc.type === 'tailored-resume' || doc.type === 'cover-letter'
          );
          if (hasWorkflowDocs) {
            WorkflowTracking.updateStepStatus('job-application-pipeline', 'archive-documents', 'completed', {
              documentsArchived: loaded.length
            });
          }
        }
        
        // Workflow 6: Document Consistency & Version Control
        const workflow6 = WorkflowTracking.getWorkflow('document-consistency-version-control');
        if (workflow6 && workflow6.isActive && workflowContext?.workflowId === 'document-consistency-version-control' && loaded.length > 0) {
          // Check if we have consistent document versions
          const hasConsistentDocs = loaded.some(doc => 
            doc.type === 'resume' || doc.type === 'cover-letter'
          );
          if (hasConsistentDocs) {
            WorkflowTracking.updateStepStatus('document-consistency-version-control', 'archive-versions', 'completed', {
              documentsArchived: loaded.length,
              versionsTracked: loaded.filter(d => d.type === 'resume' || d.type === 'cover-letter').length
            });
            
            // Complete the workflow
            if (workflow6.progress === 100) {
              WorkflowTracking.completeWorkflow('document-consistency-version-control');
            }
          }
        }
      } catch (err) {
        console.error('Error loading documents:', err);
        setError('Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };
    loadDocuments();
  }, [workflowContext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with /
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && 
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search documents"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
      
      // Close modals with Esc
      if (e.key === 'Escape') {
        if (viewingDoc) setViewingDoc(null);
        else if (editingDoc) { setEditingDoc(null); setSaveError(null); }
        else if (creatingDoc) { setCreatingDoc(false); setSaveError(null); }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingDoc, editingDoc, creatingDoc]);

  // Calculate stats
  const stats: DocumentStats = useMemo(() => ({
    resumes: documents.filter(d => d.type === 'resume').length,
    tailored: documents.filter(d => d.type === 'tailored-resume' || d.type === 'application-tailor').length,
    coverLetters: documents.filter(d => d.type === 'cover-letter').length,
    drafts: documents.filter(d => d.status === 'draft').length,
  }), [documents]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesTab = activeTab === 'all' ||
        (activeTab === 'resumes' && doc.type === 'resume') ||
        (activeTab === 'tailored' && (doc.type === 'tailored-resume' || doc.type === 'application-tailor')) ||
        (activeTab === 'cover-letters' && doc.type === 'cover-letter');

      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = !debouncedSearch ||
        doc.title.toLowerCase().includes(searchLower) ||
        doc.jobTitle?.toLowerCase().includes(searchLower) ||
        doc.company?.toLowerCase().includes(searchLower) ||
        doc.content?.toLowerCase().includes(searchLower);

      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;

      return matchesTab && matchesSearch && matchesStatus;
    });
  }, [documents, activeTab, debouncedSearch, filterStatus]);

  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'type': return a.type.localeCompare(b.type);
        case 'date':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [filteredDocuments, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedDocuments.length / DOCUMENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * DOCUMENTS_PER_PAGE;
  const paginatedDocuments = sortedDocuments.slice(startIndex, startIndex + DOCUMENTS_PER_PAGE);

  // Reset page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Refresh documents
  const refreshDocuments = () => {
    const loaded = WorkHistoryStorage.getAllDocuments();
    setDocuments(loaded);
  };

  // Handlers
  const handleView = (doc: WorkHistoryDocument) => {
    const fullDoc = WorkHistoryStorage.getDocumentById(doc.id);
    setViewingDoc(fullDoc || doc);
  };

  const handleEdit = (doc: WorkHistoryDocument) => {
    const fullDoc = WorkHistoryStorage.getDocumentById(doc.id);
    setEditingDoc(fullDoc ? { ...fullDoc } : { ...doc });
    setSaveError(null);
  };

  const handleSaveEdit = () => {
    if (!editingDoc) return;

    if (!editingDoc.title.trim()) {
      setSaveError('Title is required');
      return;
    }

    try {
      WorkHistoryStorage.saveDocument(editingDoc);
      refreshDocuments();
      setEditingDoc(null);
      setSaveError(null);
      showToast('Document saved successfully!');
    } catch (err) {
      console.error('Error saving document:', err);
      setSaveError('Failed to save document');
    }
  };

  const handleDownload = (doc: WorkHistoryDocument) => {
    try {
      if (!doc.content) {
        showToast('No content to download', 'error');
        return;
      }
      const blob = new Blob([doc.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizeFilename(doc.title) || 'document'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      showToast('Failed to download document', 'error');
    }
  };

  const handleDelete = (doc: WorkHistoryDocument) => {
    if (window.confirm(`Are you sure you want to delete "${doc.title}"? This action cannot be undone.`)) {
      try {
        WorkHistoryStorage.deleteDocument(doc.id);
        refreshDocuments();
        showToast('Document deleted successfully!');
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Failed to delete document');
      }
    }
  };

  const handleCreate = () => {
    setCreatingDoc(true);
    setSaveError(null);
  };

  const handleSaveCreate = (newDoc: Partial<WorkHistoryDocument>) => {
    if (!newDoc.title?.trim()) {
      setSaveError('Title is required');
      return;
    }

    try {
      WorkHistoryStorage.saveDocument(newDoc);
      refreshDocuments();
      setCreatingDoc(false);
      setSaveError(null);
      showToast('Document created successfully!');
    } catch (err) {
      console.error('Error creating document:', err);
      setSaveError('Failed to create document');
    }
  };

  return (
    <div className="space-y-8">
      {/* First-Time Entry Card */}
      <FirstTimeEntryCard
        featurePath="/dashboard/work-history"
        featureName="Work History Manager"
      />
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Library — same categories as documents, plus Job Finder saved searches */}
        <aside className="w-full lg:w-56 shrink-0">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide px-3 mb-2">Library</div>
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-3 space-y-1">
            {[
              { id: 'all' as const, label: 'All Items', icon: FolderOpen, count: documents.length },
              { id: 'resumes' as const, label: 'Master Resumes', icon: Star, count: stats.resumes },
              { id: 'tailored' as const, label: 'Tailored Docs', icon: Target, count: stats.tailored },
              { id: 'cover-letters' as const, label: 'Cover Letters', icon: Mail, count: stats.coverLetters },
              { id: 'jobs-history' as const, label: 'Jobs history', icon: HistoryIcon, count: jobSearchHistory.length },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectLibraryTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon
                    size={16}
                    className={activeTab === item.id ? 'text-slate-700 shrink-0' : 'text-slate-400 shrink-0'}
                  />
                  <span className="truncate text-left">{item.label}</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                    activeTab === item.id ? 'bg-white text-slate-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0 space-y-8 w-full">
      {/* Summary Statistics */}
      {activeTab !== 'jobs-history' && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Master Resumes</h3>
              <p className="text-3xl font-bold text-yellow-500">{stats.resumes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Tailored Resumes</h3>
              <p className="text-3xl font-bold text-orange-500">{stats.tailored}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Cover Letters</h3>
              <p className="text-3xl font-bold text-blue-500">{stats.coverLetters}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Draft Documents</h3>
              <p className="text-3xl font-bold text-amber-500">{stats.drafts}</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'jobs-history' && (
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Jobs history</h2>
          <p className="text-sm text-slate-600 mb-6">
            Saved personalized Job Finder sessions. Open one to return to the workspace with the same results, resume, and search focus.
          </p>
          {jobSearchHistory.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-slate-200 rounded-xl bg-white/40">
              <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No saved searches yet</p>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Run a personalized search in Job Finder; each successful search is saved here automatically.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {jobSearchHistory.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => openJobFinderHistoryEntry(entry)}
                    className="w-full text-left bg-white/80 hover:bg-white border border-slate-200 rounded-xl p-4 transition-colors shadow-sm hover:border-slate-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-sm font-semibold text-slate-900">
                            {new Date(entry.searchedAt).toLocaleString()}
                          </span>
                          {entry.searchStrategyLabel && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {entry.searchStrategyLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 break-words">
                          <span className="font-medium text-slate-800">Keywords: </span>
                          {entry.jsearchQuery || '—'}
                        </p>
                        {entry.location && (
                          <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {entry.location}
                          </p>
                        )}
                        {entry.resumeFileName && (
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            Resume: {entry.resumeFileName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-end">
                        <span className="text-xs font-medium text-slate-500">
                          {entry.resultCount} job{entry.resultCount === 1 ? '' : 's'}
                        </span>
                        <span className="text-sm font-semibold text-primary flex items-center gap-1">
                          Open workspace
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Filters and Search + document grid */}
      {activeTab !== 'jobs-history' && (
      <>
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">My Documents</h2>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-[#111827] text-white rounded-lg font-medium hover:bg-[#1f2937] transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents... (Press / to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              maxLength={100}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 text-slate-900 placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="type">Sort by Type</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setCurrentPage(1); }}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
        
        {/* Search Results Count */}
        {!isLoading && (
          <div className="mt-4 text-sm text-slate-600">
            {sortedDocuments.length === 0 ? (
              <span>No documents found</span>
            ) : sortedDocuments.length === 1 ? (
              <span>1 document found</span>
            ) : (
              <span>
                Showing {startIndex + 1}-{Math.min(startIndex + DOCUMENTS_PER_PAGE, sortedDocuments.length)} of {sortedDocuments.length} documents
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Documents</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-200 rounded"></div>
                <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents Grid */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedDocuments.length > 0 ? (
              paginatedDocuments.map(doc => (
                <div key={doc.id} className="bg-white/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-[#111827]/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 ${getTypeColor(doc.type)}`}>
                        {getTypeIcon(doc.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{doc.title}</h3>
                        <p className="text-sm text-slate-500">{getTypeLabel(doc.type)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'completed' ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    {doc.jobTitle && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{doc.jobTitle}</span>
                      </div>
                    )}
                    {doc.company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{doc.company}</span>
                      </div>
                    )}
                    {doc.atsScore !== null && (
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        <span className={`font-medium ${getScoreColor(doc.atsScore)}`}>
                          ATS Score: {doc.atsScore}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Updated: {formatDate(doc.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(doc)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(doc)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="bg-red-400 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-500 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                {documents.length === 0 ? (
                  <>
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-slate-900 mb-2">Welcome to Work History Manager!</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      Track and manage all your resumes, cover letters, and tailored applications in one place. Get started by creating your first document.
                    </p>
                    <button
                      onClick={handleCreate}
                      className="px-6 py-3 bg-[#111827] text-white rounded-lg font-medium hover:bg-[#1f2937] transition-colors shadow-lg"
                    >
                      Create Your First Document
                    </button>
                    <p className="text-slate-500 mt-4 text-sm">
                      Tip: Press <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">/</kbd> to quickly search documents
                    </p>
                  </>
                ) : (
                  <>
                    <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No documents match your search</h3>
                    <p className="text-slate-500 mb-4">
                      Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        selectLibraryTab('all');
                        setFilterStatus('all');
                      }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  currentPage === 1
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#111827] text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  currentPage === totalPages
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
      </>
      )}

        </div>
      </div>

      {/* View Document Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewingDoc(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">{viewingDoc.title}</h2>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full ${
                  viewingDoc.status === 'completed' ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'
                }`}>
                  {viewingDoc.status}
                </span>
                <span className="text-slate-600">{getTypeLabel(viewingDoc.type)}</span>
                {viewingDoc.jobTitle && <span className="text-slate-600">• {viewingDoc.jobTitle}</span>}
                {viewingDoc.company && <span className="text-slate-600">• {viewingDoc.company}</span>}
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <pre className="whitespace-pre-wrap text-slate-900 font-sans">
                  {viewingDoc.content || 'No content available.'}
                </pre>
              </div>
              {viewingDoc.atsScore !== null && (
                <div className={`text-sm ${getScoreColor(viewingDoc.atsScore)}`}>
                  ATS Score: {viewingDoc.atsScore}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setEditingDoc(null); setSaveError(null); }}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Edit Document</h2>
              <button
                onClick={() => { setEditingDoc(null); setSaveError(null); }}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
              {saveError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700">
                  {saveError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Title *</label>
                <input
                  type="text"
                  value={editingDoc.title}
                  onChange={e => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  maxLength={200}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Job Title</label>
                  <input
                    type="text"
                    value={editingDoc.jobTitle}
                    onChange={e => setEditingDoc({ ...editingDoc, jobTitle: e.target.value })}
                    maxLength={100}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Company</label>
                  <input
                    type="text"
                    value={editingDoc.company}
                    onChange={e => setEditingDoc({ ...editingDoc, company: e.target.value })}
                    maxLength={100}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Status</label>
                  <select
                    value={editingDoc.status}
                    onChange={e => setEditingDoc({ ...editingDoc, status: e.target.value as 'draft' | 'completed' })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                  >
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">ATS Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingDoc.atsScore ?? ''}
                    onChange={e => setEditingDoc({ ...editingDoc, atsScore: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Content</label>
                <textarea
                  value={editingDoc.content}
                  onChange={e => setEditingDoc({ ...editingDoc, content: e.target.value })}
                  maxLength={50000}
                  rows={10}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setEditingDoc(null); setSaveError(null); }}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-lg bg-[#111827] text-white hover:bg-[#1f2937] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Document Modal */}
      {creatingDoc && (
        <CreateDocumentModal
          onClose={() => { setCreatingDoc(false); setSaveError(null); }}
          onSave={handleSaveCreate}
          error={saveError}
        />
      )}
    </div>
  );
}

// --- Create Document Modal Component ---
interface CreateDocumentModalProps {
  onClose: () => void;
  onSave: (doc: Partial<WorkHistoryDocument>) => void;
  error: string | null;
}

function CreateDocumentModal({ onClose, onSave, error }: CreateDocumentModalProps) {
  const [newDoc, setNewDoc] = useState<Partial<WorkHistoryDocument>>({
    title: '',
    type: 'resume',
    content: '',
    jobTitle: '',
    company: '',
    status: 'draft',
    atsScore: null
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Create New Document</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Title *</label>
            <input
              type="text"
              value={newDoc.title}
              onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
              placeholder="Enter document title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Document Type *</label>
            <select
              value={newDoc.type}
              onChange={e => setNewDoc({ ...newDoc, type: e.target.value as WorkHistoryDocument['type'] })}
              className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
            >
              <option value="resume">Resume</option>
              <option value="tailored-resume">Tailored Resume</option>
              <option value="application-tailor">Application Tailor</option>
              <option value="cover-letter">Cover Letter</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Job Title</label>
              <input
                type="text"
                value={newDoc.jobTitle}
                onChange={e => setNewDoc({ ...newDoc, jobTitle: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Company</label>
              <input
                type="text"
                value={newDoc.company}
                onChange={e => setNewDoc({ ...newDoc, company: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Status</label>
              <select
                value={newDoc.status}
                onChange={e => setNewDoc({ ...newDoc, status: e.target.value as 'draft' | 'completed' })}
                className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
              >
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">ATS Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newDoc.atsScore ?? ''}
                onChange={e => setNewDoc({ ...newDoc, atsScore: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Content</label>
            <textarea
              value={newDoc.content}
              onChange={e => setNewDoc({ ...newDoc, content: e.target.value })}
              maxLength={50000}
              rows={10}
              className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
              placeholder="Enter document content..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(newDoc)}
              className="px-4 py-2 rounded-lg bg-[#111827] text-white hover:bg-[#1f2937] transition-colors"
            >
              Create Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}







