import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Community from './Community';
import { AppProvider } from '../context/AppContext';

describe('Community Component', () => {
  it('renders Community leaderboard', () => {
    render(
      <AppProvider>
        <Community onNavigate={vi.fn()} />
      </AppProvider>
    );
    expect(screen.getAllByText(/Community/i).length).toBeGreaterThan(0);
  });
});
