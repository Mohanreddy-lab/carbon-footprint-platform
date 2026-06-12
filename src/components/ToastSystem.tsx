import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ToastNotification } from '../types';

const RARITY_STYLES: Record<string, { border: string; glow: string; label: string }> = {
  common:    { border: 'border-slate-500/40',    glow: 'rgba(148,163,184,0.2)', label: 'Common' },
  rare:      { border: 'border-blue-500/50',     glow: 'rgba(59,130,246,0.3)',  label: 'Rare' },
  epic:      { border: 'border-purple-500/50',   glow: 'rgba(168,85,247,0.3)', label: 'Epic' },
  legendary: { border: 'border-amber-400/60',    glow: 'rgba(245,158,11,0.4)', label: 'Legendary' },
};

const TYPE_STYLES: Record<string, string> = {
  achievement: 'toast-achievement',
  levelup:     'toast-levelup',
  streak:      'toast-streak',
  milestone:   'toast-milestone',
  info:        'bg-slate-900/95 border border-slate-700/50',
};

function Toast({ toast, onDismiss }: { toast: ToastNotification; onDismiss: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duration = toast.duration ?? 4500;

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [duration, onDismiss]);

  const rarity = toast.rarity ? RARITY_STYLES[toast.rarity] : null;
  const baseClass = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  return (
    <div
      className={`relative flex items-start gap-3 p-3.5 rounded-2xl backdrop-blur-xl max-w-xs w-full ${baseClass}`}
      style={{
        animation: 'toastIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        boxShadow: rarity ? `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${rarity.glow}` : undefined,
      }}
    >
      {/* Icon bubble */}
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
        {toast.icon}
      </div>

      <div className="flex-1 min-w-0">
        {toast.rarity && (
          <span className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 block`}
            style={{ color: rarity?.glow.replace('rgba', 'rgb').replace(/,[^,]+\)/, ')') }}>
            {rarity?.label} Achievement!
          </span>
        )}
        <p className="text-white font-semibold text-sm leading-snug">{toast.title}</p>
        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed truncate">{toast.message}</p>
      </div>

      <button
        onClick={onDismiss}
        className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors mt-0.5"
      >
        <X size={10} className="text-slate-400" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl overflow-hidden">
        <div
          className="h-full bg-emerald-400/60"
          style={{ animation: `shrink ${duration}ms linear forwards` }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(120%) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function ToastSystem() {
  const { state, dispatch } = useApp();
  const visible = state.toasts.slice(-4);

  const dismiss = (id: string) => dispatch({ type: 'REMOVE_TOAST', payload: id });

  if (visible.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {visible.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
