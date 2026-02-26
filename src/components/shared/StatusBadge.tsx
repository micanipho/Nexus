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
    // Handle numeric PricingRequestStatus
    if (typeof val === 'number') {
      switch (val) {
        case PricingRequestStatus.COMPLETED: return 'success';
        case PricingRequestStatus.IN_PROGRESS: return 'warning';
        case PricingRequestStatus.PENDING: return 'processing';
        default: return 'default';
      }
    }
    // Handle string enums
    switch (val) {
      case OpportunityStage.CLOSED_WON:
      case ProposalStatus.APPROVED:
      case ContractStatus.ACTIVE:
        return 'success';
      case OpportunityStage.CLOSED_LOST:
      case ProposalStatus.REJECTED:
      case ContractStatus.TERMINATED:
      case ContractStatus.EXPIRED:
        return 'error';
      case OpportunityStage.NEGOTIATION:
      case ProposalStatus.SUBMITTED:
      case ContractStatus.EXPIRING:
        return 'warning';
      case OpportunityStage.DISCOVERY:
      case OpportunityStage.QUALIFICATION:
      case OpportunityStage.PROPOSAL:
      case ProposalStatus.DRAFT:
        return 'processing';
      default:
        return 'default';
    }
  };

  const getLabel = (val: string | number): string => {
    if (typeof val === 'number') {
      switch (val) {
        case PricingRequestStatus.PENDING: return 'Pending';
        case PricingRequestStatus.IN_PROGRESS: return 'In Progress';
        case PricingRequestStatus.COMPLETED: return 'Completed';
        default: return String(val);
      }
    }
    return val;
  };

  return <Badge status={getColor(status) as any} text={getLabel(status)} />;
};

export default StatusBadge;

