import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShareCard from './ShareCard';
import { AppProvider } from '../context/AppContext';

describe('ShareCard Component', () => {
  it('renders ShareCard correctly', () => {
    render(
      <AppProvider>
        <ShareCard onClose={() => {}} />
      </AppProvider>
    );
    // Since it's a share card, verify some common text or layout
    expect(screen.getByText(/Share/i)).toBeInTheDocument();
  });
});
