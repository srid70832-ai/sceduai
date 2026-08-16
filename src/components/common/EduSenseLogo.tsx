import React from 'react';

interface EduSenseLogoProps {
  variant?: 'full' | 'horizontal' | 'compact' | 'emblem' | 'stacked';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTagline?: boolean;
  className?: string;
  isDark?: boolean;
  accentVariant?: 'emerald' | 'indigo' | 'default';
}

export const EduSenseEmblem: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 48, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="SC EduSense AI Emblem"
    >
      <defs>
        {/* Left Brain Blue Gradient */}
        <linearGradient id="brainBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Right Brain Red/Crimson Gradient */}
        <linearGradient id="brainRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="50%" stopColor="#9F1239" />
          <stop offset="100%" stopColor="#4C0519" />
        </linearGradient>

        {/* Left Neural Orbit Blue Gradient */}
        <linearGradient id="orbitBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Right Neural Orbit Orange Gradient */}
        <linearGradient id="orbitOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>

        {/* Cap Shadow & Highlights */}
        <linearGradient id="mortarboardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="goldTasselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ============================================================ */}
      {/* 1. SURROUNDING NEURAL & CIRCUIT ORBITAL ARCS */}
      {/* ============================================================ */}

      {/* LEFT SIDE (BLUE / CYAN ORBITS) */}
      <g stroke="url(#orbitBlueGrad)" strokeWidth="3.5" strokeLinecap="round">
        {/* Outer Arc */}
        <path d="M 28 115 A 76 76 0 0 1 45 68" />
        {/* Middle Arc with Node Connection */}
        <path d="M 38 122 A 66 66 0 0 1 54 62" />
        {/* Inner Arc */}
        <path d="M 48 128 A 54 54 0 0 1 65 60" />
      </g>

      {/* Left Circuit Lines & Pins */}
      <g stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round">
        <line x1="28" y1="115" x2="20" y2="115" />
        <line x1="38" y1="122" x2="38" y2="132" />
        <line x1="45" y1="68" x2="36" y2="60" />
        <line x1="54" y1="62" x2="50" y2="52" />
      </g>

      {/* Left Circuit Nodes (Dots) */}
      <g fill="#0284C7">
        <circle cx="20" cy="115" r="4.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
        <circle cx="38" cy="132" r="3.5" fill="#0EA5E9" />
        <circle cx="36" cy="60" r="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
        <circle cx="50" cy="52" r="4" fill="#0284C7" />
        <circle cx="28" cy="88" r="3" fill="#38BDF8" />
        <circle cx="42" cy="95" r="3.5" fill="#0284C7" />
      </g>

      {/* RIGHT SIDE (ORANGE / AMBER ORBITS) */}
      <g stroke="url(#orbitOrangeGrad)" strokeWidth="3.5" strokeLinecap="round">
        {/* Outer Arc */}
        <path d="M 172 115 A 76 76 0 0 0 155 68" />
        {/* Middle Arc */}
        <path d="M 162 122 A 66 66 0 0 0 146 62" />
        {/* Inner Arc */}
        <path d="M 152 128 A 54 54 0 0 0 135 60" />
      </g>

      {/* Right Circuit Lines & Pins */}
      <g stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round">
        <line x1="172" y1="115" x2="180" y2="115" />
        <line x1="162" y1="122" x2="162" y2="132" />
        <line x1="155" y1="68" x2="164" y2="60" />
        <line x1="146" y1="62" x2="150" y2="52" />
      </g>

      {/* Right Circuit Nodes (Dots) */}
      <g fill="#EA580C">
        <circle cx="180" cy="115" r="4.5" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5" />
        <circle cx="162" cy="132" r="3.5" fill="#F97316" />
        <circle cx="164" cy="60" r="4" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5" />
        <circle cx="150" cy="52" r="4" fill="#EA580C" />
        <circle cx="172" cy="88" r="3" fill="#FB923C" />
        <circle cx="158" cy="95" r="3.5" fill="#EA580C" />
      </g>

      {/* ============================================================ */}
      {/* 2. THE DUAL-HEMISPHERE NEURAL BRAIN */}
      {/* ============================================================ */}

      {/* Left Hemisphere (Blue Glowing AI Lobes) */}
      <g id="left-brain" fill="url(#brainBlueGrad)">
        {/* Main Brain Lobes Contour */}
        <path d="M 98 72 C 86 70 76 74 72 82 C 68 88 66 96 68 104 C 70 110 74 116 80 120 C 86 124 94 126 98 126 Z" />
        {/* Detailed Lobes & Gyri */}
        <path d="M 98 76 C 88 75 80 80 77 87 C 75 92 75 97 78 101 C 82 104 88 104 92 100 C 95 97 96 90 98 88 Z" fill="#0284C7" />
        <path d="M 76 103 C 74 107 75 113 79 117 C 84 121 91 123 96 123 L 96 108 C 91 110 83 109 76 103 Z" fill="#0369A1" />
      </g>

      {/* Left Brain Neural Circuits Overlay */}
      <g stroke="#BAE6FD" strokeWidth="1.6" strokeLinecap="round" opacity="0.95">
        <path d="M 85 84 Q 90 90 95 88" />
        <path d="M 79 96 Q 86 98 94 95" />
        <path d="M 84 112 Q 90 110 96 114" />
        <circle cx="85" cy="84" r="1.8" fill="#FFFFFF" />
        <circle cx="95" cy="88" r="1.8" fill="#FFFFFF" />
        <circle cx="79" cy="96" r="1.8" fill="#FFFFFF" />
        <circle cx="94" cy="95" r="1.8" fill="#FFFFFF" />
        <circle cx="84" cy="112" r="1.8" fill="#FFFFFF" />
        <circle cx="96" cy="114" r="1.8" fill="#FFFFFF" />
      </g>

      {/* Right Hemisphere (Deep Crimson/Red Neural Network) */}
      <g id="right-brain" fill="url(#brainRedGrad)">
        {/* Main Brain Lobes Contour */}
        <path d="M 102 72 C 114 70 124 74 128 82 C 132 88 134 96 132 104 C 130 110 126 116 120 120 C 114 124 106 126 102 126 Z" />
        {/* Detailed Lobes & Gyri */}
        <path d="M 102 76 C 112 75 120 80 123 87 C 125 92 125 97 122 101 C 118 104 112 104 108 100 C 105 97 104 90 102 88 Z" fill="#9F1239" />
        <path d="M 124 103 C 126 107 125 113 121 117 C 116 121 109 123 104 123 L 104 108 C 109 110 117 109 124 103 Z" fill="#881337" />
      </g>

      {/* Right Brain Neural Circuits Overlay */}
      <g stroke="#FECDD3" strokeWidth="1.6" strokeLinecap="round" opacity="0.95">
        <path d="M 115 84 Q 110 90 105 88" />
        <path d="M 121 96 Q 114 98 106 95" />
        <path d="M 116 112 Q 110 110 104 114" />
        <circle cx="115" cy="84" r="1.8" fill="#FFFFFF" />
        <circle cx="105" cy="88" r="1.8" fill="#FFFFFF" />
        <circle cx="121" cy="96" r="1.8" fill="#FFFFFF" />
        <circle cx="106" cy="95" r="1.8" fill="#FFFFFF" />
        <circle cx="116" cy="112" r="1.8" fill="#FFFFFF" />
        <circle cx="104" cy="114" r="1.8" fill="#FFFFFF" />
      </g>

      {/* Central Division Fissure */}
      <line x1="100" y1="72" x2="100" y2="126" stroke="#0F172A" strokeWidth="2.5" />

      {/* ============================================================ */}
      {/* 3. OPEN BOOK AT THE BOTTOM */}
      {/* ============================================================ */}
      <g id="open-book">
        {/* Book Base / Outer Thick Stroke */}
        <path
          d="M 52 135 C 72 131 92 133 100 138 C 108 133 128 131 148 135 C 145 147 132 153 100 157 C 68 153 55 147 52 135 Z"
          fill="#0F172A"
        />

        {/* Left Page Layer (White/Slate) */}
        <path
          d="M 54 135 C 72 130 92 133 98 138 C 96 148 76 146 56 143 Z"
          fill="#F8FAFC"
        />

        {/* Right Page Layer (White/Slate) */}
        <path
          d="M 146 135 C 128 130 108 133 102 138 C 104 148 124 146 144 143 Z"
          fill="#F8FAFC"
        />

        {/* Book Pages Accent Lines */}
        <path
          d="M 58 139 C 74 135 90 137 96 141"
          stroke="#0F172A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 142 139 C 126 135 110 137 104 141"
          stroke="#0F172A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Lower Page Rim Curves */}
        <path
          d="M 50 148 C 70 144 90 147 100 151 C 110 147 130 144 150 148"
          stroke="#0F172A"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 44 154 C 68 150 90 153 100 157 C 110 153 132 150 156 154"
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* ============================================================ */}
      {/* 4. GRADUATION CAP (MORTARBOARD) ON TOP */}
      {/* ============================================================ */}
      <g id="mortarboard">
        {/* Cap Base Ring / Skull Cap */}
        <path
          d="M 78 48 C 78 48 88 56 100 56 C 112 56 122 48 122 48 L 122 55 C 122 62 112 67 100 67 C 88 67 78 62 78 55 Z"
          fill="#0F172A"
        />
        {/* White Trim / Inner Gap */}
        <path
          d="M 82 50 C 90 54 100 55 110 54 C 114 52 118 50 118 50"
          stroke="#F8FAFC"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Mortarboard Diamond Top */}
        <polygon
          points="100,20 158,38 100,56 42,38"
          fill="url(#mortarboardGrad)"
          stroke="#0F172A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Diamond Edge Bevel Highlight */}
        <polyline
          points="42,38 100,56 158,38"
          stroke="#334155"
          strokeWidth="2"
          fill="none"
        />

        {/* Center Button Pin */}
        <ellipse cx="100" cy="38" rx="4" ry="2.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1" />

        {/* Left Hanging Tassel */}
        <path
          d="M 100 38 Q 66 39 60 52 L 58 68"
          stroke="#E2E8F0"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Tassel End / Fringe */}
        <path
          d="M 58 68 L 56 76 L 61 76 Z"
          fill="url(#goldTasselGrad)"
          stroke="#CA8A04"
          strokeWidth="0.8"
        />
        <circle cx="58.5" cy="69" r="2.2" fill="#FACC15" />
      </g>
    </svg>
  );
};

export const EduSenseLogo: React.FC<EduSenseLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
  className = '',
  isDark,
  accentVariant = 'emerald',
}) => {
  // Size mapping
  const sizeMap = {
    xs: { emblem: 26, text: 'text-sm', tag: 'text-[9px]', gap: 'gap-2' },
    sm: { emblem: 34, text: 'text-base', tag: 'text-[10px]', gap: 'gap-2.5' },
    md: { emblem: 44, text: 'text-lg', tag: 'text-[11px]', gap: 'gap-3' },
    lg: { emblem: 56, text: 'text-2xl', tag: 'text-xs', gap: 'gap-3.5' },
    xl: { emblem: 72, text: 'text-3xl', tag: 'text-sm', gap: 'gap-4' },
    hero: { emblem: 96, text: 'text-4xl sm:text-5xl', tag: 'text-sm sm:text-base', gap: 'gap-5' },
  };

  const currentSize = sizeMap[size];
  const titleColor = isDark ? 'text-white' : 'text-slate-900 dark:text-white';
  const tagColor = isDark 
    ? (accentVariant === 'emerald' ? 'text-emerald-300/70' : 'text-slate-400')
    : 'text-slate-500 dark:text-slate-400';

  const aiGradient = accentVariant === 'emerald'
    ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300'
    : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400';

  if (variant === 'emblem') {
    return <EduSenseEmblem size={currentSize.emblem} className={className} />;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <EduSenseEmblem size={currentSize.emblem * 1.3} className="hover:scale-105 transition-transform duration-300" />
        <div className="mt-2">
          <div className={`font-extrabold text-sm tracking-widest uppercase ${titleColor} flex items-center justify-center gap-1.5`}>
            <span>SC EDUSENSE</span>
            <span className={`${aiGradient} bg-clip-text text-transparent font-black`}>AI</span>
          </div>
          {showTagline && (
            <p className={`text-[10px] ${tagColor} font-medium italic mt-0.5`}>
              “Your Intelligence for Academic Success.”
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${currentSize.gap} select-none ${className}`}>
      <EduSenseEmblem
        size={currentSize.emblem}
        className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1 shrink-0"
      />

      <div className="flex flex-col justify-center min-w-0">
        <div className={`font-extrabold tracking-tight leading-none ${titleColor} ${currentSize.text} flex items-center gap-1.5 whitespace-nowrap`}>
          <span className="text-white">SC EduSense</span>
          <span className={`${aiGradient} bg-clip-text text-transparent font-black text-[0.85em] px-1.5 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-700/50 shadow-xs`}>
            AI
          </span>
        </div>

        {showTagline && (
          <div
            className={`${tagColor} font-normal tracking-normal mt-1 leading-tight line-clamp-1 italic ${currentSize.tag}`}
          >
            “Your Intelligence for Academic Success.”
          </div>
        )}
      </div>
    </div>
  );
};
