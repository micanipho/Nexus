'use client';

import React, { useReducer, useContext, useMemo } from 'react';
import { ActivityStateContext, ActivityActionContext, INITIAL_STATE, ActivityActions } from './context';
import { activityReducer } from './reducer';
import * as actions from './actions';
import activityService, { ActivityFilters } from '../../services/activityService';

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(activityReducer, INITIAL_STATE);

    const activityActions: ActivityActions = useMemo(
        () => ({
            fetchActivities: async (filters?: ActivityFilters) => {
                dispatch(actions.fetchActivitiesPending());
                try {
                    const response = await activityService.getActivities(filters || state.filters);
                    dispatch(actions.fetchActivitiesSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchActivitiesError(error.response?.data?.message || 'Failed to fetch activities'));
                }
            },
            fetchMyActivities: async (pageNumber = 1, pageSize = 10) => {
                dispatch(actions.fetchMyActivitiesPending());
                try {
                    const response = await activityService.getMyActivities({ pageNumber, pageSize });
                    dispatch(actions.fetchMyActivitiesSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchMyActivitiesError(error.response?.data?.message || 'Failed to fetch my activities'));
                }
            },
            fetchUpcomingActivities: async (daysAhead = 7) => {
                dispatch(actions.fetchUpcomingActivitiesPending());
                try {
                    const response = await activityService.getUpcomingActivities(daysAhead);
                    const items = Array.isArray(response) ? response : (response as any).items || [];
                    dispatch(actions.fetchUpcomingActivitiesSuccess(items));
                } catch (error: any) {
                    dispatch(actions.fetchUpcomingActivitiesError(error.response?.data?.message || 'Failed to fetch upcoming activities'));
                }
            },
            fetchOverdueActivities: async () => {
                dispatch(actions.fetchOverdueActivitiesPending());
                try {
                    const response = await activityService.getOverdueActivities();
                    const items = Array.isArray(response) ? response : (response as any).items || [];
                    dispatch(actions.fetchOverdueActivitiesSuccess(items));
                } catch (error: any) {
                    dispatch(actions.fetchOverdueActivitiesError(error.response?.data?.message || 'Failed to fetch overdue activities'));
                }
            },
            fetchActivityById: async (id: string) => {
                dispatch(actions.fetchActivityByIdPending());
                try {
                    const response = await activityService.getActivityById(id);
                    dispatch(actions.fetchActivityByIdSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchActivityByIdError(error.response?.data?.message || 'Failed to fetch activity'));
                }
            },
            createActivity: async (data: any) => {
                dispatch(actions.createActivityPending());
                try {
                    const response = await activityService.createActivity(data);
                    dispatch(actions.createActivitySuccess(response));
                } catch (error: any) {
                    dispatch(actions.createActivityError(error.response?.data?.message || 'Failed to create activity'));
                    throw error;
                }
            },
            updateActivity: async (id: string, data: any) => {
                dispatch(actions.updateActivityPending());
                try {
                    const response = await activityService.updateActivity(id, data);
                    dispatch(actions.updateActivitySuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateActivityError(error.response?.data?.message || 'Failed to update activity'));
                }
            },
            completeActivity: async (id: string, outcome: string) => {
                dispatch(actions.completeActivityPending());
                try {
                    const response = await activityService.completeActivity(id, outcome);
                    dispatch(actions.completeActivitySuccess(response));
                } catch (error: any) {
                    dispatch(actions.completeActivityError(error.response?.data?.message || 'Failed to complete activity'));
                }
            },
            cancelActivity: async (id: string) => {
                dispatch(actions.cancelActivityPending());
                try {
                    const response = await activityService.cancelActivity(id);
                    dispatch(actions.cancelActivitySuccess(response));
                } catch (error: any) {
                    dispatch(actions.cancelActivityError(error.response?.data?.message || 'Failed to cancel activity'));
                }
            },
            deleteActivity: async (id: string) => {
                dispatch(actions.deleteActivityPending());
                try {
                    await activityService.deleteActivity(id);
                    dispatch(actions.deleteActivitySuccess(id));
                } catch (error: any) {
                    dispatch(actions.deleteActivityError(error.response?.data?.message || 'Failed to delete activity'));
                }
            },
            setFilters: (filters: Partial<ActivityFilters>) => {
                dispatch(actions.setFilters(filters));
            },
            clearError: () => {
                dispatch(actions.clearError());
            },
        }),
        [state.filters]
    );

    return (
        <ActivityStateContext.Provider value={state}>
            <ActivityActionContext.Provider value={activityActions}>
                {children}
            </ActivityActionContext.Provider>
        </ActivityStateContext.Provider>
    );
};

export const useActivities = () => {
    const context = useContext(ActivityStateContext);
    if (context === undefined) {
        throw new Error('useActivities must be used within an ActivityProvider');
    }
    return context;
};

export const useActivityActions = () => {
    const context = useContext(ActivityActionContext);
    if (context === undefined) {
        throw new Error('useActivityActions must be used within an ActivityProvider');
    }
    return context;
};
