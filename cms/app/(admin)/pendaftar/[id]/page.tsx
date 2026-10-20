'use client';

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Maximize2,
    FileText,
    Shield,
    Calendar,
    MapPin,
    Award,
    Save,
    AlertCircle,
    Loader2,
    X,
    User,
    Sparkles,
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders } from '@/lib/api';

const GisMapViewer = dynamic(() => import('@/components/GisMapViewer'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-80 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Memuat Peta Zonasi GIS...</span>
        </div>
    ),
});

interface ParsedIdCard {
    nik?: string;
    nomor_kk?: string;
    nama?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    gol_darah?: string;
    alamat?: string;
    rt_rw?: string;
    kel_desa?: string;
    kecamatan?: string;
    agama?: string;
    status_perkawinan?: string;
    pekerjaan?: string;
    kewarganegaraan?: string;
}

const parseOcrPayload = (raw: string | null): { text: string; parsed: ParsedIdCard | null } => {
    if (!raw) return { text: '', parsed: null };
    try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') {
            return {
                text: obj.text || (typeof obj === 'string' ? obj : ''),
                parsed: obj.parsed || null,
            };
        }
    } catch {
        // Raw plain text
    }
    return { text: raw, parsed: null };
};

interface DokumenItem {
    id: string;
    jenisDokumen: string;
    fileUrl: string;
    hasiltEkstraksi: string | null;
    status: 'VALID' | 'PENDING' | 'INVALID';
    createdAt: string;
}

interface DetailPendaftar {
    id: string;
    nomorPendaftaran: string | null;
    namaLengkap: string | null;
    nisn: string;
    nik: string;
    jenisKelamin: string | null;
    agama: string | null;
    tempatLahir: string | null;
    tanggalLahir: string | null;
    alamat: string | null;
    noHpWa: string | null;
    sekolahAsal: string | null;
    beratBadan: number | null;
    tinggiBadan: number | null;
    namaAyah: string | null;
    pekerjaanAyah: string | null;
    namaIbu: string | null;
    namaIbuKandung: string | null;
    pekerjaanIbu: string | null;
    alamatOrtu: string | null;
    noHpOrtu: string | null;
    namaWali: string | null;
    alamatWali: string | null;
    noHpWali: string | null;
    jurusan: string;
    ukuranBaju: string | null;
    ukuranBajuLainnya: string | null;
    intrakurikuler: string | null;
    ekstrakurikuler: string[];
    status: 'VALID' | 'PENDING' | 'INVALID';
    catatanVerifikasi: string | null;
    jadwalUjian: string | null;
    ruangUjian: string | null;
    buktiPembayaran: string | null;
    statusPembayaran: string | null;
    nilaiUjian: number | null;
    statusKelulusan: 'LULUS' | 'TIDAK_LULUS' | 'MENUNGGU' | null;
    latitude?: number | null;
    longitude?: number | null;
    createdAt: string;
    user?: { id: string; email: string; nama: string | null };
    dokumen: DokumenItem[];
}

function DetailPendaftarContent({ id }: { id: string }) {
    const router = useRouter();

    const [data, setData] = useState<DetailPendaftar | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Document inspection selection
    const [selectedDocIndex, setSelectedDocIndex] = useState(0);
    const [modalImage, setModalImage] = useState<string | null>(null);

    // Form states for verification
    const [statusVerifikasi, setStatusVerifikasi] = useState<'VALID' | 'INVALID' | 'PENDING'>('VALID');
    const [catatanVerifikasi, setCatatanVerifikasi] = useState('');
    const [savingVerifikasi, setSavingVerifikasi] = useState(false);

    // Form states for grading & exam
    const [nilaiUjian, setNilaiUjian] = useState<string>('');
    const [ruangUjian, setRuangUjian] = useState<string>('');
    const [jadwalUjian, setJadwalUjian] = useState<string>('');
    const [statusKelulusan, setStatusKelulusan] = useState<'LULUS' | 'TIDAK_LULUS' | 'MENUNGGU'>('MENUNGGU');
    const [savingNilai, setSavingNilai] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch(API_ENDPOINTS.ADMIN.DETAIL_PENDAFTAR(id), {
                headers: getAuthHeaders(),
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                router.push('/login?expired=1');
                return;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || 'Data pendaftar tidak ditemukan');
            }
            const result: DetailPendaftar = await res.json();
            setData(result);
            setStatusVerifikasi(result.status || 'PENDING');
            setCatatanVerifikasi(result.catatanVerifikasi || '');
            setNilaiUjian(result.nilaiUjian !== null && result.nilaiUjian !== undefined ? String(result.nilaiUjian) : '');
            setRuangUjian(result.ruangUjian || '');
            setJadwalUjian(result.jadwalUjian || '');
            setStatusKelulusan(result.statusKelulusan || 'MENUNGGU');
        } catch (err: any) {
            setErrorMsg(err.message || 'Gagal memuat detail data pendaftar');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    // Handle Document Verification Submit
    const handleSaveVerifikasi = async (overrideStatus?: 'VALID' | 'INVALID') => {
        const targetStatus = overrideStatus || statusVerifikasi;
        setSavingVerifikasi(true);
        setActionMsg(null);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.VERIFIKASI_DOKUMEN(id), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    status: targetStatus,
                    catatanVerifikasi: catatanVerifikasi.trim(),
                }),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || 'Gagal memverifikasi dokumen');

            setActionMsg({ type: 'success', text: `Status berkas berhasil diubah menjadi ${targetStatus}` });
            setStatusVerifikasi(targetStatus);
            fetchDetail();
        } catch (err: any) {
            setActionMsg({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
        } finally {
            setSavingVerifikasi(false);
        }
    };

    // Handle Grading & Exam Assignment
    const handleSaveNilai = async () => {
        setSavingNilai(true);
        setActionMsg(null);
        try {
            const payload: any = {
                statusKelulusan,
                ruangUjian: ruangUjian.trim() || undefined,
                jadwalUjian: jadwalUjian.trim() || undefined,
            };
            if (nilaiUjian !== '') {
                payload.nilaiUjian = parseFloat(nilaiUjian);
            }

            const res = await fetch(API_ENDPOINTS.ADMIN.INPUT_NILAI(id), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || 'Gagal menyimpan nilai & ruang ujian');

            setActionMsg({ type: 'success', text: 'Ruang ujian, jadwal, nilai, dan status kelulusan berhasil diperbarui.' });
            fetchDetail();
        } catch (err: any) {
            setActionMsg({ type: 'error', text: err.message || 'Gagal menyimpan nilai' });
        } finally {
            setSavingNilai(false);
        }
    };

    const getFullUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const clean = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${clean}`;
    };

    // SKELETON LOADING
    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-4 font-sans max-w-lg mx-auto my-12 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Gagal Memuat Detail Pendaftar</h3>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errorMsg}</p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={() => fetchDetail()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                        Coba Lagi
                    </button>
                    <Link href="/pendaftar" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition">
                        &larr; Kembali ke Daftar Pendaftar
                    </Link>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 font-sans">
                <p className="text-slate-400">Data pendaftar tidak ditemukan.</p>
                <Link href="/pendaftar" className="text-emerald-500 font-bold text-xs inline-block">
                    &larr; Kembali ke Daftar Pendaftar
                </Link>
            </div>
        );
    }

    const currentDoc = data.dokumen[selectedDocIndex] || null;
    const { text: rawDocText, parsed: parsedOcr } = parseOcrPayload(currentDoc?.hasiltEkstraksi || null);
    const nikMatch = (parsedOcr?.nik && parsedOcr.nik !== '-' && parsedOcr.nik === data.nik) || (rawDocText && rawDocText.includes(data.nik));

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Top Bar Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <Link
                        href="/pendaftar"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        title="Kembali ke Daftar Pendaftar"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {data.namaLengkap || data.user?.nama || 'Calon Siswa Baru'}
                            </h2>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                {data.nomorPendaftaran || 'REG-PENDING'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            NISN: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{data.nisn}</span> | Jurusan Pilihan: <strong className="text-slate-900 dark:text-slate-200">{data.jurusan}</strong>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {data.status === 'VALID' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>BERKAS VALID</span>
                        </span>
                    ) : data.status === 'INVALID' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/40">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>BERKAS DITOLAK</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                            <Clock className="w-3.5 h-3.5" />
                            <span>MENUNGGU VERIFIKASI</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Notification alert */}
            {actionMsg && (
                <div
                    className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${
                        actionMsg.type === 'success'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {actionMsg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span>{actionMsg.text}</span>
                    </div>
                    <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* SECTION 1: SIDE-BY-SIDE OCR VERIFICATION & DOCUMENT INSPECTION */}
            <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-500" />
                            <span>Pemeriksaan Berkas & Verifikasi AI OCR</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Periksa foto berkas asli (KK / SKL / Kartu Pelajar) dan bandingkan dengan ekstraksi NIK otomatis
                        </p>
                    </div>

                    {/* Document selector buttons */}
                    {data.dokumen.length > 1 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {data.dokumen.map((doc, idx) => (
                                <button
                                    key={doc.id}
                                    onClick={() => setSelectedDocIndex(idx)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                        selectedDocIndex === idx
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                                    }`}
                                >
                                    {doc.jenisDokumen}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {currentDoc ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LEFT: Gambar Dokumen Fisik */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    Berkas: <strong className="text-slate-900 dark:text-white">{currentDoc.jenisDokumen}</strong>
                                </span>
                                <button
                                    onClick={() => setModalImage(getFullUrl(currentDoc.fileUrl))}
                                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                    <span>Perbesar Gambar</span>
                                </button>
                            </div>

                            <div
                                onClick={() => setModalImage(getFullUrl(currentDoc.fileUrl))}
                                className="w-full h-80 sm:h-96 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-2 cursor-pointer group relative"
                            >
                                <img
                                    src={getFullUrl(currentDoc.fileUrl)}
                                    alt={`Dokumen ${currentDoc.jenisDokumen}`}
                                    className="max-w-full max-h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                        e.currentTarget.alt = 'File tidak dapat dimuat sebagai pratinjau gambar.';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                    <span className="px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-semibold flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Klik untuk Perbesar</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Hasil Ekstraksi OCR vs Data Registrasi */}
                        <div className="space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-emerald-500" />
                                        <span>Hasil Ekstraksi Lengkap AI OCR</span>
                                    </div>
                                    {nikMatch ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-full">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            <span>NIK Valid & Terverifikasi</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full">
                                            <AlertCircle className="w-3 h-3 text-amber-600" />
                                            <span>Periksa Mandiri</span>
                                        </span>
                                    )}
                                </div>

                                {/* Full Structured Identity Table */}
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 text-xs shadow-2xs">
                                    <div className="grid grid-cols-2 p-2.5 bg-slate-50/70 dark:bg-slate-900/40">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">NIK Terbaca AI:</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                {parsedOcr?.nik && parsedOcr.nik !== '-' ? parsedOcr.nik : (nikMatch ? data.nik : 'Tidak terdeteksi')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Kesesuaian NIK:</span>
                                            <span className={nikMatch ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500 font-semibold'}>
                                                {nikMatch ? '100% Cocok dengan Siswa' : 'Berbeda / Buram'}
                                            </span>
                                        </div>
                                    </div>

                                    {parsedOcr ? (
                                        <>
                                            <div className="grid grid-cols-2 p-2.5">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama di KTP/KK:</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                                        {parsedOcr.nama || '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama Terdaftar:</span>
                                                    <span className="text-slate-600 dark:text-slate-400">
                                                        {data.namaLengkap || data.user?.nama || '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 p-2.5 bg-slate-50/40 dark:bg-slate-900/20">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tempat & Tgl Lahir:</span>
                                                    <span className="text-slate-800 dark:text-slate-200">
                                                        {parsedOcr.tempat_lahir || '-'}, {parsedOcr.tanggal_lahir || '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Jenis Kelamin:</span>
                                                    <span className="text-slate-800 dark:text-slate-200">
                                                        {parsedOcr.jenis_kelamin || '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-2.5">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Alamat / RT-RW / Desa:</span>
                                                <span className="text-slate-800 dark:text-slate-200">
                                                    {parsedOcr.alamat !== '-' ? parsedOcr.alamat : ''} {parsedOcr.rt_rw !== '-' ? `RT/RW ${parsedOcr.rt_rw}` : ''} {parsedOcr.kel_desa !== '-' ? `Desa ${parsedOcr.kel_desa}` : ''} {parsedOcr.kecamatan !== '-' ? `Kec. ${parsedOcr.kecamatan}` : ''}
                                                    {parsedOcr.alamat === '-' && parsedOcr.rt_rw === '-' && parsedOcr.kel_desa === '-' ? '-' : ''}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 p-2.5 bg-slate-50/40 dark:bg-slate-900/20 text-[11px]">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Agama:</span>
                                                    <span>{parsedOcr.agama || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pekerjaan:</span>
                                                    <span>{parsedOcr.pekerjaan || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nomor KK:</span>
                                                    <span className="font-mono">{parsedOcr.nomor_kk || '-'}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : null}
                                </div>

                                {/* Raw OCR Text Container */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                        Teks Mentah Hasil Pemindaian OCR (OpenCV Enhanced):
                                    </label>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text shadow-inner">
                                        {rawDocText || '(Tidak ada teks terdeteksi atau berkas belum dipindai)'}
                                    </div>
                                </div>
                            </div>

                            {/* Verification Form Action Buttons */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Catatan Verifikasi Panitia:
                                    </label>
                                    <input
                                        type="text"
                                        value={catatanVerifikasi}
                                        onChange={(e) => setCatatanVerifikasi(e.target.value)}
                                        placeholder="Tuliskan catatan verifikasi (opsional)..."
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSaveVerifikasi('VALID')}
                                        disabled={savingVerifikasi}
                                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Terima (Valid)</span>
                                    </button>

                                    <button
                                        onClick={() => handleSaveVerifikasi('INVALID')}
                                        disabled={savingVerifikasi}
                                        className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>Tolak (Revisi)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                        Belum ada dokumen persyaratan yang diunggah oleh calon siswa.
                    </div>
                )}
            </div>

            {/* SECTION 2: PENGATURAN RUANG UJIAN, JADWAL, NILAI & KELULUSAN */}
            <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Award className="w-4 h-4 text-emerald-500" />
                            <span>Ruang Ujian, Jadwal, Nilai & Status Kelulusan</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Kelola ruang ujian offline (dikelola admin), masukkan nilai CBT, dan tetapkan kelulusan
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        data.statusKelulusan === 'LULUS'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : data.statusKelulusan === 'TIDAK_LULUS'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                        {data.statusKelulusan || 'MENUNGGU PENILAIAN'}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Ruang Ujian Seleksi *
                        </label>
                        <input
                            type="text"
                            list="ruang-presets"
                            value={ruangUjian}
                            onChange={(e) => setRuangUjian(e.target.value)}
                            placeholder="Contoh: Lab CBT Kampus 1"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                        <datalist id="ruang-presets">
                            <option value="Lab CBT 1 - Kampus Utama" />
                            <option value="Lab CBT 2 - Gedung Multimedia" />
                            <option value="Lab Komputer TKJ" />
                            <option value="Ruang CBT Mandiri" />
                        </datalist>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                            <span>Jadwal Ujian (Wajib Tanggal & Jam) *</span>
                        </label>
                        <input
                            type="text"
                            value={jadwalUjian}
                            onChange={(e) => setJadwalUjian(e.target.value)}
                            placeholder="Contoh: Senin, 18 Mei 2026 • 08:00 - 10:00 WIB"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                        <div className="flex gap-1.5 mt-1.5">
                            <button
                                type="button"
                                onClick={() => {
                                    const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                                    setJadwalUjian(`${todayStr} • 08:00 - 10:00 WIB`);
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer"
                            >
                                Sesi 1 (08:00)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                                    setJadwalUjian(`${todayStr} • 10:30 - 12:30 WIB`);
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer"
                            >
                                Sesi 2 (10:30)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                                    setJadwalUjian(`${todayStr} • 13:30 - 15:30 WIB`);
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer"
                            >
                                Sesi 3 (13:30)
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Nilai Ujian CBT (0 - 100)
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            step="0.1"
                            value={nilaiUjian}
                            onChange={(e) => setNilaiUjian(e.target.value)}
                            placeholder="Contoh: 85.5"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Keputusan Kelulusan
                        </label>
                        <select
                            value={statusKelulusan}
                            onChange={(e) => setStatusKelulusan(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="MENUNGGU">MENUNGGU (Belum Diputuskan)</option>
                            <option value="LULUS">LULUS (Diterima)</option>
                            <option value="TIDAK_LULUS">TIDAK LULUS</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSaveNilai}
                        disabled={savingNilai}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                        {savingNilai ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Simpan Ruang, Jadwal & Kelulusan</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* SECTION 3: BIODATA LENGKAP CALON SISWA */}
            <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                    Biodata Lengkap Calon Siswa
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    {/* Data Diri & Fisik */}
                    <div className="space-y-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-2 uppercase tracking-wide">
                            Identitas Calon Siswa
                        </span>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Nama Lengkap:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{data.namaLengkap || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">NISN / NIK:</span>
                            <span className="font-mono text-slate-800 dark:text-white">{data.nisn} / {data.nik}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Tempat, Tgl Lahir:</span>
                            <span className="text-slate-800 dark:text-white">{data.tempatLahir || '-'}, {data.tanggalLahir || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Jenis Kelamin / Agama:</span>
                            <span className="text-slate-800 dark:text-white">{data.jenisKelamin || '-'} / {data.agama || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">No. WhatsApp:</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{data.noHpWa || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Tinggi / Berat Badan:</span>
                            <span className="text-slate-800 dark:text-white">{data.tinggiBadan || '-'} cm / {data.beratBadan || '-'} kg</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-slate-400">Ukuran Seragam:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{data.ukuranBaju || '-'}</span>
                        </div>
                    </div>

                    {/* Data Orang Tua */}
                    <div className="space-y-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-2 uppercase tracking-wide">
                            Data Orang Tua / Wali
                        </span>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Nama Ayah:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{data.namaAyah || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Pekerjaan Ayah:</span>
                            <span className="text-slate-800 dark:text-white">{data.pekerjaanAyah || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Nama Ibu:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{data.namaIbu || data.namaIbuKandung || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Pekerjaan Ibu:</span>
                            <span className="text-slate-800 dark:text-white">{data.pekerjaanIbu || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">No. HP Orang Tua:</span>
                            <span className="font-mono text-slate-800 dark:text-white">{data.noHpOrtu || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-slate-400">Alamat Rumah:</span>
                            <span className="text-slate-800 dark:text-white text-right max-w-xs">{data.alamatOrtu || data.alamat || '-'}</span>
                        </div>
                    </div>

                    {/* Asal Sekolah & Minat */}
                    <div className="space-y-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-2 uppercase tracking-wide">
                            Akademik & Minat Bakat
                        </span>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Sekolah Asal:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{data.sekolahAsal || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Program Keahlian:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.jurusan}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Minat Intrakurikuler:</span>
                            <span className="text-slate-800 dark:text-white">{data.intrakurikuler || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-slate-400">Ekstrakurikuler:</span>
                            <span className="text-slate-800 dark:text-white text-right">
                                {data.ekstrakurikuler && data.ekstrakurikuler.length > 0
                                    ? data.ekstrakurikuler.join(', ')
                                    : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 4: PETA ZONASI & VISUALISASI TITIK KOORDINAT GIS */}
            <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <GisMapViewer
                    latitude={data.latitude}
                    longitude={data.longitude}
                    namaLengkap={data.namaLengkap || data.user?.nama}
                    alamat={data.alamat || data.alamatOrtu}
                />
            </div>

            {/* LIGHTBOX MODAL IMAGE VIEWER */}
            {modalImage && (
                <div
                    onClick={() => setModalImage(null)}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-4 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Pratinjau Gambar Dokumen
                            </h3>
                            <button
                                onClick={() => setModalImage(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-xl p-2">
                            <img
                                src={modalImage}
                                alt="Pratinjau Dokumen Penuh"
                                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                            />
                        </div>
                        <div className="flex justify-end">
                            <a
                                href={modalImage}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                            >
                                Buka di Tab Baru
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DetailPendaftarPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center py-20 font-sans">
                    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            }
        >
            <DetailPendaftarContent id={resolvedParams.id} />
        </Suspense>
    );
}
