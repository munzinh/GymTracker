import type { DailyLog } from '../types/nutrition';
import { getTodayStr, loadGamification, saveGamification } from './storage';

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


