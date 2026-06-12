import { LayoutDashboard, Calculator, Activity, Zap, Globe, User } from 'lucide-react';
import type { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const tabs: { page: Page; icon: React.ElementType; label: string }[] = [
  { page: 'dashboard',  icon: LayoutDashboard, label: 'Home'      },
  { page: 'calculator', icon: Calculator,      label: 'Calculate' },
  { page: 'tracker',    icon: Activity,        label: 'Track'     },
  { page: 'actions',    icon: Zap,             label: 'Actions'   },
  { page: 'community',  icon: Globe,           label: 'Community' },
  { page: 'profile',    icon: User,            label: 'Profile'   },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map(({ page, icon: Icon, label }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                active
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={20} className={active ? 'drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]' : ''} />
              <span className="text-[10px] font-medium truncate">{label}</span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
