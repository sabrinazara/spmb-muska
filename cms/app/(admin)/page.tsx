'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    CheckCircle2,
    Clock,
    XCircle,
    Award,
    TrendingUp,
    Download,
    Eye,
    RefreshCw,
    AlertCircle,
    ChevronRight,
    GraduationCap,
    BarChart3,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

interface StatsData {
    summary: {
        totalPendaftar: number;
        berkasValid: number;
        berkasPending: number;
        berkasInvalid: number;
        bayarLunas: number;
        bayarMenunggu: number;
        bayarBelum: number;
        lulus: number;
        tidakLulus: number;
        menungguUjian: number;
    };
    jurusanStats: {
        jurusan: string;
        singkatan: string;
        count: number;
    }[];
    dailyTrends: {
        tanggal: string;
        label: string;
        count: number;
    }[];
    pendaftarTerbaru: {
        id: string;
        nomorPendaftaran: string | null;
        namaLengkap: string | null;
        nisn: string;
        jurusan: string;
        status: string;
        statusPembayaran: string | null;
        createdAt: string;
        user?: { email: string; nama: string | null };
    }[];
}

export default function AdminAnalyticsDashboard() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.STATS, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) {
                throw new Error('Gagal memuat statistik sistem');
            }
            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            setErrorMsg(err.message || 'Terjadi kesalahan saat memuat data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleExportExcel = () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        window.open(`${API_ENDPOINTS.ADMIN.EXPORT_EXCEL}?token=${token}`, '_blank');
    };

    // SKELETON LOADING
    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-lg w-64"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-24"></div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-36"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (errorMsg || !stats) {
        return (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-sm flex items-center justify-between font-sans">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <span>{errorMsg || 'Data analitik tidak dapat dimuat.'}</span>
                </div>
                <button
                    onClick={fetchStats}
                    className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition cursor-pointer"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    const { summary, jurusanStats, dailyTrends, pendaftarTerbaru } = stats;
    const maxJurusanCount = Math.max(...jurusanStats.map((j) => j.count), 1);
    const maxTrendCount = Math.max(...dailyTrends.map((t) => t.count), 1);

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Ringkasan Operasional Penerimaan Siswa Baru
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pemantauan pendaftaran calon siswa baru
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={fetchStats}
                        className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700/80 transition flex items-center gap-1.5 cursor-pointer"
                        title="Segarkan data"
                    >
                        <RefreshCw className="w-4 h-4 text-slate-400" />
                        <span className="hidden sm:inline">Perbarui</span>
                    </button>

                    <button
                        onClick={handleExportExcel}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Ekspor Excel / CSV</span>
                    </button>
                </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Pendaftar */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Total Pendaftar
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {summary.totalPendaftar}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{summary.berkasValid} valid</span>
                        <span>•</span>
                        <span>{summary.berkasPending} antre verifikasi</span>
                    </p>
                </div>

                {/* 2. Berkas Terverifikasi */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Berkas Terverifikasi
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {summary.berkasValid}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-teal-500 rounded-full"
                                style={{
                                    width: `${summary.totalPendaftar > 0 ? (summary.berkasValid / summary.totalPendaftar) * 100 : 0}%`,
                                }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {summary.totalPendaftar > 0
                                ? Math.round((summary.berkasValid / summary.totalPendaftar) * 100)
                                : 0}
                            %
                        </span>
                    </div>
                </div>

                {/* 3. Menunggu Verifikasi */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Menunggu Verifikasi
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {summary.berkasPending}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                        <span className="text-rose-500 font-semibold">{summary.berkasInvalid} revisi/ditolak</span>
                    </p>
                </div>

                {/* 4. Kelulusan Siswa */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Siswa Dinyatakan Lulus
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {summary.lulus}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {summary.tidakLulus} tidak lulus • {summary.menungguUjian} menunggu penilaian
                    </p>
                </div>
            </div>

            {/* 2 Kolom Grafik & Statistik */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart Jurusan */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-500" />
                                <span>Distribusi Pendaftar per Program Keahlian</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                8 Pilihan Jurusan Unggulan SMK Muhammadiyah Sekampung
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        {jurusanStats.map((item) => {
                            const percent = Math.round((item.count / maxJurusanCount) * 100);
                            return (
                                <div key={item.singkatan} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {item.jurusan} ({item.singkatan})
                                        </span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                                            {item.count} siswa
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Trend Harian */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span>Tren Pendaftaran (7 Hari Terakhir)</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Aktivitas registrasi calon siswa baru
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        {dailyTrends.map((t) => (
                            <div key={t.tanggal} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">{t.label}</span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    +{t.count} pendaftar
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabel Pendaftar Terbaru */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Pendaftar Terbaru
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Daftar calon siswa yang baru saja melengkapi formulir dan berkas
                        </p>
                    </div>
                    <Link
                        href="/pendaftar"
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                        <span>Lihat Semua</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="py-2.5 px-3">Nama Lengkap</th>
                                <th className="py-2.5 px-3">NISN</th>
                                <th className="py-2.5 px-3">Jurusan</th>
                                <th className="py-2.5 px-3">Status Berkas</th>
                                <th className="py-2.5 px-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {pendaftarTerbaru.length > 0 ? (
                                pendaftarTerbaru.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                                            {p.namaLengkap || p.user?.nama || 'Calon Siswa'}
                                        </td>
                                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                                            {p.nisn}
                                        </td>
                                        <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                                            {p.jurusan}
                                        </td>
                                        <td className="py-3 px-3">
                                            {p.status === 'VALID' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>Terverifikasi</span>
                                                </span>
                                            ) : p.status === 'INVALID' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                                    <XCircle className="w-3 h-3" />
                                                    <span>Ditolak</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Menunggu</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <Link
                                                href={`/pendaftar/${p.id}`}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Detail</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                                        Belum ada pendaftar terbaru.
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
