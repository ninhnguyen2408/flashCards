import React from 'react';
import type { UserStats, ActiveTab } from '../types/flashcard';
import type { User } from '../types/auth';
import { UserMenu } from './UserMenu';
import { 
  Flame, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  BookOpen, 
  Gamepad2, 
  Mic, 
  BarChart3,
  Layers,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface HeaderProps {
  stats: UserStats;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  onUserChanged: (user: User | null) => void;
  onOpenAuthModal: () => void;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  activeTab,
  setActiveTab,
  currentUser,
  onUserChanged,
  onOpenAuthModal,
  onToggleSound,
  onToggleTheme,
  isDark,
}) => {
  const currentLevelBaseXP = Math.pow(stats.level - 1, 2) * 50;
  const nextLevelXP = Math.pow(stats.level, 2) * 50;
  const xpInCurrentLevel = stats.xp - currentLevelBaseXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelBaseXP;
  const xpProgressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / (xpNeededForNextLevel || 1)) * 100)));

  const handleTabClick = (tab: ActiveTab) => {
    soundEffects.playPop();
    if (tab === 'stats' && !currentUser) {
      onOpenAuthModal();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleTabClick('decks')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight gradient-text-brand">VocabMaster</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Flashcard &amp; Spaced Repetition</p>
            </div>
          </div>


          {/* Center Navigation for Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <button
              onClick={() => handleTabClick('decks')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'decks' || activeTab === 'deck-detail'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Bộ thẻ</span>
            </button>

            <button
              onClick={() => handleTabClick('quiz')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                ['quiz', 'spelling', 'match'].includes(activeTab)
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Mini Games</span>
            </button>

            <button
              onClick={() => handleTabClick('voice')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'voice'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Luyện nói AI</span>
            </button>

            <button
              onClick={() => handleTabClick('stats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'stats'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Thống kê</span>
            </button>

            {/* Admin User Management Tab */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => handleTabClick('users')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'users'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Quản trị User</span>
              </button>
            )}
          </nav>

          {/* Right Status, Badges & User Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter (Only for Logged-in Users) */}
            {currentUser && (
              <div 
                title={`Chuỗi học tập liên tiếp: ${stats.streak} ngày`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 border border-orange-200 dark:border-orange-900/50 cursor-pointer hover:scale-105 transition-transform"
              >
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-wiggle" />
                <span className="font-extrabold text-sm text-orange-600 dark:text-orange-400">{stats.streak}</span>
                <span className="text-xs text-orange-600/80 dark:text-orange-400/80 font-medium hidden sm:inline">ngày</span>
              </div>
            )}

            {/* Level & XP Capsule (Only for Logged-in Users) */}
            {currentUser && (
              <div 
                title={`Level ${stats.level} (${stats.xp} XP). Cần thêm ${Math.max(0, nextLevelXP - stats.xp)} XP để lên cấp.`}
                className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {stats.level}
                </div>
                <div className="flex flex-col w-20">
                  <div className="flex justify-between text-[11px] font-bold text-brand-800 dark:text-brand-300">
                    <span>Level {stats.level}</span>
                    <span>{stats.xp} XP</span>
                  </div>
                  <div className="w-full bg-brand-200 dark:bg-brand-900 h-1.5 rounded-full overflow-hidden mt-0.5">
                    <div 
                      className="bg-brand-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${xpProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sound Effects Toggle */}
            <button
              onClick={onToggleSound}
              title={stats.soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {stats.soundEnabled ? <Volume2 className="w-5 h-5 text-brand-600 dark:text-brand-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* User Profile & Role Menu or Login Button */}
            {currentUser ? (
              <UserMenu
                currentUser={currentUser}
                onUserChanged={onUserChanged}
                onOpenAuthModal={onOpenAuthModal}
                onNavigateToUserAdmin={() => setActiveTab('users')}
              />
            ) : (
              <button
                onClick={() => {
                  soundEffects.playPop();
                  onOpenAuthModal();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-brand-500/20 active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => handleTabClick('decks')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'decks' || activeTab === 'deck-detail'
              ? 'text-brand-600 dark:text-brand-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Bộ thẻ</span>
        </button>

        <button
          onClick={() => handleTabClick('quiz')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            ['quiz', 'spelling', 'match'].includes(activeTab)
              ? 'text-brand-600 dark:text-brand-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px]">Games</span>
        </button>

        <button
          onClick={() => handleTabClick('voice')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'voice'
              ? 'text-brand-600 dark:text-brand-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px]">Luyện nói</span>
        </button>

        <button
          onClick={() => handleTabClick('stats')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'stats'
              ? 'text-brand-600 dark:text-brand-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">Thống kê</span>
        </button>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => handleTabClick('users')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'users'
                ? 'text-purple-600 dark:text-purple-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px]">Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
