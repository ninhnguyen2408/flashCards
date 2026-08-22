import React, { useState, useEffect } from 'react';
import type { Card, Deck, SRSRating, StudySessionResult } from '../types/flashcard';
import { FlashcardViewer } from './FlashcardViewer';
import { calculateNextSRS, isCardDue } from '../services/srsAlgorithm';
import { StorageService } from '../services/storageService';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  Layers, 
  ArrowRight
} from 'lucide-react';


interface StudyModeProps {
  deck?: Deck;
  allCards: Card[];
  onUpdateCards: (updatedCards: Card[]) => void;
  onExit: () => void;
  onStudyFinished: (xp: number) => void;
  voiceAccent?: 'en-US' | 'en-GB';
  voiceSpeed?: number;
}

export const StudyMode: React.FC<StudyModeProps> = ({
  deck,
  allCards,
  onUpdateCards,
  onExit,
  onStudyFinished,
  voiceAccent = 'en-US',
  voiceSpeed = 0.9,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'due' | 'new'>('all');
  const [studyQueue, setStudyQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStartTime] = useState<number>(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [statsSummary, setStatsSummary] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    xpEarned: 0,
  });

  // Filter deck cards
  const deckCards = deck ? allCards.filter(c => c.deckId === deck.id) : allCards;

  // Initialize study queue based on filter
  useEffect(() => {
    let filtered = [...deckCards];
    if (filterMode === 'due') {
      filtered = deckCards.filter(isCardDue);
    } else if (filterMode === 'new') {
      filtered = deckCards.filter(c => c.srsLevel === 0 || c.mastery === 'new');
    }

    if (filtered.length === 0 && deckCards.length > 0) {
      filtered = [...deckCards]; // Fallback to all if no due/new cards
    }

    setStudyQueue(filtered);
    setCurrentIndex(0);
    setIsFinished(false);
    setStatsSummary({ again: 0, hard: 0, good: 0, easy: 0, xpEarned: 0 });
  }, [deck?.id, filterMode, allCards.length]);

  const handleRate = (rating: SRSRating) => {
    if (studyQueue.length === 0 || currentIndex >= studyQueue.length) return;

    const currentCard = studyQueue[currentIndex];
    const srsUpdate = calculateNextSRS(currentCard, rating);

    const updatedCard: Card = {
      ...currentCard,
      ...srsUpdate,
      lastReviewed: new Date().toISOString(),
    };

    // Update in global cards list
    const newGlobalCards = allCards.map(c => c.id === updatedCard.id ? updatedCard : c);
    onUpdateCards(newGlobalCards);
    StorageService.saveCards(newGlobalCards);

    // Calculate XP for this card
    let xpGain = 10;
    if (rating === 'easy') xpGain = 20;
    else if (rating === 'good') xpGain = 15;
    else if (rating === 'hard') xpGain = 10;
    else if (rating === 'again') xpGain = 5;

    // Track session stats
    setStatsSummary(prev => ({
      ...prev,
      [rating]: prev[rating as keyof typeof prev] + 1,
      xpEarned: prev.xpEarned + xpGain,
    }));

    // Next card or finish
    if (currentIndex + 1 < studyQueue.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishSession(statsSummary.xpEarned + xpGain);
    }
  };

  const finishSession = (totalXp: number) => {
    setIsFinished(true);
    soundEffects.playVictory();

    // Trigger confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Save session record
    const sessionRecord: StudySessionResult = {
      deckId: deck?.id || 'all',
      totalCards: studyQueue.length,
      againCount: statsSummary.again,
      hardCount: statsSummary.hard,
      goodCount: statsSummary.good,
      easyCount: statsSummary.easy,
      xpEarned: totalXp,
      durationSeconds: Math.round((Date.now() - sessionStartTime) / 1000),
      completedAt: new Date().toISOString(),
    };
    StorageService.saveSession(sessionRecord);

    onStudyFinished(totalXp);
  };

  const handleRestart = () => {
    soundEffects.playPop();
    let filtered = [...deckCards];
    if (filterMode === 'due') {
      filtered = deckCards.filter(isCardDue);
    } else if (filterMode === 'new') {
      filtered = deckCards.filter(c => c.srsLevel === 0 || c.mastery === 'new');
    }
    setStudyQueue(filtered);
    setCurrentIndex(0);
    setIsFinished(false);
    setStatsSummary({ again: 0, hard: 0, good: 0, easy: 0, xpEarned: 0 });
  };

  if (deckCards.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Bộ thẻ chưa có từ vựng</h3>
        <p className="text-sm text-slate-500 mb-6">Hãy thêm một số từ vựng vào bộ thẻ này để bắt đầu học flashcard nhé.</p>
        <button
          onClick={onExit}
          className="px-6 py-3 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors"
        >
          Quay lại danh sách bộ thẻ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thoát</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
            {deck ? deck.title : 'Tất cả từ vựng'}
          </h2>
          {!isFinished && (
            <p className="text-xs text-slate-500">
              Thẻ {currentIndex + 1} / {studyQueue.length}
            </p>
          )}
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-1">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as 'all' | 'due' | 'new')}
            disabled={isFinished}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Tất cả thẻ ({deckCards.length})</option>
            <option value="due">Đến hạn ôn ({deckCards.filter(isCardDue).length})</option>
            <option value="new">Thẻ mới ({deckCards.filter(c => c.srsLevel === 0).length})</option>
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      {!isFinished && (
        <div className="w-full max-w-xl mx-auto mb-6 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${Math.round(((currentIndex + 1) / (studyQueue.length || 1)) * 100)}%` }}
          />
        </div>
      )}

      {/* Main Content: Flashcard or Completion Screen */}
      {!isFinished ? (
        studyQueue[currentIndex] ? (
          <FlashcardViewer
            card={studyQueue[currentIndex]}
            onRate={handleRate}
            voiceAccent={voiceAccent}
            voiceSpeed={voiceSpeed}
          />
        ) : null
      ) : (
        /* Completion Screen */
        <div className="w-full max-w-xl mx-auto glass-card rounded-3xl p-8 text-center animate-bounce-short">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/25">
            <Trophy className="w-10 h-10" />
          </div>

          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Tuyệt vời! Hoàn thành xuất sắc!
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
            Bạn vừa ôn luyện xong <strong className="text-brand-600 dark:text-brand-400">{studyQueue.length} thẻ</strong> từ vựng.
          </p>

          {/* XP Banner */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-extrabold text-lg mb-6">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>+{statsSummary.xpEarned} XP Kinh Nghiệm</span>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="text-xs text-rose-600 font-bold block">Lại</span>
              <span className="text-xl font-extrabold text-rose-700 dark:text-rose-300">{statsSummary.again}</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-xs text-amber-600 font-bold block">Khó</span>
              <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300">{statsSummary.hard}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs text-emerald-600 font-bold block">Tốt</span>
              <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{statsSummary.good}</span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <span className="text-xs text-indigo-600 font-bold block">Dễ</span>
              <span className="text-xl font-extrabold text-indigo-700 dark:text-indigo-300">{statsSummary.easy}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Học lại lượt nữa</span>
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Về danh sách bộ thẻ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
