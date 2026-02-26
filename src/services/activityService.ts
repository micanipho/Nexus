import api from './api';
import { Activity } from '@/types';

export interface ActivityFilters {
  searchTerm?: string;
  type?: number;
  status?: number;
  priority?: number;
  assignedToId?: string;
  relatedToId?: string;
  relatedToType?: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateActivityPayload {
  type: number;
  subject: string;
  description?: string;
  priority: number;
  dueDate: string;
  assignedToId: string;
  relatedToType?: number;
  relatedToId?: string;
  duration?: number;
  location?: string;
}

const activityService = {
  async getActivities(filters: ActivityFilters): Promise<{ items: Activity[]; totalCount: number; pageNumber: number; pageSize: number }> {
    const response = await api.get('/activities', { params: filters });
    return response.data;
  },

  async getMyActivities(filters: { pageNumber: number; pageSize: number }): Promise<{ items: Activity[]; totalCount: number; pageNumber: number; pageSize: number }> {
    const response = await api.get('/activities/my-activities', { params: filters });
    return response.data;
  },

  async getUpcomingActivities(daysAhead: number = 7): Promise<Activity[]> {
    const response = await api.get('/activities/upcoming', { params: { daysAhead } });
    return response.data;
  },

  async getOverdueActivities(): Promise<Activity[]> {
    const response = await api.get('/activities/overdue');
    return response.data;
  },

  async getActivityById(id: string): Promise<Activity> {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  async createActivity(payload: CreateActivityPayload): Promise<Activity> {
    const response = await api.post('/activities', payload);
    return response.data;
  },

  async updateActivity(id: string, payload: Partial<CreateActivityPayload>): Promise<Activity> {
    const response = await api.put(`/activities/${id}`, payload);
    return response.data;
  },

  async completeActivity(id: string, outcome: string): Promise<Activity> {
    const response = await api.put(`/activities/${id}/complete`, { outcome });
    return response.data;
  },

  async cancelActivity(id: string): Promise<Activity> {
    const response = await api.put(`/activities/${id}/cancel`);
    return response.data;
  },

  async deleteActivity(id: string): Promise<void> {
    await api.delete(`/activities/${id}`);
  }
};

export default activityService;
