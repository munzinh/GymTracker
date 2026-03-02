import type { BodyMetrics, TrendAnalysis, AdherenceWarning, ActionPlan, FitnessPhase } from '../data/models';
import { determinePhase } from './PhaseDetector';
import { calculateFitnessScore } from './FitnessScorer';
import { calcTDEE } from '../../utils/nutritionMath';
import type { UserProfile } from '../../types/nutrition';

export function generateActionPlan(
    profile: UserProfile,
    metrics: BodyMetrics,
    trends: TrendAnalysis,
    warnings: AdherenceWarning[]
): ActionPlan {

    // 1. Detect Status Phase based on pure rules
    const phase: FitnessPhase = determinePhase(profile.goal, metrics, trends, profile.sex);

    // 2. Base Calories Output
    const tdee = calcTDEE(profile);

    // Smart Rules Engine override for Calories
    let calorieModifier = 0;
    if (phase === 'cut') calorieModifier = -0.2;
    if (phase === 'bulk') calorieModifier = +0.15;

    const calories = Math.round(tdee * (1 + calorieModifier));

    // Smart Rules Engine override for Macros
    const bodyFat = metrics.bodyFatPercentage || 20;
    const proteinFactor = bodyFat < 15 ? 2.0 : 1.7;
    const protein = Math.round(metrics.weight * proteinFactor);
    const fat = Math.round(metrics.weight * 0.6);
    const carbs = Math.max(0, Math.round((calories - (protein * 4) - (fat * 9)) / 4));

    // 3. Core Engine: Fitness Score
    const score = calculateFitnessScore(metrics, profile.sex);

    // 4. Automated Recovery/Workout Advice Strings
    let volumeAdjustmentPct = 0;
    let focus: 'hypertrophy' | 'strength' | 'recovery' = 'hypertrophy';
    let message = 'Tình hình ổn định. Cứ duy trì lịch tập hiện hành.';

    // Overtraining warning modifier
    if (warnings.some(w => w.type === 'overtraining')) {
        volumeAdjustmentPct = -20;
        focus = 'recovery';
        message = 'CẢNH BÁO: Dấu hiệu tập quá sức. Cơ thể đang kiệt quệ, bắt buộc phải giảm 20% số set tuần này để phục hồi.';
    } else if (phase === 'cut' && trends.muscleTrend === 'decreasing') {
        volumeAdjustmentPct = -10;
        focus = 'recovery';
        message = 'Bạn đang mất cơ trong quá trình Cut. Tạm thời giảm cường độ một chút, chú trọng nạp Protein phục hồi.';
    } else if (phase === 'bulk') {
        volumeAdjustmentPct = 5;
        focus = 'hypertrophy';
        message = 'Đang trong pha tăng cơ (Bulk), tăng Volume lên 5% để đẩy giới hạn giới cơ bắp.';
    }

    if (warnings.some(w => w.type === 'protein_deficit')) {
        message = '⚠️ CẦN SỬA ĐỔI DANH MỤC ĂN: Bạn phải nạp đủ Đạm (Protein) mới được tập nặng.';
    }

    return {
        phase,
        dailyTargets: {
            calories,
            protein,
            carbs,
            fat
        },
        workoutDirectives: {
            volumeAdjustmentPct,
            focus,
            message
        },
        score,
        warnings
    };
}
