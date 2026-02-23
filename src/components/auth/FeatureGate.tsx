import { useEffect, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import LoadingScreen from '../ui/LoadingScreen';

type Tier = 'free' | 'pro' | 'ultimate';
type RequiredTier = 'pro' | 'ultimate';

interface FeatureGateProps {
  requiredTier: RequiredTier;
  children: ReactNode;
}

const TIER_HIERARCHY: Record<Tier, number> = {
  free: 0,
  pro: 1,
  ultimate: 2,
};

const TIER_NAMES: Record<Tier, string> = {
  free: 'Free',
  pro: 'Job Seeker',
  ultimate: 'Career Architect',
};

export default function FeatureGate({ requiredTier, children }: FeatureGateProps) {
  const [userTier, setUserTier] = useState<Tier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('Please log in to access this feature');
          setIsLoading(false);
          return;
        }

        // Fetch user profile to get tier
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          // Default to 'free' if profile doesn't exist
          setUserTier('free');
        } else {
          setUserTier((profile.tier as Tier) || 'free');
        }
      } catch (err) {
        console.error('Error fetching user tier:', err);
        setError('Failed to load user information');
        setUserTier('free'); // Default to free on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTier();
  }, []);

  if (isLoading) {
    return (
      <LoadingScreen
        message="Just a moment..."
        subMessage="Screen loading"
        className="bg-gradient-to-br from-slate-50 via-slate-50 to-purple-50"
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50 to-purple-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Required</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Check if user has access
  const hasAccess = userTier && TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show gate UI for blocked users
  const tierName = TIER_NAMES[requiredTier];
  const isProRequired = requiredTier === 'pro';
  const planName = isProRequired ? 'Job Seeker' : 'Career Architect';

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50 to-purple-50 p-4">
      <div className="max-w-2xl w-full">
        <div
          className="glass-effect rounded-2xl p-8 md:p-12 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Icon/Illustration */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Lock className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-400" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Unlock Your Full Career Potential
          </h1>

          {/* Body Text */}
          <p className="text-lg text-slate-600 mb-2 max-w-xl mx-auto">
            This advanced tool is available on the <span className="font-semibold text-slate-600">{planName}</span> plan.
          </p>
          <p className="text-base text-slate-500 mb-8 max-w-xl mx-auto">
            Upgrade to accelerate your journey with unlimited AI power and unlock all premium features.
          </p>

          {/* CTA Button */}
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-slate-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            View Plans & Pricing
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Current plan: <span className="font-medium text-slate-700">{TIER_NAMES[userTier || 'free']}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

