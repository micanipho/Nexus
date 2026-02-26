import api from './api';
import { Contract, ContractStatus, ContractRenewal } from '@/types';

export interface ContractFilters {
  pageNumber: number;
  pageSize: number;
  clientId?: string;
  ownerId?: string;
  status?: ContractStatus;
  searchTerm?: string;
}

export interface CreateContractPayload {
  clientId: string;
  opportunityId: string;
  proposalId: string;
  title: string;
  contractValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  renewalNoticePeriod?: number;
  autoRenew?: boolean;
  terms?: string;
}

const contractService = {
  async getContracts(filters: ContractFilters): Promise<{ items: Contract[]; totalCount: number; pageNumber: number; pageSize: number }> {
    const response = await api.get('/contracts', { params: filters });
    return response.data;
  },

  async getContractById(id: string): Promise<Contract> {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  async createContract(data: CreateContractPayload): Promise<Contract> {
    const response = await api.post('/contracts', data);
    return response.data;
  },

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    const response = await api.put(`/contracts/${id}`, data);
    return response.data;
  },

  async deleteContract(id: string): Promise<void> {
    await api.delete(`/contracts/${id}`);
  },

  async getExpiringContracts(daysUntilExpiry: number = 90): Promise<Contract[]> {
    const response = await api.get('/contracts/expiring', { params: { daysUntilExpiry } });
    return response.data;
  },

  async getClientContracts(clientId: string): Promise<Contract[]> {
    const response = await api.get(`/contracts/client/${clientId}`);
    return response.data;
  },

  async activateContract(id: string): Promise<Contract> {
    const response = await api.put(`/contracts/${id}/activate`);
    return response.data;
  },

  async cancelContract(id: string): Promise<Contract> {
    const response = await api.put(`/contracts/${id}/cancel`);
    return response.data;
  },

  async getRenewals(contractId: string): Promise<ContractRenewal[]> {
    const response = await api.get(`/contracts/${contractId}/renewals`);
    return response.data;
  },

  async createRenewal(contractId: string, data: Partial<ContractRenewal>): Promise<ContractRenewal> {
    const response = await api.post(`/contracts/${contractId}/renewals`, data);
    return response.data;
  },

  async completeRenewal(renewalId: string): Promise<ContractRenewal> {
    const response = await api.put(`/contracts/renewals/${renewalId}/complete`);
    return response.data;
  }
};

export default contractService;
