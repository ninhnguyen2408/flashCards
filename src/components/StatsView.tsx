import React, { useState } from 'react';
import type { Card, UserStats, Achievement } from '../types/flashcard';
import { 
  Flame, 
  Trophy, 
  Award, 
  Target, 
  BookOpen, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  Lock, 
  Sliders, 
  Crown
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { soundEffects } from '../services/soundEffects';


interface StatsViewProps {
  stats: UserStats;
  cards: Card[];
  achievements: Achievement[];
  onUpdateStats: (newStats: UserStats) => void;
  onResetData: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  stats,
  cards,
  achievements,
  onUpdateStats,
  onResetData,
}) => {
  const [dailyGoalInput, setDailyGoalInput] = useState(stats.dailyGoal || 10);
  const [voiceAccentInput, setVoiceAccentInput] = useState<'en-US' | 'en-GB'>(stats.voiceAccent || 'en-US');
  const [voiceSpeedInput, setVoiceSpeedInput] = useState(stats.voiceSpeed || 0.9);

  const totalCards = cards.length;
  const masteredCards = cards.filter(c => c.mastery === 'mastered').length;
  const reviewingCards = cards.filter(c => c.mastery === 'reviewing').length;
  const learningCards = cards.filter(c => c.mastery === 'learning').length;
  const newCards = cards.filter(c => c.srsLevel === 0 || c.mastery === 'new').length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playPop();
    const updated: UserStats = {
      ...stats,
      dailyGoal: Number(dailyGoalInput),
      voiceAccent: voiceAccentInput,
      voiceSpeed: Number(voiceSpeedInput),
    };
    onUpdateStats(updated);
    StorageService.saveStats(updated);
    alert('Đã lưu cài đặt học tập thành công!');
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-6 h-6 text-orange-500" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-500" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-blue-500" />;
      case 'Target': return <Target className="w-6 h-6 text-rose-500" />;
      case 'Crown': return <Crown className="w-6 h-6 text-yellow-500" />;
      default: return <Award className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Thống Kê Tiến Độ &amp; Thành Tích
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi hành trình chinh phục từ vựng và mở khóa các danh hiệu học giả.
        </p>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="glass-card p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chuỗi Học</span>
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-500">
              <Flame className="w-5 h-5 fill-orange-500 animate-wiggle" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.streak} <span className="text-xs font-normal text-slate-400">ngày</span>
          </div>
          <p className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">
            Duy trì học mỗi ngày
          </p>
        </div>

        {/* Total Reviewed */}
        <div className="glass-card p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lượt Ôn Tập</span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-500">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalCardsReviewed} <span className="text-xs font-normal text-slate-400">lượt</span>
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
            Tổng số thẻ đã lật
          </p>
        </div>

        {/* Mastered */}
        <div className="glass-card p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đã Thành Thạo</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {masteredCards} <span className="text-xs font-normal text-slate-400">từ</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {totalCards ? Math.round((masteredCards / totalCards) * 100) : 0}% trên tổng số từ
          </p>
        </div>

        {/* Level & XP */}
        <div className="glass-card p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cấp Độ &amp; XP</span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-500">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Lv.{stats.level} <span className="text-xs font-bold text-brand-500">({stats.xp} XP)</span>
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            Học giả tích cực
          </p>
        </div>
      </div>

      {/* Mastery Breakdown */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Phân Phối Cấp Độ Ghi Nhớ (SRS Memory Stage)
        </h3>

        {/* Segmented Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-500 h-full transition-all" 
            style={{ width: `${totalCards ? (masteredCards / totalCards) * 100 : 0}%` }}
          />
          <div 
            className="bg-blue-500 h-full transition-all" 
            style={{ width: `${totalCards ? (reviewingCards / totalCards) * 100 : 0}%` }}
          />
          <div 
            className="bg-amber-500 h-full transition-all" 
            style={{ width: `${totalCards ? (learningCards / totalCards) * 100 : 0}%` }}
          />
          <div 
            className="bg-slate-300 dark:bg-slate-700 h-full transition-all" 
            style={{ width: `${totalCards ? (newCards / totalCards) * 100 : 0}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div>
              <span className="text-xs text-slate-400 block font-bold">Thành Thạo</span>
              <strong className="text-sm">{masteredCards} từ</strong>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <div>
              <span className="text-xs text-slate-400 block font-bold">Đang Nhớ Tốt</span>
              <strong className="text-sm">{reviewingCards} từ</strong>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div>
              <span className="text-xs text-slate-400 block font-bold">Đang Học</span>
              <strong className="text-sm">{learningCards} từ</strong>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <div>
              <span className="text-xs text-slate-400 block font-bold">Từ Mới</span>
              <strong className="text-sm">{newCards} từ</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Huy Hiệu &amp; Thành Tích
            </h3>
            <p className="text-xs text-slate-500">
              Đã mở khóa: {achievements.filter(a => a.unlocked).length} / {achievements.length} huy hiệu
            </p>
          </div>
          <div className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                ach.unlocked
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                ach.unlocked ? 'bg-amber-100 dark:bg-amber-900/60' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                {ach.unlocked ? getAchievementIcon(ach.icon) : <Lock className="w-5 h-5 text-slate-400" />}
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {ach.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {ach.description}
                </p>
                {ach.unlocked && (
                  <span className="inline-block text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1 uppercase">
                    ✓ Đã Đạt
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Preferences & Settings */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Cài Đặt Học Tập &amp; Giọng Đọc
          </h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Mục Tiêu Số Thẻ / Ngày
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={dailyGoalInput}
                onChange={(e) => setDailyGoalInput(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Giọng Đọc Phát Âm
              </label>
              <select
                value={voiceAccentInput}
                onChange={(e) => setVoiceAccentInput(e.target.value as 'en-US' | 'en-GB')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              >
                <option value="en-US">Anh - Mỹ (US Accent)</option>
                <option value="en-GB">Anh - Anh (UK Accent)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tốc Độ Đọc TTS: {voiceSpeedInput}x
            </label>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={voiceSpeedInput}
              onChange={(e) => setVoiceSpeedInput(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (confirm('CẢNH BÁO: Thao tác này sẽ đặt lại toàn bộ dữ liệu về mặc định ban đầu. Bạn có chắc chắn không?')) {
                  onResetData();
                }
              }}
              className="text-xs text-rose-500 hover:underline font-bold"
            >
              Đặt lại dữ liệu gốc (Factory Reset)
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Lưu cài đặt
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
