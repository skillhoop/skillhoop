import { Link } from 'react-router-dom';
import { 
  Flag, 
  History, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Shield, 
  Heart
} from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      
      <section className="pt-40 pb-32 bg-slate-50 relative min-h-screen overflow-hidden">
        {/* Inline Styles for specific animations used in this component */}
        <style>{`
          .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          
          {/* Header */}
          <div className="text-center mb-20">
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3 border border-neutral-200 px-3 py-1 inline-block rounded-full bg-white">Who We Are</span>
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 tracking-tighter mt-4">We Are SkillHoop</h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Democratizing career success with advanced AI
            </p>
          </div>

          {/* Mission */}
          <div className="mb-24">
            <div className="bg-neutral-900 rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-neutral-900/20">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
              <div className="relative z-10 max-w-4xl mx-auto">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                  <Flag className="text-white h-8 w-8" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                  To help job seekers beat the ATS and land their dream jobs by leveraging the same technology recruiters use.
                </p>
              </div>
            </div>
          </div>

          {/* Extended "Why We Started" Origin Story */}
          <div className="mb-32">
            <div className="flex flex-col gap-12">
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    Origin Story
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold text-neutral-900 tracking-tighter mb-8 leading-[0.95]">
                    Why We <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-neutral-900 italic">Started.</span>
                  </h2>
                  <p className="text-xl text-slate-600 font-bold leading-relaxed mb-6">
                    It started with 150 high-quality applications and exactly zero human responses.
                  </p>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    In 2023, our founding team watched as qualified engineers, designers, and managers—professionals with impeccable track records—were systematically "ghosted" by automated systems. We realized that the "ATS Black Hole" wasn't just a metaphor; it was a wall built by algorithms that valued formatting density over actual talent.
                  </p>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed mt-4">
                    We saw talented peers losing confidence, not because of their abilities, but because they didn't speak the hidden language of machine learning filters. We knew that if the machines were the gatekeepers, we had to build the keys.
                  </p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden flex flex-col justify-between h-full min-h-[450px]">
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-8">
                      <History size={24} />
                    </div>
                    <blockquote className="text-2xl font-bold text-neutral-900 tracking-tight leading-snug">
                      "The breaking point came staring at a dashboard of 'Under Review' statuses that hadn't moved in months. We knew the candidates were perfect. The silence was the catalyst."
                    </blockquote>
                    <p className="mt-8 text-slate-500 font-medium leading-relaxed">
                      This silence wasn't just a lack of communication; it was a symptom of a broken global career marketplace. We started SkillHoop to ensure that talent is never again left in the dark.
                    </p>
                  </div>
                  <div className="mt-12 flex items-center gap-4 border-t border-slate-100 pt-8">
                    <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-bold">SH</div>
                    <div>
                      <div className="text-sm font-black text-neutral-900 uppercase tracking-widest">SkillHoop Founding Team</div>
                      <div className="text-xs font-bold text-slate-400">Late Night Coding Session, 2023</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The Old Way vs The SkillHoop Way */}
          <div className="mb-24">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Old Way */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <History size={120} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold">1</span>
                  The Old Way
                </h3>
                <ul className="space-y-6">
                  {[
                    "Generic resumes that blend into the crowd",
                    "Instant rejection by ATS systems",
                    "One-size-fits-all approach",
                    "Guessing what recruiters want"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-slate-600 font-medium">
                      <div className="mt-1 min-w-[20px]">
                        <X className="text-red-400 w-5 h-5" strokeWidth={3} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* SkillHoop Way */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-emerald-600">
                  <Sparkles size={120} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">2</span>
                  The SkillHoop Way
                </h3>
                <ul className="space-y-6">
                  {[
                    "Tailored resumes optimized for each application",
                    "Data-driven insights that get you noticed",
                    "AI-powered tools that understand ATS systems",
                    "Proven success with measurable results"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-slate-700 font-bold">
                      <div className="mt-1 min-w-[20px]">
                        <div className="bg-emerald-500 rounded-full p-0.5">
                          <CheckCircle2 className="text-white w-4 h-4" strokeWidth={3} />
                        </div>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-center mb-12 text-neutral-900">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Transparency */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <Eye size={24} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Transparency</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  We believe in clear, honest communication. You'll always know how our AI works and what data we use to help you succeed.
                </p>
              </div>

              {/* Privacy First */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Privacy First</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Your data is yours. We protect your personal information with enterprise-grade security and never share it without your consent.
                </p>
              </div>

              {/* User Empowerment */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                  <Heart size={24} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">User Empowerment</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  We give you the tools and insights to take control of your career. You're in the driver's seat—we're just your co-pilot.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-slate-100 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-white rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white rounded-full opacity-50 blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6">Ready to transform your career?</h2>
              <p className="text-lg text-slate-600 font-medium mb-8 max-w-xl mx-auto">
                Join thousands of job seekers who are landing their dream jobs with SkillHoop.
              </p>
              <Link
                to="/signup"
                className="inline-block bg-neutral-900 text-white px-10 py-4 rounded-full font-bold hover:bg-slate-800 transition-all shadow-xl shadow-neutral-900/20 hover:-translate-y-1"
              >
                Get Started
              </Link>
            </div>
          </div>

        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

