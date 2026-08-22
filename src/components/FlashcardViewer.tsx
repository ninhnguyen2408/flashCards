import React, { useState, useEffect } from 'react';
import type { Card, SRSRating } from '../types/flashcard';
import { 
  Volume2, 
  RotateCw, 
  Lightbulb, 
  Mic, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';
import { SpeechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';

interface FlashcardViewerProps {
  card: Card;
  onRate: (rating: SRSRating) => void;
  voiceAccent?: 'en-US' | 'en-GB';
  voiceSpeed?: number;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  card,
  onRate,
  voiceAccent = 'en-US',
  voiceSpeed = 0.9,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{ score: number; transcript: string; isCorrect: boolean } | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Auto-reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setVoiceResult(null);
    setVoiceError(null);
  }, [card.id]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' && isFlipped) {
        handleRate('again');
      } else if (e.key === '2' && isFlipped) {
        handleRate('hard');
      } else if (e.key === '3' && isFlipped) {
        handleRate('good');
      } else if (e.key === '4' && isFlipped) {
        handleRate('easy');
      } else if (e.key.toLowerCase() === 'r') {
        handleSpeakWord();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, card]);

  const handleFlip = () => {
    soundEffects.playFlip();
    setIsFlipped(!isFlipped);
  };

  const handleSpeakWord = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSpeaking(true);
    await SpeechService.speak(card.word, { lang: voiceAccent, rate: voiceSpeed });
    setIsSpeaking(false);
  };

  const handleSpeakSentence = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSpeaking(true);
    await SpeechService.speak(card.exampleEn, { lang: voiceAccent, rate: voiceSpeed });
    setIsSpeaking(false);
  };

  const handleVoiceTest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isListening) return;

    setVoiceError(null);
    setVoiceResult(null);

    const stopFn = SpeechService.listenAndGrade(
      card.word,
      (score, transcript, isCorrect) => {
        setIsListening(false);
        setVoiceResult({ score, transcript, isCorrect });
        if (isCorrect) {
          soundEffects.playCorrect();
        } else {
          soundEffects.playIncorrect();
        }
      },
      (err) => {
        setIsListening(false);
        setVoiceError(err);
      },
      () => {
        setIsListening(true);
      }
    );

    // Auto cancel after 5 seconds if no speech
    setTimeout(() => {
      if (isListening) {
        stopFn();
        setIsListening(false);
      }
    }, 5000);
  };

  const handleRate = (rating: SRSRating) => {
    if (rating === 'again') {
      soundEffects.playIncorrect();
    } else {
      soundEffects.playCorrect();
    }
    onRate(rating);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      
      {/* 3D Flashcard Container */}
      <div 
        className="w-full h-[400px] sm:h-[450px] perspective-1000 cursor-pointer group"
        onClick={handleFlip}
      >
        <div 
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform rounded-3xl shadow-xl hover:shadow-2xl border border-slate-200/80 dark:border-slate-800/80 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT SIDE ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-slate-900 overflow-hidden">
            {/* Top Bar on Front */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50">
                {card.partOfSpeech}
              </span>
              
              <div className="flex items-center gap-1.5">
                {/* Voice Test button on card */}
                <button
                  onClick={handleVoiceTest}
                  disabled={isListening}
                  title="Luyện đọc từ này qua Micro"
                  className={`p-2.5 rounded-2xl transition-all ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
                </button>

                {/* Speak button */}
                <button
                  onClick={handleSpeakWord}
                  disabled={isSpeaking}
                  title="Nghe phát âm chuẩn"
                  className="p-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white shadow-md shadow-brand-500/30 transition-all"
                >
                  <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>

            {/* Center Content: Word & IPA */}
            <div className="flex flex-col items-center text-center my-auto">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                {card.word}
              </h2>
              <p className="text-xl sm:text-2xl font-serif text-brand-600 dark:text-brand-400 font-medium tracking-wide">
                {card.ipa}
              </p>

              {/* Voice recognition live feedback */}
              {isListening && (
                <div className="mt-4 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-bounce-short">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  Đang nghe bạn nói... Hãy đọc to: "{card.word}"
                </div>
              )}

              {voiceResult && !isListening && (
                <div className={`mt-4 px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                  voiceResult.isCorrect 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                }`}>
                  {voiceResult.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span>Điểm phát âm: <strong>{voiceResult.score}%</strong> (Bạn nói: "{voiceResult.transcript}")</span>
                </div>
              )}

              {voiceError && !isListening && (
                <p className="mt-3 text-xs text-rose-500">{voiceError}</p>
              )}
            </div>

            {/* Bottom Hint to Flip */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-brand-500 transition-colors">
              <RotateCw className="w-4 h-4 animate-spin-slow" />
              <span>Chạm hoặc bấm [Space] để lật xem nghĩa & ví dụ</span>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-slate-900 overflow-y-auto">
            {/* Top Bar on Back */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white">{card.word}</span>
                <span className="text-xs text-slate-500 font-serif">{card.ipa}</span>
              </div>
              <button
                onClick={handleSpeakWord}
                className="p-1.5 rounded-xl text-slate-500 hover:text-brand-500 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Meaning & Details */}
            <div className="my-auto space-y-4 py-2 text-left">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Ý nghĩa</span>
                <p className="text-xl sm:text-2xl font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                  {card.meaning}
                </p>
              </div>

              {/* Example sentence */}
              {card.exampleEn && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ví dụ</span>
                    <button
                      onClick={handleSpeakSentence}
                      title="Nghe đọc câu ví dụ"
                      className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 font-semibold hover:underline"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe câu</span>
                    </button>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200">
                    "{card.exampleEn}"
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 italic">
                    "{card.exampleVi}"
                  </p>
                </div>
              )}

              {/* Mnemonic Memory Tip */}
              {card.mnemonic && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/40 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Mẹo ghi nhớ: </span>
                    <span className="text-xs text-amber-700 dark:text-amber-400">{card.mnemonic}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Back flip hint */}
            <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2">
              Lật lại mặt trước (Bấm Space hoặc chạm thẻ)
            </div>
          </div>
        </div>
      </div>

      {/* ================= ACTION / SRS RATING BUTTONS ================= */}
      <div className="w-full mt-6">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-brand-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <RotateCw className="w-5 h-5" />
            <span>Lật thẻ kiểm tra nghĩa [Space]</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Rating 1: Again */}
            <button
              onClick={() => handleRate('again')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border-2 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 active:scale-95 transition-all shadow-sm"
            >
              <span className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1">
                🔴 Lại [1]
              </span>
              <span className="text-[11px] text-rose-500 font-medium mt-0.5">1 ngày</span>
            </button>

            {/* Rating 2: Hard */}
            <button
              onClick={() => handleRate('hard')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-2 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 active:scale-95 transition-all shadow-sm"
            >
              <span className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1">
                🟠 Khó [2]
              </span>
              <span className="text-[11px] text-amber-500 font-medium mt-0.5">3 ngày</span>
            </button>

            {/* Rating 3: Good */}
            <button
              onClick={() => handleRate('good')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 active:scale-95 transition-all shadow-sm"
            >
              <span className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1">
                🟢 Tốt [3]
              </span>
              <span className="text-[11px] text-emerald-500 font-medium mt-0.5">6 ngày</span>
            </button>

            {/* Rating 4: Easy */}
            <button
              onClick={() => handleRate('easy')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 active:scale-95 transition-all shadow-sm"
            >
              <span className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1">
                ⚡ Dễ [4]
              </span>
              <span className="text-[11px] text-indigo-500 font-medium mt-0.5">12+ ngày</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
