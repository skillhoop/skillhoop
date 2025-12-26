import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  AlertCircle, 
  Loader2, 
  HelpCircle, 
  ShieldCheck
} from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';

/**
 * Standalone ForgotPasswordPage Component
 * Includes:
 * - Email validation
 * - 30-second resend cooldown
 * - Loading states for submission
 */
function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const emailInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Cooldown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (cooldown > 0) {
      interval = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldown]);

  const validateEmail = (emailToValidate: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailToValidate);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) {
      if (val === '' || validateEmail(val)) {
        setEmailError('');
      }
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cooldown > 0) return;
    if (!email) {
      setEmailError('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCooldown(30); 
      navigate('/email-sent', { state: { email } });
    }, 1500);
  };

  return (
    <div className="relative min-h-screen font-sans text-slate-900">
      <LandingNavbar activePage="forgot-password" />
      <div 
        className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 lg:p-8 overflow-hidden pt-40"
        style={{
          backgroundImage: "url('https://ik.imagekit.io/fdd16n9cy/Gemini_Generated_Image_dshj1zdshj1zdshj.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
      {/* Embedded Styles for Sun/Star Animation */}
      <style>{`
        /* SUN & STARS ANIMATION - THEME MATCHED (Monochrome Slate) */
        .section-banner-sun {
          height: 360px;
          width: 360px;
          position: relative;
          transition: left 0.3s linear;
          z-index: 10;
        }

        /* Sun Orb & Rim Light */
        .section-banner-sun::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: #F8FAFC; /* Slate-50 */
          
          /* Rotating Rim Light (30s) + Pulse (5s) */
          animation: shadowPulse 5s ease-in-out infinite, sunRotate 30s linear infinite;
          
          box-shadow:
            0px 0px 40px 20px #E2E8F0, /* Slate-200 Outer Glow */
            -5px 0px 10px 1px #FFFFFF inset,
            15px 2px 40px 20px #94A3B840 inset, /* Slate-400 Transparent */
            -24px -2px 50px 25px #CBD5E1 inset, /* Slate-300 */
            150px 0px 80px 35px #47556940 inset; /* Slate-600 Transparent */
          
          z-index: -1;
        }

        .curved-corner-star {
          display: flex;
          position: relative;
        }

        #curved-corner-bottomleft, #curved-corner-bottomright,
        #curved-corner-topleft, #curved-corner-topright {
          width: 4px;
          height: 5px;
          overflow: hidden;
          position: relative;
        }

        #curved-corner-bottomleft:before, #curved-corner-bottomright:before,
        #curved-corner-topleft:before, #curved-corner-topright:before {
          content: "";
          display: block;
          width: 200%;
          height: 200%;
          position: absolute;
          border-radius: 50%;
        }

        /* Star Color (White) */
        #curved-corner-bottomleft:before { bottom: 0; left: 0; box-shadow: -5px 5px 0 0 #FFFFFF; }
        #curved-corner-bottomright:before { bottom: 0; right: 0; box-shadow: 5px 5px 0 0 #FFFFFF; }
        #curved-corner-topleft:before { top: 0; left: 0; box-shadow: -5px -5px 0 0 #FFFFFF; }
        #curved-corner-topright:before { top: 0; right: 0; box-shadow: 5px -5px 0 0 #FFFFFF; }

        @keyframes twinkling {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 1; }
        }

        @keyframes sunRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes shadowPulse {
          0%, 100% {
            box-shadow:
              0px 0px 40px 20px #E2E8F0,
              -5px 0px 10px 1px #FFFFFF inset,
              15px 2px 40px 20px #94A3B840 inset,
              -24px -2px 50px 25px #CBD5E1 inset,
              150px 0px 80px 35px #47556940 inset;
          }
          50% {
            box-shadow:
              0px 0px 60px 30px #CBD5E1,
              -5px 0px 20px 5px #FFFFFF inset,
              15px 2px 60px 30px #94A3B840 inset,
              -24px -2px 70px 35px #CBD5E1 inset,
              150px 0px 100px 45px #47556940 inset;
          }
        }

        /* Star positions - adjusted for sun size */
        #star-1 { position: absolute; left: -24px; animation: twinkling 3s infinite; }
        #star-2 { position: absolute; left: -48px; top: 36px; animation: twinkling 2s infinite; }
        #star-3 { position: absolute; left: 420px; top: 108px; animation: twinkling 4s infinite; }
        #star-4 { position: absolute; left: 240px; top: 348px; animation: twinkling 3s infinite; }
        #star-5 { position: absolute; left: 60px; top: 324px; animation: twinkling 1.5s infinite; }
        #star-6 { position: absolute; left: 300px; top: -60px; animation: twinkling 4s infinite; }
        #star-7 { position: absolute; left: 348px; top: 72px; animation: twinkling 2s infinite; }
      `}</style>

        
      <div className="flex w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm relative z-10 border border-slate-200/60 ring-1 ring-slate-900/5 mt-[160px] pt-0 pb-0">
        <>
          {/* Left Side: Forgot Password Form */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white/80">
            <div className="mx-auto w-full max-w-sm mt-8">
              {/* Header Section */}
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Forgot password?</h2>
                <p className="mt-2 text-sm text-slate-500 font-medium">
                  We'll send a magic link <strong className="text-neutral-900">valid for 15 minutes</strong>.
                </p>
              </div>

              {/* Form Section */}
              <div className="mt-8">
                <div className="mt-6">
                  <form action="#" method="POST" className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Email</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className={`h-5 w-5 transition-colors ${emailError ? 'text-orange-500' : 'text-slate-400 group-focus-within:text-neutral-900'}`} />
                        </div>
                        <input 
                          ref={emailInputRef}
                          id="email" 
                          name="email" 
                          type="email" 
                          autoComplete="email" 
                          placeholder="Enter your email" 
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={handleEmailBlur}
                          className={`block w-full pl-10 pr-3 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 sm:text-sm transition-all shadow-sm group-hover:border-slate-300
                            ${emailError 
                              ? 'border-orange-300 focus:border-orange-500 focus:ring-orange-500' 
                              : 'border-slate-200 focus:border-neutral-900 focus:ring-neutral-900'
                            }
                          `} 
                        />
                      </div>
                      {emailError && (
                        <p className="mt-2 text-sm flex items-center gap-1 font-bold text-red-600">
                          <AlertCircle size={14} className="text-orange-500" /> 
                          {emailError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 pt-2">
                      <button 
                        type="submit" 
                        disabled={isLoading || cooldown > 0}
                        className="group relative flex w-full justify-center rounded-xl border border-transparent bg-neutral-900 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {isLoading ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              Sending...
                            </>
                          ) : cooldown > 0 ? (
                            `Resend available in ${cooldown}s`
                          ) : (
                            "Reset password"
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-900 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </button>
                      
                      <p className="text-xs text-center text-slate-500 font-medium mt-2">
                        If an account exists for this email, you will receive a code.
                      </p>
                      
                      <div className="text-center pt-2">
                        <button 
                          type="button"
                          className="text-xs font-bold text-slate-600 hover:text-neutral-900 transition-colors flex items-center justify-center gap-1 mx-auto"
                          onClick={() => {}}
                        >
                          <HelpCircle size={12} /> Can't access your email?
                        </button>
                      </div>
                    </div>
                  </form>
                  
                  <button 
                    onClick={() => navigate('/login')} 
                    className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    Wait, I remembered!
                  </button>
                </div>
              </div>
            </div>
            
            {/* Trust Badge */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-slate-500" />
              <span>Protected by reCAPTCHA</span>
            </div>
          </div>

          {/* Right Side: Decorative Graphic */}
          <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
              <div className="relative" style={{ backgroundColor: 'transparent' }}>
                {/* Sun Animation Reuse */}
                <div className="section-banner-sun">
                  <div id="star-1">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  {/* Star 2 */}
                  <div id="star-2">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  {/* Star 3 */}
                  <div id="star-3">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  {/* Star 4 */}
                  <div id="star-4">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  {/* Star 5 */}
                  <div id="star-5">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  {/* Star 6 */}
                  <div id="star-6">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  {/* Star 7 */}
                  <div id="star-7">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
    </div>
  );
}

export default ForgotPassword;


