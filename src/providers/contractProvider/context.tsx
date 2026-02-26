import { createContext } from 'react';
import { Contract, ContractStatus, ContractRenewal } from '../../types';
import { ContractFilters } from '../../services/contractService';

export interface ContractState {
    contracts: Contract[];
    selectedContract: Contract | null;
    renewals: ContractRenewal[];
    isPending: boolean;
    error: string | null;
    filters: ContractFilters;
    totalCount: number;
}

export interface ContractActions {
    fetchContracts: (filters?: ContractFilters) => Promise<void>;
    fetchContractById: (id: string) => Promise<void>;
    createContract: (data: any) => Promise<void>;
    updateContract: (id: string, data: any) => Promise<void>;
    deleteContract: (id: string) => Promise<void>;
    activateContract: (id: string) => Promise<void>;
    cancelContract: (id: string) => Promise<void>;
    fetchRenewals: (contractId: string) => Promise<void>;
    createRenewal: (contractId: string, data: any) => Promise<void>;
    completeRenewal: (renewalId: string) => Promise<void>;
    setFilters: (filters: ContractFilters) => void;
    clearError: () => void;
}

export const INITIAL_STATE: ContractState = {
    contracts: [],
    selectedContract: null,
    renewals: [],
    isPending: false,
    error: null,
    filters: {
        pageNumber: 1,
        pageSize: 10,
    },
    totalCount: 0,
};

export const ContractStateContext = createContext<ContractState>(INITIAL_STATE);
export const ContractActionContext = createContext<ContractActions | undefined>(undefined);
