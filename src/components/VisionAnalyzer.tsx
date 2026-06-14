import { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Camera, Upload, Loader2, Leaf, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function VisionAnalyzer() {
  const { dispatch } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    item: string;
    co2: number;
    advice: string;
  } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    if (!API_KEY || API_KEY === '') {
      setError('AI feature not configured. Please contact the admin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Convert base64 to parts for Gemini
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const prompt = `Analyze this image and estimate its carbon footprint.
If it's a meal, estimate the emissions based on ingredients (e.g. beef has high emissions, vegetables have low).
If it's an object or vehicle, estimate its manufacturing or daily usage emissions.
If it's a receipt (like electricity or flight), estimate the emissions based on the usage shown.

Return ONLY a raw JSON object with no markdown formatting and no backticks. It MUST match this exact structure:
{
  "item": "Name of the detected item (e.g. Beef Burger, Electricity Bill)",
  "co2": 5.5, // Estimated kg CO2e as a number
  "advice": "A short, actionable tip to reduce this specific emission."
}`;

      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType
          }
        }
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        const parsed = JSON.parse(text);
        setResult(parsed);
      } catch (parseError) {
        throw new Error('Failed to parse AI response. Please try another image.');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = () => {
    if (!result) return;
    
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        category: 'other',
        description: `AI Logged: ${result.item}`,
        co2Impact: result.co2,
        icon: 'camera',
        points: 50 // Bonus points for using AI logger!
      }
    });

    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Math.random().toString(),
        type: 'achievement',
        title: 'AI Logged!',
        message: `Logged ${result.item} (+50 XP)`,
        icon: 'camera',
      }
    });

    // Reset state
    setImage(null);
    setResult(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
          <Camera size={16} /> Gemini Vision
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
          AI Image Scanner
        </h1>
        <p className="text-slate-400">
          Upload a photo of your meal, transit, or energy bill. Our Gemini 2.5 Flash AI will analyze it and calculate its carbon footprint instantly!
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-700/50 transition-all flex flex-col items-center justify-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                <Upload size={32} />
              </div>
              <div>
                <p className="font-medium text-lg">Click to Upload Photo</p>
                <p className="text-sm text-slate-400">Supports JPG, PNG (Max 5MB)</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-700">
                <img src={image} alt="Uploaded item to analyze" className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setImage(null); setResult(null); }}
                  className="absolute top-2 right-2 bg-slate-900/80 text-white p-2 rounded-lg backdrop-blur-sm hover:bg-red-500 transition-colors"
                >
                  Change
                </button>
              </div>
              
              {!result && (
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Analyzing Image...</>
                  ) : (
                    <><Sparkles size={18} /> Calculate Footprint</>
                  )}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Leaf className="text-emerald-400" /> Analysis Results
          </h2>
          
          {result ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Detected Item</p>
                  <p className="text-xl font-medium text-white">{result.item}</p>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Estimated Impact</p>
                    <p className="text-3xl font-bold text-red-400">{result.co2} <span className="text-lg text-slate-400 font-normal">kg CO₂e</span></p>
                  </div>
                </div>

                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                  <p className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                    <Sparkles size={16} /> AI Advice
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.advice}</p>
                </div>
              </div>

              <button
                onClick={logActivity}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Log This Activity (+50 XP)
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-500 mb-4">
                <Camera size={40} opacity={0.5} />
              </div>
              <p className="text-slate-400">
                Upload an image and run the analysis to see the carbon footprint breakdown and personalized reduction tips.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
