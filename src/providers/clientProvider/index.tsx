'use client';

import React, { useReducer, useContext, useMemo } from 'react';
import { ClientStateContext, ClientActionContext, INITIAL_STATE, ClientActions } from './context';
import { clientReducer } from './reducer';
import * as actions from './actions';
import clientService, { ClientFilters } from '../../services/clientService';

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(clientReducer, INITIAL_STATE);

    const clientActions: ClientActions = useMemo(
        () => ({
            fetchClients: async (filters?: ClientFilters) => {
                dispatch(actions.fetchClientsPending());
                try {
                    const response = await clientService.getClients(filters || state.filters);
                    dispatch(actions.fetchClientsSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchClientsError(error.response?.data?.message || 'Failed to fetch clients'));
                }
            },
            fetchClientById: async (id: string) => {
                dispatch(actions.fetchClientByIdPending());
                try {
                    const response = await clientService.getClientById(id);
                    dispatch(actions.fetchClientByIdSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchClientByIdError(error.response?.data?.message || 'Failed to fetch client'));
                }
            },
            createClient: async (data: any) => {
                dispatch(actions.createClientPending());
                try {
                    const response = await clientService.createClient(data);
                    dispatch(actions.createClientSuccess(response));
                } catch (error: any) {
                    dispatch(actions.createClientError(error.response?.data?.message || 'Failed to create client'));
                }
            },
            updateClient: async (id: string, data: any) => {
                dispatch(actions.updateClientPending());
                try {
                    const response = await clientService.updateClient(id, data);
                    dispatch(actions.updateClientSuccess(response));
                } catch (error: any) {
                    dispatch(actions.updateClientError(error.response?.data?.message || 'Failed to update client'));
                }
            },
            deactivateClient: async (id: string) => {
                dispatch(actions.deactivateClientPending());
                try {
                    await clientService.deactivateClient(id);
                    dispatch(actions.deactivateClientSuccess(id));
                } catch (error: any) {
                    dispatch(actions.deactivateClientError(error.response?.data?.message || 'Failed to deactivate client'));
                }
            },
            fetchClientStats: async (id: string) => {
                dispatch(actions.fetchClientStatsPending());
                try {
                    const response = await clientService.getClientStats(id);
                    dispatch(actions.fetchClientStatsSuccess(response));
                } catch (error: any) {
                    dispatch(actions.fetchClientStatsError(error.response?.data?.message || 'Failed to fetch client stats'));
                }
            },
            setFilters: (filters: ClientFilters) => {
                dispatch(actions.setFilters(filters));
            },
            clearError: () => {
                dispatch(actions.clearError());
            },
        }),
        [state.filters]
    );

    return (
        <ClientStateContext.Provider value={state}>
            <ClientActionContext.Provider value={clientActions}>
                {children}
            </ClientActionContext.Provider>
        </ClientStateContext.Provider>
    );
};

export const useClients = () => {
    const context = useContext(ClientStateContext);
    if (context === undefined) {
        throw new Error('useClients must be used within a ClientProvider');
    }
    return context;
};

export const useClientActions = () => {
    const context = useContext(ClientActionContext);
    if (context === undefined) {
        throw new Error('useClientActions must be used within a ClientProvider');
    }
    return context;
};
