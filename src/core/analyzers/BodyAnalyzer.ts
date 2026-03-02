import type { BodyMetrics, TrendAnalysis } from '../data/models';

export function analyzeBodyTrends(logs: BodyMetrics[]): TrendAnalysis {
    if (logs.length < 2) {
        return {
            weightTrend: 'stable',
            muscleTrend: 'stable',
            fatTrend: 'stable',
            daysAnalyzed: 0,
            diffs: {
                weight: 0,
                muscle: 0,
                fat: 0
            }
        };
    }

    // Sort logs by date ascending
    const sorted = [...logs].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

    // Analyze the window between oldest and newest
    const oldLog = sorted[0];
    const newLog = sorted[sorted.length - 1];

    const wDiff = newLog.weight - oldLog.weight;
    const mDiff = (newLog.muscleMass || 0) - (oldLog.muscleMass || 0);
    const fDiff = (newLog.bodyFatPercentage || 0) - (oldLog.bodyFatPercentage || 0);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysAnalyzed = Math.round((new Date(newLog.recordedAt).getTime() - new Date(oldLog.recordedAt).getTime()) / msPerDay) || 1;

    return {
        weightTrend: wDiff > 0.5 ? 'increasing' : wDiff < -0.5 ? 'decreasing' : 'stable',
        muscleTrend: mDiff > 0.2 ? 'increasing' : mDiff < -0.2 ? 'decreasing' : 'stable',
        fatTrend: fDiff > 0.5 ? 'increasing' : fDiff < -0.5 ? 'decreasing' : 'stable',
        daysAnalyzed,
        diffs: {
            weight: wDiff,
            muscle: mDiff,
            fat: (newLog.weight * (newLog.bodyFatPercentage || 0) / 100) - (oldLog.weight * (oldLog.bodyFatPercentage || 0) / 100),
            segmental: {
                leftArmMuscle: (newLog.leftArmMuscle || 0) - (oldLog.leftArmMuscle || 0),
                rightArmMuscle: (newLog.rightArmMuscle || 0) - (oldLog.rightArmMuscle || 0),
                trunkMuscle: (newLog.trunkMuscle || 0) - (oldLog.trunkMuscle || 0),
                leftLegMuscle: (newLog.leftLegMuscle || 0) - (oldLog.leftLegMuscle || 0),
                rightLegMuscle: (newLog.rightLegMuscle || 0) - (oldLog.rightLegMuscle || 0),
                leftArmFat: (newLog.leftArmFat || 0) - (oldLog.leftArmFat || 0),
                rightArmFat: (newLog.rightArmFat || 0) - (oldLog.rightArmFat || 0),
                trunkFat: (newLog.trunkFat || 0) - (oldLog.trunkFat || 0),
                leftLegFat: (newLog.leftLegFat || 0) - (oldLog.leftLegFat || 0),
                rightLegFat: (newLog.rightLegFat || 0) - (oldLog.rightLegFat || 0),
            }
        }
    };
}
