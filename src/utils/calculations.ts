import type { DailyLog, WeeklyCheck, StrengthLog } from '../types';
import { parseISO } from 'date-fns';

// ─── Tính trung bình cân nặng 7 ngày gần nhất ─────────────────────────────────
export function getWeeklyAvgWeight(logs: DailyLog[]): number | null {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const recent = logs.filter(l => {
        const d = parseISO(l.date);
        return d >= weekAgo && d <= now;
    });

    if (recent.length === 0) return null;
    return recent.reduce((s, l) => s + l.weight, 0) / recent.length;
}

// ─── Tính trung bình cân nặng theo tuần (7 ngày) ─────────────────────────────
export function getWeeklyWeightChange(logs: DailyLog[]): number | null {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeek = logs.filter(l => {
        const d = parseISO(l.date);
        return d >= weekAgo && d <= now;
    });
    const lastWeek = logs.filter(l => {
        const d = parseISO(l.date);
        return d >= twoWeeksAgo && d < weekAgo;
    });

    if (thisWeek.length === 0 || lastWeek.length === 0) return null;

    const avg = (arr: DailyLog[]) => arr.reduce((s, l) => s + l.weight, 0) / arr.length;
    return avg(thisWeek) - avg(lastWeek);
}

// ─── Lean Mass (kg) ───────────────────────────────────────────────────────────
export function getLeanMass(weight: number, bodyFatPercent: number): number {
    return weight * (1 - bodyFatPercent / 100);
}

// ─── Protein target (g) ───────────────────────────────────────────────────────
export function getProteinTarget(leanMass: number): number {
    return Math.round(leanMass * 2.2);
}

// ─── Fat target (g) ───────────────────────────────────────────────────────────
export function getFatTarget(weight: number): number {
    return Math.round(weight * 0.8);
}

// ─── Calories target ─────────────────────────────────────────────────────────
export function getCaloriesTarget(tdee: number): number {
    return Math.round(tdee - 400);
}

// ─── Cân nặng mục tiêu ────────────────────────────────────────────────────────
export function getTargetWeight(
    currentWeight: number,
    currentBF: number,
    targetBF: number
): number {
    const leanMass = getLeanMass(currentWeight, currentBF);
    return Math.round((leanMass / (1 - targetBF / 100)) * 10) / 10;
}

// ─── Dự đoán thời gian ────────────────────────────────────────────────────────
export function getPredictedWeeks(
    currentWeight: number,
    targetWeight: number,
    weeklyRate = 0.5
): number {
    return Math.ceil(Math.abs(currentWeight - targetWeight) / weeklyRate);
}

// ─── Cảnh báo giảm quá nhanh ─────────────────────────────────────────────────
export function checkFastLoss(weeklyChange: number | null): boolean {
    return weeklyChange !== null && weeklyChange < -0.8;
}

// ─── Cảnh báo không giảm 2 tuần ─────────────────────────────────────────────
export function checkStall(logs: DailyLog[]): boolean {
    const now = new Date();
    const week1Start = new Date(now); week1Start.setDate(now.getDate() - 7);
    const week2Start = new Date(now); week2Start.setDate(now.getDate() - 14);

    const thisWeek = logs.filter(l => { const d = parseISO(l.date); return d >= week1Start; });
    const lastWeek = logs.filter(l => { const d = parseISO(l.date); return d >= week2Start && d < week1Start; });
    const prevWeek = logs.filter(l => { const d = parseISO(l.date); const w3 = new Date(now); w3.setDate(now.getDate() - 21); return d >= w3 && d < week2Start; });

    if (thisWeek.length === 0 || lastWeek.length === 0 || prevWeek.length === 0) return false;
    const avg = (arr: DailyLog[]) => arr.reduce((s, l) => s + l.weight, 0) / arr.length;
    const w1 = avg(thisWeek), w2 = avg(lastWeek), w3 = avg(prevWeek);

    return Math.abs(w1 - w2) < 0.1 && Math.abs(w2 - w3) < 0.1;
}

// ─── Progress Score (0–100) ──────────────────────────────────────────────────
export interface ScoreBreakdown {
    total: number;
    calories: number;
    protein: number;
    trend: number;
    cardio: number;
}

export function calcProgressScore(
    logs: DailyLog[],
    caloriesTarget: number,
    proteinTarget: number,
    weeklyChange: number | null
): ScoreBreakdown {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const recent = logs.filter(l => {
        const d = parseISO(l.date);
        return d >= weekAgo && d <= now;
    });

    if (recent.length === 0) return { total: 0, calories: 0, protein: 0, trend: 0, cardio: 0 };

    // Calories compliance (±100)
    const calScore = Math.round(
        (recent.filter(l => Math.abs(l.calories - caloriesTarget) <= 100).length / recent.length) * 25
    );

    // Protein ≥ target
    const proteinScore = Math.round(
        (recent.filter(l => l.protein >= proteinTarget).length / recent.length) * 25
    );

    // Weight trend −0.3 to −0.8 kg/wk
    let trendScore = 0;
    if (weeklyChange !== null) {
        if (weeklyChange >= -0.8 && weeklyChange <= -0.3) trendScore = 30;
        else if (weeklyChange < -0.1) trendScore = 15;
    }

    // Cardio ≥ 3 sessions/week (>0 minutes)
    const cardioSessions = recent.filter(l => l.cardioMinutes > 0).length;
    const cardioScore = cardioSessions >= 3 ? 20 : Math.round((cardioSessions / 3) * 20);

    const total = calScore + proteinScore + trendScore + cardioScore;
    return { total, calories: calScore, protein: proteinScore, trend: trendScore, cardio: cardioScore };
}

// ─── Strength comparison: % change vs tuần trước ────────────────────────────
export function getStrengthChange(
    logs: StrengthLog[],
    exercise: string
): { thisWeek: number | null; lastWeek: number | null; change: number | null } {
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeekLogs = logs.filter(l => {
        const d = parseISO(l.date);
        return l.exercise === exercise && d >= weekAgo && d <= now;
    });
    const lastWeekLogs = logs.filter(l => {
        const d = parseISO(l.date);
        return l.exercise === exercise && d >= twoWeeksAgo && d < weekAgo;
    });

    const bestKg = (arr: StrengthLog[]) => arr.length === 0 ? null :
        Math.max(...arr.map(l => l.weightKg));

    const tw = bestKg(thisWeekLogs);
    const lw = bestKg(lastWeekLogs);
    const change = tw !== null && lw !== null && lw > 0
        ? ((tw - lw) / lw) * 100
        : null;

    return { thisWeek: tw, lastWeek: lw, change };
}

// ─── Chart data: cân nặng theo ngày ─────────────────────────────────────────
export function getWeightChartData(logs: DailyLog[]) {
    return [...logs]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30)
        .map(l => ({ ngay: l.date.slice(5), canNang: l.weight }));
}

// ─── Chart data: bodyfat theo tuần ──────────────────────────────────────────
export function getBFChartData(checks: WeeklyCheck[]) {
    return [...checks]
        .filter(c => c.bodyFat !== undefined)
        .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
        .map(c => ({
            tuan: `T${c.weekStart.slice(5, 7)}/${c.weekStart.slice(8, 10)}`,
            bodyFat: c.bodyFat
        }));
}

// ─── Lấy body fat mới nhất ───────────────────────────────────────────────────
export function getLatestBodyFat(checks: WeeklyCheck[]): number | null {
    const withBF = checks.filter(c => c.bodyFat !== undefined);
    if (withBF.length === 0) return null;
    withBF.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
    return withBF[0].bodyFat ?? null;
}

// ─── Lấy cân nặng mới nhất ───────────────────────────────────────────────────
export function getLatestWeight(logs: DailyLog[]): number | null {
    if (logs.length === 0) return null;
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0].weight;
}

// ─── Export CSV ──────────────────────────────────────────────────────────────
export function exportToCSV(logs: DailyLog[]): void {
    const headers = ['Ngày', 'Cân nặng (kg)', 'Calories', 'Protein (g)', 'Cardio (phút)', 'Bước chân', 'Ghi chú'];
    const rows = logs
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(l => [l.date, l.weight, l.calories, l.protein, l.cardioMinutes, l.steps ?? '', l.notes ?? '']);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cut-lean-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
