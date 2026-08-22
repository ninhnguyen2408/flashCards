import type { User, UserRole } from '../types/auth';

const STORAGE_KEYS = {
  USERS: 'vm_users_v2',
  CURRENT_USER: 'vm_current_user_v2',
};

const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin-1',
    username: 'admin',
    fullName: 'Quản Trị Viên (Admin)',
    email: 'admin@vocabmaster.vn',
    role: 'admin',
    avatar: '👑',
    password: 'admin123',
    createdAt: '2026-01-01T00:00:00.000Z',
    isActive: true,
  },
  {
    id: 'user-student-1',
    username: 'student',
    fullName: 'Nguyễn Văn Minh (Học Viên)',
    email: 'minh.student@gmail.com',
    role: 'student',
    avatar: '🎒',
    password: 'student123',
    createdAt: '2026-02-01T00:00:00.000Z',
    isActive: true,
  },
];

export class AuthService {
  // Get all users from storage
  public static getAllUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        this.saveUsers(DEFAULT_USERS);
        return DEFAULT_USERS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_USERS;
    }
  }

  public static saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Current session user (returns null if logged out)
  public static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) {
        return null;
      }
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Logout - truly clears session
  public static logout(): void {
    this.setCurrentUser(null);
  }


  // Login
  public static login(username: string, password?: string): { success: boolean; message: string; user?: User } {
    const users = this.getAllUsers();
    const cleanUsername = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername);

    if (!user) {
      return { success: false, message: 'Tài khoản không tồn tại trên hệ thống.' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Tài khoản này đã bị tạm khóa. Vui lòng liên hệ Quản trị viên.' };
    }

    if (user.password && password && user.password !== password) {
      return { success: false, message: 'Mật khẩu không chính xác.' };
    }

    this.setCurrentUser(user);
    return { success: true, message: `Chào mừng ${user.fullName} đã đăng nhập!`, user };
  }

  // Quick switch for demo accounts
  public static switchUser(roleOrUsername: string): User | null {
    const users = this.getAllUsers();
    const user = users.find(u => u.username === roleOrUsername || u.role === roleOrUsername);
    if (user && user.isActive) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  // Register new student user
  public static register(
    username: string,
    fullName: string,
    email: string,
    password?: string
  ): { success: boolean; message: string; user?: User } {
    const users = this.getAllUsers();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !fullName.trim()) {
      return { success: false, message: 'Vui lòng nhập đầy đủ Tên đăng nhập và Họ tên.' };
    }

    if (cleanUsername === 'admin') {
      return { success: false, message: 'Tên đăng nhập này là tài khoản Quản trị hệ thống, không thể đăng ký mới.' };
    }

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.' };
    }

    if (cleanEmail && users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email này đã được đăng ký.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      username: cleanUsername,
      fullName: fullName.trim(),
      email: cleanEmail || `${cleanUsername}@vocabmaster.vn`,
      role: 'student',
      avatar: '🎒',
      password: password || '123456',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const updated = [...users, newUser];
    this.saveUsers(updated);
    this.setCurrentUser(newUser);

    return { success: true, message: 'Đăng ký tài khoản học viên thành công!', user: newUser };
  }

  // Admin: Update user role
  public static updateUserRole(userId: string, newRole: UserRole): boolean {
    const users = this.getAllUsers();
    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: newRole,
          avatar: newRole === 'admin' ? '👑' : '🎒',
        };
      }
      return u;
    });
    this.saveUsers(updated);

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      const updatedCurrent = updated.find(u => u.id === userId);
      if (updatedCurrent) this.setCurrentUser(updatedCurrent);
    }
    return true;
  }

  // Admin: Toggle active status
  public static toggleUserStatus(userId: string): boolean {
    const users = this.getAllUsers();
    const target = users.find(u => u.id === userId);
    if (target?.username === 'admin' || target?.role === 'admin') return false;

    const updated = users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u);
    this.saveUsers(updated);
    return true;
  }

  // Admin: Delete user
  public static deleteUser(userId: string): boolean {
    const users = this.getAllUsers();
    const target = users.find(u => u.id === userId);
    if (target?.username === 'admin' || target?.role === 'admin') return false;

    const updated = users.filter(u => u.id !== userId);
    this.saveUsers(updated);
    return true;
  }
}
