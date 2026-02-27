import { useState, useMemo } from 'react';
import { Plus, Trash2, Search, X, Edit2, RotateCcw, Save, ChevronLeft, Star, Tag } from 'lucide-react';
import {
    FOOD_CATEGORIES, loadFoodDatabase, addCustomFood, deleteFood,
    loadCategories, addCategory, renameCategory, deleteCategory, isCustomCategory,
    type FoodItem
} from './foodDatabase';

type FormData = Partial<FoodItem> & { per100g: FoodItem['per100g'] };

const EMPTY_FORM: FormData = {
    id: '',
    name: '',
    nameVi: '',
    category: FOOD_CATEGORIES[0],
    per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    commonServingG: 100,
    servingLabel: '',
};

export function FoodDatabaseManager({ userId, onClose, inline }: { userId: string; onClose: () => void; inline?: boolean }) {
    const [foods, setFoods] = useState<FoodItem[]>(() => loadFoodDatabase(userId));
    const [query, setQuery] = useState('');
    const [cat, setCat] = useState('');
    const [tab, setTab] = useState<'list' | 'form' | 'categories'>('list');
    const [editingId, setEditingId] = useState<string | null>(null); // null = create mode
    const [form, setForm] = useState<FormData>({ ...EMPTY_FORM });

    // Category state
    const [categories, setCategories] = useState<string[]>(() => loadCategories(userId));
    const [newCatName, setNewCatName] = useState('');
    const [editingCat, setEditingCat] = useState<string | null>(null);
    const [editingCatName, setEditingCatName] = useState('');

    // ── helpers ─────────────────────────────────────────────────
    const setP = (key: keyof FoodItem, val: string | number) =>
        setForm(f => ({ ...f, [key]: val }));
    const setMacro = (key: keyof FoodItem['per100g'], val: number) =>
        setForm(f => ({ ...f, per100g: { ...f.per100g, [key]: val } }));

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM, id: 'custom_' + Date.now() });
        setTab('form');
    };

    const openEdit = (food: FoodItem) => {
        setEditingId(food.id);
        setForm({ ...food });
        setTab('form');
    };

    const handleDelete = (food: FoodItem) => {
        if (!confirm(`Xoá "${food.nameVi}" khỏi database?`)) return;
        const updated = deleteFood(userId, food.id);
        setFoods(updated);
    };

    const handleReset = () => {
        if (!confirm('Khôi phục về dữ liệu gốc? Các món tự thêm sẽ bị xoá!')) return;
        localStorage.removeItem(`custom_foods_${userId}`);
        setFoods(loadFoodDatabase(userId));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nameVi?.trim()) return alert('Vui lòng nhập tên món!');
        if (!form.per100g.calories) return alert('Vui lòng nhập calories!');

        const food: FoodItem = {
            id: form.id || 'custom_' + Date.now(),
            name: form.name || form.nameVi!,
            nameVi: form.nameVi!,
            category: form.category || FOOD_CATEGORIES[0],
            per100g: form.per100g,
            commonServingG: form.commonServingG ?? 100,
            servingLabel: form.servingLabel || undefined,
            isCustom: true,
        };

        const updated = addCustomFood(userId, food);
        setFoods(updated);
        setTab('list');
    };

    // ── Category handlers ──────────────────────────────────────
    const handleAddCategory = () => {
        const name = newCatName.trim();
        if (!name) return;
        const updated = addCategory(userId, name);
        setCategories(updated);
        setNewCatName('');
    };

    const handleRenameCategory = (oldName: string) => {
        const name = editingCatName.trim();
        if (!name || name === oldName) { setEditingCat(null); return; }
        const updated = renameCategory(userId, oldName, name);
        setCategories(updated);
        setEditingCat(null);
        setEditingCatName('');
    };

    const handleDeleteCategory = (catName: string) => {
        const foodsInCat = foods.filter(f => f.category === catName);
        const msg = foodsInCat.length > 0
            ? `Danh mục "${catName}" có ${foodsInCat.length} món. Xoá danh mục này?`
            : `Xoá danh mục "${catName}"?`;
        if (!confirm(msg)) return;
        const updated = deleteCategory(userId, catName);
        setCategories(updated);
    };

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return foods.filter(f =>
            (!cat || f.category === cat) &&
            (!q || f.nameVi.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
        );
    }, [foods, query, cat]);

    const customCount = foods.filter(f => f.isCustom).length;

    const containerClass = inline
        ? 'flex flex-col min-h-[70vh] bg-[#0a0a0a] rounded-2xl border border-[#1e1e1e] fade-in overflow-hidden'
        : 'fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] fade-in';

    // ── CATEGORIES VIEW ─────────────────────────────────────────
    if (tab === 'categories') {
        return (
            <div className={containerClass}>
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1e1e1e] bg-[#111] shrink-0">
                    <button onClick={() => setTab('list')} className="p-2 rounded-xl bg-[#1a1a1a] text-[#aaa] hover:text-white -ml-1 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <h2 className="font-bold text-[15px] text-white flex-1">Quản lý Danh mục</h2>
                </div>

                {/* Add new category */}
                <div className="px-4 pt-4 pb-2 shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Tên danh mục mới..."
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                            className="flex-1 bg-[#161616] border border-[#252525] rounded-2xl px-4 py-2.5 text-[14px] text-white focus:border-[#00ff88] outline-none transition-colors"
                        />
                        <button
                            onClick={handleAddCategory}
                            disabled={!newCatName.trim()}
                            className="px-4 py-2.5 rounded-2xl font-bold text-[13px] text-black disabled:opacity-40 active:scale-95 transition-all shrink-0"
                            style={{ background: 'linear-gradient(135deg,#00ff88,#00cc6a)' }}
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Category list */}
                <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1.5 pt-2">
                    {categories.map(catName => {
                        const isCustom = isCustomCategory(catName);
                        const count = foods.filter(f => f.category === catName).length;
                        const isEditing = editingCat === catName;

                        return (
                            <div key={catName}
                                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all"
                                style={{ background: '#141414', borderColor: isCustom ? '#00e5ff20' : '#1e1e1e' }}>

                                {/* Icon */}
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: isCustom ? '#00e5ff12' : '#1a1a1a' }}>
                                    <Tag size={14} className={isCustom ? 'text-[#00e5ff]' : 'text-[#555]'} />
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editingCatName}
                                            onChange={e => setEditingCatName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleRenameCategory(catName); if (e.key === 'Escape') setEditingCat(null); }}
                                            onBlur={() => handleRenameCategory(catName)}
                                            className="w-full bg-[#1a1a1a] border border-[#00ff88] rounded-xl px-3 py-1.5 text-[13px] text-white outline-none"
                                        />
                                    ) : (
                                        <>
                                            <p className="text-[13px] font-semibold text-white truncate">{catName}</p>
                                            <p className="text-[10px] text-[#555] mt-0.5">
                                                {count} món{isCustom ? ' · Tuỳ chỉnh' : ' · Mặc định'}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1.5 shrink-0">
                                    <button onClick={() => { setEditingCat(catName); setEditingCatName(catName); }}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1a1a1a] text-[#555] hover:text-[#00e5ff] hover:bg-[#00e5ff12] transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                    {isCustom && (
                                        <button onClick={() => handleDeleteCategory(catName)}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1a1a1a] text-[#555] hover:text-[#ff4444] hover:bg-[#ff444415] transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ── FORM VIEW ────────────────────────────────────────────────
    if (tab === 'form') {
        return (
            <div className={containerClass}>
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1e1e1e] bg-[#111] shrink-0">
                    <button onClick={() => setTab('list')} className="p-2 rounded-xl bg-[#1a1a1a] text-[#aaa] hover:text-white -ml-1 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <h2 className="font-bold text-[15px] text-white flex-1">
                        {editingId ? 'Chỉnh sửa món' : 'Thêm món mới'}
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

                    {/* Tên + danh mục */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1.5">Tên món (Tiếng Việt) *</label>
                            <input required type="text" value={form.nameVi ?? ''} onChange={e => setP('nameVi', e.target.value)}
                                placeholder="VD: Cơm gà xé phay..."
                                className="w-full bg-[#161616] border border-[#252525] rounded-2xl px-4 py-3 text-[15px] text-white focus:border-[#00ff88] outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1.5">Tên tiếng Anh (tuỳ chọn)</label>
                            <input type="text" value={form.name ?? ''} onChange={e => setP('name', e.target.value)}
                                placeholder="VD: Chicken rice"
                                className="w-full bg-[#161616] border border-[#252525] rounded-2xl px-4 py-3 text-[14px] text-white focus:border-[#00ff88] outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1.5">Danh mục *</label>
                            <select value={form.category ?? ''} onChange={e => setP('category', e.target.value)}
                                className="w-full bg-[#161616] border border-[#252525] rounded-2xl px-4 py-3 text-[14px] text-white focus:border-[#00ff88] outline-none transition-colors">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Dinh dưỡng trên 100g */}
                    <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden">
                        <div className="px-4 py-3 bg-[#161616] border-b border-[#1e1e1e]">
                            <p className="font-bold text-[12px] text-[#00ff88] uppercase tracking-widest">Dinh dưỡng trên 100g *</p>
                        </div>
                        <div className="grid grid-cols-2 gap-px bg-[#1e1e1e]">
                            {([
                                { label: 'Calories (kcal)', key: 'calories', step: 1, color: '#fff' },
                                { label: 'Protein (g)', key: 'protein', step: 0.1, color: '#00ff88' },
                                { label: 'Carbs (g)', key: 'carbs', step: 0.1, color: '#00e5ff' },
                                { label: 'Fat (g)', key: 'fat', step: 0.1, color: '#ffb800' },
                            ] as const).map(m => (
                                <div key={m.key} className="bg-[#0f0f0f] p-3">
                                    <label className="block text-[10px] font-bold uppercase tracking-wide mb-1.5"
                                        style={{ color: m.color }}>{m.label}</label>
                                    <input
                                        required type="number" step={m.step} min={0}
                                        value={form.per100g[m.key] || ''}
                                        onChange={e => setMacro(m.key, parseFloat(e.target.value) || 0)}
                                        className="w-full bg-[#161616] border border-[#252525] rounded-xl px-3 py-2 text-[15px] font-bold text-white focus:border-[#00ff88] outline-none transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Khẩu phần */}
                    <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden">
                        <div className="px-4 py-3 bg-[#161616] border-b border-[#1e1e1e]">
                            <p className="font-bold text-[12px] text-[#00e5ff] uppercase tracking-widest">Khẩu phần gợi ý (tuỳ chọn)</p>
                        </div>
                        <div className="grid grid-cols-2 gap-px bg-[#1e1e1e]">
                            <div className="bg-[#0f0f0f] p-3">
                                <label className="block text-[10px] text-[#555] font-bold uppercase tracking-wide mb-1.5">Số gram</label>
                                <input type="number" step={1} min={1}
                                    value={form.commonServingG ?? ''}
                                    onChange={e => setP('commonServingG', parseInt(e.target.value) || 100)}
                                    placeholder="100"
                                    className="w-full bg-[#161616] border border-[#252525] rounded-xl px-3 py-2 text-[14px] text-white focus:border-[#00ff88] outline-none transition-colors" />
                            </div>
                            <div className="bg-[#0f0f0f] p-3">
                                <label className="block text-[10px] text-[#555] font-bold uppercase tracking-wide mb-1.5">Tên đơn vị</label>
                                <input type="text"
                                    value={form.servingLabel ?? ''}
                                    onChange={e => setP('servingLabel', e.target.value)}
                                    placeholder="1 chén, 1 tô..."
                                    className="w-full bg-[#161616] border border-[#252525] rounded-xl px-3 py-2 text-[14px] text-white focus:border-[#00ff88] outline-none transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Save button */}
                    <button type="submit"
                        className="w-full py-4 rounded-2xl font-black text-[15px] text-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        style={{ background: 'linear-gradient(135deg,#00ff88,#00cc6a)', boxShadow: '0 8px 24px #00ff8830' }}>
                        <Save size={18} />
                        Lưu món ăn
                    </button>
                </form>
            </div>
        );
    }

    // ── LIST VIEW ────────────────────────────────────────────────
    return (
        <div className={containerClass}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1e1e1e] bg-[#111] shrink-0">
                {!inline && (
                    <button onClick={onClose} className="p-2 rounded-xl bg-[#1a1a1a] text-[#aaa] hover:text-white -ml-1 transition-colors">
                        <X size={18} />
                    </button>
                )}
                <div className="flex-1">
                    <h2 className="font-bold text-[15px] text-white leading-tight">Quản lý Database Món Ăn</h2>
                    <p className="text-[11px] text-[#555]">{foods.length} món · {customCount} tuỳ chỉnh</p>
                </div>
                <button onClick={() => setTab('categories')} title="Quản lý danh mục"
                    className="p-2 rounded-xl bg-[#1a1a1a] text-[#00e5ff] hover:bg-[#00e5ff15] transition-colors">
                    <Tag size={16} />
                </button>
                <button onClick={handleReset} title="Khôi phục mặc định"
                    className="p-2 rounded-xl bg-[#1a1a1a] text-[#ffb800] hover:bg-[#ffb80015] transition-colors">
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* Action: Add new + Search */}
            <div className="px-4 pt-3 pb-2 bg-[#0a0a0a] shrink-0 space-y-2">
                {/* Add new food button at top */}
                <button onClick={openCreate}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[14px] text-black active:scale-[0.98] transition-all"
                    style={{ background: 'linear-gradient(135deg,#00ff88,#00cc6a)', boxShadow: '0 4px 16px #00ff8830' }}>
                    <Plus size={18} strokeWidth={3} />
                    Thêm món mới
                </button>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" size={16} />
                    <input type="search" placeholder="Tìm món..." value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-[#161616] border border-[#252525] rounded-2xl py-2.5 pl-10 pr-4 text-[14px] text-white focus:border-[#00ff88] outline-none transition-colors" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                    {['', ...categories].map(c => (
                        <button key={c || '_all'} onClick={() => setCat(c)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap ${c === cat
                                ? 'bg-[#00ff8818] text-[#00ff88] border-[#00ff8844]'
                                : 'bg-[#161616] text-[#666] border-[#222]'}`}>
                            {c || 'Tất cả'}{!c && ` (${foods.length})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1.5 pt-1">
                {filtered.map(food => (
                    <div key={food.id}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all"
                        style={{ background: '#141414', borderColor: food.isCustom ? '#00ff8820' : '#1e1e1e' }}>
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-bold"
                            style={{ background: food.isCustom ? '#00ff8812' : '#1a1a1a', color: food.isCustom ? '#00ff88' : '#555' }}>
                            {food.isCustom ? <Star size={14} /> : food.nameVi.charAt(0)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-white truncate">{food.nameVi}</p>
                            <p className="text-[10px] text-[#555] mt-0.5">
                                {food.category} · {food.per100g.calories}kcal/100g
                                {food.servingLabel && ` · ${food.servingLabel}`}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 shrink-0">
                            <button onClick={() => openEdit(food)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1a1a1a] text-[#555] hover:text-[#00ff88] hover:bg-[#00ff8812] transition-colors">
                                <Edit2 size={14} />
                            </button>
                            {food.isCustom && (
                                <button onClick={() => handleDelete(food)}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1a1a1a] text-[#555] hover:text-[#ff4444] hover:bg-[#ff444415] transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center py-16 text-[#444]">
                        <Search size={36} className="mb-3 opacity-20" />
                        <p className="text-sm">Không tìm thấy "{query}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
