import { Link } from 'react-router-dom';

export default function LandingCTA() {
  return (
    <div className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative isolate overflow-hidden bg-white px-6 py-24 sm:rounded-[2rem] sm:px-24 xl:py-32 xl:px-32 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Ready to transform your career?
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-500 font-medium">
                Start your professional growth journey with our comprehensive AI-powered career development
                platform.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full sm:flex-auto rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-neutral-900 sm:text-sm sm:leading-6"
                />
                <Link
                  to="/signup"
                  className="w-full sm:w-auto flex-none rounded-xl bg-neutral-900 px-8 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 text-center shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-400 font-medium">
                By clicking Sign Up you're confirming that you agree with our{' '}
                <Link to="/terms" className="underline hover:text-neutral-900 transition-colors">
                  Terms and Conditions
                </Link>
                .
              </p>
            </div>
            <div className="hidden lg:block relative">
              {/* Decorative blob behind image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl blur-xl opacity-50 -z-10"></div>
              <img
                className="w-full h-auto rounded-2xl object-cover shadow-lg border border-slate-100"
                src="https://ik.imagekit.io/fdd16n9cy/Gemini_Generated_Image_dshj1zdshj1zdshj.png"
                alt="Career transformation visual"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

