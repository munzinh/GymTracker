// â”€â”€â”€ Food Database â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Vietnamese-sourced nutritional values (per 100g unless noted)
// References: NIN Vietnam, VSEA Nutrition Table, USDA, Viá»‡n Dinh DÆ°á»¡ng Quá»‘c Gia

export const DEFAULT_FOOD_CATEGORIES: string[] = [
    // Loáº¡i mÃ³n Äƒn
    'CÆ¡m & XÃ´i',
    'Phá»Ÿ & BÃºn & MÃ¬',
    'Thá»‹t & Gia cáº§m',
    'Háº£i sáº£n',
    'Trá»©ng & Äáº­u phá»¥',
    'Rau & Cá»§',
    'Canh & SÃºp',
    'BÃ¡nh mÃ¬ & Cuá»‘n',
    'BÃ¡nh & XÃ´i ngá»t',
    'TrÃ¡i cÃ¢y',
    'Äá»“ uá»‘ng',
    'Äá»“ Äƒn nhanh',
    'Gym & Meal Prep',
    // VÃ¹ng miá»n
    'Äáº·c sáº£n Miá»n Báº¯c',
    'Äáº·c sáº£n Miá»n Trung',
    'Äáº·c sáº£n Miá»n Nam',
];

// Keep legacy export for backward compatibility
export const FOOD_CATEGORIES = DEFAULT_FOOD_CATEGORIES;


export type FoodCategory = string;

// â”€â”€â”€ Category Storage helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    label: string;   // e.g. "1 tÃ´ nhá»", "1 tÃ´ vá»«a"
    grams: number;
}

export interface FoodItem {
    id: string;
    name: string;       // English name
    nameVi: string;     // Vietnamese display name
    category: string;
    per100g: { calories: number; protein: number; carbs: number; fat: number };
    commonServingG?: number;  // typical serving size in grams
    servingLabel?: string;    // e.g. "1 chÃ©n nhá»", "1 miáº¿ng", "1 tÃ´"
    servings?: ServingOption[];  // multiple serving size options
    isCustom?: boolean;
}


// Short-hand helper
function f(id: string, name: string, nameVi: string, category: string, calories: number, protein: number, carbs: number, fat: number, servingG?: number, servingLabel?: string): FoodItem {
    return { id, name, nameVi, category, per100g: { calories, protein, carbs, fat }, commonServingG: servingG, servingLabel };
}

export const DEFAULT_FOOD_DATABASE: FoodItem[] = [
    // CƠM & XÔI
    f('com_trang', 'Steamed White Rice', 'Cơm trắng', 'Cơm & Xôi', 130, 2.7, 28, 0.3, 200, '1 chén'),
    f('com_tam', 'Broken Rice', 'Cơm tấm trắng', 'Cơm & Xôi', 123, 2.7, 27, 0.3, 200, '1 chén'),
    f('com_tam_day', 'Broken Rice Full', 'Cơm tấm bì chả sườn', 'Cơm & Xôi', 200, 8.8, 22, 10.5, 400, '1 đĩa'),
    f('com_ga', 'Chicken Rice', 'Cơm gà xé phay', 'Cơm & Xôi', 155, 11, 20, 4, 300, '1 đĩa'),
    f('com_suon', 'Pork Chop Rice', 'Cơm sườn nướng', 'Cơm & Xôi', 190, 13, 22, 6, 300, '1 đĩa'),
    f('com_thap_cam', 'Mixed Rice', 'Cơm thập cẩm', 'Cơm & Xôi', 200, 10, 28, 6, 300, '1 hộp'),
    f('com_chien', 'Fried Rice', 'Cơm chiên dương châu', 'Cơm & Xôi', 185, 6, 28, 6, 250, '1 đĩa'),
    f('com_gao_lut', 'Brown Rice', 'Cơm gạo lứt', 'Cơm & Xôi', 111, 2.6, 23, 0.9, 200, '1 chén'),
    f('com_den', 'Black Rice', 'Cơm gạo đen', 'Cơm & Xôi', 108, 3.2, 22, 1, 200, '1 chén'),
    f('com_bo_bit_tet', 'Beef Steak Rice', 'Cơm bò bít tết', 'Cơm & Xôi', 220, 16, 25, 9, 400, '1 đĩa'),
    f('com_ca', 'Fish Rice', 'Cơm cá kho', 'Cơm & Xôi', 165, 12, 22, 4, 300, '1 đĩa'),
    f('com_hen', 'Clam Rice', 'Cơm hến Huế', 'Cơm & Xôi', 170, 7, 28, 4, 250, '1 đĩa'),
    f('com_chien_ca_man', 'Salted Fish Fried Rice', 'Cơm chiên cá mặn', 'Cơm & Xôi', 195, 8, 28, 7, 250, '1 đĩa'),
    f('com_chien_trung', 'Egg Fried Rice', 'Cơm chiên trứng', 'Cơm & Xôi', 175, 6, 27, 5.5, 250, '1 đĩa'),
    f('xoi_xeo', 'Sticky Rice Mung Bean', 'Xôi xéo mỡ hành', 'Cơm & Xôi', 240, 5, 42, 6, 200, '1 gói'),
    f('xoi_man', 'Savory Sticky Rice', 'Xôi mặn thập cẩm', 'Cơm & Xôi', 260, 8, 38, 8, 200, '1 gói'),
    f('xoi_gac', 'Red Sticky Rice', 'Xôi gấc', 'Cơm & Xôi', 210, 4, 40, 4.5, 200, '1 gói'),
    f('xoi_ngo', 'Corn Sticky Rice', 'Xôi bắp', 'Cơm & Xôi', 220, 5, 40, 4, 200, '1 gói'),
    f('xoi_la_dua', 'Pandan Sticky Rice', 'Xôi lá dứa', 'Cơm & Xôi', 225, 4, 42, 5, 200, '1 gói'),
    f('xoi_dau_den', 'Black Bean Sticky Rice', 'Xôi đậu đen', 'Cơm & Xôi', 215, 6, 40, 3.5, 200, '1 gói'),
    f('xoi_dau_phong', 'Peanut Sticky Rice', 'Xôi đậu phộng', 'Cơm & Xôi', 270, 7, 40, 9, 200, '1 gói'),
    f('com_lam', 'Bamboo Tube Rice', 'Cơm lam', 'Cơm & Xôi', 135, 3, 28, 1, 150, '1 ống'),
    f('chao_trang', 'Plain Congee', 'Cháo trắng', 'Cơm & Xôi', 40, 1.2, 8, 0.2, 300, '1 chén'),
    f('chao_ga', 'Chicken Congee', 'Cháo gà', 'Cơm & Xôi', 65, 4, 9, 1.5, 350, '1 tô'),
    f('chao_bo', 'Beef Congee', 'Cháo bò', 'Cơm & Xôi', 70, 5, 9, 1.8, 350, '1 tô'),
    f('chao_ca', 'Fish Congee', 'Cháo cá', 'Cơm & Xôi', 60, 4.5, 9, 1, 350, '1 tô'),

    // PHỞ & BÚN & MÌ
    f('pho_bo', 'Beef Pho', 'Phở bò tái chín', 'Phở & Bún & Mì', 93, 5.6, 10.4, 3, 500, '1 tô'),
    f('pho_ga', 'Chicken Pho', 'Phở gà', 'Phở & Bún & Mì', 85, 6, 10, 1.5, 450, '1 tô'),
    f('pho_hai_san', 'Seafood Pho', 'Phở hải sản', 'Phở & Bún & Mì', 90, 7, 10, 2, 450, '1 tô'),
    f('bun_bo_hue', 'Spicy Beef Noodle', 'Bún bò Huế', 'Phở & Bún & Mì', 105, 7, 12, 3, 450, '1 tô'),
    f('bun_rieu', 'Crab Noodle Soup', 'Bún riêu cua', 'Phở & Bún & Mì', 95, 6.5, 12, 2.5, 450, '1 tô'),
    f('bun_thit_nuong', 'BBQ Pork Vermicelli', 'Bún thịt nướng', 'Phở & Bún & Mì', 155, 7, 20, 5, 300, '1 tô'),
    f('bun_dau_mam', 'Tofu Vermicelli', 'Bún đậu mắm tôm', 'Phở & Bún & Mì', 167, 8.4, 18, 7.5, 350, '1 mẹt'),
    f('mi_quang', 'Quang Noodle', 'Mì Quảng', 'Phở & Bún & Mì', 135, 6, 17, 4.5, 400, '1 tô'),
    f('hu_tieu', 'Nam Vang Noodle', 'Hủ tiếu Nam Vang', 'Phở & Bún & Mì', 120, 5, 16, 4, 400, '1 tô'),
    f('banh_da_cua', 'Crab Noodle', 'Bánh đa cua Hải Phòng', 'Phở & Bún & Mì', 115, 6, 15, 3.5, 400, '1 tô'),
    f('mien_ga', 'Glass Noodle Chicken', 'Miến gà', 'Phở & Bún & Mì', 90, 5, 15, 1.5, 350, '1 tô'),
    f('mien_luon', 'Eel Glass Noodle', 'Miến lươn', 'Phở & Bún & Mì', 100, 7, 14, 2, 350, '1 tô'),
    f('mi_vit', 'Duck Noodle', 'Mì vịt tiềm', 'Phở & Bún & Mì', 90, 6, 10, 3, 400, '1 tô'),
    f('mi_tom', 'Instant Noodle', 'Mì tôm nấu nước', 'Phở & Bún & Mì', 65, 2, 9, 2.5, 350, '1 tô'),
    f('mi_xao_bo', 'Beef Stir-fry Noodle', 'Mì xào bò', 'Phở & Bún & Mì', 160, 8, 21, 5, 300, '1 đĩa'),
    f('mi_xao_hai_san', 'Seafood Stir-fry Noodle', 'Mì xào hải sản', 'Phở & Bún & Mì', 155, 9, 20, 5, 300, '1 đĩa'),
    f('pho_cuon', 'Rolling Pho', 'Phở cuốn bò', 'Phở & Bún & Mì', 130, 7, 18, 3, 200, '4-5 cuốn'),
    f('bun_cha', 'Bun Cha Hanoi', 'Bún chả Hà Nội', 'Phở & Bún & Mì', 145, 10, 16, 5, 350, '1 phần'),
    f('bun_moc', 'Pork Ball Noodle', 'Bún mọc', 'Phở & Bún & Mì', 100, 6, 12, 3, 400, '1 tô'),
    f('bun_ca', 'Fish Noodle Soup', 'Bún cá', 'Phở & Bún & Mì', 95, 7, 12, 2.5, 400, '1 tô'),
    f('banh_canh_cua', 'Crab Thick Noodle', 'Bánh canh cua', 'Phở & Bún & Mì', 110, 6, 15, 3, 400, '1 tô'),
    f('banh_canh_gio_heo', 'Pork Hock Noodle', 'Bánh canh giò heo', 'Phở & Bún & Mì', 130, 7, 16, 4.5, 400, '1 tô'),
    f('cao_lau', 'Cao Lau', 'Cao lầu Hội An', 'Phở & Bún & Mì', 145, 7, 20, 4, 350, '1 đĩa'),
    f('bun_oc', 'Snail Noodle', 'Bún ốc', 'Phở & Bún & Mì', 90, 5, 13, 2, 400, '1 tô'),
    f('chao_vit', 'Duck Congee', 'Cháo vịt', 'Phở & Bún & Mì', 65, 5, 9, 1.5, 350, '1 tô'),
    f('chao_long', 'Offal Congee', 'Cháo lòng', 'Phở & Bún & Mì', 80, 5.5, 10, 2.5, 350, '1 tô'),

    // THỊT & GIA CẦM
    f('uc_ga_nuong', 'Grilled Chicken Breast', 'Ức gà nướng không da', 'Thịt & Gia cầm', 165, 31, 0, 3.6, 150, '1 miếng'),
    f('uc_ga_luoc', 'Boiled Chicken Breast', 'Ức gà luộc không da', 'Thịt & Gia cầm', 165, 31, 0, 3.6, 120, '1 miếng'),
    f('dui_ga_nuong', 'Grilled Chicken Thigh', 'Đùi gà nướng', 'Thịt & Gia cầm', 209, 24, 0, 12, 150, '1 cái'),
    f('dui_ga_luoc', 'Boiled Chicken Thigh', 'Đùi gà luộc', 'Thịt & Gia cầm', 195, 22, 0, 11, 150, '1 cái'),
    f('ga_ran', 'Fried Chicken', 'Gà rán có vỏ', 'Thịt & Gia cầm', 285, 23, 10, 18, 120, '1 miếng'),
    f('ga_nuong_mat_ong', 'Honey Roasted Chicken', 'Gà nướng mật ong', 'Thịt & Gia cầm', 220, 24, 5, 11, 150, '1 phần'),
    f('vit_luoc', 'Boiled Duck', 'Vịt luộc', 'Thịt & Gia cầm', 201, 19, 0, 13.5, 150, '1 phần'),
    f('vit_quay', 'Roasted Duck', 'Vịt quay', 'Thịt & Gia cầm', 337, 19, 0, 28, 150, '1 phần'),
    f('thit_heo_luoc', 'Boiled Pork Belly', 'Thịt heo ba chỉ luộc', 'Thịt & Gia cầm', 330, 18, 0, 28, 100, '2-3 miếng'),
    f('thit_heo_kho', 'Braised Pork', 'Thịt heo kho tiêu', 'Thịt & Gia cầm', 260, 16, 5, 19, 150, '1 chén'),
    f('suon_nuong', 'BBQ Pork Ribs', 'Sườn heo nướng', 'Thịt & Gia cầm', 290, 18, 5, 22, 150, '3 sườn'),
    f('suon_xao_chua_ngot', 'Sweet Sour Pork Ribs', 'Sườn xào chua ngọt', 'Thịt & Gia cầm', 240, 15, 12, 15, 200, '1 phần'),
    f('thit_bo_nuong', 'Grilled Beef', 'Thịt bò nướng nạc', 'Thịt & Gia cầm', 215, 26, 0, 12, 120, '1 phần'),
    f('bo_luc_lac', 'Shaking Beef', 'Bò lúc lắc', 'Thịt & Gia cầm', 230, 24, 4, 13, 150, '1 phần'),
    f('bo_kho', 'Beef Stew', 'Bò kho', 'Thịt & Gia cầm', 155, 12, 8, 8, 200, '1 chén'),
    f('cha_lua', 'Vietnamese Ham', 'Chả lụa (giò lụa)', 'Thịt & Gia cầm', 210, 15, 3, 15, 60, '2 lát'),
    f('cha_que', 'Cinnamon Pork Roll', 'Chả quế', 'Thịt & Gia cầm', 220, 14, 4, 16, 60, '2 lát'),
    f('nem_nuong', 'Grilled Pork Roll', 'Nem nướng', 'Thịt & Gia cầm', 250, 16, 8, 16, 80, '3-4 viên'),
    f('thit_chien', 'Fried Pork', 'Thịt heo chiên giòn', 'Thịt & Gia cầm', 320, 17, 8, 24, 120, '1 phần'),
    f('ga_kho_gung', 'Ginger Braised Chicken', 'Gà kho gừng', 'Thịt & Gia cầm', 185, 20, 3, 10, 150, '1 phần'),
    f('ga_hap_hanh', 'Steamed Ginger Chicken', 'Gà hấp hành', 'Thịt & Gia cầm', 178, 22, 0, 9.5, 150, '1 phần'),
    f('thit_bo_xao_rau', 'Beef Stir-fry Veg', 'Thịt bò xào rau củ', 'Thịt & Gia cầm', 140, 12, 7, 7, 200, '1 phần'),
    f('heo_quay', 'Roasted Pork', 'Heo quay da giòn', 'Thịt & Gia cầm', 350, 21, 0, 29, 100, '1 phần nhỏ'),

    // HẢI SẢN
    f('tom_nuong', 'Grilled Shrimp', 'Tôm nướng muối ớt', 'Hải sản', 99, 20, 0.9, 1.1, 150, '5-6 con'),
    f('tom_luoc', 'Boiled Shrimp', 'Tôm luộc', 'Hải sản', 99, 20, 0.9, 1.1, 150, '5-6 con'),
    f('tom_rang_muoi', 'Salt Pepper Shrimp', 'Tôm rang muối', 'Hải sản', 130, 20, 3, 4, 150, '5-6 con'),
    f('cua_hap', 'Steamed Crab', 'Cua hấp', 'Hải sản', 97, 16, 0, 2.5, 200, '1/2 con'),
    f('cua_rang_muoi', 'Salt Pepper Crab', 'Cua rang muối', 'Hải sản', 125, 15, 4, 5.5, 200, '1/2 con'),
    f('muc_nuong', 'Grilled Squid', 'Mực nướng sa tế', 'Hải sản', 92, 15, 3, 2, 150, '1 con nhỏ'),
    f('muc_chien', 'Fried Squid', 'Mực chiên giòn', 'Hải sản', 200, 15, 12, 10, 120, '1 phần'),
    f('ca_phi_le', 'Fish Fillet', 'Phi lê cá hấp', 'Hải sản', 120, 22, 0, 3, 150, '1 miếng'),
    f('ca_thu', 'Mackerel', 'Cá thu áp chảo', 'Hải sản', 150, 24, 0, 6.5, 150, '1 miếng'),
    f('ca_hoi', 'Salmon', 'Cá hồi hấp áp chảo', 'Hải sản', 208, 20, 0, 14, 150, '1 miếng'),
    f('ca_basa', 'Basa Fish', 'Cá basa kho tộ', 'Hải sản', 105, 16, 2, 4, 150, '1 miếng'),
    f('ca_tra', 'Catfish', 'Cá trà chiên', 'Hải sản', 130, 17, 2, 6, 150, '1 miếng'),
    f('ca_chim', 'Pomfret Fish', 'Cá chim chiên', 'Hải sản', 140, 20, 0, 6.5, 150, '1 miếng'),
    f('ca_xot_ca', 'Fish Tomato Sauce', 'Cá sốt cà chua', 'Hải sản', 110, 14, 5, 3.5, 200, '1 chén'),
    f('ca_kho', 'Braised Fish', 'Cá kho tộ', 'Hải sản', 120, 15, 3, 5, 150, '1 miếng'),
    f('bach_tuoc_xao', 'Stir-fry Octopus', 'Bạch tuộc xào sa tế', 'Hải sản', 82, 14, 2, 1.5, 150, '1 phần'),
    f('hau_hap', 'Steamed Oyster', 'Hàu hấp sả gừng', 'Hải sản', 68, 7, 3.9, 2, 100, '3-4 con'),
    f('so_diep_xao', 'Scallop Stir-fry', 'Sò điệp xào bơ tỏi', 'Hải sản', 88, 12, 3, 3, 120, '1 phần'),
    f('ca_vien', 'Fish Ball', 'Chả cá viên luộc', 'Hải sản', 160, 12, 12, 6, 100, '4-5 viên'),

    // TRỨNG & ĐẬU PHỤ
    f('trung_luoc', 'Boiled Egg', 'Trứng gà luộc', 'Trứng & Đậu phụ', 155, 13, 1.1, 11, 60, '1 quả'),
    f('trung_chien', 'Fried Egg', 'Trứng ốp la chiên dầu', 'Trứng & Đậu phụ', 185, 13, 0.4, 14, 60, '1 quả'),
    f('trung_cuon', 'Egg Roll Omelet', 'Trứng cuộn rau', 'Trứng & Đậu phụ', 175, 12, 2, 13, 80, '1 cuộn'),
    f('trung_chao', 'Scrambled Eggs', 'Trứng bác', 'Trứng & Đậu phụ', 165, 12, 1, 12, 80, '2 quả'),
    f('trung_vit_luoc', 'Boiled Duck Egg', 'Trứng vịt luộc', 'Trứng & Đậu phụ', 185, 13, 1.5, 14, 70, '1 quả'),
    f('trung_muoi', 'Salted Egg', 'Trứng muối', 'Trứng & Đậu phụ', 190, 14, 2, 14, 60, '1 quả'),
    f('trung_bac_thao', 'Century Egg', 'Trứng bắc thảo', 'Trứng & Đậu phụ', 135, 9, 2, 10, 50, '1 quả'),
    f('dau_hu_sot', 'Tofu Tomato Sauce', 'Đậu hũ sốt cà chua', 'Trứng & Đậu phụ', 80, 6.5, 4.5, 4, 150, '3-4 miếng'),
    f('dau_hu_non', 'Soft Tofu Steamed', 'Đậu hũ non hấp hành', 'Trứng & Đậu phụ', 55, 5, 3, 2.5, 150, '1 miếng'),
    f('dau_phu_chien', 'Fried Tofu', 'Đậu phụ chiên giòn', 'Trứng & Đậu phụ', 190, 11, 5, 14, 100, '3-4 miếng'),
    f('dau_phu_kho', 'Braised Tofu', 'Đậu phụ kho', 'Trứng & Đậu phụ', 100, 8, 5, 5, 150, '3-4 miếng'),
    f('dau_hu_nuong', 'Grilled Tofu', 'Đậu hũ nướng mỡ hành', 'Trứng & Đậu phụ', 120, 9, 4, 7, 120, '2 miếng'),
    f('dau_ngu_vi', 'Five-Spice Tofu', 'Đậu hũ ngũ vị chiên', 'Trứng & Đậu phụ', 200, 12, 6, 14, 100, '2-3 miếng'),
    f('trung_long_dao', 'Sunny Side Egg', 'Trứng chần lòng đào', 'Trứng & Đậu phụ', 155, 12, 0.5, 11, 60, '1 quả'),
    f('trung_ga_nuong', 'Baked Egg', 'Trứng nướng', 'Trứng & Đậu phụ', 155, 13, 1, 11, 60, '1 quả'),

    // RAU & CỦ
    f('rau_muong', 'Water Spinach', 'Rau muống xào tỏi', 'Rau & Củ', 55, 3, 5, 2.5, 200, '1 chén'),
    f('bong_cai_xanh', 'Broccoli Steamed', 'Bông cải xanh hấp', 'Rau & Củ', 34, 2.8, 7, 0.4, 150, '1 chén'),
    f('bong_cai_trang', 'Cauliflower', 'Súp lơ trắng', 'Rau & Củ', 25, 1.9, 5, 0.3, 150, '1 chén'),
    f('cai_xanh', 'Bok Choy Stir-fry', 'Cải xanh xào', 'Rau & Củ', 45, 2, 5, 2, 200, '1 chén'),
    f('khoai_lang', 'Sweet Potato', 'Khoai lang luộc', 'Rau & Củ', 86, 1.6, 20, 0.1, 150, '1 củ'),
    f('khoai_tay', 'Potato Steamed', 'Khoai tây hấp', 'Rau & Củ', 77, 2, 17, 0.1, 150, '1 củ'),
    f('ngo_luoc', 'Corn Boiled', 'Bắp ngô luộc', 'Rau & Củ', 86, 3.3, 19, 1.4, 100, '1/2 bắp'),
    f('ca_tim', 'Eggplant Grilled', 'Cà tím nướng hấp', 'Rau & Củ', 35, 0.8, 8.7, 0.2, 150, '1 chén'),
    f('kho_qua', 'Bitter Melon', 'Khổ qua xào trứng', 'Rau & Củ', 65, 4, 4, 3.5, 200, '1 chén'),
    f('dau_que', 'Green Beans', 'Đậu que xào', 'Rau & Củ', 55, 2, 7, 2, 150, '1 chén'),
    f('ca_rot', 'Carrot', 'Cà rốt sống', 'Rau & Củ', 41, 0.9, 10, 0.2, 100, '1 củ'),
    f('cu_cai', 'Daikon Radish', 'Củ cải trắng luộc', 'Rau & Củ', 18, 0.6, 4.1, 0.1, 150, '1 chén'),
    f('dau_bap', 'Okra', 'Đậu bắp luộc', 'Rau & Củ', 33, 1.9, 7, 0.2, 150, '1 chén'),
    f('nam_huong', 'Shiitake Mushroom', 'Nấm hương xào', 'Rau & Củ', 34, 2.2, 6.8, 0.5, 100, '1 chén'),
    f('nam_rom', 'Straw Mushroom', 'Nấm rơm xào', 'Rau & Củ', 28, 3.5, 4.6, 0.4, 100, '1 chén'),
    f('gia', 'Bean Sprouts', 'Giá đỗ xào', 'Rau & Củ', 30, 3, 5.9, 0.2, 150, '1 chén'),
    f('dua_leo', 'Cucumber', 'Dưa leo tươi', 'Rau & Củ', 16, 0.7, 3.6, 0.1, 100, '1/2 quả'),
    f('cai_bap', 'Cabbage Stir-fry', 'Bắp cải xào', 'Rau & Củ', 35, 1.8, 5.8, 0.8, 200, '1 chén'),
    f('bau_luoc', 'Gourd Boiled', 'Bầu luộc', 'Rau & Củ', 14, 0.6, 2.7, 0.1, 150, '1 chén'),
    f('khoai_mon', 'Taro', 'Khoai môn luộc', 'Rau & Củ', 112, 1.5, 26, 0.2, 150, '1 chén'),
    f('su_hao', 'Kohlrabi', 'Su hào xào', 'Rau & Củ', 27, 1.7, 6.2, 0.1, 150, '1 chén'),
    f('bi_xanh', 'Zucchini', 'Bí xanh xào', 'Rau & Củ', 17, 1.2, 3.1, 0.3, 150, '1 chén'),
    f('rau_bina', 'Spinach', 'Rau bina salad', 'Rau & Củ', 23, 2.9, 3.6, 0.4, 100, '1 chén'),

    // CANH & SÚP
    f('canh_chua', 'Sour Fish Soup', 'Canh chua cá', 'Canh & Súp', 40, 3.5, 3.5, 1.2, 250, '1 chén'),
    f('canh_kho_qua', 'Bitter Melon Soup', 'Canh khổ qua nhồi thịt', 'Canh & Súp', 55, 4, 4, 2.5, 250, '1 chén'),
    f('canh_rong_bien', 'Seaweed Soup', 'Canh rong biển đậu hũ', 'Canh & Súp', 30, 2.5, 3, 0.8, 200, '1 chén'),
    f('canh_bau', 'Gourd Soup', 'Canh bầu nấu tôm', 'Canh & Súp', 35, 3, 3.5, 0.8, 200, '1 chén'),
    f('canh_bap_cai', 'Cabbage Soup', 'Canh bắp cải nấu thịt', 'Canh & Súp', 40, 3, 4, 1.2, 250, '1 chén'),
    f('sup_bi_do', 'Pumpkin Soup', 'Súp bí đỏ', 'Canh & Súp', 45, 1.5, 8, 1, 200, '1 chén'),
    f('canh_suon', 'Pork Rib Soup', 'Canh sườn củ quả', 'Canh & Súp', 80, 6, 6, 3, 250, '1 chén'),
    f('canh_mong_toi', 'Water Spinach Soup', 'Canh mồng tơi thịt', 'Canh & Súp', 35, 2.5, 4, 0.8, 200, '1 chén'),
    f('canh_dua_ga', 'Pineapple Chicken Soup', 'Canh dứa nấu gà', 'Canh & Súp', 55, 5, 4, 1.5, 250, '1 chén'),
    f('canh_thom_ca', 'Pineapple Fish Soup', 'Canh chua cá thơm', 'Canh & Súp', 45, 4, 4, 1, 250, '1 chén'),
    f('lau_thai', 'Thai Hotpot', 'Lẩu Thái hải sản', 'Canh & Súp', 55, 5, 5, 2, 300, '1 tô nhỏ'),
    f('lau_ga', 'Chicken Hotpot', 'Lẩu gà lá é', 'Canh & Súp', 60, 5, 5, 2, 300, '1 tô nhỏ'),
    f('canh_cu_cai', 'Radish Soup', 'Canh củ cải thịt', 'Canh & Súp', 38, 3, 4, 0.8, 250, '1 chén'),
    f('canh_cai', 'Cabbage Pork Soup', 'Canh cải thịt bằm', 'Canh & Súp', 38, 3, 4, 1, 250, '1 chén'),
    f('sup_tom', 'Shrimp Soup', 'Súp tôm bắp non', 'Canh & Súp', 50, 4, 5, 1, 200, '1 chén'),

    // BÁNH MÌ & CUỐN
    f('banh_mi_thit', 'Pork Banh Mi', 'Bánh mì thịt chả', 'Bánh mì & Cuốn', 250, 10, 30, 10, 150, '1 ổ'),
    f('banh_mi_ga', 'Chicken Banh Mi', 'Bánh mì gà', 'Bánh mì & Cuốn', 240, 12, 28, 9, 130, '1 ổ'),
    f('banh_mi_op_la', 'Egg Banh Mi', 'Bánh mì ốp la', 'Bánh mì & Cuốn', 220, 9, 30, 7, 130, '1 ổ'),
    f('banh_mi_thit_nuong', 'BBQ Pork Banh Mi', 'Bánh mì thịt nướng', 'Bánh mì & Cuốn', 255, 11, 31, 9, 150, '1 ổ'),
    f('banh_mi_xiu_mai', 'Meatball Banh Mi', 'Bánh mì xíu mại', 'Bánh mì & Cuốn', 270, 12, 30, 12, 150, '1 ổ'),
    f('goi_cuon_tom', 'Shrimp Fresh Roll', 'Gỏi cuốn tôm thịt', 'Bánh mì & Cuốn', 140, 6, 23, 2.5, 100, '2 cuốn'),
    f('goi_cuon_chay', 'Veggie Fresh Roll', 'Gỏi cuốn chay', 'Bánh mì & Cuốn', 100, 3, 20, 1.5, 90, '2 cuốn'),
    f('cha_gio', 'Fried Spring Roll', 'Chả giò rán', 'Bánh mì & Cuốn', 290, 7, 28, 16, 50, '2 cuốn'),
    f('pho_cuon_chay', 'Veggie Pho Roll', 'Phở cuốn chay', 'Bánh mì & Cuốn', 100, 3, 20, 1, 180, '4 cuốn'),
    f('banh_uot', 'Wet Rice Paper', 'Bánh ướt nhân tôm', 'Bánh mì & Cuốn', 120, 5, 22, 2, 150, '1 phần'),
    f('banh_mi_trang', 'Plain Baguette', 'Bánh mì trắng không nhân', 'Bánh mì & Cuốn', 275, 9, 55, 3, 50, '1/2 ổ nhỏ'),
    f('bap_cai_cuon', 'Cabbage Roll', 'Bắp cải cuốn thịt hấp', 'Bánh mì & Cuốn', 90, 6, 8, 2.5, 150, '3 cuốn'),

    // BÁNH & XÔI NGỌT
    f('banh_bao', 'Meat Bao', 'Bánh bao nhân thịt', 'Bánh & Xôi ngọt', 230, 8, 33, 7, 120, '1 cái'),
    f('banh_gio', 'Pyramid Dumpling', 'Bánh giò', 'Bánh & Xôi ngọt', 180, 6, 20, 9, 150, '1 cái'),
    f('banh_day', 'Glutinous Cake', 'Bánh dày nhân đậu', 'Bánh & Xôi ngọt', 210, 4, 44, 2.5, 80, '1 cái'),
    f('banh_it', 'Glutinous Dumpling', 'Bánh ít nhân thịt', 'Bánh & Xôi ngọt', 195, 5, 35, 5, 60, '1 cái'),
    f('banh_nam', 'Flat Rice Dumplings', 'Bánh nậm', 'Bánh & Xôi ngọt', 145, 4, 26, 3, 100, '1 cái'),
    f('banh_lot', 'Pandan Jelly Dessert', 'Bánh lọt nước cốt dừa', 'Bánh & Xôi ngọt', 185, 1.5, 38, 4, 200, '1 ly'),
    f('che_ba_mau', 'Three Color Dessert', 'Chè ba màu', 'Bánh & Xôi ngọt', 180, 3, 38, 3, 200, '1 ly'),
    f('che_dau_xanh', 'Mung Bean Dessert', 'Chè đậu xanh', 'Bánh & Xôi ngọt', 155, 5, 30, 2.5, 200, '1 ly'),
    f('che_bap', 'Corn Dessert', 'Chè bắp', 'Bánh & Xôi ngọt', 150, 2.5, 32, 3, 200, '1 ly'),
    f('banh_chuoi', 'Banana Cake', 'Bánh chuối nướng', 'Bánh & Xôi ngọt', 260, 3, 45, 8, 100, '1 miếng'),
    f('yogurt', 'Yogurt Plain', 'Sữa chua không đường', 'Bánh & Xôi ngọt', 60, 4, 5, 2, 100, '1 hũ'),
    f('yogurt_nguyen', 'Greek Yogurt', 'Sữa chua Hy Lạp', 'Bánh & Xôi ngọt', 100, 10, 4, 4, 100, '1 hũ'),
    f('banh_gao_nuong', 'Rice Cracker', 'Bánh gạo nướng giòn', 'Bánh & Xôi ngọt', 380, 7, 80, 3, 30, '3 cái'),
    f('hat_dieu', 'Cashew Nuts', 'Hạt điều rang', 'Bánh & Xôi ngọt', 553, 18, 30, 44, 30, '1 nắm nhỏ'),
    f('hat_lac', 'Peanuts Roasted', 'Lạc rang', 'Bánh & Xôi ngọt', 567, 26, 16, 49, 30, '1 nắm nhỏ'),
    f('khoai_chien', 'French Fries', 'Khoai tây chiên', 'Bánh & Xôi ngọt', 312, 3.4, 41, 15, 100, '1 phần nhỏ'),

    // TRÁI CÂY
    f('chuoi', 'Banana', 'Chuối tiêu', 'Trái cây', 89, 1.1, 23, 0.3, 120, '1 quả'),
    f('tao', 'Apple', 'Táo đỏ', 'Trái cây', 52, 0.3, 14, 0.2, 150, '1 quả'),
    f('cam', 'Orange', 'Cam tươi', 'Trái cây', 47, 0.9, 12, 0.1, 130, '1 quả'),
    f('buoi', 'Pomelo', 'Bưởi tươi', 'Trái cây', 38, 0.8, 10, 0.1, 150, '1/4 quả'),
    f('xoai', 'Mango', 'Xoài chín', 'Trái cây', 60, 0.8, 15, 0.4, 200, '1/2 quả'),
    f('du_du', 'Papaya', 'Đu đủ chín', 'Trái cây', 43, 0.5, 11, 0.3, 200, '1 khúc'),
    f('tham', 'Strawberry', 'Dâu tây tươi', 'Trái cây', 32, 0.7, 7.7, 0.3, 100, '1 phần'),
    f('thanh_long_trang', 'Dragon Fruit White', 'Thanh long ruột trắng', 'Trái cây', 60, 1.2, 13, 0.4, 200, '1/2 quả'),
    f('thanh_long_do', 'Dragon Fruit Red', 'Thanh long ruột đỏ', 'Trái cây', 62, 1.2, 13, 0.6, 200, '1/2 quả'),
    f('nho', 'Grapes', 'Nho tươi', 'Trái cây', 67, 0.6, 17, 0.4, 100, '1 chùm nhỏ'),
    f('kiwi', 'Kiwi', 'Kiwi', 'Trái cây', 61, 1.1, 15, 0.5, 100, '1 quả'),
    f('dua_hau', 'Watermelon', 'Dưa hấu', 'Trái cây', 30, 0.6, 7.5, 0.2, 300, '1 khúc'),
    f('dua_gang', 'Cantaloupe', 'Dưa gang lưới', 'Trái cây', 34, 0.8, 8.2, 0.2, 200, '1 khúc'),
    f('chom_chom', 'Rambutan', 'Chôm chôm', 'Trái cây', 68, 0.9, 16, 0.2, 60, '3-4 quả'),
    f('vai', 'Lychee', 'Vải thiều', 'Trái cây', 66, 0.8, 17, 0.4, 70, '5-6 quả'),
    f('nhan', 'Longan', 'Nhãn', 'Trái cây', 60, 1.3, 15, 0.1, 70, '6-8 quả'),
    f('mang_cut', 'Mangosteen', 'Măng cụt', 'Trái cây', 73, 0.4, 18, 0.6, 100, '2-3 quả'),
    f('sau_rieng', 'Durian', 'Sầu riêng', 'Trái cây', 147, 1.5, 27, 5.3, 100, '1-2 múi nhỏ'),
    f('mit', 'Jackfruit', 'Mít chín', 'Trái cây', 94, 1.7, 24, 0.6, 100, '2-3 múi'),
    f('bo_trai', 'Avocado', 'Bơ trái', 'Trái cây', 160, 2, 8.5, 15, 100, '1/2 quả'),
    f('le', 'Pear', 'Lê tươi', 'Trái cây', 57, 0.4, 15, 0.1, 150, '1 quả nhỏ'),
    f('khe', 'Star Fruit', 'Khế chua ngọt', 'Trái cây', 31, 1, 6.7, 0.3, 100, '1 quả'),
    f('oi', 'Guava', 'Ổi tươi', 'Trái cây', 68, 2.6, 14, 1, 100, '1 quả'),
    f('hong_trai', 'Persimmon', 'Hồng tươi', 'Trái cây', 81, 0.6, 18, 0.4, 100, '1/2 quả'),

    // ĐỒ UỐNG
    f('cafe_sua_da', 'Iced Milk Coffee', 'Cà phê sữa đá', 'Đồ uống', 110, 2, 18, 3.5, 150, '1 ly'),
    f('cafe_den_da', 'Iced Black Coffee', 'Cà phê đen đá ít đường', 'Đồ uống', 10, 0.2, 2, 0, 150, '1 ly'),
    f('tra_sua', 'Boba Milk Tea', 'Trà sữa trân châu 50% đường', 'Đồ uống', 72, 0.5, 13, 2.5, 500, '1 ly M'),
    f('tra_dao', 'Peach Tea', 'Trà đào cam sả', 'Đồ uống', 40, 0, 10, 0, 400, '1 ly'),
    f('nuoc_cam', 'Orange Juice', 'Nước cam ép tươi', 'Đồ uống', 45, 0.7, 10.4, 0.2, 250, '1 ly'),
    f('nuoc_dua', 'Coconut Water', 'Nước dừa tươi', 'Đồ uống', 19, 0.7, 3.7, 0.2, 250, '1 trái'),
    f('tra_da_khong', 'Unsweetened Iced Tea', 'Trà đá không đường', 'Đồ uống', 0, 0, 0, 0, 300, '1 ly'),
    f('sinh_to_chuoi', 'Banana Smoothie', 'Sinh tố chuối', 'Đồ uống', 95, 2, 20, 2, 300, '1 ly'),
    f('nuoc_khoang', 'Water', 'Nước khoáng lọc', 'Đồ uống', 0, 0, 0, 0, 500, '1 chai'),
    f('sua_tuoi', 'Fresh Milk', 'Sữa tươi không đường', 'Đồ uống', 61, 3.2, 4.8, 3.3, 200, '1 hộp'),
    f('bac_xiu', 'White Iced Coffee', 'Bạc xỉu đá', 'Đồ uống', 90, 2.5, 14, 2.5, 200, '1 ly'),
    f('sinh_to_bo', 'Avocado Smoothie', 'Sinh tố bơ sữa', 'Đồ uống', 145, 2, 12, 10, 300, '1 ly'),
    f('tra_xanh_da', 'Green Tea Latte', 'Trà xanh đá latte', 'Đồ uống', 80, 2, 15, 2, 350, '1 ly'),
    f('nuoc_hoa_cuc', 'Chrysanthemum Tea', 'Nước hoa cúc đường phèn', 'Đồ uống', 25, 0, 6, 0, 300, '1 ly'),
    f('nuoc_mia', 'Sugarcane Juice', 'Nước mía tươi', 'Đồ uống', 55, 0.2, 14, 0, 300, '1 ly'),

    // ĐỒ ĂN NHANH
    f('com_hop', 'Office Box Rice', 'Cơm hộp văn phòng', 'Đồ ăn nhanh', 165, 10, 22, 5, 350, '1 hộp'),
    f('burger', 'Chicken Burger', 'Burger gà không khoai chiên', 'Đồ ăn nhanh', 295, 17, 32, 11, 200, '1 cái'),
    f('pizza_slice', 'Pizza Slice', 'Pizza 1 miếng phô mai thịt', 'Đồ ăn nhanh', 266, 11, 33, 10, 100, '1 miếng'),
    f('mi_goi', 'Instant Cup Noodle', 'Mì gói nấu nước 1 gói', 'Đồ ăn nhanh', 385, 8.5, 54, 15, 350, '1 tô'),
    f('salad_ga', 'Chicken Salad', 'Salad gà rau xanh', 'Đồ ăn nhanh', 90, 8, 8, 2.5, 200, '1 đĩa'),
    f('sushi_ca_hoi', 'Salmon Sushi', 'Sushi cá hồi 2 miếng', 'Đồ ăn nhanh', 160, 8, 25, 3.5, 100, '2 miếng'),
    f('onigiri', 'Onigiri Rice Ball', 'Cơm nắm onigiri', 'Đồ ăn nhanh', 160, 5, 30, 2.5, 120, '1 cái'),
    f('pho_cuon_vp', 'Pho Roll', 'Phở cuốn thịt bò văn phòng', 'Đồ ăn nhanh', 130, 7, 18, 3, 200, '4-5 cuốn'),
    f('sandwich_ga', 'Chicken Sandwich', 'Bánh mì sandwich gà', 'Đồ ăn nhanh', 210, 13, 27, 6, 150, '1 cái'),
    f('banh_bao_nhan', 'Steamed Bun', 'Bánh bao nhân thập cẩm', 'Đồ ăn nhanh', 235, 9, 33, 8, 120, '1 cái'),

    // GYM & MEAL PREP
    f('uc_ga_gym', 'Gym Chicken Breast', 'Ức gà nướng meal prep', 'Gym & Meal Prep', 165, 31, 0, 3.6, 150, '150g'),
    f('gao_lut_gym', 'Brown Rice Gym', 'Cơm gạo lứt gym', 'Gym & Meal Prep', 111, 2.6, 23, 0.9, 200, '1 chén'),
    f('khoai_lang_gym', 'Sweet Potato Gym', 'Khoai lang luộc gym', 'Gym & Meal Prep', 86, 1.6, 20, 0.1, 200, '1 củ'),
    f('trung_luoc_gym', 'Boiled Eggs Gym', 'Trứng luộc gym 2 quả', 'Gym & Meal Prep', 155, 13, 1.1, 11, 120, '2 quả'),
    f('ca_hoi_gym', 'Salmon Gym', 'Cá hồi áp chảo gym', 'Gym & Meal Prep', 208, 20, 0, 14, 150, '1 miếng'),
    f('bo_bam_gym', 'Lean Ground Beef', 'Bò bằm nạc 95% gym', 'Gym & Meal Prep', 137, 21, 0, 5.5, 150, '1 phần'),
    f('bong_cai_gym', 'Steamed Broccoli Gym', 'Bông cải xanh hấp gym', 'Gym & Meal Prep', 34, 2.8, 7, 0.4, 150, '1 chén'),
    f('oat_gym', 'Oats', 'Yến mạch oats', 'Gym & Meal Prep', 379, 13, 67, 7, 50, '1/2 chén'),
    f('whey_gym', 'Whey Protein', 'Whey Protein 1 scoop', 'Gym & Meal Prep', 400, 80, 8, 4, 30, '1 scoop'),
    f('sua_hanh_nhan', 'Almond Milk', 'Sữa hạnh nhân không đường', 'Gym & Meal Prep', 15, 0.5, 0.3, 1.2, 240, '1 ly'),
    f('bo_qua_gym', 'Avocado Gym', 'Bơ trái meal prep', 'Gym & Meal Prep', 160, 2, 8.5, 15, 100, '1/2 quả'),
    f('tom_gym', 'Boiled Shrimp Gym', 'Tôm hấp luộc gym', 'Gym & Meal Prep', 99, 20, 0.9, 1.1, 150, '1 phần'),
    f('ca_ngu_dong_hop', 'Canned Tuna', 'Cá ngừ đóng hộp nước', 'Gym & Meal Prep', 132, 29, 0, 1, 100, '1 hộp nhỏ'),
    f('hat_chia', 'Chia Seeds', 'Hạt chia', 'Gym & Meal Prep', 486, 17, 42, 31, 15, '1 thìa canh'),
    f('protein_bar', 'Protein Bar', 'Thanh protein bar', 'Gym & Meal Prep', 380, 30, 40, 9, 50, '1 thanh'),

    // ĐẶC SẢN MIỀN BẮC
    f('bun_cha_hn', 'Bun Cha Hanoi', 'Bún chả Hà Nội', 'Đặc sản Miền Bắc', 145, 10, 16, 5, 350, '1 phần'),
    f('cha_ca_la_vong', 'Cha Ca La Vong', 'Chả cá Lã Vọng', 'Đặc sản Miền Bắc', 220, 18, 5, 14, 200, '1 phần'),
    f('banh_cuon', 'Steamed Rice Roll', 'Bánh cuốn nhân thịt', 'Đặc sản Miền Bắc', 140, 7, 20, 4, 200, '1 phần'),
    f('xoi_xeo_hn', 'Xoi Xeo Hanoi', 'Xôi xéo Hà Nội', 'Đặc sản Miền Bắc', 240, 5, 42, 6, 200, '1 gói'),
    f('pho_bo_hn', 'Hanoi Beef Pho', 'Phở bò Hà Nội', 'Đặc sản Miền Bắc', 93, 5.6, 10.4, 3, 500, '1 tô'),
    f('bun_thang', 'Hanoi Bun Thang', 'Bún thang Hà Nội', 'Đặc sản Miền Bắc', 88, 6, 11, 2.5, 400, '1 tô'),
    f('nom_bo_kho', 'Beef Papaya Salad', 'Nộm bò khô đu đủ', 'Đặc sản Miền Bắc', 120, 8, 12, 4, 150, '1 đĩa'),
    f('mien_luon_nb', 'Eel Glass Noodle NB', 'Miến lươn Nghệ An', 'Đặc sản Miền Bắc', 100, 7, 14, 2, 350, '1 tô'),
    f('bun_rieu_hn', 'Hanoi Bun Rieu', 'Bún riêu cua Hà Nội', 'Đặc sản Miền Bắc', 95, 6.5, 12, 2.5, 450, '1 tô'),
    f('gio_thu', 'Head Cheese', 'Giò thủ (giò xào)', 'Đặc sản Miền Bắc', 290, 18, 3, 22, 80, '2 lát'),
    f('banh_da_cua_hp', 'HP Crab Noodle', 'Bánh đa cua Hải Phòng', 'Đặc sản Miền Bắc', 115, 6, 15, 3.5, 400, '1 tô'),
    f('oc_luoc', 'Boiled Snails', 'Ốc luộc', 'Đặc sản Miền Bắc', 89, 16, 3, 1.5, 150, '1 đĩa nhỏ'),
    f('nem_ran', 'Fried Spring Roll NB', 'Nem rán Hà Nội', 'Đặc sản Miền Bắc', 290, 7, 28, 16, 50, '2 chiếc'),

    // ĐẶC SẢN MIỀN TRUNG
    f('bun_bo_hue_mt', 'Hue Beef Noodle', 'Bún bò Huế', 'Đặc sản Miền Trung', 105, 7, 12, 3, 450, '1 tô'),
    f('mi_quang_mt', 'Quang Noodle', 'Mì Quảng', 'Đặc sản Miền Trung', 135, 6, 17, 4.5, 400, '1 tô'),
    f('banh_beo', 'Hue Water Fern Cake', 'Bánh bèo chén Huế', 'Đặc sản Miền Trung', 155, 4, 28, 3.5, 150, '6-8 chén'),
    f('cao_lau_mt', 'Cao Lau Hoi An', 'Cao lầu Hội An', 'Đặc sản Miền Trung', 145, 7, 20, 4, 350, '1 đĩa'),
    f('banh_xeo_mt', 'Hue Crispy Pancake', 'Bánh xèo miền Trung', 'Đặc sản Miền Trung', 200, 8, 22, 10, 200, '1 cái'),
    f('nem_lui_ht', 'Hue Lemongrass Pork', 'Nem lui Huế', 'Đặc sản Miền Trung', 220, 14, 10, 14, 120, '3-4 que'),
    f('bun_ca_da_nang', 'Danang Fish Noodle', 'Bún cá Đà Nẵng', 'Đặc sản Miền Trung', 95, 7, 12, 2.5, 400, '1 tô'),
    f('com_am_phu', 'Underworld Rice Hue', 'Cơm âm phủ Huế', 'Đặc sản Miền Trung', 185, 10, 22, 7, 350, '1 đĩa'),
    f('banh_nam_mt', 'Hue Flat Dumpling', 'Bánh nậm Huế', 'Đặc sản Miền Trung', 145, 4, 26, 3, 100, '1 cái'),
    f('cha_hue', 'Hue Pork Roll', 'Chả Huế', 'Đặc sản Miền Trung', 215, 15, 3, 16, 60, '2 lát'),
    f('banh_trang_nuong', 'Grilled Rice Paper', 'Bánh tráng nướng', 'Đặc sản Miền Trung', 340, 8, 65, 5, 50, '1 cái nhỏ'),

    // ĐẶC SẢN MIỀN NAM
    f('hu_tieu_nam_vang', 'Nam Vang Noodle', 'Hủ tiếu Nam Vang', 'Đặc sản Miền Nam', 120, 5, 16, 4, 400, '1 tô'),
    f('bun_mam_mn', 'Fish Paste Noodle', 'Bún mắm miền Nam', 'Đặc sản Miền Nam', 115, 7, 14, 3.5, 450, '1 tô'),
    f('banh_xeo_mn', 'Southern Crispy Pancake', 'Bánh xèo miền Nam', 'Đặc sản Miền Nam', 210, 9, 24, 9, 250, '1 cái'),
    f('goi_cuon_mn', 'Southern Fresh Roll', 'Gỏi cuốn miền Nam', 'Đặc sản Miền Nam', 140, 6, 23, 2.5, 100, '2 cuốn'),
    f('com_tam_mn', 'Broken Rice Saigon', 'Cơm tấm Sài Gòn', 'Đặc sản Miền Nam', 200, 8.8, 22, 10.5, 400, '1 đĩa'),
    f('bun_thit_nuong_mn', 'Grilled Pork Noodle SG', 'Bún thịt nướng Sài Gòn', 'Đặc sản Miền Nam', 155, 7, 20, 5, 300, '1 phần'),
    f('lau_mam', 'Fermented Fish Hotpot', 'Lẩu mắm Nam Bộ', 'Đặc sản Miền Nam', 75, 6, 6, 3, 300, '1 tô nhỏ'),
    f('che_ba_mau_mn', 'Three Color Dessert SG', 'Chè ba màu Sài Gòn', 'Đặc sản Miền Nam', 180, 3, 38, 3, 200, '1 ly'),
    f('bot_chien', 'Fried Rice Cake', 'Bột chiên', 'Đặc sản Miền Nam', 250, 7, 32, 10, 200, '1 đĩa nhỏ'),
    f('banh_canh_cua_mn', 'Crab Thick Noodle MN', 'Bánh canh cua miền Nam', 'Đặc sản Miền Nam', 120, 7, 16, 3.5, 400, '1 tô'),
    f('bun_nuoc_leo', 'Khmer Fish Noodle', 'Bún nước lèo Sóc Trăng', 'Đặc sản Miền Nam', 100, 6, 14, 2.5, 400, '1 tô'),
    f('canh_chua_mn', 'Southern Sour Soup', 'Canh chua miền Nam', 'Đặc sản Miền Nam', 45, 4, 4, 1.2, 300, '1 tô'),
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
