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

// Mock data
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'p1',
    opportunityId: '1',
    opportunityTitle: 'Cloud Migration',
    clientId: '1',
    clientName: 'Acme Corp',
    status: ProposalStatus.APPROVED,
    totalValue: 450000,
    createdAt: '2026-02-10',
    lineItems: [
      { id: 'l1', proposalId: 'p1', sku: 'SaaS-01', description: 'Cloud Platform Subscription', quantity: 1, unitPrice: 400000, discount: 0 },
      { id: 'l2', proposalId: 'p1', sku: 'SRV-01', description: 'Migration Services', quantity: 50, unitPrice: 1000, discount: 0 },
    ]
  },
  {
    id: 'p2',
    opportunityId: '2',
    opportunityTitle: 'Security Audit',
    clientId: '2',
    clientName: 'Global Industries',
    status: ProposalStatus.SUBMITTED,
    totalValue: 280000,
    createdAt: '2026-02-15',
    lineItems: []
  },
];

const proposalService = {
  async getProposals(filters: ProposalFilters): Promise<{ items: Proposal[]; totalCount: number }> {
    try {
      // const response = await api.get('/Proposals', { params: filters });
      // return response.data;

      let filtered = [...MOCK_PROPOSALS];
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          p.opportunityTitle.toLowerCase().includes(term) || 
          p.clientName.toLowerCase().includes(term)
        );
      }
      if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      if (filters.clientId) {
        filtered = filtered.filter(p => p.clientId === filters.clientId);
      }
      if (filters.opportunityId) {
        filtered = filtered.filter(p => p.opportunityId === filters.opportunityId);
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

  async getProposalById(id: string): Promise<Proposal> {
    const prop = MOCK_PROPOSALS.find(p => p.id === id);
    if (!prop) throw new Error('Proposal not found');
    return new Promise((resolve) => {
      setTimeout(() => resolve(prop), 500);
    });
  },

  async createProposal(data: Partial<Proposal>): Promise<Proposal> {
    const newProp: Proposal = {
      id: Math.random().toString(36).substr(2, 9),
      opportunityId: data.opportunityId || '1',
      opportunityTitle: data.opportunityTitle || 'Mock Opportunity',
      clientId: data.clientId || '1',
      clientName: data.clientName || 'Mock Client',
      status: ProposalStatus.DRAFT,
      totalValue: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lineItems: [],
    };
    return new Promise((resolve) => {
      setTimeout(() => resolve(newProp), 1000);
    });
  },

  async updateProposal(id: string, data: Partial<Proposal>): Promise<Proposal> {
    const prop = MOCK_PROPOSALS.find(p => p.id === id);
    if (!prop) throw new Error('Proposal not found');
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...prop, ...data }), 1000);
    });
  },

  async deleteProposal(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 800);
    });
  },

  async submitProposal(id: string): Promise<Proposal> {
    return this.updateProposal(id, { status: ProposalStatus.SUBMITTED });
  },

  async approveProposal(id: string): Promise<Proposal> {
    return this.updateProposal(id, { status: ProposalStatus.APPROVED });
  },

  async rejectProposal(id: string): Promise<Proposal> {
    return this.updateProposal(id, { status: ProposalStatus.REJECTED });
  },

  async addLineItem(proposalId: string, item: Partial<ProposalLineItem>): Promise<ProposalLineItem> {
    const newItem: ProposalLineItem = {
      id: Math.random().toString(36).substr(2, 9),
      proposalId,
      sku: item.sku || '',
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      discount: item.discount || 0,
    };
    return new Promise((resolve) => {
      setTimeout(() => resolve(newItem), 500);
    });
  },

  async updateLineItem(proposalId: string, lineItemId: string, item: Partial<ProposalLineItem>): Promise<ProposalLineItem> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id: lineItemId, proposalId, ...item } as ProposalLineItem), 500);
    });
  },

  async deleteLineItem(proposalId: string, lineItemId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  }
};

export default proposalService;
