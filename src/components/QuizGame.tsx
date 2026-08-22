import React, { useState, useEffect } from 'react';
import type { Card, Deck } from '../types/flashcard';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flame,
  HelpCircle
} from 'lucide-react';
import { SpeechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';


interface QuizGameProps {
  cards: Card[];
  decks: Deck[];
  selectedDeck?: Deck;
  onExit: () => void;
  onQuizFinished: (xp: number, isPerfect: boolean) => void;
}

interface Question {
  card: Card;
  type: 'word-to-meaning' | 'meaning-to-word' | 'audio-to-meaning';
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  cards,
  decks,
  selectedDeck,
  onExit,
  onQuizFinished,
}) => {
  const [activeDeckId, setActiveDeckId] = useState<string>(selectedDeck?.id || 'all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isFinished, setIsFinished] = useState(false);

  const availableCards = activeDeckId === 'all' 
    ? cards 
    : cards.filter(c => c.deckId === activeDeckId);

  // Generate quiz questions
  const generateQuiz = () => {
    if (availableCards.length < 4) return;

    const shuffledCards = [...availableCards].sort(() => 0.5 - Math.random()).slice(0, 10);
    const generated: Question[] = shuffledCards.map((c) => {
      // Pick random question type
      const types: Question['type'][] = ['word-to-meaning', 'meaning-to-word', 'audio-to-meaning'];
      const qType = types[Math.floor(Math.random() * types.length)];

      let questionText = '';
      let correctAnswer = '';

      if (qType === 'word-to-meaning') {
        questionText = c.word;
        correctAnswer = c.meaning;
      } else if (qType === 'meaning-to-word') {
        questionText = c.meaning;
        correctAnswer = c.word;
      } else {
        questionText = '🔊 Nghe và chọn từ / nghĩa tương ứng';
        correctAnswer = c.meaning;
      }

      // Generate 3 wrong options from other cards
      const otherCards = availableCards.filter(other => other.id !== c.id);
      const wrongShuffled = [...otherCards].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const wrongOptions = wrongShuffled.map(w => 
        qType === 'meaning-to-word' ? w.word : w.meaning
      );

      const allOptions = [...wrongOptions, correctAnswer].sort(() => 0.5 - Math.random());

      return {
        card: c,
        type: qType,
        questionText,
        options: allOptions,
        correctAnswer,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(15);
    setIsFinished(false);
  };

  useEffect(() => {
    generateQuiz();
  }, [activeDeckId, cards.length]);

  // Audio prompt on audio questions
  useEffect(() => {
    if (questions[currentIndex]?.type === 'audio-to-meaning' && !isFinished) {
      SpeechService.speak(questions[currentIndex].card.word);
    }
    setTimeLeft(15);
  }, [currentIndex, questions]);

  // Timer countdown
  useEffect(() => {
    if (isFinished || isAnswered || questions.length === 0) return;

    if (timeLeft <= 0) {
      handleSelectAnswer('TIMEOUT');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, isFinished, questions.length]);

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    const currentQ = questions[currentIndex];
    const isCorrect = answer === currentQ.correctAnswer;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (isCorrect) {
      soundEffects.playCorrect();
      const bonusStreak = streak >= 3 ? 15 : 10;
      setScore(prev => prev + bonusStreak);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      soundEffects.playIncorrect();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    soundEffects.playPop();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);
    const finalScore = score + (selectedAnswer === questions[currentIndex]?.correctAnswer ? 10 : 0);
    const isPerfect = (finalScore >= questions.length * 10);

    if (isPerfect) {
      soundEffects.playVictory();
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } else {
      soundEffects.playCorrect();
    }

    const earnedXP = Math.max(10, finalScore);
    onQuizFinished(earnedXP, isPerfect);
  };

  if (availableCards.length < 4) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Cần tối thiểu 4 từ vựng</h3>
        <p className="text-sm text-slate-500 mb-6">Bộ thẻ này hiện có ít hơn 4 từ để tạo các câu hỏi trắc nghiệm. Hãy chọn bộ thẻ khác hoặc thêm từ vựng nhé.</p>
        <button
          onClick={onExit}
          className="px-6 py-3 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thoát</span>
        </button>

        {/* Deck selector */}
        <select
          value={activeDeckId}
          onChange={(e) => setActiveDeckId(e.target.value)}
          disabled={!isFinished && currentIndex > 0}
          className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">Tất cả bộ thẻ</option>
          {decks.map(d => (
            <option key={d.id} value={d.id}>{d.title}</option>
          ))}
        </select>

        {/* Score & Streak */}
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-extrabold border border-orange-500/20 animate-wiggle">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>x{streak} Combo</span>
            </div>
          )}
          <div className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
            {score} Điểm
          </div>
        </div>
      </div>

      {!isFinished && currentQ ? (
        <div className="space-y-6">
          
          {/* Progress & Timer Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
            <div className="flex items-center gap-1.5 text-amber-500">
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                timeLeft <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-brand-500'
              }`}
              style={{ width: `${(timeLeft / 15) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 text-center shadow-lg relative">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {currentQ.type === 'word-to-meaning' && 'Nghĩa tiếng Việt của từ này là gì?'}
              {currentQ.type === 'meaning-to-word' && 'Từ tiếng Anh tương ứng với nghĩa này là gì?'}
              {currentQ.type === 'audio-to-meaning' && 'Nghe phát âm và chọn đáp án chính xác'}
            </span>

            <div className="flex items-center justify-center gap-3 my-4">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {currentQ.questionText}
              </h2>
              {currentQ.card && (
                <button
                  onClick={() => SpeechService.speak(currentQ.card.word)}
                  className="p-2.5 rounded-2xl bg-brand-100 hover:bg-brand-200 dark:bg-brand-900/60 dark:hover:bg-brand-800 text-brand-600 dark:text-brand-300 transition-colors"
                  title="Nghe lại phát âm"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {currentQ.card?.ipa && (
              <p className="text-sm font-serif text-slate-400">
                {currentQ.card.ipa}
              </p>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === currentQ.correctAnswer;
              
              let btnStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-brand-400 hover:shadow-md';
              
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-200 font-bold';
                } else {
                  btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectAnswer(opt)}
                  className={`p-4 rounded-2xl border-2 text-left font-semibold text-sm sm:text-base transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-extrabold text-base shadow-xl shadow-brand-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {currentIndex + 1 < questions.length ? 'Câu tiếp theo ➔' : 'Xem kết quả tổng kết 🏆'}
            </button>
          )}

        </div>
      ) : (
        /* Quiz Completion Screen */
        <div className="glass-card rounded-3xl p-8 text-center animate-bounce-short">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>

          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Tổng Kết Trắc Nghiệm!
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Bạn đã hoàn thành 10 câu hỏi trắc nghiệm từ vựng.
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-extrabold text-xl mb-6">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span>+{Math.max(10, score)} XP &amp; {score} Điểm</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 font-bold block">Chuỗi đúng cao nhất</span>
              <span className="text-2xl font-black text-orange-500">{maxStreak} câu liên tiếp</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 font-bold block">Tỷ lệ chính xác</span>
              <span className="text-2xl font-black text-emerald-500">
                {Math.round((score / (questions.length * 10 || 1)) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateQuiz}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại ván mới</span>
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Về trang chính
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
