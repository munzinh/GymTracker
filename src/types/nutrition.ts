// Core Data Models for Premium Nutrition Coaching System

export type GoalType = 'cut' | 'maintain' | 'bulk';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Sex = 'male' | 'female';
export type MealSlotId = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
    id: string; // usually userId
    weight: number; // kg
    height: number; // cm
    age: number;
    sex: Sex;
    activityLevel: ActivityLevel;
    goal: GoalType;
    bodyFatPercentage?: number;
    leanMass?: number;
    waist?: number; // cm
    hip?: number; // cm
    muscleMass?: number; // kg
    createdAt: string;
    updatedAt: string;
}

export interface MacroSummary {
    calories: number;
    protein: number; // grams
    carbs: number;   // grams
    fat: number;     // grams
}

export interface MealItem {
    id: string; // unique entry id
    foodId: string; // reference to food Database
    name: string; // caching the name for quick display
    grams: number;
    macros: MacroSummary; // cached calculated macros for this amount
}

export interface MealSlot {
    id: MealSlotId;
    name: string;
    items: MealItem[];
    totals: MacroSummary;
}

export interface DailyLog {
    id: string; // usually date string YYYY-MM-DD
    userId: string;
    date: string;
    meals: Record<MealSlotId, MealSlot>;
    dailyTotals: MacroSummary;
    targets: MacroSummary; // What the targets were for this specific day
    waterIntake?: number; // ml
    isRefeedDay?: boolean;
    notes?: string;
}

export interface WeightLogEntry {
    date: string; // YYYY-MM-DD
    weight: number;
    bodyFatPercentage?: number;
    waist?: number;
    hip?: number;
    muscleMass?: number;
}

export interface WeeklyAnalytics {
    startDate: string;
    endDate: string;
    averageCalories: number;
    averageProtein: number;
    averageWeight: number;
    weeklyDeficit: number; // Estimated deficit in kcal
    predictedFatLoss: number; // Estimated fat loss in kg
    complianceScore: number; // 0-100 based on hitting targets
}

export interface AdaptiveSuggestion {
    id: string;
    type: 'decrease_calories' | 'increase_calories' | 'increase_protein' | 'general' | 'warning';
    title: string;
    message: string;
    actionLabel?: string;
    actionPayload?: any; // e.g., suggested new target
    dateGenerated: string;
    status: 'new' | 'read' | 'applied' | 'dismissed';
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    dateEarned: string;
}

export interface GamificationState {
    currentStreak: number;
    longestStreak: number;
    level: number;
    levelTitle: string; // e.g., 'Beginner', 'Cutting Mode', 'Lean Machine'
    badges: Badge[];
    lastLoginDate: string;
}
