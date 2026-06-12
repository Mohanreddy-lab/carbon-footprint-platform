import { useState } from 'react';
import { Leaf, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Onboarding() {
  const [name, setName] = useState('');
  const [step, setStep] = useState<'welcome' | 'name'>('welcome');
  const { dispatch } = useApp();

  const handleStart = () => {
    if (name.trim().length < 2) return;
    dispatch({
      type: 'SET_USER',
      payload: {
        name: name.trim(),
        setupComplete: true,
        xp: 25,
      },
    });
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach17' });
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center px-6 text-center">
        {/* Animated background orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative animate-in">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 glow-emerald">
            <Leaf size={48} className="text-emerald-400" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome to <span className="text-gradient">EcoTrack</span>
          </h1>
          <p className="text-slate-400 text-lg mb-2 max-w-sm mx-auto">
            Your personal carbon footprint dashboard
          </p>
          <p className="text-slate-500 text-sm mb-10 max-w-xs mx-auto">
            Track your emissions, discover reduction actions, and join a community fighting climate change — one step at a time.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10 max-w-xs mx-auto">
            {[
              { icon: '📊', label: 'Track footprint' },
              { icon: '⚡', label: '30+ actions' },
              { icon: '🏆', label: 'Earn badges' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 card rounded-xl">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-slate-400 text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('name')}
            className="btn-primary flex items-center gap-2 mx-auto text-base px-8 py-3"
          >
            Get Started <ArrowRight size={18} />
          </button>

          <p className="text-slate-600 text-xs mt-6">
            No account required · Data stays on your device
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-in">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌿</div>
          <h2 className="text-2xl font-bold text-white mb-2">What's your name?</h2>
          <p className="text-slate-400 text-sm">We'll personalise your eco journey</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            placeholder="Your first name"
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3.5 text-white text-base placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            autoFocus
            maxLength={30}
          />

          <button
            onClick={handleStart}
            disabled={name.trim().length < 2}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start my journey <ArrowRight size={18} />
          </button>

          <button
            onClick={() => setStep('welcome')}
            className="w-full text-slate-500 text-sm hover:text-slate-400 transition-colors py-2"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
