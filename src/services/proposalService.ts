import api from './api';
import { Proposal, ProposalStatus, ProposalLineItem } from '@/types';

export interface ProposalFilters {
  pageNumber: number;
  pageSize: number;
  opportunityId?: string;
  clientId?: string;
  status?: ProposalStatus;
  searchTerm?: string;
}

const proposalService = {
  async getProposals(filters: ProposalFilters): Promise<{ items: Proposal[]; totalCount: number; pageNumber: number; pageSize: number }> {
    const response = await api.get('/proposals', { params: filters });
    return response.data;
  },

  async getProposalById(id: string): Promise<Proposal> {
    const response = await api.get(`/proposals/${id}`);
    return response.data;
  },

  async createProposal(data: Partial<Proposal>): Promise<Proposal> {
    const response = await api.post('/proposals', data);
    return response.data;
  },

  async updateProposal(id: string, data: Partial<Proposal>): Promise<Proposal> {
    const response = await api.put(`/proposals/${id}`, data);
    return response.data;
  },

  async deleteProposal(id: string): Promise<void> {
    await api.delete(`/proposals/${id}`);
  },

  async submitProposal(id: string): Promise<Proposal> {
    const response = await api.put(`/proposals/${id}/submit`);
    return response.data;
  },

  async approveProposal(id: string): Promise<Proposal> {
    const response = await api.put(`/proposals/${id}/approve`);
    return response.data;
  },

  async rejectProposal(id: string): Promise<Proposal> {
    const response = await api.put(`/proposals/${id}/reject`);
    return response.data;
  },

  async addLineItem(proposalId: string, item: Partial<ProposalLineItem>): Promise<ProposalLineItem> {
    const response = await api.post(`/proposals/${proposalId}/line-items`, item);
    return response.data;
  },

  async updateLineItem(proposalId: string, lineItemId: string, item: Partial<ProposalLineItem>): Promise<ProposalLineItem> {
    const response = await api.put(`/proposals/${proposalId}/line-items/${lineItemId}`, item);
    return response.data;
  },

  async deleteLineItem(proposalId: string, lineItemId: string): Promise<void> {
    await api.delete(`/proposals/${proposalId}/line-items/${lineItemId}`);
  }
};

export default proposalService;
