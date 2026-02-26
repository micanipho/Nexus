import { handleActions } from 'redux-actions';
import { ProposalState, INITIAL_STATE } from './context';
import { ProposalActionEnums } from './actions';

export const proposalReducer = handleActions<ProposalState, any>(
    {
        [ProposalActionEnums.FetchProposalsPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ProposalActionEnums.FetchProposalsSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            proposals: payload.items,
            totalCount: payload.totalCount,
        }),
        [ProposalActionEnums.FetchProposalsError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ProposalActionEnums.FetchProposalByIdPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ProposalActionEnums.FetchProposalByIdSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            selectedProposal: payload.proposal,
        }),
        [ProposalActionEnums.FetchProposalByIdError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ProposalActionEnums.CreateProposalPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ProposalActionEnums.CreateProposalSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            proposals: [payload.proposal, ...state.proposals],
        }),
        [ProposalActionEnums.CreateProposalError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ProposalActionEnums.UpdateProposalPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ProposalActionEnums.UpdateProposalSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            proposals: state.proposals.map((p) => (p.id === payload.proposal.id ? payload.proposal : p)),
            selectedProposal: state.selectedProposal?.id === payload.proposal.id ? payload.proposal : state.selectedProposal,
        }),
        [ProposalActionEnums.UpdateProposalError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ProposalActionEnums.DeleteProposalPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ProposalActionEnums.DeleteProposalSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            proposals: state.proposals.filter((p) => p.id !== payload.id),
            selectedProposal: state.selectedProposal?.id === payload.id ? null : state.selectedProposal,
        }),
        [ProposalActionEnums.DeleteProposalError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ProposalActionEnums.SetFilters]: (state, { payload }) => ({
            ...state,
            filters: { ...state.filters, ...payload.filters },
        }),
        [ProposalActionEnums.ClearError]: (state) => ({
            ...state,
            error: null,
        }),
    },
    INITIAL_STATE
);
