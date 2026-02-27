import { useState } from 'react';
import type { MealSlot, MacroSummary } from '../../types/nutrition';
import { Plus, Trash2, Zap, ChevronDown } from 'lucide-react';
import { FoodSearchModal } from './FoodSearchModal';

interface Props {
    userId: string;
    slot: MealSlot;
    dailyTotals: MacroSummary;
    dailyTargets: MacroSummary;
    onAdd: (food: any, grams: number) => void;
    onRemove: (id: string) => void;
}

const SHARE_MAP: Record<string, number> = { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack: 0.10 };
const EMOJI_MAP: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '☕' };
const COLOR_MAP: Record<string, string> = { breakfast: '#ffb800', lunch: '#00e5ff', dinner: '#a78bfa', snack: '#00ff88' };

export function MealSlotCard({ userId, slot, dailyTotals, dailyTargets, onAdd, onRemove }: Props) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    // ── Compute totals LIVE from items (fixes stale totals after delete) ─────
    const totals: MacroSummary = slot.items.reduce(
        (acc, item) => ({
            calories: acc.calories + (item.macros?.calories ?? 0),
            protein: Math.round((acc.protein + (item.macros?.protein ?? 0)) * 10) / 10,
            carbs: Math.round((acc.carbs + (item.macros?.carbs ?? 0)) * 10) / 10,
            fat: Math.round((acc.fat + (item.macros?.fat ?? 0)) * 10) / 10,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const isProteinLow = dailyTargets.protein > 0 && (dailyTotals.protein / dailyTargets.protein) < 0.6;
    const mealTarget = Math.round(dailyTargets.calories * (SHARE_MAP[slot.id] || 0.25));
    const pct = mealTarget > 0 ? Math.min(100, (totals.calories / mealTarget) * 100) : 0;
    const isOver = totals.calories > mealTarget && mealTarget > 0;
    const accent = COLOR_MAP[slot.id] || '#00ff88';

    return (
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#111', borderColor: '#1e1e1e' }}>

            {/* HEADER */}
            <button className="w-full flex items-center gap-3 px-3 py-2.5" onClick={() => setCollapsed(c => !c)}>
                <span className="text-xl shrink-0">{EMOJI_MAP[slot.id]}</span>
                <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold text-[14px] text-white">{slot.name}</p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: slot.totals.calories > 0 ? accent : '#555' }}>
                        {slot.totals.calories > 0
                            ? `${slot.totals.calories} kcal · ${slot.items.length} món`
                            : 'Chưa có món nào · mục tiêu ~' + mealTarget + ' kcal'}
                    </p>
                </div>
                {/* Progress mini */}
                <div className="w-16 shrink-0">
                    <div className="h-1 rounded-full mb-0.5" style={{ background: '#2a2a2a' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: isOver ? '#ff4444' : accent }} />
                    </div>
                    <p className="text-[9px] text-right" style={{ color: isOver ? '#ff4444' : '#555' }}>{Math.round(pct)}%</p>
                </div>
                <ChevronDown size={15} className="text-[#444] shrink-0 transition-transform" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {/* BODY */}
            {!collapsed && (
                <div className="px-3 pb-2 space-y-1 border-t border-[#1a1a1a] pt-2">

                    {/* Protein hint — compact */}
                    {isProteinLow && slot.items.length === 0 && (
                        <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-1"
                            style={{ background: '#00e5ff09', border: '1px solid #00e5ff1a' }}>
                            <Zap size={12} className="text-[#00e5ff] shrink-0" />
                            <p className="text-[11px] text-[#888]">
                                Protein thấp — ưu tiên ức gà, trứng, đậu hũ
                            </p>
                        </div>
                    )}

                    {/* Food rows */}
                    {slot.items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 rounded-xl px-2.5 py-1.5"
                            style={{ background: '#191919', border: '1px solid #252525' }}>
                            {/* Accent dot */}
                            <div className="w-1 h-1 rounded-full shrink-0 self-center" style={{ background: accent, boxShadow: `0 0 4px ${accent}` }} />

                            {/* Name + macros */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-white leading-tight">
                                    {item.name}
                                    <span className="text-[11px] text-[#555] font-normal ml-1">{item.grams}g</span>
                                </p>
                                <div className="flex gap-2 mt-0.5 text-[10px]">
                                    <span style={{ color: '#00ff88' }}>P{item.macros.protein}</span>
                                    <span style={{ color: '#00e5ff' }}>C{item.macros.carbs}</span>
                                    <span style={{ color: '#ffb800' }}>F{item.macros.fat}</span>
                                </div>
                            </div>

                            {/* Calo + delete */}
                            <span className="font-black text-[14px] text-white shrink-0">{item.macros.calories}</span>
                            <button onClick={e => { e.stopPropagation(); onRemove(item.id); }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#444] hover:text-[#ff4444] hover:bg-[#ff444415] transition-colors shrink-0">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}

                    {/* Meal total — only if has items */}
                    {slot.items.length > 0 && (
                        <div className="flex justify-between items-center rounded-xl px-2.5 py-1.5 mt-1"
                            style={{ background: '#161616', border: `1px solid ${accent}18` }}>
                            <span className="text-[10px] text-[#555] font-bold uppercase tracking-wide">Tổng</span>
                            <div className="flex gap-2.5 text-[11px] font-bold">
                                <span className="text-white">{totals.calories}kcal</span>
                                <span style={{ color: '#00ff88' }}>P{totals.protein}</span>
                                <span style={{ color: '#00e5ff' }}>C{totals.carbs}</span>
                                <span style={{ color: '#ffb800' }}>F{totals.fat}</span>
                            </div>
                        </div>
                    )}

                    {/* Add button */}
                    <button onClick={() => setSearchOpen(true)}
                        className="w-full py-2 mt-1.5 rounded-xl border border-dashed text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                        style={{ borderColor: accent + '40', color: accent, background: accent + '08' }}>
                        <Plus size={15} />
                        Thêm món
                    </button>
                </div>
            )}

            {searchOpen && (
                <FoodSearchModal
                    userId={userId}
                    onClose={() => setSearchOpen(false)}
                    onAdd={(f, g) => { onAdd(f, g); setSearchOpen(false); }}
                />
            )}
        </div>
    );
}
