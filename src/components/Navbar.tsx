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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(6,11,24,0.95)',
        borderTop: '1px solid rgba(16,185,129,0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map(({ page, icon: Icon, label }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 min-w-0 flex-1 relative group"
              style={{
                color: active ? '#34d399' : '#475569',
              }}
            >
              {/* Active background pill */}
              {active && (
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.12)',
                  }}
                />
              )}

              <div className="relative">
                <Icon
                  size={20}
                  style={{
                    filter: active ? 'drop-shadow(0 0 6px rgba(52,211,153,0.6))' : 'none',
                    transition: 'filter 0.2s ease',
                  }}
                />
                {/* Notification dot placeholder */}
              </div>

              <span
                className="text-[10px] font-medium truncate relative"
                style={{ color: active ? '#34d399' : '#475569' }}
              >
                {label}
              </span>

              {/* Active dot */}
              {active && (
                <span
                  className="w-1 h-1 rounded-full relative"
                  style={{
                    background: '#10b981',
                    boxShadow: '0 0 6px rgba(16,185,129,0.8)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
