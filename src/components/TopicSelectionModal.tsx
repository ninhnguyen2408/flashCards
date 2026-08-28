import React, { useState } from 'react';
import type { Deck } from '../types/flashcard';
import { DeckIcon } from './DeckIcon';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { 
  X, 
  Check, 
  Search, 
  Compass, 
  ArrowRight,
  BookmarkCheck
} from 'lucide-react';

interface TopicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  allDecks: Deck[];
  currentSelectedDeckIds: string[];
  onSaveSelection: (selectedIds: string[]) => void;
  isFirstTimeOnboarding?: boolean;
}

const CATEGORY_GROUPS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'people_feelings', label: 'Con người & Cảm xúc' },
  { id: 'food_dining', label: 'Ẩm thực & Nhà bếp' },
  { id: 'daily_shopping', label: 'Đời sống & Mua sắm' },
  { id: 'nature_environment', label: 'Thiên nhiên & Môi trường' },
  { id: 'education_career', label: 'Học tập & Công việc' },
  { id: 'places_services', label: 'Địa điểm & Dịch vụ' },
  { id: 'leisure_festivals', label: 'Giải trí & Lễ hội' },
];

const PRESETS = [
  {
    id: 'beginner',
    label: '🎒 Người Mới Bắt Đầu (A1)',
    description: 'Chủ đề nền tảng dễ nhớ nhất',
    deckIds: ['deck-family', 'deck-vegetables', 'deck-clothes', 'deck-numbers', 'deck-routines', 'deck-animals', 'deck-supplies', 'deck-countries'],
  },
  {
    id: 'travel',
    label: '✈️ Du Lịch & Khám Phá',
    description: 'Giao tiếp sân bay, khách sạn, ẩm thực',
    deckIds: ['deck-travel', 'deck-traffic', 'deck-food-dishes', 'deck-beverages', 'deck-countries', 'deck-shopping', 'deck-weather', 'deck-hometown'],
  },
  {
    id: 'career',
    label: '💼 Đi Làm & Công Sở',
    description: 'Văn phòng, đàm phán, ngân hàng',
    deckIds: ['deck-work', 'deck-occupations', 'deck-banking', 'deck-postoffice', 'deck-school', 'deck-personality', 'deck-health'],
  },
  {
    id: 'daily',
    label: '🗣️ Giao Tiếp Đời Sống',
    description: 'Cảm xúc, thời trang, giải trí',
    deckIds: ['deck-emotions', 'deck-fashion', 'deck-shops', 'deck-sports', 'deck-movies', 'deck-midautumn', 'deck-tet', 'deck-christmas'],
  },
];

export const TopicSelectionModal: React.FC<TopicSelectionModalProps> = ({
  isOpen,
  onClose,
  allDecks,
  currentSelectedDeckIds,
  onSaveSelection,
  isFirstTimeOnboarding = false,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (currentSelectedDeckIds && currentSelectedDeckIds.length > 0) {
      return currentSelectedDeckIds;
    }
    // Default recommended starter topics
    return ['deck-family', 'deck-food-dishes', 'deck-clothes', 'deck-travel', 'deck-routines', 'deck-school'];
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const toggleDeck = (deckId: string) => {
    soundEffects.playPop();
    setSelectedIds(prev => 
      prev.includes(deckId) 
        ? prev.filter(id => id !== deckId) 
        : [...prev, deckId]
    );
  };

  const applyPreset = (presetDeckIds: string[]) => {
    soundEffects.playPop();
    setSelectedIds(presetDeckIds);
  };

  const handleSelectAll = () => {
    soundEffects.playPop();
    const systemDeckIds = allDecks.filter(d => !d.isCustom).map(d => d.id);
    setSelectedIds(systemDeckIds);
  };

  const handleClearAll = () => {
    soundEffects.playPop();
    setSelectedIds([]);
  };

  const handleSave = () => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 chủ đề để bắt đầu lộ trình học!');
      return;
    }

    soundEffects.playVictory();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    onSaveSelection(selectedIds);
    onClose();
  };

  const filteredDecks = allDecks
    .filter(d => !d.isCustom) // Only system category decks
    .filter(d => {
      const matchCat = activeCategory === 'all' || d.category === activeCategory;
      const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.topic && d.topic.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto transition-all">
        
        {/* Modal Header Banner */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-brand-50/50 via-indigo-50/50 to-purple-50/50 dark:from-slate-900 dark:to-slate-800/80">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {isFirstTimeOnboarding ? 'Chọn Chủ Đề Bạn Muốn Học 🎯' : 'Tùy Chỉnh Lộ Trình Chủ Đề 🎯'}
                  </h3>
                  {isFirstTimeOnboarding && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Khởi đầu mới
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Chọn các chủ đề phù hợp với mục tiêu của bạn để danh sách học tập gọn gàng và hiệu quả nhất.
                </p>
              </div>
            </div>

            {!isFirstTimeOnboarding && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Preset Goal Pills */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              ⚡ Gợi ý chọn nhanh theo mục tiêu:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.deckIds)}
                  className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 text-slate-700 dark:text-slate-200 transition-all text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>{preset.label}</span>
                </button>
              ))}

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

              <button
                onClick={handleSelectAll}
                className="px-3 py-2 rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold whitespace-nowrap hover:bg-brand-100 transition-colors"
              >
                Chọn tất cả ({allDecks.filter(d => !d.isCustom).length})
              </button>

              <button
                onClick={handleClearAll}
                className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 text-xs font-bold whitespace-nowrap transition-colors"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 sm:px-6 pb-2 space-y-3 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm chủ đề (vd: Gia đình, Ẩm thực, Du lịch, Công việc...)"
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_GROUPS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundEffects.playPop();
                  setActiveCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Grid List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 scrollbar-thin">
          {filteredDecks.map((deck) => {
            const isSelected = selectedIds.includes(deck.id);

            return (
              <div
                key={deck.id}
                onClick={() => toggleDeck(deck.id)}
                className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isSelected
                    ? 'border-brand-600 dark:border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 shadow-md shadow-brand-500/10 scale-[1.01]'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50'
                }`}
              >
                {/* Topic Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${deck.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                  <DeckIcon name={deck.icon} category={deck.category} className="w-5 h-5" />
                </div>

                {/* Topic Info */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {deck.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2">
                    {deck.cefrLevel && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                        {deck.cefrLevel}
                      </span>
                    )}
                    {deck.topic && (
                      <span className="text-[10px] text-slate-400 truncate">
                        • {deck.topic}
                      </span>
                    )}
                  </div>
                </div>

                {/* Checkbox Indicator */}
                <div className={`absolute right-3.5 top-3.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm scale-110'
                    : 'border-2 border-slate-300 dark:border-slate-700'
                }`}>
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-black text-xs flex items-center justify-center">
              {selectedIds.length}
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                Đã chọn {selectedIds.length} / {allDecks.filter(d => !d.isCustom).length} chủ đề
              </span>
              <span className="text-[10px] text-slate-400">
                {selectedIds.length === 0 ? 'Vui lòng chọn ít nhất 1 chủ đề' : 'Lộ trình học đã sẵn sàng'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFirstTimeOnboarding && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={selectedIds.length === 0}
              className={`px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white shadow-lg flex items-center gap-2 transition-all ${
                selectedIds.length > 0
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-brand-500/25 active:scale-95'
                  : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{isFirstTimeOnboarding ? 'Bắt Đầu Học Ngay' : 'Lưu Lộ Trình Học'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
