import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AppData, DailyLog, WeeklyCheck, StrengthLog, GoalSettings } from '../types';
import { v4 as uuid } from '../utils/uuid.ts';

const defaultGoals: GoalSettings = {
    targetBodyFat: 10,
    deadlineWeeks: 16,
    startWeight: 75,
    startBodyFat: 20,
    tdee: 2400,
};

const defaultData: AppData = {
    dailyLogs: [],
    weeklyChecks: [],
    strengthLogs: [],
    goals: defaultGoals,
};

interface AppContextType {
    data: AppData;
    addDailyLog: (log: Omit<DailyLog, 'id'>) => void;
    updateDailyLog: (id: string, log: Partial<DailyLog>) => void;
    deleteDailyLog: (id: string) => void;
    addWeeklyCheck: (check: Omit<WeeklyCheck, 'id'>) => void;
    updateWeeklyCheck: (id: string, check: Partial<WeeklyCheck>) => void;
    addStrengthLog: (log: Omit<StrengthLog, 'id'>) => void;
    deleteStrengthLog: (id: string) => void;
    updateGoals: (goals: Partial<GoalSettings>) => void;
    resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useLocalStorage<AppData>('cut-lean-data', defaultData);

    const addDailyLog = (log: Omit<DailyLog, 'id'>) => {
        setData(d => {
            // Nếu đã có log cùng ngày thì ghi đè
            const existing = d.dailyLogs.findIndex(l => l.date === log.date);
            if (existing >= 0) {
                const updated = [...d.dailyLogs];
                updated[existing] = { ...updated[existing], ...log };
                return { ...d, dailyLogs: updated };
            }
            return { ...d, dailyLogs: [...d.dailyLogs, { ...log, id: uuid() }] };
        });
    };

    const updateDailyLog = (id: string, log: Partial<DailyLog>) => {
        setData(d => ({
            ...d,
            dailyLogs: d.dailyLogs.map(l => l.id === id ? { ...l, ...log } : l),
        }));
    };

    const deleteDailyLog = (id: string) => {
        setData(d => ({ ...d, dailyLogs: d.dailyLogs.filter(l => l.id !== id) }));
    };

    const addWeeklyCheck = (check: Omit<WeeklyCheck, 'id'>) => {
        setData(d => {
            const existing = d.weeklyChecks.findIndex(c => c.weekStart === check.weekStart);
            if (existing >= 0) {
                const updated = [...d.weeklyChecks];
                updated[existing] = { ...updated[existing], ...check };
                return { ...d, weeklyChecks: updated };
            }
            return { ...d, weeklyChecks: [...d.weeklyChecks, { ...check, id: uuid() }] };
        });
    };

    const updateWeeklyCheck = (id: string, check: Partial<WeeklyCheck>) => {
        setData(d => ({
            ...d,
            weeklyChecks: d.weeklyChecks.map(c => c.id === id ? { ...c, ...check } : c),
        }));
    };

    const addStrengthLog = (log: Omit<StrengthLog, 'id'>) => {
        setData(d => ({ ...d, strengthLogs: [...d.strengthLogs, { ...log, id: uuid() }] }));
    };

    const deleteStrengthLog = (id: string) => {
        setData(d => ({ ...d, strengthLogs: d.strengthLogs.filter(l => l.id !== id) }));
    };

    const updateGoals = (goals: Partial<GoalSettings>) => {
        setData(d => ({ ...d, goals: { ...d.goals, ...goals } }));
    };

    const resetData = () => {
        setData(defaultData);
    };

    return (
        <AppContext.Provider value={{
            data,
            addDailyLog, updateDailyLog, deleteDailyLog,
            addWeeklyCheck, updateWeeklyCheck,
            addStrengthLog, deleteStrengthLog,
            updateGoals, resetData,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
