import React, { useState, useEffect } from 'react';
import type { User } from '../types/auth';
import { ApiService } from '../services/apiService';
import { StorageService } from '../services/storageService';
import { soundEffects } from '../services/soundEffects';
import { 
  ShieldCheck, 
  Search, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Flame, 
  Trophy, 
  ArrowLeft, 
  X,
  BookOpen
} from 'lucide-react';

interface UserManagementViewProps {
  currentUser: User;
  onBack: () => void;
  onUserListChanged: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onBack,
  onUserListChanged,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'student'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student state
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const loadUsers = async () => {
    const list = await ApiService.getAllUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    soundEffects.playPop();
    if (user.role === 'admin' || user.username === 'admin') {
      alert('Không thể khóa tài khoản Quản trị viên hệ thống (.env).');
      return;
    }
    const success = await ApiService.toggleUserStatus(user.id);
    if (success) {
      await loadUsers();
      onUserListChanged();
    }
  };

  const handleDeleteUser = async (user: User) => {
    soundEffects.playPop();
    if (user.role === 'admin' || user.username === 'admin') {
      alert('Không thể xóa tài khoản Quản trị viên hệ thống (.env).');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa học viên "${user.fullName}" (@${user.username}) khỏi hệ thống?`)) {
      const success = await ApiService.deleteUser(user.id);
      if (success) {
        soundEffects.playCorrect();
        await loadUsers();
        onUserListChanged();
      }
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const res = await ApiService.register(newUsername, newFullName, newEmail, newPassword || '123456');
    if (res.success) {
      soundEffects.playVictory();
      setIsAddModalOpen(false);
      setNewUsername('');
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      await loadUsers();
      onUserListChanged();
    } else {
      soundEffects.playIncorrect();
      setFormError(res.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Quản Trị Người Dùng
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Admin Panel
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quản lý danh sách học viên, xem tiến độ học tập và quản lý tài khoản trong SQLite Database
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playPop();
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-purple-500/20 active:scale-95 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Học Viên Mới</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
            👥
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{totalUsers}</div>
            <div className="text-xs text-slate-500 font-semibold">Tổng tài khoản trong DB</div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
            🎒
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{studentCount}</div>
            <div className="text-xs text-slate-500 font-semibold">Học Viên (Students)</div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">
            👑
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{adminCount}</div>
            <div className="text-xs text-slate-500 font-semibold">Admin (Cấu hình .env)</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, username, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl self-stretch sm:self-auto">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRole === 'all'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Tất cả ({totalUsers})
          </button>
          <button
            onClick={() => setFilterRole('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRole === 'student'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Học Viên ({studentCount})
          </button>
          <button
            onClick={() => setFilterRole('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRole === 'admin'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Admin ({adminCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6">Người Dùng</th>
                <th className="py-4 px-6">Vai Trò</th>
                <th className="py-4 px-6">Tiến Độ Học Tập</th>
                <th className="py-4 px-6">Trạng Thái</th>
                <th className="py-4 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-medium">
              {filteredUsers.map((user) => {
                const userStats = StorageService.getStats(user.id);
                const isRootAdmin = user.role === 'admin' || user.username === 'admin';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* User info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-lg shadow-sm">
                          {user.avatar || (user.role === 'admin' ? '👑' : '🎒')}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{user.fullName}</span>
                            {user.id === currentUser.id && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                                Đang đăng nhập
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">@{user.username} • {user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6">
                      {isRootAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Admin (.env)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Học Viên</span>
                        </span>
                      )}
                    </td>

                    {/* Learning Stats */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold" title="Cấp độ & Điểm kinh nghiệm">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Lv.{userStats.level} ({userStats.xp} XP)</span>
                        </div>
                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold" title="Chuỗi ngày học liên tục">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{userStats.streak} ngày</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <button
                        disabled={isRootAdmin}
                        onClick={() => handleToggleStatus(user)}
                        title={isRootAdmin ? 'Không thể khóa tài khoản Admin cấu hình qua .env' : 'Bấm để khóa / mở khóa'}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        } ${!isRootAdmin ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Hoạt động</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-rose-600" />
                            <span>Đã khóa</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      {!isRootAdmin ? (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          title="Xóa học viên này khỏi hệ thống"
                          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold italic">
                          Cấu hình .env
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Student User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transition-all duration-200">
            
            <div className="p-6 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Thêm Học Viên Mới</h3>
                  <p className="text-xs text-slate-500">Tạo tài khoản học viên trực tiếp vào SQLite Database</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên đăng nhập (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="vd: hocvien_mai, trung_kien..."
                  className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và Tên đầy đủ *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="vd: Trần Mai Phương..."
                  className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email (Tùy chọn)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="vd: maiphuong@gmail.com..."
                  className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu khởi tạo
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mặc định: 123456"
                  className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tạo Tài Khoản Học Viên</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
