import React, { useState, useEffect } from 'react';
import type { Card, PartOfSpeech } from '../types/flashcard';

import { X, Sparkles, Volume2, Save } from 'lucide-react';
import { SpeechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';

interface AddEditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: Omit<Card, 'id' | 'srsLevel' | 'intervalDays' | 'easeFactor' | 'repetitionCount' | 'dueDate' | 'mastery' | 'createdAt'> & { id?: string }) => void;
  initialCard?: Card | null;
  deckId: string;
}

export const AddEditCardModal: React.FC<AddEditCardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCard,
  deckId,
}) => {
  const [word, setWord] = useState('');
  const [ipa, setIpa] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [meaning, setMeaning] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleVi, setExampleVi] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  useEffect(() => {
    if (initialCard) {
      setWord(initialCard.word);
      setIpa(initialCard.ipa || '');
      setPartOfSpeech(initialCard.partOfSpeech || 'noun');
      setMeaning(initialCard.meaning || '');
      setExampleEn(initialCard.exampleEn || '');
      setExampleVi(initialCard.exampleVi || '');
      setMnemonic(initialCard.mnemonic || '');
    } else {
      setWord('');
      setIpa('');
      setPartOfSpeech('noun');
      setMeaning('');
      setExampleEn('');
      setExampleVi('');
      setMnemonic('');
    }
  }, [initialCard, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) {
      alert('Vui lòng nhập Từ tiếng Anh và Nghĩa tiếng Việt!');
      return;
    }

    soundEffects.playPop();
    onSave({
      id: initialCard?.id,
      deckId: initialCard?.deckId || deckId,
      word: word.trim(),
      ipa: ipa.trim(),
      partOfSpeech,
      meaning: meaning.trim(),
      exampleEn: exampleEn.trim(),
      exampleVi: exampleVi.trim(),
      mnemonic: mnemonic.trim(),
    });
    onClose();
  };

  const handleTestAudio = () => {
    if (word.trim()) {
      SpeechService.speak(word.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialCard ? 'Chỉnh sửa Thẻ Từ Vựng' : 'Thêm Thẻ Từ Vựng Mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Word */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Từ Tiếng Anh *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Resilient, Inspire..."
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                {word.trim() && (
                  <button
                    type="button"
                    onClick={handleTestAudio}
                    title="Nghe thử phát âm"
                    className="absolute right-2 p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* IPA */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Phiên Âm (IPA)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: /rɪˈzɪliənt/"
                value={ipa}
                onChange={(e) => setIpa(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-serif text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Part of Speech */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Loại Từ
              </label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
              >
                <option value="noun">Danh từ (Noun)</option>
                <option value="verb">Động từ (Verb)</option>
                <option value="adjective">Tính từ (Adjective)</option>
                <option value="adverb">Trạng từ (Adverb)</option>
                <option value="phrasal verb">Cụm động từ (Phrasal Verb)</option>
                <option value="idiom">Thành ngữ (Idiom)</option>
                <option value="preposition">Giới từ (Preposition)</option>
                <option value="other">Khác (Other)</option>
              </select>
            </div>

            {/* Meaning */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Nghĩa Tiếng Việt *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Kiên cường, phục hồi nhanh..."
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Example English */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Câu Ví Dụ Tiếng Anh
            </label>
            <input
              type="text"
              placeholder="Ví dụ: He is resilient and always bounces back."
              value={exampleEn}
              onChange={(e) => setExampleEn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Example Vietnamese */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Dịch Nghĩa Câu Ví Dụ
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Anh ấy rất kiên cường và luôn đứng dậy sau vấp ngã."
              value={exampleVi}
              onChange={(e) => setExampleVi(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Mnemonic / Tip */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Mẹo Ghi Nhớ (Mnemonic Hint)
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Re (lại) + silent (im lặng) vượt qua khó khăn..."
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{initialCard ? 'Lưu thay đổi' : 'Thêm từ vựng'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
