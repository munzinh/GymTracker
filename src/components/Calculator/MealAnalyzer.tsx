import { useState, useMemo, useRef } from 'react';
import { FOOD_CATEGORIES, type FoodItem, loadFoodDatabase } from './foodDatabase';
import { Plus, Trash2, Search, ChevronDown, Info, X, Target } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MealEntry {
    id: string;
    food: FoodItem;
    grams: number;
}

interface NutritionTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

function calcNutrition(food: FoodItem, grams: number): NutritionTotals {
    const ratio = grams / 100;
    return {
        calories: Math.round(food.per100g.calories * ratio),
        protein: Math.round(food.per100g.protein * ratio * 10) / 10,
        carbs: Math.round(food.per100g.carbs * ratio * 10) / 10,
        fat: Math.round(food.per100g.fat * ratio * 10) / 10,
    };
}

function sumNutrition(entries: MealEntry[]): NutritionTotals {
    return entries.reduce((acc, e) => {
        const n = calcNutrition(e.food, e.grams);
        return {
            calories: acc.calories + n.calories,
            protein: Math.round((acc.protein + n.protein) * 10) / 10,
            carbs: Math.round((acc.carbs + n.carbs) * 10) / 10,
            fat: Math.round((acc.fat + n.fat) * 10) / 10,
        };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

const MEAL_PRESETS = [
    { label: '🌅 Bữa sáng', calorieShare: 0.25 },
    { label: '☀️ Bữa trưa', calorieShare: 0.35 },
    { label: '🌙 Bữa tối', calorieShare: 0.30 },
    { label: '🍎 Snack', calorieShare: 0.10 },
];

// ─── Food Search Dropdown ──────────────────────────────────────────────────────

function FoodSearch({ onSelect, userId }: { onSelect: (food: FoodItem) => void, userId: string }) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [foods] = useState(() => loadFoodDatabase(userId));

    const results = useMemo(() => {
        const q = query.toLowerCase().trim();
        return foods.filter((f: FoodItem) =>
            (!category || f.category === category) &&
            (!q || f.nameVi.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
        ).slice(0, 20);
    }, [query, category]);

    const handleSelect = (food: FoodItem) => {
        onSelect(food);
        setQuery('');
        setOpen(false);
    };

    return (
        <div className="relative">
            {/* Category filter */}
            <div className="flex gap-2 mb-2 flex-wrap">
                <button
                    onClick={() => setCategory('')}
                    className="text-[11px] px-2.5 py-1 rounded-full transition-all border"
                    style={!category
                        ? { background: '#00ff8820', borderColor: '#00ff88', color: '#00ff88' }
                        : { background: 'transparent', borderColor: '#2a2a2a', color: '#555' }}>
                    Tất cả
                </button>
                {FOOD_CATEGORIES.map(cat => (
                    <button key={cat}
                        onClick={() => setCategory(cat)}
                        className="text-[11px] px-2.5 py-1 rounded-full transition-all border"
                        style={category === cat
                            ? { background: '#00ff8820', borderColor: '#00ff88', color: '#00ff88' }
                            : { background: 'transparent', borderColor: '#2a2a2a', color: '#555' }}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Search input */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tìm thức ăn (vd: cơm, gà, trứng...)"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    style={{ paddingLeft: '2rem', paddingRight: query ? '2rem' : '0.75rem' }}
                />
                {query && (
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#aaa]"
                        onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Dropdown results */}
            {open && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 rounded-xl border border-[#222] shadow-2xl overflow-hidden"
                    style={{ background: '#161616', maxHeight: '260px', overflowY: 'auto' }}>
                    {results.map((food: FoodItem) => (
                        <button key={food.id}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#1f1f1f] transition-colors border-b border-[#1a1a1a] last:border-0"
                            onMouseDown={() => handleSelect(food)}>
                            <div>
                                <p className="text-sm text-white font-medium">{food.nameVi}</p>
                                <p className="text-[11px] text-[#555]">{food.category}{food.servingLabel ? ` · ${food.servingLabel}` : ''}</p>
                            </div>
                            <div className="text-right ml-4 shrink-0">
                                <p className="text-sm font-semibold text-[#00ff88]">{food.per100g.calories}</p>
                                <p className="text-[10px] text-[#555]">kcal/100g</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            {open && results.length === 0 && query && (
                <div className="absolute z-50 w-full mt-1 rounded-xl border border-[#222] p-4 text-center text-[#555] text-sm"
                    style={{ background: '#161616' }}>
                    Không tìm thấy "{query}"
                </div>
            )}

            {/* Click outside to close */}
            {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
        </div>
    );
}

// ─── Nutrition Progress Bar ─────────────────────────────────────────────────────

function NutrientBar({ label, current, target, unit, color }: {
    label: string; current: number; target: number; unit: string; color: string;
}) {
    const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const over = target > 0 && current > target;
    return (
        <div>
            <div className="flex justify-between text-[12px] mb-1">
                <span style={{ color }}>{label}</span>
                <span>
                    <span className="font-semibold text-white">{current}{unit}</span>
                    <span className="text-[#555]"> / {target}{unit}</span>
                    {over && <span className="text-[#ff4444] ml-1.5 text-[10px]">+{Math.round(current - target)}</span>}
                </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
                <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: over ? '#ff4444' : color }} />
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function MealAnalyzer({ userId }: { userId: string }) {
    const [entries, setEntries] = useState<MealEntry[]>([]);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [grams, setGrams] = useState('');
    const [mealName, setMealName] = useState('🍽️ Bữa ăn của tôi');
    const [editingMealName, setEditingMealName] = useState(false);

    // Daily targets
    const [targetCal, setTargetCal] = useState('2400');
    const [targetProtein, setTargetProtein] = useState('180');
    const [targetCarbs, setTargetCarbs] = useState('220');
    const [targetFat, setTargetFat] = useState('65');
    const [showTargetEdit, setShowTargetEdit] = useState(false);

    const totals = useMemo(() => sumNutrition(entries), [entries]);

    const handleAddFood = () => {
        if (!selectedFood || !grams || parseFloat(grams) <= 0) return;
        const newEntry: MealEntry = {
            id: Date.now().toString(),
            food: selectedFood,
            grams: parseFloat(grams),
        };
        setEntries(prev => [...prev, newEntry]);
        setSelectedFood(null);
        setGrams('');
    };

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFood(food);
        setGrams(String(food.commonServingG ?? 100));
    };

    const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

    const clearMeal = () => setEntries([]);

    // Macro calorie shares
    const proteinCal = Math.round(totals.protein * 4);
    const carbCal = Math.round(totals.carbs * 4);
    const fatCal = Math.round(totals.fat * 9);
    const totalMacroCal = proteinCal + carbCal + fatCal || 1;

    const proteinPct = Math.round((proteinCal / totalMacroCal) * 100);
    const carbPct = Math.round((carbCal / totalMacroCal) * 100);
    const fatPct = 100 - proteinPct - carbPct;

    const tCal = parseInt(targetCal) || 2400;
    const tPro = parseInt(targetProtein) || 180;
    const tCarb = parseInt(targetCarbs) || 220;
    const tFat = parseInt(targetFat) || 65;

    // Meal quality rating
    const getMealRating = () => {
        if (entries.length === 0) return null;
        const score = [
            totals.protein >= 20,
            totals.fat < 40,
            totals.carbs < 80,
            totals.calories < tCal * 0.45,
        ].filter(Boolean).length;
        if (score >= 4) return { label: '🔥 Bữa ăn rất tốt!', color: '#00ff88' };
        if (score >= 3) return { label: '👍 Bữa ăn ổn', color: '#ffb800' };
        if (score === 2) return { label: '⚠️ Cần cân bằng hơn', color: '#ff8c00' };
        return { label: '❌ Cần điều chỉnh', color: '#ff4444' };
    };
    const rating = getMealRating();

    return (
        <div className="space-y-4">
            {/* Meal header */}
            <div className="flex items-center gap-2">
                {editingMealName ? (
                    <input className="text-lg font-bold flex-1" value={mealName}
                        onChange={e => setMealName(e.target.value)}
                        onBlur={() => setEditingMealName(false)}
                        onKeyDown={e => e.key === 'Enter' && setEditingMealName(false)}
                        autoFocus />
                ) : (
                    <button className="text-lg font-bold flex-1 text-left hover:opacity-70 transition-opacity"
                        onClick={() => setEditingMealName(true)}>
                        {mealName} <span className="text-[14px] text-[#444]">✏️</span>
                    </button>
                )}
                <div className="flex gap-1">
                    {MEAL_PRESETS.map(p => (
                        <button key={p.label} title={p.label}
                            className="text-[11px] px-2 py-1 rounded-lg border border-[#2a2a2a] text-[#555] hover:text-[#aaa] hover:border-[#444] transition-all"
                            onClick={() => setMealName(p.label)}>
                            {p.label.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Daily target bar - collapsible */}
            <div className="card" style={{ padding: '0.875rem' }}>
                <button className="w-full flex items-center justify-between"
                    onClick={() => setShowTargetEdit(o => !o)}>
                    <div className="flex items-center gap-2">
                        <Target size={14} className="text-[#00ff88]" />
                        <span className="text-[12px] font-medium text-[#888]">Mục tiêu ngày</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[12px] text-[#555]">{tCal} kcal · P{tPro}g · C{tCarb}g · F{tFat}g</span>
                        <ChevronDown size={14} className={`text-[#555] transition-transform ${showTargetEdit ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                {showTargetEdit && (
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#1e1e1e]">
                        {[
                            { label: 'Calories (kcal)', val: targetCal, set: setTargetCal },
                            { label: 'Protein (g)', val: targetProtein, set: setTargetProtein },
                            { label: 'Carbs (g)', val: targetCarbs, set: setTargetCarbs },
                            { label: 'Fat (g)', val: targetFat, set: setTargetFat },
                        ].map(({ label, val, set }) => (
                            <div key={label}>
                                <label className="text-[11px] text-[#555] mb-1 block">{label}</label>
                                <input type="number" value={val} onChange={e => set(e.target.value)} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Food search & add */}
            <div className="card space-y-3" style={{ padding: '1rem' }}>
                <p className="text-[12px] font-medium text-[#888] uppercase tracking-wide">Thêm thức ăn vào bữa</p>
                <FoodSearch onSelect={handleSelectFood} userId={userId} />

                {selectedFood && (
                    <div className="rounded-xl p-3 fade-in" style={{ background: '#00ff8810', border: '1px solid #00ff8833' }}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <p className="font-semibold text-[#00ff88] text-sm">{selectedFood.nameVi}</p>
                                <p className="text-[11px] text-[#555] mt-0.5">
                                    {selectedFood.per100g.calories} kcal · P {selectedFood.per100g.protein}g · C {selectedFood.per100g.carbs}g · F {selectedFood.per100g.fat}g <span className="ml-1">(per 100g)</span>
                                </p>
                            </div>
                            <button onClick={() => setSelectedFood(null)} className="text-[#555] hover:text-[#888]"><X size={14} /></button>
                        </div>

                        <div className="flex gap-2 mt-3">
                            <div className="flex-1">
                                <label className="text-[11px] text-[#888] block mb-1">Khối lượng (g)</label>
                                <div className="flex gap-1">
                                    <input type="number" value={grams} onChange={e => setGrams(e.target.value)}
                                        placeholder="100" style={{ flex: 1 }} />
                                    {selectedFood.commonServingG && (
                                        <button
                                            className="px-2 py-1.5 text-[11px] rounded-lg border border-[#00ff8844] text-[#00ff88] whitespace-nowrap"
                                            onClick={() => setGrams(String(selectedFood.commonServingG))}>
                                            {selectedFood.servingLabel ?? `${selectedFood.commonServingG}g`}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button className="btn-primary flex items-center gap-1.5 h-9 px-4"
                                    onClick={handleAddFood}>
                                    <Plus size={14} />
                                    Thêm
                                </button>
                            </div>
                        </div>

                        {/* Preview nutrition for entered grams */}
                        {grams && parseFloat(grams) > 0 && (() => {
                            const n = calcNutrition(selectedFood, parseFloat(grams));
                            return (
                                <div className="flex gap-4 mt-2.5 px-1 text-[12px] text-[#aaa]">
                                    <span>🔥 <strong className="text-white">{n.calories}</strong> kcal</span>
                                    <span>P <strong className="text-[#00ff88]">{n.protein}g</strong></span>
                                    <span>C <strong className="text-[#60a5fa]">{n.carbs}g</strong></span>
                                    <span>F <strong className="text-[#ffb800]">{n.fat}g</strong></span>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Food entries list */}
            {entries.length > 0 && (
                <div className="space-y-2 fade-in">
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] font-medium text-[#888] uppercase tracking-wide">
                            Danh sách món ({entries.length})
                        </p>
                        <button onClick={clearMeal} className="text-[11px] text-[#ff4444] hover:opacity-70">
                            Xóa tất cả
                        </button>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#222]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ background: '#1a1a1a' }}>
                                    <th className="text-left px-3 py-2 text-[11px] text-[#555] font-medium">Món ăn</th>
                                    <th className="text-right px-3 py-2 text-[11px] text-[#555] font-medium">Cal</th>
                                    <th className="text-right px-3 py-2 text-[11px] text-[#555] font-medium">P(g)</th>
                                    <th className="text-right px-3 py-2 text-[11px] text-[#555] font-medium">C(g)</th>
                                    <th className="text-right px-3 py-2 text-[11px] text-[#555] font-medium">F(g)</th>
                                    <th className="w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, i) => {
                                    const n = calcNutrition(entry.food, entry.grams);
                                    return (
                                        <tr key={entry.id} style={{ background: i % 2 === 0 ? '#161616' : '#111' }}>
                                            <td className="px-3 py-2.5">
                                                <p className="text-white text-xs font-medium">{entry.food.nameVi}</p>
                                                <p className="text-[10px] text-[#555]">{entry.grams}g</p>
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-white font-mono text-xs">{n.calories}</td>
                                            <td className="px-3 py-2.5 text-right text-[#00ff88] font-mono text-xs">{n.protein}</td>
                                            <td className="px-3 py-2.5 text-right text-[#60a5fa] font-mono text-xs">{n.carbs}</td>
                                            <td className="px-3 py-2.5 text-right text-[#ffb800] font-mono text-xs">{n.fat}</td>
                                            <td className="pr-2 py-2.5">
                                                <button onClick={() => removeEntry(entry.id)}
                                                    className="text-[#333] hover:text-[#ff4444] transition-colors">
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Totals row */}
                            <tfoot>
                                <tr style={{ background: '#1f1f1f', borderTop: '1px solid #2a2a2a' }}>
                                    <td className="px-3 py-2.5 text-[12px] font-bold text-[#888]">TỔNG</td>
                                    <td className="px-3 py-2.5 text-right font-bold text-white text-xs">{totals.calories}</td>
                                    <td className="px-3 py-2.5 text-right font-bold text-[#00ff88] text-xs">{totals.protein}</td>
                                    <td className="px-3 py-2.5 text-right font-bold text-[#60a5fa] text-xs">{totals.carbs}</td>
                                    <td className="px-3 py-2.5 text-right font-bold text-[#ffb800] text-xs">{totals.fat}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Macro distribution bar */}
                    <div className="card" style={{ padding: '0.875rem' }}>
                        <p className="text-[11px] text-[#555] mb-2">Phân bổ macro của bữa này</p>
                        <div className="flex rounded-full overflow-hidden h-4">
                            <div style={{ width: `${proteinPct}%`, background: '#00ff88' }}
                                className="flex items-center justify-center text-[9px] font-bold text-black">
                                {proteinPct > 8 ? `P${proteinPct}%` : ''}
                            </div>
                            <div style={{ width: `${carbPct}%`, background: '#60a5fa' }}
                                className="flex items-center justify-center text-[9px] font-bold text-black">
                                {carbPct > 8 ? `C${carbPct}%` : ''}
                            </div>
                            <div style={{ width: `${fatPct}%`, background: '#ffb800' }}
                                className="flex items-center justify-center text-[9px] font-bold text-black">
                                {fatPct > 8 ? `F${fatPct}%` : ''}
                            </div>
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-[#555]">
                            <span className="text-[#00ff88]">Protein {proteinCal} kcal</span>
                            <span className="text-[#60a5fa]">Carbs {carbCal} kcal</span>
                            <span className="text-[#ffb800]">Fat {fatCal} kcal</span>
                        </div>
                    </div>

                    {/* vs Daily target */}
                    <div className="card space-y-3" style={{ padding: '1rem' }}>
                        <p className="text-[12px] font-medium text-[#888] uppercase tracking-wide">So với mục tiêu ngày</p>
                        <NutrientBar label="🔥 Calories" current={totals.calories} target={tCal} unit="" color="#00ff88" />
                        <NutrientBar label="💪 Protein" current={totals.protein} target={tPro} unit="g" color="#00ff88" />
                        <NutrientBar label="🍚 Carbs" current={totals.carbs} target={tCarb} unit="g" color="#60a5fa" />
                        <NutrientBar label="🥑 Fat" current={totals.fat} target={tFat} unit="g" color="#ffb800" />

                        {/* Remaining */}
                        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-[#1e1e1e]">
                            {[
                                { label: 'Còn lại (cal)', val: Math.max(0, tCal - totals.calories), color: '#888' },
                                { label: 'Protein còn', val: `${Math.max(0, tPro - totals.protein).toFixed(0)}g`, color: '#00ff88' },
                                { label: 'Carbs còn', val: `${Math.max(0, tCarb - totals.carbs).toFixed(0)}g`, color: '#60a5fa' },
                                { label: 'Fat còn', val: `${Math.max(0, tFat - totals.fat).toFixed(0)}g`, color: '#ffb800' },
                            ].map(item => (
                                <div key={item.label} className="text-center rounded-lg py-2" style={{ background: '#1a1a1a' }}>
                                    <div className="text-sm font-bold" style={{ color: item.color }}>{item.val}</div>
                                    <div className="text-[9px] text-[#444] mt-0.5">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    {rating && (
                        <div className="rounded-xl p-3 flex items-center gap-2.5 fade-in"
                            style={{ background: rating.color + '12', border: `1px solid ${rating.color}33` }}>
                            <Info size={14} style={{ color: rating.color }} className="shrink-0" />
                            <span className="text-sm font-semibold" style={{ color: rating.color }}>{rating.label}</span>
                            <span className="text-[12px] text-[#555] ml-auto">{totals.calories} kcal tổng</span>
                        </div>
                    )}
                </div>
            )}

            {entries.length === 0 && (
                <div className="text-center py-8 text-[#444]">
                    <p className="text-3xl mb-2">🍽️</p>
                    <p className="text-sm">Tìm và thêm món ăn vào bữa của bạn</p>
                    <p className="text-[11px] mt-1 text-[#333]">App sẽ tự tính protein, carb, fat và so với mục tiêu</p>
                </div>
            )}
        </div>
    );
}
