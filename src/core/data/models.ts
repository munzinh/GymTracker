export type FitnessPhase = 'cut' | 'bulk' | 'maintain';

export interface BodyMetrics {
    weight: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    visceralFat?: number; // 1-15+ scale
    height: number;      // for BMI
    recordedAt: string;
    // Segmental
    leftArmMuscle?: number;
    rightArmMuscle?: number;
    trunkMuscle?: number;
    leftLegMuscle?: number;
    rightLegMuscle?: number;
    leftArmFat?: number;
    rightArmFat?: number;
    trunkFat?: number;
    leftLegFat?: number;
    rightLegFat?: number;
}

export interface AdherenceWarning {
    severity: 'low' | 'medium' | 'high';
    type: 'protein_deficit' | 'calorie_overshoot' | 'plateau' | 'overtraining' | 'general';
    message: string;
}

export interface TrendAnalysis {
    weightTrend: 'increasing' | 'decreasing' | 'stable';
    muscleTrend: 'increasing' | 'decreasing' | 'stable';
    fatTrend: 'increasing' | 'decreasing' | 'stable';
    daysAnalyzed: number;
    muscleLossWarning?: {
        isCritical: boolean;
        amountKg: number;
        message: string;
        recommendation: string;
    };
    fatLossProjection?: {
        currentFatMass: number;
        targetFatMass: number;
        remainingFatKg: number;
        estimatedWeeks: number;
        distanceToTargetPct: number;
        isAtTarget: boolean;
    };
    deficitRisk?: {
        level: 'low' | 'medium' | 'high';
        message: string;
    };
    diffs: {
        weight: number;
        muscle: number;
        fat: number;
        segmental?: {
            leftArmMuscle?: number;
            rightArmMuscle?: number;
            trunkMuscle?: number;
            leftLegMuscle?: number;
            rightLegMuscle?: number;
            leftArmFat?: number;
            rightArmFat?: number;
            trunkFat?: number;
            leftLegFat?: number;
            rightLegFat?: number;
        };
    };
}

export interface ActionPlan {
    phase: FitnessPhase;
    dailyTargets: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    workoutDirectives: {
        volumeAdjustmentPct: number;
        focus: 'hypertrophy' | 'strength' | 'recovery';
        message: string;
    };
    score: number;
    warnings: AdherenceWarning[];
}
