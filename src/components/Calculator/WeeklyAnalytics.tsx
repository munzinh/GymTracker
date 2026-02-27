import { useMemo } from 'react';
import type { DailyLog, UserProfile, AdaptiveSuggestion, WeightLogEntry } from '../../types/nutrition';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { TrendingDown, Zap, AlertTriangle, Info } from 'lucide-react';
import { markSuggestionRead } from '../../utils/storage';

interface Props {
    userId: string;
    profile: UserProfile;
    logs: DailyLog[];
    weightLogs: WeightLogEntry[];
    suggestions: AdaptiveSuggestion[];
    onSuggestionsUpdate: () => void;
}

export function WeeklyAnalytics({ userId, logs, weightLogs, suggestions, onSuggestionsUpdate }: Props) {
    // 1. Chart Data Prep (Last 7 Days)
    const weekData = useMemo(() => {
        const days = [];
        let totalCals = 0;
        let totalTargetCals = 0;
        let totalProtein = 0;
        let loggedDays = 0;

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const log = logs.find(l => l.date === dateStr);
            const wLog = weightLogs.find(w => w.date === dateStr);

            const targetCals = log?.targets?.calories || 0;
            const cals = log?.dailyTotals?.calories || 0;
            const protein = log?.dailyTotals?.protein || 0;

            if (cals > 0) {
                totalCals += cals;
                totalTargetCals += targetCals;
                totalProtein += protein;
                loggedDays++;
            }

            days.push({
                date: dateStr,
                label: i === 0 ? 'Nay' : d.toLocaleDateString('vi-VN', { weekday: 'short' }),
                calories: cals,
                target: targetCals,
                protein: protein,
                weight: wLog?.weight || null // Null for gaps in line chart
            });
        }

        const avgCals = loggedDays > 0 ? Math.round(totalCals / loggedDays) : 0;
        const avgTarget = loggedDays > 0 ? Math.round(totalTargetCals / loggedDays) : 0;
        const avgProtein = loggedDays > 0 ? Math.round(totalProtein / loggedDays) : 0;
        const avgDeficit = avgTarget - avgCals;
        const estimatedFatLoss = (avgDeficit * 7) / 7700; // 1kg fat = ~7700 kcal

        return { days, avgCals, avgTarget, avgProtein, avgDeficit, estimatedFatLoss, loggedDays };
    }, [logs, weightLogs]);

    const activeSuggestions = suggestions.filter(s => s.status === 'new' || s.status === 'read');

    const handleAcknowledge = (id: string) => {
        markSuggestionRead(userId, id);
        onSuggestionsUpdate();
    };

    return (
        <div className="space-y-5 pb-6 fade-in">
            {/* 1. Coaching Suggestions (Premium Adaptive Engine) */}
            {activeSuggestions.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs text-[#888] font-bold uppercase tracking-widest pl-1">Phân tích từ Coach</h3>
                    {activeSuggestions.map(s => {
                        let colorClass = 'suggest-blue border-[#00e5ff33]';
                        let Icon = Zap;
                        let iconColor = 'text-[#00e5ff]';

                        if (s.type === 'decrease_calories') {
                            colorClass = 'warn-yellow border-[#ffb80044] bg-[#ffb80011]';
                            Icon = AlertTriangle;
                            iconColor = 'text-[#ffb800]';
                        } else if (s.type === 'increase_calories') {
                            colorClass = 'bg-[#ff444411] border-[#ff444444]';
                            Icon = AlertTriangle;
                            iconColor = 'text-[#ff4444]';
                        } else if (s.type === 'increase_protein') {
                            colorClass = 'border-[#00ff8844] bg-[#00ff8811]';
                            Icon = Info;
                            iconColor = 'text-[#00ff88]';
                        }

                        return (
                            <div key={s.id} className={`p-4 rounded-xl border ${colorClass} relative`}>
                                <div className="flex gap-3">
                                    <Icon size={20} className={`${iconColor} shrink-0 mt-0.5`} />
                                    <div>
                                        <h4 className="font-bold text-white mb-1 leading-tight">{s.title}</h4>
                                        <p className="text-sm text-[#ccc] leading-relaxed mb-3">{s.message}</p>

                                        <div className="flex items-center gap-3">
                                            {s.actionLabel && (
                                                <button className="px-4 py-2 bg-[#1a1a1a] text-white text-xs font-bold rounded-lg border border-[#333] hover:border-[#666] transition-colors shadow-lg">
                                                    {s.actionLabel}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleAcknowledge(s.id)}
                                                className="text-xs text-[#888] hover:text-white underline underline-offset-2 transition-colors">
                                                Đã hiểu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* 2. Key Insights Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="card p-4 border-[#00ff8833]">
                    <span className="text-[10px] text-[#888] uppercase font-bold tracking-widest flex items-center gap-1.5 mb-2">
                        <TrendingDown size={12} className="text-[#00ff88]" /> Thâm hụt TB
                    </span>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-white">{weekData.avgDeficit > 0 ? weekData.avgDeficit : 0}</span>
                        <span className="text-xs text-[#666] mb-1">kcal/ngày</span>
                    </div>
                </div>

                <div className="card p-4 border-[#00e5ff33]">
                    <span className="text-[10px] text-[#888] uppercase font-bold tracking-widest flex items-center gap-1.5 mb-2">
                        <Zap size={12} className="text-[#00e5ff]" /> Ước tính giảm
                    </span>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-white">{weekData.estimatedFatLoss > 0 ? weekData.estimatedFatLoss.toFixed(2) : '0.00'}</span>
                        <span className="text-xs text-[#666] mb-1">kg mỡ/tuần</span>
                    </div>
                </div>
            </div>

            {/* 3. 7-Day Calorie Chart */}
            <div className="card p-4">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="font-bold text-sm text-white">Lượng Calo 7 ngày</h3>
                        <p className="text-xs text-[#888]">TB: <span className="text-white font-medium">{weekData.avgCals} kcal</span> / {weekData.avgTarget}</p>
                    </div>
                    {weekData.loggedDays < 7 && (
                        <div className="text-[10px] text-[#ffb800] bg-[#ffb80022] px-2 py-1 rounded border border-[#ffb80044]">
                            Thiếu {7 - weekData.loggedDays} ngày data
                        </div>
                    )}
                </div>

                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weekData.days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ background: '#121212', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#00ff88', fontWeight: 'bold' }}
                                formatter={(val: number | undefined) => val !== undefined ? [`${val} kcal`, 'Đã nạp'] as [string, string] : ['0 kcal', 'Đã nạp'] as [string, string]}
                            />
                            {/* Target Line */}
                            {weekData.avgTarget > 0 && (
                                <ReferenceLine y={weekData.avgTarget} stroke="#333" strokeDasharray="4 4" />
                            )}
                            <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={32}>
                                {weekData.days.map((entry, index) => {
                                    const isOver = entry.target > 0 && entry.calories > entry.target;
                                    return <Cell key={`cell-${index}`} fill={isOver ? '#ff3333' : '#00ff88'} opacity={entry.calories === 0 ? 0.2 : 1} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 4. Weight Trend Chart (if data exists) */}
            {weightLogs.length > 1 && (
                <div className="card p-4 border-[#222]">
                    <div className="mb-4">
                        <h3 className="font-bold text-sm text-white">Xu hướng Cân nặng</h3>
                        <p className="text-xs text-[#888]">Biến động gần đây</p>
                    </div>

                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weekData.days} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                                <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                                <Tooltip
                                    contentStyle={{ background: '#121212', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                                    formatter={(val: number | undefined) => val !== undefined ? [`${val} kg`, 'Cân nặng'] as [string, string] : ['0 kg', 'Cân nặng'] as [string, string]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#00e5ff"
                                    strokeWidth={3}
                                    dot={{ fill: '#121212', stroke: '#00e5ff', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#00e5ff' }}
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

        </div>
    );
}
