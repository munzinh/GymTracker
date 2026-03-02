import type { AdherenceWarning } from '../data/models';

export interface WeeklyWorkoutSummary {
    week: string;
    totalTonnage: number;
}

export function analyzeWorkoutPerformance(weeklyWorkouts: WeeklyWorkoutSummary[]): {
    volumeTrend: 'up' | 'down' | 'flat',
    warnings: AdherenceWarning[]
} {
    const warnings: AdherenceWarning[] = [];

    if (weeklyWorkouts.length < 2) {
        return { volumeTrend: 'flat', warnings };
    }

    // Assume array is chronological
    const thisWeekVol = weeklyWorkouts[weeklyWorkouts.length - 1].totalTonnage;
    const lastWeekVol = weeklyWorkouts[weeklyWorkouts.length - 2].totalTonnage;

    if (lastWeekVol === 0) return { volumeTrend: 'up', warnings };

    const dropRatio = thisWeekVol / lastWeekVol;

    if (dropRatio < 0.8) {
        warnings.push({
            severity: 'high',
            type: 'overtraining',
            message: 'Tập luyện: Volume giảm mạnh (>20%) so với tuần trước. Có dấu hiệu High CNS Fatigue. Đề xuất: Giảm tải nghỉ ngơi (Deload tuần này).'
        });
    }

    return {
        volumeTrend: dropRatio > 1.05 ? 'up' : dropRatio < 0.95 ? 'down' : 'flat',
        warnings
    };
}
