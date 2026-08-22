import React, { useState } from 'react';
import type { Card, Deck } from '../types/flashcard';
import { 
  ArrowLeft, 
  Mic, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Trophy, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { SpeechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';


interface VoicePronounceGameProps {
  cards: Card[];
  decks: Deck[];
  selectedDeck?: Deck;
  onExit: () => void;
  onFinished: (xp: number) => void;
  voiceAccent?: 'en-US' | 'en-GB';
}

export const VoicePronounceGame: React.FC<VoicePronounceGameProps> = ({
  cards,
  decks,
  selectedDeck,
  onExit,
  onFinished,
  voiceAccent = 'en-US',
}) => {
  const [activeDeckId, setActiveDeckId] = useState<string>(selectedDeck?.id || 'all');
  const [practiceCards, setPracticeCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<{ score: number; transcript: string; isCorrect: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const availableCards = activeDeckId === 'all'
    ? cards
    : cards.filter(c => c.deckId === activeDeckId);

  const initGame = () => {
    if (availableCards.length === 0) return;
    const shuffled = [...availableCards].sort(() => 0.5 - Math.random()).slice(0, 10);
    setPracticeCards(shuffled);
    setCurrentIndex(0);
    setResult(null);
    setErrorMsg(null);
    setTotalXP(0);
    setIsFinished(false);
  };

  React.useEffect(() => {
    initGame();
  }, [activeDeckId, cards.length]);

  const currentCard = practiceCards[currentIndex];

  const handleStartRecord = () => {
    if (!currentCard || isListening) return;

    setErrorMsg(null);
    setResult(null);

    const stopFn = SpeechService.listenAndGrade(
      currentCard.word,
      (score, transcript, isCorrect) => {
        setIsListening(false);
        setResult({ score, transcript, isCorrect });

        if (isCorrect) {
          soundEffects.playCorrect();
          const earned = score >= 90 ? 20 : 15;
          setTotalXP(prev => prev + earned);
        } else {
          soundEffects.playIncorrect();
        }
      },
      (err) => {
        setIsListening(false);
        setErrorMsg(err);
      },
      () => {
        setIsListening(true);
      }
    );

    // Safety timeout
    setTimeout(() => {
      if (isListening) {
        stopFn();
        setIsListening(false);
      }
    }, 6000);
  };

  const handleNext = () => {
    soundEffects.playPop();
    if (currentIndex + 1 < practiceCards.length) {
      setCurrentIndex(prev => prev + 1);
      setResult(null);
      setErrorMsg(null);
    } else {
      setIsFinished(true);
      soundEffects.playVictory();
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}
      onFinished(Math.max(10, totalXP));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Top Bar */}
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
          Từ {currentIndex + 1} / {practiceCards.length}
        </span>
      </div>

      {!isFinished && currentCard ? (
        <div className="space-y-6">
          
          {/* Target Word Card */}
          <div className="glass-card rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-2">
              Phòng Luyện Phát Âm Trí Tuệ Nhân Tạo (AI Speech)
            </span>

            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">
              {currentCard.word}
            </h2>

            <p className="text-xl font-serif text-brand-600 dark:text-brand-400 mb-3">
              {currentCard.ipa}
            </p>

            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-6">
              "{currentCard.meaning}"
            </p>

            {/* Listen button */}
            <button
              onClick={() => SpeechService.speak(currentCard.word, { lang: voiceAccent })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              <Volume2 className="w-4 h-4 text-brand-500" />
              <span>Nghe mẫu phát âm chuẩn</span>
            </button>
          </div>

          {/* Big Microphone Recording Control */}
          <div className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl text-center space-y-4">
            <button
              onClick={handleStartRecord}
              disabled={isListening}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white transition-all shadow-2xl ${
                isListening
                  ? 'bg-rose-500 scale-110 shadow-rose-500/50 animate-pulse'
                  : 'bg-gradient-to-tr from-brand-600 to-indigo-600 hover:scale-105 active:scale-95 shadow-brand-500/30'
              }`}
            >
              <Mic className={`w-10 h-10 ${isListening ? 'animate-bounce' : ''}`} />
              {isListening && (
                <span className="absolute -inset-2 rounded-full border-4 border-rose-400 animate-ping opacity-60 pointer-events-none" />
              )}
            </button>

            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-base">
                {isListening ? '🎙️ Đang nghe... Hãy đọc to và rõ ràng!' : 'Bấm vào Micro để bắt đầu nói'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Nói chính xác từ: <strong className="text-brand-600 dark:text-brand-400">{currentCard.word}</strong>
              </p>
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className={`p-6 rounded-3xl border-2 text-center space-y-3 ${
              result.isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-200'
            }`}>
              <div className="flex items-center justify-center gap-2">
                {result.isCorrect ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-amber-500" />
                )}
                <span className="text-2xl font-black">
                  {result.score}% Chính Xác
                </span>
              </div>

              <p className="text-xs sm:text-sm">
                Bạn đã phát âm: <strong>"{result.transcript || '...'}"</strong>
              </p>

              <div className="pt-2">
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{currentIndex + 1 < practiceCards.length ? 'Từ tiếp theo' : 'Xem tổng kết'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Summary */
        <div className="glass-card rounded-3xl p-8 text-center animate-bounce-short">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-white flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Hoàn Thành Buổi Luyện Nói!
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Khẩu hình và ngữ điệu của bạn đang cải thiện rất rõ rệt mỗi ngày.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-extrabold text-lg mb-6">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>+{Math.max(10, totalXP)} XP</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={initGame}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm"
            >
              Luyện lại
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
