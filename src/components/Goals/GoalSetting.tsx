import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
    getTargetWeight, getPredictedWeeks, getLeanMass, getCaloriesTarget, getProteinTarget, getFatTarget
} from '../../utils/calculations';
import { Target, Download, Trash2, AlertCircle } from 'lucide-react';
import { exportToCSV } from '../../utils/calculations';

export function GoalSetting() {
    const { data, updateGoals, resetData } = useApp();
    const { goals } = data;

    const [form, setForm] = useState({
        targetBodyFat: goals.targetBodyFat.toString(),
        deadlineWeeks: goals.deadlineWeeks.toString(),
        startWeight: goals.startWeight.toString(),
        startBodyFat: goals.startBodyFat.toString(),
        tdee: goals.tdee.toString(),
    });
    const [saved, setSaved] = useState(false);
    const [showReset, setShowReset] = useState(false);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateGoals({
            targetBodyFat: parseFloat(form.targetBodyFat),
            deadlineWeeks: parseInt(form.deadlineWeeks),
            startWeight: parseFloat(form.startWeight),
            startBodyFat: parseFloat(form.startBodyFat),
            tdee: parseInt(form.tdee),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // Calculations
    const targetW = getTargetWeight(goals.startWeight, goals.startBodyFat, goals.targetBodyFat);
    const predictedWeeks = getPredictedWeeks(goals.startWeight, targetW);
    const leanMass = getLeanMass(goals.startWeight, goals.startBodyFat);
    const calsTarget = getCaloriesTarget(goals.tdee);
    const proteinTarget = getProteinTarget(leanMass);
    const fatTarget = getFatTarget(goals.startWeight);

    const handleReset = () => {
        resetData();
        setShowReset(false);
    };

    return (
        <div className="space-y-4">
            {/* Goal form */}
            <div className="card fade-in">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Target size={18} className="text-[#00ff88]" />
                    Cài đặt mục tiêu
                </h3>
                <form onSubmit={handleSave} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[#888] text-xs mb-1 block">Cân nặng hiện tại (kg)</label>
                            <input type="number" step="0.1" value={form.startWeight}
                                onChange={e => set('startWeight', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[#888] text-xs mb-1 block">Body Fat hiện tại (%)</label>
                            <input type="number" step="0.1" value={form.startBodyFat}
                                onChange={e => set('startBodyFat', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[#888] text-xs mb-1 block">Mục tiêu Body Fat (%)</label>
                            <input type="number" step="0.1" value={form.targetBodyFat}
                                onChange={e => set('targetBodyFat', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[#888] text-xs mb-1 block">Thời hạn (tuần)</label>
                            <input type="number" min={1} value={form.deadlineWeeks}
                                onChange={e => set('deadlineWeeks', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[#888] text-xs mb-1 block">TDEE ước tính (kcal/ngày)</label>
                            <input type="number" value={form.tdee}
                                onChange={e => set('tdee', e.target.value)} />
                            <p className="text-[#444] text-[10px] mt-0.5">
                                Dùng công cụ tính TDEE online (Mifflin-St Jeor…)
                            </p>
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full">
                        {saved ? '✅ Đã lưu!' : 'Lưu mục tiêu'}
                    </button>
                </form>
            </div>

            {/* Predictions */}
            <div className="card fade-in">
                <h3 className="font-semibold text-white mb-4 text-sm">🎯 Dự đoán kết quả</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a2e22] rounded-xl p-3 text-center">
                        <p className="text-[#00ff88] text-xl font-bold">{targetW} kg</p>
                        <p className="text-[#888] text-xs mt-1">Cân nặng mục tiêu</p>
                        <p className="text-[#555] text-[10px]">{goals.targetBodyFat}% body fat</p>
                    </div>
                    <div className="bg-[#1e1e1e] rounded-xl p-3 text-center">
                        <p className="text-white text-xl font-bold">{predictedWeeks} tuần</p>
                        <p className="text-[#888] text-xs mt-1">Thời gian ước tính</p>
                        <p className="text-[#555] text-[10px]">Tốc độ −0.5 kg/tuần</p>
                    </div>
                    <div className="bg-[#1e1e1e] rounded-xl p-3 text-center">
                        <p className="text-white text-xl font-bold">{calsTarget} kcal</p>
                        <p className="text-[#888] text-xs mt-1">Calories mục tiêu/ngày</p>
                        <p className="text-[#555] text-[10px]">TDEE − 400</p>
                    </div>
                    <div className="bg-[#1e1e1e] rounded-xl p-3 text-center">
                        <p className="text-white text-xl font-bold">{proteinTarget}g</p>
                        <p className="text-[#888] text-xs mt-1">Protein mục tiêu/ngày</p>
                        <p className="text-[#555] text-[10px]">2.2g × cơ nạc</p>
                    </div>
                </div>
                <div className="mt-3 p-3 bg-[#1a1a1a] rounded-xl">
                    <div className="flex justify-between text-xs">
                        <span className="text-[#888]">Giảm cần có:</span>
                        <span className="text-white font-medium">{(goals.startWeight - targetW).toFixed(1)} kg fat</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1.5">
                        <span className="text-[#888]">Cơ nạc hiện tại:</span>
                        <span className="text-[#00ff88] font-medium">{leanMass.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1.5">
                        <span className="text-[#888]">Chất béo/ngày:</span>
                        <span className="text-white font-medium">{fatTarget}g</span>
                    </div>
                </div>
            </div>

            {/* Export & Reset */}
            <div className="card fade-in">
                <h3 className="font-semibold text-white mb-4 text-sm">📁 Quản lý dữ liệu</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => exportToCSV(data.dailyLogs)}
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                    >
                        <Download size={16} />
                        Xuất CSV nhật ký
                    </button>

                    {!showReset ? (
                        <button
                            onClick={() => setShowReset(true)}
                            className="btn-danger w-full flex items-center justify-center gap-2"
                        >
                            <Trash2 size={16} />
                            Xóa toàn bộ dữ liệu
                        </button>
                    ) : (
                        <div className="warn-red">
                            <div className="flex items-start gap-2 mb-3">
                                <AlertCircle size={16} className="text-[#ff4444] flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-[#ccc]">
                                    Bạn có chắc muốn xóa <strong>TẤT CẢ</strong> dữ liệu? Không thể hoàn tác!
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleReset} className="btn-danger flex-1 text-sm">
                                    Xác nhận xóa
                                </button>
                                <button onClick={() => setShowReset(false)} className="btn-secondary flex-1 text-sm">
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <p className="text-[#333] text-xs mt-3 text-center">
                    Dữ liệu lưu trên trình duyệt này (localStorage)
                </p>
            </div>
        </div>
    );
}
