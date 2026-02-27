interface ProgressRingProps {
    current: number;
    target: number;
    size?: number;
    strokeWidth?: number;
}

export function ProgressRing({ current, target, size = 240, strokeWidth = 16 }: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percent = target > 0 ? current / target : 0;

    // Cap at 1 for the ring rendering, but let color logic use raw percent
    const cappedPercent = Math.min(percent, 1);
    const offset = circumference - cappedPercent * circumference;

    // Color logic
    let colorClass = 'text-[#00ff88]'; // Default Green (under 80%)
    let dropShadow = 'drop-shadow-[0_0_12px_rgba(0,255,136,0.5)]';

    if (percent >= 1) {
        colorClass = 'text-[#ff4444]'; // Over limit
        dropShadow = 'drop-shadow-[0_0_12px_rgba(255,68,68,0.5)]';
    } else if (percent >= 0.8) {
        colorClass = 'text-[#ffb800]'; // Warning zone
        dropShadow = 'drop-shadow-[0_0_12px_rgba(255,184,0,0.5)]';
    }

    return (
        <div className="relative flex items-center justify-center p-4">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                    className="text-[#1e1e1e]"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />

                {/* Foreground Progress */}
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-out ${dropShadow}`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-4">
                <span className="text-[11px] text-[#888] font-bold tracking-widest uppercase mb-1 drop-shadow-md">
                    Còn Lại
                </span>
                <span className={`text-4xl font-extrabold ${colorClass} tracking-tighter mb-1`}>
                    {Math.max(0, target - current)}
                </span>
                <div className="text-[12px] text-[#666] font-medium flex gap-2">
                    <span>🔥 {current} ăn</span>
                    <span>/</span>
                    <span>{target} kcal</span>
                </div>
            </div>
        </div>
    );
}
