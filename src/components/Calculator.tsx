import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateEmissions, calculateCarbonScore, getScoreLabel } from '../data/emissionData';
import type { CarbonBaseline, CarType, DietType, ShoppingLevel, FoodWasteLevel } from '../types';


const STEPS = ['Transport', 'Home Energy', 'Food', 'Shopping', 'Flights', 'Results'];

const CAR_TYPES: { value: CarType; label: string; icon: string; factor: string }[] = [
  { value: 'none',     label: 'No car',     icon: '🚶', factor: '0 kg/mile' },
  { value: 'electric', label: 'Electric',   icon: '⚡', factor: '0.05 kg/mile' },
  { value: 'hybrid',   label: 'Hybrid',     icon: '🔋', factor: '0.11 kg/mile' },
  { value: 'gasoline', label: 'Petrol/Gas', icon: '⛽', factor: '0.21 kg/mile' },
  { value: 'diesel',   label: 'Diesel',     icon: '🏭', factor: '0.19 kg/mile' },
];

const DIET_TYPES: { value: DietType; label: string; icon: string; desc: string }[] = [
  { value: 'vegan',       label: 'Vegan',       icon: '🥦', desc: '1.5 kg CO₂/day' },
  { value: 'vegetarian',  label: 'Vegetarian',  icon: '🥗', desc: '2.0 kg CO₂/day' },
  { value: 'flexitarian', label: 'Flexitarian', icon: '🌿', desc: '2.5 kg CO₂/day' },
  { value: 'omnivore',    label: 'Omnivore',    icon: '🍖', desc: '3.3 kg CO₂/day' },
  { value: 'heavy-meat',  label: 'Meat-heavy',  icon: '🥩', desc: '4.5 kg CO₂/day' },
];

const SHOPPING_LEVELS: { value: ShoppingLevel; label: string; desc: string }[] = [
  { value: 'minimal',  label: 'Minimal',  desc: 'Buy very little new stuff' },
  { value: 'average',  label: 'Average',  desc: 'Typical consumer habits' },
  { value: 'frequent', label: 'Frequent', desc: 'Shop regularly for non-essentials' },
];

const WASTE_LEVELS: { value: FoodWasteLevel; label: string; desc: string }[] = [
  { value: 'low',    label: 'Low',    desc: 'I waste very little food' },
  { value: 'medium', label: 'Medium', desc: 'Some food gets thrown away' },
  { value: 'high',   label: 'High',   desc: 'A lot of food goes to waste' },
];

const COMPARISON_PEOPLE = [
  { name: 'Elon Musk', kg: 2000000, icon: '🚀', color: '#ef4444', note: '~2,000t/yr (jets+homes)' },
  { name: 'Average American', kg: 16000, icon: '🇺🇸', color: '#f97316', note: '16t/yr' },
  { name: 'World Average', kg: 4700, icon: '🌍', color: '#f59e0b', note: '4.7t/yr' },
  { name: 'Greta Thunberg', kg: 2800, icon: '🌱', color: '#84cc16', note: '~2.8t/yr' },
  { name: 'Paris Target', kg: 2300, icon: '🎯', color: '#22d3ee', note: '2.3t/yr by 2030' },
];

const defaultBaseline: CarbonBaseline = {
  transport: { carMilesPerWeek: 100, carType: 'gasoline', publicTransitMilesPerWeek: 20, bikeMilesPerWeek: 5 },
  home: { electricityKwhPerMonth: 350, gasKwhPerMonth: 150, renewablePercentage: 0, householdSize: 2 },
  food: { dietType: 'omnivore', foodWasteLevel: 'medium', localFoodPercentage: 20 },
  shopping: { clothingItemsPerYear: 15, electronicsPerYear: 1, shoppingLevel: 'average' },
  flights: { shortHaulPerYear: 2, mediumHaulPerYear: 1, longHaulPerYear: 0 },
};

function SliderField({ label, value, min, max, step = 1, unit, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit: string;
  onChange: (v: number) => void;
}) {
  const id = `slider-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <label htmlFor={id} className="text-slate-300">{label}</label>
        <span className="text-emerald-400 font-semibold">{value} {unit}</span>
      </div>
      <input
        id={id}
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500"
      />
      <div className="flex justify-between text-xs text-slate-700 mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

function CounterField({ label, value, onChange, min = 0, max = 20 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-slate-300 text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold transition-all active:scale-90"
          style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.15)' }}>−</button>
        <span className="text-white font-bold w-6 text-center">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold transition-all active:scale-90"
          style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.15)' }}>+</button>
      </div>
    </div>
  );
}

interface Props { onNavigate: (p: import('../types').Page) => void }

export default function Calculator({ onNavigate }: Props) {
  const { dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [baseline, setBaseline] = useState<CarbonBaseline>(defaultBaseline);

  const set = <K extends keyof CarbonBaseline>(section: K, key: keyof CarbonBaseline[K], value: unknown) => {
    setBaseline(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const emissions = useMemo(() => calculateEmissions(baseline), [baseline]);
  const score = useMemo(() => calculateCarbonScore(emissions.total), [emissions.total]);
  const label = useMemo(() => getScoreLabel(score), [score]);

  const handleFinish = () => {
    dispatch({ type: 'COMPLETE_SETUP', payload: { baseline, emissions } });
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach1' });
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach16' });
    onNavigate('dashboard');
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-5" role="tablist" aria-label="Calculator steps">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <button
            role="tab"
            aria-selected={i === step}
            aria-label={`Step ${i + 1}: ${s}`}
            onClick={() => i < step && setStep(i)}
            className={`flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
              i < step ? 'w-5 h-5 cursor-pointer' :
              i === step ? 'w-7 h-7' :
              'w-5 h-5 cursor-default'
            }`}
            style={{
              background: i <= step ? 'linear-gradient(135deg, #10b981, #0d9488)' : 'rgba(30,41,59,0.8)',
              color: i <= step ? '#fff' : '#64748b',
              boxShadow: i === step ? '0 0 16px rgba(16,185,129,0.5)' : 'none',
            }}
          >
            {i < step ? '✓' : i + 1}
          </button>
          {i < STEPS.length - 1 && (
            <div className={`w-4 h-0.5 mx-0.5 transition-all duration-500 rounded-full ${i < step ? 'bg-emerald-500' : 'bg-slate-800'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const comparisonData = useMemo(() => [
    ...COMPARISON_PEOPLE.map(p => ({
      name: p.name,
      kg: Math.min(p.kg, 25000), // cap for display
      icon: p.icon,
      color: p.color,
      isUser: false,
    })),
    {
      name: 'You',
      kg: emissions.total,
      icon: '🙂',
      color: label.color,
      isUser: true,
    },
  ].sort((a, b) => a.kg - b.kg), [emissions.total, label.color]);

  return (
    <div className="pt-6 pb-2 animate-in">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">Carbon Calculator</h1>
        <p className="text-slate-500 text-sm">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
      </div>

      <StepIndicator />

      {/* Live preview */}
      <div className="card mb-4 flex items-center gap-3">
        <div className="text-2xl">{label.emoji}</div>
        <div className="flex-1">
          <p className="text-xs text-slate-500">Running total</p>
          <p className="text-white font-bold">{(emissions.total / 1000).toFixed(2)}t CO₂/year</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Score</p>
          <p className="font-black text-xl" style={{ color: label.color }}>{score}</p>
        </div>
      </div>

      {/* Step 0: Transport */}
      {step === 0 && (
        <div className="card space-y-5 animate-in">
          <h2 className="text-base font-semibold text-white">🚗 Transportation</h2>
          <div>
            <p className="text-sm text-slate-400 mb-2">Primary vehicle type</p>
            <div className="grid grid-cols-3 gap-2">
              {CAR_TYPES.map(ct => (
                <button
                  key={ct.value}
                  aria-pressed={baseline.transport.carType === ct.value}
                  onClick={() => set('transport', 'carType', ct.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${
                    baseline.transport.carType === ct.value
                      ? 'border-emerald-500 text-emerald-300'
                      : 'border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                  style={{
                    background: baseline.transport.carType === ct.value
                      ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <span className="text-xl">{ct.icon}</span>
                  <span className="text-xs font-medium">{ct.label}</span>
                  <span className="text-[10px] opacity-60">{ct.factor}</span>
                </button>
              ))}
            </div>
          </div>
          {baseline.transport.carType !== 'none' && (
            <SliderField label="Miles driven per week" value={baseline.transport.carMilesPerWeek}
              min={0} max={500} step={10} unit="mi"
              onChange={v => set('transport', 'carMilesPerWeek', v)} />
          )}
          <SliderField label="Public transit miles/week" value={baseline.transport.publicTransitMilesPerWeek}
            min={0} max={200} step={5} unit="mi"
            onChange={v => set('transport', 'publicTransitMilesPerWeek', v)} />
          <SliderField label="Cycling miles/week" value={baseline.transport.bikeMilesPerWeek}
            min={0} max={100} step={5} unit="mi"
            onChange={v => set('transport', 'bikeMilesPerWeek', v)} />
        </div>
      )}

      {/* Step 1: Home Energy */}
      {step === 1 && (
        <div className="card space-y-5 animate-in">
          <h2 className="text-base font-semibold text-white">🏠 Home Energy</h2>
          <SliderField label="Electricity per month" value={baseline.home.electricityKwhPerMonth}
            min={0} max={1500} step={25} unit="kWh"
            onChange={v => set('home', 'electricityKwhPerMonth', v)} />
          <SliderField label="Natural gas per month" value={baseline.home.gasKwhPerMonth}
            min={0} max={800} step={25} unit="kWh"
            onChange={v => set('home', 'gasKwhPerMonth', v)} />
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="text-slate-300">Renewable energy %</label>
              <span className="text-emerald-400 font-semibold">{baseline.home.renewablePercentage}%</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={baseline.home.renewablePercentage}
              onChange={e => set('home', 'renewablePercentage', Number(e.target.value))}
              className="w-full accent-emerald-500" />
            <p className="text-xs text-slate-600 mt-1">Higher % = lower electricity emissions ✅</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">People in household</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  aria-pressed={baseline.home.householdSize === n}
                  onClick={() => set('home', 'householdSize', n)}
                  className={`w-10 h-10 rounded-xl border font-bold transition-all ${
                    baseline.home.householdSize === n
                      ? 'border-emerald-500 text-emerald-300'
                      : 'border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                  style={{ background: baseline.home.householdSize === n ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)' }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Food */}
      {step === 2 && (
        <div className="card space-y-5 animate-in">
          <h2 className="text-base font-semibold text-white">🍔 Food & Diet</h2>
          <div>
            <p className="text-sm text-slate-400 mb-2">My diet is closest to...</p>
            <div className="space-y-2">
              {DIET_TYPES.map(dt => (
                <button
                  key={dt.value}
                  aria-pressed={baseline.food.dietType === dt.value}
                  onClick={() => set('food', 'dietType', dt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    baseline.food.dietType === dt.value
                      ? 'border-emerald-500' : 'border-slate-700/50 hover:border-slate-600'
                  }`}
                  style={{ background: baseline.food.dietType === dt.value ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-xl">{dt.icon}</span>
                  <div className="flex-1 text-left">
                    <p className={`font-medium text-sm ${baseline.food.dietType === dt.value ? 'text-emerald-300' : 'text-slate-300'}`}>{dt.label}</p>
                    <p className="text-xs text-slate-500">{dt.desc}</p>
                  </div>
                  {baseline.food.dietType === dt.value && <CheckCircle2 size={16} className="text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Food waste level</p>
            <div className="grid grid-cols-3 gap-2">
              {WASTE_LEVELS.map(wl => (
                <button
                  key={wl.value}
                  aria-pressed={baseline.food.foodWasteLevel === wl.value}
                  onClick={() => set('food', 'foodWasteLevel', wl.value)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    baseline.food.foodWasteLevel === wl.value
                      ? 'border-emerald-500 text-emerald-300' : 'border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                  style={{ background: baseline.food.foodWasteLevel === wl.value ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)' }}
                >
                  <p className="text-xs font-medium">{wl.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{wl.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <SliderField label="Local/seasonal food %" value={baseline.food.localFoodPercentage}
            min={0} max={100} step={5} unit="%"
            onChange={v => set('food', 'localFoodPercentage', v)} />
        </div>
      )}

      {/* Step 3: Shopping */}
      {step === 3 && (
        <div className="card space-y-5 animate-in">
          <h2 className="text-base font-semibold text-white">🛍️ Shopping</h2>
          <div>
            <p className="text-sm text-slate-400 mb-2">Shopping habit</p>
            <div className="space-y-2">
              {SHOPPING_LEVELS.map(sl => (
                <button
                  key={sl.value}
                  aria-pressed={baseline.shopping.shoppingLevel === sl.value}
                  onClick={() => set('shopping', 'shoppingLevel', sl.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    baseline.shopping.shoppingLevel === sl.value
                      ? 'border-emerald-500' : 'border-slate-700/50 hover:border-slate-600'
                  }`}
                  style={{ background: baseline.shopping.shoppingLevel === sl.value ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)' }}
                >
                  <div className="text-left">
                    <p className={`font-medium text-sm ${baseline.shopping.shoppingLevel === sl.value ? 'text-emerald-300' : 'text-slate-300'}`}>{sl.label}</p>
                    <p className="text-xs text-slate-500">{sl.desc}</p>
                  </div>
                  {baseline.shopping.shoppingLevel === sl.value && <CheckCircle2 size={16} className="text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
          <CounterField label="Clothing items bought/year" value={baseline.shopping.clothingItemsPerYear}
            onChange={v => set('shopping', 'clothingItemsPerYear', v)} min={0} max={100} />
          <CounterField label="Electronics bought/year" value={baseline.shopping.electronicsPerYear}
            onChange={v => set('shopping', 'electronicsPerYear', v)} min={0} max={10} />
        </div>
      )}

      {/* Step 4: Flights */}
      {step === 4 && (
        <div className="card space-y-4 animate-in">
          <h2 className="text-base font-semibold text-white">✈️ Flights per Year</h2>
          <div className="space-y-1">
            {[
              { label: 'Short-haul (<3 hrs)', key: 'shortHaulPerYear', kg: 255, icon: '🛫' },
              { label: 'Medium-haul (3-7 hrs)', key: 'mediumHaulPerYear', kg: 585, icon: '✈️' },
              { label: 'Long-haul (7+ hrs)', key: 'longHaulPerYear', kg: 1200, icon: '🌏' },
            ].map(f => (
              <div key={f.key} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{f.icon}</span>
                  <span className="text-sm text-slate-300 flex-1">{f.label}</span>
                  <span className="text-xs text-slate-500">{f.kg} kg/flight</span>
                </div>
                <CounterField
                  label=""
                  value={baseline.flights[f.key as keyof typeof baseline.flights]}
                  onChange={v => set('flights', f.key as keyof CarbonBaseline['flights'], v)}
                  max={20}
                />
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <p className="text-xs text-emerald-400 font-semibold mb-1">💡 Flight insight</p>
            <p className="text-xs text-slate-400">
              {emissions.flights > 0
                ? `Your flights contribute ${Math.round((emissions.flights / emissions.total) * 100)}% of your total footprint (${emissions.flights.toLocaleString()} kg CO₂).`
                : 'Great! No flights = major carbon savings. ✅'}
            </p>
          </div>
        </div>
      )}

      {/* Step 5: Results */}
      {step === 5 && (
        <div className="space-y-4 animate-in">
          {/* Score card */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: `linear-gradient(135deg, ${label.color}15 0%, rgba(15,23,42,0.9) 100%)`,
              border: `1px solid ${label.color}40`,
              boxShadow: `0 0 40px ${label.color}20`,
            }}
          >
            <p className="text-5xl mb-2">{label.emoji}</p>
            <p className="text-5xl font-black mb-1" style={{ color: label.color }}>{score}</p>
            <p className="text-slate-400 text-sm mb-3">Carbon Score out of 1000</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-white font-bold">{(emissions.total / 1000).toFixed(1)}t</p>
                <p className="text-slate-500 text-xs">CO₂/year total</p>
              </div>
              <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-white font-bold">{label.text}</p>
                <p className="text-slate-500 text-xs">Rating</p>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Breakdown by Category</h3>
            {[
              { label: 'Transport', val: emissions.transport, icon: '🚗', color: '#10b981' },
              { label: 'Home', val: emissions.home, icon: '🏠', color: '#14b8a6' },
              { label: 'Food', val: emissions.food, icon: '🍔', color: '#f59e0b' },
              { label: 'Shopping', val: emissions.shopping, icon: '🛍️', color: '#6366f1' },
              { label: 'Flights', val: emissions.flights, icon: '✈️', color: '#ec4899' },
            ].map(cat => (
              <div key={cat.label} className="flex items-center gap-2 py-1.5">
                <span className="text-base w-6">{cat.icon}</span>
                <span className="text-xs text-slate-400 w-16">{cat.label}</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(cat.val / emissions.total) * 100}%`, background: cat.color }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-16 text-right">{cat.val.toLocaleString()} kg</span>
              </div>
            ))}
          </div>

          {/* 🔥 COMPARISON MODE */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={14} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-300">How You Compare</h3>
            </div>
            <div className="space-y-2">
              {comparisonData.map((person) => {
                const maxKg = 25000;
                const barPct = Math.min(100, (person.kg / maxKg) * 100);
                return (
                  <div key={person.name} className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                    person.isUser ? 'bg-white/5 border border-white/10' : ''
                  }`}>
                    <span className="text-base w-6 text-center">{person.icon}</span>
                    <span className="text-xs text-slate-400 w-24 flex-shrink-0">{person.name}</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${barPct}%`, background: person.color, boxShadow: person.isUser ? `0 0 8px ${person.color}60` : 'none' }}
                      />
                    </div>
                    <span className="text-xs w-12 text-right" style={{ color: person.color }}>
                      {person.kg >= 1000 ? `${(person.kg / 1000).toFixed(1)}t` : `${person.kg}kg`}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-700 mt-2 text-center">All values in kg CO₂/year</p>
          </div>

          <button
            onClick={handleFinish}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
          >
            Save & Go to Dashboard 🚀
          </button>
        </div>
      )}

      {/* Navigation */}
      {step < STEPS.length - 1 && (
        <div className="flex gap-3 mt-4">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn-secondary flex items-center gap-1.5 py-3 px-4 text-sm"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <button
            onClick={() => setStep(s => s + 1)}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-3 text-sm"
          >
            {step === STEPS.length - 2 ? 'See Results' : 'Continue'} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
