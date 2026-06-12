import { useState } from 'react';
import { Leaf, ArrowRight, Shield, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { dispatch } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const db = JSON.parse(localStorage.getItem('ecotrack-users-db') || '{}');

    if (mode === 'register') {
      if (name.trim().length < 2) {
        setError('Name must be at least 2 characters');
        return;
      }
      if (db[email]) {
        setError('Account with this email already exists');
        return;
      }
      
      // Register user in mock DB
      db[email] = { password };
      localStorage.setItem('ecotrack-users-db', JSON.stringify(db));
      
      // Update app state
      dispatch({ 
        type: 'SET_USER', 
        payload: { name: name.trim(), email, isAuthenticated: true, setupComplete: false } 
      });
      
    } else {
      // Login
      const userRecord = db[email];
      if (!userRecord || userRecord.password !== password) {
        setError('Invalid email or password');
        return;
      }
      if (!userRecord.state) {
        setError('User data corrupted. Please register again.');
        return;
      }
      
      // Load user state
      dispatch({ type: 'LOGIN', payload: userRecord.state });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#060b18' }}
    >
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse', filter: 'blur(50px)' }} />
      </div>

      <div className="relative animate-in w-full max-w-sm">
        {/* Logo */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            boxShadow: '0 0 40px rgba(16,185,129,0.3)',
          }}
        >
          <Leaf size={40} className="text-emerald-400" style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.8))' }} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            {mode === 'register' ? 'Join EcoTrack' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400 text-sm">
            {mode === 'register' 
              ? 'Start tracking your carbon footprint today.' 
              : 'Sign in to continue your eco journey.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-medium">
              <Shield size={14} /> {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon size={18} className="text-slate-500" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="First Name"
                className="input-glass w-full pl-11"
                style={{ fontSize: '0.95rem', padding: '14px 16px 14px 44px' }}
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={18} className="text-slate-500" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email Address"
              className="input-glass w-full pl-11"
              style={{ fontSize: '0.95rem', padding: '14px 16px 14px 44px' }}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={18} className="text-slate-500" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="input-glass w-full pl-11"
              style={{ fontSize: '0.95rem', padding: '14px 16px 14px 44px' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-sm mt-2"
          >
            {mode === 'register' ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'register' ? 'login' : 'register');
              setError('');
            }}
            className="text-slate-400 text-sm hover:text-white transition-colors"
          >
            {mode === 'register' 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Create one"}
          </button>
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
