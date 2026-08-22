export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'idiom' | 'phrasal verb' | 'other';

export type MasteryLevel = 'new' | 'learning' | 'reviewing' | 'mastered';

export type SRSRating = 'again' | 'hard' | 'good' | 'easy';

export interface Card {
  id: string;
  deckId: string;
  userId?: string;
  word: string;
  ipa: string;
  partOfSpeech: PartOfSpeech;
  meaning: string;
  exampleEn: string;
  exampleVi: string;
  mnemonic?: string;
  imageUrl?: string;
  audioUrl?: string;
  // SRS state
  srsLevel: number; // 0 = new, 1..5
  intervalDays: number;
  easeFactor: number; // default 2.5
  repetitionCount: number;
  dueDate: string; // ISO date string YYYY-MM-DD
  lastReviewed?: string; // ISO datetime
  mastery: MasteryLevel;
  createdAt: string;
}

export interface Deck {
  id: string;
  userId?: string;
  authorName?: string;
  title: string;
  description: string;
  category: 'oxford' | 'toeic' | 'ielts' | 'travel' | 'business' | 'custom';
  icon: string;
  color: string;
  isCustom?: boolean;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  userId?: string;
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string; // YYYY-MM-DD
  dailyGoal: number; // cards per day
  studiedToday: number;
  totalCardsReviewed: number;
  totalCardsMastered: number;
  perfectQuizzes: number;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  voiceAccent: 'en-US' | 'en-GB';
  voiceSpeed: number; // 0.75, 1, 1.25
}

export interface Achievement {
  id: string;
  userId?: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'cards' | 'quiz' | 'level';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StudySessionResult {
  deckId: string;
  userId?: string;
  totalCards: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  xpEarned: number;
  durationSeconds: number;
  completedAt: string;
}

export type ActiveTab = 'decks' | 'study' | 'quiz' | 'spelling' | 'match' | 'voice' | 'stats' | 'deck-detail' | 'users';

