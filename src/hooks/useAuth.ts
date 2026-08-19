import { useAuthContext } from '../context/AuthContext';
import type { AuthState } from '../types/auth';

export function useAuth(): AuthState {
  return useAuthContext();
}