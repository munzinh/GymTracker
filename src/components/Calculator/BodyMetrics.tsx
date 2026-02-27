import { useState, useEffect } from 'react';
import { Activity, Plus, X, Ruler } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { UserProfile, WeightLogEntry } from '../../types/nutrition';
import { loadWeightLogs, addWeightLog, getTodayStr } from '../../utils/storage';
import { calcBMI } from '../../utils/nutritionMath';

export function BodyMetrics({ userId, profile }: { userId: string; profile: UserProfile }) {
    const [logs, setLogs] = useState<WeightLogEntry[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [newWeight, setNewWeight] = useState(profile.weight.toString());
    const [newBF, setNewBF] = useState(profile.bodyFatPercentage?.toString() || '');
    const [newWaist, setNewWaist] = useState(profile.waist?.toString() || '');
    const [newHip, setNewHip] = useState(profile.hip?.toString() || '');
    const [newMuscle, setNewMuscle] = useState(profile.muscleMass?.toString() || '');

    useEffect(() => {
        setLogs(loadWeightLogs(userId));
    }, [userId]);

    const handleSave = () => {
        const w = parseFloat(newWeight);
        if (!w) return;

        addWeightLog(userId, getTodayStr(), {
            weight: w,
            bodyFatPercentage: newBF ? parseFloat(newBF) : undefined,
            waist: newWaist ? parseFloat(newWaist) : undefined,
            hip: newHip ? parseFloat(newHip) : undefined,
            muscleMass: newMuscle ? parseFloat(newMuscle) : undefined
        });

        setLogs(loadWeightLogs(userId));
        setIsAdding(false);
    };

    const latest = logs[logs.length - 1] || {
        weight: profile.weight,
        bodyFatPercentage: profile.bodyFatPercentage
    };

    const bmi = calcBMI(latest.weight, profile.height);

    // Prepare chart data (last 30 entries)
    const chartData = logs.slice(-30).map(l => ({
        date: l.date.substring(5), // MM-DD
        weight: l.weight
    }));

    return (
        <div className="space-y-4 fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="text-[#00ff88]" size={20} />
                    Chỉ số Cơ thể
                </h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ff88]/10 text-[#00ff88] rounded-lg text-sm font-bold hover:bg-[#00ff88]/20 transition-colors"
                >
                    <Plus size={16} /> Nhập chỉ số
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#111] border border-[#222] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-[#888] text-[11px] font-bold mb-1 uppercase tracking-wider">Cân nặng</span>
                    <span className="text-white text-xl font-black">{latest.weight}<span className="text-xs text-[#666] ml-0.5">kg</span></span>
                </div>
                <div className="bg-[#111] border border-[#222] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-[#888] text-[11px] font-bold mb-1 uppercase tracking-wider">Body Fat</span>
                    <span className="text-white text-xl font-black">{latest.bodyFatPercentage || '--'}<span className="text-xs text-[#666] ml-0.5">%</span></span>
                </div>
                <div className="bg-[#111] border border-[#222] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-[#888] text-[11px] font-bold mb-1 uppercase tracking-wider">BMI</span>
                    <span className={`text-xl font-black ${bmi > 25 || bmi < 18.5 ? 'text-[#ffb800]' : 'text-[#00ff88]'}`}>
                        {bmi}
                    </span>
                </div>
            </div>

            {/* Line Chart */}
            {chartData.length > 1 && (
                <div className="bg-[#111] border border-[#222] rounded-3xl p-4">
                    <h3 className="text-sm font-bold text-white mb-4">Tiến độ Cân nặng</h3>
                    <div className="h-[200px] w-full">
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

            {/* Detailed Measurements */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-4">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Ruler size={16} className="text-[#aaa]" /> Số đo chi tiết
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                        <span className="text-[#888] font-medium text-sm">Vòng eo</span>
                        <span className="text-white font-bold">{profile.waist ? `${profile.waist} cm` : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                        <span className="text-[#888] font-medium text-sm">Vòng mông</span>
                        <span className="text-white font-bold">{profile.hip ? `${profile.hip} cm` : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#888] font-medium text-sm">Cơ bắp (Muscle Mass)</span>
                        <span className="text-white font-bold">{profile.muscleMass ? `${profile.muscleMass} kg` : '--'}</span>
                    </div>
                </div>
            </div>

            {/* Add Measurement Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 fade-in">
                    <div className="bg-[#111] border border-[#333] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl slide-up">
                        <div className="p-4 border-b border-[#222] flex justify-between items-center">
                            <h3 className="font-bold text-white text-lg">Nhập chỉ số mới</h3>
                            <button onClick={() => setIsAdding(false)} className="p-2 bg-white/5 rounded-full text-[#888] hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#888] uppercase mb-1.5">Cân nặng (kg)</label>
                                    <input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2.5 text-white font-medium outline-none focus:border-[#00ff88]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#888] uppercase mb-1.5">Body Fat (%)</label>
                                    <input type="number" step="0.1" value={newBF} onChange={e => setNewBF(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2.5 text-white font-medium outline-none focus:border-[#00ff88]"
                                        placeholder="Tuỳ chọn" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#888] uppercase mb-1.5">Vòng eo (cm)</label>
                                    <input type="number" step="0.1" value={newWaist} onChange={e => setNewWaist(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2.5 text-white font-medium outline-none focus:border-[#00ff88]"
                                        placeholder="Tuỳ chọn" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#888] uppercase mb-1.5">Vòng mông (cm)</label>
                                    <input type="number" step="0.1" value={newHip} onChange={e => setNewHip(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2.5 text-white font-medium outline-none focus:border-[#00ff88]"
                                        placeholder="Tuỳ chọn" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#888] uppercase mb-1.5">Lượng cơ (kg)</label>
                                <input type="number" step="0.1" value={newMuscle} onChange={e => setNewMuscle(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2.5 text-white font-medium outline-none focus:border-[#00ff88]"
                                    placeholder="Tuỳ chọn" />
                            </div>

                            <button onClick={handleSave} className="w-full py-3.5 mt-2 rounded-xl font-bold transition-all text-black shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #00ff88, #00cc6a)' }}>
                                Lưu chỉ số
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
