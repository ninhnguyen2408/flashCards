import React, { useState, useEffect } from 'react';
import type { Deck } from '../types/flashcard';

import { X, Layers, Save } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface AddEditDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  initialDeck?: Deck | null;
}

const COLOR_GRADIENTS = [
  { name: 'Indigo Blue', value: 'from-blue-500 to-indigo-600' },
  { name: 'Sunset Amber', value: 'from-amber-500 to-orange-600' },
  { name: 'Royal Purple', value: 'from-purple-500 to-pink-600' },
  { name: 'Emerald Forest', value: 'from-emerald-500 to-teal-600' },
  { name: 'Rose Ruby', value: 'from-rose-500 to-red-600' },
  { name: 'Cyan Sky', value: 'from-cyan-500 to-blue-600' },
];

export const AddEditDeckModal: React.FC<AddEditDeckModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDeck,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Deck['category']>('custom');
  const [color, setColor] = useState(COLOR_GRADIENTS[0].value);

  useEffect(() => {
    if (initialDeck) {
      setTitle(initialDeck.title);
      setDescription(initialDeck.description);
      setCategory(initialDeck.category);
      setColor(initialDeck.color || COLOR_GRADIENTS[0].value);
    } else {
      setTitle('');
      setDescription('');
      setCategory('custom');
      setColor(COLOR_GRADIENTS[0].value);
    }
  }, [initialDeck, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên bộ thẻ!');
      return;
    }

    soundEffects.playPop();
    onSave({
      id: initialDeck?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      color,
      icon: 'BookOpen',
      isCustom: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialDeck ? 'Chỉnh sửa Bộ Thẻ' : 'Tạo Bộ Thẻ Mới'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Tên Bộ Thẻ *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Từ vựng Phỏng Vấn, 50 Phrasal Verbs..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Mô Tả Bộ Thẻ
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú mục tiêu hoặc chủ đề của bộ thẻ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Chủ Đề / Danh Mục
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Deck['category'])}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
            >
              <option value="custom">Tự tạo (Custom Deck)</option>
              <option value="oxford">Oxford & Cơ bản</option>
              <option value="toeic">TOEIC & Công sở</option>
              <option value="ielts">IELTS & Học thuật</option>
              <option value="travel">Giao tiếp & Du lịch</option>
              <option value="business">Thương mại & Kinh doanh</option>
            </select>
          </div>

          {/* Color Gradient Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Màu Sắc Đại Diện
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_GRADIENTS.map((g) => (
                <button
                  type="button"
                  key={g.value}
                  onClick={() => setColor(g.value)}
                  className={`h-9 rounded-xl bg-gradient-to-r ${g.value} transition-all ${
                    color === g.value ? 'ring-4 ring-brand-500/50 scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={g.name}
                />
              ))}
            </div>
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
              <span>{initialDeck ? 'Lưu thay đổi' : 'Tạo bộ thẻ'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
