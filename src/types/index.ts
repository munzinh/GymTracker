export interface DailyLog {
    id: string;
    date: string; // YYYY-MM-DD
    weight: number;
    calories: number;
    protein: number;
    cardioMinutes: number;
    steps?: number;
    notes?: string;
}

export interface WeeklyCheck {
    id: string;
    weekStart: string; // YYYY-MM-DD (start of week)
    waist?: number;
    bodyFat?: number;
    photoUrl?: string;
}

export interface StrengthLog {
    id: string;
    date: string; // YYYY-MM-DD
    exercise: string;
    sets: number;
    reps: number;
    weightKg: number;
}

export interface GoalSettings {
    targetBodyFat: number;
    deadlineWeeks: number;
    startWeight: number;
    startBodyFat: number;
    tdee: number;
}

export interface AppData {
    dailyLogs: DailyLog[];
    weeklyChecks: WeeklyCheck[];
    strengthLogs: StrengthLog[];
    goals: GoalSettings;
}

export type TabId = 'dashboard' | 'tracking' | 'strength' | 'progress' | 'goals' | 'calculator';
