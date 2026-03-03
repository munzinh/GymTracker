import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import type { WorkoutTemplate, ExerciseTemplate } from '../../types/workout';
import { loadWorkoutTemplates, saveWorkoutTemplates } from '../../utils/workoutStorage';

interface Props {
    userId: string;
    onBack: () => void;
}

export function TemplateManager({ userId, onBack }: Props) {
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

    useEffect(() => {
        setTemplates(loadWorkoutTemplates(userId));
    }, [userId]);

    const handleCreateNew = () => {
        setEditingTemplate({
            id: `tpl-${Date.now()}`,
            name: 'Giáo án mới',
            exercises: []
        });
    };

    const handleSaveTemplate = () => {
        if (!editingTemplate) return;

        const newTemplates = [...templates];
        const index = newTemplates.findIndex(t => t.id === editingTemplate.id);
        if (index >= 0) {
            newTemplates[index] = editingTemplate;
        } else {
            newTemplates.push(editingTemplate);
        }
        setTemplates(newTemplates);
        saveWorkoutTemplates(userId, newTemplates);
        setEditingTemplate(null);
    };

    const handleDeleteTemplate = (id: string) => {
        const newTemplates = templates.filter(t => t.id !== id);
        setTemplates(newTemplates);
        saveWorkoutTemplates(userId, newTemplates);
    };

    const handleAddExercise = () => {
        if (!editingTemplate) return;
        setEditingTemplate({
            ...editingTemplate,
            exercises: [
                ...editingTemplate.exercises,
                {
                    id: `ex-${Date.now()}`,
                    name: 'Bài tập mới',
                    targetSets: 3,
                    repRange: '8-12',
                    targetRIR: 1
                }
            ]
        });
    };

    const updateExercise = (id: string, field: keyof ExerciseTemplate, value: string | number) => {
        if (!editingTemplate) return;
        setEditingTemplate({
            ...editingTemplate,
            exercises: editingTemplate.exercises.map(ex =>
                ex.id === id ? { ...ex, [field]: value } : ex
            )
        });
    };

    const removeExercise = (id: string) => {
        if (!editingTemplate) return;
        setEditingTemplate({
            ...editingTemplate,
            exercises: editingTemplate.exercises.filter(ex => ex.id !== id)
        });
    };

    return (
        <div className="space-y-4 fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 bg-[#1a1a1a] rounded-xl text-[#888] hover:text-white transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <h2 className="text-xl font-black text-white tracking-tight uppercase">Quản lý Giáo án</h2>
            </div>

            {editingTemplate ? (
                <div className="card p-4 space-y-4">
                    <input
                        type="text"
                        className="w-full bg-[#1a1a1a] border border-[#333] p-3 rounded-xl text-white font-black text-lg"
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                        placeholder="Tên giáo án (vd: Thân Trên)"
                    />

                    <div className="space-y-3">
                        {editingTemplate.exercises.map((ex, i) => (
                            <div key={ex.id} className="bg-[#111] border border-[#222] p-3 rounded-xl relative group">
                                <button
                                    onClick={() => removeExercise(ex.id)}
                                    className="absolute top-2 right-2 p-1 text-[#444] hover:text-[#ff4444] transition-colors"
                                >
                                    <X size={14} />
                                </button>
                                <span className="text-[10px] text-[#888] font-bold uppercase mb-1 block">Bài {i + 1}</span>
                                <input
                                    className="w-full bg-transparent border-b border-[#333] pb-1 text-sm font-bold text-white mb-3"
                                    value={ex.name}
                                    onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                                    placeholder="Tên bài tập..."
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-[10px] text-[#666] uppercase">Số Hiệp</label>
                                        <input
                                            type="number"
                                            className="w-full bg-[#1a1a1a] border border-[#333] p-1.5 rounded-lg text-sm text-center"
                                            value={ex.targetSets}
                                            onChange={(e) => updateExercise(ex.id, 'targetSets', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[#666] uppercase">Mục tiêu (Reps)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#1a1a1a] border border-[#333] p-1.5 rounded-lg text-sm text-center"
                                            value={ex.repRange}
                                            onChange={(e) => updateExercise(ex.id, 'repRange', e.target.value)}
                                            placeholder="8-12"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[#666] uppercase">Target RIR</label>
                                        <input
                                            type="number"
                                            className="w-full bg-[#1a1a1a] border border-[#333] p-1.5 rounded-lg text-sm text-center"
                                            value={ex.targetRIR ?? ''}
                                            onChange={(e) => updateExercise(ex.id, 'targetRIR', parseInt(e.target.value))}
                                            placeholder="1"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddExercise}
                        className="w-full p-3 border border-dashed border-[#333] rounded-xl text-[#888] hover:border-[#a855f7] hover:text-[#a855f7] transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                    >
                        <Plus size={16} /> Thêm bài tập
                    </button>

                    <div className="flex gap-2 pt-4">
                        <button
                            onClick={() => setEditingTemplate(null)}
                            className="flex-1 p-3 bg-[#111] border border-[#333] rounded-xl text-[#888] font-bold"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSaveTemplate}
                            className="flex-[2] p-3 bg-[#00ff88] text-black rounded-xl font-black flex items-center justify-center gap-2"
                        >
                            <Save size={16} /> Lưu Giáo Án
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {templates.map(t => (
                        <div key={t.id} className="card p-4 border-[#222] bg-[#1a1a1a] flex justify-between items-center group">
                            <div>
                                <h3 className="font-black text-white">{t.name}</h3>
                                <p className="text-[11px] text-[#888] font-medium">{t.exercises.length} bài tập</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingTemplate(t)}
                                    className="p-2 bg-[#222] rounded-lg text-[#888] group-hover:bg-[#a855f7]/20 group-hover:text-[#a855f7] transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteTemplate(t.id)}
                                    className="p-2 bg-[#222] rounded-lg text-[#888] hover:bg-[#ff4444]/20 hover:text-[#ff4444] transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleCreateNew}
                        className="w-full p-4 card bg-gradient-to-r from-[#111] to-[#1a1a1a] border-[#333] border-dashed text-[#00ff88] flex items-center justify-center gap-2 hover:border-[#00ff88] transition-all font-black"
                    >
                        <Plus size={20} /> TẠO GIÁO ÁN MỚI
                    </button>
                </div>
            )}
        </div>
    );
}
