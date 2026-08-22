export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string;
  createdAt: string;
  isActive: boolean;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}
