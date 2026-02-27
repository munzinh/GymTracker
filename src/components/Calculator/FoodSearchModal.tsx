import { useState, useMemo, useRef } from 'react';
import { Search, X, Plus, Minus, Check } from 'lucide-react';
import { FOOD_CATEGORIES, type FoodItem, loadFoodDatabase } from './foodDatabase';
import { calcNutrition } from '../../utils/nutritionMath';

interface Props {
    userId: string;
    onClose: () => void;
    onAdd: (food: FoodItem, grams: number) => void;
}

const QUICK_GRAMS = [50, 100, 150, 200, 300];

export function FoodSearchModal({ userId, onClose, onAdd }: Props) {
    const [foods] = useState<FoodItem[]>(() => loadFoodDatabase(userId));
    const [query, setQuery] = useState('');
    const [cat, setCat] = useState('');
    // Which food is expanded inline (gram picker)
    const [pickedId, setPickedId] = useState<string | null>(null);
    const [grams, setGrams] = useState(100);
    const inputRef = useRef<HTMLInputElement>(null);

    // No auto-focus — prevents iOS keyboard from opening automatically

    const results = useMemo(() => {
        const q = query.toLowerCase();
        return foods.filter(f =>
            (!cat || f.category === cat) &&
            (!q || f.nameVi.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
        ).slice(0, 30);
    }, [query, cat, foods]);

    const selectFood = (food: FoodItem) => {
        if (pickedId === food.id) {
            setPickedId(null);
        } else {
            setPickedId(food.id);
            setGrams(food.commonServingG ?? 100);
        }
    };

    const confirmAdd = (food: FoodItem) => {
        if (grams > 0) {
            onAdd(food, grams);
            // Reset and allow adding another item
            setPickedId(null);
            setQuery('');
            onClose();
        }
    };

    const pickedFood = foods.find(f => f.id === pickedId) ?? null;
    const preview = pickedFood && grams > 0 ? calcNutrition(pickedFood, grams) : null;

    return (
        <>
            {/* Fullscreen overlay — uses dvh for iOS Safari */}
            <div className="fixed inset-0 z-50 flex flex-col overflow-hidden fade-in"
                style={{ height: '100dvh', background: '#0a0a0a' }}>

                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e1e] shrink-0 bg-[#111]">
                    <button onClick={onClose} className="p-2 -ml-1 rounded-xl bg-[#1a1a1a] text-[#aaa] hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                    <h2 className="font-bold text-[15px] text-white flex-1">Thêm món ăn</h2>
                </div>

                {/* Search bar */}
                <div className="px-4 pb-3 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" size={16} />
                        <input
                            ref={inputRef}
                            type="search"
                            autoComplete="off"
                            placeholder="Tìm món ăn..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl py-2.5 pl-10 pr-9 text-[14px] text-white placeholder-[#555] outline-none focus:border-[#00ff88] transition-colors"
                        />
                        {query && (
                            <button onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white w-5 h-5 flex items-center justify-center">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Category chips */}
                <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar shrink-0">
                    {['', ...FOOD_CATEGORIES].map(c => (
                        <button key={c || '_all'} onClick={() => setCat(c)}
                            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${c === cat
                                ? 'bg-[#00ff8818] text-[#00ff88] border-[#00ff8855]'
                                : 'bg-[#1a1a1a] text-[#777] border-[#252525]'}`}>
                            {c || 'Tất cả'}
                        </button>
                    ))}
                </div>

                {/* Results — scrollable section */}
                <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1.5 overscroll-contain">
                    {results.length === 0 ? (
                        <div className="flex flex-col items-center py-14 text-[#555]">
                            <Search size={34} className="mb-3 opacity-20" />
                            <p className="text-sm">Không tìm thấy "{query}"</p>
                        </div>
                    ) : results.map(food => {
                        const isPicked = pickedId === food.id;
                        return (
                            <div key={food.id}>
                                {/* Food row */}
                                <button
                                    onClick={() => selectFood(food)}
                                    className={`w-full text-left flex items-center gap-3 px-3.5 py-3 transition-all rounded-xl ${isPicked
                                        ? 'bg-[#00ff8812] border border-[#00ff8840] rounded-b-none border-b-transparent'
                                        : 'bg-[#181818] border border-[#232323] hover:border-[#333]'}`}>
                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[16px] font-bold"
                                        style={{ background: '#00ff8810', color: '#00ff88' }}>
                                        {food.nameVi.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-white truncate">{food.nameVi}</p>
                                        <p className="text-[10px] text-[#666]">
                                            {food.category}{food.servingLabel ? ` · ${food.servingLabel}` : ''}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-[13px] text-white">{food.per100g.calories}</p>
                                        <p className="text-[10px] text-[#555]">kcal/100g</p>
                                    </div>
                                </button>

                                {/* Inline gram picker — appears directly below, NO navigation */}
                                {isPicked && (
                                    <div className="bg-[#0f0f0f] border border-[#00ff8840] border-t-0 rounded-b-xl px-3.5 pt-3 pb-3.5 fade-in">

                                        {/* Live macro preview */}
                                        {preview && (
                                            <div className="grid grid-cols-4 gap-1.5 mb-3">
                                                {[
                                                    { l: 'Calo', v: preview.calories, c: '#fff' },
                                                    { l: 'Protein', v: preview.protein + 'g', c: '#00ff88' },
                                                    { l: 'Carbs', v: preview.carbs + 'g', c: '#00e5ff' },
                                                    { l: 'Fat', v: preview.fat + 'g', c: '#ffb800' },
                                                ].map(m => (
                                                    <div key={m.l} className="rounded-xl py-2 text-center"
                                                        style={{ background: m.c + '10', border: `1px solid ${m.c}20` }}>
                                                        <p className="text-[14px] font-black" style={{ color: m.c }}>{m.v}</p>
                                                        <p className="text-[9px] text-[#555]">{m.l}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Stepper + input on one row */}
                                        <div className="flex items-center gap-2 mb-2.5">
                                            <button onClick={() => setGrams(g => Math.max(1, g - 10))}
                                                className="w-10 h-10 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-white flex items-center justify-center hover:border-[#444] active:opacity-70 transition-all shrink-0">
                                                <Minus size={16} />
                                            </button>
                                            <div className="flex-1 flex items-center justify-center gap-1.5">
                                                <input
                                                    type="number"
                                                    value={grams}
                                                    onChange={e => setGrams(Math.max(1, parseInt(e.target.value) || 0))}
                                                    className="w-20 text-center text-[24px] font-black text-white bg-transparent outline-none border-b-2 border-[#333] focus:border-[#00ff88] transition-colors"
                                                />
                                                <span className="text-[#555] text-[13px]">g</span>
                                            </div>
                                            <button onClick={() => setGrams(g => g + 10)}
                                                className="w-10 h-10 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-white flex items-center justify-center hover:border-[#444] active:opacity-70 transition-all shrink-0">
                                                <Plus size={16} />
                                            </button>

                                            {/* Confirm — right next to stepper, always visible */}
                                            <button
                                                onClick={() => confirmAdd(food)}
                                                disabled={grams <= 0}
                                                className="h-10 px-4 rounded-xl font-black text-[13px] text-black flex items-center gap-1.5 shrink-0 disabled:opacity-40 active:scale-95 transition-all"
                                                style={{ background: 'linear-gradient(135deg,#00ff88,#00cc6a)' }}>
                                                <Check size={15} strokeWidth={3} />
                                                Thêm
                                            </button>
                                        </div>

                                        {/* Serving size picker */}
                                        <div className="flex gap-1.5 flex-wrap">
                                            {/* Multi-serving buttons (tô nhỏ/vừa/lớn) */}
                                            {food.servings?.map(s => {
                                                const estKcal = Math.round(food.per100g.calories * s.grams / 100);
                                                return (
                                                    <button key={s.label} onClick={() => setGrams(s.grams)}
                                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${grams === s.grams
                                                            ? 'bg-[#00ff8820] border-[#00ff8866] text-[#00ff88]'
                                                            : 'bg-[#1e1e1e] border-[#2a2a2a] text-[#888]'}`}>
                                                        {s.label} <span className="opacity-60">~{estKcal}kcal</span>
                                                    </button>
                                                );
                                            })}
                                            {/* Single serving button (if no multi-serving) */}
                                            {!food.servings?.length && food.commonServingG && (
                                                <button onClick={() => setGrams(food.commonServingG!)}
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${grams === food.commonServingG ? 'bg-[#00ff8820] border-[#00ff8866] text-[#00ff88]' : 'bg-[#1e1e1e] border-[#2a2a2a] text-[#888]'}`}>
                                                    {food.servingLabel ?? `${food.commonServingG}g`}
                                                </button>
                                            )}
                                            {/* Generic gram quick-picks */}
                                            {QUICK_GRAMS.filter(p => p !== food.commonServingG && !food.servings?.some(s => s.grams === p)).map(p => (
                                                <button key={p} onClick={() => setGrams(p)}
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${grams === p ? 'bg-[#00ff8820] border-[#00ff8866] text-[#00ff88]' : 'bg-[#1e1e1e] border-[#2a2a2a] text-[#777]'}`}>
                                                    {p}g
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
