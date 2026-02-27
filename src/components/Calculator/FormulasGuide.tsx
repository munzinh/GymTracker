import { BookOpen, Calculator, Dumbbell, Flame, Target } from 'lucide-react';

export function FormulasGuide() {
    return (
        <div className="space-y-4 fade-in pb-10">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-[#00e5ff]" size={20} />
                <h2 className="text-lg font-bold text-white">Công thức & Khoa học</h2>
            </div>

            <p className="text-sm text-[#888] leading-relaxed">
                CUT LEAN sử dụng các công thức tính toán lượng calo và Macro chuẩn khoa học, được tối ưu riêng theo lượng mỡ cơ thể (Body Fat %) của bạn.
            </p>

            {/* Section 1: TDEE */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#00ff88]">
                    <Flame size={18} />
                    <h3 className="font-bold">1. Tổng Năng Lượng Tiêu Hao (TDEE)</h3>
                </div>
                <div className="text-sm text-[#aaa] space-y-2 leading-relaxed">
                    <p>
                        TDEE (Total Daily Energy Expenditure) là tổng lượng calo bạn đốt cháy mỗi ngày. Hệ thống tính TDEE dựa trên chỉ số BMR (Năng lượng chuyển hoá cơ bản) nhân với hệ số vận động.
                    </p>
                    <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                        <span className="font-bold text-white block mb-1">Công thức Mifflin-St Jeor:</span>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                            <li><span className="text-[#666]">Nam:</span> <span className="text-white">(10 × kg) + (6.25 × cm) - (5 × tuổi) + 5</span></li>
                            <li><span className="text-[#666]">Nữ:</span> <span className="text-white">(10 × kg) + (6.25 × cm) - (5 × tuổi) - 161</span></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 2: Goals */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#ffb800]">
                    <Target size={18} />
                    <h3 className="font-bold">2. Mục tiêu Calo (Deficit / Surplus)</h3>
                </div>
                <div className="text-sm text-[#aaa] space-y-2 leading-relaxed">
                    <p>Sau khi có TDEE, lượng Calo nạp vào sẽ được điều chỉnh dựa theo mục tiêu của bạn:</p>
                    <ul className="space-y-2 mt-2">
                        <li className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded-lg border border-[#333]">
                            <span>Giảm mỡ (Cut)</span>
                            <span className="text-[#ff4444] font-bold">-20% TDEE</span>
                        </li>
                        <li className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded-lg border border-[#333]">
                            <span>Giữ cân (Maintain)</span>
                            <span className="text-[#888] font-bold">Giữ nguyên TDEE</span>
                        </li>
                        <li className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded-lg border border-[#333]">
                            <span>Tăng cơ (Bulk)</span>
                            <span className="text-[#00ff88] font-bold">+15% TDEE</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Section 3: Macros Split */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#00e5ff]">
                    <Calculator size={18} />
                    <h3 className="font-bold">3. Tỉ lệ Macros (Đạm, béo, tinh bột)</h3>
                </div>
                <div className="text-sm text-[#aaa] space-y-3 leading-relaxed">
                    <p>CUT LEAN sử dụng thuật toán tính Macro xoay quanh <span className="text-white font-bold">Body Fat % (Tỉ lệ mỡ)</span> để tối ưu hóa việc giữ cơ bắp khi giảm mỡ.</p>

                    <div className="space-y-3">
                        <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                            <h4 className="font-bold text-white flex items-center gap-1.5 mb-1"><Dumbbell size={14} className="text-[#00ff88]" /> Protein (Đạm)</h4>
                            <p className="text-xs text-[#888] mb-2">Protein giúp xây dựng và giữ cơ bắp.</p>
                            <ul className="text-xs space-y-1">
                                <li>Nếu Body Fat <span className="text-[#00ff88]">{'< 15%'}</span>: <span className="text-white font-bold">2.0g</span> / kg thể trọng</li>
                                <li>Nếu Body Fat <span className="text-[#ff4444]">{'≥ 15%'}</span>: <span className="text-white font-bold">1.7g</span> / kg thể trọng</li>
                            </ul>
                        </div>

                        <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                            <h4 className="font-bold text-white flex items-center gap-1.5 mb-1"><span className="w-3 h-3 rounded-full bg-[#ffb800] block" /> Fat (Béo)</h4>
                            <p className="text-xs text-[#888] mb-1">Chất béo rất quan trọng cho hormone và sinh lý.</p>
                            <div className="text-xs">
                                <span>Cố định: </span> <span className="text-white font-bold">0.6g</span> / kg thể trọng
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                            <h4 className="font-bold text-white flex items-center gap-1.5 mb-1"><span className="w-3 h-3 rounded-full bg-[#00e5ff] block" /> Carbs (Tinh bột)</h4>
                            <p className="text-xs text-[#888] mb-1">Nguồn năng lượng chính cho não và tập luyện.</p>
                            <div className="text-xs text-[#aaa]">
                                Được tính bằng số Calo còn lại sau khi đã trừ đi lượng Calo từ Protein (4 kcal/g) và Fat (9 kcal/g), chia cho 4.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
