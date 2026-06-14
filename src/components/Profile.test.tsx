import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Profile from './Profile';
import { AppProvider } from '../context/AppContext';

describe('Profile Component', () => {
  it('renders Profile layout and tabs', () => {
    render(
      <AppProvider>
        <Profile onNavigate={vi.fn()} />
      </AppProvider>
    );
    expect(screen.getAllByText(/XP/i).length).toBeGreaterThan(0);
  });
});
