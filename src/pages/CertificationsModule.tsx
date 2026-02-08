import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Shield, 
  FileCheck, 
  TrendingUp, 
  Building2, 
  Search, 
  Plus, 
  MoreHorizontal, 
  BadgeCheck, 
  Clock, 
  Share2, 
  X, 
  CheckCircle2, 
  Linkedin, 
  ExternalLink, 
  Download, 
  ChevronRight,
  Check,
  ArrowRight,
  Filter,
  Trash2,
  Edit2,
  AlertCircle,
  MoreVertical,
  Calendar
} from 'lucide-react';

// --- Mocks for External Logic ---

const useNavigate = () => (path: string) => console.log("Navigating to", path);

const WorkflowTracking = {
    _context: { workflowId: 'skill-development-advancement', currentJob: null } as any,
    getWorkflow: (id: string) => {
        // Return active state for skill-development-advancement 
        if (id === 'skill-development-advancement') {
             return { 
                 steps: [
                     {id: 'identify-skills', status: 'completed'}, 
                     {id: 'create-learning-path', status: 'completed'},
                     {id: 'earn-certifications', status: 'not-started'}
                ], 
                isActive: true, 
                progress: 60 
            };
        }
        return { steps: [], isActive: false, progress: 0 };
    },
    updateStepStatus: (workflowId: string, stepId: string, status: string, data?: any) => {
        console.log(`Workflow ${workflowId} step ${stepId} updated to ${status}`, data);
    },
    getWorkflowContext: () => {
        return WorkflowTracking._context;
    },
    setWorkflowContext: (context: any) => {
        console.log('Workflow Context Set:', context);
        WorkflowTracking._context = { ...WorkflowTracking._context, ...context };
    }
};

// --- Helper Components ---

const WorkflowBreadcrumb = ({ workflowId, currentFeaturePath }: any) => (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4 text-xs font-medium text-slate-500 flex items-center gap-2 w-fit animate-fade-in">
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Active Workflow</span>
        <span>{workflowId === 'job-application-pipeline' ? 'Job Application Pipeline' : workflowId === 'skill-development-advancement' ? 'Skill Development' : 'Career Growth'}</span>
        <ChevronRight size={12}/>
        <span className="text-neutral-900 font-bold">Earn Certifications</span>
    </div>
);

const WorkflowQuickActions = ({ workflowId, currentFeaturePath }: any) => null;
const WorkflowTransition = ({ workflowId, currentFeaturePath }: any) => null;

// --- Certifications Component Data & Logic ---

// Sample certifications data
const sampleCertifications = [
  {
    id: 1,
    name: 'AWS Solutions Architect - Professional',
    issuer: 'Amazon Web Services',
    dateEarned: '2024-02-15',
    expirationDate: '2027-02-15',
    credentialId: 'AWS-SAP-2024-0123',
    credentialUrl: 'https://aws.amazon.com/verify/SAP2024',
    skills: ['Cloud Architecture', 'AWS', 'System Design', 'Security'],
    category: 'cloud',
    status: 'active',
    verificationStatus: 'verified',
    description: 'Validates advanced technical skills in designing distributed applications and systems on AWS.'
  },
  {
    id: 2,
    name: 'Google Cloud Professional Data Engineer',
    issuer: 'Google Cloud',
    dateEarned: '2024-01-10',
    expirationDate: '2026-01-10',
    credentialId: 'GCP-PDE-2024-0456',
    credentialUrl: 'https://cloud.google.com/verify/PDE2024',
    skills: ['Data Engineering', 'BigQuery', 'Machine Learning', 'GCP'],
    category: 'data',
    status: 'active',
    verificationStatus: 'verified',
    description: 'Demonstrates ability to design, build, and maintain data processing systems on Google Cloud.'
  },
  {
    id: 3,
    name: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'Linux Foundation',
    dateEarned: '2023-11-20',
    expirationDate: '2024-11-20',
    credentialId: 'LF-CKA-2023-0789',
    credentialUrl: 'https://training.linuxfoundation.org/verify/CKA2023',
    skills: ['Kubernetes', 'Docker', 'Container Orchestration', 'DevOps'],
    category: 'development',
    status: 'expiring-soon',
    verificationStatus: 'verified',
    description: 'Validates skills to perform the responsibilities of a Kubernetes administrator.'
  },
  {
    id: 4,
    name: 'Professional Scrum Master I (PSM I)',
    issuer: 'Scrum.org',
    dateEarned: '2023-08-05',
    credentialId: 'PSM-2023-1234',
    credentialUrl: 'https://scrum.org/verify/PSM2023',
    skills: ['Scrum', 'Agile', 'Team Leadership', 'Project Management'],
    category: 'management',
    status: 'active',
    verificationStatus: 'verified',
    description: 'Demonstrates fundamental knowledge of Scrum and ability to support Scrum Teams.'
  },
  {
    id: 5,
    name: 'CompTIA Security+',
    issuer: 'CompTIA',
    dateEarned: '2023-05-12',
    expirationDate: '2026-05-12',
    credentialId: 'COMP-SEC-2023-5678',
    credentialUrl: 'https://comptia.org/verify/SEC2023',
    skills: ['Cybersecurity', 'Network Security', 'Risk Management', 'Compliance'],
    category: 'security',
    status: 'active',
    verificationStatus: 'verified',
    description: 'Validates baseline skills for performing core security functions.'
  },
  {
    id: 6,
    name: 'Meta React Developer Certificate',
    issuer: 'Meta',
    dateEarned: '2024-03-01',
    credentialId: 'META-REACT-2024-9012',
    credentialUrl: 'https://coursera.org/verify/REACT2024',
    skills: ['React', 'JavaScript', 'Front-End Development', 'UI/UX'],
    category: 'development',
    status: 'active',
    verificationStatus: 'pending',
    description: 'Professional certificate demonstrating proficiency in React development.'
  }
];

// Category configurations
const certCategories = [
  { id: 'all', label: 'All', icon: Award },
  { id: 'cloud', label: 'Cloud', icon: Shield },
  { id: 'development', label: 'Development', icon: FileCheck },
  { id: 'data', label: 'Data', icon: TrendingUp },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'management', label: 'Management', icon: Building2 },
];

const sortOptions = [
    { id: 'newest', label: 'Date Earned (Newest)' },
    { id: 'oldest', label: 'Date Earned (Oldest)' },
    { id: 'expiring', label: 'Expiring Soon' },
    { id: 'name', label: 'Name (A-Z)' },
];

// Helper functions for Certifications
const getCertCategoryColor = (category: string) => {
  switch (category) {
    case 'cloud': return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'development': return 'text-purple-600 bg-purple-100 border-purple-200';
    case 'data': return 'text-green-600 bg-green-100 border-green-200';
    case 'security': return 'text-red-600 bg-red-100 border-red-200';
    case 'management': return 'text-orange-600 bg-orange-100 border-orange-200';
    default: return 'text-slate-600 bg-slate-100 border-slate-200';
  }
};

const getCertStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    case 'expiring-soon': return 'text-amber-700 bg-amber-50 border-amber-100';
    case 'expired': return 'text-red-700 bg-red-50 border-red-100';
    default: return 'text-slate-700 bg-slate-50 border-slate-100';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getDaysUntilExpiration = (expirationDate?: string) => {
  if (!expirationDate) return null;
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// --- Main Certifications Component ---

const Certifications = () => {
  const navigate = useNavigate();
   
  // Workflow state
  const [workflowContext, setWorkflowContext] = useState<any>(null);
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);
   
  const [certifications, setCertifications] = useState(sampleCertifications);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal & Edit States
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<number | null>(null);
  
  const [selectedCertification, setSelectedCertification] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Menu State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    dateEarned: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    skills: '',
    category: 'development',
    description: ''
  });

  // Filter and Sort Logic
  const filteredCertifications = certifications
    .filter(cert => {
        const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory;
        const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime();
        if (sortBy === 'oldest') return new Date(a.dateEarned).getTime() - new Date(b.dateEarned).getTime();
        if (sortBy === 'expiring') {
            if (!a.expirationDate) return 1;
            if (!b.expirationDate) return -1;
            return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        }
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
    });

  // Stats
  const totalCerts = certifications.length;
  const activeCerts = certifications.filter(c => c.status === 'active').length;
  const verifiedCerts = certifications.filter(c => c.verificationStatus === 'verified').length;
  const expiringCerts = certifications.filter(c => c.status === 'expiring-soon').length;

  // Check for workflow context on mount
  useEffect(() => {
    const context = WorkflowTracking.getWorkflowContext();
    if (context?.workflowId === 'skill-development-advancement') {
      setWorkflowContext(context);
      const workflow = WorkflowTracking.getWorkflow('skill-development-advancement');
      if (workflow) {
        const certStep = workflow.steps.find((s: any) => s.id === 'earn-certifications');
        if (certStep && certStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('skill-development-advancement', 'earn-certifications', 'in-progress');
        }
      }
       
      if (certifications.length > 0) {
        WorkflowTracking.updateStepStatus('skill-development-advancement', 'earn-certifications', 'completed', {
          certificationsEarned: certifications.length
        });
        setShowWorkflowPrompt(true);
      }
    }
  }, [certifications.length]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (activeMenuId !== null && !(event.target as Element).closest('.action-menu-container')) {
            setActiveMenuId(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  // Form Handlers
  const handleOpenAddModal = () => {
      setFormData({
        name: '',
        issuer: '',
        dateEarned: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: '',
        skills: '',
        category: 'development',
        description: ''
      });
      setIsEditing(false);
      setCurrentEditId(null);
      setShowAddModal(true);
  };

  const handleOpenEditModal = (cert: any) => {
      setFormData({
        name: cert.name,
        issuer: cert.issuer,
        dateEarned: cert.dateEarned,
        expirationDate: cert.expirationDate || '',
        credentialId: cert.credentialId,
        credentialUrl: cert.credentialUrl || '',
        skills: cert.skills.join(', '),
        category: cert.category,
        description: cert.description || ''
      });
      setIsEditing(true);
      setCurrentEditId(cert.id);
      setActiveMenuId(null); // Close menu
      setShowAddModal(true);
  };

  const handleDeleteClick = (id: number) => {
      setItemToDelete(id);
      setActiveMenuId(null);
      setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
      if (itemToDelete) {
          setCertifications(certifications.filter(c => c.id !== itemToDelete));
          setShowDeleteConfirm(false);
          setItemToDelete(null);
      }
  };

  const handleSaveCertification = () => {
    if (isEditing && currentEditId) {
        // Update existing
        const updatedCerts = certifications.map(cert => {
            if (cert.id === currentEditId) {
                return {
                    ...cert,
                    name: formData.name,
                    issuer: formData.issuer,
                    dateEarned: formData.dateEarned,
                    expirationDate: formData.expirationDate || undefined,
                    credentialId: formData.credentialId,
                    credentialUrl: formData.credentialUrl,
                    skills: formData.skills.split(',').map(s => s.trim()),
                    category: formData.category,
                    description: formData.description,
                    // Recalculate status based on expiration
                    status: formData.expirationDate && getDaysUntilExpiration(formData.expirationDate)! < 90 ? 'expiring-soon' : 'active'
                };
            }
            return cert;
        });
        setCertifications(updatedCerts as any);
    } else {
        // Add new
        const newCert = {
            id: Date.now(), // Use timestamp for unique ID in this mock
            name: formData.name,
            issuer: formData.issuer,
            dateEarned: formData.dateEarned,
            expirationDate: formData.expirationDate || undefined,
            credentialId: formData.credentialId,
            credentialUrl: formData.credentialUrl,
            skills: formData.skills.split(',').map(s => s.trim()),
            category: formData.category,
            status: 'active',
            verificationStatus: 'pending',
            description: formData.description
        };
        const updated = [newCert, ...certifications] as any;
        setCertifications(updated);
        
        // Update workflow
        const workflow = WorkflowTracking.getWorkflow('skill-development-advancement');
        if (workflow && workflow.isActive) {
            WorkflowTracking.updateStepStatus('skill-development-advancement', 'earn-certifications', 'completed', {
                certificationsEarned: updated.length,
                latestCertification: newCert.name
            });
            setShowWorkflowPrompt(true);
        }
    }
    setShowAddModal(false);
  };

  // Handle share
  const handleShare = (cert: any) => {
    setSelectedCertification(cert);
    setActiveMenuId(null);
    setShowShareModal(true);
  };

  // Handle verify
  const handleVerify = (cert: any) => {
    if (cert.credentialUrl) {
      window.open(cert.credentialUrl, '_blank');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Workflow Breadcrumb */}
      {workflowContext?.workflowId === 'skill-development-advancement' && (
        <WorkflowBreadcrumb
          workflowId="skill-development-advancement"
          currentFeaturePath="/dashboard/certifications"
        />
      )}

      {/* Workflow Prompt */}
      {showWorkflowPrompt && workflowContext && certifications.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full transform translate-x-12 -translate-y-12 blur-3xl"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <BadgeCheck className="w-6 h-6 text-emerald-300" />
                Certifications Milestone Reached!
              </h3>
              <p className="text-white/90 mb-4 max-w-2xl">You've successfully logged {certifications.length} certification{certifications.length !== 1 ? 's' : ''}. This significantly boosts your profile strength for potential roles.</p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    navigate('/dashboard/resume-studio');
                  }}
                  className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-sm"
                >
                  Update Resume
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowWorkflowPrompt(false)}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowWorkflowPrompt(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Total Certifications', val: totalCerts, icon: Award, color: 'indigo' },
                { label: 'Active Credentials', val: activeCerts, icon: CheckCircle2, color: 'emerald' },
                { label: 'Verified by Issuer', val: verifiedCerts, icon: BadgeCheck, color: 'blue' },
                { label: 'Expiring Soon', val: expiringCerts, icon: Clock, color: 'amber' },
            ].map((stat, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{stat.label}</div>
                        <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl group-hover:scale-110 transition-transform`}>
                            <stat.icon size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{stat.val}</div>
                </div>
            ))}
        </div>
      </div>

      {/* Controls: Search, Filter, Sort */}
      <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
             {/* Categories */}
             <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 scrollbar-hide">
                {certCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-neutral-900 text-white shadow-md'
                        : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
             </div>

             {/* Right Side Actions */}
             <div className="flex items-center gap-3 w-full md:w-auto p-1">
                {/* Search */}
                <div className="relative flex-1 md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search certifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50 focus:bg-white transition-all"
                    />
                </div>

                {/* Sort Dropdown (Simple) */}
                <div className="relative hidden md:block">
                     <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-slate-300 transition-colors"
                     >
                        {sortOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                     </select>
                     <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>

                {/* Add Button */}
                <button
                  onClick={handleOpenAddModal}
                  className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm items-center gap-2 transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
                
                {/* Mobile Add Button */}
                <button
                  onClick={handleOpenAddModal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all duration-300 shadow-md md:hidden"
                >
                  <Plus className="w-5 h-5" />
                </button>
             </div>
          </div>
          
          {/* Mobile Sort (Visible only on small screens) */}
          <div className="md:hidden">
            <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none"
            >
                {sortOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
            </select>
          </div>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCertifications.map((cert) => {
              const daysUntilExpiration = getDaysUntilExpiration(cert.expirationDate);
              const accentColor = cert.category === 'cloud' ? 'text-blue-600 bg-blue-50' : 
                                cert.category === 'development' ? 'text-purple-600 bg-purple-50' :
                                cert.category === 'data' ? 'text-green-600 bg-green-50' :
                                cert.category === 'security' ? 'text-red-600 bg-red-50' :
                                'text-orange-600 bg-orange-50';
              
              const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration < 90;
              const expirationPercentage = daysUntilExpiration !== null ? Math.max(0, Math.min(100, (daysUntilExpiration / 365) * 100)) : 100;

              return (
                <div
                  key={cert.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group flex flex-col h-full relative overflow-visible"
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-4 mb-4 relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${accentColor} border border-black/5 group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                      <Award className="w-7 h-7" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 leading-tight truncate pr-6 group-hover:text-indigo-600 transition-colors text-[15px]" title={cert.name}>
                            {cert.name}
                          </h3>
                          
                          {/* Action Menu Trigger */}
                          <div className="relative action-menu-container">
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === cert.id ? null : cert.id);
                                }}
                                className={`p-1 rounded-lg hover:bg-slate-100 transition-colors ${activeMenuId === cert.id ? 'bg-slate-100 text-indigo-600' : 'text-slate-400'}`}
                             >
                                <MoreHorizontal size={18} />
                             </button>
                             
                             {/* Dropdown Menu */}
                             {activeMenuId === cert.id && (
                                 <div className="absolute right-0 top-8 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                     <button 
                                        onClick={() => handleOpenEditModal(cert)}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                                     >
                                         <Edit2 className="w-3.5 h-3.5" />
                                         Edit Details
                                     </button>
                                     <button 
                                        onClick={() => handleShare(cert)}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                                     >
                                         <Share2 className="w-3.5 h-3.5" />
                                         Share
                                     </button>
                                     <div className="h-px bg-slate-100 my-1"></div>
                                     <button 
                                        onClick={() => handleDeleteClick(cert.id)}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                     >
                                         <Trash2 className="w-3.5 h-3.5" />
                                         Delete
                                     </button>
                                 </div>
                             )}
                          </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" />
                        {cert.issuer}
                      </p>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wide border ${getCertStatusColor(cert.status)}`}>
                        {cert.status === 'active' ? 'Active' : cert.status === 'expiring-soon' ? 'Expiring Soon' : 'Expired'}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                         {cert.verificationStatus === 'verified' ? <BadgeCheck className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3 text-amber-500" />}
                         {cert.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                      </span>
                  </div>

                  {/* Details Block & Expiration Bar */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-3 border border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Issued</span>
                          <span className="font-bold text-slate-700">{formatDate(cert.dateEarned)}</span>
                      </div>
                      
                      {/* Expiration Logic */}
                      {cert.expirationDate && daysUntilExpiration !== null && (
                          <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                  <span className="text-slate-500 font-medium">Expires</span>
                                  <span className={`font-bold ${isExpiringSoon ? 'text-amber-600' : 'text-slate-700'}`}>
                                      {formatDate(cert.expirationDate)}
                                  </span>
                              </div>
                              {/* Progress Bar for expiration */}
                              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${expirationPercentage}%` }}
                                  ></div>
                              </div>
                              {isExpiringSoon && (
                                  <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      {daysUntilExpiration} days remaining
                                  </p>
                              )}
                          </div>
                      )}
                      
                      <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">ID</span>
                          <span className="font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 select-all">{cert.credentialId}</span>
                      </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-auto">
                      <div className="flex flex-wrap gap-1.5 mb-5 h-12 overflow-hidden content-start">
                        {cert.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-md hover:border-slate-300 transition-colors cursor-default">
                            {skill}
                          </span>
                        ))}
                        {cert.skills.length > 4 && (
                          <span className="px-2 py-1 bg-slate-50 text-slate-400 border border-slate-100 text-[10px] font-bold rounded-md">
                            +{cert.skills.length - 4}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(cert)}
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-neutral-900 hover:border-slate-300 transition-all flex items-center justify-center gap-2 group/btn"
                          >
                            <span>Verify Credential</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover/btn:text-slate-600" />
                          </button>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredCertifications.length === 0 && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center animate-fade-in">
              <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Certifications Found</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                {searchQuery || selectedCategory !== 'all' 
                  ? "We couldn't find any certifications matching your current filters. Try adjusting your search keywords."
                  : "Start building your professional credentials by adding your first certification."}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </button>
            </div>
          )}
      </div>

      {/* Add/Edit Certification Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isEditing ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {isEditing ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Certification' : 'Add New Certification'}</h2>
                    <p className="text-xs text-slate-500 font-medium">Enter the details exactly as they appear on your certificate</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm bg-slate-50 focus:bg-white transition-all font-medium"
                    placeholder="e.g., AWS Solutions Architect - Professional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Issuing Organization *
                  </label>
                  <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.issuer}
                        onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm bg-slate-50 focus:bg-white transition-all font-medium"
                        placeholder="e.g., Amazon"
                      />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm bg-slate-50 focus:bg-white transition-colors font-medium text-slate-600"
                  >
                    <option value="cloud">Cloud Computing</option>
                    <option value="development">Software Development</option>
                    <option value="data">Data Science & Analytics</option>
                    <option value="security">Cybersecurity</option>
                    <option value="management">Project Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Date Earned *
                  </label>
                  <input
                    type="date"
                    value={formData.dateEarned}
                    onChange={(e) => setFormData({ ...formData, dateEarned: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm bg-slate-50 focus:bg-white transition-colors font-medium text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm bg-slate-50 focus:bg-white transition-colors font-medium text-slate-600"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Credential ID *
                  </label>
                  <input
                    type="text"
                    value={formData.credentialId}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm bg-slate-50 focus:bg-white transition-colors font-mono text-slate-600"
                    placeholder="e.g., AWS-123456"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                    Credential URL
                    </label>
                    <div className="relative">
                        <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                        type="url"
                        value={formData.credentialUrl}
                        onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm bg-slate-50 focus:bg-white transition-colors text-blue-600"
                        placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Associated Skills
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm bg-slate-50 focus:bg-white transition-colors"
                    placeholder="e.g., Cloud Architecture, AWS, System Design (comma separated)"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Separate multiple skills with commas</p>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm bg-slate-50 focus:bg-white transition-colors resize-none"
                    placeholder="Briefly describe what this certification validates..."
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3 rounded-b-2xl z-10">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCertification}
                disabled={!formData.name || !formData.issuer || !formData.dateEarned || !formData.credentialId}
                className="flex-1 bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neutral-900/20 flex items-center justify-center gap-2"
              >
                {isEditing ? (
                    <>
                        <Check className="w-4 h-4" />
                        Save Changes
                    </>
                ) : (
                    <>
                        <Plus className="w-4 h-4" />
                        Add Certification
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up text-center">
                  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Certification?</h3>
                  <p className="text-sm text-slate-500 mb-6">
                      Are you sure you want to delete this certification? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmDelete}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 font-bold text-sm text-white hover:bg-red-700 shadow-lg shadow-red-200"
                      >
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedCertification && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Share2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Share Certificate</h2>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-slate-900 mb-1">{selectedCertification.name}</h3>
                <p className="text-sm text-slate-500">{selectedCertification.issuer}</p>
              </div>

              <div className="space-y-3">
                <button className="w-full p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                     <span className="block font-bold text-sm text-slate-900">Share on LinkedIn</span>
                     <span className="block text-xs text-slate-500">Post to your feed</span>
                  </div>
                </button>
                
                <button className="w-full p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ExternalLink className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-left">
                     <span className="block font-bold text-sm text-slate-900">Copy Verification Link</span>
                     <span className="block text-xs text-slate-500">Copy to clipboard</span>
                  </div>
                </button>

                <button className="w-full p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Download className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                     <span className="block font-bold text-sm text-slate-900">Download Record</span>
                     <span className="block text-xs text-slate-500">Save as PDF</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Export Wrapper ---

const CertificationsModule = () => {
    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Certifications />
        </div>
    );
};

export default CertificationsModule;
