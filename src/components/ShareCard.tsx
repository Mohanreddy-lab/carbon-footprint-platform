import { useRef } from 'react';
import { Download, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getScoreLabel, getLevelInfo } from '../data/emissionData';

export default function ShareCard() {
  const { state } = useApp();
  const { user, achievements } = state;
  const cardRef = useRef<HTMLDivElement>(null);

  const scoreLabel = getScoreLabel(user.carbonScore);
  const levelInfo = getLevelInfo(user.xp);
  const unlockedAch = achievements.filter(a => a.unlocked).slice(0, 5);
  const scorePercent = (user.carbonScore / 1000) * 100;

  const handleShare = async () => {
    const text = `🌿 My EcoTrack Carbon Score: ${user.carbonScore}/1000 (${scoreLabel.text})\n` +
      `Level ${user.level} ${levelInfo.title} ${levelInfo.icon}\n` +
      `🔥 ${user.streak} day streak | 💚 ${(user.totalCO2Saved / 1000).toFixed(1)}t CO2 saved\n\n` +
      `Join the fight against climate change! 🌍`;
    if (navigator.share) {
      await navigator.share({ title: 'My EcoTrack Score', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Score card copied to clipboard! ✅');
    }
  };

  return (
    <div className="space-y-3">
      {/* Card Preview */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, #060b18 0%, #0f172a 50%, #064e3b22 100%)',
          border: '1px solid rgba(16,185,129,0.25)',
          boxShadow: '0 0 40px rgba(16,185,129,0.1)',
        }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌿</span>
          <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">EcoTrack</span>
          <div className="flex-1 h-px bg-emerald-500/20" />
          <span className="text-[10px] text-slate-600">Carbon Score Card</span>
        </div>

        {/* Main score */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <svg width="70" height="70">
              <circle cx="35" cy="35" r="28" stroke="#1e293b" strokeWidth="6" fill="none" />
              <circle
                cx="35" cy="35" r="28"
                stroke={scoreLabel.color}
                strokeWidth="6" fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - scorePercent / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 35 35)"
                style={{ filter: `drop-shadow(0 0 6px ${scoreLabel.color}88)` }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold" style={{ color: scoreLabel.color }}>{user.carbonScore}</span>
            </div>
          </div>

          <div>
            <p className="text-white font-bold text-lg leading-tight">{user.name || 'Eco Hero'}</p>
            <p className="text-emerald-400 text-sm">{scoreLabel.emoji} {scoreLabel.text}</p>
            <p className="text-slate-500 text-xs">{levelInfo.icon} {levelInfo.title}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Score', value: `${user.carbonScore}`, unit: '/1000', color: scoreLabel.color },
            { label: 'Streak', value: `${user.streak}`, unit: 'd 🔥', color: '#f97316' },
            { label: 'CO2 Saved', value: `${(user.totalCO2Saved/1000).toFixed(1)}`, unit: 't 💚', color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="text-center rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-xs font-bold" style={{ color: s.color }}>{s.value}<span className="text-[9px] opacity-60">{s.unit}</span></p>
              <p className="text-[9px] text-slate-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        {unlockedAch.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-600">Badges:</span>
            {unlockedAch.map(a => (
              <span key={a.id} className="text-base" title={a.title}>{a.icon}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-[9px] text-slate-700 mt-3 text-center">ecotrack.netlify.app • Fighting climate change, one action at a time 🌍</p>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
        >
          <Share2 size={15} /> Share My Score
        </button>
        <button
          onClick={handleShare}
          className="btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
        >
          <Download size={15} />
        </button>
      </div>
    </div>
  );
}
