import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LandingNavbar from '@/components/landing/LandingNavbar';
import SunAnimation from '@/components/landing/SunAnimation';
import LandingChallenges from '@/components/landing/LandingChallenges';
import LandingWorkflows from '@/components/landing/LandingWorkflows';
import LandingCareerHub from '@/components/landing/LandingCareerHub';
import LandingBrandBuilding from '@/components/landing/LandingBrandBuilding';
import LandingUpskilling from '@/components/landing/LandingUpskilling';
import LandingSmartFeatures from '@/components/landing/LandingSmartFeatures';
import LandingSuccessStories from '@/components/landing/LandingSuccessStories';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';

// Main LandingPage Component
export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      <LandingNavbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-40 pb-16 lg:pt-48 lg:pb-20 overflow-hidden bg-white">
          {/* Background Image Integration - Seamless & Behind Text */}
          <div className="absolute top-0 right-0 w-full lg:w-3/5 h-full pointer-events-none z-0 overflow-hidden">
            {/* Image */}
            <img 
              src="https://ik.imagekit.io/fdd16n9cy/Gemini_Generated_Image_dshj1zdshj1zdshj.png"
              alt="Abstract background"
              className="w-full h-full object-cover opacity-80 mix-blend-multiply"
            />
            {/* Gradient Masks for Seamless Blending */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white"></div>
          </div>

          {/* Background with very subtle pastel blobs & Grid */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Content */}
              <div className="space-y-10 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-900/5 backdrop-blur-sm text-slate-900 text-xs font-bold tracking-wide uppercase shadow-sm cursor-default">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                  </span>
                  Career Growth Ecosystem
        </div>

                <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter text-neutral-900 leading-[1.05]">
                  Your Career, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 via-slate-800 to-neutral-900">
                    Clarified by AI.
                  </span>
                </h1>
                
                <p className="text-xl text-slate-500 max-w-xl leading-relaxed font-normal">
                  A comprehensive career development platform that helps professionals build resumes, analyze their brand, and track career progress using AI.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5">
                  <Link
                    to="/signup"
                    className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-10 py-4 rounded-full font-bold hover:bg-slate-800 transition-all shadow-xl shadow-neutral-900/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-neutral-900/30"
                  >
                    Start Building Free <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button className="flex items-center justify-center gap-2 px-10 py-4 rounded-full font-semibold text-neutral-900 border border-slate-200 hover:bg-slate-50 hover:border-neutral-900 transition-all bg-white shadow-sm hover:shadow-lg">
                    Watch Demo
                  </button>
                </div>

                <div className="pt-6 flex items-center gap-6 border-t border-slate-100 mt-6">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs text-slate-600 font-bold shadow-md">
                        {String.fromCharCode(64+i)}
                    </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex text-neutral-900 gap-1 mb-1">
                      <Star size={14} fill="currentColor"/>
                      <Star size={14} fill="currentColor"/>
                      <Star size={14} fill="currentColor"/>
                      <Star size={14} fill="currentColor"/>
                      <Star size={14} fill="currentColor"/>
                    </div>
                    <p className="text-sm font-bold text-slate-900">Trusted by 10,000+ pros</p>
                  </div>
          </div>
        </div>

              {/* Right Visual (Sun + Stars Animation) */}
              <div className="relative hidden lg:flex justify-center items-center min-h-[500px]">
                <div className="relative mb-28 scale-90 xl:scale-100 z-10">
                  <SunAnimation />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Challenges Section */}
        <LandingChallenges />

        {/* Workflows Section */}
        <LandingWorkflows />

        {/* Career Hub Section */}
        <LandingCareerHub />

        {/* Brand Building Section */}
        <LandingBrandBuilding />

        {/* Upskilling Section */}
        <LandingUpskilling />

        {/* Smart Features Section */}
        <LandingSmartFeatures />

        {/* Success Stories Section */}
        <LandingSuccessStories />

        {/* CTA Section */}
        <LandingCTA />

      </main>

      <LandingFooter />
    </div>
  );
}
