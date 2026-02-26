'use client';

import React, { useReducer, useContext, useMemo } from 'react';
import { ContractStateContext, ContractActionContext, INITIAL_STATE, ContractActions } from './context';
import { contractReducer } from './reducer';
import * as actions from './actions';
import contractService, { ContractFilters } from '../../services/contractService';

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(contractReducer, INITIAL_STATE);

    const contractActions: ContractActions = useMemo(
        () => ({
            fetchContracts: async (filters?: ContractFilters) => {
                dispatch(actions.fetchContractsPending());
                try {
                    const response = await contractService.getContracts(filters || state.filters);
                    dispatch(actions.fetchContractsSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchContractsError(error.response?.data?.message || 'Failed to fetch contracts'));
                }
            },
            fetchContractById: async (id: string) => {
                dispatch(actions.fetchContractByIdPending());
                try {
                    const response = await contractService.getContractById(id);
                    dispatch(actions.fetchContractByIdSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchContractByIdError(error.response?.data?.message || 'Failed to fetch contract'));
                }
            },
            createContract: async (data: any) => {
                dispatch(actions.createContractPending());
                try {
                    const response = await contractService.createContract(data);
                    dispatch(actions.createContractSuccess(response));
                } catch (error: any) {
                    dispatch(actions.createContractError(error.response?.data?.message || 'Failed to create contract'));
                }
            },
            updateContract: async (id: string, data: any) => {
                dispatch(actions.updateContractPending());
                try {
                    const response = await contractService.updateContract(id, data);
                    dispatch(actions.updateContractSuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateContractError(error.response?.data?.message || 'Failed to update contract'));
                }
            },
            deleteContract: async (id: string) => {
                dispatch(actions.deleteContractPending());
                try {
                    await contractService.deleteContract(id);
                    dispatch(actions.deleteContractSuccess(id));
                } catch (error: any) {
                    dispatch(actions.deleteContractError(error.response?.data?.message || 'Failed to delete contract'));
                }
            },
            activateContract: async (id: string) => {
                dispatch(actions.updateContractPending());
                try {
                    const response = await contractService.activateContract(id);
                    dispatch(actions.updateContractSuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateContractError(error.response?.data?.message || 'Failed to activate contract'));
                }
            },
            cancelContract: async (id: string) => {
                dispatch(actions.updateContractPending());
                try {
                    const response = await contractService.cancelContract(id);
                    dispatch(actions.updateContractSuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateContractError(error.response?.data?.message || 'Failed to cancel contract'));
                }
            },
            fetchRenewals: async (contractId: string) => {
                dispatch(actions.fetchRenewalsPending());
                try {
                    const response = await contractService.getRenewals(contractId);
                    dispatch(actions.fetchRenewalsSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchRenewalsError(error.response?.data?.message || 'Failed to fetch renewals'));
                }
            },
            createRenewal: async (contractId: string, data: any) => {
                try {
                    await contractService.createRenewal(contractId, data);
                    const response = await contractService.getRenewals(contractId);
                    dispatch(actions.fetchRenewalsSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchRenewalsError(error.response?.data?.message || 'Failed to create renewal'));
                }
            },
            completeRenewal: async (renewalId: string) => {
                try {
                    const renewal = await contractService.completeRenewal(renewalId);
                    const response = await contractService.getRenewals(renewal.contractId);
                    dispatch(actions.fetchRenewalsSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchRenewalsError(error.response?.data?.message || 'Failed to complete renewal'));
                }
            },
            setFilters: (filters: ContractFilters) => {
                dispatch(actions.setFilters(filters));
            },
            clearError: () => {
                dispatch(actions.clearError());
            },
        }),
        [state.filters]
    );

    return (
        <ContractStateContext.Provider value={state}>
            <ContractActionContext.Provider value={contractActions}>
                {children}
            </ContractActionContext.Provider>
        </ContractStateContext.Provider>
    );
};

export const useContracts = () => {
    const context = useContext(ContractStateContext);
    if (context === undefined) {
        throw new Error('useContracts must be used within a ContractProvider');
    }
    return context;
};

export const useContractActions = () => {
    const context = useContext(ContractActionContext);
    if (context === undefined) {
        throw new Error('useContractActions must be used within a ContractProvider');
    }
    return context;
};
