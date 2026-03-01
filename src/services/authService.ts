import api from './api';
import { User, UserRole, AuthResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<any>('/auth/login', { email, password });
      
      const payload = response.data;
      // Handle both nested { user, token } and flat { token, ...userFields } shapes
      const user = payload.user || payload;
      
      return {
        user: {
          ...user,
          roles: user.roles || payload.roles || []
        },
        token: payload.token
      };
    } catch (error: unknown) {
      const axiosError = error as any;
      if (axiosError.response && axiosError.response.data) {
        throw new Error(axiosError.response.data.message || axiosError.response.data.error || 'Invalid credentials');
      }
      throw new Error('An error occurred during login. Please try again later.');
    }
  },

  async logout(): Promise<void> {
    sessionStorage.removeItem('nexus_token');
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
    const payloadData: Record<string, any> = { 
      firstName, 
      lastName, 
      email, 
      password,
    };

    if (tenantName) payloadData.tenantName = tenantName;
    if (tenantId) payloadData.tenantId = tenantId;
    if (role) payloadData.role = role;

    try {
      const response = await api.post<any>('/auth/register', payloadData);
      const payload = response.data;
      const user = payload.user || payload;

      return {
        user: {
          ...user,
          roles: user.roles || payload.roles || []
        },
        token: payload.token
      };
    } catch (error: unknown) {
      const axiosError = error as any;
      if (axiosError.response && axiosError.response.data) {
        throw new Error(
          axiosError.response.data.message || 
          axiosError.response.data.title || 
          axiosError.response.data.error || 
          JSON.stringify(axiosError.response.data.errors) || 
          'Registration failed due to invalid data'
        );
      }
      throw new Error('An error occurred during registration. Please try again later.');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User & { claims?: any[] }>('/auth/me');
    
    const user = response.data;
    if (!user.roles) {
      user.roles = [];
    }

    if (user.claims && Array.isArray(user.claims)) {
      const getClaim = (type: string) => {
        const claim = user.claims?.find((c: any) => c.type === type);
        return claim ? claim.value : undefined;
      };

      user.firstName = user.firstName || getClaim('firstName') || '';
      user.lastName = user.lastName || getClaim('lastName') || '';
      user.tenantId = user.tenantId || getClaim('tenantId') || '';
    }
    
    user.id = user.id || (user as any).userId;
    
    return user as User;
  },
};
