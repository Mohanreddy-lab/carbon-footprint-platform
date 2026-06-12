import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Flame, TrendingDown, TrendingUp, Lightbulb, Calculator } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getScoreLabel, getScoreGlowColor, getPersonalizedTip, getLevelInfo } from '../data/emissionData';
import type { Page } from '../types';

const PIE_COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#6366f1', '#ec4899'];
const CATEGORY_ICONS: Record<string, string> = {
  transport: '🚗', home: '🏠', food: '🍔', shopping: '🛍️', flights: '✈️',
};

function CarbonScoreGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const r = 80;
  const sw = 12;
  const circ = 2 * Math.PI * r;
  const progress = (animatedScore / 1000) * circ;
  const label = getScoreLabel(animatedScore);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative flex flex-col items-center">
      <svg width="190" height="190" className="transform -rotate-90">
        <circle cx="95" cy="95" r={r} stroke="#1e293b" strokeWidth={sw} fill="none" />
        <circle
          cx="95" cy="95" r={r}
          stroke={label.color}
          strokeWidth={sw}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ - progress}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1), stroke 0.5s',
            filter: `drop-shadow(0 0 10px ${getScoreGlowColor(animatedScore)})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white leading-none" style={{ color: label.color }}>
          {animatedScore}
        </span>
        <span className="text-xs text-slate-400 mt-1">{label.emoji} {label.text}</span>
        <span className="text-xs text-slate-600 mt-0.5">Carbon Score</span>
      </div>
    </div>
  );
}

interface Props { onNavigate: (p: Page) => void }

export default function Dashboard({ onNavigate }: Props) {
  const { state } = useApp();
  const { user, emissions, monthlyData, activities } = state;
  const levelInfo = getLevelInfo(user.xp);
  const tip = getPersonalizedTip(emissions);
  const recentActivities = activities.slice(0, 5);

  const catData = emissions
    ? [
        { name: 'Transport', value: emissions.transport, icon: '🚗' },
        { name: 'Home',      value: emissions.home,      icon: '🏠' },
        { name: 'Food',      value: emissions.food,      icon: '🍔' },
        { name: 'Shopping',  value: emissions.shopping,  icon: '🛍️' },
        { name: 'Flights',   value: emissions.flights,   icon: '✈️' },
      ].filter(c => c.value > 0)
    : [];

  const totalKg = emissions?.total ?? 0;
  const worldAvg = 4700;
  const usAvg = 16000;
  const parisTarget = 2300;
  const vsWorld = totalKg < worldAvg ? `${Math.round((1 - totalKg / worldAvg) * 100)}% better` : `${Math.round((totalKg / worldAvg - 1) * 100)}% worse`;
  const vsWorldGood = totalKg <= worldAvg;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="pt-6 pb-2 space-y-4 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            {greeting}, <span className="text-gradient">{user.name}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm">{levelInfo.icon} {levelInfo.title}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">
          <Flame size={14} className="text-orange-400" />
          <span className="text-orange-300 font-bold text-sm">{user.streak}</span>
          <span className="text-orange-400/60 text-xs">streak</span>
        </div>
      </div>

      {/* Score + Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-glow flex flex-col items-center py-4 col-span-1">
          <CarbonScoreGauge score={user.carbonScore} />
          <div className="mt-2 text-center">
            <p className="text-xs text-slate-500">
              {(totalKg / 1000).toFixed(1)}t CO₂/year
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="card-glow flex-1 flex flex-col justify-center">
            <p className="text-xs text-slate-500 mb-0.5">vs World Avg</p>
            <div className="flex items-center gap-1">
              {vsWorldGood ? <TrendingDown size={16} className="text-emerald-400" /> : <TrendingUp size={16} className="text-red-400" />}
              <span className={`font-bold text-sm ${vsWorldGood ? 'text-emerald-400' : 'text-red-400'}`}>{vsWorld}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">World: {(worldAvg/1000).toFixed(1)}t</p>
          </div>
          <div className="card-glow flex-1 flex flex-col justify-center">
            <p className="text-xs text-slate-500 mb-0.5">Paris Target</p>
            <p className="text-white font-bold">{(parisTarget/1000).toFixed(1)}t</p>
            <div className="mt-1 bg-slate-700 rounded-full h-1.5">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, (parisTarget / totalKg) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {totalKg <= parisTarget ? 'On track! ✅' : `${Math.round((totalKg / parisTarget - 1) * 100)}% over`}
            </p>
          </div>
          <div className="card-glow flex-1 flex flex-col justify-center">
            <p className="text-xs text-slate-500 mb-0.5">XP / Level</p>
            <p className="text-white font-bold text-sm">{user.xp} XP</p>
            <p className="text-xs text-slate-600">{levelInfo.title} {levelInfo.icon}</p>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="card-glow">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Monthly Emissions Trend</h3>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="emGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="tgtGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v: number) => [`${v} kg`, '']}
            />
            <Area type="monotone" dataKey="target"    stroke="#6366f1" strokeWidth={1.5} fill="url(#tgtGrad)" strokeDasharray="4 2" dot={false} name="Target" />
            <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={2}   fill="url(#emGrad)"  dot={false} name="Emissions" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Emissions</span>
          <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-0.5 bg-indigo-500 inline-block border-dashed" /> Target</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card-glow">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Footprint Breakdown</h3>
        <div className="flex gap-4 items-center">
          <ResponsiveContainer width={110} height={110}>
            <PieChart>
              <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} strokeWidth={0}>
                {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1.5">
            {catData.map((cat, i) => {
              const pct = emissions ? Math.round((cat.value / emissions.total) * 100) : 0;
              return (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="text-sm">{CATEGORY_ICONS[cat.name.toLowerCase()] ?? '📦'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-400">{cat.name}</span>
                      <span className="text-slate-400">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-14 text-right">{cat.value} kg</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Personalised Tip */}
      <div className="card-glow bg-gradient-eco border-emerald-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Today's Insight</p>
            <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivities.map(act => (
              <div key={act.id} className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{act.icon}</span>
                  <div>
                    <p className="text-sm text-slate-200">{act.description}</p>
                    <p className="text-xs text-slate-600">{new Date(act.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-400">{act.co2Impact} kg</p>
                  <p className="text-xs text-amber-400">+{act.points} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recalculate CTA */}
      <button
        onClick={() => onNavigate('calculator')}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-sm"
      >
        <Calculator size={16} />
        Recalculate my footprint
      </button>
    </div>
  );
}
