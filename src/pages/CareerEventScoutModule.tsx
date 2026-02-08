import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Star, 
  UserPlus, 
  Lightbulb, 
  Search, 
  Filter, 
  ChevronDown, 
  MapPin, 
  DollarSign, 
  ArrowRight, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  BarChart3, 
  RefreshCw, 
  Clock, 
  Video, 
  Users, 
  Target, 
  Linkedin, 
  Twitter, 
  Github, 
  Mail, 
  MessageSquare, 
  Check, 
  ChevronUp, 
  ExternalLink, 
  TrendingUp, 
  Heart, 
  Quote, 
  MessageCircle, 
  Zap, 
  BrainCircuit, 
  X, 
  ClipboardList, 
  Sparkles 
} from 'lucide-react';

// --- Mocks & Utilities ---

const useNavigate = () => (path: string) => console.log("Navigating to", path);

const WorkflowTracking = {
    _context: { workflowId: 'market-intelligence-career-strategy' },
    getWorkflow: (id: string) => {
        return { steps: [{id: 'analyze-market-trends', status: 'not-started'}], isActive: true, progress: 30 };
    },
    updateStepStatus: (workflowId: string, stepId: string, status: string, data?: any) => {
        console.log(`Workflow ${workflowId} step ${stepId} updated to ${status}`, data);
    },
    getWorkflowContext: () => WorkflowTracking._context,
    setWorkflowContext: (context: any) => {
        console.log('Workflow Context Set:', context);
        WorkflowTracking._context = { ...WorkflowTracking._context, ...context };
    }
};

// --- Interfaces ---

interface CareerEvent {
  id: number;
  title: string;
  type: string;
  date: string;
  location: string;
  isVirtual: boolean;
  description: string;
  attendees: number;
  speakers: string[];
  relevanceScore: number;
  industry: string;
  skills: string[];
  url: string;
  price: string;
  isBookmarked: boolean;
}

interface RoleModel {
  id: number;
  name: string;
  title: string;
  company: string;
  industry: string;
  followersCount: number;
  engagementRate: number;
  contentThemes: string[];
  recentPosts: {
    id: number;
    text: string;
    platform: string;
    date: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    isTrending: boolean;
    preview: string;
  }[];
  postingFrequency: string;
  averageEngagement: number;
  linkedinUrl: string;
  twitterUrl: string;
  isFollowing: boolean;
  influenceScore: number;
  topSkills: string[];
  achievements: string[];
  whyFollow: string;
  mutualConnections: number;
  sharedInterests: string[];
}

interface NetworkingOpportunity {
  id: number;
  type: string;
  name: string;
  title: string;
  company: string;
  mutualConnections: number;
  relevanceScore: number;
  contactInfo: string;
  suggestedApproach: string;
  eventContext: string;
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  lastContactDate: string | null;
  nextFollowUp: string | null;
}

interface Insight {
    id: string;
    category: string;
    type: 'event' | 'networking' | 'skill' | 'general';
    icon: any;
    color: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    reasoning: string;
    confidence: number;
    actionText: string;
}

// --- Mock Data ---

const careerEventsData: CareerEvent[] = [
  {
    id: 1,
    title: 'React Conf 2024',
    type: 'Conference',
    date: '2024-03-15',
    location: 'San Francisco, CA',
    isVirtual: false,
    description: 'The premier React conference featuring the latest in React development',
    attendees: 2500,
    speakers: ['Dan Abramov', 'Sophie Alpert', 'Andrew Clark'],
    relevanceScore: 95,
    industry: 'Technology',
    skills: ['React', 'JavaScript', 'Frontend'],
    url: 'https://reactconf.com',
    price: '$299',
    isBookmarked: false
  },
  {
    id: 2,
    title: 'AI in Healthcare Workshop',
    type: 'Workshop',
    date: '2024-03-20',
    location: 'Virtual',
    isVirtual: true,
    description: 'Hands-on workshop on implementing AI solutions in healthcare',
    attendees: 150,
    speakers: ['Dr. Sarah Chen', 'Prof. Michael Rodriguez'],
    relevanceScore: 88,
    industry: 'Healthcare',
    skills: ['AI', 'Machine Learning', 'Healthcare'],
    url: 'https://ai-healthcare-workshop.com',
    price: 'Free',
    isBookmarked: true
  },
  {
    id: 3,
    title: 'Tech Networking Mixer',
    type: 'Networking',
    date: '2024-03-25',
    location: 'New York, NY',
    isVirtual: false,
    description: 'Connect with fellow tech professionals and industry leaders',
    attendees: 300,
    speakers: ['John Smith', 'Jane Doe'],
    relevanceScore: 82,
    industry: 'Technology',
    skills: ['Networking', 'Career Development'],
    url: 'https://tech-mixer.com',
    price: '$50',
    isBookmarked: false
  },
  {
    id: 4,
    title: 'Cloud Architecture Summit',
    type: 'Conference',
    date: '2024-04-10',
    location: 'Seattle, WA',
    isVirtual: false,
    description: 'Deep dive into modern cloud architecture patterns and best practices',
    attendees: 1800,
    speakers: ['Werner Vogels', 'Kelsey Hightower'],
    relevanceScore: 91,
    industry: 'Technology',
    skills: ['Cloud', 'AWS', 'Architecture'],
    url: 'https://cloudsummit.com',
    price: '$399',
    isBookmarked: false
  },
  {
    id: 5,
    title: 'UX Design Webinar Series',
    type: 'Webinar',
    date: '2024-04-05',
    location: 'Virtual',
    isVirtual: true,
    description: 'Weekly webinar series covering UX design principles and tools',
    attendees: 500,
    speakers: ['Julie Zhuo', 'Don Norman'],
    relevanceScore: 76,
    industry: 'Design',
    skills: ['UX', 'Design', 'User Research'],
    url: 'https://uxwebinar.com',
    price: 'Free',
    isBookmarked: false
  }
];

const roleModelsData: RoleModel[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Software Engineer',
    company: 'Google',
    industry: 'Technology',
    followersCount: 12500,
    engagementRate: 8.5,
    contentThemes: ['React', 'Career Growth', 'Diversity'],
    recentPosts: [
      {
        id: 1,
        text: 'Just shipped a new feature at Google! Excited to share how we optimized React performance by 40%.',
        platform: 'LinkedIn',
        date: '2 days ago',
        likes: 1240,
        comments: 89,
        shares: 156,
        views: 8500,
        isTrending: true,
        preview: 'We just shipped a major performance improvement to our React application...'
      },
      {
        id: 2,
        text: 'Tips for junior developers: Focus on fundamentals, build projects, and don\'t be afraid to ask questions.',
        platform: 'Twitter',
        date: '5 days ago',
        likes: 890,
        comments: 45,
        shares: 120,
        views: 12000,
        isTrending: false,
        preview: 'Here are 5 tips that helped me grow as a developer...'
      }
    ],
    postingFrequency: '3-4 posts/week',
    averageEngagement: 8.5,
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    twitterUrl: 'https://twitter.com/sarahjohnson',
    isFollowing: true,
    influenceScore: 92,
    topSkills: ['React', 'TypeScript', 'System Design', 'Mentoring', 'Open Source'],
    achievements: [
      'Open source contributor with 5k+ GitHub stars',
      'Speaker at React Conf 2023',
      'Mentored 50+ junior developers'
    ],
    whyFollow: 'Sarah shares practical React tips and career advice for developers.',
    mutualConnections: 12,
    sharedInterests: ['React', 'Open Source', 'Career Development', 'System Design']
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'VP of Engineering',
    company: 'Stripe',
    industry: 'Fintech',
    followersCount: 8500,
    engagementRate: 7.2,
    contentThemes: ['Leadership', 'Engineering', 'Startups'],
    recentPosts: [
      {
        id: 1,
        text: 'Building great engineering teams requires trust, clear communication, and a culture of continuous learning.',
        platform: 'LinkedIn',
        date: '1 day ago',
        likes: 2100,
        comments: 234,
        shares: 312,
        views: 12000,
        isTrending: true,
        preview: 'After scaling teams from 10 to 200+ engineers, I\'ve learned...'
      }
    ],
    postingFrequency: '2-3 posts/week',
    averageEngagement: 7.2,
    linkedinUrl: 'https://linkedin.com/in/michaelchen',
    twitterUrl: 'https://twitter.com/michaelchen',
    isFollowing: false,
    influenceScore: 88,
    topSkills: ['Engineering Leadership', 'Team Building', 'Scalable Systems', 'Product Strategy'],
    achievements: [
      'Scaled engineering team from 10 to 200+ engineers',
      'Built payment infrastructure handling $100B+ annually'
    ],
    whyFollow: 'Michael provides deep insights into engineering leadership and scaling teams.',
    mutualConnections: 8,
    sharedInterests: ['Engineering Leadership', 'Team Building', 'Scalable Systems']
  }
];

const networkingOpportunitiesData: NetworkingOpportunity[] = [
  {
    id: 1,
    type: 'Event Attendee',
    name: 'Alex Rodriguez',
    title: 'Product Manager',
    company: 'Microsoft',
    mutualConnections: 3,
    relevanceScore: 85,
    contactInfo: 'alex.rodriguez@microsoft.com',
    suggestedApproach: 'Mention your shared interest in React and ask about their experience at Microsoft',
    eventContext: 'React Conf 2024',
    linkedin: 'https://linkedin.com/in/alexrodriguez',
    twitter: 'https://twitter.com/alexrodriguez',
    github: null,
    lastContactDate: null,
    nextFollowUp: null
  },
  {
    id: 2,
    type: 'Speaker',
    name: 'Dr. Lisa Wang',
    title: 'AI Research Director',
    company: 'OpenAI',
    mutualConnections: 1,
    relevanceScore: 92,
    contactInfo: 'lisa.wang@openai.com',
    suggestedApproach: 'Reference their recent research paper and ask about future AI trends',
    eventContext: 'AI in Healthcare Workshop',
    linkedin: 'https://linkedin.com/in/lisawang',
    twitter: 'https://twitter.com/lisawang',
    github: 'https://github.com/lisawang',
    lastContactDate: '2024-01-15',
    nextFollowUp: '2024-02-15'
  },
  {
    id: 3,
    type: 'Organizer',
    name: 'Sarah Chen',
    title: 'Engineering Manager',
    company: 'Google',
    mutualConnections: 7,
    relevanceScore: 88,
    contactInfo: 'sarah.chen@google.com',
    suggestedApproach: 'Discuss the event organization and ask about upcoming tech conferences',
    eventContext: 'Tech Leadership Summit 2024',
    linkedin: 'https://linkedin.com/in/sarahchen',
    twitter: null,
    github: null,
    lastContactDate: '2024-01-10',
    nextFollowUp: null
  },
  {
    id: 4,
    type: 'Event Attendee',
    name: 'Michael Johnson',
    title: 'Senior Software Engineer',
    company: 'Amazon',
    mutualConnections: 2,
    relevanceScore: 75,
    contactInfo: 'michael.j@amazon.com',
    suggestedApproach: 'Connect over shared experience at the conference and discuss cloud architecture',
    eventContext: 'AWS re:Invent 2024',
    linkedin: 'https://linkedin.com/in/michaeljohnson',
    twitter: 'https://twitter.com/michaelj',
    github: 'https://github.com/michaelj',
    lastContactDate: null,
    nextFollowUp: null
  },
  {
    id: 5,
    type: 'Speaker',
    name: 'Emily Davis',
    title: 'VP of Engineering',
    company: 'Netflix',
    mutualConnections: 5,
    relevanceScore: 95,
    contactInfo: 'emily.davis@netflix.com',
    suggestedApproach: 'Reference their talk on scalable systems and ask for career advice',
    eventContext: 'ScaleConf 2024',
    linkedin: 'https://linkedin.com/in/emilydavis',
    twitter: 'https://twitter.com/emilydavis',
    github: null,
    lastContactDate: '2024-01-20',
    nextFollowUp: '2024-02-20'
  }
];

// --- Helpers ---

const getRelevanceColor = (score: number) => {
  if (score >= 90) return 'text-emerald-600 bg-emerald-100 border-emerald-200';
  if (score >= 80) return 'text-blue-600 bg-blue-100 border-blue-200';
  if (score >= 70) return 'text-amber-600 bg-amber-100 border-amber-200';
  return 'text-red-600 bg-red-100 border-red-200';
};

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'Conference': return <Users className="w-5 h-5" />;
    case 'Workshop': return <Target className="w-5 h-5" />;
    case 'Networking': return <UserPlus className="w-5 h-5" />;
    case 'Webinar': return <Video className="w-5 h-5" />;
    case 'Meetup': return <Users className="w-5 h-5" />;
    default: return <Calendar className="w-5 h-5" />;
  }
};

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'Conference': return 'text-purple-600 bg-purple-100 border-purple-200';
    case 'Workshop': return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'Networking': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
    case 'Webinar': return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'Meetup': return 'text-pink-600 bg-pink-100 border-pink-200';
    default: return 'text-slate-600 bg-slate-100 border-slate-200';
  }
};

const getContactTypeColor = (type: string) => {
  switch (type) {
    case 'Speaker': return 'text-purple-600 bg-purple-100';
    case 'Organizer': return 'text-emerald-600 bg-emerald-100';
    case 'Event Attendee': return 'text-blue-600 bg-blue-100';
    case 'Sponsor': return 'text-amber-600 bg-amber-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarGradient = (name: string) => {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const getDaysAway = (dateStr: string) => {
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return "Past Event";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
};

// --- Mock UI Components ---

const WorkflowBreadcrumb = ({ workflowId }: any) => (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4 text-xs font-medium text-slate-500 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Active Workflow</span>
        <span>Market Strategy</span>
        <ChevronRight size={12} className="text-slate-400"/>
        <span className="text-neutral-900 font-bold">Market Analysis</span>
    </div>
);
const WorkflowQuickActions = (_props: any) => null;
const WorkflowTransition = (_props: any) => null;
const WorkflowPrompt = ({ message, actionText, onDismiss, onAction }: any) => (
    <div className="bg-indigo-600 text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-600/20 mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full"><Sparkles size={20}/></div>
            <span className="font-bold text-sm">{message}</span>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onAction('continue')} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-50 transition-colors">{actionText}</button>
            <button onClick={onDismiss} className="text-white/60 hover:text-white p-1"><X size={18}/></button>
        </div>
    </div>
);
const ChevronRight = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>;


// --- Main Components ---

const SpeakerAvatars = ({ speakers }: { speakers: string[] }) => (
  <div className="flex items-center gap-2">
    <div className="flex -space-x-2 overflow-hidden">
        {speakers.slice(0, 3).map((speaker, i) => (
        <div key={i} className={`inline-flex h-7 w-7 rounded-full ring-2 ring-white bg-gradient-to-br ${getAvatarGradient(speaker)} items-center justify-center text-[9px] font-bold text-white shadow-sm`} title={speaker}>
            {getInitials(speaker)}
        </div>
        ))}
        {speakers.length > 3 && (
            <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm">
                +{speakers.length - 3}
            </div>
        )}
    </div>
    <span className="text-xs text-slate-500 font-medium">{speakers.length} Speakers</span>
  </div>
);

const CareerEventScout = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
   
  // Workflow state
  const [workflowContext, setWorkflowContext] = useState<any>(null);
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);
   
  // Events state
  const [events, setEvents] = useState(careerEventsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [sortBy, setSortBy] = useState('relevance'); 
   
  // Role Models state
  const [roleModels, setRoleModels] = useState(roleModelsData);
  const [roleModelSearch, setRoleModelSearch] = useState('');
  const [roleModelFilterIndustry, setRoleModelFilterIndustry] = useState('all');
  const [roleModelSortBy, setRoleModelSortBy] = useState('influence');
  const [following, setFollowing] = useState<number[]>([1]);
   
  // Networking state
  const [networkingOpportunities, setNetworkingOpportunities] = useState(networkingOpportunitiesData);
  const [networkingSearch, setNetworkingSearch] = useState('');
  const [networkingFilterType, setNetworkingFilterType] = useState('all');
  const [networkingSortBy, setNetworkingSortBy] = useState('relevance');
  const [networkingNotes, setNetworkingNotes] = useState<Record<number, string>>({});
  const [expandedContact, setExpandedContact] = useState<number | null>(null);

  // Insights State
  const [insightFilter, setInsightFilter] = useState('all');
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  // Check for workflow context on mount
  useEffect(() => {
    const context = WorkflowTracking.getWorkflowContext();
    if (context?.workflowId === 'market-intelligence-career-strategy') {
      setWorkflowContext(context);
       
      // Mark step as in-progress
      const workflow = WorkflowTracking.getWorkflow('market-intelligence-career-strategy');
      if (workflow) {
        const analyzeStep = workflow.steps.find((s: any) => s.id === 'analyze-market-trends');
        if (analyzeStep && analyzeStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('market-intelligence-career-strategy', 'analyze-market-trends', 'in-progress');
        }
      }
    }
  }, []);

  // Track when user bookmarks events or follows role models (market analysis activity)
  useEffect(() => {
    if (workflowContext?.workflowId === 'market-intelligence-career-strategy') {
      const hasBookmarkedEvents = events.some(e => e.isBookmarked);
      const hasFollowedModels = following.length > 0;
       
      if (hasBookmarkedEvents || hasFollowedModels) {
        // Mark step as completed when user engages with market intelligence
        WorkflowTracking.updateStepStatus('market-intelligence-career-strategy', 'analyze-market-trends', 'completed', {
          eventsBookmarked: events.filter(e => e.isBookmarked).length,
          roleModelsFollowed: following.length,
          marketInsights: {
            trendingSkills: events.flatMap(e => e.skills).filter((v, i, a) => a.indexOf(v) === i).slice(0, 10),
            industries: events.map(e => e.industry).filter((v, i, a) => a.indexOf(v) === i)
          }
        });
        
        // Store market intelligence data in workflow context
        WorkflowTracking.setWorkflowContext({
          workflowId: 'market-intelligence-career-strategy',
          marketTrends: {
            eventsBookmarked: events.filter(e => e.isBookmarked),
            roleModelsFollowed: roleModels.filter(m => following.includes(m.id)),
            trendingSkills: events.flatMap(e => e.skills).filter((v, i, a) => a.indexOf(v) === i).slice(0, 10),
            industries: events.map(e => e.industry).filter((v, i, a) => a.indexOf(v) === i)
          },
          action: 'benchmark-skills-market'
        });
        
        setShowWorkflowPrompt(true);
      }
    }
  }, [events, following, workflowContext]);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || event.type.toLowerCase() === filterType.toLowerCase();
    const matchesLocation = filterLocation === 'all' || 
                           (filterLocation === 'virtual' && event.isVirtual) ||
                           (filterLocation === 'in-person' && !event.isVirtual);
    return matchesSearch && matchesType && matchesLocation;
  }).sort((a, b) => {
    if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return b.relevanceScore - a.relevanceScore;
  });

  // Filter role models
  const filteredRoleModels = roleModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(roleModelSearch.toLowerCase()) ||
                          model.company.toLowerCase().includes(roleModelSearch.toLowerCase()) ||
                          model.title.toLowerCase().includes(roleModelSearch.toLowerCase());
    const matchesIndustry = roleModelFilterIndustry === 'all' || 
                            model.industry.toLowerCase() === roleModelFilterIndustry.toLowerCase();
    return matchesSearch && matchesIndustry;
  }).sort((a, b) => {
      if (roleModelSortBy === 'followers') return b.followersCount - a.followersCount;
      if (roleModelSortBy === 'engagement') return b.engagementRate - a.engagementRate;
      return b.influenceScore - a.influenceScore;
  });

  // Filter networking opportunities
  const filteredNetworking = networkingOpportunities.filter(opp => {
    const matchesSearch = opp.name.toLowerCase().includes(networkingSearch.toLowerCase()) ||
                          opp.company.toLowerCase().includes(networkingSearch.toLowerCase()) ||
                          opp.title.toLowerCase().includes(networkingSearch.toLowerCase());
    const matchesType = networkingFilterType === 'all' || 
                        opp.type.toLowerCase() === networkingFilterType.toLowerCase();
    return matchesSearch && matchesType;
  }).sort((a, b) => {
      if (networkingSortBy === 'mutuals') return b.mutualConnections - a.mutualConnections;
      if (networkingSortBy === 'recent') {
         if (!a.lastContactDate) return 1;
         if (!b.lastContactDate) return -1;
         return new Date(b.lastContactDate).getTime() - new Date(a.lastContactDate).getTime();
      }
      return b.relevanceScore - a.relevanceScore;
  });

  const handleBookmark = (eventId: number) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, isBookmarked: !e.isBookmarked } : e
    ));
  };

  const handleFollow = (roleModelId: number) => {
    setFollowing(prev => 
      prev.includes(roleModelId) 
        ? prev.filter(id => id !== roleModelId)
        : [...prev, roleModelId]
    );
  };

  const handleDismissInsight = (id: string) => {
      setDismissedInsights(prev => [...prev, id]);
  };

  const tabs = [
    { id: 'events', label: 'Career Events', icon: Calendar },
    { id: 'role-models', label: 'Role Models', icon: Star },
    { id: 'networking', label: 'Networking', icon: UserPlus },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb }
  ];

  const bookmarkedEvents = events.filter(e => e.isBookmarked);
  const uniqueIndustries = [...new Set(roleModels.map(m => m.industry))];

  // Generate AI insights
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
     
    if (bookmarkedEvents.length > 0) {
      const topEvent = bookmarkedEvents.sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
      const eventDate = new Date(topEvent.date);
      const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil > 0 && daysUntil <= 30) {
        insights.push({
          id: 'event-reminder',
          category: 'Event Recommendation',
          type: 'event',
          icon: Calendar,
          color: 'blue',
          priority: 'high',
          title: `Upcoming Event: ${topEvent.title}`,
          message: `${topEvent.title} is in ${daysUntil} days. With a ${topEvent.relevanceScore}% relevance score, this ${topEvent.type.toLowerCase()} aligns perfectly with your interests in ${topEvent.skills.slice(0, 2).join(' and ')}.`,
          reasoning: `Based on your interest in ${topEvent.industry}`,
          confidence: topEvent.relevanceScore,
          actionText: 'View Event'
        });
      }
    }

    const highRelevanceContacts = filteredNetworking.filter(opp => opp.relevanceScore >= 85).slice(0, 3);
    if (highRelevanceContacts.length > 0) {
      const topContact = highRelevanceContacts[0];
      insights.push({
        id: 'networking-opportunity',
        category: 'Networking Strategy',
        type: 'networking',
        icon: UserPlus,
        color: 'emerald',
        priority: 'high',
        title: `High-Value Connection: ${topContact.name}`,
        message: `${topContact.name} (${topContact.title} at ${topContact.company}) has a ${topContact.relevanceScore}% relevance score. ${topContact.mutualConnections > 0 ? `You have ${topContact.mutualConnections} mutual connections.` : ''}`,
        reasoning: `Identified from ${topContact.eventContext} attendees`,
        confidence: topContact.relevanceScore,
        actionText: 'View Contact'
      });
    }

    const followedModels = roleModels.filter(m => following.includes(m.id));
    if (followedModels.length > 0) {
      const topModel = followedModels.sort((a, b) => b.influenceScore - a.influenceScore)[0];
      insights.push({
        id: 'role-model-learning',
        category: 'Skill Development',
        type: 'skill',
        icon: Target,
        color: 'purple',
        priority: 'medium',
        title: `Learn from ${topModel.name}`,
        message: `You're following ${topModel.name} who excels in ${topModel.topSkills.slice(0, 2).join(' and ')}. Engaging with their content could accelerate your learning.`,
        reasoning: `Matched with your interest in ${topModel.industry}`,
        confidence: topModel.influenceScore,
        actionText: 'View Profile'
      });
    }

    // Skill trends insight
    const allSkills = events.flatMap(e => e.skills);
    const skillFrequency: Record<string, number> = {};
    allSkills.forEach(skill => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });
    const topSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill);

    if (topSkills.length > 0) {
      insights.push({
        id: 'skill-trend',
        category: 'Industry Trends',
        type: 'skill',
        icon: TrendingUp,
        color: 'amber',
        priority: 'medium',
        title: `Trending Skills: ${topSkills.join(', ')}`,
        message: `Based on the events you're exploring, ${topSkills.join(', ')} are appearing frequently. These skills are in high demand.`,
        reasoning: `Analyzed from ${events.length} available events`,
        confidence: 75,
        actionText: 'Explore Events'
      });
    }

    return insights.filter(i => !dismissedInsights.includes(i.id));
  };

  const insights = generateInsights();
   
  const filteredInsights = insights.filter(i => {
      if (insightFilter === 'all') return true;
      return i.type === insightFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
       
      {/* Workflow Breadcrumb - Workflow 7 */}
      {workflowContext?.workflowId === 'market-intelligence-career-strategy' && (
        <WorkflowBreadcrumb
          workflowId="market-intelligence-career-strategy"
          currentFeaturePath="/dashboard/career-event-scout"
        />
      )}

      {/* Workflow Quick Actions - Workflow 7 */}
      {workflowContext?.workflowId === 'market-intelligence-career-strategy' && (
        <WorkflowQuickActions
          workflowId="market-intelligence-career-strategy"
          currentFeaturePath="/dashboard/career-event-scout"
        />
      )}

      {/* Workflow Transition - Workflow 7 (after market analysis) */}
      {workflowContext?.workflowId === 'market-intelligence-career-strategy' && (events.some(e => e.isBookmarked) || following.length > 0) && (
        <WorkflowTransition
          workflowId="market-intelligence-career-strategy"
          currentFeaturePath="/dashboard/career-event-scout"
          compact={true}
        />
      )}

      {/* Workflow Prompt - Workflow 7 */}
      {showWorkflowPrompt && workflowContext?.workflowId === 'market-intelligence-career-strategy' && (events.some(e => e.isBookmarked) || following.length > 0) && (
        <WorkflowPrompt
          workflowId="market-intelligence-career-strategy"
          currentFeaturePath="/dashboard/career-event-scout"
          message="✅ Market Trends Analyzed! You've bookmarked events and followed role models. Ready to benchmark your skills against the market?"
          actionText="Benchmark Skills"
          actionUrl="/dashboard/benchmarking"
          onDismiss={() => setShowWorkflowPrompt(false)}
          onAction={(action: string) => {
            if (action === 'continue') {
              WorkflowTracking.setWorkflowContext({
                workflowId: 'market-intelligence-career-strategy',
                marketTrends: {
                  eventsBookmarked: events.filter(e => e.isBookmarked),
                  roleModelsFollowed: roleModels.filter(m => following.includes(m.id)),
                  trendingSkills: events.flatMap(e => e.skills).filter((v, i, a) => a.indexOf(v) === i).slice(0, 10),
                  industries: events.map(e => e.industry).filter((v, i, a) => a.indexOf(v) === i)
                },
                action: 'benchmark-skills-market'
              });
            }
          }}
        />
      )}
       
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Career Event Scout</h1>
          <p className="text-slate-500 mt-1">Discover events, role models, and networking opportunities curated for you.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-white border border-slate-200 text-indigo-700 rounded-xl text-sm font-bold shadow-sm">
            {bookmarkedEvents.length} Bookmarked
          </span>
          <span className="px-4 py-2 bg-white border border-slate-200 text-emerald-700 rounded-xl text-sm font-bold shadow-sm">
            {following.length} Following
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm inline-flex w-full md:w-auto">
        <div className="flex gap-1 w-full md:w-auto overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-neutral-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
             
            {/* Event Scout Hero Banner */}
            <div className="bg-neutral-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner shrink-0">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">Smart Event Discovery</h2>
                    <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
                      We've curated <span className="text-white font-bold">{events.length} events</span> based on your profile. There are <span className="text-white font-bold">{events.filter(e => e.relevanceScore >= 90).length} high-impact opportunities</span> matching your skills.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 self-end sm:self-start">
                  <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 shadow-sm flex items-center gap-2">
                    <Sparkles size={12} className="fill-yellow-400 text-yellow-400" /> {events.filter(e => e.relevanceScore >= 90).length} Top Matches
                  </span>
                  <button className="text-[10px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                    <RefreshCw size={10} /> Updated today
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, skills, or topics..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900 placeholder-slate-400 font-medium transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="relative min-w-[160px] flex-1">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <option value="all">All Types</option>
                      <option value="conference">Conferences</option>
                      <option value="workshop">Workshops</option>
                      <option value="networking">Networking</option>
                      <option value="webinar">Webinars</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                   
                  <div className="relative min-w-[160px] flex-1">
                    <select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <option value="all">All Locations</option>
                      <option value="virtual">Virtual Only</option>
                      <option value="in-person">In-Person Only</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative min-w-[160px] flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter className="w-4 h-4 text-slate-400" />
                      </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full appearance-none pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <option value="relevance">Sort by Relevance</option>
                      <option value="date">Sort by Date</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Events List */}
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative z-10">
                    <div className="flex-1 min-w-0">
                        {/* Meta Header */}
                        <div className="flex items-center gap-3 mb-3">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getAvatarGradient(event.title)} text-white shadow-sm shrink-0`}>
                                {getEventTypeIcon(event.type)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                     <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getEventTypeColor(event.type)} bg-opacity-50`}>
                                        {event.type}
                                     </span>
                                     {event.isVirtual && (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                                            <Video size={10} /> Virtual
                                        </span>
                                     )}
                                </div>
                                <div className="text-xs font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                                    <Clock size={12} /> {getDaysAway(event.date)}
                                </div>
                            </div>
                            {event.relevanceScore >= 90 && (
                                <div className="ml-auto sm:ml-0 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-200 shadow-sm">
                                    <Sparkles size={12} /> {event.relevanceScore}% Match
                                </div>
                            )}
                        </div>

                        {/* Title & Desc */}
                        <h3 className="text-xl font-bold text-neutral-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                        <p className="text-slate-600 mb-4 text-sm leading-relaxed line-clamp-2">{event.description}</p>
                         
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 mb-5 text-sm">
                             <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {event.date}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="truncate">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <DollarSign className="w-4 h-4 text-slate-400" />
                                {event.price}
                            </div>
                        </div>

                        {/* Footer: Speakers & Skills */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                             <SpeakerAvatars speakers={event.speakers} />
                             
                             <div className="flex gap-1 flex-wrap">
                                {event.skills.slice(0, 3).map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200">
                                        {skill}
                                    </span>
                                ))}
                             </div>
                        </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                        <button
                            className="flex-1 sm:flex-none px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-neutral-900/10 text-sm font-bold flex items-center justify-center gap-2 group/btn whitespace-nowrap"
                            onClick={() => window.open(event.url, '_blank')}
                        >
                             Register <ArrowRight className="w-4 h-4 group-hover/btn:-rotate-45 transition-transform" />
                        </button>
                         
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBookmark(event.id)}
                                className={`flex-1 sm:flex-none py-3 px-4 rounded-xl transition-all duration-200 shadow-sm border flex items-center justify-center gap-2 font-bold text-sm ${
                                event.isBookmarked
                                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                                    : 'bg-white border-slate-200 text-slate-500 hover:text-neutral-900 hover:border-slate-300'
                                }`}
                            >
                                {event.isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                                <span className="sm:hidden">Save</span>
                            </button>
                            <button
                                className="flex-1 sm:flex-none py-3 px-4 bg-white border border-slate-200 text-slate-500 rounded-xl hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm flex items-center justify-center gap-2 font-bold text-sm"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="sm:hidden">Share</span>
                            </button>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Bookmarked Events Widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                    <BookmarkCheck className="w-4 h-4" />
                </div>
                Saved Events
              </h3>
              {bookmarkedEvents.length > 0 ? (
                <div className="space-y-3">
                  {bookmarkedEvents.map((event) => (
                    <div key={event.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer group">
                      <h4 className="font-bold text-sm text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                        <span>{event.date}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="truncate max-w-[100px]">{event.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs font-medium">No events saved yet.</p>
                </div>
              )}
            </div>

            {/* Quick Stats Widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                    <BarChart3 className="w-4 h-4" />
                </div>
                Event Landscape
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center hover:border-slate-200 transition-colors">
                  <div className="text-2xl font-bold text-neutral-900">{events.length}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center hover:border-slate-200 transition-colors">
                  <div className="text-2xl font-bold text-emerald-600">{events.filter(e => e.isVirtual).length}</div>
                  <div className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-wider mt-1">Virtual</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center hover:border-slate-200 transition-colors">
                  <div className="text-2xl font-bold text-purple-600">{events.filter(e => e.type === 'Conference').length}</div>
                  <div className="text-[10px] font-bold text-purple-700/60 uppercase tracking-wider mt-1">Conf</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center hover:border-slate-200 transition-colors">
                  <div className="text-2xl font-bold text-amber-600">{bookmarkedEvents.length}</div>
                  <div className="text-[10px] font-bold text-amber-700/60 uppercase tracking-wider mt-1">Saved</div>
                </div>
              </div>
            </div>
            
            {/* Pro Tip Widget */}
            <div className="bg-gradient-to-br from-neutral-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span>Scout Tip</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Events with a match score over <span className="text-white font-bold">90%</span> are highly recommended for your specific skill set.
                </p>
                <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold transition-colors">
                    Filter Top Matches
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Models Tab */}
      {activeTab === 'role-models' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             
            {/* Role Models Hero Banner */}
            <div className="bg-neutral-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner shrink-0">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">Connect with Leaders</h2>
                    <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
                      Follow <span className="text-white font-bold">{roleModels.length} industry experts</span> shaping the future of technology. We've identified <span className="text-white font-bold">{roleModels.filter(m => m.influenceScore >= 90).length} top voices</span> with high relevance to your career path.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 self-end sm:self-start">
                  <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 shadow-sm flex items-center gap-2">
                    <Zap size={12} className="fill-yellow-400 text-yellow-400" /> {roleModels.filter(m => m.influenceScore >= 90).length} Top Voices
                  </span>
                  <button className="text-[10px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                    <RefreshCw size={10} /> Updated today
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={roleModelSearch}
                    onChange={(e) => setRoleModelSearch(e.target.value)}
                    placeholder="Search by name, company, or title..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900 placeholder-slate-400 font-medium transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="relative min-w-[200px] flex-1">
                    <select
                      value={roleModelFilterIndustry}
                      onChange={(e) => setRoleModelFilterIndustry(e.target.value)}
                      className="w-full appearance-none px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <option value="all">All Industries</option>
                      {uniqueIndustries.map((industry) => (
                        <option key={industry} value={industry.toLowerCase()}>{industry}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative min-w-[200px] flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter className="w-4 h-4 text-slate-400" />
                      </div>
                    <select
                      value={roleModelSortBy}
                      onChange={(e) => setRoleModelSortBy(e.target.value)}
                      className="w-full appearance-none pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <option value="influence">Sort by Influence</option>
                      <option value="followers">Sort by Followers</option>
                      <option value="engagement">Sort by Engagement</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Role Models List */}
            <div className="space-y-4">
              {filteredRoleModels.map((model) => {
                const isFollowing = following.includes(model.id);
                const latestPost = model.recentPosts[0];
                 
                return (
                  <div
                    key={model.id}
                    className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="relative z-10">
                        {/* Profile Header */}
                        <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradient(model.name)} flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0 ring-4 ring-white`}>
                                {getInitials(model.name)}
                            </div>
                             
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className="text-xl font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">{model.name}</h3>
                                            {model.influenceScore >= 90 && (
                                                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wide rounded-full flex items-center gap-1 border border-purple-200">
                                                    <Zap size={12} /> Top Voice
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 font-medium text-sm">{model.title} at <span className="text-slate-900 font-bold">{model.company}</span></p>
                                    </div>
                                     
                                    <button
                                        onClick={() => handleFollow(model.id)}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap w-full sm:w-auto ${
                                        isFollowing
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-neutral-900 text-white hover:bg-slate-800 hover:scale-105'
                                        }`}
                                    >
                                        {isFollowing ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Users size={12}/> Followers</div>
                                <div className="text-lg font-bold text-slate-900">{formatNumber(model.followersCount)}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={12}/> Engagement</div>
                                <div className="text-lg font-bold text-emerald-600">{model.engagementRate}%</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Star size={12}/> Impact</div>
                                <div className="text-lg font-bold text-purple-600">{model.influenceScore}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><UserPlus size={12}/> Mutuals</div>
                                <div className="text-lg font-bold text-blue-600">{model.mutualConnections}</div>
                            </div>
                        </div>

                        {/* Content & Context */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Expertise & Themes</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {model.contentThemes.map((theme) => (
                                        <span key={theme} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg font-bold shadow-sm">
                                            {theme}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{model.whyFollow}</p>
                            </div>

                            {latestPost && (
                                <div className="relative group/post">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-hover/post:opacity-40 transition duration-200 blur"></div>
                                    <div className="relative p-4 bg-white rounded-xl border border-slate-200 h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {latestPost.platform === 'LinkedIn' ? (
                                                    <div className="p-1 bg-[#0077b5] rounded text-white"><Linkedin size={12} fill="currentColor" /></div>
                                                ) : (
                                                    <div className="p-1 bg-[#1DA1F2] rounded text-white"><Twitter size={12} fill="currentColor" /></div>
                                                )}
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Post</span>
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400">{latestPost.date}</span>
                                        </div>
                                        <div className="flex gap-2 mb-3">
                                            <Quote className="w-4 h-4 text-indigo-300 shrink-0 fill-indigo-100" />
                                            <p className="text-slate-700 text-sm italic leading-relaxed line-clamp-3">{latestPost.text}</p>
                                        </div>
                                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                                            <div className="flex gap-3">
                                                <span className="flex items-center gap-1 hover:text-rose-500 transition-colors"><Heart size={12} /> {formatNumber(latestPost.likes)}</span>
                                                <span className="flex items-center gap-1 hover:text-blue-500 transition-colors"><MessageCircle size={12} /> {formatNumber(latestPost.comments)}</span>
                                            </div>
                                            <button className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                                Read more <ExternalLink size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <a
                                href={model.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-[#0077b5] hover:bg-[#0077b5]/10 rounded-lg transition-all"
                                title="View LinkedIn Profile"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a
                                href={model.twitterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 rounded-lg transition-all"
                                title="View Twitter Profile"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <div className="h-4 w-px bg-slate-200 mx-1"></div>
                            <span className="text-xs font-bold text-slate-400">
                                {model.mutualConnections > 0 ? `${model.mutualConnections} mutual connections` : 'No mutuals yet'}
                            </span>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Following */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                    <Heart className="w-4 h-4" />
                </div>
                Following ({following.length})
              </h3>
              {following.length > 0 ? (
                <div className="space-y-3">
                  {roleModels.filter(m => following.includes(m.id)).map((model) => (
                    <div key={model.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer group">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(model.name)} flex items-center justify-center text-white font-bold text-xs group-hover:scale-110 transition-transform`}>
                        {getInitials(model.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-sm truncate">{model.name}</div>
                        <div className="text-xs text-slate-500 truncate">{model.company}</div>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <UserPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs font-medium">Start following experts.</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                    <BarChart3 className="w-4 h-4" />
                </div>
                Network Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 text-sm font-medium">Role Models</span>
                  <span className="font-bold text-slate-900">{roleModels.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 text-sm font-medium">Following</span>
                  <span className="font-bold text-emerald-600">{following.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 text-sm font-medium">Avg Influence</span>
                  <span className="font-bold text-purple-600">
                    {Math.round(roleModels.reduce((a, b) => a + b.influenceScore, 0) / roleModels.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Networking Tab */}
      {activeTab === 'networking' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             
            {/* Networking Hero Banner */}
            <div className="bg-neutral-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner shrink-0">
                    <UserPlus className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">Grow Your Network</h2>
                    <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
                      Expand your professional circle with strategic connections. We've found <span className="text-white font-bold">{networkingOpportunities.length} opportunities</span>, including <span className="text-white font-bold">{networkingOpportunities.filter(o => o.relevanceScore >= 85).length} high-potential leads</span> with mutual connections.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 self-end sm:self-start">
                  <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 shadow-sm flex items-center gap-2">
                    <Zap size={12} className="fill-yellow-400 text-yellow-400" /> {networkingOpportunities.filter(o => o.relevanceScore >= 85).length} High Potential
                  </span>
                  <button className="text-[10px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                    <RefreshCw size={10} /> Updated today
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={networkingSearch}
                    onChange={(e) => setNetworkingSearch(e.target.value)}
                    placeholder="Search contacts, companies, or events..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900 placeholder-slate-400 font-medium transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="relative min-w-[200px] flex-1">
                    <select
                      value={networkingFilterType}
                      onChange={(e) => setNetworkingFilterType(e.target.value)}
                      className="w-full appearance-none px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <option value="all">All Contact Types</option>
                      <option value="speaker">Speakers</option>
                      <option value="organizer">Organizers</option>
                      <option value="event attendee">Attendees</option>
                      <option value="sponsor">Sponsors</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative min-w-[200px] flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter className="w-4 h-4 text-slate-400" />
                      </div>
                    <select
                      value={networkingSortBy}
                      onChange={(e) => setNetworkingSortBy(e.target.value)}
                      className="w-full appearance-none pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <option value="relevance">Sort by Relevance</option>
                      <option value="mutuals">Sort by Mutuals</option>
                      <option value="recent">Sort by Recently Contacted</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Networking Opportunities */}
            <div className="space-y-4">
              {filteredNetworking.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                    {/* Left: Avatar Column */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradient(opportunity.name)} flex items-center justify-center text-white font-bold text-2xl shadow-md ring-4 ring-white`}>
                            {getInitials(opportunity.name)}
                        </div>
                        {opportunity.relevanceScore >= 90 && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide rounded-full flex items-center gap-1 border border-emerald-200 shadow-sm whitespace-nowrap">
                                <Sparkles size={10} /> {opportunity.relevanceScore}% Match
                            </span>
                        )}
                    </div>

                    <div className="flex-1 w-full">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="text-xl font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">{opportunity.name}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${getContactTypeColor(opportunity.type)} bg-opacity-10 border border-current border-opacity-20`}>
                                        {opportunity.type}
                                    </span>
                                </div>
                                <p className="text-slate-500 font-medium text-sm mb-1">{opportunity.title} at <span className="text-slate-900 font-bold">{opportunity.company}</span></p>
                                 
                                {opportunity.lastContactDate ? (
                                    <div className="text-xs font-bold text-amber-600 flex items-center gap-1.5 mt-1">
                                            <Clock size={12} /> Last contacted: {opportunity.lastContactDate}
                                    </div>
                                ) : (
                                    <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-slate-300"></div> Not contacted yet
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto">
                                <a
                                    href={`mailto:${opportunity.contactInfo}`}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-neutral-900/10 text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    <Mail size={14} /> Connect
                                </a>
                                <button
                                    onClick={() => setExpandedContact(expandedContact === opportunity.id ? null : opportunity.id)}
                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2 border ${
                                        expandedContact === opportunity.id 
                                        ? 'bg-slate-100 text-slate-600 border-slate-200' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {expandedContact === opportunity.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    Notes
                                </button>
                            </div>
                        </div>

                        {/* Context Grid */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-blue-600 shadow-sm"><UserPlus size={14}/></div>
                                <div className="text-xs">
                                    <span className="block font-bold text-slate-900">{opportunity.mutualConnections} Mutuals</span>
                                    <span className="text-slate-500">Connections</span>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-purple-600 shadow-sm"><MapPin size={14}/></div>
                                <div className="text-xs">
                                    <span className="block font-bold text-slate-900">Met via Event</span>
                                    <span className="text-slate-500 max-w-[120px] truncate block" title={opportunity.eventContext}>{opportunity.eventContext}</span>
                                </div>
                            </div>
                        </div>

                        {/* Icebreaker Section */}
                        <div className="relative group/icebreaker">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl opacity-50 group-hover/icebreaker:opacity-100 transition duration-300"></div>
                            <div className="relative bg-white border border-blue-100 rounded-xl p-3 flex gap-3">
                                <div className="shrink-0 mt-0.5">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Lightbulb size={14} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Icebreaker Suggestion</div>
                                    <p className="text-sm text-slate-600 leading-snug">{opportunity.suggestedApproach}</p>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Notes */}
                        {expandedContact === opportunity.id && (
                            <div className="mt-4 animate-fade-in-up">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <MessageSquare size={12} /> Your Private Notes
                                </label>
                                <textarea
                                    value={networkingNotes[opportunity.id] || ''}
                                    onChange={(e) => setNetworkingNotes({ ...networkingNotes, [opportunity.id]: e.target.value })}
                                    placeholder="Log conversation details, follow-up reminders, or key takeaways..."
                                    className="w-full px-4 py-3 bg-yellow-50/50 border border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-800 placeholder-slate-400 text-sm resize-none transition-all shadow-inner"
                                    rows={3}
                                />
                            </div>
                        )}

                        {/* Footer Socials */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 mr-2">Find on:</span>
                            {opportunity.linkedin ? (
                                <a href={opportunity.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-[#0077b5] hover:bg-[#0077b5]/10 rounded-lg transition-all" title="LinkedIn">
                                    <Linkedin size={16} />
                                </a>
                            ) : <span className="p-1.5 text-slate-200"><Linkedin size={16} /></span>}
                             
                            {opportunity.twitter ? (
                                <a href={opportunity.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 rounded-lg transition-all" title="Twitter">
                                    <Twitter size={16} />
                                </a>
                            ) : <span className="p-1.5 text-slate-200"><Twitter size={16} /></span>}
                             
                            {opportunity.github ? (
                                <a href={opportunity.github} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-neutral-900 hover:bg-slate-100 rounded-lg transition-all" title="GitHub">
                                    <Github size={16} />
                                </a>
                            ) : <span className="p-1.5 text-slate-200"><Github size={16} /></span>}
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hot Leads */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                    <Zap className="w-4 h-4" />
                </div>
                Hot Leads
              </h3>
              <div className="space-y-3">
                {networkingOpportunities
                  .filter(o => o.relevanceScore >= 85)
                  .slice(0, 3)
                  .map((opp) => (
                    <div key={opp.id} className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 hover:bg-amber-50 transition-colors cursor-pointer group">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(opp.name)} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                        {getInitials(opp.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-sm truncate group-hover:text-amber-700 transition-colors">{opp.name}</div>
                        <div className="text-xs text-slate-500 truncate">{opp.company}</div>
                      </div>
                      <span className="px-2 py-1 bg-white text-amber-700 text-[10px] font-bold rounded-lg border border-amber-200 shadow-sm">
                        {opp.relevanceScore}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Networking Stats */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                    <BarChart3 className="w-4 h-4" />
                </div>
                Networking Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 text-sm font-medium">Total Contacts</span>
                  <span className="font-bold text-slate-900">{networkingOpportunities.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 text-sm font-medium">High Match (85%+)</span>
                  <span className="font-bold text-emerald-600">
                    {networkingOpportunities.filter(o => o.relevanceScore >= 85).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 text-sm font-medium">Events Covered</span>
                  <span className="font-bold text-blue-600">
                    {new Set(networkingOpportunities.map(o => o.eventContext)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* AI-Generated Insights Header */}
            <div className="bg-neutral-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner shrink-0">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">AI Career Intelligence</h2>
                    <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
                      Real-time analysis of your career landscape. We've identified {insights.length} high-impact opportunities based on your recent activity.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-2">
                  <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 shadow-sm flex items-center gap-2">
                    <Zap size={12} className="fill-yellow-400 text-yellow-400" /> {insights.length} Actions Available
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Updated just now</span>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'event', 'networking', 'skill'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setInsightFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border ${
                    insightFilter === filter 
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {filter === 'all' ? 'All Insights' : filter + 's'}
                </button>
              ))}
            </div>

            {/* Insights List */}
            <div className="space-y-4">
              {filteredInsights.length > 0 ? (
                filteredInsights.map((insight) => {
                  const Icon = insight.icon;
                  const colorClasses: Record<string, string> = {
                    blue: 'bg-blue-50 text-blue-600 border-blue-100',
                    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    purple: 'bg-purple-50 text-purple-600 border-purple-100',
                    amber: 'bg-amber-50 text-amber-600 border-amber-100',
                    rose: 'bg-rose-50 text-rose-600 border-rose-100'
                  };

                  return (
                    <div
                      key={insight.id}
                      className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden"
                    >
                      {insight.priority === 'high' && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase rounded-bl-xl shadow-sm z-10">
                          High Priority
                        </div>
                      )}

                      <div className="flex items-start gap-5 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClasses[insight.color] || colorClasses.blue} border shadow-sm shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                         
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200 px-2 py-0.5 rounded-md bg-slate-50">
                              {insight.category}
                            </span>
                            <button 
                              onClick={() => handleDismissInsight(insight.id)}
                              className="text-slate-300 hover:text-slate-500 transition-colors p-1"
                              title="Dismiss Insight"
                            >
                              <X size={16} />
                            </button>
                          </div>
                           
                          <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-indigo-600 transition-colors">{insight.title}</h3>
                          <p className="text-slate-600 mb-4 leading-relaxed text-sm">{insight.message}</p>
                           
                          {/* Reasoning & Confidence */}
                          <div className="flex flex-col sm:flex-row gap-4 mb-5">
                            <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                                <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-500 shadow-sm">
                                    <BrainCircuit size={14} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Reasoning</div>
                                    <div className="text-xs font-medium text-slate-700">{insight.reasoning}</div>
                                </div>
                            </div>
                             
                            <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    <span>Confidence Score</span>
                                    <span className="text-neutral-900">{insight.confidence}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                        insight.confidence >= 80 
                                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                                        : insight.confidence >= 60 
                                            ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                                            : 'bg-slate-400'
                                    }`}
                                    style={{ width: `${insight.confidence}%` }}
                                    />
                                </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (insight.type === 'event') setActiveTab('events');
                              else if (insight.type === 'networking') setActiveTab('networking');
                              else if (insight.type === 'skill') setActiveTab('role-models'); // Assuming skills map to learning from role models or events
                            }}
                            className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-neutral-900/10 text-sm font-bold flex items-center justify-center gap-2 group/btn"
                          >
                            {insight.actionText}
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm border border-slate-100">
                    <Check size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">All Caught Up!</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-sm">
                    You've reviewed all current insights for this category. Check back later as you engage more with the platform.
                  </p>
                  <button 
                    onClick={() => setInsightFilter('all')}
                    className="mt-6 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-neutral-900 hover:border-slate-300 transition-colors"
                  >
                    View All Insights
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                    <ClipboardList className="w-4 h-4" />
                </div>
                Analysis Source
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default group border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 text-amber-600 group-hover:bg-amber-100 transition-colors">
                      <BookmarkCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Events</div>
                      <div className="text-xs text-slate-500 font-medium">Bookmarked</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{bookmarkedEvents.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default group border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Role Models</div>
                      <div className="text-xs text-slate-500 font-medium">Following</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{following.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default group border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Network</div>
                      <div className="text-xs text-slate-500 font-medium">Opportunities</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{networkingOpportunities.length}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-neutral-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Optimization Tips
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-slate-300 leading-snug">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  Bookmark at least 3 events to get better skill trend analysis.
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300 leading-snug">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  Follow diverse role models to broaden your industry exposure.
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300 leading-snug">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  Reach out to networking contacts within 48 hours of an event.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Export Wrapper ---

const CareerEventScoutModule = () => {
    return (
        <div className="bg-slate-50 min-h-screen">
            <CareerEventScout />
        </div>
    );
};

export default CareerEventScoutModule;

