import { useState, useMemo, useEffect } from 'react';
import {
    Flame, Calendar, Target, Award, User, ChevronLeft, ChevronRight, CheckCircle2, Database, Dumbbell, LogOut
} from 'lucide-react';
import type {
    UserProfile, DailyLog, MealSlotId, MealSlot, MacroSummary, MealItem
} from '../../types/nutrition';
import type { FoodItem } from './foodDatabase';
import {
    loadProfile, saveProfile, loadDailyLogs, saveDailyLogs, createEmptyDailyLog,
    getTodayStr, loadGamification, loadSuggestions, loadWeightLogs
} from '../../utils/storage';
import { updateDailyStreak, checkBadges, generateCoachingSuggestions } from '../../utils/coachingEngine';
import { calcMacroTargets, calcNutrition } from '../../utils/nutritionMath';

// UI Components
import { ProfileSetup } from './ProfileSetup';
import { ProgressRing } from './ProgressRing';
import { MacroBars } from './MacroBars';
import { MealSlotCard } from './MealSlotCardUI';
import { WeeklyAnalytics } from './WeeklyAnalytics';
import { FoodDatabaseManager } from './FoodDatabaseManager';

// Helpers
function sumEntries(entries: MealItem[]): MacroSummary {
    return entries.reduce((acc, e) => {
        const n = e.macros || calcNutrition((e as any).food, e.grams); // fallback for legacy data
        return {
            calories: acc.calories + n.calories,
            protein: Math.round((acc.protein + n.protein) * 10) / 10,
            carbs: Math.round((acc.carbs + n.carbs) * 10) / 10,
            fat: Math.round((acc.fat + n.fat) * 10) / 10,
        };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function sumAllMeals(slots: Record<MealSlotId, MealSlot>): MacroSummary {
    const all = [
        ...slots.breakfast.items,
        ...slots.lunch.items,
        ...slots.dinner.items,
        ...slots.snack.items
    ];
    return sumEntries(all);
}

export function NutritionHub({ currentUser, onLogout }: { currentUser: import('../../App').CurrentUser, onLogout: () => void }) {
    const userId = currentUser.id;
    const [tab, setTab] = useState<'daily' | 'weekly' | 'database' | 'profile'>('daily');

    // Core state
    const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile(userId));
    const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => loadDailyLogs(userId));
    const [selectedDate, setSelectedDate] = useState(getTodayStr());

    // Gamification & Coaching
    const [gamification, setGamification] = useState(() => loadGamification(userId));
    const [suggestions, setSuggestions] = useState(() => loadSuggestions(userId));
    const [weightLogs, setWeightLogs] = useState(() => loadWeightLogs(userId));

    // Mount logic: Run coaching engine and streak logic
    useEffect(() => {
        const p = loadProfile(userId);
        setProfile(p);
        const l = loadDailyLogs(userId);
        setDailyLogs(l);

        if (p) {
            const todayLog = l.find(log => log.date === getTodayStr()) || createEmptyDailyLog(userId, getTodayStr());
            updateDailyStreak(userId, todayLog);
            checkBadges(userId, l);
            setGamification(loadGamification(userId));

            const wLogs = loadWeightLogs(userId);
            setWeightLogs(wLogs);
            generateCoachingSuggestions(userId, p, l, wLogs);
            setSuggestions(loadSuggestions(userId));
        }
    }, [userId]);

    // Daily View Data Context
    const currentLog = useMemo(() => {
        return dailyLogs.find(l => l.date === selectedDate) || createEmptyDailyLog(userId, selectedDate);
    }, [dailyLogs, selectedDate, userId]);

    // Deep merge to ensure arrays are present for react state updates
    const [liveMeals, setLiveMeals] = useState<Record<MealSlotId, MealSlot>>(
        currentLog.meals
            ? currentLog.meals
            : createEmptyDailyLog(userId, selectedDate).meals
    );

    // Sync state when selected date changes
    useEffect(() => {
        const log = dailyLogs.find(l => l.date === selectedDate) || createEmptyDailyLog(userId, selectedDate);
        setLiveMeals(log.meals);
    }, [selectedDate, dailyLogs, userId]);

    const dailyTotals = useMemo(() => sumAllMeals(liveMeals), [liveMeals]);

    // Reactive Targets based on profile
    const targets: MacroSummary | null = profile ? calcMacroTargets(profile) : null;

    // Handlers
    const handleProfileSave = (p: UserProfile) => {
        saveProfile(userId, p);
        setProfile(p);
        setTab('daily');

        // Ensure today's log has targets immediately
        const t = calcMacroTargets(p);
        const todayStr = getTodayStr();
        const logs = loadDailyLogs(userId);
        const log = logs.find(l => l.date === todayStr) || createEmptyDailyLog(userId, todayStr);
        log.targets = t;
        const updated = [...logs.filter(l => l.date !== todayStr), log];
        saveDailyLogs(userId, updated);
        setDailyLogs(updated);
    };

    const addToMeal = (slotId: MealSlotId, food: FoodItem, grams: number) => {
        setLiveMeals(prev => ({
            ...prev,
            [slotId]: {
                ...prev[slotId],
                items: [...prev[slotId].items, {
                    id: Date.now().toString(),
                    foodId: food.id,
                    name: food.nameVi || food.name,
                    grams,
                    macros: calcNutrition(food, grams),
                    food
                } as any]
            }
        }));
    };

    const removeFromMeal = (slotId: MealSlotId, itemId: string) => {
        setLiveMeals(prev => ({
            ...prev,
            [slotId]: {
                ...prev[slotId],
                items: prev[slotId].items.filter(i => i.id !== itemId)
            }
        }));
    };

    const [savedFeedback, setSavedFeedback] = useState(false);
    const handleSaveDay = () => {
        if (!targets) return;

        // Ensure slot totals are updated
        const updatedMeals = { ...liveMeals };
        (Object.keys(updatedMeals) as MealSlotId[]).forEach(k => {
            updatedMeals[k].totals = sumEntries((updatedMeals[k] as any).items);
        });

        const newLog: DailyLog = {
            id: selectedDate,
            userId,
            date: selectedDate,
            meals: updatedMeals,
            dailyTotals,
            targets
        };

        const updatedLogs = [...dailyLogs.filter(l => l.date !== selectedDate), newLog];
        saveDailyLogs(userId, updatedLogs);
        setDailyLogs(updatedLogs);

        // Also update streak if saving today's log
        if (selectedDate === getTodayStr()) {
            updateDailyStreak(userId, newLog);
            setGamification(loadGamification(userId));
        }

        setSavedFeedback(true);
        setTimeout(() => setSavedFeedback(false), 2000);
    };

    const navigateDate = (dir: -1 | 1) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + dir);
        setSelectedDate(d.toISOString().slice(0, 10));
    };

    const refreshSuggestions = () => setSuggestions(loadSuggestions(userId));

    const isToday = selectedDate === getTodayStr();

    if (!profile) {
        return (
            <div className="p-4 max-w-md mx-auto fade-in">
                <ProfileSetup profile={null} onSave={handleProfileSave} />
            </div>
        );
    }

    return (
        <div className="pb-24 max-w-md mx-auto flex flex-col min-h-screen">

            {/* UNIFIED DASHBOARD HEADER (Sticky) */}
            <div className="sticky top-0 z-50 bg-[#111]/95 backdrop-blur-lg border-b border-[#222]">
                {/* Row 1: Logo & User Stats */}
                <div className="flex items-center justify-between px-4 py-2.5">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #00ff88, #00cc6a)' }}>
                            <Dumbbell size={14} className="text-black" />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-white">
                            <span className="text-[#00ff88]" style={{ textShadow: '0 0 10px rgba(0, 255, 136, 0.5)' }}>CUT</span>
                            <span className="ml-1">LEAN</span>
                        </span>
                    </div>

                    {/* Right: User Gamification & Logout */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1a1a1a] border border-[#333]">
                            <span className="text-[11px] font-bold text-white">{gamification.levelTitle}</span>
                            <span className="flex items-center text-[10px] font-bold text-[#ffb800]">
                                <Flame size={10} className="mr-0.5" />{gamification.currentStreak}d
                            </span>
                        </div>
                        <button onClick={onLogout} className="p-1.5 rounded-md text-[#ff4444] hover:bg-[#ff444420] transition-colors" aria-label="Đăng xuất">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Row 2: Segmented Navigation Tabs */}
                <div className="px-4 pb-2.5">
                    <div className="flex bg-[#181818] rounded-[10px] p-0.5 border border-[#2a2a2a]">
                        {[
                            { id: 'daily' as const, icon: Target, label: 'Tracking' },
                            { id: 'weekly' as const, icon: Award, label: 'Báo cáo' },
                            { id: 'database' as const, icon: Database, label: 'Database' },
                            { id: 'profile' as const, icon: User, label: 'Hồ sơ' },
                        ].map(t => {
                            const active = tab === t.id;
                            return (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[8px] text-[11px] font-bold transition-all ${active ? 'bg-[#2a2a2a] text-[#00ff88] shadow-sm' : 'text-[#666] hover:text-[#aaa]'}`}>
                                    <t.icon size={13} />
                                    <span>{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main scrollable content area */}
            <div className="flex-1 space-y-3 pt-3">

                {/* Tab: Database Manager */}
                {tab === 'database' && (
                    <div className="px-4">
                        <FoodDatabaseManager userId={userId} onClose={() => setTab('daily')} inline />
                    </div>
                )}

                {/* Tab: Profile */}
                {tab === 'profile' && (
                    <div className="px-4">
                        <ProfileSetup profile={profile} onSave={handleProfileSave} />
                    </div>
                )}

                {/* Tab: Weekly Analytics */}
                {tab === 'weekly' && (
                    <div className="px-4">
                        <WeeklyAnalytics
                            userId={userId}
                            profile={profile}
                            logs={dailyLogs}
                            weightLogs={weightLogs}
                            suggestions={suggestions}
                            onSuggestionsUpdate={refreshSuggestions}
                        />
                    </div>
                )}

                {/* Tab: Daily Tracking */}
                {tab === 'daily' && targets && (
                    <div className="px-4 space-y-3 fade-in">

                        {/* Date Navigator */}
                        <div className="flex justify-between items-center bg-[#111] p-1.5 rounded-xl border border-[#222]">
                            <button onClick={() => navigateDate(-1)} className="p-2 bg-[#1a1a1a] rounded-lg text-[#888] hover:text-white transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="text-center">
                                <span className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                                    <Calendar size={14} className="text-[#00ff88]" />
                                    {isToday ? 'Hôm nay' : new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                                </span>
                                <span className="text-[10px] text-[#666]">{selectedDate}</span>
                            </div>
                            <button onClick={() => navigateDate(1)} disabled={selectedDate >= getTodayStr()}
                                className="p-2 bg-[#1a1a1a] rounded-lg text-[#888] hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-[#888]">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Progress Ring */}
                        <div className="bg-[#111] rounded-3xl border border-[#222] shadow-sm flex justify-center py-1.5">
                            <ProgressRing current={dailyTotals.calories} target={targets.calories} size={200} strokeWidth={16} />
                        </div>

                        {/* Macro Bars */}
                        <MacroBars current={dailyTotals} target={targets} />

                        {/* Meal Slots array */}
                        <div className="space-y-3">
                            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlotId[]).map(slotId => (
                                <MealSlotCard
                                    key={slotId}
                                    userId={userId}
                                    slot={liveMeals[slotId] || { id: slotId, name: slotId === 'breakfast' ? 'Bữa sáng' : slotId === 'lunch' ? 'Bữa trưa' : slotId === 'dinner' ? 'Bữa tối' : 'Bữa phụ', items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } }}
                                    dailyTotals={dailyTotals}
                                    dailyTargets={targets}
                                    onAdd={(food, grams) => addToMeal(slotId, food, grams)}
                                    onRemove={(id) => removeFromMeal(slotId, id)}
                                />
                            ))}
                        </div>

                        {/* Check if anything is logged to display Save Button */}
                        {(Object.keys(liveMeals) as MealSlotId[]).some(k => liveMeals[k]?.items.length > 0) && (
                            <button
                                onClick={handleSaveDay}
                                className="w-full py-4 text-center rounded-xl font-bold text-sm transition-all text-black shadow-lg"
                                style={{ background: savedFeedback ? '#00e5ff' : 'linear-gradient(135deg, #00ff88, #00cc6a)' }}
                            >
                                {savedFeedback ? <span className="flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Đã lưu ngày {selectedDate}!</span> : 'Lưu Nhật ký Ngày'}
                            </button>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
