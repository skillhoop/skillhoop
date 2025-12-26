import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  Briefcase, 
  TrendingUp, 
  GraduationCap, 
  Lightbulb,
  Loader2
} from 'lucide-react';
import { auth } from '../lib/supabase';
import LandingNavbar from '../components/landing/LandingNavbar';

// --- Dependencies (Confetti) ---

interface ConfettiProps {
  isActive: boolean;
}

const Confetti = ({ isActive }: ConfettiProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      gravity: number;
      drag: number;
    }

    const particles: Particle[] = [];
    const colors = ['#fbbf24', '#f87171', '#60a5fa', '#34d399', '#a78bfa', '#171717'];

    const createParticle = (): Particle => ({
      x: canvas.width / 2,
      y: canvas.height / 2 + 50,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 1) * 20 - 5,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 200,
      gravity: 0.25,
      drag: 0.96
    });

    for (let i = 0; i < 150; i++) {
      particles.push(createParticle());
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let particlesAlive = false;
      particles.forEach((p) => {
        if (p.life > 0) {
          particlesAlive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= p.drag;
          p.vy *= p.drag;
          p.vy += p.gravity;
          p.life -= 1;
          p.size *= 0.99;
          ctx.save();
          ctx.globalAlpha = Math.min(p.life / 50, 1);
          ctx.translate(p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.rotate(p.vx * 0.2); 
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });
      if (particlesAlive) {
        animationId = requestAnimationFrame(animate);
      }
    };
    animate();
    
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-50 fixed" />;
};

// --- Main EmailSentPage Component ---

interface LocationState {
  name?: string;
  email?: string;
  password?: string;
}

interface Goal {
  id: string;
  icon: React.ReactNode;
  label: string;
  tip: string;
}

const EmailSentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  
  // Handle empty string case specifically (prop default only catches undefined)
  const displayEmail = state?.email || "hello@untitled.com";
  const displayName = state?.name || "Friend";
  const password = state?.password || '';

  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const [isOpen, setIsOpen] = useState(prefersReducedMotion); 
  const [isSent, setIsSent] = useState(prefersReducedMotion); 
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [envelopePhase, setEnvelopePhase] = useState<'idle' | 'out' | 'in'>('idle'); 
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');
  
  // New State for Goal Selection
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const goals: Goal[] = [
    { id: 'job', icon: <Briefcase size={20} />, label: 'Find a Job', tip: "70% of jobs aren't published. We'll show you how to tap the hidden market." },
    { id: 'promo', icon: <TrendingUp size={20} />, label: 'Get Promoted', tip: "Documenting wins weekly increases promotion chances by 40%. Our tracker helps." },
    { id: 'grow', icon: <GraduationCap size={20} />, label: 'Grow Skills', tip: "AI skills are currently boosting salaries by 15% on average. Good choice." }
  ];

  useEffect(() => {
    setAriaAnnouncement(`Email sent to ${displayEmail}. Check your inbox.`);
    if (!prefersReducedMotion) {
      const sealTimer = setTimeout(() => setIsSent(true), 600);
      const openTimer = setTimeout(() => setIsOpen(true), 1400);
      return () => {
        clearTimeout(sealTimer);
        clearTimeout(openTimer);
      };
    }
  }, [displayEmail, prefersReducedMotion]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleResend = async () => {
    if (resendTimer > 0 || isResending || !displayEmail || !password || !displayName) return;
    
    setIsResending(true);
    setAriaAnnouncement("Resending email..."); 
    
    try {
      // Resend confirmation email by calling signUp again
      const { error } = await auth.signUp(displayEmail, password, displayName);

      if (error) {
        console.error('Resend error:', error);
        setIsResending(false);
        setAriaAnnouncement("Failed to resend email. Please try again.");
        return;
      }

      if (prefersReducedMotion) {
        setTimeout(() => {
          setIsResending(false);
          setResendTimer(60);
          setAriaAnnouncement("Email resent successfully.");
        }, 1500);
        return;
      }

      setIsOpen(false);
      setTimeout(() => setIsSent(false), 200);
      setTimeout(() => setEnvelopePhase('out'), 800);
      setTimeout(() => {
        setEnvelopePhase('in'); 
        requestAnimationFrame(() => requestAnimationFrame(() => setEnvelopePhase('idle')));
      }, 1400);
      setTimeout(() => {
        setIsSent(true);
        setTimeout(() => {
          setIsOpen(true);
          setIsResending(false);
          setResendTimer(60);
          setAriaAnnouncement("Email resent successfully.");
        }, 800);
      }, 2000);
    } catch (err) {
      console.error('Resend exception:', err);
      setIsResending(false);
      setAriaAnnouncement("Failed to resend email. Please try again.");
    }
  };

  const getEnvelopeStyles = (): string => {
    if (prefersReducedMotion) return 'opacity-100';
    switch(envelopePhase) {
      case 'out': return 'translate-x-[200%] rotate-12 opacity-0';
      case 'in': return '-translate-x-[200%] opacity-0 duration-0';
      default: return 'translate-x-0 opacity-100 rotate-0 animate-float'; 
    }
  };

  return (
    <div className="relative min-h-screen font-sans text-slate-900">
      <LandingNavbar activePage="signup" />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden pt-40">
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; transform: scale(0.9); }
          @keyframes scaleIn { to { opacity: 1; transform: scale(1); } }
        `}</style>
        <div className="sr-only" role="status" aria-live="polite">{ariaAnnouncement}</div>
        <Confetti isActive={isOpen && !prefersReducedMotion} /> 
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <img src="https://ik.imagekit.io/fdd16n9cy/Gemini_Generated_Image_dshj1zdshj1zdshj.png" alt="Background" className="w-full h-full object-cover opacity-40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent"></div>
        </div>

        <div className="flex flex-col items-center relative z-10 w-full max-w-2xl mt-[280px] mb-[150px]">
          
          {/* Main Envelope Area */}
          <div className={`relative bg-neutral-900 w-full max-w-[500px] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] aspect-[1.6/1] flex items-center justify-center rounded-2xl shadow-2xl shadow-neutral-900/30 cursor-default mb-10 ${isOpen ? 'shadow-neutral-900/10' : ''} ${getEnvelopeStyles()}`}>
            
            {/* The Letter */}
            <div className={`transition-all flex flex-col items-center py-6 justify-start duration-1000 bg-white w-[90%] h-[100%] absolute z-10 rounded-xl shadow-md border border-slate-200 overflow-hidden ${isOpen ? '-translate-y-[28%]' : 'translate-y-0 opacity-0'} ${prefersReducedMotion ? 'transition-none' : ''}`}>
              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2 text-center px-4">Hey {displayName}, you're in!</h3>
              <div className="px-8 text-center text-base text-slate-500 leading-relaxed">
                <p className="mb-1">We've sent a magic login link to</p>
                <span className="font-bold text-lg text-neutral-900 inline-block pb-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-[length:100%_3px] bg-no-repeat bg-bottom">
                  {displayEmail}
                </span>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400 font-medium tracking-tight">
                  <AlertTriangle size={14} className="shrink-0 text-red-500" />
                  <p>Check your <strong className="text-slate-500">Spam folder</strong> if you don't see it.</p>
                </div>
              </div>
              <div className="mt-auto w-full bg-slate-50 py-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Career Clarified Security</p>
              </div>
            </div>

            {/* Top Flap (Lid) */}
            <div className={`tp transition-all duration-1000 bg-gradient-to-b from-neutral-800 to-neutral-900 absolute w-full h-full inset-0 z-40 origin-top shadow-inner rounded-t-2xl border-t border-white/10 ${isOpen ? '[clip-path:polygon(50%_0%,_100%_0,_0_0)]' : '[clip-path:polygon(50%_50%,_100%_0,_0_0)]'}`}></div>
            
            {/* --- 3D Shiny Glassmorphism Flaps --- */}
            
            {/* Left Flap */}
            <div className="lft transition-all duration-700 absolute w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black inset-0 [clip-path:polygon(0%_0%,_0%_100%,_50%_50%)] z-30 rounded-l-2xl border-l border-t border-white/10"></div>
            
            {/* Right Flap */}
            <div className="rgt transition-all duration-700 absolute w-full h-full bg-gradient-to-bl from-neutral-800 via-neutral-900 to-black inset-0 [clip-path:polygon(100%_0%,_100%_100%,_50%_50%)] z-30 rounded-r-2xl border-r border-t border-white/10"></div>
            
            {/* Bottom Flap - Peak at 45% */}
            <div className="btm transition-all duration-700 absolute w-full h-full bg-gradient-to-t from-neutral-800 via-neutral-900 to-neutral-800 inset-0 [clip-path:polygon(0%_100%,_100%_100%,_50%_45%)] z-30 rounded-b-2xl shadow-[0_-2px_10px_rgba(0,0,0,0.5)] border-b border-white/5">
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* Permanent Professional Badge / Clasp */}
            <div className={`seal absolute z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-1000 ease-in-out left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 border-[3px]
              ${isSent 
                ? 'bg-neutral-900 text-white border-white/20 shadow-neutral-900/50' 
                : 'bg-white text-neutral-900 border-slate-100'
              }
            `}>
              <div className="relative flex items-center justify-center">
                {/* Sending State */}
                <div className={`absolute transition-opacity duration-500 ${!isSent ? 'opacity-100' : 'opacity-0'}`}>
                  <Loader2 className="animate-spin" size={20} />
                </div>
                
                {/* Sent & Open State (Brand Logo) */}
                <div className={`absolute transition-all duration-700 transform ${isSent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                  {isOpen ? (
                    <svg 
                      viewBox="0 0 32 32" 
                      className="w-8 h-8 text-white" 
                      fill="currentColor" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4 4H20V20H4V4Z" fill="currentColor"/>
                      <path d="M12 12H28V28H12V12Z" fill="currentColor" fillOpacity="0.6"/>
                    </svg>
                  ) : (
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Action Grouping */}
          <div className={`flex flex-col items-center w-full max-w-sm transition-all duration-1000 delay-500 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            
            {/* Branded Mail Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => window.open('https://mail.google.com/', '_blank')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all font-semibold text-slate-600 shadow-sm"
              >
                <Mail size={18} /> Gmail
              </button>
              <button 
                onClick={() => window.open('https://outlook.live.com/', '_blank')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all font-semibold text-slate-600 shadow-sm"
              >
                <Mail size={18} /> Outlook
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Didn't receive it?</span>
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isResending || !displayEmail || !password || !displayName}
                  className={`font-bold text-neutral-900 hover:text-slate-700 transition-colors underline underline-offset-4 decoration-slate-200 hover:decoration-neutral-900 ${resendTimer > 0 || isResending || !displayEmail || !password || !displayName ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isResending ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend email"}
                </button>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <button
                  onClick={() => navigate('/signup')} 
                  className="font-bold text-slate-400 hover:text-neutral-900 transition-colors"
                >
                  Change email
                </button>
              </div>
            </div>

            {/* Interactive Goal Selection - Replaces passive carousel */}
            <div className="mt-12 w-full group">
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">While you wait</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              
              <h4 className="text-center text-neutral-900 font-bold mb-4">What's your primary focus?</h4>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {goals.map((goal) => (
                  <button 
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${selectedGoal?.id === goal.id ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg scale-105' : 'bg-white border-slate-200 text-slate-500 hover:border-neutral-900 hover:text-neutral-900'}`}
                  >
                    {goal.icon}
                    <span className="text-xs font-bold text-center leading-tight">{goal.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Tip Area */}
              <div className="relative min-h-[80px]">
                {selectedGoal ? (
                  <div key={selectedGoal.id} className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm animate-scale-in">
                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <Lightbulb size={16} />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        <span className="font-bold text-neutral-900 block mb-1">Quick Insight:</span>
                        {selectedGoal.tip}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 p-4 rounded-2xl text-center">
                    <p className="text-sm text-slate-400">Select a goal above to unlock a career tip.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default EmailSentPage;
