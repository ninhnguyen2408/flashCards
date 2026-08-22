import React, { useState, useRef, useEffect } from 'react';
import type { Deck } from '../types/flashcard';
import { DeckIcon } from './DeckIcon';
import { soundEffects } from '../services/soundEffects';
import { Layers, ChevronDown, Search, Check } from 'lucide-react';

interface DeckSelectDropdownProps {
  decks: Deck[];
  activeDeckId: string;
  onSelectDeck: (deckId: string) => void;
  disabled?: boolean;
  className?: string;
}

export const DeckSelectDropdown: React.FC<DeckSelectDropdownProps> = ({
  decks,
  activeDeckId,
  onSelectDeck,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeDeck = decks.find(d => d.id === activeDeckId);
  const activeTitle = activeDeckId === 'all' ? 'Tất cả bộ thẻ (42 chủ đề)' : (activeDeck?.title || 'Chọn bộ thẻ');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDecks = decks.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            soundEffects.playPop();
            setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm transition-all text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed group max-w-xs ${
          isOpen ? 'ring-2 ring-brand-500/30 border-brand-500' : ''
        }`}
      >
        <div className="w-6 h-6 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
          {activeDeckId === 'all' ? (
            <Layers className="w-3.5 h-3.5" />
          ) : (
            <DeckIcon name={activeDeck?.icon} category={activeDeck?.category} className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          )}
        </div>

        <span className="truncate max-w-[160px] sm:max-w-[200px] text-left">
          {activeTitle}
        </span>

        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600' : ''}`} />
      </button>

      {/* Menu Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 w-72 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Quick Search Header */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* List of Options */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            
            {/* "All Decks" Option */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                onSelectDeck('all');
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-2xl text-left flex items-center justify-between text-xs font-bold transition-all ${
                activeDeckId === 'all'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="truncate">Tất cả bộ thẻ (42 chủ đề)</span>
              </div>
              {activeDeckId === 'all' && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
            </button>

            {/* Topic Decks Options */}
            {filteredDecks.map((deck) => {
              const isSelected = activeDeckId === deck.id;
              return (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    onSelectDeck(deck.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-2xl text-left flex items-center justify-between text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${deck.color || 'from-blue-500 to-indigo-600'} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                      <DeckIcon name={deck.icon} category={deck.category} className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="truncate">{deck.title}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                </button>
              );
            })}

            {filteredDecks.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                Không thấy bộ thẻ phù hợp
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
};
