import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SkillHoopLogo from '@/components/ui/SkillHoopLogo';

interface NavbarProps {
  activePage?: string;
}

const Navbar = ({ activePage }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/');
  };

  const handleLinkClick = (page: string, sectionId?: string) => {
    setIsOpen(false);
    
    if (page === 'home') {
      if (location.pathname === '/') {
        // If we're already on home, scroll to section
        if (sectionId) {
          setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // Navigate to home first, then scroll
        navigate('/');
        if (sectionId) {
          setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
        }
      }
    } else {
      navigate(`/${page}`);
      // Scroll to top when navigating to a new page
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // Determine active page from location if not provided
  const currentPage = activePage || (location.pathname === '/' ? 'home' : location.pathname.slice(1));

  return (
    <nav className="fixed w-full z-50 top-6 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-7xl mx-auto transition-all duration-500 ease-in-out ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-xl border border-neutral-900/5 shadow-xl py-3 px-6 rounded-full' 
          : 'bg-transparent py-4 px-0'
      }`}>
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => handleLinkClick('home')}
          >
            <SkillHoopLogo width={140} height={32} className="h-8" />
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-8 text-base font-medium text-slate-500">
              <button onClick={() => handleLinkClick('home', 'hub')} className="hover:text-neutral-900 transition-colors">Career Hub</button>
              <button 
                onClick={() => handleLinkClick('about')} 
                className={`transition-colors ${currentPage === 'about' ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'}`}
              >
                About
              </button>
              <button onClick={() => handleLinkClick('home', 'features')} className="hover:text-neutral-900 transition-colors">Features</button>
              <button 
                onClick={() => handleLinkClick('pricing')} 
                className={`transition-colors ${currentPage === 'pricing' ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'}`}
              >
                Pricing
              </button>
              <button 
                onClick={() => handleLinkClick('mi')} 
                className={`transition-colors ${currentPage === 'mi' ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'}`}
              >
                mi
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-neutral-900 text-base font-medium transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="bg-neutral-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-base font-bold transition-all shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:-translate-y-0.5 border border-transparent hover:border-neutral-900/50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-neutral-900 text-base font-medium transition-colors">
                  Log In
                </Link>
                <Link 
                  to="/signup"
                  className="bg-neutral-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-base font-bold transition-all shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:-translate-y-0.5 border border-transparent hover:border-neutral-900/50"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-neutral-900">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl border border-neutral-900/10 rounded-2xl shadow-2xl p-4 md:hidden animate-fade-in-up">
          <div className="space-y-1">
            <button onClick={() => handleLinkClick('home', 'hub')} className="block w-full text-left px-4 py-3 text-slate-600 hover:text-neutral-900 hover:bg-slate-50 rounded-xl transition-colors">Career Hub</button>
            <button 
              onClick={() => handleLinkClick('about')} 
              className={`block w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors ${
                currentPage === 'about' ? 'text-neutral-900 font-bold' : 'text-slate-600 hover:text-neutral-900'
              }`}
            >
              About
            </button>
            <button onClick={() => handleLinkClick('home', 'features')} className="block w-full text-left px-4 py-3 text-slate-600 hover:text-neutral-900 hover:bg-slate-50 rounded-xl transition-colors">Features</button>
            <button 
              onClick={() => handleLinkClick('pricing')} 
              className={`block w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors ${
                currentPage === 'pricing' ? 'text-neutral-900 font-bold' : 'text-slate-600 hover:text-neutral-900'
              }`}
            >
              Pricing
            </button>
            <button 
              onClick={() => handleLinkClick('mi')} 
              className={`block w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors ${
                currentPage === 'mi' ? 'text-neutral-900 font-bold' : 'text-slate-600 hover:text-neutral-900'
              }`}
            >
              mi
            </button>
            <div className="pt-4 border-t border-slate-200 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="block w-full text-left px-4 py-3 text-slate-600 hover:text-neutral-900 hover:bg-slate-50 rounded-xl transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-3 bg-neutral-900 text-white rounded-xl transition-colors font-bold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="block w-full text-left px-4 py-3 text-slate-600 hover:text-neutral-900 hover:bg-slate-50 rounded-xl transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup"
                    className="block w-full text-left px-4 py-3 bg-neutral-900 text-white rounded-xl transition-colors font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
