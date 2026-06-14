import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionCenter from './ActionCenter';
import { AppProvider } from '../context/AppContext';

describe('ActionCenter Component', () => {
  it('renders Action Center heading', () => {
    render(
      <AppProvider>
        <ActionCenter onNavigate={vi.fn()} />
      </AppProvider>
    );
    expect(screen.getByText(/Action Center/i)).toBeInTheDocument();
  });

  it('renders action cards and allows committing to one', () => {
    render(
      <AppProvider>
        <ActionCenter onNavigate={vi.fn()} />
      </AppProvider>
    );
    
    const commitButtons = screen.getAllByRole('button', { name: /Commit/i });
    expect(commitButtons.length).toBeGreaterThan(0);
    
    // Commit to the first action
    fireEvent.click(commitButtons[0]);
  });
});
