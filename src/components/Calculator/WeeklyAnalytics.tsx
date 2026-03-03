import { useMemo } from 'react';
import type { DailyLog, UserProfile, WeightLogEntry } from '../../types/nutrition';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Line } from 'recharts';
import { Info, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { analyzeBodyProgress } from '../../core/analyzers/BodyProgressAnalyzer';
import { loadWorkoutSessions } from '../../utils/workoutStorage';

interface Props {
    userId: string;
    profile: UserProfile;
    logs: DailyLog[];
    weightLogs: WeightLogEntry[];
}

export function WeeklyAnalytics({ userId, profile, logs, weightLogs }: Props) {

    const weekData = useMemo(() => {
        const workoutSessions = loadWorkoutSessions(userId);
        const bodyProgress = analyzeBodyProgress(weightLogs, profile, logs.slice(-30), workoutSessions);
        const daysToShow = 30; // Default to last 30 days

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
    }, [logs, weightLogs, profile, userId]);

    const { bodyProgress } = weekData;

    return (
        <div className="space-y-6 pb-20 fade-in px-1">
            {/* 1. Header & Range Selector */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight">Hành trình & Tiến độ</h2>
                    <p className="text-[11px] text-[#666] font-medium uppercase tracking-widest mt-0.5">Theo dõi sự biến đổi cơ thể</p>
                </div>
            </div>

            {/* 1.5 Transformation Journey */}
            {profile.goal === 'cut' && bodyProgress.fatLossProjection && !bodyProgress.fatLossProjection.isAtTarget && (
                <div className="card p-5 border-white/5 bg-gradient-to-br from-[#111] to-[#1a1a1a] shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-[#00e5ff]/20 rounded-lg">
                            <Target size={16} className="text-[#00e5ff]" />
                        </div>
                        <h3 className="font-black text-[13px] text-white uppercase tracking-wider">Lộ trình Mục tiêu</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-[#888] font-bold uppercase tracking-wider mb-1">Tiến độ giảm mỡ</p>
                                <p className="text-2xl font-black text-white">{Math.round(bodyProgress.fatLossProjection.distanceToTargetPct)}<span className="text-sm text-[#00e5ff]">%</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-[#888] font-bold uppercase tracking-wider mb-1">Dự kiến đạt mục tiêu</p>
                                <p className="text-lg font-black text-[#00ff88]">{bodyProgress.fatLossProjection.estimatedWeeks} tuần</p>
                            </div>
                        </div>

                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div className="text-left"><span className="text-[10px] font-black text-[#aaa]">Hiện xấp xỉ: {bodyProgress.fatLossProjection.currentFatMass.toFixed(1)}kg mỡ</span></div>
                                <div className="text-right"><span className="text-[10px] font-black text-[#00e5ff]">Đích: {bodyProgress.fatLossProjection.targetFatMass.toFixed(1)}kg mỡ</span></div>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-[#222]">
                                <div style={{ width: `${Math.min(100, bodyProgress.fatLossProjection.distanceToTargetPct)}% ` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#00e5ff] to-[#00ff88] rounded-full transition-all duration-1000"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


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

                <div className="h-[280px] w-full mt-4 flex items-center justify-center">
                    {weekData.chartData.length < 2 ? (
                        <div className="text-center space-y-3">
                            <div className="p-4 bg-white/5 rounded-full inline-block">
                                <Info size={24} className="text-[#444]" />
                            </div>
                            <p className="text-xs text-[#666] font-bold uppercase tracking-widest">Cần ít nhất 2 bản ghi InBody<br />để hiển thị xu hướng</p>
                        </div>
                    ) : (
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
                                    dy={5}
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
                                    formatter={(val: number | undefined, name: string | undefined) => {
                                        const labels: Record<string, string> = { weight: 'Cân nặng', muscle: 'Khối cơ (kg)', fatMass: 'Khối mỡ (kg)' };
                                        return [`${val?.toFixed(1) ?? '-'} kg`, labels[name || ''] ?? name];
                                    }}
                                />
                                <Area type="monotone" dataKey="muscle" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorMuscle)" dot={{ r: 4, fill: '#111', stroke: '#00ff88', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#00ff88' }} connectNulls />
                                <Area type="monotone" dataKey="fatMass" stroke="#ff5555" strokeWidth={3} fillOpacity={1} fill="url(#colorFat)" dot={{ r: 4, fill: '#111', stroke: '#ff5555', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#ff5555' }} connectNulls />
                                <Line type="monotone" dataKey="weight" stroke="#aaa" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Visual Legend Diffs */}
                <div className="flex flex-col gap-6 mt-10 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                        <span className="text-xs text-[#666] font-black uppercase">Biến động Cân nặng</span>
                        <div className="flex items-center gap-2">
                            <span className={`text - xl font - black ${bodyProgress.diffs.weight <= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'} `}>
                                {bodyProgress.diffs.weight > 0 ? '+' : ''}{bodyProgress.diffs.weight.toFixed(1)}kg
                            </span>
                            {bodyProgress.diffs.weight <= 0 ? <ArrowDownRight size={20} className="text-[#00ff88]" /> : <ArrowUpRight size={20} className="text-[#ff4444]" />}
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                        <span className="text-xs text-[#666] font-black uppercase">Biến động Cơ bắp</span>
                        <div className="flex items-center gap-2">
                            <span className={`text - xl font - black ${bodyProgress.diffs.muscle >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'} `}>
                                {bodyProgress.diffs.muscle > 0 ? '+' : ''}{bodyProgress.diffs.muscle.toFixed(1)}kg
                            </span>
                            {bodyProgress.diffs.muscle >= 0 ? <ArrowUpRight size={20} className="text-[#00ff88]" /> : <ArrowDownRight size={20} className="text-[#ff4444]" />}
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                        <span className="text-xs text-[#666] font-black uppercase">Biến động Mỡ</span>
                        <div className="flex items-center gap-2">
                            <span className={`text - xl font - black ${bodyProgress.diffs.fat <= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'} `}>
                                {bodyProgress.diffs.fat > 0 ? '+' : ''}{bodyProgress.diffs.fat.toFixed(1)}kg
                            </span>
                            {bodyProgress.diffs.fat <= 0 ? <ArrowDownRight size={20} className="text-[#00ff88]" /> : <ArrowUpRight size={20} className="text-[#ff4444]" />}
                        </div>
                    </div>
                </div>
            </div >

            {/* 4. Segmental Focus & Detail */}
            < div className="grid grid-cols-1 gap-4" >
                {/* Nutrition Adherence TB last 7 days */}
                < div className="card p-5 border-white/5 bg-[#121212]" >
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
                                        return <Cell key={`n - ${index} `} fill={isOver ? '#ff3333' : '#00ff88'} opacity={entry.calories === 0 ? 0.2 : 1} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div >


            </div >
        </div >
    );
}
