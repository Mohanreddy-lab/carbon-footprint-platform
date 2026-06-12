import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Calculator from './Calculator';
import { AppProvider } from '../context/AppContext';

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

    expect(screen.getByText('Carbon Calculator')).toBeInTheDocument();

    expect(screen.getByText(/Transportation/)).toBeInTheDocument();
    expect(screen.getByText('Primary vehicle type')).toBeInTheDocument();
  });
});
