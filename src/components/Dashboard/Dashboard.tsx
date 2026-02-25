import { useApp } from '../../context/AppContext';
import {
    getWeeklyAvgWeight, getWeeklyWeightChange, getLatestBodyFat, getLatestWeight,
    getLeanMass, getProteinTarget, getFatTarget, getCaloriesTarget,
    checkFastLoss, checkStall, getWeightChartData, getBFChartData
} from '../../utils/calculations';
import { WeightChart } from './WeightChart';
import { BodyFatChart } from './BodyFatChart';
import { AlertTriangle, Flame, Beef, Dumbbell, Activity } from 'lucide-react';

function StatCard({ label, value, unit, sub, accent }: {
    label: string; value: string | number; unit?: string; sub?: string; accent?: boolean
}) {
    return (
        <div className="card fade-in">
            <p className="text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wide">{label}</p>
            <div className="flex items-end gap-1.5">
                <span className={`text-2xl font-bold ${accent ? 'neon-text' : 'text-white'}`}>{value}</span>
                {unit && <span className="text-[#555] text-sm mb-0.5">{unit}</span>}
            </div>
            {sub && <p className="text-[#555] text-xs mt-1">{sub}</p>}
        </div>
    );
}

export function Dashboard() {
    const { data } = useApp();
    const { dailyLogs, weeklyChecks, goals } = data;

    const latestWeight = getLatestWeight(dailyLogs);
    const weeklyAvg = getWeeklyAvgWeight(dailyLogs);
    const weeklyChange = getWeeklyWeightChange(dailyLogs);
    const latestBF = getLatestBodyFat(weeklyChecks);

    const leanMass = latestWeight && latestBF ? getLeanMass(latestWeight, latestBF) : null;
    const proteinTarget = leanMass ? getProteinTarget(leanMass) : null;
    const fatTarget = latestWeight ? getFatTarget(latestWeight) : null;
    const calsTarget = getCaloriesTarget(goals.tdee);

    const fastLoss = checkFastLoss(weeklyChange);
    const stall = checkStall(dailyLogs);

    const weightChartData = getWeightChartData(dailyLogs);
    const bfChartData = getBFChartData(weeklyChecks);


    return (
        <div className="space-y-5">
            {/* Warnings */}
            {(fastLoss || stall) && (
                <div className="space-y-2">
                    {fastLoss && (
                        <div className="warn-yellow flex items-start gap-3">
                            <AlertTriangle size={18} className="text-[#ffb800] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-[#ffb800] text-sm">⚠️ Giảm cân quá nhanh!</p>
                                <p className="text-[#ccc] text-xs mt-0.5">
                                    Bạn giảm &gt;0.8 kg/tuần — có nguy cơ mất cơ. Hãy tăng thêm <strong>150–200 kcal/ngày</strong>.
                                </p>
                            </div>
                        </div>
                    )}
                    {stall && (
                        <div className="warn-red flex items-start gap-3">
                            <AlertTriangle size={18} className="text-[#ff4444] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-[#ff4444] text-sm">🛑 Cân nặng không đổi 2 tuần!</p>
                                <p className="text-[#ccc] text-xs mt-0.5">
                                    Giảm <strong>150–200 kcal/ngày</strong> hoặc <strong>tăng cardio</strong>.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard
                    label="Cân nặng hiện tại"
                    value={latestWeight ?? '—'}
                    unit="kg"
                    sub={latestBF ? `Body fat: ${latestBF}%` : 'Chưa có body fat'}
                    accent
                />
                <StatCard
                    label="Trung bình tuần"
                    value={weeklyAvg ? weeklyAvg.toFixed(1) : '—'}
                    unit="kg"
                    sub="7 ngày gần nhất"
                />
                <StatCard
                    label="Thay đổi tuần"
                    value={weeklyChange !== null ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(2)}` : '—'}
                    unit="kg"
                    sub={weeklyChange !== null ? (weeklyChange < 0 ? '✅ Đang giảm tốt' : '⚠️ Không giảm') : 'Cần thêm dữ liệu'}
                />
                <StatCard
                    label="Cơ nạc ước tính"
                    value={leanMass ? leanMass.toFixed(1) : '—'}
                    unit="kg"
                    sub={`Mục tiêu protein: ${proteinTarget ?? '—'}g`}
                />
                <StatCard
                    label="TDEE ước tính"
                    value={goals.tdee}
                    unit="kcal"
                    sub="Từ cài đặt mục tiêu"
                />
                <StatCard
                    label="Calories mục tiêu"
                    value={calsTarget}
                    unit="kcal"
                    sub={`Chất béo: ${fatTarget ?? '—'}g/ngày`}
                    accent
                />
            </div>

            {/* Macro targets */}
            {(proteinTarget || fatTarget) && (
                <div className="card">
                    <p className="text-[#888] text-xs font-medium mb-3 uppercase tracking-wide">Chỉ tiêu dinh dưỡng hôm nay</p>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <Flame size={20} className="mx-auto mb-1" style={{ color: '#ff8c42' }} />
                            <p className="text-white font-bold">{calsTarget}</p>
                            <p className="text-[#555] text-xs">Calories</p>
                        </div>
                        <div className="text-center">
                            <Beef size={20} className="mx-auto mb-1" style={{ color: '#00ff88' }} />
                            <p className="text-white font-bold">{proteinTarget ?? '—'}g</p>
                            <p className="text-[#555] text-xs">Protein</p>
                        </div>
                        <div className="text-center">
                            <Activity size={20} className="mx-auto mb-1" style={{ color: '#4a9eff' }} />
                            <p className="text-white font-bold">{fatTarget ?? '—'}g</p>
                            <p className="text-[#555] text-xs">Chất béo</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts */}
            {weightChartData.length > 1 && (
                <div className="card">
                    <p className="text-[#888] text-xs font-medium mb-4 uppercase tracking-wide">📈 Biểu đồ cân nặng (30 ngày)</p>
                    <WeightChart data={weightChartData} />
                </div>
            )}

            {bfChartData.length > 1 && (
                <div className="card">
                    <p className="text-[#888] text-xs font-medium mb-4 uppercase tracking-wide">📊 Biểu đồ Body Fat (%)</p>
                    <BodyFatChart data={bfChartData} />
                </div>
            )}

            {dailyLogs.length === 0 && (
                <div className="card text-center py-10">
                    <Dumbbell size={40} className="mx-auto mb-3 text-[#333]" />
                    <p className="text-[#888] font-medium">Chưa có dữ liệu</p>
                    <p className="text-[#555] text-sm mt-1">Hãy vào tab <strong className="text-[#00ff88]">Nhật ký</strong> để bắt đầu tracking!</p>
                </div>
            )}
        </div>
    );
}
