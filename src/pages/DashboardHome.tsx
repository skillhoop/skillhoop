import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import StatsOverview from '../components/dashboard/StatsOverview';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import RecentActivity from '../components/dashboard/RecentActivity';

export default function DashboardHome() {
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch usage count on mount
  useEffect(() => {
    const fetchUsageCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { count, error } = await supabase
          .from('ai_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching usage count:', error);
          setUsageCount(0);
        } else {
          setUsageCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching usage count:', error);
        setUsageCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageCount();
  }, []);

  // Scroll to Quick Actions
  const scrollToQuickActions = () => {
    quickActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isNewUser = usageCount === 0;

  return (
    <>
      {/* Quick Actions Section - Always Visible */}
      <div ref={quickActionsRef} className="mb-8">
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/dashboard/resume-studio')}
              className="p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1"/>
                <path d="m18 13-3.5 3.5a2 2 0 0 1-2.82 0L10 15"/>
                <path d="m15 16 4 4"/>
              </svg>
              <span className="font-medium">Resume</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/brand-audit')}
              className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 8-8 8 4 8 8-4 8-8 8-8-4-8-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span className="font-medium">Brand</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/job-finder')}
              className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <span className="font-medium">Job Finder</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/application-tailor')}
              className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
                <path d="M10 9H8"/>
              </svg>
              <span className="font-medium">Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics & Stats Section */}
      <div className="relative">
        {/* Blur overlay for new users */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : isNewUser ? (
          <>
            {/* Blurred stats container */}
            <div className="blur-sm pointer-events-none select-none">
              <StatsOverview />
              <AnalyticsCharts />
            </div>
            
            {/* Lock overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-slate-200 max-w-md text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Analytics Locked</h3>
                <p className="text-slate-600 mb-6">
                  Analytics will unlock once you generate your first career asset.
                </p>
                <button
                  onClick={scrollToQuickActions}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  Start Now
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Real stats for active users */}
            <StatsOverview />
            <AnalyticsCharts />
          </>
        )}
      </div>

      {/* Recent Activity - Always visible */}
      <div className="mt-8">
        <RecentActivity />
      </div>
    </>
  );
}
