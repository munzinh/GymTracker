import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Flame, Trophy, Calendar, Target, Activity, ActivityIcon } from 'lucide-react';
import { loadWorkoutSessions } from '../../utils/workoutStorage';
import { loadWeightLogs } from '../../utils/storage';
import {
    getWeeklyVolumeData,
    getStrengthProgressionData,
    detectAllPRs,
    getConsistencyData,
    getMuscleGroupDistribution,
    getBestExercise
} from '../../utils/progressAnalytics';

interface Props {
    userId: string;
}

export function ProgressDashboard({ userId }: Props) {
    const sessions = useMemo(() => loadWorkoutSessions(userId), [userId]);
    const weightLogs = useMemo(() => loadWeightLogs(userId), [userId]);

    // Data Hooks
    const volumeData = useMemo(() => getWeeklyVolumeData(sessions, 8).reverse(), [sessions]);
    const prData = useMemo(() => detectAllPRs(sessions), [sessions]);
    const consistencyData = useMemo(() => getConsistencyData(sessions, 8).reverse(), [sessions]);
    const muscleGroups = useMemo(() => getMuscleGroupDistribution(sessions), [sessions]);
    const bestExercise = useMemo(() => getBestExercise(sessions), [sessions]);

    // Extract all unique completed exercises for the strength chart dropdown
    const allExercises = useMemo(() => {
        const set = new Set<string>();
        sessions.filter(s => s.status === 'completed').forEach(s => s.exercises.forEach(e => set.add(e.name)));
        return Array.from(set).sort();
    }, [sessions]);

    const [selectedExercise, setSelectedExercise] = useState<string>(allExercises[0] || '');
    const strengthData = useMemo(() => {
        if (!selectedExercise) return [];
        return getStrengthProgressionData(sessions, selectedExercise, 8).reverse();
    }, [sessions, selectedExercise]);

    // Volume Growth %
    const avgRecentVol = volumeData.length > 1 ? volumeData[volumeData.length - 1].totalVolume : 0;
    const avgPrevVol = volumeData.length > 2 ? volumeData[volumeData.length - 2].totalVolume : 0;
    const volGrowth = avgPrevVol > 0 ? ((avgRecentVol - avgPrevVol) / avgPrevVol) * 100 : (avgRecentVol > 0 ? 100 : 0);

    if (sessions.filter(s => s.status === 'completed').length === 0 && weightLogs.length === 0) {
        return (
            <div className="p-8 text-center bg-[#111] rounded-3xl border border-[#222] mt-4 fade-in">
                <Target size={48} className="mx-auto text-[#444] mb-4" />
                <h3 className="text-white font-black uppercase text-lg mb-2">Chưa đủ dữ liệu</h3>
                <p className="text-[#888] text-sm">Hãy hoàn thành ít nhất 1 buổi tập hoặc cập nhật chỉ số cơ thể để xem biểu đồ tiến độ nhé!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in pb-8">
            {/* Main Header */}
            <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <TrendingUp className="text-[#00ff88]" size={24} /> Tiến Độ Cá Nhân
                </h2>
                <p className="text-[#888] text-xs font-bold mt-1 tracking-wide">TỔNG QUAN THEO THỜI GIAN</p>
            </div>

            {/* BODY METRICS CHART */}
            {weightLogs.length > 0 && (
                <div className="bg-[#111] border border-[#222] rounded-3xl p-4 shadow-lg relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase flex items-center gap-1.5">
                                <ActivityIcon size={16} className="text-neon-blue" /> Chỉ số cơ thể
                            </h3>
                            <p className="text-[#666] text-[10px] font-medium mt-0.5">Biến thiên Cân nặng, Cơ và Mỡ</p>
                        </div>
                    </div>

                    <div className="h-[250px] w-full ml-[-20px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weightLogs}>
                                <XAxis dataKey="date" tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 'bold' }} dx={-10} width={40} domain={['auto', 'auto']} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 'bold' }} dx={10} width={40} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Line yAxisId="left" type="monotone" dataKey="weight" name="Cân nặng (kg)" stroke="#00e5ff" strokeWidth={3} dot={{ r: 4, fill: '#111', stroke: '#00e5ff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#00e5ff' }} />
                                <Line yAxisId="left" type="monotone" dataKey="muscleMass" name="Cơ bắp (kg)" stroke="#00ff88" strokeWidth={3} dot={{ r: 4, fill: '#111', stroke: '#00ff88', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#00ff88' }} connectNulls />
                                <Line yAxisId="right" type="monotone" dataKey="bodyFatPercentage" name="Mỡ (%)" stroke="#ff4444" strokeWidth={3} dot={{ r: 4, fill: '#111', stroke: '#ff4444', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#ff4444' }} connectNulls />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* 1. WEEKLY VOLUME CHART */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-4 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase flex items-center gap-1.5">
                            <Activity size={16} className="text-[#00ff88]" /> Khối lượng (Volume)
                        </h3>
                        <p className="text-[#666] text-[10px] font-medium mt-0.5">Tổng kg x reps mỗi tuần</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black
                        ${volGrowth >= 0 ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-[#ff4444]/10 text-[#ff4444]'}`}>
                        {volGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(volGrowth).toFixed(0)}%
                    </div>
                </div>

                <div className="h-[200px] w-full ml-[-20px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={volumeData}>
                            <defs>
                                <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="weekLabel" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 'bold' }} dx={-10} width={60} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#00ff88', fontWeight: 'bold' }}
                                labelStyle={{ color: '#888', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                            />
                            <Area type="monotone" dataKey="totalVolume" name="Tổng Volume (kg)" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#volGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. PR HIGHLIGHTS (Horizontal Scroll) */}
            {prData.length > 0 && (
                <div>
                    <h3 className="text-white font-bold text-sm uppercase flex items-center gap-1.5 mb-3 px-1">
                        <Trophy size={16} className="text-[#ffb800]" /> Kỷ lục cá nhân (PR)
                    </h3>
                    <div className="flex overflow-x-auto gap-3 pb-4 snap-x hide-scrollbar -mx-4 px-4">
                        {prData.slice(0, 10).map((pr, idx) => (
                            <div key={idx} className="shrink-0 w-44 bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-[#ffb800]/20 rounded-2xl p-3 snap-start relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 text-[#ffb800]/5 group-hover:text-[#ffb800]/10 transition-colors">
                                    <Flame size={80} />
                                </div>
                                <span className="text-[9px] text-[#ffb800] uppercase font-black tracking-widest block mb-1">ALL-TIME BEST</span>
                                <h4 className="text-white text-sm font-bold truncate mb-3" title={pr.exerciseName}>{pr.exerciseName}</h4>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-black text-white leading-none">{pr.weight}</span>
                                    <span className="text-[#888] text-xs font-bold pb-0.5">kg</span>
                                    <span className="text-[#666] text-xs font-medium pb-0.5 ml-1">× {pr.reps} reps</span>
                                </div>
                                <div className="mt-2 text-[9px] text-[#555] font-semibold">
                                    {new Date(pr.date).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. STRENGTH Line Chart */}
            {allExercises.length > 0 && (
                <div className="bg-[#111] border border-[#222] rounded-3xl p-4 shadow-lg">
                    <div className="flex flex-col gap-3 mb-6">
                        <h3 className="text-white font-bold text-sm uppercase flex items-center gap-1.5">
                            <TrendingUp size={16} className="text-[#00c3ff]" /> Xu hướng mức tạ
                        </h3>
                        <select
                            value={selectedExercise}
                            onChange={(e) => setSelectedExercise(e.target.value)}
                            className="bg-[#1a1a1a] border border-[#333] p-2.5 rounded-xl text-white text-sm font-bold focus:border-[#00c3ff] outline-none"
                        >
                            {allExercises.map(ex => (
                                <option key={ex} value={ex}>{ex}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-[200px] w-full ml-[-20px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={strengthData}>
                                <XAxis dataKey="weekLabel" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 'bold' }} dx={-10} width={60} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#00c3ff', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#888', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                                />
                                <Line type="monotone" dataKey="bestWeight" name="Mức tạ cao nhất (kg)" stroke="#00c3ff" strokeWidth={3} dot={{ r: 4, fill: '#111', stroke: '#00c3ff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#00c3ff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* 4. MUSCLE GROUP FOCUS (Bar Chart) */}
            {muscleGroups.length > 0 && (
                <div className="bg-[#111] border border-[#222] rounded-3xl p-4 shadow-lg">
                    <h3 className="text-white font-bold text-sm uppercase flex items-center gap-1.5 mb-6">
                        <Target size={16} className="text-[#ff44b8]" /> Phân bổ nhóm cơ
                    </h3>

                    <div className="h-[200px] w-full ml-[-20px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={muscleGroups} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="group" type="category" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11, fontWeight: 'bold' }} width={80} />
                                <Tooltip
                                    cursor={{ fill: '#1a1a1a' }}
                                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Tỷ trọng']}
                                />
                                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                                    {muscleGroups.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* 5. CONSISTENCY & BEST EXERCISE */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111] border border-[#222] rounded-3xl p-4 shadow-lg flex flex-col justify-between">
                    <div>
                        <h3 className="text-[#888] font-bold text-[10px] uppercase flex items-center gap-1 mb-2">
                            <Calendar size={12} /> Tần suất
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-3">
                            {consistencyData.slice(-14).map((w, i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-sm ${w.completedCount > 0 ? 'bg-[#00ff88]' : 'bg-[#222]'}`}
                                    title={`${w.weekLabel}: ${w.completedCount} buổi`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {bestExercise && (
                    <div className="bg-[#111] border border-[#00ff88]/20 rounded-3xl p-4 shadow-lg relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 blur-2xl rounded-full" />
                        <div>
                            <h3 className="text-[#00ff88] font-bold text-[10px] uppercase flex items-center gap-1 mb-1">
                                <Flame size={12} /> Tốt nhất tháng
                            </h3>
                            <div className="text-white font-black text-sm leading-tight mt-1 truncate" title={bestExercise.name}>
                                {bestExercise.name}
                            </div>
                        </div>
                        <div className="mt-3 flex items-end justify-between">
                            <span className="text-[#888] text-[10px] uppercase font-bold">Vol Growth</span>
                            <span className="text-[#00ff88] font-black text-base flex items-center">
                                ↑{bestExercise.growthPercent.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
