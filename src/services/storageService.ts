import type { Card, Deck, UserStats, Achievement, StudySessionResult } from '../types/flashcard';
import { INITIAL_DECKS, INITIAL_CARDS } from '../data/defaultDecks';
import { INITIAL_ACHIEVEMENTS } from '../data/achievementsData';
import { AuthService } from './authService';

const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
  streak: 1,
  lastStudyDate: '',
  dailyGoal: 10,
  studiedToday: 0,
  totalCardsReviewed: 0,
  totalCardsMastered: 0,
  perfectQuizzes: 0,
  soundEnabled: true,
  theme: 'light',
  voiceAccent: 'en-US',
  voiceSpeed: 0.9,
};

export class StorageService {
  private static getActiveUserId(userId?: string): string {
    if (userId) return userId;
    return AuthService.getCurrentUser()?.id || 'default_user';
  }

  // Load Decks (System Shared + User Custom Decks)
  public static getDecks(userId?: string): Deck[] {
    try {
      const uid = this.getActiveUserId(userId);
      const data = localStorage.getItem(`vm_user_${uid}_decks`);
      if (!data) {
        // Initialize with default decks
        this.saveDecks(INITIAL_DECKS, uid);
        return INITIAL_DECKS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_DECKS;
    }
  }

  public static saveDecks(decks: Deck[], userId?: string): void {
    const uid = this.getActiveUserId(userId);
    localStorage.setItem(`vm_user_${uid}_decks`, JSON.stringify(decks));
  }

  // Load Cards for specific user
  public static getCards(userId?: string): Card[] {
    try {
      const uid = this.getActiveUserId(userId);
      const data = localStorage.getItem(`vm_user_${uid}_cards`);
      if (!data) {
        // Initialize with default cards for this user
        this.saveCards(INITIAL_CARDS, uid);
        return INITIAL_CARDS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CARDS;
    }
  }

  public static saveCards(cards: Card[], userId?: string): void {
    const uid = this.getActiveUserId(userId);
    localStorage.setItem(`vm_user_${uid}_cards`, JSON.stringify(cards));
  }

  // Load User Stats & compute Daily Streak
  public static getStats(userId?: string): UserStats {
    try {
      const uid = this.getActiveUserId(userId);
      const data = localStorage.getItem(`vm_user_${uid}_stats`);
      const stats: UserStats = data ? { ...DEFAULT_STATS, userId: uid, ...JSON.parse(data) } : { ...DEFAULT_STATS, userId: uid };
      
      const today = new Date().toISOString().split('T')[0];
      
      // If new day, reset studiedToday
      if (stats.lastStudyDate && stats.lastStudyDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yDateStr = yesterday.toISOString().split('T')[0];

        // If missed yesterday, streak resets to 0 (or 1 on next study)
        if (stats.lastStudyDate !== yDateStr) {
          stats.streak = 0;
        }
        stats.studiedToday = 0;
      }

      return stats;
    } catch {
      return { ...DEFAULT_STATS, userId: this.getActiveUserId(userId) };
    }
  }

  public static saveStats(stats: UserStats, userId?: string): void {
    const uid = this.getActiveUserId(userId || stats.userId);
    localStorage.setItem(`vm_user_${uid}_stats`, JSON.stringify(stats));
  }

  // Add XP and handle leveling
  public static addXP(amount: number, userId?: string): { newStats: UserStats; leveledUp: boolean; newAchievements: Achievement[] } {
    const uid = this.getActiveUserId(userId);
    const stats = this.getStats(uid);
    const today = new Date().toISOString().split('T')[0];

    // Update streak if first study today
    if (stats.lastStudyDate !== today) {
      stats.streak = (stats.streak || 0) + 1;
      stats.lastStudyDate = today;
    }

    stats.studiedToday = (stats.studiedToday || 0) + 1;
    stats.totalCardsReviewed = (stats.totalCardsReviewed || 0) + 1;
    stats.xp = (stats.xp || 0) + amount;

    // Level formula: Level = floor(sqrt(XP / 50)) + 1
    const newLevel = Math.floor(Math.sqrt(stats.xp / 50)) + 1;
    const leveledUp = newLevel > stats.level;
    stats.level = newLevel;

    this.saveStats(stats, uid);

    // Check achievements
    const newAchievements = this.checkAchievements(stats, uid);

    return { newStats: stats, leveledUp, newAchievements };
  }

  // Load & Check Achievements
  public static getAchievements(userId?: string): Achievement[] {
    try {
      const uid = this.getActiveUserId(userId);
      const data = localStorage.getItem(`vm_user_${uid}_achievements`);
      if (!data) {
        this.saveAchievements(INITIAL_ACHIEVEMENTS, uid);
        return INITIAL_ACHIEVEMENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  }

  public static saveAchievements(achievements: Achievement[], userId?: string): void {
    const uid = this.getActiveUserId(userId);
    localStorage.setItem(`vm_user_${uid}_achievements`, JSON.stringify(achievements));
  }

  public static checkAchievements(stats: UserStats, userId?: string): Achievement[] {
    const uid = this.getActiveUserId(userId);
    const achievements = this.getAchievements(uid);
    const cards = this.getCards(uid);
    const masteredCount = cards.filter(c => c.mastery === 'mastered').length;
    stats.totalCardsMastered = masteredCount;

    const newlyUnlocked: Achievement[] = [];

    achievements.forEach(ach => {
      if (ach.unlocked) return;

      let shouldUnlock = false;
      if (ach.category === 'streak' && stats.streak >= ach.requirement) {
        shouldUnlock = true;
      } else if (ach.id === 'ach-first-step' && stats.totalCardsReviewed >= 1) {
        shouldUnlock = true;
      } else if (ach.id === 'ach-vocab-50' && stats.totalCardsReviewed >= 50) {
        shouldUnlock = true;
      } else if (ach.id === 'ach-vocab-master-10' && masteredCount >= 10) {
        shouldUnlock = true;
      } else if (ach.category === 'level' && stats.level >= ach.requirement) {
        shouldUnlock = true;
      } else if (ach.id === 'ach-quiz-perfect' && stats.perfectQuizzes >= 1) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(ach);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveAchievements(achievements, uid);
    }

    return newlyUnlocked;
  }

  // Save study session history
  public static saveSession(session: StudySessionResult, userId?: string): void {
    try {
      const uid = this.getActiveUserId(userId);
      const existing = localStorage.getItem(`vm_user_${uid}_sessions`);
      const list: StudySessionResult[] = existing ? JSON.parse(existing) : [];
      list.unshift(session);
      localStorage.setItem(`vm_user_${uid}_sessions`, JSON.stringify(list.slice(0, 50)));
    } catch {
      // ignore
    }
  }

  // Export full backup
  public static exportData(userId?: string): string {
    const uid = this.getActiveUserId(userId);
    const data = {
      version: '1.0',
      userId: uid,
      exportedAt: new Date().toISOString(),
      decks: this.getDecks(uid),
      cards: this.getCards(uid),
      stats: this.getStats(uid),
      achievements: this.getAchievements(uid),
    };
    return JSON.stringify(data, null, 2);
  }

  // Import full backup
  public static importData(jsonString: string, userId?: string): { success: boolean; message: string } {
    try {
      const uid = this.getActiveUserId(userId);
      const data = JSON.parse(jsonString);
      if (data.decks && Array.isArray(data.decks)) {
        this.saveDecks(data.decks, uid);
      }
      if (data.cards && Array.isArray(data.cards)) {
        this.saveCards(data.cards, uid);
      }
      if (data.stats) {
        this.saveStats({ ...DEFAULT_STATS, ...data.stats }, uid);
      }
      if (data.achievements) {
        this.saveAchievements(data.achievements, uid);
      }
      return { success: true, message: 'Nhập dữ liệu thành công!' };
    } catch (e) {
      return { success: false, message: 'Dữ liệu JSON không hợp lệ: ' + String(e) };
    }
  }

  // Reset to factory defaults for current user
  public static resetToDefault(userId?: string): void {
    const uid = this.getActiveUserId(userId);
    this.saveDecks(INITIAL_DECKS, uid);
    this.saveCards(INITIAL_CARDS, uid);
    this.saveStats({ ...DEFAULT_STATS, userId: uid }, uid);
    this.saveAchievements(INITIAL_ACHIEVEMENTS, uid);
    localStorage.removeItem(`vm_user_${uid}_sessions`);
  }
}
