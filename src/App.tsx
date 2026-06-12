import { useState, useEffect } from 'react';
import ToastSystem from './components/ToastSystem';
import Confetti from './components/Confetti';
import LevelUpScreen from './components/LevelUpScreen';
import { AppProvider, useApp } from './context/AppContext';
import AuthScreen from './components/AuthScreen';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import ActivityTracker from './components/ActivityTracker';
import ActionCenter from './components/ActionCenter';
import Community from './components/Community';
import Profile from './components/Profile';
import { LEVELS } from './data/emissionData';
import type { Page } from './types';

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard');
  const { state, dispatch } = useApp();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ from: number; to: number } | null>(null);
  const prevLevelRef = useState<number>(state.user.level);

  // Detect level-up from level changes
  useEffect(() => {
    const prevLevel = prevLevelRef[0];
    if (state.user.level > prevLevel) {
      setLevelUpData({ from: prevLevel, to: state.user.level });
      setShowLevelUp(true);
    }
    // update ref
    prevLevelRef[0] = state.user.level;
  }, [state.user.level]);

  if (!state.user.isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <ToastSystem />
      </>
    );
  }

  if (!state.user.setupComplete) {
    return (
      <div className="min-h-screen p-4" style={{ background: '#060b18' }}>
        <div className="max-w-2xl mx-auto">
          <Calculator onNavigate={() => setPage('dashboard')} />
        </div>
        <ToastSystem />
        {state.showConfetti && (
          <Confetti active={true} onComplete={() => dispatch({ type: 'CLEAR_CONFETTI' })} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#060b18' }}>
      <div className="max-w-2xl mx-auto pb-24 px-4">
        {page === 'dashboard'  && <Dashboard  onNavigate={setPage} />}
        {page === 'calculator' && <Calculator onNavigate={setPage} />}
        {page === 'tracker'    && <ActivityTracker onNavigate={setPage} />}
        {page === 'actions'    && <ActionCenter onNavigate={setPage} />}
        {page === 'community'  && <Community  onNavigate={setPage} />}
        {page === 'profile'    && <Profile    onNavigate={setPage} />}
      </div>

      <Navbar currentPage={page} onNavigate={setPage} />

      {/* Global overlays */}
      <ToastSystem />

      {state.showConfetti && (
        <Confetti active={true} onComplete={() => dispatch({ type: 'CLEAR_CONFETTI' })} />
      )}

      {showLevelUp && levelUpData && (
        <LevelUpScreen
          fromLevel={levelUpData.from}
          toLevel={levelUpData.to}
          onDismiss={() => {
            setShowLevelUp(false);
            dispatch({ type: 'CLEAR_CONFETTI' });
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
