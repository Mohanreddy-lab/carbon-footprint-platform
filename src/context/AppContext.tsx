import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, AppAction, CarbonBaseline, EmissionBreakdown } from '../types';
import {
  DEFAULT_ACTIONS, DEFAULT_ACHIEVEMENTS, calculateCarbonScore, generateMonthlyData
} from '../data/emissionData';

const STORAGE_KEY = 'ecotrack-v2';

const DEFAULT_BASELINE: CarbonBaseline = {
  transport: { carMilesPerWeek: 150, carType: 'gasoline', publicTransitMilesPerWeek: 20, bikeMilesPerWeek: 5 },
  home: { electricityKwhPerMonth: 400, gasKwhPerMonth: 200, renewablePercentage: 0, householdSize: 2 },
  food: { dietType: 'omnivore', foodWasteLevel: 'medium', localFoodPercentage: 20 },
  shopping: { clothingItemsPerYear: 20, electronicsPerYear: 1, shoppingLevel: 'average' },
  flights: { shortHaulPerYear: 2, mediumHaulPerYear: 1, longHaulPerYear: 0 },
};

const DEFAULT_EMISSIONS: EmissionBreakdown = {
  transport: 1638, home: 1113, food: 1204, shopping: 1000, flights: 1095, total: 6050,
};

const initialState: AppState = {
  user: {
    name: '',
    setupComplete: false,
    carbonScore: calculateCarbonScore(DEFAULT_EMISSIONS.total),
    level: 0,
    xp: 25,
    streak: 0,
    lastLogDate: null,
    joinDate: new Date().toISOString(),
    totalCO2Saved: 0,
    totalOffsetKg: 0,
  },
  baseline: DEFAULT_BASELINE,
  emissions: DEFAULT_EMISSIONS,
  activities: [],
  actions: DEFAULT_ACTIONS.map(a => ({ ...a })),
  achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a })),
  monthlyData: generateMonthlyData(DEFAULT_EMISSIONS.total),
  offsetPurchases: [],
  savedArticles: [],
  weeklyChallenge: { goal: 'Log 500 eco activities this week as a community!', current: 347, target: 500 },
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };

    case 'COMPLETE_SETUP': {
      const { baseline, emissions } = action.payload;
      const score = calculateCarbonScore(emissions.total);
      const monthlyData = generateMonthlyData(emissions.total);
      return {
        ...state,
        baseline,
        emissions,
        monthlyData,
        user: {
          ...state.user,
          setupComplete: true,
          carbonScore: score,
          xp: state.user.xp + 100,
        },
      };
    }

    case 'ADD_ACTIVITY': {
      const activity = action.payload;
      const today = new Date().toDateString();
      const lastLog = state.user.lastLogDate ? new Date(state.user.lastLogDate).toDateString() : null;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastLog === today
        ? state.user.streak
        : lastLog === yesterday
          ? state.user.streak + 1
          : 1;
      return {
        ...state,
        activities: [activity, ...state.activities],
        user: {
          ...state.user,
          xp: state.user.xp + activity.points,
          streak: newStreak,
          lastLogDate: new Date().toISOString(),
          totalCO2Saved: state.user.totalCO2Saved + Math.abs(Math.min(activity.co2Impact, 0)),
        },
        weeklyChallenge: {
          ...state.weeklyChallenge,
          current: Math.min(state.weeklyChallenge.current + 1, state.weeklyChallenge.target),
        },
      };
    }

    case 'TOGGLE_ACTION': {
      const actions = state.actions.map(a =>
        a.id === action.payload ? { ...a, committed: !a.committed } : a
      );
      const committed = actions.filter(a => a.committed);
      const totalSaved = committed.reduce((sum, a) => sum + a.co2SavedPerYear, 0);
      return { ...state, actions, user: { ...state.user, totalCO2Saved: totalSaved } };
    }

    case 'COMPLETE_ACTION': {
      const now = new Date().toISOString();
      return {
        ...state,
        actions: state.actions.map(a =>
          a.id === action.payload ? { ...a, committed: true, completedDate: now } : a
        ),
        user: { ...state.user, xp: state.user.xp + 50 },
      };
    }

    case 'ADD_OFFSET': {
      const purchase = action.payload;
      const newOffsetKg = state.user.totalOffsetKg + purchase.tonnes * 1000;
      return {
        ...state,
        offsetPurchases: [purchase, ...state.offsetPurchases],
        user: { ...state.user, totalOffsetKg: newOffsetKg, xp: state.user.xp + 30 },
      };
    }

    case 'TOGGLE_SAVED_ARTICLE': {
      const id = action.payload;
      const saved = state.savedArticles.includes(id)
        ? state.savedArticles.filter(s => s !== id)
        : [...state.savedArticles, id];
      return { ...state, savedArticles: saved };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      const now = new Date().toISOString();
      const achievements = state.achievements.map(a =>
        a.id === action.payload && !a.unlocked
          ? { ...a, unlocked: true, unlockedDate: now }
          : a
      );
      const achievement = achievements.find(a => a.id === action.payload);
      const bonusXp = achievement?.points ?? 0;
      return {
        ...state,
        achievements,
        user: { ...state.user, xp: state.user.xp + bonusXp },
      };
    }

    case 'RESET_DATA':
      return { ...initialState, user: { ...initialState.user, joinDate: new Date().toISOString() } };

    default:
      return state;
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw) as AppState;
    return {
      ...initialState,
      ...saved,
      actions: initialState.actions.map(defaultAction => {
        const saved_action = saved.actions?.find(a => a.id === defaultAction.id);
        return saved_action ? { ...defaultAction, ...saved_action } : defaultAction;
      }),
      achievements: initialState.achievements.map(defaultAch => {
        const saved_ach = saved.achievements?.find(a => a.id === defaultAch.id);
        return saved_ach ? { ...defaultAch, ...saved_ach } : defaultAch;
      }),
    };
  } catch {
    return initialState;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota exceeded — ignore
    }
  }, [state]);

  // Auto-update level based on XP
  useEffect(() => {
    const { xp, level } = state.user;
    const thresholds = [0, 200, 500, 1000, 2000, 3500];
    let newLevel = 0;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (xp >= thresholds[i]) { newLevel = i; break; }
    }
    if (newLevel !== level) {
      dispatch({ type: 'SET_USER', payload: { level: newLevel } });
    }
  }, [state.user.xp, state.user.level]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
