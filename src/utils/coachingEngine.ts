import type { DailyLog, WeightLogEntry, AdaptiveSuggestion, UserProfile } from '../types/nutrition';
import { getTodayStr, loadGamification, saveGamification, loadSuggestions, saveSuggestions } from './storage';

// --- GAMIFICATION ---
export const updateDailyStreak = (userId: string, todayLog: DailyLog) => {
    const today = getTodayStr();
    const g = loadGamification(userId);

    if (g.lastLoginDate === today) {
        return; // Already processed today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    if (g.lastLoginDate === yStr && todayLog.dailyTotals.calories > 0) {
        // Logged yesterday, and logged today
        g.currentStreak += 1;
        if (g.currentStreak > g.longestStreak) {
            g.longestStreak = g.currentStreak;
        }
    } else if (todayLog.dailyTotals.calories > 0) {
        // Started new streak
        g.currentStreak = 1;
    } else {
        // Missed yesterday
        g.currentStreak = 0;
    }

    g.lastLoginDate = today;

    // Check Level logic
    if (g.currentStreak >= 30) {
        g.levelTitle = 'Lean Machine';
        g.level = 3;
    } else if (g.currentStreak >= 7) {
        g.levelTitle = 'Cutting Mode';
        g.level = 2;
    } else {
        g.levelTitle = 'Beginner';
        g.level = 1;
    }

    saveGamification(userId, g);
};

export const checkBadges = (userId: string, logs: DailyLog[]) => {
    const g = loadGamification(userId);
    const today = getTodayStr();

    // Custom badge logic: 7 days of hitting protein target
    if (!g.badges.find(b => b.id === 'protein_master_7')) {
        let consecutiveProteinDays = 0;

        // Check last 7 days
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().slice(0, 10);
            const log = logs.find(l => l.date === dStr);
            if (log && log.dailyTotals.protein >= (log.targets.protein * 0.9)) {
                consecutiveProteinDays++;
            } else {
                break;
            }
        }

        if (consecutiveProteinDays >= 7) {
            g.badges.push({
                id: 'protein_master_7',
                name: 'Protein Master',
                description: 'Hit your protein target 7 days in a row.',
                icon: '🥩',
                dateEarned: today
            });
            saveGamification(userId, g);
        }
    }
};

// --- COACHING ENGINE ---

// Helper: Moving average
const calculateAverage = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export const generateCoachingSuggestions = (
    userId: string,
    profile: UserProfile,
    logs: DailyLog[],
    weightLogs: WeightLogEntry[]
) => {
    if (!profile.goal || profile.goal !== 'cut') return; // Coaching focus on cutting for now
    if (weightLogs.length < 14) return; // Need 14 days of data to make fair calls

    const today = getTodayStr();

    // Check if we generated a suggestion recently (coalesce to max 1 per week)
    const existing = loadSuggestions(userId);
    const lastGenerated = existing.length > 0
        ? new Date(existing[existing.length - 1].dateGenerated).getTime()
        : 0;

    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    if (new Date().getTime() - lastGenerated < ONE_WEEK) {
        return; // Don't spam the user
    }

    // Split 14 days into Week 1 (Oldest 7) and Week 2 (Recent 7)
    const sortedWeights = [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last14 = sortedWeights.slice(-14);

    const week1Avg = calculateAverage(last14.slice(0, 7).map(w => w.weight));
    const week2Avg = calculateAverage(last14.slice(7, 14).map(w => w.weight));

    const weightLost = week1Avg - week2Avg;
    const bodyWeightScore = (weightLost / week1Avg) * 100; // Percentage of BW lost

    let newSuggestion: AdaptiveSuggestion | null = null;

    if (weightLost <= 0) {
        // Plateau detected
        newSuggestion = {
            id: Date.now().toString(),
            type: 'decrease_calories',
            title: 'Weight Loss Plateau Detected',
            message: `Your average weight hasn't dropped over the last 14 days. It looks like your metabolism has adapted. Let's try dropping calories by 100-150 kcal.`,
            actionLabel: 'Update Macro Targets',
            actionPayload: -100,
            dateGenerated: today,
            status: 'new'
        };
    } else if (bodyWeightScore > 1.2) {
        // Losing too fast (>1.2% BW per week risking muscle loss)
        newSuggestion = {
            id: Date.now().toString(),
            type: 'increase_calories',
            title: 'Losing Weight Too Fast!',
            message: `You've lost over 1% of your body weight on average this week. To preserve muscle mass, we highly recommend bumping your calories up by 100 kcal.`,
            actionLabel: 'Update Macro Targets',
            actionPayload: 100,
            dateGenerated: today,
            status: 'new'
        };
    }

    // Check Protein Compliance for the last 7 days
    if (!newSuggestion) {
        const last7Logs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
        let protSum = 0;
        let pTargetSum = 0;
        last7Logs.forEach(l => {
            if (l.dailyTotals.calories > 0) {
                protSum += l.dailyTotals.protein;
                pTargetSum += l.targets.protein;
            }
        });

        if (pTargetSum > 0 && (protSum / pTargetSum) < 0.85) {
            newSuggestion = {
                id: Date.now().toString(),
                type: 'increase_protein',
                title: 'Protein Target Missed (Weekly)',
                message: `Over the last week, your protein intake is under 85% of your target. High protein is critical on a cut to maintain muscle mass!`,
                dateGenerated: today,
                status: 'new'
            };
        }
    }

    if (newSuggestion) {
        saveSuggestions(userId, [...existing, newSuggestion]);
    }
};
