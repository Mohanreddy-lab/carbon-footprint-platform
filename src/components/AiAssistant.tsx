import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApp } from '../context/AppContext';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AiAssistant() {
  const { state } = useApp();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateAdvice = async () => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!API_KEY || API_KEY === '') {
      setError('AI feature not configured. Please contact the admin.');
      return;
    }
    
    if (!state.baseline || !state.emissions) {
      setError('Please complete the carbon calculator first to get your baseline.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      // Use a model supported by the Hackathon API key
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are EcoTrack's AI Assistant helping a user in India.
The user has the following carbon footprint baseline:
- Transport: ${state.baseline.transport.carMilesPerWeek} car miles/week, ${state.baseline.transport.carType} car.
- Home Energy: ${state.baseline.home.electricityKwhPerMonth} kWh electricity/month.
- Diet: ${state.baseline.food.dietType}.
- Total annual emissions: ${state.emissions.total} kg CO2e/year.

Please provide 3 specific, practical recommendations suited to someone living in India on how they can reduce their carbon footprint. Keep each recommendation short and easy to act on. Do not use markdown headers or bullet symbols.`;

      const result = await model.generateContent(prompt);
      setResponse(result.response.text());
    } catch (err) {
      setError('Failed to generate advice. ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
          <Sparkles size={20} />
        </div>
        <h2 className="text-xl font-bold">Ask Gemini AI</h2>
      </div>

      <p className="text-slate-400 text-sm mb-6 relative z-10">
        Get personalized, AI-driven recommendations based on your unique carbon profile.
      </p>

      {!response && !loading && (
        <button
          onClick={generateAdvice}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 relative z-10"
        >
          <Sparkles size={18} />
          Analyze My Footprint
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <p className="text-slate-400 text-sm animate-pulse">Gemini is analyzing your data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm relative z-10">
          {error}
        </div>
      )}

      {response && !loading && (
        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 relative z-10">
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300">
            {response}
          </div>
          <button
            onClick={() => setResponse('')}
            className="mt-4 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Clear Response
          </button>
        </div>
      )}
    </div>
  );
}
