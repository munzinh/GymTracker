import type { BodyMetrics, TrendAnalysis, FitnessPhase } from '../data/models';

export function determinePhase(
    currentGoal: 'cut' | 'bulk' | 'maintain',
    metrics: BodyMetrics,
    trends: TrendAnalysis,
    gender: 'male' | 'female'
): FitnessPhase {

    const bf = metrics.bodyFatPercentage || (gender === 'male' ? 20 : 25);
    const healthLimit = gender === 'male' ? 25 : 32;
    const leanLimit = gender === 'male' ? 8 : 16;

    // Override logic: Protect health over goals
    if (bf >= healthLimit) return 'cut'; // Forced cut for health
    if (bf <= leanLimit) return 'bulk'; // Forced bulk, too lean

    // Tactical shifts based on trends
    if (currentGoal === 'cut') {
        if (bf <= (gender === 'male' ? 12 : 18) && trends.muscleTrend === 'decreasing') {
            // Losing too much muscle while lean -> Auto Maintenance
            return 'maintain';
        }
        return 'cut';
    }

    if (currentGoal === 'bulk') {
        if (bf > (gender === 'male' ? 18 : 24)) {
            // Getting too fat during bulk -> Mini-cut needed
            return 'cut';
        }
        return 'bulk';
    }

    return 'maintain';
}
