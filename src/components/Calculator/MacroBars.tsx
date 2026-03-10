import { AlertTriangle } from 'lucide-react';
import type { MacroSummary } from "../../types/nutrition";
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

// --- Logic Layer ---

type MacroStatus = 'UNDER' | 'OPTIMAL' | 'OVER';

interface StatusResult {
    ratio: number;
    status: MacroStatus;
    visualPercent: number; // total width in % (scaled to 150% max)
    targetLinePercent: number; // position of '|' marker
}

/**
 * Calculates macro status and visual scaling for production-grade display.
 * Maps 0-150% of target to 0-100% of visual width.
 */
function getMacroStatus(current: number, target: number): StatusResult {
    const targetLinePercent = (1 / 1.5) * 100; // 100% target sits at ~66.6% width

    if (target <= 0) {
        return { ratio: 0, status: 'OPTIMAL', visualPercent: 0, targetLinePercent };
    }

    const ratio = current / target;
    const visualPercent = Math.min(100, (ratio / 1.5) * 100);

    let status: MacroStatus = 'OPTIMAL';
    if (ratio < 0.9) status = 'UNDER';
    else if (ratio > 1.05) status = 'OVER';

    return { ratio, status, visualPercent, targetLinePercent };
}

// --- Presentation Layer ---

interface Props {
    current: MacroSummary;
    target: MacroSummary;
    bodyWeight?: number; // Needed for fat validation
}

const statusColors = {
    UNDER: {
        text: 'text-neon-blue', // Electric Cyan
        bar: 'bg-neon-blue shadow-[0_0_12px_var(--color-neon-blue-glow)]',
        bg: 'bg-neon-blue/5',
        border: 'border-neon-blue/20'
    },
    OPTIMAL: {
        text: 'text-neon', // Neon Green
        bar: 'bg-neon shadow-[0_0_12px_var(--color-neon-glow)]',
        bg: 'bg-neon/5',
        border: 'border-neon/20'
    },
    OVER: {
        text: 'text-neon-red', // Neon Red/Pink
        bar: 'bg-neon-red shadow-[0_0_15px_var(--color-neon-red-glow)]',
        bg: 'bg-neon-red/5',
        border: 'border-neon-red/20'
    }
};

function AnimatedNumber({ value, className }: { value: number, className: string }) {
    // Prevent huge numbers from breaking the layout (displaying as e+50)
    const safeValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 99999);

    const spring = useSpring(0, { mass: 1, stiffness: 60, damping: 15 });
    const display = useTransform(spring, (current) => {
        // Round to nearest integer and format with max length
        return Math.round(current).toString();
    });

    useEffect(() => {
        spring.set(safeValue);
    }, [spring, safeValue]);

    return <motion.span className={className}>{display}</motion.span>;
}

export function MacroBars({ current, target, bodyWeight }: Props) {
    // Fat Validation Rule: min 0.8g per kg bodyweight
    const isFatTooLow = bodyWeight && target.fat < bodyWeight * 0.8;

    const renderBar = (label: string, curr: number, targ: number) => {
        const { ratio, status, visualPercent, targetLinePercent } = getMacroStatus(curr, targ);
        const config = statusColors[status];

        // Overflow logic: anything past targetLinePercent is red
        const baseWidth = Math.min(targetLinePercent, visualPercent);
        const overflowWidth = Math.max(0, visualPercent - targetLinePercent);

        return (
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${config.bg} ${config.border} backdrop-blur-[2px]`}>
                <div className="flex justify-between items-end mb-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-white text-lg tracking-tight uppercase leading-none">{label}</span>
                            {status === 'OVER' && ratio > 1.1 && (
                                <span className="text-[10px] bg-neon-red text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter animate-pulse-red">
                                    OVER {(ratio * 100 - 100).toFixed(0)}%
                                </span>
                            )}
                        </div>
                        {label === 'Fat' && isFatTooLow && (
                            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#ffb800] font-bold uppercase tracking-tight">
                                <AlertTriangle size={10} /> Mục tiêu thấp (Min: {Math.round(bodyWeight * 0.8)}g)
                            </div>
                        )}
                    </div>
                    <div className="text-right leading-none">
                        <div className="flex items-baseline justify-end gap-1">
                            <AnimatedNumber value={curr} className={`text-2xl font-black tabular-nums transition-colors ${config.text}`} />
                            <span className="text-xs text-muted font-bold">/ {targ}g</span>
                        </div>
                    </div>
                </div>

                <div className="relative h-3 bg-card rounded-full overflow-hidden border border-border">
                    {/* Normal Zone (up to 100%) */}
                    <motion.div
                        className={`absolute top-0 left-0 h-full ${config.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${baseWidth}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />

                    {/* Overflow Zone (beyond 100%) */}
                    {overflowWidth > 0 && (
                        <motion.div
                            className="absolute top-0 h-full bg-neon-red shadow-[0_0_15px_var(--color-neon-red-glow)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${overflowWidth}%` }}
                            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                            style={{ left: `${targetLinePercent}%` }}
                        />
                    )}

                    {/* Target Vertical Guideline | */}
                    <div
                        className="absolute top-0 h-full w-[1.5px] bg-white shadow-[0_0_8px_white] z-20"
                        style={{ left: `${targetLinePercent}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-black text-xs text-muted uppercase tracking-[0.2em]">Cân bằng Dinh dưỡng</h3>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-neon-blue" />
                        <span className="text-[9px] font-bold text-muted uppercase">Under</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-neon" />
                        <span className="text-[9px] font-bold text-muted uppercase">Optimal</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-neon-red" />
                        <span className="text-[9px] font-bold text-muted uppercase">Over</span>
                    </div>
                </div>
            </div>

            {renderBar('Protein', current.protein, target.protein)}
            {renderBar('Carbs', current.carbs, target.carbs)}
            {renderBar('Fat', current.fat, target.fat)}
        </div>
    );
}
