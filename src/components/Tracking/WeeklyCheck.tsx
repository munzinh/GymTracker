import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { format, startOfWeek } from 'date-fns';
import { Scale } from 'lucide-react';

export function WeeklyCheck() {
    const { addWeeklyCheck, data } = useApp();
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    const existing = data.weeklyChecks.find(c => c.weekStart === weekStart);

    const [form, setForm] = useState({
        waist: existing?.waist?.toString() || '',
        bodyFat: existing?.bodyFat?.toString() || '',
    });
    const [saved, setSaved] = useState(false);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addWeeklyCheck({
            weekStart,
            waist: form.waist ? parseFloat(form.waist) : undefined,
            bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="card fade-in">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                <Scale size={18} className="text-[#4a9eff]" />
                Kiểm tra tuần này
            </h3>
            <p className="text-[#555] text-xs mb-4">Tuần bắt đầu: {weekStart}</p>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[#888] text-xs mb-1 block">Vòng eo (cm)</label>
                        <input type="number" step="0.5" placeholder="80" value={form.waist}
                            onChange={e => set('waist', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[#888] text-xs mb-1 block">Body Fat (%)</label>
                        <input type="number" step="0.1" placeholder="18.5" value={form.bodyFat}
                            onChange={e => set('bodyFat', e.target.value)} />
                        <p className="text-[#444] text-[10px] mt-0.5">Dùng thước đo / app DEXA</p>
                    </div>
                </div>

                {/* Lịch sử weekly checks */}
                {data.weeklyChecks.length > 0 && (
                    <div className="mt-3">
                        <p className="text-[#555] text-xs mb-2 uppercase tracking-wide">Lịch sử tuần</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                            {[...data.weeklyChecks]
                                .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
                                .map(c => (
                                    <div key={c.id} className="flex items-center gap-4 py-1.5 border-b border-[#1e1e1e] last:border-0 text-xs">
                                        <span className="text-[#888]">{c.weekStart.slice(5)}</span>
                                        {c.bodyFat && <span className="text-[#4a9eff]">BF: {c.bodyFat}%</span>}
                                        {c.waist && <span className="text-white">Eo: {c.waist}cm</span>}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                <button type="submit" className="btn-primary w-full">
                    {saved ? '✅ Đã lưu!' : 'Lưu kiểm tra tuần'}
                </button>
            </form>
        </div>
    );
}
