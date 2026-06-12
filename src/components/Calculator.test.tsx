import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Calculator from './Calculator';
import { AppProvider } from '../context/AppContext';

// Mock confetti to prevent canvas errors
vi.mock('./Confetti', () => ({
  default: () => <div data-testid="mock-confetti" />
}));

describe('Calculator Component', () => {
  it('should render the first step of the calculator', () => {
    render(
      <AppProvider>
        <Calculator onNavigate={() => {}} />
      </AppProvider>
    );
    
    // Check if the title is present
    expect(screen.getByText('Carbon Calculator')).toBeInTheDocument();
    
    // Check if the first step "Transport" is active
    expect(screen.getByText(/Transportation/)).toBeInTheDocument();
    expect(screen.getByText('Primary vehicle type')).toBeInTheDocument();
  });
});
