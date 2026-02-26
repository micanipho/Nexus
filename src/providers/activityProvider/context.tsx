import { createContext } from 'react';
import { Activity } from '../../types';
import { ActivityFilters } from '../../services/activityService';

export interface ActivityState {
    activities: Activity[];
    myActivities: Activity[];
    upcomingActivities: Activity[];
    overdueActivities: Activity[];
    selectedActivity: Activity | null;
    isPending: boolean;
    error: string | null;
    filters: ActivityFilters;
    totalCount: number;
}

export interface ActivityActions {
    fetchActivities: (filters?: ActivityFilters) => Promise<void>;
    fetchMyActivities: (pageNumber?: number, pageSize?: number) => Promise<void>;
    fetchUpcomingActivities: (daysAhead?: number) => Promise<void>;
    fetchOverdueActivities: () => Promise<void>;
    fetchActivityById: (id: string) => Promise<void>;
    createActivity: (data: any) => Promise<void>;
    updateActivity: (id: string, data: any) => Promise<void>;
    completeActivity: (id: string, outcome: string) => Promise<void>;
    cancelActivity: (id: string) => Promise<void>;
    deleteActivity: (id: string) => Promise<void>;
    setFilters: (filters: Partial<ActivityFilters>) => void;
    clearError: () => void;
}

export const INITIAL_STATE: ActivityState = {
    activities: [],
    myActivities: [],
    upcomingActivities: [],
    overdueActivities: [],
    selectedActivity: null,
    isPending: false,
    error: null,
    filters: {
        pageNumber: 1,
        pageSize: 10,
    },
    totalCount: 0,
};

export const ActivityStateContext = createContext<ActivityState>(INITIAL_STATE);
export const ActivityActionContext = createContext<ActivityActions | undefined>(undefined);
