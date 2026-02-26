import { handleActions } from 'redux-actions';
import { ActivityState, INITIAL_STATE } from './context';
import { ActivityActionEnums } from './actions';

export const activityReducer = handleActions<ActivityState, any>(
    {
        [ActivityActionEnums.FetchActivitiesPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ActivityActionEnums.FetchActivitiesSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            activities: payload.items,
            totalCount: payload.totalCount,
        }),
        [ActivityActionEnums.FetchActivitiesError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),

        [ActivityActionEnums.FetchMyActivitiesPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ActivityActionEnums.FetchMyActivitiesSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            myActivities: payload.items,
            totalCount: payload.totalCount,
        }),
        [ActivityActionEnums.FetchMyActivitiesError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),

        [ActivityActionEnums.FetchUpcomingActivitiesPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ActivityActionEnums.FetchUpcomingActivitiesSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            upcomingActivities: payload.items,
        }),
        [ActivityActionEnums.FetchUpcomingActivitiesError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),

        [ActivityActionEnums.FetchOverdueActivitiesPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ActivityActionEnums.FetchOverdueActivitiesSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            overdueActivities: payload.items,
        }),
        [ActivityActionEnums.FetchOverdueActivitiesError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),

        [ActivityActionEnums.FetchActivityByIdPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ActivityActionEnums.FetchActivityByIdSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            selectedActivity: payload.activity,
        }),
        [ActivityActionEnums.FetchActivityByIdError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),

        [ActivityActionEnums.CreateActivityPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ActivityActionEnums.CreateActivitySuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            activities: [payload.activity, ...state.activities],
            myActivities: [payload.activity, ...state.myActivities],
        }),
        [ActivityActionEnums.CreateActivityError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),

        [ActivityActionEnums.UpdateActivityPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ActivityActionEnums.UpdateActivitySuccess]: (state, { payload }) => {
            const updateList = (list: any[]) => list.map(a => a.id === payload.activity.id ? payload.activity : a);
            return {
                ...state,
                isPending: false,
                activities: updateList(state.activities),
                myActivities: updateList(state.myActivities),
                selectedActivity: state.selectedActivity?.id === payload.activity.id ? payload.activity : state.selectedActivity,
            };
        },
        [ActivityActionEnums.UpdateActivityError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),

        [ActivityActionEnums.CompleteActivityPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ActivityActionEnums.CompleteActivitySuccess]: (state, { payload }) => {
            const updateList = (list: any[]) => list.map(a => a.id === payload.activity.id ? payload.activity : a);
            return {
                ...state,
                isPending: false,
                activities: updateList(state.activities),
                myActivities: updateList(state.myActivities),
                upcomingActivities: state.upcomingActivities.filter(a => a.id !== payload.activity.id),
                overdueActivities: state.overdueActivities.filter(a => a.id !== payload.activity.id),
                selectedActivity: state.selectedActivity?.id === payload.activity.id ? payload.activity : state.selectedActivity,
            };
        },
        [ActivityActionEnums.CompleteActivityError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),

        [ActivityActionEnums.CancelActivityPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ActivityActionEnums.CancelActivitySuccess]: (state, { payload }) => {
            const updateList = (list: any[]) => list.map(a => a.id === payload.activity.id ? payload.activity : a);
            return {
                ...state,
                isPending: false,
                activities: updateList(state.activities),
                myActivities: updateList(state.myActivities),
                upcomingActivities: state.upcomingActivities.filter(a => a.id !== payload.activity.id),
                overdueActivities: state.overdueActivities.filter(a => a.id !== payload.activity.id),
                selectedActivity: state.selectedActivity?.id === payload.activity.id ? payload.activity : state.selectedActivity,
            };
        },
        [ActivityActionEnums.CancelActivityError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),

        [ActivityActionEnums.DeleteActivityPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ActivityActionEnums.DeleteActivitySuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            activities: state.activities.filter(a => a.id !== payload.id),
            myActivities: state.myActivities.filter(a => a.id !== payload.id),
            upcomingActivities: state.upcomingActivities.filter(a => a.id !== payload.id),
            overdueActivities: state.overdueActivities.filter(a => a.id !== payload.id),
            selectedActivity: state.selectedActivity?.id === payload.id ? null : state.selectedActivity,
        }),
        [ActivityActionEnums.DeleteActivityError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),

        [ActivityActionEnums.SetFilters]: (state, { payload }) => ({
            ...state,
            filters: { ...state.filters, ...payload.filters },
        }),
        [ActivityActionEnums.ClearError]: (state) => ({
            ...state,
            error: null,
        }),
    },
    INITIAL_STATE
);
