import { Link } from 'react-router-dom';
import { Quote } from 'lucide-react';

export default function LandingFeatures() {
  return (
    <>
      {/* Stats Section */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50"
          >
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-base font-semibold leading-7 text-indigo-600">Tagline</p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Medium length section heading goes here
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros
                elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo
                diam libero vitae erat.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Stat 1 */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                <p className="text-7xl font-bold text-indigo-600">75%</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-gray-900">Faster job applications</h3>
                <p className="mt-2 leading-relaxed text-slate-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
              {/* Stat 2 */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                <p className="text-7xl font-bold text-indigo-600">60%</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-gray-900">Improved interview success</h3>
                <p className="mt-2 leading-relaxed text-slate-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
              {/* Stat 3 */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                <p className="text-7xl font-bold text-indigo-600">50%</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-gray-900">
                  Enhanced professional visibility
                </h3>
                <p className="mt-2 leading-relaxed text-slate-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
            <div className="mt-16 flex justify-center items-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Button
              </a>
              <a
                href="#"
                className="text-base font-semibold leading-6 text-gray-900 group"
              >
                Button{' '}
                <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div id="benefits" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50"
          >
            <div className="max-w-3xl">
              <p className="text-base font-semibold leading-7 text-indigo-600">Benefits</p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Automated job application process
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Transform your career journey with an intelligent platform that combines cutting-edge AI
                technology and comprehensive professional development tools.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Benefit 1 */}
              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-shrink-0">
                  <img
                    className="h-48 w-full object-cover"
                    src="https://placehold.co/395x240/ddd6fe/3730a3?text=Brand+Building"
                    alt="Professional brand building"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between bg-white p-6">
                  <div className="flex-1">
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">Build your professional brand</h3>
                    <p className="mt-3 text-base leading-relaxed text-slate-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros
                      elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.
                    </p>
                  </div>
                </div>
              </div>
              {/* Benefit 2 */}
              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-shrink-0">
                  <img
                    className="h-48 w-full object-cover"
                    src="https://placehold.co/395x240/c7d2fe/3730a3?text=Skill+Development"
                    alt="Skill development"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between bg-white p-6">
                  <div className="flex-1">
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">Future-ready skill development</h3>
                    <p className="mt-3 text-base leading-relaxed text-slate-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros
                      elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.
                    </p>
                  </div>
                </div>
              </div>
              {/* Benefit 3 */}
              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-shrink-0">
                  <img
                    className="h-48 w-full object-cover"
                    src="https://placehold.co/395x240/a5b4fc/3730a3?text=Career+Growth"
                    alt="Medium length section heading"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between bg-white p-6">
                  <div className="flex-1">
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                      Medium length section heading goes here
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-slate-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros
                      elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16 flex items-center gap-x-6">
              <Link
                to="/signup"
                className="rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </Link>
              <a
                href="#"
                className="text-base font-semibold leading-6 text-gray-900 group"
              >
                Learn more{' '}
                <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories Section */}
      <div id="success-stories" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Success stories</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">Real professionals, real transformations</p>
            </div>
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Story 1 */}
              <div className="p-8 border border-gray-200 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="h-8">
                    <Quote className="h-8 w-auto text-gray-400" />
                  </div>
                  <blockquote className="mt-8 text-xl font-medium text-gray-900">
                    <p className="leading-relaxed text-slate-600">"Career Clarified helped me land my dream job in tech within weeks"</p>
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
                      <div className="font-semibold text-gray-900">Sarah Johnson</div>
                      <div className="text-slate-600">Senior product manager</div>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="mt-8 text-indigo-600 font-semibold flex items-center group"
                  >
                    Read case study
                    <span className="transition-transform group-hover:translate-x-1 ml-2" aria-hidden="true">
                      →
                    </span>
                  </a>
                </div>
              </div>
              {/* Story 2 */}
              <div className="p-8 border border-gray-200 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="h-8">
                    <Quote className="h-8 w-auto text-gray-400" />
                  </div>
                  <blockquote className="mt-8 text-xl font-medium text-gray-900">
                    <p className="leading-relaxed text-slate-600">"The AI resume builder is a game-changer for job seekers"</p>
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
                      <div className="font-semibold text-gray-900">Michael Chen</div>
                      <div className="text-slate-600">Software engineer</div>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="mt-8 text-indigo-600 font-semibold flex items-center group"
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
    </>
  );
}
