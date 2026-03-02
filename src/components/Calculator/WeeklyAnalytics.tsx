import { useMemo, useState } from 'react';
import type { DailyLog, UserProfile, WeightLogEntry } from '../../types/nutrition';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Line } from 'recharts';
import { Target, Zap, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { analyzeBodyProgress } from '../../core/analyzers/BodyProgressAnalyzer';

interface Props {
    userId: string;
    profile: UserProfile;
    logs: DailyLog[];
    weightLogs: WeightLogEntry[];
}

export function WeeklyAnalytics({ profile, logs, weightLogs }: Props) {
    const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '180D'>('30D');

    const weekData = useMemo(() => {
        const bodyProgress = analyzeBodyProgress(weightLogs, profile, logs.slice(-30));
        const rangeMap = { '7D': 7, '30D': 30, '90D': 90, '180D': 180 };
        const daysToShow = rangeMap[timeRange];

        const logsToShow = weightLogs.slice(-daysToShow);
        const chartData = logsToShow.map(w => ({
            date: w.date.substring(5), // MM-DD
            weight: w.weight,
            muscle: w.muscleMass || null,
            fatPct: w.bodyFatPercentage || null,
            fatMass: w.bodyFatPercentage ? (w.weight * w.bodyFatPercentage) / 100 : null,
        }));

        // Calorie Analytics for last 7 days (fixed window for nutrition overview)
        const nutritionDays = [];
        let totalCals = 0;
        let totalTargetCals = 0;
        let loggedDays = 0;

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const log = logs.find(l => l.date === dateStr);

            if (log?.dailyTotals?.calories) {
                totalCals += log.dailyTotals.calories;
                totalTargetCals += log.targets?.calories || 0;
                loggedDays++;
            }
            nutritionDays.push({
                label: i === 0 ? 'Nay' : d.toLocaleDateString('vi-VN', { weekday: 'short' }),
                calories: log?.dailyTotals?.calories || 0,
                target: log?.targets?.calories || 0,
            });
        }

        const avgDeficit = loggedDays > 0 ? Math.round((totalTargetCals - totalCals) / loggedDays) : 0;

        return {
            bodyProgress,
            chartData,
            nutritionDays,
            avgDeficit,
            loggedDays
        };
    }, [logs, weightLogs, profile, timeRange]);

    const { bodyProgress } = weekData;

    return (
        <div className="space-y-6 pb-20 fade-in px-1">
            {/* 1. Header & Range Selector */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight">Báo cáo Tiến độ</h2>
                    <p className="text-[11px] text-[#666] font-medium uppercase tracking-widest mt-0.5">Body Progress System v2.0</p>
                </div>
                <div className="flex bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-inner">
                    {(['7D', '30D', '90D', '180D'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${timeRange === range
                                ? 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                                : 'text-[#666] hover:text-[#aaa]'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Primary Insights - Modular Vertical Blocks */}
            <div className="flex flex-col gap-4">
                {/* Block 4: Average Deficit */}
                <div className="card p-6 bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-[#00ff88] font-black uppercase tracking-widest block mb-1">Thâm hụt Trung bình</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[#00ff88]">{weekData.avgDeficit}</span>
                            <span className="text-[#888] font-bold text-xs uppercase">Kcal / ngày</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-[#00ff8811] rounded-full flex items-center justify-center border border-[#00ff8822]">
                        <Zap size={20} className="text-[#00ff88]" />
                    </div>
                </div>

                {/* Block 5: Deficit Risk (Extra modular block) */}
                {bodyProgress.deficitRisk && (
                    <div className={`card p-6 flex items-start gap-4 ${bodyProgress.deficitRisk.level === 'high' ? 'border-orange-500/30 bg-orange-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                        <div className={`p-3 rounded-2xl ${bodyProgress.deficitRisk.level === 'high' ? 'bg-orange-500/20 text-orange-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            <Zap size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-black text-xs uppercase tracking-tight mb-2 ${bodyProgress.deficitRisk.level === 'high' ? 'text-orange-500' : 'text-yellow-500'}`}>
                                Phân tích Thâm hụt
                            </h4>
                            <p className="text-sm text-[#888] font-medium leading-relaxed">
                                {bodyProgress.deficitRisk.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* Block 6: Weekly Surplus Warning */}
                {weekData.avgDeficit < 0 && (
                    <div className="card p-6 border-[#ff444455] bg-[#ff444405] flex items-start gap-4 shadow-lg animate-pulse-subtle">
                        <div className="p-3 bg-[#ff444422] rounded-2xl text-[#ff4444]">
                            <Target size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[#ff4444] font-black text-xs uppercase tracking-tight mb-2">Cảnh báo: Xu hướng Dư Calo</h4>
                            <p className="text-sm text-[#888] font-medium leading-relaxed">
                                Trung bình tuần này bạn đang nạp dư <span className="text-white font-bold">{Math.abs(weekData.avgDeficit)} kcal/ngày</span>.
                                Điều này có thể làm chậm quá trình giảm mỡ hoặc gây tăng mỡ không mong muốn.
                            </p>
                            <div className="mt-3 p-3 bg-[#00ff8810] rounded-xl border border-[#00ff8822]">
                                <span className="text-[10px] text-[#00ff88] font-black uppercase tracking-widest block mb-1">Lời khuyên cho tuần tới</span>
                                <p className="text-xs text-white/80 font-medium">Tăng cường vận động thêm 15-20 phút mỗi ngày và ưu tiên thực phẩm nguyên bản (Whole foods) để kiểm soát cơn đói tốt hơn.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Trend Charts - Unified Modern Visualization */}
            <div className="card p-6 bg-[#111] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#aaa] via-[#00ff88] to-[#ff5555]" />
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="font-black text-base text-white flex items-center gap-2">
                            Xu hướng Thành phần
                            <Info size={14} className="text-[#444]" />
                        </h3>
                        <p className="text-[10px] text-[#666] font-bold uppercase tracking-widest mt-0.5">Dữ liệu phân tích InBody</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#aaa]" />
                            <span className="text-[10px] font-black text-[#888] uppercase">Cân nặng</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />
                            <span className="text-[10px] font-black text-[#00ff88] uppercase">Khối Cơ</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5555]" />
                            <span className="text-[10px] font-black text-[#ff5555] uppercase">Mỡ cơ thể</span>
                        </div>
                    </div>
                </div>

                <div className="h-[280px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weekData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff5555" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ff5555" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(18,18,18,0.95)',
                                    border: '1px solid #333',
                                    borderRadius: '16px',
                                    fontSize: '11px',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                                    padding: '12px'
                                }}
                                itemStyle={{ padding: '2px 0' }}
                                labelStyle={{ fontWeight: 900, marginBottom: '8px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}
                                formatter={(val: any, name: any) => {
                                    const labels: Record<string, string> = { weight: 'Cân nặng', muscle: 'Khối cơ (kg)', fatMass: 'Khối mỡ (kg)' };
                                    return [`${val?.toFixed(1) ?? '-'} kg`, labels[name] ?? name];
                                }}
                            />
                            <Area type="monotone" dataKey="muscle" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorMuscle)" dot={{ r: 4, fill: '#111', stroke: '#00ff88', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#00ff88' }} connectNulls />
                            <Area type="monotone" dataKey="fatMass" stroke="#ff5555" strokeWidth={3} fillOpacity={1} fill="url(#colorFat)" dot={{ r: 4, fill: '#111', stroke: '#ff5555', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#ff5555' }} connectNulls />
                            <Line type="monotone" dataKey="weight" stroke="#aaa" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Visual Legend Diffs */}
                <div className="flex flex-col gap-6 mt-10 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                        <span className="text-xs text-[#666] font-black uppercase">Biến động Cân nặng</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-black ${bodyProgress.diffs.weight <= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                                {bodyProgress.diffs.weight > 0 ? '+' : ''}{bodyProgress.diffs.weight.toFixed(1)}kg
                            </span>
                            {bodyProgress.diffs.weight <= 0 ? <ArrowDownRight size={20} className="text-[#00ff88]" /> : <ArrowUpRight size={20} className="text-[#ff4444]" />}
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                        <span className="text-xs text-[#666] font-black uppercase">Biến động Cơ bắp</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-black ${bodyProgress.diffs.muscle >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                                {bodyProgress.diffs.muscle > 0 ? '+' : ''}{bodyProgress.diffs.muscle.toFixed(1)}kg
                            </span>
                            {bodyProgress.diffs.muscle >= 0 ? <ArrowUpRight size={20} className="text-[#00ff88]" /> : <ArrowDownRight size={20} className="text-[#ff4444]" />}
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                        <span className="text-xs text-[#666] font-black uppercase">Biến động Mỡ</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-black ${bodyProgress.diffs.fat <= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                                {bodyProgress.diffs.fat > 0 ? '+' : ''}{bodyProgress.diffs.fat.toFixed(1)}kg
                            </span>
                            {bodyProgress.diffs.fat <= 0 ? <ArrowDownRight size={20} className="text-[#00ff88]" /> : <ArrowUpRight size={20} className="text-[#ff4444]" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Segmental Focus & Detail */}
            <div className="grid grid-cols-1 gap-4">
                {/* Nutrition Adherence TB last 7 days */}
                <div className="card p-5 border-white/5 bg-[#121212]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-sm text-white uppercase tracking-tight">Tuân thủ Dinh dưỡng (7D)</h3>
                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-[#888] font-bold">TB: {weekData.avgDeficit} kcal / ngày</span>
                    </div>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weekData.nutritionDays}>
                                <XAxis dataKey="label" tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                                    contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '11px' }}
                                    itemStyle={{ color: '#00ff88', fontWeight: 900 }}
                                />
                                <Bar dataKey="calories" radius={[6, 6, 6, 6]} maxBarSize={30}>
                                    {weekData.nutritionDays.map((entry, index) => {
                                        const isOver = entry.target > 0 && entry.calories > entry.target + 100;
                                        return <Cell key={`n-${index}`} fill={isOver ? '#ff3333' : '#00ff88'} opacity={entry.calories === 0 ? 0.2 : 1} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>


            </div>
        </div>
    );
}
