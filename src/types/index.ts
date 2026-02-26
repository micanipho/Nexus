import {
  OpportunityStage,
  PricingRequestStatus,
  PricingRequestPriority,
  ContractStatus,
  ActivityType,
  UserRole,
} from './enums';

export * from './enums';
export * from './auth';

export interface User {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];
  tenantId: string;
  expiresAt: string;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  accountManagerId: string;
  isActive: boolean;
  totalOpportunities: number;
  lastContactDate: string;
  arr: number;
  owner: string;
}

export interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  value: number;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
  ownerName: string;
  isActive: boolean;
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
