import { createAction } from 'redux-actions';
import { Contract, ContractStatus, ContractRenewal } from '../../types';
import { ContractFilters } from '../../services/contractService';

export enum ContractActionEnums {
    FetchContractsPending = 'FETCH_CONTRACTS_PENDING',
    FetchContractsSuccess = 'FETCH_CONTRACTS_SUCCESS',
    FetchContractsError = 'FETCH_CONTRACTS_ERROR',
    FetchContractByIdPending = 'FETCH_CONTRACT_BY_ID_PENDING',
    FetchContractByIdSuccess = 'FETCH_CONTRACT_BY_ID_SUCCESS',
    FetchContractByIdError = 'FETCH_CONTRACT_BY_ID_ERROR',
    CreateContractPending = 'CREATE_CONTRACT_PENDING',
    CreateContractSuccess = 'CREATE_CONTRACT_SUCCESS',
    CreateContractError = 'CREATE_CONTRACT_ERROR',
    UpdateContractPending = 'UPDATE_CONTRACT_PENDING',
    UpdateContractSuccess = 'UPDATE_CONTRACT_SUCCESS',
    UpdateContractError = 'UPDATE_CONTRACT_ERROR',
    DeleteContractPending = 'DELETE_CONTRACT_PENDING',
    DeleteContractSuccess = 'DELETE_CONTRACT_SUCCESS',
    DeleteContractError = 'DELETE_CONTRACT_ERROR',
    FetchRenewalsPending = 'FETCH_RENEWALS_PENDING',
    FetchRenewalsSuccess = 'FETCH_RENEWALS_SUCCESS',
    FetchRenewalsError = 'FETCH_RENEWALS_ERROR',
    SetFilters = 'SET_CONTRACT_FILTERS',
    ClearError = 'CLEAR_CONTRACT_ERROR',
}

export const fetchContractsPending = createAction(ContractActionEnums.FetchContractsPending);
export const fetchContractsSuccess = createAction(ContractActionEnums.FetchContractsSuccess, (data: { items: Contract[], totalCount: number }) => ({ ...data }));
export const fetchContractsError = createAction(ContractActionEnums.FetchContractsError, (error: string) => ({ error }));

export const fetchContractByIdPending = createAction(ContractActionEnums.FetchContractByIdPending);
export const fetchContractByIdSuccess = createAction(ContractActionEnums.FetchContractByIdSuccess, (contract: Contract) => ({ contract }));
export const fetchContractByIdError = createAction(ContractActionEnums.FetchContractByIdError, (error: string) => ({ error }));

export const createContractPending = createAction(ContractActionEnums.CreateContractPending);
export const createContractSuccess = createAction(ContractActionEnums.CreateContractSuccess, (contract: Contract) => ({ contract }));
export const createContractError = createAction(ContractActionEnums.CreateContractError, (error: string) => ({ error }));

export const updateContractPending = createAction(ContractActionEnums.UpdateContractPending);
export const updateContractSuccess = createAction(ContractActionEnums.UpdateContractSuccess, (contract: Contract) => ({ contract }));
export const updateContractError = createAction(ContractActionEnums.UpdateContractError, (error: string) => ({ error }));

export const deleteContractPending = createAction(ContractActionEnums.DeleteContractPending);
export const deleteContractSuccess = createAction(ContractActionEnums.DeleteContractSuccess, (id: string) => ({ id }));
export const deleteContractError = createAction(ContractActionEnums.DeleteContractError, (error: string) => ({ error }));

export const fetchRenewalsPending = createAction(ContractActionEnums.FetchRenewalsPending);
export const fetchRenewalsSuccess = createAction(ContractActionEnums.FetchRenewalsSuccess, (renewals: ContractRenewal[]) => ({ renewals }));
export const fetchRenewalsError = createAction(ContractActionEnums.FetchRenewalsError, (error: string) => ({ error }));

export const setFilters = createAction(ContractActionEnums.SetFilters, (filters: ContractFilters) => ({ filters }));
export const clearError = createAction(ContractActionEnums.ClearError);
