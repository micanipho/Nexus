import api from './api';
import { User, UserRole, AuthResponse } from '../types';

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
      const response = await api.get('/auth/me');
      const data = response.data;

      // The API returns claims as an array of { type, value } pairs.
      // Extract the needed fields into a flat User object.
      const claimMap = new Map<string, string>();
      if (Array.isArray(data.claims)) {
        for (const claim of data.claims) {
          claimMap.set(claim.type, claim.value);
        }
      }

      const user: User = {
        id: data.userId ?? claimMap.get('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier') ?? '',
        userId: data.userId ?? '',
        firstName: claimMap.get('firstName') ?? '',
        lastName: claimMap.get('lastName') ?? '',
        email: data.email ?? claimMap.get('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress') ?? '',
        roles: (data.roles ?? []) as UserRole[],
        tenantId: claimMap.get('tenantId') ?? '',
        tenantName: claimMap.get('tenantName'),
        expiresAt: claimMap.get('exp') ?? '',
      };

      return user;
    } catch (error) {
      throw error;
    }
  },
};
