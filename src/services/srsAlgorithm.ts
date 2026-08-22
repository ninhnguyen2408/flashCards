import type { Card, MasteryLevel, SRSRating } from '../types/flashcard';


export interface SRSResult {
  srsLevel: number;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  dueDate: string;
  mastery: MasteryLevel;
}

/**
 * SuperMemo SM-2 & Leitner algorithm for spaced repetition flashcards
 */
export function calculateNextSRS(card: Card, rating: SRSRating): SRSResult {
  let { srsLevel, intervalDays, easeFactor, repetitionCount } = card;

  // Defaults
  easeFactor = easeFactor || 2.5;
  srsLevel = srsLevel || 0;
  intervalDays = intervalDays || 0;
  repetitionCount = repetitionCount || 0;

  let q = 0;
  switch (rating) {
    case 'again':
      q = 1; // Complete blackout / incorrect
      break;
    case 'hard':
      q = 3; // Correct with significant difficulty
      break;
    case 'good':
      q = 4; // Correct response after hesitation
      break;
    case 'easy':
      q = 5; // Perfect instant recall
      break;
  }

  // Update Ease Factor (EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  if (easeFactor > 3.0) easeFactor = 3.0;

  if (q < 3) {
    // Failed recall: reset repetitions
    repetitionCount = 0;
    intervalDays = 1;
    srsLevel = Math.max(0, srsLevel - 1);
  } else {
    // Successful recall
    if (repetitionCount === 0) {
      intervalDays = 1;
    } else if (repetitionCount === 1) {
      intervalDays = rating === 'easy' ? 6 : 3;
    } else {
      const modifier = rating === 'easy' ? 1.3 : rating === 'hard' ? 0.8 : 1.0;
      intervalDays = Math.round(intervalDays * easeFactor * modifier);
    }
    repetitionCount += 1;
    srsLevel = Math.min(5, srsLevel + (rating === 'easy' ? 2 : 1));
  }

  // Determine Mastery Level
  let mastery: MasteryLevel = 'learning';
  if (srsLevel === 0) {
    mastery = 'new';
  } else if (srsLevel <= 2) {
    mastery = 'learning';
  } else if (srsLevel <= 4) {
    mastery = 'reviewing';
  } else {
    mastery = 'mastered';
  }

  // Calculate Due Date (YYYY-MM-DD)
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  const dueDate = nextDate.toISOString().split('T')[0];

  return {
    srsLevel,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    repetitionCount,
    dueDate,
    mastery,
  };
}

export function isCardDue(card: Card): boolean {
  if (!card.dueDate) return true;
  const today = new Date().toISOString().split('T')[0];
  return card.dueDate <= today;
}
