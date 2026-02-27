import type { MacroSummary } from "../../types/nutrition";

interface Props {
    current: MacroSummary;
    target: MacroSummary;
}

export function MacroBars({ current, target }: Props) {
    const calcPct = (c: number, t: number) => {
        if (!t) return 0;
        return Math.min(100, (c / t) * 100);
    };

    const pPct = calcPct(current.protein, target.protein);
    const cPct = calcPct(current.carbs, target.carbs);
    const fPct = calcPct(current.fat, target.fat);

    // Smart Highlights logic
    const isProteinLow = pPct < 80;
    const isFatHigh = fPct > 100;

    return (
        <div className="card space-y-4">
            <h3 className="font-bold text-sm text-[#888] uppercase tracking-wider mb-2">Mục tiêu Macros</h3>

            {/* Protein - Visually Dominant */}
            <div className={`p-3 rounded-xl border transition-all ${isProteinLow ? 'bg-[#ffb80011] border-[#ffb80044]' : 'bg-[#111] border-[#222]'}`}>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="font-extrabold text-white text-lg">Protein</span>
                        {isProteinLow && <span className="text-[10px] text-[#ffb800] ml-2 font-bold uppercase tracking-widest animate-pulse">Cần nạp thêm</span>}
                    </div>
                    <div className="text-right">
                        <span className="font-black text-white text-lg leading-none">{Math.round(current.protein)}</span>
                        <span className="text-xs text-[#666] ml-1">/ {target.protein}g</span>
                    </div>
                </div>
                <div className="h-3 bg-[#1e1e1e] rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${isProteinLow ? 'bg-[#ffb800]' : 'bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.7)]'}`}
                        style={{ width: `${pPct}%` }} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Carbs */}
                <div className="bg-[#111] p-3 rounded-xl border border-[#222]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white text-sm">Carbs</span>
                        <div className="text-right text-xs">
                            <span className="font-bold text-white">{Math.round(current.carbs)}</span>
                            <span className="text-[#666] ml-1">/ {target.carbs}g</span>
                        </div>
                    </div>
                    <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00ff88] transition-all duration-1000" style={{ width: `${cPct}%` }} />
                    </div>
                </div>

                {/* Fat */}
                <div className={`p-3 rounded-xl border transition-all ${isFatHigh ? 'bg-[#ff444411] border-[#ff444444]' : 'bg-[#111] border-[#222]'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white text-sm">Fat</span>
                        <div className="text-right text-xs">
                            <span className={`font-bold ${isFatHigh ? 'text-[#ff4444] animate-pulse-red' : 'text-white'}`}>
                                {Math.round(current.fat)}
                            </span>
                            <span className="text-[#666] ml-1">/ {target.fat}g</span>
                        </div>
                    </div>
                    <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${isFatHigh ? 'bg-[#ff4444]' : 'bg-[#ffb800]'}`}
                            style={{ width: `${fPct}%` }} />
                    </div>
                </div>
            </div>

        </div>
    );
}
