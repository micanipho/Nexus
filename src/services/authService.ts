import api from './api';
import { User, AuthResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    // Optionally call logout endpoint
    // await api.post('/auth/logout');
    localStorage.removeItem('nexus_token');
    
  },

  async register(
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string,
    tenantName?: string,
    tenantId?: string,
    role?: string
  ): Promise<AuthResponse> {
    try {
      // Scenarios:
      // A: New Organisation (tenantName provided) — user becomes Admin
      // B: Join existing org (tenantId + role provided)
      // C: Default shared tenant (role provided, no org info)
      const response = await api.post<AuthResponse>('/auth/register', { 
        firstName, 
        lastName, 
        email, 
        password,
        tenantName,
        tenantId,
        role
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
