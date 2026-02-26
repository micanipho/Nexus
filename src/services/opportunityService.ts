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
  totalValue: number;
  weightedValue: number;
  countByStage: Record<OpportunityStage, number>;
  valueByStage: Record<OpportunityStage, number>;
}

export interface OpportunityStageHistory {
  id: string;
  opportunityId: string;
  fromStage: OpportunityStage;
  toStage: OpportunityStage;
  changedAt: string;
  changedBy: string;
}

// Mock data
const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Acme Corp',
    title: 'Cloud Migration',
    value: 450000,
    stage: OpportunityStage.NEGOTIATION,
    probability: 75,
    expectedCloseDate: '2026-06-15',
    ownerId: '1',
    ownerName: 'John Doe',
    isActive: true,
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Global Industries',
    title: 'Security Audit',
    value: 280000,
    stage: OpportunityStage.QUALIFICATION,
    probability: 40,
    expectedCloseDate: '2026-04-20',
    ownerId: '1',
    ownerName: 'John Doe',
    isActive: true,
  },
  {
    id: '3',
    clientId: '1',
    clientName: 'Acme Corp',
    title: 'License Renewal',
    value: 120000,
    stage: OpportunityStage.PROPOSAL,
    probability: 60,
    expectedCloseDate: '2026-03-10',
    ownerId: '2',
    ownerName: 'Jane Smith',
    isActive: true,
  },
];

const opportunityService = {
  async getOpportunities(filters: OpportunityFilters): Promise<{ items: Opportunity[]; totalCount: number }> {
    try {
      // const response = await api.get('/Opportunities', { params: filters });
      // return response.data;

      let filtered = [...MOCK_OPPORTUNITIES];
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(o => 
          o.title.toLowerCase().includes(term) || 
          o.clientName.toLowerCase().includes(term)
        );
      }
      if (filters.stage) {
        filtered = filtered.filter(o => o.stage === filters.stage);
      }
      if (filters.clientId) {
        filtered = filtered.filter(o => o.clientId === filters.clientId);
      }
      if (filters.ownerId) {
        filtered = filtered.filter(o => o.ownerId === filters.ownerId);
      }
      if (filters.isActive !== undefined) {
        filtered = filtered.filter(o => o.isActive === filters.isActive);
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

  async getMyOpportunities(filters: Partial<OpportunityFilters>): Promise<{ items: Opportunity[]; totalCount: number }> {
    return this.getOpportunities({
      pageNumber: 1,
      pageSize: 10,
      ...filters,
      ownerId: '1', // Assuming '1' is the current user for mock
    });
  },

  async getOpportunityById(id: string): Promise<Opportunity> {
    const opp = MOCK_OPPORTUNITIES.find(o => o.id === id);
    if (!opp) throw new Error('Opportunity not found');
    return new Promise((resolve) => {
      setTimeout(() => resolve(opp), 500);
    });
  },

  async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    const newOpp: Opportunity = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: data.clientId || '1',
      clientName: data.clientName || 'Mock Client',
      title: data.title || 'New Opportunity',
      value: data.value || 0,
      stage: data.stage || OpportunityStage.DISCOVERY,
      probability: data.probability || 10,
      expectedCloseDate: data.expectedCloseDate || new Date().toISOString().split('T')[0],
      ownerId: data.ownerId || '1',
      ownerName: data.ownerName || 'John Doe',
      isActive: true,
    };
    return new Promise((resolve) => {
      setTimeout(() => resolve(newOpp), 1000);
    });
  },

  async updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    const opp = MOCK_OPPORTUNITIES.find(o => o.id === id);
    if (!opp) throw new Error('Opportunity not found');
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...opp, ...data }), 1000);
    });
  },

  async deleteOpportunity(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 800);
    });
  },

  async getPipelineMetrics(ownerId?: string): Promise<PipelineMetrics> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        totalValue: 850000,
        weightedValue: 520000,
        countByStage: {
          [OpportunityStage.DISCOVERY]: 2,
          [OpportunityStage.QUALIFICATION]: 1,
          [OpportunityStage.PROPOSAL]: 3,
          [OpportunityStage.NEGOTIATION]: 1,
          [OpportunityStage.CLOSED_WON]: 5,
          [OpportunityStage.CLOSED_LOST]: 2,
        },
        valueByStage: {
          [OpportunityStage.DISCOVERY]: 100000,
          [OpportunityStage.QUALIFICATION]: 50000,
          [OpportunityStage.PROPOSAL]: 300000,
          [OpportunityStage.NEGOTIATION]: 400000,
          [OpportunityStage.CLOSED_WON]: 1500000,
          [OpportunityStage.CLOSED_LOST]: 500000,
        }
      }), 600);
    });
  },

  async getStageHistory(id: string): Promise<OpportunityStageHistory[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([
        {
          id: 'h1',
          opportunityId: id,
          fromStage: OpportunityStage.DISCOVERY,
          toStage: OpportunityStage.QUALIFICATION,
          changedAt: '2026-01-10T10:00:00Z',
          changedBy: 'John Doe',
        }
      ]), 500);
    });
  },

  async updateStage(id: string, stage: OpportunityStage): Promise<Opportunity> {
    return this.updateOpportunity(id, { stage });
  },

  async assignOpportunity(id: string, userId: string): Promise<Opportunity> {
    return this.updateOpportunity(id, { ownerId: userId, ownerName: 'Assigned User' });
  }
};

export default opportunityService;
