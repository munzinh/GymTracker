import { useState, useEffect, useRef } from 'react';
import { Plus, Flame, Save, Trash2, Play, Edit2 } from 'lucide-react';
import type { WorkoutSession, WorkoutTemplate, ExerciseSet } from '../../types/workout';
import { getWorkoutSessionByDate, saveSingleWorkoutSession, deleteWorkoutSession, loadWorkoutTemplates, isHistoricalPR, getWeeklySchedule, saveWeeklySchedule, startWorkoutSession, getLastExercisePerformance } from '../../utils/workoutStorage';
import { getWeekStart } from '../../utils/workoutStorage';

interface Props {
    userId: string;
    dateStr: string;
    scheduledTemplateId?: string | null;
    scheduledTemplateName?: string;
    onBack: () => void; // Used to optionally collapse the view
    onScheduleChange?: () => void;
}

export function WorkoutTracker({ userId, dateStr, scheduledTemplateId, onBack, onScheduleChange }: Props) {
    const [log, setLog] = useState<WorkoutSession | null>(null);
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    // For auto-suggest PR
    const [prAlerts, setPrAlerts] = useState<Record<string, boolean>>({});

    // Fetch templates once
    useEffect(() => {
        setTemplates(loadWorkoutTemplates(userId));
    }, [userId]);

    const lastDateStr = useRef(dateStr);
    const hasAutoStarted = useRef(false);

    if (lastDateStr.current !== dateStr) {
        lastDateStr.current = dateStr;
        hasAutoStarted.current = false;
    }

    // Initialize session
    useEffect(() => {
        const existingSession = getWorkoutSessionByDate(userId, dateStr);
        if (existingSession) {
            // Nếu session đang trống (chưa nhập tạ nào) thì thử tự động lấy chỉ số từ các buổi tập trước đó
            if (existingSession.totalVolume === 0 && existingSession.status === 'in_progress') {
                let changed = false;
                const updatedExercises = existingSession.exercises.map(ex => {
                    const lastLog = getLastExercisePerformance(userId, ex.name, dateStr);
                    if (lastLog) {
                        const newSets = ex.sets.map((s, i) => {
                            if (lastLog.sets.length > i && (lastLog.sets[i].weight > 0 || lastLog.sets[i].reps > 0)) {
                                if (s.weight === 0 && s.reps === parseInt(ex.repRange?.split('-')[1] || '0') || s.reps === 0) {
                                    changed = true;
                                    return {
                                        ...s,
                                        weight: lastLog.sets[i].weight,
                                        reps: lastLog.sets[i].reps,
                                        rir: lastLog.sets[i].rir
                                    };
                                }
                            }
                            return s;
                        });
                        return { ...ex, sets: newSets };
                    }
                    return ex;
                });

                if (changed) {
                    const syncedSession = { ...existingSession, exercises: updatedExercises };
                    setLog(syncedSession);
                    // Không lưu liền tránh mất state gốc nếu người dùng không ưng ý, 
                    // nhưng vì ta auto-save khi nhập tay nên lưu tạm cũng được
                    saveSingleWorkoutSession(userId, syncedSession);
                    return;
                }
            }
            setLog(existingSession);
        } else if (!hasAutoStarted.current && scheduledTemplateId && scheduledTemplateId !== 'rest' && templates.length > 0) {
            hasAutoStarted.current = true;
            const tpl = templates.find(t => t.id === scheduledTemplateId);
            if (tpl) {
                const newSession = startWorkoutSession(userId, dateStr, tpl, tpl.name);
                setLog(newSession);
                if (onScheduleChange) onScheduleChange();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, dateStr, scheduledTemplateId]);

    const handleAssignTemplate = (tplId: string) => {
        const tpl = templates.find(t => t.id === tplId);
        if (tpl) {
            // Save to schedule
            const weekStart = getWeekStart(dateStr);
            const schedule = getWeeklySchedule(userId, weekStart);
            schedule.days[dateStr] = { templateId: tpl.id, name: tpl.name, isRest: false };
            saveWeeklySchedule(userId, schedule);

            const newSession = startWorkoutSession(userId, dateStr, tpl, tpl.name);
            setLog(newSession);
            if (onScheduleChange) onScheduleChange();
        }
    };

    const handleStartFreeWorkout = () => {
        const newSession = startWorkoutSession(userId, dateStr, null, "Tự do");
        setLog(newSession);
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: number) => {
        if (!log) return;
        const newLog = { ...log };
        newLog.exercises[exerciseIndex].sets[setIndex] = {
            ...newLog.exercises[exerciseIndex].sets[setIndex],
            [field]: value
        };

        // Recalculate volume for this exercise
        const ex = newLog.exercises[exerciseIndex];
        ex.volume = ex.sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);

        // Recalculate total volume
        newLog.totalVolume = newLog.exercises.reduce((sum, e) => sum + e.volume, 0);

        // Check for PR
        if (field === 'weight' && value > 0 && ex.templateId) {
            const isPR = isHistoricalPR(userId, ex.templateId, value, dateStr);
            setPrAlerts(prev => ({ ...prev, [`${ex.templateId}-${setIndex}`]: isPR }));
        }

        setLog(newLog);

        // Tự động lưu ngầm vào Storage mỗi khi nhập số liệu, 
        // giúp người dùng không cần bấm Hoàn Thành/Lưu nhiều lần
        saveSingleWorkoutSession(userId, newLog);
    };

    const handleSave = () => {
        if (!log) return;

        if (log.status === 'completed' && !isEditing) {
            setIsEditing(true);
            return;
        }

        // Keep it as completed if it was already, else mark completed
        const finalLog = {
            ...log,
            status: 'completed' as const,
            endedAt: log.endedAt || new Date().toISOString()
        };
        saveSingleWorkoutSession(userId, finalLog);
        setLog(finalLog);

        const weekStart = getWeekStart(dateStr);
        const schedule = getWeeklySchedule(userId, weekStart);
        if (schedule.days[dateStr].isRest) {
            schedule.days[dateStr].isRest = false;
            saveWeeklySchedule(userId, schedule);
        }

        if (onScheduleChange) onScheduleChange();

        setIsEditing(false);
        onBack();
    };

    const handleDelete = () => {
        if (!log) return;

        // Completely remove the session instead of marking it skipped
        deleteWorkoutSession(userId, log.id);

        // Refresh calendar view
        if (onScheduleChange) onScheduleChange();

        // Keep view open but reset log (will show specific day's auto-suggest start button)
        setLog(null);
    };

    // Render "Start Workout" Screen if no active session
    if (!log) {
        return (
            <div className="text-center space-y-4 pb-4">
                <div className="space-y-2 mt-4 text-left">
                    {/* Primary Scheduled Template Auto-Suggest */}
                    {scheduledTemplateId && scheduledTemplateId !== 'rest' && templates.find(t => t.id === scheduledTemplateId) && (
                        <div className="mb-4">
                            <button
                                onClick={() => handleAssignTemplate(scheduledTemplateId)}
                                className="w-full p-4 rounded-xl bg-gradient-to-r from-[#111] to-[#1a1a1a] border border-[#00ff88]/30 flex items-center justify-between hover:border-[#00ff88] transition-all group shadow-[0_4px_20px_rgba(0,255,136,0.05)]"
                            >
                                <div className="text-left">
                                    <p className="text-[10px] text-[#00ff88] font-bold uppercase tracking-wider mb-1">Giáo án hôm nay:</p>
                                    <h4 className="text-white text-base font-black group-hover:text-[#00ff88] transition-colors">
                                        {templates.find(t => t.id === scheduledTemplateId)?.name}
                                    </h4>
                                    <span className="text-[11px] text-[#888] font-bold block mt-1">
                                        {templates.find(t => t.id === scheduledTemplateId)?.exercises.length} bài tập
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88] group-hover:scale-110 group-hover:bg-[#00ff88] group-hover:text-black transition-all">
                                    <Play fill="currentColor" size={16} />
                                </div>
                            </button>
                        </div>
                    )}

                    <p className="text-[10px] text-[#666] font-bold uppercase tracking-wider mb-2">Hoặc chọn giáo án khác:</p>

                    {templates.filter(t => t.id !== scheduledTemplateId).map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleAssignTemplate(t.id)}
                            className="w-full p-3 bg-[#111] border border-[#333] rounded-xl flex items-center justify-between hover:border-[#a855f7] transition-all group"
                        >
                            <div>
                                <h4 className="text-white text-sm font-bold group-hover:text-[#a855f7] transition-colors">{t.name}</h4>
                                <span className="text-[10px] text-[#666] uppercase">{t.exercises.length} bài tập</span>
                            </div>
                            <Plus size={16} className="text-[#666] group-hover:text-[#a855f7]" />
                        </button>
                    ))}
                    <button
                        onClick={handleStartFreeWorkout}
                        className="w-full p-3 bg-transparent border border-dashed border-[#444] rounded-xl text-center text-[#888] text-xs font-bold hover:text-white hover:border-[#888] transition-colors mt-2"
                    >
                        + Bắt đầu buổi tập Tự Do
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-[#111] p-2 rounded-xl border border-[#222]">
                <div className="flex gap-4 px-2">
                    <div>
                        <span className="text-[10px] text-[#888] uppercase font-bold block mb-0.5">Volume</span>
                        <span className="text-sm font-black text-[#00ff88]">{log.totalVolume}kg</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-[#888] uppercase font-bold block mb-0.5">Trạng thái</span>
                        <span className={`text-xs font-black uppercase ${log.status === 'completed' ? 'text-[#00ff88]' : 'text-yellow-400'}`}>
                            {log.status === 'completed' ? 'Hoàn Thành' : 'Đang Tập'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDelete}
                        className="p-1.5 text-[#ff4444] hover:bg-[#ff4444]/10 rounded-lg transition-colors border border-transparent hover:border-[#ff4444]/30"
                        title="Hủy / Xóa buổi tập"
                    >
                        <Trash2 size={16} />
                    </button>

                    <button
                        onClick={handleSave}
                        className={`py-1.5 px-3 rounded-lg font-black flex items-center gap-1 text-xs transition-colors ${log.status === 'completed' && !isEditing
                            ? 'bg-transparent border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88]/10'
                            : 'bg-[#00ff88] text-black hover:bg-[#00cc6a]'
                            }`}
                    >
                        {log.status === 'completed' && !isEditing ? (
                            <><Edit2 size={14} /> SỬA LẠI</>
                        ) : (
                            <><Save size={14} /> {log.status === 'completed' ? 'LƯU SỬA' : 'HOÀN THÀNH'}</>
                        )}
                    </button>
                </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
                {log.exercises.map((ex, eIdx) => (
                    <div key={ex.id} className="bg-[#121212] border border-[#222] rounded-xl overflow-hidden">
                        <div className="p-2.5 bg-gradient-to-r from-[#1a1a1a] to-[#121212] border-b border-[#222]">
                            <h4 className="font-black text-white text-xs uppercase tracking-tight flex items-center gap-2">
                                <span className="text-[#00ff88] text-[10px]">{eIdx + 1}.</span> {ex.name}
                            </h4>
                        </div>
                        <div className="p-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[9px] text-[#666] uppercase border-b border-[#222]">
                                        <th className="p-1.5 font-bold w-10 text-center">Set</th>
                                        <th className="p-1.5 font-bold w-20">Kg</th>
                                        <th className="p-1.5 font-bold w-16">Reps</th>
                                        <th className="p-1.5 font-bold w-12 text-center">RIR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ex.sets.map((set, sIdx) => {
                                        const isPr = prAlerts[`${ex.templateId}-${sIdx}`];
                                        return (
                                            <tr key={set.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#1a1a1a] transition-colors group">
                                                <td className="p-1.5 text-center">
                                                    <div className="w-5 h-5 rounded-full bg-[#222] text-[#888] flex items-center justify-center text-[10px] font-bold mx-auto group-focus-within:bg-[#00ff88]/20 group-focus-within:text-[#00ff88] transition-colors">
                                                        {sIdx + 1}
                                                    </div>
                                                </td>
                                                <td className="p-1.5 relative">
                                                    <input
                                                        type="number"
                                                        className={`w-full bg-[#111] border ${isPr ? 'border-[#ff5555] shadow-[0_0_8px_rgba(255,85,85,0.2)]' : 'border-[#333]'} p-1.5 rounded-lg text-white font-black text-xs text-center focus:border-[#00ff88] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        value={set.weight || ''}
                                                        placeholder="0"
                                                        disabled={log.status === 'completed' && !isEditing}
                                                        onChange={(e) => updateSet(eIdx, sIdx, 'weight', parseFloat(e.target.value) || 0)}
                                                    />
                                                    {isPr && <Flame size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ff5555] animate-pulse" />}
                                                </td>
                                                <td className="p-1.5">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[#111] border border-[#333] p-1.5 rounded-lg text-white font-black text-xs text-center focus:border-[#00ff88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        value={set.reps || ''}
                                                        placeholder="0"
                                                        disabled={log.status === 'completed' && !isEditing}
                                                        onChange={(e) => updateSet(eIdx, sIdx, 'reps', parseInt(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="p-1.5">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent border-0 p-1.5 text-[#888] font-bold text-xs text-center focus:text-[#00ff88] focus:bg-[#111] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        value={set.rir ?? ''}
                                                        placeholder="-"
                                                        disabled={log.status === 'completed' && !isEditing}
                                                        onChange={(e) => updateSet(eIdx, sIdx, 'rir', parseInt(e.target.value) || 0)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}


