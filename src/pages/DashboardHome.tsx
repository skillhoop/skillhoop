import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Layout, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DashboardHome() {
  const [userName, setUserName] = useState<string>('Professional');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setIsLoading(false);
          return;
        }

        // Try to fetch from profiles table first
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, name')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          // Use full_name or name from profile, or fall back to user metadata
          const name = profile.full_name || profile.name || user.user_metadata?.full_name;
          if (name) {
            setUserName(name);
          }
        } else {
          // Fall back to user metadata
          const name = user.user_metadata?.full_name;
          if (name) {
            setUserName(name);
          }
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserName();
  }, []);

  const actionCards = [
    {
      id: 1,
      icon: FileText,
      title: 'Build Your Master Resume',
      description: 'The foundation of your search. Import or create a resume to beat the ATS.',
      buttonText: 'Open Studio',
      link: '/dashboard/resume-studio',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 2,
      icon: Layout,
      title: 'Audit Your Brand',
      description: 'See how you look to recruiters on LinkedIn and beyond.',
      buttonText: 'Start Audit',
      link: '/dashboard/brand-audit',
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      id: 3,
      icon: Search,
      title: 'Find Your Next Role',
      description: 'Discover opportunities that match your skills and salary goals.',
      buttonText: 'Search Jobs',
      link: '/dashboard/job-finder',
      gradient: 'from-green-500 to-emerald-600',
    },
  ];

  return (
    <div className="pt-6">
      {/* Welcome Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
          {isLoading ? 'Welcome back!' : `Welcome back, ${userName}!`}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Let's get your career moving. Choose a starting point below.
        </p>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actionCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 shadow-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {card.description}
                </p>
              </div>

              {/* Button */}
              <Link
                to={card.link}
                className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r ${card.gradient} text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform group-hover:scale-105 shadow-md hover:shadow-lg`}
              >
                {card.buttonText}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
