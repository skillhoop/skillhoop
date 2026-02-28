import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LandingNavbar from '../components/landing/LandingNavbar';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/signup-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));
      const actualMessage = data.error ?? (res.ok ? '' : 'Request failed');

      if (!res.ok) {
        let errorMessage = actualMessage;
        if (
          actualMessage.includes('Failed to fetch') ||
          actualMessage.includes('ERR_NAME_NOT_RESOLVED') ||
          actualMessage.includes('NETWORK')
        ) {
          errorMessage =
            'Cannot connect to Supabase. Free-tier projects pause after inactivity—open your Supabase dashboard, select your project, and click "Restore project" if it’s paused. Then check your internet and try again.';
        } else if (actualMessage.toLowerCase().includes('user already registered')) {
          errorMessage =
            'An account with this email already exists. Please try logging in instead.';
        }
        setError(errorMessage);
        console.error('Sign up error:', data);
        return;
      }

      if (data.user && data.needsEmailConfirmation) {
        // User created but needs email confirmation
        console.log('✅ Account created! Email confirmation required.');
        navigate('/email-sent', {
          state: {
            name,
            email,
            password,
          },
        });
      } else if (data.session) {
        console.log('✅ Account created and logged in!');

        try {
          const storagePayload = {
            currentSession: data.session,
            expiresAt:
              typeof data.session.expires_in === 'number'
                ? Math.floor(Date.now() / 1000) + data.session.expires_in
                : Math.floor(Date.now() / 1000) + 60 * 60,
          };
          localStorage.setItem(
            'sb-tnbeugqrflocjjjxcceh-auth-token',
            JSON.stringify(storagePayload)
          );
        } catch (storageErr) {
          console.error('Failed to write Supabase session to storage (signup):', storageErr);
        }

        try {
          void supabase.auth.setSession(data.session);
        } catch (sessionErr) {
          console.error('Exception while calling Supabase setSession (signup):', sessionErr);
        }

        try {
          navigate('/dashboard');
        } catch (navErr) {
          console.error('Navigation error after signup:', navErr);
        }
      } else if (data.user) {
        setSuccess(true);
      } else {
        setError('No data returned from sign up. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
        setError(
          'Cannot connect to Supabase. Free-tier projects pause after inactivity—open your Supabase dashboard, select your project, and click "Restore project" if it’s paused. Then check your internet and try again.'
        );
      } else {
        setError(errorMessage);
      }
      console.error('Sign up exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInSignup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("LinkedIn signup error:", error);
      setError(error instanceof Error ? error.message : 'Failed to sign up with LinkedIn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google signup error:", error);
      setError(error instanceof Error ? error.message : 'Failed to sign up with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/signup-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMessage =
          data.error ??
          'Unable to resend confirmation email. Please try again or contact support.';
        setError(errorMessage);
      } else {
        alert('Confirmation email has been resent!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEmailApp = () => {
    // Open default email client
    window.location.href = 'mailto:';
  };

  return (
    <div className="relative min-h-screen font-sans text-slate-900">
      <LandingNavbar activePage="signup" />
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

        
      <div className={`flex w-full ${success ? 'max-w-md' : 'max-w-6xl'} rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm relative z-10 border border-slate-200/60 ring-1 ring-slate-900/5 mt-[100px]`}>
        {success ? (
          /* Email Sent Success UI */
          <div className="w-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white/80">
            <div className="mx-auto w-full max-w-sm text-center">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Mail className="h-6 w-6 text-slate-600" />
                </div>
              </div>
              
              {/* Header Section */}
              <div className="mt-4">
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Check your email</h2>
                <p className="mt-2 text-base text-slate-600">
                  We've sent a confirmation link to <span className="font-semibold text-neutral-900">{email}</span>.
                </p>
              </div>

              {/* Action Section */}
              <div className="mt-8">
                <button
                  onClick={handleOpenEmailApp}
                  className="group relative flex w-full justify-center rounded-xl border border-transparent bg-neutral-900 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Open email app <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-900 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
              
              {/* Footer Link */}
              <p className="mt-10 text-center text-sm text-slate-500 font-medium">
                Didn't receive the email? 
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="font-bold leading-6 text-neutral-900 hover:text-slate-600 ml-1 underline decoration-slate-300 decoration-2 underline-offset-4 hover:decoration-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Click to resend
                </button>
              </p>
              <p className="mt-4 text-center text-sm text-slate-500 font-medium">
                <Link to="/login" className="inline-flex items-center gap-1.5 font-bold leading-6 text-neutral-900 hover:text-slate-600 underline decoration-slate-300 decoration-2 underline-offset-4 hover:decoration-neutral-900 transition-all">
                  <ArrowRight className="rotate-180" size={14}/> Back to log in
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Left Side: Sign Up Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white/80">
              <div className="mx-auto w-full max-w-sm mt-8">
                {/* Header Section */}
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Create an account</h2>
                  <p className="mt-2 text-sm text-slate-500 font-medium">
                    Join 10,000+ professionals. Start your 30-day free trial.
                  </p>
                </div>

                {/* Form Section */}
                <div className="mt-8">
                  <div className="mt-6">
                    {error && (
                      <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                        {error}
                      </div>
                    )}
                    <form onSubmit={handleSignup} className="space-y-5">
                      {/* Name Input */}
                      <div>
                        <label htmlFor="name" className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Name</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-neutral-900 transition-colors" />
                          </div>
                          <input 
                            id="name" 
                            name="name" 
                            type="text" 
                            autoComplete="name" 
                            required 
                            placeholder="John Doe" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm transition-all shadow-sm group-hover:border-slate-300" 
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div>
                        <label htmlFor="email" className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Email</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-neutral-900 transition-colors" />
                          </div>
                          <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            autoComplete="email" 
                            required 
                            placeholder="john@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm transition-all shadow-sm group-hover:border-slate-300" 
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div>
                        <label htmlFor="password" className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Password</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-neutral-900 transition-colors" />
                          </div>
                          <input 
                            id="password" 
                            name="password" 
                            type="password" 
                            autoComplete="new-password" 
                            required 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm transition-all shadow-sm group-hover:border-slate-300" 
                          />
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <p className="text-xs text-slate-500 font-medium">Must be at least 8 characters</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-4 pt-2">
                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className="group relative flex w-full justify-center rounded-xl border border-transparent bg-neutral-900 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            {isLoading ? 'Creating account...' : 'Get started'} {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>}
                          </span>
                          {/* Subtle gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-900 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                        
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white/60 text-slate-500 text-xs font-medium uppercase tracking-wide">Or continue with</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            type="button" 
                            onClick={handleGoogleSignup}
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <span className="hidden sm:inline">Google</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={handleLinkedInSignup}
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="h-5 w-5" fill="#0A66C2" aria-hidden="true" viewBox="0 0 24 24">
                              <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.484 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                            </svg>
                            <span className="hidden sm:inline">LinkedIn</span>
                          </button>
                        </div>
                      </div>
                    </form>
                    
                    <p className="mt-10 text-center text-sm text-slate-500 font-medium">
                      Already have an account?
                      <Link to="/login" className="font-bold leading-6 text-neutral-900 hover:text-slate-600 ml-1 underline decoration-slate-300 decoration-2 underline-offset-4 hover:decoration-neutral-900 transition-all">
                        Log in
                      </Link>
                    </p>
                  </div>
                </div>
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
        )}
      </div>
    </div>
    </div>
  );
}

export default Signup;
