import { useEffect, useState } from 'react';
import { X, Star } from 'lucide-react';
import { LEVELS } from '../data/emissionData';

interface Props {
  fromLevel: number;
  toLevel: number;
  onDismiss: () => void;
}

const LEVEL_PERKS: Record<number, string[]> = {
  1: ['🌿 Eco Sapling title', '🛡️ Shield protection unlocked', '📊 Advanced insights'],
  2: ['🌳 Eco Tree title', '🏆 Community leaderboard bonus', '⚡ Action XP multiplier'],
  3: ['🏕️ Eco Forest title', '💎 Rare achievements available', '🌍 Global impact tracker'],
  4: ['🌍 Planet Guardian title', '🦸 Epic achievements available', '🔑 Exclusive features'],
  5: ['🏆 Carbon Champion title', '👑 All achievements available', '🌟 Legend status'],
};

export default function LevelUpScreen({ fromLevel, toLevel, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);
  const levelInfo = LEVELS[Math.min(toLevel, LEVELS.length - 1)];
  const perks = LEVEL_PERKS[toLevel] ?? [];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(onDismiss, 7000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i * 30 * Math.PI) / 180,
    distance: 80 + Math.random() * 40,
    delay: i * 0.1,
  }));

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.3s ease both',
      }}
      onClick={onDismiss}
    >
      <div
        className="relative text-center px-8 py-10 rounded-3xl max-w-sm w-full mx-4"
        style={{
          background: 'rgba(15,23,42,0.95)',
          border: '1px solid rgba(245,158,11,0.3)',
          boxShadow: '0 0 60px rgba(245,158,11,0.2), 0 0 120px rgba(245,158,11,0.1)',
          animation: visible ? 'levelUpIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {sparkles.map((s, i) => (
            <div
              key={i}
              className="absolute w-2 h-2"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-${s.distance}px)`,
                animation: `sparkle 1.5s ${s.delay}s ease-in-out infinite`,
              }}
            >
              <Star size={8} className="text-amber-400" fill="#fbbf24" />
            </div>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X size={14} className="text-slate-400" />
        </button>

        {/* Level badge */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '2px solid rgba(245,158,11,0.4)',
              boxShadow: '0 0 30px rgba(245,158,11,0.3)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            {levelInfo.icon}
          </div>
        </div>

        <div className="mb-1">
          <span className="text-[10px] text-amber-400/70 uppercase tracking-widest font-bold">Level Up!</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl font-bold text-slate-500">Lv.{fromLevel}</span>
          <span className="text-amber-400 text-xl">→</span>
          <span className="text-4xl font-black text-amber-400">Lv.{toLevel}</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{levelInfo.title}</h2>
        <p className="text-slate-400 text-sm mb-5">You're leveling up your planet impact! 🌍</p>

        {perks.length > 0 && (
          <div
            className="text-left rounded-2xl p-3 mb-5 space-y-1.5"
            style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <p className="text-[10px] text-amber-400/70 uppercase tracking-wider font-bold mb-2">Unlocked at this level</p>
            {perks.map((perk, i) => (
              <p key={i} className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {perk}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={onDismiss}
          className="btn-primary w-full py-3 text-sm"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}
        >
          Keep Going! 💪
        </button>

        <style>{`
          @keyframes levelUpIn {
            0%   { opacity:0; transform:scale(0.6) translateY(30px); }
            70%  { transform:scale(1.04) translateY(-4px); }
            100% { opacity:1; transform:scale(1) translateY(0); }
          }
          @keyframes sparkle {
            0%,100% { opacity:0; transform:translate(-50%,-50%) rotate(0deg) translateY(60px) scale(0); }
            50%      { opacity:1; transform:translate(-50%,-50%) rotate(0deg) translateY(60px) scale(1); }
          }
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
          @keyframes pulse {
            0%,100%{box-shadow:0 0 30px rgba(245,158,11,0.3)}
            50%{box-shadow:0 0 50px rgba(245,158,11,0.5)}
          }
        `}</style>
      </div>
    </div>
  );
}
