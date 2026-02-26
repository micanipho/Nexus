import api from './api';
import { Contact } from '@/types';

export interface ContactFilters {
  clientId?: string;
  pageNumber: number;
  pageSize: number;
}

const contactService = {
  async getContacts(filters: ContactFilters): Promise<{ items: Contact[]; totalCount: number; pageNumber: number; pageSize: number }> {
    const response = await api.get('/contacts', { params: filters });
    return response.data;
  },

  async getContactsByClient(clientId: string): Promise<Contact[]> {
    const response = await api.get(`/contacts/by-client/${clientId}`);
    return response.data;
  },

  async getContactById(id: string): Promise<Contact> {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  async createContact(contactData: Partial<Contact>): Promise<Contact> {
    try {
      const response = await api.post('/contacts', contactData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to create contact');
      }
      throw new Error('An error occurred while creating the contact.');
    }
  },

  async updateContact(id: string, contactData: Partial<Contact>): Promise<Contact> {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },

  async setPrimaryContact(id: string): Promise<Contact> {
    const response = await api.put(`/contacts/${id}/set-primary`);
    return response.data;
  },

  async deleteContact(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`);
  }
};

export default contactService;
