import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight,
  FileText,
  Target,
  BarChart3,
  TrendingUp,
  Zap,
  CheckCircle2,
  Sparkles,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

export default function NewLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const trustLogos = [
    'Google', 'Microsoft', 'Meta', 'Amazon', 'Apple', 'Netflix'
  ];

  const features = [
    {
      icon: FileText,
      title: 'Smart Resume Studio',
      description: 'AI-powered resume optimization with real-time ATS scoring. Build master resumes and campaign-specific versions that get you noticed.',
    },
    {
      icon: Target,
      title: 'Application Tailor',
      description: 'Automatically customize your application for each job posting. Match keywords, optimize content, and track success rates.',
    },
    {
      icon: BarChart3,
      title: 'Personal Brand Audit',
      description: 'Comprehensive analysis of your LinkedIn, GitHub, and online presence. Get actionable insights to strengthen your professional brand.',
    },
    {
      icon: TrendingUp,
      title: 'Skill Radar',
      description: 'Track market demand for skills in real-time. Identify high-ROI learning opportunities and stay ahead of industry trends.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      credits: '5 AI credits / day',
      features: [
        'Basic resume builder',
        'Cover letter generator',
        'Job finder access',
        'Job tracker',
      ],
      cta: 'Start for free',
      highlighted: false,
    },
    {
      name: 'Job Seeker',
      price: '$19',
      priceDetail: '/ month',
      credits: '50 AI credits / day',
      features: [
        'Everything in Starter',
        'Application Tailor',
        'Interview Prep',
        'Brand Audit',
        'Portfolio Builder',
        'Advanced Analytics',
      ],
      cta: 'Start for free',
      highlighted: true,
    },
    {
      name: 'Career Architect',
      price: '$39',
      priceDetail: '/ month',
      credits: '200 AI credits / day',
      features: [
        'Everything in Job Seeker',
        'Skill Radar',
        'Skill Benchmarking',
        'Learning Path Builder',
        'Certifications',
        'Priority Support',
      ],
      cta: 'Book a call',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-2 text-center text-sm">
        <span className="mr-2">🎉</span>
        New: AI Personal Brand Audit 2.0 is here
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <svg
                className="h-8 w-auto text-white"
                viewBox="0 0 32 32"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 4H20V20H4V4Z"></path>
                <path d="M12 12H28V28H12V12Z" fillOpacity="0.7"></path>
              </svg>
              <span className="text-xl font-medium">SkillHoop</span>
            </Link>

            {/* Desktop Navigation - Hidden, only hamburger shown */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile/Desktop Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-white/5 bg-[#0A0A0A]">
            <nav className="max-w-7xl mx-auto px-6 lg:px-8 py-6 space-y-1">
              <a href="#features" className="block py-3 text-lg hover:text-white/60 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#pricing" className="block py-3 text-lg hover:text-white/60 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Pricing
              </a>
              <Link to="/about" className="block py-3 text-lg hover:text-white/60 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
              <Link to="/blog" className="block py-3 text-lg hover:text-white/60 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Blog
              </Link>
              <div className="pt-4 space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 px-6 text-center border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="block w-full py-3 px-6 text-center bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start for free
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
            The AI-powered career operating system
          </h1>
          
          <p className="text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed">
            SkillHoop helps professionals build ATS-optimized resumes, track job applications, 
            and grow their personal brand—all powered by OpenAI GPT-4o-mini.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black rounded-lg hover:bg-white/90 transition-all font-medium group"
            >
              Start for free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 border border-white/20 rounded-lg hover:bg-white/5 transition-all font-medium">
              Try our live demo
            </button>
          </div>

          {/* Trust Logos */}
          <div className="space-y-4">
            <p className="text-sm text-white/40 uppercase tracking-wide">Trusted by professionals at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
              {trustLogos.map((logo) => (
                <div key={logo} className="text-lg font-medium">{logo}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Screenshot Section */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Tilted Screenshot Container */}
            <div className="transform perspective-1000">
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 p-8">
                  {/* Mock Dashboard Interface */}
                  <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Sidebar */}
                    <div className="col-span-3 bg-white/5 rounded-lg p-4 space-y-2">
                      <div className="h-8 bg-white/10 rounded"></div>
                      <div className="h-8 bg-white/5 rounded"></div>
                      <div className="h-8 bg-white/5 rounded"></div>
                      <div className="h-8 bg-white/5 rounded"></div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="col-span-9 space-y-4">
                      {/* Header */}
                      <div className="h-12 bg-white/5 rounded-lg flex items-center px-4">
                        <div className="h-6 w-48 bg-white/10 rounded"></div>
                      </div>
                      
                      {/* Stats Cards */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-4">
                          <div className="h-4 w-20 bg-indigo-300/30 rounded mb-2"></div>
                          <div className="h-8 w-16 bg-indigo-300/50 rounded"></div>
                        </div>
                        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                          <div className="h-4 w-20 bg-purple-300/30 rounded mb-2"></div>
                          <div className="h-8 w-16 bg-purple-300/50 rounded"></div>
                        </div>
                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4">
                          <div className="h-4 w-20 bg-emerald-300/30 rounded mb-2"></div>
                          <div className="h-8 w-16 bg-emerald-300/50 rounded"></div>
                        </div>
                      </div>
                      
                      {/* Chart Area */}
                      <div className="bg-white/5 rounded-lg p-4 flex-1">
                        <div className="flex items-end justify-between h-32 gap-2">
                          {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500/50 to-purple-500/30 rounded-t" style={{ height: `${height}%` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - White Background */}
      <section id="features" className="bg-white text-black py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Everything you need to<br />accelerate your career
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              Seven integrated workflows that transform career management from chaos to clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="space-y-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-lg text-black/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section - Dark Background */}
      <section className="bg-[#0A0A0A] py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                10,000+
              </div>
              <p className="text-lg text-white/60">Professionals using SkillHoop</p>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                92%
              </div>
              <p className="text-lg text-white/60">Average ATS score improvement</p>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                50K+
              </div>
              <p className="text-lg text-white/60">Resumes optimized with AI</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section - White Background */}
      <section className="bg-white text-black py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Built for the modern<br />job seeker
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              Powered by OpenAI GPT-4o-mini, integrated with Supabase, and built with modern web technologies.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { icon: Sparkles, title: 'AI-Powered Optimization', desc: 'Every feature uses advanced AI to analyze, optimize, and improve your career materials automatically.' },
              { icon: Zap, title: 'Real-time ATS Scoring', desc: 'Get instant feedback on how well your resume matches job requirements and ATS systems.' },
              { icon: TrendingUp, title: 'Market Intelligence', desc: 'Track skill demand trends, salary ranges, and hiring patterns in real-time.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-6 items-start border-b border-black/10 pb-8 last:border-0">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-lg text-black/60">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section - Dark Background */}
      <section id="pricing" className="bg-[#0A0A0A] py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Pay for what you use with our flexible credit system. Start free, upgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-white text-black border-2 border-white'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.priceDetail && <span className="text-lg opacity-60">{plan.priceDetail}</span>}
                  </div>
                  <p className={`text-sm ${plan.highlighted ? 'text-black/60' : 'text-white/60'}`}>
                    {plan.credits}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-black' : 'text-white'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-black/80' : 'text-white/80'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`block w-full py-3 px-6 text-center rounded-lg font-medium transition-all ${
                    plan.highlighted
                      ? 'bg-black text-white hover:bg-black/90'
                      : 'bg-white/10 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - White Background */}
      <section className="bg-white text-black py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Start building your career OS today
          </h2>
          <p className="text-xl text-black/60 mb-12 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their job search with SkillHoop.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-lg hover:bg-black/90 transition-all font-medium group"
            >
              Start for free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 border border-black/20 rounded-lg hover:bg-black/5 transition-all font-medium">
              Book a call
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}