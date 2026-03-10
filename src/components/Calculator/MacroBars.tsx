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
        text: 'text-[#00e5ff]', // Electric Cyan
        bar: 'bg-gradient-to-r from-[#00e5ff] to-[#00b8ff] shadow-[0_0_15px_rgba(0,229,255,0.4)]',
        bg: 'bg-[#00e5ff]/5',
        border: 'border-[#00e5ff]/20'
    },
    OPTIMAL: {
        text: 'text-[#00ff88]', // Neon Green
        bar: 'bg-gradient-to-r from-[#00ff88] to-[#00cc6a] shadow-[0_0_15px_rgba(0,255,136,0.4)]',
        bg: 'bg-[#00ff88]/5',
        border: 'border-[#00ff88]/20'
    },
    OVER: {
        text: 'text-[#ff4444]', // Neon Red/Pink
        bar: 'bg-gradient-to-r from-[#ff4444] to-[#cc0000] shadow-[0_0_15px_rgba(255,68,68,0.4)]',
        bg: 'bg-[#ff4444]/5',
        border: 'border-[#ff4444]/20'
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
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`p-4 rounded-3xl border transition-all duration-300 ${config.bg} ${config.border} backdrop-blur-md`}
            >
                <div className="flex justify-between items-end mb-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-white text-[15px] tracking-tight uppercase leading-none">{label}</span>
                            {status === 'OVER' && ratio > 1.1 && (
                                <span className="text-[10px] bg-[#ff4444] text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter animate-pulse shadow-[0_0_10px_rgba(255,68,68,0.5)]">
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
                            <AnimatedNumber value={curr} className={`text-[22px] font-black tabular-nums transition-colors ${config.text}`} />
                            <span className="text-[11px] text-[#666] font-bold">/ {targ}g</span>
                        </div>
                    </div>
                </div>

                <div className="relative h-3.5 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    {/* Normal Zone (up to 100%) */}
                    <motion.div
                        className={`absolute top-0 left-0 h-full rounded-full ${config.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${baseWidth}%` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] /* cubic-bezier for slicker feel */ }}
                    />

                    {/* Overflow Zone (beyond 100%) */}
                    {overflowWidth > 0 && (
                        <motion.div
                            className="absolute top-0 h-full rounded-full bg-gradient-to-r from-[#ff4444] to-[#cc0000] shadow-[0_0_15px_rgba(255,68,68,0.6)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${overflowWidth}%` }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            style={{ left: `${targetLinePercent}%` }}
                        />
                    )}

                    {/* Target Vertical Guideline | */}
                    <div
                        className="absolute top-0 h-full w-[2px] bg-white shadow-[0_0_10px_white] z-20 rounded-full"
                        style={{ left: `${targetLinePercent}%` }}
                    />
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-black text-[11px] text-[#555] uppercase tracking-[0.2em]">Cân bằng Dinh dưỡng</h3>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_5px_#00e5ff]" />
                        <span className="text-[9px] font-bold text-[#666] uppercase">Under</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_5px_#00ff88]" />
                        <span className="text-[9px] font-bold text-[#666] uppercase">Optimal</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff4444] shadow-[0_0_5px_#ff4444]" />
                        <span className="text-[9px] font-bold text-[#666] uppercase">Over</span>
                    </div>
                </div>
            </div>

            {renderBar('Protein', current.protein, target.protein)}
            {renderBar('Carbs', current.carbs, target.carbs)}
            {renderBar('Fat', current.fat, target.fat)}
        </div>
    );
}
