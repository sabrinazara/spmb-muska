'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Sun,
    Moon,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Loader2,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    IdCard,
    BookOpen,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';
import ChatbotRAG from '@/components/ChatbotRAG';
import AuthLottiePanel from '@/components/AuthLottiePanel';
import JurusanMarquee from '@/components/JurusanMarquee';
import RegistrationClosedModal from '@/components/RegistrationClosedModal';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        namaLengkap: '',
        email: '',
        password: '',
        nik: '',
        nisn: '',
        jurusanPilihan: 'Teknik Jaringan Komputer dan Telekomunikasi',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [tahunAjaran, setTahunAjaran] = useState('2026/2027');

    useEffect(() => {
        const savedTheme = localStorage.getItem('user_theme');
        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }

        // Cek status buka/tutup pendaftaran SPMB dari server
        fetch(API_ENDPOINTS.PENDAFTARAN.PENGUMUMAN)
            .then((res) => res.json())
            .then((status) => {
                if (status?.bukaPendaftaran === false) {
                    setIsClosed(true);
                }
                if (status?.tahunAjaran) {
                    setTahunAjaran(status.tahunAjaran);
                }
            })
            .catch((err) => console.error('Gagal memuat status pendaftaran:', err));
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            localStorage.setItem('user_theme', 'dark');
            document.documentElement.classList.add('dark');
        } else {
            localStorage.setItem('user_theme', 'light');
            document.documentElement.classList.remove('dark');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isClosed) {
            return;
        }
        setLoading(true);
        setMessage(null);

        // Validasi Sederhana NIK & NISN
        if (formData.nik.length !== 16) {
            setMessage({ type: 'error', text: 'NIK harus terdiri dari 16 digit angka sesuai KTP/KK.' });
            setLoading(false);
            return;
        }

        if (formData.nisn.length !== 10) {
            setMessage({ type: 'error', text: 'NISN harus terdiri dari 10 digit angka resmi Kemdikbud.' });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Pendaftaran akun berhasil! Mengalihkan ke halaman login...',
                });
                setTimeout(() => {
                    router.push('/login');
                }, 1800);
            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Gagal mendaftarkan akun. Silakan periksa kembali data Anda.',
                });
            }
        } catch {
            setMessage({
                type: 'error',
                text: 'Terjadi kesalahan sistem atau backend server sedang offline.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between py-5 px-3 sm:px-6 lg:px-8 font-sans overflow-x-hidden transition-colors duration-200">
            {/* Top Bar Navigation */}
            <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 shadow-xs transition group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Kembali ke Beranda</span>
                </Link>

                {/* Tombol Darkmode & Lightmode */}
                <button
                    onClick={toggleTheme}
                    type="button"
                    aria-label={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-300 shadow-xs hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-center"
                >
                    {isDark ? (
                        <Sun className="w-4 h-4 text-amber-300" />
                    ) : (
                        <Moon className="w-4 h-4 text-slate-700" />
                    )}
                </button>
            </div>

            {/* Main Card: Layout Sesuai Referensi Desain (Kiri: Panel Lottie Hijau Solid, Kanan: Form Putih Solid) */}
            <div className="max-w-5xl w-full mx-auto my-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors duration-200">
                    {/* ========================================================
                        KIRI: PANEL BRANDING & ANIMASI LOTTIE (Hanya Desktop)
                    ======================================================== */}
                    <div className="hidden lg:flex lg:col-span-5 flex-col">
                        <AuthLottiePanel type="register" className="w-full h-full" />
                    </div>

                    {/* ========================================================
                        KANAN: FORM REGISTER CLEAN & MINIMALIST (7 Cols)
                    ======================================================== */}
                    <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
                        <div>
                            {/* Mobile School Brand (Hanya tampil di Mobile karena panel kiri disembunyikan) */}
                            <div className="flex items-center gap-3 mb-4 lg:hidden pb-3.5 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-xs">
                                    <img
                                        src="/logo.png"
                                        alt="Logo SMK Muhammadiyah Sekampung"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = '/logo.svg';
                                        }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase leading-tight truncate">
                                        SMK MUHAMMADIYAH SEKAMPUNG
                                    </h2>
                                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        Portal SPMB Online • Pusat Keunggulan
                                    </p>
                                </div>
                            </div>

                            {/* Header Form */}
                            <div className="mb-4">
                                <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Pendaftaran Akun Baru
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Daftarkan diri Anda sebagai calon peserta didik baru SMK Muhammadiyah Sekampung
                                </p>
                            </div>

                            {/* Alert Notice */}
                            {message && (
                                <div
                                    className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium mb-5 transition-all ${
                                        message.type === 'success'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                                    }`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        {message.type === 'success' ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                        )}
                                        <span>{message.text}</span>
                                    </div>
                                </div>
                            )}

                            {/* Form Input Register */}
                            <form onSubmit={handleRegister} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                        Nama Lengkap Sesuai Ijazah
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="namaLengkap"
                                            required
                                            value={formData.namaLengkap}
                                            onChange={handleChange}
                                            placeholder="Contoh: Muhammad Faiz Nizar"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                            Alamat Email
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="email@contoh.com"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                            Kata Sandi
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                required
                                                minLength={6}
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Minimal 6 karakter"
                                                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                            NIK (16 Digit KTP/KK)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <IdCard className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                name="nik"
                                                required
                                                maxLength={16}
                                                value={formData.nik}
                                                onChange={handleChange}
                                                placeholder="16 digit NIK"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                            NISN (10 Digit Resmi)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <IdCard className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                name="nisn"
                                                required
                                                maxLength={10}
                                                value={formData.nisn}
                                                onChange={handleChange}
                                                placeholder="10 digit NISN"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                        Pilihan Program Keahlian (8 Jurusan)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <select
                                            name="jurusanPilihan"
                                            value={formData.jurusanPilihan}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm font-medium cursor-pointer"
                                        >
                                            <option value="Teknik Jaringan Komputer dan Telekomunikasi">Teknik Jaringan Komputer dan Telekomunikasi (TJKT)</option>
                                            <option value="Teknik Otomotif (Teknik Sepeda Motor)">Teknik Otomotif / Teknik Sepeda Motor (TO)</option>
                                            <option value="Desain Komunikasi Visual">Desain Komunikasi Visual (DKV)</option>
                                            <option value="Bisnis Digital dan Kreatif">Bisnis Digital dan Kreatif (BDK)</option>
                                            <option value="Kulineri (Tata Boga)">Kulineri / Tata Boga</option>
                                            <option value="Kecantikan dan Tata Rias">Kecantikan dan Tata Rias</option>
                                            <option value="Teknik Pemesinan (CNC)">Teknik Pemesinan / CNC</option>
                                            <option value="Teknik Pengelasan (Welding)">Teknik Pengelasan / Welding</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-3 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Mendaftarkan Akun Anda...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Daftar Akun SPMB</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Mobile Switch Link (Terlihat saat di layar HP jika panel kiri di-scroll) */}
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 lg:hidden">
                            Sudah memiliki akun pendaftaran?{' '}
                            <Link
                                href="/login"
                                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4"
                            >
                                Masuk di Sini
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Marquee Logo Jurusan (Bergerak Halus & Pause on Hover) */}
            <div className="max-w-5xl w-full mx-auto mt-4">
                <JurusanMarquee />
            </div>

            {/* Floating RAG Chatbot */}
            <ChatbotRAG />

            {/* Modal Notifikasi Jika Pendaftaran Ditutup Admin */}
            <RegistrationClosedModal
                isOpen={isClosed}
                onClose={() => router.push('/')}
                tahunAjaran={tahunAjaran}
                forceRedirectHome={true}
                customTitle="Pendaftaran Siswa Baru Ditutup"
                customDescription="Mohon maaf, saat ini akses pendaftaran akun baru SPMB SMK Muhammadiyah Sekampung sedang tidak dibuka atau telah berakhir oleh pihak panitia. Silakan kembali ke halaman beranda."
            />
        </div>
    );
}