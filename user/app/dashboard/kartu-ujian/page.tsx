'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CreditCard,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    MapPin,
    QrCode,
    FileText,
    ArrowRight,
    Printer,
    User,
    School,
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
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
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
                a.download = `Kartu-Ujian-PPDB-${pendaftaran?.nisn || 'Muska'}.pdf`;
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

    // SKELETON LOADING
    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-24 bg-emerald-100/60 rounded-2xl"></div>
                <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/3 mx-auto"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="md:col-span-2 space-y-3">
                            <div className="h-8 bg-slate-100 rounded"></div>
                            <div className="h-8 bg-slate-100 rounded"></div>
                            <div className="h-8 bg-slate-100 rounded"></div>
                            <div className="h-8 bg-slate-100 rounded"></div>
                        </div>
                        <div className="h-40 bg-slate-100 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    const isVerified = pendaftaran?.status === 'VALID';

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                    Kartu Tanda Peserta Ujian Seleksi PPDB
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Kartu identitas resmi untuk mengikuti ujian seleksi offline di SMK Muhammadiyah Sekampung
                </p>
            </div>

            {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Jika BELUM diverifikasi, tampilkan ALERT */}
            {!isVerified ? (
                <div className="bg-white rounded-3xl border border-amber-200 p-6 sm:p-10 shadow-xs space-y-6">
                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm font-bold uppercase tracking-wider text-amber-900">
                                Selesaikan verifikasi dokumen terlebih dahulu
                            </div>
                            <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
                                Kartu peserta ujian seleksi hanya dapat diterbitkan dan diunduh setelah berkas persyaratan (Kartu Keluarga, SKL/Kartu Pelajar) berstatus <strong>Terverifikasi (Valid)</strong> oleh panitia SPMB.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="text-xs font-bold uppercase text-slate-600">Langkah 1: Lengkapi Data Diri</div>
                            <p className="text-xs text-slate-500">
                                Pastikan NISN, NIK, dan data orang tua telah terisi lengkap.
                            </p>
                            <Link
                                href="/dashboard/lengkapi-data"
                                className="inline-flex items-center gap-1 pt-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                            >
                                <span>Periksa Biodata</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="text-xs font-bold uppercase text-slate-600">Langkah 2: Unggah Berkas & OCR</div>
                            <p className="text-xs text-slate-500">
                                Unggah foto Kartu Keluarga (KK) atau SKL untuk diverifikasi oleh sistem dan panitia.
                            </p>
                            <Link
                                href="/dashboard/upload"
                                className="inline-flex items-center gap-1 pt-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
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
                    {/* Action Bar */}
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-emerald-950">
                                    Status Anda: RESMI TERVERIFIKASI
                                </div>
                                <div className="text-xs text-emerald-800">
                                    Kartu ujian seleksi resmi telah siap dicetak untuk pelaksanaan ujian offline di sekolah.
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleDownloadPdf}
                            disabled={downloading}
                            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Membuat File PDF Kartu...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 text-amber-300" />
                                    <span>Unduh Kartu Ujian (PDF Resmi A4)</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview Kartu Ujian */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 max-w-3xl mx-auto space-y-6">
                        {/* Kop Kartu */}
                        <div className="text-center pb-4 border-b-2 border-emerald-800 relative">
                            <div className="h-1 bg-gradient-to-r from-emerald-700 via-amber-400 to-emerald-700 rounded-full mb-3"></div>
                            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                MAJELIS PENDIDIKAN DASAR DAN MENENGAH MUHAMMADIYAH
                            </div>
                            <div className="text-lg sm:text-xl font-black text-emerald-900 tracking-tight">
                                SMK MUHAMMADIYAH SEKAMPUNG
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                                Jl. Raya Sekampung No. 01, Kab. Lampung Timur • Telp/WA: 0812-3456-7890
                            </div>
                        </div>

                        {/* Title Badge */}
                        <div className="text-center">
                            <span className="inline-block px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-2xs">
                                KARTU TANDA PESERTA UJIAN SELEKSI PPDB TA 2026/2027
                            </span>
                        </div>

                        {/* Data Grid & Foto/QR */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            {/* 2 Kolom Data */}
                            <div className="md:col-span-2 space-y-3 text-xs sm:text-sm">
                                <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                                    <span className="text-slate-400 font-semibold">No. Registrasi</span>
                                    <span className="col-span-2 font-mono font-bold text-emerald-700">
                                        : {pendaftaran?.nomorPendaftaran}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                                    <span className="text-slate-400 font-semibold">Nama Peserta</span>
                                    <span className="col-span-2 font-bold text-slate-800">
                                        : {pendaftaran?.namaLengkap}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                                    <span className="text-slate-400 font-semibold">NISN / NIK</span>
                                    <span className="col-span-2 font-mono text-slate-700">
                                        : {pendaftaran?.nisn} / {pendaftaran?.nik}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                                    <span className="text-slate-400 font-semibold">Sekolah Asal</span>
                                    <span className="col-span-2 text-slate-700">
                                        : {pendaftaran?.sekolahAsal || '-'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                                    <span className="text-slate-400 font-semibold">Pilihan Jurusan</span>
                                    <span className="col-span-2 font-bold text-emerald-800">
                                        : {pendaftaran?.jurusan}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Jadwal Ujian</span>
                                    </span>
                                    <span className="col-span-2 font-semibold text-slate-800">
                                        : {pendaftaran?.jadwalUjian || 'Menunggu jadwal dari panitia'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 py-1">
                                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Ruang Ujian</span>
                                    </span>
                                    <span className="col-span-2 font-semibold text-slate-800">
                                        : {pendaftaran?.ruangUjian ? (
                                            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                {pendaftaran.ruangUjian}
                                            </span>
                                        ) : (
                                            <span className="text-amber-700 italic">Ditetapkan oleh Panitia PPDB</span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* 1 Kolom Pas Foto & QR Code */}
                            <div className="flex flex-col items-center justify-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <div className="w-24 h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-center p-2 text-[10px] text-slate-400 font-semibold">
                                    Tempel Pas Foto 3x4 di sini
                                </div>
                                <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-800 font-mono font-bold bg-emerald-100 px-2.5 py-1 rounded">
                                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>QR RESMI TERVERIFIKASI</span>
                                </div>
                            </div>
                        </div>

                        {/* Catatan / Tata Tertib */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                            <div className="font-bold text-slate-800">TATA TERTIB UJIAN SELEKSI OFFLINE:</div>
                            <ol className="list-decimal pl-4 space-y-0.5">
                                <li>Wajib membawa cetakan Kartu Peserta Ujian ini yang telah ditempel pas foto 3x4.</li>
                                <li>Hadir di lokasi ujian paling lambat 15 menit sebelum ujian seleksi dimulai.</li>
                                <li>Mengenakan pakaian seragam sekolah asal rapi dan bersepatu.</li>
                                <li>Membawa alat tulis lengkap (pensil 2B, pulpen hitam, penghapus).</li>
                            </ol>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
