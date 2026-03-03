import { useState } from 'react';
import { X, Save, CalendarDays } from 'lucide-react';
import type { WeeklySchedule, WorkoutTemplate } from '../../types/workout';
import { loadWorkoutTemplates, saveWeeklySchedule, saveDefaultWeeklySchedule, applyBlueprintToAllWeeks } from '../../utils/workoutStorage';

interface Props {
    userId: string;
    schedule: WeeklySchedule;
    onClose: () => void;
    onSave: (updatedSchedule: WeeklySchedule) => void;
}

export function EditWeeklyScheduleModal({ userId, schedule, onClose, onSave }: Props) {
    const [templates] = useState<WorkoutTemplate[]>(() => loadWorkoutTemplates(userId));

    // Create a local copy of the schedule days to edit
    const [localDays, setLocalDays] = useState(schedule.days);

    const handleSelectTemplate = (dateStr: string, templateId: string) => {
        const tpl = templates.find(t => t.id === templateId);
        setLocalDays(prev => ({
            ...prev,
            [dateStr]: {
                templateId: tpl ? tpl.id : null,
                name: tpl ? tpl.name : 'Tự do',
                isRest: templateId === 'rest'
            }
        }));
    };

    const handleSave = () => {
        const updatedSchedule = {
            ...schedule,
            days: localDays
        };
        saveWeeklySchedule(userId, updatedSchedule);

        // Save as default blueprint for all future weeks
        const blueprint: Record<number, { templateId: string | null, name: string, isRest: boolean }> = {};
        for (const [dateStr, dayObj] of Object.entries(localDays)) {
            const dayNum = new Date(dateStr).getDay();
            blueprint[dayNum] = { ...dayObj };
        }
        saveDefaultWeeklySchedule(userId, blueprint);

        // Apply this blueprint to all currently generated weeks
        applyBlueprintToAllWeeks(userId, blueprint);

        onSave(updatedSchedule);
        onClose();
    };

    // Sort the dates safely to ensure Mon-Sun order (or standard string order)
    const sortedDates = Object.keys(localDays).sort();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
            <div className="bg-[#111] border border-[#333] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#1a1a1a]">
                    <div className="flex items-center gap-2 text-white">
                        <CalendarDays size={20} className="text-[#00ff88]" />
                        <h3 className="font-black text-lg tracking-tight uppercase">Sửa Lịch Cố Định</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-[#888] hover:text-white transition-colors bg-[#222] rounded-xl hover:bg-[#333]">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto space-y-3 flex-1">
                    <p className="text-[11px] text-[#888] font-bold mb-4 uppercase tracking-wider text-center">
                        Gắn giáo án cố định cho các ngày trong tuần
                    </p>

                    {sortedDates.map((dateStr) => {
                        const dayObj = localDays[dateStr];
                        const dateNum = new Date(dateStr).getDay();
                        const dayName = dateNum === 0 ? 'Chủ nhật' : `Thứ ${dateNum + 1}`;
                        const displayDate = new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

                        return (
                            <div key={dateStr} className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#1a1a1a] border border-[#222]">
                                <label className="text-xs font-bold text-white flex items-center justify-between">
                                    <span>[ {dayName} ]</span>
                                    <span className="text-[10px] text-[#666]">{displayDate}</span>
                                </label>
                                <select
                                    className="w-full bg-[#111] border border-[#333] p-2.5 rounded-lg text-sm font-bold text-white focus:border-[#00ff88] transition-colors appearance-none"
                                    value={dayObj.isRest ? 'rest' : (dayObj.templateId || 'free')}
                                    onChange={(e) => handleSelectTemplate(dateStr, e.target.value)}
                                >
                                    <option value="free">-- Tự do (Không có giáo án) --</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                    <option value="rest">💤 Ngày nghỉ (Rest Day)</option>
                                </select>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#222] bg-[#1a1a1a]">
                    <button
                        onClick={handleSave}
                        className="w-full py-3.5 bg-[#00ff88] text-black rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#00cc6a] transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                    >
                        <Save size={18} />
                        LƯU LỊCH CỐ ĐỊNH
                    </button>
                </div>
            </div>
        </div>
    );
}
