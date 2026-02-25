import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const today = () => format(new Date(), 'yyyy-MM-dd');

export function DailyForm() {
    const { addDailyLog } = useApp();
    const [form, setForm] = useState({
        date: today(),
        weight: '',
        calories: '',
        protein: '',
        cardioMinutes: '',
        steps: '',
        notes: '',
    });
    const [saved, setSaved] = useState(false);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.weight || !form.calories || !form.protein) return;
        addDailyLog({
            date: form.date,
            weight: parseFloat(form.weight),
            calories: parseInt(form.calories),
            protein: parseInt(form.protein),
            cardioMinutes: parseInt(form.cardioMinutes || '0'),
            steps: form.steps ? parseInt(form.steps) : undefined,
            notes: form.notes || undefined,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="card fade-in">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <PlusCircle size={18} className="text-[#00ff88]" />
                Nhật ký hàng ngày
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[#888] text-xs mb-1 block">Ngày</label>
                        <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[#888] text-xs mb-1 block">Cân nặng (kg) *</label>
                        <input type="number" step="0.1" placeholder="72.5" value={form.weight}
                            onChange={e => set('weight', e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-[#888] text-xs mb-1 block">Calories ăn vào *</label>
                        <input type="number" placeholder="1800" value={form.calories}
                            onChange={e => set('calories', e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-[#888] text-xs mb-1 block">Protein (g) *</label>
                        <input type="number" placeholder="150" value={form.protein}
                            onChange={e => set('protein', e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-[#888] text-xs mb-1 block">Cardio (phút)</label>
                        <input type="number" placeholder="30" value={form.cardioMinutes}
                            onChange={e => set('cardioMinutes', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[#888] text-xs mb-1 block">Bước chân</label>
                        <input type="number" placeholder="8000" value={form.steps}
                            onChange={e => set('steps', e.target.value)} />
                    </div>
                </div>
                <div>
                    <label className="text-[#888] text-xs mb-1 block">Ghi chú</label>
                    <textarea placeholder="Hôm nay cảm thấy..." value={form.notes}
                        onChange={e => set('notes', e.target.value)}
                        rows={2} className="resize-none" />
                </div>
                <button type="submit" className="btn-primary w-full">
                    {saved ? '✅ Đã lưu!' : 'Lưu nhật ký'}
                </button>
            </form>
        </div>
    );
}

export function LogHistory() {
    const { data, deleteDailyLog } = useApp();
    const [showAll, setShowAll] = useState(false);

    const sorted = [...data.dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
    const displayed = showAll ? sorted : sorted.slice(0, 7);

    if (sorted.length === 0) return null;

    return (
        <div className="card fade-in">
            <h3 className="font-semibold text-white mb-3 text-sm">Lịch sử gần đây</h3>
            <div className="space-y-2">
                {displayed.map(log => (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <span className="text-white text-sm font-medium">{log.date.slice(5)}</span>
                                <span className="text-[#00ff88] font-bold text-sm">{log.weight}kg</span>
                                <span className="text-[#888] text-xs">{log.calories}kcal</span>
                                <span className="text-[#888] text-xs">P:{log.protein}g</span>
                                {log.cardioMinutes > 0 && (
                                    <span className="text-[#4a9eff] text-xs">🏃{log.cardioMinutes}'</span>
                                )}
                            </div>
                            {log.notes && <p className="text-[#555] text-xs mt-0.5 truncate">{log.notes}</p>}
                        </div>
                        <button onClick={() => deleteDailyLog(log.id)}
                            className="text-[#333] hover:text-[#ff4444] transition-colors ml-2 flex-shrink-0">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
            {sorted.length > 7 && (
                <button onClick={() => setShowAll(!showAll)}
                    className="btn-secondary w-full mt-3 flex items-center justify-center gap-1 text-xs">
                    {showAll ? <><ChevronUp size={14} /> Thu gọn</> : <><ChevronDown size={14} /> Xem tất cả ({sorted.length})</>}
                </button>
            )}
        </div>
    );
}
