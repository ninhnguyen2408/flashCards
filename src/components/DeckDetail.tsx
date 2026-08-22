import React, { useState } from 'react';
import type { Card, Deck } from '../types/flashcard';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Volume2, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Gamepad2, 
  Sparkles, 
  FileSpreadsheet, 
  Mic
} from 'lucide-react';
import { SpeechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';


interface DeckDetailProps {
  deck: Deck;
  cards: Card[];
  onBack: () => void;
  onStartStudy: (deck: Deck) => void;
  onStartQuiz: (deck: Deck) => void;
  onStartSpelling: (deck: Deck) => void;
  onStartMatch: (deck: Deck) => void;
  onStartVoice: (deck: Deck) => void;
  onAddCard: (deckId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onOpenImportExport: (deckId: string) => void;
}

export const DeckDetail: React.FC<DeckDetailProps> = ({
  deck,
  cards,
  onBack,
  onStartStudy,
  onStartQuiz,
  onStartSpelling,
  onStartMatch,
  onStartVoice,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onOpenImportExport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMastery, setFilterMastery] = useState<'all' | Card['mastery']>('all');

  const deckCards = cards.filter(c => c.deckId === deck.id);

  const filteredCards = deckCards.filter(c => {
    const matchSearch = c.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMastery = filterMastery === 'all' || c.mastery === filterMastery;
    return matchSearch && matchMastery;
  });

  const masteredCount = deckCards.filter(c => c.mastery === 'mastered').length;
  const reviewingCount = deckCards.filter(c => c.mastery === 'reviewing').length;
  const learningCount = deckCards.filter(c => c.mastery === 'learning').length;
  const newCount = deckCards.filter(c => c.srsLevel === 0 || c.mastery === 'new').length;

  const handleSpeak = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    SpeechService.speak(word);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách bộ thẻ</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenImportExport(deck.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            title="Import / Export bộ thẻ này"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Import/Export</span>
          </button>

          <button
            onClick={() => onAddCard(deck.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm từ vựng</span>
          </button>
        </div>
      </div>

      {/* Deck Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-brand-300 border border-white/10">
              <span>{deck.category.toUpperCase()}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{deck.title}</h1>
            <p className="text-slate-300 text-sm max-w-xl">{deck.description}</p>
            
            {/* Quick Stats Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10">
                Tổng cộng: <strong className="text-brand-300">{deckCards.length} từ</strong>
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                Đã thuộc: <strong>{masteredCount} từ</strong>
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300">
                Đang ôn: <strong>{reviewingCount + learningCount} từ</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons Grid */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => onStartStudy(deck)}
              disabled={deckCards.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-brand-500/40 transition-all disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4" />
              <span>Học Flashcard</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartQuiz(deck)}
                disabled={deckCards.length < 4}
                title={deckCards.length < 4 ? 'Cần tối thiểu 4 từ để chơi Quiz' : 'Chơi Trắc Nghiệm'}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>Quiz</span>
              </button>

              <button
                onClick={() => onStartSpelling(deck)}
                disabled={deckCards.length === 0}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Gõ từ</span>
              </button>

              <button
                onClick={() => onStartMatch(deck)}
                disabled={deckCards.length < 4}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Ghép đôi</span>
              </button>

              <button
                onClick={() => onStartVoice(deck)}
                disabled={deckCards.length === 0}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <Mic className="w-4 h-4 text-cyan-400" />
                <span>Luyện nói</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm từ hoặc nghĩa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'new', 'learning', 'reviewing', 'mastered'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMastery(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterMastery === m
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {m === 'all' && `Tất cả (${deckCards.length})`}
              {m === 'new' && `Mới (${newCount})`}
              {m === 'learning' && `Đang học (${learningCount})`}
              {m === 'reviewing' && `Đang nhớ (${reviewingCount})`}
              {m === 'mastered' && `Thuộc (${masteredCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-3xl p-6">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Không tìm thấy từ vựng nào</h4>
          <p className="text-xs text-slate-500 mt-1">Hãy thử tìm từ khác hoặc thêm từ vựng mới vào bộ thẻ này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((c) => (
            <div
              key={c.id}
              className="glass-card p-5 rounded-2xl hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                        {c.word}
                      </h3>
                      <button
                        onClick={(e) => handleSpeak(c.word, e)}
                        title="Nghe phát âm"
                        className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-serif text-slate-500 dark:text-slate-400 font-medium">
                        {c.ipa}
                      </span>
                      {c.cefrLevel && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-300">
                          CEFR {c.cefrLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                    c.mastery === 'mastered'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : c.mastery === 'reviewing'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : c.mastery === 'learning'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {c.mastery === 'mastered' ? 'Thuộc' : c.mastery === 'reviewing' ? 'Nhớ tốt' : c.mastery === 'learning' ? 'Đang học' : 'Mới'}
                  </span>
                </div>

                {/* Meaning */}
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  {c.meaning}
                </p>

                {/* Collocations */}
                {c.collocations && c.collocations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {c.collocations.map((col, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                        {col}
                      </span>
                    ))}
                  </div>
                )}

                {/* Example sentence */}
                {c.exampleEn && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">
                    "{c.exampleEn}"
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Cấp SRS: Lv.{c.srsLevel || 0}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditCard(c)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Chỉnh sửa từ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc chắn muốn xóa từ "${c.word}"?`)) {
                        soundEffects.playPop();
                        onDeleteCard(c.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Xóa từ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
