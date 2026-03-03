import type { WorkoutSession } from '../types/workout';

export interface WeeklyVolumeData {
    weekLabel: string;
    totalVolume: number;
}

export interface StrengthProgressionData {
    weekLabel: string;
    bestWeight: number;
    bestVolume: number;
}

export interface PRHighlight {
    exerciseName: string;
    weight: number;
    reps: number;
    date: string;
}

export interface ConsistencyData {
    weekLabel: string;
    completedCount: number;
}

export interface MuscleGroupData {
    group: string;
    volume: number;
    percentage: number;
    color: string;
}

export interface BestExerciseData {
    name: string;
    totalVolume: number;
    growthPercent: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function getISOWeekLabel(dateStr: string): string {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `W${weekNo} ${d.getFullYear().toString().slice(-2)}`;
}

export function calculateGrowthPercent(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

// ─── Analyzers ───────────────────────────────────────────────────────────

export function getWeeklyVolumeData(sessions: WorkoutSession[], weeks: number = 8): WeeklyVolumeData[] {
    const completed = sessions.filter(s => s.status === 'completed');
    const weekMap: Record<string, number> = {};

    completed.forEach(s => {
        const label = getISOWeekLabel(s.date);
        weekMap[label] = (weekMap[label] || 0) + s.totalVolume;
    });

    // Create a sorted array of the last N weeks
    const result: WeeklyVolumeData[] = [];
    const now = new Date();
    for (let i = weeks - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const label = getISOWeekLabel(d.toISOString().split('T')[0]);
        result.push({
            weekLabel: label,
            totalVolume: weekMap[label] || 0
        });
    }
    return result;
}

export function getStrengthProgressionData(sessions: WorkoutSession[], exerciseName: string, weeks: number = 8): StrengthProgressionData[] {
    const completed = sessions.filter(s => s.status === 'completed');
    const weekMap: Record<string, { bestWeight: number, bestVolume: number }> = {};

    completed.forEach(s => {
        const label = getISOWeekLabel(s.date);
        const ex = s.exercises.find(e => e.name === exerciseName);
        if (ex) {
            const maxWeight = Math.max(...ex.sets.map(set => set.weight), 0);
            if (!weekMap[label]) {
                weekMap[label] = { bestWeight: maxWeight, bestVolume: ex.volume };
            } else {
                weekMap[label].bestWeight = Math.max(weekMap[label].bestWeight, maxWeight);
                weekMap[label].bestVolume += ex.volume; // Sum volume for the week if done multiple times
            }
        }
    });

    const result: StrengthProgressionData[] = [];
    const now = new Date();
    for (let i = weeks - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const label = getISOWeekLabel(d.toISOString().split('T')[0]);
        result.push({
            weekLabel: label,
            bestWeight: weekMap[label]?.bestWeight || 0,
            bestVolume: weekMap[label]?.bestVolume || 0
        });
    }
    return result;
}

export function detectAllPRs(sessions: WorkoutSession[]): PRHighlight[] {
    const completed = sessions.filter(s => s.status === 'completed');
    const prMap: Record<string, PRHighlight> = {}; // key: exerciseName

    // Sort ascending by date to track history
    const sorted = [...completed].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(s => {
        s.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                if (set.weight > 0) {
                    const currentPR = prMap[ex.name];
                    if (!currentPR || set.weight >= currentPR.weight) {
                        // If weight is higher, or if weight is same but reps are higher
                        if (!currentPR || set.weight > currentPR.weight || set.reps > currentPR.reps) {
                            prMap[ex.name] = {
                                exerciseName: ex.name,
                                weight: set.weight,
                                reps: set.reps,
                                date: s.date
                            };
                        }
                    }
                }
            });
        });
    });

    return Object.values(prMap).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getConsistencyData(sessions: WorkoutSession[], weeks: number = 8): ConsistencyData[] {
    const result: ConsistencyData[] = [];
    const now = new Date();
    const completed = sessions.filter(s => s.status === 'completed');

    const weekMap: Record<string, number> = {};
    completed.forEach(s => {
        const label = getISOWeekLabel(s.date);
        weekMap[label] = (weekMap[label] || 0) + 1;
    });

    for (let i = weeks - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const label = getISOWeekLabel(d.toISOString().split('T')[0]);
        result.push({
            weekLabel: label,
            completedCount: weekMap[label] || 0
        });
    }
    return result;
}

export function getMuscleGroupDistribution(sessions: WorkoutSession[]): MuscleGroupData[] {
    const completed = sessions.filter(s => s.status === 'completed');

    const groups = [
        { id: 'chest', label: 'Ngực', keywords: ['bench', 'press', 'peck', 'chest', 'ngực', 'push'], color: '#ff4444' },
        { id: 'back', label: 'Lưng xô', keywords: ['lat', 'row', 'pulldown', 'pull', 'lưng', 'xô'], color: '#4444ff' },
        { id: 'shoulders', label: 'Vai', keywords: ['lateral', 'raise', 'shoulder', 'delt', 'vai'], color: '#ffb800' },
        { id: 'arms', label: 'Tay', keywords: ['curl', 'tricep', 'pushdown', 'preacher', 'bicep', 'tay'], color: '#b844ff' },
        { id: 'legs', label: 'Chân', keywords: ['leg', 'squat', 'hip', 'calve', 'adductor', 'thurst', 'extension', 'chân', 'đùi', 'mông'], color: '#00ff88' },
        { id: 'core', label: 'Bụng/Lõi', keywords: ['crunch', 'plank', 'ab', 'core', 'bụng'], color: '#ff44b8' },
        { id: 'other', label: 'Khác', keywords: [], color: '#888888' }
    ];

    const volumeMap: Record<string, number> = {};
    groups.forEach(g => volumeMap[g.id] = 0);
    let totalVol = 0;

    completed.forEach(s => {
        s.exercises.forEach(ex => {
            const nameLower = ex.name.toLowerCase();
            let matched = false;
            for (const group of groups) {
                if (group.keywords.some(k => nameLower.includes(k))) {
                    volumeMap[group.id] += ex.volume;
                    totalVol += ex.volume;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                volumeMap['other'] += ex.volume;
                totalVol += ex.volume;
            }
        });
    });

    if (totalVol === 0) return [];

    return groups.map(g => ({
        group: g.label,
        volume: volumeMap[g.id],
        percentage: (volumeMap[g.id] / totalVol) * 100,
        color: g.color
    })).filter(g => g.volume > 0).sort((a, b) => b.volume - a.volume);
}

export function getBestExercise(sessions: WorkoutSession[]): BestExerciseData | null {
    const completed = sessions.filter(s => s.status === 'completed');
    if (completed.length === 0) return null;

    // We compare recent 4 weeks vs previous 4 weeks
    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const eightWeeksAgo = new Date(now);
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const recentVol: Record<string, number> = {};
    const previousVol: Record<string, number> = {};

    completed.forEach(s => {
        const d = new Date(s.date);
        s.exercises.forEach(ex => {
            if (d >= fourWeeksAgo) {
                recentVol[ex.name] = (recentVol[ex.name] || 0) + ex.volume;
            } else if (d >= eightWeeksAgo && d < fourWeeksAgo) {
                previousVol[ex.name] = (previousVol[ex.name] || 0) + ex.volume;
            }
        });
    });

    let bestGrowth = -Infinity;
    let bestName = '';
    let bestTotalVol = 0;

    for (const name in recentVol) {
        if (previousVol[name] && previousVol[name] > 0) {
            const growth = calculateGrowthPercent(recentVol[name], previousVol[name]);
            if (growth > bestGrowth) {
                bestGrowth = growth;
                bestName = name;
                bestTotalVol = recentVol[name];
            }
        }
    }

    // fallback: if no previous history, just pick the highest volume recent exercise
    if (bestName === '') {
        for (const name in recentVol) {
            if (recentVol[name] > bestTotalVol) {
                bestTotalVol = recentVol[name];
                bestName = name;
                bestGrowth = 100; // "infinite" growth from 0
            }
        }
    }

    if (bestName === '') return null;

    return {
        name: bestName,
        totalVolume: bestTotalVol,
        growthPercent: bestGrowth
    };
}
