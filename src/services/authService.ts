import api from './api';
import { User } from '@/types';

// Mock data for development
const MOCK_USER: User = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'Sales Executive',
  avatar: 'https://i.pravatar.cc/150?u=1',
};

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      // Real API call
      // const response = await api.post('/auth/login', { email, password });
      // return response.data;

      // Mock fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            user: MOCK_USER,
            token: 'mock-jwt-token-12345',
          });
        }, 1000);
      });
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    // const response = await api.post('/auth/logout');
    localStorage.removeItem('nexus_token');
  },

  async register(firstName: string, lastName: string, email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      // Real API call
      // const response = await api.post('/auth/register', { firstName, lastName, email, password });
      // return response.data;

      // Mock fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            user: { ...MOCK_USER, firstName, lastName, email },
            token: 'mock-jwt-token-register',
          });
        }, 1000);
      });
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      // const response = await api.get('/auth/me');
      // return response.data;

      // Mock fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(MOCK_USER);
        }, 500);
      });
    } catch (error) {
      throw error;
    }
  },
};
