/**
 * Manajemen Terpusat URL API & Endpoint SPMB SMK Muhammadiyah Sekampung (PPDB-MUSKA)
 * Semua request fetch di frontend WAJIB menggunakan konstanta dari file ini.
 */

export const API_BASE_URL =
    (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:3000')
        ? process.env.NEXT_PUBLIC_API_URL
        : 'http://localhost:3001';

export const AI_BASE_URL =
    process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    // Autentikasi Pengguna
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        ME: `${API_BASE_URL}/auth/me`,
    },

    // Pendaftaran Siswa
    PENDAFTARAN: {
        SAYA: `${API_BASE_URL}/pendaftaran/saya`,
        STATUS: `${API_BASE_URL}/pendaftaran/status`,
        BUAT: `${API_BASE_URL}/pendaftaran/buat`,
        LENGKAPI_DATA: `${API_BASE_URL}/pendaftaran/lengkapi-data`,
        KARTU_UJIAN: `${API_BASE_URL}/pendaftaran/kartu-ujian`,
        RINGKASAN_FORMULIR: `${API_BASE_URL}/pendaftaran/ringkasan-formulir`,
        PENGUMUMAN: `${API_BASE_URL}/pendaftaran/pengumuman`,
    },

    // Landing Page Publik, Berita & Program Keahlian (Jurusan)
    LANDING_PAGE: `${API_BASE_URL}/landing-page`,
    BERITA: {
        LIST: `${API_BASE_URL}/landing-page/berita`,
        DETAIL: (slugOrId: string) => `${API_BASE_URL}/landing-page/berita/${slugOrId}`,
    },
    JURUSAN: {
        LIST: `${API_BASE_URL}/landing-page/jurusan`,
        DETAIL: (idOrSlug: string) => `${API_BASE_URL}/landing-page/jurusan/${idOrSlug}`,
    },
    AGENDA: {
        LIST: `${API_BASE_URL}/landing-page/agenda`,
        DETAIL: (id: string) => `${API_BASE_URL}/landing-page/agenda/${id}`,
    },
    PRESTASI: {
        LIST: `${API_BASE_URL}/landing-page/prestasi`,
        DETAIL: (id: string) => `${API_BASE_URL}/landing-page/prestasi/${id}`,
    },
    GALERI: {
        LIST: `${API_BASE_URL}/landing-page/galeri`,
        DETAIL: (slugOrId: string) => `${API_BASE_URL}/landing-page/galeri/${slugOrId}`,
    },

    // Upload & Verifikasi Dokumen
    DOKUMEN: {
        SCAN_PREVIEW: `${API_BASE_URL}/dokumen/scan-preview`,
        UPLOAD: `${API_BASE_URL}/dokumen/upload`,
        LIST: `${API_BASE_URL}/dokumen/list`,
    },

    // Layanan AI (Chatbot RAG & OCR)
    AI: {
        CHAT: `${API_BASE_URL}/ai/chat`, // Proxied via NestJS with fallback
        RAG_CHAT_DIRECT: `${AI_BASE_URL}/rag/chat`, // Direct Python FastAPI
        OCR_SCAN_DIRECT: `${AI_BASE_URL}/ocr/scan`, // Direct Python FastAPI
    },

    // CMS Admin & Pengelolaan Sistem
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
} as const;

/**
 * Helper untuk mengambil token otentikasi dari localStorage di sisi client
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
}

/**
 * Helper untuk menyusun header request dengan otorisasi Bearer token
 */
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

/**
 * Helper untuk Chatbot RAG:
 * Memanggil backend NestJS (/ai/chat) terlebih dahulu.
 * Jika gagal, mencoba langsung ke Python AI (/rag/chat),
 * dan jika keduanya offline, mengembalikan fallback knowledge base SPMB Muska.
 */
export async function sendAiChatMessage(question: string): Promise<{ answer: string; source?: string }> {
    // 1. Coba via NestJS API
    try {
        const res = await fetch(API_ENDPOINTS.AI.CHAT, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ question }),
        });
        if (res.ok) {
            const data = await res.json();
            return {
                answer: data.answer || data.text || 'Maaf, jawaban tidak dapat diproses.',
                source: data.source || 'NestJS RAG Service',
            };
        }
    } catch {
        // Fall through ke direct Python
    }

    // 2. Coba direct ke Python FastAPI AI
    try {
        const resAi = await fetch(API_ENDPOINTS.AI.RAG_CHAT_DIRECT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        });
        if (resAi.ok) {
            const dataAi = await resAi.json();
            return {
                answer: dataAi.answer,
                source: 'Python AI Engine (FastAPI)',
            };
        }
    } catch {
        // Fall through ke local knowledge base
    }

    // 3. Fallback cerdas berbasis pengetahuan lokal SPMB SMK Muhammadiyah Sekampung
    const qLower = question.toLowerCase();
    if (qLower.includes('jurusan') || qLower.includes('prodi') || qLower.includes('pilihan')) {
        return {
            answer:
                'SMK Muhammadiyah Sekampung membuka 8 Program Keahlian unggulan: ' +
                '1. Teknik Jaringan Komputer dan Telekomunikasi, ' +
                '2. Teknik Otomotif (Teknik Sepeda Motor), ' +
                '3. Desain Komunikasi Visual, ' +
                '4. Bisnis Digital dan Kreatif, ' +
                '5. Kulineri (Tata Boga), ' +
                '6. Kecantikan dan Tata Rias, ' +
                '7. Teknik Pemesinan (CNC), ' +
                '8. Teknik Pengelasan (Welding).',
            source: 'Basis Pengetahuan Lokal SPMB',
        };
    }

    if (qLower.includes('biaya') || qLower.includes('bayar') || qLower.includes('uang')) {
        return {
            answer:
                'Pendaftaran PPDB SMK Muhammadiyah Sekampung gelombang pertama memberikan kemudahan pembiayaan. ' +
                'Rincian biaya formulir, seragam (tersedia ukuran S hingga 4XL), dan SPP dapat dilihat di menu Pengumuman atau hubungi panitia PPDB.',
            source: 'Basis Pengetahuan Lokal SPMB',
        };
    }

    if (qLower.includes('syarat') || qLower.includes('berkas') || qLower.includes('dokumen') || qLower.includes('ktp') || qLower.includes('kk')) {
        return {
            answer:
                'Persyaratan berkas yang wajib diunggah pada menu "Upload Dokumen": ' +
                '1. Foto/Scan KTP / Kartu Identitas Anak, ' +
                '2. Foto/Scan Kartu Keluarga (KK), ' +
                '3. Foto/Scan Ijazah atau Surat Keterangan Lulus (SKL), ' +
                '4. Bukti transfer/pembayaran pendaftaran. ' +
                'Sistem kami dilengkapi OCR otomatis untuk membaca NIK dan NISN dari foto yang diunggah!',
            source: 'Basis Pengetahuan Lokal SPMB',
        };
    }

    if (qLower.includes('jadwal') || qLower.includes('kapan') || qLower.includes('ujian') || qLower.includes('waktu')) {
        return {
            answer:
                'Jadwal pendaftaran gelombang 1 dibuka mulai sekarang. Ujian seleksi dilaksanakan secara berkala di Ruang CBT Kampus 1 SMK Muhammadiyah Sekampung. ' +
                'Pastikan dokumen Anda telah berstatus Terverifikasi untuk mengunduh Kartu Tanda Peserta Ujian.',
            source: 'Basis Pengetahuan Lokal SPMB',
        };
    }

    return {
        answer:
            `Terima kasih telah bertanya tentang "${question}". ` +
            'Pendaftaran Siswa Baru (SPMB) SMK Muhammadiyah Sekampung saat ini sedang berlangsung. ' +
            'Anda dapat melengkapi formulir data diri di menu "Lengkapi Data" dan mengunggah berkas persyaratan di menu "Upload Dokumen".',
        source: 'Asisten AI SPMB Muska',
    };
}
