'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    Search,
    Filter,
    Download,
    Eye,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    GraduationCap,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

interface PendaftarItem {
    id: string;
    nomorPendaftaran: string | null;
    namaLengkap: string | null;
    nisn: string;
    nik: string;
    sekolahAsal: string | null;
    jurusan: string;
    status: 'VALID' | 'PENDING' | 'INVALID';
    statusPembayaran: string | null;
    nilaiUjian: number | null;
    statusKelulusan: string | null;
    createdAt: string;
    user?: { email: string; nama: string | null };
    dokumen?: { id: string; jenisDokumen: string; status: string }[];
}

export default function PendaftarManagementPage() {
    const [pendaftarList, setPendaftarList] = useState<PendaftarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filter states
    const [search, setSearch] = useState('');
    const [jurusan, setJurusan] = useState('ALL');
    const [status, setStatus] = useState('ALL');
    const [statusKelulusan, setStatusKelulusan] = useState('ALL');

    const fetchPendaftar = async (targetPage = page) => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (search.trim()) query.set('search', search.trim());
            if (jurusan !== 'ALL') query.set('jurusan', jurusan);
            if (status !== 'ALL') query.set('status', status);
            if (statusKelulusan !== 'ALL') query.set('statusKelulusan', statusKelulusan);
            query.set('page', String(targetPage));
            query.set('limit', '12');

            const res = await fetch(`${API_ENDPOINTS.ADMIN.PENDAFTAR}?${query.toString()}`, {
                headers: getAuthHeaders(),
            });

            if (!res.ok) throw new Error('Gagal memuat data pendaftar');
            const data = await res.json();
            setPendaftarList(data.items || []);
            setTotal(data.pagination?.total || 0);
            setTotalPages(data.pagination?.totalPages || 1);
            setPage(targetPage);
        } catch (err) {
            console.error('Error fetching pendaftar:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchPendaftar(1);
        }, 300);
        return () => clearTimeout(debounce);
    }, [search, jurusan, status, statusKelulusan]);

    const handleExportExcel = () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        window.open(`${API_ENDPOINTS.ADMIN.EXPORT_EXCEL}?token=${token}`, '_blank');
    };

    const JURUSAN_OPTIONS = [
        { value: 'ALL', label: 'Semua Jurusan (8 Keahlian)' },
        { value: 'TKJ', label: 'Teknik Jaringan Komputer (TKJ)' },
        { value: 'TKR', label: 'Teknik Kendaraan Ringan (TKR)' },
        { value: 'TBSM', label: 'Teknik Sepeda Motor (TBSM)' },
        { value: 'DKV', label: 'Desain Komunikasi Visual (DKV)' },
        { value: 'BDK', label: 'Bisnis Digital dan Kreatif (BDK)' },
        { value: 'BOGA', label: 'Kuliner / Tata Boga' },
        { value: 'TATA_RIAS', label: 'Kecantikan dan Tata Rias' },
        { value: 'CNC', label: 'Teknik Pemesinan (CNC)' },
        { value: 'LAS', label: 'Teknik Pengelasan (Welding)' },
    ];

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header & Export CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-500" />
                        <span>Manajemen Calon Siswa & Verifikasi Berkas</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Kelola data pendaftar, pencocokan AI OCR, status berkas, ruang ujian, dan kelulusan
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleExportExcel}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Ekspor Data Dapodik (CSV/Excel)</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari NISN, nama, atau sekolah..."
                            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                        />
                    </div>

                    {/* Filter Jurusan */}
                    <div>
                        <select
                            value={jurusan}
                            onChange={(e) => setJurusan(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                            {JURUSAN_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Status Berkas */}
                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="ALL">Status Berkas (Semua)</option>
                            <option value="VALID">Valid (Terverifikasi)</option>
                            <option value="PENDING">Pending (Menunggu)</option>
                            <option value="INVALID">Invalid (Ditolak)</option>
                        </select>
                    </div>

                    {/* Filter Kelulusan */}
                    <div>
                        <select
                            value={statusKelulusan}
                            onChange={(e) => setStatusKelulusan(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="ALL">Status Kelulusan (Semua)</option>
                            <option value="LULUS">Dinyatakan Lulus</option>
                            <option value="TIDAK_LULUS">Tidak Lulus</option>
                            <option value="MENUNGGU">Menunggu Penilaian</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                        Menampilkan <strong>{pendaftarList.length}</strong> dari <strong>{total}</strong> calon siswa
                    </span>

                    {(search || jurusan !== 'ALL' || status !== 'ALL' || statusKelulusan !== 'ALL') && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setJurusan('ALL');
                                setStatus('ALL');
                                setStatusKelulusan('ALL');
                            }}
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                            <tr>
                                <th className="p-3.5">No</th>
                                <th className="p-3.5">Identitas Siswa</th>
                                <th className="p-3.5">Sekolah Asal</th>
                                <th className="p-3.5">Pilihan Jurusan</th>
                                <th className="p-3.5">Status Berkas</th>
                                <th className="p-3.5">Nilai Ujian</th>
                                <th className="p-3.5">Kelulusan</th>
                                <th className="p-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center">
                                        <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <p className="text-slate-400 text-xs">Memuat data pendaftar...</p>
                                    </td>
                                </tr>
                            ) : pendaftarList.length > 0 ? (
                                pendaftarList.map((p, idx) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                                        <td className="p-3.5 font-mono text-slate-400">
                                            {(page - 1) * 12 + idx + 1}
                                        </td>
                                        <td className="p-3.5">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {p.namaLengkap || p.user?.nama || 'Belum Mengisi Nama'}
                                            </div>
                                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                                NISN: {p.nisn}
                                            </div>
                                        </td>
                                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                                            {p.sekolahAsal || '-'}
                                        </td>
                                        <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                                            {p.jurusan}
                                        </td>
                                        <td className="p-3.5">
                                            {p.status === 'VALID' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>Valid</span>
                                                </span>
                                            ) : p.status === 'INVALID' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                                    <XCircle className="w-3 h-3" />
                                                    <span>Ditolak</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Menunggu</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3.5 font-mono text-xs font-bold text-slate-900 dark:text-white">
                                            {p.nilaiUjian !== null && p.nilaiUjian !== undefined ? p.nilaiUjian : '-'}
                                        </td>
                                        <td className="p-3.5">
                                            {p.statusKelulusan === 'LULUS' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                    <GraduationCap className="w-3 h-3" />
                                                    <span>Lulus</span>
                                                </span>
                                            ) : p.statusKelulusan === 'TIDAK_LULUS' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                                    <span>Tidak Lulus</span>
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">
                                                    Menunggu
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3.5 text-right">
                                            <Link
                                                href={`/pendaftar/${p.id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 transition"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Periksa</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                                        Tidak ada data pendaftar yang cocok dengan filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                            Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchPendaftar(page - 1)}
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => fetchPendaftar(page + 1)}
                                disabled={page >= totalPages}
                                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
