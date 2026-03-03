import type { WorkoutTemplate, WorkoutSession, WeeklySchedule, ExerciseSessionLog } from '../types/workout';

// ─── Constants ─────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
    WORKOUT_TEMPLATES: 'cl_workout_templates',
    WORKOUT_SESSIONS: 'cl_workout_sessions',
    WEEKLY_SCHEDULES: 'cl_weekly_schedules',
    DEFAULT_WEEKLY_SCHEDULE: 'cl_default_weekly_schedule'
};

// ─── Default Templates ──────────────────────────────────────────────────
export const DEFAULT_WORKOUT_TEMPLATES: WorkoutTemplate[] = [
    {
        id: 'tpl-upper-1',
        name: 'Thân Trên (Upper)',
        exercises: [
            { id: 'ex-u1-1', name: 'Incline Smith Bench Press', targetSets: 2, repRange: '6-8', targetRIR: 1 },
            { id: 'ex-u1-2', name: 'Peck Deck', targetSets: 2, repRange: '6-8', targetRIR: 1 },
            { id: 'ex-u1-3', name: 'Lat Pulldown', targetSets: 2, repRange: '6-8', targetRIR: 1 },
            { id: 'ex-u1-4', name: 'Chest Support Row', targetSets: 2, repRange: '6-8', targetRIR: 1 },
            { id: 'ex-u1-5', name: 'Cable Lateral Raise', targetSets: 2, repRange: '8-12', targetRIR: 1 },
            { id: 'ex-u1-6', name: 'Triceps Pushdown', targetSets: 2, repRange: '6-8', targetRIR: 1 },
            { id: 'ex-u1-7', name: 'Preacher Curl', targetSets: 2, repRange: '6-10', targetRIR: 1 }
        ]
    },
    {
        id: 'tpl-lower-1',
        name: 'Thân Dưới (Lower)',
        exercises: [
            { id: 'ex-l1-1', name: 'Leg Press', targetSets: 2, repRange: '5-6', targetRIR: 1 },
            { id: 'ex-l1-2', name: 'Hip Thurst', targetSets: 2, repRange: '5-6', targetRIR: 1 },
            { id: 'ex-l1-3', name: 'Leg Curl', targetSets: 2, repRange: '6-8', targetRIR: 1 },
            { id: 'ex-l1-4', name: 'Leg Extension', targetSets: 2, repRange: '6-8', targetRIR: 1 },
            { id: 'ex-l1-5', name: 'Calve Raise', targetSets: 3, repRange: '6-8', targetRIR: 1 },
            { id: 'ex-l1-6', name: 'Hip Adductor', targetSets: 2, repRange: '6-8', targetRIR: 1 },
            { id: 'ex-l1-7', name: 'Cable Crunch', targetSets: 2, repRange: '10', targetRIR: 1 }
        ]
    }
];

// ─── Helpers ─────────────────────────────────────────────────────────────
function getUserIdPrefix(userId: string) {
    return `${userId}_`;
}

// ─── Templates ────────────────────────────────────────────────────────────

export function loadWorkoutTemplates(userId: string): WorkoutTemplate[] {
    const key = getUserIdPrefix(userId) + STORAGE_KEYS.WORKOUT_TEMPLATES;
    try {
        const data = localStorage.getItem(key);
        if (!data) {
            // Seed defaults
            saveWorkoutTemplates(userId, DEFAULT_WORKOUT_TEMPLATES);
            return DEFAULT_WORKOUT_TEMPLATES;
        }
        return JSON.parse(data) as WorkoutTemplate[];
    } catch {
        return DEFAULT_WORKOUT_TEMPLATES;
    }
}

export function saveWorkoutTemplates(userId: string, templates: WorkoutTemplate[]): void {
    const key = getUserIdPrefix(userId) + STORAGE_KEYS.WORKOUT_TEMPLATES;
    localStorage.setItem(key, JSON.stringify(templates));
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

export function loadWorkoutSessions(userId: string): WorkoutSession[] {
    const key = getUserIdPrefix(userId) + STORAGE_KEYS.WORKOUT_SESSIONS;
    try {
        const data = localStorage.getItem(key);
        if (!data) return [];
        const parsed = JSON.parse(data) as Record<string, unknown>[];
        // Auto-migrate legacy WorkoutLog format to WorkoutSession
        return parsed.map(log => {
            if ("isCompleted" in log) {
                return {
                    ...log,
                    id: typeof log.id === 'string' && log.id.length > 10 ? log.id : `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    status: log.isCompleted ? 'completed' : 'in_progress',
                    isCompleted: undefined,
                    exercises: (log.exercises as Record<string, unknown>[]).map(ex => ({
                        ...ex,
                        id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        targetSets: 3,
                        repRange: '8-12'
                    }))
                } as unknown as WorkoutSession;
            }
            return log as unknown as WorkoutSession;
        });
    } catch {
        return [];
    }
}

export function saveWorkoutSessions(userId: string, sessions: WorkoutSession[]): void {
    const key = getUserIdPrefix(userId) + STORAGE_KEYS.WORKOUT_SESSIONS;
    localStorage.setItem(key, JSON.stringify(sessions));
}

export function getWorkoutSessionByDate(userId: string, dateStr: string): WorkoutSession | null {
    const sessions = loadWorkoutSessions(userId);
    return sessions.find(s => s.date === dateStr) || null;
}

export function saveSingleWorkoutSession(userId: string, session: WorkoutSession): void {
    const sessions = loadWorkoutSessions(userId);
    const existingIndex = sessions.findIndex(s => s.id === session.id || s.date === session.date);
    if (existingIndex >= 0) {
        sessions[existingIndex] = session;
    } else {
        sessions.push(session);
    }
    saveWorkoutSessions(userId, sessions);
}

export function deleteWorkoutSession(userId: string, sessionId: string): void {
    const sessions = loadWorkoutSessions(userId);
    const updated = sessions.filter(s => s.id !== sessionId);
    saveWorkoutSessions(userId, updated);
}

export function startWorkoutSession(userId: string, dateStr: string, template: WorkoutTemplate | null, customName: string): WorkoutSession {
    const newSession: WorkoutSession = {
        id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        date: dateStr,
        userId: userId,
        templateId: template?.id,
        name: template?.name || customName,
        status: 'in_progress',
        totalVolume: 0,
        startedAt: new Date().toISOString(),
        exercises: template?.exercises.map(ex => {
            const lastLog = getLastExercisePerformance(userId, ex.name, dateStr);
            const targetSets = ex.targetSets || 3;
            const sets = [];

            for (let i = 0; i < targetSets; i++) {
                const prevSet = lastLog && lastLog.sets.length > i ? lastLog.sets[i] : null;
                let defaultReps = 0;
                if (ex.repRange) {
                    const parts = ex.repRange.split('-');
                    defaultReps = parseInt(parts[parts.length - 1], 10) || 0;
                }

                sets.push({
                    id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    weight: prevSet ? prevSet.weight : 0,
                    reps: prevSet ? prevSet.reps : defaultReps,
                    rir: prevSet ? prevSet.rir : ex.targetRIR
                });
            }

            return {
                id: `es-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                templateId: ex.id,
                name: ex.name,
                targetSets: ex.targetSets,
                repRange: ex.repRange,
                targetRIR: ex.targetRIR,
                sets,
                volume: 0
            };
        }) || []
    };
    saveSingleWorkoutSession(userId, newSession);
    return newSession;
}

export function getLastExercisePerformance(userId: string, exerciseName: string, beforeDate: string): ExerciseSessionLog | null {
    const sessions = loadWorkoutSessions(userId);
    // Find the most recent session before this date that has this exercise
    const pastSessions = sessions
        .filter(s => s.date < beforeDate && s.status === 'completed')
        .sort((a, b) => b.date.localeCompare(a.date));

    for (const session of pastSessions) {
        const ex = session.exercises.find(e => e.name === exerciseName);
        if (ex && ex.sets.length > 0) {
            return ex;
        }
    }
    return null;
}

// ─── Weekly Schedules ─────────────────────────────────────────────────────

// Get the Monday of the current week for a given date
export function getWeekStart(dateStr: string): string {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setDate(diff);
    return d.toISOString().split('T')[0];
}

export function loadWeeklySchedules(userId: string): WeeklySchedule[] {
    const key = getUserIdPrefix(userId) + STORAGE_KEYS.WEEKLY_SCHEDULES;
    try {
        const data = localStorage.getItem(key);
        if (!data) return [];
        return JSON.parse(data) as WeeklySchedule[];
    } catch {
        return [];
    }
}

export function saveWeeklySchedules(userId: string, schedules: WeeklySchedule[]): void {
    const key = getUserIdPrefix(userId) + STORAGE_KEYS.WEEKLY_SCHEDULES;
    localStorage.setItem(key, JSON.stringify(schedules));
}

export function loadDefaultWeeklySchedule(userId: string): Record<number, { templateId: string | null, name: string, isRest: boolean }> | null {
    const key = getUserIdPrefix(userId) + STORAGE_KEYS.DEFAULT_WEEKLY_SCHEDULE;
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function saveDefaultWeeklySchedule(userId: string, daysBlueprint: Record<number, { templateId: string | null, name: string, isRest: boolean }>): void {
    const key = getUserIdPrefix(userId) + STORAGE_KEYS.DEFAULT_WEEKLY_SCHEDULE;
    localStorage.setItem(key, JSON.stringify(daysBlueprint));
}

export function applyBlueprintToAllWeeks(userId: string, blueprint: Record<number, { templateId: string | null, name: string, isRest: boolean }>): void {
    const schedules = loadWeeklySchedules(userId);
    const updatedSchedules = schedules.map(sched => {
        const newDays = { ...sched.days };
        for (const dateStr of Object.keys(newDays)) {
            const dayNum = new Date(dateStr).getDay();
            if (blueprint[dayNum]) {
                newDays[dateStr] = { ...blueprint[dayNum] };
            }
        }
        return { ...sched, days: newDays };
    });
    saveWeeklySchedules(userId, updatedSchedules);
}

export function getWeeklySchedule(userId: string, weekStart: string): WeeklySchedule {
    const schedules = loadWeeklySchedules(userId);
    let sched = schedules.find(s => s.weekStartDate === weekStart);
    if (!sched) {
        // Create an empty schedule
        sched = {
            id: `week-${weekStart}`,
            userId,
            weekStartDate: weekStart,
            days: {}
        };

        const defaultBlueprint = loadDefaultWeeklySchedule(userId);

        // Pre-fill 7 days from blueprint or mostly empty
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dStr = date.toISOString().split('T')[0];
            const dayNum = date.getDay(); // 0 is Sunday, 1 is Monday...

            if (defaultBlueprint && defaultBlueprint[dayNum]) {
                sched.days[dStr] = { ...defaultBlueprint[dayNum] };
            } else {
                sched.days[dStr] = { templateId: null, name: 'Tự do', isRest: false };
            }
        }
    }
    return sched;
}

export function saveWeeklySchedule(userId: string, schedule: WeeklySchedule): void {
    const schedules = loadWeeklySchedules(userId);
    const index = schedules.findIndex(s => s.weekStartDate === schedule.weekStartDate);
    if (index >= 0) {
        schedules[index] = schedule;
    } else {
        schedules.push(schedule);
    }
    saveWeeklySchedules(userId, schedules);
}

// ─── Analytics Helpers ────────────────────────────────────────────────────

// Check if a specific exercise weight is a PR (Personal Record) compared to historical logs for the user
export function isHistoricalPR(userId: string, templateExerciseId: string, currentWeight: number, currentDate: string): boolean {
    const sessions = loadWorkoutSessions(userId);

    // Sort logs oldest to newest
    const pastSessions = sessions.filter(s => s.date < currentDate).sort((a, b) => a.date.localeCompare(b.date));

    let maxHistoricalWeight = 0;

    for (const session of pastSessions) {
        const exLog = session.exercises.find(e => e.templateId === templateExerciseId);
        if (exLog) {
            for (const set of exLog.sets) {
                if (set.weight > maxHistoricalWeight) {
                    maxHistoricalWeight = set.weight;
                }
            }
        }
    }

    // It's a PR if it's strictly greater than any past weight recorded, and greater than 0
    return currentWeight > maxHistoricalWeight && currentWeight > 0;
}
