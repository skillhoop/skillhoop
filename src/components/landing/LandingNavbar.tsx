import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerContainerRef.current) {
        if (window.scrollY > 20) {
          headerContainerRef.current.classList.add('header-scrolled');
        } else {
          headerContainerRef.current.classList.remove('header-scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2" id="page-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="transition-all duration-300 rounded-full"
          id="header-container"
          ref={headerContainerRef}
        >
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center space-x-2">
              <svg
                className="h-8 w-auto text-indigo-600"
                viewBox="0 0 32 32"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 4H20V20H4V4Z"></path>
                <path d="M12 12H28V28H12V12Z" fillOpacity="0.7"></path>
              </svg>
              <span className="text-lg font-bold text-slate-800">SkillHoop</span>
            </Link>
            
            <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
              <a href="#benefits" className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Benefits
              </a>
              <Link to="/pricing" className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Pricing
              </Link>
              <Link to="/about" className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors">
                About
              </Link>
              <a href="#success-stories" className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Success Stories
              </a>
              <Link to="/faq" className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors">
                FAQ
              </Link>
            </nav>
            
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/login" className="button-light">
                Sign In
              </Link>
              <Link to="/signup" className="button-gradient-dark">
                Start Free Trial
              </Link>
            </div>
            
            <button
              className="md:hidden text-slate-600"
              id="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" id="menu-close-icon" />
              ) : (
                <Menu className="w-6 h-6" id="menu-open-icon" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full mt-2 left-0 right-0 p-2" id="mobile-menu">
          <div className="glass-header rounded-2xl">
            <nav className="flex flex-col p-4 space-y-2">
              <a
                href="#benefits"
                className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors p-2 text-center rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <Link
                to="/pricing"
                className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors p-2 text-center rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors p-2 text-center rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <a
                href="#success-stories"
                className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors p-2 text-center rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Success Stories
              </a>
              <Link
                to="/faq"
                className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors p-2 text-center rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex flex-col items-center space-y-4 pt-4 border-t border-slate-200">
                <Link
                  to="/login"
                  className="button-light w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="button-gradient-dark w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start Free Trial
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}



