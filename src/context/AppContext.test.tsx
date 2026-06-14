import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from './AppContext';
import { useEffect } from 'react';

const TestComponent = () => {
  const { state: { user }, dispatch } = useApp();
  
  return (
    <div>
      <span data-testid="user-name">{user?.name || 'No User'}</span>
      <button onClick={() => dispatch({ type: 'SET_USER', payload: { name: 'Test User' } })}>Login</button>
      <button onClick={() => dispatch({ type: 'LOGOUT' })}>Logout</button>
    </div>
  );
};

describe('AppContext', () => {
  it('provides authentication context and state', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    const loginBtn = screen.getByText('Login');
    fireEvent.click(loginBtn);
    
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });
    
    const logoutBtn = screen.getByText('Logout');
    fireEvent.click(logoutBtn);
    
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).not.toHaveTextContent('Test User');
    });
  });
});
