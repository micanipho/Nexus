import { Client } from '@/types';

export interface ClientFilters {
  searchTerm?: string;
  industry?: string;
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface ClientStats {
  totalRevenue: number;
  openOpportunities: number;
  winRate: number;
  activeContracts: number;
}

// Mock data for development
const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Acme Corp',
    industry: 'Technology',
    accountManagerId: '1',
    isActive: true,
    totalOpportunities: 3,
    lastContactDate: '2026-02-20',
    arr: 1250000,
    owner: 'John Doe',
  },
  {
    id: '2',
    name: 'Global Industries',
    industry: 'Manufacturing',
    accountManagerId: '1',
    isActive: true,
    totalOpportunities: 5,
    lastContactDate: '2026-02-18',
    arr: 850000,
    owner: 'John Doe',
  },
  {
    id: '3',
    name: 'Tech Solutions Ltd',
    industry: 'Software',
    accountManagerId: '2',
    isActive: false,
    totalOpportunities: 1,
    lastContactDate: '2026-01-15',
    arr: 450000,
    owner: 'Jane Smith',
  },
  {
    id: '4',
    name: 'Stellar Innovations',
    industry: 'Aerospace',
    accountManagerId: '1',
    isActive: true,
    totalOpportunities: 2,
    lastContactDate: '2026-02-22',
    arr: 2100000,
    owner: 'John Doe',
  },
  {
    id: '5',
    name: 'Future Systems',
    industry: 'AI',
    accountManagerId: '3',
    isActive: true,
    totalOpportunities: 8,
    lastContactDate: '2026-02-24',
    arr: 300000,
    owner: 'Alice Brown',
  },
];

const clientService = {
  async getClients(filters: ClientFilters): Promise<{ items: Client[]; totalCount: number }> {
    // Real API call
    // const response = await api.get('/Clients', { params: filters });
    // return response.data;

    // Mock fallback with filtering
    let filtered = [...MOCK_CLIENTS];
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.industry.toLowerCase().includes(term) ||
        c.owner.toLowerCase().includes(term)
      );
    }
    
    if (filters.industry) {
      filtered = filtered.filter(c => c.industry === filters.industry);
    }
    
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(c => c.isActive === filters.isActive);
    }

    const totalCount = filtered.length;
    const start = (filters.pageNumber - 1) * filters.pageSize;
    const items = filtered.slice(start, start + filters.pageSize);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ items, totalCount });
      }, 800);
    });
  },

  async getClientById(id: string): Promise<Client> {
    const client = MOCK_CLIENTS.find(c => c.id === id);
    if (!client) throw new Error('Client not found');

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(client);
      }, 500);
    });
  },

  async createClient(clientData: Partial<Client>): Promise<Client> {
    const newClient: Client = {
      id: Math.random().toString(36).substring(2, 11),
      name: clientData.name || 'New Client',
      industry: clientData.industry || 'Unknown',
      accountManagerId: clientData.accountManagerId || '1',
      isActive: clientData.isActive ?? true,
      totalOpportunities: 0,
      lastContactDate: new Date().toISOString().split('T')[0],
      arr: clientData.arr || 0,
      owner: clientData.owner || 'Unassigned',
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(newClient);
      }, 1000);
    });
  },

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    const client = MOCK_CLIENTS.find(c => c.id === id);
    if (!client) throw new Error('Client not found');

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...client, ...clientData });
      }, 1000);
    });
  },

  async deleteClient(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 800);
    });
  },

  async getClientStats(id: string): Promise<ClientStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalRevenue: 2500000,
          openOpportunities: 4,
          winRate: 75,
          activeContracts: 2
        });
      }, 600);
    });
  }
};

export default clientService;
