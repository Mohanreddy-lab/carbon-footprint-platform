export type CarType = 'none' | 'electric' | 'hybrid' | 'gasoline' | 'diesel';
export type DietType = 'vegan' | 'vegetarian' | 'flexitarian' | 'omnivore' | 'heavy-meat';
export type ShoppingLevel = 'minimal' | 'average' | 'frequent';
export type FoodWasteLevel = 'low' | 'medium' | 'high';
export type ActionDifficulty = 'easy' | 'medium' | 'hard';
export type ActivityCategory = 'transport' | 'food' | 'energy' | 'shopping' | 'flights' | 'other';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type NewsCategory = 'policy' | 'tech' | 'science' | 'tips';
export type Page = 'dashboard' | 'calculator' | 'tracker' | 'actions' | 'community' | 'profile';
export type ToastType = 'achievement' | 'levelup' | 'streak' | 'info' | 'milestone';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  icon: string;
  rarity?: AchievementRarity;
  duration?: number; // ms, default 4000
}

export interface UserProfile {
  name: string;
  email?: string;
  isAuthenticated: boolean;
  setupComplete: boolean;
  carbonScore: number;
  level: number;
  xp: number;
  streak: number;
  lastLogDate: string | null;
  joinDate: string;
  totalCO2Saved: number;
  totalOffsetKg: number;
  streakShields: number;      // shields earned every 7 days
  shieldLastEarned: string | null; // ISO date of last shield earned
}

export interface CarbonBaseline {
  transport: {
    carMilesPerWeek: number;
    carType: CarType;
    publicTransitMilesPerWeek: number;
    bikeMilesPerWeek: number;
  };
  home: {
    electricityKwhPerMonth: number;
    gasKwhPerMonth: number;
    renewablePercentage: number;
    householdSize: number;
  };
  food: {
    dietType: DietType;
    foodWasteLevel: FoodWasteLevel;
    localFoodPercentage: number;
  };
  shopping: {
    clothingItemsPerYear: number;
    electronicsPerYear: number;
    shoppingLevel: ShoppingLevel;
  };
  flights: {
    shortHaulPerYear: number;
    mediumHaulPerYear: number;
    longHaulPerYear: number;
  };
}

export interface EmissionBreakdown {
  transport: number;
  home: number;
  food: number;
  shopping: number;
  flights: number;
  total: number;
}

export interface Activity {
  id: string;
  date: string;
  category: ActivityCategory;
  description: string;
  co2Impact: number;
  icon: string;
  points: number;
}

export interface CarbonAction {
  id: string;
  title: string;
  description: string;
  category: string;
  co2SavedPerYear: number;
  difficulty: ActionDifficulty;
  timeToImplement: string;
  committed: boolean;
  completedDate?: string;
  tips: string[];
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  points: number;
  unlocked: boolean;
  unlockedDate?: string;
  category: string;
}

export interface MonthlyData {
  month: string;
  emissions: number;
  target: number;
}

export interface OffsetProject {
  id: string;
  name: string;
  description: string;
  location: string;
  costPerTonne: number;
  availableTonnes: number;
  icon: string;
  sdgs: number[];
  category: string;
}

export interface OffsetPurchase {
  id: string;
  projectId: string;
  projectName: string;
  tonnes: number;
  cost: number;
  date: string;
  icon: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  location: string;
  score: number;
  level: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  date: string;
  readingTime: number;
  source: string;
  saved: boolean;
  tags: string[];
}

export interface AppState {
  user: UserProfile;
  baseline: CarbonBaseline | null;
  emissions: EmissionBreakdown | null;
  activities: Activity[];
  actions: CarbonAction[];
  achievements: Achievement[];
  monthlyData: MonthlyData[];
  offsetPurchases: OffsetPurchase[];
  savedArticles: string[];
  weeklyChallenge: {
    goal: string;
    current: number;
    target: number;
  };
  toasts: ToastNotification[];
  showConfetti: boolean;
  pendingLevelUp: { from: number; to: number } | null;
}

export type AppAction =
  | { type: 'LOGIN'; payload: AppState }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: Partial<UserProfile> }
  | { type: 'COMPLETE_SETUP'; payload: { baseline: CarbonBaseline; emissions: EmissionBreakdown } }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'TOGGLE_ACTION'; payload: string }
  | { type: 'COMPLETE_ACTION'; payload: string }
  | { type: 'ADD_OFFSET'; payload: OffsetPurchase }
  | { type: 'TOGGLE_SAVED_ARTICLE'; payload: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'ADD_TOAST'; payload: ToastNotification }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLEAR_CONFETTI' }
  | { type: 'CLEAR_LEVEL_UP' }
  | { type: 'USE_STREAK_SHIELD' }
  | { type: 'RESET_DATA' };
