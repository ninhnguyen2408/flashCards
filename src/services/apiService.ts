import type { Card, Deck, UserStats, Achievement } from '../types/flashcard';
import type { User, UserRole } from '../types/auth';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { StorageService } from './storageService';
import { AuthService } from './authService';

const withTimeout = async <T = any>(promise: Promise<T> | any, ms = 2000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Network timeout')), ms))
  ]);
};

export class ApiService {
  private static isCloudConnected = false;

  public static async checkHealth(): Promise<boolean> {
    if (!isSupabaseConfigured) {
      this.isCloudConnected = false;
      return false;
    }

    try {
      const { data, error } = await withTimeout(
        supabase.from('decks').select('id').limit(1) as any,
        1500
      );
      if (!error && Array.isArray(data)) {
        this.isCloudConnected = true;
        return true;
      }
    } catch {
      // Fallback
    }
    this.isCloudConnected = false;
    return false;
  }

  public static getStatus(): boolean {
    return this.isCloudConnected;
  }

  // ================= AUTH =================
  public static async login(username: string, password?: string): Promise<{ success: boolean; message: string; user?: User }> {
    // 1. Instant local verification if user exists locally
    const localUsers = AuthService.getAllUsers();
    const clean = username.trim().toLowerCase();
    const localUser = localUsers.find(u => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean);

    if (localUser && (!localUser.password || !password || localUser.password === password)) {
      if (!localUser.isActive) {
        return { success: false, message: 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ Quản trị viên.' };
      }
      AuthService.setCurrentUser(localUser);
      return { success: true, message: `Đăng nhập thành công với tài khoản ${localUser.fullName}!`, user: localUser };
    }

    // 2. If not local or cloud sync needed, query Supabase with fast 2s timeout
    if (isSupabaseConfigured) {
      try {
        const queryPromise = supabase
          .from('users')
          .select('*')
          .or(`username.ilike.${clean},email.ilike.${clean}`);

        const { data: users, error } = await withTimeout(queryPromise as any, 2000);

        if (!error && users && users.length > 0) {
          const u = users[0];
          if (!u.is_active) {
            return { success: false, message: 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ Quản trị viên.' };
          }
          if (password && u.password && u.password !== password) {
            return { success: false, message: 'Mật khẩu không chính xác.' };
          }

          const formattedUser: User = {
            id: u.id,
            username: u.username,
            fullName: u.full_name,
            email: u.email,
            role: u.role as UserRole,
            avatar: u.avatar,
            createdAt: u.created_at,
            isActive: Boolean(u.is_active),
          };

          this.isCloudConnected = true;
          AuthService.setCurrentUser(formattedUser);
          return { success: true, message: `Đăng nhập thành công với tài khoản ${formattedUser.fullName}!`, user: formattedUser };
        }
      } catch {
        // Fallback to local auth
      }
    }

    return AuthService.login(username, password);
  }

  // ================= 1-CLICK EMAIL CONFIRMATION REGISTRATION =================
  public static async sendRegistrationConfirmationLink(
    username: string,
    fullName: string,
    email: string,
    password?: string
  ): Promise<{ success: boolean; message: string; requiresEmailCheck?: boolean; user?: User }> {
    try {
      const cleanUsername = username.trim().toLowerCase();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanUsername || !fullName.trim() || !cleanEmail) {
        return { success: false, message: 'Vui lòng điền đầy đủ Tên đăng nhập, Họ tên và Email.' };
      }

      if (cleanUsername === 'admin') {
        return { success: false, message: 'Tên đăng nhập này là tài khoản Quản trị hệ thống, không thể đăng ký.' };
      }

      // 1. Check duplicate username/email
      if (isSupabaseConfigured) {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .or(`username.ilike.${cleanUsername},email.ilike.${cleanEmail}`);

        if (existing && existing.length > 0) {
          return { success: false, message: 'Tên đăng nhập hoặc Email này đã tồn tại trên hệ thống.' };
        }

        // Save pending metadata locally so we can construct the profile upon email click
        localStorage.setItem('vm_pending_signup', JSON.stringify({
          username: cleanUsername,
          fullName: fullName.trim(),
          email: cleanEmail,
          password: password || '123456',
        }));

        // 2. Trigger Supabase Auth SignUp with 1-Click Link
        const redirectUrl = window.location.origin;
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password || '123456',
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: cleanUsername,
              full_name: fullName.trim(),
            }
          }
        });

        if (signUpError) {
          return { success: false, message: `Lỗi gửi thư: ${signUpError.message}` };
        }

        // Always require email confirmation link click
        return {
          success: true,
          message: `Chúng tôi đã gửi thư xác nhận đến ${cleanEmail}!`,
          requiresEmailCheck: true,
        };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Không thể kết nối đến máy chủ gửi email.' };
    }

    // Fallback to direct local registration
    return this.register(username, fullName, email, password);
  }

  // Check and sync user if landed back from email confirmation link
  public static async syncConfirmedAuthSession(): Promise<User | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return null;

      const authUser = session.user;
      const userId = authUser.id;

      // Check if user record already exists in public.users
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingUser) {
        const formattedUser: User = {
          id: existingUser.id,
          username: existingUser.username,
          fullName: existingUser.full_name,
          email: existingUser.email,
          role: existingUser.role as UserRole,
          avatar: existingUser.avatar || '🎒',
          createdAt: existingUser.created_at,
          isActive: Boolean(existingUser.is_active),
        };
        AuthService.setCurrentUser(formattedUser);
        localStorage.removeItem('vm_pending_signup');
        return formattedUser;
      }

      // If new confirmed user, get metadata and create records
      const pendingRaw = localStorage.getItem('vm_pending_signup');
      const pending = pendingRaw ? JSON.parse(pendingRaw) : null;

      const username = pending?.username || authUser.user_metadata?.username || authUser.email?.split('@')[0] || `user_${userId.slice(0, 5)}`;
      const fullName = pending?.fullName || authUser.user_metadata?.full_name || username;
      const email = authUser.email || pending?.email || '';
      const now = new Date().toISOString();

      await supabase.from('users').upsert({
        id: userId,
        username,
        full_name: fullName,
        email,
        role: 'student',
        avatar: '🎒',
        password: pending?.password || '123456',
        is_active: true,
        created_at: now,
      });

      await supabase.from('user_stats').upsert({
        user_id: userId,
        xp: 0,
        level: 1,
        streak: 1,
        last_study_date: now.split('T')[0],
        daily_goal: 10,
        studied_today: 0,
        total_cards_reviewed: 0,
        total_cards_mastered: 0,
        perfect_quizzes: 0,
      });

      const newUser: User = {
        id: userId,
        username,
        fullName,
        email,
        role: 'student',
        avatar: '🎒',
        createdAt: now,
        isActive: true,
      };

      AuthService.setCurrentUser(newUser);
      localStorage.removeItem('vm_pending_signup');
      return newUser;
    } catch {
      return null;
    }
  }

  public static async resendRegistrationConfirmationLink(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: cleanEmail,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

        if (error) {
          return { success: false, message: `Lỗi gửi lại thư: ${error.message}` };
        }

        return { success: true, message: `Đã gửi lại email xác nhận mới tới ${cleanEmail}!` };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Không thể gửi lại email.' };
    }
    return { success: false, message: 'Dịch vụ xác thực không khả dụng.' };
  }

  public static async register(
    username: string,
    fullName: string,
    email: string,
    password?: string
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const cleanUsername = username.trim().toLowerCase();
      const cleanEmail = (email || `${cleanUsername}@vocabmaster.vn`).trim().toLowerCase();

      if (cleanUsername === 'admin') {
        return { success: false, message: 'Tên đăng nhập này là tài khoản Quản trị hệ thống, không thể đăng ký mới.' };
      }

      // Check existing in Supabase
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .or(`username.ilike.${cleanUsername},email.ilike.${cleanEmail}`);

      if (existing && existing.length > 0) {
        return { success: false, message: 'Tên đăng nhập hoặc Email này đã tồn tại trên hệ thống.' };
      }

      const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const now = new Date().toISOString();
      const avatar = '🎒';

      const { error: insertUserError } = await supabase.from('users').insert({
        id,
        username: cleanUsername,
        full_name: fullName.trim(),
        email: cleanEmail,
        role: 'student',
        avatar,
        password: password || '123456',
        is_active: true,
        created_at: now,
      });

      if (!insertUserError) {
        // Init stats
        await supabase.from('user_stats').insert({
          user_id: id,
          xp: 0,
          level: 1,
          streak: 1,
          last_study_date: now.split('T')[0],
          daily_goal: 10,
          studied_today: 0,
          total_cards_reviewed: 0,
          total_cards_mastered: 0,
          perfect_quizzes: 0,
        });

        const newUser: User = {
          id,
          username: cleanUsername,
          fullName: fullName.trim(),
          email: cleanEmail,
          role: 'student',
          avatar,
          createdAt: now,
          isActive: true,
        };

        this.isCloudConnected = true;
        AuthService.setCurrentUser(newUser);
        return { success: true, message: 'Đăng ký tài khoản học viên thành công!', user: newUser };
      }
    } catch {
      // Fallback
    }
    return AuthService.register(username, fullName, email, password);
  }

  // ================= USERS (ADMIN) =================
  public static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
      if (!error && Array.isArray(data)) {
        const formatted: User[] = data.map(u => ({
          id: u.id,
          username: u.username,
          fullName: u.full_name,
          email: u.email,
          role: u.role as UserRole,
          avatar: u.avatar || (u.role === 'admin' ? '👑' : '🎒'),
          createdAt: u.created_at,
          isActive: Boolean(u.is_active),
        }));
        this.isCloudConnected = true;
        AuthService.saveUsers(formatted);
        return formatted;
      }
    } catch {
      // Fallback
    }
    return AuthService.getAllUsers();
  }

  public static async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
      const avatar = newRole === 'admin' ? '👑' : '🎒';
      const { error } = await supabase.from('users').update({ role: newRole, avatar }).eq('id', userId);
      if (!error) {
        AuthService.updateUserRole(userId, newRole);
        return true;
      }
    } catch {
      // Fallback
    }
    return AuthService.updateUserRole(userId, newRole);
  }

  public static async toggleUserStatus(userId: string): Promise<boolean> {
    try {
      const { data } = await supabase.from('users').select('is_active').eq('id', userId).single();
      if (data) {
        const nextStatus = !data.is_active;
        const { error } = await supabase.from('users').update({ is_active: nextStatus }).eq('id', userId);
        if (!error) {
          AuthService.toggleUserStatus(userId);
          return true;
        }
      }
    } catch {
      // Fallback
    }
    return AuthService.toggleUserStatus(userId);
  }

  public static async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (!error) {
        AuthService.deleteUser(userId);
        return true;
      }
    } catch {
      // Fallback
    }
    return AuthService.deleteUser(userId);
  }

  // ================= DECKS =================
  public static async getDecks(userId?: string): Promise<Deck[]> {
    try {
      let query = supabase.from('decks').select('*').order('created_at', { ascending: true });
      if (userId) {
        query = query.or(`is_public.eq.true,user_id.eq.${userId}`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted: Deck[] = data.map(d => ({
          id: d.id,
          userId: d.user_id,
          authorName: d.author_name,
          title: d.title,
          description: d.description,
          category: d.category,
          icon: d.icon,
          color: d.color,
          isCustom: Boolean(d.is_custom),
          isPublic: Boolean(d.is_public),
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
        this.isCloudConnected = true;
        StorageService.saveDecks(formatted, userId);
        return formatted;
      }
    } catch {
      // Fallback
    }
    return StorageService.getDecks(userId);
  }

  public static async createDeck(deck: Partial<Deck>, userId?: string): Promise<Deck | null> {
    try {
      const id = `deck-${Date.now()}`;
      const now = new Date().toISOString();
      const isPublic = deck.isPublic ?? false;

      const { data, error } = await supabase.from('decks').insert({
        id,
        user_id: userId || null,
        author_name: deck.authorName || 'Học Viên',
        title: deck.title,
        description: deck.description || '',
        category: deck.category || 'custom',
        icon: deck.icon || 'BookOpen',
        color: deck.color || 'from-blue-500 to-indigo-600',
        is_custom: true,
        is_public: isPublic,
        created_at: now,
        updated_at: now,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          authorName: data.author_name,
          title: data.title,
          description: data.description,
          category: data.category,
          icon: data.icon,
          color: data.color,
          isCustom: Boolean(data.is_custom),
          isPublic: Boolean(data.is_public),
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {
      // Fallback
    }
    return null;
  }

  public static async deleteDeck(deckId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('decks').delete().eq('id', deckId);
      return !error;
    } catch {
      return true;
    }
  }

  // ================= CARDS =================
  public static async getCards(userId?: string, deckId?: string): Promise<Card[]> {
    try {
      let query = supabase.from('cards').select('*').order('created_at', { ascending: true });
      if (deckId) {
        query = query.eq('deck_id', deckId);
      } else if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null,user_id.eq.user-teacher-1`);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted: Card[] = data.map(c => ({
          id: c.id,
          deckId: c.deck_id,
          userId: c.user_id,
          word: c.word,
          ipa: c.ipa,
          partOfSpeech: c.part_of_speech,
          meaning: c.meaning,
          exampleEn: c.example_en,
          exampleVi: c.example_vi,
          mnemonic: c.mnemonic,
          imageUrl: c.image_url,
          audioUrl: c.audio_url,
          collocations: Array.isArray(c.collocations) ? c.collocations : undefined,
          cefrLevel: c.cefr_level || c.cefrLevel,
          srsLevel: c.srs_level || 0,
          intervalDays: c.interval_days || 0,
          easeFactor: c.ease_factor || 2.5,
          repetitionCount: c.repetition_count || 0,
          dueDate: c.due_date || new Date().toISOString().split('T')[0],
          lastReviewed: c.last_reviewed,
          mastery: c.mastery || 'new',
          createdAt: c.created_at,
        }));
        this.isCloudConnected = true;
        StorageService.saveCards(formatted, userId);
        return formatted;
      }
    } catch {
      // Fallback
    }
    return StorageService.getCards(userId);
  }

  public static async createCard(card: Partial<Card>, userId?: string): Promise<Card | null> {
    try {
      const id = `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const now = new Date().toISOString();
      const today = now.split('T')[0];

      const { data, error } = await supabase.from('cards').insert({
        id,
        deck_id: card.deckId,
        user_id: userId || null,
        word: card.word?.trim(),
        ipa: card.ipa?.trim() || '',
        part_of_speech: card.partOfSpeech || 'noun',
        meaning: card.meaning?.trim(),
        example_en: card.exampleEn?.trim() || '',
        example_vi: card.exampleVi?.trim() || '',
        mnemonic: card.mnemonic?.trim() || '',
        srs_level: card.srsLevel || 0,
        interval_days: card.intervalDays || 0,
        ease_factor: card.easeFactor || 2.5,
        repetition_count: card.repetitionCount || 0,
        due_date: card.dueDate || today,
        mastery: card.mastery || 'new',
        created_at: now,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          deckId: data.deck_id,
          userId: data.user_id,
          word: data.word,
          ipa: data.ipa,
          partOfSpeech: data.part_of_speech,
          meaning: data.meaning,
          exampleEn: data.example_en,
          exampleVi: data.example_vi,
          mnemonic: data.mnemonic,
          srsLevel: data.srs_level,
          intervalDays: data.interval_days,
          easeFactor: data.ease_factor,
          repetitionCount: data.repetition_count,
          dueDate: data.due_date,
          mastery: data.mastery,
          createdAt: data.created_at,
        };
      }
    } catch {
      // Fallback
    }
    return null;
  }

  public static async updateCard(cardId: string, card: Partial<Card>): Promise<boolean> {
    try {
      const { error } = await supabase.from('cards').update({
        word: card.word,
        ipa: card.ipa,
        part_of_speech: card.partOfSpeech,
        meaning: card.meaning,
        example_en: card.exampleEn,
        example_vi: card.exampleVi,
        mnemonic: card.mnemonic,
        srs_level: card.srsLevel,
        interval_days: card.intervalDays,
        ease_factor: card.easeFactor,
        repetition_count: card.repetitionCount,
        due_date: card.dueDate,
        last_reviewed: card.lastReviewed,
        mastery: card.mastery,
      }).eq('id', cardId);
      return !error;
    } catch {
      return true;
    }
  }

  public static async deleteCard(cardId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('cards').delete().eq('id', cardId);
      return !error;
    } catch {
      return true;
    }
  }

  // ================= STATS & XP =================
  public static async getStats(userId?: string): Promise<UserStats> {
    try {
      if (userId) {
        const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', userId).single();
        if (!error && data) {
          const formatted: UserStats = {
            userId: data.user_id,
            xp: data.xp || 0,
            level: data.level || 1,
            streak: data.streak || 1,
            lastStudyDate: data.last_study_date,
            dailyGoal: data.daily_goal || 10,
            studiedToday: data.studied_today || 0,
            totalCardsReviewed: data.total_cards_reviewed || 0,
            totalCardsMastered: data.total_cards_mastered || 0,
            perfectQuizzes: data.perfect_quizzes || 0,
            soundEnabled: Boolean(data.sound_enabled ?? true),
            theme: data.theme || 'light',
            voiceAccent: data.voice_accent || 'en-US',
            voiceSpeed: data.voice_speed || 0.9,
          };
          StorageService.saveStats(formatted, userId);
          return formatted;
        }
      }
    } catch {
      // Fallback
    }
    return StorageService.getStats(userId);
  }

  public static async addXP(amount: number, userId?: string, isPerfectQuiz = false): Promise<{ newStats: UserStats; leveledUp: boolean; newAchievements: Achievement[] }> {
    try {
      if (userId) {
        const today = new Date().toISOString().split('T')[0];
        const currentStats = await this.getStats(userId);
        
        let streak = currentStats.streak;
        let studiedToday = currentStats.studiedToday + 1;
        if (currentStats.lastStudyDate !== today) {
          streak += 1;
          studiedToday = 1;
        }

        const newXP = currentStats.xp + amount;
        const newLevel = Math.floor(Math.sqrt(newXP / 50)) + 1;
        const leveledUp = newLevel > currentStats.level;
        const totalReviewed = currentStats.totalCardsReviewed + 1;
        const perfectCount = currentStats.perfectQuizzes + (isPerfectQuiz ? 1 : 0);

        await supabase.from('user_stats').upsert({
          user_id: userId,
          xp: newXP,
          level: newLevel,
          streak,
          last_study_date: today,
          studied_today: studiedToday,
          total_cards_reviewed: totalReviewed,
          perfect_quizzes: perfectCount,
        });

        const updatedStats: UserStats = {
          ...currentStats,
          xp: newXP,
          level: newLevel,
          streak,
          lastStudyDate: today,
          studiedToday,
          totalCardsReviewed: totalReviewed,
          perfectQuizzes: perfectCount,
        };

        StorageService.saveStats(updatedStats, userId);
        const achs = StorageService.checkAchievements(updatedStats, userId);
        return { newStats: updatedStats, leveledUp, newAchievements: achs };
      }
    } catch {
      // Fallback
    }
    return StorageService.addXP(amount, userId);
  }
}
