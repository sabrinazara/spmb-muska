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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            'TKJ': '1. Teknik Jaringan Komputer dan Telekomunikasi',
            'TKR': '2. Teknik Otomotif (Teknik Kendaraan Ringan)',
            'TBSM': '2. Teknik Otomotif (Teknik Sepeda Motor)',
            'DKV': '3. Desain Komunikasi Visual',
            'BDK': '4. Bisnis Digital dan Kreatif',
            'BOGA': '5. Kuliner (Tata Boga)',
            'TATA_RIAS': '6. Kecantikan dan Tata Rias',
            'CNC': '7. Teknik Pemesinan (CNC)',
            'LAS': '8. Teknik Pengelasan (Welding)',
        };
        return (code && map[code]) || code || '-';
    };

    // SKELETON LOADING
    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="h-56 bg-slate-200 rounded-3xl"></div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="h-20 bg-slate-200 rounded-2xl"></div>
                    <div className="h-20 bg-slate-200 rounded-2xl"></div>
                    <div className="h-20 bg-slate-200 rounded-2xl"></div>
                    <div className="h-20 bg-slate-200 rounded-2xl"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-72 bg-slate-200 rounded-2xl"></div>
                    <div className="h-72 bg-slate-200 rounded-2xl"></div>
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
                        Tahun Ajaran 2026/2027 • Pendaftaran Gratis
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Selamat Datang, {pendaftaran?.namaLengkap || pendaftaran?.user?.nama || 'Calon Siswa'}!
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-emerald-100 leading-relaxed">
                        Sistem Informasi Penerimaan Peserta Didik Baru (SPMB) Berbasis OCR dan AI Verifikasi SMK Muhammadiyah Sekampung.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/dashboard/lengkapi-data"
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
                        >
                            <Edit3 className="w-4 h-4 text-slate-900" />
                            <span>Lengkapi Formulir Data</span>
                        </Link>
                        <Link
                            href="/dashboard/upload"
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-xs border border-white/20 transition inline-flex items-center gap-2 cursor-pointer"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload Dokumen (KK/SKL)</span>
                        </Link>
                    </div>
                </div>

                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8 text-9xl font-black">
                    MUSKA
                </div>
            </div>

            {/* Tahapan Pendaftaran (4-Step Tracker) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Alur Proses Pendaftaran Anda
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                    {/* Step 1 */}
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                        <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                        </span>
                        <div>
                            <div className="text-[11px] text-emerald-700 font-semibold uppercase">Langkah 1</div>
                            <div className="text-sm font-bold">Akun Terdaftar</div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <Link
                        href="/dashboard/lengkapi-data"
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition ${
                            pendaftaran?.namaLengkap
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100'
                        }`}
                    >
                        <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                pendaftaran?.namaLengkap ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                            }`}
                        >
                            {pendaftaran?.namaLengkap ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                        </span>
                        <div>
                            <div className="text-[11px] font-semibold uppercase">Langkah 2</div>
                            <div className="text-sm font-bold">
                                {pendaftaran?.namaLengkap ? 'Biodata Lengkap' : 'Isi Biodata'}
                            </div>
                        </div>
                    </Link>

                    {/* Step 3 */}
                    <Link
                        href="/dashboard/upload"
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition ${
                            pendaftaran?.dokumen && pendaftaran.dokumen.length > 0
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                pendaftaran?.dokumen && pendaftaran.dokumen.length > 0
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-300 text-slate-700'
                            }`}
                        >
                            {pendaftaran?.dokumen && pendaftaran.dokumen.length > 0 ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                '3'
                            )}
                        </span>
                        <div>
                            <div className="text-[11px] font-semibold uppercase">Langkah 3</div>
                            <div className="text-sm font-bold">Upload Dokumen</div>
                        </div>
                    </Link>

                    {/* Step 4 */}
                    <Link
                        href="/dashboard/kartu-ujian"
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition ${
                            pendaftaran?.status === 'VALID'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                pendaftaran?.status === 'VALID' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                            }`}
                        >
                            {pendaftaran?.status === 'VALID' ? <CheckCircle2 className="w-4 h-4" /> : '4'}
                        </span>
                        <div>
                            <div className="text-[11px] font-semibold uppercase">Langkah 4</div>
                            <div className="text-sm font-bold">Unduh Kartu Ujian</div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Grid 2 Kolom: Detail Biodata & Status Verifikasi */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2 Kolom Kiri: Ringkasan Biodata */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-base font-bold text-slate-800">
                                    Ringkasan Biodata Calon Siswa
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Data resmi yang tercatat di pangkalan data SPMB MUSKA
                                </p>
                            </div>
                            <Link
                                href="/dashboard/lengkapi-data"
                                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                            >
                                Ubah / Lengkapi Data
                            </Link>
                        </div>

                        {pendaftaran ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Nomor Registrasi
                                    </span>
                                    <span className="font-mono font-bold text-emerald-700">
                                        {pendaftaran.nomorPendaftaran || 'Sedang Diproses'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Nama Lengkap
                                    </span>
                                    <span className="font-medium text-slate-800">
                                        {pendaftaran.namaLengkap || pendaftaran.user?.nama || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        NISN
                                    </span>
                                    <span className="font-mono font-medium text-slate-800">
                                        {pendaftaran.nisn}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        NIK (KK/KIA)
                                    </span>
                                    <span className="font-mono font-medium text-slate-800">
                                        {pendaftaran.nik}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Sekolah Asal
                                    </span>
                                    <span className="font-medium text-slate-800">
                                        {pendaftaran.sekolahAsal || 'Belum diisi'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Pilihan Program Keahlian
                                    </span>
                                    <span className="font-semibold text-emerald-800">
                                        {getJurusanName(pendaftaran.jurusan)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-sm text-slate-500">
                                Biodata Anda belum lengkap. Silakan klik tombol di bawah ini untuk mengisi formulir secara menyeluruh.
                                <div className="mt-3">
                                    <Link
                                        href="/dashboard/lengkapi-data"
                                        className="px-4 py-2 bg-emerald-700 text-white font-semibold text-xs rounded-xl inline-block"
                                    >
                                        Isi Formulir Kelengkapan Data
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ringkasan Dokumen */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-800">
                                    Dokumen Persyaratan & Verifikasi AI OCR
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Berkas digital yang telah diunggah untuk verifikasi
                                </p>
                            </div>
                            <Link
                                href="/dashboard/upload"
                                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                            >
                                + Unggah Berkas
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100 text-sm">
                            {pendaftaran?.dokumen && pendaftaran.dokumen.length > 0 ? (
                                pendaftaran.dokumen.map(doc => (
                                    <div key={doc.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                                <FileText className="w-4 h-4 text-emerald-700" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800">{doc.jenisDokumen}</div>
                                                <div className="text-[11px] text-slate-400">
                                                    Diunggah pada {new Date(doc.createdAt).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {doc.status === 'VALID' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>Terverifikasi (Valid)</span>
                                                </span>
                                            ) : doc.status === 'INVALID' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                                    <span>Perlu Perbaikan</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                    <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                                                    <span>Menunggu Verifikasi</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-xs text-slate-400">
                                    Belum ada berkas yang diunggah. Unggah foto Kartu Keluarga (KK) atau SKL untuk verifikasi otomatis AI.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 1 Kolom Kanan: Status & Kartu Ujian & Pengumuman */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <h3 className="text-sm font-bold text-slate-800 mb-3">Status Pendaftaran</h3>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                            <div className="text-xs text-slate-500 mb-1">Status Saat Ini:</div>
                            <div className="text-lg font-extrabold text-emerald-700">
                                {pendaftaran?.status === 'VALID'
                                    ? 'TERVERIFIKASI'
                                    : pendaftaran?.status === 'INVALID'
                                    ? 'DITOLAK / REVISI'
                                    : 'MENUNGGU VERIFIKASI'}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {pendaftaran?.catatanVerifikasi ||
                                    'Berkas Anda sedang dalam proses pemeriksaan oleh tim panitia SPMB.'}
                            </p>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/dashboard/status"
                                className="w-full block text-center py-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900 border border-emerald-300 rounded-xl hover:bg-emerald-50 transition"
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
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 p-6 shadow-xs">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
                            <CreditCard className="w-4 h-4 text-amber-700" />
                            <span>Kartu Peserta Ujian</span>
                        </div>
                        <p className="text-xs text-amber-800/80 leading-relaxed mb-4">
                            {pendaftaran?.status === 'VALID'
                                ? 'Selamat! Berkas Anda telah terverifikasi. Unduh Kartu Tanda Peserta Ujian Offline sekarang.'
                                : 'Kartu Ujian dapat diunduh setelah seluruh dokumen persyaratan dinyatakan Terverifikasi (Valid).'}
                        </p>
                        <Link
                            href="/dashboard/kartu-ujian"
                            className={`w-full block text-center py-2.5 px-4 rounded-xl font-bold text-xs transition shadow-xs ${
                                pendaftaran?.status === 'VALID'
                                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                    : 'bg-amber-200/70 text-amber-900 hover:bg-amber-200'
                            }`}
                        >
                            {pendaftaran?.status === 'VALID' ? 'Buka & Unduh Kartu Ujian' : 'Cek Syarat Kartu Ujian'}
                        </Link>
                    </div>

                    {/* Kontak Bantuan */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-xs space-y-2">
                        <div className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-emerald-700" />
                            <span>Sekretariat SPMB MUSKA</span>
                        </div>
                        <div className="text-slate-600">SMK Muhammadiyah Sekampung, Kab. Lampung Timur</div>
                        <div className="text-slate-600 font-semibold">WA: 0812-3456-7890</div>
                        <div className="text-slate-400 text-[11px]">Senin - Sabtu: 08.00 - 15.00 WIB</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
