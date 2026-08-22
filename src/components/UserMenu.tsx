import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types/auth';
import { AuthService } from '../services/authService';
import { soundEffects } from '../services/soundEffects';
import { 
  Users, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  BookOpen, 
  ChevronDown
} from 'lucide-react';

interface UserMenuProps {
  currentUser: User;
  onUserChanged: (user: User | null) => void;
  onOpenAuthModal: () => void;
  onNavigateToUserAdmin?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  currentUser,
  onUserChanged,
  onOpenAuthModal,
  onNavigateToUserAdmin,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    soundEffects.playPop();
    AuthService.logout();
    onUserChanged(null);
    setIsOpen(false);
  };

  const getRoleBadge = (role: User['role']) => {
    if (role === 'admin') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-purple-600" />
          <span>Admin (.env)</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
        <BookOpen className="w-3 h-3 text-emerald-600" />
        <span>Học viên</span>
      </span>
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      
      {/* Trigger Button */}
      <button
        onClick={() => {
          soundEffects.playPop();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 transition-all shadow-sm"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-sm shadow-sm">
          {currentUser.avatar || (currentUser.role === 'admin' ? '👑' : '🎒')}
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[120px]">
            {currentUser.fullName}
          </span>
          <div className="flex items-center mt-0.5">
            {getRoleBadge(currentUser.role)}
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 transition-all duration-150">
          
          {/* User Profile Summary */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md">
                {currentUser.avatar || (currentUser.role === 'admin' ? '👑' : '🎒')}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {currentUser.fullName}
                </h4>
                <p className="text-xs text-slate-400 truncate">@{currentUser.username}</p>
                <div className="mt-1">
                  {getRoleBadge(currentUser.role)}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Options */}
          <div className="p-2 space-y-1">
            
            {/* Admin Management Option (Only for Admins) */}
            {currentUser.role === 'admin' && onNavigateToUserAdmin && (
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setIsOpen(false);
                  onNavigateToUserAdmin();
                }}
                className="w-full px-3 py-2.5 rounded-xl text-left font-bold text-xs text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 flex items-center gap-2.5 transition-colors"
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>Quản Trị Người Dùng</span>
              </button>
            )}

            {/* Login / Register Modal Trigger */}
            <div className="pt-1">
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setIsOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full px-3 py-2 rounded-xl text-left font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <LogIn className="w-4 h-4 text-brand-600" />
                <span>Đăng nhập tài khoản khác</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded-xl text-left font-semibold text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Đăng xuất</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
