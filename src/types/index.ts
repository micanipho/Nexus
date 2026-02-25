import {
  OpportunityStage,
  PricingRequestStatus,
  PricingRequestPriority,
  ContractStatus,
  ActivityType,
} from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  accountManagerId: string;
  status: 'Active' | 'Inactive';
  totalOpportunities: number;
  lastContactDate: string;
}

export interface Opportunity {
  id: string;
  clientId: string;
  title: string;
  value: number;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
}

export interface PricingRequest {
  id: string;
  opportunityId: string;
  requestDate: string;
  status: PricingRequestStatus;
  priority: PricingRequestPriority;
  totalValue: number;
  items: PricingItem[];
}

export interface PricingItem {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface Contract {
  id: string;
  clientId: string;
  opportunityId: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  totalValue: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  clientId: string;
  userId: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  pipelineValue: number;
  winRate: number;
  activeContracts: number;
}
