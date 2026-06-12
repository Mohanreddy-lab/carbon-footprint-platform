import { useState } from 'react';
import { CheckCircle2, Circle, Zap, ShoppingBag, TreePine, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OFFSET_PROJECTS } from '../data/emissionData';
import type { CarbonAction, OffsetPurchase } from '../types';

const CATEGORIES = ['All', 'Transport', 'Home', 'Food', 'Shopping', 'Flights'];
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'] as const;
const DIFF_COLORS = { easy: 'text-emerald-400 bg-emerald-500/10', medium: 'text-amber-400 bg-amber-500/10', hard: 'text-red-400 bg-red-500/10' };
const DIFF_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

const SUB_TABS = ['Actions', 'Offsets'] as const;
type SubTab = typeof SUB_TABS[number];

function ActionCard({ action, onToggle, onComplete }: {
  action: CarbonAction;
  onToggle: () => void;
  onComplete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = !!action.completedDate;

  return (
    <div className={`card border transition-all duration-200 ${
      isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' :
      action.committed ? 'border-emerald-500/20' : 'border-slate-700/50'
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{action.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-medium text-sm leading-snug ${isCompleted ? 'text-emerald-300 line-through opacity-70' : 'text-white'}`}>
              {action.title}
            </p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${DIFF_COLORS[action.difficulty]}`}>
              {DIFF_LABELS[action.difficulty]}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {expanded ? action.description : `${action.description.slice(0, 60)}${action.description.length > 60 ? '...' : ''}`}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-emerald-400 font-semibold">💚 {action.co2SavedPerYear} kg/yr</span>
            <span className="text-xs text-slate-600">⏱ {action.timeToImplement}</span>
          </div>

          {expanded && action.tips.length > 0 && (
            <div className="mt-2 p-2.5 bg-slate-800/50 rounded-lg space-y-1">
              {action.tips.map((tip, i) => (
                <p key={i} className="text-xs text-slate-400 flex gap-1.5">
                  <span className="text-emerald-500 flex-shrink-0">→</span>{tip}
                </p>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onToggle}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                isCompleted ? 'bg-emerald-500/10 text-emerald-400 cursor-not-allowed' :
                action.committed ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              disabled={isCompleted}
            >
              {isCompleted ? <CheckCircle2 size={12} /> : action.committed ? <CheckCircle2 size={12} /> : <Circle size={12} />}
              {isCompleted ? 'Completed' : action.committed ? 'Committed' : 'Commit'}
            </button>
            {action.committed && !isCompleted && (
              <button onClick={onComplete} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 transition-all">
                Mark Done ✅
              </button>
            )}
            <button onClick={() => setExpanded(e => !e)} className="ml-auto text-xs text-slate-600 hover:text-slate-400 transition-colors">
              {expanded ? 'Less' : 'More'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OffsetTab() {
  const { state, dispatch } = useApp();
  const [amounts, setAmounts] = useState<Record<string, number>>(Object.fromEntries(OFFSET_PROJECTS.map(p => [p.id, 1])));
  const [purchased, setPurchased] = useState<string | null>(null);

  const totalOffsetKg = state.user.totalOffsetKg;
  const totalOffsetTonnes = (totalOffsetKg / 1000).toFixed(2);

  const handlePurchase = (project: typeof OFFSET_PROJECTS[number]) => {
    const tonnes = amounts[project.id] ?? 1;
    const purchase: OffsetPurchase = {
      id: `off-${Date.now()}`,
      projectId: project.id,
      projectName: project.name,
      tonnes,
      cost: tonnes * project.costPerTonne,
      date: new Date().toISOString(),
      icon: project.icon,
    };
    dispatch({ type: 'ADD_OFFSET', payload: purchase });
    if (totalOffsetKg + tonnes * 1000 >= 1000) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach14' });
    }
    setPurchased(project.id);
    setTimeout(() => setPurchased(null), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="card-glow">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-slate-500">Total CO₂ Offset</p>
            <p className="text-2xl font-bold text-emerald-400">{totalOffsetTonnes}t</p>
          </div>
          <div className="text-4xl">🌍</div>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (totalOffsetKg / 1000) * 10)}%` }} />
        </div>
        <p className="text-xs text-slate-600 mt-1">Goal: offset 10 tonnes total</p>
      </div>

      {state.offsetPurchases.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">My Portfolio</h3>
          <div className="space-y-1.5">
            {state.offsetPurchases.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span>{p.icon}</span>
                <span className="text-slate-400 flex-1">{p.projectName}</span>
                <span className="text-emerald-400">{p.tonnes}t</span>
                <span className="text-slate-600">${p.cost}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {OFFSET_PROJECTS.map(project => (
          <div key={project.id} className={`card border transition-all ${purchased === project.id ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700/50'}`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{project.icon}</span>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-sm text-white">{project.name}</p>
                  <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{project.category}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{project.description}</p>
                <p className="text-xs text-slate-500 mt-1">📍 {project.location}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {project.sdgs.map(sdg => (
                    <span key={sdg} className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                      SDG {sdg}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAmounts(a => ({ ...a, [project.id]: Math.max(1, (a[project.id] ?? 1) - 1) }))}
                      className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-sm font-bold transition-colors">−</button>
                    <span className="text-white font-bold text-sm w-4 text-center">{amounts[project.id]}</span>
                    <button onClick={() => setAmounts(a => ({ ...a, [project.id]: (a[project.id] ?? 1) + 1 }))}
                      className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-sm font-bold transition-colors">+</button>
                    <span className="text-xs text-slate-500">tonnes</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs text-slate-500">${project.costPerTonne}/tonne</p>
                    <p className="text-emerald-400 font-bold text-sm">${(amounts[project.id] ?? 1) * project.costPerTonne}</p>
                  </div>
                  <button
                    onClick={() => handlePurchase(project)}
                    className={`text-xs px-3 py-2 rounded-xl font-semibold transition-all ${
                      purchased === project.id
                        ? 'bg-emerald-500 text-white'
                        : 'btn-primary py-2 px-3'
                    }`}
                  >
                    {purchased === project.id ? '✅ Offset!' : 'Offset'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props { onNavigate: (p: import('../types').Page) => void }

export default function ActionCenter({ onNavigate: _ }: Props) {
  const { state, dispatch } = useApp();
  const [subTab, setSubTab] = useState<SubTab>('Actions');
  const [catFilter, setCatFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filtered = state.actions.filter(a => {
    const catOk = catFilter === 'All' || a.category.toLowerCase() === catFilter.toLowerCase();
    const diffOk = diffFilter === 'all' || a.difficulty === diffFilter;
    return catOk && diffOk;
  });

  const committed = state.actions.filter(a => a.committed);
  const totalSavedPerYear = committed.reduce((s, a) => s + a.co2SavedPerYear, 0);
  const committedCount = committed.length;
  const completedCount = committed.filter(a => !!a.completedDate).length;

  const handleToggle = (id: string) => {
    dispatch({ type: 'TOGGLE_ACTION', payload: id });
    const action = state.actions.find(a => a.id === id);
    if (action && !action.committed) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach6' });
      if (committedCount + 1 >= 5) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach7' });
      if (totalSavedPerYear + action.co2SavedPerYear >= 500) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach8' });
      if (action.id === 'a13' || action.id === 'a14') dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach19' });
    }
  };

  return (
    <div className="pt-6 pb-2 space-y-4 animate-in">
      <div>
        <h1 className="text-xl font-bold text-white">Action Center</h1>
        <p className="text-slate-500 text-sm">Reduce your footprint, earn XP</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
        {SUB_TABS.map(tab => (
          <button key={tab} onClick={() => setSubTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              subTab === tab ? 'bg-emerald-500/20 text-emerald-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {tab === 'Actions' ? <span className="flex items-center justify-center gap-1"><Zap size={14} />{tab}</span>
             : <span className="flex items-center justify-center gap-1"><TreePine size={14} />{tab}</span>}
          </button>
        ))}
      </div>

      {subTab === 'Actions' && (
        <>
          {/* Impact summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="card-glow text-center py-2.5">
              <p className="text-emerald-400 font-bold text-lg">{committedCount}</p>
              <p className="text-slate-500 text-xs">Committed</p>
            </div>
            <div className="card-glow text-center py-2.5">
              <p className="text-teal-400 font-bold text-lg">{completedCount}</p>
              <p className="text-slate-500 text-xs">Completed</p>
            </div>
            <div className="card-glow text-center py-2.5">
              <p className="text-amber-400 font-bold text-base">{(totalSavedPerYear / 1000).toFixed(1)}t</p>
              <p className="text-slate-500 text-xs">Saved/yr</p>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  catFilter === cat ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-1.5">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDiffFilter(d)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                  diffFilter === d ? 'bg-slate-600 text-white' : 'text-slate-600 hover:text-slate-400'
                }`}>
                {d === 'all' ? 'All' : DIFF_LABELS[d]}
              </button>
            ))}
          </div>

          {/* Action cards */}
          <div className="space-y-3">
            {filtered.map(action => (
              <ActionCard
                key={action.id}
                action={action}
                onToggle={() => handleToggle(action.id)}
                onComplete={() => dispatch({ type: 'COMPLETE_ACTION', payload: action.id })}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-slate-500 text-sm">No actions found for this filter</p>
            </div>
          )}
        </>
      )}

      {subTab === 'Offsets' && <OffsetTab />}
    </div>
  );
}
