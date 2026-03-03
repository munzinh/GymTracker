import { useState, useEffect } from 'react';
import { Scale, Activity, Flame, Ruler, Target, Heart, HeartPulse, Percent, Binary, Layers, Timer, Zap, Drumstick, Cookie, Droplet, User, Circle as CircleIcon, ArrowLeft } from 'lucide-react';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface SharedInputs {
    gender: Gender;
    age: string;
    weight: string; // kg
    height: string; // cm
    activity: ActivityLevel;
    waist: string; // cm
    neck: string; // cm
    hip: string; // cm
    dist: string; min: string; sec: string;
    met: string; workoutMins: string;
    wMax: string; rMax: string;
    scr: string; bust: string;
    vol: string; abv: string; hrs: string;
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.465,
    active: 1.55,
    very_active: 1.725
};

const calcBMR = (w: number, h: number, a: number, g: Gender) => {
    // Mifflin-St Jeor
    const base = 10 * w + 6.25 * h - 5 * a;
    return g === 'male' ? base + 5 : base - 161;
};

// ==========================================
// CALCULATOR DEFINITIONS
// ==========================================

const calculators = [
    {
        id: 'bmi', title: 'BMI Calculator', icon: Scale, color: '#00ff88',
        preview: (inputs: SharedInputs) => {
            const h = parseFloat(inputs.height) / 100;
            const w = parseFloat(inputs.weight);
            if (h > 0 && w > 0) return (w / (h * h)).toFixed(1);
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const h = parseFloat(inputs.height) / 100;
            const w = parseFloat(inputs.weight);
            const bmi = h > 0 && w > 0 ? w / (h * h) : 0;
            let status = '';
            let color = '';
            if (bmi > 0) {
                if (bmi < 18.5) { status = 'Thiếu cân'; color = '#60a5fa'; }
                else if (bmi < 25) { status = 'Bình thường'; color = '#00ff88'; }
                else if (bmi < 30) { status = 'Thừa cân'; color = '#ffb800'; }
                else { status = 'Béo phì'; color = '#ff4444'; }
            }

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['height', 'weight']} />
                    {bmi > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Chỉ số BMI của bạn</p>
                            <p className="text-[48px] font-black leading-none" style={{ color }}>{bmi.toFixed(1)}</p>
                            <div className="mt-3 px-4 py-1.5 rounded-full text-sm font-bold inline-block" style={{ backgroundColor: color + '20', color }}>
                                {status}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'calorie', title: 'Calorie Calculator', icon: Flame, color: '#ffb800',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const a = parseFloat(inputs.age);
            if (w && h && a) {
                return Math.round(calcBMR(w, h, a, inputs.gender) * ACTIVITY_MULTIPLIER[inputs.activity]) + ' kcal';
            }
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const a = parseFloat(inputs.age);
            const tdee = w && h && a ? calcBMR(w, h, a, inputs.gender) * ACTIVITY_MULTIPLIER[inputs.activity] : 0;

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'age', 'height', 'weight', 'activity']} />
                    {tdee > 0 && (
                        <div className="space-y-2">
                            <ResultRow label="Giữ cân (Maintain)" value={Math.round(tdee)} unit="kcal" color="#00ff88" />
                            <ResultRow label="Giảm cân nhẹ (-250g/tuần)" value={Math.round(tdee - 250)} unit="kcal" color="#00e5ff" />
                            <ResultRow label="Giảm cân nhanh (-500g/tuần)" value={Math.round(tdee - 500)} unit="kcal" color="#60a5fa" />
                            <ResultRow label="Tăng cân nhẹ (+250g/tuần)" value={Math.round(tdee + 250)} unit="kcal" color="#ffb800" />
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'bodyFat', title: 'Body Fat', icon: Percent, color: '#00e5ff',
        preview: (inputs: SharedInputs) => {
            const h = parseFloat(inputs.height);
            const w = parseFloat(inputs.waist);
            const n = parseFloat(inputs.neck);
            const hip = parseFloat(inputs.hip);
            let bf = 0;
            if (h && w && n) {
                if (inputs.gender === 'male') {
                    bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
                } else if (hip) {
                    bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hip - n) + 0.22100 * Math.log10(h)) - 450;
                }
            }
            return bf > 0 ? bf.toFixed(1) + '%' : null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            // US Navy Method
            const h = parseFloat(inputs.height);
            const w = parseFloat(inputs.waist);
            const n = parseFloat(inputs.neck);
            const hip = parseFloat(inputs.hip);
            let bf = 0;
            if (h && w && n) {
                if (inputs.gender === 'male') {
                    bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
                } else if (hip) {
                    bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hip - n) + 0.22100 * Math.log10(h)) - 450;
                }
            }

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'height', 'waist', 'neck']} />
                    {inputs.gender === 'female' && <SharedInputsForm inputs={inputs} update={update} fields={['hip']} />}
                    {bf > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Tỉ lệ mỡ cơ thể</p>
                            <p className="text-[48px] font-black leading-none text-[#00e5ff]">{bf.toFixed(1)}%</p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'bmr', title: 'BMR Calculator', icon: Activity, color: '#ff4444',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const a = parseFloat(inputs.age);
            if (w && h && a) return Math.round(calcBMR(w, h, a, inputs.gender)) + ' kcal';
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const a = parseFloat(inputs.age);
            const bmr = w && h && a ? calcBMR(w, h, a, inputs.gender) : 0;

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'age', 'height', 'weight']} />
                    {bmr > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">BMR (Calories cơ bản)</p>
                            <p className="text-[48px] font-black leading-none text-[#ff4444]">{Math.round(bmr)}</p>
                            <p className="text-xs text-[#555] mt-2">Năng lượng tiêu hao khi nghỉ ngơi hoàn toàn</p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'idealWeight', title: 'Ideal Weight', icon: Target, color: '#a78bfa',
        preview: (inputs: SharedInputs) => {
            const h = parseFloat(inputs.height);
            if (h > 152.4) {
                const inchesOver = (h - 152.4) / 2.54;
                return (inputs.gender === 'male' ? 50 + 2.3 * inchesOver : 45.5 + 2.3 * inchesOver).toFixed(1) + ' kg';
            }
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const h = parseFloat(inputs.height);
            let devine = 0;
            if (h > 152.4) {
                const inchesOver = (h - 152.4) / 2.54;
                devine = inputs.gender === 'male' ? 50 + 2.3 * inchesOver : 45.5 + 2.3 * inchesOver;
            }

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'height']} />
                    {devine > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Cân nặng lý tưởng (Devine)</p>
                            <p className="text-[48px] font-black leading-none text-[#a78bfa]">{devine.toFixed(1)} <span className="text-xl">kg</span></p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'pace', title: 'Pace Calculator', icon: Timer, color: '#00ff88',
        preview: (inputs: SharedInputs) => {
            const d = parseFloat(inputs.dist);
            const m = parseFloat(inputs.min) || 0;
            const s = parseFloat(inputs.sec) || 0;
            const totalMin = m + s / 60;
            if (d > 0 && totalMin > 0) {
                const paceMin = totalMin / d;
                const pMinStr = Math.floor(paceMin);
                const pSecStr = Math.round((paceMin - pMinStr) * 60).toString().padStart(2, '0');
                return `${pMinStr}:${pSecStr}/km`;
            }
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const d = parseFloat(inputs.dist);
            const m = parseFloat(inputs.min) || 0;
            const s = parseFloat(inputs.sec) || 0;
            const totalMin = m + s / 60;
            const paceMin = d > 0 ? totalMin / d : 0;
            const pMinStr = Math.floor(paceMin);
            const pSecStr = Math.round((paceMin - pMinStr) * 60).toString().padStart(2, '0');

            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Khoảng cách (km)</label>
                            <input type="number" className="app-input" value={inputs.dist} onChange={e => update('dist', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="input-label">Phút</label>
                                <input type="number" className="app-input" value={inputs.min} onChange={e => update('min', e.target.value)} />
                            </div>
                            <div>
                                <label className="input-label">Giây</label>
                                <input type="number" className="app-input" value={inputs.sec} onChange={e => update('sec', e.target.value)} />
                            </div>
                        </div>
                    </div>
                    {d > 0 && totalMin > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Pace Của Bạn</p>
                            <p className="text-[48px] font-black leading-none text-[#00ff88]">{pMinStr}:{pSecStr} <span className="text-xl">/km</span></p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'armyBodyFat', title: 'Army Body Fat', icon: Ruler, color: '#60a5fa',
        preview: (inputs: SharedInputs) => {
            const h = parseFloat(inputs.height);
            const w = parseFloat(inputs.waist);
            const n = parseFloat(inputs.neck);
            const hip = parseFloat(inputs.hip);
            if (h && w && n) {
                if (inputs.gender === 'male') {
                    return (86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76).toFixed(1) + '%';
                } else if (hip) {
                    return (163.205 * Math.log10(w + hip - n) - 97.684 * Math.log10(h) - 78.387).toFixed(1) + '%';
                }
            }
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            // Uses same inputs as standard body fat for simplicity here, but standard is slightly different for Army
            return (
                <div className="space-y-4">
                    <p className="text-xs text-[#888] text-center">Tiêu chuẩn mỡ cơ thể của Quân đội Mỹ (US Army).</p>
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'height', 'waist', 'neck']} />
                    {inputs.gender === 'female' && <SharedInputsForm inputs={inputs} update={update} fields={['hip']} />}

                    {(() => {
                        const h = parseFloat(inputs.height);
                        const w = parseFloat(inputs.waist);
                        const n = parseFloat(inputs.neck);
                        const hip = parseFloat(inputs.hip);
                        let bf = 0;
                        if (h && w && n) {
                            if (inputs.gender === 'male') {
                                bf = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
                            } else if (hip) {
                                bf = 163.205 * Math.log10(w + hip - n) - 97.684 * Math.log10(h) - 78.387;
                            }
                        }

                        return bf > 0 ? (
                            <div className="card p-4 text-center">
                                <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Army Body Fat</p>
                                <p className="text-[48px] font-black leading-none text-[#60a5fa]">{bf.toFixed(1)}%</p>
                            </div>
                        ) : null;
                    })()}
                </div>
            );
        }
    },
    {
        id: 'leanBodyMass', title: 'Lean Body Mass', icon: Layers, color: '#f472b6',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            if (w && h) {
                return (inputs.gender === 'male'
                    ? (0.407 * w) + (0.267 * h) - 19.2
                    : (0.252 * w) + (0.473 * h) - 48.3).toFixed(1) + ' kg';
            }
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            let lbm = 0;
            if (w && h) {
                // Boer Formula
                lbm = inputs.gender === 'male'
                    ? (0.407 * w) + (0.267 * h) - 19.2
                    : (0.252 * w) + (0.473 * h) - 48.3;
            }

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'height', 'weight']} />
                    {lbm > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Lean Body Mass (Boer)</p>
                            <p className="text-[48px] font-black leading-none text-[#f472b6]">{lbm.toFixed(1)} <span className="text-xl">kg</span></p>
                            <p className="text-xs text-[#555] mt-2">Khối lượng cơ thể không mỡ</p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'healthyWeight', title: 'Healthy Weight', icon: Heart, color: '#00ff88',
        preview: (inputs: SharedInputs) => {
            const h = parseFloat(inputs.height) / 100;
            if (h > 0) return `${(18.5 * h * h).toFixed(0)} - ${(25 * h * h).toFixed(0)} kg`;
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const h = parseFloat(inputs.height) / 100;
            const minW = 18.5 * (h * h);
            const maxW = 25 * (h * h);

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['height']} />
                    {h > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Khoảng cân nặng khoẻ mạnh</p>
                            <p className="text-[32px] font-black leading-none text-[#00ff88]">
                                {minW.toFixed(1)} - {maxW.toFixed(1)} <span className="text-xl">kg</span>
                            </p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'caloriesBurned', title: 'Calories Burned', icon: Flame, color: '#ff6b6b',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            const m = parseFloat(inputs.workoutMins);
            const metVal = parseFloat(inputs.met);
            if (w && m && metVal) return Math.round((metVal * 3.5 * w / 200) * m) + ' kcal';
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);
            const m = parseFloat(inputs.workoutMins);
            const metVal = parseFloat(inputs.met);

            const burned = (w && m && metVal) ? (metVal * 3.5 * w / 200) * m : 0;

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['weight']} />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Thời gian (phút)</label>
                            <input type="number" className="app-input" value={inputs.workoutMins} onChange={e => update('workoutMins', e.target.value)} />
                        </div>
                        <div>
                            <label className="input-label">Hoạt động</label>
                            <select className="app-input" value={inputs.met} onChange={e => update('met', e.target.value)}>
                                <option value="3">Đi bộ</option>
                                <option value="6">Nâng tạ (Nặng)</option>
                                <option value="8">Chạy bộ (nhẹ)</option>
                                <option value="10">Chạy bộ (nhanh)</option>
                                <option value="7">Đạp xe</option>
                                <option value="8">Bơi lội</option>
                            </select>
                        </div>
                    </div>
                    {burned > 0 && (
                        <div className="card p-4 text-center border border-[#ff6b6b33] bg-[#ff6b6b10]">
                            <p className="text-[#ff6b6b] text-sm font-bold uppercase tracking-widest mb-2">Calo đã đốt</p>
                            <p className="text-[48px] font-black leading-none text-[#ff6b6b]">{Math.round(burned)}</p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'oneRepMax', title: '1 Rep Max', icon: Zap, color: '#fbbf24',
        preview: (inputs: SharedInputs) => {
            const weight = parseFloat(inputs.wMax);
            const reps = parseFloat(inputs.rMax);
            if (weight && reps) return (weight * (1 + reps / 30)).toFixed(1) + ' kg';
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const weight = parseFloat(inputs.wMax);
            const reps = parseFloat(inputs.rMax);
            const orm = (weight && reps) ? weight * (1 + reps / 30) : 0; // Epley

            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Mức tạ (kg)</label>
                            <input type="number" className="app-input" value={inputs.wMax} onChange={e => update('wMax', e.target.value)} />
                        </div>
                        <div>
                            <label className="input-label">Số Reps</label>
                            <input type="number" className="app-input" value={inputs.rMax} onChange={e => update('rMax', e.target.value)} />
                        </div>
                    </div>
                    {orm > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">1 Rep Max (Epley)</p>
                            <p className="text-[48px] font-black leading-none text-[#fbbf24]">{orm.toFixed(1)} <span className="text-xl">kg</span></p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'targetHeartRate', title: 'Target HR', icon: HeartPulse, color: '#ef4444',
        preview: (inputs: SharedInputs) => {
            const a = parseFloat(inputs.age);
            if (a) return (220 - a) + ' bpm';
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const a = parseFloat(inputs.age);
            const maxHR = a ? 220 - a : 0;

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['age']} />
                    {maxHR > 0 && (
                        <div className="space-y-2">
                            <ResultRow label="Nhịp tim tối đa" value={maxHR} unit="bpm" color="#ef4444" />
                            <ResultRow label="Vùng khởi động (50-60%)" value={`${Math.round(maxHR * 0.5)} - ${Math.round(maxHR * 0.6)}`} unit="" color="#00ff88" />
                            <ResultRow label="Đốt mỡ (60-70%)" value={`${Math.round(maxHR * 0.6)} - ${Math.round(maxHR * 0.7)}`} unit="" color="#00e5ff" />
                            <ResultRow label="Cardio (70-80%)" value={`${Math.round(maxHR * 0.7)} - ${Math.round(maxHR * 0.8)}`} unit="" color="#fbbf24" />
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'macro', title: 'Macro Calculator', icon: PieChartIcon, color: '#a78bfa',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const a = parseFloat(inputs.age);
            if (w && h && a) {
                const tdee = calcBMR(w, h, a, inputs.gender) * ACTIVITY_MULTIPLIER[inputs.activity];
                return `${Math.round(tdee * 0.3 / 4)}P / ${Math.round(tdee * 0.35 / 4)}C / ${Math.round(tdee * 0.35 / 9)}F`;
            }
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const a = parseFloat(inputs.age);
            const tdee = w && h && a ? calcBMR(w, h, a, inputs.gender) * ACTIVITY_MULTIPLIER[inputs.activity] : 0;

            // Standard Macro 30/35/35
            const p = (tdee * 0.3) / 4;
            const c = (tdee * 0.35) / 4;
            const f = (tdee * 0.35) / 9;

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'age', 'height', 'weight', 'activity']} />
                    {tdee > 0 && (
                        <div className="card p-4 space-y-3">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest text-center mb-2">Macro Cân Bằng (TDEE: {Math.round(tdee)} kcal)</p>
                            <ResultRow label="Protein (30%)" value={Math.round(p)} unit="g" color="#00ff88" />
                            <ResultRow label="Carbs (35%)" value={Math.round(c)} unit="g" color="#60a5fa" />
                            <ResultRow label="Fat (35%)" value={Math.round(f)} unit="g" color="#ffb800" />
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'carbohydrate', title: 'Carb Calculator', icon: Cookie, color: '#60a5fa',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            if (w) return `${Math.round(w * 3)}-${Math.round(w * 5)} g`;
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['weight', 'activity']} />
                    {w > 0 && (
                        <div className="card p-4 space-y-3">
                            <p className="text-[#888] text-[11px] font-bold uppercase tracking-widest text-center mb-2">Khuyến nghị lượng Tinh Bột hàng ngày</p>
                            <ResultRow label="Tập luyện sức bền nhẹ" value={`${Math.round(w * 3)} - ${Math.round(w * 5)}`} unit="g" color="#60a5fa" />
                            <ResultRow label="Tập luyện cường độ cao" value={`${Math.round(w * 5)} - ${Math.round(w * 7)}`} unit="g" color="#60a5fa" />
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'protein', title: 'Protein Calculator', icon: Drumstick, color: '#00ff88',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            if (w) return `${Math.round(w * 1.6)} - ${Math.round(w * 2.2)} g`;
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['weight']} />
                    {w > 0 && (
                        <div className="card p-4 space-y-3">
                            <p className="text-[#888] text-[11px] font-bold uppercase tracking-widest text-center mb-2">Khuyến nghị lượng Đạm hàng ngày</p>
                            <ResultRow label="Người ít vận động (1.6g/kg)" value={Math.round(w * 1.6)} unit="g" color="#00ff88" />
                            <ResultRow label="Tập duy trì/Tăng cơ (1.8 - 2.0g/kg)" value={`${Math.round(w * 1.8)} - ${Math.round(w * 2.0)}`} unit="g" color="#00ff88" />
                            <ResultRow label="Tăng cơ tối đa (2.2g/kg)" value={Math.round(w * 2.2)} unit="g" color="#00ff88" />
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'fatIntake', title: 'Fat Intake', icon: Droplet, color: '#ffb800',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const a = parseFloat(inputs.age);
            if (w && h && a) {
                const tdee = calcBMR(w, h, a, inputs.gender) * ACTIVITY_MULTIPLIER[inputs.activity];
                return `${Math.round((tdee * 0.2) / 9)} - ${Math.round((tdee * 0.35) / 9)} g`;
            }
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const a = parseFloat(inputs.age);
            const tdee = w && h && a ? calcBMR(w, h, a, inputs.gender) * ACTIVITY_MULTIPLIER[inputs.activity] : 0;

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'age', 'height', 'weight', 'activity']} />
                    {tdee > 0 && (
                        <div className="card p-4 space-y-3">
                            <p className="text-[#888] text-[11px] font-bold uppercase tracking-widest text-center mb-2">Lượng Chất Béo Khuyến Nghị (20-35% TDEE)</p>
                            <ResultRow label="Thấp (20%)" value={Math.round((tdee * 0.2) / 9)} unit="g" color="#ffb800" />
                            <ResultRow label="Vừa (25%)" value={Math.round((tdee * 0.25) / 9)} unit="g" color="#ffb800" />
                            <ResultRow label="Keto giới hạn" value={Math.round((tdee * 0.7) / 9)} unit="g" color="#ff4444" />
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'tdee', title: 'TDEE Calculator', icon: Activity, color: '#00e5ff',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const a = parseFloat(inputs.age);
            if (w && h && a) return Math.round(calcBMR(w, h, a, inputs.gender) * ACTIVITY_MULTIPLIER[inputs.activity]) + ' kcal';
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const a = parseFloat(inputs.age);
            const bmr = w && h && a ? calcBMR(w, h, a, inputs.gender) : 0;
            const tdee = bmr * ACTIVITY_MULTIPLIER[inputs.activity];

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'age', 'height', 'weight', 'activity']} />
                    {tdee > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">TDEE (Tổng năng lượng tiêu hao)</p>
                            <p className="text-[48px] font-black leading-none text-[#00e5ff]">{Math.round(tdee)} <span className="text-xl">kcal</span></p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'gfr', title: 'eGFR Calculator', icon: Activity, color: '#f43f5e',
        preview: (inputs: SharedInputs) => {
            const a = parseFloat(inputs.age);
            const cr = parseFloat(inputs.scr);
            if (a && cr) {
                const kappa = inputs.gender === 'female' ? 0.7 : 0.9;
                const alpha = inputs.gender === 'female' ? -0.329 : -0.411;
                const min = Math.min(cr / kappa, 1);
                const max = Math.max(cr / kappa, 1);
                let gfr = 141 * Math.pow(min, alpha) * Math.pow(max, -1.209) * Math.pow(0.993, a);
                if (inputs.gender === 'female') gfr *= 1.018;
                return Math.round(gfr) + ' mL/min';
            }
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const a = parseFloat(inputs.age);
            const cr = parseFloat(inputs.scr);

            let gfr = 0;
            if (a && cr) {
                const kappa = inputs.gender === 'female' ? 0.7 : 0.9;
                const alpha = inputs.gender === 'female' ? -0.329 : -0.411;
                const min = Math.min(cr / kappa, 1);
                const max = Math.max(cr / kappa, 1);

                gfr = 141 * Math.pow(min, alpha) * Math.pow(max, -1.209) * Math.pow(0.993, a);
                if (inputs.gender === 'female') gfr *= 1.018;
            }

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'age']} />
                    <div>
                        <label className="input-label">Serum Creatinine (mg/dL)</label>
                        <input type="number" className="app-input" value={inputs.scr} onChange={e => update('scr', e.target.value)} />
                    </div>
                    {gfr > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Độ lọc cầu thận (eGFR)</p>
                            <p className="text-[48px] font-black leading-none text-[#f43f5e]">{Math.round(gfr)}</p>
                            <p className="text-xs text-[#555] mt-1">mL/min/1.73m²</p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'bodyType', title: 'Body Shape', icon: User, color: '#a855f7',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.waist);
            const h = parseFloat(inputs.hip);
            const b = parseFloat(inputs.bust);
            if (w && h && b) {
                if ((b - h) <= 1 && (h - b) < 3.6 && (b - w) >= 9) return 'Đồng hồ cát';
                else if (h - b >= 3.6 && h - w >= 9) return 'Pear';
                else if (b - h >= 3.6 && b - w >= 9) return 'Tam giác ngược';
                else if (h - w < 9 && b - w < 9) return 'Banana';
                return 'Apple';
            }
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.waist);
            const h = parseFloat(inputs.hip);
            const b = parseFloat(inputs.bust);

            let shape = '';
            if (w && h && b) {
                if ((b - h) <= 1 && (h - b) < 3.6 && (b - w) >= 9) shape = 'Đồng hồ cát';
                else if (h - b >= 3.6 && h - w >= 9) shape = 'Quả lê (Pear)';
                else if (b - h >= 3.6 && b - w >= 9) shape = 'Tam giác ngược';
                else if (h - w < 9 && b - w < 9) shape = 'Chữ nhật (Banana)';
                else shape = 'Quả táo (Apple)';
            }

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['waist', 'hip']} />
                    <div>
                        <label className="input-label">Vòng ngực (cm)</label>
                        <input type="number" className="app-input" value={inputs.bust} onChange={e => update('bust', e.target.value)} />
                    </div>
                    {shape && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Dáng Người Của Bạn</p>
                            <p className="text-[24px] font-black leading-tight text-[#a855f7]">{shape}</p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'bsa', title: 'Body Surface', icon: Binary, color: '#14b8a6',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            if (w && h) return (0.007184 * Math.pow(w, 0.425) * Math.pow(h, 0.725)).toFixed(2) + ' m²';
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);
            const h = parseFloat(inputs.height);
            const bsa = w && h ? 0.007184 * Math.pow(w, 0.425) * Math.pow(h, 0.725) : 0; // Du Bois

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['height', 'weight']} />
                    {bsa > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Diện tích bề mặt cơ thể (BSA)</p>
                            <p className="text-[48px] font-black leading-none text-[#14b8a6]">{bsa.toFixed(2)}</p>
                            <p className="text-xs text-[#555] mt-1">mét vuông (m²)</p>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        id: 'bac', title: 'BAC Calculator', icon: Droplet, color: '#f59e0b',
        preview: (inputs: SharedInputs) => {
            const w = parseFloat(inputs.weight);
            const v = parseFloat(inputs.vol);
            const a = parseFloat(inputs.abv) / 100;
            const h = parseFloat(inputs.hrs);
            if (w && v && a) {
                const alcoholGrams = v * a * 0.789;
                const r = inputs.gender === 'male' ? 0.68 : 0.55;
                let bac = (alcoholGrams / (w * 1000 * r)) * 100;
                bac = Math.max(0, bac - (0.015 * h));
                return bac.toFixed(3) + '%';
            }
            return null;
        },
        render: (inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void) => {
            const w = parseFloat(inputs.weight);
            const v = parseFloat(inputs.vol);
            const a = parseFloat(inputs.abv) / 100;
            const h = parseFloat(inputs.hrs);

            let bac = 0;
            if (w && v && a) {
                const alcoholGrams = v * a * 0.789; // spec gravity of alcohol
                const r = inputs.gender === 'male' ? 0.68 : 0.55; // Widmark factor
                bac = (alcoholGrams / (w * 1000 * r)) * 100;
                // Metabolism
                bac = Math.max(0, bac - (0.015 * h));
            }

            return (
                <div className="space-y-4">
                    <SharedInputsForm inputs={inputs} update={update} fields={['gender', 'weight']} />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Lượng uống (ml)</label>
                            <input type="number" className="app-input" value={inputs.vol} onChange={e => update('vol', e.target.value)} />
                        </div>
                        <div>
                            <label className="input-label">Nồng độ mồi cồn (%)</label>
                            <input type="number" className="app-input" value={inputs.abv} onChange={e => update('abv', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Thời gian qua (Giờ)</label>
                        <input type="number" className="app-input" value={inputs.hrs} onChange={e => update('hrs', e.target.value)} />
                    </div>
                    {bac > 0 && (
                        <div className="card p-4 text-center">
                            <p className="text-[#888] text-sm font-bold uppercase tracking-widest mb-2">Nồng độ cồn (BAC)</p>
                            <p className="text-[48px] font-black leading-none" style={{ color: bac > 0.05 ? '#f43f5e' : '#f59e0b' }}>{bac.toFixed(3)}%</p>
                        </div>
                    )}
                </div>
            );
        }
    }
];

function PieChartIcon(props: React.ComponentProps<typeof CircleIcon>) {
    return <CircleIcon {...props} />
}

// ==========================================
// SHARED COMPONENTS
// ==========================================

function SharedInputsForm({ inputs, update, fields }: { inputs: SharedInputs, update: (k: keyof SharedInputs, v: string) => void, fields: (keyof SharedInputs)[] }) {
    return (
        <div className="grid grid-cols-2 gap-3 mb-2">
            {fields.includes('gender') && (
                <div className="col-span-2 flex bg-[#161616] rounded-xl p-1 border border-[#2a2a2a]">
                    <button onClick={() => update('gender', 'male')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${inputs.gender === 'male' ? 'bg-[#222] text-[#00ff88] shadow-sm' : 'text-[#666]'}`}>Nam</button>
                    <button onClick={() => update('gender', 'female')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${inputs.gender === 'female' ? 'bg-[#222] text-[#ff4081] shadow-sm' : 'text-[#666]'}`}>Nữ</button>
                </div>
            )}
            {fields.includes('age') && (
                <div>
                    <label className="input-label">Tuổi</label>
                    <input type="number" className="app-input" value={inputs.age} onChange={e => update('age', e.target.value)} />
                </div>
            )}
            {fields.includes('weight') && (
                <div>
                    <label className="input-label">Cân nặng (kg)</label>
                    <input type="number" className="app-input" value={inputs.weight} onChange={e => update('weight', e.target.value)} />
                </div>
            )}
            {fields.includes('height') && (
                <div>
                    <label className="input-label">Chiều cao (cm)</label>
                    <input type="number" className="app-input" value={inputs.height} onChange={e => update('height', e.target.value)} />
                </div>
            )}
            {fields.includes('activity') && (
                <div className="col-span-2">
                    <label className="input-label">Vận động</label>
                    <select className="app-input" value={inputs.activity} onChange={e => update('activity', e.target.value)}>
                        <option value="sedentary">Ít vận động (Văn phòng)</option>
                        <option value="light">Nhẹ (Tập 1-3 ngày/tuần)</option>
                        <option value="moderate">Vừa (Tập 3-5 ngày/tuần)</option>
                        <option value="active">Nhiều (Tập 6-7 ngày/tuần)</option>
                        <option value="very_active">Rất nhiều (VĐV chuyên nghiệp)</option>
                    </select>
                </div>
            )}
            {fields.includes('waist') && (
                <div>
                    <label className="input-label">Vòng eo (cm)</label>
                    <input type="number" className="app-input" value={inputs.waist} onChange={e => update('waist', e.target.value)} />
                </div>
            )}
            {fields.includes('neck') && (
                <div>
                    <label className="input-label">Vòng cổ (cm)</label>
                    <input type="number" className="app-input" value={inputs.neck} onChange={e => update('neck', e.target.value)} />
                </div>
            )}
            {fields.includes('hip') && (
                <div className="col-span-2">
                    <label className="input-label">Vòng hông (cm) - Chỉ nữ</label>
                    <input type="number" className="app-input" value={inputs.hip} onChange={e => update('hip', e.target.value)} />
                </div>
            )}
        </div>
    );
}

function ResultRow({ label, value, unit, color }: { label: string, value: string | number, unit?: string, color: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#161616] border border-[#222]">
            <span className="text-[13px] text-[#888] font-medium">{label}</span>
            <div className="text-right">
                <span className="text-[16px] font-black" style={{ color }}>{value}</span>
                {unit && <span className="text-[11px] text-[#555] ml-1">{unit}</span>}
            </div>
        </div>
    );
}

// ==========================================
// MAIN CALCULATOR CONTAINER
// ==========================================

export function MegaCalculator({ profile }: { profile: import('../../types/nutrition').UserProfile | null }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Initial state setup falling back to profile or defaults
    const getInitialInputs = (): SharedInputs => {
        const defaultInputs: SharedInputs = {
            gender: profile?.sex === 'female' ? 'female' : 'male',
            age: profile?.age ? String(profile.age) : '25',
            weight: profile?.weight ? String(profile.weight) : '70',
            height: profile?.height ? String(profile.height) : '170',
            activity: profile?.activityLevel || 'moderate',
            waist: '80', neck: '38', hip: '95',
            dist: '5', min: '30', sec: '0',
            met: '6', workoutMins: '60',
            wMax: '100', rMax: '5',
            scr: '1.0', bust: '90',
            vol: '330', abv: '5', hrs: '1'
        };

        const saved = localStorage.getItem('cutlean_mega_calc_inputs');
        if (saved) {
            try {
                return { ...defaultInputs, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Lỗi khi tải dữ liệu máy tính:', e);
            }
        }
        return defaultInputs;
    };

    const [inputs, setInputs] = useState<SharedInputs>(getInitialInputs);

    // Auto-save inputs globally on change
    useEffect(() => {
        localStorage.setItem('cutlean_mega_calc_inputs', JSON.stringify(inputs));
    }, [inputs]);

    const updateInput = (k: keyof SharedInputs, v: string) => setInputs(prev => ({ ...prev, [k]: v }));

    const selectedCalc = selectedId ? calculators.find(c => c.id === selectedId) : null;

    if (selectedCalc) {
        return (
            <div className="fade-in space-y-4">
                <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-[#00ff88] hover:text-white transition-colors bg-[#00ff8815] px-4 py-2 rounded-xl mb-4 w-max">
                    <ArrowLeft size={16} />
                    <span className="text-sm font-bold uppercase tracking-widest">Trở lại</span>
                </button>
                <div className="flex items-center justify-between mb-6 bg-[#161616] p-4 rounded-3xl border border-[#222]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: selectedCalc.color + '15' }}>
                            <selectedCalc.icon size={24} style={{ color: selectedCalc.color }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">{selectedCalc.title}</h2>
                            <p className="text-xs text-[#555]">Cut Lean Calculator Suite</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#111] border border-[#222] rounded-3xl p-5 shadow-lg">
                    {selectedCalc.render(inputs, updateInput)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 fade-in">
            <div className="text-center py-6 bg-[#111] rounded-3xl border border-[#222] overflow-hidden relative">
                <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-[#00ff88] opacity-10 blur-[60px] rounded-full pointer-events-none" />
                <h2 className="text-2xl font-black text-white mb-1"><span className="text-[#00ff88]">MEGA</span> CALC SUITE</h2>
                <p className="text-[#666] text-xs font-medium tracking-wide">21 Công Cụ Sức Khoẻ & Thể Hình</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {calculators.map(c => {
                    const previewStr = c.preview(inputs);
                    return (
                        <button
                            key={c.id}
                            onClick={() => setSelectedId(c.id)}
                            className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-[#111] border border-[#222] hover:border-[#00ff8855] hover:bg-[#161616] transition-all text-left group"
                        >
                            <div className="w-full flex justify-between items-start">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: c.color + '15' }}>
                                    <c.icon size={20} style={{ color: c.color }} />
                                </div>
                                {previewStr && (
                                    <span className="text-[12px] font-black" style={{ color: c.color }}>{previewStr}</span>
                                )}
                            </div>
                            <span className="text-[13px] font-bold text-white group-hover:text-[#00ff88] transition-colors leading-tight">
                                {c.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
