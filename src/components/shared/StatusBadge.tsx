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
  status: OpportunityStage | PricingRequestStatus | ProposalStatus | ContractStatus | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getColor = (val: string) => {
    switch (val) {
      case OpportunityStage.CLOSED_WON:
      case PricingRequestStatus.APPROVED:
      case ProposalStatus.APPROVED:
      case ContractStatus.ACTIVE:
        return 'success';
      case OpportunityStage.CLOSED_LOST:
      case PricingRequestStatus.REJECTED:
      case ProposalStatus.REJECTED:
      case ContractStatus.TERMINATED:
      case ContractStatus.EXPIRED:
        return 'error';
      case OpportunityStage.NEGOTIATION:
      case PricingRequestStatus.REVIEWING:
      case ProposalStatus.SUBMITTED:
      case ContractStatus.EXPIRING:
        return 'warning';
      case OpportunityStage.DISCOVERY:
      case OpportunityStage.QUALIFICATION:
      case OpportunityStage.PROPOSAL:
      case PricingRequestStatus.PENDING:
      case ProposalStatus.DRAFT:
        return 'processing';
      default:
        return 'default';
    }
  };

  return <Badge status={getColor(status) as any} text={status} />;
};

export default StatusBadge;
