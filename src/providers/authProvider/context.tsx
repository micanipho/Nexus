import { createContext } from 'react';
import { User } from '@/types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const AuthContext = createContext<AuthState>(initialState);
export const AuthActionsContext = createContext<any>(null);
