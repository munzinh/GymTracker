import React from 'react';
import { Activity, BarChart3, Dumbbell, Target, Settings } from 'lucide-react';
import type { TabId } from '../../types';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: <BarChart3 size={18} /> },
    { id: 'tracking', label: 'Nhật ký', icon: <Activity size={18} /> },
    { id: 'strength', label: 'Sức mạnh', icon: <Dumbbell size={18} /> },
    { id: 'progress', label: 'Tiến độ', icon: <Target size={18} /> },
    { id: 'goals', label: 'Mục tiêu', icon: <Settings size={18} /> },
];

interface NavbarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
    return (
        <>
            {/* Desktop top bar */}
            <header className="hidden md:flex items-center justify-between px-6 py-4 bg-[#111] border-b border-[#222] sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #00ff88, #00cc6a)' }}>
                        <Dumbbell size={16} className="text-black" />
                    </div>
                    <span className="font-bold text-base tracking-tight">
                        <span className="neon-text">CUT</span>
                        <span className="text-white ml-1">LEAN</span>
                    </span>
                </div>
                <nav className="flex gap-1">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => onTabChange(t.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id
                                ? 'bg-[#1a2e22] text-[#00ff88]'
                                : 'text-[#888] hover:text-[#ccc] hover:bg-[#1a1a1a]'
                                }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </nav>
            </header>

            {/* Mobile bottom bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex bg-[#111] border-t border-[#222]">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => onTabChange(t.id)}
                        className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-[10px] font-medium transition-colors ${activeTab === t.id ? 'text-[#00ff88]' : 'text-[#555]'
                            }`}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </nav>

            {/* Mobile top logo */}
            <header className="md:hidden flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-[#222]">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #00ff88, #00cc6a)' }}>
                    <Dumbbell size={14} className="text-black" />
                </div>
                <span className="font-bold text-sm tracking-tight">
                    <span className="neon-text">CUT</span>
                    <span className="text-white ml-1">LEAN</span>
                </span>
                <span className="ml-auto text-[10px] text-[#555] font-medium">v1.0</span>
            </header>
        </>
    );
}
