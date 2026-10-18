'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    Download,
    FileText,
    CreditCard,
    UploadCloud,
    Calendar,
    MapPin,
    User,
    Award,
    Sparkles,
    ShieldCheck,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';

interface StatusData {
    pendaftaranId: string;
    nomorPendaftaran: string;
    status: 'PENDING' | 'VALID' | 'INVALID';
    catatanVerifikasi?: string;
    namaLengkap: string;
    nisn: string;
    nik: string;
    jurusan: string;
    jadwalUjian?: string;
    ruangUjian?: string;
    dokumenCount: number;
    dokumen: Array<{
        id: string;
        jenisDokumen: string;
        status: 'PENDING' | 'VALID' | 'INVALID';
        createdAt: string;
    }>;
    updatedAt: string;
}

export default function StatusPendaftaranPage() {
    const [data, setData] = useState<StatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingForm, setDownloadingForm] = useState(false);
    const [downloadingCard, setDownloadingCard] = useState(false);

    const fetchStatus = () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) return;

        fetch(API_ENDPOINTS.PENDAFTARAN.STATUS, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(resData => {
                if (resData && resData.pendaftaranId) {
                    setData(resData);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleDownloadFormulir = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        setDownloadingForm(true);
        try {
            const res = await fetch(API_ENDPOINTS.PENDAFTARAN.RINGKASAN_FORMULIR, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Ringkasan-Formulir-${data?.nisn || 'Muska'}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setDownloadingForm(false);
        }
    };

    const handleDownloadKartuUjian = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        setDownloadingCard(true);
        try {
            const res = await fetch(API_ENDPOINTS.PENDAFTARAN.KARTU_UJIAN, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Kartu-Ujian-${data?.nisn || 'Muska'}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setDownloadingCard(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    // SKELETON LOADING
    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-7 bg-slate-200 rounded-lg w-64"></div>
                        <div className="h-4 bg-slate-200 rounded w-48"></div>
                    </div>
                    <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
                </div>
                <div className="h-48 bg-slate-200 rounded-3xl"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-72 bg-slate-200 rounded-2xl"></div>
                    <div className="h-72 bg-slate-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 font-sans animate-in fade-in duration-300">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Data Pendaftaran Belum Ditemukan</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Anda belum menyelesaikan pengisian data pendaftaran awal. Silakan lengkapi data diri terlebih dahulu.
                </p>
                <Link
                    href="/dashboard/lengkapi-data"
                    className="inline-block px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                    Isi Formulir Pendaftaran
                </Link>
            </div>
        );
    }

    const isVerified = data.status === 'VALID';
    const isRejected = data.status === 'INVALID';

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                        Status Verifikasi Pendaftaran
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Pantau status berkas resmi dan jadwal ujian seleksi yang dikelola panitia PPDB
                    </p>
                </div>
                <button
                    onClick={fetchStatus}
                    className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Perbarui Status</span>
                </button>
            </div>

            {/* Status Hero Card */}
            <div
                className={`rounded-3xl p-6 sm:p-8 border shadow-xs transition-all ${
                    isVerified
                        ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-emerald-200 text-emerald-950'
                        : isRejected
                        ? 'bg-gradient-to-br from-rose-50 via-red-50 to-rose-100/60 border-rose-200 text-rose-950'
                        : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/60 border-amber-200 text-amber-950'
                }`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2">
                            {isVerified ? (
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-600 text-white shadow-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Terverifikasi (Lolos Seleksi Berkas)</span>
                                </span>
                            ) : isRejected ? (
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-600 text-white shadow-xs">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Perlu Perbaikan / Ditolak</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-500 text-white shadow-xs">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menunggu Verifikasi Panitia</span>
                                </span>
                            )}
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                            {isVerified
                                ? 'Selamat! Seluruh Berkas Anda Dinyatakan Sah'
                                : isRejected
                                ? 'Mohon Periksa dan Unggah Ulang Berkas Anda'
                                : 'Dokumen Anda Sedang Dalam Tahap Pemeriksaan'}
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-700 max-w-xl leading-relaxed">
                            {data.catatanVerifikasi ||
                                (isVerified
                                    ? 'Dokumen persyaratan dan identitas Anda telah valid. Anda dapat mencetak Kartu Tanda Peserta Ujian dan menghadiri ujian seleksi offline di sekolah.'
                                    : isRejected
                                    ? 'Terdapat ketidaksesuaian pada dokumen yang diunggah. Silakan unggah dokumen yang lebih jelas atau cocok dengan identitas diri Anda.'
                                    : 'Panitia SPMB dan sistem AI OCR sedang meninjau dokumen yang Anda unggah. Hasil verifikasi akan otomatis terbarui di halaman ini.')}
                        </p>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row gap-2.5 sm:text-right">
                        {isVerified ? (
                            <>
                                <button
                                    onClick={handleDownloadFormulir}
                                    disabled={downloadingForm}
                                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>{downloadingForm ? 'Mengunduh...' : 'Unduh Ringkasan Formulir'}</span>
                                </button>
                                <button
                                    onClick={handleDownloadKartuUjian}
                                    disabled={downloadingCard}
                                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition text-center flex items-center justify-center gap-2 cursor-pointer border border-amber-300 disabled:opacity-60"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    <span>{downloadingCard ? 'Mengunduh...' : 'Unduh Kartu Peserta Ujian'}</span>
                                </button>
                            </>
                        ) : isRejected ? (
                            <Link
                                href="/dashboard/upload"
                                className="px-5 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition text-center flex items-center justify-center gap-2"
                            >
                                <UploadCloud className="w-4 h-4" />
                                <span>Unggah Ulang Berkas</span>
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard/upload"
                                className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition text-center flex items-center justify-center gap-2"
                            >
                                <UploadCloud className="w-4 h-4" />
                                <span>Cek Kelengkapan Berkas</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid 2 Kolom Rincian */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kolom Kiri: Rincian Peserta & Ruang Ujian (Dikelola Admin) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
                    <h3 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-700" />
                        <span>Rincian Peserta & Ruang Ujian Seleksi</span>
                    </h3>

                    <div className="space-y-3.5 text-sm">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-400 text-xs uppercase font-semibold">Nomor Registrasi:</span>
                            <span className="font-mono font-bold text-emerald-700">{data.nomorPendaftaran}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-400 text-xs uppercase font-semibold">Nama Lengkap:</span>
                            <span className="font-medium text-slate-800">{data.namaLengkap}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-400 text-xs uppercase font-semibold">NISN:</span>
                            <span className="font-mono font-medium text-slate-800">{data.nisn}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-400 text-xs uppercase font-semibold">NIK (KK/KIA):</span>
                            <span className="font-mono font-medium text-slate-800">{data.nik}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-400 text-xs uppercase font-semibold">Program Keahlian:</span>
                            <span className="font-semibold text-emerald-800 text-right max-w-xs">{data.jurusan}</span>
                        </div>

                        {/* RUANG UJIAN (DIKELOLA OLEH ADMIN) */}
                        <div className="flex justify-between py-2 border-b border-slate-50 items-center">
                            <span className="text-slate-400 text-xs uppercase font-semibold flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                <span>Ruang Ujian:</span>
                            </span>
                            {data.ruangUjian ? (
                                <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                    {data.ruangUjian}
                                </span>
                            ) : (
                                <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 font-medium">
                                    Sedang dijadwalkan oleh Admin
                                </span>
                            )}
                        </div>

                        {/* JADWAL UJIAN (DIKELOLA OLEH ADMIN) */}
                        <div className="flex justify-between py-2 items-center">
                            <span className="text-slate-400 text-xs uppercase font-semibold flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                <span>Jadwal Ujian:</span>
                            </span>
                            {data.jadwalUjian ? (
                                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                                    {data.jadwalUjian}
                                </span>
                            ) : (
                                <span className="text-xs text-slate-500 italic">
                                    Menunggu penetapan panitia
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Status Berkas Persyaratan */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
                    <h3 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-700" />
                            <span>Status Dokumen Persyaratan</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                            {data.dokumen.length} Berkas Diunggah
                        </span>
                    </h3>

                    <div className="space-y-3">
                        {data.dokumen.length > 0 ? (
                            data.dokumen.map(doc => (
                                <div
                                    key={doc.id}
                                    className="p-3.5 rounded-xl border border-slate-200/90 flex items-center justify-between hover:bg-slate-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                                            <FileText className="w-4 h-4 text-emerald-700" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">
                                                {doc.jenisDokumen === 'KK'
                                                    ? 'Kartu Keluarga (KK)'
                                                    : doc.jenisDokumen === 'KIA_KARTU_PELAJAR'
                                                    ? 'Kartu Pelajar / KIA'
                                                    : doc.jenisDokumen === 'SKL_IJAZAH'
                                                    ? 'SKL / Ijazah SMP'
                                                    : doc.jenisDokumen === 'PAS_FOTO'
                                                    ? 'Pas Foto 3x4'
                                                    : doc.jenisDokumen}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                {new Date(doc.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {doc.status === 'VALID' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                <span>Valid</span>
                                            </span>
                                        ) : doc.status === 'INVALID' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                                <span>Ditolak</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                                                <span>Menunggu</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-xs text-slate-400 space-y-3">
                                <p>Belum ada berkas dokumen yang diunggah.</p>
                                <Link
                                    href="/dashboard/upload"
                                    className="inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition"
                                >
                                    Unggah Dokumen Sekarang
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
