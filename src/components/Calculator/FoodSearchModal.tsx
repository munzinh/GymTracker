import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Plus, Minus, Check, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { FOOD_CATEGORIES, type FoodItem, loadFoodDatabase } from './foodDatabase';
import { calcNutrition } from '../../utils/nutritionMath';

interface Props {
    userId: string;
    onClose: () => void;
    onAdd: (food: FoodItem, grams: number) => void;
}

const QUICK_GRAMS = [50, 100, 150, 200, 300];

/**
 * Tiny Macro Circle Component
 */
function MacroCircle({ value, label, color, size = 48, stroke = 4 }: { value: number | string, label: string, color: string, size?: number, stroke?: number }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx={size / 2} cy={size / 2} r={(size - stroke) / 2}
                        fill="none" strokeWidth={stroke} stroke="currentColor"
                        className="text-white/5"
                    />
                    <circle
                        cx={size / 2} cy={size / 2} r={(size - stroke) / 2}
                        fill="none" strokeWidth={stroke} stroke="currentColor"
                        strokeDasharray={Math.PI * (size - stroke)}
                        strokeDashoffset={Math.PI * (size - stroke) * 0.2} // Placeholder for real progress if needed, but here we just use for style
                        strokeLinecap="round"
                        style={{ color }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-black text-white">{value}</span>
                </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#555]">{label}</span>
        </div>
    );
}

export function FoodSearchModal({ userId, onClose, onAdd }: Props) {
    const [foods] = useState<FoodItem[]>(() => loadFoodDatabase(userId));
    const [query, setQuery] = useState('');
    const [cat, setCat] = useState('');
    const [pickedId, setPickedId] = useState<string | null>(null);
    const [grams, setGrams] = useState(100);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to top when opening or changing filters
    useEffect(() => {
        // Cuộn toàn bộ trình duyệt lên trên cùng (xử lý lỗi Safari iOS bị vướng thanh công cụ)
        window.scrollTo(0, 0);

        // Use requestAnimationFrame to ensure the list has rendered before scrolling
        requestAnimationFrame(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
        });
    }, [cat, query]); // Scroll up when category or search query changes

    const results = useMemo(() => {
        const q = query.toLowerCase();
        const matches = foods.filter(f =>
            (!cat || f.category === cat) &&
            (!q || f.nameVi.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
        );

        // Luôn trả về 30 món để user có thể cuộn bên trong danh sách nhỏ
        return matches.slice(0, 30);
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
            setPickedId(null);
            setQuery('');
            onClose();
        }
    };

    const pickedFood = foods.find(f => f.id === pickedId) ?? null;
    const preview = pickedFood && grams > 0 ? calcNutrition(pickedFood, grams) : null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden fade-in bg-[#080808]" style={{ height: '100dvh' }}>

            {/* Glass Header */}
            <div className="sticky top-0 z-20 bg-[#0a0a0a/80] backdrop-blur-xl border-b border-white/5 px-4 pt-4 pb-3 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onClose} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#666] hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#888]">Thêm món mới</h2>
                    <div className="w-8" /> {/* Spacer */}
                </div>

                {/* Search Input */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#00ff88] transition-colors" size={18} />
                    <input
                        ref={inputRef}
                        type="search"
                        placeholder="Tìm phở, cơm tấm, trà sữa..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 text-[15px] font-medium text-white placeholder-[#444] outline-none focus:border-[#00ff8850] focus:bg-white/[0.05] transition-all"
                    />
                    {query && (
                        <button onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#666] hover:text-white">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Area */}
            <div
                ref={scrollRef}
                className="overflow-y-auto hide-scrollbar overscroll-contain pb-20 mt-2 mx-4"
                style={{ maxHeight: '75dvh' }}
            >

                {/* Category Bar */}
                <div className="flex gap-2.5 py-2 mb-2 overflow-x-auto hide-scrollbar sticky top-0 z-10 bg-[#080808]">
                    {['', ...FOOD_CATEGORIES].map(c => (
                        <button
                            key={c || '_all'}
                            onClick={() => setCat(c)}
                            className={`shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold border transition-all ${c === cat
                                ? 'bg-[#00ff88] text-black border-[#00ff88] shadow-[0_4px_12px_rgba(0,255,136,0.3)]'
                                : 'bg-white/5 text-[#888] border-transparent hover:bg-white/10'}`}
                        >
                            {c || '🥗 Tất cả'}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-3">
                    {
                        results.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#333]">
                                    <AlertCircle size={32} />
                                </div>
                                <div>
                                    <p className="text-[#888] font-bold">Không tìm thấy món bạn cần</p>
                                    <p className="text-[12px] text-[#444] mt-1">Hãy thử tìm từ khoá khác hoặc tự thêm món mới</p>
                                </div>
                                <button className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[12px] font-black text-[#00ff88] hover:bg-white/10 transition-all uppercase tracking-wider">
                                    + Tự thêm món mới
                                </button>
                            </div>
                        ) : (
                            results.map(food => {
                                const isPicked = pickedId === food.id;
                                return (
                                    <div
                                        key={food.id}
                                        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${isPicked
                                            ? 'bg-[#121212] border-[#00ff8840] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10'
                                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <button
                                            onClick={() => selectFood(food)}
                                            className="w-full text-left flex items-center gap-4 px-4 py-4 active:scale-[0.98] transition-transform"
                                        >
                                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-lg font-black"
                                                style={{ background: isPicked ? '#00ff88' : '#1a1a1a', color: isPicked ? '#000' : '#444' }}>
                                                {food.nameVi.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[14px] font-bold text-white mb-0.5">{food.nameVi}</h4>
                                                <p className="text-[11px] text-[#555] font-medium">
                                                    {food.category} • {food.servingLabel || 'Khối lượng'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[15px] font-black text-white">{food.per100g.calories}</p>
                                                <p className="text-[9px] font-bold text-[#444] uppercase tracking-tighter">kcal / 100g</p>
                                            </div>
                                            <ChevronRight size={16} className={`text - [#333] transition - transform duration - 300 ${isPicked ? 'rotate-90 text-[#00ff88]' : ''}`} />
                                        </button>

                                        {/* Expansion Panel */}
                                        {isPicked && (
                                            <div className="px-4 pb-5 space-y-5 fade-in">

                                                {/* Macro Visualizer */}
                                                {preview && (
                                                    <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                                                        <div className="flex-1">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-[32px] font-black text-white leading-none">{preview.calories}</span>
                                                                <span className="text-xs font-bold text-[#555] uppercase">Kcal</span>
                                                            </div>
                                                            <p className="text-[11px] text-[#444] font-medium mt-1 flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                                                                Tổng dinh dưỡng cho {grams}g
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <MacroCircle label="Pro" value={Math.round(preview.protein)} color="#00ff88" />
                                                            <MacroCircle label="Carb" value={Math.round(preview.carbs)} color="#00e5ff" />
                                                            <MacroCircle label="Fat" value={Math.round(preview.fat)} color="#ffb800" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Input Section */}
                                                <div className="space-y-4">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="flex items-center gap-6">
                                                            <button
                                                                onClick={() => setGrams(g => Math.max(1, g - (g > 100 ? 50 : 10)))}
                                                                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:bg-[#00ff88] active:text-black transition-all"
                                                            >
                                                                <Minus size={20} />
                                                            </button>
                                                            <div className="relative flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={grams}
                                                                    onChange={e => setGrams(Math.max(1, parseInt(e.target.value) || 0))}
                                                                    className="w-24 text-center text-[42px] font-black text-white bg-transparent outline-none border-b-2 border-white/10 focus:border-[#00ff88] transition-colors"
                                                                />
                                                                <span className="text-[#444] font-black text-xl">g</span>
                                                            </div>
                                                            <button
                                                                onClick={() => setGrams(g => g + (g >= 100 ? 50 : 10))}
                                                                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:bg-[#00ff88] active:text-black transition-all"
                                                            >
                                                                <Plus size={20} />
                                                            </button>
                                                        </div>

                                                        {/* Serving Choices */}
                                                        <div className="w-full space-y-3 pt-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-[1px] flex-1 bg-white/5" />
                                                                <span className="text-[9px] font-black text-[#444] uppercase tracking-widest whitespace-nowrap">ĐỊNH LƯỢNG CHUẨN</span>
                                                                <div className="h-[1px] flex-1 bg-white/5" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 justify-center">
                                                                {food.servings?.map(s => (
                                                                    <button
                                                                        key={s.label}
                                                                        onClick={() => setGrams(s.grams)}
                                                                        className={`px - 4 py - 2.5 rounded - xl border text - [11px] font - black transition - all ${grams === s.grams
                                                                            ? 'bg-[#00ff8815] border-[#00ff88] text-[#00ff88]'
                                                                            : 'bg-white/5 border-transparent text-[#666] hover:text-[#aaa]'
                                                                            }`}
                                                                    >
                                                                        {s.label}
                                                                    </button>
                                                                ))}
                                                                {!food.servings && food.commonServingG && (
                                                                    <button
                                                                        onClick={() => setGrams(food.commonServingG!)}
                                                                        className={`px-4 py-2.5 rounded-xl border text-[11px] font-black transition-all ${grams === food.commonServingG
                                                                            ? 'bg-[#00ff8815] border-[#00ff88] text-[#00ff88]'
                                                                            : 'bg-white/5 border-transparent text-[#666] hover:text-[#aaa]'
                                                                            }`}
                                                                    >
                                                                        {food.servingLabel || '1 Phần'}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap gap-2 justify-center opacity-60">
                                                                {QUICK_GRAMS.filter(p => p !== food.commonServingG && !food.servings?.some(s => s.grams === p)).map(p => (
                                                                    <button
                                                                        key={p}
                                                                        onClick={() => setGrams(p)}
                                                                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${grams === p
                                                                            ? 'bg-white/10 border-white/20 text-white'
                                                                            : 'bg-transparent border-white/5 text-[#444]'
                                                                            }`}
                                                                    >
                                                                        {p}g
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div >

                                                    {/* Action Button */}
                                                    < button
                                                        onClick={() => confirmAdd(food)
                                                        }
                                                        className="w-full py-4 rounded-2xl bg-[#00ff88] text-black text-[15px] font-black uppercase tracking-widest shadow-[0_8px_32px_rgba(0,255,136,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Check size={20} strokeWidth={3} />
                                                        Xác nhận thêm
                                                    </button >
                                                </div >
                                            </div >
                                        )}
                                    </div >
                                );
                            })
                        )
                    }
                </div >
            </div >

            {/* Hint bar at bottom */}
            < div className="bg-[#111] border-t border-white/5 px-4 py-4 flex items-center justify-center gap-2 text-[#444] shrink-0" >
                <Info size={14} />
                <span className="text-[11px] font-bold">Chọn món để xem chi tiết dinh dưỡng</span>
            </div >
        </div >
    );
}
