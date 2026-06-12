import { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import { RotateCcw, Shield, Share2, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLevelInfo, LEVELS, getScoreLabel } from '../data/emissionData';
import ImpactForest from './ImpactForest';
import ShareCard from './ShareCard';

const RARITY_STYLES = {
  common:    'border-slate-600/50 bg-slate-800/60',
  rare:      'border-blue-500/40 bg-blue-900/20',
  epic:      'border-purple-500/40 bg-purple-900/20',
  legendary: 'border-amber-500/40 bg-amber-900/20 rarity-legendary',
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

const PROFILE_TABS = ['Stats', 'Achievements', 'Forest', 'Share'] as const;
type ProfileTab = typeof PROFILE_TABS[number];

export default function Profile({ onNavigate: _ }: { onNavigate: (p: import('../types').Page) => void }) {
  const { state, dispatch } = useApp();
  const { user, achievements, monthlyData, emissions, actions, activities } = state;
  const [showReset, setShowReset] = useState(false);
  const [achFilter, setAchFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [activeTab, setActiveTab] = useState<ProfileTab>('Stats');

  const levelInfo = getLevelInfo(user.xp);
  const nextLevel = LEVELS[Math.min(user.level + 1, LEVELS.length - 1)];
  const xpInLevel = user.xp - levelInfo.minXp;
  const xpNeeded = nextLevel.minXp - levelInfo.minXp;
  const xpPct = Math.min(100, (xpInLevel / xpNeeded) * 100);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const committedActions = actions.filter(a => a.committed);
  const totalSavedKg = committedActions.reduce((s, a) => s + a.co2SavedPerYear, 0);
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

  const radarData = emissions ? [
    { subject: 'Transport', A: Math.round((emissions.transport / emissions.total) * 100) },
    { subject: 'Home', A: Math.round((emissions.home / emissions.total) * 100) },
    { subject: 'Food', A: Math.round((emissions.food / emissions.total) * 100) },
    { subject: 'Shopping', A: Math.round((emissions.shopping / emissions.total) * 100) },
    { subject: 'Flights', A: Math.round((emissions.flights / emissions.total) * 100) },
  ] : [];

  return (
    <div className="pt-6 pb-2 space-y-4 animate-in">
      {/* Profile Header */}
      <div className="card-glow text-center py-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${scoreLabel.color}22 0%, transparent 70%)` }} />

        <div
          className="relative w-18 h-18 rounded-full border-2 flex items-center justify-center mx-auto mb-3 text-3xl"
          style={{
            width: 72, height: 72,
            borderColor: scoreLabel.color + '60',
            background: `${scoreLabel.color}15`,
            boxShadow: `0 0 30px ${scoreLabel.color}30`,
          }}
        >
          {levelInfo.icon}
        </div>
        <h2 className="text-xl font-bold text-white relative">{user.name}</h2>
        <p className="text-sm font-semibold mt-0.5 relative" style={{ color: scoreLabel.color }}>
          {scoreLabel.emoji} {levelInfo.title}
        </p>
        <div className="flex items-center justify-center gap-3 mt-1 relative">
          <p className="text-slate-500 text-xs">
            Joined {new Date(user.joinDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </p>
          {user.streakShields > 0 && (
            <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              <Shield size={10} className="text-indigo-400" />
              <span className="text-indigo-300 text-[10px] font-bold">{user.streakShields} shield{user.streakShields > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* XP Progress */}
        <div className="mt-4 px-4 relative">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">{user.xp} XP</span>
            <span className="text-slate-600">
              {user.level < LEVELS.length - 1 ? `→ ${nextLevel.title} ${nextLevel.icon}` : '🏆 Max Level'}
            </span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full rounded-full transition-all duration-1000 xp-bar"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-700">{xpInLevel} / {xpNeeded} XP</span>
            <span className="text-slate-600">{Math.round(xpPct)}% to next level</span>
          </div>
        </div>
      </div>

      {/* Profile Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {PROFILE_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all duration-200 ${
              activeTab === tab
                ? 'bg-emerald-500/15 text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* STATS TAB */}
      {activeTab === 'Stats' && (
        <div className="space-y-4 animate-in">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Carbon Score', value: user.carbonScore, unit: '/1000', color: scoreLabel.color, emoji: scoreLabel.emoji },
              { label: 'Streak', value: user.streak, unit: ' days', color: '#f97316', emoji: '🔥' },
              { label: 'CO₂ Saved', value: `${(totalSavedKg / 1000).toFixed(1)}`, unit: 't/yr', color: '#10b981', emoji: '💚' },
              { label: 'CO₂ Offset', value: `${(user.totalOffsetKg / 1000).toFixed(2)}`, unit: 't total', color: '#14b8a6', emoji: '🌳' },
            ].map(stat => (
              <div key={stat.label} className="card-glow text-center py-3">
                <p className="text-xl">{stat.emoji}</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: stat.color }}>
                  {stat.value}<span className="text-xs text-slate-600">{stat.unit}</span>
                </p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Monthly Bar Chart */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Monthly Emissions vs Target</h3>
            <div style={{ width: '100%', height: 130 }}>
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="100%"
                data={[
                  ["Month", "Emissions", "Target"],
                  ...monthlyData.map(d => [d.month, d.emissions, d.target])
                ]}
                options={{
                  backgroundColor: 'transparent',
                  legend: 'none',
                  colors: ['#10b981', '#334155'],
                  hAxis: { textStyle: { color: '#64748b', fontSize: 8 }, gridlines: { color: 'transparent' }, baselineColor: 'transparent' },
                  vAxis: { textStyle: { color: '#64748b', fontSize: 8 }, gridlines: { color: '#1e293b' }, baselineColor: 'transparent' },
                  chartArea: { width: '85%', height: '70%', left: 40 },
                }}
              />
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-2 rounded bg-emerald-500 inline-block" /> Under target</span>
              <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-2 rounded bg-orange-500 inline-block" /> Over target</span>
              <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-2 rounded bg-slate-600 inline-block" /> Target</span>
            </div>
          </div>

          {/* Emission Radar */}
          {radarData.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Emission Profile</h3>
              <div style={{ width: '100%', height: 160 }}>
                <Chart
                  chartType="BarChart"
                  width="100%"
                  height="100%"
                  data={[
                    ["Category", "Percentage"],
                    ...radarData.map(d => [d.subject, d.A])
                  ]}
                  options={{
                    backgroundColor: 'transparent',
                    colors: ['#10b981'],
                    legend: 'none',
                    hAxis: { textStyle: { color: '#64748b' }, gridlines: { color: '#1e293b' }, minValue: 0, baselineColor: 'transparent' },
                    vAxis: { textStyle: { color: '#64748b', fontSize: 10 } },
                    chartArea: { width: '70%', height: '80%', left: 60 },
                  }}
                />
              </div>
            </div>
          )}

          {/* Reset data */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowReset(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-600 hover:text-slate-400 text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <RotateCcw size={14} /> Reset all data
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'LOGOUT' });
                window.scrollTo(0, 0);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS TAB */}
      {activeTab === 'Achievements' && (
        <div className="space-y-4 animate-in">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300">
                Achievements ({unlockedCount}/{achievements.length})
              </h3>
              <div className="flex gap-1">
                {(['all', 'unlocked', 'locked'] as const).map(f => (
                  <button key={f} onClick={() => setAchFilter(f)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] capitalize transition-all ${
                      achFilter === f ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-600 hover:text-slate-400'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress bar for achievements */}
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-1000"
                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {filteredAch.map(ach => (
                <div
                  key={ach.id}
                  className={`relative flex flex-col items-center text-center p-2.5 rounded-xl border transition-all ${
                    ach.unlocked ? RARITY_STYLES[ach.rarity] : 'border-slate-800/50 bg-slate-900/30 opacity-35 grayscale'
                  }`}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <p className="text-[10px] text-center font-medium text-slate-300 mt-1 leading-tight">{ach.title}</p>
                  <span className={`text-[9px] mt-0.5 font-bold uppercase tracking-wide ${ach.unlocked ? RARITY_TEXT[ach.rarity] : 'text-slate-700'}`}>
                    {RARITY_LABELS[ach.rarity]}
                  </span>
                  {ach.unlocked && (
                    <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="text-[7px] text-white font-bold">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOREST TAB */}
      {activeTab === 'Forest' && (
        <div className="card-glow animate-in">
          <ImpactForest savedKg={totalSavedKg} />
          <div className="mt-4 pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center">
              Every 21 kg CO₂ saved = 1 tree equivalent 🌲
            </p>
            <p className="text-xs text-slate-600 text-center mt-1">
              Commit to more actions to grow your forest!
            </p>
          </div>
        </div>
      )}

      {/* SHARE TAB */}
      {activeTab === 'Share' && (
        <div className="animate-in">
          <ShareCard />
        </div>
      )}

      {/* Reset confirmation */}
      {showReset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-glow max-w-sm w-full p-6 animate-in">
            <h3 className="text-lg font-bold text-white mb-2">Reset all data?</h3>
            <p className="text-slate-400 text-sm mb-5">
              This will erase all your progress, activities, and achievements. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowReset(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={handleReset}
                className="flex-1 py-2.5 text-sm rounded-xl font-semibold transition-all bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
