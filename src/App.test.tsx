import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { AppProvider } from './context/AppContext';

// Mock matchMedia for charts and sliders
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock react-globe.gl to prevent WebGL context errors in jsdom
vi.mock('react-globe.gl', () => {
  return {
    default: () => <div data-testid="mock-globe">Globe Widget Mock</div>
  };
});

describe('App Full Integration Test', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders auth screen by default when not logged in', () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    expect(screen.getByText(/Join EcoTrack/i)).toBeInTheDocument();
  });

  it('allows user registration, completes setup, and navigates all tabs', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    // 1. Register
    const nameInput = screen.getByPlaceholderText(/First Name/i);
    const emailInput = screen.getByPlaceholderText(/Email Address/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    // 2. Setup / Onboarding (Calculator should render)
    expect(screen.getByText(/Carbon Calculator/i)).toBeInTheDocument();
    
    // Complete the setup by clicking Continue 4 times, then See Results, then Finish Setup
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    }
    fireEvent.click(screen.getByRole('button', { name: /See Results/i }));
    const completeBtn = screen.getByRole('button', { name: /Save & Go to Dashboard/i });
    fireEvent.click(completeBtn);

    // 3. Dashboard should render
    expect(screen.getAllByText(/Carbon Score/i)[0]).toBeInTheDocument();

    // 4. Navigate to Tracker via Navbar and Log an Activity
    const trackerLink = screen.getByLabelText(/Navigate to Track/i);
    fireEvent.click(trackerLink);
    expect(screen.getByText(/Activity Tracker/i)).toBeInTheDocument();
    const walkBtn = screen.getByText(/Walked instead of drove/i);
    fireEvent.click(walkBtn); // Logs activity

    // 5. Navigate to Actions via Navbar and Commit
    const actionsLink = screen.getByLabelText(/Navigate to Actions/i);
    fireEvent.click(actionsLink);
    expect(screen.getByText(/Action Center/i)).toBeInTheDocument();
    const commitBtns = screen.getAllByRole('button', { name: /Commit/i });
    if (commitBtns.length > 0) fireEvent.click(commitBtns[0]); // Commit to first action

    // 6. Navigate to Community via Navbar
    const communityLink = screen.getByLabelText(/Navigate to Community/i);
    fireEvent.click(communityLink);
    expect(screen.getAllByText(/Community/i).length).toBeGreaterThan(0);

    // 7. Navigate to Profile via Navbar
    const profileLink = screen.getByLabelText(/Navigate to Profile/i);
    fireEvent.click(profileLink);
    expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
    
    // 8. Log out from profile
    const signOutBtn = screen.getByText(/Log Out/i);
    fireEvent.click(signOutBtn);
    
    // 9. Back to Auth Screen
    expect(screen.getByText(/Join EcoTrack/i)).toBeInTheDocument();
  });
});
