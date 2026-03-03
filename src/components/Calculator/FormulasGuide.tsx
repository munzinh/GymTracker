import { BookOpen, Calculator, Flame, Activity, Zap } from 'lucide-react';

export function FormulasGuide() {
    return (
        <div className="space-y-4 fade-in pb-10">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-[#00e5ff]" size={20} />
                <h2 className="text-lg font-bold text-white">Công thức & Khoa học</h2>
            </div>

            <p className="text-sm text-[#888] mb-6 leading-relaxed">
                CUT LEAN sử dụng các công thức tính toán lượng calo và Macro chuẩn khoa học, được tối ưu riêng theo lượng mỡ cơ thể (Body Fat %) của bạn.
            </p>

            {/* 0. Thuật ngữ & Ký hiệu */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-[#00e5ff]">
                    <Activity size={18} />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Từ điển & Chỉ số</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5">
                        <span className="text-[#00ff88] text-[9px] font-black uppercase block mb-1">BMR</span>
                        <p className="text-[10px] text-[#888]">Năng lượng tối thiểu để duy trì sự sống khi nghỉ ngơi.</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5">
                        <span className="text-[#00ff88] text-[9px] font-black uppercase block mb-1">TDEE</span>
                        <p className="text-[10px] text-[#888]">Tổng calo tiêu thụ thực tế hàng ngày (BMR x Vận động).</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5">
                        <span className="text-[#ffb800] text-[9px] font-black uppercase block mb-1">SMM</span>
                        <p className="text-[10px] text-[#888]">Khối lượng cơ xương (Kg) - Càng cao càng đốt mỡ nhanh.</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5">
                        <span className="text-[#ffb800] text-[9px] font-black uppercase block mb-1">BFM</span>
                        <p className="text-[10px] text-[#888]">Khối lượng mỡ cơ thể tính bằng kg.</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5">
                        <span className="text-[#ff4444] text-[9px] font-black uppercase block mb-1">Mỡ nội tạng</span>
                        <p className="text-[10px] text-[#888]">Mỡ bao quanh cơ quan nội tạng. Chuẩn an toàn: Lvl 1-9.</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5">
                        <span className="text-white text-[9px] font-black uppercase block mb-1">LBM</span>
                        <p className="text-[10px] text-[#888]">Khối lượng nạc (Cân nặng - Khối lượng mỡ).</p>
                    </div>
                </div>
            </div>

            {/* Section 1: TDEE */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#00ff88]">
                    <Flame size={18} />
                    <h3 className="font-bold">1. Công thức TDEE (Mifflin-St Jeor)</h3>
                </div>
                <div className="text-sm text-[#aaa] space-y-3 leading-relaxed">
                    <p>Hệ thống tính BMR sau đó nhân với hệ số hoạt động (PAL):</p>
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5 font-mono text-[10px] leading-6">
                        <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
                            <span className="text-[#666]">Nam</span>
                            <span className="text-white">10×W + 6.25×H - 5×A + 5</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#666]">Nữ</span>
                            <span className="text-white">10×W + 6.25×H - 5×A - 161</span>
                        </div>
                    </div>
                    <p className="text-[10px] italic text-[#666]">* W: Cân nặng, H: Chiều cao, A: Tuổi</p>
                </div>
            </div>

            {/* Section 2: Macros BF% logic */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-[#00e5ff]">
                    <Calculator size={18} />
                    <h3 className="font-bold">2. Thuật toán Macro (Body Fat %)</h3>
                </div>
                <div className="text-sm text-[#aaa] space-y-4 leading-relaxed">
                    <p>Hệ thống tối ưu lượng Đạm (Protein) dựa trên % mỡ cơ thể:</p>

                    <div className="space-y-3">
                        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
                            <h4 className="font-bold text-white text-xs mb-3">Protein (Đạm)</h4>
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="p-2 bg-black/20 rounded-xl border border-white/5">
                                    <span className="text-[9px] text-[#666] block uppercase">BF {'<'} 15%</span>
                                    <span className="text-[#00ff88] font-black text-sm">2.0g/kg</span>
                                </div>
                                <div className="p-2 bg-black/20 rounded-xl border border-white/5">
                                    <span className="text-[9px] text-[#666] block uppercase">BF ≥ 15%</span>
                                    <span className="text-white font-black text-sm">1.6g/kg</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                            <h4 className="font-bold text-white text-xs">Fat (Chất béo)</h4>
                            <span className="text-white font-black text-sm">0.6g/kg</span>
                        </div>

                        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
                            <h4 className="font-bold text-white text-xs mb-2">Carbs (Tinh bột)</h4>
                            <div className="bg-black/20 p-2 rounded-xl text-center font-mono text-[9px] text-[#00e5ff]">
                                (Lượng Calo còn lại) / 4
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Fitness Score */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#b589ff]">
                    <Activity size={18} />
                    <h3 className="font-bold">3. Điểm Thể Hình (Trọng số 100)</h3>
                </div>
                <div className="text-sm text-[#aaa] space-y-2 leading-relaxed">
                    <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between p-2 bg-white/5 rounded-xl"><span>Body Fat % (10-15%)</span> <span className="text-[#00ff88] font-black">40đ</span></div>
                        <div className="flex justify-between p-2 bg-white/5 rounded-xl"><span>Tỉ lệ Cơ SMM (45%)</span> <span className="text-[#00ff88] font-black">30đ</span></div>
                        <div className="flex justify-between p-2 bg-white/5 rounded-xl"><span>Mỡ nội tạng (Lvl 1-5)</span> <span className="text-[#00ff88] font-black">20đ</span></div>
                        <div className="flex justify-between p-2 bg-white/5 rounded-xl"><span>Chỉ số BMI (18.5-24)</span> <span className="text-[#00ff88] font-black">10đ</span></div>
                    </div>
                </div>
            </div>

            {/* Section 4: Analyzers */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-5 space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 text-[#ff4444]">
                    <Zap size={18} />
                    <h3 className="font-bold">4. Cảnh báo bảo vệ cơ bắp</h3>
                </div>
                <div className="space-y-3">
                    <div className="bg-[#1a1a1a] p-4 rounded-2xl border-l-4 border-l-[#ff4444] border-white/5">
                        <h4 className="text-[10px] font-black text-white uppercase mb-1">Phát hiện Mất cơ</h4>
                        <p className="text-[10px] text-[#888] leading-relaxed">Nếu SMM giảm {'>'} 0.5kg trong 14 ngày, app sẽ cảnh báo đỏ để bạn tăng Protein hoặc giảm thâm hụt.</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded-2xl border-l-4 border-l-[#00ff88] border-white/5">
                        <h4 className="text-[10px] font-black text-white uppercase mb-1">Dự báo Cán đích</h4>
                        <p className="text-[10px] text-[#888] leading-relaxed">Dựa trên thâm hụt thực tế: 7,700 kcal ≈ 1kg mỡ cơ thể.</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
