import { useApp } from '../context/AppContext';

function getGlobeColor(score: number) {
  if (score >= 800) return { main: '#10b981', glow: 'rgba(16,185,129,0.5)', secondary: '#34d399' };
  if (score >= 600) return { main: '#14b8a6', glow: 'rgba(20,184,166,0.5)', secondary: '#2dd4bf' };
  if (score >= 300) return { main: '#f59e0b', glow: 'rgba(245,158,11,0.5)', secondary: '#fbbf24' };
  return { main: '#ef4444', glow: 'rgba(239,68,68,0.5)', secondary: '#f87171' };
}

export default function GlobeWidget() {
  const { state } = useApp();
  const score = state.user.carbonScore;
  const colors = getGlobeColor(score);

  const orbitDots = Array.from({ length: 6 }, (_, i) => ({
    angle: (i * 60 * Math.PI) / 180,
    delay: i * 0.5,
  }));

  return (
    <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
      {/* Outer atmosphere */}
      <div
        className="absolute rounded-full"
        style={{
          width: 96, height: 96,
          background: `radial-gradient(circle at 35% 35%, ${colors.glow} 0%, transparent 70%)`,
          filter: 'blur(8px)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'relative', zIndex: 1 }}>
        <defs>
          <radialGradient id="globeGrad" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.main} stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id="atmosphereGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor={colors.main} stopOpacity="0.15" />
            <stop offset="100%" stopColor={colors.main} stopOpacity="0" />
          </radialGradient>
          <filter id="globeGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <clipPath id="globeClip">
            <circle cx="40" cy="40" r="30" />
          </clipPath>
        </defs>

        {/* Base sphere */}
        <circle cx="40" cy="40" r="30" fill="#0f172a" stroke={colors.main} strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="40" cy="40" r="30" fill="url(#globeGrad)" opacity="0.7" />

        {/* Simplified continent-like shapes */}
        <g clipPath="url(#globeClip)" opacity="0.6">
          {/* North America-like */}
          <ellipse cx="28" cy="32" rx="8" ry="6" fill={colors.main} opacity="0.5" transform="rotate(-15,28,32)" />
          {/* Europe-like */}
          <ellipse cx="44" cy="28" rx="5" ry="4" fill={colors.secondary} opacity="0.4" />
          {/* Asia-like */}
          <ellipse cx="55" cy="33" rx="9" ry="5" fill={colors.main} opacity="0.4" transform="rotate(10,55,33)" />
          {/* Africa-like */}
          <ellipse cx="46" cy="46" rx="5" ry="8" fill={colors.secondary} opacity="0.4" />
          {/* South America-like */}
          <ellipse cx="30" cy="50" rx="4" ry="7" fill={colors.main} opacity="0.35" transform="rotate(-10,30,50)" />
          {/* Australia-like */}
          <ellipse cx="58" cy="52" rx="5" ry="3" fill={colors.secondary} opacity="0.35" />
        </g>

        {/* Latitude lines */}
        <g clipPath="url(#globeClip)" stroke={colors.main} strokeWidth="0.5" fill="none" opacity="0.2">
          <ellipse cx="40" cy="40" rx="30" ry="8" />
          <ellipse cx="40" cy="32" rx="25" ry="6" />
          <ellipse cx="40" cy="48" rx="25" ry="6" />
        </g>

        {/* Vertical meridian lines */}
        <g clipPath="url(#globeClip)" stroke={colors.main} strokeWidth="0.5" fill="none" opacity="0.2">
          <line x1="40" y1="10" x2="40" y2="70" />
          <ellipse cx="40" cy="40" rx="15" ry="30" />
        </g>

        {/* Specular highlight */}
        <circle cx="30" cy="28" r="8" fill="white" opacity="0.06" />

        {/* Atmosphere */}
        <circle cx="40" cy="40" r="30" fill="url(#atmosphereGrad)" />
        <circle cx="40" cy="40" r="32" fill="none" stroke={colors.main} strokeWidth="1.5" strokeOpacity="0.2" />
      </svg>

      {/* Orbital ring with animated dots */}
      <div
        className="absolute"
        style={{
          width: 100, height: 100,
          top: 0, left: 0,
          animation: 'globeSpin 12s linear infinite',
        }}
      >
        {orbitDots.map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 5,
              height: 5,
              background: colors.main,
              boxShadow: `0 0 6px ${colors.glow}`,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateX(46px)`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes globeSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
