import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLevelInfo, LEVELS, getScoreLabel } from '../data/emissionData';

const RARITY_STYLES = {
  common:    'border-slate-600 bg-slate-800/80',
  rare:      'border-blue-500/40 bg-blue-900/20',
  epic:      'border-purple-500/40 bg-purple-900/20',
  legendary: 'border-amber-500/40 bg-amber-900/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
};

const RARITY_TEXT = {
  common:    'text-slate-400',
  rare:      'text-blue-400',
  epic:      'text-purple-400',
  legendary: 'text-amber-400',
};

const RARITY_LABELS = {
  common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary',
};

export default function Profile({ onNavigate: _ }: { onNavigate: (p: import('../types').Page) => void }) {
  const { state, dispatch } = useApp();
  const { user, achievements, monthlyData, emissions, actions } = state;
  const [showReset, setShowReset] = useState(false);
  const [achFilter, setAchFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const levelInfo = getLevelInfo(user.xp);
  const nextLevel = LEVELS[Math.min(user.level + 1, LEVELS.length - 1)];
  const xpInLevel = user.xp - levelInfo.minXp;
  const xpNeeded = nextLevel.minXp - levelInfo.minXp;
  const xpPct = Math.min(100, (xpInLevel / xpNeeded) * 100);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const committedActions = actions.filter(a => a.committed).length;
  const totalSavedKg = actions.filter(a => a.committed).reduce((s, a) => s + a.co2SavedPerYear, 0);
  const scoreLabel = getScoreLabel(user.carbonScore);

  const filteredAch = achievements.filter(a => {
    if (achFilter === 'unlocked') return a.unlocked;
    if (achFilter === 'locked')   return !a.unlocked;
    return true;
  });

  const handleReset = () => {
    dispatch({ type: 'RESET_DATA' });
    setShowReset(false);
  };

  return (
    <div className="pt-6 pb-2 space-y-4 animate-in">
      {/* Profile Header */}
      <div className="card-glow text-center py-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-3 text-3xl">
          {levelInfo.icon}
        </div>
        <h2 className="text-xl font-bold text-white">{user.name}</h2>
        <p className={`text-sm font-medium mt-0.5`} style={{ color: scoreLabel.color }}>
          {scoreLabel.emoji} {levelInfo.title}
        </p>
        <p className="text-slate-500 text-xs mt-1">
          Joined {new Date(user.joinDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>
        <p className="text-slate-600 text-xs mt-0.5">
          🏆 {unlockedCount}/{achievements.length} achievements
        </p>

        {/* XP Progress */}
        <div className="mt-4 px-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">{user.xp} XP</span>
            <span className="text-slate-600">Next: {nextLevel.title} {nextLevel.icon}</span>
          </div>
          <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">{Math.round(xpPct)}% to next level</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Carbon Score', value: user.carbonScore, unit: '/1000', color: scoreLabel.color, emoji: scoreLabel.emoji },
          { label: 'Streak', value: user.streak, unit: ' days', color: '#f97316', emoji: '🔥' },
          { label: 'CO₂ Saved', value: `${(totalSavedKg / 1000).toFixed(1)}`, unit: 't/yr committed', color: '#10b981', emoji: '💚' },
          { label: 'CO₂ Offset', value: `${(user.totalOffsetKg / 1000).toFixed(2)}`, unit: 't total', color: '#14b8a6', emoji: '🌳' },
        ].map(stat => (
          <div key={stat.label} className="card-glow text-center py-3">
            <p className="text-lg">{stat.emoji}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: stat.color }}>
              {stat.value}<span className="text-xs text-slate-600">{stat.unit}</span>
            </p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Comparison Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Monthly Emissions vs Target</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
              formatter={(v: number, name: string) => [`${v} kg`, name]}
            />
            <Bar dataKey="emissions" name="Emissions" radius={[3, 3, 0, 0]}>
              {monthlyData.map((entry, i) => (
                <Cell key={i} fill={entry.emissions <= entry.target ? '#10b981' : '#f97316'} />
              ))}
            </Bar>
            <Bar dataKey="target" name="Target" fill="#334155" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-1">
          <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-2 rounded bg-emerald-500 inline-block" /> Under target</span>
          <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-2 rounded bg-orange-500 inline-block" /> Over target</span>
          <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-2 rounded bg-slate-600 inline-block" /> Target</span>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300">
            Achievements ({unlockedCount}/{achievements.length})
          </h3>
          <div className="flex gap-1">
            {(['all','unlocked','locked'] as const).map(f => (
              <button key={f} onClick={() => setAchFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] capitalize transition-all ${
                  achFilter === f ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-600'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {filteredAch.map(ach => (
            <div
              key={ach.id}
              className={`relative flex flex-col items-center p-2.5 rounded-xl border transition-all ${
                ach.unlocked ? RARITY_STYLES[ach.rarity] : 'border-slate-700/30 bg-slate-800/30 opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl">{ach.icon}</span>
              <p className="text-[10px] text-center font-medium text-slate-300 mt-1 leading-tight">{ach.title}</p>
              <span className={`text-[9px] mt-0.5 font-semibold uppercase tracking-wide ${RARITY_TEXT[ach.rarity]}`}>
                {RARITY_LABELS[ach.rarity]}
              </span>
              {ach.unlocked && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footprint Summary */}
      {emissions && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Footprint Summary</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Annual emissions', value: `${(emissions.total / 1000).toFixed(2)} tonnes CO₂e` },
              { label: 'vs World avg (4.7t)', value: emissions.total < 4700 ? '✅ Better' : `❌ +${((emissions.total - 4700) / 1000).toFixed(1)}t higher` },
              { label: 'vs Paris target (2.3t)', value: emissions.total < 2300 ? '✅ On track!' : `Need to cut ${((emissions.total - 2300) / 1000).toFixed(1)}t more` },
              { label: 'Actions committed', value: `${committedActions} actions · ${(totalSavedKg / 1000).toFixed(2)}t saved/yr` },
              { label: 'Activities logged', value: `${state.activities.length} total` },
            ].map(row => (
              <div key={row.label} className="flex justify-between border-b border-slate-700/30 pb-1.5 last:border-0 last:pb-0">
                <span className="text-slate-500 text-xs">{row.label}</span>
                <span className="text-slate-300 text-xs font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => setShowReset(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all text-sm"
      >
        <RotateCcw size={14} /> Reset all data
      </button>

      {showReset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-xs space-y-4 animate-in">
            <p className="text-xl font-bold text-white text-center">Reset Data?</p>
            <p className="text-slate-400 text-sm text-center">This will erase all your progress, activities, and achievements. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowReset(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleReset} className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-semibold">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
