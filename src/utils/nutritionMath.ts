import type { UserProfile, MacroSummary } from '../types/nutrition';
import type { FoodItem } from '../components/Calculator/foodDatabase';

const ACTIVITY_MAP = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
};

const GOALS_MAP = {
    cut: { deficitPct: -0.20, proteinFactor: 2.2, fatPct: 0.25 },
    maintain: { deficitPct: 0, proteinFactor: 1.8, fatPct: 0.27 },
    bulk: { deficitPct: +0.15, proteinFactor: 1.9, fatPct: 0.28 },
};

export function calcBMI(w: number, h: number) {
    if (!w || !h) return 0;
    return Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
}

export function calcTDEE(profile: UserProfile): number {
    const { weight: w, height: h, age, sex, activityLevel } = profile;
    if (!w || !h || !age) return 0;

    const bmr = sex === 'male'
        ? 10 * w + 6.25 * h - 5 * age + 5
        : 10 * w + 6.25 * h - 5 * age - 161;

    const actMult = ACTIVITY_MAP[activityLevel] || 1.55;
    return Math.round(bmr * actMult);
}

export function calcMacroTargets(profile: UserProfile): MacroSummary {
    const tdee = calcTDEE(profile);
    if (!tdee) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const goalParams = GOALS_MAP[profile.goal] || GOALS_MAP['maintain'];

    const calories = Math.round(tdee * (1 + goalParams.deficitPct));

    // New Formula based on Body Fat %
    const bodyFat = profile.bodyFatPercentage || 20; // Default to >15% if unknown

    // Daily Protein: 2.0g/kg if BF < 15%, else 1.7g/kg
    const proteinFactor = bodyFat < 15 ? 2.0 : 1.7;
    const protein = Math.round(profile.weight * proteinFactor);

    // Daily Fat: 0.6g/kg
    const fat = Math.round(profile.weight * 0.6);

    // Daily Carbs based on remaining calories
    // 1 Protein = 4 cal, 1 Fat = 9 cal, 1 Carb = 4 cal
    const proteinCal = protein * 4;
    const fatCal = fat * 9;
    const carbs = Math.round((calories - proteinCal - fatCal) / 4);

    return {
        calories,
        protein: Math.max(0, protein),
        carbs: Math.max(0, carbs),
        fat: Math.max(0, fat)
    };
}

export function calcNutrition(food: FoodItem, grams: number): MacroSummary {
    const r = grams / 100;
    return {
        calories: Math.round(food.per100g.calories * r),
        protein: Math.round(food.per100g.protein * r * 10) / 10,
        carbs: Math.round(food.per100g.carbs * r * 10) / 10,
        fat: Math.round(food.per100g.fat * r * 10) / 10,
    };
}
