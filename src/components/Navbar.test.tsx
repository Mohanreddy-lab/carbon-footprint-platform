import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../components/Navbar';

function renderNavbar(currentPage = 'dashboard') {
  const onNavigate = vi.fn();
  render(<Navbar currentPage={currentPage as any} onNavigate={onNavigate} />);
  return { onNavigate };
}

describe('Navbar', () => {
  it('renders all navigation tabs', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: /navigate to home/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /navigate to calculate/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /navigate to track/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /navigate to actions/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /navigate to community/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /navigate to vision/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /navigate to profile/i })).toBeDefined();
  });

  it('marks the active page with aria-current', () => {
    renderNavbar('dashboard');
    const homeBtn = screen.getByRole('button', { name: /navigate to home/i });
    expect(homeBtn.getAttribute('aria-current')).toBe('page');
  });

  it('calls onNavigate with correct page when tab is clicked', async () => {
    const { onNavigate } = renderNavbar('dashboard');
    const user = userEvent.setup();
    const calcBtn = screen.getByRole('button', { name: /navigate to calculate/i });
    await user.click(calcBtn);
    expect(onNavigate).toHaveBeenCalledWith('calculator');
  });

  it('has a main navigation landmark', () => {
    renderNavbar();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeDefined();
  });
});
