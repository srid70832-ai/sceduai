import React from 'react';

interface KITLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const KITLogo: React.FC<KITLogoProps> = ({ size = 'md', className = '' }) => {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.25 : 1.0;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Institutional Crest Shield */}
      <div
        style={{
          width: `${48 * scale}px`,
          height: `${48 * scale}px`,
        }}
        className="relative shrink-0 rounded-xl bg-gradient-to-br from-rose-900 via-rose-950 to-slate-950 p-[1.5px] shadow-sm flex items-center justify-center border border-amber-500/30"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="kitCrestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="kitMaroonBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9F1239" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>
          </defs>

          {/* Academic Shield Base */}
          <path
            d="M 50 8 L 88 22 L 88 56 C 88 78 50 92 50 92 C 50 92 12 78 12 56 L 12 22 Z"
            fill="url(#kitMaroonBg)"
            stroke="url(#kitCrestGrad)"
            strokeWidth="3.5"
          />

          {/* Knowledge Flame */}
          <path
            d="M 50 24 C 45 32 42 38 42 44 C 42 49 45 53 50 53 C 55 53 58 49 58 44 C 58 38 55 32 50 24 Z"
            fill="url(#kitCrestGrad)"
          />

          {/* Academic Open Pages */}
          <path
            d="M 30 62 C 40 58 48 59 50 62 C 52 59 60 58 70 62 L 70 70 C 60 67 52 68 50 71 C 48 68 40 67 30 70 Z"
            fill="#FFFFFF"
          />
          <line x1="50" y1="62" x2="50" y2="71" stroke="#881337" strokeWidth="1.5" />

          {/* Tech Nodes */}
          <circle cx="50" cy="80" r="3" fill="#FBBF24" />
          <circle cx="40" cy="79" r="1.5" fill="#FBBF24" />
          <circle cx="60" cy="79" r="1.5" fill="#FBBF24" />
        </svg>
      </div>

      {/* Institutional Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-black text-rose-800 dark:text-rose-400 text-sm tracking-tight">
            KIT
          </span>
          <span className="text-[11px] font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
            Kalaignarkarunanidhi Institute of Technology
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
          Autonomous Institution • Affiliated to Anna University, Chennai
        </p>
      </div>
    </div>
  );
};
