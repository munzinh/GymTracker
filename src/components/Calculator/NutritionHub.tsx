import { useState, useMemo } from 'react';
import {
    Flame, Calendar, Target, Award, User, ChevronLeft, ChevronRight, CheckCircle2, Database, Dumbbell, LogOut, Activity, BookOpen, Menu, TrendingUp
} from 'lucide-react';
import type {
    UserProfile, DailyLog, MealSlotId, MealSlot, MacroSummary, MealItem
} from '../../types/nutrition';
import type { FoodItem } from './foodDatabase';
import {
    loadProfile, saveProfile, loadDailyLogs, saveDailyLogs, createEmptyDailyLog,
    getTodayStr, loadGamification, loadWeightLogs
} from '../../utils/storage';
import { updateDailyStreak, checkBadges } from '../../utils/coachingEngine';
import { calcMacroTargets, calcNutrition } from '../../utils/nutritionMath';

// UI Components
import { ProfileSetup } from './ProfileSetup';
import { ProgressRing } from './ProgressRing';
import { MacroBars } from './MacroBars';
import { MealSlotCard } from './MealSlotCardUI';
import { WeeklyAnalytics } from './WeeklyAnalytics';
import { FoodDatabaseManager } from './FoodDatabaseManager';
import { BodyMetrics } from './BodyMetrics';
import { FormulasGuide } from './FormulasGuide';
import { MegaCalculator } from './MegaCalculator';
import { WorkoutHub } from '../Workout/WorkoutHub';
import { ProgressDashboard } from '../Workout/ProgressDashboard';
// import { SmartInsights } from './SmartInsights'; // Removed since it moved to WeeklyAnalytics

// Helpers
function sumEntries(entries: MealItem[]): MacroSummary {
    return entries.reduce((acc, e) => {
        const n = e.macros || calcNutrition((e as unknown as { food: import('./foodDatabase').FoodItem }).food, e.grams); // fallback for legacy data
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
    const [tab, setTab] = useState<'daily' | 'weekly' | 'workout' | 'progress' | 'metrics' | 'database' | 'formulas' | 'profile' | 'tools'>('daily');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Core state
    const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile(userId));
    const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => loadDailyLogs(userId));
    const [selectedDate, setSelectedDate] = useState(getTodayStr());

    // Gamification
    const [gamification, setGamification] = useState(() => {
        const p = loadProfile(userId);
        const l = loadDailyLogs(userId);
        if (p) {
            const todayLog = l.find(log => log.date === getTodayStr()) || createEmptyDailyLog(userId, getTodayStr());
            updateDailyStreak(userId, todayLog);
            checkBadges(userId, l);
        }
        return loadGamification(userId);
    });
    const [weightLogs, setWeightLogs] = useState(() => loadWeightLogs(userId));

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

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        const latestStorage = loadDailyLogs(userId);
        const log = latestStorage.find(l => l.date === newDate) || createEmptyDailyLog(userId, newDate);
        setLiveMeals(log.meals);
    };

    const dailyTotals = useMemo(() => sumAllMeals(liveMeals), [liveMeals]);

    // Reactive Targets
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
        setLiveMeals(prev => {
            const next = {
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
                    } as unknown as import('../../types/nutrition').MealItem]
                }
            };
            saveLatestMeals(next);
            return next;
        });
    };

    const removeFromMeal = (slotId: MealSlotId, itemId: string) => {
        setLiveMeals(prev => {
            const next = {
                ...prev,
                [slotId]: {
                    ...prev[slotId],
                    items: prev[slotId].items.filter(i => i.id !== itemId)
                }
            };
            saveLatestMeals(next);
            return next;
        });
    };

    const [savedFeedback, setSavedFeedback] = useState(false);

    // Auto-save helper
    const saveLatestMeals = (updatedMeals: Record<MealSlotId, MealSlot>) => {
        if (!targets) return;

        // Ensure slot totals are updated
        (Object.keys(updatedMeals) as MealSlotId[]).forEach(k => {
            updatedMeals[k].totals = sumEntries((updatedMeals[k] as unknown as { items: import('../../types/nutrition').MealItem[] }).items);
        });

        const latestTotals = sumAllMeals(updatedMeals);

        const newLog: DailyLog = {
            id: selectedDate,
            userId,
            date: selectedDate,
            meals: updatedMeals,
            dailyTotals: latestTotals,
            targets
        };

        setDailyLogs(prevLogs => {
            const updatedLogs = [...prevLogs.filter(l => l.date !== selectedDate), newLog];
            saveDailyLogs(userId, updatedLogs);
            // Also update streak if saving today's log
            if (selectedDate === getTodayStr()) {
                updateDailyStreak(userId, newLog);
                setGamification(loadGamification(userId));
            }
            return updatedLogs;
        });

        setSavedFeedback(true);
        setTimeout(() => setSavedFeedback(false), 2000);
    };

    const navigateDate = (dir: -1 | 1) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + dir);
        handleDateChange(d.toISOString().slice(0, 10));
    };

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
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Left: Logo & Menu */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center transition-all active:scale-95 ${isSidebarOpen ? 'text-[#00ff88] border-[#00ff8830]' : 'text-[#888]'}`}
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #00ff88, #00cc6a)' }}>
                                <Dumbbell size={16} className="text-black" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm tracking-tight text-white leading-none">
                                    <span className="text-[#00ff88]" style={{ textShadow: '0 0 10px rgba(0, 255, 136, 0.5)' }}>CUT</span>
                                    <span className="ml-1">LEAN</span>
                                </span>
                                <span className="text-[8px] font-black tracking-widest text-[#00ff88]/70 uppercase mt-0.5">
                                    Made by Munzinh
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: User Gamification & Logout */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1a1a1a] border border-[#333]">
                            <span className="flex items-center text-[10px] font-bold text-[#ffb800]">
                                <Flame size={12} className="mr-0.5" />{gamification.currentStreak}d
                            </span>
                        </div>
                        <button onClick={onLogout} className="w-9 h-9 flex items-center justify-center rounded-xl text-[#ff4444] hover:bg-[#ff444415] transition-colors" aria-label="Đăng xuất">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* DROPDOWN MENU (Absolute Overlay) */}
                <div className={`absolute top-full left-0 right-0 z-50 overflow-hidden transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${isSidebarOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="mx-4 mt-2 p-3 bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#222] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[450px]">
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: 'daily' as const, icon: Target, label: 'Nhật ký', desc: 'Theo dõi' },
                                { id: 'workout' as const, icon: Dumbbell, label: 'Lịch tập', desc: 'Giáo án' },
                                { id: 'progress' as const, icon: TrendingUp, label: 'Sức mạnh', desc: 'Tiến độ' },
                                { id: 'weekly' as const, icon: Award, label: 'Thống kê', desc: 'Dinh dưỡng' },
                                { id: 'metrics' as const, icon: Activity, label: 'Chỉ số', desc: 'Cơ thể' },
                                { id: 'database' as const, icon: Database, label: 'Thực phẩm', desc: 'Tra cứu' },
                                { id: 'formulas' as const, icon: BookOpen, label: 'Công thức', desc: 'Khoa học' },
                                { id: 'tools' as const, icon: BookOpen, label: 'Công cụ', desc: 'Máy tính' },
                                { id: 'profile' as const, icon: User, label: 'Hồ sơ', desc: 'Mục tiêu' },
                            ].map(t => {
                                const active = tab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setTab(t.id);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`flex items-center gap-2.5 p-2 rounded-xl transition-all border ${active
                                            ? 'bg-[#00ff8810] border-[#00ff8830] text-[#00ff88]'
                                            : 'bg-[#161616] border-[#222] text-[#888] hover:bg-[#1a1a1a] hover:text-white'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-[#00ff88] text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]' : 'bg-[#222] text-[#555]'
                                            }`}>
                                            <t.icon size={16} />
                                        </div>
                                        <div className="text-left overflow-hidden">
                                            <p className="text-[11px] font-bold truncate leading-tight">{t.label}</p>
                                            <p className="text-[9px] opacity-50 truncate">{t.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* BACKDROP FOR DROPDOWN */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 fade-in-backdrop"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}


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
                        />
                    </div>
                )}

                {/* Tab: Body Metrics */}
                {tab === 'metrics' && profile && (
                    <div className="px-4">
                        <BodyMetrics
                            userId={userId}
                            profile={profile}
                            selectedDate={selectedDate}
                            onDateChange={handleDateChange}
                            onUpdate={() => {
                                setProfile(loadProfile(userId));
                                setWeightLogs(loadWeightLogs(userId));
                            }}
                        />
                    </div>
                )}

                {/* Tab: Formulas Guide */}
                {tab === 'formulas' && (
                    <div className="px-4">
                        <FormulasGuide />
                    </div>
                )}

                {/* Tab: MegaCalculator (Công cụ) */}
                {tab === 'tools' && (
                    <div className="px-4 pb-8">
                        <MegaCalculator profile={profile} />
                    </div>
                )}

                {/* Tab: Workout Hub */}
                {tab === 'workout' && (
                    <div className="pb-8">
                        <WorkoutHub userId={userId} />
                    </div>
                )}

                {/* Tab: Progress Dashboard */}
                {tab === 'progress' && (
                    <div className="px-4 pb-8 border-none">
                        <ProgressDashboard userId={userId} />
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
                        <MacroBars current={dailyTotals} target={targets} bodyWeight={profile.weight} />

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

                        {/* Save feedback toast (shows briefly when auto-saving) */}
                        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${savedFeedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className="bg-[#00ff88] text-black text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                <CheckCircle2 size={16} /> Đã lưu!
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
