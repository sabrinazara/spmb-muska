'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Edit3,
    UploadCloud,
    CheckCircle2,
    CreditCard,
    FileText,
    ArrowRight,
    Award,
    AlertCircle,
    Loader2,
    Clock,
    Building2,
    Sparkles,
    ShieldCheck,
    ChevronRight,
    Check,
    FileCheck,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';

interface DokumenItem {
    id: string;
    jenisDokumen: string;
    fileUrl: string;
    status: 'PENDING' | 'VALID' | 'INVALID';
    createdAt: string;
    hasiltEkstraksi?: string;
}

interface PendaftaranData {
    id: string;
    userId: string;
    nomorPendaftaran?: string;
    namaLengkap?: string;
    nisn: string;
    nik: string;
    jurusan: string;
    sekolahAsal?: string;
    status: 'PENDING' | 'VALID' | 'INVALID';
    catatanVerifikasi?: string;
    jadwalUjian?: string;
    ruangUjian?: string;
    createdAt: string;
    dokumen?: DokumenItem[];
    user?: {
        id: string;
        nama: string;
        email: string;
        role: string;
    };
}

export default function DashboardBeranda() {
    const [pendaftaran, setPendaftaran] = useState<PendaftaranData | null>(null);
    const [tahunAjaran, setTahunAjaran] = useState<string>('2026/2027');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch active tahunAjaran from public system setting
        fetch(API_ENDPOINTS.PENDAFTARAN.PENGUMUMAN)
            .then(res => res.json())
            .then(data => {
                if (data && data.tahunAjaran) {
                    setTahunAjaran(data.tahunAjaran);
                }
            })
            .catch(() => {});

        const token = localStorage.getItem('access_token');
        if (!token) return;

        fetch(API_ENDPOINTS.PENDAFTARAN.SAYA, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.id) {
                    setPendaftaran(data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const getJurusanName = (code?: string) => {
        const map: Record<string, string> = {
            'TKJ': 'Teknik Jaringan Komputer dan Telekomunikasi',
            'TSM': 'Teknik Otomotif (Teknik Sepeda Motor)',
            'TBSM': 'Teknik Otomotif (Teknik Sepeda Motor)',
            'TKR': 'Teknik Otomotif (Teknik Sepeda Motor)',
            'DKV': 'Desain Komunikasi Visual',
            'BDK': 'Bisnis Digital dan Kreatif',
            'BOGA': 'Kulineri (Tata Boga)',
            'TATA_RIAS': 'Kecantikan dan Tata Rias',
            'CNC': 'Teknik Pemesinan (CNC)',
            'LAS': 'Teknik Pengelasan (Welding)',
        };
        return (code && map[code]) || code || '-';
    };

    // Calculate Registration Progress
    const isBiodataComplete = Boolean(pendaftaran?.namaLengkap && pendaftaran?.sekolahAsal);
    const hasUploadedDocs = Boolean(pendaftaran?.dokumen && pendaftaran.dokumen.length > 0);
    const isVerified = pendaftaran?.status === 'VALID';
    const isExamReady = isVerified && Boolean(pendaftaran?.jadwalUjian);

    let progressPercentage = 20; // Step 1 is always completed upon account creation
    if (isBiodataComplete) progressPercentage += 20;
    if (hasUploadedDocs) progressPercentage += 20;
    if (isVerified) progressPercentage += 20;
    if (isExamReady) progressPercentage += 20;

    // SKELETON LOADING
    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="h-52 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Banner Utama */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold tracking-wide text-amber-200 mb-3">
                        Tahun Ajaran {tahunAjaran}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Selamat Datang, {pendaftaran?.namaLengkap || pendaftaran?.user?.nama || 'Calon Siswa'}!
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-emerald-100 leading-relaxed">
                        Pantau seluruh proses penerimaan siswa baru SMK Muhammadiyah Sekampung melalui panduan alur terpadu di bawah ini.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/dashboard/lengkapi-data"
                            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
                        >
                            <Edit3 className="w-4 h-4 text-slate-950" />
                            <span>{isBiodataComplete ? 'Lihat / Ubah Data' : 'Lengkapi Formulir Biodata'}</span>
                        </Link>
                        <Link
                            href="/dashboard/upload"
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-xs border border-white/20 transition inline-flex items-center gap-2 cursor-pointer"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload Dokumen Persyaratan</span>
                        </Link>
                    </div>
                </div>

                {/* Responsive Official School Emblem Watermark */}
                <div className="absolute -right-4 -bottom-4 sm:right-6 sm:top-1/2 sm:-translate-y-1/2 opacity-20 sm:opacity-25 pointer-events-none select-none">
                    <div className="w-28 h-28 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
                        <img
                            src="/logo.png"
                            alt="Logo SMK Muhammadiyah Sekampung"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* ALUR PENDAFTARAN SISWA (INFORMATIVE 5-STEP TRACKER) */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <span>Alur & Progres Pendaftaran Calon Siswa</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                {progressPercentage}% Selesai
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Ikuti seluruh tahapan berikut hingga penerbitan Kartu Ujian dan Pengumuman Kelulusan
                        </p>
                    </div>

                    <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* 5-Step Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    {/* Step 1: Registrasi Akun */}
                    <div className="p-4 rounded-xl border bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white uppercase tracking-wide">
                                    Tahap 01
                                </span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                                Akun Terdaftar
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                Akun calon siswa aktif dan terdaftar di server SPMB MUSKA.
                            </p>
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Selesai</span>
                        </div>
                    </div>

                    {/* Step 2: Formulir Biodata */}
                    <Link
                        href="/dashboard/lengkapi-data"
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition group cursor-pointer ${
                            isBiodataComplete
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400'
                                : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/80 hover:border-amber-400'
                        }`}
                    >
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                    isBiodataComplete ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                                }`}>
                                    Tahap 02
                                </span>
                                {isBiodataComplete ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                )}
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                Kelengkapan Biodata
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                {isBiodataComplete
                                    ? 'Biodata diri, orang tua, dan jurusan telah terisi.'
                                    : 'Isi biodata, ukuran seragam, dan pilihan jurusan.'}
                            </p>
                        </div>
                        <div className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                            isBiodataComplete ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                        }`}>
                            <span>{isBiodataComplete ? 'Lengkap (Klik Edit)' : 'Lengkapi Sekarang →'}</span>
                        </div>
                    </Link>

                    {/* Step 3: Unggah Berkas & OCR */}
                    <Link
                        href="/dashboard/upload"
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition group cursor-pointer ${
                            hasUploadedDocs
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400'
                                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                    >
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                    hasUploadedDocs ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}>
                                    Tahap 03
                                </span>
                                <UploadCloud className={`w-4 h-4 ${hasUploadedDocs ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                Unggah Berkas & OCR
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                {hasUploadedDocs
                                    ? `${pendaftaran?.dokumen?.length} dokumen berhasil diunggah.`
                                    : 'Upload foto KK, SKL, atau KIA untuk scan AI OCR.'}
                            </p>
                        </div>
                        <div className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                            hasUploadedDocs ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                            <span>{hasUploadedDocs ? 'Lihat Dokumen →' : 'Unggah Sekarang →'}</span>
                        </div>
                    </Link>

                    {/* Step 4: Validasi Berkas Panitia */}
                    <Link
                        href="/dashboard/status"
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition group cursor-pointer ${
                            pendaftaran?.status === 'VALID'
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400'
                                : pendaftaran?.status === 'INVALID'
                                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80 hover:border-rose-400'
                                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                    >
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                    pendaftaran?.status === 'VALID'
                                        ? 'bg-emerald-600 text-white'
                                        : pendaftaran?.status === 'INVALID'
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-amber-500 text-white'
                                }`}>
                                    Tahap 04
                                </span>
                                {pendaftaran?.status === 'VALID' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <Clock className="w-4 h-4 text-amber-500" />
                                )}
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                Verifikasi Panitia
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                {pendaftaran?.status === 'VALID'
                                    ? 'Seluruh berkas terverifikasi valid oleh panitia.'
                                    : pendaftaran?.status === 'INVALID'
                                    ? 'Perlu perbaikan berkas pendaftaran.'
                                    : 'Sedang diperiksa oleh tim panitia SPMB.'}
                            </p>
                        </div>
                        <div className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                            pendaftaran?.status === 'VALID'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : pendaftaran?.status === 'INVALID'
                                ? 'text-rose-700 dark:text-rose-400'
                                : 'text-amber-700 dark:text-amber-400'
                        }`}>
                            <span>Cek Status →</span>
                        </div>
                    </Link>

                    {/* Step 5: Kartu Ujian & Kelulusan */}
                    <Link
                        href={isVerified ? '/dashboard/kartu-ujian' : '/dashboard/status'}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition group cursor-pointer ${
                            isVerified
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400'
                                : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                    >
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                    isVerified ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}>
                                    Tahap 05
                                </span>
                                <CreditCard className={`w-4 h-4 ${isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                Kartu Ujian CBT
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                {isVerified
                                    ? 'Kartu peserta siap diunduh & dicetak.'
                                    : 'Terbuka otomatis setelah berkas dinyatakan VALID.'}
                            </p>
                        </div>
                        <div className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                            isVerified ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                        }`}>
                            <span>{isVerified ? 'Unduh Kartu →' : 'Menunggu Validasi'}</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Grid 2 Kolom: Detail Biodata & Status Verifikasi */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2 Kolom Kiri: Ringkasan Biodata & Dokumen */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ringkasan Biodata */}
                    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    Ringkasan Biodata Calon Siswa
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Data resmi yang tercatat di pangkalan data SPMB MUSKA
                                </p>
                            </div>
                            <Link
                                href="/dashboard/lengkapi-data"
                                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition"
                            >
                                Ubah / Lengkapi Data
                            </Link>
                        </div>

                        {pendaftaran ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        Nomor Registrasi
                                    </span>
                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {pendaftaran.nomorPendaftaran || 'Sedang Diproses Panitia'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        Nama Lengkap
                                    </span>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                        {pendaftaran.namaLengkap || pendaftaran.user?.nama || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        NISN (Nomor Induk Siswa Nasional)
                                    </span>
                                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                                        {pendaftaran.nisn}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        NIK (KK / KIA)
                                    </span>
                                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                                        {pendaftaran.nik}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        Sekolah Asal (SMP/MTs)
                                    </span>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                        {pendaftaran.sekolahAsal || 'Belum diisi'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        Pilihan Program Keahlian
                                    </span>
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                        {getJurusanName(pendaftaran.jurusan)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
                                Biodata Anda belum lengkap. Silakan klik tombol di bawah ini untuk mengisi formulir secara menyeluruh.
                                <div className="mt-3">
                                    <Link
                                        href="/dashboard/lengkapi-data"
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl inline-block transition"
                                    >
                                        Isi Formulir Kelengkapan Data
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ringkasan Dokumen */}
                    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    Dokumen Persyaratan & Verifikasi AI OCR
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Berkas digital yang telah diunggah untuk verifikasi
                                </p>
                            </div>
                            <Link
                                href="/dashboard/upload"
                                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition"
                            >
                                + Unggah Berkas
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {pendaftaran?.dokumen && pendaftaran.dokumen.length > 0 ? (
                                pendaftaran.dokumen.map(doc => (
                                    <div key={doc.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                                                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white">{doc.jenisDokumen}</div>
                                                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                                    Diunggah pada {new Date(doc.createdAt).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {doc.status === 'VALID' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>Terverifikasi (Valid)</span>
                                                </span>
                                            ) : doc.status === 'INVALID' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                                    <span>Perlu Perbaikan</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                    <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                                                    <span>Menunggu Verifikasi</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                                    Belum ada berkas yang diunggah. Unggah foto Kartu Keluarga (KK) atau SKL untuk verifikasi otomatis AI.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 1 Kolom Kanan: Status & Kartu Ujian & Pengumuman */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Status Pendaftaran</h3>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status Saat Ini:</div>
                            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                                {pendaftaran?.status === 'VALID'
                                    ? 'TERVERIFIKASI'
                                    : pendaftaran?.status === 'INVALID'
                                    ? 'DITOLAK / REVISI'
                                    : 'MENUNGGU VERIFIKASI'}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                {pendaftaran?.catatanVerifikasi ||
                                    'Berkas Anda sedang dalam proses pemeriksaan oleh tim panitia SPMB.'}
                            </p>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/dashboard/status"
                                className="w-full block text-center py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 border border-emerald-300 dark:border-emerald-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                            >
                                Lihat Rincian Status Lengkap
                            </Link>
                        </div>
                    </div>

                    {/* Pengumuman Kelulusan Banner Card */}
                    <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-xs border border-emerald-800">
                        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-2">
                            <Award className="w-4 h-4 text-amber-300" />
                            <span>Pengumuman Kelulusan</span>
                        </div>
                        <p className="text-xs text-emerald-100/90 leading-relaxed mb-4">
                            Cek status hasil kelulusan ujian seleksi PPDB SMK Muhammadiyah Sekampung secara online.
                        </p>
                        <Link
                            href="/dashboard/kelulusan"
                            className="w-full block text-center py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-emerald-950 transition shadow-sm"
                        >
                            Buka Pengumuman Hasil Seleksi
                        </Link>
                    </div>

                    {/* Kartu Ujian Box */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 p-6 shadow-xs">
                        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm mb-2">
                            <CreditCard className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                            <span>Kartu Peserta Ujian</span>
                        </div>
                        <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed mb-4">
                            {pendaftaran?.status === 'VALID'
                                ? 'Selamat! Berkas Anda telah terverifikasi. Unduh Kartu Tanda Peserta Ujian Offline sekarang.'
                                : 'Kartu Ujian dapat diunduh setelah seluruh dokumen persyaratan dinyatakan Terverifikasi (Valid).'}
                        </p>
                        <Link
                            href="/dashboard/kartu-ujian"
                            className={`w-full block text-center py-2.5 px-4 rounded-xl font-bold text-xs transition shadow-xs ${
                                pendaftaran?.status === 'VALID'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-amber-200/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200'
                            }`}
                        >
                            {pendaftaran?.status === 'VALID' ? 'Buka & Unduh Kartu Ujian' : 'Cek Syarat Kartu Ujian'}
                        </Link>
                    </div>

                    {/* Kontak Bantuan */}
                    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs text-xs space-y-2">
                        <div className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <span>Sekretariat SPMB MUSKA</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">SMK Muhammadiyah Sekampung, Kab. Lampung Timur</div>
                        <div className="text-slate-700 dark:text-slate-300 font-semibold">WA: 0812-3456-7890</div>
                        <div className="text-slate-400 dark:text-slate-500 text-[11px]">Senin - Sabtu: 08.00 - 15.00 WIB</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

