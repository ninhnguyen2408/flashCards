import React, { useState, useEffect } from 'react';
import type { Card, Deck } from '../types/flashcard';
import { ArrowLeft, Trophy, Clock, Star, HelpCircle } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { DeckSelectDropdown } from './DeckSelectDropdown';
import confetti from 'canvas-confetti';


interface MemoryMatchGameProps {
  cards: Card[];
  decks: Deck[];
  selectedDeck?: Deck;
  onExit: () => void;
  onFinished: (xp: number) => void;
}

interface Tile {
  id: string;
  cardId: string;
  text: string;
  type: 'word' | 'meaning';
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  cards,
  decks,
  selectedDeck,
  onExit,
  onFinished,
}) => {
  const [activeDeckId, setActiveDeckId] = useState<string>(selectedDeck?.id || 'all');
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const availableCards = activeDeckId === 'all'
    ? cards
    : cards.filter(c => c.deckId === activeDeckId);

  const initGame = () => {
    if (availableCards.length < 4) return;

    // Pick 6 cards (12 tiles)
    const selected = [...availableCards].sort(() => 0.5 - Math.random()).slice(0, 6);
    const gameTiles: Tile[] = [];

    selected.forEach((c) => {
      gameTiles.push({
        id: `word-${c.id}`,
        cardId: c.id,
        text: c.word,
        type: 'word',
        isFlipped: false,
        isMatched: false,
      });
      gameTiles.push({
        id: `mean-${c.id}`,
        cardId: c.id,
        text: c.meaning,
        type: 'meaning',
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle tiles
    setTiles(gameTiles.sort(() => 0.5 - Math.random()));
    setFlippedIndices([]);
    setMoves(0);
    setTimerSeconds(0);
    setIsFinished(false);
  };

  useEffect(() => {
    initGame();
  }, [activeDeckId, cards.length]);

  // Timer
  useEffect(() => {
    if (isFinished || tiles.length === 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, tiles.length]);

  const handleTileClick = (index: number) => {
    if (flippedIndices.length >= 2 || tiles[index].isFlipped || tiles[index].isMatched) {
      return;
    }

    soundEffects.playFlip();
    const newTiles = [...tiles];
    newTiles[index].isFlipped = true;
    setTiles(newTiles);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [idx1, idx2] = newFlipped;
      const tile1 = newTiles[idx1];
      const tile2 = newTiles[idx2];

      if (tile1.cardId === tile2.cardId && tile1.type !== tile2.type) {
        // Matched!
        setTimeout(() => {
          soundEffects.playCorrect();
          newTiles[idx1].isMatched = true;
          newTiles[idx2].isMatched = true;
          setTiles([...newTiles]);
          setFlippedIndices([]);

          // Check if all matched
          if (newTiles.every(t => t.isMatched)) {
            finishGame();
          }
        }, 300);
      } else {
        // Not matched
        setTimeout(() => {
          soundEffects.playIncorrect();
          newTiles[idx1].isFlipped = false;
          newTiles[idx2].isFlipped = false;
          setTiles([...newTiles]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const finishGame = () => {
    setIsFinished(true);
    soundEffects.playVictory();
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch {}
    const xp = Math.max(15, 30 - Math.floor(moves / 2));
    onFinished(xp);
  };

  if (availableCards.length < 4) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4">
        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold">Cần tối thiểu 4 từ vựng để ghép đôi</h3>
        <button onClick={onExit} className="mt-4 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold">
          Quay lại
        </button>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thoát</span>
        </button>

        <DeckSelectDropdown
          decks={decks}
          activeDeckId={activeDeckId}
          onSelectDeck={setActiveDeckId}
          disabled={moves > 0 && !isFinished}
        />

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timerSeconds)}</span>
          </div>
          <div className="text-brand-600 dark:text-brand-400">
            {moves} Lượt lật
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((tile, idx) => {
            const isShown = tile.isFlipped || tile.isMatched;

            return (
              <button
                key={tile.id}
                disabled={tile.isMatched}
                onClick={() => handleTileClick(idx)}
                className={`h-24 sm:h-28 rounded-2xl p-3 text-center flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 border-2 ${
                  tile.isMatched
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 scale-95 opacity-80'
                    : isShown
                    ? tile.type === 'word'
                      ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-800 dark:text-brand-300 shadow-md scale-105'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-800 dark:text-indigo-300 shadow-md scale-105'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-brand-400 hover:scale-105 shadow-sm'
                }`}
              >
                {isShown ? (
                  <span className="line-clamp-3 select-none">{tile.text}</span>
                ) : (
                  <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-400">
                    ?
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Summary */
        <div className="glass-card rounded-3xl p-8 text-center animate-bounce-short">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Xuất Sắc! Ghép Cặp Thành Công!
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            Thời gian: {formatTime(timerSeconds)} | Số lượt lật: {moves}
          </p>
          <div className="flex justify-center gap-1 mb-6 text-amber-400">
            <Star className="w-6 h-6 fill-amber-400" />
            <Star className="w-6 h-6 fill-amber-400" />
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={initGame}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm"
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
