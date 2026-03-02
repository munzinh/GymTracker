import type { BodyMetrics } from '../data/models';
import { calcBMI } from '../../utils/nutritionMath';

export function calculateFitnessScore(metrics: BodyMetrics, gender: 'male' | 'female'): number {
    let fatScore = 0;
    let muscleScore = 0;
    let visceralScore = 0;
    let bmiScore = 0;

    // 1. Body Fat Score (40%)
    const bf = metrics.bodyFatPercentage || (gender === 'male' ? 20 : 25);
    if (gender === 'male') {
        if (bf <= 15) fatScore = 100;
        else if (bf <= 18) fatScore = 80;
        else if (bf <= 22) fatScore = 60;
        else fatScore = 40;
    } else {
        if (bf <= 23) fatScore = 100;
        else if (bf <= 26) fatScore = 80;
        else if (bf <= 30) fatScore = 60;
        else fatScore = 40;
    }

    // 2. Muscle Score (30%) - Skeletal Muscle Mass Ratio
    const muscleMass = metrics.muscleMass || (metrics.weight * 0.35); // fallback assumption
    const muscleRatio = (muscleMass / metrics.weight) * 100;

    if (muscleRatio >= 45) muscleScore = 100;
    else if (muscleRatio >= 40) muscleScore = 80;
    else if (muscleRatio >= 35) muscleScore = 60;
    else muscleScore = 40;

    // 3. Visceral Fat (20%)
    const vfat = metrics.visceralFat || 5; // fallback
    if (vfat <= 5) visceralScore = 100;
    else if (vfat <= 9) visceralScore = 70;
    else visceralScore = 40;

    // 4. BMI (10%)
    const bmi = calcBMI(metrics.weight, metrics.height);
    if (bmi >= 18.5 && bmi <= 24.9) bmiScore = 100;
    else if (bmi >= 25 && bmi <= 27) bmiScore = 70;
    else bmiScore = 40;

    // Weighted Total
    const totalScore = (fatScore * 0.4) + (muscleScore * 0.3) + (visceralScore * 0.2) + (bmiScore * 0.1);
    return Math.max(0, Math.min(100, Math.round(totalScore)));
}
