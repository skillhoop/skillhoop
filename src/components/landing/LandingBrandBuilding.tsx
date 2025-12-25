import { 
  BarChart3, 
  MessageSquare, 
  Layout, 
  Linkedin, 
  Calendar, 
  ArrowRight 
} from 'lucide-react';

const LandingBrandBuilding = () => {
  return (
    <section id="brand" className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Background Blob */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-60 -z-10 pointer-events-none"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3 border border-neutral-200 px-3 py-1 inline-block rounded-full bg-white">Personal Brand</span>
            <h2 className="text-4xl font-bold text-neutral-900 tracking-tight mt-4">Own Your Narrative</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mt-4">
              Build, analyze, and strengthen your professional brand. Establish authority and discover opportunities.
            </p>
          </div>
          <button className="text-slate-500 hover:text-neutral-900 flex items-center gap-2 group font-semibold text-sm bg-white border border-slate-200 px-5 py-2.5 rounded-full hover:shadow-lg transition-all">
            View All Features <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. Brand Audit - Large (2x2) */}
          <div className="md:col-span-2 md:row-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-200 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-xl group relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                  <BarChart3 size={24}/>
                </div>
                <h3 className="text-3xl font-bold text-neutral-900 mb-3">AI Personal Brand Audit</h3>
                <p className="text-slate-500 text-lg leading-relaxed max-w-md">
                  Get actionable insights with multi-platform analysis across LinkedIn, GitHub, Portfolio, and Resume.
                </p>
              </div>
              
              {/* Visual: Radar Chart */}
              <div className="flex items-center gap-8 mt-auto">
                <div className="relative w-32 h-32 flex-shrink-0">
                  {/* Abstract Radar Chart SVG */}
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                    <polygon points="50,10 90,40 70,90 30,90 10,40" fill="rgba(37, 99, 235, 0.1)" stroke="#2563eb" strokeWidth="2" />
                    <polygon points="50,25 75,45 65,75 35,75 25,45" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    <circle cx="50" cy="10" r="3" fill="#2563eb" />
                    <circle cx="90" cy="40" r="3" fill="#2563eb" />
                    <circle cx="70" cy="90" r="3" fill="#2563eb" />
                    <circle cx="30" cy="90" r="3" fill="#2563eb" />
                    <circle cx="10" cy="40" r="3" fill="#2563eb" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600 text-lg">88</div>
                </div>
                <div className="space-y-3 w-full">
                  <div className="flex justify-between text-sm font-bold text-slate-700">
                    <span>LinkedIn</span>
                    <span className="text-blue-600">92/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[92%]"></div>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-700">
                    <span>GitHub</span>
                    <span className="text-blue-600">84/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 w-[84%]"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-40 -z-0 transform translate-x-1/3 -translate-y-1/3"></div>
          </div>

          {/* 2. Content Engine */}
          <div className="bg-neutral-900 text-white rounded-[2.5rem] p-8 border border-neutral-800 flex flex-col justify-between group hover:shadow-xl hover:shadow-neutral-900/20 transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                  <MessageSquare size={24}/>
                </div>
                <div className="bg-white text-neutral-900 px-3 py-1 rounded-full text-[10px] font-bold">AI Gen</div>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Content Engine</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Generate professional posts for LinkedIn and blogs tailored to your tone.</p>
            </div>
          </div>

          {/* 3. AI Portfolio */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-purple-200 transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
              <Layout size={24}/>
            </div>
            <h4 className="text-xl font-bold text-neutral-900 mb-2">AI Career Portfolio</h4>
            <p className="text-slate-500 text-sm leading-relaxed">Auto-generate a personal website from your resume data.</p>
          </div>

          {/* 4. LinkedIn Optimizer - Wide */}
          <div className="md:col-span-2 bg-gradient-to-br from-sky-50 to-white rounded-[2.5rem] p-8 border border-sky-100 flex flex-col sm:flex-row items-center justify-between group hover:shadow-lg transition-all duration-300">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                  <Linkedin size={20}/>
                </div>
                <h4 className="text-xl font-bold text-neutral-900">LinkedIn Optimizer</h4>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">Optimize your profile visibility. Get keyword recommendations and improvement scores to attract recruiters.</p>
            </div>
            {/* Visual */}
            <div className="mt-6 sm:mt-0 flex flex-col gap-2">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-sky-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold text-slate-700">Headline Optimized</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-sky-100 flex items-center gap-3 opacity-60">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                <span className="text-xs font-bold text-slate-500">Summary Check</span>
              </div>
            </div>
          </div>

          {/* 5. Career Event Scout */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-pink-200 transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center mb-6 text-pink-600 group-hover:rotate-12 transition-transform">
              <Calendar size={24}/>
            </div>
            <h4 className="text-xl font-bold text-neutral-900 mb-2">Career Event Scout</h4>
            <p className="text-slate-500 text-sm leading-relaxed">Discover networking events, webinars, and conferences in your area.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingBrandBuilding;

