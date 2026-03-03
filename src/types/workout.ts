export interface ExerciseTemplate {
    id: string;        // UUID
    name: string;      // e.g., "Đẩy Ngực (Bench Press)"
    targetSets: number;
    repRange: string;  // e.g., "8-12"
    targetRIR?: number;// Optional, usually 1-2
}

export interface WorkoutTemplate {
    id: string;        // UUID
    name: string;      // e.g., "Upper Body", "Thân Dưới"
    exercises: ExerciseTemplate[];
}

// Workout Logging & Schedule
export interface ExerciseSet {
    id: string;        // UUID
    weight: number;    // kg
    reps: number;
    rir?: number;
}

export type WorkoutStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface ExerciseSessionLog {
    id: string; // Unique ID for this exercise instance
    templateId?: string; // Links back to ExerciseTemplate id
    name: string;       // Cached name
    targetSets: number;
    repRange: string;
    targetRIR?: number;
    sets: ExerciseSet[];
    volume: number;     // calculated: weight * reps across all sets
}

export interface WorkoutSession {
    id: string;         // UUID
    date: string;       // YYYY-MM-DD
    userId: string;
    templateId?: string; // If based on a template
    name: string;       // "Thân Trên", "Rest", etc. or custom
    exercises: ExerciseSessionLog[];
    status: WorkoutStatus;
    totalVolume: number;
    startedAt?: string;
    endedAt?: string;
    durationMinutes?: number;
}

export interface WeeklySchedule {
    id: string;         // e.g. "week-2023-41"
    userId: string;
    weekStartDate: string; // YYYY-MM-DD (Monday of that week)
    // keys are YYYY-MM-DD
    days: Record<string, { templateId: string | null; name: string; isRest: boolean }>;
}
