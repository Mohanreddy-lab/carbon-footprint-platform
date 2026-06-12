import { useApp } from '../context/AppContext';
import { Target } from 'lucide-react';

export default function DailyBudget() {
  const { state } = useApp();
  const { activities, emissions } = state;

  const dailyBudgetKg = ((emissions?.total ?? 6000) / 365);
  const todayStr = new Date().toDateString();
  const todayActivities = activities.filter(a => new Date(a.date).toDateString() === todayStr);
  const todaySaved = todayActivities.filter(a => a.co2Impact < 0).reduce((s, a) => s + Math.abs(a.co2Impact), 0);
  const pct = Math.min(100, (todaySaved / (dailyBudgetKg * 0.1)) * 100);
  const activityCount = todayActivities.length;

  const emoji = pct >= 100 ? '🌟' : pct >= 75 ? '🎯' : pct >= 50 ? '🌿' : pct >= 25 ? '🌱' : '💤';
  const label = pct >= 100 ? "Daily hero!" : pct >= 50 ? 'Great progress' : pct > 0 ? 'Keep going' : 'Log actions to start';
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#14b8a6' : pct >= 25 ? '#f59e0b' : '#64748b';

  return (
    <div className="card-glow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
            <Target size={12} className="text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-slate-300">Today's Eco Budget</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">{emoji}</span>
          <span className="text-xs font-medium" style={{ color }}>{label}</span>
        </div>
      </div>

      <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
        {/* Segments */}
        {[25, 50, 75].map(mark => (
          <div
            key={mark}
            className="absolute top-0 bottom-0 w-px bg-slate-700/80"
            style={{ left: `${mark}%` }}
          />
        ))}
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: pct > 10 ? `0 0 8px ${color}66` : 'none',
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-600">
        <span>{todaySaved.toFixed(1)} kg saved today &bull; {activityCount} action{activityCount !== 1 ? 's' : ''}</span>
        <span>Target: {(dailyBudgetKg * 0.1).toFixed(1)} kg/day</span>
      </div>
    </div>
  );
}
