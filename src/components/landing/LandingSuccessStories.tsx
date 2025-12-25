import { Quote } from 'lucide-react';

const LandingSuccessStories = () => {
  return (
    <div id="success-stories" className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">Success stories</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-500 font-medium">Real professionals, real transformations</p>
          </div>
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Story 1 */}
            <div className="p-8 border border-slate-100 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="h-8">
                  <Quote className="h-8 w-auto text-slate-400" />
                </div>
                <blockquote className="mt-8 text-xl font-medium text-neutral-900">
                  <p className="leading-relaxed text-slate-600 font-medium">"SkillHoop helped me land my dream job in tech within weeks"</p>
                </blockquote>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-x-4">
                  <img
                    className="h-14 w-14 rounded-full"
                    src="https://placehold.co/56x56/e2e8f0/64748b"
                    alt=""
                  />
                  <div>
                    <div className="font-bold text-neutral-900">Sarah Johnson</div>
                    <div className="text-slate-500 font-medium text-sm">Senior product manager</div>
                  </div>
                </div>
                <a
                  href="#"
                  className="mt-8 text-neutral-900 hover:text-slate-600 font-bold flex items-center group text-sm transition-colors"
                >
                  Read case study
                  <span className="transition-transform group-hover:translate-x-1 ml-2" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </div>
            {/* Story 2 */}
            <div className="p-8 border border-slate-100 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="h-8">
                  <Quote className="h-8 w-auto text-slate-400" />
                </div>
                <blockquote className="mt-8 text-xl font-medium text-neutral-900">
                  <p className="leading-relaxed text-slate-600 font-medium">"The AI resume builder is a game-changer for job seekers"</p>
                </blockquote>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-x-4">
                  <img
                    className="h-14 w-14 rounded-full"
                    src="https://placehold.co/56x56/e2e8f0/64748b"
                    alt=""
                  />
                  <div>
                    <div className="font-bold text-neutral-900">Michael Chen</div>
                    <div className="text-slate-500 font-medium text-sm">Software engineer</div>
                  </div>
                </div>
                <a
                  href="#"
                  className="mt-8 text-neutral-900 hover:text-slate-600 font-bold flex items-center group text-sm transition-colors"
                >
                  Read case study
                  <span className="transition-transform group-hover:translate-x-1 ml-2" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingSuccessStories;

