import { User } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantName?: string;
  tenantId?: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
