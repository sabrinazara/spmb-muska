'use client';

import { useState, useEffect } from 'react';
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

export default function AuditTrailPage() {
    const { confirmAction } = useToast();
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.AUDIT_LOGS, {
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
                        <RefreshCw className="w-4 h-4 text-slate-400" />
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
                                        Memuat riwayat log...
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
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
                                        Belum ada riwayat aktivitas audit trail yang tercatat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
