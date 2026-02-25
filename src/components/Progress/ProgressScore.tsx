import { useApp } from '../../context/AppContext';
import {
    calcProgressScore, getWeeklyWeightChange, getLatestBodyFat, getLatestWeight,
    getLeanMass, getProteinTarget, getCaloriesTarget
} from '../../utils/calculations';
import { Trophy, Flame, Beef, TrendingDown, Activity } from 'lucide-react';

export function ProgressScore() {
    const { data } = useApp();
    const { dailyLogs, weeklyChecks, goals } = data;

    const latestWeight = getLatestWeight(dailyLogs);
    const latestBF = getLatestBodyFat(weeklyChecks);
    const leanMass = latestWeight && latestBF ? getLeanMass(latestWeight, latestBF) : null;
    const proteinTarget = leanMass ? getProteinTarget(leanMass) : 150;
    const caloriesTarget = getCaloriesTarget(goals.tdee);
    const weeklyChange = getWeeklyWeightChange(dailyLogs);

    const score = calcProgressScore(dailyLogs, caloriesTarget, proteinTarget, weeklyChange);

    const scoreColor = score.total >= 80 ? '#00ff88' : score.total >= 60 ? '#ffb800' : '#ff4444';
    const scoreLabel = score.total >= 80 ? 'Xuất sắc! 🔥' : score.total >= 60 ? 'Khá tốt 💪' : 'Cần cải thiện ⚠️';

    const circumference = 2 * Math.PI * 45;
    const dashOffset = circumference - (score.total / 100) * circumference;

    const items = [
        { label: 'Calories trong mục tiêu', score: score.calories, max: 25, icon: <Flame size={16} />, color: '#ff8c42' },
        { label: 'Protein đạt target', score: score.protein, max: 25, icon: <Beef size={16} />, color: '#00ff88' },
        { label: 'Xu hướng giảm cân', score: score.trend, max: 30, icon: <TrendingDown size={16} />, color: '#4a9eff' },
        { label: 'Cardio ≥3 buổi/tuần', score: score.cardio, max: 20, icon: <Activity size={16} />, color: '#be4bdb' },
    ];

    return (
        <div className="space-y-4">
            {/* Score circle */}
            <div className="card fade-in text-center">
                <h3 className="font-semibold text-white mb-4 flex items-center justify-center gap-2">
                    <Trophy size={18} className="text-[#ffb800]" />
                    Điểm tiến độ tuần này
                </h3>
                <div className="flex flex-col items-center">
                    <svg width={120} height={120} className="mb-3">
                        <circle cx={60} cy={60} r={45} fill="none" stroke="#1e1e1e" strokeWidth={10} />
                        <circle
                            cx={60} cy={60} r={45} fill="none"
                            stroke={scoreColor}
                            strokeWidth={10}
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s' }}
                            filter={`drop-shadow(0 0 8px ${scoreColor}44)`}
                        />
                        <text x={60} y={55} textAnchor="middle" fill={scoreColor}
                            fontSize={26} fontWeight="bold" fontFamily="Inter">
                            {score.total}
                        </text>
                        <text x={60} y={72} textAnchor="middle" fill="#555" fontSize={11} fontFamily="Inter">
                            /100
                        </text>
                    </svg>
                    <p className="font-semibold" style={{ color: scoreColor }}>{scoreLabel}</p>
                    <p className="text-[#555] text-xs mt-1">Dựa trên 7 ngày gần nhất</p>
                </div>
            </div>

            {/* Breakdown */}
            <div className="card fade-in">
                <h3 className="font-semibold text-white mb-4 text-sm">Chi tiết điểm</h3>
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.label}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2" style={{ color: item.color }}>
                                    {item.icon}
                                    <span className="text-[#ccc] text-xs">{item.label}</span>
                                </div>
                                <span className="text-white text-xs font-semibold">{item.score}/{item.max}</span>
                            </div>
                            <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${(item.score / item.max) * 100}%`,
                                        background: item.color,
                                        boxShadow: `0 0 6px ${item.color}44`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tips */}
            {score.total < 80 && (
                <div className="card fade-in">
                    <h3 className="font-semibold text-[#ffb800] mb-3 text-sm">💡 Gợi ý cải thiện</h3>
                    <ul className="space-y-2 text-sm text-[#888]">
                        {score.calories < 20 && <li className="flex items-start gap-2"><span className="text-[#ff8c42]">•</span> Track calories chính xác hơn — mục tiêu {caloriesTarget} kcal/ngày</li>}
                        {score.protein < 20 && <li className="flex items-start gap-2"><span className="text-[#00ff88]">•</span> Tăng protein — cần {proteinTarget}g/ngày từ thịt, trứng, sữa</li>}
                        {score.trend < 20 && <li className="flex items-start gap-2"><span className="text-[#4a9eff]">•</span> Duy trì mức giảm −0.3 đến −0.8 kg/tuần</li>}
                        {score.cardio < 15 && <li className="flex items-start gap-2"><span className="text-[#be4bdb]">•</span> Tăng cardio lên ≥3 buổi/tuần</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}
