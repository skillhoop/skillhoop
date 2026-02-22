/**
 * SkillHoop Role Match Analysis — 3D flip cards: ATS Match, Hire Probability, Market Value.
 * Uses framer-motion for animations and Tailwind for 3D flip. Accepts live data from JobFinder.
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
  ArrowRight,
  X,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ArrowUp,
  Database,
  Zap,
  Target,
  Briefcase,
} from "lucide-react";

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

const GridLayer: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{ "--grid-color": color } as React.CSSProperties}
    className="pointer-events-none absolute inset-0 z-[4] h-full w-full bg-transparent bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:20px_20px] bg-center opacity-70 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"
  />
);

const EllipseGradient: React.FC<{ color: string; id: string }> = ({ color, id }) => (
  <div className="absolute inset-0 z-[5] flex h-full w-full items-center justify-center">
    <svg width="100%" height="100%" viewBox="0 0 356 180" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="356" height="180" fill={`url(#${id})`} />
      <defs>
        <radialGradient id={id} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(178 98) rotate(90) scale(98 178)">
          <stop stopColor={color} stopOpacity="0.25" />
          <stop offset="0.34" stopColor={color} stopOpacity="0.15" />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  </div>
);

interface ATSLayerProps {
  color: string;
  secondaryColor?: string;
  hovered?: boolean;
}

interface AnimatedRadialChartProps {
  value?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabels?: boolean;
  duration?: number;
  color?: string;
  secondaryColor?: string;
}

function AnimatedRadialChart({
  value = 74,
  size = 300,
  strokeWidth: customStrokeWidth,
  className,
  showLabels = true,
  duration = 2,
  color = "#ea580c",
  secondaryColor = "#fb923c",
}: AnimatedRadialChartProps) {
  const strokeWidth = customStrokeWidth ?? Math.max(12, size * 0.06);
  const radius = size * 0.35;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedValue = useMotionValue(0);
  const offset = useTransform(animatedValue, [0, 100], [circumference, 0]);
  const progressAngle = useTransform(animatedValue, [0, 100], [-Math.PI / 2, 1.5 * Math.PI]);
  const innerRadius = radius - strokeWidth / 2;

  useEffect(() => {
    const controls = animate(animatedValue, value, {
      type: "spring",
      stiffness: 45,
      damping: 14,
      mass: 0.8,
      restDelta: 0.001,
    });
    return controls.stop;
  }, [value, animatedValue, duration]);

  const fontSize = Math.max(16, size * 0.1);
  const labelFontSize = Math.max(12, size * 0.04);
  const scoreText = useTransform(animatedValue, (latest) => {
    const s = Math.round(latest);
    if (s >= 90) return "Excellent";
    if (s >= 75) return "Good";
    if (s >= 60) return "Fair";
    return "Needs Work";
  });
  const dotX = useTransform(progressAngle, (angle) => center + Math.cos(angle) * radius);
  const dotY = useTransform(progressAngle, (angle) => center + Math.sin(angle) * radius);

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible absolute top-0">
        <defs>
          <linearGradient id={`progressGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <filter id={`glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <motion.circle
          cx={center}
          cy={center}
          r={radius - 2}
          fill="none"
          stroke={color}
          strokeWidth="15"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: [0, 0.1, 0], scale: [0.85, 1.05, 1.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          style={{ originX: "50%", originY: "50%" }}
        />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={color} opacity="0.15" strokeWidth={strokeWidth} />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#progressGradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={`url(#glow-${size})`}
          transform={`rotate(-90 ${center} ${center})`}
        />
        <motion.circle cx={dotX} cy={dotY} r={strokeWidth * 0.4} fill="#ffffff" stroke={color} strokeWidth={2} filter={`url(#glow-${size})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="font-black tracking-tight"
          style={{ fontSize: `${fontSize * 0.85}px` }}
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
        >
          <span className="bg-gradient-to-br from-[#fb923c] to-[#ea580c] bg-clip-text text-transparent drop-shadow-sm whitespace-nowrap">
            <motion.span>{scoreText}</motion.span>
          </span>
        </motion.div>
        <motion.span
          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Match Level
        </motion.span>
      </div>
    </div>
  );
}

const ATSLayer3: React.FC<{ color: string }> = ({ color }) => (
  <div className="ease-[cubic-bezier(0.6,0.6,0,1)] absolute inset-0 z-[6] flex translate-y-full items-center justify-center opacity-0 transition-all duration-500 group-hover/animated-card:translate-y-0 group-hover/animated-card:opacity-100">
    <svg width="100%" height="100%" viewBox="0 0 356 180" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="356" height="180" fill="url(#paint0_linear_ats)" />
      <defs>
        <linearGradient id="paint0_linear_ats" x1="178" y1="0" x2="178" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0.35" stopColor={color} stopOpacity="0" />
          <stop offset="1" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const ATSLayer4: React.FC<ATSLayerProps & { skills: string[] }> = ({ color, secondaryColor, hovered, skills }) => {
  const positions = [
    { translateX: 95, translateY: 55 },
    { translateX: 95, translateY: -55 },
    { translateX: 115, translateY: 0 },
    { translateX: -115, translateY: 0 },
    { translateX: -95, translateY: 55 },
    { translateX: -95, translateY: -55 },
  ];
  const items = skills.slice(0, 6).map((text, i) => ({ id: i + 1, text, ...positions[i % positions.length] }));
  return (
    <div className="ease-[cubic-bezier(0.6,0.6,0,1)] absolute inset-0 z-[7] flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover/animated-card:opacity-100">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="ease-[cubic-bezier(0.6,0.6,0,1)] absolute flex items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-2 py-0.5 backdrop-blur-md transition-all duration-500 shadow-sm"
          style={{ transform: hovered ? `translate(${item.translateX}px, ${item.translateY}px)` : "translate(0px, 0px)" }}
        >
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: index < 3 ? color : secondaryColor }} />
          <span className="text-[10px] font-bold text-slate-800">{item.text}</span>
        </div>
      ))}
    </div>
  );
};

interface ATSMatchVisualProps {
  score: number;
  skills: string[];
  mainColor?: string;
  secondaryColor?: string;
  gridColor?: string;
}

function ATSMatchVisual({ score, skills, mainColor = "#ea580c", secondaryColor = "#fb923c", gridColor = "#ea580c20" }: ATSMatchVisualProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <div
        className="absolute inset-0 z-20 cursor-crosshair"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ "--color": mainColor, "--secondary-color": secondaryColor } as React.CSSProperties}
      />
      <div className="relative h-full w-full overflow-hidden rounded-t-xl">
        <div className="ease-[cubic-bezier(0.6,0.6,0,1)] absolute inset-0 z-[7] flex h-full w-full transform items-center justify-center transition-transform duration-500 group-hover/animated-card:-translate-y-[15px] group-hover/animated-card:scale-105">
          <AnimatedRadialChart value={score} size={240} duration={1.5} showLabels={false} color={mainColor} secondaryColor={secondaryColor} />
        </div>
        <ATSLayer3 color={mainColor} />
        <ATSLayer4 color={mainColor} secondaryColor={secondaryColor} hovered={hovered} skills={skills} />
        <EllipseGradient id="ats-ellipse" color={mainColor} />
        <GridLayer color={gridColor} />
      </div>
    </>
  );
}

const HireLayer1 = ({ color, secondaryColor }: { color: string; secondaryColor?: string }) => (
  <div className="ease-[cubic-bezier(0.6,0.6,0,1)] absolute top-0 left-0 z-[6] transform transition-transform duration-500 group-hover/animated-card:translate-x-[-50%] h-full w-[200%]">
    <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 712 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 178C8 176.343 9.34315 175 11 175H25C26.6569 175 28 176.343 28 178V196H8V178Z" fill={color} />
      <path d="M32 168C32 166.343 33.3431 165 35 165H49C50.6569 165 52 166.343 52 168V196H32V168Z" fill={secondaryColor ?? color} />
      <path d="M67 173C67 171.343 68.3431 170 70 170H84C85.6569 170 87 171.343 87 173V196H67V173Z" fill={color} />
      <path d="M91 153C91 151.343 92.3431 150 94 150H108C109.657 150 111 151.343 111 153V196H91V153Z" fill={secondaryColor ?? color} />
      <path d="M126 142C126 140.343 127.343 139 129 139H143C144.657 139 146 140.343 146 142V196H126V142Z" fill={color} />
      <path d="M150 158C150 156.343 151.343 155 153 155H167C168.657 155 170 156.343 170 158V196H150V158Z" fill={secondaryColor ?? color} />
      <path d="M187 133C187 131.343 188.343 130 190 130H204C205.657 130 207 131.343 207 133V196H187V133Z" fill={color} />
      <path d="M211 161C211 159.343 212.343 158 214 158H228C229.657 158 231 159.343 231 161V196H211V161Z" fill={secondaryColor ?? color} />
      <path d="M248 150C248 148.343 249.343 147 251 147H265C266.657 147 268 148.343 268 150V196H248V150Z" fill={color} />
      <path d="M272 130C272 128.343 273.343 127 275 127H289C290.657 127 292 128.343 292 130V196H272V130Z" fill={secondaryColor ?? color} />
      <path d="M307 133C307 131.343 308.343 130 310 130H324C325.657 130 327 131.343 327 133V196H307V133Z" fill={color} />
      <path d="M331 155C331 153.343 332.343 152 334 152H348C349.657 152 351 153.343 351 155V196H331V155Z" fill={secondaryColor ?? color} />
      <path d="M363 161C363 159.343 364.343 158 366 158H380C381.657 158 383 159.343 383 161V196H363V161Z" fill={color} />
      <path d="M387 144C387 142.343 388.343 141 390 141H404C405.657 141 407 142.343 407 144V196H387V144Z" fill={secondaryColor ?? color} />
      <path d="M423 126C423 124.343 424.343 123 426 123H440C441.657 123 443 124.343 443 126V196H423V126Z" fill={color} />
      <path d="M447 142C447 140.343 448.343 139 450 139H464C465.657 139 467 140.343 467 142V196H447V142Z" fill={secondaryColor ?? color} />
      <path d="M483 125.461C483 124.102 484.343 123 486 123H500C501.657 123 503 124.102 503 125.461V196H483V125.461Z" fill={color} />
      <path d="M507 137.507C507 136.122 508.343 135 510 135H524C525.657 135 527 136.122 527 137.507V196H507V137.507Z" fill={secondaryColor ?? color} />
      <path d="M543 108.212C543 106.438 544.343 105 546 105H560C561.657 105 563 106.438 563 108.212V196H543V108.212Z" fill={color} />
      <path d="M567 116.485C567 115.112 568.343 114 570 114H584C585.657 114 587 115.112 587 116.485V196H567V116.485Z" fill={secondaryColor ?? color} />
      <path d="M603 79.8333C603 78.2685 604.343 77 606 77H620C621.657 77 623 78.2685 623 79.8333V196H603V79.8333Z" fill={color} />
      <path d="M627 91.8919C627 90.2947 628.343 89 630 89H644C645.657 89 647 90.2947 647 91.8919V196H627V91.8919Z" fill={secondaryColor ?? color} />
      <path d="M661 66.7887C661 65.2485 662.343 64 664 64H678C679.657 64 681 65.2485 681 66.7887V196H661V66.7887Z" fill={color} />
      <path d="M685 55.7325C685 54.2233 686.343 53 688 53H702C703.657 53 705 54.2233 705 55.7325V196H685V55.7325Z" fill={secondaryColor ?? color} />
    </svg>
  </div>
);

const HireLayer2 = ({ color }: { color: string }) => (
  <div className="absolute top-0 left-0 h-full w-full">
    <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 356 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_25_384_hire)">
        <path d="M1 131.5L33.5 125.5L64 102.5L93.5 118.5L124.5 90L154 100.5L183.5 76L207.5 92L244.5 51L274.5 60.5L307.5 46L334.5 28.5L356.5 1" stroke={color} />
        <path d="M33.5 125.5L1 131.5V197H356.5V1L335 28.5L306.5 46L274.5 60.5L244.5 51L207.5 92L183.5 76L154 100.5L124.5 90L93.5 118.5L64 102.5L33.5 125.5Z" fill={color} fillOpacity="0.3" />
      </g>
      <defs>
        <clipPath id="clip0_25_384_hire">
          <rect width="356" height="180" fill="white" />
        </clipPath>
      </defs>
    </svg>
    <div className="ease-[cubic-bezier(0.6,0.6,0,1)] absolute inset-0 z-[3] transform bg-gradient-to-r from-transparent from-0% to-[#fffbf0] to-15% transition-transform duration-500 group-hover/animated-card:translate-x-full" />
  </div>
);

const HireLayer3 = ({ color, secondaryColor }: { color: string; secondaryColor?: string }) => (
  <div className="absolute top-4 right-4 z-[8] flex items-center gap-1" style={{ "--color": color, "--secondary-color": secondaryColor } as React.CSSProperties}>
    <div className="flex shrink-0 items-center rounded-full border border-yellow-200 bg-white/70 px-2 py-0.5 backdrop-blur-sm transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0 shadow-sm">
      <div className="h-1.5 w-1.5 rounded-full bg-[var(--color)]" />
      <span className="ml-1.5 text-[10px] font-bold text-slate-800">You (90%)</span>
    </div>
    <div className="flex shrink-0 items-center rounded-full border border-yellow-200 bg-white/70 px-2 py-0.5 backdrop-blur-sm transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0 shadow-sm">
      <div className="h-1.5 w-1.5 rounded-full bg-[var(--secondary-color)]" />
      <span className="ml-1.5 text-[10px] font-bold text-slate-800">Avg (65%)</span>
    </div>
  </div>
);

function HireProbabilityVisual({ mainColor = "#f59e0b", secondaryColor = "#fbbf24", gridColor = "#f59e0b20" }: { mainColor?: string; secondaryColor?: string; gridColor?: string }) {
  return (
    <>
      <div className="absolute inset-0 z-20 cursor-crosshair" />
      <div className="relative h-full w-full overflow-hidden rounded-t-xl">
        <HireLayer1 color={mainColor} secondaryColor={secondaryColor} />
        <HireLayer2 color={mainColor} />
        <HireLayer3 color={mainColor} secondaryColor={secondaryColor} />
        <EllipseGradient id="hire-ellipse" color={mainColor} />
        <GridLayer color={gridColor} />
      </div>
    </>
  );
}

const MarketLayer1 = ({ color, secondaryColor }: { color: string; secondaryColor?: string }) => (
  <div className="absolute top-4 left-4 z-[8] flex items-center gap-1" style={{ "--color": color, "--secondary-color": secondaryColor } as React.CSSProperties}>
    <div className="flex shrink-0 items-center rounded-full border border-zinc-200 bg-white/60 px-2 py-0.5 backdrop-blur-sm transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0 shadow-sm">
      <div className="h-1.5 w-1.5 rounded-full bg-[var(--color)]" />
      <span className="ml-1.5 text-[10px] font-bold text-slate-800">+12% Base</span>
    </div>
    <div className="flex shrink-0 items-center rounded-full border border-zinc-200 bg-white/60 px-2 py-0.5 backdrop-blur-sm transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0 shadow-sm">
      <div className="h-1.5 w-1.5 rounded-full bg-[var(--secondary-color)]" />
      <span className="ml-1.5 text-[10px] font-bold text-slate-800">Top 10%</span>
    </div>
  </div>
);

const MarketLayer3 = ({ color }: { color: string }) => (
  <div className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] absolute inset-0 z-[6] flex translate-y-full items-center justify-center opacity-0 transition-all duration-500 group-hover/animated-card:translate-y-0 group-hover/animated-card:opacity-100">
    <svg width="100%" height="100%" viewBox="0 0 356 180" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="356" height="180" fill="url(#paint0_linear_market)" />
      <defs>
        <linearGradient id="paint0_linear_market" x1="178" y1="0" x2="178" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0.35" stopColor={color} stopOpacity="0" />
          <stop offset="1" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const MarketLayer4 = ({ color, secondaryColor, hovered }: { color: string; secondaryColor?: string; hovered?: boolean }) => {
  const rectsData = [
    { width: 15, height: 20, y: 110, hoverHeight: 20, hoverY: 130, x: 40, fill: "currentColor", hoverFill: secondaryColor ?? color },
    { width: 15, height: 20, y: 90, hoverHeight: 20, hoverY: 130, x: 60, fill: color, hoverFill: color },
    { width: 15, height: 40, y: 70, hoverHeight: 30, hoverY: 120, x: 80, fill: color, hoverFill: color },
    { width: 15, height: 30, y: 80, hoverHeight: 50, hoverY: 100, x: 100, fill: color, hoverFill: color },
    { width: 15, height: 30, y: 110, hoverHeight: 40, hoverY: 110, x: 120, fill: "currentColor", hoverFill: secondaryColor ?? color },
    { width: 15, height: 50, y: 110, hoverHeight: 20, hoverY: 130, x: 140, fill: "currentColor", hoverFill: secondaryColor ?? color },
    { width: 15, height: 50, y: 60, hoverHeight: 30, hoverY: 120, x: 160, fill: color, hoverFill: color },
    { width: 15, height: 30, y: 80, hoverHeight: 20, hoverY: 130, x: 180, fill: color, hoverFill: color },
    { width: 15, height: 20, y: 110, hoverHeight: 40, hoverY: 110, x: 200, fill: "currentColor", hoverFill: secondaryColor ?? color },
    { width: 15, height: 40, y: 70, hoverHeight: 60, hoverY: 90, x: 220, fill: color, hoverFill: color },
    { width: 15, height: 30, y: 110, hoverHeight: 70, hoverY: 80, x: 240, fill: "currentColor", hoverFill: secondaryColor ?? color },
    { width: 15, height: 50, y: 110, hoverHeight: 50, hoverY: 100, x: 260, fill: "currentColor", hoverFill: secondaryColor ?? color },
    { width: 15, height: 20, y: 110, hoverHeight: 80, hoverY: 70, x: 280, fill: "currentColor", hoverFill: secondaryColor ?? color },
    { width: 15, height: 30, y: 80, hoverHeight: 90, hoverY: 60, x: 300, fill: color, hoverFill: color },
  ];
  return (
    <div className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] absolute inset-0 z-[8] flex h-full w-full items-center justify-center text-slate-300 transition-transform duration-500 group-hover/animated-card:scale-110">
      <svg width="100%" height="100%" viewBox="0 0 356 180" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
        {rectsData.map((rect, index) => (
          <rect
            key={index}
            width={rect.width}
            height={hovered ? rect.hoverHeight : rect.height}
            x={rect.x}
            y={hovered ? rect.hoverY : rect.y}
            fill={hovered ? rect.hoverFill : rect.fill}
            rx="2"
            ry="2"
            className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] transition-all duration-500"
          />
        ))}
      </svg>
    </div>
  );
};

function MarketValueVisual({ mainColor = "#6b8e23", secondaryColor = "#85b02c", gridColor = "#6b8e2330" }: { mainColor?: string; secondaryColor?: string; gridColor?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <div className="absolute inset-0 z-20 cursor-crosshair" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ "--color": mainColor, "--secondary-color": secondaryColor } as React.CSSProperties} />
      <div className="relative h-full w-full overflow-hidden rounded-t-xl">
        <MarketLayer4 color={mainColor} secondaryColor={secondaryColor} hovered={hovered} />
        <MarketLayer3 color={mainColor} />
        <MarketLayer1 color={mainColor} secondaryColor={secondaryColor} />
        <EllipseGradient id="market-ellipse" color={mainColor} />
        <GridLayer color={gridColor} />
      </div>
    </>
  );
}

const StrategySection = ({ title, icon: Icon, colorClass, items }: { title: string; icon: React.ComponentType<{ size?: number }>; colorClass: 'indigo' | 'amber'; items: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100/70",
    amber: "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100/70",
  };
  const iconBgMap: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <section className={cn("border rounded-xl p-5 relative overflow-hidden shadow-sm transition-all duration-300", isOpen ? "pb-6" : "", colorMap[colorClass])}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between relative z-10 outline-none group text-left cursor-pointer">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", iconBgMap[colorClass])}>
            <Icon size={18} />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="text-gray-400 group-hover:text-gray-600" size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <ul className="space-y-3 px-1">
              {items.map((item, i) => (
                <motion.li initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className={cn("mt-0.5 flex-shrink-0", colorClass === 'indigo' ? 'text-indigo-600' : 'text-amber-600')} />
                  <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export interface RoleMatchAnalysisProps {
  jobTitle: string;
  company: string;
  matchScore: number;
  hireProbability: number;
  marketPercentile: number;
  marketEstimateRange: string;
  marketLeverage?: string;
  /** Skill names for ATS chart (front) and gap analysis (back: missing ones) */
  skills: { name: string; matched: boolean }[];
  /** Keywords found in job (for Gap Analysis back) */
  tags: string[];
  /** "Why this is a top match" bullets */
  reasons: string[];
  /** Interview strategy bullets */
  strategy: string[];
  /** Optional: show "Top Match" badge */
  isTopMatch?: boolean;
}

export default function RoleMatchAnalysis({
  jobTitle,
  company,
  matchScore,
  hireProbability,
  marketPercentile,
  marketEstimateRange,
  marketLeverage = "+12% above average",
  skills,
  tags,
  reasons,
  strategy,
  isTopMatch = true,
}: RoleMatchAnalysisProps) {
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false });
  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const skillNames = skills.map((s) => s.name);
  const missingSkills = skills.filter((s) => !s.matched).map((s) => s.name);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Role Match Analysis</h2>
          <div className="flex items-center gap-2 mt-2 text-slate-500">
            <Briefcase size={16} className="text-indigo-500" />
            <span className="font-medium">{jobTitle} @ {company}</span>
          </div>
        </div>
        {isTopMatch && (
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold tracking-wide uppercase">Top Match</span>
          </div>
        )}
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Deep Dive Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CARD 1: ATS MATCH */}
          <div className="group relative h-[380px] w-full [perspective:2000px] flip-container cursor-pointer" onClick={() => !flippedCards[1] && toggleFlip(1)}>
            <motion.div initial={false} animate={{ rotateY: flippedCards[1] ? 180 : 0 }} transition={{ type: "spring", stiffness: 60, damping: 15 }} className="relative h-full w-full [transform-style:preserve-3d]">
              <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all overflow-hidden flex flex-col">
                <div className="group/animated-card relative flex-1 bg-orange-50/50 overflow-hidden">
                  <ATSMatchVisual score={matchScore} skills={skillNames} mainColor="#ea580c" secondaryColor="#fb923c" gridColor="#ea580c30" />
                </div>
                <div className="relative h-[120px] bg-white p-5 flex flex-col justify-between border-t border-slate-100 z-30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">ATS Match</h3>
                      <p className="text-xs text-slate-500 mt-1">Keywords & skill alignment</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-start justify-end text-slate-900">
                        <span className="text-2xl font-black leading-none">{matchScore}</span>
                        <span className="text-xs font-bold mt-0.5">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-xs font-bold text-[#ea580c] bg-orange-50 px-2 py-1 rounded">
                      {matchScore >= 90 ? "Strong Match" : matchScore >= 75 ? "Good Match" : matchScore >= 60 ? "Fair Match" : "Weak Match"}
                    </span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleFlip(1); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                      Gap Analysis <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-slate-200 shadow-xl border rounded-xl p-6 flex flex-col overflow-hidden">
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleFlip(1); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1 bg-slate-50 rounded-full hover:bg-slate-100">
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-orange-50 text-[#ea580c]">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Gap Analysis</h3>
                    <p className="text-xs text-slate-500 font-medium">ATS Compatibility Report</p>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-slate-800">Found Keywords</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.length > 0 ? tags.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                          <CheckCircle2 size={12} className="text-[#ea580c]" /> {t}
                        </span>
                      )) : (
                        <span className="text-[11px] text-slate-500">No keywords parsed yet.</span>
                      )}
                    </div>
                  </div>
                  {missingSkills.length > 0 && (
                    <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-red-600" />
                        <p className="text-xs font-bold text-red-800">Missing Critical Skills</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkills.map((s) => (
                          <span key={s} className="inline-flex items-center rounded bg-white border border-red-200 px-2 py-1 text-[11px] font-medium text-red-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-500 font-medium">Parsing Status</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    <CheckCircle2 size={14} />
                    <span className="text-[11px] font-bold">Valid PDF</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CARD 2: HIRE PROBABILITY */}
          <div className="group relative h-[380px] w-full [perspective:2000px] flip-container cursor-pointer" onClick={() => !flippedCards[2] && toggleFlip(2)}>
            <motion.div initial={false} animate={{ rotateY: flippedCards[2] ? 180 : 0 }} transition={{ type: "spring", stiffness: 60, damping: 15 }} className="relative h-full w-full [transform-style:preserve-3d]">
              <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all overflow-hidden flex flex-col">
                <div className="group/animated-card relative flex-1 bg-[#fffbf0] overflow-hidden flex flex-col">
                  <HireProbabilityVisual mainColor="#f59e0b" secondaryColor="#fbbf24" gridColor="#f59e0b20" />
                </div>
                <div className="relative h-[120px] bg-white p-5 flex flex-col justify-between border-t border-slate-100 z-30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">Hire Probability</h3>
                      <p className="text-xs text-slate-500 mt-1">Likelihood of interview</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-start justify-end text-slate-900">
                        <span className="text-2xl font-black leading-none">{hireProbability}</span>
                        <span className="text-xs font-bold mt-0.5">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                      {hireProbability >= 80 ? "Very Likely" : hireProbability >= 60 ? "Likely" : "Moderate"}
                    </span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleFlip(2); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                      View Insights <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-slate-200 shadow-xl border rounded-xl p-6 flex flex-col overflow-hidden">
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleFlip(2); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1 bg-slate-50 rounded-full hover:bg-slate-100">
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-full bg-yellow-50 text-yellow-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Probability Insights</h3>
                    <p className="text-xs text-slate-500 font-medium">Why you stand out</p>
                  </div>
                </div>
                <div className="flex-1 space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 mb-2">Experience Benchmark</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1"><span className="font-bold text-slate-800">You (5 Yrs)</span></div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-[85%] rounded-full" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1"><span className="text-slate-500 font-medium">Role Avg (4 Yrs)</span></div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-300 w-[65%] rounded-full" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-yellow-50/50 border border-yellow-100 p-3">
                    <div className="flex gap-2">
                      <div className="mt-0.5 relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">High Demand Alert</p>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Product Design roles are up 24% YoY in your current region.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 mt-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Competitive Edge</p>
                  <p className="text-[11px] text-slate-700 leading-snug">
                    Your dual expertise in <span className="font-bold text-yellow-600">UX Research</span> & <span className="font-bold text-yellow-600">Prototyping</span> puts you ahead of 80% of applicants.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CARD 3: MARKET VALUE */}
          <div className="group relative h-[380px] w-full [perspective:2000px] flip-container cursor-pointer" onClick={() => !flippedCards[3] && toggleFlip(3)}>
            <motion.div initial={false} animate={{ rotateY: flippedCards[3] ? 180 : 0 }} transition={{ type: "spring", stiffness: 60, damping: 15 }} className="relative h-full w-full [transform-style:preserve-3d]">
              <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all overflow-hidden flex flex-col">
                <div className="group/animated-card relative flex-1 bg-slate-50/80 overflow-hidden">
                  <MarketValueVisual mainColor="#6b8e23" secondaryColor="#85b02c" gridColor="#6b8e2320" />
                </div>
                <div className="relative h-[120px] bg-white p-5 flex flex-col justify-between border-t border-slate-100 z-30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">Market Value</h3>
                      <p className="text-xs text-slate-500 mt-1">Compensation benchmark</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-start justify-end text-slate-900">
                        {marketPercentile > 0 ? (
                          <>
                            <span className="text-2xl font-black leading-none">{marketPercentile}</span>
                            <span className="text-xs font-bold mt-0.5">th</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold leading-none">{marketEstimateRange}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-xs font-bold text-[#6b8e23] bg-[#f4f5f0] px-2 py-1 rounded">{marketPercentile > 0 ? "Percentile" : "Range"}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleFlip(3); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                      Check Leverage <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-slate-200 shadow-xl border rounded-xl p-6 flex flex-col overflow-hidden">
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleFlip(3); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1 bg-slate-50 rounded-full hover:bg-slate-100">
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-[#f4f5f0] text-[#6b8e23]">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Benchmarking</h3>
                    <p className="text-xs text-slate-500 font-medium">Base Compensation</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-xl border border-slate-100 mb-5">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Estimated Range</p>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{marketEstimateRange}</div>
                  {marketLeverage && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-full bg-white border border-[#e1e4d8] px-3 py-1 shadow-sm">
                      <ArrowUp size={12} className="text-[#6b8e23]" />
                      <span className="text-xs font-bold text-[#4a5d23]">{marketLeverage}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-xs font-semibold text-slate-800">Negotiation Leverage</p>
                    <span className="text-xs font-bold text-[#6b8e23]">Strong</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-slate-200 w-[20%]" />
                    <div className="h-full bg-slate-300 w-[30%]" />
                    <div className="h-full bg-[#a3b18a] w-[25%]" />
                    <div className="h-full bg-[#6b8e23] w-[25%]" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Sources</span>
                  <div className="flex gap-3 text-slate-500">
                    <div className="flex items-center gap-1" title="Levels.fyi"><Database size={12} /><span className="text-[10px] font-medium">Levels</span></div>
                    <div className="flex items-center gap-1" title="Glassdoor"><Zap size={12} /><span className="text-[10px] font-medium">Market</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
        <StrategySection title="Why this is a top match for you" icon={Sparkles} colorClass="indigo" items={reasons.length > 0 ? reasons : ["Your profile aligns with this role."]} />
        <StrategySection title="Recommended Interview Strategy" icon={Target} colorClass="amber" items={strategy.length > 0 ? strategy : ["Prepare to highlight your relevant experience."]} />
      </div>
    </div>
  );
}
