import type {
    UserProfile,
    DailyLog,
    WeightLogEntry,
    AdaptiveSuggestion,
    GamificationState,
} from '../types/nutrition';

// Utility to get today's date in YYYY-MM-DD
export const getTodayStr = () => new Date().toISOString().slice(0, 10);

const PREFIX = 'fitness_coach_';

const getStorageKey = (userId: string, key: string) => `${PREFIX}${userId}_${key}`;

// --- Profile ---
export const loadProfile = (userId: string): UserProfile | null => {
    const data = localStorage.getItem(getStorageKey(userId, 'profile'));
    return data ? JSON.parse(data) : null;
};

export const saveProfile = (userId: string, profile: UserProfile) => {
    localStorage.setItem(getStorageKey(userId, 'profile'), JSON.stringify(profile));
};

// --- Daily Logs ---
export const loadDailyLogs = (userId: string): DailyLog[] => {
    const data = localStorage.getItem(getStorageKey(userId, 'daily_logs'));
    return data ? JSON.parse(data) : [];
};

export const saveDailyLogs = (userId: string, logs: DailyLog[]) => {
    localStorage.setItem(getStorageKey(userId, 'daily_logs'), JSON.stringify(logs));
};

export const getDailyLog = (userId: string, date: string): DailyLog | null => {
    const logs = loadDailyLogs(userId);
    return logs.find(l => l.date === date) || null;
};

export const saveDailyLog = (userId: string, log: DailyLog) => {
    const logs = loadDailyLogs(userId);
    const updated = [...logs.filter(l => l.date !== log.date), log];
    saveDailyLogs(userId, updated);
};

// Default empty daily log
export const createEmptyDailyLog = (userId: string, date: string): DailyLog => {
    return {
        id: date,
        userId,
        date,
        meals: {
            breakfast: { id: 'breakfast', name: 'Bữa sáng', items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
            lunch: { id: 'lunch', name: 'Bữa trưa', items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
            dinner: { id: 'dinner', name: 'Bữa tối', items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
            snack: { id: 'snack', name: 'Bữa phụ', items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
        },
        dailyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        targets: { calories: 0, protein: 0, carbs: 0, fat: 0 } // Should be populated on UI layer based on Profile
    };
};

// --- Weight Logs ---
export const loadWeightLogs = (userId: string): WeightLogEntry[] => {
    const data = localStorage.getItem(getStorageKey(userId, 'weight_logs'));
    return data ? JSON.parse(data) : [];
};

export const saveWeightLogs = (userId: string, logs: WeightLogEntry[]) => {
    localStorage.setItem(getStorageKey(userId, 'weight_logs'), JSON.stringify(logs));
};

export const addWeightLog = (userId: string, date: string, weight: number, bodyFatPercentage?: number) => {
    const logs = loadWeightLogs(userId);
    const existingIndex = logs.findIndex(l => l.date === date);
    if (existingIndex >= 0) {
        logs[existingIndex] = { date, weight, bodyFatPercentage };
    } else {
        logs.push({ date, weight, bodyFatPercentage });
        logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    saveWeightLogs(userId, logs);

    // Also update Profile current weight
    const profile = loadProfile(userId);
    if (profile) {
        saveProfile(userId, { ...profile, weight, bodyFatPercentage });
    }
};

// --- Adaptive Suggestions ---
export const loadSuggestions = (userId: string): AdaptiveSuggestion[] => {
    const data = localStorage.getItem(getStorageKey(userId, 'suggestions'));
    return data ? JSON.parse(data) : [];
};

export const saveSuggestions = (userId: string, suggestions: AdaptiveSuggestion[]) => {
    localStorage.setItem(getStorageKey(userId, 'suggestions'), JSON.stringify(suggestions));
};

export const markSuggestionRead = (userId: string, suggestionId: string) => {
    const s = loadSuggestions(userId);
    const updated = s.map(x => x.id === suggestionId ? { ...x, status: 'read' as const } : x);
    saveSuggestions(userId, updated);
};

// --- Gamification ---
export const loadGamification = (userId: string): GamificationState => {
    const defaultState: GamificationState = {
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        levelTitle: 'Beginner',
        badges: [],
        lastLoginDate: ''
    };
    const data = localStorage.getItem(getStorageKey(userId, 'gamification'));
    return data ? JSON.parse(data) : defaultState;
};

export const saveGamification = (userId: string, state: GamificationState) => {
    localStorage.setItem(getStorageKey(userId, 'gamification'), JSON.stringify(state));
};
