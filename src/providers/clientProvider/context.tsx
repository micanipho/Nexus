import { createContext } from 'react';
import { Client } from '../../types';
import { ClientFilters, ClientStats } from '../../services/clientService';

export interface ClientState {
    clients: Client[];
    selectedClient: Client | null;
    clientStats: ClientStats | null;
    isPending: boolean;
    error: string | null;
    filters: ClientFilters;
    totalCount: number;
}

export interface ClientActions {
    fetchClients: (filters?: ClientFilters) => Promise<void>;
    fetchClientById: (id: string) => Promise<void>;
    createClient: (data: any) => Promise<void>;
    updateClient: (id: string, data: any) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    fetchClientStats: (id: string) => Promise<void>;
    setFilters: (filters: ClientFilters) => void;
    clearError: () => void;
}

export const INITIAL_STATE: ClientState = {
    clients: [],
    selectedClient: null,
    clientStats: null,
    isPending: false,
    error: null,
    filters: {
        pageNumber: 1,
        pageSize: 10,
    },
    totalCount: 0,
};

export const ClientStateContext = createContext<ClientState>(INITIAL_STATE);
export const ClientActionContext = createContext<ClientActions | undefined>(undefined);
