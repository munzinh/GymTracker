import { NutritionHub } from './NutritionHub';

export function FitnessCalculator({ userId }: { userId: string }) {
    return <NutritionHub userId={userId} />;
}
