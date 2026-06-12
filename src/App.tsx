import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import ActivityTracker from './components/ActivityTracker';
import ActionCenter from './components/ActionCenter';
import Community from './components/Community';
import Profile from './components/Profile';
import type { Page } from './types';

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard');
  const { state } = useApp();

  if (!state.user.setupComplete) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-2xl mx-auto pb-24 px-4">
        {page === 'dashboard'  && <Dashboard  onNavigate={setPage} />}
        {page === 'calculator' && <Calculator onNavigate={setPage} />}
        {page === 'tracker'    && <ActivityTracker onNavigate={setPage} />}
        {page === 'actions'    && <ActionCenter onNavigate={setPage} />}
        {page === 'community'  && <Community  onNavigate={setPage} />}
        {page === 'profile'    && <Profile    onNavigate={setPage} />}
      </div>
      <Navbar currentPage={page} onNavigate={setPage} />
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
