import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, FileText, Briefcase, Target, Zap, CheckCircle2, Sparkles, 
  ArrowRight, TrendingUp, Activity, BookOpen, MessageSquare, Brain,
  FileCheck, Calendar, BarChart3, Rocket, Search, Coffee, RefreshCw,
  Globe, Award, Play, CheckCircle, Clock, X, Lightbulb
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WorkflowTracking, WORKFLOW_DEFINITIONS, type WorkflowId } from '../lib/workflowTracking';
import StatsOverview from '../components/dashboard/StatsOverview';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import RecentActivity from '../components/dashboard/RecentActivity';
import WorkflowAnalytics from '../components/dashboard/WorkflowAnalytics';
import WorkflowPerformanceDashboard from '../components/dashboard/WorkflowPerformanceDashboard';
import WorkflowRecommendationsComponent from '../components/dashboard/WorkflowRecommendations';
import WorkflowWizard from '../components/workflows/WorkflowWizard';
import ActiveWorkflowsCards from '../components/dashboard/ActiveWorkflowsCards';
import PersistentNotificationBanner from '../components/widgets/PersistentNotificationBanner';

// MissionCard Component
interface MissionCardProps {
  title: string;
  description: string;
  actionLink: string;
  isLocked: boolean;
  isCompleted: boolean;
  icon: React.ReactNode;
  count?: number;
}

function MissionCard({ title, description, actionLink, isLocked, isCompleted, icon, count }: MissionCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isLocked) {
      navigate(actionLink);
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Icon and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        {isLocked && (
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            <span>Locked</span>
          </div>
        )}
        {!isLocked && isCompleted && (
          <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active</span>
          </div>
        )}
        {!isLocked && !isCompleted && (
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>Start Here</span>
          </div>
        )}
      </div>

      {/* Title and Description */}
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{description}</p>

      {/* Count Display for Completed Missions */}
      {isCompleted && count !== undefined && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">{count}</span>
            <span className="text-sm text-slate-500">
              {count === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleClick}
        className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
          isLocked
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
            : isCompleted
            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
        }`}
      >
        {isLocked ? 'Upgrade to Unlock' : isCompleted ? 'Manage' : 'Create'}
      </button>
    </div>
  );
}

export default function DashboardHome() {
  const [resumeCount, setResumeCount] = useState<number>(0);
  const [jobCount, setJobCount] = useState<number>(0);
  const [brandScore, setBrandScore] = useState<number | null>(null);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'ultimate'>('free');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [jobsThisWeek, setJobsThisWeek] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(0);
  const [usedToday, setUsedToday] = useState<number>(0);
  const [lastApplicationDate, setLastApplicationDate] = useState<string | null>(null);
  const [coverLetterCount, setCoverLetterCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>(() => {
    // Load dismissed suggestions from localStorage
    try {
      const stored = localStorage.getItem('dismissed_workflow_suggestions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [wizardWorkflowId, setWizardWorkflowId] = useState<WorkflowId | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch all required data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch user profile (name, tier, daily_limit)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, tier, daily_limit')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          setUserName(profile.full_name || user.email?.split('@')[0] || 'User');
          setUserTier((profile.tier as 'free' | 'pro' | 'ultimate') || 'free');
          setDailyLimit(profile.daily_limit ?? 0);
        } else {
          setUserName(user.email?.split('@')[0] || 'User');
        }

        // Fetch resume count and latest ATS score
        const { data: resumes, error: resumeError } = await supabase
          .from('resumes')
          .select('id, ats_score, atsScore')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (!resumeError && resumes) {
          setResumeCount(resumes.length);
          if (resumes.length > 0) {
            // Try both field name variations
            const latestResume = resumes[0] as any;
            const score = latestResume.ats_score ?? latestResume.atsScore ?? null;
            if (score !== null && score !== undefined) {
              setAtsScore(Number(score));
            }
          }
        }

        // Fetch job applications count and this week's count
        const { count: jobCountResult, error: jobError } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!jobError) {
          setJobCount(jobCountResult || 0);
        }

        // Get jobs applied this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoISO = oneWeekAgo.toISOString();

        const { count: jobsThisWeekResult, error: jobsWeekError } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgoISO);

        if (!jobsWeekError) {
          setJobsThisWeek(jobsThisWeekResult || 0);
        }

        // Fetch last application date (for Level 4 dynamic banner)
        const { data: lastApplication, error: lastAppError } = await supabase
          .from('job_applications')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!lastAppError && lastApplication?.created_at) {
          setLastApplicationDate(lastApplication.created_at);
        }

        // Fetch latest brand score
        const { data: brandAudit, error: brandError } = await supabase
          .from('brand_audits')
          .select('brand_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (brandError && brandError.code !== 'PGRST116') {
          console.error('Error fetching brand score:', brandError);
        } else if (brandAudit?.brand_score) {
          const score = brandAudit.brand_score as { overall?: number };
          setBrandScore(score?.overall ?? null);
        }

        // Get used_today from ai_usage_logs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        const { count: usedTodayResult, error: usageError } = await supabase
          .from('ai_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', todayISO);

        if (!usageError) {
          const used = usedTodayResult || 0;
          setUsedToday(used);
          const limit = profile?.daily_limit ?? 0;
          setCreditsLeft(Math.max(0, limit - used));
        }

        // Fetch cover letter count from ai_usage_logs
        const { count: coverLetterCountResult, error: coverLetterError } = await supabase
          .from('ai_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('feature_name', 'cover_letter');

        if (!coverLetterError) {
          setCoverLetterCount(coverLetterCountResult || 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    
    // Load workflows
    const loadWorkflows = () => {
      const allWorkflows = WorkflowTracking.getAllWorkflows();
      setWorkflows(allWorkflows);
    };
    loadWorkflows();
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate days since last application
  const getDaysSinceLastApplication = (): number | null => {
    if (!lastApplicationDate) return null;
    const lastApp = new Date(lastApplicationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastApp.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastApp.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get daily banner for Level 4 (End Game) state
  // Smart logic with overrides for urgent tasks, then 14-day rotating cycle
  const getDailyBanner = () => {
    const daysSinceLastApp = getDaysSinceLastApplication();
    
    // Smart Overrides - Check for urgent tasks first
    // If brandScore is missing, prioritize Brand Audit
    if (brandScore === null) {
      return {
        title: 'Brand Audit',
        message: 'How does your LinkedIn look? Run a fresh audit.',
        buttonText: 'Run Brand Audit',
        link: '/dashboard/brand-audit',
        icon: <Target className="w-8 h-8" />,
        gradient: 'from-violet-600 to-purple-600'
      };
    }
    
    // If no resume exists, prioritize Resume Studio
    if (resumeCount === 0) {
      return {
        title: 'Resume Studio',
        message: 'Keep your resume fresh. Update your Master Resume today.',
        buttonText: 'Create Resume',
        link: '/dashboard/resume-studio',
        icon: <FileText className="w-8 h-8" />,
        gradient: 'from-indigo-600 to-blue-600'
      };
    }
    
    // If no job applications tracked, prioritize Job Finder
    if (jobCount === 0) {
      return {
        title: 'Job Finder',
        message: 'Found your dream role yet? Search 50+ new listings.',
        buttonText: 'Search Jobs',
        link: '/dashboard/job-finder',
        icon: <Search className="w-8 h-8" />,
        gradient: 'from-green-600 to-emerald-600'
      };
    }
    
    // 14-Day Rotating Cycle - Fallback if no urgent tasks
    const dayOfMonth = new Date().getDate();
    const cycleDay = dayOfMonth % 14;
    
    switch (cycleDay) {
      case 0:
        return {
          title: 'Resume Studio',
          message: 'Keep your resume fresh. Update your Master Resume today.',
          buttonText: 'Update Resume',
          link: '/dashboard/resume-studio',
          icon: <FileText className="w-8 h-8" />,
          gradient: 'from-indigo-600 to-blue-600'
        };
      
      case 1:
        return {
          title: 'Job Finder',
          message: 'Found your dream role yet? Search 50+ new listings.',
          buttonText: 'Search Jobs',
          link: '/dashboard/job-finder',
          icon: <Search className="w-8 h-8" />,
          gradient: 'from-green-600 to-emerald-600'
        };
      
      case 2:
        return {
          title: 'Application Tailor',
          message: 'Don\'t send generic resumes. Tailor one for a specific job.',
          buttonText: 'Tailor Resume',
          link: '/dashboard/application-tailor',
          icon: <FileCheck className="w-8 h-8" />,
          gradient: 'from-teal-600 to-cyan-600'
        };
      
      case 3:
        return {
          title: 'Brand Audit',
          message: 'How does your LinkedIn look? Run a fresh audit.',
          buttonText: 'Run Brand Audit',
          link: '/dashboard/brand-audit',
          icon: <Target className="w-8 h-8" />,
          gradient: 'from-violet-600 to-purple-600'
        };
      
      case 4:
        return {
          title: 'Interview Prep',
          message: 'Prepare for the big day. Start a mock interview.',
          buttonText: 'Start Interview Prep',
          link: '/dashboard/interview-prep',
          icon: <Brain className="w-8 h-8" />,
          gradient: 'from-purple-600 to-pink-600'
        };
      
      case 5:
        return {
          title: 'Skill Radar',
          message: 'Market demands are shifting. Check your skill alignment.',
          buttonText: 'View Skill Radar',
          link: '/dashboard/skill-radar',
          icon: <TrendingUp className="w-8 h-8" />,
          gradient: 'from-orange-600 to-amber-600'
        };
      
      case 6:
        return {
          title: 'Cover Letter',
          message: 'Need a cover letter fast? Generate one in seconds.',
          buttonText: 'Create Cover Letter',
          link: '/dashboard/ai-cover-letter',
          icon: <MessageSquare className="w-8 h-8" />,
          gradient: 'from-teal-600 to-cyan-600'
        };
      
      case 7:
        return {
          title: 'Content Engine',
          message: 'Build authority. Generate a viral LinkedIn post.',
          buttonText: 'Generate Content',
          link: '/dashboard/content-engine',
          icon: <BarChart3 className="w-8 h-8" />,
          gradient: 'from-indigo-600 to-purple-600'
        };
      
      case 8:
        return {
          title: 'Learning Sprints',
          message: 'Ready for a sprint? Start a 2-week learning mission.',
          buttonText: 'Start Sprint',
          link: '/dashboard/sprints',
          icon: <Rocket className="w-8 h-8" />,
          gradient: 'from-orange-600 to-amber-600'
        };
      
      case 9:
        return {
          title: 'Job Tracker',
          message: 'Keep your pipeline organized. Update your application status.',
          buttonText: 'View Tracker',
          link: '/dashboard/job-tracker',
          icon: <Briefcase className="w-8 h-8" />,
          gradient: 'from-green-600 to-emerald-600'
        };
      
      case 10:
        return {
          title: 'AI Portfolio',
          message: 'Showcase your work. Update your AI Portfolio website.',
          buttonText: 'Update Portfolio',
          link: '/dashboard/portfolio',
          icon: <Globe className="w-8 h-8" />,
          gradient: 'from-violet-600 to-purple-600'
        };
      
      case 11:
        return {
          title: 'Skill Benchmarking',
          message: 'How do you compare to peers? Check your benchmark score.',
          buttonText: 'View Benchmark',
          link: '/dashboard/benchmarking',
          icon: <BarChart3 className="w-8 h-8" />,
          gradient: 'from-purple-600 to-pink-600'
        };
      
      case 12:
        return {
          title: 'Event Scout',
          message: 'Network with pros. Find career events near you.',
          buttonText: 'Find Events',
          link: '/dashboard/event-scout',
          icon: <Calendar className="w-8 h-8" />,
          gradient: 'from-blue-600 to-indigo-600'
        };
      
      case 13:
        return {
          title: 'Certifications',
          message: 'Plan your next cert. View your certification roadmap.',
          buttonText: 'View Certifications',
          link: '/dashboard/certifications',
          icon: <Award className="w-8 h-8" />,
          gradient: 'from-amber-600 to-orange-600'
        };
      
      default:
        // Fallback: Resume Studio
        return {
          title: 'Resume Studio',
          message: 'Keep your resume fresh. Update your Master Resume today.',
          buttonText: 'Update Resume',
          link: '/dashboard/resume-studio',
          icon: <FileText className="w-8 h-8" />,
          gradient: 'from-indigo-600 to-blue-600'
        };
    }
  };

  // Determine focus widget content
  const getFocusWidget = () => {
    if (resumeCount === 0) {
      return {
        title: 'Build your Master Resume',
        description: 'Create your first professional resume to get started',
        link: '/dashboard/resume-studio',
        icon: <FileText className="w-8 h-8" />,
        gradient: 'from-indigo-600 to-purple-600'
      };
    } else if (brandScore === null) {
      return {
        title: 'Audit your Personal Brand',
        description: 'Analyze your brand across LinkedIn, GitHub, and portfolio',
        link: '/dashboard/brand-audit',
        icon: <Target className="w-8 h-8" />,
        gradient: 'from-indigo-600 to-purple-600'
      };
    } else if (jobCount === 0) {
      return {
        title: 'Track your first Job Application',
        description: 'Start tracking applications and get smart insights',
        link: '/dashboard/job-finder',
        icon: <Briefcase className="w-8 h-8" />,
        gradient: 'from-indigo-600 to-purple-600'
      };
    } else {
      // Level 4 (End Game) - Use dynamic daily banner
      const dailyBanner = getDailyBanner();
      return {
        title: dailyBanner.title,
        description: dailyBanner.message,
        link: dailyBanner.link,
        icon: dailyBanner.icon,
        gradient: dailyBanner.gradient,
        buttonText: dailyBanner.buttonText
      };
    }
  };

  // Complete Feature Pool - All possible suggestions
  interface FeatureSuggestion {
    title: string;
    description: string;
    link: string;
    icon: React.ReactNode;
    isUrgent?: (state: {
      resumeCount: number;
      jobCount: number;
      brandScore: number | null;
      coverLetterCount: number;
      atsScore: number | null;
      jobsThisWeek: number;
      daysSinceLastApp: number | null;
    }) => boolean;
  }

  const COMPLETE_FEATURE_POOL: FeatureSuggestion[] = [
    // Career Hub
    {
      title: 'Resume Studio',
      description: 'Create and manage professional resumes tailored to your target roles',
      link: '/dashboard/resume-studio',
      icon: <FileText className="w-6 h-6" />,
      isUrgent: (state) => state.resumeCount === 0
    },
    {
      title: 'Application Tailor',
      description: 'Tailor your resume and application materials for specific job postings',
      link: '/dashboard/application-tailor',
      icon: <FileCheck className="w-6 h-6" />,
      isUrgent: (state) => state.resumeCount > 0 && state.jobCount === 0
    },
    {
      title: 'Cover Letter',
      description: 'Generate personalized cover letters that complement your resume',
      link: '/dashboard/ai-cover-letter',
      icon: <MessageSquare className="w-6 h-6" />,
      isUrgent: (state) => state.resumeCount > 0 && state.coverLetterCount === 0 && state.jobCount > 0
    },
    {
      title: 'Job Finder',
      description: 'Discover opportunities that match your skills and career goals',
      link: '/dashboard/job-finder',
      icon: <Search className="w-6 h-6" />,
      isUrgent: (state) => state.jobCount === 0
    },
    {
      title: 'Job Tracker',
      description: 'Organize and track your applications with smart insights',
      link: '/dashboard/job-tracker',
      icon: <Briefcase className="w-6 h-6" />,
      isUrgent: (state) => state.jobCount > 0 && (state.daysSinceLastApp === null || (state.daysSinceLastApp !== null && state.daysSinceLastApp > 7))
    },
    {
      title: 'Interview Prep',
      description: 'Prepare for interviews with AI-powered mock sessions and feedback',
      link: '/dashboard/interview-prep',
      icon: <Brain className="w-6 h-6" />,
      isUrgent: (state) => state.jobCount > 5
    },
    {
      title: 'Work History',
      description: 'Manage and optimize your professional work history and experience',
      link: '/dashboard/work-history',
      icon: <Calendar className="w-6 h-6" />
    },
    
    // Brand Building
    {
      title: 'Brand Audit',
      description: 'Analyze your personal brand across LinkedIn, GitHub, and portfolio',
      link: '/dashboard/brand-audit',
      icon: <Target className="w-6 h-6" />,
      isUrgent: (state) => state.brandScore === null
    },
    {
      title: 'Content Engine',
      description: 'Generate professional content to build authority and visibility',
      link: '/dashboard/content-engine',
      icon: <BarChart3 className="w-6 h-6" />,
      isUrgent: (state) => state.brandScore !== null && state.brandScore < 60
    },
    {
      title: 'AI Portfolio',
      description: 'Create a stunning portfolio website to showcase your work',
      link: '/dashboard/portfolio',
      icon: <Globe className="w-6 h-6" />,
      isUrgent: (state) => state.brandScore !== null && state.brandScore > 70
    },
    {
      title: 'Event Scout',
      description: 'Find networking events and career opportunities in your area',
      link: '/dashboard/event-scout',
      icon: <Calendar className="w-6 h-6" />
    },
    
    // Upskilling
    {
      title: 'Upskilling Dashboard',
      description: 'Track your learning progress and skill development journey',
      link: '/dashboard/upskilling',
      icon: <Activity className="w-6 h-6" />
    },
    {
      title: 'Skill Radar',
      description: 'Discover trending skills in your industry and see how you compare',
      link: '/dashboard/skill-radar',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: 'Learning Path',
      description: 'Build a personalized learning roadmap to reach your career goals',
      link: '/dashboard/learning-path',
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      title: 'Learning Sprints',
      description: 'Complete focused 2-week learning missions to level up fast',
      link: '/dashboard/sprints',
      icon: <Rocket className="w-6 h-6" />
    },
    {
      title: 'Certifications',
      description: 'Plan and track industry certifications to boost your credibility',
      link: '/dashboard/certifications',
      icon: <Award className="w-6 h-6" />
    },
    {
      title: 'Skill Benchmarking',
      description: 'Compare your skills against industry standards and peers',
      link: '/dashboard/benchmarking',
      icon: <BarChart3 className="w-6 h-6" />
    }
  ];

  // Get daily suggestions - Teaser Machine Algorithm
  interface DailySuggestion {
    title: string;
    description: string;
    link: string;
    icon: React.ReactNode;
    actionText: string;
  }

  // Shuffle array utility
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get day-based seed for consistent randomization
  const getDaySeed = (): number => {
    const today = new Date();
    return today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
  };

  const getDailySuggestions = (): DailySuggestion[] => {
    const state = {
      resumeCount,
      jobCount,
      brandScore,
      coverLetterCount,
      atsScore,
      jobsThisWeek,
      daysSinceLastApp: getDaysSinceLastApplication()
    };

    // Get day seed once for consistent randomization
    const seed = getDaySeed();

    // Step 1: Identify Urgent items
    const urgentItems: FeatureSuggestion[] = [];
    COMPLETE_FEATURE_POOL.forEach(feature => {
      if (feature.isUrgent && feature.isUrgent(state)) {
        urgentItems.push(feature);
      }
    });

    // Step 2: Identify Discovery items (remaining features)
    const discoveryItems = COMPLETE_FEATURE_POOL.filter(feature => {
      // Exclude urgent items
      if (urgentItems.some(urgent => urgent.link === feature.link)) {
        return false;
      }
      return true;
    });

    // Step 3: Pick 3 items
    const selected: FeatureSuggestion[] = [];
    
    // Take 1 urgent item if available
    if (urgentItems.length > 0) {
      // Use day seed for consistent selection
      const urgentIndex = seed % urgentItems.length;
      selected.push(urgentItems[urgentIndex]);
    }

    // Fill remaining spots with discovery items
    // Use day-based rotation for consistency
    const shuffledDiscovery = shuffleArray(discoveryItems);
    
    // Rotate based on day to ensure variety
    const rotationStart = seed % shuffledDiscovery.length;
    const rotatedDiscovery = [
      ...shuffledDiscovery.slice(rotationStart),
      ...shuffledDiscovery.slice(0, rotationStart)
    ];

    const neededCount = 3 - selected.length;
    for (let i = 0; i < neededCount && i < rotatedDiscovery.length; i++) {
      selected.push(rotatedDiscovery[i]);
    }

    // Step 4: Shuffle the final 3 items (so urgent isn't always first)
    const actionTexts = ['Start', 'View', 'Explore'];
    const finalSuggestions = shuffleArray(selected).slice(0, 3).map((feature, index) => ({
      title: feature.title,
      description: feature.description,
      link: feature.link,
      icon: feature.icon,
      actionText: actionTexts[(seed + index) % actionTexts.length] || 'Start'
    }));

    return finalSuggestions;
  };

  const focusWidget = getFocusWidget();
  const dailySuggestions = getDailySuggestions();
  const creditsPercentage = dailyLimit > 0 ? (usedToday / dailyLimit) * 100 : 0;

  // Smart workflow recommendations based on user state
  const getSmartWorkflowSuggestions = () => {
    const suggestions: Array<{
      workflowId: WorkflowId;
      reason: string;
      priority: 'high' | 'medium' | 'low';
      icon: React.ReactNode;
      actionText?: string;
      actionLink?: string;
    }> = [];

    // Check active workflows
    const activeWorkflows = workflows.filter(w => w.isActive);
    const completedWorkflows = workflows.filter(w => w.completedAt);

    // If user has jobs but no resume → Job Application Pipeline
    if (jobCount > 0 && resumeCount === 0) {
      const workflow = workflows.find(w => w.id === 'job-application-pipeline');
      if (!workflow || (!workflow.isActive && !workflow.completedAt)) {
        suggestions.push({
          workflowId: 'job-application-pipeline',
          reason: `You have ${jobCount} job${jobCount !== 1 ? 's' : ''} tracked but no resume yet. Create one to start applying!`,
          priority: 'high',
          icon: <FileText className="w-5 h-5" />
        });
      }
    }

    // If user has resume but no jobs → Job Finder
    if (resumeCount > 0 && jobCount === 0) {
      const workflow = workflows.find(w => w.id === 'job-application-pipeline');
      if (!workflow || (!workflow.isActive && !workflow.completedAt)) {
        suggestions.push({
          workflowId: 'job-application-pipeline',
          reason: 'You have a resume ready! Start finding and applying to jobs.',
          priority: 'high',
          icon: <Briefcase className="w-5 h-5" />
        });
      }
    }

    // If user has jobs and resume but no brand audit → Brand Building
    if (resumeCount > 0 && jobCount > 0 && brandScore === null) {
      const workflow = workflows.find(w => w.id === 'personal-brand-job-discovery');
      if (!workflow || (!workflow.isActive && !workflow.completedAt)) {
        suggestions.push({
          workflowId: 'personal-brand-job-discovery',
          reason: 'Build your personal brand to stand out to employers and discover more opportunities.',
          priority: 'medium',
          icon: <Target className="w-5 h-5" />
        });
      }
    }

    // If user has many applications but low success → Continuous Improvement / Skill Development
    if (jobCount > 5) {
      const workflow = workflows.find(w => w.id === 'continuous-improvement-loop');
      if (!workflow || (!workflow.isActive && !workflow.completedAt)) {
        suggestions.push({
          workflowId: 'continuous-improvement-loop',
          reason: 'Your rejected applications show you need to bridge skill gaps. Identify what\'s missing and create a learning plan.',
          priority: 'high',
          icon: <TrendingUp className="w-5 h-5" />,
          actionText: 'View Learning Path',
          actionLink: '/dashboard/learning-path'
        });
      }
    }

    // If user has completed Job Application Pipeline → Suggest Interview Prep or Skill Development
    if (completedWorkflows.some(w => w.id === 'job-application-pipeline')) {
      const interviewWorkflow = workflows.find(w => w.id === 'interview-preparation-ecosystem');
      if (!interviewWorkflow || (!interviewWorkflow.isActive && !interviewWorkflow.completedAt)) {
        suggestions.push({
          workflowId: 'interview-preparation-ecosystem',
          reason: 'You\'ve been applying to jobs! Prepare for interviews to increase your success rate.',
          priority: 'high',
          icon: <Brain className="w-5 h-5" />
        });
      }
    }

    // If user has low brand score → Brand Building
    if (brandScore !== null && brandScore < 70) {
      const workflow = workflows.find(w => w.id === 'personal-brand-job-discovery');
      if (!workflow || (!workflow.isActive && !workflow.completedAt)) {
        suggestions.push({
          workflowId: 'personal-brand-job-discovery',
          reason: `Your brand score is ${brandScore}. Content Engine can help boost it and attract better opportunities.`,
          priority: 'medium',
          icon: <Target className="w-5 h-5" />,
          actionText: 'Create Content',
          actionLink: '/dashboard/content-engine'
        });
      }
    }

    // If user has no active workflows and no completed workflows → Suggest starting
    if (activeWorkflows.length === 0 && completedWorkflows.length === 0) {
      if (resumeCount > 0) {
        suggestions.push({
          workflowId: 'job-application-pipeline',
          reason: 'Start your career journey with a complete job application workflow.',
          priority: 'high',
          icon: <Rocket className="w-5 h-5" />
        });
      } else {
        suggestions.push({
          workflowId: 'skill-development-advancement',
          reason: 'Begin by developing your skills and building your professional profile.',
          priority: 'high',
          icon: <TrendingUp className="w-5 h-5" />
        });
      }
    }

    // If user has active workflows → Suggest continuing
    if (activeWorkflows.length > 0) {
      const activeWorkflow = activeWorkflows[0];
      const nextStep = WorkflowTracking.getNextStep(activeWorkflow.id);
      if (nextStep) {
        suggestions.push({
          workflowId: activeWorkflow.id,
          reason: `Continue "${activeWorkflow.name}" - ${nextStep.name} is next.`,
          priority: 'high',
          icon: <ArrowRight className="w-5 h-5" />
        });
      }
    }

    // Sort by priority and filter dismissed
    return suggestions
      .filter(s => !dismissedSuggestions.includes(s.workflowId))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 3); // Show max 3 suggestions
  };

  const smartSuggestions = getSmartWorkflowSuggestions();

  const handleStartWorkflow = async (workflowId: WorkflowId) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow && workflow.isActive) {
      // For active workflows, show wizard to continue
      setWizardWorkflowId(workflowId);
      setIsWizardOpen(true);
    } else {
      // For new workflows, show wizard to start
      setWizardWorkflowId(workflowId);
      setIsWizardOpen(true);
    }
  };

  const handleDismissSuggestion = (workflowId: WorkflowId) => {
    const updated = [...dismissedSuggestions, workflowId];
    setDismissedSuggestions(updated);
    // Persist to localStorage
    try {
      localStorage.setItem('dismissed_workflow_suggestions', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving dismissed suggestions:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Persistent Notification Banner */}
      <PersistentNotificationBanner />

      {/* Hero Section - Focus Widget */}
      <div 
        className={`bg-gradient-to-r ${focusWidget.gradient || 'from-indigo-600 to-purple-600'} rounded-2xl p-8 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300`}
        onClick={() => navigate(focusWidget.link)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {userName}.</h1>
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-2">
                {focusWidget.icon}
                <h2 className="text-2xl font-semibold">{focusWidget.title}</h2>
              </div>
              <p className="text-white/90 text-lg mb-4">{focusWidget.description}</p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-white/90 transition-all">
                {focusWidget.buttonText || 'Get Started'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Workflows Section */}
      <ActiveWorkflowsCards workflows={workflows} />

      {/* AI-Powered Workflow Recommendations - Prominent Section */}
      <div className="mb-8">
        <WorkflowRecommendationsComponent
          limit={3}
          showTitle={true}
          onDismiss={handleDismissSuggestion}
          dismissedWorkflows={dismissedSuggestions}
        />
      </div>

      {/* Smart Workflow Suggestions - Enhanced Format */}
      {smartSuggestions.length > 0 && (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">💡 Suggested Next Steps</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Based on your activity, we recommend:</p>
            </div>
          </div>

          <div className="space-y-4">
            {smartSuggestions.map((suggestion, index) => {
              const definition = WORKFLOW_DEFINITIONS[suggestion.workflowId];
              const workflow = workflows.find(w => w.id === suggestion.workflowId);
              const isActive = workflow?.isActive || false;
              
              const getCategoryColor = (category: string) => {
                switch (category) {
                  case 'Career Hub': return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
                  case 'Brand Building': return 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10';
                  case 'Upskilling': return 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10';
                  case 'Cross-Category': return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10';
                  default: return 'border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10';
                }
              };

              return (
                <div
                  key={suggestion.workflowId}
                  className={`border-l-4 ${getCategoryColor(definition.category)} rounded-r-xl p-5 hover:shadow-md transition-all`}
                >
                  <div className="flex items-start gap-4">
                    {/* Number Badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            {definition.name}
                          </h3>
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                            {suggestion.reason}
                          </p>
                        </div>
                        {isActive && (
                          <span className="flex-shrink-0 text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <div className="mt-4">
                        {suggestion.actionLink ? (
                          <button
                            onClick={() => navigate(suggestion.actionLink!)}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 text-sm shadow-md hover:shadow-lg"
                          >
                            {suggestion.actionText || (isActive ? 'Continue Workflow' : 'Start Workflow')}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartWorkflow(suggestion.workflowId)}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 text-sm shadow-md hover:shadow-lg"
                          >
                            {suggestion.actionText || (isActive ? 'Continue Workflow' : 'Start Workflow')}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Career Vitality Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resume Health Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Resume Health</h3>
            </div>
          </div>
          {atsScore !== null ? (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-indigo-600">{atsScore}</span>
                <span className="text-sm text-slate-500">ATS Score</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    atsScore >= 80 ? 'bg-green-500' : atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${atsScore}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-emerald-600">
              <p className="text-lg font-medium">Ready to Build</p>
              <p className="text-sm mt-1 text-slate-500">Create your first resume to see your ATS score</p>
            </div>
          )}
        </div>

        {/* Application Velocity Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Application Velocity</h3>
            </div>
          </div>
          {jobCount === 0 ? (
            <div className="text-blue-600">
              <p className="text-lg font-medium">Pipeline Ready</p>
              <p className="text-sm mt-1 text-slate-500">Start tracking your applications</p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-green-600">{jobsThisWeek}</span>
                <span className="text-sm text-slate-500">Jobs Applied this week</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">Total: {jobCount} applications</p>
            </div>
          )}
        </div>

        {/* AI Credits Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">AI Credits</h3>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-purple-600">{creditsLeft ?? 0}</span>
              <span className="text-sm text-slate-500">remaining today</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, creditsPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{usedToday} / {dailyLimit} used</p>
          </div>
        </div>
      </div>

      {/* Workflows Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Workflows</h2>
            <p className="text-sm text-slate-600 mt-1">Guided paths to achieve your career goals</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.keys(WORKFLOW_DEFINITIONS) as WorkflowId[]).map((workflowId) => {
            const definition = WORKFLOW_DEFINITIONS[workflowId];
            const workflow = workflows.find(w => w.id === workflowId);
            const isActive = workflow?.isActive || false;
            const progress = workflow?.progress || 0;
            const isCompleted = workflow?.completedAt !== undefined;
            const status = isCompleted ? 'completed' : isActive ? 'in-progress' : 'not-started';
            
            // Get category color
            const getCategoryColor = (category: string) => {
              switch (category) {
                case 'Career Hub': return 'from-blue-500 to-indigo-600';
                case 'Brand Building': return 'from-purple-500 to-pink-600';
                case 'Upskilling': return 'from-green-500 to-emerald-600';
                case 'Cross-Category': return 'from-orange-500 to-amber-600';
                default: return 'from-indigo-500 to-purple-600';
              }
            };
            
            const handleWorkflowClick = async () => {
              // Always show wizard when clicking workflow card
              setWizardWorkflowId(workflowId);
              setIsWizardOpen(true);
            };
            
            return (
              <div 
                key={workflowId}
                className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={handleWorkflowClick}
              >
                {/* Header with Category Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(definition.category)} flex items-center justify-center text-white`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {status === 'completed' && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Complete</span>
                      </div>
                    )}
                    {status === 'in-progress' && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    )}
                    {status === 'not-started' && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        <Play className="w-3 h-3" />
                        <span>Start</span>
                      </div>
                    )}
                    <span className="text-xs text-slate-500">{definition.category}</span>
                  </div>
                </div>
                
                {/* Title and Description */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{definition.name}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{definition.description}</p>
                
                {/* Progress Bar */}
                {(isActive || isCompleted) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWorkflowClick();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCompleted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                      : isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700'
                  }`}
                >
                  {isCompleted ? 'View Details' : isActive ? 'Continue' : 'Start Workflow'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mystery Missions - Teaser Machine */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Mystery Missions</h2>
            <p className="text-sm text-slate-600 mt-1">Discover what's waiting for you today</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dailySuggestions.map((suggestion, index) => {
            return (
              <div key={index} className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                {/* Uniform Icon - Consistent Indigo/Slate styling */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 flex items-center justify-center text-indigo-600 mb-4">
                  {suggestion.icon}
                </div>
                
                {/* Title and Description */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{suggestion.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{suggestion.description}</p>
                
                {/* Action Button - Active and uniform */}
                <button
                  onClick={() => navigate(suggestion.link)}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {suggestion.actionText}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tools Grid - Core Features */}
      <div ref={quickActionsRef} className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MissionCard
            title="Resume Studio"
            description="Create and manage professional resumes tailored to your target roles"
            actionLink="/dashboard/resume-studio"
            isLocked={false}
            isCompleted={resumeCount > 0}
            icon={<FileText className="w-6 h-6" />}
            count={resumeCount}
          />
          <MissionCard
            title="Job Tracker"
            description="Track and manage your job applications with smart insights"
            actionLink="/dashboard/job-finder"
            isLocked={false}
            isCompleted={jobCount > 0}
            icon={<Briefcase className="w-6 h-6" />}
            count={jobCount}
          />
          <MissionCard
            title="Brand Audit"
            description="Analyze your personal brand across LinkedIn, GitHub, and portfolio"
            actionLink="/dashboard/brand-audit"
            isLocked={false}
            isCompleted={brandScore !== null}
            icon={<Target className="w-6 h-6" />}
            count={brandScore !== null ? 1 : 0}
          />
          <MissionCard
            title="Cover Letter"
            description="Generate personalized cover letters for each application"
            actionLink="/dashboard/application-tailor"
            isLocked={false}
            isCompleted={false}
            icon={<MessageSquare className="w-6 h-6" />}
          />
          <MissionCard
            title="Interview Prep"
            description="Practice with AI-powered mock interviews and get feedback"
            actionLink="/dashboard/interview-prep"
            isLocked={userTier === 'free'}
            isCompleted={false}
            icon={<Brain className="w-6 h-6" />}
          />
          <MissionCard
            title="Content Engine"
            description="Generate professional content for LinkedIn, articles, and more"
            actionLink="/dashboard/content-engine"
            isLocked={userTier === 'free' || userTier === 'pro'}
            isCompleted={false}
            icon={<BookOpen className="w-6 h-6" />}
          />
        </div>
      </div>

      {/* Workflow Analytics Section */}
      {!isLoading && workflows.length > 0 && (
        <div className="mt-8">
          <WorkflowAnalytics workflows={workflows} />
        </div>
      )}

      {/* Workflow Performance Dashboard */}
      {!isLoading && workflows.length > 0 && (
        <div className="mt-8">
          <WorkflowPerformanceDashboard />
        </div>
      )}

      {/* Analytics & Stats Section */}
      {!isLoading && (resumeCount > 0 || jobCount > 0 || brandScore !== null) && (
        <div className="mt-8">
          <StatsOverview />
          <AnalyticsCharts />
        </div>
      )}

      {/* Recent Activity - Always visible */}
      <div className="mt-8">
        <RecentActivity />
      </div>

      {/* Workflow Wizard */}
      {wizardWorkflowId && (
        <WorkflowWizard
          workflowId={wizardWorkflowId}
          isOpen={isWizardOpen}
          onClose={() => {
            setIsWizardOpen(false);
            setWizardWorkflowId(null);
            // Refresh workflows after wizard closes
            setWorkflows(WorkflowTracking.getAllWorkflows());
          }}
          onComplete={() => {
            // Refresh workflows after completion
            setWorkflows(WorkflowTracking.getAllWorkflows());
          }}
        />
      )}
    </div>
  );
}
