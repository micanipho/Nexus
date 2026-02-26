import api from './api';
import { Client } from '@/types';

export interface ClientFilters {
  searchTerm?: string;
  industry?: string;
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface ClientStats {
  clientId: string;
  clientName: string;
  totalOpportunities: number;
  activeOpportunities: number;
  totalContracts: number;
  totalContractValue: number;
}

const clientService = {
  async getClients(filters: ClientFilters): Promise<{ items: Client[]; totalCount: number; pageNumber: number; pageSize: number }> {
    const response = await api.get('/clients', { params: filters });
    return response.data;
  },

  async getClientById(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  async createClient(clientData: Partial<Client>): Promise<Client> {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  async getClientStats(id: string): Promise<ClientStats> {
    const response = await api.get(`/clients/${id}/stats`);
    return response.data;
  }
};

export default clientService;
