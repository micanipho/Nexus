import api from './api';

export interface Note {
    id: string;
    content: string;
    text?: string;
    relatedToType: number;
    relatedToId: string;
    isPrivate: boolean;
    tenantId: string;
    createdBy: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateNotePayload {
    content: string;
    relatedToType: number;
    relatedToId: string;
    isPrivate: boolean;
}

export interface UpdateNotePayload {
    content: string;
    isPrivate: boolean;
}

class NoteService {
    async getNotes(params?: { relatedToType?: number; relatedToId?: string; pageNumber?: number; pageSize?: number }) {
        const response = await api.get('/notes', { params });
        return response.data; // Assumes standard pagination envelope { items: [], totalCount: ... } or flat array
    }

    async getNoteById(id: string) {
        const response = await api.get(`/notes/${id}`);
        return response.data;
    }

    async createNote(payload: CreateNotePayload) {
        const response = await api.post('/notes', payload);
        return response.data;
    }

    async updateNote(id: string, payload: UpdateNotePayload) {
        const response = await api.put(`/notes/${id}`, payload);
        return response.data;
    }

    async deleteNote(id: string) {
        const response = await api.delete(`/notes/${id}`);
        return response.data;
    }
}

const noteService = new NoteService();
export default noteService;
