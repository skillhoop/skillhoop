import { Link } from 'react-router-dom';

export default function LandingCTA() {
  return (
    <div className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative isolate overflow-hidden bg-white px-6 py-24 sm:rounded-3xl sm:px-24 xl:py-32 xl:px-32 shadow-xl shadow-slate-200/50"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Ready to transform your career?
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Start your professional growth journey with our comprehensive AI-powered career development
                platform.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full sm:flex-auto rounded-md border-0 bg-gray-100 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <Link
                  to="/signup"
                  className="w-full sm:w-auto flex-none rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 text-center"
                >
                  Sign Up
                </Link>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                By clicking Sign Up you're confirming that you agree with our{' '}
                <a href="#" className="underline hover:text-gray-900">
                  Terms and Conditions
                </a>
                .
              </p>
            </div>
            <div className="hidden lg:block">
              <img
                className="w-full h-auto rounded-xl object-cover"
                src="https://ik.imagekit.io/fdd16n9cy/di.png?updatedAt=1757770843990"
                alt="Career transformation visual"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

