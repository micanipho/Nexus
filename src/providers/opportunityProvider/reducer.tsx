import { handleActions } from 'redux-actions';
import { OpportunityState, INITIAL_STATE } from './context';
import { OpportunityActionEnums } from './actions';

export const opportunityReducer = handleActions<OpportunityState, any>(
    {
        [OpportunityActionEnums.FetchOpportunitiesPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [OpportunityActionEnums.FetchOpportunitiesSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            opportunities: payload.items,
            totalCount: payload.totalCount,
        }),
        [OpportunityActionEnums.FetchOpportunitiesError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [OpportunityActionEnums.FetchOpportunityByIdPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [OpportunityActionEnums.FetchOpportunityByIdSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            selectedOpportunity: payload.opportunity,
        }),
        [OpportunityActionEnums.FetchOpportunityByIdError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [OpportunityActionEnums.CreateOpportunityPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [OpportunityActionEnums.CreateOpportunitySuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            opportunities: [payload.opportunity, ...state.opportunities],
        }),
        [OpportunityActionEnums.CreateOpportunityError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [OpportunityActionEnums.UpdateOpportunityPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [OpportunityActionEnums.UpdateOpportunitySuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            opportunities: state.opportunities.map((o) => (o.id === payload.opportunity.id ? payload.opportunity : o)),
            selectedOpportunity: state.selectedOpportunity?.id === payload.opportunity.id ? payload.opportunity : state.selectedOpportunity,
        }),
        [OpportunityActionEnums.UpdateOpportunityError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [OpportunityActionEnums.DeactivateOpportunityPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [OpportunityActionEnums.DeactivateOpportunitySuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            opportunities: state.opportunities.filter((o) => o.id !== payload.id),
            selectedOpportunity: state.selectedOpportunity?.id === payload.id ? null : state.selectedOpportunity,
        }),
        [OpportunityActionEnums.DeactivateOpportunityError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [OpportunityActionEnums.FetchPipelineMetricsPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [OpportunityActionEnums.FetchPipelineMetricsSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            pipelineMetrics: payload.metrics,
        }),
        [OpportunityActionEnums.FetchPipelineMetricsError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [OpportunityActionEnums.FetchStageHistoryPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [OpportunityActionEnums.FetchStageHistorySuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            stageHistory: payload.history,
        }),
        [OpportunityActionEnums.FetchStageHistoryError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [OpportunityActionEnums.SetFilters]: (state, { payload }) => ({
            ...state,
            filters: { ...state.filters, ...payload.filters },
        }),
        [OpportunityActionEnums.ClearError]: (state) => ({
            ...state,
            error: null,
        }),
    },
    INITIAL_STATE
);
