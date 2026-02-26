import api from './api';
import { Opportunity, OpportunityStage } from '@/types';

export interface OpportunityFilters {
  pageNumber: number;
  pageSize: number;
  clientId?: string;
  ownerId?: string;
  stage?: OpportunityStage;
  searchTerm?: string;
  isActive?: boolean;
}

export interface PipelineMetrics {
  totalValue?: number;
  weightedPipelineValue: number;
  stages: Array<{ stage: number; stageName: string; count: number; totalValue: number }>;
  conversionRate: number;
}

export interface OpportunityStageHistory {
  id: string;
  opportunityId: string;
  fromStage: OpportunityStage;
  toStage: OpportunityStage;
  changedAt: string;
  notes?: string;
}

const opportunityService = {
  async getOpportunities(filters: OpportunityFilters): Promise<{ items: Opportunity[]; totalCount: number; pageNumber: number; pageSize: number }> {
    const response = await api.get('/opportunities', { params: filters });
    return response.data;
  },

  async getMyOpportunities(filters: Partial<OpportunityFilters>): Promise<{ items: Opportunity[]; totalCount: number; pageNumber: number; pageSize: number }> {
    const response = await api.get('/opportunities/my-opportunities', { params: filters });
    return response.data;
  },

  async getOpportunityById(id: string): Promise<Opportunity> {
    const response = await api.get(`/opportunities/${id}`);
    return response.data;
  },

  async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    try {
      const response = await api.post('/opportunities', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to create opportunity');
      }
      throw new Error('An error occurred while creating the opportunity.');
    }
  },

  async updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    const response = await api.put(`/opportunities/${id}`, data);
    return response.data;
  },

  async deleteOpportunity(id: string): Promise<void> {
    await api.delete(`/opportunities/${id}`);
  },

  async getPipelineMetrics(ownerId?: string): Promise<PipelineMetrics> {
    const response = await api.get('/opportunities/pipeline', { params: { ownerId } });
    return response.data;
  },

  async getStageHistory(id: string): Promise<OpportunityStageHistory[]> {
    const response = await api.get(`/opportunities/${id}/stage-history`);
    return response.data;
  },

  async updateStage(id: string, stage: OpportunityStage, notes: string = '', lossReason: string | null = null): Promise<Opportunity> {
    try {
      const response = await api.put(`/opportunities/${id}/stage`, { stage, notes, lossReason });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to update stage');
      }
      throw new Error('An error occurred while updating the opportunity stage.');
    }
  },

  async assignOpportunity(id: string, userId: string): Promise<Opportunity> {
    const response = await api.post(`/opportunities/${id}/assign`, { userId });
    return response.data;
  }
};

export default opportunityService;
