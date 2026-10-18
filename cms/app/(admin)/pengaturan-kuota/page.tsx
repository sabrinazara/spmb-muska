'use client';

import { useState, useEffect } from 'react';
import {
    Sliders,
    Award,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    Save,
    RotateCcw,
    Zap,
    TrendingUp,
    Check,
    X,
    Loader2,
    ShieldAlert,
    ChevronRight,
    BarChart3,
    ArrowUpDown,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

interface JurusanKuota {
    id: string;
    namaJurusan: string;
    singkatan: string | null;
    kuotaMaksimal: number;
    deskripsi: string | null;
    totalPendaftar: number;
    pendaftarValid: number;
    pendaftarLulus: number;
    pendaftarCadangan: number;
    pendaftarTidakLulus: number;
    siapSeleksi: number;
    sisaKuota: number;
    persentaseKeterisian: number;
}

interface SeleksiResult {
    message: string;
    waktuEksekusi: string;
    ringkasan: {
        totalDiproses: number;
        totalLulus: number;
        totalCadangan: number;
    };
    detailPerJurusan: Array<{
        jurusan: string;
        singkatan: string | null;
        kuotaMaksimal: number;
        totalPeserta: number;
        lulus: number;
        cadangan: number;
    }>;
}

export default function PengaturanKuotaPage() {
    const [jurusanList, setJurusanList] = useState<JurusanKuota[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(72);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Modal state for automated ranking selection
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [runningSeleksi, setRunningSeleksi] = useState(false);
    const [seleksiResult, setSeleksiResult] = useState<SeleksiResult | null>(null);

    const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchKuota = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.KUOTA, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setJurusanList(data);
            } else {
                setAlertMsg({ type: 'error', text: 'Gagal memuat data kuota jurusan dari server.' });
            }
        } catch {
            setAlertMsg({ type: 'error', text: 'Terjadi kesalahan jaringan saat mengambil data kuota.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKuota();
    }, []);

    const handleStartEdit = (jurusan: JurusanKuota) => {
        setEditingId(jurusan.id);
        setEditValue(jurusan.kuotaMaksimal);
    };

    const handleSaveKuota = async (id: string) => {
        if (editValue <= 0) {
            setAlertMsg({ type: 'error', text: 'Kuota jurusan minimal 1 kursi.' });
            return;
        }

        setSavingId(id);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.UPDATE_KUOTA(id), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ kuotaMaksimal: editValue }),
            });

            if (res.ok) {
                setAlertMsg({ type: 'success', text: 'Kuota jurusan berhasil diperbarui!' });
                setEditingId(null);
                fetchKuota();
            } else {
                const err = await res.json();
                setAlertMsg({ type: 'error', text: err.message || 'Gagal menyimpan perubahan kuota.' });
            }
        } catch {
            setAlertMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
        } finally {
            setSavingId(null);
        }
    };

    const handleRunSeleksiOtomatis = async () => {
        setRunningSeleksi(true);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.SELEKSI_OTOMATIS, {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            if (res.ok) {
                const result: SeleksiResult = await res.json();
                setSeleksiResult(result);
                setShowConfirmModal(false);
                setAlertMsg({
                    type: 'success',
                    text: `Seleksi otomatis selesai: ${result.ringkasan.totalLulus} siswa LULUS, ${result.ringkasan.totalCadangan} siswa CADANGAN.`,
                });
                fetchKuota();
            } else {
                const err = await res.json();
                setAlertMsg({ type: 'error', text: err.message || 'Gagal menjalankan seleksi otomatis.' });
            }
        } catch {
            setAlertMsg({ type: 'error', text: 'Gagal memproses seleksi otomatis di server.' });
        } finally {
            setRunningSeleksi(false);
        }
    };

    // Kalkulasi Rekapitulasi Global
    const totalKuotaSemua = jurusanList.reduce((acc, j) => acc + j.kuotaMaksimal, 0);
    const totalPendaftarSemua = jurusanList.reduce((acc, j) => acc + j.totalPendaftar, 0);
    const totalLulusSemua = jurusanList.reduce((acc, j) => acc + j.pendaftarLulus, 0);
    const totalSiapSeleksi = jurusanList.reduce((acc, j) => acc + j.siapSeleksi, 0);

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-200">
            {/* HEADER & ACTION BAR */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
                            <Zap className="w-3.5 h-3.5" />
                            <span>Sistem Seleksi Otomatis & Kuota Terpusat</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                            Manajemen Kuota Jurusan & Seleksi Ranking
                        </h1>
                        <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                            Atur daya tampung (kuota maksimal) setiap kompetensi keahlian dan eksekusi seleksi otomatis berdasarkan peringkat Nilai Ujian CBT tertinggi.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer transform active:scale-95"
                        >
                            <Zap className="w-4 h-4 fill-current" />
                            <span>Jalankan Seleksi Otomatis</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ALERT MESSAGE */}
            {alertMsg && (
                <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${
                        alertMsg.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        {alertMsg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        )}
                        <span>{alertMsg.text}</span>
                    </div>
                    <button
                        onClick={() => setAlertMsg(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total Kuota Tersedia
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Sliders className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                        {totalKuotaSemua}{' '}
                        <span className="text-xs font-normal text-slate-400">Kursi</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                        8 Program Kompetensi Keahlian
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Peserta Siap Seleksi
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                        {totalSiapSeleksi}{' '}
                        <span className="text-xs font-normal text-slate-400">Pendaftar</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                        Berkas Valid + Memiliki Nilai CBT
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Siswa Lulus Seleksi
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                        {totalLulusSemua}{' '}
                        <span className="text-xs font-normal text-slate-400">Siswa</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                        {totalKuotaSemua > 0
                            ? `${Math.round((totalLulusSemua / totalKuotaSemua) * 100)}% kuota terisi`
                            : '0%'}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Sisa Kuota Kosong
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                        {Math.max(0, totalKuotaSemua - totalLulusSemua)}{' '}
                        <span className="text-xs font-normal text-slate-400">Kursi Tersisa</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                        Bisa diisi gelombang lanjutan
                    </div>
                </div>
            </div>

            {/* TABEL PENGATURAN KUOTA PER JURUSAN */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            Rincian Kuota & Keterisian Program Keahlian
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Klik tombol "Ubah Kuota" untuk menyesuaikan daya tampung masing-masing kompetensi keahlian
                        </p>
                    </div>

                    <button
                        onClick={fetchKuota}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                        <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Muat Ulang</span>
                    </button>
                </div>

                {loading ? (
                    <div className="py-16 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-slate-500 mt-3 font-semibold">Memuat Data Kuota Jurusan...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Nama Kompetensi Keahlian</th>
                                    <th className="px-4 py-3.5 text-center">Kuota (Kursi)</th>
                                    <th className="px-4 py-3.5 text-center">Pendaftar Valid</th>
                                    <th className="px-4 py-3.5 text-center">Siap Seleksi</th>
                                    <th className="px-4 py-3.5 text-center">Lulus (Diterima)</th>
                                    <th className="px-4 py-3.5 text-center">Cadangan</th>
                                    <th className="px-5 py-3.5 text-center">Keterisian Kuota</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {jurusanList.map((j) => {
                                    const isEditing = editingId === j.id;

                                    return (
                                        <tr
                                            key={j.id}
                                            className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition"
                                        >
                                            {/* Nama Jurusan */}
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {j.namaJurusan}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono">
                                                    Kode/Singkatan: {j.singkatan || '-'}
                                                </div>
                                            </td>

                                            {/* Kuota Maksimal Editable */}
                                            <td className="px-4 py-4 text-center">
                                                {isEditing ? (
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={500}
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                                                            className="w-16 px-2 py-1 rounded-lg border border-emerald-500 bg-white dark:bg-slate-900 text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold font-mono">
                                                        {j.kuotaMaksimal} Kursi
                                                    </span>
                                                )}
                                            </td>

                                            {/* Pendaftar Valid */}
                                            <td className="px-4 py-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                                                {j.pendaftarValid}
                                            </td>

                                            {/* Siap Seleksi */}
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                                    {j.siapSeleksi}
                                                </span>
                                            </td>

                                            {/* Lulus */}
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                                    {j.pendaftarLulus}
                                                </span>
                                            </td>

                                            {/* Cadangan */}
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-mono text-slate-500 dark:text-slate-400">
                                                    {j.pendaftarCadangan}
                                                </span>
                                            </td>

                                            {/* Keterisian Progress Bar */}
                                            <td className="px-5 py-4 min-w-[150px]">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[11px] font-semibold">
                                                        <span className="text-slate-600 dark:text-slate-400">
                                                            {j.pendaftarLulus} / {j.kuotaMaksimal}
                                                        </span>
                                                        <span
                                                            className={
                                                                j.persentaseKeterisian >= 100
                                                                    ? 'text-rose-500 font-bold'
                                                                    : 'text-emerald-600 dark:text-emerald-400 font-bold'
                                                            }
                                                        >
                                                            {j.persentaseKeterisian}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                j.persentaseKeterisian >= 100
                                                                    ? 'bg-rose-500'
                                                                    : j.persentaseKeterisian >= 75
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-emerald-500'
                                                            }`}
                                                            style={{ width: `${Math.min(100, j.persentaseKeterisian)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-5 py-4 text-right">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleSaveKuota(j.id)}
                                                            disabled={savingId === j.id}
                                                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                                                            title="Simpan Kuota"
                                                        >
                                                            {savingId === j.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Check className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                            title="Batal"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStartEdit(j)}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-xs transition cursor-pointer"
                                                    >
                                                        Ubah Kuota
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SELEKSI OTOMATIS EXPLANATION BANNER */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                    <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    <span>Algoritma Seleksi Otomatis Kuota SPMB MUSKA</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 dark:text-slate-400">
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">1. Filter Peserta Valid</div>
                        <p>
                            Sistem hanya memproses calon siswa dengan status berkas <strong>VALID (Terverifikasi)</strong> dan telah memiliki <strong>Nilai Ujian CBT</strong>.
                        </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">2. Perankingan Tiap Jurusan</div>
                        <p>
                            Peserta diurutkan descending berdasarkan Nilai Ujian CBT tertinggi. Jika nilai sama, prioritas diberikan pada siswa yang mendaftar lebih awal.
                        </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">3. Alokasi Kuota & Status</div>
                        <p>
                            Peringkat 1 s/d Kuota Maksimal ditetapkan <strong>LULUS</strong>. Peserta melebihi kuota otomatis ditetapkan sebagai <strong>CADANGAN</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION MODAL SELEKSI OTOMATIS */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Konfirmasi Eksekusi Seleksi Otomatis
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Apakah Anda yakin ingin menjalankan algoritma seleksi otomatis sistem ranking sekarang?
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-2">
                            <div className="font-bold flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Perhatian Panitia Seleksi:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 leading-relaxed">
                                <li>Semua peserta valid dengan nilai CBT akan diperingkat per jurusan.</li>
                                <li>Status kelulusan pendaftar akan diperbarui menjadi <strong>LULUS</strong> atau <strong>CADANGAN</strong> sesuai kuota.</li>
                                <li>Aksi ini dicatat ke dalam log audit administrator.</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                disabled={runningSeleksi}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleRunSeleksiOtomatis}
                                disabled={runningSeleksi}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {runningSeleksi ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 fill-current" />
                                        <span>Ya, Jalankan Seleksi</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HASIL SELEKSI POPUP MODAL */}
            {seleksiResult && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Hasil Seleksi Otomatis Kuota
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {new Date(seleksiResult.waktuEksekusi).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSeleksiResult(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Ringkasan Angka */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Total Diproses
                                </div>
                                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {seleksiResult.ringkasan.totalDiproses}
                                </div>
                            </div>
                            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Lulus Kuota
                                </div>
                                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {seleksiResult.ringkasan.totalLulus}
                                </div>
                            </div>
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                    Cadangan
                                </div>
                                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                                    {seleksiResult.ringkasan.totalCadangan}
                                </div>
                            </div>
                        </div>

                        {/* Rincian per Jurusan */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Rekap Kelulusan Tiap Jurusan:
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {seleksiResult.detailPerJurusan.map((d, i) => (
                                    <div
                                        key={i}
                                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200">
                                                {d.jurusan}
                                            </div>
                                            <div className="text-[11px] text-slate-400 font-mono">
                                                Kuota: {d.kuotaMaksimal} kursi | Peserta: {d.totalPeserta} siswa
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                                                {d.lulus} Lulus
                                            </span>
                                            {d.cadangan > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold font-mono">
                                                    {d.cadangan} Cadangan
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setSeleksiResult(null)}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                            >
                                Selesai & Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
