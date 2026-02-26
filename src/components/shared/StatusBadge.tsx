'use client';

import React from 'react';
import { Badge } from 'antd';
import { 
  OpportunityStage, 
  PricingRequestStatus, 
  ProposalStatus,
  ContractStatus 
} from '@/types/enums';

interface StatusBadgeProps {
  status: OpportunityStage | PricingRequestStatus | ProposalStatus | ContractStatus | string | number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getColor = (val: string | number) => {
    // Handle numeric enums (PricingRequestStatus + ProposalStatus)
    if (typeof val === 'number') {
      switch (val) {
        // PricingRequestStatus
        case PricingRequestStatus.COMPLETED: return 'success';
        case PricingRequestStatus.IN_PROGRESS: return 'warning';
        case PricingRequestStatus.PENDING: return 'processing';
        // ProposalStatus
        case ProposalStatus.APPROVED: return 'success';
        case ProposalStatus.REJECTED: return 'error';
        case ProposalStatus.SUBMITTED: return 'warning';
        case ProposalStatus.DRAFT: return 'processing';
        default: return 'default';
      }
    }
    // Handle string enums
    switch (val) {
      case OpportunityStage.CLOSED_WON:
      case ContractStatus.ACTIVE:
        return 'success';
      case OpportunityStage.CLOSED_LOST:
      case ContractStatus.CANCELLED:
      case ContractStatus.EXPIRED:
        return 'error';
      case OpportunityStage.NEGOTIATION:
      case ContractStatus.RENEWED:
        return 'warning';
      case OpportunityStage.DISCOVERY:
      case OpportunityStage.QUALIFICATION:
      case OpportunityStage.PROPOSAL:
      case ContractStatus.DRAFT:
        return 'processing';
      default:
        return 'default';
    }
  };

  const getLabel = (val: string | number): string => {
    if (typeof val === 'number') {
      switch (val) {
        // PricingRequestStatus
        case PricingRequestStatus.PENDING: return 'Pending';
        case PricingRequestStatus.IN_PROGRESS: return 'In Progress';
        case PricingRequestStatus.COMPLETED: return 'Completed';
        // ProposalStatus
        case ProposalStatus.DRAFT: return 'Draft';
        case ProposalStatus.SUBMITTED: return 'Submitted';
        case ProposalStatus.REJECTED: return 'Rejected';
        case ProposalStatus.APPROVED: return 'Approved';
        default: return String(val);
      }
    }
    return val;
  };

  return <Badge status={getColor(status) as any} text={getLabel(status)} />;
};

export default StatusBadge;

