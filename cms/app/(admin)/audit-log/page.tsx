'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    ShieldCheck,
    RefreshCw,
    Clock,
    User,
    CheckCircle2,
    Calendar,
    Trash2,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';
import { cmsToast, useToast } from '@/components/ToastProvider';

interface AuditLogItem {
    id: string;
    adminId: string | null;
    adminNama: string | null;
    aksi: string;
    detail: string | null;
    targetUser: string | null;
    createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AuditTrailPage() {
    const { confirmAction } = useToast();
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filter & Pagination States
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_ENDPOINTS.ADMIN.AUDIT_LOGS}?limit=250`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Gagal memuat catatan audit trail');
            const data = await res.json();
            setLogs(data || []);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            setActionMsg({ type: 'error', text: 'Gagal memuat catatan audit trail.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Filtered logs based on search input
    const filteredLogs = useMemo(() => {
        if (!search.trim()) return logs;
        const q = search.toLowerCase().trim();
        return logs.filter((log) =>
            (log.adminNama && log.adminNama.toLowerCase().includes(q)) ||
            (log.aksi && log.aksi.toLowerCase().includes(q)) ||
            (log.detail && log.detail.toLowerCase().includes(q)) ||
            (log.targetUser && log.targetUser.toLowerCase().includes(q))
        );
    }, [logs, search]);

    // Reset to page 1 whenever search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // Calculate pagination values
    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Generate page numbers array (with ellipsis for large page counts)
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                start = 2;
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
                end = totalPages - 1;
            }

            if (start > 2) {
                pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push('...');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    const handleDeleteLog = async (id: string) => {
        confirmAction({
            title: 'Hapus Catatan Audit',
            message: 'Apakah Anda yakin ingin menghapus catatan riwayat aktivitas audit ini?',
            type: 'danger',
            confirmLabel: 'Ya, Hapus',
            cancelLabel: 'Batal',
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_ENDPOINTS.ADMIN.AUDIT_LOGS}/${id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders(),
                    });
                    const result = await res.json();
                    if (res.ok) {
                        setActionMsg({ type: 'success', text: result.message || 'Catatan audit berhasil dihapus.' });
                        cmsToast.delete('Catatan audit berhasil dihapus.', 'Penghapusan Log Berhasil');
                        
                        // Adjust current page if last item on this page is deleted
                        if (currentLogs.length === 1 && currentPage > 1) {
                            setCurrentPage((prev) => prev - 1);
                        }

                        fetchLogs();
                    } else {
                        setActionMsg({ type: 'error', text: result.message || 'Gagal menghapus catatan audit.' });
                        cmsToast.error(result.message || 'Gagal menghapus catatan audit.', 'Gagal Menghapus');
                    }
                } catch {
                    setActionMsg({ type: 'error', text: 'Gagal menghubungi server backend.' });
                    cmsToast.error('Gagal menghubungi server backend.', 'Kesalahan Server');
                }
            },
        });
    };

    const handleClearAllLogs = async () => {
        confirmAction({
            title: 'Bersihkan Seluruh Riwayat Audit Trail',
            message: 'PERINGATAN: Apakah Anda yakin ingin membersihkan SELURUH riwayat aktivitas audit log? Tindakan ini permanen dan tidak dapat dikembalikan.',
            type: 'danger',
            confirmLabel: 'Ya, Bersihkan Seluruh Log',
            cancelLabel: 'Batal',
            onConfirm: async () => {
                try {
                    const res = await fetch(API_ENDPOINTS.ADMIN.AUDIT_LOGS, {
                        method: 'DELETE',
                        headers: getAuthHeaders(),
                    });
                    const result = await res.json();
                    if (res.ok) {
                        setActionMsg({ type: 'success', text: result.message || 'Seluruh riwayat audit log berhasil dibersihkan.' });
                        cmsToast.delete('Seluruh riwayat audit trail berhasil dibersihkan.', 'Pembersihan Riwayat Selesai');
                        setCurrentPage(1);
                        fetchLogs();
                    } else {
                        setActionMsg({ type: 'error', text: result.message || 'Gagal membersihkan audit log.' });
                        cmsToast.error(result.message || 'Gagal membersihkan audit log.', 'Gagal Membersihkan');
                    }
                } catch {
                    setActionMsg({ type: 'error', text: 'Gagal menghubungi server backend.' });
                    cmsToast.error('Gagal menghubungi server backend.', 'Kesalahan Server');
                }
            },
        });
    };

    const getActionBadge = (aksi: string) => {
        switch (aksi) {
            case 'VERIFIKASI_BERKAS':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        VERIFIKASI BERKAS
                    </span>
                );
            case 'PENILAIAN_DAN_KELULUSAN':
            case 'BULK_UPDATE_KELULUSAN':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        PENILAIAN & KELULUSAN
                    </span>
                );
            case 'UPLOAD_KNOWLEDGE_BASE':
            case 'HAPUS_KNOWLEDGE_BASE':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        AI KNOWLEDGE BASE
                    </span>
                );
            case 'TAMBAH_ADMIN':
            case 'UPDATE_ADMIN':
            case 'HAPUS_ADMIN':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        MANAJEMEN ADMIN
                    </span>
                );
            case 'UPDATE_PENGATURAN':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        PENGATURAN SISTEM
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {aksi}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <span>Audit Trail & Riwayat Aktivitas Panitia</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Rekam jejak tindakan verifikasi berkas, penilaian, dan perubahan sistem oleh administrator
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                        onClick={fetchLogs}
                        className="px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Segarkan Log"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                        <span>Segarkan</span>
                    </button>

                    {logs.length > 0 && (
                        <button
                            onClick={handleClearAllLogs}
                            className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Bersihkan Semua Catatan Audit Log"
                        >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                            <span>Bersihkan Semua Log</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Notification alert */}
            {actionMsg && (
                <div
                    className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${
                        actionMsg.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {actionMsg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span>{actionMsg.text}</span>
                    </div>
                    <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari admin, aksi, atau detail aktivitas..."
                        className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                            title="Hapus Pencarian"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 self-end sm:self-center">
                    Total: <strong className="text-slate-900 dark:text-white">{filteredLogs.length}</strong> catatan aktivitas
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                            <tr>
                                <th className="p-3.5">Waktu Aktivitas</th>
                                <th className="p-3.5">Administrator</th>
                                <th className="p-3.5">Jenis Tindakan</th>
                                <th className="p-3.5">Detail & Catatan</th>
                                <th className="p-3.5">Target Sistem / Siswa</th>
                                <th className="p-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                                        <span>Memuat riwayat log...</span>
                                    </td>
                                </tr>
                            ) : currentLogs.length > 0 ? (
                                currentLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                                        <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                            })}
                                        </td>
                                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                                    AD
                                                </div>
                                                <span className="truncate max-w-[140px]">{log.adminNama || 'Admin'}</span>
                                            </div>
                                        </td>
                                        <td className="p-3.5">
                                            {getActionBadge(log.aksi)}
                                        </td>
                                        <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs text-xs">
                                            {log.detail || '-'}
                                        </td>
                                        <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                            {log.targetUser || '-'}
                                        </td>
                                        <td className="p-3.5 text-right">
                                            <button
                                                onClick={() => handleDeleteLog(log.id)}
                                                className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg transition cursor-pointer"
                                                title="Hapus Catatan Log Ini"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                                        {search ? `Tidak ada catatan audit yang cocok dengan "${search}".` : 'Belum ada riwayat aktivitas audit trail yang tercatat.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Tampil jika data lebih dari 10) */}
                {filteredLogs.length > ITEMS_PER_PAGE && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-slate-900/40">
                        <span className="text-slate-500 dark:text-slate-400">
                            Menampilkan <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length)}</strong> dari <strong>{filteredLogs.length}</strong> aktivitas
                        </span>

                        <div className="flex items-center gap-1 sm:gap-1.5">
                            {/* Tombol Sebelumnya */}
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage <= 1}
                                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer flex items-center gap-1"
                                title="Halaman Sebelumnya"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline text-xs font-semibold">Sebelumnya</span>
                            </button>

                            {/* Tombol Angka Halaman: 1, 2, 3, 4 dst */}
                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((p, idx) => {
                                    if (p === '...') {
                                        return (
                                            <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-slate-400 text-xs font-semibold">
                                                ...
                                            </span>
                                        );
                                    }
                                    const pageNum = p as number;
                                    const isActive = currentPage === pageNum;
                                    return (
                                        <button
                                            key={`page-${pageNum}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                isActive
                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tombol Selanjutnya */}
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage >= totalPages}
                                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer flex items-center gap-1"
                                title="Halaman Selanjutnya"
                            >
                                <span className="hidden sm:inline text-xs font-semibold">Selanjutnya</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
