import { useState, useEffect, useMemo } from 'react';
import { Plus, Zap, ChevronLeft, ChevronRight, Activity, Edit2, X, Calendar } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { UserProfile, WeightLogEntry } from '../../types/nutrition';
import { loadWeightLogs, addWeightLog, getTodayStr } from '../../utils/storage';
import { calcBMI } from '../../utils/nutritionMath';
import { calculateFitnessScore } from '../../core/engine/FitnessScorer';
import type { BodyMetrics as BodyMetricsModel } from '../../core/data/models';

export function BodyMetrics({
    userId,
    profile,
    selectedDate,
    onDateChange,
    onUpdate
}: {
    userId: string;
    profile: UserProfile;
    selectedDate: string;
    onDateChange: (date: string) => void;
    onUpdate?: () => void
}) {
    const [logs, setLogs] = useState<WeightLogEntry[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [newWeight, setNewWeight] = useState(profile.weight.toString());
    const [newBF, setNewBF] = useState(profile.bodyFatPercentage?.toString() || '');
    const [newMuscle, setNewMuscle] = useState(profile.muscleMass?.toString() || '');
    const [newVisceral, setNewVisceral] = useState(profile.visceralFat?.toString() || '');

    // Segmental Muscle (KG)
    const [newLAm, setNewLAm] = useState(profile.leftArmMuscle?.toString() || '');
    const [newRAm, setNewRAm] = useState(profile.rightArmMuscle?.toString() || '');
    const [newTrm, setNewTrm] = useState(profile.trunkMuscle?.toString() || '');
    const [newLlm, setNewLlm] = useState(profile.leftLegMuscle?.toString() || '');
    const [newRlm, setNewRlm] = useState(profile.rightLegMuscle?.toString() || '');

    // Segmental Fat (KG)
    const [newLAf, setNewLAf] = useState(profile.leftArmFat?.toString() || '');
    const [newRAf, setNewRAf] = useState(profile.rightArmFat?.toString() || '');
    const [newTrf, setNewTrf] = useState(profile.trunkFat?.toString() || '');
    const [newLlf, setNewLlf] = useState(profile.leftLegFat?.toString() || '');
    const [newRlf, setNewRlf] = useState(profile.rightLegFat?.toString() || '');

    useEffect(() => {
        setLogs(loadWeightLogs(userId));
    }, [userId]);

    const dataForDate = useMemo(() => {
        return logs.find(l => l.date === selectedDate);
    }, [logs, selectedDate]);

    // Update form when dataForDate or selectedDate changes
    useEffect(() => {
        if (dataForDate) {
            setNewWeight(dataForDate.weight.toString());
            setNewBF(dataForDate.bodyFatPercentage?.toString() || '');
            setNewMuscle(dataForDate.muscleMass?.toString() || '');
            setNewVisceral(dataForDate.visceralFat?.toString() || '');
            setNewLAm(dataForDate.leftArmMuscle?.toString() || '');
            setNewRAm(dataForDate.rightArmMuscle?.toString() || '');
            setNewTrm(dataForDate.trunkMuscle?.toString() || '');
            setNewLlm(dataForDate.leftLegMuscle?.toString() || '');
            setNewRlm(dataForDate.rightLegMuscle?.toString() || '');
            setNewLAf(dataForDate.leftArmFat?.toString() || '');
            setNewRAf(dataForDate.rightArmFat?.toString() || '');
            setNewTrf(dataForDate.trunkFat?.toString() || '');
            setNewLlf(dataForDate.leftLegFat?.toString() || '');
            setNewRlf(dataForDate.rightLegFat?.toString() || '');
        } else {
            // Default to profile or empty
            setNewWeight(profile.weight.toString());
            setNewBF(profile.bodyFatPercentage?.toString() || '');
            setNewMuscle(profile.muscleMass?.toString() || '');
            setNewVisceral(profile.visceralFat?.toString() || '');
            // ... segmental defaults omitted for brevity in reset but good to have
        }
    }, [dataForDate, selectedDate, profile]);

    const handleSave = () => {
        const w = parseFloat(newWeight);
        if (!w) return;

        addWeightLog(userId, selectedDate, {
            weight: w,
            bodyFatPercentage: newBF ? parseFloat(newBF) : undefined,
            muscleMass: newMuscle ? parseFloat(newMuscle) : undefined,
            visceralFat: newVisceral ? parseFloat(newVisceral) : undefined,
            leftArmMuscle: newLAm ? parseFloat(newLAm) : undefined,
            rightArmMuscle: newRAm ? parseFloat(newRAm) : undefined,
            trunkMuscle: newTrm ? parseFloat(newTrm) : undefined,
            leftLegMuscle: newLlm ? parseFloat(newLlm) : undefined,
            rightLegMuscle: newRlm ? parseFloat(newRlm) : undefined,
            leftArmFat: newLAf ? parseFloat(newLAf) : undefined,
            rightArmFat: newRAf ? parseFloat(newRAf) : undefined,
            trunkFat: newTrf ? parseFloat(newTrf) : undefined,
            leftLegFat: newLlf ? parseFloat(newLlf) : undefined,
            rightLegFat: newRlf ? parseFloat(newRlf) : undefined
        });

        setLogs(loadWeightLogs(userId));
        if (onUpdate) onUpdate();
        setIsAdding(false);
    };

    const latest = dataForDate || logs[logs.length - 1] || {
        weight: profile.weight,
        bodyFatPercentage: profile.bodyFatPercentage,
        muscleMass: profile.muscleMass
    };

    const navigateDate = (dir: -1 | 1) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + dir);
        onDateChange(d.toISOString().slice(0, 10));
    };

    const isToday = selectedDate === getTodayStr();

    // Calculate InBody styled metrics
    const bmi = calcBMI(latest.weight, profile.height);
    const bodyFatMass = latest.bodyFatPercentage ? (latest.weight * latest.bodyFatPercentage) / 100 : 0;
    const lbm = latest.weight - bodyFatMass; // Lean Body Mass

    // Central Intelligence Scoring
    const metricsLogs: BodyMetricsModel[] = logs.map(l => ({
        weight: l.weight,
        bodyFatPercentage: l.bodyFatPercentage,
        muscleMass: l.muscleMass,
        visceralFat: l.visceralFat,
        height: profile.height,
        recordedAt: l.date
    }));

    const currentMetrics = metricsLogs.length > 0
        ? metricsLogs[metricsLogs.length - 1]
        : { weight: profile.weight, height: profile.height, recordedAt: getTodayStr() } as BodyMetricsModel;

    // Central Intelligence Scoring
    const fitnessScore = calculateFitnessScore(currentMetrics, profile.sex);


    // weightControl logic moved to Engine Action Plan in NutritionHub
    // Using simple recommendations here if needed locally or through props


    // Chart Data
    const chartData = logs.slice(-30).map(l => ({
        date: l.date.substring(5), // MM-DD
        weight: l.weight
    }));


    return (
        <div className="space-y-4 fade-in pb-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="text-[#00ff88]" size={20} />
                    Chỉ số cơ thể
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAdding(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 ${dataForDate ? 'bg-[#00e5ff]/10 text-[#00e5ff]' : 'bg-[#00ff88]/10 text-[#00ff88]'} rounded-lg text-sm font-bold hover:opacity-80 transition-all`}
                    >
                        {dataForDate ? <Edit2 size={16} /> : <Plus size={16} />}
                        {dataForDate ? 'Sửa dữ liệu' : 'Nhập liệu'}
                    </button>
                </div>
            </div>

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
                    <span className="text-[10px] text-[#666]">
                        {(() => {
                            const [y, m, d] = selectedDate.split('-');
                            return `${d}/${m}/${y}`;
                        })()}
                    </span>
                </div>
                <button onClick={() => navigateDate(1)} disabled={selectedDate >= getTodayStr()}
                    className="p-2 bg-[#1a1a1a] rounded-lg text-[#888] hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-[#888]">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Fitness Score Widget */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-bl-[100px]" />
                <span className="text-[#888] text-[10px] font-black uppercase tracking-[0.2em] mb-3 z-10 flex items-center gap-2">
                    <Zap size={14} className="text-[#00ff88]" /> Điểm thể hình
                </span>
                <div className="relative z-10 flex items-baseline gap-2">
                    <span className="text-6xl font-black text-white dropdown-glow" style={{ textShadow: '0 0 30px rgba(0,255,136,0.4)' }}>
                        {fitnessScore}
                    </span>
                    <span className="text-lg font-bold text-[#444]">/100</span>
                </div>
            </div>

            {/* Body Composition Analysis */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-6 shadow-xl">
                <h3 className="text-[10px] font-black text-[#555] mb-6 uppercase tracking-[0.2em]">Phân tích thành phần</h3>
                <div className="space-y-6">
                    {/* Weight */}
                    <div className="group">
                        <div className="flex justify-between items-end mb-2 px-1">
                            <span className="text-xs text-[#888] font-bold">Cân nặng (Weight)</span>
                            <span className="text-xl font-black text-white">{latest.weight}<span className="text-[10px] text-[#444] ml-1 uppercase">kg</span></span>
                        </div>
                        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                            <div className="h-full bg-gradient-to-r from-[#888] to-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, (latest.weight / 120) * 100)}%` }} />
                        </div>
                    </div>

                    {/* SMM */}
                    <div className="group">
                        <div className="flex justify-between items-end mb-2 px-1">
                            <span className="text-xs text-[#888] font-bold">Lượng Cơ (SMM)</span>
                            <span className="text-xl font-black text-[#00ff88]">{latest.muscleMass || '--'}<span className="text-[10px] text-[#00ff8855] ml-1 uppercase">kg</span></span>
                        </div>
                        <div className="h-2.5 w-full bg-[#00ff8808] rounded-full overflow-hidden p-[1px]">
                            <div className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-full transition-all duration-1000 ease-out" style={{ width: latest.muscleMass ? `${Math.min(100, (latest.muscleMass / (latest.weight * 0.7)) * 100)}%` : '0%' }} />
                        </div>
                    </div>

                    {/* Body Fat Mass */}
                    <div className="group">
                        <div className="flex justify-between items-end mb-2 px-1">
                            <span className="text-xs text-[#888] font-bold">Lượng Mỡ (BFM)</span>
                            <span className="text-xl font-black text-[#ffb800]">{bodyFatMass ? bodyFatMass.toFixed(1) : '--'}<span className="text-[10px] text-[#ffb80055] ml-1 uppercase">kg</span></span>
                        </div>
                        <div className="h-2.5 w-full bg-[#ffb80008] rounded-full overflow-hidden p-[1px]">
                            <div className="h-full bg-gradient-to-r from-[#ffb800] to-[#ff9500] rounded-full transition-all duration-1000 ease-out" style={{ width: bodyFatMass ? `${Math.min(100, (bodyFatMass / (latest.weight * 0.5)) * 100)}%` : '0%' }} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
                    <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5 transition-all hover:bg-white/[0.08]">
                        <span className="text-[9px] text-[#555] uppercase font-black tracking-widest mb-1.5">BMI</span>
                        <span className={`text-lg font-black ${bmi > 25 ? 'text-[#ffb800]' : 'text-white'}`}>{bmi}</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5 transition-all hover:bg-white/[0.08]">
                        <span className="text-[9px] text-[#555] uppercase font-black tracking-widest mb-1.5">Mỡ cơ thể</span>
                        <span className="text-lg font-black text-white">{latest.bodyFatPercentage || '--'}<span className="text-[10px] text-[#444]">%</span></span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5 transition-all hover:bg-white/[0.08]">
                        <span className="text-[9px] text-[#555] uppercase font-black tracking-widest mb-1.5">LBM</span>
                        <span className="text-lg font-black text-white">{lbm ? lbm.toFixed(1) : '--'}<span className="text-[10px] text-[#444]">kg</span></span>
                    </div>
                </div>
            </div>

            {/* Segmental Composition Report */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-5">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-bold text-[#888] uppercase tracking-wider">Phân tích chuyên sâu (kg)</h3>
                    <div className="flex gap-2 text-[10px] font-bold uppercase">
                        <span className="flex items-center gap-1 text-[#00ff88]"><div className="w-2 h-2 rounded-full bg-[#00ff88]" /> Cơ (Muscle)</span>
                        <span className="flex items-center gap-1 text-[#ffb800]"><div className="w-2 h-2 rounded-full bg-[#ffb800]" /> Mỡ (Fat)</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { label: 'Tay Trái', mKey: 'leftArmMuscle', fKey: 'leftArmFat' },
                        { label: 'Tay Phải', mKey: 'rightArmMuscle', fKey: 'rightArmFat' },
                        { label: 'Thân', mKey: 'trunkMuscle', fKey: 'trunkFat' },
                        { label: 'Chân Trái', mKey: 'leftLegMuscle', fKey: 'leftLegFat' },
                        { label: 'Chân Phải', mKey: 'rightLegMuscle', fKey: 'rightLegFat' },
                    ].map((item, i) => {
                        const mVal = (latest as unknown as Record<string, number | undefined>)[item.mKey];
                        const fVal = (latest as unknown as Record<string, number | undefined>)[item.fKey];

                        return (
                            <div key={i} className="group">
                                <div className="flex justify-between text-xs mb-1.5 px-1">
                                    <span className="text-[#aaa] font-bold">{item.label}</span>
                                    <div className="flex gap-3">
                                        <div className="flex items-center">
                                            <span className="text-[#00ff88] font-black">{mVal || '--'}</span>
                                            <span className="text-[10px] text-[#444] ml-0.5">kg</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-[#ffb800] font-black">{fVal || '--'}</span>
                                            <span className="text-[10px] text-[#444] ml-0.5">kg</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden flex p-[1px]">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-l-full transition-all duration-500"
                                        style={{ width: mVal ? `${(mVal / (latest.muscleMass || 10)) * 20}%` : '0%' }}
                                    />
                                    <div
                                        className="h-full bg-gradient-to-r from-[#ffb800] to-[#ff9500] rounded-r-full transition-all duration-500 border-l border-black/20"
                                        style={{ width: fVal ? `${(fVal / (bodyFatMass || 10)) * 20}%` : '0%' }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Line Chart */}
            {chartData.length > 1 && (
                <div className="bg-[#111] border border-[#222] rounded-3xl p-4">
                    <h3 className="text-sm font-bold text-[#888] mb-4 uppercase tracking-wider">Tiến độ Cân nặng</h3>
                    <div className="h-[160px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#00ff88', fontWeight: 'bold' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#00ff88"
                                    strokeWidth={3}
                                    dot={{ r: 3, fill: '#000', stroke: '#00ff88', strokeWidth: 2 }}
                                    activeDot={{ r: 5, fill: '#00ff88' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Add Measurement Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 fade-in">
                    <div className="bg-[#111] border border-[#333] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl slide-up max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-[#222] flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-white text-lg">Cập nhật chỉ số InBody</h3>
                            <button onClick={() => setIsAdding(false)} className="p-2 bg-white/5 rounded-full text-[#888] hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto hide-scrollbar space-y-5">
                            {/* Core Stats */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-[#00ff88] uppercase tracking-wider">Chỉ số cốt lõi</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#888] uppercase mb-1.5">Cân nặng (kg)*</label>
                                        <input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-[#00ff88]" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#888] uppercase mb-1.5">Tỉ lệ mỡ cơ thể (%)</label>
                                        <input type="number" step="0.1" value={newBF} onChange={e => setNewBF(e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-[#00ff88]"
                                            placeholder="Tuỳ chọn" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#888] uppercase mb-1.5">Cơ - SMM (kg)</label>
                                        <input type="number" step="0.1" value={newMuscle} onChange={e => setNewMuscle(e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-[#00ff88]"
                                            placeholder="Tuỳ chọn" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#888] uppercase mb-1.5">Cấp độ mỡ nội tạng (Level)</label>
                                        <input type="number" step="1" value={newVisceral} onChange={e => setNewVisceral(e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-[#00ff88]"
                                            placeholder="1-20" />
                                        <p className="text-[9px] text-[#555] mt-1 italic leading-tight">
                                            * Thường có trên máy InBody hoặc cân điện tử thông minh.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[#222]" />

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-[#00e5ff] uppercase tracking-wider">Phân tích Segmental (kg)</h4>
                                <div className="space-y-4">
                                    {/* Segmental Lean (Muscle) */}
                                    <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#222] shadow-inner">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-4 bg-[#00ff88] rounded-full" />
                                            <label className="text-[11px] text-white font-black uppercase">Khối lượng Cơ (Lean Mass)</label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-[#666] font-bold uppercase ml-1">Tay Trái</span>
                                                <input type="number" step="0.1" value={newLAm} onChange={e => setNewLAm(e.target.value)} className="w-full bg-black/40 border border-[#333] p-2.5 rounded-xl text-sm text-[#00ff88] font-bold focus:border-[#00ff88] outline-none" placeholder="0.0" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-[#666] font-bold uppercase ml-1">Tay Phải</span>
                                                <input type="number" step="0.1" value={newRAm} onChange={e => setNewRAm(e.target.value)} className="w-full bg-black/40 border border-[#333] p-2.5 rounded-xl text-sm text-[#00ff88] font-bold focus:border-[#00ff88] outline-none" placeholder="0.0" />
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <span className="text-[9px] text-[#666] font-bold uppercase ml-1">Thân (Trunk)</span>
                                                <input type="number" step="0.1" value={newTrm} onChange={e => setNewTrm(e.target.value)} className="w-full bg-black/40 border border-[#333] p-2.5 rounded-xl text-sm text-[#00ff88] font-bold focus:border-[#00ff88] outline-none" placeholder="0.0" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-[#666] font-bold uppercase ml-1">Chân Trái</span>
                                                <input type="number" step="0.1" value={newLlm} onChange={e => setNewLlm(e.target.value)} className="w-full bg-black/40 border border-[#333] p-2.5 rounded-xl text-sm text-[#00ff88] font-bold focus:border-[#00ff88] outline-none" placeholder="0.0" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-[#666] font-bold uppercase ml-1">Chân Phải</span>
                                                <input type="number" step="0.1" value={newRlm} onChange={e => setNewRlm(e.target.value)} className="w-full bg-black/40 border border-[#333] p-2.5 rounded-xl text-sm text-[#00ff88] font-bold focus:border-[#00ff88] outline-none" placeholder="0.0" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Segmental Fat */}
                                    <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#222] shadow-inner">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-4 bg-[#ffb800] rounded-full" />
                                            <label className="text-[11px] text-white font-black uppercase">Khối lượng Mỡ (Fat Mass)</label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-[#666] font-bold uppercase ml-1">Tay Trái</span>
                                                <input type="number" step="0.1" value={newLAf} onChange={e => setNewLAf(e.target.value)} className="w-full bg-black/40 border border-[#333] p-2.5 rounded-xl text-sm text-[#ffb800] font-bold focus:border-[#ffb800] outline-none" placeholder="0.0" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-[#666] font-bold uppercase ml-1">Tay Phải</span>
                                                <input type="number" step="0.1" value={newRAf} onChange={e => setNewRAf(e.target.value)} className="w-full bg-black/40 border border-[#333] p-2.5 rounded-xl text-sm text-[#ffb800] font-bold focus:border-[#ffb800] outline-none" placeholder="0.0" />
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <span className="text-[9px] text-[#666] font-bold uppercase ml-1">Thân (Trunk)</span>
                                                <input type="number" step="0.1" value={newTrf} onChange={e => setNewTrf(e.target.value)} className="w-full bg-black/40 border border-[#333] p-2.5 rounded-xl text-sm text-[#ffb800] font-bold focus:border-[#ffb800] outline-none" placeholder="0.0" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-[#666] font-bold uppercase ml-1">Chân Trái</span>
                                                <input type="number" step="0.1" value={newLlf} onChange={e => setNewLlf(e.target.value)} className="w-full bg-black/40 border border-[#333] p-2.5 rounded-xl text-sm text-[#ffb800] font-bold focus:border-[#ffb800] outline-none" placeholder="0.0" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-[#666] font-bold uppercase ml-1">Chân Phải</span>
                                                <input type="number" step="0.1" value={newRlf} onChange={e => setNewRlf(e.target.value)} className="w-full bg-black/40 border border-[#333] p-2.5 rounded-xl text-sm text-[#ffb800] font-bold focus:border-[#ffb800] outline-none" placeholder="0.0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-[#222] bg-[#111] shrink-0">
                            <button onClick={handleSave} className="w-full py-3.5 rounded-xl font-bold transition-all text-black shadow-[0_4px_15px_rgba(0,255,136,0.3)]"
                                style={{ background: 'linear-gradient(135deg, #00ff88, #00cc6a)' }}>
                                Lưu kết quả InBody
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
