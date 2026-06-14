import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityTracker from './ActivityTracker';
import { AppProvider } from '../context/AppContext';

describe('ActivityTracker Component', () => {
  it('renders Activity Tracker and handles tabs', () => {
    render(
      <AppProvider>
        <ActivityTracker onNavigate={vi.fn()} />
      </AppProvider>
    );
    expect(screen.getAllByText(/Activity Tracker/i).length).toBeGreaterThan(0);
    
    // Click Custom
    const customBtn = screen.getByRole('button', { name: /Custom/i });
    fireEvent.click(customBtn);
    
    // Switch to week tab
    const weekTab = screen.getByRole('button', { name: /week/i });
    fireEvent.click(weekTab);
    
    // Switch to all tab
    const allTab = screen.getByRole('button', { name: /all/i });
    fireEvent.click(allTab);
  });
});
