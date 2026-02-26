'use client';

import React, { useReducer, useContext, useMemo } from 'react';
import { ProposalStateContext, ProposalActionContext, INITIAL_STATE, ProposalActions } from './context';
import { proposalReducer } from './reducer';
import * as actions from './actions';
import proposalService, { ProposalFilters, CreateProposalPayload, CreateLineItemPayload } from '../../services/proposalService';

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(proposalReducer, INITIAL_STATE);

    const proposalActions: ProposalActions = useMemo(
        () => ({
            fetchProposals: async (filters?: ProposalFilters) => {
                dispatch(actions.fetchProposalsPending());
                try {
                    const response = await proposalService.getProposals(filters || state.filters);
                    dispatch(actions.fetchProposalsSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchProposalsError(error.response?.data?.message || 'Failed to fetch proposals'));
                }
            },
            fetchProposalById: async (id: string) => {
                dispatch(actions.fetchProposalByIdPending());
                try {
                    const response = await proposalService.getProposalById(id);
                    dispatch(actions.fetchProposalByIdSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchProposalByIdError(error.response?.data?.message || 'Failed to fetch proposal'));
                }
            },
            createProposal: async (data: CreateProposalPayload) => {
                dispatch(actions.createProposalPending());
                try {
                    const response = await proposalService.createProposal(data);
                    dispatch(actions.createProposalSuccess(response));
                } catch (error: any) {
                    dispatch(actions.createProposalError(error.response?.data?.message || 'Failed to create proposal'));
                }
            },
            updateProposal: async (id: string, data: any) => {
                dispatch(actions.updateProposalPending());
                try {
                    const response = await proposalService.updateProposal(id, data);
                    dispatch(actions.updateProposalSuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateProposalError(error.response?.data?.message || 'Failed to update proposal'));
                }
            },
            deleteProposal: async (id: string) => {
                dispatch(actions.deleteProposalPending());
                try {
                    await proposalService.deleteProposal(id);
                    dispatch(actions.deleteProposalSuccess(id));
                } catch (error: any) {
                    dispatch(actions.deleteProposalError(error.response?.data?.message || 'Failed to delete proposal'));
                }
            },
            submitProposal: async (id: string) => {
                dispatch(actions.updateProposalPending());
                try {
                    const response = await proposalService.submitProposal(id);
                    dispatch(actions.updateProposalSuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateProposalError(error.response?.data?.message || 'Failed to submit proposal'));
                }
            },
            approveProposal: async (id: string) => {
                dispatch(actions.updateProposalPending());
                try {
                    const response = await proposalService.approveProposal(id);
                    dispatch(actions.updateProposalSuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateProposalError(error.response?.data?.message || 'Failed to approve proposal'));
                }
            },
            rejectProposal: async (id: string) => {
                dispatch(actions.updateProposalPending());
                try {
                    const response = await proposalService.rejectProposal(id);
                    dispatch(actions.updateProposalSuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateProposalError(error.response?.data?.message || 'Failed to reject proposal'));
                }
            },
            addLineItem: async (proposalId: string, item: CreateLineItemPayload) => {
                try {
                    await proposalService.addLineItem(proposalId, item);
                    // Refresh proposal to get updated total value and items
                    const updated = await proposalService.getProposalById(proposalId);
                    dispatch(actions.updateProposalSuccess(updated));
                } catch (error: any) {
                    dispatch(actions.updateProposalError(error.response?.data?.message || 'Failed to add line item'));
                }
            },
            updateLineItem: async (proposalId: string, lineItemId: string, item: Partial<CreateLineItemPayload>) => {
                try {
                    await proposalService.updateLineItem(proposalId, lineItemId, item);
                    const updated = await proposalService.getProposalById(proposalId);
                    dispatch(actions.updateProposalSuccess(updated));
                } catch (error: any) {
                    dispatch(actions.updateProposalError(error.response?.data?.message || 'Failed to update line item'));
                }
            },
            deleteLineItem: async (proposalId: string, lineItemId: string) => {
                try {
                    await proposalService.deleteLineItem(proposalId, lineItemId);
                    const updated = await proposalService.getProposalById(proposalId);
                    dispatch(actions.updateProposalSuccess(updated));
                } catch (error: any) {
                    dispatch(actions.updateProposalError(error.response?.data?.message || 'Failed to delete line item'));
                }
            },
            setFilters: (filters: ProposalFilters) => {
                dispatch(actions.setFilters(filters));
            },
            clearError: () => {
                dispatch(actions.clearError());
            },
        }),
        [state.filters]
    );

    return (
        <ProposalStateContext.Provider value={state}>
            <ProposalActionContext.Provider value={proposalActions}>
                {children}
            </ProposalActionContext.Provider>
        </ProposalStateContext.Provider>
    );
};

export const useProposals = () => {
    const context = useContext(ProposalStateContext);
    if (context === undefined) {
        throw new Error('useProposals must be used within a ProposalProvider');
    }
    return context;
};

export const useProposalActions = () => {
    const context = useContext(ProposalActionContext);
    if (context === undefined) {
        throw new Error('useProposalActions must be used within a ProposalProvider');
    }
    return context;
};
