import { handleActions } from 'redux-actions';
import { ClientState, INITIAL_STATE } from './context';
import { ClientActionEnums } from './actions';

export const clientReducer = handleActions<ClientState, any>(
    {
        [ClientActionEnums.FetchClientsPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ClientActionEnums.FetchClientsSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            clients: payload.items,
            totalCount: payload.totalCount,
        }),
        [ClientActionEnums.FetchClientsError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ClientActionEnums.FetchClientByIdPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ClientActionEnums.FetchClientByIdSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            selectedClient: payload.client,
        }),
        [ClientActionEnums.FetchClientByIdError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ClientActionEnums.CreateClientPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ClientActionEnums.CreateClientSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            clients: [payload.client, ...state.clients],
        }),
        [ClientActionEnums.CreateClientError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ClientActionEnums.UpdateClientPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ClientActionEnums.UpdateClientSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            clients: state.clients.map((c) => (c.id === payload.client.id ? payload.client : c)),
            selectedClient: state.selectedClient?.id === payload.client.id ? payload.client : state.selectedClient,
        }),
        [ClientActionEnums.UpdateClientError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ClientActionEnums.DeactivateClientPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ClientActionEnums.DeactivateClientSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            clients: state.clients.filter((c) => c.id !== payload.id),
            selectedClient: state.selectedClient?.id === payload.id ? null : state.selectedClient,
        }),
        [ClientActionEnums.DeactivateClientError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ClientActionEnums.FetchClientStatsPending]: (state) => ({
            ...state,
            isPending: true,
            error: null,
        }),
        [ClientActionEnums.FetchClientStatsSuccess]: (state, { payload }) => ({
            ...state,
            isPending: false,
            clientStats: payload.stats,
        }),
        [ClientActionEnums.FetchClientStatsError]: (state, { payload }) => ({
            ...state,
            isPending: false,
            error: payload.error,
        }),
        [ClientActionEnums.SetFilters]: (state, { payload }) => ({
            ...state,
            filters: { ...state.filters, ...payload.filters },
        }),
        [ClientActionEnums.ClearError]: (state) => ({
            ...state,
            error: null,
        }),
    },
    INITIAL_STATE
);
