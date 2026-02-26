import { createAction } from 'redux-actions';
import { Activity } from '../../types';
import { ActivityFilters } from '../../services/activityService';

export enum ActivityActionEnums {
    FetchActivitiesPending = 'FETCH_ACTIVITIES_PENDING',
    FetchActivitiesSuccess = 'FETCH_ACTIVITIES_SUCCESS',
    FetchActivitiesError = 'FETCH_ACTIVITIES_ERROR',
    FetchMyActivitiesPending = 'FETCH_MY_ACTIVITIES_PENDING',
    FetchMyActivitiesSuccess = 'FETCH_MY_ACTIVITIES_SUCCESS',
    FetchMyActivitiesError = 'FETCH_MY_ACTIVITIES_ERROR',
    FetchUpcomingActivitiesPending = 'FETCH_UPCOMING_ACTIVITIES_PENDING',
    FetchUpcomingActivitiesSuccess = 'FETCH_UPCOMING_ACTIVITIES_SUCCESS',
    FetchUpcomingActivitiesError = 'FETCH_UPCOMING_ACTIVITIES_ERROR',
    FetchOverdueActivitiesPending = 'FETCH_OVERDUE_ACTIVITIES_PENDING',
    FetchOverdueActivitiesSuccess = 'FETCH_OVERDUE_ACTIVITIES_SUCCESS',
    FetchOverdueActivitiesError = 'FETCH_OVERDUE_ACTIVITIES_ERROR',
    FetchActivityByIdPending = 'FETCH_ACTIVITY_BY_ID_PENDING',
    FetchActivityByIdSuccess = 'FETCH_ACTIVITY_BY_ID_SUCCESS',
    FetchActivityByIdError = 'FETCH_ACTIVITY_BY_ID_ERROR',
    CreateActivityPending = 'CREATE_ACTIVITY_PENDING',
    CreateActivitySuccess = 'CREATE_ACTIVITY_SUCCESS',
    CreateActivityError = 'CREATE_ACTIVITY_ERROR',
    UpdateActivityPending = 'UPDATE_ACTIVITY_PENDING',
    UpdateActivitySuccess = 'UPDATE_ACTIVITY_SUCCESS',
    UpdateActivityError = 'UPDATE_ACTIVITY_ERROR',
    CompleteActivityPending = 'COMPLETE_ACTIVITY_PENDING',
    CompleteActivitySuccess = 'COMPLETE_ACTIVITY_SUCCESS',
    CompleteActivityError = 'COMPLETE_ACTIVITY_ERROR',
    CancelActivityPending = 'CANCEL_ACTIVITY_PENDING',
    CancelActivitySuccess = 'CANCEL_ACTIVITY_SUCCESS',
    CancelActivityError = 'CANCEL_ACTIVITY_ERROR',
    DeleteActivityPending = 'DELETE_ACTIVITY_PENDING',
    DeleteActivitySuccess = 'DELETE_ACTIVITY_SUCCESS',
    DeleteActivityError = 'DELETE_ACTIVITY_ERROR',
    SetFilters = 'SET_ACTIVITY_FILTERS',
    ClearError = 'CLEAR_ACTIVITY_ERROR',
}

export const fetchActivitiesPending = createAction(ActivityActionEnums.FetchActivitiesPending);
export const fetchActivitiesSuccess = createAction(ActivityActionEnums.FetchActivitiesSuccess, (data: { items: Activity[], totalCount: number }) => ({ ...data }));
export const fetchActivitiesError = createAction(ActivityActionEnums.FetchActivitiesError, (error: string) => ({ error }));

export const fetchMyActivitiesPending = createAction(ActivityActionEnums.FetchMyActivitiesPending);
export const fetchMyActivitiesSuccess = createAction(ActivityActionEnums.FetchMyActivitiesSuccess, (data: { items: Activity[], totalCount: number }) => ({ ...data }));
export const fetchMyActivitiesError = createAction(ActivityActionEnums.FetchMyActivitiesError, (error: string) => ({ error }));

export const fetchUpcomingActivitiesPending = createAction(ActivityActionEnums.FetchUpcomingActivitiesPending);
export const fetchUpcomingActivitiesSuccess = createAction(ActivityActionEnums.FetchUpcomingActivitiesSuccess, (items: Activity[]) => ({ items }));
export const fetchUpcomingActivitiesError = createAction(ActivityActionEnums.FetchUpcomingActivitiesError, (error: string) => ({ error }));

export const fetchOverdueActivitiesPending = createAction(ActivityActionEnums.FetchOverdueActivitiesPending);
export const fetchOverdueActivitiesSuccess = createAction(ActivityActionEnums.FetchOverdueActivitiesSuccess, (items: Activity[]) => ({ items }));
export const fetchOverdueActivitiesError = createAction(ActivityActionEnums.FetchOverdueActivitiesError, (error: string) => ({ error }));

export const fetchActivityByIdPending = createAction(ActivityActionEnums.FetchActivityByIdPending);
export const fetchActivityByIdSuccess = createAction(ActivityActionEnums.FetchActivityByIdSuccess, (activity: Activity) => ({ activity }));
export const fetchActivityByIdError = createAction(ActivityActionEnums.FetchActivityByIdError, (error: string) => ({ error }));

export const createActivityPending = createAction(ActivityActionEnums.CreateActivityPending);
export const createActivitySuccess = createAction(ActivityActionEnums.CreateActivitySuccess, (activity: Activity) => ({ activity }));
export const createActivityError = createAction(ActivityActionEnums.CreateActivityError, (error: string) => ({ error }));

export const updateActivityPending = createAction(ActivityActionEnums.UpdateActivityPending);
export const updateActivitySuccess = createAction(ActivityActionEnums.UpdateActivitySuccess, (activity: Activity) => ({ activity }));
export const updateActivityError = createAction(ActivityActionEnums.UpdateActivityError, (error: string) => ({ error }));

export const completeActivityPending = createAction(ActivityActionEnums.CompleteActivityPending);
export const completeActivitySuccess = createAction(ActivityActionEnums.CompleteActivitySuccess, (activity: Activity) => ({ activity }));
export const completeActivityError = createAction(ActivityActionEnums.CompleteActivityError, (error: string) => ({ error }));

export const cancelActivityPending = createAction(ActivityActionEnums.CancelActivityPending);
export const cancelActivitySuccess = createAction(ActivityActionEnums.CancelActivitySuccess, (activity: Activity) => ({ activity }));
export const cancelActivityError = createAction(ActivityActionEnums.CancelActivityError, (error: string) => ({ error }));

export const deleteActivityPending = createAction(ActivityActionEnums.DeleteActivityPending);
export const deleteActivitySuccess = createAction(ActivityActionEnums.DeleteActivitySuccess, (id: string) => ({ id }));
export const deleteActivityError = createAction(ActivityActionEnums.DeleteActivityError, (error: string) => ({ error }));

export const setFilters = createAction(ActivityActionEnums.SetFilters, (filters: Partial<ActivityFilters>) => ({ filters }));
export const clearError = createAction(ActivityActionEnums.ClearError);
