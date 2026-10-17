'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    jadwalUjian: string;
    ruangUjian: string;
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
                <div className="text-4xl">📋</div>
                <h2 className="text-lg font-bold text-slate-800">Data Pendaftaran Belum Ditemukan</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Anda belum menyelesaikan pengisian data pendaftaran awal. Silakan isi data diri terlebih dahulu.
                </p>
                <Link
                    href="/dashboard/lengkapi-data"
                    className="inline-block px-5 py-2.5 bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                >
                    Isi Formulir Pendaftaran
                </Link>
            </div>
        );
    }

    const isVerified = data.status === 'VALID';
    const isRejected = data.status === 'INVALID';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Status Verifikasi Pendaftaran
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Pantau status berkas resmi dan jadwal ujian seleksi Anda
                    </p>
                </div>
                <button
                    onClick={fetchStatus}
                    className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1.5"
                >
                    <span>🔄 Perbarui Status</span>
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
                                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-600 text-white shadow-xs">
                                    ✓ Terverifikasi (Lolos Seleksi Berkas)
                                </span>
                            ) : isRejected ? (
                                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-600 text-white shadow-xs">
                                    ✕ Perlu Perbaikan / Ditolak
                                </span>
                            ) : (
                                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-500 text-white shadow-xs">
                                    ⏳ Menunggu Verifikasi Panitia
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
                                    ? 'Dokumen persyaratan dan identitas Anda telah cocok. Anda berhak mengikuti ujian seleksi offline dan mencetak Kartu Ujian.'
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
                                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                                >
                                    {downloadingForm ? 'Mengunduh...' : '📄 Unduh Ringkasan Formulir'}
                                </button>
                                <button
                                    onClick={handleDownloadKartuUjian}
                                    disabled={downloadingCard}
                                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition text-center flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300 disabled:opacity-60"
                                >
                                    {downloadingCard ? 'Mengunduh...' : '🖨️ Unduh Kartu Peserta Ujian'}
                                </button>
                            </>
                        ) : isRejected ? (
                            <Link
                                href="/dashboard/upload"
                                className="px-5 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition text-center"
                            >
                                📎 Unggah Ulang Berkas
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard/upload"
                                className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition text-center"
                            >
                                📎 Cek Kelengkapan Berkas
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid 2 Kolom Rincian */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kolom Kiri: Rincian Pendaftaran & Jadwal */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
                    <h3 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">
                        Rincian Peserta & Ujian Seleksi
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
                            <span className="text-slate-400 text-xs uppercase font-semibold">NIK:</span>
                            <span className="font-mono font-medium text-slate-800">{data.nik}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-400 text-xs uppercase font-semibold">Program Keahlian:</span>
                            <span className="font-semibold text-emerald-800 text-right max-w-xs">{data.jurusan}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-400 text-xs uppercase font-semibold">Jadwal Ujian:</span>
                            <span className="font-medium text-slate-800 text-right">{data.jadwalUjian || 'Senin, 18 Mei 2026 (08.00 WIB)'}</span>
                        </div>

                        <div className="flex justify-between py-1">
                            <span className="text-slate-400 text-xs uppercase font-semibold">Ruang Ujian:</span>
                            <span className="font-medium text-slate-800 text-right">{data.ruangUjian || 'Lab CBT Kampus 1'}</span>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Status Berkas Persyaratan */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
                    <h3 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between">
                        <span>Status Dokumen Persyaratan</span>
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
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                            📄
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{doc.jenisDokumen}</div>
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
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                ✓ Valid
                                            </span>
                                        ) : doc.status === 'INVALID' ? (
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                                ✕ Ditolak
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                ⏳ Menunggu
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-xs text-slate-400 space-y-3">
                                <p>Belum ada dokumen yang diunggah.</p>
                                <Link
                                    href="/dashboard/upload"
                                    className="inline-block px-4 py-2 bg-emerald-700 text-white font-semibold text-xs rounded-xl"
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
