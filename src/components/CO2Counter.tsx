import { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';

const KG_PER_SECOND = 1172;

function formatNum(n: number) {
  return Math.floor(n).toLocaleString();
}

export default function CO2Counter() {
  const startRef = useRef(Date.now());
  const [co2, setCo2] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setCo2(elapsed * KG_PER_SECOND);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card-glass overflow-hidden relative">
      {/* Shimmer effect */}
      <div className="absolute inset-0 animate-shimmer opacity-30" />

      <div className="relative flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <Globe size={16} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
            CO2 added to atmosphere since you opened EcoTrack
          </p>
          <div className="overflow-hidden">
            <p
              className="text-lg font-bold text-red-400 tabular-nums"
              style={{
                transition: 'color 0.3s ease',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {visible ? formatNum(co2) : '0'}
              <span className="text-xs text-slate-500 ml-1 font-normal">kg CO2</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-slate-600">~1,172 kg</span>
          <span className="text-[9px] text-slate-600">per second</span>
          <span className="text-[9px] text-slate-700">worldwide</span>
        </div>
      </div>
    </div>
  );
}
