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

// Mock data
const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'c1',
    clientId: '1',
    clientName: 'Acme Corp',
    opportunityId: '1',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    status: ContractStatus.ACTIVE,
    totalValue: 1200000,
    ownerId: '1',
    ownerName: 'John Doe',
  },
];

const contractService = {
  async getContracts(filters: ContractFilters): Promise<{ items: Contract[]; totalCount: number }> {
    try {
      // const response = await api.get('/Contracts', { params: filters });
      // return response.data;

      let filtered = [...MOCK_CONTRACTS];
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(c => 
          c.clientName.toLowerCase().includes(term) || 
          c.ownerName.toLowerCase().includes(term)
        );
      }
      if (filters.status) {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      if (filters.clientId) {
        filtered = filtered.filter(c => c.clientId === filters.clientId);
      }
      if (filters.ownerId) {
        filtered = filtered.filter(c => c.ownerId === filters.ownerId);
      }

      const totalCount = filtered.length;
      const start = (filters.pageNumber - 1) * filters.pageSize;
      const items = filtered.slice(start, start + filters.pageSize);

      return new Promise((resolve) => {
        setTimeout(() => resolve({ items, totalCount }), 800);
      });
    } catch (error) {
      throw error;
    }
  },

  async getContractById(id: string): Promise<Contract> {
    const cont = MOCK_CONTRACTS.find(c => c.id === id);
    if (!cont) throw new Error('Contract not found');
    return new Promise((resolve) => {
      setTimeout(() => resolve(cont), 500);
    });
  },

  async createContract(data: Partial<Contract>): Promise<Contract> {
    const newCont: Contract = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: data.clientId || '1',
      clientName: data.clientName || 'Mock Client',
      opportunityId: data.opportunityId || '1',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      status: ContractStatus.ACTIVE,
      totalValue: data.totalValue || 0,
      ownerId: data.ownerId || '1',
      ownerName: data.ownerName || 'John Doe',
    };
    return new Promise((resolve) => {
      setTimeout(() => resolve(newCont), 1000);
    });
  },

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    const cont = MOCK_CONTRACTS.find(c => c.id === id);
    if (!cont) throw new Error('Contract not found');
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...cont, ...data }), 1000);
    });
  },

  async deleteContract(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 800);
    });
  },

  async getExpiringContracts(daysUntilExpiry: number = 90): Promise<Contract[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CONTRACTS), 600);
    });
  },

  async getClientContracts(clientId: string): Promise<Contract[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CONTRACTS.filter(c => c.clientId === clientId)), 500);
    });
  },

  async activateContract(id: string): Promise<Contract> {
    return this.updateContract(id, { status: ContractStatus.ACTIVE });
  },

  async cancelContract(id: string): Promise<Contract> {
    return this.updateContract(id, { status: ContractStatus.TERMINATED });
  },

  async getRenewals(contractId: string): Promise<ContractRenewal[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([]), 500);
    });
  },

  async createRenewal(contractId: string, data: Partial<ContractRenewal>): Promise<ContractRenewal> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id: 'r1', contractId, renewalDate: '2027-01-01', status: 'Pending' }), 500);
    });
  },

  async completeRenewal(renewalId: string): Promise<ContractRenewal> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id: renewalId, contractId: 'c1', renewalDate: '2027-01-01', status: 'Completed' }), 500);
    });
  }
};

export default contractService;
