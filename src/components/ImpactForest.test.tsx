import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImpactForest from './ImpactForest';
import { AppProvider } from '../context/AppContext';

describe('ImpactForest Component', () => {
  it('renders Impact Forest correctly', () => {
    render(
      <AppProvider>
        <ImpactForest onNavigate={vi.fn()} />
      </AppProvider>
    );
    expect(screen.getAllByText(/Forest/i).length).toBeGreaterThan(0);
  });
});
