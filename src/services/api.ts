import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add Authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('nexus_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Keywords that indicate a cross-tenant access violation in API error messages
const CROSS_TENANT_KEYWORDS = ['tenant', 'organization', 'cross-tenant', 'not found'];

function isCrossTenantResponse(error: AxiosError): boolean {
  const status = error.response?.status;
  if (status !== 403 && status !== 404) return false;

  const data = error.response?.data as Record<string, unknown> | undefined;
  const message = (data?.message ?? data?.error ?? '') as string;
  return CROSS_TENANT_KEYWORDS.some((kw) =>
    message.toLowerCase().includes(kw),
  );
}

// Response Interceptor: Handle common errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Logic for handling unauthorized access (e.g., redirect to login)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nexus_token');
        window.location.href = '/login';
      }
    }

    // Flag cross-tenant access errors so the UI can handle them gracefully
    if (isCrossTenantResponse(error)) {
      (error as AxiosError & { isCrossTenantError: boolean }).isCrossTenantError = true;
    }

    return Promise.reject(error);
  }
);

export default api;
