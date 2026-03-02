import { BookOpen, Calculator, Dumbbell, Flame, Target, Activity } from 'lucide-react';

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
                    <h3 className="font-bold">3. Tỉ lệ Macros Tối ưu</h3>
                </div>
                <div className="text-sm text-[#aaa] space-y-3 leading-relaxed">
                    <p>CUT LEAN sử dụng thuật toán tính Macro xoay quanh <span className="text-white font-bold">Body Fat %</span> để tối ưu hóa việc giữ cơ bắp khi giảm mỡ.</p>

                    <div className="space-y-3">
                        <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                            <h4 className="font-bold text-white flex items-center gap-1.5 mb-1"><Dumbbell size={14} className="text-[#00ff88]" /> Protein (Đạm)</h4>
                            <p className="text-[11px] text-[#888] mb-2">Protein là yếu tố then chốt để xây dựng và bảo vệ cơ bắp.</p>
                            <ul className="text-xs space-y-1">
                                <li>Body Fat <span className="text-[#00ff88]">{'< 15%'}</span>: <span className="text-white font-bold">2.0g</span> / kg thể trọng</li>
                                <li>Body Fat <span className="text-[#ff4444]">{'≥ 15%'}</span>: <span className="text-white font-bold">1.7g</span> / kg thể trọng</li>
                            </ul>
                        </div>

                        <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                            <h4 className="font-bold text-white flex items-center gap-1.5 mb-1"><span className="w-3 h-3 rounded-full bg-[#ffb800] block" /> Fat (Béo)</h4>
                            <p className="text-[11px] text-[#888] mb-1">Duy trì hormone và chức năng sinh lý cơ bản.</p>
                            <div className="text-xs">
                                <span>Tiêu chuẩn: </span> <span className="text-white font-bold">0.6g</span> / kg thể trọng
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                            <h4 className="font-bold text-white flex items-center gap-1.5 mb-1"><span className="w-3 h-3 rounded-full bg-[#00e5ff] block" /> Carbs (Tinh bột)</h4>
                            <p className="text-[11px] text-[#888] mb-1">Nguồn năng lượng cho não bộ và hoạt động cường độ cao.</p>
                            <div className="text-xs text-[#aaa]">
                                Tính bằng lượng Calo còn lại: <br />
                                <code className="text-[#00ff88] text-[10px]">(Total Calo - [Protein*4] - [Fat*9]) / 4</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Progress Analyzers */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#ff4444]">
                    <Activity size={18} />
                    <h3 className="font-bold">4. Phân tích Tiến độ (Analyzers)</h3>
                </div>
                <div className="text-sm text-[#aaa] space-y-3 leading-relaxed">
                    <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                        <h4 className="font-bold text-white text-xs mb-1">Cảnh báo Mất cơ (Muscle Loss)</h4>
                        <p className="text-[11px] text-[#888]">
                            Hệ thống giám sát khối lượng cơ trong cửa sổ <span className="text-white">14 ngày</span>. Nếu chỉ số cơ giảm <span className="text-[#ff4444] font-bold">{'>'} 0.5kg</span>, app sẽ kích hoạt cảnh báo đỏ và đưa ra khuyến nghị tăng Protein.
                        </p>
                    </div>

                    <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                        <h4 className="font-bold text-white text-xs mb-1">Dự báo Ngày Cán đích</h4>
                        <p className="text-[11px] text-[#888]">
                            Dựa trên thâm hụt Calo thực tế hằng ngày. <br />
                            <span className="text-white">Thuật toán: </span> <code className="text-[#00ff88] text-[10px]">1kg mỡ ≈ 7,700 kcal thâm hụt</code>.
                        </p>
                    </div>

                    <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                        <h4 className="font-bold text-white text-xs mb-1">Rủi ro Thâm hụt (Deficit Risk)</h4>
                        <ul className="text-[11px] text-[#888] space-y-1">
                            <li><span className="text-amber-500 font-bold">{'>'} 500 kcal</span>: Thâm hụt mạnh (Cần nạp đủ đạm).</li>
                            <li><span className="text-red-500 font-bold">{'>'} 800 kcal</span>: Rủi ro cao (Dễ mất cơ, hạ chuyển hóa).</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 5: Gamification */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#ffb800]">
                    <Flame size={18} />
                    <h3 className="font-bold">5. Hệ thống Cấp độ & Chuỗi (Streaks)</h3>
                </div>
                <div className="text-sm text-[#aaa] space-y-3 leading-relaxed">
                    <p>Khích lệ kỷ luật bằng hệ thống cấp độ dựa trên sự kiên trì:</p>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#1a1a1a] p-2 rounded-lg border border-[#333] text-center">
                            <span className="text-[10px] text-[#666] block">Mới bắt đầu</span>
                            <span className="text-white font-bold text-xs">Lv.1</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-2 rounded-lg border border-[#333] text-center">
                            <span className="text-[10px] text-[#00ff88] block">Cutting Mode</span>
                            <span className="text-white font-bold text-xs">7+ ngày</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-2 rounded-lg border border-[#333] text-center">
                            <span className="text-[10px] text-[#00e5ff] block">Machine</span>
                            <span className="text-white font-bold text-xs">30+ ngày</span>
                        </div>
                    </div>
                    <p className="text-[11px] italic text-[#888]">
                        * Chuỗi (Streak) sẽ tăng lên nếu bạn nhập nhật ký ăn uống ({'>'}0 calo) trước khi hết ngày.
                    </p>
                </div>
            </div>

            {/* Section 6: Fitness Score */}
            <div className="bg-[#111] border border-[#222] rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#b589ff]">
                    <Target size={18} />
                    <h3 className="font-bold">6. Điểm Thể Hình (Fitness Score)</h3>
                </div>
                <div className="text-sm text-[#aaa] space-y-3 leading-relaxed">
                    <p>Hệ thống chấm điểm 100 dựa trên các chỉ số thành phần cơ thể:</p>
                    <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333] space-y-2 text-[11px]">
                        <div className="flex justify-between"><span>Body Fat (Chuẩn 10-15%)</span> <span className="text-white">40%</span></div>
                        <div className="flex justify-between"><span>Khối lượng cơ (SMM/Weight)</span> <span className="text-white">30%</span></div>
                        <div className="flex justify-between"><span>Mỡ nội tạng (Chuẩn level 1-5)</span> <span className="text-white">20%</span></div>
                        <div className="flex justify-between"><span>BMI (Chuẩn 18.5-24)</span> <span className="text-white">10%</span></div>
                    </div>
                </div>
            </div>

        </div>
    );
}
