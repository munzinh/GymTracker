import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import { Dumbbell, AlertTriangle, TrendingDown, TrendingUp, Minus, Trash2 } from 'lucide-react';
import { getStrengthChange } from '../../utils/calculations';

const EXERCISES = {
    'Ngực / Vai / Tay': ['Incline Press', 'Lat Pulldown', 'Chest Row'],
    'Chân / Mông': ['Leg Press', 'Hip Thrust'],
};

const today = () => format(new Date(), 'yyyy-MM-dd');

export function StrengthTracker() {
    const { addStrengthLog, deleteStrengthLog, data } = useApp();
    const [form, setForm] = useState({
        date: today(),
        exercise: 'Incline Press',
        sets: '3',
        reps: '8',
        weightKg: '',
    });
    const [saved, setSaved] = useState(false);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.weightKg) return;
        addStrengthLog({
            date: form.date,
            exercise: form.exercise,
            sets: parseInt(form.sets),
            reps: parseInt(form.reps),
            weightKg: parseFloat(form.weightKg),
        });
        setSaved(true);
        setForm(f => ({ ...f, weightKg: '' }));
        setTimeout(() => setSaved(false), 1500);
    };

    const allExercises = Object.values(EXERCISES).flat();

    return (
        <div className="space-y-4">
            {/* Form */}
            <div className="card fade-in">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Dumbbell size={18} className="text-[#00ff88]" />
                    Nhập bài tập
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[#888] text-xs mb-1 block">Ngày</label>
                            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[#888] text-xs mb-1 block">Bài tập</label>
                            <select value={form.exercise} onChange={e => set('exercise', e.target.value)}>
                                {Object.entries(EXERCISES).map(([group, exs]) => (
                                    <optgroup key={group} label={group}>
                                        {exs.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[#888] text-xs mb-1 block">Số set</label>
                            <input type="number" min={1} value={form.sets} onChange={e => set('sets', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[#888] text-xs mb-1 block">Số rep</label>
                            <input type="number" min={1} value={form.reps} onChange={e => set('reps', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[#888] text-xs mb-1 block">Tạ (kg) *</label>
                            <input type="number" step="2.5" placeholder="60" value={form.weightKg}
                                onChange={e => set('weightKg', e.target.value)} required />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full">
                        {saved ? '✅ Đã lưu!' : 'Lưu bài tập'}
                    </button>
                </form>
            </div>

            {/* Comparison vs last week */}
            <div className="card fade-in">
                <h3 className="font-semibold text-white mb-4 text-sm">So sánh với tuần trước</h3>
                <div className="space-y-3">
                    {allExercises.map(ex => {
                        const { thisWeek, lastWeek, change } = getStrengthChange(data.strengthLogs, ex);
                        if (thisWeek === null && lastWeek === null) return null;

                        const isDropping = change !== null && change < -5;
                        const isGaining = change !== null && change > 0;

                        return (
                            <div key={ex}
                                className={`p-3 rounded-xl ${isDropping ? 'warn-red' : 'bg-[#1a1a1a]'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm font-medium">{ex}</span>
                                    {change !== null && (
                                        <div className={`flex items-center gap-1 text-xs font-semibold ${isDropping ? 'text-[#ff4444]' : isGaining ? 'text-[#00ff88]' : 'text-[#888]'
                                            }`}>
                                            {isDropping ? <TrendingDown size={14} /> : isGaining ? <TrendingUp size={14} /> : <Minus size={14} />}
                                            {change > 0 ? '+' : ''}{change.toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-1.5 text-xs text-[#888]">
                                    {lastWeek !== null && <span>Tuần trước: <strong className="text-white">{lastWeek}kg</strong></span>}
                                    {thisWeek !== null && <span>Tuần này: <strong className="text-[#00ff88]">{thisWeek}kg</strong></span>}
                                </div>
                                {isDropping && (
                                    <div className="flex items-center gap-1 mt-1.5 text-[#ff4444] text-xs">
                                        <AlertTriangle size={12} />
                                        <span>⚠️ Sức mạnh giảm &gt;5% — Có nguy cơ mất cơ!</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {allExercises.every(ex => {
                        const { thisWeek, lastWeek } = getStrengthChange(data.strengthLogs, ex);
                        return thisWeek === null && lastWeek === null;
                    }) && (
                            <p className="text-[#555] text-sm text-center py-4">Chưa có dữ liệu bài tập</p>
                        )}
                </div>
            </div>

            {/* Recent strength logs */}
            {data.strengthLogs.length > 0 && (
                <div className="card fade-in">
                    <h3 className="font-semibold text-white mb-3 text-sm">Logs gần đây</h3>
                    <div className="space-y-1.5">
                        {[...data.strengthLogs]
                            .sort((a, b) => b.date.localeCompare(a.date))
                            .slice(0, 10)
                            .map(log => (
                                <div key={log.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1e1e1e] last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[#888]">{log.date.slice(5)}</span>
                                        <span className="text-white">{log.exercise}</span>
                                        <span className="text-[#00ff88] font-semibold">{log.weightKg}kg</span>
                                        <span className="text-[#555]">{log.sets}×{log.reps}</span>
                                    </div>
                                    <button onClick={() => deleteStrengthLog(log.id)}
                                        className="text-[#333] hover:text-[#ff4444] transition-colors">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
