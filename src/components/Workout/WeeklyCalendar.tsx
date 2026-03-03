import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Play, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { WeeklySchedule } from '../../types/workout';
import { getWorkoutSessionByDate } from '../../utils/workoutStorage';
import { WorkoutTracker } from './WorkoutTracker';

interface Props {
    userId: string;
    schedule: WeeklySchedule;
    programStartDate: string;
    currentWeekStart: string;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onScheduleChange: () => void;
}

export function WeeklyCalendar({
    userId,
    schedule,
    programStartDate,
    currentWeekStart,
    onPrevWeek,
    onNextWeek,
    onScheduleChange
}: Props) {
    const todayStr = new Date().toISOString().split('T')[0];
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    // Calculate "Tuần X"
    const weekNumber = useMemo(() => {
        const start = new Date(programStartDate);
        const current = new Date(currentWeekStart);
        // Normalize to Monday of that week
        const diffTime = current.getTime() - start.getTime();
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        return Math.max(1, diffWeeks + 1);
    }, [programStartDate, currentWeekStart]);

    // Build array of 7 days
    const days = useMemo(() => {
        const result = [];
        const start = new Date(currentWeekStart);
        for (let i = 0; i < 7; i++) {
            const dStr = start.toISOString().split('T')[0];
            const data = schedule?.days[dStr] || { name: 'Chưa có lịch', isRest: false, templateId: null };

            // Look up the session for this exact date
            const session = getWorkoutSessionByDate(userId, dStr);

            let status: 'upcoming' | 'missed' | 'completed' | 'in_progress' | 'today' = 'upcoming';

            if (session?.status === 'completed') {
                status = 'completed';
            } else if (session?.status === 'in_progress') {
                status = 'in_progress';
            } else if (dStr === todayStr) {
                status = 'today';
            } else if (dStr < todayStr && !data.isRest) {
                status = 'missed';
            }

            result.push({
                dateStr: dStr,
                dayName: i === 6 ? 'Chủ nhật' : `Thứ ${i + 2}`,
                dateObj: new Date(start.getTime()),
                name: data.name,
                isRest: data.isRest,
                templateId: data.templateId,
                status
            });
            start.setDate(start.getDate() + 1);
        }
        return result;
    }, [schedule, userId, todayStr, currentWeekStart]);

    const dateRangeStr = useMemo(() => {
        if (days.length === 0) return '';
        const start = days[0].dateObj;
        const end = days[6].dateObj;
        const formatStr = (d: Date) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        return `${formatStr(start)} - ${formatStr(end)}`;
    }, [days]);

    const toggleExpand = (dateStr: string) => {
        setExpandedDate(prev => prev === dateStr ? null : dateStr);
    };

    return (
        <div className="space-y-4 fade-in">
            {/* Week Navigation Header */}
            <div className="flex items-center justify-between card p-3 bg-[#111] border-[#222]">
                <button
                    onClick={onPrevWeek}
                    className="p-2 text-[#888] hover:text-white transition-colors bg-[#1a1a1a] rounded-xl border border-[#333]"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                    <h3 className="font-black text-lg text-white uppercase tracking-tight">Tuần {weekNumber}</h3>
                    <p className="text-[11px] text-[#00ff88] font-bold">{dateRangeStr}</p>
                </div>
                <button
                    onClick={onNextWeek}
                    className="p-2 text-[#888] hover:text-white transition-colors bg-[#1a1a1a] rounded-xl border border-[#333]"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Vertical Days List */}
            <div className="space-y-3">
                {days.map(d => {
                    const isToday = d.status === 'today';
                    const isCompleted = d.status === 'completed';
                    const isInProgress = d.status === 'in_progress';
                    const isMissed = d.status === 'missed';
                    const isExpanded = expandedDate === d.dateStr;

                    const dateDisplayStr = d.dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

                    let borderClass = 'border-[#222]';
                    if (isToday) borderClass = 'border-[#00ff88]/50 shadow-[0_0_15px_rgba(0,255,136,0.1)]';
                    if (isCompleted) borderClass = 'border-[#00ff88]/30';
                    if (isMissed) borderClass = 'border-[#ff4444]/30';

                    return (
                        <div key={d.dateStr} className="fade-in">
                            <button
                                onClick={() => toggleExpand(d.dateStr)}
                                className={`w-full card p-4 bg-[#111] text-left transition-all ${borderClass} hover:bg-[#151515]`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-[11px] font-bold mb-1 ${isToday ? 'text-[#00ff88]' : 'text-[#888]'}`}>
                                            [ {d.dayName} - {dateDisplayStr} ]
                                            {isToday && <span className="ml-2 text-[9px] bg-[#00ff88]/20 px-1.5 py-0.5 rounded text-[#00ff88]">HÔM NAY</span>}
                                        </p>
                                        <h4 className={`text-lg font-black tracking-tight ${isCompleted || isToday || isInProgress ? 'text-white' : 'text-[#666]'}`}>
                                            {d.isRest ? 'Rest Day' : d.name}
                                        </h4>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {isCompleted && (
                                            <div className="flex items-center gap-1 text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded-lg">
                                                <CheckCircle2 size={14} />
                                                <span className="text-[10px] font-bold uppercase">Completed</span>
                                            </div>
                                        )}
                                        {isInProgress && (
                                            <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg">
                                                <Play size={14} fill="currentColor" />
                                                <span className="text-[10px] font-bold uppercase">In Progress</span>
                                            </div>
                                        )}
                                        {isMissed && (
                                            <span className="text-[10px] text-[#ff4444] font-bold uppercase mr-1">Missed</span>
                                        )}

                                        <div className="text-[#444]">
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Inline Workout Tracker Expansion */}
                            {isExpanded && (
                                <div className="mt-2 bg-[#0a0a0a] rounded-2xl border border-[#222] p-4 animate-in slide-in-from-top-4 fade-in duration-200">
                                    <WorkoutTracker
                                        userId={userId}
                                        dateStr={d.dateStr}
                                        scheduledTemplateId={d.templateId}
                                        onBack={() => setExpandedDate(null)}
                                        onScheduleChange={onScheduleChange}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
