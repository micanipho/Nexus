'use client';

import React, { useReducer, useContext, useMemo } from 'react';
import { OpportunityStateContext, OpportunityActionContext, INITIAL_STATE, OpportunityActions } from './context';
import { opportunityReducer } from './reducer';
import * as actions from './actions';
import opportunityService, { OpportunityFilters } from '../../services/opportunityService';
import { OpportunityStage } from '../../types';

export const OpportunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(opportunityReducer, INITIAL_STATE);

    const opportunityActions: OpportunityActions = useMemo(
        () => ({
            fetchOpportunities: async (filters?: OpportunityFilters) => {
                dispatch(actions.fetchOpportunitiesPending());
                try {
                    const response = await opportunityService.getOpportunities(filters || state.filters);
                    dispatch(actions.fetchOpportunitiesSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchOpportunitiesError(error.response?.data?.message || 'Failed to fetch opportunities'));
                }
            },
            fetchMyOpportunities: async (filters?: Partial<OpportunityFilters>) => {
                dispatch(actions.fetchOpportunitiesPending());
                try {
                    const response = await opportunityService.getMyOpportunities(filters || {});
                    dispatch(actions.fetchOpportunitiesSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchOpportunitiesError(error.response?.data?.message || 'Failed to fetch my opportunities'));
                }
            },
            fetchOpportunityById: async (id: string) => {
                dispatch(actions.fetchOpportunityByIdPending());
                try {
                    const response = await opportunityService.getOpportunityById(id);
                    dispatch(actions.fetchOpportunityByIdSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchOpportunityByIdError(error.response?.data?.message || 'Failed to fetch opportunity'));
                }
            },
            createOpportunity: async (data: any) => {
                dispatch(actions.createOpportunityPending());
                try {
                    const response = await opportunityService.createOpportunity(data);
                    dispatch(actions.createOpportunitySuccess(response));
                } catch (error: any) {
                    dispatch(actions.createOpportunityError(error.response?.data?.message || 'Failed to create opportunity'));
                }
            },
            updateOpportunity: async (id: string, data: any) => {
                dispatch(actions.updateOpportunityPending());
                try {
                    const response = await opportunityService.updateOpportunity(id, data);
                    dispatch(actions.updateOpportunitySuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateOpportunityError(error.response?.data?.message || 'Failed to update opportunity'));
                }
            },
            deactivateOpportunity: async (id: string) => {
                dispatch(actions.deactivateOpportunityPending());
                try {
                    await opportunityService.deactivateOpportunity(id);
                    dispatch(actions.deactivateOpportunitySuccess(id));
                } catch (error: any) {
                    dispatch(actions.deactivateOpportunityError(error.response?.data?.message || 'Failed to deactivate opportunity'));
                }
            },
            fetchPipelineMetrics: async (ownerId?: string) => {
                dispatch(actions.fetchPipelineMetricsPending());
                try {
                    const response = await opportunityService.getPipelineMetrics(ownerId);
                    dispatch(actions.fetchPipelineMetricsSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchPipelineMetricsError(error.response?.data?.message || 'Failed to fetch pipeline metrics'));
                }
            },
            fetchStageHistory: async (id: string) => {
                dispatch(actions.fetchStageHistoryPending());
                try {
                    const response = await opportunityService.getStageHistory(id);
                    dispatch(actions.fetchStageHistorySuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchStageHistoryError(error.response?.data?.message || 'Failed to fetch stage history'));
                }
            },
            updateStage: async (id: string, stage: OpportunityStage) => {
                dispatch(actions.updateOpportunityPending());
                try {
                    const response = await opportunityService.updateStage(id, stage);
                    dispatch(actions.updateOpportunitySuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateOpportunityError(error.response?.data?.message || 'Failed to update stage'));
                }
            },
            assignOpportunity: async (id: string, userId: string) => {
                dispatch(actions.updateOpportunityPending());
                try {
                    const response = await opportunityService.assignOpportunity(id, userId);
                    dispatch(actions.updateOpportunitySuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateOpportunityError(error.response?.data?.message || 'Failed to assign opportunity'));
                }
            },
            setFilters: (filters: OpportunityFilters) => {
                dispatch(actions.setFilters(filters));
            },
            clearError: () => {
                dispatch(actions.clearError());
            },
        }),
        [state.filters]
    );

    return (
        <OpportunityStateContext.Provider value={state}>
            <OpportunityActionContext.Provider value={opportunityActions}>
                {children}
            </OpportunityActionContext.Provider>
        </OpportunityStateContext.Provider>
    );
};

export const useOpportunities = () => {
    const context = useContext(OpportunityStateContext);
    if (context === undefined) {
        throw new Error('useOpportunities must be used within an OpportunityProvider');
    }
    return context;
};

export const useOpportunityActions = () => {
    const context = useContext(OpportunityActionContext);
    if (context === undefined) {
        throw new Error('useOpportunityActions must be used within an OpportunityProvider');
    }
    return context;
};
