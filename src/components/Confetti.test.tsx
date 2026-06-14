import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Confetti from './Confetti';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => {
  return { default: vi.fn() };
});

describe('Confetti Component', () => {
  it('renders nothing by default (no AppContext)', () => {
    const { container } = render(<Confetti />);
    // without AppContext showing confetti, it should be empty/null or just return null
    expect(container).toBeEmptyDOMElement();
  });
});
