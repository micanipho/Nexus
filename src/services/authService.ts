import api from './api';
import { User, UserRole, AuthResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<any>('/auth/login', { email, password });
      
      const payload = response.data;
      return {
        user: {
          ...payload,
          roles: payload.roles || []
        },
        token: payload.token
      };
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Invalid credentials');
      }
      throw new Error('An error occurred during login. Please try again later.');
    }
  },

  async logout(): Promise<void> {
    // Optionally call logout endpoint
    // await api.post('/auth/logout');
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
    // Scenarios:
    // A: New Organisation (tenantName provided) — user becomes Admin
    // B: Join existing org (tenantId + role provided)
    // C: Default shared tenant (role provided, no org info)
    const response = await api.post<any>('/auth/register', { 
      firstName, 
      lastName, 
      email, 
      password,
      tenantName,
      tenantId,
      role
    });
    
    const payload = response.data;
    return {
      user: {
        ...payload,
        roles: payload.roles || []
      },
      token: payload.token
    };
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<any>('/auth/me');
    
    // Ensure roles is always an array to prevent undefined errors in RBAC hook
    const user = response.data;
    if (!user.roles) {
      user.roles = [];
    }

    // /auth/me returns properties like firstName inside a "claims" array of objects
    // We map them to the root level to match the /auth/login shape that the Context expects
    if (user.claims && Array.isArray(user.claims)) {
      const getClaim = (type: string) => {
        const claim = user.claims.find((c: any) => c.type === type);
        return claim ? claim.value : undefined;
      };

      user.firstName = user.firstName || getClaim('firstName') || '';
      user.lastName = user.lastName || getClaim('lastName') || '';
      user.tenantId = user.tenantId || getClaim('tenantId') || '';
    }
    
    user.id = user.id || user.userId;
    
    return user as User;
  },
};
