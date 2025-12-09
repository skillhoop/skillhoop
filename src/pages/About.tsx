import { Link } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-50 via-white to-violet-50/30 py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-800 mb-6 leading-tight">
                We Are Career Clarified
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed">
                Democratizing career success with advanced AI
              </p>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
                Our Mission
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                To help job seekers beat the ATS and land their dream jobs by leveraging the same technology recruiters use.
              </p>
            </div>
          </div>
        </section>

        {/* The Problem vs. Solution Section */}
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* The Old Way */}
              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-slate-200">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
                  The Old Way
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-4"></div>
                    <p className="text-slate-600 text-lg">Generic resumes that blend into the crowd</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-4"></div>
                    <p className="text-slate-600 text-lg">Instant rejection by ATS systems</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-4"></div>
                    <p className="text-slate-600 text-lg">One-size-fits-all approach</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-4"></div>
                    <p className="text-slate-600 text-lg">Guessing what recruiters want</p>
                  </div>
                </div>
              </div>

              {/* The Career Clarified Way */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-8 sm:p-10 shadow-lg border border-indigo-200">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
                  The Career Clarified Way
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-4"></div>
                    <p className="text-slate-600 text-lg">Tailored resumes optimized for each application</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-4"></div>
                    <p className="text-slate-600 text-lg">Data-driven insights that get you noticed</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-4"></div>
                    <p className="text-slate-600 text-lg">AI-powered tools that understand ATS systems</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-4"></div>
                    <p className="text-slate-600 text-lg">Proven success with measurable results</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
                Our Values
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Transparency */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Transparency
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  We believe in clear, honest communication. You'll always know how our AI works and what data we use to help you succeed.
                </p>
              </div>

              {/* Privacy First */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Privacy First
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Your data is yours. We protect your personal information with enterprise-grade security and never share it without your consent.
                </p>
              </div>

              {/* User Empowerment */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  User Empowerment
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  We give you the tools and insights to take control of your career. You're in the driver's seat—we're just your co-pilot.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-indigo-600 to-violet-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to transform your career?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who are landing their dream jobs with Career Clarified.
            </p>
            <Link
              to="/signup"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

