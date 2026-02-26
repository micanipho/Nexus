import api from './api';
import { PricingRequest } from '@/types';

export interface PricingRequestFilters {
  pageNumber: number;
  pageSize: number;
  status?: number;
  priority?: number;
  searchTerm?: string;
}

export interface CreatePricingRequestPayload {
  opportunityId: string;
  title: string;
  description?: string;
  priority: number;
  requiredByDate: string;
  assignedToId?: string;
}

const pricingRequestService = {
  async getPricingRequests(filters?: PricingRequestFilters): Promise<{ items: PricingRequest[]; totalCount: number }> {
    const response = await api.get('/pricingrequests', { params: filters });
    return response.data;
  },

  async getPricingRequestById(id: string): Promise<PricingRequest> {
    const response = await api.get(`/pricingrequests/${id}`);
    return response.data;
  },

  async getPendingRequests(): Promise<PricingRequest[]> {
    const response = await api.get('/pricingrequests/pending');
    return response.data;
  },

  async getMyRequests(): Promise<PricingRequest[]> {
    const response = await api.get('/pricingrequests/my-requests');
    return response.data;
  },

  async createPricingRequest(data: CreatePricingRequestPayload): Promise<PricingRequest> {
    try {
      const response = await api.post('/pricingrequests', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to create pricing request');
      }
      throw new Error('An error occurred while creating the pricing request.');
    }
  },

  async updatePricingRequest(id: string, data: Partial<CreatePricingRequestPayload>): Promise<PricingRequest> {
    try {
      const response = await api.put(`/pricingrequests/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to update pricing request');
      }
      throw new Error('An error occurred while updating the pricing request.');
    }
  },

  async assignPricingRequest(id: string, userId: string): Promise<PricingRequest> {
    try {
      const response = await api.post(`/pricingrequests/${id}/assign`, { userId });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to assign pricing request');
      }
      throw new Error('An error occurred while assigning the pricing request.');
    }
  },

  async completePricingRequest(id: string): Promise<PricingRequest> {
    try {
      const response = await api.put(`/pricingrequests/${id}/complete`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to complete pricing request');
      }
      throw new Error('An error occurred while completing the pricing request.');
    }
  },
};

export default pricingRequestService;
