import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { AppProvider } from '../context/AppContext';

vi.mock('./GlobeWidget', () => ({
  default: () => <div data-testid="globe-widget-mock">Globe Mock</div>
}));

describe('Dashboard Component', () => {
  it('renders Dashboard elements', () => {
    render(
      <AppProvider>
        <Dashboard onNavigate={vi.fn()} />
      </AppProvider>
    );
    expect(screen.getAllByText(/Streak/i).length).toBeGreaterThan(0);
  });
});
