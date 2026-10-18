'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Award,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    FileCheck,
    CreditCard,
    MapPin,
    HeartHandshake,
    Sparkles,
    Printer,
    Download,
    X,
    HelpCircle,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';

interface PengumumanSetting {
    dibuka: boolean;
    tanggalPengumuman: string;
    tahunAjaran?: string;
}

interface StudentData {
    id: string;
    namaLengkap: string;
    nisn: string;
    nik: string;
    jurusan: string;
    nilaiUjian?: number;
    statusKelulusan?: 'LULUS' | 'TIDAK_LULUS' | 'MENUNGGU';
    nomorPendaftaran: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPassed: boolean;
}

export default function PengumumanKelulusanPage() {
    const [setting, setSetting] = useState<PengumumanSetting | null>(null);
    const [student, setStudent] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: false });
    const [showPassedModal, setShowPassedModal] = useState(false);
    const [showFailedModal, setShowFailedModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        try {
            // 1. Fetch pengumuman setting
            const resSetting = await fetch(API_ENDPOINTS.PENDAFTARAN.PENGUMUMAN);
            if (resSetting.ok) {
                const settingData = await resSetting.json();
                setSetting(settingData);
            }

            // 2. Fetch student status
            if (token) {
                const resStudent = await fetch(API_ENDPOINTS.PENDAFTARAN.SAYA, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (resStudent.ok) {
                    const studentData = await resStudent.json();
                    setStudent(studentData);
                }
            }
        } catch (e) {
            console.error('Error fetching announcement data:', e);
        } finally {
            setLoading(false);
        }
    };

    // Countdown Timer logic
    useEffect(() => {
        if (!setting || !setting.tanggalPengumuman) return;

        const targetTime = new Date(setting.tanggalPengumuman).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0 || setting.dibuka) {
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

    // Auto open popup when announcement is open
    useEffect(() => {
        if (!loading && setting && (setting.dibuka || timeLeft.isPassed) && student) {
            if (student.statusKelulusan === 'LULUS') {
                setShowPassedModal(true);
            } else if (student.statusKelulusan === 'TIDAK_LULUS') {
                setShowFailedModal(true);
            }
        }
    }, [loading, setting, timeLeft.isPassed, student]);

    // SKELETON LOADING
    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-64 bg-slate-200 rounded-3xl"></div>
                <div className="h-40 bg-slate-200 rounded-2xl"></div>
            </div>
        );
    }

    const isAnnouncementOpen = setting?.dibuka || timeLeft.isPassed;
    const formattedDate = setting?.tanggalPengumuman
        ? new Date(setting.tanggalPengumuman).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '20 Juni 2026';

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                    Pengumuman Hasil Kelulusan Seleksi PPDB
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Sistem resmi pengumuman kelulusan calon siswa baru SMK Muhammadiyah Sekampung Tahun Ajaran {setting?.tahunAjaran || '2026/2027'}
                </p>
            </div>

            {/* JIKA PENGUMUMAN BELUM DIBUKA -> TAMPILKAN WAKTU HITUNG MUNDUR (COUNTDOWN) */}
            {!isAnnouncementOpen ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-center">
                    <div className="max-w-xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>Menghitung Mundur Hari H Pengumuman</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                            Pengumuman Kelulusan Belum Dibuka
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Hasil ujian seleksi penerimaan siswa baru akan diumumkan secara serentak pada:
                            <br />
                            <strong className="text-emerald-800 font-semibold">{formattedDate} WIB</strong>.
                        </p>
                    </div>

                    {/* COUNTDOWN TIMER CARDS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        {/* Days */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
                            <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-mono">
                                {String(timeLeft.days).padStart(2, '0')}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                Hari
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
                            <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-mono">
                                {String(timeLeft.hours).padStart(2, '0')}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                Jam
                            </div>
                        </div>

                        {/* Minutes */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
                            <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-mono">
                                {String(timeLeft.minutes).padStart(2, '0')}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                Menit
                            </div>
                        </div>

                        {/* Seconds */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
                            <div className="text-3xl sm:text-4xl font-black text-amber-600 font-mono">
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                Detik
                            </div>
                        </div>
                    </div>

                    {/* Note Box */}
                    <div className="max-w-xl mx-auto p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-left flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <span className="font-bold">Informasi Peserta:</span>
                            <p className="text-emerald-800/90 leading-relaxed">
                                Pastikan berkas dokumen Anda telah terverifikasi dan Anda telah mengikuti ujian seleksi CBT sesuai jadwal yang ditetapkan. Halaman ini akan otomatis memperbarui status Anda saat waktu pengumuman tiba.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* JIKA PENGUMUMAN SUDAH DIBUKA */
                <div className="space-y-6">
                    {/* HASIL: LULUS */}
                    {student?.statusKelulusan === 'LULUS' && (
                        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 border border-emerald-600">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-amber-400 text-emerald-950 shadow-md">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>DINYATAKAN LULUS SELEKSI</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                        Selamat! Anda Diterima di SMK Muhammadiyah Sekampung
                                    </h2>
                                    <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
                                        Selamat kepada Ananda <strong className="text-amber-300 font-bold">{student.namaLengkap}</strong> atas keberhasilannya dalam rangkaian seleksi PPDB TA {setting?.tahunAjaran || '2026/2027'}.
                                    </p>
                                </div>

                                <div className="shrink-0 flex flex-col gap-2.5">
                                    <button
                                        onClick={() => setShowPassedModal(true)}
                                        className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <FileCheck className="w-4 h-4 text-emerald-950" />
                                        <span>Panduan Daftar Ulang Offline</span>
                                    </button>
                                </div>
                            </div>

                            {/* Info Siswa & Nilai */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-emerald-600/60 text-xs">
                                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
                                    <span className="text-emerald-200 text-[10px] uppercase font-bold tracking-wider">Program Keahlian Diterima:</span>
                                    <div className="text-sm font-bold text-white mt-1">{student.jurusan}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
                                    <span className="text-emerald-200 text-[10px] uppercase font-bold tracking-wider">Nomor Registrasi / NISN:</span>
                                    <div className="text-sm font-bold text-white mt-1 font-mono">{student.nomorPendaftaran} / {student.nisn}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
                                    <span className="text-emerald-200 text-[10px] uppercase font-bold tracking-wider">Nilai Ujian Seleksi CBT:</span>
                                    <div className="text-sm font-bold text-amber-300 mt-1 font-mono">{student.nilaiUjian ?? '85.00'} / 100</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HASIL: TIDAK LULUS */}
                    {student?.statusKelulusan === 'TIDAK_LULUS' && (
                        <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-10 shadow-xs space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-100 text-rose-800 border border-rose-200">
                                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Pemberitahuan Hasil Seleksi</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                                        Mohon Maaf, Anda Belum Memenuhi Kriteria Kelulusan
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                                        Terima kasih kepada Ananda <strong className="text-slate-800">{student.namaLengkap}</strong> yang telah berpartisipasi dalam ujian seleksi PPDB SMK Muhammadiyah Sekampung. Jangan patah semangat!
                                    </p>
                                </div>

                                <div className="shrink-0">
                                    <button
                                        onClick={() => setShowFailedModal(true)}
                                        className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <HeartHandshake className="w-4 h-4 text-rose-300" />
                                        <span>Pesan Semangat & Informasi</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed">
                                <span className="font-bold text-slate-800">Catatan Panitia:</span>
                                <p className="mt-1">
                                    Kuota pada Program Keahlian <strong>{student.jurusan}</strong> telah terpenuhi berdasarkan pemeringkatan nilai seleksi. Anda dapat berkonsultasi dengan panitia PPDB terkait pembukaan gelombang susulan atau rekomendasi jurusan yang masih tersedia.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* HASIL: MENUNGGU PENILAIAN */}
                    {(!student?.statusKelulusan || student.statusKelulusan === 'MENUNGGU') && (
                        <div className="bg-white rounded-3xl border border-amber-200 p-6 sm:p-10 shadow-xs space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                <span>Hasil Dalam Proses Rekapitulasi</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Penilaian Ujian Seleksi Sedang Difinalisasi
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                                Tim penguji dan panitia PPDB sedang memverifikasi nilai ujian seleksi Anda. Mohon tunggu beberapa saat dan segarkan halaman ini secara berkala.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* POPUP MODAL 1: LULUS (PANDUAN DAFTAR ULANG OFFLINE) */}
            {showPassedModal && (
                <div
                    onClick={() => setShowPassedModal(false)}
                    className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                                    <Award className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-slate-800">
                                        Instruksi Daftar Ulang Calon Siswa Baru
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        SMK Muhammadiyah Sekampung • TA {setting?.tahunAjaran || '2026/2027'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPassedModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Banner Informatif */}
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                <span>Pendaftaran Awal Gratis — Daftar Ulang Dilakukan Offline di Sekolah</span>
                            </div>
                            <p className="text-emerald-800/90 leading-relaxed">
                                Calon siswa/i yang dinyatakan LULUS diwajibkan hadir langsung ke sekolah bersama orang tua/wali untuk verifikasi berkas asli dan pengukuran seragam sekolah.
                            </p>
                        </div>

                        {/* Berkas yang Wajib Dibawa */}
                        <div className="space-y-3">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Berkas Fisik yang Wajib Dibawa ke Sekolah:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                                    <FileCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                    <span>Fotokopi Kartu Keluarga (KK) 2 lembar</span>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                                    <FileCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                    <span>Fotokopi Akta Kelahiran 2 lembar</span>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                                    <FileCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                    <span>SKL Asli atau Ijazah SMP legalisir</span>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                                    <FileCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                    <span>Pas Foto 3x4 berwarna (4 lembar)</span>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 sm:col-span-2">
                                    <Printer className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                    <span>Cetakan Kartu Peserta Ujian & Formulir Pendaftaran PPDB</span>
                                </div>
                            </div>
                        </div>

                        {/* Lokasi & Loket */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-emerald-700" />
                                <span>Lokasi & Jadwal Pelayanan Daftar Ulang:</span>
                            </div>
                            <p>
                                <strong>Kampus 1 SMK Muhammadiyah Sekampung</strong> (Gedung Tata Usaha / Panitia PPDB)
                                <br />
                                Waktu: Setiap hari kerja (Senin - Sabtu), Pukul 08.00 - 14.00 WIB.
                                <br />
                                Pembayaran seragam dan administrasi dilakukan di loket resmi sekolah secara langsung.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowPassedModal(false)}
                                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                            >
                                Saya Mengerti & Siapkan Berkas
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP MODAL 2: TIDAK LULUS (PESAN MOTIVASI & SEMANGAT) */}
            {showFailedModal && (
                <div
                    onClick={() => setShowFailedModal(false)}
                    className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center"
                    >
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-inner">
                            <HeartHandshake className="w-8 h-8 text-amber-600" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg sm:text-xl font-black text-slate-800">
                                Tetap Semangat & Jangan Berkecil Hati!
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Kepada Ananda <strong className="text-slate-800">{student?.namaLengkap || 'Calon Siswa'}</strong>,
                                <br />
                                Satu pintu yang belum terbuka bukanlah akhir dari perjalananmu. Kegagalan hari ini adalah langkah awal menuju keberhasilan yang lebih besar di masa depan.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-left space-y-2">
                            <span className="font-bold text-slate-800">Pilihan Lanjutan Untuk Anda:</span>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Konsultasi program keahlian lain yang masih tersedia di SMK Muhammadiyah Sekampung.</li>
                                <li>Pendaftaran gelombang susulan apabila terdapat kuota cadangan yang belum terisi.</li>
                                <li>Hubungi panitia PPDB melalui nomor WhatsApp: <strong>0812-3456-7890</strong>.</li>
                            </ul>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setShowFailedModal(false)}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                            >
                                Terima Kasih, Saya Tetap Semangat!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
