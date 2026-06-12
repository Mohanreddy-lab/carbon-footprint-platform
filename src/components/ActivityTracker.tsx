import { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QUICK_ACTIVITIES } from '../data/emissionData';
import type { Activity, ActivityCategory } from '../types';

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  transport: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  food:      'bg-green-500/10 text-green-300 border-green-500/20',
  energy:    'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  shopping:  'bg-pink-500/10 text-pink-300 border-pink-500/20',
  flights:   'bg-purple-500/10 text-purple-300 border-purple-500/20',
  other:     'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

interface Props { onNavigate: (p: import('../types').Page) => void }

export default function ActivityTracker({ onNavigate: _ }: Props) {
  const { state, dispatch } = useApp();
  const { activities, emissions } = state;
  const [showCustom, setShowCustom] = useState(false);
  const [customDesc, setCustomDesc] = useState('');
  const [customCo2, setCustomCo2] = useState<number>(-1);
  const [customIcon, setCustomIcon] = useState('🌱');
  const [customCat, setCustomCat] = useState<ActivityCategory>('other');
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('today');

  const addQuick = (preset: typeof QUICK_ACTIVITIES[number]) => {
    const activity: Activity = {
      ...preset,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach2' });
  };

  const addCustom = () => {
    if (!customDesc.trim()) return;
    const activity: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: new Date().toISOString(),
      category: customCat,
      description: customDesc.trim(),
      co2Impact: customCo2,
      icon: customIcon,
      points: Math.abs(customCo2) * 2,
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    setCustomDesc(''); setCustomCo2(-1); setShowCustom(false);
  };

  const now = Date.now();
  const filteredActivities = activities.filter(a => {
    const dt = new Date(a.date).getTime();
    if (filter === 'today')  return now - dt < 86400000;
    if (filter === 'week')   return now - dt < 7 * 86400000;
    return true;
  });

  const todayReduction = filteredActivities
    .filter(a => a.co2Impact < 0)
    .reduce((s, a) => s + Math.abs(a.co2Impact), 0);

  const monthlyTarget = (emissions?.total ?? 6000) / 12;
  const thisMonthActivities = activities.filter(a => {
    const d = new Date(a.date);
    const now2 = new Date();
    return d.getMonth() === now2.getMonth() && d.getFullYear() === now2.getFullYear();
  });
  const monthSaved = thisMonthActivities.filter(a => a.co2Impact < 0).reduce((s, a) => s + Math.abs(a.co2Impact), 0);
  const progressPct = Math.min(100, (monthSaved / (monthlyTarget * 0.15)) * 100);

  return (
    <div className="pt-6 pb-2 space-y-4 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Activity Tracker</h1>
          <p className="text-slate-500 text-sm">Log eco-actions to earn XP</p>
        </div>
        <button onClick={() => setShowCustom(true)}
          className="btn-primary flex items-center gap-1.5 py-2 px-3 text-sm">
          <Plus size={16} /> Custom
        </button>
      </div>

      {/* Monthly progress */}
      <div className="card-glow">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">This month's CO₂ saved via actions</span>
          <span className="text-emerald-400 font-bold">{monthSaved.toFixed(1)} kg</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000"
            style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-xs text-slate-600 mt-1">Target: save 15% of monthly footprint ({(monthlyTarget * 0.15).toFixed(0)} kg)</p>
      </div>

      {/* Quick-add grid */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Log</h3>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_ACTIVITIES.map((preset, i) => (
            <button
              key={i}
              onClick={() => addQuick(preset)}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-200 active:scale-95 text-center"
            >
              <span className="text-xl">{preset.icon}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{preset.description}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">{preset.co2Impact} kg</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom activity modal */}
      {showCustom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-sm space-y-4 animate-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-white">Log Custom Activity</h3>
              <button onClick={() => setShowCustom(false)} className="text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>

            <input
              value={customDesc}
              onChange={e => setCustomDesc(e.target.value)}
              placeholder="What did you do?"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            <div>
              <label className="text-xs text-slate-400 mb-1 block">CO₂ impact (kg) — negative = good</label>
              <input
                type="number"
                value={customCo2}
                onChange={e => setCustomCo2(Number(e.target.value))}
                step="0.1"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {(['transport','food','energy','shopping','other'] as ActivityCategory[]).map(cat => (
                  <button key={cat} onClick={() => setCustomCat(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-all capitalize ${
                      customCat === cat ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300' : 'border-slate-600 text-slate-500'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowCustom(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={addCustom} className="btn-primary flex-1 py-2.5 text-sm">Log Activity</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity list */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-500" /> Activity Log
          </h3>
          <div className="flex gap-1">
            {(['today','week','all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === f ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">🌱</p>
            <p className="text-slate-500 text-sm">No activities logged yet.</p>
            <p className="text-slate-600 text-xs mt-1">Tap a quick-log button above to start!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActivities.map(act => (
              <div key={act.id} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{act.icon}</span>
                  <div>
                    <p className="text-sm text-slate-200">{act.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[act.category]}`}>
                        {act.category}
                      </span>
                      <span className="text-xs text-slate-600">
                        {new Date(act.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${act.co2Impact < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {act.co2Impact > 0 ? '+' : ''}{act.co2Impact} kg
                  </p>
                  <p className="text-xs text-amber-400">+{act.points} XP</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredActivities.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/30 flex justify-between text-sm">
            <span className="text-slate-500">CO₂ saved this period</span>
            <span className="text-emerald-400 font-bold">{todayReduction.toFixed(1)} kg</span>
          </div>
        )}
      </div>
    </div>
  );
}
