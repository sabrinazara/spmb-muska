'use client';

import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    RefreshCw,
    Clock,
    User,
    CheckCircle2,
    Calendar,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

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
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.AUDIT_LOGS, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Gagal memuat catatan audit trail');
            const data = await res.json();
            setLogs(data);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionBadge = (aksi: string) => {
        switch (aksi) {
            case 'VERIFIKASI_BERKAS':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                        VERIFIKASI BERKAS
                    </span>
                );
            case 'PENILAIAN_DAN_KELULUSAN':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        PENILAIAN & KELULUSAN
                    </span>
                );
            case 'UPLOAD_KNOWLEDGE_BASE':
            case 'HAPUS_KNOWLEDGE_BASE':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                        AI KNOWLEDGE BASE
                    </span>
                );
            case 'TAMBAH_ADMIN':
            case 'HAPUS_ADMIN':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                        MANAJEMEN ADMIN
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

                <button
                    onClick={fetchLogs}
                    className="self-start sm:self-auto px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700/80 transition flex items-center gap-1.5 cursor-pointer"
                >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                    <span>Segarkan Log</span>
                </button>
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
                                <th className="p-3.5">Siswa Terkait</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
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
                                            })}
                                        </td>
                                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                                            {log.adminNama || 'System Admin'}
                                        </td>
                                        <td className="p-3.5">
                                            {getActionBadge(log.aksi)}
                                        </td>
                                        <td className="p-3.5 text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                                            {log.detail || '-'}
                                        </td>
                                        <td className="p-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                                            {log.targetUser || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                                        Belum ada rekaman audit trail.
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
