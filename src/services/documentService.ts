import api from './api';

export interface DocumentInfo {
    id: string;
    fileName: string;
    description?: string;
    category: number;
    categoryName?: string;
    relatedToType: number;
    relatedToId: string;
    tenantId: string;
    uploadedBy: string;
    uploadedByName?: string;
    uploadedAt: string;
    fileSize: number;
}

export interface UploadDocumentPayload {
    file: File | Blob;
    category: number;
    relatedToType: number;
    relatedToId: string;
    description?: string;
}

class DocumentService {
    async getDocuments(params?: { relatedToType?: number; relatedToId?: string; category?: number; pageNumber?: number; pageSize?: number }) {
        const response = await api.get('/documents', { params });
        return response.data;
    }

    async getDocumentById(id: string) {
        const response = await api.get(`/documents/${id}`);
        return response.data;
    }

    async uploadDocument(payload: UploadDocumentPayload) {
        const formData = new FormData();
        formData.append('file', payload.file as Blob);
        formData.append('documentCategory', payload.category.toString());
        formData.append('relatedToType', payload.relatedToType.toString());
        formData.append('relatedToId', payload.relatedToId);

        if (payload.description) {
            formData.append('description', payload.description);
        }

        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async downloadDocument(doc: DocumentInfo) {
        // Typically trigger a file download stream rather than json parsing block
        const response = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
        
        // Browser file download logic helper
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // attempt to parse the header for attachment filename if possible
        const contentHeader = response.headers['content-disposition'];
        let fileName = doc.fileName || 'downloaded_document';
        if (contentHeader) {
            const match = contentHeader.match(/filename="?([^";]+)"?/);
            if (match && match[1]) {
                fileName = match[1];
            }
        }
        
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    async deleteDocument(id: string) {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    }
}

const documentService = new DocumentService();
export default documentService;
