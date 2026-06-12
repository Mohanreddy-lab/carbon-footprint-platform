import { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { EmissionBreakdown } from '../types';

function generateInsights(emissions: EmissionBreakdown | null): { icon: string; text: string; saving: string }[] {
  if (!emissions) return [
    { icon: '🧮', text: 'Complete the carbon calculator to unlock personalized AI insights tailored to your lifestyle.', saving: 'Personalized tips waiting!' },
  ];

  const cats = [
    { key: 'transport', val: emissions.transport },
    { key: 'home', val: emissions.home },
    { key: 'food', val: emissions.food },
    { key: 'shopping', val: emissions.shopping },
    { key: 'flights', val: emissions.flights },
  ].sort((a, b) => b.val - a.val);

  const top3 = cats.slice(0, 3);
  const insights: { icon: string; text: string; saving: string }[] = [];

  const tipMap: Record<string, { icon: string; text: string; saving: string }[]> = {
    transport: [
      { icon: '🚌', text: 'Transport is your #1 source. Swapping just 2 car trips per week for public transit saves ~450 kg CO2/year — the equivalent of planting 21 trees.', saving: 'Save 450 kg/yr' },
      { icon: '🚲', text: 'Cycling instead of driving for trips under 3 miles saves 400 kg CO2 annually, and improves cardiovascular health by 40%. A true win-win.', saving: 'Save 400 kg/yr' },
    ],
    home: [
      { icon: '🌡️', text: 'Home energy is your top driver. A smart thermostat (Nest/Ecobee) learns your schedule and automatically cuts heating/cooling waste — saving 500 kg CO2 and $150/year.', saving: 'Save 500 kg/yr' },
      { icon: '☀️', text: 'Switching to a 100% renewable energy tariff (often same price as standard) eliminates 1,200 kg of home electricity emissions annually with zero lifestyle change.', saving: 'Save 1,200 kg/yr' },
    ],
    food: [
      { icon: '🥗', text: 'Your diet has major impact. Adding just 3 plant-based days per week reduces food emissions by 300 kg CO2/year — that is like taking your car off the road for a month.', saving: 'Save 300 kg/yr' },
      { icon: '🥩', text: 'Beef is the highest-emission food at 27 kg CO2 per kg. Halving beef consumption saves 400 kg CO2/year — more than eliminating all your flight emissions.', saving: 'Save 400 kg/yr' },
    ],
    shopping: [
      { icon: '♻️', text: 'Shopping habits are a hidden giant. Buying just 60% of clothing second-hand saves ~350 kg CO2/year — apps like Vinted and Depop make this easy and stylish.', saving: 'Save 350 kg/yr' },
      { icon: '🔧', text: 'Repairing electronics instead of replacing them prevents 200 kg CO2/year. A phone screen repair ($50-100) vs. a new phone prevents 70 kg CO2 in manufacturing.', saving: 'Save 200 kg/yr' },
    ],
    flights: [
      { icon: '✈️', text: 'Flying is your biggest single source. One long-haul flight generates 1,200 kg CO2 — 6 months of an average diet. Video conferencing one trip eliminates that instantly.', saving: 'Save 1,200 kg/yr' },
      { icon: '🚂', text: 'European trains emit 94% less CO2 than flying. The London-Paris Eurostar takes 2.5 hrs vs 4+ hrs airport time — and you arrive in the city center.', saving: 'Save 170 kg/trip' },
    ],
  };

  for (const cat of top3) {
    const tips = tipMap[cat.key];
    if (tips) insights.push(tips[Math.floor(Math.random() * tips.length)]);
  }

  return insights;
}

export default function InsightsCarousel() {
  const { state } = useApp();
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  const insights = generateInsights(state.emissions);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % insights.length);
        setAnimating(false);
      }, 200);
    }, 5500);
    return () => clearInterval(interval);
  }, [insights.length]);

  const go = (dir: 1 | -1) => {
    setAnimating(true);
    setTimeout(() => {
      setIdx(i => (i + dir + insights.length) % insights.length);
      setAnimating(false);
    }, 150);
  };

  const insight = insights[idx];

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.04) 100%)',
        border: '1px solid rgba(16,185,129,0.18)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
            <Lightbulb size={12} className="text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">AI Insights</span>
        </div>
        <div className="flex items-center gap-1">
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`transition-all duration-300 rounded-full ${i === idx ? 'w-4 h-1.5 bg-emerald-400' : 'w-1.5 h-1.5 bg-slate-600'}`}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(4px)' : 'translateY(0)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{insight.icon}</span>
          <div>
            <p className="text-sm text-slate-200 leading-relaxed">{insight.text}</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1.5">💚 {insight.saving}</p>
          </div>
        </div>
      </div>

      {insights.length > 1 && (
        <div className="flex justify-end gap-1 mt-3">
          <button onClick={() => go(-1)} className="w-6 h-6 rounded-lg bg-slate-700/60 hover:bg-slate-600 flex items-center justify-center transition-colors">
            <ChevronLeft size={12} className="text-slate-400" />
          </button>
          <button onClick={() => go(1)} className="w-6 h-6 rounded-lg bg-slate-700/60 hover:bg-slate-600 flex items-center justify-center transition-colors">
            <ChevronRight size={12} className="text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
}
