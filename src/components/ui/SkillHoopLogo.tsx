import React from 'react';

interface SkillHoopLogoProps {
  className?: string;
  width?: number;
  height?: number;
  /** When true, show only the icon (rounded box + arrows), no "SkillHoop" text */
  iconOnly?: boolean;
}

const logoDefs = (
  <defs>
    {/* Polished Glass Glaze Effect */}
    <linearGradient id="glass-glaze" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stopColor="white" stopOpacity="0.15" />
      <stop offset="40%" stopColor="white" stopOpacity="0.05" />
      <stop offset="100%" stopColor="white" stopOpacity="0" />
    </linearGradient>

    {/* Edge Reflection */}
    <linearGradient id="edge-catch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="white" stopOpacity="0.4" />
      <stop offset="50%" stopColor="white" stopOpacity="0.05" />
      <stop offset="100%" stopColor="white" stopOpacity="0.2" />
    </linearGradient>

    {/* Polished Metallic Text Gradient for 'Skill' */}
    <linearGradient id="skill-text-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#2D2D2D" />
      <stop offset="100%" stopColor="#171717" />
    </linearGradient>
  </defs>
);

const iconMark = (
  <g transform="translate(0, 3)">
    {/* BASE: Solid Dark Gray/Black (#171717) */}
    <rect x="0" y="0" width="64" height="64" rx="19" fill="#171717" />

    {/* LAYER 2: Subtle Depth Overlay */}
    <rect x="2" y="2" width="60" height="60" rx="17" fill="white" fillOpacity="0.02" />

    {/* LAYER 3: Crystal Gloss Top */}
    <path
      d="M19 2 C10 2 2 10 2 19 L2 30 C15 24 49 24 62 30 L62 19 C62 10 54 2 45 2 Z"
      fill="url(#glass-glaze)"
    />

    {/* BORDER: Sharp Edge Reflection */}
    <rect
      x="0.75"
      y="0.75"
      width="62.5"
      height="62.5"
      rx="18.25"
      stroke="url(#edge-catch)"
      strokeWidth="1.2"
    />

    {/* CONTENT: Pure White Arrows (#FFFFFF) */}
    <g transform="translate(3.5, -0.5) scale(0.92)">
      <g transform="rotate(-45 32 32)">
        <path
          d="M16 18 L30 32 L16 46"
          stroke="#FFFFFF"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M34 18 L48 32 L34 46"
          stroke="#FFFFFF"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  </g>
);

const SkillHoopLogo: React.FC<SkillHoopLogoProps> = ({
  className = "",
  width = 350,
  height = 70,
  iconOnly = false,
}) => {
  if (iconOnly) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 3 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SkillHoop"
        className={className}
      >
        {logoDefs}
        {iconMark}
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 350 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SkillHoop Logo"
      className={className}
    >
      {logoDefs}
      {iconMark}

      {/* TEXT: Refined Hybrid Typography */}
      <text x="84" y="50" fontFamily="'Poppins', sans-serif" letterSpacing="-0.04em">
        <tspan fill="url(#skill-text-gradient)" fontWeight="600" fontSize="48">
          Skill
        </tspan>
        <tspan fill="#475569" fontWeight="600" fontSize="48">
          Hoop
        </tspan>
      </text>
    </svg>
  );
};

export default SkillHoopLogo;
