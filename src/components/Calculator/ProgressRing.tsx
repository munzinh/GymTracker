import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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

    // Optional animation state for initial load
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Color logic
    let strokeUrl = 'url(#neonGreen)';
    let colorClass = 'text-[#00ff88]'; // Default Green (under 80%)
    let dropShadow = 'drop-shadow-[0_0_15px_rgba(0,255,136,0.6)]';

    if (percent >= 1) {
        strokeUrl = 'url(#neonRed)';
        colorClass = 'text-[#ff4444]'; // Over limit
        dropShadow = 'drop-shadow-[0_0_15px_rgba(255,68,68,0.6)]';
    } else if (percent >= 0.8) {
        strokeUrl = 'url(#neonOrange)';
        colorClass = 'text-[#ffb800]'; // Warning zone
        dropShadow = 'drop-shadow-[0_0_15px_rgba(255,184,0,0.6)]';
    }

    // Format numbers safely to prevent scientific notation overflow (e.g. 8e+50)
    const safeCurrent = isNaN(current) ? 0 : Math.min(Math.max(current, 0), 99999);
    const safeTarget = isNaN(target) ? 0 : Math.max(target, 0);
    const diff = Math.max(0, safeTarget - safeCurrent);
    const displayDiff = diff > 99999 ? '99999+' : Math.round(diff);

    return (
        <div className="relative flex items-center justify-center p-4">
            <svg width={size} height={size} className="transform -rotate-90">
                <defs>
                    <linearGradient id="neonGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00ff88" />
                        <stop offset="100%" stopColor="#00cc6a" />
                    </linearGradient>
                    <linearGradient id="neonOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffb800" />
                        <stop offset="100%" stopColor="#ff9500" />
                    </linearGradient>
                    <linearGradient id="neonRed" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff4444" />
                        <stop offset="100%" stopColor="#cc0000" />
                    </linearGradient>
                </defs>

                {/* Background Ring */}
                <circle
                    className="text-white/5"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />

                {/* Foreground Progress (Animated) */}
                <motion.circle
                    className={`${dropShadow}`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    stroke={strokeUrl}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: isLoaded ? offset : circumference }}
                    transition={{ duration: 1.5, ease: "easeOut", type: "spring", bounce: 0.2 }}
                />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-4">
                <span className="text-[11px] text-[#888] font-bold tracking-widest uppercase mb-1 drop-shadow-md">
                    Còn Lại
                </span>
                <span className={`text-4xl font-extrabold ${colorClass} tracking-tighter mb-1`}>
                    {displayDiff}
                </span>
                <div className="text-[12px] text-[#666] font-medium flex gap-2 overflow-hidden px-4">
                    <span className="truncate">🔥 {safeCurrent > 99999 ? '99999+' : Math.round(safeCurrent)} ăn</span>
                    <span>/</span>
                    <span className="truncate">{safeTarget} kcal</span>
                </div>
            </div>
        </div>
    );
}
