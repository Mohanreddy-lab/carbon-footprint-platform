import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Community from './Community';
import { AppProvider } from '../context/AppContext';

describe('Community Component', () => {
  it('renders Community leaderboard and allows tab switching', () => {
    render(
      <AppProvider>
        <Community onNavigate={vi.fn()} />
      </AppProvider>
    );
    expect(screen.getAllByText(/Community/i).length).toBeGreaterThan(0);
    
    // Switch to News tab
    const newsTab = screen.getByText(/News/i);
    fireEvent.click(newsTab);
    expect(screen.getByText(/Today's Eco Fact/i)).toBeInTheDocument();
    
    // Switch to Local tab
    const localTab = screen.getByText(/Local/i);
    fireEvent.click(localTab);
    expect(screen.getByText(/Local Eco-Hubs/i)).toBeInTheDocument();
  });
});
