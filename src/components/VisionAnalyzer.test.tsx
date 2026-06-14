import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VisionAnalyzer from './VisionAnalyzer';
import { AppProvider } from '../context/AppContext';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            item: 'Beef Burger',
            co2: 3.5,
            advice: 'Consider swapping beef for chicken or lentils to cut emissions.'
          })
        }
      })
    })
  }))
}));

describe('VisionAnalyzer Component', () => {
  it('renders the page heading', () => {
    render(
      <AppProvider>
        <VisionAnalyzer />
      </AppProvider>
    );
    expect(screen.getByText('AI Image Scanner')).toBeInTheDocument();
  });

  it('renders the Gemini Vision badge', () => {
    render(
      <AppProvider>
        <VisionAnalyzer />
      </AppProvider>
    );
    expect(screen.getByText(/gemini vision/i)).toBeInTheDocument();
  });

  it('renders the file upload area initially', () => {
    render(
      <AppProvider>
        <VisionAnalyzer />
      </AppProvider>
    );
    expect(screen.getByText(/click to upload photo/i)).toBeInTheDocument();
  });

  it('renders the Analysis Results section', () => {
    render(
      <AppProvider>
        <VisionAnalyzer />
      </AppProvider>
    );
    expect(screen.getByText('Analysis Results')).toBeInTheDocument();
  });

  it('shows placeholder text when no image is uploaded', () => {
    render(
      <AppProvider>
        <VisionAnalyzer />
      </AppProvider>
    );
    expect(screen.getByText(/upload an image and run the analysis/i)).toBeInTheDocument();
  });
});
