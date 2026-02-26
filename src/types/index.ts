import {
  OpportunityStage,
  PricingRequestStatus,
  ProposalStatus,
  PricingRequestPriority,
  ContractStatus,
  ActivityType,
  UserRole,
} from './enums';

export * from './enums';
export * from './auth';
export * from './user';

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
  estimatedValue: number;
  currency: string;
  probability: number;
  stage: OpportunityStage;
  source: number;
  expectedCloseDate: string;
  description: string;
  ownerId: string;
  ownerName: string;
  isActive: boolean;
}

export interface Proposal {
  id: string;
  proposalNumber: string;
  opportunityId: string;
  opportunityTitle: string;
  clientId: string;
  clientName: string;
  title: string;
  description?: string;
  currency: string;
  validUntil: string;
  status: ProposalStatus;
  statusName: string;
  totalAmount: number;
  submittedDate?: string;
  approvedDate?: string;
  createdAt: string;
  lineItems: ProposalLineItem[];
}

export interface ProposalLineItem {
  id: string;
  proposalId: string;
  productServiceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  totalPrice: number;
}

export interface Contract {
  id: string;
  contractNumber: string;
  clientId: string;
  clientName: string;
  opportunityId: string;
  proposalId?: string;
  title: string;
  contractValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  statusName: string;
  totalValue: number;
  ownerId: string;
  ownerName: string;
  renewalNoticePeriod?: number;
  autoRenew: boolean;
  terms?: string;
  daysUntilExpiry?: number;
  isExpiringSoon?: boolean;
  createdAt?: string;
}

export interface ContractRenewal {
  id: string;
  contractId: string;
  renewalDate: string;
  renewalOpportunityId?: string;
  notes?: string;
  status: string;
  statusName: string;
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

export interface Contact {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  isPrimaryContact: boolean;
}

export interface PricingRequest {
  id: string;
  requestNumber: string;
  opportunityId: string;
  opportunityTitle?: string;
  title: string;
  description?: string;
  priority: number;
  status: PricingRequestStatus;
  statusName: string;
  assignedToId?: string;
  assignedToName?: string;
  requiredByDate: string;
  completedDate?: string;
  createdAt: string;
}
