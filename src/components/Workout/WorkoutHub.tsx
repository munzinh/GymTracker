import { useState, useCallback } from 'react';
import { Edit2, CalendarDays } from 'lucide-react';
import type { WeeklySchedule } from '../../types/workout';
import { getWeeklySchedule, getWeekStart } from '../../utils/workoutStorage';
import { loadProfile } from '../../utils/storage';
import { WeeklyCalendar } from './WeeklyCalendar';
import { TemplateManager } from './TemplateManager';
import { EditWeeklyScheduleModal } from './EditWeeklyScheduleModal';

interface Props {
    userId: string;
}

type ViewState = 'calendar' | 'templates';

export function WorkoutHub({ userId }: Props) {
    const todayStr = new Date().toISOString().split('T')[0];
    const initialWeekStart = getWeekStart(todayStr);

    const [view, setView] = useState<ViewState>('calendar');
    const [currentWeekStart, setCurrentWeekStart] = useState<string>(initialWeekStart);

    const [schedule, setSchedule] = useState<WeeklySchedule | null>(() => getWeeklySchedule(userId, initialWeekStart));
    const [programStartDate] = useState<string>(() => {
        const profile = loadProfile(userId);
        if (profile?.programStartDate) return profile.programStartDate.split('T')[0];
        if (profile?.createdAt) return profile.createdAt.split('T')[0];
        return todayStr;
    });
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const refreshSchedule = useCallback(() => {
        setSchedule(getWeeklySchedule(userId, currentWeekStart));
    }, [userId, currentWeekStart]);

    const handlePrevWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() - 7);
        const newDate = d.toISOString().split('T')[0];
        setCurrentWeekStart(newDate);
        setSchedule(getWeeklySchedule(userId, newDate));
    };

    const handleNextWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + 7);
        const newDate = d.toISOString().split('T')[0];
        setCurrentWeekStart(newDate);
        setSchedule(getWeeklySchedule(userId, newDate));
    };

    if (!schedule) return null;

    return (
        <div className="space-y-4 px-4 pb-24 fade-in">
            {view === 'calendar' && (
                <>
                    {/* Schedule Header / Actions */}
                    <div className="flex justify-between items-center mb-2">
                        <button
                            onClick={() => setShowScheduleModal(true)}
                            className="bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider hover:bg-[#00ff88]/10 transition-colors"
                        >
                            <CalendarDays size={14} /> Cố định lịch tập
                        </button>
                    </div>

                    {/* Weekly Calendar View (Now Vertical) */}
                    <WeeklyCalendar
                        userId={userId}
                        schedule={schedule}
                        programStartDate={programStartDate}
                        currentWeekStart={currentWeekStart}
                        onPrevWeek={handlePrevWeek}
                        onNextWeek={handleNextWeek}
                        onScheduleChange={refreshSchedule}
                    />

                    {/* Template Manager Quick Access */}
                    <button
                        onClick={() => setView('templates')}
                        className="w-full card p-4 mt-6 bg-gradient-to-r from-[#111] to-[#1a1a1a] border-[#222] flex items-center justify-between group hover:border-[#a855f7]/50 transition-all font-bold"
                    >
                        <div className="text-left">
                            <h4 className="font-black text-sm text-white uppercase tracking-tight">Quản lý Giáo án</h4>
                            <p className="text-[11px] text-[#888]">Tạo lịch tập, thay đổi bài tập</p>
                        </div>
                        <div className="bg-[#222] p-2 rounded-lg group-hover:bg-[#a855f7]/20 transition-colors">
                            <Edit2 size={16} className="text-[#a855f7]" />
                        </div>
                    </button>
                </>
            )}

            {view === 'templates' && (
                <TemplateManager
                    userId={userId}
                    onBack={() => setView('calendar')}
                />
            )}

            {showScheduleModal && schedule && (
                <EditWeeklyScheduleModal
                    userId={userId}
                    schedule={schedule}
                    onClose={() => setShowScheduleModal(false)}
                    onSave={(newSched) => setSchedule(newSched)}
                />
            )}
        </div>
    );
}
