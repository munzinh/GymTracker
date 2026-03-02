import type { WeightLogEntry, UserProfile, DailyLog } from '../../types/nutrition';
import type { TrendAnalysis } from '../data/models';

export function analyzeBodyProgress(
    weightLogs: WeightLogEntry[],
    profile: UserProfile,
    recentLogs: DailyLog[] = []
): TrendAnalysis {
    const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sortedLogs[sortedLogs.length - 1];
    const first = sortedLogs[0];

    if (!latest || sortedLogs.length < 2) {
        return {
            weightTrend: 'stable',
            muscleTrend: 'stable',
            fatTrend: 'stable',
            daysAnalyzed: sortedLogs.length,
            diffs: { weight: 0, muscle: 0, fat: 0 }
        };
    }

    // 1. Basic Trends
    const weightDiff = latest.weight - first.weight;
    const muscleDiff = (latest.muscleMass || 0) - (first.muscleMass || 0);
    const latestFatMass = (latest.weight * (latest.bodyFatPercentage || 0)) / 100;
    const firstFatMass = (first.weight * (first.bodyFatPercentage || 0)) / 100;
    const fatDiff = latestFatMass - firstFatMass;

    // 2. Muscle Loss Monitor (14-day window)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const windowStartLog = sortedLogs.find(l => new Date(l.date) >= twoWeeksAgo) || first;

    const muscleDropInWindow = (windowStartLog.muscleMass || 0) - (latest.muscleMass || 0);
    let muscleLossWarning;

    if (muscleDropInWindow > 0.5) {
        muscleLossWarning = {
            isCritical: true,
            amountKg: muscleDropInWindow,
            message: `Mất ${muscleDropInWindow.toFixed(1)}kg cơ trong 2 tuần qua!`,
            recommendation: "Hãy tăng 20-30g Protein/ngày hoặc giảm thâm hụt calo xuống < 300kcal để bảo tồn cơ bắp."
        };
    }

    // 3. Fat Loss Projection
    let fatLossProjection;
    if (profile.targetBodyFatPercentage && latest.bodyFatPercentage) {
        const targetFatMass = (latest.weight * profile.targetBodyFatPercentage) / 100;
        const remainingFatKg = Math.max(0, latestFatMass - targetFatMass);
        const isAtTarget = remainingFatKg <= 0.5;

        // Estimate weeks based on recent deficit
        let avgDeficit = 0;
        const loggedDays = recentLogs.filter(l => (l.dailyTotals?.calories || 0) > 0);
        if (loggedDays.length > 0) {
            const totalDeficit = loggedDays.reduce((acc, log) => {
                const target = log.targets?.calories || 0;
                const consumed = log.dailyTotals?.calories || 0;
                return acc + (target - consumed);
            }, 0);
            avgDeficit = totalDeficit / loggedDays.length;
        }

        // 1kg fat ~= 7700 kcal
        const estimatedWeeklyLossKg = (avgDeficit * 7) / 7700;
        const weeksRemaining = estimatedWeeklyLossKg > 0 ? remainingFatKg / estimatedWeeklyLossKg : 99;

        fatLossProjection = {
            currentFatMass: latestFatMass,
            targetFatMass,
            remainingFatKg,
            estimatedWeeks: Math.ceil(weeksRemaining),
            distanceToTargetPct: Math.max(0, 100 - (remainingFatKg / (latestFatMass || 1)) * 100),
            isAtTarget
        };
    }

    // 4. Integrated Deficit Risk
    let deficitRisk;
    const avgDeficit = recentLogs.length > 0 ?
        recentLogs.reduce((acc, log) => acc + ((log.targets?.calories || 0) - (log.dailyTotals?.calories || 0)), 0) / recentLogs.length
        : 0;

    if (profile.goal === 'cut' && avgDeficit > 800) {
        deficitRisk = {
            level: 'high' as const,
            message: "Thâm hụt quá gắt (>800kcal). Rủi ro mất cơ và chuyển hóa chậm rất cao!"
        };
    } else if (profile.goal === 'cut' && avgDeficit > 500) {
        deficitRisk = {
            level: 'medium' as const,
            message: "Thâm hụt mạnh. Hãy đảm bảo nạp đủ Protein (>2g/kg)."
        };
    }

    return {
        weightTrend: weightDiff > 0.5 ? 'increasing' : weightDiff < -0.5 ? 'decreasing' : 'stable',
        muscleTrend: muscleDiff > 0.2 ? 'increasing' : muscleDiff < -0.2 ? 'decreasing' : 'stable',
        fatTrend: fatDiff > 0.2 ? 'increasing' : fatDiff < -0.2 ? 'decreasing' : 'stable',
        daysAnalyzed: sortedLogs.length,
        muscleLossWarning,
        fatLossProjection,
        deficitRisk,
        diffs: {
            weight: weightDiff,
            muscle: muscleDiff,
            fat: fatDiff
        }
    };
}

