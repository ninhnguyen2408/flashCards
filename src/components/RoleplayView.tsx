import React, { useState, useEffect, useRef } from 'react';
import type { RoleplayScenario, DialogueTurn, RoleplayTurnResult } from '../types/roleplay';
import { ROLEPLAY_SCENARIOS } from '../data/roleplayScenarios';
import { SpeechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Mic, 
  Volume2, 
  CheckCircle2, 
  Sparkles, 
  Trophy, 
  RotateCcw, 
  Lightbulb, 
  Flame, 
  Star,
  Coffee,
  Plane,
  Briefcase,
  Building2,
  ShoppingBag,
  MapPin,
  ChevronRight,
  MessageSquareQuote,
  Eye,
  EyeOff
} from 'lucide-react';

interface RoleplayViewProps {
  onBack: () => void;
  onEarnXP: (xp: number) => void;
  voiceAccent?: 'en-US' | 'en-GB';
  voiceSpeed?: number;
}

export const RoleplayView: React.FC<RoleplayViewProps> = ({
  onBack,
  onEarnXP,
  voiceAccent = 'en-US',
  voiceSpeed = 0.9,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showIpa, setShowIpa] = useState(true);
  const [turnResults, setTurnResults] = useState<Record<string, RoleplayTurnResult>>({});
  const [currentTurnError, setCurrentTurnError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentTurnIndex, selectedScenario, isListening]);

  // When scenario starts or changes, play first AI dialogue
  const handleStartScenario = (scenario: RoleplayScenario) => {
    soundEffects.playPop();
    setSelectedScenario(scenario);
    setCurrentTurnIndex(0);
    setTurnResults({});
    setCurrentTurnError(null);
    setIsCompleted(false);
    setShowHint(false);

    // Speak initial AI turn after brief delay
    const firstTurn = scenario.dialogue[0];
    if (firstTurn && firstTurn.speaker === 'ai') {
      setTimeout(() => {
        playAiTurn(firstTurn.text);
      }, 500);
    }
  };

  const playAiTurn = async (text: string) => {
    setIsAiSpeaking(true);
    await SpeechService.speak(text, { lang: voiceAccent, rate: voiceSpeed });
    setIsAiSpeaking(false);
  };

  const handleSpeakSample = async (text: string) => {
    soundEffects.playPop();
    await SpeechService.speak(text, { lang: voiceAccent, rate: voiceSpeed * 0.9 });
  };

  const handleRecordTurn = (targetTurn: DialogueTurn) => {
    if (isListening || isAiSpeaking) return;

    setCurrentTurnError(null);

    const stopFn = SpeechService.listenAndGrade(
      targetTurn.text,
      (score, transcript, isCorrect) => {
        setIsListening(false);
        const isPassed = isCorrect || score >= 65;

        const result: RoleplayTurnResult = {
          turnId: targetTurn.id,
          score,
          transcript,
          isPassed,
        };

        setTurnResults(prev => ({ ...prev, [targetTurn.id]: result }));

        if (isPassed) {
          soundEffects.playCorrect();
          // Mini celebration
          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.8 },
          });

          // Move to next turn
          advanceToNextTurn(currentTurnIndex + 1);
        } else {
          soundEffects.playIncorrect();
        }
      },
      (err) => {
        setIsListening(false);
        setCurrentTurnError(err);
      },
      () => {
        setIsListening(true);
      }
    );

    // Auto safety timeout 8s
    setTimeout(() => {
      if (isListening) {
        stopFn();
        setIsListening(false);
      }
    }, 8000);
  };

  const advanceToNextTurn = (nextIdx: number) => {
    if (!selectedScenario) return;

    if (nextIdx >= selectedScenario.dialogue.length) {
      // Completed conversation!
      setTimeout(() => {
        handleFinishScenario();
      }, 1000);
      return;
    }

    setCurrentTurnIndex(nextIdx);
    setShowHint(false);

    const nextTurn = selectedScenario.dialogue[nextIdx];
    if (nextTurn && nextTurn.speaker === 'ai') {
      setTimeout(() => {
        playAiTurn(nextTurn.text);
        // After AI finishes speaking, advance to the user's turn
        advanceToNextTurn(nextIdx + 1);
      }, 600);
    }
  };

  const handleFinishScenario = () => {
    soundEffects.playVictory();
    setIsCompleted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (selectedScenario) {
      onEarnXP(selectedScenario.xpReward);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-5 h-5" />;
      case 'Plane': return <Plane className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
      case 'MapPin': return <MapPin className="w-5 h-5" />;
      default: return <MessageSquareQuote className="w-5 h-5" />;
    }
  };

  const filteredScenarios = selectedCategory === 'all'
    ? ROLEPLAY_SCENARIOS
    : ROLEPLAY_SCENARIOS.filter(s => s.category === selectedCategory);

  // ================= 1. SCENARIO SELECTION SCREEN =================
  if (!selectedScenario) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => {
                  soundEffects.playPop();
                  onBack();
                }}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                title="Quay lại Bộ thẻ"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Luyện Giao Tiếp Đàm Thoại AI</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Nhập Vai Hội Thoại Thực Tế
            </h1>
            <p className="mt-2 text-sm sm:text-base text-brand-100 font-medium leading-relaxed">
              Trò chuyện 2 chiều cùng trợ lý AI bản xứ trong các tình huống đời thực: gọi món, sân bay, phỏng vấn, mua sắm và hỏi đường.
            </p>
          </div>

          <div className="absolute right-4 bottom-4 sm:right-10 sm:bottom-6 opacity-20 sm:opacity-30 pointer-events-none">
            <MessageSquareQuote className="w-40 h-40 text-white" />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'Tất cả tình huống' },
            { id: 'restaurant', label: '☕ Quán ăn / Cafe' },
            { id: 'airport', label: '✈️ Sân bay' },
            { id: 'interview', label: '💼 Phỏng vấn' },
            { id: 'hotel', label: '🏨 Khách sạn' },
            { id: 'shopping', label: '🛍️ Mua sắm' },
            { id: 'travel', label: '🗺️ Du lịch' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundEffects.playPop();
                setSelectedCategory(cat.id);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => handleStartScenario(scenario)}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Icon & Badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${scenario.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    {getCategoryIcon(scenario.icon)}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      scenario.difficulty === 'easy' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : scenario.difficulty === 'medium'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {scenario.difficulty === 'easy' ? 'Cơ bản' : scenario.difficulty === 'medium' ? 'Trung bình' : 'Nâng cao'}
                    </span>

                    <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[10px] font-black border border-brand-200 dark:border-brand-800 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      +{scenario.xpReward} XP
                    </span>
                  </div>
                </div>

                {/* Scenario Title & Description */}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {scenario.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {scenario.description}
                </p>

                {/* Characters Pairing Pill */}
                <div className="mt-4 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <span>{scenario.aiCharacter.avatar}</span>
                    <span className="truncate max-w-[90px]">{scenario.aiCharacter.name} ({scenario.aiCharacter.role})</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">⇄</span>
                  <div className="flex items-center gap-1.5 font-bold text-brand-600 dark:text-brand-400">
                    <span>{scenario.userRole.avatar}</span>
                    <span>{scenario.userRole.name}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                <span>{scenario.dialogue.length} Lượt đàm thoại</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Vào hội thoại <ChevronRight className="w-4 h-4" />
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    );
  }

  // ================= 2. ACTIVE ROLEPLAY CHAT SCREEN =================
  const activeTurn = selectedScenario.dialogue[currentTurnIndex];
  const isUserTurn = activeTurn && activeTurn.speaker === 'user';
  const progressPercent = Math.min(100, Math.round(((currentTurnIndex + 1) / selectedScenario.dialogue.length) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col h-[calc(100vh-6rem)]">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => {
            soundEffects.playPop();
            SpeechService.stop();
            setSelectedScenario(null);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thoát tình huống</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
            {selectedScenario.title}
          </span>
          <span className="text-[10px] text-slate-400 font-bold">
            Lượt {Math.min(currentTurnIndex + 1, selectedScenario.dialogue.length)} / {selectedScenario.dialogue.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-black border border-brand-200 dark:border-brand-800">
            +{selectedScenario.xpReward} XP
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
        <div 
          className="bg-gradient-to-r from-brand-600 to-indigo-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Conversation Messages Container */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
        {selectedScenario.dialogue.slice(0, currentTurnIndex + 1).map((turn) => {
          const isAi = turn.speaker === 'ai';
          const turnResult = turnResults[turn.id];

          return (
            <div
              key={turn.id}
              className={`flex items-start gap-3 animate-fade-in ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {/* AI Avatar */}
              {isAi && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-lg shadow-md shrink-0">
                  {selectedScenario.aiCharacter.avatar}
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-lg rounded-3xl p-4 sm:p-5 shadow-sm transition-all ${
                isAi 
                  ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-sm'
                  : 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white rounded-tr-sm'
              }`}>
                
                {/* Speaker Label & Replay Button */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isAi ? 'text-indigo-600 dark:text-indigo-400' : 'text-brand-200'}`}>
                    {isAi ? `${selectedScenario.aiCharacter.name} (${selectedScenario.aiCharacter.role})` : 'Bạn (Học Viên)'}
                  </span>
                  
                  {isAi && (
                    <button
                      onClick={() => playAiTurn(turn.text)}
                      title="Nghe lại câu thoại"
                      className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* English Text */}
                <p className="text-sm sm:text-base font-bold leading-relaxed">
                  {turn.text}
                </p>

                {/* Vietnamese Meaning */}
                <p className={`text-xs mt-1.5 font-medium ${isAi ? 'text-slate-500 dark:text-slate-400' : 'text-brand-100/90'}`}>
                  {turn.meaningVi}
                </p>

                {/* Result Badge if Passed */}
                {turnResult && (
                  <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Đã hoàn thành</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 font-black text-[11px]">
                      Chuẩn {turnResult.score}%
                    </span>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {!isAi && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-lg shadow-md shrink-0">
                  {selectedScenario.userRole.avatar}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Turn Action Deck for User */}
      {isUserTurn && !isCompleted && (
        <div className="mt-auto bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-3">
          
          {/* Target Sentence Preview Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Đến lượt bạn nói câu này:</span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowIpa(!showIpa)}
                  title="Ẩn/Hiện phiên âm IPA"
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-slate-700 flex items-center gap-1"
                >
                  {showIpa ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>IPA</span>
                </button>

                <button
                  onClick={() => setShowHint(!showHint)}
                  title="Xem gợi ý mẹo nói"
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>Gợi ý</span>
                </button>
              </div>
            </div>

            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              "{activeTurn.text}"
            </p>

            {showIpa && activeTurn.ipa && (
              <p className="text-xs font-mono text-brand-600 dark:text-brand-400 mt-0.5">
                {activeTurn.ipa}
              </p>
            )}

            {showHint && activeTurn.hint && (
              <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{activeTurn.hint}</span>
              </div>
            )}
          </div>

          {/* Action Controls & Big Microphone Button */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Listen Native Sample Button */}
            <button
              onClick={() => handleSpeakSample(activeTurn.text)}
              disabled={isListening}
              className="flex items-center gap-2 px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              <Volume2 className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Nghe mẫu</span>
            </button>

            {/* Central Big Mic Record Button */}
            <button
              onClick={() => handleRecordTurn(activeTurn)}
              disabled={isAiSpeaking}
              className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm text-white shadow-lg flex items-center justify-center gap-2.5 transition-all ${
                isListening
                  ? 'bg-rose-500 animate-pulse ring-4 ring-rose-400/40'
                  : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-brand-500/25 active:scale-98'
              }`}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
              <span>{isListening ? 'Đang lắng nghe... Hãy nói to!' : 'Bấm Micro Để Trả Lời'}</span>
            </button>

            {/* Skip Turn Button */}
            <button
              onClick={() => {
                soundEffects.playPop();
                advanceToNextTurn(currentTurnIndex + 1);
              }}
              title="Bỏ qua lượt này"
              className="px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold text-xs transition-colors"
            >
              <span>Bỏ qua</span>
            </button>
          </div>

          {/* Error / Feedback Message */}
          {currentTurnError && (
            <p className="text-center text-xs font-semibold text-rose-500 animate-fade-in">
              {currentTurnError}
            </p>
          )}

        </div>
      )}

      {/* ================= 3. COMPLETION MODAL ================= */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
                <Star className="w-6 h-6 fill-amber-400" />
                <Star className="w-7 h-7 fill-amber-400" />
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Hoàn Thành Xuất Sắc!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn đã vượt qua trọn vẹn tình huống giao tiếp <strong>{selectedScenario.title}</strong>
              </p>
            </div>

            {/* XP Award Pill */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/60 dark:to-indigo-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-around">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Kinh Nghiệm</span>
                <span className="text-xl font-black text-brand-600 dark:text-brand-400">+{selectedScenario.xpReward} XP</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Độ Chuẩn Xác</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">95%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleStartScenario(selectedScenario)}
                className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Luyện lại</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playPop();
                  setSelectedScenario(null);
                }}
                className="py-3 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 hover:bg-brand-700 transition-colors"
              >
                <span>Chọn chủ đề khác</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
