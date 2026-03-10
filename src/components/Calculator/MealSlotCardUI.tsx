import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MealSlot, MacroSummary } from '../../types/nutrition';
import { Plus, Trash2, Zap, ChevronDown } from 'lucide-react';
import { FoodSearchModal } from './FoodSearchModal';
import type { FoodItem } from './foodDatabase';
interface Props {
    userId: string;
    slot: MealSlot;
    dailyTotals: MacroSummary;
    dailyTargets: MacroSummary;
    onAdd: (food: FoodItem, grams: number) => void;
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
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300 relative group"
            style={{ background: 'rgba(20, 20, 20, 0.7)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
        >
            {/* Soft highlight on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* HEADER */}
            <button className="w-full flex items-center gap-3 px-4 py-3.5 relative z-10 outline-none" onClick={() => setCollapsed(c => !c)}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${accent}30` }}>
                    <span className="text-[22px] drop-shadow-lg">{EMOJI_MAP[slot.id]}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="font-extrabold text-[15px] text-white tracking-tight">{slot.name}</p>
                    <p className="text-[11px] mt-0.5 truncate font-medium" style={{ color: slot.totals.calories > 0 ? accent : '#666' }}>
                        {slot.totals.calories > 0
                            ? <span className="drop-shadow-[0_0_8px_currentColor]">{Math.round(slot.totals.calories)} kcal · {slot.items.length} món</span>
                            : 'Chưa có món nào · mục tiêu ~' + mealTarget + ' kcal'}
                    </p>
                </div>
                {/* Progress mini */}
                <div className="w-16 shrink-0 mt-1">
                    <div className="h-1.5 rounded-full mb-1 shadow-inner overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, pct)}%`, background: isOver ? 'linear-gradient(90deg, #ff4444, #cc0000)' : `linear-gradient(90deg, ${accent}, ${accent}aa)` }} />
                    </div>
                    <p className="text-[10px] text-right font-bold tracking-tighter" style={{ color: isOver ? '#ff4444' : '#888' }}>{Math.round(pct)}%</p>
                </div>
                <ChevronDown size={16} className="text-[#666] shrink-0 transition-transform duration-300 ml-1" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {/* BODY */}
            <AnimatePresence initial={false}>
                {!collapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-3 space-y-1.5 border-t border-white/5 pt-3 relative z-10 bg-black/20">

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
                            <AnimatePresence>
                                {slot.items.map(item => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 border backdrop-blur-md group/item transition-all hover:bg-white/[0.02]"
                                        style={{ background: 'rgba(25, 25, 25, 0.5)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
                                    >
                                        {/* Accent dot */}
                                        <div className="w-1.5 h-1.5 rounded-full shrink-0 self-center" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />

                                        {/* Name + macros */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-bold text-white leading-tight truncate">
                                                {item.name}
                                                <span className="text-[11px] text-[#666] font-medium ml-1.5">{item.grams}g</span>
                                            </p>
                                            <div className="flex gap-2.5 mt-0.5 text-[10px] font-black tracking-tight">
                                                <span style={{ color: '#00ff88' }}>P <span className="text-white">{item.macros.protein}</span></span>
                                                <span style={{ color: '#00e5ff' }}>C <span className="text-white">{item.macros.carbs}</span></span>
                                                <span style={{ color: '#ffb800' }}>F <span className="text-white">{item.macros.fat}</span></span>
                                            </div>
                                        </div>

                                        {/* Calo + delete */}
                                        <div className="flex items-center gap-1">
                                            <span className="font-black text-[15px] text-white shrink-0 truncate max-w-[60px] text-right mr-1">{Math.round(item.macros.calories)}</span>
                                            <button onClick={e => { e.stopPropagation(); onRemove(item.id); }}
                                                className="w-8 h-8 flex items-center justify-center rounded-xl text-[#555] opacity-0 group-hover/item:opacity-100 hover:text-[#ff4444] hover:bg-[#ff444420] transition-all shrink-0">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Meal total — only if has items */}
                            {slot.items.length > 0 && (
                                <div className="flex justify-between items-center rounded-2xl px-3 py-2 mt-2 drop-shadow-lg"
                                    style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${accent}40`, boxShadow: `inset 0 0 20px ${accent}10` }}>
                                    <span className="text-[10px] text-[#888] font-black uppercase tracking-widest flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
                                        Tổng Bữa {slot.name}
                                    </span>
                                    <div className="flex gap-3 text-[11px] font-black tabular-nums">
                                        <span className="text-white drop-shadow-md">{Math.round(totals.calories)}kcal</span>
                                        <span style={{ color: '#00ff88' }}>P{Math.round(totals.protein)}</span>
                                        <span style={{ color: '#00e5ff' }}>C{Math.round(totals.carbs)}</span>
                                        <span style={{ color: '#ffb800' }}>F{Math.round(totals.fat)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Add button */}
                            <button onClick={() => setSearchOpen(true)}
                                className="w-full py-2.5 mt-2 rounded-2xl border border-dashed text-[13px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-white/[0.05] active:scale-[0.98]"
                                style={{ borderColor: accent + '60', color: accent, background: accent + '10' }}>
                                <Plus size={16} strokeWidth={3} />
                                Thêm món ăn
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {searchOpen && (
                <FoodSearchModal
                    userId={userId}
                    onClose={() => setSearchOpen(false)}
                    onAdd={(f, g) => { onAdd(f, g); setSearchOpen(false); }}
                />
            )}
        </motion.div>
    );
}
