import { get, post } from './client';
import type { TokenPair, User, UserWithToken } from '../types/auth';

export const registerApi = (email: string, password: string) =>
  post<UserWithToken>('/auth/register', { email, password });

export const loginApi = (email: string, password: string) =>
  post<TokenPair>('/auth/login', { email, password });

export const refreshApi = (refreshToken: string) =>
  post<TokenPair>('/auth/refresh', { refresh_token: refreshToken });

export const logoutApi = (refreshToken: string) =>
  post<void>('/auth/logout', { refresh_token: refreshToken });

export const meApi = () => get<User>('/auth/me');