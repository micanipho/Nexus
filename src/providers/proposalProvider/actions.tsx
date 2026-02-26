import { createAction } from 'redux-actions';
import { Proposal, ProposalStatus, ProposalLineItem } from '../../types';
import { ProposalFilters } from '../../services/proposalService';

export enum ProposalActionEnums {
    FetchProposalsPending = 'FETCH_PROPOSALS_PENDING',
    FetchProposalsSuccess = 'FETCH_PROPOSALS_SUCCESS',
    FetchProposalsError = 'FETCH_PROPOSALS_ERROR',
    FetchProposalByIdPending = 'FETCH_PROPOSAL_BY_ID_PENDING',
    FetchProposalByIdSuccess = 'FETCH_PROPOSAL_BY_ID_SUCCESS',
    FetchProposalByIdError = 'FETCH_PROPOSAL_BY_ID_ERROR',
    CreateProposalPending = 'CREATE_PROPOSAL_PENDING',
    CreateProposalSuccess = 'CREATE_PROPOSAL_SUCCESS',
    CreateProposalError = 'CREATE_PROPOSAL_ERROR',
    UpdateProposalPending = 'UPDATE_PROPOSAL_PENDING',
    UpdateProposalSuccess = 'UPDATE_PROPOSAL_SUCCESS',
    UpdateProposalError = 'UPDATE_PROPOSAL_ERROR',
    DeleteProposalPending = 'DELETE_PROPOSAL_PENDING',
    DeleteProposalSuccess = 'DELETE_PROPOSAL_SUCCESS',
    DeleteProposalError = 'DELETE_PROPOSAL_ERROR',
    SetFilters = 'SET_PROPOSAL_FILTERS',
    ClearError = 'CLEAR_PROPOSAL_ERROR',
}

export const fetchProposalsPending = createAction(ProposalActionEnums.FetchProposalsPending);
export const fetchProposalsSuccess = createAction(ProposalActionEnums.FetchProposalsSuccess, (data: { items: Proposal[], totalCount: number }) => ({ ...data }));
export const fetchProposalsError = createAction(ProposalActionEnums.FetchProposalsError, (error: string) => ({ error }));

export const fetchProposalByIdPending = createAction(ProposalActionEnums.FetchProposalByIdPending);
export const fetchProposalByIdSuccess = createAction(ProposalActionEnums.FetchProposalByIdSuccess, (proposal: Proposal) => ({ proposal }));
export const fetchProposalByIdError = createAction(ProposalActionEnums.FetchProposalByIdError, (error: string) => ({ error }));

export const createProposalPending = createAction(ProposalActionEnums.CreateProposalPending);
export const createProposalSuccess = createAction(ProposalActionEnums.CreateProposalSuccess, (proposal: Proposal) => ({ proposal }));
export const createProposalError = createAction(ProposalActionEnums.CreateProposalError, (error: string) => ({ error }));

export const updateProposalPending = createAction(ProposalActionEnums.UpdateProposalPending);
export const updateProposalSuccess = createAction(ProposalActionEnums.UpdateProposalSuccess, (proposal: Proposal) => ({ proposal }));
export const updateProposalError = createAction(ProposalActionEnums.UpdateProposalError, (error: string) => ({ error }));

export const deleteProposalPending = createAction(ProposalActionEnums.DeleteProposalPending);
export const deleteProposalSuccess = createAction(ProposalActionEnums.DeleteProposalSuccess, (id: string) => ({ id }));
export const deleteProposalError = createAction(ProposalActionEnums.DeleteProposalError, (error: string) => ({ error }));

export const setFilters = createAction(ProposalActionEnums.SetFilters, (filters: ProposalFilters) => ({ filters }));
export const clearError = createAction(ProposalActionEnums.ClearError);
