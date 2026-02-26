export enum OpportunityStage {
  DISCOVERY = 'Discovery',
  QUALIFICATION = 'Qualification',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost',
}

export enum PricingRequestStatus {
  PENDING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
}

export enum ProposalStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum PricingRequestPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum ContractStatus {
  DRAFT = 'Draft',
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  RENEWED = 'Renewed',
  CANCELLED = 'Cancelled',
}

export enum ActivityType {
  CALL = 'Call',
  MEETING = 'Meeting',
  EMAIL = 'Email',
  TASK = 'Task',
}

export enum UserRole {
  ADMIN = 'Admin',
  SALES_MANAGER = 'SalesManager',
  BUSINESS_DEVELOPMENT_MANAGER = 'BusinessDevelopmentManager',
  SALES_REP = 'SalesRep',
}
