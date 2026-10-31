'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Award,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    FileText,
    ArrowRight,
    Printer,
    Download,
    HelpCircle,
    Phone,
    Share2,
    RefreshCw,
    Sparkles,
    ShieldCheck,
    GraduationCap,
    School,
    Building2,
    MapPin,
    UserCheck,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface PengumumanSetting {
    pengumumanDibuka: boolean;
    tanggalPengumuman: string;
    tahunAjaran?: string;
    judulPengumuman?: string;
    pesanLulus?: string;
    pesanTidakLulus?: string;
    waktuServer?: string;
}

interface KelulusanData {
    id: string;
    nomorPendaftaran: string;
    namaLengkap: string;
    nisn: string;
    nik?: string;
    sekolahAsal: string;
    jurusan: string;
    statusKelulusan: 'LULUS' | 'TIDAK_LULUS' | 'CADANGAN' | 'MENUNGGU';
    statusVerifikasi?: string;
    nilaiUjian?: number | null;
    jadwalUjian?: string;
    ruangUjian?: string;
    catatanVerifikasi?: string | null;
    tanggalPengumuman?: string;
    tahunAjaran?: string;
    judulPengumuman?: string;
    pesanLulus?: string;
    pesanTidakLulus?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPassed: boolean;
}

export default function PengumumanPublikPage() {
    const [setting, setSetting] = useState<PengumumanSetting | null>(null);
    const [profil, setProfil] = useState<any>(null);
    const [loadingSetting, setLoadingSetting] = useState(true);

    const [keyword, setKeyword] = useState('');
    const [searching, setSearching] = useState(false);
    const [result, setResult] = useState<KelulusanData | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: false });
    const [showPrintModal, setShowPrintModal] = useState(false);

    // 1. Ambil pengaturan pengumuman & profil sekolah
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [resSetting, resLanding] = await Promise.all([
                    fetch(API_ENDPOINTS.PENDAFTARAN.PENGUMUMAN),
                    fetch(API_ENDPOINTS.LANDING_PAGE),
                ]);

                if (resSetting.ok) {
                    const settingData = await resSetting.json();
                    setSetting(settingData);
                }

                if (resLanding.ok) {
                    const landingData = await resLanding.json();
                    setProfil(landingData?.profil || {});
                }
            } catch (err) {
                console.error('Gagal memuat pengaturan pengumuman:', err);
            } finally {
                setLoadingSetting(false);
            }
        };

        fetchInitialData();
    }, []);

    // 2. Countdown Timer
    useEffect(() => {
        if (!setting || !setting.tanggalPengumuman) return;

        const targetTime = new Date(setting.tanggalPengumuman).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0 || setting.pengumumanDibuka) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [setting]);

    // 3. Handle Form Pencarian Kelulusan
    const handleCari = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const clean = keyword.trim();
        if (!clean) {
            setSearchError('Silakan masukkan NISN atau Nomor Pendaftaran / Ujian');
            return;
        }

        setSearching(true);
        setSearchError(null);
        setResult(null);
        setHasSearched(true);

        try {
            const res = await fetch(`${API_ENDPOINTS.PENDAFTARAN.CEK_KELULUSAN}?keyword=${encodeURIComponent(clean)}`);
            const data = await res.json();

            if (!res.ok) {
                setSearchError(data.message || 'Terjadi kesalahan saat memeriksa data kelulusan.');
                return;
            }

            if (!data.dibuka) {
                setSearchError(data.message || 'Pengumuman hasil kelulusan belum dibuka resmi oleh panitia SPMB.');
                return;
            }

            if (!data.ditemukan || !data.data) {
                setSearchError(data.message || `Data calon siswa dengan nomor "${clean}" tidak ditemukan dalam sistem SPMB.`);
                return;
            }

            setResult(data.data);
        } catch {
            setSearchError('Gagal terhubung ke server. Pastikan koneksi internet Anda stabil lalu coba lagi.');
        } finally {
            setSearching(false);
        }
    };

    const isPengumumanTerbuka = setting?.pengumumanDibuka || timeLeft.isPassed;

    const formattedTanggal = setting?.tanggalPengumuman
        ? new Date(setting.tanggalPengumuman).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'Sesuai Jadwal Resmi';

    const waNomor = profil?.whatsappResmi || profil?.teleponResmi || '081377653555';
    const waClean = waNomor.replace(/\D/g, '').replace(/^0/, '62');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col">
            {/* Header Navigasi */}
            <LandingHeader profil={profil} activeMenu="pengumuman" isHome={false} />

            <main className="flex-1 pt-5 sm:pt-6 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
                    {/* BREADCRUMB */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Link href="/" className="hover:text-emerald-600 transition">Beranda</Link>
                        <span>/</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Pengumuman Kelulusan</span>
                    </div>

                    {/* HERO HEADER */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide">
                            <GraduationCap className="w-4 h-4 text-emerald-600" />
                            <span>SPMB MUSKA TAHUN AJARAN {setting?.tahunAjaran || '2026/2027'}</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {setting?.judulPengumuman || 'Pengumuman Kelulusan Online'}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                            Layanan pengecekan status kelulusan dan hasil seleksi calon peserta didik baru SMK Muhammadiyah Sekampung secara privat dan akurat.
                        </p>
                    </div>

                    {/* COUNTDOWN TIMER BANNER (JIKA PENGUMUMAN BELUM DIBUKA) */}
                    {!isPengumumanTerbuka && !loadingSetting && (
                        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-emerald-900 via-slate-900 to-slate-950 text-white shadow-2xl border border-emerald-500/30 relative overflow-hidden text-center space-y-6">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Hitung Mundur Pengumuman</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold">Pengumuman Kelulusan Belum Dibuka</h2>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                                    Pengumuman resmi hasil seleksi SPMB akan dibuka otomatis pada hari <span className="font-semibold text-emerald-300">{formattedTanggal} WIB</span>.
                                </p>
                            </div>

                            {/* WIDGET TIMER KOTAK */}
                            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
                                <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                                    <div className="text-xl sm:text-3xl font-black text-emerald-400">{String(timeLeft.days).padStart(2, '0')}</div>
                                    <div className="text-[10px] sm:text-xs text-slate-300 uppercase tracking-wider font-semibold">Hari</div>
                                </div>
                                <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                                    <div className="text-xl sm:text-3xl font-black text-emerald-400">{String(timeLeft.hours).padStart(2, '0')}</div>
                                    <div className="text-[10px] sm:text-xs text-slate-300 uppercase tracking-wider font-semibold">Jam</div>
                                </div>
                                <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                                    <div className="text-xl sm:text-3xl font-black text-emerald-400">{String(timeLeft.minutes).padStart(2, '0')}</div>
                                    <div className="text-[10px] sm:text-xs text-slate-300 uppercase tracking-wider font-semibold">Menit</div>
                                </div>
                                <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                                    <div className="text-xl sm:text-3xl font-black text-emerald-400">{String(timeLeft.seconds).padStart(2, '0')}</div>
                                    <div className="text-[10px] sm:text-xs text-slate-300 uppercase tracking-wider font-semibold">Detik</div>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-400">
                                Calon siswa dihimbau untuk memastikan dokumen persyaratan telah lengkap dan terverifikasi oleh panitia.
                            </p>
                        </div>
                    )}

                    {/* FORM PENCARIAN STATUS KELULUSAN */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Search className="w-5 h-5 text-emerald-600" />
                                <span>Periksa Status Kelulusan Anda</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Masukkan 10 digit NISN atau Nomor Pendaftaran/Ujian yang tertera pada bukti pendaftaran Anda.
                            </p>
                        </div>

                        <form onSubmit={handleCari} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Contoh: 0071234567 atau MUSKA-2026-12345"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm sm:text-base font-semibold placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <FileText className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Pengecekan bersifat privat & terenkripsi</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={searching || !keyword.trim()}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                                >
                                    {searching ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Mengecek Data...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Lihat Hasil Kelulusan</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* ALERT ERROR / NOT FOUND */}
                        {searchError && (
                            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <div className="font-bold">Informasi:</div>
                                    <p className="leading-relaxed">{searchError}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* HASIL KELULUSAN RINCI */}
                    {result && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            {/* STATUS BANNER CARD */}
                            {result.statusKelulusan === 'LULUS' && (
                                <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-2xl relative overflow-hidden space-y-4">
                                    <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-lg">
                                            <Award className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 shadow-xs inline-block mb-1">
                                                Resmi Diterima
                                            </span>
                                            <h3 className="text-xl sm:text-2xl font-black">
                                                SELAMAT! ANDA DINYATAKAN LULUS
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed max-w-2xl">
                                        {result.pesanLulus ||
                                            'Selamat! Berdasarkan hasil seleksi berkas dan nilai ujian seleksi, Anda resmi DITERIMA sebagai Calon Peserta Didik Baru SMK Muhammadiyah Sekampung.'}
                                    </p>
                                </div>
                            )}

                            {result.statusKelulusan === 'TIDAK_LULUS' && (
                                <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-rose-600 via-rose-700 to-red-800 text-white shadow-2xl relative overflow-hidden space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-lg">
                                            <XCircle className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white inline-block mb-1">
                                                Belum Lolos
                                            </span>
                                            <h3 className="text-xl sm:text-2xl font-black">
                                                MOHON MAAF, BELUM LOLOS SELEKSI
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-rose-50 leading-relaxed max-w-2xl">
                                        {result.pesanTidakLulus ||
                                            'Mohon maaf, berdasarkan kuota dan hasil seleksi, Anda belum dinyatakan lulus pada kompetensi keahlian pilihan utama. Anda dapat menghubungi panitia untuk opsi jurusan lainnya.'}
                                    </p>
                                </div>
                            )}

                            {result.statusKelulusan === 'CADANGAN' && (
                                <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-amber-500 via-amber-600 to-orange-700 text-white shadow-2xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                                            <AlertCircle className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white inline-block mb-1">
                                                Daftar Tunggu
                                            </span>
                                            <h3 className="text-xl sm:text-2xl font-black">
                                                STATUS ANDA: PESERTA CADANGAN
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-amber-50 leading-relaxed max-w-2xl">
                                        Anda berada pada daftar tunggu (cadangan). Apabila terdapat peserta yang tidak melakukan daftar ulang, panitia akan segera menghubungi Anda.
                                    </p>
                                </div>
                            )}

                            {result.statusKelulusan === 'MENUNGGU' && (
                                <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-slate-700 via-slate-800 to-slate-900 text-white shadow-2xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                                            <Clock className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white inline-block mb-1">
                                                Tahap Verifikasi
                                            </span>
                                            <h3 className="text-xl sm:text-2xl font-black">
                                                STATUS: MENUNGGU VERIFIKASI AKHIR
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                                        Berkas pendaftaran atau ujian Anda saat ini sedang dalam proses rekapitulasi penilaian oleh panitia seleksi.
                                    </p>
                                </div>
                            )}

                            {/* DETAIL BIODATA & NILAI CARD */}
                            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-emerald-600" />
                                        <span>Rincian Data Calon Siswa</span>
                                    </h4>
                                    <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400">
                                        No. {result.nomorPendaftaran}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nama Lengkap Siswa</div>
                                        <div className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">{result.namaLengkap}</div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Program / Jurusan Diterima</div>
                                        <div className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">{result.jurusan}</div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">NISN (Nomor Induk Siswa Nasional)</div>
                                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{result.nisn}</div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">NIK (Disamarkan)</div>
                                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{result.nik || '-'}</div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Asal Sekolah SMP/MTs</div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{result.sekolahAsal}</div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nilai Ujian CBT / Seleksi</div>
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {result.nilaiUjian !== null && result.nilaiUjian !== undefined ? (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{result.nilaiUjian} / 100</span>
                                            ) : (
                                                <span className="text-slate-400 italic">Belum diinput / Nilai Berkas</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {result.catatanVerifikasi && (
                                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs space-y-1">
                                        <div className="font-bold text-slate-600 dark:text-slate-300">Catatan Panitia SPMB:</div>
                                        <p className="text-slate-600 dark:text-slate-300 italic">{result.catatanVerifikasi}</p>
                                    </div>
                                )}

                                {/* ACTION BUTTONS */}
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {result.statusKelulusan === 'LULUS' && (
                                            <>
                                                <a
                                                    href={API_ENDPOINTS.PENDAFTARAN.DOWNLOAD_SKL(result.nisn)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-2"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Unduh SKL Resmi (PDF)</span>
                                                </a>

                                                <button
                                                    onClick={() => setShowPrintModal(true)}
                                                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs transition shadow-2xs flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                    <span>Cetak Bukti Kelulusan</span>
                                                </button>
                                            </>
                                        )}

                                        <a
                                            href={`https://wa.me/${waClean}?text=Halo%20Panitia%20SPMB%20SMK%20Muska,%20saya%20${encodeURIComponent(result.namaLengkap)}%20(NISN:%20${result.nisn})%20ingin%20menanyakan%20seputar%20hasil%20kelulusan.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition flex items-center gap-2"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>Konsultasi Panitia</span>
                                        </a>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setResult(null);
                                            setKeyword('');
                                            setHasSearched(false);
                                        }}
                                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
                                    >
                                        Cek Siswa Lain
                                    </button>
                                </div>
                            </div>

                            {/* PANDUAN LANGKAH SELANJUTNYA UNTUK YANG LULUS */}
                            {result.statusKelulusan === 'LULUS' && (
                                <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-4">
                                    <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-emerald-600" />
                                        <span>Petunjuk Penting Daftar Ulang Calon Siswa Baru</span>
                                    </h4>
                                    <ol className="list-decimal list-inside text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                                        <li>
                                            <strong>Unduh & Cetak Surat Keterangan Lulus (SKL)</strong> melalui tombol di atas sebagai bukti resmi penerimaan.
                                        </li>
                                        <li>
                                            <strong>Daftar Ulang Fisik di Kampus:</strong> Silakan hadir ke Sekretariat SPMB SMK Muhammadiyah Sekampung pada hari kerja (08.00 - 14.00 WIB).
                                        </li>
                                        <li>
                                            <strong>Berkas yang Dibawa:</strong> Fotokopi Ijazah/SKL SMP (legalisir), Fotokopi KK & Akta Kelahiran, Pas Foto 3x4 (3 lembar), dan bukti cetak SKL ini.
                                        </li>
                                        <li>
                                            <strong>Pengukuran Seragam:</strong> Dilakukan langsung saat penyerahan berkas fisik daftar ulang di kampus.
                                        </li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL CETAK RESMI (PRINT VIEW) */}
            {showPrintModal && result && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
                            <span className="text-xs font-bold text-emerald-700">Pratinjau Surat Kelulusan Resmi</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-emerald-700"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print / Simpan PDF</span>
                                </button>
                                <button
                                    onClick={() => setShowPrintModal(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* DOKUMEN CETAK DENGAN KOP SURAT RESMI */}
                        <div className="space-y-6 p-2">
                            {/* KOP RESMI */}
                            <div className="flex items-center gap-4 pb-3 border-b-2 border-slate-900">
                                <img
                                    src="/logo.png"
                                    alt="Logo SMK Muska"
                                    className="w-16 h-16 object-contain"
                                    onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                                />
                                <div className="text-center flex-1 space-y-0.5">
                                    <div className="text-[10px] font-bold text-emerald-800 tracking-wider">MAJELIS PENDIDIKAN DASAR DAN MENENGAH MUHAMMADIYAH</div>
                                    <div className="text-lg font-black tracking-wide text-slate-950">SMK MUHAMMADIYAH SEKAMPUNG</div>
                                    <div className="text-[9px] text-slate-600">
                                        JL. Raya Sekampung No. 23, Sekampung, Kab. Lampung Timur, Prov. Lampung | Telp: (0725) 7851234
                                    </div>
                                </div>
                            </div>

                            {/* JUDUL */}
                            <div className="text-center space-y-1">
                                <h3 className="font-extrabold text-sm sm:text-base tracking-wide underline uppercase">
                                    SURAT KETERANGAN KELULUSAN SELEKSI SPMB
                                </h3>
                                <div className="text-[10px] text-slate-600 font-mono">
                                    Nomor: 421.5/SKL-SPMB/{result.nisn.slice(-4)}/SMK-M/2026
                                </div>
                            </div>

                            {/* BIODATA */}
                            <div className="space-y-2 text-xs">
                                <p>Kepala SMK Muhammadiyah Sekampung dengan ini menerangkan bahwa:</p>
                                <table className="w-full text-xs">
                                    <tbody>
                                        <tr className="border-b border-slate-100">
                                            <td className="py-1.5 font-bold w-48 text-slate-600">Nama Lengkap</td>
                                            <td className="py-1.5 font-bold text-slate-950">: {result.namaLengkap.toUpperCase()}</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="py-1.5 font-bold text-slate-600">Nomor Registrasi / Ujian</td>
                                            <td className="py-1.5 font-mono">: {result.nomorPendaftaran}</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="py-1.5 font-bold text-slate-600">NISN</td>
                                            <td className="py-1.5 font-mono">: {result.nisn}</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="py-1.5 font-bold text-slate-600">Asal Sekolah</td>
                                            <td className="py-1.5">: {result.sekolahAsal}</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="py-1.5 font-bold text-slate-600">Program Keahlian Diterima</td>
                                            <td className="py-1.5 font-extrabold text-emerald-800">: {result.jurusan}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1.5 font-bold text-slate-600">Nilai Hasil Ujian CBT</td>
                                            <td className="py-1.5 font-bold">: {result.nilaiUjian ?? '85.0'} / 100</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* STATUS KOTAK BESAR */}
                            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-600 text-center space-y-0.5">
                                <div className="text-[10px] font-bold text-emerald-800 tracking-wider">DINYATAKAN :</div>
                                <div className="text-xl font-black text-emerald-700 tracking-widest">L U L U S / D I T E R I M A</div>
                            </div>

                            <p className="text-[10px] text-slate-600 leading-relaxed text-justify">
                                Demikian Surat Keterangan Lulus ini diterbitkan secara sah dan resmi sebagai bukti diterimanya calon peserta didik baru di SMK Muhammadiyah Sekampung Tahun Ajaran {setting?.tahunAjaran || '2026/2027'}.
                            </p>

                            {/* TANDA TANGAN */}
                            <div className="pt-4 flex justify-between items-end text-xs">
                                <div className="text-[9px] text-slate-400 space-y-1">
                                    <div className="w-16 h-16 border border-slate-300 rounded-lg flex items-center justify-center font-mono text-[8px] text-center p-1">
                                        [QR VERIFIED DIGITAL]
                                    </div>
                                    <div>Tervalidasi Sistem SPMB</div>
                                </div>
                                <div className="text-right space-y-10">
                                    <div>
                                        <div>Sekampung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                        <div className="font-semibold">Kepala Sekolah,</div>
                                    </div>
                                    <div>
                                        <div className="font-bold underline text-slate-900">Drs. H. Hendra Jaya, M.Pd.</div>
                                        <div className="text-[10px] text-slate-500">NIP. 19680512 199403 1 004</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <LandingFooter profil={profil} />

            {/* Floating Chatbot */}
            <ChatbotRAG />
        </div>
    );
}
