import type { AdherenceWarning } from '../data/models';
import type { DailyLog } from '../../types/nutrition';

export function analyzeNutritionCompliance(dailyLogs: DailyLog[]): AdherenceWarning[] {
    const warnings: AdherenceWarning[] = [];

    if (dailyLogs.length < 3) return warnings;

    // Get last 3 days
    const recentDays = dailyLogs.slice(-3);

    // 1. Detect Protein Deficit (Intake < 85% of target)
    let proteinMissCount = 0;
    let fatOvershootCount = 0;

    for (const log of recentDays) {
        if (log.targets && log.dailyTotals) {
            if (log.dailyTotals.protein < log.targets.protein * 0.85) {
                proteinMissCount++;
            }
            if (log.dailyTotals.fat > log.targets.fat * 1.2) {
                fatOvershootCount++;
            }
        }
    }

    if (proteinMissCount >= 3) {
        warnings.push({
            severity: 'high',
            type: 'protein_deficit',
            message: 'Cảnh báo: Nạp lượng Protein dưới 85% mục tiêu trong 3 ngày liên tục. Nguy cơ mất cơ bắp cao!'
        });
    }

    if (fatOvershootCount >= 3) {
        warnings.push({
            severity: 'medium',
            type: 'calorie_overshoot',
            message: 'Lưu ý: Lượng chất béo (Fat) vượt giới hạn 20% trong 3 ngày qua. Vui lòng kiểm tra lại thức ăn dầu mỡ.'
        });
    }

    return warnings;
}
