import { createAction } from 'redux-actions';
import { Client } from '../../types';
import { ClientFilters } from '../../services/clientService';

export enum ClientActionEnums {
    FetchClientsPending = 'FETCH_CLIENTS_PENDING',
    FetchClientsSuccess = 'FETCH_CLIENTS_SUCCESS',
    FetchClientsError = 'FETCH_CLIENTS_ERROR',
    FetchClientByIdPending = 'FETCH_CLIENT_BY_ID_PENDING',
    FetchClientByIdSuccess = 'FETCH_CLIENT_BY_ID_SUCCESS',
    FetchClientByIdError = 'FETCH_CLIENT_BY_ID_ERROR',
    CreateClientPending = 'CREATE_CLIENT_PENDING',
    CreateClientSuccess = 'CREATE_CLIENT_SUCCESS',
    CreateClientError = 'CREATE_CLIENT_ERROR',
    UpdateClientPending = 'UPDATE_CLIENT_PENDING',
    UpdateClientSuccess = 'UPDATE_CLIENT_SUCCESS',
    UpdateClientError = 'UPDATE_CLIENT_ERROR',
    DeactivateClientPending = 'DEACTIVATE_CLIENT_PENDING',
    DeactivateClientSuccess = 'DEACTIVATE_CLIENT_SUCCESS',
    DeactivateClientError = 'DEACTIVATE_CLIENT_ERROR',
    FetchClientStatsPending = 'FETCH_CLIENT_STATS_PENDING',
    FetchClientStatsSuccess = 'FETCH_CLIENT_STATS_SUCCESS',
    FetchClientStatsError = 'FETCH_CLIENT_STATS_ERROR',
    SetFilters = 'SET_CLIENT_FILTERS',
    ClearError = 'CLEAR_CLIENT_ERROR',
}

export const fetchClientsPending = createAction(ClientActionEnums.FetchClientsPending);
export const fetchClientsSuccess = createAction(ClientActionEnums.FetchClientsSuccess, (data: { items: Client[], totalCount: number }) => ({ ...data }));
export const fetchClientsError = createAction(ClientActionEnums.FetchClientsError, (error: string) => ({ error }));

export const fetchClientByIdPending = createAction(ClientActionEnums.FetchClientByIdPending);
export const fetchClientByIdSuccess = createAction(ClientActionEnums.FetchClientByIdSuccess, (client: Client) => ({ client }));
export const fetchClientByIdError = createAction(ClientActionEnums.FetchClientByIdError, (error: string) => ({ error }));

export const createClientPending = createAction(ClientActionEnums.CreateClientPending);
export const createClientSuccess = createAction(ClientActionEnums.CreateClientSuccess, (client: Client) => ({ client }));
export const createClientError = createAction(ClientActionEnums.CreateClientError, (error: string) => ({ error }));

export const updateClientPending = createAction(ClientActionEnums.UpdateClientPending);
export const updateClientSuccess = createAction(ClientActionEnums.UpdateClientSuccess, (client: Client) => ({ client }));
export const updateClientError = createAction(ClientActionEnums.UpdateClientError, (error: string) => ({ error }));

export const deactivateClientPending = createAction(ClientActionEnums.DeactivateClientPending);
export const deactivateClientSuccess = createAction(ClientActionEnums.DeactivateClientSuccess, (id: string) => ({ id }));
export const deactivateClientError = createAction(ClientActionEnums.DeactivateClientError, (error: string) => ({ error }));

export const fetchClientStatsPending = createAction(ClientActionEnums.FetchClientStatsPending);
export const fetchClientStatsSuccess = createAction(ClientActionEnums.FetchClientStatsSuccess, (stats: any) => ({ stats }));
export const fetchClientStatsError = createAction(ClientActionEnums.FetchClientStatsError, (error: string) => ({ error }));

export const setFilters = createAction(ClientActionEnums.SetFilters, (filters: ClientFilters) => ({ filters }));
export const clearError = createAction(ClientActionEnums.ClearError);
