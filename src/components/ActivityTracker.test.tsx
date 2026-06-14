import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityTracker from './ActivityTracker';
import { AppProvider } from '../context/AppContext';

describe('ActivityTracker Component', () => {
  it('renders Activity Tracker', () => {
    render(
      <AppProvider>
        <ActivityTracker onNavigate={vi.fn()} />
      </AppProvider>
    );
    expect(screen.getAllByText(/Activity Tracker/i).length).toBeGreaterThan(0);
  });
});
