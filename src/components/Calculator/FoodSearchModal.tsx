import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Plus, Minus, Check, ChevronRight, Info, AlertCircle } from 'lucide-react';
import {
    FOOD_CATEGORIES, type FoodItem, loadFoodDatabase,
    addCustomFood, loadCategories
} from './foodDatabase';
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
                        strokeDashoffset={Math.PI * (size - stroke) * 0.2}
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
    const EMPTY_NEW_FOOD = {
        nameVi: '',
        category: FOOD_CATEGORIES[0],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        commonServingG: 100,
        servingLabel: '1 phần'
    };

    const EMPTY_QUICK_ADD = {
        nameVi: 'Thêm nhanh',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
    };

    const [foods, setFoods] = useState<FoodItem[]>(() => loadFoodDatabase(userId));
    const [categories] = useState<string[]>(() => loadCategories(userId));
    const [query, setQuery] = useState('');
    const [cat, setCat] = useState('');
    const [pickedId, setPickedId] = useState<string | null>(null);
    const [grams, setGrams] = useState(100);
    const [baseServing, setBaseServing] = useState<{ label: string, grams: number } | null>(null);
    const [multiplier, setMultiplier] = useState(1);

    // Quick Add State
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isQuickAdd, setIsQuickAdd] = useState(false);
    const [newFoodForm, setNewFoodForm] = useState(EMPTY_NEW_FOOD);
    const [quickAddForm, setQuickAddForm] = useState(EMPTY_QUICK_ADD);

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSaveNewFood = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFoodForm.nameVi.trim()) return alert('Vui lòng nhập tên món!');

        const newId = 'custom_' + Date.now();
        const food: FoodItem = {
            id: newId,
            name: newFoodForm.nameVi,
            nameVi: newFoodForm.nameVi,
            category: newFoodForm.category,
            per100g: {
                calories: newFoodForm.calories,
                protein: newFoodForm.protein,
                carbs: newFoodForm.carbs,
                fat: newFoodForm.fat
            },
            commonServingG: newFoodForm.commonServingG,
            servingLabel: newFoodForm.servingLabel,
            isCustom: true
        };

        const updatedDb = addCustomFood(userId, food);
        setFoods(updatedDb);
        setIsAddingNew(false);
        setNewFoodForm(EMPTY_NEW_FOOD);

        // Auto-select the new food
        setPickedId(newId);
        setGrams(food.commonServingG || 100);
        setQuery('');
        setCat('');
    };

    const handleSaveQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const customFood: FoodItem = {
            id: 'quickadd_' + Date.now(),
            name: quickAddForm.nameVi,
            nameVi: quickAddForm.nameVi,
            category: 'Thêm nhanh',
            per100g: {
                calories: quickAddForm.calories,
                protein: quickAddForm.protein,
                carbs: quickAddForm.carbs,
                fat: quickAddForm.fat
            },
            commonServingG: 100,
            servingLabel: '1 Phần',
            isCustom: true
        };
        // Add direct to meal, NOT database
        onAdd(customFood, 100);
        setIsQuickAdd(false);
        setQuickAddForm(EMPTY_QUICK_ADD);
        onClose();
    };

    const handleServingClick = (label: string, g: number) => {
        setBaseServing({ label, grams: g });
        setMultiplier(1);
        setGrams(g);
    };

    const handleMultiplier = (delta: number) => {
        if (baseServing) {
            const newM = Math.max(0.5, multiplier + delta);
            setMultiplier(newM);
            setGrams(Math.round(newM * baseServing.grams));
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        requestAnimationFrame(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
        });
    }, [cat, query, isAddingNew, isQuickAdd]);

    const results = useMemo(() => {
        const q = query.toLowerCase();
        const matches = foods.filter(f =>
            (!cat || f.category === cat) &&
            (!q || f.nameVi.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
        );
        return matches.slice(0, 30);
    }, [query, cat, foods]);

    const selectFood = (food: FoodItem) => {
        if (pickedId === food.id) {
            setPickedId(null);
        } else {
            setPickedId(food.id);
            setBaseServing(null);
            setMultiplier(1);
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
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#888]">
                        {isAddingNew ? 'Lưu món mới' : isQuickAdd ? 'Nhập tay nhanh' : 'Thêm món ăn'}
                    </h2>
                    <div className="flex gap-2">
                        {!isAddingNew && !isQuickAdd && (
                            <button
                                onClick={() => setIsQuickAdd(true)}
                                className="px-3 h-10 rounded-full flex items-center justify-center transition-all bg-[#00e5ff15] text-[#00e5ff] text-[11px] font-black uppercase tracking-widest"
                            >
                                + Nhập tay
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (isQuickAdd) {
                                    setIsQuickAdd(false);
                                } else {
                                    setIsAddingNew(!isAddingNew);
                                }
                            }}
                            className={`w-10 h-10 -mr-2 rounded-full flex items-center justify-center transition-all ${(isAddingNew || isQuickAdd) ? 'bg-[#ff444415] text-[#ff4444] rotate-45' : 'bg-[#00ff8815] text-[#00ff88]'}`}
                        >
                            <Plus size={22} />
                        </button>
                    </div>
                </div>

                {!isAddingNew && !isQuickAdd && (
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
                )}
            </div>

            {/* Scrollable Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto hide-scrollbar overscroll-contain pb-20 mt-2 mx-4"
            >
                {isQuickAdd ? (
                    <form onSubmit={handleSaveQuickAdd} className="space-y-5 py-2 fade-in">
                        <div className="bg-[#00e5ff10] border border-[#00e5ff30] rounded-2xl p-4 mb-4">
                            <p className="text-[12px] text-[#00e5ff] font-medium text-center">
                                Nhập trực tiếp số Calo và Macros mà bạn lấy từ ChatGPT. Món này sẽ được lưu thẳng vào bữa ăn mà không lưu vào DataBase.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-[#444] uppercase tracking-widest mb-1.5 ml-1">Tên hiển thị (Tuỳ chọn)</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="VD: Cơm gà nướng GPT"
                                    value={quickAddForm.nameVi}
                                    onChange={e => setQuickAddForm({ ...quickAddForm, nameVi: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] text-white focus:border-[#00e5ff50] outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Calories', sub: 'Tổng Kcal', key: 'calories', color: '#fff' },
                                    { label: 'Protein', sub: 'Tổng Gram', key: 'protein', color: '#00ff88' },
                                    { label: 'Carbs', sub: 'Tổng Gram', key: 'carbs', color: '#00e5ff' },
                                    { label: 'Fat', sub: 'Tổng Gram', key: 'fat', color: '#ffb800' }
                                ].map(field => (
                                    <div key={field.key} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3">
                                        <label className="block text-[10px] font-bold uppercase tracking-tight mb-1" style={{ color: field.color }}>{field.label}</label>
                                        <div className="flex items-baseline gap-1">
                                            <input
                                                type="number" step="0.1"
                                                value={quickAddForm[field.key as keyof typeof quickAddForm] || ''}
                                                onChange={e => setQuickAddForm({ ...quickAddForm, [field.key]: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-transparent text-lg font-black text-white outline-none"
                                                placeholder="0"
                                            />
                                            <span className="text-[9px] font-bold text-[#444] whitespace-nowrap">{field.sub}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-[#00e5ff] text-black text-[15px] font-black uppercase tracking-widest shadow-[0_8px_32px_rgba(0,229,255,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={20} strokeWidth={3} />
                            Thêm Trực Tiếp
                        </button>
                    </form>
                ) : isAddingNew ? (
                    <form onSubmit={handleSaveNewFood} className="space-y-5 py-2 fade-in">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-[#444] uppercase tracking-widest mb-1.5 ml-1">Tên món ăn *</label>
                                <input
                                    required autoFocus
                                    type="text"
                                    placeholder="VD: Cơm gà nướng, Phở tái..."
                                    value={newFoodForm.nameVi}
                                    onChange={e => setNewFoodForm({ ...newFoodForm, nameVi: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] text-white focus:border-[#00ff8850] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[#444] uppercase tracking-widest mb-1.5 ml-1">Danh mục</label>
                                <select
                                    value={newFoodForm.category}
                                    onChange={e => setNewFoodForm({ ...newFoodForm, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-[14px] text-white focus:border-[#00ff8850] outline-none transition-all appearance-none"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Calories', sub: 'kcal/100g', key: 'calories', color: '#fff' },
                                    { label: 'Protein', sub: 'g/100g', key: 'protein', color: '#00ff88' },
                                    { label: 'Carbs', sub: 'g/100g', key: 'carbs', color: '#00e5ff' },
                                    { label: 'Fat', sub: 'g/100g', key: 'fat', color: '#ffb800' }
                                ].map(field => (
                                    <div key={field.key} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3">
                                        <label className="block text-[10px] font-bold uppercase tracking-tight mb-1" style={{ color: field.color }}>{field.label}</label>
                                        <div className="flex items-baseline gap-1">
                                            <input
                                                type="number" step="0.1"
                                                value={newFoodForm[field.key as keyof typeof newFoodForm] || ''}
                                                onChange={e => setNewFoodForm({ ...newFoodForm, [field.key]: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-transparent text-lg font-black text-white outline-none"
                                                placeholder="0"
                                            />
                                            <span className="text-[9px] font-bold text-[#444] whitespace-nowrap">{field.sub}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#444] uppercase tracking-widest mb-1.5 ml-1">Định lượng (g)</label>
                                    <input
                                        type="number"
                                        value={newFoodForm.commonServingG}
                                        onChange={e => setNewFoodForm({ ...newFoodForm, commonServingG: parseInt(e.target.value) || 100 })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[14px] text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#444] uppercase tracking-widest mb-1.5 ml-1">Tên gọi</label>
                                    <input
                                        type="text"
                                        placeholder="1 chén, 1 đĩa..."
                                        value={newFoodForm.servingLabel}
                                        onChange={e => setNewFoodForm({ ...newFoodForm, servingLabel: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[14px] text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-[#00ff88] text-black text-[15px] font-black uppercase tracking-widest shadow-[0_8px_32px_rgba(0,255,136,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={20} strokeWidth={3} />
                            Lưu & Chọn món này
                        </button>
                    </form>
                ) : (
                    <>
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
                                        <button
                                            onClick={() => setIsAddingNew(true)}
                                            className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[12px] font-black text-[#00ff88] hover:bg-white/10 transition-all uppercase tracking-wider"
                                        >
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
                                                    <ChevronRight size={16} className={`text-[#333] transition-transform duration-300 ${isPicked ? 'rotate-90 text-[#00ff88]' : ''}`} />
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
                                                                        onClick={() => { setBaseServing(null); setGrams(g => Math.max(1, g - (g > 100 ? 50 : 10))); }}
                                                                        className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:bg-[#00ff88] active:text-black transition-all"
                                                                    >
                                                                        <Minus size={20} />
                                                                    </button>
                                                                    <div className="relative flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            value={grams}
                                                                            onChange={e => { setBaseServing(null); setGrams(Math.max(1, parseInt(e.target.value) || 0)); }}
                                                                            className="w-24 text-center text-[42px] font-black text-white bg-transparent outline-none border-b-2 border-white/10 focus:border-[#00ff88] transition-colors"
                                                                        />
                                                                        <span className="text-[#444] font-black text-xl">g</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => { setBaseServing(null); setGrams(g => g + (g >= 100 ? 50 : 10)); }}
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
                                                                        {food.servings?.map(s => {
                                                                            const isActive = baseServing?.label === s.label;
                                                                            return isActive ? (
                                                                                <div key={s.label} className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-[#00ff88] bg-[#00ff8815]">
                                                                                    <button onClick={() => handleMultiplier(-1)} className="w-6 h-6 rounded-full bg-[#00ff8833] flex items-center justify-center text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-colors">
                                                                                        <Minus size={12} strokeWidth={3} />
                                                                                    </button>
                                                                                    <span className="text-[12px] font-black text-[#00ff88] min-w-[3rem] text-center">
                                                                                        {multiplier === 1 ? s.label : `x${multiplier} (${s.label})`}
                                                                                    </span>
                                                                                    <button onClick={() => handleMultiplier(1)} className="w-6 h-6 rounded-full bg-[#00ff8833] flex items-center justify-center text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-colors">
                                                                                        <Plus size={12} strokeWidth={3} />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    key={s.label}
                                                                                    onClick={() => handleServingClick(s.label, s.grams)}
                                                                                    className="px-4 py-2.5 rounded-xl border text-[11px] font-black transition-all bg-white/5 border-transparent text-[#666] hover:text-[#aaa]"
                                                                                >
                                                                                    {s.label}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                        {!food.servings && food.commonServingG && (
                                                                            (() => {
                                                                                const label = food.servingLabel || '1 Phần';
                                                                                const isActive = baseServing?.label === label;
                                                                                return isActive ? (
                                                                                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-[#00ff88] bg-[#00ff8815]">
                                                                                        <button onClick={() => handleMultiplier(-1)} className="w-6 h-6 rounded-full bg-[#00ff8833] flex items-center justify-center text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-colors">
                                                                                            <Minus size={12} strokeWidth={3} />
                                                                                        </button>
                                                                                        <span className="text-[12px] font-black text-[#00ff88] min-w-[3rem] text-center">
                                                                                            {multiplier === 1 ? label : `x${multiplier} (${label})`}
                                                                                        </span>
                                                                                        <button onClick={() => handleMultiplier(1)} className="w-6 h-6 rounded-full bg-[#00ff8833] flex items-center justify-center text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-colors">
                                                                                            <Plus size={12} strokeWidth={3} />
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <button
                                                                                        onClick={() => handleServingClick(label, food.commonServingG!)}
                                                                                        className="px-4 py-2.5 rounded-xl border text-[11px] font-black transition-all bg-white/5 border-transparent text-[#666] hover:text-[#aaa]"
                                                                                    >
                                                                                        {label}
                                                                                    </button>
                                                                                );
                                                                            })()
                                                                        )}
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-2 justify-center opacity-60">
                                                                        {QUICK_GRAMS.filter(p => p !== food.commonServingG && !food.servings?.some(s => s.grams === p)).map(p => (
                                                                            <button
                                                                                key={p}
                                                                                onClick={() => { setBaseServing(null); setGrams(p); }}
                                                                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${(!baseServing && grams === p)
                                                                                    ? 'bg-white/10 border-white/20 text-white'
                                                                                    : 'bg-transparent border-white/5 text-[#444]'
                                                                                    }`}
                                                                            >
                                                                                {p}g
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Action Button */}
                                                            <button
                                                                onClick={() => confirmAdd(food)}
                                                                className="w-full py-4 rounded-2xl bg-[#00ff88] text-black text-[15px] font-black uppercase tracking-widest shadow-[0_8px_32px_rgba(0,255,136,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Check size={20} strokeWidth={3} />
                                                                Xác nhận thêm
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )
                            }
                        </div>
                    </>
                )}
            </div>

            {/* Hint bar at bottom */}
            {!isAddingNew && !isQuickAdd && (
                <div className="bg-[#111] border-t border-white/5 px-4 py-4 flex items-center justify-center gap-2 text-[#444] shrink-0">
                    <Info size={14} />
                    <span className="text-[11px] font-bold">Chọn món để xem chi tiết dinh dưỡng</span>
                </div>
            )}
        </div>
    );
}
