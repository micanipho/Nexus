import { createContext } from 'react';
import { Opportunity, OpportunityStage } from '../../types';
import { OpportunityFilters, PipelineMetrics, OpportunityStageHistory } from '../../services/opportunityService';

export interface OpportunityState {
    opportunities: Opportunity[];
    selectedOpportunity: Opportunity | null;
    pipelineMetrics: PipelineMetrics | null;
    stageHistory: OpportunityStageHistory[];
    isPending: boolean;
    error: string | null;
    filters: OpportunityFilters;
    totalCount: number;
}

export interface OpportunityActions {
    fetchOpportunities: (filters?: OpportunityFilters) => Promise<void>;
    fetchMyOpportunities: (filters?: Partial<OpportunityFilters>) => Promise<void>;
    fetchOpportunityById: (id: string) => Promise<void>;
    createOpportunity: (data: any) => Promise<void>;
    updateOpportunity: (id: string, data: any) => Promise<void>;
    deactivateOpportunity: (id: string) => Promise<void>;
    fetchPipelineMetrics: (ownerId?: string) => Promise<void>;
    fetchStageHistory: (id: string) => Promise<void>;
    updateStage: (id: string, stage: OpportunityStage) => Promise<void>;
    assignOpportunity: (id: string, userId: string) => Promise<void>;
    setFilters: (filters: OpportunityFilters) => void;
    clearError: () => void;
}

export const INITIAL_STATE: OpportunityState = {
    opportunities: [],
    selectedOpportunity: null,
    pipelineMetrics: null,
    stageHistory: [],
    isPending: false,
    error: null,
    filters: {
        pageNumber: 1,
        pageSize: 10,
    },
    totalCount: 0,
};

export const OpportunityStateContext = createContext<OpportunityState>(INITIAL_STATE);
export const OpportunityActionContext = createContext<OpportunityActions | undefined>(undefined);
