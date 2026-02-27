import { useState } from 'react';
import type { UserProfile, ActivityLevel, Sex } from '../../types/nutrition';

interface Props {
    profile: UserProfile | null;
    onSave: (p: UserProfile) => void;
}

const ACTIVITY_MAP: Record<ActivityLevel, { label: string, mult: number }> = {
    sedentary: { label: 'Ít vận động (nhân viên văn phòng)', mult: 1.2 },
    light: { label: 'Vận động nhẹ (tập 1-3 ngày/tuần)', mult: 1.375 },
    moderate: { label: 'Vận động vừa (tập 3-5 ngày/tuần)', mult: 1.55 },
    active: { label: 'Vận động nhiều (tập 6-7 ngày/tuần)', mult: 1.725 },
    very_active: { label: 'Vận động rất nhiều (VĐV, lao động nặng)', mult: 1.9 },
};

const GOALS = [
    { id: 'cut', label: 'Giảm mỡ (Cut)' },
    { id: 'maintain', label: 'Giữ cân' },
    { id: 'bulk', label: 'Tăng cơ (Bulk)' },
];

export function ProfileSetup({ profile, onSave }: Props) {
    const [form, setForm] = useState<Partial<UserProfile>>(profile || {
        weight: 70, height: 170, age: 25, sex: 'male',
        activityLevel: 'moderate', goal: 'cut'
    });

    const set = (k: keyof UserProfile, v: any) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = () => {
        if (!form.weight || !form.height || !form.age) return;

        onSave({
            ...form,
            id: form.id || Date.now().toString(),
            createdAt: form.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as UserProfile);
    };

    return (
        <div className="card space-y-5 fade-in">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white neon-text-green">Thiết lập hồ sơ</h2>
                <p className="text-sm text-[#888] mt-1">Thông tin càng chuẩn, AI tính toán càng chính xác.</p>
            </div>

            {/* Sex Selection */}
            <div className="flex bg-[#111] rounded-xl overflow-hidden border border-[#222]">
                {(['male', 'female'] as Sex[]).map(s => (
                    <button key={s} onClick={() => set('sex', s)}
                        className={`flex-1 py-3 text-sm font-bold transition-all ${form.sex === s ? 'bg-[#00ff8822] text-[#00ff88]' : 'text-[#666] hover:bg-[#1a1a1a]'}`}>
                        {s === 'male' ? '♂ Nam' : '♀ Nữ'}
                    </button>
                ))}
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Cân nặng (kg)', key: 'weight', type: 'number' },
                    { label: 'Chiều cao (cm)', key: 'height', type: 'number' },
                    { label: 'Tuổi', key: 'age', type: 'number' },
                ].map(({ label, key, type }) => (
                    <div key={key}>
                        <label className="text-[10px] text-[#888] block mb-1.5 uppercase font-medium">{label}</label>
                        <input type={type}
                            value={form[key as keyof UserProfile] as any}
                            onChange={e => set(key as keyof UserProfile, Number(e.target.value))}
                            className="text-center font-bold text-lg" />
                    </div>
                ))}
            </div>

            {/* Optional Body Comp */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-[#888] block mb-1.5 uppercase font-medium">Tỷ lệ mỡ (BF%) - <i>Tùy chọn</i></label>
                    <input type="number"
                        placeholder="VD: 15"
                        value={form.bodyFatPercentage || ''}
                        onChange={e => set('bodyFatPercentage', Number(e.target.value))}
                        className="text-center font-bold" />
                </div>
                <div>
                    <label className="text-[10px] text-[#888] block mb-1.5 uppercase font-medium">Mục tiêu ưu tiên</label>
                    <select value={form.goal} onChange={e => set('goal', e.target.value)} className="font-bold">
                        {GOALS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Activity */}
            <div>
                <label className="text-[10px] text-[#888] block mb-1.5 uppercase font-medium">Mức vận động</label>
                <select value={form.activityLevel} onChange={e => set('activityLevel', e.target.value)} className="font-bold">
                    {Object.entries(ACTIVITY_MAP).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>
            </div>

            <button onClick={handleSave} className="btn-primary w-full py-3.5 text-lg mt-4 shadow-lg">
                {profile ? 'Cập nhật hồ sơ' : 'Bắt đầu ngay 🚀'}
            </button>
        </div>
    );
}
