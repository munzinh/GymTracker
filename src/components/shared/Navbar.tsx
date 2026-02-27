import { Dumbbell, LogOut, User } from 'lucide-react';
import type { CurrentUser } from '../../App';

interface NavbarProps {
    currentUser: CurrentUser;
    onLogout: () => void;
}

export function Navbar({ currentUser, onLogout }: NavbarProps) {
    return (
        <>
            {/* Desktop & Mobile top bar (contains User actions) */}
            <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-[#111] border-b border-[#222] sticky top-0 z-50">
                {/* Logo - Hidden on mobile, shown on desktop */}
                <div className="hidden md:flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #00ff88, #00cc6a)' }}>
                        <Dumbbell size={16} className="text-black" />
                    </div>
                    <span className="font-bold text-sm md:text-base tracking-tight">
                        <span className="neon-text">CUT</span>
                        <span className="text-white ml-1">LEAN</span>
                    </span>
                </div>

                {/* Spacer on mobile since logo is in the other header */}
                <div className="md:hidden flex-1" />

                <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-2 hidden md:flex">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[#333]">
                            <User size={14} className="text-[#00ff88]" />
                        </div>
                        <span className="text-sm font-medium text-white">{currentUser.name}</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium text-[#ff4444] bg-[#ff444415] hover:bg-[#ff444422] transition-colors border border-[#ff444430]"
                    >
                        <LogOut size={14} />
                        <span className="hidden md:inline">Đổi tài khoản</span>
                        <span className="md:hidden">Thoát</span>
                    </button>
                </div>
            </header>

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
