import { handleActions } from 'redux-actions';
import { ContractState, INITIAL_STATE } from './context';
import { ContractActionEnums } from './actions';

export const contractReducer = handleActions<ContractState, any>(
    {
        [ContractActionEnums.FetchContractsPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ContractActionEnums.FetchContractsSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            contracts: payload.items,
            totalCount: payload.totalCount,
        }),
        [ContractActionEnums.FetchContractsError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ContractActionEnums.FetchContractByIdPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ContractActionEnums.FetchContractByIdSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            selectedContract: payload.contract,
        }),
        [ContractActionEnums.FetchContractByIdError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ContractActionEnums.CreateContractPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ContractActionEnums.CreateContractSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            contracts: [payload.contract, ...state.contracts],
        }),
        [ContractActionEnums.CreateContractError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ContractActionEnums.UpdateContractPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ContractActionEnums.UpdateContractSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            contracts: state.contracts.map((c) => (c.id === payload.contract.id ? payload.contract : c)),
            selectedContract: state.selectedContract?.id === payload.contract.id ? payload.contract : state.selectedContract,
        }),
        [ContractActionEnums.UpdateContractError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ContractActionEnums.DeleteContractPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ContractActionEnums.DeleteContractSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            contracts: state.contracts.filter((c) => c.id !== payload.id),
            selectedContract: state.selectedContract?.id === payload.id ? null : state.selectedContract,
        }),
        [ContractActionEnums.DeleteContractError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ContractActionEnums.FetchRenewalsPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ContractActionEnums.FetchRenewalsSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            renewals: payload.renewals,
        }),
        [ContractActionEnums.FetchRenewalsError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ContractActionEnums.SetFilters]: (state, { payload }) => ({
            ...state,
            filters: { ...state.filters, ...payload.filters },
        }),
        [ContractActionEnums.ClearError]: (state) => ({
            ...state,
            error: null,
        }),
    },
    INITIAL_STATE
);
