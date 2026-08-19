export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface UserWithToken extends User {
  access_token: string;
  refresh_token: string;
}

export interface AdminUsersResponse {
  users: User[];
  total: number;
  page: number;
  size: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}