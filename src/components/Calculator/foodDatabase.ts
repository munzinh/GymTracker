// ─── Food Database ──────────────────────────────────────────────────────────
// Vietnamese-sourced nutritional values (per 100g edible portion, mostly cooked/prepared)
// References: NIN Vietnam, VSEA Nutrition Table, USDA

export const DEFAULT_FOOD_CATEGORIES: string[] = [
    'Thêm nhanh',
    'Tinh bột',
    'Thịt (Đạm)',
    'Cá & Hải sản',
    'Trứng',
    'Sữa & Chế phẩm',
    'Rau củ',
    'Trái cây',
    'Đậu & Các loại',
    'Hạt & Quả hạch',
    'Chất béo tốt',
    'Món ăn Việt Nam',
];

export const FOOD_CATEGORIES = DEFAULT_FOOD_CATEGORIES;

export type FoodCategory = string;

// ─── Category Storage helpers ──────────────────────────────────────────────────

const CUSTOM_CATEGORIES_KEY = (userId: string) => `custom_categories_${userId}`;

export function loadCategories(userId: string): string[] {
    try {
        const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY(userId));
        const custom: string[] = raw ? JSON.parse(raw) : [];
        const set = new Set([...DEFAULT_FOOD_CATEGORIES, ...custom]);
        return [...set];
    } catch {
        return [...DEFAULT_FOOD_CATEGORIES];
    }
}

function saveCustomCategories(userId: string, allCategories: string[]) {
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
    if (DEFAULT_FOOD_CATEGORIES.includes(catName)) return loadCategories(userId);
    const cats = loadCategories(userId);
    const updated = cats.filter(c => c !== catName);
    saveCustomCategories(userId, updated);
    return updated;
}

export function isCustomCategory(catName: string): boolean {
    return !DEFAULT_FOOD_CATEGORIES.includes(catName);
}

export interface ServingOption {
    label: string;
    grams: number;
}

export interface FoodItem {
    id: string;
    name: string;
    nameVi: string;
    category: string;
    per100g: { calories: number; protein: number; carbs: number; fat: number };
    commonServingG?: number;
    servingLabel?: string;
    servings?: ServingOption[];
    isCustom?: boolean;
}

function f(id: string, name: string, nameVi: string, category: string, calories: number, protein: number, carbs: number, fat: number, servingG?: number, servingLabel?: string): FoodItem {
    return { id, name, nameVi, category, per100g: { calories, protein, carbs, fat }, commonServingG: servingG, servingLabel };
}

export const DEFAULT_FOOD_DATABASE: FoodItem[] = [
    // ─── TINH BỘT (GRAINS & CARBS) ──────────────────────────────────────────────
    f('oats_rolled', 'Rolled Oats', 'Yến mạch cán dẹt', 'Tinh bột', 379, 13.2, 67.7, 6.5, 40, '1/2 chén'),
    f('white_rice_cooked', 'White Rice (Cooked)', 'Cơm trắng', 'Tinh bột', 130, 2.7, 28, 0.3, 130, '1 chén'),
    f('brown_rice_cooked', 'Brown Rice (Cooked)', 'Cơm gạo lứt', 'Tinh bột', 111, 2.6, 23, 0.9, 130, '1 chén'),
    f('quinoa_raw', 'Quinoa (Raw)', 'Hạt diêm mạch (Quinoa)', 'Tinh bột', 368, 14.1, 64.2, 6.1, 50, '1/2 chén'),
    f('quinoa_cooked', 'Quinoa (Cooked)', 'Quinoa nấu chín', 'Tinh bột', 120, 4.4, 21.3, 1.9, 130, '1 chén'),
    f('sweet_potato_raw', 'Sweet Potato (Raw)', 'Khoai lang sống', 'Tinh bột', 86, 1.6, 20.1, 0.1, 100, '1 củ trung'),
    f('sweet_potato_cooked', 'Sweet Potato (Cooked)', 'Khoai lang luộc', 'Tinh bột', 90, 2, 21, 0.1, 100, '1 củ trung'),
    f('potato_raw', 'Potato (Raw)', 'Khoai tây sống', 'Tinh bột', 77, 2, 17.5, 0.1, 100, '1 củ trung'),
    f('potato_baked', 'Potato (Baked)', 'Khoai tây nướng', 'Tinh bột', 93, 2.5, 21, 0.1, 100, '1 củ trung'),
    f('taro', 'Taro', 'Khoai môn', 'Tinh bột', 112, 1.5, 26.5, 0.2, 100, '1 nắn'),
    f('cassava', 'Cassava (Yuca)', 'Khoai mì (Sắn)', 'Tinh bột', 160, 1.4, 38, 0.3, 100, '1 khúc'),
    f('whole_wheat_bread', 'Whole Wheat Bread', 'Bánh mì ngũ cốc/nguyên cám', 'Tinh bột', 247, 10.7, 41.3, 4.2, 50, '2 lát'),
    f('white_bread', 'White Bread', 'Bánh mì trắng', 'Tinh bột', 265, 9, 49, 3.2, 50, '2 lát'),
    f('pasta_raw', 'Pasta (Raw)', 'Nui/Mì Ý khô', 'Tinh bột', 371, 13, 74.7, 1.5, 50, '1 nắm'),
    f('pasta_cooked', 'Pasta (Cooked)', 'Nui/Mì Ý luộc', 'Tinh bột', 158, 5.8, 30.9, 0.9, 130, '1 chén'),
    f('rice_noodles_dry', 'Rice Noodles (Dry)', 'Bánh phở/Bún khô', 'Tinh bột', 364, 3.5, 82.6, 0.6, 50, '1 nắm'),
    f('rice_noodles_cooked', 'Rice Noodles (Cooked)', 'Bún/Phở tươi', 'Tinh bột', 109, 0.9, 24.9, 0.2, 150, '1 tô'),
    f('buckwheat', 'Buckwheat', 'Kiều mạch', 'Tinh bột', 343, 13.3, 71.5, 3.4, 50, '1/2 chén'),
    f('corn_sweet', 'Sweet Corn', 'Bắp mỹ (Ngô ngọt)', 'Tinh bột', 86, 3.3, 18.7, 1.4, 100, '1/2 bắp'),
    f('amaranth', 'Amaranth', 'Hạt dền', 'Tinh bột', 371, 13.6, 65.2, 7, 50, '1/2 chén'),
    f('barley', 'Barley', 'Lúa mạch', 'Tinh bột', 354, 12.5, 73.5, 2.3, 50, '1/2 chén'),
    f('millet', 'Millet', 'Kê', 'Tinh bột', 378, 11, 72.8, 4.2, 50, '1/2 chén'),

    // ─── THỊT (PROTEIN) ─────────────────────────────────────────────────────────
    f('c_breast_cooked', 'Chicken Breast (Cooked)', 'Ức gà luộc/hấp', 'Thịt (Đạm)', 165, 31, 0, 3.6, 100, '1 miếng'),
    f('c_thigh_cooked', 'Chicken Thigh (Cooked)', 'Thịt đùi gà luộc (bỏ da)', 'Thịt (Đạm)', 195, 24, 0, 10, 100, '1 đùi'),
    f('c_wing_cooked', 'Chicken Wing (Cooked)', 'Cánh gà luộc/nướng', 'Thịt (Đạm)', 203, 18, 0, 14, 100, '1 cánh'),
    f('c_roast', 'Roasted Chicken', 'Gà ta quay/nướng', 'Thịt (Đạm)', 237, 27, 0, 13.5, 100, '1 miếng'),
    f('b_tenderloin_cooked', 'Beef Tenderloin (Cooked)', 'Thăn bò nướng/áp chảo', 'Thịt (Đạm)', 168, 26, 0, 6, 100, '1 miếng'),
    f('b_ground_cooked', 'Lean Ground Beef (Cooked)', 'Thịt bò xay xào', 'Thịt (Đạm)', 180, 24, 0, 8, 100, '1 viên'),
    f('b_shank_cooked', 'Beef Shank (Cooked)', 'Bắp bò luộc/hấp', 'Thịt (Đạm)', 175, 28, 0, 5, 100, '1 lát dày'),
    f('b_stirfry', 'Beef Stir-fry', 'Thịt bò xào hành tây', 'Thịt (Đạm)', 210, 22, 5, 12, 100, '1 đĩa nhỏ'),
    f('p_tenderloin_cooked', 'Pork Tenderloin (Cooked)', 'Thăn lợn luộc', 'Thịt (Đạm)', 143, 26, 0, 3.5, 100, '1 lát'),
    f('p_chop_cooked', 'Pork Chop (Cooked)', 'Sườn cốt lết lợn nướng', 'Thịt (Đạm)', 197, 24, 0, 10, 100, '1 miếng'),
    f('p_belly_cooked', 'Pork Belly (Cooked)', 'Thịt ba rọi lợn luộc/quay', 'Thịt (Đạm)', 518, 9.3, 0, 53, 100, '1 miếng'),
    f('p_minced_cooked', 'Minced Pork (Cooked)', 'Thịt heo băm xào', 'Thịt (Đạm)', 240, 21, 0, 16, 100, '1 chén nhỏ'),
    f('duck_meat_cooked', 'Duck (Cooked)', 'Thịt vịt luộc', 'Thịt (Đạm)', 201, 23, 0, 11, 100, '1 miếng'),
    f('pork_sausage', 'Vietnamese Pork Sausage', 'Chả lụa (Giò lụa)', 'Thịt (Đạm)', 180, 14, 4, 12, 100, '1 khoanh'),
    f('pork_floss', 'Pork Floss', 'Ruốc thịt heo (Chà bông)', 'Thịt (Đạm)', 392, 45, 10, 19, 20, '1 nắm nhỏ/2 thìa'),
    f('goat_meat_cooked', 'Goat Meat (Cooked)', 'Thịt dê hấp', 'Thịt (Đạm)', 143, 27, 0, 3, 100, '1 miếng'),
    f('frog_leg_cooked', 'Frog Legs (Cooked)', 'Đùi ếch xào/nướng', 'Thịt (Đạm)', 119, 24, 0, 2, 100, '2 đùi'),
    f('b_liver_cooked', 'Beef Liver (Cooked)', 'Gan bò xào', 'Thịt (Đạm)', 175, 26, 5, 4.7, 100, '1 miếng'),
    f('c_liver_cooked', 'Chicken Liver (Cooked)', 'Gan gà luộc', 'Thịt (Đạm)', 167, 24, 1, 6.5, 100, '2 cái'),
    f('b_heart_cooked', 'Beef Heart (Cooked)', 'Tim bò xào/luộc', 'Thịt (Đạm)', 165, 28, 0.1, 5, 100, '1 lát'),
    f('p_heart_cooked', 'Pork Heart (Cooked)', 'Tim heo luộc', 'Thịt (Đạm)', 150, 26, 0, 5, 100, '1 lát'),

    // ─── CÁ & HẢI SẢN (FISH & SEAFOOD) ──────────────────────────────────────────
    f('salmon_atlantic', 'Atlantic Salmon', 'Cá hồi Đại Tây Dương', 'Cá & Hải sản', 208, 20, 0, 13, 100, '1 fillet'),
    f('salmon_coho', 'Coho Salmon', 'Cá hồi Coho', 'Cá & Hải sản', 146, 21.6, 0, 6, 100, '1 fillet'),
    f('tuna_fresh', 'Fresh Tuna', 'Cá ngừ tươi', 'Cá & Hải sản', 108, 23.4, 0, 0.9, 100, '1 fillet'),
    f('tuna_canned_water', 'Canned Tuna in Water', 'Cá ngừ hộp (ngâm nước)', 'Cá & Hải sản', 86, 19.4, 0, 0.8, 100, '1 hộp'),
    f('tuna_canned_oil', 'Canned Tuna in Oil', 'Cá ngừ hộp (ngâm dầu)', 'Cá & Hải sản', 198, 29, 0, 8, 100, '1 hộp'),
    f('tilapia', 'Tilapia', 'Cá rô phi phi lê', 'Cá & Hải sản', 96, 20.1, 0, 1.7, 100, '1 fillet'),
    f('pangasius', 'Pangasius (Basa)', 'Cá basa phi lê', 'Cá & Hải sản', 90, 13, 0, 4, 100, '1 fillet'),
    f('mackerel', 'Mackerel', 'Cá thu', 'Cá & Hải sản', 205, 18.6, 0, 13.9, 100, '1 khứa'),
    f('scad', 'Scad', 'Cá nục', 'Cá & Hải sản', 111, 20, 0, 3, 100, '1 con'),
    f('seabass', 'Sea Bass', 'Cá chẽm', 'Cá & Hải sản', 97, 18.4, 0, 2, 100, '1 fillet'),
    f('cod', 'Cod', 'Cá tuyết', 'Cá & Hải sản', 82, 17.8, 0, 0.7, 100, '1 fillet'),
    f('sardine_fresh', 'Fresh Sardines', 'Cá mòi tươi', 'Cá & Hải sản', 208, 24.6, 0, 11.4, 100, '1 con'),
    f('carp', 'Carp', 'Cá chép', 'Cá & Hải sản', 127, 17.8, 0, 5.6, 100, '1 khứa'),
    f('catfish', 'Catfish', 'Cá trê', 'Cá & Hải sản', 95, 16.4, 0, 2.8, 100, '1 con'),
    f('shrimp_cooked', 'Shrimp (Cooked)', 'Tôm luộc', 'Cá & Hải sản', 99, 24, 0.2, 0.3, 100, '5 con'),
    f('tiger_prawn', 'Tiger Prawn', 'Tôm sú', 'Cá & Hải sản', 106, 22, 0, 1, 100, '3 con'),
    f('crab_meat', 'Crab Meat', 'Thịt cua', 'Cá & Hải sản', 87, 18.1, 0, 1.1, 100, '1 chén'),
    f('squid', 'Squid', 'Mực ống', 'Cá & Hải sản', 92, 15.6, 3.1, 1.4, 100, '1 con vừa'),
    f('cuttlefish', 'Cuttlefish', 'Mực nang', 'Cá & Hải sản', 79, 16.2, 0.8, 0.7, 100, '1 con'),
    f('octopus', 'Octopus', 'Bạch tuộc', 'Cá & Hải sản', 82, 14.9, 2.2, 1, 100, '1 xúc tu'),
    f('scallop', 'Scallop', 'Còi sò điệp', 'Cá & Hải sản', 69, 12, 3.2, 0.5, 100, '5 còi'),
    f('oyster', 'Oyster', 'Hàu', 'Cá & Hải sản', 51, 5.7, 2.7, 1.7, 100, '3 con'),
    f('clam', 'Clam', 'Nghêu (Ngao)', 'Cá & Hải sản', 74, 12.8, 2.6, 1, 100, '1 chén (thịt)'),
    f('mussel', 'Mussel', 'Vẹm xanh', 'Cá & Hải sản', 86, 11.9, 3.7, 2.2, 100, '5 con'),
    f('snail', 'Snail', 'Ốc bươu', 'Cá & Hải sản', 90, 16.1, 2, 1.4, 100, '1 đĩa nhỏ'),

    // ─── TRỨNG (EGGS) ───────────────────────────────────────────────────────────
    f('egg_boiled', 'Hard-Boiled Egg', 'Trứng gà luộc', 'Trứng', 155, 12.6, 1.1, 10.6, 50, '1 quả'),
    f('egg_fried', 'Fried Egg', 'Trứng gà chiên / ốp la', 'Trứng', 196, 13.6, 0.8, 14.8, 50, '1 quả'),
    f('egg_white_cooked', 'Egg White (Cooked)', 'Lòng trắng trứng luộc', 'Trứng', 52, 10.9, 0.7, 0.2, 100, '3 lòng trắng'),
    f('egg_yolk_cooked', 'Egg Yolk (Cooked)', 'Lòng đỏ trứng', 'Trứng', 322, 15.9, 3.6, 26.5, 30, '2 lòng đỏ'),
    f('duck_egg_boiled', 'Boiled Duck Egg', 'Trứng vịt luộc', 'Trứng', 185, 12.8, 1.5, 13.8, 70, '1 quả'),
    f('quail_egg_boiled', 'Boiled Quail Egg', 'Trứng cút luộc', 'Trứng', 158, 13.1, 0.4, 11.1, 50, '5 quả'),

    // ─── SỮA & CHẾ PHẨM (DAIRY) ─────────────────────────────────────────────────
    f('milk_whole', 'Whole Milk (3.25%)', 'Sữa tươi nguyên kem', 'Sữa & Chế phẩm', 61, 3.2, 4.8, 3.3, 200, '1 ly'),
    f('milk_skim', 'Skim Milk', 'Sữa tươi tách béo', 'Sữa & Chế phẩm', 34, 3.4, 5, 0.1, 200, '1 ly'),
    f('yogurt_plain', 'Plain Yogurt', 'Sữa chua không/ít đường', 'Sữa & Chế phẩm', 61, 3.5, 4.7, 3.3, 100, '1 hộp'),
    f('yogurt_greek_nonfat', 'Greek Yogurt (Nonfat)', 'Sữa chua Hy Lạp 0%', 'Sữa & Chế phẩm', 59, 10.3, 3.6, 0.4, 100, '1 hộp'),
    f('yogurt_greek_whole', 'Greek Yogurt (Whole)', 'Sữa chua Hy Lạp nguyên kem', 'Sữa & Chế phẩm', 97, 9, 3.9, 5, 100, '1 hộp'),
    f('cottage_cheese_lowfat', 'Low-fat Cottage Cheese', 'Phô mai Cottage', 'Sữa & Chế phẩm', 72, 10.4, 3.4, 1.1, 100, '2 thìa lớn'),
    f('cheddar_cheese', 'Cheddar Cheese', 'Phô mai Cheddar', 'Sữa & Chế phẩm', 403, 24.9, 1.3, 33.1, 30, '1 lát/viên'),
    f('mozzarella_part_skim', 'Mozzarella (Part Skim)', 'Phô mai Mozzarella', 'Sữa & Chế phẩm', 302, 24.3, 2.8, 21.6, 30, '1 lát/viên'),
    f('parmesan', 'Parmesan Cheese', 'Phô mai Parmesan', 'Sữa & Chế phẩm', 431, 38.5, 3.2, 28.6, 10, '1 thìa'),
    f('cream_cheese', 'Cream Cheese', 'Phô mai kem', 'Sữa & Chế phẩm', 342, 5.9, 4.1, 34.2, 30, '1 thìa lớn'),
    f('whey_isolate', 'Whey Protein Isolate', 'Whey Protein Isolate', 'Sữa & Chế phẩm', 370, 85, 3, 1, 30, '1 scoop'),
    f('casein_protein', 'Casein Protein', 'Casein Protein', 'Sữa & Chế phẩm', 360, 80, 4, 1.5, 30, '1 scoop'),

    // ─── RAU CỦ (VEGETABLES) ────────────────────────────────────────────────────
    f('spinach', 'Spinach', 'Rau chân vịt (Bina)', 'Rau củ', 23, 2.9, 3.6, 0.4, 100, '1 nắn'),
    f('broccoli', 'Broccoli', 'Bông cải xanh', 'Rau củ', 34, 2.8, 6.6, 0.4, 100, '1 chén'),
    f('cauliflower', 'Cauliflower', 'Bông cải trắng', 'Rau củ', 25, 1.9, 5, 0.3, 100, '1 chén'),
    f('asparagus', 'Asparagus', 'Măng tây', 'Rau củ', 20, 2.2, 3.9, 0.1, 100, '5 ngọn'),
    f('brussels_sprouts', 'Brussels Sprouts', 'Bắp cải mini', 'Rau củ', 43, 3.4, 9, 0.3, 100, '1 chén'),
    f('kale', 'Kale', 'Cải xoăn', 'Rau củ', 49, 4.3, 8.8, 0.9, 100, '1 nắn'),
    f('cabbage_green', 'Green Cabbage', 'Bắp cải xanh', 'Rau củ', 25, 1.3, 5.8, 0.1, 100, '1 chén'),
    f('cabbage_red', 'Red Cabbage', 'Bắp cải tím', 'Rau củ', 31, 1.4, 7.4, 0.2, 100, '1 chén'),
    f('bok_choy', 'Bok Choy', 'Cải thìa (Cải chíp)', 'Rau củ', 13, 1.5, 2.2, 0.2, 100, '1 chén'),
    f('water_spinach', 'Water Spinach', 'Rau muống', 'Rau củ', 19, 2.6, 3.1, 0.2, 100, '1 chén'),
    f('mustard_greens', 'Mustard Greens', 'Cải bẹ xanh', 'Rau củ', 27, 2.9, 4.7, 0.4, 100, '1 chén'),
    f('sweet_leaf', 'Sweet Leaf (Katuk)', 'Rau ngót', 'Rau củ', 35, 5.3, 3.4, 0, 100, '1 chén'),
    f('celery', 'Celery', 'Cần tây', 'Rau củ', 16, 0.7, 3, 0.2, 100, '1 cọng'),
    f('cucumber', 'Cucumber (with skin)', 'Dưa leo', 'Rau củ', 15, 0.6, 3.6, 0.1, 100, '1/2 quả'),
    f('zucchini', 'Zucchini', 'Bí ngòi', 'Rau củ', 17, 1.2, 3.1, 0.3, 100, '1/2 quả'),
    f('bell_pepper_red', 'Red Bell Pepper', 'Ớt chuông đỏ', 'Rau củ', 31, 1, 6, 0.3, 100, '1/2 quả'),
    f('bell_pepper_green', 'Green Bell Pepper', 'Ớt chuông xanh', 'Rau củ', 20, 0.9, 4.6, 0.2, 100, '1/2 quả'),
    f('tomato', 'Tomato', 'Cà chua', 'Rau củ', 18, 0.9, 3.9, 0.2, 100, '1 quả'),
    f('carrot', 'Carrot', 'Cà rốt', 'Rau củ', 41, 0.9, 9.6, 0.2, 100, '1 củ'),
    f('radish_white', 'White Radish', 'Củ cải trắng', 'Rau củ', 18, 0.6, 4.1, 0.1, 100, '1 củ nhỏ'),
    f('beetroot', 'Beetroot', 'Củ dền', 'Rau củ', 43, 1.6, 9.6, 0.2, 100, '1 củ nhỏ'),
    f('onion', 'Onion', 'Hành tây', 'Rau củ', 40, 1.1, 9.3, 0.1, 100, '1 củ nhỏ'),
    f('garlic', 'Garlic', 'Tỏi', 'Rau củ', 149, 6.4, 33.1, 0.5, 10, '3 tép'),
    f('mushroom_button', 'Button Mushroom', 'Nấm mỡ', 'Rau củ', 22, 3.1, 3.3, 0.3, 100, '1 chén'),
    f('mushroom_shiitake', 'Shiitake Mushroom', 'Nấm hương tươi', 'Rau củ', 34, 2.2, 6.8, 0.5, 100, '1 chén'),
    f('mushroom_enoki', 'Enoki Mushroom', 'Nấm kim châm', 'Rau củ', 37, 2.7, 7.8, 0.2, 100, '1 nắn'),
    f('green_bean', 'Green Beans', 'Đậu cô ve', 'Rau củ', 31, 1.8, 7, 0.2, 100, '1 chén'),
    f('okra', 'Okra', 'Đậu bắp', 'Rau củ', 33, 1.9, 7.5, 0.2, 100, '5 quả'),
    f('eggplant', 'Eggplant', 'Cà tím', 'Rau củ', 25, 1, 5.9, 0.2, 100, '1/2 quả'),
    f('bitter_melon', 'Bitter Melon', 'Khổ qua', 'Rau củ', 17, 1, 3.7, 0.2, 100, '1/2 quả'),
    f('pumpkin', 'Pumpkin', 'Bí đỏ', 'Rau củ', 26, 1, 6.5, 0.1, 100, '1 khúc'),
    f('winter_melon', 'Winter Melon', 'Bí đao', 'Rau củ', 13, 0.4, 3, 0.2, 100, '1 khúc'),

    // ─── TRÁI CÂY (FRUITS) ──────────────────────────────────────────────────────
    f('banana', 'Banana', 'Chuối', 'Trái cây', 89, 1.1, 22.8, 0.3, 100, '1 quả trung'),
    f('apple', 'Apple', 'Táo', 'Trái cây', 52, 0.3, 13.8, 0.2, 100, '1 quả nhỏ'),
    f('orange', 'Orange', 'Cam', 'Trái cây', 47, 0.9, 11.8, 0.1, 100, '1 quả'),
    f('grapefruit', 'Grapefruit/Pomelo', 'Bưởi', 'Trái cây', 38, 0.8, 9.6, 0.1, 100, '2 múi'),
    f('watermelon', 'Watermelon', 'Dưa hấu', 'Trái cây', 30, 0.6, 7.6, 0.2, 100, '1 miếng lớn'),
    f('cantaloupe', 'Cantaloupe/Melon', 'Dưa lưới', 'Trái cây', 34, 0.8, 8.2, 0.2, 100, '1 miếng'),
    f('mango', 'Mango', 'Xoài chín', 'Trái cây', 60, 0.8, 15, 0.4, 100, '1/2 quả'),
    f('papaya', 'Papaya', 'Đu đủ chín', 'Trái cây', 43, 0.5, 10.8, 0.3, 100, '1 miếng'),
    f('pineapple', 'Pineapple', 'Thơm (Dứa)', 'Trái cây', 50, 0.5, 13.1, 0.1, 100, '1 miếng'),
    f('strawberries', 'Strawberries', 'Dâu tây', 'Trái cây', 32, 0.7, 7.7, 0.3, 100, '10 quả'),
    f('blueberries', 'Blueberries', 'Việt quất', 'Trái cây', 57, 0.7, 14.5, 0.3, 100, '1 nắn'),
    f('grapes', 'Grapes', 'Nho', 'Trái cây', 69, 0.7, 18.1, 0.2, 100, '1 chùm nhỏ'),
    f('kiwi', 'Kiwi', 'Kiwi', 'Trái cây', 61, 1.1, 14.7, 0.5, 100, '1 quả'),
    f('guava', 'Guava', 'Ổi', 'Trái cây', 68, 2.6, 14.3, 1, 100, '1/2 quả'),
    f('dragon_fruit', 'Dragon Fruit', 'Thanh long', 'Trái cây', 60, 1.2, 13, 0.4, 100, '1/4 quả'),
    f('passion_fruit', 'Passion Fruit', 'Chanh dây', 'Trái cây', 97, 2.2, 23.4, 0.7, 100, '2 quả'),
    f('jackfruit', 'Jackfruit', 'Mít', 'Trái cây', 95, 1.7, 23.2, 0.6, 100, '3 múi'),
    f('lychee', 'Lychee', 'Vải', 'Trái cây', 66, 0.8, 16.5, 0.4, 100, '5 quả'),
    f('longan', 'Longan', 'Nhãn', 'Trái cây', 60, 1.3, 15.1, 0.1, 100, '10 quả'),
    f('rambutan', 'Rambutan', 'Chôm chôm', 'Trái cây', 68, 0.9, 16, 0.2, 100, '5 quả'),
    f('mangosteen', 'Mangosteen', 'Măng cụt', 'Trái cây', 73, 0.6, 17.9, 0.6, 100, '3 quả'),
    f('durian', 'Durian', 'Sầu riêng', 'Trái cây', 147, 1.5, 27.1, 5.3, 100, '1 múi'),
    f('plum', 'Plum', 'Mận (Bắc)', 'Trái cây', 46, 0.7, 11.4, 0.3, 100, '3 quả'),
    f('peach', 'Peach', 'Đào', 'Trái cây', 39, 0.9, 9.5, 0.3, 100, '1 quả'),
    f('pear', 'Pear', 'Lê', 'Trái cây', 57, 0.4, 15.2, 0.1, 100, '1 quả'),
    f('cherry', 'Cherry', 'Cherry', 'Trái cây', 63, 1.1, 16, 0.2, 100, '15 quả'),
    f('pomegranate', 'Pomegranate', 'Lựu', 'Trái cây', 83, 1.7, 18.7, 1.2, 100, '1/2 quả'),
    f('coconut_flesh', 'Coconut Meat', 'Cơm dừa nạo', 'Trái cây', 354, 3.3, 15.2, 33.5, 100, '1 miếng'),

    // ─── ĐẬU & CÁC LOẠI (LEGUMES) ───────────────────────────────────────────────
    f('tofu_firm', 'Firm Tofu', 'Đậu hũ khuôn (Firm)', 'Đậu & Các loại', 144, 15.8, 2.8, 8.7, 100, '1 miếng'),
    f('tofu_soft', 'Soft Tofu', 'Đậu hũ non (Soft)', 'Đậu & Các loại', 61, 6.6, 2, 3.3, 100, '1 miếng'),
    f('edamame', 'Edamame', 'Đậu nành luộc (nhật)', 'Đậu & Các loại', 121, 11.9, 8.9, 5.2, 100, '1 chén'),
    f('soybeans_dry', 'Soybeans (Dry)', 'Đậu nành hạt khô', 'Đậu & Các loại', 446, 36.5, 30.2, 19.9, 50, '1/2 chén'),
    f('lentils_raw', 'Lentils (Raw)', 'Đậu lăng xanh/đỏ', 'Đậu & Các loại', 353, 25.8, 60.1, 1.1, 50, '1/2 chén'),
    f('chickpeas_raw', 'Chickpeas (Raw)', 'Đậu gà', 'Đậu & Các loại', 378, 20.5, 63, 6, 50, '1/2 chén'),
    f('black_beans_raw', 'Black Beans (Raw)', 'Đậu đen', 'Đậu & Các loại', 341, 21.6, 62.4, 1.4, 50, '1/2 chén'),
    f('mung_beans_raw', 'Mung Beans (Raw)', 'Đậu xanh', 'Đậu & Các loại', 347, 23.9, 62.6, 1.2, 50, '1/2 chén'),
    f('kidney_beans_raw', 'Kidney Beans (Raw)', 'Đậu đỏ', 'Đậu & Các loại', 333, 23.6, 60, 0.8, 50, '1/2 chén'),
    f('peanut_butter', 'Peanut Butter', 'Bơ đậu phộng mộc', 'Đậu & Các loại', 588, 25.1, 20, 50.4, 15, '1 thìa'),
    f('soy_milk', 'Soy Milk', 'Sữa đậu nành không đường', 'Đậu & Các loại', 33, 2.9, 1.8, 1.6, 200, '1 ly'),
    f('tempeh', 'Tempeh', 'Tương nén Tempeh', 'Đậu & Các loại', 192, 20.3, 7.6, 10.8, 100, '1 lát'),
    f('peas_green', 'Green Peas', 'Đậu Hà Lan', 'Đậu & Các loại', 81, 5.4, 14.5, 0.4, 100, '1 chén'),

    // ─── HẠT & QUẢ HẠCH (NUTS & SEEDS) ──────────────────────────────────────────
    f('almonds', 'Almonds', 'Hạnh nhân', 'Hạt & Quả hạch', 579, 21.2, 21.6, 49.9, 30, '1 nắm'),
    f('walnuts', 'Walnuts', 'Óc chó', 'Hạt & Quả hạch', 654, 15.2, 13.7, 65.2, 30, '1 nắm'),
    f('cashews', 'Cashews', 'Hạt điều', 'Hạt & Quả hạch', 553, 18.2, 30.2, 43.8, 30, '1 nắm'),
    f('peanuts', 'Peanuts', 'Đậu phộng (Lạc)', 'Hạt & Quả hạch', 567, 25.8, 16.1, 49.2, 30, '1 nắm'),
    f('pistachios', 'Pistachios', 'Hạt dẻ cười', 'Hạt & Quả hạch', 562, 20.2, 27.2, 45.3, 30, '1 nắm'),
    f('macadamia', 'Macadamia', 'Hạt mắc ca', 'Hạt & Quả hạch', 718, 7.9, 13.8, 75.8, 30, '1 nắm'),
    f('pecans', 'Pecans', 'Hạt hồ đào', 'Hạt & Quả hạch', 691, 9.2, 13.9, 72, 30, '1 nắm'),
    f('brazil_nuts', 'Brazil Nuts', 'Hạt Brazil', 'Hạt & Quả hạch', 659, 14.3, 11.7, 67.1, 30, '1 nắm'),
    f('pine_nuts', 'Pine Nuts', 'Hạt thông', 'Hạt & Quả hạch', 673, 13.7, 13.1, 68.4, 30, '1 nắm'),
    f('hazelnuts', 'Hazelnuts', 'Hạt phỉ', 'Hạt & Quả hạch', 628, 15, 16.7, 60.8, 30, '1 nắm'),
    f('chia_seeds', 'Chia Seeds', 'Hạt chia', 'Hạt & Quả hạch', 486, 16.5, 42.1, 30.7, 15, '1 thìa'),
    f('flax_seeds', 'Flax Seeds', 'Hạt lanh', 'Hạt & Quả hạch', 534, 18.3, 28.9, 42.2, 15, '1 thìa'),
    f('pumpkin_seeds', 'Pumpkin Seeds', 'Hạt bí xanh', 'Hạt & Quả hạch', 559, 30.2, 10.7, 49, 30, '1 nắm'),
    f('sunflower_seeds', 'Sunflower Seeds', 'Hạt hướng dương', 'Hạt & Quả hạch', 584, 20.8, 20, 51.5, 30, '1 nắm'),
    f('sesame_seeds', 'Sesame Seeds', 'Hạt mè (vừng)', 'Hạt & Quả hạch', 573, 17.7, 23.4, 49.7, 10, '1 thìa'),
    f('hemp_seeds', 'Hemp Seeds', 'Hạt gai dầu', 'Hạt & Quả hạch', 553, 31.6, 8.7, 48.8, 30, '1 nắm'),
    f('lotus_seeds', 'Lotus Seeds', 'Hạt sen khô', 'Hạt & Quả hạch', 332, 15.4, 64.5, 2, 50, '1 nắn'),
    f('chestnuts', 'Chestnuts', 'Hạt dẻ nướng', 'Hạt & Quả hạch', 245, 3.2, 53, 2.2, 50, '1 nắm'),

    // ─── CHẤT BÉO TỐT (HEALTHY FATS) ────────────────────────────────────────────
    f('avocado', 'Avocado', 'Bơ trái', 'Chất béo tốt', 160, 2, 8.5, 14.7, 100, '1/2 quả'),
    f('olive_oil', 'Olive Oil', 'Dầu Olive', 'Chất béo tốt', 884, 0, 0, 100, 15, '1 thìa'),
    f('coconut_oil', 'Coconut Oil', 'Dầu dừa', 'Chất béo tốt', 862, 0, 0, 100, 15, '1 thìa'),
    f('butter', 'Butter', 'Bơ lạt (Động vật)', 'Chất béo tốt', 717, 0.8, 0.1, 81.1, 15, '1 thìa'),
    f('ghee', 'Ghee', 'Bơ Ghee nguyên chất', 'Chất béo tốt', 899, 0, 0, 99.5, 15, '1 thìa'),
    f('dark_chocolate', 'Dark Chocolate', 'Socola đen 70-85%', 'Chất béo tốt', 598, 7.8, 45.9, 42.6, 30, '1 miếng vuông'),
    f('sesame_oil', 'Sesame Oil', 'Dầu mè', 'Chất béo tốt', 884, 0, 0, 100, 15, '1 thìa'),
    f('flaxseed_oil', 'Flaxseed Oil', 'Dầu hạt lanh', 'Chất béo tốt', 884, 0, 0, 100, 15, '1 thìa'),

    // ─── MÓN ĂN VIỆT NAM (VIETNAMESE DISHES) ───────────────────────────────────
    f('pho_bo', 'Phở bò', 'Phở bò chín', 'Món ăn Việt Nam', 350, 22, 45, 8, 400, '1 tô vừa'),
    f('pho_ga', 'Phở gà', 'Phở gà', 'Món ăn Việt Nam', 330, 25, 43, 6, 400, '1 tô vừa'),
    f('bun_bo_hue', 'Bún bò Huế', 'Bún bò Huế', 'Món ăn Việt Nam', 450, 26, 55, 12, 500, '1 tô'),
    f('com_tam_suon', 'Cơm tấm sườn', 'Cơm tấm sườn nướng', 'Món ăn Việt Nam', 550, 28, 70, 18, 500, '1 đĩa'),
    f('banh_mi_thit', 'Bánh mì thịt', 'Bánh mì thịt/chả', 'Món ăn Việt Nam', 380, 14, 45, 15, 200, '1 ổ'),
    f('com_rang_dua_bo', 'Cơm rang dưa bò', 'Cơm rang dưa bò', 'Món ăn Việt Nam', 650, 30, 80, 22, 500, '1 đĩa'),
    f('thit_kho_tau', 'Thịt kho tàu', 'Thịt heo kho trứng', 'Món ăn Việt Nam', 320, 18, 10, 25, 200, '1 chén'),
    f('canh_chua_ca', 'Canh chua cá', 'Canh chua cá lóc', 'Món ăn Việt Nam', 150, 12, 15, 4, 400, '1 tô'),
    f('bun_rieu', 'Bún riêu', 'Bún riêu cua', 'Món ăn Việt Nam', 350, 16, 50, 9, 500, '1 tô'),
    f('xoi_xeo', 'Xôi xéo', 'Xôi xéo', 'Món ăn Việt Nam', 400, 10, 75, 8, 200, '1 gói nhỏ'),
    f('banh_cuon', 'Bánh cuốn', 'Bánh cuốn nhân thịt', 'Món ăn Việt Nam', 300, 12, 45, 8, 300, '1 đĩa'),
    f('bun_cha', 'Bún chả', 'Bún chả Hà Nội', 'Món ăn Việt Nam', 450, 22, 55, 16, 500, '1 suất'),
    f('nem_ran', 'Chả giò', 'Chả giò (Nem rán)', 'Món ăn Việt Nam', 150, 5, 12, 9, 100, '2 cuốn'),
    f('ga_kho_sa', 'Gà kho sả', 'Gà kho sả ớt', 'Món ăn Việt Nam', 220, 25, 5, 12, 200, '1 đĩa nhỏ'),
    f('goi_cuon', 'Gỏi cuốn', 'Gỏi cuốn tôm thịt', 'Món ăn Việt Nam', 180, 10, 30, 3, 200, '3 cuốn'),
    f('dau_hu_sot_ca', 'Đậu hũ sốt cà', 'Đậu hũ sốt cà chua', 'Món ăn Việt Nam', 180, 12, 8, 11, 250, '1 đĩa vừa'),
];

// ─── Storage helpers ──────────────────────────────────────────────────────────

const CUSTOM_FOOD_KEY = (userId: string) => `custom_foods_${userId}`;

export function loadFoodDatabase(userId: string): FoodItem[] {
    try {
        const raw = localStorage.getItem(CUSTOM_FOOD_KEY(userId));
        const customFoods: FoodItem[] = raw ? JSON.parse(raw) : [];
        const customIds = new Set(customFoods.map(f => f.id));
        const merged = [...customFoods, ...DEFAULT_FOOD_DATABASE.filter(f => !customIds.has(f.id))];
        return merged;
    } catch {
        return [...DEFAULT_FOOD_DATABASE];
    }
}

export function saveFoodDatabase(userId: string, foods: FoodItem[]) {
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
