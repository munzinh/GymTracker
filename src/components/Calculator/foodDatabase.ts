// ─── Food Database ────────────────────────────────────────────────────────────
// Vietnamese-sourced nutritional values (per 100g unless noted)
// References: VSEA Nutrition Table, NIN Vietnam, USDA for counterparts

export const DEFAULT_FOOD_CATEGORIES: string[] = [
    'Cơm & Xôi',
    'Phở & Bún & Mì',
    'Thịt & Hải sản',
    'Trứng & Đậu',
    'Rau & Củ',
    'Canh & Súp',
    'Bánh & Snack',
    'Trái cây',
    'Đồ uống',
    'Đồ ăn nhanh',
    'Gym & Meal Prep',
];

// Keep legacy export for backward compatibility
export const FOOD_CATEGORIES = DEFAULT_FOOD_CATEGORIES;

export type FoodCategory = string;

// ─── Category Storage helpers ─────────────────────────────────────────────────

const CUSTOM_CATEGORIES_KEY = (userId: string) => `custom_categories_${userId}`;

export function loadCategories(userId: string): string[] {
    try {
        const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY(userId));
        const custom: string[] = raw ? JSON.parse(raw) : [];
        // Merge: defaults first, then custom (unique)
        const set = new Set([...DEFAULT_FOOD_CATEGORIES, ...custom]);
        return [...set];
    } catch {
        return [...DEFAULT_FOOD_CATEGORIES];
    }
}

function saveCustomCategories(userId: string, allCategories: string[]) {
    // Only persist non-default categories
    const custom = allCategories.filter(c => !DEFAULT_FOOD_CATEGORIES.includes(c));
    localStorage.setItem(CUSTOM_CATEGORIES_KEY(userId), JSON.stringify(custom));
}

export function addCategory(userId: string, name: string): string[] {
    const cats = loadCategories(userId);
    if (cats.includes(name)) return cats;
    const updated = [...cats, name];
    saveCustomCategories(userId, updated);
    return updated;
}

export function renameCategory(userId: string, oldName: string, newName: string): string[] {
    const cats = loadCategories(userId);
    const updated = cats.map(c => c === oldName ? newName : c);
    saveCustomCategories(userId, updated);
    return updated;
}

export function deleteCategory(userId: string, catName: string): string[] {
    if (DEFAULT_FOOD_CATEGORIES.includes(catName)) return loadCategories(userId); // can't delete defaults
    const cats = loadCategories(userId);
    const updated = cats.filter(c => c !== catName);
    saveCustomCategories(userId, updated);
    return updated;
}

export function isCustomCategory(catName: string): boolean {
    return !DEFAULT_FOOD_CATEGORIES.includes(catName);
}

export interface ServingOption {
    label: string;   // e.g. "1 tô nhỏ", "1 tô vừa"
    grams: number;
}

export interface FoodItem {
    id: string;
    name: string;       // English name
    nameVi: string;     // Vietnamese display name
    category: string;
    per100g: { calories: number; protein: number; carbs: number; fat: number };
    commonServingG?: number;  // typical serving size in grams
    servingLabel?: string;    // e.g. "1 chén nhỏ", "1 miếng", "1 tô"
    servings?: ServingOption[];  // multiple serving size options
    isCustom?: boolean;
}

// Short-hand helper — single serving
function f(
    id: string, name: string, nameVi: string, category: string,
    calories: number, protein: number, carbs: number, fat: number,
    servingG?: number, servingLabel?: string
): FoodItem {
    return { id, name, nameVi, category, per100g: { calories, protein, carbs, fat }, commonServingG: servingG, servingLabel };
}

// Short-hand helper — multiple servings
function fs(
    id: string, name: string, nameVi: string, category: string,
    calories: number, protein: number, carbs: number, fat: number,
    servings: ServingOption[], defaultServingG?: number, defaultLabel?: string
): FoodItem {
    return {
        id, name, nameVi, category,
        per100g: { calories, protein, carbs, fat },
        commonServingG: defaultServingG ?? servings[0]?.grams,
        servingLabel: defaultLabel ?? servings[0]?.label,
        servings,
    };
}

export const DEFAULT_FOOD_DATABASE: FoodItem[] = [

    // ═══════════════════════════════════════════════
    // CƠM & XÔI
    // ═══════════════════════════════════════════════
    f('com_trang', 'Steamed White Rice', 'Cơm trắng', 'Cơm & Xôi', 130, 2.7, 28, 0.3, 200, '1 chén vừa'),
    fs('com_tam', 'Broken Rice', 'Cơm tấm (bì chả sườn)', 'Cơm & Xôi', 200, 8.8, 22, 10.5,
        [{ label: '1 đĩa nhỏ', grams: 300 }, { label: '1 đĩa vừa', grams: 400 }, { label: '1 đĩa lớn', grams: 500 }],
        400, '1 đĩa vừa'),
    f('com_ga', 'Chicken Rice', 'Cơm gà xé phay', 'Cơm & Xôi', 155, 11, 20, 4, 300, '1 đĩa'),
    f('com_suon', 'Pork Chop Rice', 'Cơm sườn nướng', 'Cơm & Xôi', 190, 13, 22, 6, 300, '1 đĩa'),
    f('com_thap_cam', 'Mixed Rice', 'Cơm thập cẩm (cúm rang)', 'Cơm & Xôi', 200, 10, 28, 6, 300, '1 hộp'),
    f('com_chien', 'Fried Rice', 'Cơm chiên dương châu', 'Cơm & Xôi', 185, 6, 28, 6, 250, '1 đĩa'),
    f('com_chay_gao_lut', 'Brown Rice', 'Cơm gạo lứt trắng', 'Cơm & Xôi', 111, 2.6, 23, 0.9, 200, '1 chén vừa'),
    f('xoi_xeo', 'Sticky Rice w Bean', 'Xôi xéo mỡ hành', 'Cơm & Xôi', 240, 5, 42, 6, 200, '1 gói nhỏ'),
    fs('xoi_man', 'Savory Sticky Rice', 'Xôi mặn thập cẩm', 'Cơm & Xôi', 260, 8, 38, 8,
        [{ label: '1 gói nhỏ', grams: 150 }, { label: '1 hộp', grams: 200 }, { label: '1 gói lớn', grams: 300 }],
        200, '1 hộp'),
    f('xoi_gac', 'Red Sticky Rice', 'Xôi gấc', 'Cơm & Xôi', 210, 4, 40, 4.5, 200, '1 gói'),
    f('com_truyen', 'Steamed Broken Rice', 'Cơm tấm trắng (không topping)', 'Cơm & Xôi', 123, 2.7, 27, 0.3, 200, '1 chén'),

    // ═══════════════════════════════════════════════
    // PHỞ & BÚN & MÌ
    // ═══════════════════════════════════════════════
    fs('pho_bo', 'Beef Pho', 'Phở bò tái chín', 'Phở & Bún & Mì', 93, 5.6, 10.4, 3,
        [{ label: '1 tô nhỏ', grams: 350 }, { label: '1 tô vừa', grams: 500 }, { label: '1 tô lớn', grams: 650 }],
        500, '1 tô vừa'),
    fs('pho_ga', 'Chicken Pho', 'Phở gà', 'Phở & Bún & Mì', 85, 6, 10, 1.5,
        [{ label: '1 tô nhỏ', grams: 350 }, { label: '1 tô vừa', grams: 450 }, { label: '1 tô lớn', grams: 600 }],
        450, '1 tô vừa'),
    fs('bun_bo', 'Spicy Beef Noodles', 'Bún bò Huế', 'Phở & Bún & Mì', 105, 7, 12, 3,
        [{ label: '1 tô nhỏ', grams: 350 }, { label: '1 tô vừa', grams: 450 }, { label: '1 tô lớn', grams: 600 }],
        450, '1 tô vừa'),
    f('bun_rieu', 'Crab Tomato Noodle Soup', 'Bún riêu cua', 'Phở & Bún & Mì', 95, 6.5, 12, 2.5, 450, '1 tô'),
    fs('bun_thit_nuong', 'Grilled Pork Noodles', 'Bún thịt nướng', 'Phở & Bún & Mì', 150, 6, 19, 5,
        [{ label: '1 phần nhỏ', grams: 250 }, { label: '1 phần vừa', grams: 350 }],
        300, '1 tô'),
    f('mi_tom', 'Instant Noodles w Shrimp', 'Mì tôm (1 gói có nước)', 'Phở & Bún & Mì', 65, 2, 9, 2.5, 350, '1 tô nấu'),
    f('mi_vit', 'Duck Noodle Soup', 'Mì vịt tiềm', 'Phở & Bún & Mì', 90, 6, 10, 3, 400, '1 tô'),
    f('mi_quang', 'Quang Noodle', 'Mì Quảng', 'Phở & Bún & Mì', 135, 6, 17, 4.5, 400, '1 tô'),
    f('hu_tieu', 'Nam Vang Noodle', 'Hủ tiếu Nam Vang', 'Phở & Bún & Mì', 120, 5, 16, 4, 400, '1 tô'),
    f('banh_da_cua', 'Crab Noodle Soup', 'Bánh đa cua Hải Phòng', 'Phở & Bún & Mì', 115, 6, 15, 3.5, 400, '1 tô'),
    f('mien_ga', 'Glass Noodle Soup Chicken', 'Miến gà', 'Phở & Bún & Mì', 90, 5, 15, 1.5, 350, '1 tô'),
    f('mi_xao_bo', 'Stir-fried Beef Noodle', 'Mì xào bò', 'Phở & Bún & Mì', 160, 8, 21, 5, 300, '1 đĩa'),
    fs('bun_dau_mam', 'Tofu Noodles', 'Bún đậu mắm tôm', 'Phở & Bún & Mì', 167, 8.4, 10.7, 9.3,
        [{ label: '1 mẹt nhỏ', grams: 350 }, { label: '1 mẹt vừa', grams: 450 }, { label: '1 mẹt lớn', grams: 600 }],
        450, '1 mẹt vừa'),

    // ═══════════════════════════════════════════════
    // THỊT & HẢI SẢN
    // ═══════════════════════════════════════════════
    f('uc_ga_nuong', 'Grilled Chicken Breast', 'Ức gà nướng không da', 'Thịt & Hải sản', 165, 31, 0, 3.6, 150, '1 miếng lớn'),
    f('uc_ga_luoc', 'Boiled Chicken Breast', 'Ức gà luộc không da', 'Thịt & Hải sản', 165, 31, 0, 3.6, 120, '1 miếng'),
    f('dui_ga_nuong', 'Grilled Chicken Thigh', 'Đùi gà nướng có da', 'Thịt & Hải sản', 209, 24, 0, 12, 150, '1 cái'),
    f('dui_ga_luoc', 'Boiled Chicken Thigh', 'Đùi gà luộc', 'Thịt & Hải sản', 195, 22, 0, 11, 150, '1 cái'),
    f('ga_ran', 'Fried Chicken', 'Gà rán (có vỏ)', 'Thịt & Hải sản', 285, 23, 10, 18, 120, '1 miếng'),
    f('suon_heo_nuong', 'Grilled Pork Ribs', 'Sườn heo nướng mật ong', 'Thịt & Hải sản', 290, 18, 5, 22, 150, '2-3 sườn'),
    f('thit_bo_nuong', 'Grilled Beef', 'Thịt bò nướng (loại nạc)', 'Thịt & Hải sản', 215, 26, 0, 12, 120, '1 phần nhỏ'),
    f('thit_heo_luoc', 'Boiled Pork Belly', 'Thịt heo ba chỉ luộc', 'Thịt & Hải sản', 330, 18, 0, 28, 100, '2-3 miếng'),
    f('cha_lua', 'Vietnamese Ham', 'Chả lụa (giò lụa)', 'Thịt & Hải sản', 210, 15, 3, 15, 60, '2 lát'),
    f('tom_nuong', 'Grilled Shrimp', 'Tôm nướng muối ớt', 'Thịt & Hải sản', 99, 20, 0.9, 1.1, 150, '5-6 con'),
    f('tom_luoc', 'Boiled Shrimp', 'Tôm luộc', 'Thịt & Hải sản', 99, 20, 0.9, 1.1, 150, '5-6 con'),
    f('ca_phi_le', 'Fish Fillet', 'Phi lê cá (các loại hấp/áp)', 'Thịt & Hải sản', 120, 22, 0, 3, 150, '1 miếng'),
    f('ca_thu', 'Mackerel', 'Cá thu áp chảo', 'Thịt & Hải sản', 150, 24, 0, 6.5, 150, '1 miếng'),
    f('ca_hoi', 'Salmon', 'Cá hồi hấp/áp chảo', 'Thịt & Hải sản', 208, 20, 0, 14, 150, '1 miếng'),
    f('bong_cai_thit', 'Pork Stir-fry', 'Thịt xào bông cải', 'Thịt & Hải sản', 120, 8, 6, 7, 200, '1 chén nhỏ'),
    f('thit_kho', 'Braised Pork', 'Thịt kho tiêu/hột vịt', 'Thịt & Hải sản', 260, 16, 5, 19, 150, '1 chén nhỏ'),
    f('ca_xot_ca', 'Fish in Tomato Sauce', 'Cá sốt cà chua', 'Thịt & Hải sản', 110, 14, 5, 3.5, 200, '1 chén nhỏ'),
    f('muc_xao', 'Stir-fried Squid', 'Mực xào sả ớt', 'Thịt & Hải sản', 85, 15, 2.5, 1.5, 150, '1 chén nhỏ'),

    // ═══════════════════════════════════════════════
    // TRỨNG & ĐẬU
    // ═══════════════════════════════════════════════
    f('trung_luoc', 'Boiled Egg', 'Trứng gà luộc', 'Trứng & Đậu', 155, 13, 1.1, 11, 60, '1 quả'),
    f('trung_chien', 'Fried Egg', 'Trứng ốp la chiên dầu', 'Trứng & Đậu', 185, 13, 0.4, 14, 60, '1 quả'),
    f('trung_bac_thao', 'Century Egg', 'Trứng bắc thảo', 'Trứng & Đậu', 135, 9, 2, 10, 50, '1 quả'),
    f('dau_hu_sot', 'Tofu in Sauce', 'Đậu hũ sốt cà', 'Trứng & Đậu', 80, 6.5, 4.5, 4, 150, '3-4 miếng'),
    f('dau_hu_non', 'Soft Tofu', 'Đậu hũ non hấp hành', 'Trứng & Đậu', 55, 5, 3, 2.5, 150, '1 miếng lớn'),
    f('dau_phu_chien', 'Fried Tofu', 'Đậu phụ chiên giòn', 'Trứng & Đậu', 190, 11, 5, 14, 100, '3-4 miếng'),
    f('trung_cuon', 'Egg Roll', 'Trứng cuộn rau phô mai', 'Trứng & Đậu', 175, 12, 2, 13, 80, '1 cuộn'),

    // ═══════════════════════════════════════════════
    // RAU & CỦ
    // ═══════════════════════════════════════════════
    f('rau_muong', 'Water Spinach', 'Rau muống xào tỏi', 'Rau & Củ', 55, 3, 5, 2.5, 200, '1 chén nhỏ'),
    f('bong_cai_xanh', 'Broccoli', 'Bông cải xanh luộc/hấp', 'Rau & Củ', 34, 2.8, 7, 0.4, 150, '1 chén nhỏ'),
    f('bong_cai_trang', 'Cauliflower', 'Súp lơ trắng', 'Rau & Củ', 25, 1.9, 5, 0.3, 150, '1 chén nhỏ'),
    f('cai_xanh', 'Bok Choy', 'Cải xanh/cải thìa xào', 'Rau & Củ', 45, 2, 5, 2, 200, '1 chén nhỏ'),
    f('cu_cai', 'Daikon Radish', 'Củ cải trắng luộc', 'Rau & Củ', 18, 0.6, 4.1, 0.1, 150, '1 chén nhỏ'),
    f('ca_tim', 'Eggplant', 'Cà tím nướng/hấp', 'Rau & Củ', 35, 0.8, 8.7, 0.2, 150, '1 chén nhỏ'),
    f('kho_qua', 'Bitter Melon', 'Khổ qua xào trứng', 'Rau & Củ', 65, 4, 4, 3.5, 200, '1 chén nhỏ'),
    f('dau_que', 'Green Beans', 'Đậu que xào', 'Rau & Củ', 55, 2, 7, 2, 150, '1 chén nhỏ'),
    f('ca_rot', 'Carrot', 'Cà rốt (sống/luộc)', 'Rau & Củ', 41, 0.9, 10, 0.2, 100, '1 củ nhỏ'),
    f('khoai_lang', 'Sweet Potato', 'Khoai lang luộc', 'Rau & Củ', 86, 1.6, 20, 0.1, 150, '1 củ nhỏ'),
    f('khoai_tay', 'Potato', 'Khoai tây hấp (không chiên)', 'Rau & Củ', 77, 2, 17, 0.1, 150, '1 củ nhỏ'),
    f('ngo', 'Corn', 'Bắp ngô luộc', 'Rau & Củ', 86, 3.3, 19, 1.4, 100, '1/2 bắp'),
    f('dau_bap', 'Okra', 'Đậu bắp luộc/xào', 'Rau & Củ', 33, 1.9, 7, 0.2, 150, '1 chén nhỏ'),
    f('rau_cai', 'Mixed Greens stir-fried', 'Rau cải xào thập cẩm', 'Rau & Củ', 50, 2, 5, 2.5, 200, '1 chén nhỏ'),

    // ═══════════════════════════════════════════════
    // CANH & SÚP
    // ═══════════════════════════════════════════════
    f('canh_chua', 'Sour Fish Soup', 'Canh chua cá (1 chén nhỏ)', 'Canh & Súp', 40, 3.5, 3.5, 1.2, 200, '1 chén nhỏ'),
    f('canh_kho_qua', 'Bitter Melon Soup', 'Canh khổ qua nhồi thịt', 'Canh & Súp', 55, 4, 4, 2.5, 250, '1 chén nhỏ'),
    f('canh_rong_bien', 'Seaweed Soup', 'Canh rong biển đậu hũ', 'Canh & Súp', 30, 2.5, 3, 0.8, 200, '1 chén nhỏ'),
    f('canh_bau', 'Gourd Soup', 'Canh bầu nấu tôm', 'Canh & Súp', 35, 3, 3.5, 0.8, 200, '1 chén nhỏ'),
    f('canh_dua_ga', 'Pineapple Chicken Soup', 'Canh dứa nấu gà', 'Canh & Súp', 55, 5, 4, 1.5, 250, '1 chén'),
    f('canh_bap_cai', 'Cabbage Soup', 'Canh bắp cải nấu thịt', 'Canh & Súp', 40, 3, 4, 1.2, 250, '1 chén nhỏ'),
    f('sup_cu', 'Pumpkin Soup', 'Súp bí đỏ (không kem)', 'Canh & Súp', 45, 1.5, 8, 1, 200, '1 chén nhỏ'),
    f('canh_miso', 'Miso Soup', 'Canh miso đậu hũ (ít muối)', 'Canh & Súp', 35, 2.5, 4, 1, 200, '1 chén nhỏ'),
    f('canh_ot_tom', 'Pork Rib Broth Soup', 'Canh sườn củ quả', 'Canh & Súp', 80, 6, 6, 3, 250, '1 chén nhỏ'),

    // ═══════════════════════════════════════════════
    // BÁNH & SNACK
    // ═══════════════════════════════════════════════
    f('banh_mi_ga', 'Chicken Banh Mi', 'Bánh mì gà/bò', 'Bánh & Snack', 240, 12, 28, 9, 130, '1 ổ'),
    f('banh_mi_op_la', 'Egg Banh Mi', 'Bánh mì ốp la', 'Bánh & Snack', 220, 9, 30, 7, 130, '1 ổ'),
    f('banh_mi_thit', 'Pork Banh Mi', 'Bánh mì thịt/chả', 'Bánh & Snack', 250, 10, 30, 10, 150, '1 ổ'),
    f('banh_bao', 'Meat Bao', 'Bánh bao nhân thịt', 'Bánh & Snack', 230, 8, 33, 7, 120, '1 cái'),
    f('banh_gio', 'Pyramid Dumpling', 'Bánh giò', 'Bánh & Snack', 180, 6, 20, 9, 150, '1 cái'),
    f('goi_cuon', 'Fresh Spring Roll', 'Gỏi cuốn (2 cuốn)', 'Bánh & Snack', 140, 6, 23, 2.5, 100, '2 cuốn'),
    f('cha_gio', 'Fried Spring Roll', 'Chả giò rán', 'Bánh & Snack', 290, 7, 28, 16, 50, '2 cuốn nhỏ'),
    f('bap_ngo_chien', 'Corn Fritters', 'Bắp cải chiên xù', 'Bánh & Snack', 250, 4, 30, 12, 100, '1 cái'),
    f('khoai_chien', 'French Fries', 'Khoai tây chiên', 'Bánh & Snack', 312, 3.4, 41, 15, 100, '1 phần nhỏ'),
    f('hat_rang', 'Mixed Nuts roasted', 'Hạt rang (lạc/điều/hạnh nhân)', 'Bánh & Snack', 580, 18, 25, 48, 30, '1 nắm nhỏ'),
    f('pho_mai_stick', 'Cheese Sticks', 'Phô mai que (1 thanh)', 'Bánh & Snack', 280, 13, 28, 13, 25, '1 thanh'),
    f('banh_gao', 'Rice Cake', 'Bánh gạo nướng', 'Bánh & Snack', 380, 7, 80, 3, 30, '3 cái nhỏ'),
    f('yogurt', 'Yogurt', 'Sữa chua không đường', 'Bánh & Snack', 60, 4, 5, 2, 100, '1 hũ'),
    f('yogurt_nguyen', 'Greek Yogurt', 'Sữa chua Hy Lạp', 'Bánh & Snack', 100, 10, 4, 4, 100, '1 hũ'),

    // ═══════════════════════════════════════════════
    // TRÁI CÂY
    // ═══════════════════════════════════════════════
    f('chuoi', 'Banana', 'Chuối tiêu', 'Trái cây', 89, 1.1, 23, 0.3, 120, '1 quả vừa'),
    f('tao', 'Apple', 'Táo đỏ', 'Trái cây', 52, 0.3, 14, 0.2, 150, '1 quả'),
    f('cam', 'Orange', 'Cam tươi', 'Trái cây', 47, 0.9, 12, 0.1, 130, '1 quả'),
    f('buoi', 'Pomelo', 'Bưởi tươi', 'Trái cây', 38, 0.8, 10, 0.1, 150, '1/4 quả'),
    f('dua_gang', 'Cantaloupe', 'Dưa gang/dưa lưới', 'Trái cây', 34, 0.8, 8.2, 0.2, 200, '1 khúc'),
    f('xoai', 'Mango', 'Xoài chín', 'Trái cây', 60, 0.8, 15, 0.4, 200, '1/2 quả'),
    f('du_du', 'Papaya', 'Đu đủ chín', 'Trái cây', 43, 0.5, 11, 0.3, 200, '1 khúc nhỏ'),
    f('tham', 'Strawberry', 'Dâu tây tươi', 'Trái cây', 32, 0.7, 7.7, 0.3, 100, '1 phần nhỏ'),
    f('thanh_long', 'Dragon Fruit', 'Thanh long ruột trắng', 'Trái cây', 60, 1.2, 13, 0.4, 200, '1/2 quả'),
    f('nho', 'Grapes', 'Nho tươi', 'Trái cây', 67, 0.6, 17, 0.4, 100, '1 chùm nhỏ'),
    f('kiwi', 'Kiwi', 'Kiwi', 'Trái cây', 61, 1.1, 15, 0.5, 100, '1 quả'),
    f('dua_hau', 'Watermelon', 'Dưa hấu', 'Trái cây', 30, 0.6, 7.5, 0.2, 300, '1 khúc'),

    // ═══════════════════════════════════════════════
    // ĐỒ UỐNG
    // ═══════════════════════════════════════════════
    f('cafe_sua_da', 'Iced Milk Coffee', 'Cà phê sữa đá', 'Đồ uống', 110, 2, 18, 3.5, 150, '1 ly'),
    f('cafe_den_da', 'Iced Black Coffee', 'Cà phê đen đá (ít đường)', 'Đồ uống', 10, 0.2, 2, 0, 150, '1 ly'),
    fs('tra_sua_tran', 'Boba Milk Tea', 'Trà sữa trân châu (50% đường)', 'Đồ uống', 72, 0.5, 13, 2.5,
        [{ label: '1 ly size S', grams: 350 }, { label: '1 ly size M', grams: 500 }, { label: '1 ly size L', grams: 700 }],
        500, '1 ly size M'),
    f('tra_dao', 'Peach Tea', 'Trà đào cam sả', 'Đồ uống', 40, 0, 10, 0, 400, '1 ly'),
    f('nuoc_cam', 'Orange Juice', 'Nước cam ép tươi', 'Đồ uống', 45, 0.7, 10.4, 0.2, 250, '1 ly'),
    f('nuoc_dua', 'Coconut Water', 'Nước dừa tươi', 'Đồ uống', 19, 0.7, 3.7, 0.2, 250, '1 trái'),
    f('tra_da_khong', 'Iced Unsweetened Tea', 'Trà đá (không đường)', 'Đồ uống', 0, 0, 0, 0, 300, '1 ly'),
    f('sinh_to_chuoi', 'Banana Smoothie', 'Sinh tố chuối (không thêm đường)', 'Đồ uống', 95, 2, 20, 2, 300, '1 ly'),
    f('nuoc_khoang', 'Sparkling Water', 'Nước khoáng/lọc', 'Đồ uống', 0, 0, 0, 0, 500, '1 chai nhỏ'),
    f('sua_tuoi', 'Fresh Milk', 'Sữa tươi không đường', 'Đồ uống', 61, 3.2, 4.8, 3.3, 200, '1 hộp'),
    f('bac_xiu', 'Iced White Coffee', 'Bạc xỉu đá', 'Đồ uống', 90, 2.5, 14, 2.5, 200, '1 ly'),

    // ═══════════════════════════════════════════════
    // ĐỒ ĂN NHANH & VĂN PHÒNG
    // ═══════════════════════════════════════════════
    f('com_hop', 'Boxed Office Rice', 'Cơm hộp văn phòng (1 hộp)', 'Đồ ăn nhanh', 165, 10, 22, 5, 350, '1 hộp'),
    f('banh_my_sandwich', 'Sandwich', 'Bánh mì sandwich nhân thịt gà', 'Đồ ăn nhanh', 210, 13, 27, 6, 150, '1 cái'),
    f('burger', 'Chicken Burger', 'Burger gà (không khoai chiên)', 'Đồ ăn nhanh', 295, 17, 32, 11, 200, '1 cái'),
    f('pizza_slice', 'Pizza Slice', 'Pizza 1 miếng (phô mai thịt)', 'Đồ ăn nhanh', 266, 11, 33, 10, 100, '1 miếng'),
    fs('mi_goi_nuoc', 'Cup Noodles', 'Mì gói nấu nước (1 gói)', 'Đồ ăn nhanh', 110, 2.5, 15, 4,
        [{ label: '1 gói (không trứng)', grams: 350 }, { label: '1 gói + trứng', grams: 410 }],
        350, '1 tô nấu'),
    f('salad_ga', 'Chicken Salad', 'Salad gà rau xanh (không dressing)', 'Đồ ăn nhanh', 90, 8, 8, 2.5, 200, '1 đĩa'),
    f('sushi_ca_hoi', 'Salmon Sushi', 'Sushi cá hồi (2 miếng)', 'Đồ ăn nhanh', 160, 8, 25, 3.5, 100, '2 miếng'),
    f('onigiri', 'Onigiri', 'Cơm nắm onigiri nhân cá trứng', 'Đồ ăn nhanh', 160, 5, 30, 2.5, 120, '1 cái'),
    f('bap_rang_bo', 'Popcorn', 'Bắp rang bơ (1 phần nhỏ)', 'Đồ ăn nhanh', 375, 5, 65, 12, 50, '1 gói nhỏ'),
    f('pho_cuon', 'Rolling Pho', 'Phở cuốn bò/gà', 'Đồ ăn nhanh', 130, 7, 18, 3, 200, '4-5 cuốn'),
    // ═══════════════════════════════════════════════
    // GYM & MEAL PREP 🏋️
    // ═══════════════════════════════════════════════
    f('uc_ga_gym', 'Gym Chicken Breast', 'Ức gà nướng (meal prep)', 'Gym & Meal Prep', 165, 31, 0, 3.6, 150, '1 miếng 150g'),
    f('gao_lut_gym', 'Brown Rice (Gym)', 'Cơm gạo lứt (gym)', 'Gym & Meal Prep', 111, 2.6, 23, 0.9, 200, '1 chén'),
    f('khoai_lang_gym', 'Sweet Potato (Gym)', 'Khoai lang luộc (gym)', 'Gym & Meal Prep', 86, 1.6, 20, 0.1, 200, '1 củ vừa'),
    f('trung_luoc_gym', 'Boiled Eggs (Gym)', 'Trứng luộc (2 quả, gym)', 'Gym & Meal Prep', 155, 13, 1.1, 11, 120, '2 quả'),
    f('ca_hoi_gym', 'Salmon Fillet (Gym)', 'Cá hồi áp chảo (gym)', 'Gym & Meal Prep', 208, 20, 0, 14, 150, '1 miếng'),
    f('bo_bam_gym', 'Ground Beef Lean', 'Bò bằm nạc 95% (gym)', 'Gym & Meal Prep', 137, 21, 0, 5.5, 150, '1 phần'),
    f('bong_cai_gym', 'Steamed Broccoli (Gym)', 'Bông cải xanh hấp (gym)', 'Gym & Meal Prep', 34, 2.8, 7, 0.4, 150, '1 chén'),
    f('oat_gym', 'Oats', 'Yến mạch (oats)', 'Gym & Meal Prep', 379, 13, 67, 7, 50, '1/2 chén khô'),
    f('whey_gym', 'Whey Protein', 'Whey Protein (1 scoop)', 'Gym & Meal Prep', 400, 80, 8, 4, 30, '1 scoop 30g'),
    f('sua_hanh_nhan', 'Almond Milk', 'Sữa hạnh nhân không đường', 'Gym & Meal Prep', 15, 0.5, 0.3, 1.2, 240, '1 ly'),
    f('bo_gym', 'Avocado', 'Bơ trái (gym)', 'Gym & Meal Prep', 160, 2, 8.5, 15, 100, '1/2 quả'),
    f('tom_gym', 'Shrimp (Gym)', 'Tôm hấp/luộc (gym)', 'Gym & Meal Prep', 99, 20, 0.9, 1.1, 150, '1 phần'),
];

// ─── Storage helpers ──────────────────────────────────────────────────────────

const CUSTOM_FOOD_KEY = (userId: string) => `custom_foods_${userId}`;

export function loadFoodDatabase(userId: string): FoodItem[] {
    try {
        const raw = localStorage.getItem(CUSTOM_FOOD_KEY(userId));
        const customFoods: FoodItem[] = raw ? JSON.parse(raw) : [];
        // Merge: custom first, then defaults (avoiding duplicates by id)
        const customIds = new Set(customFoods.map(f => f.id));
        const merged = [...customFoods, ...DEFAULT_FOOD_DATABASE.filter(f => !customIds.has(f.id))];
        return merged;
    } catch {
        return [...DEFAULT_FOOD_DATABASE];
    }
}

export function saveFoodDatabase(userId: string, foods: FoodItem[]) {
    // Only save custom (user-added/modified) foods
    const customFoods = foods.filter(f => f.isCustom || !DEFAULT_FOOD_DATABASE.find(d => d.id === f.id));
    localStorage.setItem(CUSTOM_FOOD_KEY(userId), JSON.stringify(customFoods));
}

export function addCustomFood(userId: string, food: Omit<FoodItem, 'isCustom'>): FoodItem[] {
    const newFood: FoodItem = { ...food, isCustom: true };
    const db = loadFoodDatabase(userId);
    const updated = [newFood, ...db.filter(f => f.id !== food.id)];
    saveFoodDatabase(userId, updated);
    return updated;
}

export function deleteFood(userId: string, foodId: string): FoodItem[] {
    const db = loadFoodDatabase(userId);
    const updated = db.filter(f => f.id !== foodId);
    saveFoodDatabase(userId, updated);
    return updated;
}
