import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateEmissions, calculateCarbonScore, getScoreLabel } from '../data/emissionData';
import type { CarbonBaseline, CarType, DietType, ShoppingLevel, FoodWasteLevel } from '../types';

const STEPS = ['Transport', 'Home Energy', 'Food', 'Shopping', 'Flights', 'Results'];

const CAR_TYPES: { value: CarType; label: string; icon: string; factor: string }[] = [
  { value: 'none',     label: 'No car',        icon: '🚶', factor: '0 kg/mile' },
  { value: 'electric', label: 'Electric',      icon: '⚡', factor: '0.05 kg/mile' },
  { value: 'hybrid',   label: 'Hybrid',        icon: '🔋', factor: '0.11 kg/mile' },
  { value: 'gasoline', label: 'Petrol/Gas',    icon: '⛽', factor: '0.21 kg/mile' },
  { value: 'diesel',   label: 'Diesel',        icon: '🏭', factor: '0.19 kg/mile' },
];

const DIET_TYPES: { value: DietType; label: string; icon: string; desc: string }[] = [
  { value: 'vegan',       label: 'Vegan',         icon: '🥦', desc: '1.5 kg CO₂/day' },
  { value: 'vegetarian',  label: 'Vegetarian',    icon: '🥗', desc: '2.0 kg CO₂/day' },
  { value: 'flexitarian', label: 'Flexitarian',   icon: '🌿', desc: '2.5 kg CO₂/day' },
  { value: 'omnivore',    label: 'Omnivore',      icon: '🍖', desc: '3.3 kg CO₂/day' },
  { value: 'heavy-meat',  label: 'Meat-heavy',    icon: '🥩', desc: '4.5 kg CO₂/day' },
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
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <label className="text-slate-300">{label}</label>
        <span className="text-emerald-400 font-medium">{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500"
      />
      <div className="flex justify-between text-xs text-slate-600 mt-0.5">
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
          className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold transition-colors">−</button>
        <span className="text-white font-bold w-6 text-center">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold transition-colors">+</button>
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

  const emissions = calculateEmissions(baseline);
  const score = calculateCarbonScore(emissions.total);
  const label = getScoreLabel(score);

  const handleFinish = () => {
    dispatch({ type: 'COMPLETE_SETUP', payload: { baseline, emissions } });
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach1' });
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach16' });
    onNavigate('dashboard');
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-6">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
            i < step ? 'w-5 h-5 bg-emerald-500 text-white' :
            i === step ? 'w-7 h-7 bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]' :
            'w-5 h-5 bg-slate-700 text-slate-500'
          }`}>
            {i < step ? '✓' : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-4 h-0.5 mx-0.5 transition-all duration-500 ${i < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          )}
        </div>
      ))}
    </div>
  );

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
          <p className="font-bold text-lg" style={{ color: label.color }}>{score}</p>
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
                  onClick={() => set('transport', 'carType', ct.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${
                    baseline.transport.carType === ct.value
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
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
              <span className="text-emerald-400 font-medium">{baseline.home.renewablePercentage}%</span>
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
                  onClick={() => set('home', 'householdSize', n)}
                  className={`w-10 h-10 rounded-xl border font-bold transition-all ${
                    baseline.home.householdSize === n
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
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
          <h2 className="text-base font-semibold text-white">🍔 Food &amp; Diet</h2>
          <div>
            <p className="text-sm text-slate-400 mb-2">My diet is closest to...</p>
            <div className="space-y-2">
              {DIET_TYPES.map(dt => (
                <button
                  key={dt.value}
                  onClick={() => set('food', 'dietType', dt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    baseline.food.dietType === dt.value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
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
              {WASTE_LEVELS.map(w => (
                <button
                  key={w.value}
                  onClick={() => set('food', 'foodWasteLevel', w.value)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    baseline.food.foodWasteLevel === w.value
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <p className="text-xs font-medium">{w.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-60">{w.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <SliderField label="Local produce %" value={baseline.food.localFoodPercentage}
            min={0} max={100} step={5} unit="%"
            onChange={v => set('food', 'localFoodPercentage', v)} />
        </div>
      )}

      {/* Step 3: Shopping */}
      {step === 3 && (
        <div className="card space-y-5 animate-in">
          <h2 className="text-base font-semibold text-white">🛍️ Shopping &amp; Goods</h2>
          <CounterField label="New clothing items per year" value={baseline.shopping.clothingItemsPerYear}
            onChange={v => set('shopping', 'clothingItemsPerYear', v)} max={50} />
          <CounterField label="New electronics per year" value={baseline.shopping.electronicsPerYear}
            onChange={v => set('shopping', 'electronicsPerYear', v)} max={10} />
          <div>
            <p className="text-sm text-slate-400 mb-2">General shopping habits</p>
            <div className="space-y-2">
              {SHOPPING_LEVELS.map(sl => (
                <button
                  key={sl.value}
                  onClick={() => set('shopping', 'shoppingLevel', sl.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    baseline.shopping.shoppingLevel === sl.value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
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
        </div>
      )}

      {/* Step 4: Flights */}
      {step === 4 && (
        <div className="card space-y-4 animate-in">
          <h2 className="text-base font-semibold text-white">✈️ Flights (per year)</h2>
          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg p-3 space-y-0.5">
            <p>Short-haul: &lt;3 hrs → <span className="text-amber-400">255 kg CO₂</span> per trip</p>
            <p>Medium-haul: 3–6 hrs → <span className="text-amber-400">585 kg CO₂</span> per trip</p>
            <p>Long-haul: &gt;6 hrs → <span className="text-red-400">1,200 kg CO₂</span> per trip</p>
          </div>
          <CounterField label="Short-haul flights" value={baseline.flights.shortHaulPerYear}
            onChange={v => set('flights', 'shortHaulPerYear', v)} />
          <CounterField label="Medium-haul flights" value={baseline.flights.mediumHaulPerYear}
            onChange={v => set('flights', 'mediumHaulPerYear', v)} />
          <CounterField label="Long-haul flights" value={baseline.flights.longHaulPerYear}
            onChange={v => set('flights', 'longHaulPerYear', v)} />
        </div>
      )}

      {/* Step 5: Results */}
      {step === 5 && (
        <div className="space-y-4 animate-in">
          <div className="card-glow text-center py-6">
            <p className="text-slate-400 text-sm mb-2">Your estimated annual footprint</p>
            <p className="text-5xl font-bold" style={{ color: label.color }}>
              {(emissions.total / 1000).toFixed(2)}t
            </p>
            <p className="text-slate-500 text-sm mt-1">CO₂ equivalent per year</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-2xl">{label.emoji}</span>
              <span className="font-semibold" style={{ color: label.color }}>Score: {score} — {label.text}</span>
            </div>
          </div>

          {[
            { key: 'transport', label: 'Transport',   icon: '🚗', val: emissions.transport },
            { key: 'home',      label: 'Home Energy', icon: '🏠', val: emissions.home },
            { key: 'food',      label: 'Food',        icon: '🍔', val: emissions.food },
            { key: 'shopping',  label: 'Shopping',    icon: '🛍️', val: emissions.shopping },
            { key: 'flights',   label: 'Flights',     icon: '✈️', val: emissions.flights },
          ].map(cat => (
            <div key={cat.key} className="card flex items-center gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-slate-300 font-medium">{cat.label}</p>
                <div className="h-1.5 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${Math.round((cat.val / emissions.total) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{cat.val} kg</p>
                <p className="text-xs text-slate-500">{Math.round((cat.val / emissions.total) * 100)}%</p>
              </div>
            </div>
          ))}

          <div className="card text-xs text-slate-500 space-y-1">
            <p>🌍 World average: <span className="text-white">4.7t/year</span></p>
            <p>🇺🇸 US average: <span className="text-white">16t/year</span></p>
            <p>🎯 Paris target: <span className="text-emerald-400">2.3t/year</span></p>
          </div>

          <button onClick={handleFinish} className="btn-primary w-full py-3.5 text-base">
            Save & View Dashboard ✅
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-5">
        {step > 0 && step < 5 && (
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-1">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < 4 && (
          <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1 flex items-center justify-center gap-1">
            Next <ChevronRight size={16} />
          </button>
        )}
        {step === 4 && (
          <button onClick={() => setStep(5)} className="btn-primary flex-1 flex items-center justify-center gap-1">
            See Results <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
