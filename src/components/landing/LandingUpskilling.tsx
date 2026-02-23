import { 
  Target, 
  Crosshair, 
  BarChart3, 
  BookOpen, 
  Timer, 
  Trophy 
} from 'lucide-react';

const LandingUpskilling = () => {
  return (
    <section id="upskilling" className="py-20 bg-white relative overflow-hidden">
      {/* Background Element */}
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-slate-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none"></div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3 border border-neutral-200 px-3 py-1 inline-block rounded-full bg-white">Skill Growth</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 tracking-tighter mt-4">Close the Gap</h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl">
            Identify skill gaps, learn new skills, and showcase achievements to advance your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. Upskilling Dashboard - Large Feature */}
          <div className="md:col-span-2 row-span-2 bg-neutral-900 rounded-[2.5rem] p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl hover:shadow-neutral-900/20 transition-all duration-500">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
                <Target className="text-white" size={28} />
              </div>
              <h3 className="text-3xl font-bold mb-3 text-white tracking-tight">Upskilling Dashboard</h3>
              <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                Central hub to track learning progress, active paths, and certifications. Monitor your skill level trends in real-time.
              </p>
            </div>
            {/* Visual: Progress Dashboard */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                <div className="text-xs text-slate-400 font-bold uppercase mb-2">Learning Velocity</div>
                <div className="flex items-end gap-1 h-12">
                  <div className="w-2 bg-emerald-500/50 h-[40%] rounded-t-sm"></div>
                  <div className="w-2 bg-emerald-500/70 h-[60%] rounded-t-sm"></div>
                  <div className="w-2 bg-emerald-500 h-[80%] rounded-t-sm"></div>
                  <div className="w-2 bg-emerald-400 h-[100%] rounded-t-sm animate-pulse"></div>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                <div className="text-xs text-slate-400 font-bold uppercase mb-2">Active Path</div>
                <div className="text-sm font-bold text-white mb-1">React Advanced</div>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2">
                  <div className="w-[75%] bg-slate-400 h-full rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Skill Radar */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-slate-200 transition-all duration-300 shadow-sm hover:shadow-xl group relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 text-slate-600 group-hover:scale-110 transition-transform">
                <Crosshair size={24} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Skill Radar</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Discover trending skills and compare your profile against industry demand.</p>
            </div>
            {/* Decorative Radar Lines */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 border-[20px] border-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          </div>

          {/* 3. Skill Benchmarking */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Skill Benchmarking</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Compare your skills against industry standards, peers, and top performers.</p>
          </div>

          {/* 4. Learning Path - Adjusted to Single Column (Vertical Layout) */}
          <div className="bg-gradient-to-br from-fuchsia-50 to-white rounded-[2.5rem] p-8 border border-fuchsia-100 flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 flex items-center justify-center mb-4 text-fuchsia-600">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Learning Path</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">Build personalized roadmaps. Break down goals into weekly sprints.</p>
            </div>
            {/* Visual: Vertical Path Nodes to fit 1x1 */}
            <div className="flex justify-center mt-auto">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-fuchsia-300"></div>
                <div className="w-8 h-0.5 bg-fuchsia-200"></div>
                <div className="w-4 h-4 rounded-full bg-fuchsia-500 shadow-lg shadow-fuchsia-200 ring-2 ring-white"></div>
                <div className="w-8 h-0.5 bg-fuchsia-200"></div>
                <div className="w-3 h-3 rounded-full bg-fuchsia-300"></div>
              </div>
            </div>
          </div>

          {/* 5. Learning Sprints */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-amber-200 transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 text-amber-600 group-hover:rotate-12 transition-transform">
              <Timer size={24} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Learning Sprints</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Focused 2-week learning missions to level up fast.</p>
          </div>

          {/* 6. Certifications - Now Aligned in Grid */}
          <div className="bg-neutral-900 text-white rounded-[2.5rem] p-8 border border-neutral-800 hover:shadow-2xl hover:shadow-neutral-900/30 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                <Trophy size={24} />
              </div>
              <div className="bg-white text-neutral-900 px-3 py-1 rounded-full text-[10px] font-bold">Track</div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Certifications</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Plan, track, and verify industry certifications to boost credibility.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingUpskilling;

