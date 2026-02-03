import React from 'react';

interface SkillHoopLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const SkillHoopLogo: React.FC<SkillHoopLogoProps> = ({ 
  className = "", 
  width = 350, 
  height = 70 
}) => {
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
      <defs>
        {/* Optimized gradient for the text */}
        <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2A9D8F" />
          <stop offset="100%" stopColor="#6BCB77" />
        </linearGradient>
      </defs>
      
      <g transform="translate(0, 3)">
        {/* Charcoal Black Background with Rounded Corners */}
        <rect x="0" y="0" width="64" height="64" rx="16" fill="#171717" />

        {/* Double Arrow Icon (White, centered in box) */}
        {/* Reduced size and stroke width */}
        <path d="M17 20 L30 32 L17 44" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34 20 L47 32 L34 44" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {/* Text Content - Moved x to 80 to accommodate background box */}
      <text x="80" y="50" fontFamily="'Poppins', sans-serif" fontWeight="600" fontSize="46" letterSpacing="-0.03em">
        <tspan fill="#171717">Skill</tspan>
        <tspan fill="#171717">Hoop</tspan>
      </text>
    </svg>
  );
};

export default SkillHoopLogo;
