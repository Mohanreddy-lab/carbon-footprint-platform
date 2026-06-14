import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AiAssistant from './AiAssistant';
import { AppProvider } from '../context/AppContext';

// Mock the GenerativeAI module so tests don't make real network calls
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => 'Mock AI response with green tips.' }
      })
    })
  }))
}));

describe('AiAssistant Component', () => {
  it('renders the heading', () => {
    render(
      <AppProvider>
        <AiAssistant />
      </AppProvider>
    );
    expect(screen.getByText('Ask Gemini AI')).toBeInTheDocument();
  });

  it('renders the descriptive paragraph', () => {
    render(
      <AppProvider>
        <AiAssistant />
      </AppProvider>
    );
    expect(screen.getByText(/personalized, AI-driven recommendations/i)).toBeInTheDocument();
  });

  it('renders the Analyze button', () => {
    render(
      <AppProvider>
        <AiAssistant />
      </AppProvider>
    );
    expect(screen.getByRole('button', { name: /analyze my footprint/i })).toBeInTheDocument();
  });
});
