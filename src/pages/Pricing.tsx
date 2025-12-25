import { useState } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { 
  CheckCircle2, 
  Minus, 
  Plus, 
  Sparkles, 
  HelpCircle 
} from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
}

interface Feature {
  name: string;
  tip: string;
}

interface ComparisonFeature {
  name: string;
  starter: string | boolean;
  seeker: string | boolean;
  architect: string | boolean;
}

interface ComparisonCategory {
  category: string;
  features: ComparisonFeature[];
}

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs: FAQ[] = [
    { q: "Can I change plans later?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
    { q: "Is there a free trial?", a: "Yes! The Starter plan is free forever. Paid plans come with a 14-day free trial." },
    { q: "Can I cancel anytime?", a: "Absolutely. You can cancel your subscription at any time with no cancellation fees." },
    { q: "How do AI credits work?", a: "AI credits are used for generating cover letters, optimizing resumes, and mock interviews. Your credits refresh daily based on your plan tier." },
    { q: "Is my personal data secure?", a: "Yes, we use bank-level encryption to protect your data. We never share your personal information with third parties without your consent." },
    { q: "Do you offer discounts for students?", a: "Yes! We offer a 50% discount for students with a valid .edu email address. Contact support to apply." }
  ];

  // Comparison Data
  const comparisonData: ComparisonCategory[] = [
    { 
      category: "Core Tools", 
      features: [
        { name: "Resume Builder", starter: "1 Active", seeker: "Unlimited", architect: "Unlimited" },
        { name: "Cover Letter Generator", starter: "3 / month", seeker: "Unlimited", architect: "Unlimited" },
        { name: "Job Tracker Pipeline", starter: true, seeker: true, architect: true },
        { name: "Document Versions", starter: "1", seeker: "10", architect: "Unlimited" },
      ]
    },
    { 
      category: "AI Intelligence", 
      features: [
        { name: "AI Optimization Credits", starter: "10 / mo", seeker: "500 / mo", architect: "Unlimited" },
        { name: "Resume Parsing & Auto-Fill", starter: false, seeker: true, architect: true },
        { name: "Smart Interview Prep", starter: false, seeker: "Standard", architect: "Advanced + Audio" },
        { name: "LinkedIn Profile Audit", starter: false, seeker: true, architect: true },
      ]
    },
    { 
      category: "Growth & Support", 
      features: [
        { name: "Skill Gap Analysis", starter: false, seeker: "Basic", architect: "Deep Dive" },
        { name: "Market Salary Data", starter: false, seeker: true, architect: true },
        { name: "Personal Portfolio Site", starter: false, seeker: false, architect: true },
        { name: "Customer Support", starter: "Community", seeker: "Email", architect: "Priority 24/7" },
      ]
    }
  ];

  const renderFeatureValue = (val: string | boolean) => {
    if (val === true) return <CheckCircle2 className="mx-auto text-emerald-500 w-5 h-5" />;
    if (val === false) return <Minus className="mx-auto text-slate-300 w-5 h-5" />;
    return <span className="font-bold text-slate-700 text-sm">{val}</span>;
  };

  // Dynamic pricing based on billing cycle
  const prices = {
    starter: 0,
    jobSeeker: billingCycle === 'monthly' ? 19 : 15,
    architect: billingCycle === 'monthly' ? 39 : 29
  };

  // Feature definitions with tooltips
  const starterFeatures: Feature[] = [
    { name: "Basic resume builder", tip: "Create and export 1 resume with standard templates" },
    { name: "Cover letter generator", tip: "Generate 3 tailored cover letters per month" },
    { name: "Job finder access", tip: "Search aggregated listings from major boards" },
    { name: "Job tracker", tip: "Kanban board to manage application status" },
    { name: "Limited AI features", tip: "Basic keyword matching suggestions" }
  ];

  const seekerFeatures: Feature[] = [
    { name: "Everything in Starter", tip: "Includes all Starter features" },
    { name: "Unlimited AI content", tip: "Unlimited AI generations for resumes & letters" },
    { name: "Advanced analytics", tip: "Track views, application rates, and profile performance" },
    { name: "Brand audit tools", tip: "Analyzes your LinkedIn & GitHub for keyword gaps" },
    { name: "Content engine access", tip: "AI-generated LinkedIn posts to boost visibility" },
    { name: "Portfolio builder", tip: "One-click personal website from your resume" },
    { name: "Priority support", tip: "Email support with under 24h response time" }
  ];

  const architectFeatures: Feature[] = [
    { name: "Everything in Job Seeker", tip: "Includes all Job Seeker features" },
    { name: "Unlimited everything", tip: "No caps on any platform features" },
    { name: "Advanced analytics", tip: "Market salary data and deep skill gap analysis" },
    { name: "Learning path builder", tip: "AI-curated curriculum for your career goals" },
    { name: "Skill benchmarking", tip: "Compare your technical skills vs industry top 10%" },
    { name: "Certification tracking", tip: "Manage renewals and verify credentials" },
    { name: "Dedicated support", tip: "24/7 priority access with success manager" },
    { name: "Early access to features", tip: "Beta test new tools before public release" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNavbar />
      
      <section className="pt-40 pb-32 bg-slate-50 relative min-h-screen">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3 border border-neutral-200 px-3 py-1 inline-block rounded-full bg-white">Choose Your Plan</span>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tighter mt-4">Select the perfect plan to<br/> accelerate your career journey</h2>
          </div>

          {/* Monthly vs Annual Toggle */}
          <div className="flex justify-center mb-16">
            <div className="relative flex w-72 bg-slate-200 p-1 rounded-xl shadow-inner">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-black/5 transition-all duration-300 ease-out z-0 ${
                  billingCycle === 'monthly' ? 'left-1' : 'left-[calc(50%+2px)]'
                }`}
              ></div>
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`w-1/2 relative z-10 py-2.5 text-sm font-bold transition-colors duration-200 ${
                  billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('annual')}
                className={`w-1/2 relative z-10 py-2.5 text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                  billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Annual <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-extrabold">-20%</span>
              </button>
            </div>
          </div>

          {/* Grid Container */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto items-start">
            
            {/* Starter */}
            <div className="bg-white rounded-2xl p-2.5 shadow-xl hover:shadow-2xl transition-all duration-300 w-full h-full">
              <div className="bg-slate-50 rounded-xl p-6 pt-12 relative h-full flex flex-col">
                {/* Pricing Tag */}
                <div className="absolute top-6 right-0 bg-slate-200 rounded-l-full py-2 px-5 flex items-center shadow-sm">
                  <span className="text-slate-800 font-bold text-xl">${prices.starter} <small className="text-slate-500 text-xs font-medium ml-1">/ mo</small></span>
                </div>
                
                <h3 className="font-bold text-xl text-slate-800">Starter</h3>
                <p className="mt-3 text-slate-500 text-sm leading-relaxed font-medium">Perfect for getting started with basic tools.</p>
                
                <ul className="mt-8 space-y-4 flex-1">
                  {starterFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                      <span className="bg-[#e2e8f0] flex items-center justify-center rounded-full w-6 h-6 text-slate-600 shrink-0 shadow-sm">
                        <CheckCircle2 size={14} strokeWidth={3} />
                      </span>
                      <span>{feature.name}</span>
                      <div className="group relative ml-auto">
                        <HelpCircle size={14} className="text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-neutral-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center font-normal pointer-events-none shadow-xl border border-white/10">
                          {feature.tip}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900"></div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 w-full">
                  <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl py-3.5 text-center transition-all shadow-lg hover:shadow-slate-800/20 hover:-translate-y-0.5">
                    Get Started
                  </button>
                </div>
              </div>
            </div>

            {/* Job Seeker (Most Popular) */}
            <div className="bg-[#171717] rounded-2xl p-2.5 shadow-2xl shadow-neutral-900/50 w-full transform md:scale-105 z-10 h-full relative border border-neutral-800">
              {/* Most Popular Badge */}
              <div className="absolute -top-5 left-0 right-0 flex justify-center z-20">
                 <div className="bg-emerald-200 text-emerald-950 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg border border-emerald-100 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-emerald-700" />
                  Most Popular
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 pt-12 relative h-full flex flex-col border border-white/10">
                {/* Pricing Tag */}
                <div className="absolute top-6 right-0 bg-emerald-200 rounded-l-full py-2 px-5 flex items-center shadow-lg">
                  <span className="text-emerald-950 font-bold text-xl">${prices.jobSeeker} <small className="text-emerald-800 text-xs font-medium ml-1">/ mo</small></span>
                </div>

                <h3 className="font-bold text-xl text-white">Job Seeker</h3>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed font-medium">For serious job seekers needing AI power.</p>
                
                <ul className="mt-8 space-y-4 flex-1">
                  {seekerFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-200 font-bold text-sm">
                      <span className="bg-emerald-200 flex items-center justify-center rounded-full w-6 h-6 text-emerald-950 shrink-0 shadow-sm shadow-emerald-200/20">
                        <CheckCircle2 size={14} strokeWidth={3} />
                      </span>
                      <span>{feature.name}</span>
                      <div className="group relative ml-auto">
                        <HelpCircle size={14} className="text-slate-500 cursor-help hover:text-white transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white text-slate-900 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center font-bold pointer-events-none shadow-xl">
                          {feature.tip}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 w-full">
                  <button className="w-full bg-white hover:bg-slate-200 text-[#171717] font-bold rounded-xl py-3.5 text-center transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>

            {/* Career Architect */}
            <div className="bg-white rounded-2xl p-2.5 shadow-xl hover:shadow-2xl transition-all duration-300 w-full h-full">
              <div className="bg-slate-50 rounded-xl p-6 pt-12 relative h-full flex flex-col">
                {/* Pricing Tag */}
                <div className="absolute top-6 right-0 bg-purple-200 rounded-l-full py-2 px-5 flex items-center shadow-sm">
                  <span className="text-purple-900 font-bold text-xl">${prices.architect} <small className="text-purple-600 text-xs font-medium ml-1">/ mo</small></span>
                </div>

                <h3 className="font-bold text-xl text-slate-800">Career Architect</h3>
                <p className="mt-3 text-slate-500 text-sm leading-relaxed font-medium">Complete career management ecosystem.</p>
                
                <ul className="mt-8 space-y-4 flex-1">
                  {architectFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                      <span className="bg-purple-500 flex items-center justify-center rounded-full w-6 h-6 text-white shrink-0 shadow-sm">
                        <CheckCircle2 size={14} strokeWidth={3} />
                      </span>
                      <span>{feature.name}</span>
                      <div className="group relative ml-auto">
                        <HelpCircle size={14} className="text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-neutral-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center font-normal pointer-events-none shadow-xl border border-white/10">
                          {feature.tip}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900"></div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 w-full">
                  <button className="w-full bg-neutral-900 hover:bg-slate-800 text-white font-bold rounded-xl py-3.5 text-center transition-all shadow-lg hover:shadow-neutral-900/20 hover:-translate-y-0.5">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Social Proof Strip */}
          <div className="mb-24 flex flex-col items-center animate-fade-in-up delay-100">
            <p className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-wide">SkillHoop users have landed jobs at</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
              
              {/* Google Logo (G Icon) */}
              <div className="group opacity-50 hover:opacity-100 transition-all duration-300 cursor-default" title="Google">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-800 group-hover:text-blue-600 transition-colors duration-300 group-hover:drop-shadow-[0_0_12px_rgba(37,99,235,0.4)]" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
              </div>

              {/* Amazon Logo (Icon) */}
              <div className="group opacity-50 hover:opacity-100 transition-all duration-300 cursor-default" title="Amazon">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-800 group-hover:text-[#FF9900] transition-colors duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,153,0,0.4)]" fill="currentColor">
                  <path d="M13.633 11.23c-1.226-2.812-4.05-3.328-5.748-1.574 1.14 3.75 5.567 2.486 5.748 1.574zm1.964-6.726c-1.32-.42-2.316.31-2.316.31s-.345-1.282-2.583-1.077c-2.88.264-4.028 2.502-3.82 4.148.064.504.28.66.44.62.482-.122.56-.662.4-1.282-.442-1.682 1.04-2.222 2.06-2.102 1.62.182 1.42 1.942 1.42 1.942l-1.92.54c-3.18.9-4.3 3.52-2.92 5.54 1.54 2.26 4.62 1.6 5.9-1.26 0 0 .12 1.04 1.5 1.04 1.18 0 2.22-.84 2.22-.84s.18-2.6.22-4.66c.04-2.82-.96-2.76-2.6-2.96zM12.025 18.25c-3.96 1.44-7.3-1.1-7.3-1.1s.66 2.22 4.18 2.22c2.82 0 5.08-2.52 5.08-2.52s-.66.86-1.96 1.4zm5.56-1.18c-.8.88-1.36.78-1.36.78s.32.74 1.7.16c1.38-.6 1.64-1.56 1.64-1.56-.3.26-1.98.62-1.98.62z"/>
                </svg>
              </div>

              {/* Spotify Logo (Icon) */}
              <div className="group opacity-50 hover:opacity-100 transition-all duration-300 cursor-default" title="Spotify">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-800 group-hover:text-[#1DB954] transition-colors duration-300 group-hover:drop-shadow-[0_0_12px_rgba(29,185,84,0.4)]" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S16.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.66.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.4-1.02 15.96 1.74.539.3.66 1.02.359 1.56-.3.48-1.02.66-1.559.36z"/>
                </svg>
              </div>

              {/* Netflix Logo (N Icon) */}
              <div className="group opacity-50 hover:opacity-100 transition-all duration-300 cursor-default" title="Netflix">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-800 group-hover:text-[#E50914] transition-colors duration-300 group-hover:drop-shadow-[0_0_12px_rgba(229,9,20,0.4)]" fill="currentColor">
                  <path d="M16.5 2h-2L9 12.2V2H5v20h2l5.5-10.2V22h4V2z"/>
                </svg>
              </div>

              {/* Y Combinator Logo (Icon) */}
              <div className="group opacity-50 hover:opacity-100 transition-all duration-300 cursor-default" title="Y Combinator">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-800 group-hover:text-[#F26522] transition-colors duration-300 group-hover:drop-shadow-[0_0_12px_rgba(242,101,34,0.4)]" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:fill-[#F26522] group-hover:stroke-none transition-all duration-300"/>
                  <path d="M7 7l4 6v5h2v-5l4-6h-2.5L12 10.8 9.5 7H7z" className="group-hover:fill-white transition-colors duration-300"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Detailed Feature Comparison Table */}
          <div className="max-w-5xl mx-auto mb-24 animate-fade-in-up delay-200 px-4 md:px-0">
            <h3 className="text-3xl font-bold text-center mb-10 text-neutral-900">Detailed Comparison</h3>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-4 p-6 bg-slate-50 border-b border-slate-200 gap-4">
                    <div className="col-span-1"></div>
                    <div className="text-center font-bold text-slate-800 text-lg">Starter</div>
                    <div className="text-center font-bold text-emerald-700 text-lg">Job Seeker</div>
                    <div className="text-center font-bold text-purple-700 text-lg">Architect</div>
                  </div>

                  {comparisonData.map((section, idx) => (
                    <div key={idx}>
                      <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 font-bold text-xs uppercase tracking-widest text-slate-500">
                        {section.category}
                      </div>
                      {section.features.map((feat, fIdx) => (
                        <div key={fIdx} className="grid grid-cols-4 p-4 border-b border-slate-100 hover:bg-slate-50/80 transition-colors items-center gap-4">
                          <div className="font-medium text-slate-700 text-sm">{feat.name}</div>
                          <div className="text-center">{renderFeatureValue(feat.starter)}</div>
                          <div className="text-center">{renderFeatureValue(feat.seeker)}</div>
                          <div className="text-center">{renderFeatureValue(feat.architect)}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-10 text-neutral-900">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:border-slate-300">
                  <button 
                    className="w-full flex justify-between items-center p-6 text-left"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span className="font-bold text-lg text-slate-800">{faq.q}</span>
                    {openFaq === idx ? <Minus className="text-slate-400" /> : <Plus className="text-slate-400" />}
                  </button>
                  <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}>
                    <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
