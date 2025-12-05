import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Info, Flame, ArrowUp } from 'lucide-react';

export default function LandingChallenges() {
  const [activeTab, setActiveTab] = useState<'career-hub' | 'brand-building' | 'upskilling'>('career-hub');
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({
    'career-hub': null,
    'brand-building': null,
    'upskilling': null,
  });

  // Scroll spy using IntersectionObserver
  useEffect(() => {
    const sections = document.querySelectorAll('.scroll-section');
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when section is in the middle of screen
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id') as 'career-hub' | 'brand-building' | 'upskilling';
          if (currentId) {
            setActiveTab(currentId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Handle tab click and smooth scroll
  const handleTabClick = (tabId: 'career-hub' | 'brand-building' | 'upskilling') => {
    setActiveTab(tabId);
    const targetSection = sectionsRef.current[tabId];
    
    if (targetSection) {
      const headerOffset = 140;
      const elementPosition = targetSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Challenges Employees Face
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            If You're Qualified But Still Struggling, You're Not Alone.
          </h1>
          <h2 className="mt-6 text-lg md:text-xl leading-relaxed text-slate-600">
            75% of qualified professionals are stuck in the same broken system. Here's why traditional
            approaches fail.
          </h2>
        </div>
      </div>

      {/* Wrapper for sticky behavior */}
      <div>
        {/* Sticky Tab Navigation */}
        <div className="sticky top-4 z-50 py-4 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Glassmorphism effect added to background for better sticky visibility */}
            <div
              className="border border-white/20 rounded-xl p-1.5 grid grid-cols-3 gap-1.5 bg-white/70 backdrop-blur-lg"
            >
              <button
                data-tab="career-hub"
                onClick={() => handleTabClick('career-hub')}
                className={`tab-btn w-full text-center py-3 px-2 md:px-4 text-xs md:text-base rounded-lg text-gray-900 hover:bg-gray-50 transition-all duration-300 ${
                  activeTab === 'career-hub'
                    ? 'active bg-blue-50 text-blue-600 font-bold border-b-2 border-blue-600 shadow-md'
                    : ''
                }`}
              >
                Career Hub
              </button>
              <button
                data-tab="brand-building"
                onClick={() => handleTabClick('brand-building')}
                className={`tab-btn w-full text-center py-3 px-2 md:px-4 text-xs md:text-base rounded-lg text-gray-900 hover:bg-gray-50 transition-all duration-300 ${
                  activeTab === 'brand-building'
                    ? 'active bg-blue-50 text-blue-600 font-bold border-b-2 border-blue-600 shadow-md'
                    : ''
                }`}
              >
                Brand Building
              </button>
              <button
                data-tab="upskilling"
                onClick={() => handleTabClick('upskilling')}
                className={`tab-btn w-full text-center py-3 px-2 md:px-4 text-xs md:text-base rounded-lg text-gray-900 hover:bg-gray-50 transition-all duration-300 ${
                  activeTab === 'upskilling'
                    ? 'active bg-blue-50 text-blue-600 font-bold border-b-2 border-blue-600 shadow-md'
                    : ''
                }`}
              >
                Upskilling
              </button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="content-sections-challenges">
            {/* Career Hub Section (The ATS Black Hole) */}
            <section
              id="career-hub"
              className="scroll-section mb-16 md:mb-24 pt-4"
              ref={(el) => (sectionsRef.current['career-hub'] = el)}
            >
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl overflow-hidden transition-transform duration-300 hover:scale-[1.01] shadow-xl shadow-slate-200/50"
              >
                <div className="p-8 md:p-12 order-2 md:order-1">
                  <div className="flex items-center text-2xl font-bold tracking-tight text-gray-800 mb-6">
                    {/* Icon Wrapper */}
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-4 text-red-600 shrink-0">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    The ATS Black Hole
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="text-red-600 mr-3 mt-1 shrink-0">
                        <ArrowUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold tracking-tight text-red-800">75% of resumes never reach human eyes</h3>
                        <p className="text-red-700 text-sm leading-relaxed mt-1">
                          ATS systems reject qualified candidates due to formatting issues, missing keywords, or
                          poor optimization
                        </p>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mr-3 flex-shrink-0 text-sm">
                        •
                      </span>
                      <span className="leading-relaxed text-slate-600">
                        You spend hours tailoring each application, only to hear nothing back
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mr-3 flex-shrink-0 text-sm">
                        •
                      </span>
                      <span className="leading-relaxed text-slate-600">
                        Less qualified candidates get interviews while you're stuck in the system
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mr-3 flex-shrink-0 text-sm">
                        •
                      </span>
                      <span className="leading-relaxed text-slate-600">The whole process feels like throwing darts in the dark</span>
                    </li>
                  </ul>
                </div>
                <div className="h-64 md:h-full order-1 md:order-2 flex items-center justify-center bg-gray-100 overflow-hidden">
                  <img
                    src="https://ik.imagekit.io/fdd16n9cy/-a-sleek--modern-laptop-sits-on-a-dark-desk--the-s.png?updatedAt=1757888837988"
                    alt="ATS Black Hole Visual"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </section>

            {/* Brand Building Section (The Authority Gap) */}
            <section
              id="brand-building"
              className="scroll-section mb-16 md:mb-24 pt-4"
              ref={(el) => (sectionsRef.current['brand-building'] = el)}
            >
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl overflow-hidden transition-transform duration-300 hover:scale-[1.01] shadow-xl shadow-slate-200/50"
              >
                <div className="p-8 md:p-12 order-2 md:order-1">
                  <div className="flex items-center text-2xl font-bold tracking-tight text-gray-800 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4 text-blue-600 shrink-0">
                      <Info className="h-6 w-6" />
                    </div>
                    The Authority Gap
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="text-blue-600 mr-3 mt-1 shrink-0">
                        <ArrowUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold tracking-tight text-blue-800">Your expertise stays hidden</h3>
                        <p className="text-blue-700 text-sm leading-relaxed mt-1">
                          While louder voices get the opportunities, your knowledge and skills remain invisible to
                          decision-makers
                        </p>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0 text-sm">
                        •
                      </span>
                      <span className="leading-relaxed text-slate-600">
                        You know you should be posting on LinkedIn, but staring at that blank text box gives you
                        instant writer's block
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0 text-sm">
                        •
                      </span>
                      <span className="leading-relaxed text-slate-600">
                        You see others building authority while you struggle to find time for consistent content
                        creation
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0 text-sm">
                        •
                      </span>
                      <span className="leading-relaxed text-slate-600">
                        Opportunities go to those who are visible, not necessarily those who are most qualified
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="h-64 md:h-full order-1 md:order-2 overflow-hidden">
                  <img
                    src="https://ik.imagekit.io/fdd16n9cy/_Isometric%20illustration%20of%20a%20LinkedIn%20feed%20with%20blue%20tones,%20cards,%20and%20interaction%20buttons%20(thumbs%20up,%20comment%20icons),%20but%20avoid%20using%20the%20exact%20logo.%20Minimalist%20blue%20and%20white%20color%20palette,%20clean%20lines,%20mo.jpg?updatedAt=1757931363825"
                    alt="Brand Building Visual"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </section>

            {/* Upskilling Section (Staying Future-Proof) */}
            <section
              id="upskilling"
              className="scroll-section pt-4 mb-12"
              ref={(el) => (sectionsRef.current['upskilling'] = el)}
            >
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl overflow-hidden transition-transform duration-300 hover:scale-[1.01] shadow-xl shadow-slate-200/50"
              >
                <div className="p-8 md:p-12 order-2 md:order-1">
                  <div className="flex items-center text-2xl font-bold tracking-tight text-gray-800 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-4 text-green-600 shrink-0">
                      <Flame className="h-6 w-6" />
                    </div>
                    Staying Future-Proof
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="text-green-600 mr-3 mt-1 shrink-0">
                        <ArrowUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold tracking-tight text-green-800">The Upskilling Dilemma</h3>
                        <p className="text-green-700 text-sm leading-relaxed mt-1">
                          It's not about finding time to learn; it's about the fear of learning the wrong thing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3 flex-shrink-0 text-sm">
                        •
                      </span>
                      <span className="leading-relaxed text-slate-600">
                        Struggling to decide which career path or skill set to pursue for long-term growth.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3 flex-shrink-0 text-sm">
                        •
                      </span>
                      <span className="leading-relaxed text-slate-600">
                        Lack of clear insights into how industries, technologies, and job demands will shift in the
                        future.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3 flex-shrink-0 text-sm">
                        •
                      </span>
                      <span className="leading-relaxed text-slate-600">
                        Mental struggles of upskilling—less about "I don't have time" and more about "Am I even
                        going in the right direction?
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="h-64 md:h-full order-1 md:order-2 bg-gray-100 flex items-center justify-center relative">
                  {/* Placeholder graphic since original image source was not provided for upskilling */}
                  <div className="absolute inset-0 bg-green-50 flex items-center justify-center">
                    <svg className="w-32 h-32 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                    </svg>
                  </div>
                  <span className="relative z-10 text-green-700 font-semibold text-lg bg-white/80 px-6 py-2 rounded-full shadow-sm backdrop-blur-sm">
                    Upskilling Visual
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

