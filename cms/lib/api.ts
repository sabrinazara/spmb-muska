/**
 * Manajemen Terpusat URL API & Endpoint CMS Admin SPMB SMK Muhammadiyah Sekampung (PPDB-MUSKA)
 */

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const AI_BASE_URL =
    process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        ME: `${API_BASE_URL}/auth/me`,
    },
    ADMIN: {
        STATS: `${API_BASE_URL}/admin/stats`,
        PENDAFTAR: `${API_BASE_URL}/admin/pendaftar`,
        DETAIL_PENDAFTAR: (id: string) => `${API_BASE_URL}/admin/pendaftar/${id}`,
        VERIFIKASI_DOKUMEN: (id: string) => `${API_BASE_URL}/admin/verifikasi/${id}`,
        INPUT_NILAI: (id: string) => `${API_BASE_URL}/admin/nilai/${id}`,
        KNOWLEDGE_BASE: `${API_BASE_URL}/admin/knowledge-base`,
        AUDIT_LOGS: `${API_BASE_URL}/admin/audit-logs`,
        EXPORT_EXCEL: `${API_BASE_URL}/admin/export-excel`,
    },
    AI: {
        CHAT: `${API_BASE_URL}/ai/chat`,
        RAG_CHAT_DIRECT: `${AI_BASE_URL}/rag/chat`,
        OCR_SCAN_DIRECT: `${AI_BASE_URL}/ocr/scan`,
    },
} as const;

export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
}

export function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}
