import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type {
  AppState, AppAction, CarbonBaseline, EmissionBreakdown, ToastNotification
} from '../types';
import {
  DEFAULT_ACTIONS, DEFAULT_ACHIEVEMENTS, calculateCarbonScore, generateMonthlyData
} from '../data/emissionData';

const STORAGE_KEY = 'ecotrack-v3';
const DB_KEY = 'ecotrack-users-db';

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
    email: undefined,
    isAuthenticated: false,
    setupComplete: false,
    carbonScore: calculateCarbonScore(DEFAULT_EMISSIONS.total),
    level: 0,
    xp: 25,
    streak: 0,
    lastLogDate: null,
    joinDate: new Date().toISOString(),
    totalCO2Saved: 0,
    totalOffsetKg: 0,
    streakShields: 0,
    shieldLastEarned: null,
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
  toasts: [],
  showConfetti: false,
  pendingLevelUp: null,
};

function makeToast(
  type: ToastNotification['type'],
  title: string,
  message: string,
  icon: string,
  rarity?: ToastNotification['rarity'],
): ToastNotification {
  return { id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`, type, title, message, icon, rarity };
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...action.payload, toasts: [], showConfetti: false, pendingLevelUp: null };

    case 'LOGOUT':
      return { ...initialState, user: { ...initialState.user, joinDate: new Date().toISOString() } };

    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };

    case 'COMPLETE_SETUP': {
      const { baseline, emissions } = action.payload;
      const score = calculateCarbonScore(emissions.total);
      const monthlyData = generateMonthlyData(emissions.total);
      const setupToast = makeToast('info', '🧮 Footprint Calculated!', `Your carbon score is ${score}/1000`, '📊');
      return {
        ...state,
        baseline,
        emissions,
        monthlyData,
        showConfetti: true,
        user: {
          ...state.user,
          setupComplete: true,
          carbonScore: score,
          xp: state.user.xp + 100,
        },
        toasts: [...state.toasts, setupToast],
      };
    }

    case 'ADD_ACTIVITY': {
      const activity = action.payload;
      const today = new Date().toDateString();
      const lastLog = state.user.lastLogDate ? new Date(state.user.lastLogDate).toDateString() : null;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const isNewDay = lastLog !== today;
      const newStreak = lastLog === today
        ? state.user.streak
        : lastLog === yesterday
          ? state.user.streak + 1
          : 1;

      const missedDay = lastLog && lastLog !== today && lastLog !== yesterday;
      const hasShield = state.user.streakShields > 0;
      const streakAfterShield = missedDay && hasShield ? state.user.streak : newStreak;
      const shieldsAfter = missedDay && hasShield ? state.user.streakShields - 1 : state.user.streakShields;

      const lastEarned = state.user.shieldLastEarned ? new Date(state.user.shieldLastEarned).toDateString() : null;
      const shieldEarned = isNewDay && streakAfterShield > 0 && streakAfterShield % 7 === 0 && lastEarned !== today;
      const newShields = shieldEarned ? shieldsAfter + 1 : shieldsAfter;

      const activityToast = makeToast(
        'info',
        `${activity.icon} Activity Logged!`,
        `${activity.description} • +${activity.points} XP`,
        activity.icon,
      );

      const streakToast = (isNewDay && streakAfterShield >= 3)
        ? makeToast('streak', '🔥 Streak Extended!', `You're on a ${streakAfterShield}-day streak! Keep it going!`, '🔥')
        : null;

      const shieldToast = shieldEarned
        ? makeToast('milestone', '🛡️ Streak Shield Earned!', `${newShields} shield${newShields > 1 ? 's' : ''} protect your streak`, '🛡️')
        : null;

      const newToasts = [
        ...state.toasts,
        activityToast,
        ...(streakToast ? [streakToast] : []),
        ...(shieldToast ? [shieldToast] : []),
      ];

      return {
        ...state,
        activities: [activity, ...state.activities],
        user: {
          ...state.user,
          xp: state.user.xp + activity.points,
          streak: streakAfterShield,
          lastLogDate: new Date().toISOString(),
          totalCO2Saved: state.user.totalCO2Saved + Math.abs(Math.min(activity.co2Impact, 0)),
          streakShields: newShields,
          shieldLastEarned: shieldEarned ? new Date().toISOString() : state.user.shieldLastEarned,
        },
        weeklyChallenge: {
          ...state.weeklyChallenge,
          current: Math.min(state.weeklyChallenge.current + 1, state.weeklyChallenge.target),
        },
        toasts: newToasts,
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
      const offsetToast = makeToast(
        'milestone',
        '🌍 Carbon Offset!',
        `You offset ${purchase.tonnes}t via ${purchase.projectName}`,
        '🌳',
      );
      return {
        ...state,
        offsetPurchases: [purchase, ...state.offsetPurchases],
        user: { ...state.user, totalOffsetKg: newOffsetKg, xp: state.user.xp + 30 },
        toasts: [...state.toasts, offsetToast],
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

      const target = state.achievements.find(a => a.id === action.payload);
      if (!target || target.unlocked) return state;

      const now = new Date().toISOString();
      const achievements = state.achievements.map(a =>
        a.id === action.payload ? { ...a, unlocked: true, unlockedDate: now } : a
      );

      const rarityEmojis: Record<string, string> = {
        common: '🟢', rare: '🔵', epic: '🟣', legendary: '🟡'
      };

      const achToast = makeToast(
        'achievement',
        `${target.icon} Achievement Unlocked!`,
        `${target.title} — ${target.description}`,
        target.icon,
        target.rarity,
      );

      const isLegendary = target.rarity === 'legendary' || target.rarity === 'epic';

      return {
        ...state,
        achievements,
        user: { ...state.user, xp: state.user.xp + target.points },
        toasts: [...state.toasts, achToast],
        showConfetti: isLegendary ? true : state.showConfetti,
      };
    }

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    case 'CLEAR_CONFETTI':
      return { ...state, showConfetti: false };

    case 'CLEAR_LEVEL_UP':
      return { ...state, pendingLevelUp: null };

    case 'USE_STREAK_SHIELD':
      return {
        ...state,
        user: { ...state.user, streakShields: Math.max(0, state.user.streakShields - 1) },
      };

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
    if (typeof saved !== 'object' || saved === null || Array.isArray(saved)) return initialState;

    const savedUser = typeof saved.user === 'object' && saved.user !== null ? (saved.user as any) : {};

    return {
      ...initialState,
      ...saved,

      toasts: [],
      showConfetti: false,
      pendingLevelUp: null,
      user: {
        ...initialState.user,
        ...savedUser,
        streakShields: savedUser.streakShields ?? 0,
        shieldLastEarned: savedUser.shieldLastEarned ?? null,
      },
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
  const prevLevelRef = useRef(state.user.level);
  const prevXpRef = useRef(state.user.xp);

  useEffect(() => {
    try {
      const { toasts: _, showConfetti: __, pendingLevelUp: ___, ...persistable } = state;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));

      if (state.user.isAuthenticated && state.user.email) {
        const rawDb = localStorage.getItem(DB_KEY);
        const db = rawDb ? JSON.parse(rawDb) : {};

        if (db[state.user.email]) {
          db[state.user.email].state = persistable;
        } else {

          db[state.user.email] = { password: '', state: persistable };
        }
        localStorage.setItem(DB_KEY, JSON.stringify(db));
      }
    } catch {

    }
  }, [state]);

  useEffect(() => {
    const { xp, level } = state.user;
    const thresholds = [0, 200, 500, 1000, 2000, 3500];
    let newLevel = 0;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (xp >= thresholds[i]) { newLevel = i; break; }
    }
    if (newLevel !== level) {
      const prevLevel = prevLevelRef.current;
      dispatch({ type: 'SET_USER', payload: { level: newLevel } });
      if (newLevel > prevLevel) {

        dispatch({
          type: 'ADD_TOAST',
          payload: makeToast('levelup', `🎉 Level Up! Level ${newLevel}`, 'You reached a new level — amazing!', '⬆️'),
        });
        dispatch({ type: 'CLEAR_CONFETTI' });
        setTimeout(() => dispatch({ type: 'SET_USER', payload: { level: newLevel } }), 0);
      }
      prevLevelRef.current = newLevel;
    }
    prevXpRef.current = xp;
  }, [state.user.xp, state.user.level]);

  useEffect(() => {
    const { user, activities, actions, achievements } = state;
    const isUnlocked = (id: string) => achievements.find(a => a.id === id)?.unlocked ?? false;

    if (user.streak >= 3 && !isUnlocked('ach3'))
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach3' });
    if (user.streak >= 7 && !isUnlocked('ach4'))
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach4' });
    if (user.streak >= 30 && !isUnlocked('ach5'))
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach5' });

    if (user.carbonScore >= 700 && !isUnlocked('ach9'))
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach9' });
    if (user.carbonScore >= 900 && !isUnlocked('ach10'))
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach10' });

    const committedSavings = actions.filter(a => a.committed).reduce((s, a) => s + a.co2SavedPerYear, 0);
    if (committedSavings >= 1000 && !isUnlocked('ach13'))
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ach13' });
  }, [state.user.streak, state.user.carbonScore, state.actions]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
