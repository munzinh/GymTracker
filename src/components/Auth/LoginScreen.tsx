import { useState, useEffect } from 'react';
import { User, Plus, Trash2, ArrowRight } from 'lucide-react';

interface UserProfile {
    id: string;
    name: string;
    createdAt: string;
}

const LS_USERS = 'cutlean-users';
const LS_CURRENT_USER = 'cutlean-current-user';

export function LoginScreen({ onLogin }: { onLogin: (userId: string, userName: string) => void }) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [newUserName, setNewUserName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(LS_USERS);
            if (stored) {
                setUsers(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load users', e);
        }
    }, []);

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newUserName.trim();
        if (!trimmed) return;

        const newUser: UserProfile = {
            id: 'user_' + Date.now().toString(),
            name: trimmed,
            createdAt: new Date().toISOString()
        };

        const updated = [...users, newUser];
        setUsers(updated);
        localStorage.setItem(LS_USERS, JSON.stringify(updated));
        setNewUserName('');
        setIsCreating(false);

        // Auto-login after creation
        handleSelectUser(newUser.id, newUser.name);
    };

    const handleSelectUser = (id: string, name: string) => {
        localStorage.setItem(LS_CURRENT_USER, JSON.stringify({ id, name }));
        onLogin(id, name);
    };

    const handleDeleteUser = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Bạn có chắc chắn muốn xoá hồ sơ này? Mọi dữ liệu của người này sẽ bị mất.')) {
            const updated = users.filter(u => u.id !== id);
            setUsers(updated);
            localStorage.setItem(LS_USERS, JSON.stringify(updated));
            // In a real app we might also want to clean up their specific data keys: 
            // e.g., `${id}_nutrition-hub-profile`, etc.
            const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith(id + '_'));
            keysToRemove.forEach(k => localStorage.removeItem(k));
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 fade-in" style={{ background: '#090909' }}>
            <div className="w-full max-w-sm space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
                        style={{ background: 'linear-gradient(135deg, #00ff88, #00cc6a)' }}>
                        <User size={32} className="text-black" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        <span className="neon-text">CUT</span>
                        <span className="text-white ml-2">LEAN</span>
                    </h1>
                    <p className="text-[#888] text-sm">Chọn hồ sơ để bắt đầu ghi chép tính toán</p>
                </div>

                {/* User List */}
                {users.length > 0 && !isCreating && (
                    <div className="space-y-3">
                        <p className="text-[11px] text-[#555] uppercase tracking-wider font-semibold px-2">Hồ sơ gần đây</p>
                        {users.map(u => (
                            <div key={u.id}
                                onClick={() => handleSelectUser(u.id, u.name)}
                                className="group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border border-[#1e1e1e] hover:border-[#00ff8855]"
                                style={{ background: '#111' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                                        <span className="text-[#00ff88] font-bold text-lg">{u.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white group-hover:text-[#00ff88] transition-colors">{u.name}</p>
                                        <p className="text-[10px] text-[#555]">Đã tạo {new Date(u.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-[#ff444422] text-[#ff4444]"
                                        onClick={(e) => handleDeleteUser(e, u.id)}>
                                        <Trash2 size={16} />
                                    </div>
                                    <ArrowRight size={18} className="text-[#333] group-hover:text-[#00ff88] transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create New User Form / Button */}
                {!isCreating ? (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-[#333] cursor-pointer hover:border-[#00ff88] hover:text-[#00ff88] transition-colors text-[#555]">
                        <Plus size={20} />
                        <span className="font-medium">Thêm người dùng mới</span>
                    </button>
                ) : (
                    <form onSubmit={handleCreateUser} className="space-y-4 fade-in p-5 rounded-2xl border border-[#1e1e1e]" style={{ background: '#111' }}>
                        <p className="text-sm font-semibold text-white items-center gap-2 flex"><Plus size={16} className="text-[#00ff88]" />Tạo hồ sơ mới</p>
                        <input
                            type="text"
                            autoFocus
                            placeholder="Nhập tên của bạn (vd: A, B, C...)"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="w-full py-3 px-4 rounded-xl text-white outline-none focus:border-[#00ff88] transition-colors"
                            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 rounded-xl font-medium text-[#888] hover:text-white transition-colors"
                                style={{ background: '#1a1a1a' }}>
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={!newUserName.trim()}
                                className="flex-1 py-3 rounded-xl font-bold text-black disabled:opacity-50 transition-all"
                                style={{ background: '#00ff88' }}>
                                Bắt đầu
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}
