'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    MapPin,
    QrCode,
    ArrowRight,
    Printer,
    Clock,
    FileCheck2,
    UserCheck,
    Eye,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';

interface PendaftaranInfo {
    nomorPendaftaran: string;
    namaLengkap: string;
    nisn: string;
    nik: string;
    jurusan: string;
    sekolahAsal: string;
    jadwalUjian?: string;
    ruangUjian?: string;
    status: 'PENDING' | 'VALID' | 'INVALID';
    catatanVerifikasi?: string;
    dokumen: Array<{
        id: string;
        jenisDokumen: string;
        status: string;
    }>;
}

export default function KartuUjianPage() {
    const [pendaftaran, setPendaftaran] = useState<PendaftaranInfo | null>(null);
    const [tahunAjaran, setTahunAjaran] = useState<string>('2026/2027');
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [paperMode, setPaperMode] = useState(false); // Toggle to view physical white paper format

    useEffect(() => {
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

        fetch(API_ENDPOINTS.PENDAFTARAN.STATUS, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.pendaftaranId) {
                    setPendaftaran(data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleDownloadPdf = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        setDownloading(true);
        setErrorMsg('');

        try {
            const res = await fetch(API_ENDPOINTS.PENDAFTARAN.KARTU_UJIAN, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Kartu-Ujian-PPDB-${pendaftaran?.nisn || 'MUSKA'}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const errData = await res.json().catch(() => ({}));
                setErrorMsg(errData.message || 'Gagal mengunduh kartu ujian. Pastikan status pendaftaran Anda Terverifikasi.');
            }
        } catch (err) {
            setErrorMsg('Terjadi kesalahan jaringan saat mengunduh file PDF.');
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // SKELETON LOADING
    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-24 bg-emerald-100/60 dark:bg-emerald-950/40 rounded-2xl"></div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mx-auto"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="md:col-span-2 space-y-3">
                            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded"></div>
                            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded"></div>
                            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded"></div>
                            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        </div>
                        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    const isVerified = pendaftaran?.status === 'VALID';

    return (
        <div className="space-y-6 font-sans pb-16 animate-in fade-in duration-300">
            {/* Header (Hidden on Print) */}
            <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Kartu Tanda Peserta Ujian Seleksi PPDB
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Kartu tanda pengenal resmi untuk mengikuti seleksi offline di SMK Muhammadiyah Sekampung
                    </p>
                </div>

                {isVerified && (
                    <div className="flex items-center gap-2">
                        {/* Paper Mode Toggle */}
                        <button
                            type="button"
                            onClick={() => setPaperMode(!paperMode)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Beralih antara tampilan kontras tema dan kertas fisik putih"
                        >
                            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{paperMode ? 'Mode Tema' : 'Mode Kertas Fisik'}</span>
                        </button>

                        {/* Print Button */}
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <Printer className="w-3.5 h-3.5 text-amber-300" />
                            <span className="hidden sm:inline">Cetak</span>
                        </button>
                    </div>
                )}
            </div>

            {errorMsg && (
                <div className="print:hidden p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Jika BELUM diverifikasi, tampilkan ALERT */}
            {!isVerified ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/50 p-6 sm:p-10 shadow-sm space-y-6">
                    <div className="p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-700">
                            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-300" />
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                Selesaikan verifikasi dokumen terlebih dahulu
                            </div>
                            <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                                Kartu peserta ujian seleksi hanya dapat diterbitkan dan diunduh setelah berkas persyaratan (Kartu Keluarga, SKL/Kartu Pelajar) berstatus <strong>Terverifikasi (Valid)</strong> oleh panitia SPMB SMK Muhammadiyah Sekampung.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-emerald-500/50 transition">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Langkah 1: Lengkapi Data Diri</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Pastikan NISN, NIK, pilihan jurusan, serta data orang tua telah terisi lengkap.
                            </p>
                            <Link
                                href="/dashboard/lengkapi-data"
                                className="inline-flex items-center gap-1 pt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                            >
                                <span>Periksa Biodata</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-emerald-500/50 transition">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                                <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Langkah 2: Unggah Berkas & Verifikasi</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Unggah scan/foto Kartu Keluarga (KK) dan SKL untuk diverifikasi oleh sistem OCR dan panitia.
                            </p>
                            <Link
                                href="/dashboard/upload"
                                className="inline-flex items-center gap-1 pt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                            >
                                <span>Unggah Dokumen Sekarang</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                /* Jika SUDAH diverifikasi, tampilkan tombol UNDUH & Pratinjau Kartu Ujian */
                <div className="space-y-6">
                    {/* Action Bar (Hidden on Print) */}
                    <div className="print:hidden p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                                <CheckCircle2 className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                                    <span>Status: RESMI TERVERIFIKASI</span>
                                    <span className="px-2 py-0.5 text-[10px] bg-emerald-200/80 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100 rounded-full font-mono">
                                        VALID
                                    </span>
                                </div>
                                <div className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                                    Kartu tanda peserta ujian resmi telah siap diunduh atau dicetak untuk ujian seleksi offline.
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                                onClick={handleDownloadPdf}
                                disabled={downloading}
                                className="w-full sm:w-auto px-5 py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Membuat File PDF...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 text-amber-300" />
                                        <span>Unduh PDF Resmi</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handlePrint}
                                className="px-4 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
                            >
                                <Printer className="w-4 h-4 text-amber-300" />
                                <span className="hidden sm:inline">Cetak</span>
                            </button>
                        </div>
                    </div>

                    {/* Preview Kartu Ujian (Interactive Preview with Clean Theme & Print Support) */}
                    <div
                        id="kartu-ujian-print-area"
                        className={`rounded-3xl border shadow-xl p-6 sm:p-10 max-w-3xl mx-auto space-y-6 transition-colors duration-200 ${
                            paperMode
                                ? 'bg-white text-slate-900 border-slate-300 shadow-2xl'
                                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-emerald-600/40 shadow-xl dark:shadow-2xl dark:shadow-black/70'
                        } print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:m-0`}
                    >
                        {/* Kop Kartu with Official Logo */}
                        <div
                            className={`pb-4 border-b-2 relative ${
                                paperMode
                                    ? 'border-emerald-800'
                                    : 'border-emerald-800 dark:border-emerald-500'
                            }`}
                        >
                            {/* Accent line top */}
                            <div className="h-1 bg-gradient-to-r from-emerald-700 via-amber-400 to-emerald-700 rounded-full mb-4"></div>

                            <div className="flex items-center gap-4 sm:gap-6">
                                {/* School Logo */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 p-1 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center">
                                    <img
                                        src="/logo.png"
                                        alt="Logo SMK Muhammadiyah Sekampung"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* School Details */}
                                <div className="flex-1 text-center sm:text-left min-w-0">
                                    <div
                                        className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${
                                            paperMode
                                                ? 'text-emerald-800'
                                                : 'text-emerald-800 dark:text-emerald-400'
                                        }`}
                                    >
                                        MAJELIS PENDIDIKAN DASAR DAN MENENGAH MUHAMMADIYAH
                                    </div>
                                    <h2
                                        className={`text-base sm:text-xl font-black tracking-tight uppercase leading-snug mt-0.5 ${
                                            paperMode
                                                ? 'text-slate-900'
                                                : 'text-slate-900 dark:text-white'
                                        }`}
                                    >
                                        SMK MUHAMMADIYAH SEKAMPUNG
                                    </h2>
                                    <div
                                        className={`text-[10px] sm:text-[11px] leading-tight mt-1 ${
                                            paperMode
                                                ? 'text-slate-600'
                                                : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        NPSN: 10806085 • Terakreditasi B • Kejuruan: TIK, Otomotif, Seni, Bisnis, Kuliner & Pemesinan
                                    </div>
                                    <div
                                        className={`text-[9px] sm:text-[10px] leading-tight mt-0.5 ${
                                            paperMode
                                                ? 'text-slate-500'
                                                : 'text-slate-500 dark:text-slate-400'
                                        }`}
                                    >
                                        Jl. Raya Sekampung No. 01, Kec. Sekampung, Kab. Lampung Timur 34382 • Telp/WA: 0812-3456-7890
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title Badge & Verification Ribbon */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                            <span className="inline-block px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-2xs">
                                KARTU TANDA PESERTA UJIAN SELEKSI SPMB TA {tahunAjaran}
                            </span>

                            <span
                                className={`text-[11px] font-mono font-bold px-3 py-1 rounded-lg border ${
                                    paperMode
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                }`}
                            >
                                NO. REG: {pendaftaran?.nomorPendaftaran || 'MUSKA-2026-PENDING'}
                            </span>
                        </div>

                        {/* Data Grid & Foto / QR Code */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                            {/* 2 Kolom Data */}
                            <div className="md:col-span-2 space-y-2.5 text-xs sm:text-sm">
                                <div
                                    className={`grid grid-cols-3 py-2 px-3 rounded-lg border-b ${
                                        paperMode
                                            ? 'border-slate-200 bg-slate-50/50'
                                            : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40'
                                    }`}
                                >
                                    <span
                                        className={`font-semibold ${
                                            paperMode
                                                ? 'text-slate-600'
                                                : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        Nama Peserta
                                    </span>
                                    <span
                                        className={`col-span-2 font-bold ${
                                            paperMode
                                                ? 'text-slate-900'
                                                : 'text-slate-900 dark:text-white'
                                        }`}
                                    >
                                        : {pendaftaran?.namaLengkap}
                                    </span>
                                </div>

                                <div
                                    className={`grid grid-cols-3 py-2 px-3 rounded-lg border-b ${
                                        paperMode
                                            ? 'border-slate-200 bg-slate-50/50'
                                            : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40'
                                    }`}
                                >
                                    <span
                                        className={`font-semibold ${
                                            paperMode
                                                ? 'text-slate-600'
                                                : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        NISN / NIK
                                    </span>
                                    <span
                                        className={`col-span-2 font-mono font-medium ${
                                            paperMode
                                                ? 'text-slate-800'
                                                : 'text-slate-800 dark:text-slate-200'
                                        }`}
                                    >
                                        : {pendaftaran?.nisn} / {pendaftaran?.nik}
                                    </span>
                                </div>

                                <div
                                    className={`grid grid-cols-3 py-2 px-3 rounded-lg border-b ${
                                        paperMode
                                            ? 'border-slate-200 bg-slate-50/50'
                                            : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40'
                                    }`}
                                >
                                    <span
                                        className={`font-semibold ${
                                            paperMode
                                                ? 'text-slate-600'
                                                : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        Sekolah Asal
                                    </span>
                                    <span
                                        className={`col-span-2 font-medium ${
                                            paperMode
                                                ? 'text-slate-800'
                                                : 'text-slate-800 dark:text-slate-200'
                                        }`}
                                    >
                                        : {pendaftaran?.sekolahAsal || '-'}
                                    </span>
                                </div>

                                <div
                                    className={`grid grid-cols-3 py-2 px-3 rounded-lg border-b ${
                                        paperMode
                                            ? 'border-slate-200 bg-slate-50/50'
                                            : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40'
                                    }`}
                                >
                                    <span
                                        className={`font-semibold ${
                                            paperMode
                                                ? 'text-slate-600'
                                                : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        Pilihan Jurusan
                                    </span>
                                    <span
                                        className={`col-span-2 font-bold ${
                                            paperMode
                                                ? 'text-emerald-800'
                                                : 'text-emerald-800 dark:text-emerald-400'
                                        }`}
                                    >
                                        : {pendaftaran?.jurusan}
                                    </span>
                                </div>

                                <div
                                    className={`grid grid-cols-3 py-2 px-3 rounded-lg border-b ${
                                        paperMode
                                            ? 'border-slate-200 bg-slate-50/50'
                                            : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40'
                                    }`}
                                >
                                    <span
                                        className={`font-semibold flex items-center gap-1.5 ${
                                            paperMode
                                                ? 'text-slate-600'
                                                : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Jadwal Ujian</span>
                                    </span>
                                    <span
                                        className={`col-span-2 font-semibold ${
                                            paperMode
                                                ? 'text-slate-900'
                                                : 'text-slate-900 dark:text-white'
                                        }`}
                                    >
                                        : {pendaftaran?.jadwalUjian || 'Menunggu penetapan panitia'}
                                    </span>
                                </div>

                                <div
                                    className={`grid grid-cols-3 py-2 px-3 rounded-lg ${
                                        paperMode
                                            ? 'bg-slate-50/50'
                                            : 'bg-slate-50/70 dark:bg-slate-800/40'
                                    }`}
                                >
                                    <span
                                        className={`font-semibold flex items-center gap-1.5 ${
                                            paperMode
                                                ? 'text-slate-600'
                                                : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Ruang Ujian</span>
                                    </span>
                                    <span className="col-span-2">
                                        : {pendaftaran?.ruangUjian ? (
                                            <span
                                                className={`font-bold px-2 py-0.5 rounded border text-xs ${
                                                    paperMode
                                                        ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                                        : 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800'
                                                }`}
                                            >
                                                {pendaftaran.ruangUjian}
                                            </span>
                                        ) : (
                                            <span
                                                className={`italic ${
                                                    paperMode
                                                        ? 'text-amber-700'
                                                        : 'text-amber-700 dark:text-amber-400'
                                                }`}
                                            >
                                                Ditetapkan oleh Panitia SPMB
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* 1 Kolom Pas Foto & QR Code */}
                            <div
                                className={`flex flex-col items-center justify-center gap-4 p-4 rounded-2xl border ${
                                    paperMode
                                        ? 'bg-slate-50 border-slate-200'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                                }`}
                            >
                                <div
                                    className={`w-28 h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-2 text-xs font-semibold ${
                                        paperMode
                                            ? 'border-slate-300 bg-white text-slate-500'
                                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-1 text-slate-400 dark:text-slate-500 text-xs">
                                        3×4
                                    </div>
                                    <span>Tempel Pas Foto 3x4 Resmi</span>
                                </div>

                                <div
                                    className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border text-center ${
                                        paperMode
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                                    }`}
                                >
                                    <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>QR TERVERIFIKASI SISTEM</span>
                                </div>
                            </div>
                        </div>

                        {/* Catatan / Tata Tertib */}
                        <div
                            className={`p-4 rounded-2xl border text-xs space-y-2 leading-relaxed ${
                                paperMode
                                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <div
                                className={`font-bold uppercase tracking-wider text-[11px] ${
                                    paperMode
                                        ? 'text-slate-900'
                                        : 'text-slate-900 dark:text-white'
                                }`}
                            >
                                TATA TERTIB UJIAN SELEKSI OFFLINE:
                            </div>
                            <ol className="list-decimal pl-4 space-y-1">
                                <li>Wajib membawa cetakan Kartu Peserta Ujian ini yang telah ditempel pas foto 3x4 berwarna.</li>
                                <li>Hadir di lokasi kampus SMK Muhammadiyah Sekampung paling lambat 15 menit sebelum ujian dimulai.</li>
                                <li>Mengenakan pakaian seragam sekolah asal (SMP/MTs) rapi, sopan, dan bersepatu.</li>
                                <li>Membawa alat tulis lengkap (pensil 2B, pulpen hitam, penghapus) dan kartu identitas siswa (Kartu Pelajar / KK).</li>
                            </ol>
                        </div>

                        {/* Tanda Tangan Panitia (Print Only or Preview Bottom) */}
                        <div className="pt-4 flex justify-between items-end text-xs">
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                Dicetak otomatis melalui Portal SPMB MUSKA
                            </div>
                            <div className="text-center space-y-8">
                                <div
                                    className={`font-medium ${
                                        paperMode
                                            ? 'text-slate-600'
                                            : 'text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    Sekampung, Panitia SPMB
                                </div>
                                <div
                                    className={`font-bold underline ${
                                        paperMode
                                            ? 'text-slate-900'
                                            : 'text-slate-900 dark:text-white'
                                    }`}
                                >
                                    Panitia SPMB MUSKA 2026
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
