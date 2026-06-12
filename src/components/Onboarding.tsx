import { useState } from 'react';
import { Leaf, ArrowRight, Shield, BarChart2, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FEATURES = [
  { icon: '📊', label: 'Track footprint', desc: 'See your full CO₂ breakdown' },
  { icon: '⚡', label: '31 actions', desc: 'Science-backed reductions' },
  { icon: '🏆', label: 'Earn badges', desc: '20 achievements to unlock' },
  { icon: '🌲', label: 'Impact forest', desc: 'Watch your trees grow' },
  { icon: '🌍', label: 'Community', desc: 'Global leaderboard' },
  { icon: '🛡️', label: 'Streak shields', desc: 'Protect your progress' },
];

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
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
        style={{ background: '#060b18' }}
      >
        {/* Animated background orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite', filter: 'blur(40px)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse', filter: 'blur(50px)' }} />
          <div className="absolute top-2/3 left-1/3 w-48 h-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', animation: 'float 12s ease-in-out infinite 3s', filter: 'blur(30px)' }} />
        </div>

        <div className="relative animate-in w-full max-w-sm">
          {/* Logo */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              boxShadow: '0 0 40px rgba(16,185,129,0.3), 0 0 80px rgba(16,185,129,0.1)',
            }}
          >
            <Leaf size={48} className="text-emerald-400" style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.8))' }} />
          </div>

          <h1 className="text-4xl font-black text-white mb-2">
            Welcome to <span className="text-gradient">EcoTrack</span>
          </h1>
          <p className="text-slate-400 text-base mb-1 max-w-xs mx-auto">
            Your personal carbon footprint platform
          </p>
          <p className="text-slate-600 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
            Track emissions, discover reduction actions, and join a global community fighting climate change — one step at a time.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {FEATURES.map(({ icon, label, desc }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-white font-medium text-center leading-tight">{label}</span>
                <span className="text-[10px] text-slate-600 text-center leading-tight">{desc}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('name')}
            className="btn-primary flex items-center gap-2 mx-auto text-base px-8 py-3.5"
          >
            Get Started <ArrowRight size={18} />
          </button>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-slate-600 text-xs">
              <Shield size={11} /> No account needed
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-slate-600 text-xs">
              <BarChart2 size={11} /> Data stays on device
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-slate-600 text-xs">
              <Trophy size={11} /> 100% free
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50%       { transform: translateY(-20px) scale(1.05); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#060b18' }}
    >
      <div className="w-full max-w-sm animate-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 animate-float inline-block">🌿</div>
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
            className="input-glass"
            style={{ fontSize: '1.05rem', padding: '14px 16px' }}
            autoFocus
            maxLength={30}
          />

          <button
            onClick={handleStart}
            disabled={name.trim().length < 2}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
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
