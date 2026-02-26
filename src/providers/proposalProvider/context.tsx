import { createContext } from 'react';
import { Proposal, ProposalStatus, ProposalLineItem } from '../../types';
import { ProposalFilters } from '../../services/proposalService';

export interface ProposalState {
    proposals: Proposal[];
    selectedProposal: Proposal | null;
    isPending: boolean;
    error: string | null;
    filters: ProposalFilters;
    totalCount: number;
}

export interface ProposalActions {
    fetchProposals: (filters?: ProposalFilters) => Promise<void>;
    fetchProposalById: (id: string) => Promise<void>;
    createProposal: (data: any) => Promise<void>;
    updateProposal: (id: string, data: any) => Promise<void>;
    deleteProposal: (id: string) => Promise<void>;
    submitProposal: (id: string) => Promise<void>;
    approveProposal: (id: string) => Promise<void>;
    rejectProposal: (id: string) => Promise<void>;
    addLineItem: (proposalId: string, item: Partial<ProposalLineItem>) => Promise<void>;
    updateLineItem: (proposalId: string, lineItemId: string, item: Partial<ProposalLineItem>) => Promise<void>;
    deleteLineItem: (proposalId: string, lineItemId: string) => Promise<void>;
    setFilters: (filters: ProposalFilters) => void;
    clearError: () => void;
}

export const INITIAL_STATE: ProposalState = {
    proposals: [],
    selectedProposal: null,
    isPending: false,
    error: null,
    filters: {
        pageNumber: 1,
        pageSize: 10,
    },
    totalCount: 0,
};

export const ProposalStateContext = createContext<ProposalState>(INITIAL_STATE);
export const ProposalActionContext = createContext<ProposalActions | undefined>(undefined);
