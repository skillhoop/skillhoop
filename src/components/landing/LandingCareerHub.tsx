import { 
  Layout, 
  FileText, 
  Search, 
  Crosshair, 
  PenTool, 
  MessageSquare, 
  FolderOpen 
} from 'lucide-react';

const LandingCareerHub = () => {
  return (
    <section id="hub" className="py-20 bg-white relative overflow-hidden">
      {/* --- Internal Styles for Animations --- */}
      <style>{`
        @keyframes fill-circle {
          0% { stroke-dashoffset: 251; }
          100% { stroke-dashoffset: 35; }
        }
        .animate-fill-circle {
          animation: fill-circle 1.5s ease-out forwards;
          animation-delay: 0.5s; 
        }
        /* Optional: Fade mask for the Kanban scrolling area */
        .mask-linear-fade {
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
      `}</style>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 text-center md:text-left">
          <span className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3 border border-neutral-200 px-3 py-1 inline-block rounded-full bg-white">Ecosystem</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 tracking-tighter mt-4">Career Hub</h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl">
            A complete ecosystem for your job search. From discovery to interview, manage every step with AI-powered tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. Job Tracker - Large Feature */}
          <div className="md:col-span-2 row-span-2 bg-neutral-900 rounded-[2.5rem] p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden relative group transition-all duration-500 hover:shadow-2xl hover:shadow-neutral-900/20">
            {/* Abstract Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
                <Layout className="text-white" size={28} />
              </div>
              <h3 className="text-3xl font-bold mb-3 text-white tracking-tight">Job Tracker</h3>
              <p className="text-slate-400 max-w-sm text-lg leading-relaxed">
                Organize your entire application pipeline. Drag-and-drop status updates, track interview dates, and get AI insights.
              </p>
            </div>

            {/* Visual: Interactive Kanban Board Animation */}
            <div className="mt-10 flex gap-5 overflow-hidden relative mask-linear-fade">
              {/* Column 1 */}
              <div className="w-56 bg-white/5 rounded-xl p-4 border border-white/10 flex-shrink-0 transform transition-transform duration-500 group-hover:-translate-y-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-1.5 w-12 bg-indigo-400 rounded-full"></div>
                  <div className="text-[10px] text-slate-500 font-bold">3 JOBS</div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 p-3 rounded-lg border border-white/5 hover:bg-white/15 transition-colors cursor-default">
                    <div className="h-2 w-24 bg-slate-400 rounded-full mb-2"></div>
                    <div className="h-1.5 w-16 bg-slate-600 rounded-full"></div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                    <div className="h-2 w-20 bg-slate-400 rounded-full mb-2"></div>
                    <div className="h-1.5 w-12 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              {/* Column 2 */}
              <div className="w-56 bg-white/5 rounded-xl p-4 border border-white/10 flex-shrink-0 transform transition-transform duration-700 delay-75 group-hover:-translate-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-1.5 w-12 bg-emerald-400 rounded-full"></div>
                  <div className="text-[10px] text-slate-500 font-bold">1 ACTIVE</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-l-emerald-400 transform transition-transform hover:scale-105 cursor-default">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-2.5 w-24 bg-neutral-900 rounded-full"></div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">NEW</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="h-5 w-5 rounded-full bg-slate-200 border border-white"></div>
                    <div className="h-1.5 w-10 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
              </div>
              {/* Column 3 */}
              <div className="w-56 bg-white/5 rounded-xl p-4 border border-white/10 flex-shrink-0 transform transition-transform duration-500 delay-100 group-hover:-translate-y-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-1.5 w-12 bg-amber-400 rounded-full"></div>
                  <div className="text-[10px] text-slate-500 font-bold">PENDING</div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                  <div className="h-2 w-20 bg-slate-400 rounded-full mb-2"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Resume Studio */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Resume Studio</h3>
            <p className="text-slate-500 text-sm leading-relaxed">AI-powered builder with real-time ATS optimization and smart templates.</p>
          </div>

          {/* 3. Job Finder */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-purple-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
              <Search size={24} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Job Finder</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Discover opportunities with predictive matching scores tailored to your profile.</p>
          </div>

          {/* 4. Application Tailor - Wide */}
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-white rounded-[2.5rem] p-8 border border-indigo-100/50 flex flex-col sm:flex-row items-center justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="relative z-10 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 text-indigo-600 group-hover:rotate-12 transition-transform duration-300">
                <Crosshair size={24} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Application Tailor</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Auto-tailor resumes to specific job descriptions. Boosts your match score instantly.</p>
            </div>
            {/* Visual: Match Score Animation */}
            <div className="mt-6 sm:mt-0 relative group-hover:scale-105 transition-transform duration-500">
              <div className="bg-white p-5 rounded-3xl shadow-lg border border-indigo-50 relative z-10">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#e0e7ff" strokeWidth="8" fill="none" />
                    <circle 
                      cx="48" cy="48" r="40" 
                      stroke="#4f46e5" strokeWidth="8" 
                      fill="none" 
                      strokeDasharray="251" 
                      strokeDashoffset="251" 
                      strokeLinecap="round" 
                      className="animate-fill-circle"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-600">92%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Match</span>
                  </div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-200 rounded-full opacity-20 blur-xl animate-pulse"></div>
            </div>
          </div>

          {/* 5. Cover Letter Gen */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-pink-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center mb-6 text-pink-600 group-hover:scale-110 transition-transform">
              <PenTool size={24} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Smart Cover Letter</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Personalized content generation based on resume & JD analysis.</p>
          </div>

          {/* 6. Interview Prep */}
          <div className="bg-neutral-900 text-white rounded-[2.5rem] p-8 border border-neutral-800 hover:shadow-2xl hover:shadow-neutral-900/30 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                <MessageSquare size={24} />
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-wider uppercase">AI Mock</div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Interview Prep</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Practice with AI feedback on behavioral & technical questions.</p>
          </div>

          {/* 7. Work History Manager */}
          <div className="md:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-orange-200 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col sm:flex-row items-center gap-8 group">
            <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600 group-hover:rotate-6 transition-transform duration-300">
              <FolderOpen size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Work History Manager</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
                The central repository for your career. Manage versions of resumes, cover letters, and application materials. Track document status and analytics in one secure place.
              </p>
              <div className="flex gap-3 mt-4">
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">Version Control</div>
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">Analytics</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingCareerHub;

