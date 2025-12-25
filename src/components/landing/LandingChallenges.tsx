import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';

const LandingChallenges = () => {
  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-white rounded-full blur-3xl opacity-60 pointer-events-none -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-red-500 mb-3 border border-red-100 bg-red-50 px-3 py-1 inline-block rounded-full">The Problem</span>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tight mt-4">Why Talented Pros Get Stuck</h2>
          <p className="text-xl text-slate-500 font-medium">
            The modern job market is broken. Automated systems and noise make it harder than ever to stand out.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1: ATS Black Hole */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <AlertTriangle size={120} className="text-red-500 transform rotate-12"/>
             </div>
             <div className="relative z-10">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">The "ATS Black Hole"</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-6">
                  75% of resumes are rejected by automated filters before a human ever sees them. Your qualifications matter, but keywords rule.
                </p>
                <div className="w-full h-1.5 bg-red-50 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[75%] rounded-full"></div>
                </div>
                <p className="text-xs font-bold text-red-500 mt-2 text-right">75% Rejection Rate</p>
             </div>
          </div>

          {/* Card 2: Authority Gap */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield size={120} className="text-blue-500 transform -rotate-12"/>
             </div>
             <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                  <Shield size={28} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">The Authority Gap</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-6">
                  Without a visible personal brand, you're just another PDF. Qualified professionals struggle to prove their expertise online.
                </p>
                <div className="flex -space-x-2 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>)}
                </div>
                 <p className="text-xs font-bold text-blue-500 mt-2">Lost Networking Opportunities</p>
             </div>
          </div>

          {/* Card 3: Skill Stagnation */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={120} className="text-amber-500 transform rotate-6"/>
             </div>
             <div className="relative z-10">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp size={28} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Skill Stagnation</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-6">
                   Technology moves faster than university curriculums. It's unclear which skills actually yield a higher salary today.
                </p>
                <div className="flex items-end gap-1 h-8 mt-auto opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-1/4 h-[40%] bg-slate-200 rounded-t-sm"></div>
                    <div className="w-1/4 h-[60%] bg-slate-300 rounded-t-sm"></div>
                    <div className="w-1/4 h-[30%] bg-slate-200 rounded-t-sm"></div>
                    <div className="w-1/4 h-[80%] bg-amber-400 rounded-t-sm"></div>
                </div>
                <p className="text-xs font-bold text-amber-500 mt-2 text-right">Market Demand Gap</p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingChallenges;
