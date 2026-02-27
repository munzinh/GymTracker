import { NutritionHub } from './NutritionHub';
import type { CurrentUser } from '../../App';

export function FitnessCalculator({ currentUser, onLogout }: { currentUser: CurrentUser, onLogout: () => void }) {
    return <NutritionHub currentUser={currentUser} onLogout={onLogout} />;
}
