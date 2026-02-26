export enum OpportunityStage {
  DISCOVERY = 'Discovery',
  QUALIFICATION = 'Qualification',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost',
}

export enum PricingRequestStatus {
  PENDING = 'Pending',
  REVIEWING = 'Reviewing',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
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
  ACTIVE = 'Active',
  EXPIRING = 'Expiring',
  EXPIRED = 'Expired',
  TERMINATED = 'Terminated',
}

export enum ActivityType {
  CALL = 'Call',
  MEETING = 'Meeting',
  EMAIL = 'Email',
  TASK = 'Task',
}
