import { createAction } from 'redux-actions';
import { Opportunity, OpportunityStage } from '../../types';
import { OpportunityFilters, PipelineMetrics, OpportunityStageHistory } from '../../services/opportunityService';

export enum OpportunityActionEnums {
    FetchOpportunitiesPending = 'FETCH_OPPORTUNITIES_PENDING',
    FetchOpportunitiesSuccess = 'FETCH_OPPORTUNITIES_SUCCESS',
    FetchOpportunitiesError = 'FETCH_OPPORTUNITIES_ERROR',
    FetchOpportunityByIdPending = 'FETCH_OPPORTUNITY_BY_ID_PENDING',
    FetchOpportunityByIdSuccess = 'FETCH_OPPORTUNITY_BY_ID_SUCCESS',
    FetchOpportunityByIdError = 'FETCH_OPPORTUNITY_BY_ID_ERROR',
    CreateOpportunityPending = 'CREATE_OPPORTUNITY_PENDING',
    CreateOpportunitySuccess = 'CREATE_OPPORTUNITY_SUCCESS',
    CreateOpportunityError = 'CREATE_OPPORTUNITY_ERROR',
    UpdateOpportunityPending = 'UPDATE_OPPORTUNITY_PENDING',
    UpdateOpportunitySuccess = 'UPDATE_OPPORTUNITY_SUCCESS',
    UpdateOpportunityError = 'UPDATE_OPPORTUNITY_ERROR',
    DeactivateOpportunityPending = 'DEACTIVATE_OPPORTUNITY_PENDING',
    DeactivateOpportunitySuccess = 'DEACTIVATE_OPPORTUNITY_SUCCESS',
    DeactivateOpportunityError = 'DEACTIVATE_OPPORTUNITY_ERROR',
    FetchPipelineMetricsPending = 'FETCH_PIPELINE_METRICS_PENDING',
    FetchPipelineMetricsSuccess = 'FETCH_PIPELINE_METRICS_SUCCESS',
    FetchPipelineMetricsError = 'FETCH_PIPELINE_METRICS_ERROR',
    FetchStageHistoryPending = 'FETCH_STAGE_HISTORY_PENDING',
    FetchStageHistorySuccess = 'FETCH_STAGE_HISTORY_SUCCESS',
    FetchStageHistoryError = 'FETCH_STAGE_HISTORY_ERROR',
    SetFilters = 'SET_OPPORTUNITY_FILTERS',
    ClearError = 'CLEAR_OPPORTUNITY_ERROR',
}

export const fetchOpportunitiesPending = createAction(OpportunityActionEnums.FetchOpportunitiesPending);
export const fetchOpportunitiesSuccess = createAction(OpportunityActionEnums.FetchOpportunitiesSuccess, (data: { items: Opportunity[], totalCount: number }) => ({ ...data }));
export const fetchOpportunitiesError = createAction(OpportunityActionEnums.FetchOpportunitiesError, (error: string) => ({ error }));

export const fetchOpportunityByIdPending = createAction(OpportunityActionEnums.FetchOpportunityByIdPending);
export const fetchOpportunityByIdSuccess = createAction(OpportunityActionEnums.FetchOpportunityByIdSuccess, (opportunity: Opportunity) => ({ opportunity }));
export const fetchOpportunityByIdError = createAction(OpportunityActionEnums.FetchOpportunityByIdError, (error: string) => ({ error }));

export const createOpportunityPending = createAction(OpportunityActionEnums.CreateOpportunityPending);
export const createOpportunitySuccess = createAction(OpportunityActionEnums.CreateOpportunitySuccess, (opportunity: Opportunity) => ({ opportunity }));
export const createOpportunityError = createAction(OpportunityActionEnums.CreateOpportunityError, (error: string) => ({ error }));

export const updateOpportunityPending = createAction(OpportunityActionEnums.UpdateOpportunityPending);
export const updateOpportunitySuccess = createAction(OpportunityActionEnums.UpdateOpportunitySuccess, (opportunity: Opportunity) => ({ opportunity }));
export const updateOpportunityError = createAction(OpportunityActionEnums.UpdateOpportunityError, (error: string) => ({ error }));

export const deactivateOpportunityPending = createAction(OpportunityActionEnums.DeactivateOpportunityPending);
export const deactivateOpportunitySuccess = createAction(OpportunityActionEnums.DeactivateOpportunitySuccess, (id: string) => ({ id }));
export const deactivateOpportunityError = createAction(OpportunityActionEnums.DeactivateOpportunityError, (error: string) => ({ error }));

export const fetchPipelineMetricsPending = createAction(OpportunityActionEnums.FetchPipelineMetricsPending);
export const fetchPipelineMetricsSuccess = createAction(OpportunityActionEnums.FetchPipelineMetricsSuccess, (metrics: PipelineMetrics) => ({ metrics }));
export const fetchPipelineMetricsError = createAction(OpportunityActionEnums.FetchPipelineMetricsError, (error: string) => ({ error }));

export const fetchStageHistoryPending = createAction(OpportunityActionEnums.FetchStageHistoryPending);
export const fetchStageHistorySuccess = createAction(OpportunityActionEnums.FetchStageHistorySuccess, (history: OpportunityStageHistory[]) => ({ history }));
export const fetchStageHistoryError = createAction(OpportunityActionEnums.FetchStageHistoryError, (error: string) => ({ error }));

export const setFilters = createAction(OpportunityActionEnums.SetFilters, (filters: OpportunityFilters) => ({ filters }));
export const clearError = createAction(OpportunityActionEnums.ClearError);
