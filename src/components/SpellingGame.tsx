import React, { useState, useEffect } from 'react';
import type { Card, Deck } from '../types/flashcard';
import { 
  ArrowLeft, 
  Trophy, 
  Sparkles, 
  Volume2, 
  Lightbulb, 
  CheckCircle2, 
  XCircle,
  HelpCircle
} from 'lucide-react';
import { SpeechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';


interface SpellingGameProps {
  cards: Card[];
  decks: Deck[];
  selectedDeck?: Deck;
  onExit: () => void;
  onFinished: (xp: number) => void;
}

export const SpellingGame: React.FC<SpellingGameProps> = ({
  cards,
  decks,
  selectedDeck,
  onExit,
  onFinished,
}) => {
  const [activeDeckId, setActiveDeckId] = useState<string>(selectedDeck?.id || 'all');
  const [spellingCards, setSpellingCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [revealedChars, setRevealedChars] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const availableCards = activeDeckId === 'all'
    ? cards
    : cards.filter(c => c.deckId === activeDeckId);

  const initGame = () => {
    if (availableCards.length === 0) return;
    const shuffled = [...availableCards].sort(() => 0.5 - Math.random()).slice(0, 10);
    setSpellingCards(shuffled);
    setCurrentIndex(0);
    setUserInput('');
    setRevealedChars(0);
    setIsAnswered(false);
    setIsCorrect(false);
    setTotalXP(0);
    setIsFinished(false);
  };

  useEffect(() => {
    initGame();
  }, [activeDeckId, cards.length]);

  const currentCard = spellingCards[currentIndex];

  useEffect(() => {
    if (currentCard && !isFinished) {
      SpeechService.speak(currentCard.word);
      setUserInput('');
      setRevealedChars(0);
      setIsAnswered(false);
      setIsCorrect(false);
    }
  }, [currentIndex, currentCard]);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentCard || isAnswered) return;

    const cleanTarget = currentCard.word.trim().toLowerCase();
    const cleanUser = userInput.trim().toLowerCase();

    const correct = cleanTarget === cleanUser;
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      soundEffects.playCorrect();
      const earned = revealedChars === 0 ? 15 : 10;
      setTotalXP(prev => prev + earned);
    } else {
      soundEffects.playIncorrect();
    }
  };

  const handleHint = () => {
    if (!currentCard || isAnswered) return;
    soundEffects.playPop();
    const target = currentCard.word;
    const nextRevealed = Math.min(target.length, revealedChars + 1);
    setRevealedChars(nextRevealed);
    setUserInput(target.substring(0, nextRevealed));
  };

  const handleNext = () => {
    soundEffects.playPop();
    if (currentIndex + 1 < spellingCards.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      soundEffects.playVictory();
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}
      onFinished(Math.max(10, totalXP));
    }
  };

  if (availableCards.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4">
        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold">Chưa có từ vựng để luyện gõ</h3>
        <button onClick={onExit} className="mt-4 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thoát</span>
        </button>

        <select
          value={activeDeckId}
          onChange={(e) => setActiveDeckId(e.target.value)}
          className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300"
        >
          <option value="all">Tất cả bộ thẻ</option>
          {decks.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>

        <span className="text-xs font-bold text-slate-500">
          Từ {currentIndex + 1} / {spellingCards.length}
        </span>
      </div>

      {!isFinished && currentCard ? (
        <div className="space-y-6">
          {/* Audio & Clue Card */}
          <div className="glass-card rounded-3xl p-8 text-center shadow-lg relative">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block mb-2">
              Luyện Gõ Đúng Chính Tả
            </span>

            {/* Big Audio Play Button */}
            <div className="my-4">
              <button
                onClick={() => SpeechService.speak(currentCard.word)}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/30 flex items-center justify-center mx-auto hover:scale-110 active:scale-95 transition-all"
                title="Nghe phát âm"
              >
                <Volume2 className="w-8 h-8" />
              </button>
            </div>

            <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              "{currentCard.meaning}"
            </p>
            <p className="text-sm font-serif text-slate-400">
              {currentCard.ipa}
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                autoFocus
                disabled={isAnswered}
                placeholder="Nhập từ tiếng Anh chính xác..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className={`w-full text-center text-2xl font-extrabold py-4 px-6 rounded-2xl border-2 bg-white dark:bg-slate-900 transition-all focus:outline-none ${
                  isAnswered
                    ? isCorrect
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40'
                      : 'border-rose-500 text-rose-600 bg-rose-50/50 dark:bg-rose-950/40'
                    : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-brand-500'
                }`}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {!isAnswered ? (
                <>
                  <button
                    type="button"
                    onClick={handleHint}
                    className="px-4 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-sm flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Gợi ý chữ</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-md transition-all"
                  >
                    Kiểm tra kết quả
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-extrabold text-base shadow-lg transition-all"
                >
                  {currentIndex + 1 < spellingCards.length ? 'Từ tiếp theo ➔' : 'Xem tổng kết 🏆'}
                </button>
              )}
            </div>
          </form>

          {/* Feedback */}
          {isAnswered && (
            <div className={`p-4 rounded-2xl border text-center font-bold text-sm flex items-center justify-center gap-2 ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-700 dark:text-rose-300'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Chính xác tuyệt đối! Đáp án là: <strong>{currentCard.word}</strong></span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <span>Chưa đúng rồi! Đáp án đúng là: <strong>{currentCard.word}</strong></span>
                </>
              )}
            </div>
          )}

        </div>
      ) : (
        /* Summary */
        <div className="glass-card rounded-3xl p-8 text-center animate-bounce-short">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Hoàn Thành Bài Luyện Gõ!
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Kỹ năng nhớ mặt chữ và viết chính tả của bạn đã được nâng cao.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-extrabold text-lg mb-6">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>+{Math.max(10, totalXP)} XP</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={initGame}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm"
            >
              Chơi lại
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm"
            >
              Về trang chính
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
