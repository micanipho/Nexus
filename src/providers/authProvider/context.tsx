import { createContext } from 'react';
import { User } from '../../types';

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
  loading: true,
  error: null,
};

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string, 
    tenantName?: string,
    tenantId?: string, 
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>(initialState);
export const AuthActionsContext = createContext<AuthActions | undefined>(undefined);
