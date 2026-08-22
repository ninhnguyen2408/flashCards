import React, { useState } from 'react';
import type { Card, Deck, UserStats } from '../types/flashcard';
import { DeckIcon } from './DeckIcon';
import {
  Plus,
  Search,
  BookOpen,
  Flame,
  Sparkles,
  Layers,
  ArrowRight,
  Trash2,
  Edit3,
  BrainCircuit
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { isCardDue } from '../services/srsAlgorithm';

interface DeckListProps {
  decks: Deck[];
  cards: Card[];
  stats: UserStats;
  onSelectDeck: (deck: Deck) => void;
  onStudyDeck: (deck?: Deck) => void;
  onCreateDeck: () => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả 42 Chủ đề' },
  { id: 'people_feelings', label: 'Con người & Cảm xúc' },
  { id: 'food_dining', label: 'Ẩm thực & Nhà bếp' },
  { id: 'daily_shopping', label: 'Đời sống & Mua sắm' },
  { id: 'nature_environment', label: 'Thiên nhiên & Môi trường' },
  { id: 'education_career', label: 'Học tập & Công việc' },
  { id: 'places_services', label: 'Địa điểm & Dịch vụ' },
  { id: 'leisure_festivals', label: 'Giải trí & Lễ hội' },
  { id: 'custom', label: 'Tự tạo' },
];

export const DeckList: React.FC<DeckListProps> = ({
  decks,
  cards,
  stats,
  onSelectDeck,
  onStudyDeck,
  onCreateDeck,
  onEditDeck,
  onDeleteDeck,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const dueCardsCount = cards.filter(isCardDue).length;
  const dailyProgressPercent = Math.min(100, Math.round(((stats.studiedToday || 0) / (stats.dailyGoal || 10)) * 100));

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'people_feelings': return 'Con người & Cảm xúc';
      case 'food_dining': return 'Ẩm thực & Nhà bếp';
      case 'daily_shopping': return 'Đời sống & Mua sắm';
      case 'nature_environment': return 'Thiên nhiên & Môi trường';
      case 'education_career': return 'Học tập & Công việc';
      case 'places_services': return 'Địa điểm & Dịch vụ';
      case 'leisure_festivals': return 'Giải trí & Lễ hội';
      default: return cat.replace(/_/g, ' ');
    }
  };

  const filteredDecks = decks.filter(d => {
    const matchCategory = activeCategory === 'all' || d.category === activeCategory;
    const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.topic && d.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });


  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-6 space-y-8">

      {/* Hero Learning Dashboard Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-10 shadow-2xl shadow-brand-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-brand-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Text */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-brand-100 border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Phương Pháp Lặp Lại Ngắt Quãng (Spaced Repetition)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Ghi nhớ từ vựng tiếng Anh <br className="hidden sm:inline" />nhanh hơn gấp 3 lần
            </h1>
            <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
              Học với thuật toán ghi nhớ thông minh, luyện phát âm chuẩn AI và làm chủ hơn 3000 từ vựng cốt lõi.
            </p>

            {/* Daily Goal & Streak Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <Flame className="w-5 h-5 text-orange-400 fill-orange-400 animate-wiggle" />
                <div>
                  <span className="text-xs text-brand-200 block">Chuỗi ngày</span>
                  <span className="font-extrabold text-sm">{stats.streak} ngày liên tiếp</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <div>
                  <div className="flex justify-between text-xs text-brand-200 mb-1 font-medium">
                    <span>Mục tiêu hôm nay</span>
                    <span className="font-bold text-white ml-2">{stats.studiedToday || 0}/{stats.dailyGoal || 10} từ</span>
                  </div>
                  <div className="w-32 bg-black/20 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${dailyProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="shrink-0 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-center space-y-4 max-w-xs w-full">
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-200 uppercase tracking-wider">ÔN TẬP HÔM NAY</span>
              <div className="text-4xl font-black text-white">
                {dueCardsCount} <span className="text-sm font-normal text-brand-200">từ đến hạn</span>
              </div>
            </div>

            <button
              onClick={() => onStudyDeck(undefined)}
              disabled={cards.length === 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 active:scale-95 text-brand-700 font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <BrainCircuit className="w-5 h-5 text-brand-600" />
              <span>Học tất cả từ đến hạn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Categories, Search, New Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playPop();
                setActiveCategory(tab.id);
              }}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeCategory === tab.id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-600'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Create Deck Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm bộ thẻ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={onCreateDeck}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 whitespace-nowrap transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bộ thẻ</span>
          </button>
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl p-6">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Không tìm thấy bộ thẻ nào</h4>
          <p className="text-xs text-slate-500 mt-1">Hãy thử tìm từ khóa khác hoặc bấm nút "Tạo bộ thẻ" ở trên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredDecks.map((deck) => {
            const deckCards = cards.filter(c => c.deckId === deck.id);
            const mastered = deckCards.filter(c => c.mastery === 'mastered').length;
            const reviewing = deckCards.filter(c => c.mastery === 'reviewing').length;
            const learning = deckCards.filter(c => c.mastery === 'learning').length;
            const progressPercent = deckCards.length > 0 ? Math.round((mastered / deckCards.length) * 100) : 0;

            return (
              <div
                key={deck.id}
                onClick={() => onSelectDeck(deck)}
                className="group relative bg-white dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Top Header of Card: Icon + (Title & Description) on Left, Category & CEFR Badges on Far Right */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${deck.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5`}>
                        <DeckIcon name={deck.icon} category={deck.category} className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight truncate">
                          {deck.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate mt-1 leading-snug">
                          {deck.description}
                        </p>
                      </div>
                    </div>

                    {/* Right side: Category & CEFR badges */}
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60 whitespace-nowrap">
                        {getCategoryLabel(deck.category)}
                      </span>
                      {deck.cefrLevel && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          {deck.cefrLevel}
                        </span>
                      )}

                      {/* Edit / Delete actions for custom decks */}
                      {deck.isCustom && (
                        <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onEditDeck(deck)}
                            className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Sửa bộ thẻ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa bộ thẻ "${deck.title}" và tất cả từ vựng trong đó?`)) {
                                onDeleteDeck(deck.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Xóa bộ thẻ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Stats Breakdown */}
                  <div className="space-y-1.5 my-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Tiến độ thành thạo:</span>
                      <span className="text-brand-600 dark:text-brand-400 font-extrabold">{progressPercent}% ({mastered}/{deckCards.length} từ)</span>
                    </div>

                    {/* Multi-segment Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${deckCards.length ? (mastered / deckCards.length) * 100 : 0}%` }}
                        title={`Đã thuộc: ${mastered}`}
                      />
                      <div
                        className="bg-blue-500 h-full transition-all"
                        style={{ width: `${deckCards.length ? (reviewing / deckCards.length) * 100 : 0}%` }}
                        title={`Đang nhớ tốt: ${reviewing}`}
                      />
                      <div
                        className="bg-amber-500 h-full transition-all"
                        style={{ width: `${deckCards.length ? (learning / deckCards.length) * 100 : 0}%` }}
                        title={`Đang học: ${learning}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {deckCards.length} thẻ từ vựng
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectDeck(deck)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => onStudyDeck(deck)}
                      disabled={deckCards.length === 0}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Học ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
